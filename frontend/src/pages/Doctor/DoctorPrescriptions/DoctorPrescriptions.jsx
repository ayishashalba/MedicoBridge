import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPills,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaFileMedical,
} from "react-icons/fa";
import "./DoctorPrescriptions.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const prescriptionsData = [
  {
    id: 1,
    rxId: "RX-4521",
    patientName: "Rahul Nair",
    patientId: "PT-1024",
    initials: "RN",
    avatarColor: "#0d9488",
    diagnosis: "Type 2 Diabetes Mellitus Follow-up",
    medicinesCount: 3,
    date: "June 28, 2026",
    status: "Active",
  },
  {
    id: 2,
    rxId: "RX-4189",
    patientName: "Anjali Thomas",
    patientId: "PT-1031",
    initials: "AT",
    avatarColor: "#7c3aed",
    diagnosis: "Hypertension Management",
    medicinesCount: 2,
    date: "March 10, 2026",
    status: "Completed",
  },
  {
    id: 3,
    rxId: "RX-3877",
    patientName: "Arun Kumar",
    patientId: "PT-1018",
    initials: "AK",
    avatarColor: "#0284c7",
    diagnosis: "Seasonal Allergic Rhinitis",
    medicinesCount: 2,
    date: "December 5, 2025",
    status: "Completed",
  },
  {
    id: 4,
    rxId: "RX-3512",
    patientName: "Meera Pillai",
    patientId: "PT-1045",
    initials: "MP",
    avatarColor: "#d97706",
    diagnosis: "Mild Anxiety and Fatigue",
    medicinesCount: 1,
    date: "October 14, 2025",
    status: "Completed",
  },
  {
    id: 5,
    rxId: "RX-3298",
    patientName: "Suresh Babu",
    patientId: "PT-1052",
    initials: "SB",
    avatarColor: "#dc2626",
    diagnosis: "Post-Surgery Cardiac Follow-up",
    medicinesCount: 4,
    date: "August 30, 2025",
    status: "Completed",
  },
  {
    id: 6,
    rxId: "RX-3045",
    patientName: "Lakshmi Nair",
    patientId: "PT-1060",
    initials: "LN",
    avatarColor: "#059669",
    diagnosis: "Chronic Migraine Management",
    medicinesCount: 2,
    date: "June 12, 2025",
    status: "Completed",
  },
];

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredPrescriptions = useMemo(() => {
    return prescriptionsData.filter((prescription) => {
      const matchesSearch =
        prescription.patientName.toLowerCase().includes(search.toLowerCase()) ||
        prescription.rxId.toLowerCase().includes(search.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || prescription.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const activeCount = prescriptionsData.filter(p => p.status === "Active").length;
  const completedCount = prescriptionsData.filter(p => p.status === "Completed").length;

  const handleDownload = (rxId) => {
    alert(`Downloading PDF for Prescription ${rxId}`);
  };

  return (
    <div className="prescriptions-page">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="prescriptions-header">
        <div className="header-title-section">
          <h2>
            <FaPills className="header-icon" /> Prescriptions
          </h2>
          <p>Create and manage digital prescriptions for your patients.</p>
        </div>
        <button
          className="create-prescription-btn"
          onClick={() => navigate("/doctor/edit-prescription/new")}
        >
          <FaPlus /> Create Prescription
        </button>
      </div>

      {/* ── Stats Summary Bar ─────────────────────────── */}
      <div className="prescriptions-stats-bar">
        <div className="stat-pill stat-pill--total">
          <FaFileMedical />
          <span className="stat-val">{prescriptionsData.length}</span>
          <span className="stat-lbl">Total Prescriptions</span>
        </div>
        <div className="stat-pill stat-pill--active">
          <FaClock />
          <span className="stat-val">{activeCount}</span>
          <span className="stat-lbl">Active</span>
        </div>
        <div className="stat-pill stat-pill--completed">
          <FaCheckCircle />
          <span className="stat-val">{completedCount}</span>
          <span className="stat-lbl">Completed</span>
        </div>
      </div>

      {/* ── Filter & Search Controls ────────────────── */}
      <div className="prescriptions-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient name, ID, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          {["All", "Active", "Completed"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "filter-btn--active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Layout (Desktop) & Card Layout (Mobile) ── */}
      {filteredPrescriptions.length === 0 ? (
        <div className="no-prescriptions-card">
          <FaPills className="empty-icon" />
          <h3>No Prescriptions Found</h3>
          <p>Try refining your search or status filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="prescriptions-table-wrapper">
            <table className="prescriptions-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((p) => (
                  <tr key={p.id}>
                    <td className="rx-id-cell">
                      <span>{p.rxId}</span>
                    </td>
                    <td>
                      <div className="patient-profile-cell">
                        <div
                          className="patient-initials-circle"
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          {p.initials}
                        </div>
                        <div className="patient-profile-info">
                          <span className="patient-name">{p.patientName}</span>
                          <span className="patient-id">{p.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="diagnosis-text">{p.diagnosis}</span>
                    </td>
                    <td className="medicines-count-cell">
                      <span className="meds-badge">
                        {p.medicinesCount} {p.medicinesCount === 1 ? "Medicine" : "Medicines"}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <FaCalendarAlt />
                        <span>{p.date}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-badge--${p.status.toLowerCase()}`}
                      >
                        {p.status === "Active" ? <FaClock /> : <FaCheckCircle />}
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => navigate(`/doctor/prescription-preview/${p.id}`)}
                          title="View Prescription"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="action-btn action-btn--download"
                          onClick={() => handleDownload(p.rxId)}
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="prescriptions-card-grid">
            {filteredPrescriptions.map((p) => (
              <div className="prescription-mobile-card" key={p.id}>
                <div className="card-header">
                  <div className="patient-profile-cell">
                    <div
                      className="patient-initials-circle"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.initials}
                    </div>
                    <div className="patient-profile-info">
                      <span className="patient-name">{p.patientName}</span>
                      <span className="patient-id">{p.patientId}</span>
                    </div>
                  </div>
                  <span
                    className={`status-badge status-badge--${p.status.toLowerCase()}`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-field card-field--rx-id">
                    <span className="field-lbl">Prescription ID</span>
                    <span className="field-val rx-id-val">{p.rxId}</span>
                  </div>

                  <div className="card-field card-field--diagnosis">
                    <span className="field-lbl">Diagnosis</span>
                    <span className="field-val">{p.diagnosis}</span>
                  </div>

                  <div className="card-meta-row">
                    <div className="meta-item">
                      <FaCalendarAlt />
                      <span>{p.date}</span>
                    </div>
                    <div className="meta-item">
                      <FaPills />
                      <span>
                        {p.medicinesCount} {p.medicinesCount === 1 ? "Med" : "Meds"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn action-btn--view"
                    onClick={() => navigate(`/doctor/prescription-preview/${p.id}`)}
                  >
                    <FaEye /> View Prescription
                  </button>
                  <button
                    className="action-btn action-btn--download"
                    onClick={() => handleDownload(p.rxId)}
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorPrescriptions;
