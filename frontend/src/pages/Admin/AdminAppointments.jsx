import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaUserMd,
  FaUser,
  FaHospital,
  FaFilePrescription,
  FaCalendarCheck,
  FaExclamationCircle,
  FaPlay,
  FaShieldAlt,
} from "react-icons/fa";
import {
  getStoredAppointments,
  computeAppointmentStatus,
} from "../../utils/adminData";
import "./AdminPages.css";

const statusConfig = {
  Upcoming: { bg: "#e0f2fe", color: "#0284c7", icon: <FaCalendarAlt /> },
  Ongoing: { bg: "#ede9fe", color: "#6d28d9", icon: <FaPlay /> },
  Completed: { bg: "#dcfce7", color: "#16a34a", icon: <FaCheckCircle /> },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", icon: <FaTimes /> },
  Overdue: { bg: "#fef3c7", color: "#d97706", icon: <FaExclamationCircle /> },
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedApt, setSelectedApt] = useState(null);

  useEffect(() => {
    // Load and evaluate time-based statuses for platform monitoring
    const loaded = getStoredAppointments();
    const evaluated = loaded.map((a) => ({
      ...a,
      computedStatus: computeAppointmentStatus(a),
    }));
    setAppointments(evaluated);
  }, []);

  // Filtered List
  const filtered = appointments.filter((apt) => {
    const s = search.toLowerCase();
    const matchesSearch =
      apt.patientName.toLowerCase().includes(s) ||
      apt.doctorName.toLowerCase().includes(s) ||
      apt.id.toLowerCase().includes(s) ||
      (apt.specialization && apt.specialization.toLowerCase().includes(s)) ||
      (apt.hospital && apt.hospital.toLowerCase().includes(s));

    const effectiveStatus = apt.computedStatus || apt.status;
    const matchesStatus = statusFilter === "All" || effectiveStatus === statusFilter;
    const matchesType = typeFilter === "All" || apt.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = appointments.filter((a) => a.computedStatus === "Upcoming" || a.computedStatus === "Ongoing").length;
  const ongoingCount = appointments.filter((a) => a.computedStatus === "Ongoing").length;
  const completedCount = appointments.filter((a) => a.computedStatus === "Completed").length;
  const cancelledCount = appointments.filter((a) => a.computedStatus === "Cancelled").length;

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaCalendarCheck style={{ color: "var(--ad-primary)" }} /> Appointments &amp; Telehealth Oversight
        </h2>
        <p>Platform supervision: View-only monitoring of doctor consultations, scheduled slots, telehealth room telemetry, and clinical compliance</p>
      </div>

      {/* KPI Cards Row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaCalendarAlt /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active / Upcoming</span>
            <h3 className="ad-kpi-value">{activeCount} Bookings</h3>
            {ongoingCount > 0 && (
              <span style={{ fontSize: "0.74rem", color: "#6d28d9", fontWeight: "700" }}>
                ● {ongoingCount} In-Session Right Now
              </span>
            )}
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaClock /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Completed Consults</span>
            <h3 className="ad-kpi-value">{completedCount} Sessions</h3>
            <span className="ad-kpi-delta up">98.4% Fulfillment Rate</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaTimes /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Cancelled / Rescheduled</span>
            <h3 className="ad-kpi-value">{cancelledCount}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Managed by Doctor/Hospital</span>
          </div>
        </div>
      </div>

      {/* Main Appointments Table Card */}
      <div className="ad-card">
        {/* Search & Filters */}
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search by Patient, Doctor, Hospital, Specialization, Apt ID..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              style={{ width: "160px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Ongoing">In-Progress / Ongoing</option>
              <option value="Upcoming">Upcoming / Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="ad-select"
              style={{ width: "160px" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="Video Consultation">Video Consultation</option>
              <option value="In-Clinic Visit">In-Clinic Visit</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Doctor &amp; Specialization</th>
                <th>Consultation Mode</th>
                <th>Date &amp; Time Slot</th>
                <th>Fee Status</th>
                <th>Time-Based Status</th>
                <th>Audit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No appointments match the selected query.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const effStatus = apt.computedStatus || apt.status;
                  const sc = statusConfig[effStatus] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={apt.id}>
                      <td>
                        <strong className="ad-id-badge">{apt.id}</strong>
                      </td>
                      <td>
                        <strong>{apt.patientName}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                          {apt.patientPhone || apt.patientId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{apt.doctorName}</strong>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                            {apt.specialization} · {apt.hospital}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem" }}>
                          {apt.type.includes("Video") ? (
                            <FaVideo style={{ color: "var(--ad-primary)" }} />
                          ) : (
                            <FaCalendarAlt style={{ color: "var(--ad-text-secondary)" }} />
                          )}
                          {apt.type}
                        </span>
                      </td>
                      <td>
                        <strong>{apt.date}</strong>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>
                          {apt.timeSlot}
                        </span>
                      </td>
                      <td>
                        <strong>₹{apt.fee || 500}</strong>
                        <span style={{ display: "block", fontSize: "0.7rem", color: apt.paymentStatus === "Paid" ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                          {apt.paymentStatus || "Paid"}
                        </span>
                      </td>
                      <td>
                        <span className="ad-pill" style={{ background: sc.bg, color: sc.color, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {sc.icon} {effStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedApt(apt)}
                          className="ad-btn ad-btn-primary"
                          style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                          title="View Consultation Audit & Session Details"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Consultation Session Audit Modal (View-Only) ── */}
      {selectedApt && (
        <div className="ad-modal-overlay" onClick={() => setSelectedApt(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
            <div className="ad-modal-header">
              <div>
                <h3 className="ad-modal-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaShieldAlt style={{ color: "var(--ad-primary)" }} /> Consultation Session Telemetry (View Only)
                </h3>
                <span className="ad-id-badge" style={{ marginTop: "4px" }}>{selectedApt.id}</span>
              </div>
              <button className="ad-modal-close" onClick={() => setSelectedApt(null)}><FaTimes /></button>
            </div>

            <div className="ad-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Status Header */}
              <div style={{
                background: statusConfig[selectedApt.computedStatus || selectedApt.status]?.bg,
                color: statusConfig[selectedApt.computedStatus || selectedApt.status]?.color,
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
                fontWeight: "700"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {statusConfig[selectedApt.computedStatus || selectedApt.status]?.icon} Status: {selectedApt.computedStatus || selectedApt.status}
                </span>
                <span style={{ fontSize: "0.85rem" }}>Fee: ₹{selectedApt.fee} ({selectedApt.paymentStatus})</span>
              </div>

              {/* Patient & Doctor cards */}
              <div className="ad-grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaUser /> Patient Profile
                  </h4>
                  <p style={{ margin: "0 0 0.15rem", fontWeight: "700" }}>{selectedApt.patientName}</p>
                  <p style={{ margin: "0 0 0.15rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Phone: {selectedApt.patientPhone}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    ID: {selectedApt.patientId || "PAT-Registered"}
                  </p>
                </div>

                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaUserMd /> Attending Doctor
                  </h4>
                  <p style={{ margin: "0 0 0.15rem", fontWeight: "700" }}>{selectedApt.doctorName}</p>
                  <p style={{ margin: "0 0 0.15rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    {selectedApt.specialization} ({selectedApt.department || "General"})
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Hospital: {selectedApt.hospital}
                  </p>
                </div>
              </div>

              {/* Consultation Details */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--ad-border-color)", padding: "1rem", borderRadius: "10px", marginBottom: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.92rem" }}>Appointment Details &amp; Telehealth Channel</h4>
                <p style={{ margin: "0 0 0.35rem", fontSize: "0.85rem" }}>
                  <strong>Scheduled Slot:</strong> {selectedApt.date} at {selectedApt.timeSlot}
                </p>
                <p style={{ margin: "0 0 0.35rem", fontSize: "0.85rem" }}>
                  <strong>Meeting Room URL / Location:</strong>{" "}
                  {selectedApt.roomUrl ? (
                    <code style={{ fontSize: "0.82rem" }}>{selectedApt.roomUrl}</code>
                  ) : (
                    "In-Clinic Consultation Room"
                  )}
                </p>
                <p style={{ margin: "0 0 0.35rem", fontSize: "0.85rem" }}>
                  <strong>Chief Symptoms / Complaint:</strong> {selectedApt.symptoms || "Routine Consultation"}
                </p>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  <strong>Physician Clinical Notes:</strong> {selectedApt.doctorNotes || "Pending physician entry post consultation."}
                </p>
              </div>

              {/* Attached Prescription Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--ad-bg-secondary)", padding: "0.75rem 1rem", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaFilePrescription style={{ color: "var(--ad-primary)" }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Prescription Status:</span>
                  <span style={{ fontSize: "0.85rem" }}>
                    {selectedApt.prescriptionIssued ? `Prescription Generated (${selectedApt.prescriptionId})` : "No prescription issued"}
                  </span>
                </div>
                {selectedApt.prescriptionIssued && (
                  <span className="ad-pill" style={{ background: "#dcfce7", color: "#16a34a" }}>Available in Pharmacy</span>
                )}
              </div>

              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#f1f5f9", borderRadius: "8px", fontSize: "0.78rem", color: "var(--ad-text-secondary)" }}>
                ℹ️ <em>Note: Appointment scheduling, rescheduling, cancellations, and clinical modifications are strictly managed within the Doctor and Hospital portals.</em>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.25rem" }}>
                <button type="button" className="ad-btn ad-btn-primary" onClick={() => setSelectedApt(null)}>
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
