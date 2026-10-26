import React, { useEffect, useMemo, useState } from "react";

const HOSP_ALL_DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];

const HOSP_TIME_PRESETS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM",
];
import {
  FaSearch,
  FaFilter,
  FaUserMd,
  FaPlus,
  FaPhoneAlt,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaHospital,
  FaLock,
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaDownload,
  FaMapMarkerAlt,
  FaUserCheck,
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import { sortDonorsByProximity } from "../../utils/locationProximity";
import { toast } from "react-toastify";
import "./ManageDoctors.css";

const specialties = [
  "All",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "General Medicine",
];

const doctorDepartmentOptions = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
  "Other",
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const normalizeDoctor = (doctor) => ({
  ...doctor,

  id: doctor._id || doctor.id || "—",
  userId: doctor.userId || "—",
  hospitalId: doctor.hospitalId || "—",

  name: doctor.name || "Unnamed Doctor",
  email: doctor.email || "—",
  phone: doctor.phone || "—",

  specialization: doctor.specialization || "—",
  department: doctor.department || "—",
  qualification: doctor.qualification || "—",
  experience:
    doctor.experience !== undefined &&
      doctor.experience !== null &&
      doctor.experience !== ""
      ? `${doctor.experience}`.includes("Year")
        ? `${doctor.experience}`
        : `${doctor.experience} Years`
      : "—",

  bloodGroup: doctor.bloodGroup || "Not Provided",
  city: doctor.city || "—",
  isDonorAvailable: doctor.isDonorAvailable === true,

  doctorType: "Hospital",

  consultationFee:
    doctor.consultationFee !== undefined &&
      doctor.consultationFee !== null &&
      doctor.consultationFee !== ""
      ? `₹${Number(doctor.consultationFee).toLocaleString("en-IN")}`
      : "—",

  accountStatus:
    doctor.accountStatus === "active"
      ? "Active"
      : doctor.accountStatus === "blocked"
        ? "Blocked"
        : doctor.accountStatus || "—",

  status: doctor.status || "—",

  registrationDate: doctor.createdAt
    ? new Date(doctor.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : "—",

  /*
   * Backend Doctor controller does not currently persist
   * availability schedule or medical license number.
   * Therefore we do not invent values.
   */
  availability: doctor.availability || "—",
  licenseNumber: doctor.licenseNumber || "—",

  /*
   * UI-only avatar background.
   * This is not business data and does not replace backend data.
   */
  avatarBg: doctor.avatarBg || "#0d9488",
});

function ManageDoctors() {
  const hospitalCity =
    localStorage.getItem("hospitalCity") || "Kozhikode";

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");

  const [locationInput, setLocationInput] = useState(hospitalCity);
  const [activeLocation, setActiveLocation] = useState(hospitalCity);

  const isDonorSearchMode =
    bloodGroupFilter !== "All" &&
    bloodGroupFilter !== "All Blood Groups" &&
    bloodGroupFilter !== "";

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);

  // ----------------------------------------------------
  // ADD DOCTOR FORM
  // ----------------------------------------------------

  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSpecialization, setAddSpecialization] = useState("");
  const [addDepartment, setAddDepartment] = useState("Cardiology");
  const [addCustomDept, setAddCustomDept] = useState("");
  const [addQualification, setAddQualification] = useState("");
  const [addExperience, setAddExperience] = useState("");
  const [addBloodGroup, setAddBloodGroup] = useState("");
  const [addConsultationFee, setAddConsultationFee] = useState("");
  const [addErrors, setAddErrors] = useState({});

  const resetAddForm = () => {
    setAddName("");
    setAddEmail("");
    setAddPhone("");
    setAddSpecialization("");
    setAddDepartment("Cardiology");
    setAddCustomDept("");
    setAddQualification("");
    setAddExperience("");
    setAddBloodGroup("");
    setAddConsultationFee("");
    setAddErrors({});
  };

  // ----------------------------------------------------
  // EDIT DOCTOR FORM
  // ----------------------------------------------------

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editConsultationFee, setEditConsultationFee] = useState("");
  const [editAccountStatus, setEditAccountStatus] = useState("active");

  // ── Edit availability schedule state ───────────────────────
  const [editSlotsByDay, setEditSlotsByDay] = useState({});
  const [editActiveDays, setEditActiveDays] = useState([]);
  const [editFocusedDay, setEditFocusedDay] = useState("");
  const [editCustomSlotInput, setEditCustomSlotInput] = useState("");

  const showToast = (msg) => {
    toast.success(msg);
  };

  // ----------------------------------------------------
  // FETCH REAL HOSPITAL DOCTORS
  // ----------------------------------------------------

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        "http://localhost:5000/api/hospital/doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch hospital doctors."
        );
      }

      const doctorData = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setDoctors(doctorData.map(normalizeDoctor));
    } catch (error) {
      console.error("Failed to load hospital doctors:", error);
      toast.error(error.message || "Failed to load doctors.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ----------------------------------------------------
  // FILTERING
  // ----------------------------------------------------

  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((doc) => {
      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        String(doc.name || "").toLowerCase().includes(q) ||
        String(doc.specialization || "").toLowerCase().includes(q) ||
        String(doc.id || "").toLowerCase().includes(q) ||
        String(doc.department || "").toLowerCase().includes(q) ||
        String(doc.qualification || "").toLowerCase().includes(q) ||
        String(doc.email || "").toLowerCase().includes(q) ||
        String(doc.phone || "").toLowerCase().includes(q);

      const matchDept =
        selectedDept === "All" ||
        doc.specialization === selectedDept;

      /*
       * Backend status is:
       * verified / pending / rejected
       *
       * accountStatus is:
       * active / blocked
       *
       * We therefore filter according to the actual backend values.
       */
      const matchStatus =
        selectedStatus === "All" ||
        doc.status === selectedStatus ||
        doc.accountStatus === selectedStatus;

      const bg = doc.bloodGroup || "Not Provided";

      const matchBloodGroup =
        bloodGroupFilter === "All" ||
        bloodGroupFilter === "All Blood Groups" ||
        bg === bloodGroupFilter;

      /*
       * Blood donor search:
       * only doctors whose actual backend donor flag is true.
       */
      const matchAvailability =
        !isDonorSearchMode ||
        doc.isDonorAvailable === true;

      return (
        matchSearch &&
        matchDept &&
        matchStatus &&
        matchBloodGroup &&
        matchAvailability
      );
    });

    if (isDonorSearchMode) {
      result = sortDonorsByProximity(
        result,
        activeLocation
      );
    }

    return result;
  }, [
    doctors,
    search,
    selectedDept,
    selectedStatus,
    bloodGroupFilter,
    isDonorSearchMode,
    activeLocation,
  ]);

  // ----------------------------------------------------
  // DOWNLOAD CURRENTLY FILTERED RESULTS
  // ----------------------------------------------------

  const handleDownloadReport = () => {
    generateBloodGroupReport({
      title: "Hospital Medical Staff Blood Group Report",

      selectedBloodGroup:
        bloodGroupFilter === "All"
          ? "All Blood Groups"
          : bloodGroupFilter,

      generatedBy: "Hospital Admin",

      columns: [
        {
          header: "Doctor ID",
          dataKey: "id",
        },
        {
          header: "Name",
          dataKey: "name",
        },
        {
          header: "Specialization",
          dataKey: "specialization",
        },
        {
          header: "Department",
          dataKey: "department",
        },
        {
          header: "Blood Group",
          dataKey: "bloodGroup",
        },
        {
          header: "Phone",
          dataKey: "phone",
        },
        {
          header: "Email",
          dataKey: "email",
        },
        {
          header: "Status",
          dataKey: "status",
        },
      ],

      data: filteredDoctors,

      activeFilters: {
        Department: selectedDept,
        Status: selectedStatus,
        BloodGroup:
          bloodGroupFilter === "All"
            ? "All Blood Groups"
            : bloodGroupFilter,
        Location: activeLocation,
        Search: search,
      },
    });
  };

  // ----------------------------------------------------
  // ADD DOCTOR VALIDATION
  // ----------------------------------------------------

  const validateAddDoctor = () => {
    const errs = {};

    const trimmedName = addName.trim();

    if (!trimmedName) {
      errs.name = "Full Name is required";
    } else if (trimmedName.length < 3) {
      errs.name = "Full Name must be at least 3 characters";
    }

    const trimmedEmail = addEmail.trim();

    if (!trimmedEmail) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = "Enter a valid email address";
    }

    const trimmedPhone = addPhone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");

    if (!trimmedPhone) {
      errs.phone = "Phone Number is required";
    } else if (phoneDigits.length < 10) {
      errs.phone =
        "Enter a valid phone number (min 10 digits)";
    }

    if (!addSpecialization.trim()) {
      errs.specialization = "Specialization is required";
    }

    if (!addDepartment) {
      errs.department = "Department is required";
    }

    if (
      addDepartment === "Other" &&
      !addCustomDept.trim()
    ) {
      errs.customDept =
        "Please enter the department name";
    }

    if (!addQualification.trim()) {
      errs.qualification =
        "Qualifications are required";
    }

    const expNum = Number(addExperience);

    if (
      addExperience === "" ||
      addExperience === null ||
      Number.isNaN(expNum)
    ) {
      errs.experience =
        "Experience (Years) is required";
    } else if (expNum < 0 || expNum > 70) {
      errs.experience =
        "Enter valid experience (0 to 70 years)";
    }

    const feeNum = Number(addConsultationFee);

    if (
      addConsultationFee === "" ||
      addConsultationFee === null ||
      Number.isNaN(feeNum)
    ) {
      errs.consultationFee =
        "Consultation Fee is required";
    } else if (feeNum < 0) {
      errs.consultationFee =
        "Consultation Fee cannot be negative";
    }

    return errs;
  };

  // ----------------------------------------------------
  // ADD DOCTOR -> REAL BACKEND
  // ----------------------------------------------------

  const handleAddDoctor = async (e) => {
    e.preventDefault();

    const errs = validateAddDoctor();

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      toast.error(
        "Please fill in all required fields accurately."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const finalDept =
        addDepartment === "Other" &&
          addCustomDept.trim()
          ? addCustomDept.trim()
          : addDepartment;

      const payload = {
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        phone: addPhone.trim(),
        specialization:
          addSpecialization.trim(),
        department: finalDept,
        qualification:
          addQualification.trim(),
        experience: Number(addExperience),
        consultationFee:
          Number(addConsultationFee),

        /*
         * Backend accepts bloodGroup.
         * Empty value becomes null on backend.
         */
        bloodGroup:
          addBloodGroup || null,
      };

      const response = await fetch(
        "http://localhost:5000/api/hospital/doctors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const backendMessage =
          result?.message ||
          result?.errors?.join?.(", ") ||
          "Failed to add doctor.";

        throw new Error(backendMessage);
      }

      const createdDoctor = result?.data;

      if (createdDoctor) {
        const normalized =
          normalizeDoctor(createdDoctor);

        setDoctors((prev) => [
          normalized,
          ...prev,
        ]);
      } else {
        await fetchDoctors();
      }

      setShowAddModal(false);
      resetAddForm();

      showToast(
        "Doctor registered successfully."
      );
    } catch (error) {
      console.error(
        "Failed to add hospital doctor:",
        error
      );

      toast.error(
        error.message ||
        "Failed to register doctor."
      );
    }
  };

  // ----------------------------------------------------
  // OPEN EDIT
  // ----------------------------------------------------

  const handleOpenEdit = (doc) => {
    setEditDoctor(doc);

    setEditName(doc.name || "");
    setEditPhone(doc.phone || "");
    setEditSpecialization(
      doc.specialization || ""
    );
    setEditDepartment(
      doc.department || ""
    );
    setEditQualification(
      doc.qualification !== "—"
        ? doc.qualification || ""
        : ""
    );
    setEditExperience(
      doc.experience !== "—"
        ? String(doc.experience || "").replace(
          /\s*Years?\s*/i,
          ""
        )
        : ""
    );

    setEditConsultationFee(
      doc.consultationFee !== "—"
        ? String(doc.consultationFee || "").replace(
          /[₹,\s]/g,
          ""
        )
        : ""
    );

    setEditAccountStatus(
      doc.accountStatus === "Blocked"
        ? "blocked"
        : "active"
    );

    // ── Rebuild availability from raw doc ─────────────────
    const rawSlots = Array.isArray(doc.availableSlots) ? doc.availableSlots : [];
    const rawDays = Array.isArray(doc.availableDays) ? doc.availableDays : [];
    const rebuilt = {};
    rawSlots.forEach((s) => {
      if (!s || !s.day) return;
      if (!rebuilt[s.day]) rebuilt[s.day] = [];
      const slotStr = s.startTime || s.endTime || "";
      if (slotStr && !rebuilt[s.day].includes(slotStr)) rebuilt[s.day].push(slotStr);
    });
    rawDays.forEach((d) => { if (!rebuilt[d]) rebuilt[d] = []; });
    setEditSlotsByDay(rebuilt);
    const days = Object.keys(rebuilt).filter((d) => HOSP_ALL_DAYS.includes(d));
    setEditActiveDays(days);
    setEditFocusedDay(days[0] || "");
    setEditCustomSlotInput("");
  };

  // ----------------------------------------------------
  // SAVE EDIT -> REAL BACKEND
  // ----------------------------------------------------

  const handleSaveEditDoctor = async (e) => {
    e.preventDefault();

    if (!editDoctor) return;

    if (!editName.trim()) {
      toast.error("Doctor name is required.");
      return;
    }

    if (!editSpecialization.trim()) {
      toast.error(
        "Specialization is required."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const payload = {
        name: editName.trim(),
        phone: editPhone.trim(),
        specialization:
          editSpecialization.trim(),
        department:
          editDepartment.trim(),
        qualification:
          editQualification.trim(),
        experience:
          editExperience.trim(),
        consultationFee:
          editConsultationFee === ""
            ? 0
            : Number(editConsultationFee),

        accountStatus:
          editAccountStatus,

        // ── Availability ──────────────────────────
        availableDays: editActiveDays,
        availableSlots: editActiveDays.flatMap((day) =>
          (editSlotsByDay[day] || []).map((slotTime) => ({
            day,
            startTime: slotTime,
            endTime: slotTime,
            isAvailable: true,
          }))
        ),
      };

      const response = await fetch(
        `http://localhost:5000/api/hospital/doctors/${editDoctor.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update doctor."
        );
      }

      const updatedDoctor = result?.data;

      if (updatedDoctor) {
        const normalized =
          normalizeDoctor(updatedDoctor);

        setDoctors((prev) =>
          prev.map((doctor) =>
            doctor.id === editDoctor.id
              ? normalized
              : doctor
          )
        );

        if (
          viewDoctor &&
          viewDoctor.id === editDoctor.id
        ) {
          setViewDoctor(normalized);
        }
      } else {
        await fetchDoctors();
      }

      setEditDoctor(null);

      showToast(
        "Doctor profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update hospital doctor:",
        error
      );

      toast.error(
        error.message ||
        "Failed to update doctor."
      );
    }
  };

  // ----------------------------------------------------
  // STATUS BADGE
  // ----------------------------------------------------

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "hosp-doc-status-badge status--available";

      case "In Surgery":
        return "hosp-doc-status-badge status--in-surgery";

      case "On Leave":
        return "hosp-doc-status-badge status--on-leave";

      case "verified":
        return "hosp-doc-status-badge status--available";

      case "active":
        return "hosp-doc-status-badge status--available";

      case "blocked":
        return "hosp-doc-status-badge status--on-leave";

      case "pending":
        return "hosp-doc-status-badge status--on-leave";

      case "rejected":
        return "hosp-doc-status-badge status--on-leave";

      default:
        return "hosp-doc-status-badge";
    }
  };

  return (
    <div className="hosp-docs-page">
      {/* ==================================================
          SEARCH AND ACTION BAR
      ================================================== */}

      <div className="hosp-docs-controls">
        <div className="hosp-docs-search">
          <FaSearch className="hosp-search-icon" />

          <input
            type="text"
            placeholder="Search doctors by name, ID, qualification, or department..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            aria-label="Search doctors"
          />

          {search && (
            <button
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="hosp-docs-filters">
          {/* Specialty */}

          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />

            <select
              value={selectedDept}
              onChange={(e) =>
                setSelectedDept(e.target.value)
              }
              aria-label="Filter by Specialty"
            >
              {specialties.map((spec) => (
                <option
                  key={spec}
                  value={spec}
                >
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Blood Group */}

          <div className="hosp-filter-group">
            <select
              value={bloodGroupFilter}
              onChange={(e) => {
                setBloodGroupFilter(
                  e.target.value
                );

                setLocationInput(
                  hospitalCity
                );

                setActiveLocation(
                  hospitalCity
                );
              }}
              aria-label="Filter by Blood Group"
            >
              <option value="All">
                All Blood Groups
              </option>

              {bloodGroups.map((bg) => (
                <option
                  key={bg}
                  value={bg}
                >
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Location only in donor search */}

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
                      setActiveLocation(
                        locationInput.trim() ||
                        hospitalCity
                      );
                    }
                  }}
                  aria-label="Search location"
                />
              </div>

              <button
                className="hosp-location-search-btn"
                onClick={() =>
                  setActiveLocation(
                    locationInput.trim() ||
                    hospitalCity
                  )
                }
              >
                <FaSearch /> Search
              </button>
            </div>
          )}

          {/* Backend status */}

          <div className="hosp-filter-group">
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value
                )
              }
              aria-label="Filter by Status"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="active">
                Active
              </option>

              <option value="blocked">
                Blocked
              </option>
            </select>
          </div>

          <button
            className="hosp-btn-download"
            onClick={handleDownloadReport}
            style={{
              background: "#0d9488",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaDownload />
            Download Report
          </button>

          <button
            className="hosp-btn-add"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            <FaPlus />
            Add Doctor
          </button>
        </div>
      </div>

      {/* ==================================================
          DONOR NOTICE
      ================================================== */}

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
            Unavailable staff are automatically
            excluded.
          </span>
        </div>
      )}

      {/* ==================================================
          DOCTORS TABLE
      ================================================== */}

      <div className="hosp-card hosp-doc-table-card">
        <div className="hosp-table-header-bar">
          <div>
            <h3
              className="hosp-card-title"
              style={{
                marginBottom: "0.2rem",
              }}
            >
              Hospital Medical Staff Directory
            </h3>

            <p className="table-subtitle">
              Showing{" "}
              {filteredDoctors.length} of{" "}
              {doctors.length} registered hospital
              doctors
            </p>
          </div>
        </div>

        <div className="hosp-table-wrapper">
          <table className="hosp-table hosp-doc-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Doctor ID</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Department</th>
                <th>Doctor Type</th>
                <th>Status</th>
                <th
                  style={{
                    textAlign: "right",
                    paddingRight: "1.5rem",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="hosp-table-empty"
                  >
                    <FaUserMd className="empty-icon" />

                    <h3>
                      Loading doctors...
                    </h3>

                    <p>
                      Fetching hospital medical
                      staff from the server.
                    </p>
                  </td>
                </tr>
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="doc-table-row"
                  >
                    {/* Doctor Name */}

                    <td>
                      <div className="doc-name-cell">
                        <div
                          className="doc-avatar-mini"
                          style={{
                            backgroundColor:
                              doc.avatarBg,
                          }}
                        >
                          {doc.name
                            ?.split(" ")
                            .slice(-1)[0]?.[0]
                            ?.toUpperCase() || "D"}
                        </div>

                        <div className="doc-name-info">
                          <span className="doc-name-text">
                            {doc.name}
                          </span>

                          <span className="doc-email-text">
                            {doc.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor ID */}

                    <td>
                      <span className="hosp-doc-id-badge">
                        {doc.id}
                      </span>
                    </td>

                    {/* Specialization */}

                    <td>
                      <span className="doc-spec-pill">
                        {doc.specialization}
                      </span>
                    </td>

                    {/* Qualification */}

                    <td>
                      <span className="doc-qual-text">
                        {doc.qualification}
                      </span>
                    </td>

                    {/* Experience */}

                    <td>
                      <span className="doc-exp-badge">
                        {doc.experience}
                      </span>
                    </td>

                    {/* Department */}

                    <td>
                      <span className="doc-dept-text">
                        {doc.department}
                      </span>
                    </td>

                    {/* Doctor Type */}

                    <td>
                      <span className="hosp-doc-type-tag">
                        <FaHospital className="mini-icon" />
                        {doc.doctorType}
                      </span>
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={getStatusBadge(
                          doc.status
                        )}
                      >
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions */}

                    <td>
                      <div className="hosp-doc-actions-cell">
                        <button
                          className="hosp-doc-btn btn-view-doc"
                          onClick={() =>
                            setViewDoctor(doc)
                          }
                          title="View Doctor Details"
                        >
                          <FaEye />
                          <span>View</span>
                        </button>

                        <button
                          className="hosp-doc-btn btn-edit-doc"
                          onClick={() =>
                            handleOpenEdit(doc)
                          }
                          title="Edit Doctor"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="hosp-table-empty"
                  >
                    <FaUserMd className="empty-icon" />

                    <h3>
                      No doctors found.
                    </h3>

                    <p>
                      Try clearing your filters
                      or selecting different
                      search criteria.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
          VIEW DOCTOR MODAL
      ================================================== */}

      {viewDoctor && (
        <div
          className="hosp-modal-overlay"
          onClick={() =>
            setViewDoctor(null)
          }
        >
          <div
            className="hosp-modal hosp-doc-view-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUserMd className="modal-header-icon" />

                <div>
                  <h2>
                    Doctor Details
                  </h2>

                  <span className="modal-ref-id">
                    {viewDoctor.id}
                  </span>
                </div>
              </div>

              <button
                className="hosp-modal-close"
                onClick={() =>
                  setViewDoctor(null)
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="doc-view-modal-body">
              <div className="doc-view-header-card">
                <div
                  className="doc-avatar-large"
                  style={{
                    backgroundColor:
                      viewDoctor.avatarBg,
                  }}
                >
                  {viewDoctor.name
                    ?.split(" ")
                    .slice(-1)[0]?.[0]
                    ?.toUpperCase() || "D"}
                </div>

                <div className="doc-view-header-details">
                  <div className="doc-title-row">
                    <h3 className="doc-fullname">
                      {viewDoctor.name}
                    </h3>

                    <span
                      className={getStatusBadge(
                        viewDoctor.status
                      )}
                    >
                      {viewDoctor.status}
                    </span>
                  </div>

                  <p className="doc-specialty-sub">
                    {viewDoctor.specialization}
                    {" • "}
                    {viewDoctor.qualification}
                  </p>

                  <div className="doc-quick-chips">
                    <span className="doc-chip">
                      <FaBuilding />
                      {viewDoctor.department}
                    </span>

                    <span className="doc-chip">
                      <FaBriefcase />
                      {viewDoctor.experience} Exp
                    </span>

                    <span className="doc-chip doc-chip--hospital">
                      <FaHospital />
                      Hospital
                    </span>
                  </div>
                </div>
              </div>

              <div className="doc-details-section">
                <h4 className="section-title">
                  Doctor Profile Information
                </h4>

                <div className="doc-info-grid">
                  <div className="info-item">
                    <span className="info-lbl">
                      Full Name:
                    </span>

                    <span className="info-val font-bold">
                      {viewDoctor.name}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Doctor ID:
                    </span>

                    <span className="info-val font-bold text-primary-color">
                      {viewDoctor.id}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      User ID:
                    </span>

                    <span className="info-val">
                      {viewDoctor.userId}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Hospital ID:
                    </span>

                    <span className="info-val">
                      {viewDoctor.hospitalId}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Email:
                    </span>

                    <span className="info-val">
                      <FaEnvelope className="mini-icon" />
                      {viewDoctor.email}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Phone Number:
                    </span>

                    <span className="info-val">
                      <FaPhoneAlt className="mini-icon" />
                      {viewDoctor.phone}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Blood Group:
                    </span>

                    <span className="info-val font-bold">
                      {viewDoctor.bloodGroup}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Location:
                    </span>

                    <span className="info-val">
                      <FaMapMarkerAlt className="mini-icon" />
                      {viewDoctor.city}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Specialization:
                    </span>

                    <span className="info-val">
                      {viewDoctor.specialization}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Department:
                    </span>

                    <span className="info-val">
                      {viewDoctor.department}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Qualifications:
                    </span>

                    <span className="info-val">
                      {viewDoctor.qualification}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Experience:
                    </span>

                    <span className="info-val">
                      {viewDoctor.experience}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Medical License Number:
                    </span>

                    <span className="info-val font-bold">
                      {viewDoctor.licenseNumber}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Consultation Fee:
                    </span>

                    <span className="info-val font-bold">
                      {viewDoctor.consultationFee}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Availability Schedule:
                    </span>

                    <span className="info-val">
                      <FaClock className="mini-icon" />
                      {viewDoctor.availability}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Donor Availability:
                    </span>

                    <span className="info-val">
                      {viewDoctor.isDonorAvailable
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Registration Date:
                    </span>

                    <span className="info-val">
                      {viewDoctor.registrationDate}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-lbl">
                      Account Status:
                    </span>

                    <span className="info-val text-success font-bold">
                      {viewDoctor.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hosp-modal-actions">
              <button
                type="button"
                className="hosp-btn-submit"
                onClick={() => {
                  const doc = viewDoctor;

                  setViewDoctor(null);

                  handleOpenEdit(doc);
                }}
              >
                <FaEdit />
                <span>
                  Edit Doctor Profile
                </span>
              </button>

              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() =>
                  setViewDoctor(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT DOCTOR MODAL
      ================================================== */}

      {editDoctor && (
        <div
          className="hosp-modal-overlay"
          onClick={() =>
            setEditDoctor(null)
          }
        >
          <div
            className="hosp-modal hosp-doc-edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaEdit className="modal-header-icon" />

                <div>
                  <h2>
                    Edit Doctor Profile
                  </h2>

                  <span className="modal-ref-id">
                    {editDoctor.id}
                  </span>
                </div>
              </div>

              <button
                className="hosp-modal-close"
                onClick={() =>
                  setEditDoctor(null)
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditDoctor}
              className="hosp-modal-form"
            >
              <div className="edit-readonly-strip">
                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" />
                    Doctor ID:
                  </span>

                  <span className="readonly-val font-bold">
                    {editDoctor.id}
                  </span>
                </div>

                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" />
                    User ID:
                  </span>

                  <span className="readonly-val">
                    {editDoctor.userId}
                  </span>
                </div>

                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" />
                    Hospital ID:
                  </span>

                  <span className="readonly-val">
                    {editDoctor.hospitalId}
                  </span>
                </div>
              </div>

              {/* Name + Phone */}

              <div className="form-row">
                <div className="form-group half">
                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) =>
                      setEditPhone(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              {/* Specialization + Department */}

              <div className="form-row">
                <div className="form-group half">
                  <label>
                    Specialization *
                  </label>

                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) =>
                      setEditSpecialization(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>
                    Department *
                  </label>

                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) =>
                      setEditDepartment(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              {/* Qualification + Experience */}

              <div className="form-row">
                <div className="form-group half">
                  <label>
                    Qualifications *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, DM"
                    value={editQualification}
                    onChange={(e) =>
                      setEditQualification(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>
                    Experience (Years) *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 10 Years"
                    value={editExperience}
                    onChange={(e) =>
                      setEditExperience(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              {/* Consultation Fee + Account Status */}

              <div className="form-row">
                <div className="form-group half">
                  <label>
                    Consultation Fee (₹) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editConsultationFee}
                    onChange={(e) =>
                      setEditConsultationFee(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="form-group half">
                  <label>
                    Account Status
                  </label>

                  <select
                    value={editAccountStatus}
                    onChange={(e) =>
                      setEditAccountStatus(
                        e.target.value
                      )
                    }
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="blocked">
                      Blocked
                    </option>
                  </select>
                </div>
              </div>

              {/* AVAILABILITY SCHEDULE */}
              <div style={{ marginTop: "1.2rem" }}>
                <div style={{ marginBottom: "10px" }}>
                  <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                    🗓️ Availability Schedule
                  </strong>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 10px" }}>
                    Click a day to add/remove it, then manage time slots.
                  </p>
                </div>

                {/* Day chips */}
                <div className="schedule-preset-chips" style={{ marginBottom: "14px" }}>
                  {HOSP_ALL_DAYS.map((day) => {
                    const isActive = editActiveDays.includes(day);
                    const isFocused = editFocusedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        className={`schedule-preset-chip${isFocused ? " chip-active" : ""}`}
                        style={{
                          background: isActive ? (isFocused ? "#0ea5e9" : "#e0f2fe") : "#f8fafc",
                          borderColor: isActive ? (isFocused ? "#0ea5e9" : "#7dd3fc") : "#e2e8f0",
                          color: isActive ? (isFocused ? "#fff" : "#0369a1") : "#475569",
                        }}
                        onClick={() => {
                          if (!isActive) {
                            setEditActiveDays((p) => [...p, day]);
                            setEditSlotsByDay((p) => ({ ...p, [day]: p[day] || [] }));
                            setEditFocusedDay(day);
                          } else if (!isFocused) {
                            setEditFocusedDay(day);
                          } else {
                            setEditActiveDays((p) => p.filter((d) => d !== day));
                            setEditSlotsByDay((p) => { const c = { ...p }; delete c[day]; return c; });
                            setEditFocusedDay("");
                          }
                        }}
                      >
                        {day.slice(0, 3)}
                        {isActive && (
                          <span style={{ fontSize: "0.72rem" }}>({(editSlotsByDay[day] || []).length})</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Slot workspace */}
                {editFocusedDay && editActiveDays.includes(editFocusedDay) ? (
                  <div style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <strong style={{ fontSize: "0.88rem", color: "#1e293b" }}>
                        🕐 {editFocusedDay} — Slots
                      </strong>
                      {(editSlotsByDay[editFocusedDay] || []).length > 0 && (
                        <button
                          type="button"
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                          onClick={() => setEditSlotsByDay((p) => ({ ...p, [editFocusedDay]: [] }))}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Configured pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px", minHeight: "30px" }}>
                      {(editSlotsByDay[editFocusedDay] || []).length === 0 ? (
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No slots yet — add below.</span>
                      ) : (
                        (editSlotsByDay[editFocusedDay] || []).map((slot) => (
                          <span key={slot} style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d",
                            fontSize: "0.8rem", fontWeight: 600, padding: "4px 8px", borderRadius: "20px",
                          }}>
                            ⏰ {slot}
                            <button
                              type="button"
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, fontSize: "0.72rem" }}
                              onClick={() => setEditSlotsByDay((p) => ({ ...p, [editFocusedDay]: p[editFocusedDay].filter((s) => s !== slot) }))}
                            >✕</button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Preset chips */}
                    <p style={{ fontSize: "0.77rem", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>Quick-add:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                      {HOSP_TIME_PRESETS.map((preset) => {
                        const already = (editSlotsByDay[editFocusedDay] || []).includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={already}
                            style={{
                              background: already ? "#f1f5f9" : "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              padding: "3px 8px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: already ? "#94a3b8" : "#475569",
                              cursor: already ? "not-allowed" : "pointer",
                              opacity: already ? 0.5 : 1,
                            }}
                            onClick={() => {
                              if (!already) {
                                setEditSlotsByDay((p) => ({ ...p, [editFocusedDay]: [...(p[editFocusedDay] || []), preset] }));
                              }
                            }}
                          >
                            {already ? "✓ " : "+ "}{preset}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom input */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="e.g. 7:15 AM"
                        value={editCustomSlotInput}
                        onChange={(e) => setEditCustomSlotInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = editCustomSlotInput.trim();
                            if (val && !(editSlotsByDay[editFocusedDay] || []).includes(val)) {
                              setEditSlotsByDay((p) => ({ ...p, [editFocusedDay]: [...(p[editFocusedDay] || []), val] }));
                              setEditCustomSlotInput("");
                            }
                          }
                        }}
                        style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.82rem", flex: 1, maxWidth: "180px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = editCustomSlotInput.trim();
                          if (!val) return;
                          if ((editSlotsByDay[editFocusedDay] || []).includes(val)) {
                            toast.warn("That slot is already added.");
                            return;
                          }
                          setEditSlotsByDay((p) => ({ ...p, [editFocusedDay]: [...(p[editFocusedDay] || []), val] }));
                          setEditCustomSlotInput("");
                        }}
                        style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "7px 12px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ) : editActiveDays.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.83rem", fontStyle: "italic" }}>
                    No days selected. Click a day chip above to add availability.
                  </p>
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "0.83rem", fontStyle: "italic" }}>
                    Click an active day chip to manage its slots.
                  </p>
                )}
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() =>
                    setEditDoctor(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hosp-btn-submit"
                >
                  <FaCheckCircle />
                  <span>
                    Save Changes
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          ADD DOCTOR MODAL
      ================================================== */}

      {showAddModal && (
        <div
          className="hosp-modal-overlay"
          onClick={() => {
            setShowAddModal(false);
            resetAddForm();
          }}
        >
          <div
            className="hosp-modal hosp-doc-add-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUserMd className="modal-header-icon" />

                <div>
                  <h2>
                    Add New Staff Doctor
                  </h2>

                  <span className="modal-ref-id">
                    Hospital Medical Staff Registration
                  </span>
                </div>
              </div>

              <button
                className="hosp-modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleAddDoctor}
              className="hosp-modal-form hosp-doc-form-scrollable"
              noValidate
            >
              {/* System generated IDs */}

              <div className="doc-system-gen-banner">
                <div className="sys-gen-icon-wrap">
                  <FaHospital className="sys-gen-icon" />
                </div>

                <div className="sys-gen-text">
                  <span className="sys-gen-title">
                    System-Generated Identifiers
                  </span>

                  <p className="sys-gen-desc">
                    <strong>
                      Doctor ID
                    </strong>
                    ,{" "}
                    <strong>
                      User ID
                    </strong>{" "}
                    and hospital linkage are
                    assigned automatically by
                    the system.
                  </p>
                </div>
              </div>

              {/* Name + Email */}

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-name">
                    Full Name{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-name"
                    type="text"
                    placeholder="e.g. Dr. John Watson"
                    value={addName}
                    onChange={(e) => {
                      setAddName(
                        e.target.value
                      );

                      if (addErrors.name) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            name: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.name
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.name && (
                    <span className="doc-field-error-msg">
                      {addErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-email">
                    Email{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={addEmail}
                    onChange={(e) => {
                      setAddEmail(
                        e.target.value
                      );

                      if (addErrors.email) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            email: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.email
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.email && (
                    <span className="doc-field-error-msg">
                      {addErrors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Phone + Blood Group */}

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-phone">
                    Phone Number{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-phone"
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={addPhone}
                    onChange={(e) => {
                      setAddPhone(
                        e.target.value
                      );

                      if (addErrors.phone) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            phone: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.phone
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.phone && (
                    <span className="doc-field-error-msg">
                      {addErrors.phone}
                    </span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-blood">
                    Blood Group
                  </label>

                  <select
                    id="add-doc-blood"
                    value={addBloodGroup}
                    onChange={(e) =>
                      setAddBloodGroup(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Not Provided
                    </option>

                    {bloodGroups.map(
                      (bg) => (
                        <option
                          key={bg}
                          value={bg}
                        >
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Specialization + Department */}

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-spec">
                    Specialization{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-spec"
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={addSpecialization}
                    onChange={(e) => {
                      setAddSpecialization(
                        e.target.value
                      );

                      if (
                        addErrors.specialization
                      ) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            specialization:
                              null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.specialization
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.specialization && (
                    <span className="doc-field-error-msg">
                      {
                        addErrors.specialization
                      }
                    </span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-dept">
                    Department{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <select
                    id="add-doc-dept"
                    value={addDepartment}
                    onChange={(e) => {
                      setAddDepartment(
                        e.target.value
                      );

                      if (
                        addErrors.department
                      ) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            department: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.department
                        ? "input-field-error"
                        : ""
                    }
                    required
                  >
                    {doctorDepartmentOptions.map(
                      (dept) => (
                        <option
                          key={dept}
                          value={dept}
                        >
                          {dept}
                        </option>
                      )
                    )}
                  </select>

                  {addErrors.department && (
                    <span className="doc-field-error-msg">
                      {addErrors.department}
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Department */}

              {addDepartment === "Other" && (
                <div className="form-group">
                  <label htmlFor="add-doc-custom-dept">
                    Specify Department Name{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-custom-dept"
                    type="text"
                    placeholder="e.g. Oncology & Radiation Care"
                    value={addCustomDept}
                    onChange={(e) => {
                      setAddCustomDept(
                        e.target.value
                      );

                      if (
                        addErrors.customDept
                      ) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            customDept: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.customDept
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.customDept && (
                    <span className="doc-field-error-msg">
                      {addErrors.customDept}
                    </span>
                  )}
                </div>
              )}

              {/* Qualification + Experience */}

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-qual">
                    Qualifications{" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-qual"
                    type="text"
                    placeholder="e.g. MBBS, MD"
                    value={addQualification}
                    onChange={(e) => {
                      setAddQualification(
                        e.target.value
                      );

                      if (
                        addErrors.qualification
                      ) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            qualification:
                              null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.qualification
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.qualification && (
                    <span className="doc-field-error-msg">
                      {
                        addErrors.qualification
                      }
                    </span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-exp">
                    Experience (Years){" "}
                    <span className="req-star">
                      *
                    </span>
                  </label>

                  <input
                    id="add-doc-exp"
                    type="number"
                    min="0"
                    max="70"
                    step="1"
                    placeholder="e.g. 8"
                    value={addExperience}
                    onChange={(e) => {
                      setAddExperience(
                        e.target.value
                      );

                      if (
                        addErrors.experience
                      ) {
                        setAddErrors(
                          (prev) => ({
                            ...prev,
                            experience: null,
                          })
                        );
                      }
                    }}
                    className={
                      addErrors.experience
                        ? "input-field-error"
                        : ""
                    }
                    required
                  />

                  {addErrors.experience && (
                    <span className="doc-field-error-msg">
                      {addErrors.experience}
                    </span>
                  )}
                </div>
              </div>

              {/* Consultation Fee */}

              <div className="form-group">
                <label htmlFor="add-doc-fee">
                  Consultation Fee (₹){" "}
                  <span className="req-star">
                    *
                  </span>
                </label>

                <input
                  id="add-doc-fee"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 1200"
                  value={addConsultationFee}
                  onChange={(e) => {
                    setAddConsultationFee(
                      e.target.value
                    );

                    if (
                      addErrors.consultationFee
                    ) {
                      setAddErrors(
                        (prev) => ({
                          ...prev,
                          consultationFee:
                            null,
                        })
                      );
                    }
                  }}
                  className={
                    addErrors.consultationFee
                      ? "input-field-error"
                      : ""
                  }
                  required
                />

                {addErrors.consultationFee && (
                  <span className="doc-field-error-msg">
                    {
                      addErrors.consultationFee
                    }
                  </span>
                )}
              </div>

              {/* Backend limitation notice */}

              <div className="doc-system-gen-banner">
                <div className="sys-gen-icon-wrap">
                  <FaHospital className="sys-gen-icon" />
                </div>

                <div className="sys-gen-text">
                  <span className="sys-gen-title">
                    Hospital Location
                  </span>

                  <p className="sys-gen-desc">
                    Doctor location is automatically
                    linked to the hospital's registered
                    city.
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hosp-btn-submit"
                >
                  <FaCheckCircle />
                  <span>
                    Register Doctor
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDoctors;