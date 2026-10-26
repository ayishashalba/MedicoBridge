import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaEye,
  FaPhoneAlt,
  FaFileMedical,
  FaCheckCircle,
  FaTimesCircle,
  FaHashtag,
  FaSyncAlt,
  FaSpinner,
  FaLock,
} from "react-icons/fa";
import "./DoctorConsultation.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/* ─── Helpers ────────────────────────────────────────────────── */

/**
 * Parse appointment date + timeSlot from MongoDB into a real JS Date.
 * timeSlot formats: "10:30 AM", "14:00", "09:00 AM - 09:30 AM", etc.
 */
function parseAppointmentDateTime(dateInput, timeSlotInput) {
  let base;
  if (dateInput instanceof Date) {
    base = new Date(dateInput);
  } else {
    base = new Date(dateInput);
  }
  if (isNaN(base.getTime())) return null;

  const year = base.getFullYear();
  const month = base.getMonth();
  const day = base.getDate();

  let hours = 0;
  let minutes = 0;

  if (timeSlotInput && typeof timeSlotInput === "string") {
    // If range "09:00 AM - 09:30 AM", take start time
    const startPart = timeSlotInput.split("-")[0].trim();
    const match = startPart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Deterministic avatar color from a name/id string.
 */
const AVATAR_COLORS = [
  "#0d9488", "#7c3aed", "#0284c7", "#d97706", "#dc2626",
  "#16a34a", "#9333ea", "#0891b2", "#b45309", "#0f766e",
];
function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Get uppercase initials from a full name.
 */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format a MongoDB date as "Mon DD, YYYY".
 */
function formatDate(dateInput) {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Format the display appointment ID.
 */
function formatApptId(appt) {
  if (appt.appointmentId) return appt.appointmentId;
  return `APT-${String(appt._id).slice(-6).toUpperCase()}`;
}

/**
 * Compute live timing status from real appointment data + current time.
 * Returns same shape as the old getTodayConsultationStatus.
 */
function computeTimeStatus(appt, now) {
  // 1. COMPLETED
  if (appt.status === "Completed") {
    return {
      badgeLabel: "Completed",
      badgeClass: "dc-status--completed",
      canJoin: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: true,
      isCancelled: false,
    };
  }

  // 2. CANCELLED
  if (appt.status === "Cancelled") {
    return {
      badgeLabel: "Cancelled",
      badgeClass: "dc-status--cancelled",
      canJoin: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
    };
  }

  // 3. IN-PROGRESS (backend status)
  if (appt.status === "In-Progress") {
    return {
      badgeLabel: "Ongoing",
      badgeClass: "dc-status--ongoing",
      canJoin: true,
      isReady: false,
      isOngoing: true,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: false,
      buttonText: "Join Consultation",
    };
  }

  // For Pending / Confirmed — derive from time
  const apptDate = parseAppointmentDateTime(appt.date, appt.timeSlot);
  if (!apptDate) {
    // Can't parse time; show as upcoming
    return {
      badgeLabel: "Upcoming",
      badgeClass: "dc-status--upcoming",
      canJoin: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: true,
      isCompleted: false,
      isCancelled: false,
    };
  }

  const diffMs = apptDate.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const durationMs = (appt.durationMinutes || 30) * 60 * 1000;
  const endMs = apptDate.getTime() + durationMs;

  // Past appointment window → treat as if missed/cancelled unless explicitly set
  if (now.getTime() > endMs) {
    return {
      badgeLabel: "Cancelled",
      badgeClass: "dc-status--cancelled",
      canJoin: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
    };
  }

  // Within appointment window (started but not ended)
  if (diffSeconds <= 0 && now.getTime() <= endMs) {
    return {
      badgeLabel: "Ongoing",
      badgeClass: "dc-status--ongoing",
      canJoin: true,
      isReady: false,
      isOngoing: true,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: false,
      buttonText: "Join Consultation",
    };
  }

  // Within 2-minute pre-join window
  if (diffSeconds <= 120) {
    return {
      badgeLabel: "Starting Soon",
      badgeClass: "dc-status--ready",
      canJoin: true,
      isReady: true,
      isOngoing: false,
      isUpcoming: true,
      isCompleted: false,
      isCancelled: false,
      diffSeconds,
      buttonText: "Join Consultation",
      timeNotice: `Starts in ${diffSeconds}s`,
    };
  }

  // Future appointment
  return {
    badgeLabel: "Upcoming",
    badgeClass: "dc-status--upcoming",
    canJoin: false,
    isReady: false,
    isOngoing: false,
    isUpcoming: true,
    isCompleted: false,
    isCancelled: false,
    diffSeconds,
  };
}

/* ─── Consultation Card ──────────────────────────────────────── */
function ConsultationCard({ item, timeStatus, onJoin, onDetails, onPrescription }) {
  const { isReady, isOngoing, canJoin } = timeStatus;

  const cardClass = `dc-card ${
    isReady
      ? "dc-card--ready"
      : isOngoing
      ? "dc-card--ongoing"
      : timeStatus.isCancelled
      ? "dc-card--cancelled"
      : timeStatus.isCompleted
      ? "dc-card--completed"
      : "dc-card--upcoming"
  }`;

  return (
    <div className={cardClass}>
      {/* ── Card Header ─────────────────────────── */}
      <div className="dc-card-header">
        <div className="dc-avatar" style={{ background: item.avatarColor }}>
          {item.initials}
        </div>
        <div className="dc-card-header-info">
          <h3 className="dc-patient-name">{item.patient}</h3>
          <span className="dc-appt-id">
            <FaHashtag /> {item.appointmentId}
          </span>
        </div>
        <span className={`dc-status-badge ${timeStatus.badgeClass}`}>
          {(isReady || isOngoing) && <span className="live-dot" />}
          {timeStatus.isCompleted && <FaCheckCircle />}
          {timeStatus.isCancelled && <FaTimesCircle />}
          {timeStatus.badgeLabel}
        </span>
      </div>

      {/* ── Card Meta ───────────────────────────── */}
      <div className="dc-card-meta">
        <div className="dc-meta-item">
          <FaCalendarAlt />
          <span>{item.date}</span>
        </div>
        <div className="dc-meta-item">
          <FaClock />
          <span>{item.time}</span>
        </div>
        <div className="dc-meta-item">
          <FaVideo />
          <span>{item.type}</span>
        </div>
      </div>

      {/* ── Complaint ───────────────────────────── */}
      <div className="dc-complaint">
        <span className="dc-complaint-label">Chief Complaint</span>
        <span className="dc-complaint-text">
          {item.complaint || <em style={{ opacity: 0.5 }}>Not Provided</em>}
        </span>
      </div>

      {/* ── Action Buttons ──────────────────────── */}
      <div className="dc-card-actions">
        <button
          className={`dc-btn dc-btn--details ${timeStatus.isCancelled ? "dc-btn--full" : ""}`}
          onClick={() => onDetails(item._id)}
        >
          <FaEye />
          View Details
        </button>

        {/* 2 minutes before or ongoing: Join enabled */}
        {canJoin && (
          <button
            className={`dc-btn dc-btn--join ${isReady ? "dc-btn--ready-pulse" : ""}`}
            onClick={() => onJoin(item._id)}
          >
            <FaPhoneAlt />
            {timeStatus.buttonText || "Join Consultation"}
          </button>
        )}

        {/* Before pre-join window: locked with time */}
        {timeStatus.isUpcoming && !canJoin && (
          <button
            className="dc-btn dc-btn--locked"
            disabled
            title={`Join Consultation unlocks 2 minutes before scheduled start time (${item.time})`}
          >
            <FaLock />
            Starts at {item.time}
          </button>
        )}

        {/* Completed: View Prescription */}
        {timeStatus.isCompleted && (
          <button
            className="dc-btn dc-btn--rx"
            onClick={() => onPrescription(item._id, item.prescriptionId)}
          >
            <FaFileMedical />
            View Prescription
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function DoctorConsultation() {
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ── Fetch real online consultations from backend ── */
  const fetchConsultations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/doctor/appointments?type=online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      const raw = data?.data?.appointments || [];

      // Normalise to card shape
      const normalized = raw.map((appt) => {
        const patientName = appt.patientId?.name || "Unknown Patient";
        return {
          _id: appt._id,
          appointmentId: formatApptId(appt),
          patient: patientName,
          patientId: appt.patientId?.patientId
            ? `#${appt.patientId.patientId}`
            : `#PT-${String(appt.patientId?._id || "").slice(-5).toUpperCase()}`,
          initials: getInitials(patientName),
          avatarColor: getAvatarColor(patientName + String(appt._id)),
          date: formatDate(appt.date),
          time: appt.timeSlot || "—",
          type: "Video",
          complaint:
            appt.reason ||
            (appt.symptoms && appt.symptoms.length > 0
              ? appt.symptoms.join(", ")
              : ""),
          status: appt.status,
          // raw date for timer calculations
          _rawDate: appt.date,
          _rawTimeSlot: appt.timeSlot,
          durationMinutes: appt.durationMinutes || 30,
          prescriptionId: appt.prescriptionId || null,
          consultation: appt.consultation || null,
          meetingLink: appt.meetingLink || "",
        };
      });

      setConsultations(normalized);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch consultations:", err);
      setError("Failed to load consultations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  /* 2-second tick for live countdown/status — no network call */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 2000);
    return () => clearInterval(timer);
  }, []);

  /* ── Compute time-statuses for all cards ── */
  const consultationsWithStatus = useMemo(() => {
    return consultations.map((item) => ({
      item,
      timeStatus: computeTimeStatus(
        { ...item, date: item._rawDate, timeSlot: item._rawTimeSlot },
        currentTime
      ),
    }));
  }, [consultations, currentTime]);

  /* ── Search + Filter ── */
  const filtered = useMemo(() => {
    return consultationsWithStatus.filter(({ item, timeStatus }) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.patient.toLowerCase().includes(q) ||
        item.appointmentId.toLowerCase().includes(q) ||
        (item.complaint && item.complaint.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "ready") return timeStatus.isReady;
      if (activeFilter === "ongoing") return timeStatus.isOngoing;
      if (activeFilter === "upcoming") return timeStatus.isUpcoming && !timeStatus.isReady;
      if (activeFilter === "completed") return timeStatus.isCompleted;
      if (activeFilter === "cancelled") return timeStatus.isCancelled;
      return true;
    });
  }, [consultationsWithStatus, search, activeFilter]);

  /* ── Counts ── */
  const counts = useMemo(() => {
    const res = { all: consultationsWithStatus.length, ready: 0, ongoing: 0, upcoming: 0, completed: 0, cancelled: 0 };
    consultationsWithStatus.forEach(({ timeStatus }) => {
      if (timeStatus.isReady) res.ready++;
      if (timeStatus.isOngoing) res.ongoing++;
      if (timeStatus.isUpcoming && !timeStatus.isReady) res.upcoming++;
      if (timeStatus.isCompleted) res.completed++;
      if (timeStatus.isCancelled) res.cancelled++;
    });
    return res;
  }, [consultationsWithStatus]);

  /* ── Handlers ── */
  const handleJoin = (id) => navigate(`/doctor/consultation-room/${id}`);
  const handleDetails = (id) => navigate(`/doctor/appointments/${id}`);
  const handlePrescription = (id, prescriptionId) =>
    navigate(`/doctor/prescriptions/${prescriptionId || id}`);

  const handleRefresh = () => {
    setLoading(true);
    setCurrentTime(new Date());
    fetchConsultations();
  };

  /* ─── Render ─────────────────────────────────────────────────── */
  return (
    <div className="dc-page">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="dc-header">
        <div className="dc-header-text">
          <h1 className="dc-page-title">
            <FaVideo className="dc-title-icon" />
            Online Consultations
          </h1>
          <p className="dc-page-subtitle">
            Virtual consultation schedule &mdash;{" "}
            <strong>{counts.all}</strong> appointments
          </p>
        </div>
        <button
          className="dc-refresh-btn"
          title="Refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? <FaSpinner className="dc-spin" /> : <FaSyncAlt />}
          Refresh
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────── */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem 1.1rem",
            color: "#b91c1c",
            fontSize: "0.87rem",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Controls Row ─────────────────────────────── */}
      <div className="dc-controls">
        {/* Search */}
        <div className="dc-search">
          <FaSearch className="dc-search-icon" />
          <input
            type="text"
            placeholder="Search patient, appointment ID or complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="dc-search-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="dc-filters">
          <FaFilter className="dc-filter-icon" />
          {[
            { key: "all",       label: "All",           count: counts.all },
            { key: "ready",     label: "Ready to Join",  count: counts.ready },
            { key: "ongoing",   label: "Ongoing",        count: counts.ongoing },
            { key: "upcoming",  label: "Upcoming",       count: counts.upcoming },
            { key: "completed", label: "Completed",      count: counts.completed },
            { key: "cancelled", label: "Cancelled",      count: counts.cancelled },
          ].map((f) => (
            <button
              key={f.key}
              className={`dc-filter-btn ${activeFilter === f.key ? "dc-filter-btn--active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
              <span className="dc-filter-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Consultations Grid ───────────────────────── */}
      {loading ? (
        <div className="dc-empty">
          <FaSpinner className="dc-empty-icon dc-spin" />
          <h3>Loading consultations…</h3>
          <p>Fetching your online consultation schedule.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dc-empty">
          <FaVideo className="dc-empty-icon" />
          <h3>No consultations found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="dc-grid">
          {filtered.map(({ item, timeStatus }) => (
            <ConsultationCard
              key={item._id}
              item={item}
              timeStatus={timeStatus}
              onJoin={handleJoin}
              onDetails={handleDetails}
              onPrescription={handlePrescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorConsultation;
