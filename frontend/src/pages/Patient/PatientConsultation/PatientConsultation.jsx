import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaClock,
  FaCalendarAlt,
  FaHospital,
  FaClinicMedical,
  FaUserMd,
  FaStethoscope,
  FaSearch,
  FaHourglassHalf,
  FaCheckCircle,
  FaVideoSlash,
  FaInfoCircle,
} from "react-icons/fa";
import "./PatientConsultation.css";

/* ─── Status Configuration ────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending Approval",
    icon: <FaHourglassHalf />,
    badgeClass: "oc-status-badge--pending",
    cardClass: "oc-card--pending",
  },
  confirmed: {
    label: "Confirmed",
    icon: <FaCheckCircle />,
    badgeClass: "oc-status-badge--confirmed",
    cardClass: "oc-card--confirmed",
  },
  ready: {
    label: "Ready to Join",
    icon: <FaVideo />,
    badgeClass: "oc-status-badge--ready",
    cardClass: "oc-card--ready",
  },
};

/* ─── Dummy Consultation Data ─────────────────────────────────────── */
const consultationsData = [
  {
    id: "MC-CON-101",
    doctorName: "Dr. Aisha Khan",
    specialization: "Cardiologist",
    hospital: "Apollo Hospitals",
    type: "hospital",
    date: "2026-07-10",
    time: "10:30 AM",
    status: "ready",
    doctorPhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    initials: "AK",
    color: "#7c3aed",
    online: true,
  },
  {
    id: "MC-CON-102",
    doctorName: "Dr. Rahul Verma",
    specialization: "Orthopedic Surgeon",
    hospital: "Fortis Healthcare",
    type: "hospital",
    date: "2026-07-12",
    time: "02:00 PM",
    status: "confirmed",
    doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    initials: "RV",
    color: "#0284c7",
    online: false,
  },
  {
    id: "MC-CON-103",
    doctorName: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    hospital: "Skin Care Clinic",
    type: "clinic",
    date: "2026-07-15",
    time: "11:15 AM",
    status: "pending",
    doctorPhoto: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    initials: "PS",
    color: "#0d9488",
    online: true,
  },
  {
    id: "MC-CON-104",
    doctorName: "Dr. Suresh Nair",
    specialization: "Neurologist",
    hospital: "AIIMS Hospital",
    type: "hospital",
    date: "2026-07-18",
    time: "04:30 PM",
    status: "confirmed",
    doctorPhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    initials: "SN",
    color: "#f59e0b",
    online: false,
  },
];

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PatientConsultation() {
  const navigate = useNavigate();
  const [consultations] = useState(consultationsData);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  const handleImageError = (docId) => {
    setImageErrors((prev) => ({ ...prev, [docId]: true }));
  };

  const handleViewDetails = (doctorName) => {
    setToastMessage(`View Details for ${doctorName} is approved but details page is under construction.`);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  /* Filter and search consultations */
  const filteredConsultations = consultations.filter((c) => {
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* Calculate Counts for Stats */
  const totalCount = consultations.length;
  const readyCount = consultations.filter((c) => c.status === "ready").length;
  const confirmedCount = consultations.filter((c) => c.status === "confirmed").length;
  const pendingCount = consultations.filter((c) => c.status === "pending").length;

  return (
    <div className="oc-page">
      {/* Toast Notification for View Details */}
      {toastMessage && createPortal(
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "10px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.88rem",
          border: "1px solid #1e293b",
          animation: "ocFadeIn 0.3s ease-out"
        }}>
          <FaInfoCircle style={{ color: "#0d9488" }} />
          <span>{toastMessage}</span>
        </div>,
        document.body
      )}

      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="oc-header">
        <div>
          <h1 className="oc-title">Online Consultation</h1>
          <p className="oc-subtitle">
            Secure video consultations with leading doctors from the comfort of your home.
          </p>
        </div>
        <button
          className="oc-request-btn"
          onClick={() => navigate("/patient/find-doctors")}
          aria-label="Request a new online consultation"
        >
          <FaVideo /> Request New Consultation
        </button>
      </header>

      {/* ── Summary Stats Bar ──────────────────────────────────── */}
      <section className="oc-stats-bar" aria-label="Consultation summaries">
        <div className="oc-stat-chip" style={{ "--stat-color": "#0d9488" }}>
          <span className="oc-stat-val">{totalCount}</span>
          <span className="oc-stat-lbl">Total</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#10b981" }}>
          <span className="oc-stat-val">{readyCount}</span>
          <span className="oc-stat-lbl">Ready to Join</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#0284c7" }}>
          <span className="oc-stat-val">{confirmedCount}</span>
          <span className="oc-stat-lbl">Confirmed</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#f59e0b" }}>
          <span className="oc-stat-val">{pendingCount}</span>
          <span className="oc-stat-lbl">Pending</span>
        </div>
      </section>

      {/* ── Filter / Search Bar ────────────────────────────────── */}
      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }} aria-label="Search and Filter">
        {/* Search input */}
        <div className="appt-search-bar" style={{ flex: 1, minWidth: "260px" }}>
          <FaSearch className="appt-search-icon" />
          <input
            type="text"
            className="appt-search-input"
            placeholder="Search by doctor, specialization, or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search online consultations"
          />
        </div>

        {/* Filter Tabs */}
        <div className="appt-tabs" style={{ margin: 0 }}>
          <button
            className={`appt-tab ${filterStatus === "all" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Upcoming
          </button>
          <button
            className={`appt-tab ${filterStatus === "ready" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("ready")}
          >
            Ready to Join
          </button>
          <button
            className={`appt-tab ${filterStatus === "confirmed" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`appt-tab ${filterStatus === "pending" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
        </div>
      </section>

      {/* ── Section Title ──────────────────────────────────────── */}
      <h2 className="oc-section-title">
        <FaVideo style={{ fontSize: "1rem" }} />
        Upcoming Video Consultations
      </h2>

      {/* ── Consultation Listing Grid ──────────────────────────── */}
      {filteredConsultations.length > 0 ? (
        <div className="oc-cards-grid">
          {filteredConsultations.map((consult) => {
            const config = STATUS_CONFIG[consult.status] || STATUS_CONFIG.pending;
            const hasImageError = imageErrors[consult.id];

            return (
              <article
                key={consult.id}
                className={`oc-card ${config.cardClass}`}
                aria-label={`Consultation with ${consult.doctorName}`}
              >
                {/* Header: Photo and ID info */}
                <div className="oc-card-header">
                  <div className="oc-avatar-wrapper">
                    {!hasImageError && consult.doctorPhoto ? (
                      <img
                        src={consult.doctorPhoto}
                        alt={consult.doctorName}
                        className="oc-avatar-img"
                        onError={() => handleImageError(consult.id)}
                      />
                    ) : (
                      <div
                        className="oc-avatar-fallback"
                        style={{
                          background: `linear-gradient(135deg, ${consult.color}cc, ${consult.color}66)`,
                        }}
                      >
                        {consult.initials}
                      </div>
                    )}
                    <span className={`oc-avatar-status ${consult.online ? "oc-status--online" : "oc-status--offline"}`} />
                  </div>

                  <div className="oc-doctor-info">
                    <h3 className="oc-doc-name">{consult.doctorName}</h3>
                    <p className="oc-doc-spec">
                      <FaStethoscope className="oc-meta-icon" />
                      {consult.specialization}
                    </p>
                    <p className="oc-doc-hosp">
                      {consult.type === "hospital" ? (
                        <FaHospital className="oc-meta-icon" style={{ color: "#0284c7" }} />
                      ) : (
                        <FaClinicMedical className="oc-meta-icon" style={{ color: "#10b981" }} />
                      )}
                      {consult.hospital}
                    </p>
                  </div>
                </div>

                {/* Body: Date and Time */}
                <div className="oc-card-body">
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      <FaCalendarAlt /> Date
                    </span>
                    <span className="oc-meta-value">{formatDate(consult.date)}</span>
                  </div>
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      <FaClock /> Time
                    </span>
                    <span className="oc-meta-value">{consult.time}</span>
                  </div>
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      Status
                    </span>
                    <span className={`oc-status-badge ${config.badgeClass}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                </div>

                {/* Footer: Action buttons */}
                <div className="oc-card-footer">
                  <button
                    className="oc-btn oc-btn--details"
                    onClick={() => handleViewDetails(consult.doctorName)}
                    aria-label={`View details of consultation with ${consult.doctorName}`}
                  >
                    View Details
                  </button>

                  {consult.status === "ready" ? (
                    <button
                      className="oc-btn oc-btn--join"
                      onClick={() => alert(`Launching Consultation Room for ${consult.id}`)}
                      aria-label="Join video consultation call"
                    >
                      <FaVideo /> Join Call
                    </button>
                  ) : (
                    <button
                      className="oc-btn oc-btn--disabled"
                      disabled
                      aria-label="Join room disabled"
                    >
                      <FaVideoSlash /> Join Room
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="oc-empty-state">
          <div className="oc-empty-icon">
            <FaVideoSlash />
          </div>
          <h3 className="oc-empty-title">No consultations found</h3>
          <p className="oc-empty-desc">
            {searchQuery
              ? "There are no consultations matching your search terms. Please try another search."
              : "You do not have any upcoming consultations scheduled."}
          </p>
          {searchQuery ? (
            <button className="oc-empty-btn" onClick={() => setSearchQuery("")}>
              Clear Search Query
            </button>
          ) : (
            <button className="oc-empty-btn" onClick={() => navigate("/patient/find-doctors")}>
              Find Doctors & Book
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientConsultation;
