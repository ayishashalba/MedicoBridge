import React, { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaTimes,
  FaCheckCircle,
  FaUser,
  FaCheck,
  FaBan,
  FaDownload,
  FaMapMarkerAlt,
  FaUserCheck,
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import {
  sortDonorsByProximity,
  getProximityLabel,
} from "../../utils/locationProximity";
import { toast } from "react-toastify";
import "./ManagePatients.css";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const wardsList = [
  "All Wards",
  "ICU",
  "General Ward A",
  "General Ward B",
  "Special Cabin",
  "Maternity Ward",
  "Outpatient",
];

function ManagePatients() {
  const hospitalCity =
    localStorage.getItem("hospitalCity") || "Kozhikode";

  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");

  const [locationInput, setLocationInput] = useState(hospitalCity);
  const [activeLocation, setActiveLocation] = useState(hospitalCity);

  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("General Ward A - Bed 01");
  const [status, setStatus] = useState("Admitted");

  const token = localStorage.getItem("token");

  const isDonorSearchMode =
    bloodGroupFilter !== "All" &&
    bloodGroupFilter !== "All Blood Groups" &&
    bloodGroupFilter !== "";

  // ---------------------------------------------------------
  // FETCH REAL HOSPITAL PATIENTS
  // ---------------------------------------------------------
  const fetchPatients = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/hospital/patients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch hospital patients."
        );
      }

      const data = result?.data || [];

      const normalizedPatients = data.map((patient) => ({
        id:
          patient._id ||
          patient.id ||
          `PAT-${String(patient._id || "").slice(-6)}`,

        userId: patient.userId || "",

        name: patient.name || "Unknown Patient",

        age:
          patient.age ??
          (patient.dob
            ? Math.floor(
              (Date.now() - new Date(patient.dob).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
            )
            : "—"),

        gender: patient.gender || "—",

        bloodGroup:
          patient.bloodGroup &&
            String(patient.bloodGroup).trim() !== ""
            ? patient.bloodGroup
            : "Not Provided",

        city:
          patient.city ||
          patient.address?.city ||
          "Not Provided",

        isDonorAvailable:
          patient.isDonorAvailable === true,

        phone:
          patient.phone ||
          "—",

        ward:
          patient.ward ||
          patient.currentWard ||
          patient.admissionWard ||
          "—",

        status:
          patient.status ||
          patient.admissionStatus ||
          "—",

        admissionDate:
          patient.admissionDate ||
          patient.createdAt ||
          null,
      }));

      setPatients(normalizedPatients);
    } catch (error) {
      console.error("Failed to load hospital patients:", error);
      toast.error(error.message || "Failed to load patients.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients();
    } else {
      setLoading(false);
      toast.error("Authentication token not found.");
    }
  }, []);

  // ---------------------------------------------------------
  // FILTER PATIENTS
  // ---------------------------------------------------------
  const filteredPatients = useMemo(() => {
    let result = patients.filter((pat) => {
      const searchValue = search.trim().toLowerCase();

      const matchSearch =
        !searchValue ||
        String(pat.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(pat.id || "")
          .toLowerCase()
          .includes(searchValue);

      const matchStatus =
        statusFilter === "All" ||
        pat.status === statusFilter;

      const matchWard =
        wardFilter === "All Wards" ||
        (wardFilter === "Outpatient" &&
          pat.status === "Outpatient") ||
        String(pat.ward || "")
          .toLowerCase()
          .includes(wardFilter.toLowerCase());

      const bg = pat.bloodGroup || "Not Provided";

      const matchBloodGroup =
        bloodGroupFilter === "All" ||
        bloodGroupFilter === "All Blood Groups" ||
        bg === bloodGroupFilter;

      /*
       * Specific blood-group search:
       * Only AVAILABLE donors are shown.
       */
      const matchAvailability =
        !isDonorSearchMode ||
        pat.isDonorAvailable === true;

      /*
       * Location filter:
       * Apply only when donor search mode is active
       * and a location has been entered.
       */
      const searchedLocation = activeLocation
        .trim()
        .toLowerCase();

      const patientCity = String(pat.city || "")
        .trim()
        .toLowerCase();

      const matchLocation =
        !isDonorSearchMode ||
        !searchedLocation ||
        patientCity.includes(searchedLocation) ||
        searchedLocation.includes(patientCity);

      return (
        matchSearch &&
        matchStatus &&
        matchWard &&
        matchBloodGroup &&
        matchAvailability &&
        matchLocation
      );
    });

    /*
     * Nearest donor first.
     */
    if (isDonorSearchMode && activeLocation.trim()) {
      try {
        result = sortDonorsByProximity(
          result,
          activeLocation
        );
      } catch (error) {
        console.warn(
          "Could not sort donors by proximity:",
          error
        );
      }
    }

    return result;
  }, [
    patients,
    search,
    statusFilter,
    wardFilter,
    bloodGroupFilter,
    isDonorSearchMode,
    activeLocation,
  ]);

  // ---------------------------------------------------------
  // FORMAT DATE
  // ---------------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ---------------------------------------------------------
  // DOWNLOAD FILTERED REPORT
  // ---------------------------------------------------------
  const handleDownloadReport = () => {
    if (filteredPatients.length === 0) {
      toast.info("No patients available for download.");
      return;
    }

    generateBloodGroupReport({
      title: isDonorSearchMode
        ? `Available ${bloodGroupFilter} Donors near ${activeLocation} — Hospital`
        : "Hospital Patients Blood Group Report",

      selectedBloodGroup:
        bloodGroupFilter === "All"
          ? "All Blood Groups"
          : bloodGroupFilter,

      generatedBy: "Hospital Admin",

      columns: [
        {
          header: "Patient ID",
          dataKey: "id",
        },
        {
          header: "Name",
          dataKey: "name",
        },
        {
          header: "Age",
          dataKey: "age",
        },
        {
          header: "Gender",
          dataKey: "gender",
        },
        {
          header: "Blood Group",
          dataKey: "bloodGroup",
        },
        {
          header: "City",
          dataKey: "city",
        },
        {
          header: "Phone",
          dataKey: "phone",
        },
        {
          header: "Ward / Location",
          dataKey: "ward",
        },
        {
          header: "Status",
          dataKey: "status",
        },
      ],

      data: filteredPatients,

      activeFilters: {
        Status: statusFilter,
        Ward: wardFilter,
        Search: search,

        ...(isDonorSearchMode && {
          "Search Location": activeLocation,
        }),

        ...(isDonorSearchMode && {
          Availability: "Available Donors Only (Auto)",
        }),
      },
    });
  };

  // ---------------------------------------------------------
  // CHECK-IN PATIENT
  // ---------------------------------------------------------
  const handleRegisterPatient = async (e) => {
    e.preventDefault();

    if (!name.trim() || !age || !phone.trim()) {
      toast.warning("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/hospital/patients/check-in",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            age: Number(age),
            gender,
            bloodGroup: bloodGroup || null,
            phone: phone.trim(),
            ward: status === "Admitted" ? ward.trim() : "",
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to check-in patient."
        );
      }

      toast.success(
        result?.message || "Patient checked in successfully."
      );

      setShowAddModal(false);

      setName("");
      setAge("");
      setGender("Male");
      setBloodGroup("");
      setPhone("");
      setWard("General Ward A - Bed 01");
      setStatus("Admitted");

      // Reload actual hospital patient list
      await fetchPatients();
    } catch (error) {
      console.error("Patient check-in failed:", error);

      toast.error(
        error.message || "Failed to check-in patient."
      );
    }
  };
  // ---------------------------------------------------------
  // DISCHARGE PATIENT
  // ---------------------------------------------------------
  const handleDischarge = async (id) => {
    /*
     * Current supplied hospital backend does not expose
     * a patient discharge endpoint.
     *
     * Do not modify local state and pretend it was saved.
     */
    toast.info(
      "Patient discharge API is not available in the current hospital backend."
    );
  };

  // ---------------------------------------------------------
  // BLOOD GROUP CHANGE
  // ---------------------------------------------------------
  const handleBloodGroupChange = (value) => {
    setBloodGroupFilter(value);

    /*
     * When donor search starts, default to hospital city.
     */
    if (value !== "All") {
      setLocationInput(hospitalCity);
      setActiveLocation(hospitalCity);
    }
  };

  // ---------------------------------------------------------
  // LOCATION SEARCH
  // ---------------------------------------------------------
  const handleLocationSearch = () => {
    const location = locationInput.trim();

    setActiveLocation(location || hospitalCity);
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="hosp-pats-page">
      {/* Controls Bar */}
      <div className="hosp-pats-controls">
        <div className="hosp-pats-search">
          <FaSearch className="hosp-search-icon" />

          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="hosp-pats-filters">
          {/* Status */}
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Admitted">
                Admitted
              </option>

              <option value="Discharged">
                Discharged
              </option>

              <option value="Outpatient">
                Outpatient
              </option>
            </select>
          </div>

          {/* Blood Group */}
          <div className="hosp-filter-group">
            <select
              value={bloodGroupFilter}
              onChange={(e) =>
                handleBloodGroupChange(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Blood Groups
              </option>

              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          {isDonorSearchMode && (
            <div className="hosp-location-group">
              <div className="hosp-location-input">
                <FaMapMarkerAlt className="hosp-loc-pin" />

                <input
                  type="text"
                  placeholder="Enter location..."
                  value={locationInput}
                  onChange={(e) =>
                    setLocationInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLocationSearch();
                    }
                  }}
                  aria-label="Search location"
                />
              </div>

              <button
                className="hosp-location-search-btn"
                onClick={handleLocationSearch}
              >
                <FaSearch /> Search
              </button>
            </div>
          )}

          {/* Ward */}
          <div className="hosp-filter-group">
            <select
              value={wardFilter}
              onChange={(e) =>
                setWardFilter(e.target.value)
              }
            >
              {wardsList.map((wardItem) => (
                <option
                  key={wardItem}
                  value={wardItem}
                >
                  {wardItem}
                </option>
              ))}
            </select>
          </div>

          {/* Download */}
          <button
            className="hosp-btn-download"
            onClick={handleDownloadReport}
          >
            <FaDownload /> Download Report
          </button>

          {/* Check-in */}
          <button
            className="hosp-btn-add"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            <FaUserPlus /> Check-In Patient
          </button>
        </div>
      </div>

      {/* Donor mode notice */}
      {isDonorSearchMode && (
        <div className="hosp-donor-notice">
          <FaUserCheck className="hosp-donor-notice-icon" />

          <span>
            Showing{" "}
            <strong>
              available {bloodGroupFilter} donors only
            </strong>
            , ranked nearest to{" "}
            <strong>{activeLocation}</strong>.
            Unavailable patients are automatically
            excluded.
          </span>
        </div>
      )}

      {/* Patients Table */}
      <div className="hosp-card hosp-pats-card">
        <div className="hosp-table-wrapper">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Contact</th>
                <th>Admission Date</th>
                <th>Ward / Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="hosp-table-empty"
                  >
                    <h3>
                      Loading patients...
                    </h3>

                    <p>
                      Fetching registered hospital
                      patients.
                    </p>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="hosp-table-empty"
                  >
                    <FaUser className="empty-icon" />

                    <h3>
                      No patients found.
                    </h3>

                    <p>
                      Try adjusting your blood
                      group, location, ward, status,
                      or search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div className="hosp-pat-profile">
                        <span className="hosp-pat-id">
                          {pat.id}
                        </span>

                        <div className="hosp-pat-info">
                          <span className="hosp-pat-name">
                            {pat.name}
                          </span>

                          <span className="hosp-pat-sub">
                            {pat.age} years ·{" "}
                            {pat.gender}

                            {pat.bloodGroup && (
                              <span>
                                {" · "}

                                <span
                                  style={{
                                    color: "#ef4444",
                                    fontWeight: "600",
                                  }}
                                >
                                  {pat.bloodGroup}
                                </span>
                              </span>
                            )}
                          </span>

                          {isDonorSearchMode &&
                            pat.city && (
                              <span className="hosp-pat-sub">
                                <FaMapMarkerAlt />{" "}
                                {pat.city}

                                {typeof getProximityLabel ===
                                  "function" && (
                                    <>
                                      {" · "}
                                      {getProximityLabel(
                                        pat,
                                        activeLocation
                                      )}
                                    </>
                                  )}
                              </span>
                            )}
                        </div>
                      </div>
                    </td>

                    <td>{pat.phone}</td>

                    <td>
                      {formatDate(
                        pat.admissionDate
                      )}
                    </td>

                    <td>
                      {pat.ward}
                      {pat.city &&
                        pat.city !== "Not Provided" && (
                          <div>
                            <small>
                              {pat.city}
                            </small>
                          </div>
                        )}
                    </td>

                    <td>
                      <span
                        className={`hosp-status-badge hosp-status-badge--${String(
                          pat.status || "unknown"
                        ).toLowerCase()}`}
                      >
                        {pat.status}
                      </span>
                    </td>

                    <td>
                      {pat.status === "Admitted" ? (
                        <button
                          className="hosp-btn-discharge"
                          onClick={() =>
                            handleDischarge(
                              pat.id
                            )
                          }
                          title="Discharge Patient"
                        >
                          <FaCheck /> Discharge
                        </button>
                      ) : (
                        <span className="hosp-action-disabled">
                          <FaBan /> N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {showAddModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>
                Register / Check-in Patient
              </h2>

              <button
                className="hosp-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleRegisterPatient}
              className="hosp-modal-form"
            >
              <div className="form-group">
                <label>
                  Patient Full Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Age</label>

                  <input
                    type="number"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) =>
                      setAge(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>Gender</label>

                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value)
                    }
                  >
                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Mobile Number</label>

                  <input
                    type="tel"
                    placeholder="+91 90000 00000"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>
                    Blood Group{" "}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                      }}
                    >
                      (Optional)
                    </span>
                  </label>

                  <select
                    value={bloodGroup}
                    onChange={(e) =>
                      setBloodGroup(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Not provided
                    </option>

                    {BLOOD_GROUPS.map((bg) => (
                      <option
                        key={bg}
                        value={bg}
                      >
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Registration Mode
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="Admitted">
                    In-Patient Admission
                  </option>

                  <option value="Outpatient">
                    Outpatient Consultation
                  </option>
                </select>
              </div>

              {status === "Admitted" && (
                <div className="form-group">
                  <label>
                    Assign Bed / Location
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. ICU - Bed B2"
                    value={ward}
                    onChange={(e) =>
                      setWard(e.target.value)
                    }
                    required={
                      status === "Admitted"
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                className="hosp-btn-submit"
              >
                <FaCheckCircle /> Register Check-In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePatients;