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
  FaRegCalendarAlt,
} from "react-icons/fa";
import {
  getStoredAppointments,
  saveAppointments,
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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00 AM - 10:30 AM");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    // Load and evaluate time-based statuses
    const loaded = getStoredAppointments();
    const evaluated = loaded.map((a) => ({
      ...a,
      computedStatus: computeAppointmentStatus(a),
    }));
    setAppointments(evaluated);
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateAppointmentsState = (updatedList) => {
    setAppointments(updatedList);
    saveAppointments(updatedList);
  };

  // Handle Cancel Appointment
  const handleCancelApt = (aptId) => {
    if (window.confirm("Cancel this appointment and notify patient & doctor?")) {
      const updated = appointments.map((a) => {
        if (a.id === aptId) {
          return { ...a, status: "Cancelled", computedStatus: "Cancelled", paymentStatus: "Refunded" };
        }
        return a;
      });
      updateAppointmentsState(updated);
      if (selectedApt && selectedApt.id === aptId) {
        setSelectedApt(updated.find((a) => a.id === aptId));
      }
      triggerToast(`Appointment ${aptId} has been cancelled.`);
    }
  };

  // Handle Reschedule Appointment
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedApt || !rescheduleDate) return;

    const updated = appointments.map((a) => {
      if (a.id === selectedApt.id) {
        const newApt = {
          ...a,
          date: rescheduleDate,
          timeSlot: rescheduleTime,
          status: "Upcoming",
        };
        return {
          ...newApt,
          computedStatus: computeAppointmentStatus(newApt),
        };
      }
      return a;
    });

    updateAppointmentsState(updated);
    setSelectedApt(updated.find((a) => a.id === selectedApt.id));
    setShowRescheduleModal(false);
    triggerToast(`Appointment ${selectedApt.id} rescheduled to ${rescheduleDate}.`);
  };

  // Filtered List
  const filtered = appointments.filter((apt) => {
    const s = search.toLowerCase();
    const matchesSearch =
      apt.patientName.toLowerCase().includes(s) ||
      apt.doctorName.toLowerCase().includes(s) ||
      apt.id.toLowerCase().includes(s) ||
      (apt.specialization && apt.specialization.toLowerCase().includes(s));

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
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#1e293b",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "adFadeIn 0.3s ease"
        }}>
          <FaCheckCircle style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaCalendarCheck style={{ color: "var(--ad-primary)" }} /> Appointments &amp; Consultations
        </h2>
        <p>Monitor platform-wide digital and in-clinic consultations, real-time status schedules, and clinical notes</p>
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
            <h3 className="ad-kpi-value">{completedCount}</h3>
            <span className="ad-kpi-delta up">98.4% Fulfillment Rate</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaTimes /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Cancelled / Refunded</span>
            <h3 className="ad-kpi-value">{cancelledCount}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Low No-Show Ratio</span>
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
              placeholder="Search by Patient, Doctor, Specialization, Apt ID..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              style={{ width: "150px" }}
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
              style={{ width: "150px" }}
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
                <th>Fee &amp; Payment</th>
                <th>Time-Based Status</th>
                <th>Actions</th>
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
                          title="Audit Consultation Session"
                        >
                          <FaEye /> Audit
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

      {/* ── Consultation Session Audit Modal ── */}
      {selectedApt && (
        <div className="ad-modal-overlay" onClick={() => setSelectedApt(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
            <div className="ad-modal-header">
              <div>
                <h3 className="ad-modal-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaCalendarCheck style={{ color: "var(--ad-primary)" }} /> Consultation Session Audit
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
                    <FaUser /> Patient Information
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
                    <FaUserMd /> Consulting Specialist
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
                <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.92rem" }}>Appointment Telemetry &amp; Meeting Channel</h4>
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

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                {selectedApt.computedStatus !== "Cancelled" && selectedApt.computedStatus !== "Completed" && (
                  <>
                    <button
                      type="button"
                      className="ad-btn ad-btn-primary"
                      onClick={() => {
                        setRescheduleDate(selectedApt.date);
                        setShowRescheduleModal(true);
                      }}
                    >
                      <FaCalendarAlt /> Reschedule Appointment
                    </button>
                    <button
                      type="button"
                      className="ad-btn ad-btn-danger"
                      onClick={() => handleCancelApt(selectedApt.id)}
                    >
                      <FaTimes /> Cancel &amp; Refund
                    </button>
                  </>
                )}
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setSelectedApt(null)}>
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reschedule Modal ── */}
      {showRescheduleModal && (
        <div className="ad-modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaCalendarAlt /> Reschedule Appointment</h3>
              <button className="ad-modal-close" onClick={() => setShowRescheduleModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="ad-modal-body">
              <p style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                Rescheduling consultation for <strong>{selectedApt?.patientName}</strong> with <strong>{selectedApt?.doctorName}</strong>.
              </p>
              <div className="ad-form-group">
                <label>New Consultation Date *</label>
                <input
                  type="date"
                  required
                  className="ad-input"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="ad-form-group">
                <label>Time Slot</label>
                <select
                  className="ad-select"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                >
                  <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                  <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                  <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                  <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                  <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                </select>
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaCalendarCheck /> Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
