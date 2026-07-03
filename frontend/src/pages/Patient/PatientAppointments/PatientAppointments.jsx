import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaCalendarAlt,
  FaHospital,
  FaClinicMedical,
  FaVideo,
  FaUserMd,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaDownload,
  FaEye,
  FaPhoneAlt,
  FaIdCard,
  FaStethoscope,
  FaSearch,
  FaInbox,
} from "react-icons/fa";
import "./PatientAppointments.css";

/* ─── Status Config ──────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: <FaHourglassHalf />,
    colorClass: "appt-status--pending",
  },
  confirmed: {
    label: "Confirmed",
    icon: <FaCheckCircle />,
    colorClass: "appt-status--confirmed",
  },
  completed: {
    label: "Completed",
    icon: <FaCalendarCheck />,
    colorClass: "appt-status--completed",
  },
  rejected: {
    label: "Rejected",
    icon: <FaTimesCircle />,
    colorClass: "appt-status--rejected",
  },
  cancelled: {
    label: "Cancelled",
    icon: <FaBan />,
    colorClass: "appt-status--cancelled",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

/* ─── Dummy Appointment Data ─────────────────────────────────────── */
const appointmentsData = [
  {
    id: "MB-APT-001",
    doctorId: 1,
    doctorName: "Dr. Aisha Khan",
    initials: "AK",
    color: "#7c3aed",
    specialization: "Cardiologist",
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    type: "hospital",
    consultationType: "in-person",
    date: "2026-07-10",
    time: "09:30 AM",
    fee: 800,
    rating: 4.9,
    status: "pending",
    reason: "General Consultation",
    notes: "Chest discomfort for past 2 weeks",
  },
  {
    id: "MB-APT-002",
    doctorId: 7,
    doctorName: "Dr. Kavitha Reddy",
    initials: "KR",
    color: "#6366f1",
    specialization: "Ophthalmologist",
    hospital: "Vision Eye Hospital",
    city: "Kochi",
    type: "hospital",
    consultationType: "video",
    date: "2026-07-08",
    time: "10:00 AM",
    fee: 550,
    rating: 4.7,
    status: "confirmed",
    reason: "Follow-up Visit",
    notes: "Post-surgery follow-up",
  },
  {
    id: "MB-APT-003",
    doctorId: 3,
    doctorName: "Dr. Priya Sharma",
    initials: "PS",
    color: "#0d9488",
    specialization: "Dermatologist",
    hospital: "Skin Care Clinic",
    city: "Bangalore",
    type: "clinic",
    consultationType: "in-person",
    date: "2026-06-20",
    time: "11:00 AM",
    fee: 500,
    rating: 4.8,
    status: "completed",
    reason: "Acne Treatment",
    notes: "",
    prescription: true,
  },
  {
    id: "MB-APT-004",
    doctorId: 4,
    doctorName: "Dr. Suresh Nair",
    initials: "SN",
    color: "#f59e0b",
    specialization: "Neurologist",
    hospital: "AIIMS",
    city: "Chennai",
    type: "hospital",
    consultationType: "in-person",
    date: "2026-06-15",
    time: "02:00 PM",
    fee: 1200,
    rating: 4.9,
    status: "completed",
    reason: "Chronic Headache Consultation",
    notes: "Recurring migraines for 3 months",
    prescription: true,
  },
  {
    id: "MB-APT-005",
    doctorId: 5,
    doctorName: "Dr. Meera Patel",
    initials: "MP",
    color: "#ec4899",
    specialization: "Gynecologist",
    hospital: "Wockhardt Hospital",
    city: "Pune",
    type: "hospital",
    consultationType: "video",
    date: "2026-06-28",
    time: "03:30 PM",
    fee: 600,
    rating: 4.6,
    status: "rejected",
    reason: "Routine Health Check-up",
    notes: "",
    rejectionReason: "Doctor unavailable on the selected date.",
  },
  {
    id: "MB-APT-006",
    doctorId: 8,
    doctorName: "Dr. Vikram Singh",
    initials: "VS",
    color: "#8b5cf6",
    specialization: "Psychiatrist",
    hospital: "MindCare Clinic",
    city: "Jaipur",
    type: "clinic",
    consultationType: "video",
    date: "2026-07-05",
    time: "04:00 PM",
    fee: 700,
    rating: 4.8,
    status: "cancelled",
    reason: "Anxiety Management",
    notes: "Patient cancelled — personal reasons",
  },
  {
    id: "MB-APT-007",
    doctorId: 2,
    doctorName: "Dr. Rahul Verma",
    initials: "RV",
    color: "#0284c7",
    specialization: "Orthopedic Surgeon",
    hospital: "Fortis Healthcare",
    city: "Delhi",
    type: "hospital",
    consultationType: "in-person",
    date: "2026-07-15",
    time: "11:00 AM",
    fee: 700,
    rating: 4.7,
    status: "confirmed",
    reason: "Knee Pain Follow-up",
    notes: "Post physiotherapy review",
  },
  {
    id: "MB-APT-008",
    doctorId: 10,
    doctorName: "Dr. Rohit Gupta",
    initials: "RG",
    color: "#f97316",
    specialization: "General Physician",
    hospital: "HealthFirst Clinic",
    city: "Lucknow",
    type: "clinic",
    consultationType: "video",
    date: "2026-07-12",
    time: "09:00 AM",
    fee: 300,
    rating: 4.4,
    status: "pending",
    reason: "Fever & Cold",
    notes: "High temperature since 2 days",
  },
  {
    id: "MB-APT-009",
    doctorId: 11,
    doctorName: "Dr. Sunita Joshi",
    initials: "SJ",
    color: "#14b8a6",
    specialization: "Rheumatologist",
    hospital: "Medanta Hospital",
    city: "Gurugram",
    type: "hospital",
    consultationType: "in-person",
    date: "2026-05-30",
    time: "10:00 AM",
    fee: 1000,
    rating: 4.9,
    status: "completed",
    reason: "Joint Pain Consultation",
    notes: "",
    prescription: true,
  },
  {
    id: "MB-APT-010",
    doctorId: 6,
    doctorName: "Dr. Arjun Mehta",
    initials: "AM",
    color: "#10b981",
    specialization: "Pediatrician",
    hospital: "Child Care Clinic",
    city: "Hyderabad",
    type: "clinic",
    consultationType: "in-person",
    date: "2026-06-05",
    time: "10:00 AM",
    fee: 450,
    rating: 4.5,
    status: "cancelled",
    reason: "Child Vaccination",
    notes: "Patient cancelled — schedule conflict",
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

function isUpcoming(dateStr) {
  return new Date(dateStr) >= new Date();
}

/* ─── Appointment Details Modal ──────────────────────────────────── */
function AppointmentDetailModal({ appt, onClose }) {
  if (!appt) return null;
  const cfg = STATUS_CONFIG[appt.status];
  return (
    <div
      className="appt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appt-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="appt-modal">
        {/* Header */}
        <div className="appt-modal-header">
          <h2 id="appt-modal-title" className="appt-modal-title">
            Appointment Details
          </h2>
          <button
            className="appt-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimesCircle />
          </button>
        </div>

        {/* Doctor strip */}
        <div className="appt-modal-doctor">
          <div
            className="appt-modal-avatar"
            style={{
              background: `linear-gradient(135deg, ${appt.color}cc, ${appt.color}66)`,
            }}
          >
            {appt.initials}
          </div>
          <div className="appt-modal-doc-info">
            <p className="appt-modal-doc-name">{appt.doctorName}</p>
            <p className="appt-modal-doc-spec">
              <FaStethoscope /> {appt.specialization}
            </p>
          </div>
          <span className={`appt-status-badge ${cfg.colorClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Details grid */}
        <dl className="appt-modal-details">
          <div className="appt-modal-row">
            <dt><FaIdCard /> Appointment ID</dt>
            <dd className="appt-id-mono">{appt.id}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaCalendarAlt /> Date</dt>
            <dd>{formatDate(appt.date)}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaClock /> Time</dt>
            <dd>{appt.time}</dd>
          </div>
          <div className="appt-modal-row">
            <dt>
              {appt.consultationType === "video"
                ? <FaVideo />
                : <FaUserMd />}{" "}
              Type
            </dt>
            <dd>
              {appt.consultationType === "video"
                ? "Video Consultation"
                : "In-Person Visit"}
            </dd>
          </div>
          <div className="appt-modal-row">
            <dt>
              {appt.type === "hospital"
                ? <FaHospital />
                : <FaClinicMedical />}{" "}
              {appt.type === "hospital" ? "Hospital" : "Clinic"}
            </dt>
            <dd>{appt.hospital}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaMapMarkerAlt /> Location</dt>
            <dd>{appt.city}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaCalendarCheck /> Reason</dt>
            <dd>{appt.reason}</dd>
          </div>
          {appt.notes && (
            <div className="appt-modal-row appt-modal-row--full">
              <dt>Notes</dt>
              <dd>{appt.notes}</dd>
            </div>
          )}
          {appt.rejectionReason && (
            <div className="appt-modal-row appt-modal-row--full appt-modal-row--alert">
              <dt><FaTimesCircle /> Rejection Reason</dt>
              <dd>{appt.rejectionReason}</dd>
            </div>
          )}
        </dl>

        {/* Actions */}
        <div className="appt-modal-actions">
          {(appt.status === "pending" || appt.status === "confirmed") && (
            <button className="appt-action-btn appt-action-btn--danger">
              <FaBan /> Cancel Appointment
            </button>
          )}
          {appt.status === "completed" && appt.prescription && (
            <button className="appt-action-btn appt-action-btn--download">
              <FaDownload /> Download Prescription
            </button>
          )}
          {appt.consultationType === "video" &&
            appt.status === "confirmed" &&
            isUpcoming(appt.date) && (
              <button className="appt-action-btn appt-action-btn--video">
                <FaVideo /> Join Consultation
              </button>
            )}
          <button
            className="appt-action-btn appt-action-btn--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single Appointment Card ────────────────────────────────────── */
function AppointmentCard({ appt, onViewDetails, onCancel }) {
  const cfg = STATUS_CONFIG[appt.status];
  const upcoming = isUpcoming(appt.date);
  const isVideo = appt.consultationType === "video";
  const canCancel =
    appt.status === "pending" || appt.status === "confirmed";
  const canJoin =
    isVideo && appt.status === "confirmed" && upcoming;
  const canDownload = appt.status === "completed" && appt.prescription;

  return (
    <article
      className={`appt-card appt-card--${appt.status}`}
      aria-label={`Appointment with ${appt.doctorName}`}
    >
      {/* Status ribbon */}
      <div className={`appt-card-ribbon ${cfg.colorClass}`}>
        {cfg.icon}
        {cfg.label}
      </div>

      {/* Card body */}
      <div className="appt-card-body">
        {/* Doctor info */}
        <div className="appt-card-doctor">
          <div
            className="appt-card-avatar"
            style={{
              background: `linear-gradient(135deg, ${appt.color}cc, ${appt.color}55)`,
            }}
            aria-label={`Photo of ${appt.doctorName}`}
          >
            <span className="appt-avatar-initials">{appt.initials}</span>
          </div>
          <div className="appt-card-identity">
            <h3 className="appt-doctor-name">{appt.doctorName}</h3>
            <p className="appt-specialization">
              <FaStethoscope className="appt-meta-icon" />
              {appt.specialization}
            </p>
            <p className="appt-hospital">
              {appt.type === "hospital" ? (
                <FaHospital className="appt-meta-icon appt-meta-icon--hosp" />
              ) : (
                <FaClinicMedical className="appt-meta-icon appt-meta-icon--clinic" />
              )}
              {appt.hospital}
            </p>
          </div>
        </div>

        {/* Appointment meta */}
        <div className="appt-card-meta">
          <div className="appt-meta-row">
            <FaCalendarAlt className="appt-meta-icon appt-meta-icon--date" />
            <span>{formatDate(appt.date)}</span>
          </div>
          <div className="appt-meta-row">
            <FaClock className="appt-meta-icon appt-meta-icon--time" />
            <span>{appt.time}</span>
          </div>
          <div className="appt-meta-row">
            <FaMapMarkerAlt className="appt-meta-icon appt-meta-icon--loc" />
            <span>{appt.city}</span>
          </div>
          <div className={`appt-consult-type-chip appt-consult-type-chip--${appt.consultationType}`}>
            {isVideo ? (
              <>
                <FaVideo /> Video Consultation
              </>
            ) : (
              <>
                <FaUserMd /> In-Person Visit
              </>
            )}
          </div>
        </div>

        {/* Appointment ID */}
        <div className="appt-id-row">
          <FaIdCard className="appt-meta-icon" />
          <span className="appt-id-label">ID:</span>
          <span className="appt-id-value">{appt.id}</span>
        </div>

        {/* Rejection reason chip */}
        {appt.rejectionReason && (
          <div className="appt-rejection-notice">
            <FaTimesCircle />
            <span>{appt.rejectionReason}</span>
          </div>
        )}
      </div>

      {/* Card actions */}
      <div className="appt-card-actions">
        <button
          className="appt-action-btn appt-action-btn--outline"
          onClick={() => onViewDetails(appt)}
          aria-label={`View details for appointment ${appt.id}`}
        >
          <FaEye /> View Details
        </button>

        {canCancel && (
          <button
            className="appt-action-btn appt-action-btn--danger-outline"
            onClick={() => onCancel(appt.id)}
            aria-label={`Cancel appointment ${appt.id}`}
          >
            <FaBan /> Cancel
          </button>
        )}

        {canJoin && (
          <button
            className="appt-action-btn appt-action-btn--video"
            aria-label="Join video consultation"
          >
            <FaVideo /> Join Now
          </button>
        )}

        {canDownload && (
          <button
            className="appt-action-btn appt-action-btn--download"
            aria-label="Download prescription"
          >
            <FaDownload /> Prescription
          </button>
        )}
      </div>
    </article>
  );
}

/* ─── Summary Stats Bar ──────────────────────────────────────────── */
function AppointmentStats({ data }) {
  const counts = {
    total: data.length,
    pending: data.filter((a) => a.status === "pending").length,
    confirmed: data.filter((a) => a.status === "confirmed").length,
    completed: data.filter((a) => a.status === "completed").length,
    rejected: data.filter((a) => a.status === "rejected").length,
    cancelled: data.filter((a) => a.status === "cancelled").length,
  };
  const stats = [
    { label: "Total", value: counts.total, color: "#0d9488" },
    { label: "Pending", value: counts.pending, color: "#f59e0b" },
    { label: "Confirmed", value: counts.confirmed, color: "#0284c7" },
    { label: "Completed", value: counts.completed, color: "#22c55e" },
    { label: "Rejected", value: counts.rejected, color: "#ef4444" },
    { label: "Cancelled", value: counts.cancelled, color: "#94a3b8" },
  ];
  return (
    <div className="appt-stats-bar">
      {stats.map((s) => (
        <div
          key={s.label}
          className="appt-stat-chip"
          style={{ "--stat-accent": s.color }}
        >
          <span className="appt-stat-val">{s.value}</span>
          <span className="appt-stat-lbl">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Cancel Confirm Dialog ──────────────────────────────────────── */
function CancelConfirmDialog({ apptId, onConfirm, onDismiss }) {
  if (!apptId) return null;
  return (
    <div
      className="appt-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="appt-confirm-dialog">
        <div className="appt-confirm-icon">
          <FaBan />
        </div>
        <h3 id="cancel-dialog-title" className="appt-confirm-title">
          Cancel Appointment?
        </h3>
        <p className="appt-confirm-desc">
          Are you sure you want to cancel appointment{" "}
          <strong>{apptId}</strong>? This action cannot be undone.
        </p>
        <div className="appt-confirm-actions">
          <button
            className="appt-action-btn appt-action-btn--secondary"
            onClick={onDismiss}
          >
            Keep Appointment
          </button>
          <button
            className="appt-action-btn appt-action-btn--danger"
            onClick={() => onConfirm(apptId)}
          >
            <FaBan /> Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page Component ────────────────────────────────────────── */
function PatientAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState(appointmentsData);
  const [detailAppt, setDetailAppt] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  /* Filter by tab + search */
  const filtered = appointments.filter((a) => {
    const matchTab = activeTab === "all" || a.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.doctorName.toLowerCase().includes(q) ||
      a.specialization.toLowerCase().includes(q) ||
      a.hospital.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  /* Cancel logic (UI only) */
  const handleCancelConfirm = (id) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "cancelled" } : a
      )
    );
    setCancelId(null);
  };

  /* Tab counts */
  const tabCount = (key) =>
    key === "all"
      ? appointments.length
      : appointments.filter((a) => a.status === key).length;

  return (
    <div className="appt-page">
      {/* ── Page Header ──────────────────────────────────────── */}
      <header className="appt-page-header">
        <div className="appt-header-text">
          <h1 className="appt-page-title">My Appointments</h1>
          <p className="appt-page-subtitle">
            Track, manage and review all your medical appointments in one place.
          </p>
        </div>
        <button
          className="appt-book-btn"
          onClick={() => navigate("/patient/find-doctors")}
          aria-label="Book a new appointment"
        >
          <FaCalendarCheck />
          Book New Appointment
        </button>
      </header>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <AppointmentStats data={appointments} />

      {/* ── Search ───────────────────────────────────────────── */}
      <div className="appt-search-bar">
        <FaSearch className="appt-search-icon" />
        <input
          id="appt-search-input"
          type="text"
          className="appt-search-input"
          placeholder="Search by doctor name, specialization, hospital, city or appointment ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search appointments"
        />
        {search && (
          <button
            className="appt-search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <FaTimesCircle />
          </button>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="appt-tabs" role="tablist" aria-label="Appointment status filter">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            className={`appt-tab ${activeTab === tab.key ? "appt-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`appt-tab-count ${activeTab === tab.key ? "appt-tab-count--active" : ""}`}
            >
              {tabCount(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content Area ─────────────────────────────────────── */}
      <div
        className="appt-content"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {filtered.length > 0 ? (
          <>
            <p className="appt-result-count">
              Showing <strong>{filtered.length}</strong> appointment
              {filtered.length !== 1 ? "s" : ""}
              {activeTab !== "all" && (
                <span> · {STATUS_CONFIG[activeTab]?.label || "All"}</span>
              )}
            </p>
            <div className="appt-cards-grid">
              {filtered.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  onViewDetails={setDetailAppt}
                  onCancel={(id) => setCancelId(id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="appt-empty-state">
            <div className="appt-empty-icon">
              <FaInbox />
            </div>
            <h3 className="appt-empty-title">No appointments found</h3>
            <p className="appt-empty-desc">
              {search
                ? "No appointments match your search. Try different keywords."
                : "You don't have any appointments in this category yet."}
            </p>
            {search ? (
              <button
                className="appt-empty-btn"
                onClick={() => setSearch("")}
              >
                <FaTimesCircle /> Clear Search
              </button>
            ) : (
              <button
                className="appt-empty-btn"
                onClick={() => navigate("/patient/find-doctors")}
              >
                <FaSearch /> Find a Doctor
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <AppointmentDetailModal
        appt={detailAppt}
        onClose={() => setDetailAppt(null)}
      />
      <CancelConfirmDialog
        apptId={cancelId}
        onConfirm={handleCancelConfirm}
        onDismiss={() => setCancelId(null)}
      />
    </div>
  );
}

export default PatientAppointments;
