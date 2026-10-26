import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaSearch,
  FaFilter,
  FaDownload,
  FaTint,
  FaMapMarkerAlt,
  FaUserCheck,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import { sortDonorsByProximity, getProximityLabel } from "../../../utils/locationProximity";
import "./DoctorPatients.css";

const API_BASE = "http://localhost:5000";

const BLOOD_GROUPS = [
  "All Blood Groups",
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

function DoctorPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorCity, setDoctorCity] = useState("Kozhikode");
  const [doctorName, setDoctorName] = useState("");

  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All Blood Groups");

  // Location state: separate input (what user types) vs activeLocation (committed on Search)
  const [locationInput, setLocationInput] = useState("");
  const [activeLocation, setActiveLocation] = useState("");

  // Whether we are in "donor search mode" (a specific blood group is selected)
  const isDonorSearchMode =
    bloodGroupFilter !== "All Blood Groups" && bloodGroupFilter !== "";

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view patients.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/doctor/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        const patientList = Array.isArray(data.data) ? data.data : (data.data.patients || []);
        setPatients(patientList);

        const city = data.data.doctorCity || "Kozhikode";
        setDoctorCity(city);
        if (!activeLocation) {
          setActiveLocation(city);
          setLocationInput(city);
        }
        if (data.data.doctorName) {
          setDoctorName(data.data.doctorName);
        }
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("Error fetching doctor patients:", err);
      toast.error("Failed to load patient records.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [navigate, activeLocation]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleLocationSearch = () => {
    const loc = locationInput.trim() || doctorCity;
    setActiveLocation(loc);
  };

  const filteredPatients = useMemo(() => {
    let result = patients.filter((patient) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (patient.name || "").toLowerCase().includes(q) ||
        (patient.id || "").toLowerCase().includes(q) ||
        (patient.patientId || "").toLowerCase().includes(q) ||
        (patient.email || "").toLowerCase().includes(q) ||
        (patient.phone || "").includes(q) ||
        (patient.city && patient.city.toLowerCase().includes(q));

      // Blood group filter
      const patBg = patient.bloodGroup || "Not Provided";
      const matchesBloodGroup =
        !isDonorSearchMode || patBg === bloodGroupFilter;

      // When searching by blood group: automatically exclude unavailable donors
      const matchesAvailability =
        !isDonorSearchMode || patient.isDonorAvailable === true;

      return matchesSearch && matchesBloodGroup && matchesAvailability;
    });

    // When in donor search mode, sort by proximity to the active location
    if (isDonorSearchMode) {
      result = sortDonorsByProximity(result, activeLocation);
    }

    return result;
  }, [patients, search, bloodGroupFilter, isDonorSearchMode, activeLocation]);

  const handleDownloadReport = () => {
    generateBloodGroupReport({
      title: isDonorSearchMode
        ? `Available ${bloodGroupFilter} Donors near ${activeLocation}`
        : "Doctor Accessible Patients Report",
      selectedBloodGroup: bloodGroupFilter,
      generatedBy: `Dr. ${doctorName ? doctorName.replace(/^Dr\.\s*/i, "") : "Ayisha Shalba"} (Doctor)`,
      columns: [
        { header: "Patient ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Age", dataKey: "age" },
        { header: "Gender", dataKey: "gender" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "City", dataKey: "city" },
        ...(isDonorSearchMode
          ? [{ header: "Proximity", dataKey: "proximityLabel" }]
          : []),
        { header: "Phone", dataKey: "phone" },
        { header: "Email", dataKey: "email" },
      ],
      data: filteredPatients.map((p) => ({
        ...p,
        proximityLabel: isDonorSearchMode
          ? getProximityLabel(p.city, activeLocation)
          : "",
      })),
      activeFilters: {
        Search: search,
        ...(isDonorSearchMode && { "Search Location": activeLocation }),
        ...(isDonorSearchMode && { Availability: "Available Donors Only (Auto)" }),
      },
    });
  };

  return (
    <div className="doctor-patients">
      <div className="patients-header">
        <div>
          <h2>Patients</h2>
          <p>
            {isDonorSearchMode
              ? `Showing available ${bloodGroupFilter} donors nearest to ${activeLocation}`
              : "Manage and view your assigned patients."}
          </p>
        </div>
        <button
          className="download-report-btn"
          onClick={fetchPatients}
          disabled={loading}
          style={{ background: "#ffffff", color: "#475569", border: "1px solid #e2e8f0" }}
          title="Refresh patient list"
        >
          <FaSyncAlt className={loading ? "mr-spin" : ""} />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="patients-toolbar">
        {/* Search */}
        <div className="patients-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search patient by name, ID, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Blood Group Filter */}
        <div className="patients-filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={bloodGroupFilter}
            onChange={(e) => {
              setBloodGroupFilter(e.target.value);
              // Reset location to doctor's city when changing blood group
              setLocationInput(doctorCity);
              setActiveLocation(doctorCity);
            }}
            className="blood-group-select"
            aria-label="Filter by Blood Group"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg === "All Blood Groups" ? "Blood Group: All" : bg}
              </option>
            ))}
          </select>
        </div>

        {/* Location input — only shown when a blood group is selected */}
        {isDonorSearchMode && (
          <div className="patients-location-group">
            <div className="patients-location-input">
              <FaMapMarkerAlt className="loc-pin-icon" />
              <input
                type="text"
                placeholder="Enter location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLocationSearch();
                }}
                aria-label="Location for donor search"
              />
            </div>
            <button
              className="patients-search-btn"
              onClick={handleLocationSearch}
              aria-label="Search by location"
            >
              <FaSearch /> Search
            </button>
          </div>
        )}

        {/* Download */}
        <button
          className="download-report-btn"
          onClick={handleDownloadReport}
          title="Download Filtered Report"
        >
          <FaDownload />
          <span>Download Report</span>
        </button>
      </div>

      {/* Donor mode notice */}
      {isDonorSearchMode && (
        <div className="patients-donor-notice">
          <FaUserCheck className="donor-notice-icon" />
          <span>
            Showing <strong>available {bloodGroupFilter} donors only</strong>,
            ranked nearest to <strong>{activeLocation}</strong>. Unavailable
            patients are automatically excluded.
          </span>
        </div>
      )}

      {/* Result count */}
      <div className="patients-result-meta">
        <span>
          {filteredPatients.length}{" "}
          {isDonorSearchMode ? "available donor" : "patient"}
          {filteredPatients.length !== 1 ? "s" : ""} found
        </span>
        {isDonorSearchMode && (
          <span className="patients-proximity-hint">
            Nearest to <strong>{activeLocation}</strong> appear first
          </span>
        )}
      </div>

      {/* Patients Grid / Empty state */}
      {loading ? (
        <div className="patients-empty-state">
          <FaUser className="empty-icon" />
          <h3>Loading patients...</h3>
          <p>Fetching assigned patients from database.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="patients-empty-state">
          <FaUser className="empty-icon" />
          <h3>
            {isDonorSearchMode
              ? `No available ${bloodGroupFilter} donors found near ${activeLocation}.`
              : "No patients found."}
          </h3>
          <p>
            {isDonorSearchMode
              ? "Try a different blood group or location."
              : "Try clearing your search query."}
          </p>
        </div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.map((patient) => (
            <div className="patient-card" key={patient.id || patient._id}>
              <div className="patient-avatar">
                <FaUser />
              </div>

              <span className="patient-id-tag">{patient.id || patient.patientId}</span>
              <h3>{patient.name}</h3>

              <p className="patient-demographics">
                {patient.age} {typeof patient.age === "number" ? "Years" : ""} • {patient.gender}
              </p>

              <div className="patient-blood-badge-wrap">
                <span className="patient-blood-badge">
                  <FaTint /> {patient.bloodGroup || "Not Provided"}
                </span>
              </div>

              {/* City shown when in donor search mode */}
              {isDonorSearchMode && patient.city && (
                <p className="patient-city">
                  <FaMapMarkerAlt /> {patient.city}
                </p>
              )}

              <p className="patient-contact">
                <FaPhone /> {patient.phone || "Not Provided"}
              </p>

              <p className="patient-contact">
                <FaEnvelope /> {patient.email || "Not Provided"}
              </p>

              <button
                className="view-btn"
                onClick={() => navigate(`/doctor/patients/${patient.id || patient._id}`)}
              >
                <FaEye /> View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;