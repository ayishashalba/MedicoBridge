import React, { useState } from "react";
import { FaSearch, FaFilter, FaCalendarAlt, FaClock, FaVideo, FaTimes, FaEye } from "react-icons/fa";
import "./AdminPages.css";

const initialAppointments = [
  { id: "APT-2021", patient: "Aarav Sharma", doctor: "Dr. Priya Mehta", type: "Video Consultation", date: "15 Jul 2026", time: "10:30 AM", status: "Scheduled", room: "ROOM-MHT-994" },
  { id: "APT-2022", patient: "Sunita Rao", doctor: "Dr. Anil Kumar", type: "In-Clinic Visit", date: "15 Jul 2026", time: "11:45 AM", status: "Scheduled", room: "N/A (Physical)" },
  { id: "APT-2023", patient: "Lakshmi Nair", doctor: "Dr. Sara Thomas", type: "Video Consultation", date: "14 Jul 2026", time: "09:00 AM", status: "Completed", room: "ROOM-THM-124" },
  { id: "APT-2024", patient: "Rohan Verma", doctor: "Dr. Rajiv Kapoor", type: "In-Clinic Visit", date: "13 Jul 2026", time: "04:30 PM", status: "Cancelled", room: "Cancelled" },
  { id: "APT-2025", patient: "Karan Malhotra", doctor: "Dr. Priya Mehta", type: "Video Consultation", date: "12 Jul 2026", time: "02:15 PM", status: "Completed", room: "ROOM-MHT-775" },
];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApt, setSelectedApt] = useState(null);

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(search.toLowerCase()) ||
      apt.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Monitor platform-wide consultations, scheduling compliance, and appointment audits</p>
      </div>

      {/* KPI Cards row */}
      <div className="ad-kpi-grid" style={{ marginBottom: "0.5rem" }}>
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaCalendarAlt /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active Bookings</span>
            <h3 className="ad-kpi-value">{appointments.filter(a => a.status === "Scheduled").length}</h3>
          </div>
        </div>
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaClock /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Completed</span>
            <h3 className="ad-kpi-value">{appointments.filter(a => a.status === "Completed").length}</h3>
          </div>
        </div>
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaTimes /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Cancelled</span>
            <h3 className="ad-kpi-value">{appointments.filter(a => a.status === "Cancelled").length}</h3>
          </div>
        </div>
      </div>

      <div className="ad-card">
        {/* Search & Filter */}
        <div className="ad-search-filter-bar">
          <div className="ad-search-wrapper">
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search by Patient, Doctor, or Apt ID..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters">
            <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FaFilter /> Status:
            </span>
            <select
              className="ad-select"
              style={{ width: "140px", padding: "0.45rem 0.75rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Bookings</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Consultation Type</th>
                <th>Scheduled Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No appointments matches selected query filters.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td><span className="ad-id-badge">{apt.id}</span></td>
                    <td><strong>{apt.patient}</strong></td>
                    <td>{apt.doctor}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem" }}>
                        {apt.type.includes("Video") ? <FaVideo style={{ color: "var(--ad-primary)" }} /> : <FaCalendarAlt style={{ color: "var(--ad-text-secondary)" }} />}
                        {apt.type}
                      </span>
                    </td>
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td>
                      <span className="ad-pill" style={{
                        background: apt.status === "Scheduled" ? "#e0f2fe" : apt.status === "Completed" ? "#dcfce7" : "#fee2e2",
                        color: apt.status === "Scheduled" ? "#0284c7" : apt.status === "Completed" ? "#16a34a" : "#dc2626"
                      }}>{apt.status}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedApt(apt)}
                        className="ad-btn ad-btn-secondary"
                        style={{ padding: "0.35rem", borderRadius: "6px" }}
                        title="Audit Session Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Audit Modal */}
      {selectedApt && (
        <div className="ad-modal-backdrop" onClick={() => setSelectedApt(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>Appointment Session Audit</h3>
              <button className="ad-modal-close" onClick={() => setSelectedApt(null)}><FaTimes /></button>
            </div>
            <div className="ad-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--ad-border-color)", paddingBottom: "0.75rem" }}>
                <span className="ad-id-badge" style={{ fontSize: "0.85rem" }}>{selectedApt.id}</span>
                <span className="ad-pill" style={{
                  background: selectedApt.status === "Scheduled" ? "#e0f2fe" : selectedApt && selectedApt.status === "Completed" ? "#dcfce7" : "#fee2e2",
                  color: selectedApt.status === "Scheduled" ? "#0284c7" : selectedApt.status === "Completed" ? "#16a34a" : "#dc2626"
                }}>{selectedApt.status}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Patient Name</span>
                  <strong>{selectedApt.patient}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Consulting Physician</span>
                  <strong>{selectedApt.doctor}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Consultation Style</span>
                  <span>{selectedApt.type}</span>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Scheduled Time</span>
                  <span>{selectedApt.date} • {selectedApt.time}</span>
                </div>
              </div>

              {selectedApt.type.includes("Video") && (
                <div style={{
                  background: "var(--ad-bg-secondary)",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--ad-border-color)",
                  marginTop: "0.5rem"
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block", marginBottom: "0.25rem" }}>Telemedicine Room Code</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FaVideo style={{ color: "var(--ad-primary)" }} />
                    <code style={{ fontSize: "0.88rem", fontWeight: "bold" }}>{selectedApt.room}</code>
                  </div>
                </div>
              )}

              <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.8rem", borderLeft: "3px solid #64748b" }}>
                <strong>Platform Audit Log:</strong> Session verified on platform. Patient connection latency 32ms. Consultation history archived.
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-btn ad-btn-primary" onClick={() => setSelectedApt(null)}>Close Audit File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
