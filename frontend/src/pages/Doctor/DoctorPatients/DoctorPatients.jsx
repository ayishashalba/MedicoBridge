import React, { useState, useMemo } from "react";
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
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import { sortDonorsByProximity, getProximityLabel } from "../../../utils/locationProximity";
import "./DoctorPatients.css";

const BLOOD_GROUPS = [
  "All Blood Groups",
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

// Patients accessible to the logged-in doctor via active doctor-patient relationship
// Fields: city and isDonorAvailable support the integrated blood donor search
const accessiblePatients = [
  {
    id: "PAT-4091",
    name: "Rahul Nair",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "rahul.nair@example.com",
  },
  {
    id: "PAT-4092",
    name: "Anjali Thomas",
    age: 27,
    gender: "Female",
    bloodGroup: "O+",
    city: "Malappuram",
    isDonorAvailable: true,
    phone: "+91 98765 43211",
    email: "anjali.thomas@example.com",
  },
  {
    id: "PAT-4093",
    name: "Arun Kumar",
    age: 41,
    gender: "Male",
    bloodGroup: "A-",
    city: "Kannur",
    isDonorAvailable: false,
    phone: "+91 98765 43212",
    email: "arun.kumar@example.com",
  },
  {
    id: "PAT-4094",
    name: "Lakshmi Nair",
    age: 46,
    gender: "Female",
    bloodGroup: "AB+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43213",
    email: "lakshmi.nair@example.com",
  },
  {
    id: "PAT-4095",
    name: "Thomas Kurian",
    age: 35,
    gender: "Male",
    bloodGroup: "Not Provided",
    city: "Wayanad",
    isDonorAvailable: false,
    phone: "+91 98765 43214",
    email: "thomas.kurian@example.com",
  },
  {
    id: "PAT-4096",
    name: "Firoz Khan",
    age: 36,
    gender: "Male",
    bloodGroup: "B+",
    city: "Ernakulam",
    isDonorAvailable: true,
    phone: "+91 98765 43219",
    email: "firoz.khan@example.com",
  },
  {
    id: "PAT-4097",
    name: "Deepa Menon",
    age: 29,
    gender: "Female",
    bloodGroup: "B+",
    city: "Delhi",
    isDonorAvailable: true,
    phone: "+91 98765 43220",
    email: "deepa.menon@example.com",
  },
];

function DoctorPatients() {
  const navigate = useNavigate();
  const doctorCity = localStorage.getItem("doctorCity") || "Kozhikode";

  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All Blood Groups");

  // Location state: separate input (what user types) vs activeLocation (committed on Search)
  const [locationInput, setLocationInput] = useState(doctorCity);
  const [activeLocation, setActiveLocation] = useState(doctorCity);

  // Whether we are in "donor search mode" (a specific blood group is selected)
  const isDonorSearchMode =
    bloodGroupFilter !== "All Blood Groups" && bloodGroupFilter !== "";

  const handleLocationSearch = () => {
    const loc = locationInput.trim() || doctorCity;
    setActiveLocation(loc);
  };

  const filteredPatients = useMemo(() => {
    let result = accessiblePatients.filter((patient) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q) ||
        patient.phone.includes(q) ||
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
  }, [search, bloodGroupFilter, isDonorSearchMode, activeLocation]);

  const handleDownloadReport = () => {
    generateBloodGroupReport({
      title: isDonorSearchMode
        ? `Available ${bloodGroupFilter} Donors near ${activeLocation}`
        : "Doctor Accessible Patients Report",
      selectedBloodGroup: bloodGroupFilter,
      generatedBy: "Dr. Ayisha Shalba (Doctor)",
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
      {filteredPatients.length === 0 ? (
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
            <div className="patient-card" key={patient.id}>
              <div className="patient-avatar">
                <FaUser />
              </div>

              <span className="patient-id-tag">{patient.id}</span>
              <h3>{patient.name}</h3>

              <p className="patient-demographics">
                {patient.age} Years • {patient.gender}
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
                <FaPhone /> {patient.phone}
              </p>

              <p className="patient-contact">
                <FaEnvelope /> {patient.email}
              </p>

              <button
                className="view-btn"
                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
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