import React, { useState, useEffect } from "react";
import {
  FaNotesMedical,
  FaSearch,
  FaFilter,
  FaFileMedical,
  FaUserMd,
  FaHospital,
  FaPills,
  FaFlask,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaLock,
  FaCalendarAlt,
  FaHeartbeat,
  FaUser,
} from "react-icons/fa";
import { getStoredMedicalRecords, saveMedicalRecords } from "../../utils/adminData";
import "./AdminPages.css";

const typeIcons = {
  "Consultation Summary": <FaNotesMedical style={{ color: "#4f46e5" }} />,
  "Lab Report": <FaFlask style={{ color: "#0284c7" }} />,
  "Prescription Record": <FaPills style={{ color: "#16a34a" }} />,
  "Diagnostic Imaging": <FaFileMedical style={{ color: "#d97706" }} />,
};

export default function AdminMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    setRecords(getStoredMedicalRecords());
  }, []);

  const filtered = records.filter((r) => {
    const matchSearch =
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId.toLowerCase().includes(search.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === "All" || r.recordType === typeFilter;
    const matchBg = bloodGroupFilter === "All" || r.bloodGroup === bloodGroupFilter;

    return matchSearch && matchType && matchBg;
  });

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaNotesMedical style={{ color: "var(--ad-primary)" }} /> Medical Records &amp; Clinical Registry
        </h2>
        <p>Audit electronic health records, consultation diagnoses, attached prescriptions, and verified lab telemetry</p>
      </div>

      {/* KPI Stats */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaNotesMedical /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">EHR Encounters</span>
            <h3 className="ad-kpi-value">{records.length} Records</h3>
            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "600" }}>Encrypted &amp; HIPAA Compliant</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaPills /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active Prescriptions</span>
            <h3 className="ad-kpi-value">
              {records.reduce((acc, r) => acc + (r.prescriptions ? r.prescriptions.length : 0), 0)} Issued
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Digitally Verified</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaLock /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Audit Compliance</span>
            <h3 className="ad-kpi-value">100% Locked</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Tamper-proof Verification</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="ad-card">
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search by Patient, Doctor, Diagnosis, Record ID..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "170px" }}
            >
              <option value="All">All Record Types</option>
              <option value="Consultation Summary">Consultation Summary</option>
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription Record">Prescription Record</option>
            </select>

            <select
              className="ad-select"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              style={{ width: "130px" }}
            >
              <option value="All">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Record Ref</th>
                <th>Patient &amp; Blood Group</th>
                <th>Record Category</th>
                <th>Consulting Doctor</th>
                <th>Clinical Diagnosis</th>
                <th>Encounter Date</th>
                <th>Integrity Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No medical records match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <strong className="ad-id-badge">{rec.id}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{rec.patientName}</strong>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "2px" }}>
                          <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>{rec.patientId} · {rec.age}y {rec.gender}</span>
                          <span style={{ fontSize: "0.68rem", background: "#fee2e2", color: "#dc2626", padding: "0.05rem 0.35rem", borderRadius: "3px", fontWeight: "700" }}>
                            {rec.bloodGroup}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: "600" }}>
                        {typeIcons[rec.recordType] || <FaFileMedical />}
                        {rec.recordType}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{rec.doctorName}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                          {rec.specialization} · {rec.facility}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--ad-text-primary)", fontWeight: "500" }}>
                        {rec.diagnosis}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem" }}>{rec.date}</span>
                    </td>
                    <td>
                      <span className="ad-pill" style={{ background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <FaLock style={{ fontSize: "0.7rem" }} /> {rec.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ad-btn ad-btn-primary"
                        style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                        onClick={() => setSelectedRecord(rec)}
                        title="Audit Clinical Encounter Details"
                      >
                        <FaEye /> Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Record Detail Audit Modal ── */}
      {selectedRecord && (
        <div className="ad-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "750px" }}>
            <div className="ad-modal-header">
              <div>
                <h3 className="ad-modal-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaNotesMedical style={{ color: "var(--ad-primary)" }} /> Clinical Record Audit
                </h3>
                <span className="ad-id-badge" style={{ marginTop: "4px" }}>{selectedRecord.id}</span>
              </div>
              <button className="ad-modal-close" onClick={() => setSelectedRecord(null)}><FaTimes /></button>
            </div>

            <div className="ad-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Header Info */}
              <div className="ad-grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaUser /> Patient Profile
                  </h4>
                  <p style={{ margin: "0 0 0.15rem", fontWeight: "700" }}>{selectedRecord.patientName}</p>
                  <p style={{ margin: "0 0 0.15rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    ID: {selectedRecord.patientId} · {selectedRecord.age} yrs · {selectedRecord.gender}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Blood Group: <strong>{selectedRecord.bloodGroup}</strong>
                  </p>
                </div>

                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaUserMd /> Attending Physician
                  </h4>
                  <p style={{ margin: "0 0 0.15rem", fontWeight: "700" }}>{selectedRecord.doctorName}</p>
                  <p style={{ margin: "0 0 0.15rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    {selectedRecord.specialization}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Facility: {selectedRecord.facility}
                  </p>
                </div>
              </div>

              {/* Clinical Vitals & Diagnosis */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>Clinical Diagnosis &amp; Symptoms</h4>
                <div style={{ background: "#f8fafc", border: "1px solid var(--ad-border-color)", borderRadius: "8px", padding: "0.85rem 1rem" }}>
                  <p style={{ margin: "0 0 0.4rem" }}>
                    <strong>Primary Diagnosis:</strong> {selectedRecord.diagnosis}
                  </p>
                  <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                    <strong>Reported Symptoms:</strong> {selectedRecord.symptoms}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                    <strong>Treatment Plan:</strong> {selectedRecord.treatmentPlan}
                  </p>
                </div>
              </div>

              {/* Vitals Telemetry */}
              {selectedRecord.vitals && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaHeartbeat style={{ color: "#ef4444" }} /> Recorded Vitals
                  </h4>
                  <div className="ad-grid-4" style={{ gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}>
                    <div style={{ background: "var(--ad-bg-secondary)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>Blood Pressure</span>
                      <strong style={{ display: "block", fontSize: "0.9rem" }}>{selectedRecord.vitals.bp}</strong>
                    </div>
                    <div style={{ background: "var(--ad-bg-secondary)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>Pulse Rate</span>
                      <strong style={{ display: "block", fontSize: "0.9rem" }}>{selectedRecord.vitals.pulse}</strong>
                    </div>
                    <div style={{ background: "var(--ad-bg-secondary)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>SpO2</span>
                      <strong style={{ display: "block", fontSize: "0.9rem" }}>{selectedRecord.vitals.spo2}</strong>
                    </div>
                    <div style={{ background: "var(--ad-bg-secondary)", padding: "0.6rem", borderRadius: "6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>Body Temp</span>
                      <strong style={{ display: "block", fontSize: "0.9rem" }}>{selectedRecord.vitals.temp}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Prescriptions */}
              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaPills style={{ color: "#16a34a" }} /> Prescribed Medicines
                  </h4>
                  <table className="ad-table" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.prescriptions.map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.dosage}</td>
                          <td>{p.duration}</td>
                          <td>{p.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Lab Findings & Notes */}
              {selectedRecord.labFindings && (
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.95rem" }}>Lab &amp; Diagnostic Findings</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", background: "var(--ad-bg-secondary)", padding: "0.75rem", borderRadius: "6px" }}>
                    {selectedRecord.labFindings}
                  </p>
                </div>
              )}

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="ad-btn ad-btn-primary" onClick={() => window.print()}>
                  Print Medical Summary
                </button>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setSelectedRecord(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
