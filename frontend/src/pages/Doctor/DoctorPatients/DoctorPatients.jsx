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
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import "./DoctorPatients.css";

const BLOOD_GROUPS = [
  "All Blood Groups",
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
  "Not Provided",
];

// Patients accessible to the logged-in doctor via active doctor-patient relationship
const accessiblePatients = [
  {
    id: "PAT-4091",
    name: "Rahul Nair",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91 98765 43210",
    email: "rahul.nair@example.com",
  },
  {
    id: "PAT-4092",
    name: "Anjali Thomas",
    age: 27,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+91 98765 43211",
    email: "anjali.thomas@example.com",
  },
  {
    id: "PAT-4093",
    name: "Arun Kumar",
    age: 41,
    gender: "Male",
    bloodGroup: "A-",
    phone: "+91 98765 43212",
    email: "arun.kumar@example.com",
  },
  {
    id: "PAT-4094",
    name: "Lakshmi Nair",
    age: 46,
    gender: "Female",
    bloodGroup: "AB+",
    phone: "+91 98765 43213",
    email: "lakshmi.nair@example.com",
  },
  {
    id: "PAT-4095",
    name: "Thomas Kurian",
    age: 35,
    gender: "Male",
    bloodGroup: "Not Provided",
    phone: "+91 98765 43214",
    email: "thomas.kurian@example.com",
  },
];

function DoctorPatients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All Blood Groups");

  // Filter patients by Doctor-patient relationship access + search + blood group
  const filteredPatients = useMemo(() => {
    return accessiblePatients.filter((patient) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q) ||
        patient.phone.includes(q);

      const matchesBloodGroup =
        bloodGroupFilter === "All Blood Groups" ||
        (patient.bloodGroup || "Not Provided") === bloodGroupFilter;

      return matchesSearch && matchesBloodGroup;
    });
  }, [search, bloodGroupFilter]);

  const handleDownloadReport = () => {
    generateBloodGroupReport({
      title: "Doctor Accessible Patients Report",
      selectedBloodGroup: bloodGroupFilter,
      generatedBy: "Dr. Ayisha Shalba (Doctor)",
      columns: [
        { header: "Patient ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Age", dataKey: "age" },
        { header: "Gender", dataKey: "gender" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "Phone", dataKey: "phone" },
        { header: "Email", dataKey: "email" },
      ],
      data: filteredPatients,
      activeFilters: { Search: search },
    });
  };

  return (
    <div className="doctor-patients">
      <div className="patients-header">
        <div>
          <h2>Patients</h2>
          <p>Manage and view your assigned patients.</p>
        </div>
      </div>

      {/* Control Bar: Search + Blood Group Filter + Download Report */}
      <div className="patients-toolbar">
        <div className="patients-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search patient by name, ID, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="patients-filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="blood-group-select"
            aria-label="Filter by Blood Group"
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg === "All Blood Groups" ? "Blood Group: All Blood Groups" : bg}
              </option>
            ))}
          </select>
        </div>

        <button
          className="download-report-btn"
          onClick={handleDownloadReport}
          title="Download Filtered Blood Group Report"
        >
          <FaDownload />
          <span>Download Report</span>
        </button>
      </div>

      {/* Patients Grid / Empty state */}
      {filteredPatients.length === 0 ? (
        <div className="patients-empty-state">
          <FaUser className="empty-icon" />
          <h3>No users found for the selected blood group.</h3>
          <p>Try selecting a different blood group filter or clearing your search query.</p>
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