import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaVideo,
  FaStethoscope,
  FaHospital,
  FaClinicMedical,
  FaCalendarAlt,
  FaClock,
  FaIdCard,
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientConsultationDetails.css";

const API_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

/* ─── Helpers ────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#0d9488", "#7c3aed", "#0284c7", "#d97706", "#dc2626",
  "#16a34a", "#9333ea", "#0891b2", "#b45309",
];
function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  const clean = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return clean.length === 1 ? clean[0][0]?.toUpperCase() : ((clean[0][0] || "") + (clean[clean.length - 1][0] || "")).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "Date not specified";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseDateTime(dateStr, timeStr) {
  try {
    if (!dateStr) return new Date();
    // Normalize date to YYYY-MM-DD
    const isoDate = new Date(dateStr).toISOString().split("T")[0];
    const [year, month, day] = isoDate.split("-").map(Number);

    if (!timeStr) return new Date(year, month - 1, day, 12, 0, 0);

    const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return new Date(dateStr);

    let [_, hoursStr, minutesStr, ampm] = match;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (e) {
    return new Date();
  }
}

function PatientConsultationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick to evaluate join window in real time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real appointment from database
  useEffect(() => {
    let isMounted = true;

    async function fetchAppointment() {
      if (!id) {
        setLoading(false);
        setError("Invalid consultation reference.");
        return;
      }

      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsUnauthorized(true);
          setError("You must be signed in as a patient to view this consultation.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/patient/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.status === 401 || res.status === 403) {
          setIsUnauthorized(true);
          setError(data.message || "You are not authorized to view this consultation record.");
        } else if (res.status === 404 || !data.success || !data.data) {
          setError(data.message || "Consultation record not found in the database.");
        } else {
          setAppointment(data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to fetch consultation details:", err);
          setError("Unable to connect to server. Please verify your connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAppointment();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Derived real data
  const doctor = appointment?.doctorId || {};
  const hospital = appointment?.hospitalId || {};
  const patient = appointment?.patientId || {};
  const consultation = appointment?.consultation || {};

  const displayId = appointment?.appointmentId || appointment?._id || id;
  const doctorName = doctor.name
    ? (doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`)
    : "Doctor";
  const specialization = doctor.specialization || "Specialist";
  const hospitalName = hospital.name || doctor.hospitalName || doctor.clinicName || "Medical Center";
  const doctorType = String(doctor.practiceType || "hospital").toLowerCase() === "clinic" ? "clinic" : "hospital";
  const doctorPhoto = doctor.profileImage
    ? (doctor.profileImage.startsWith("http") ? doctor.profileImage : `${API_BASE}${doctor.profileImage}`)
    : null;
  const doctorInitials = getInitials(doctorName);
  const doctorColor = getAvatarColor(doctorName);

  const rawType = String(appointment?.type || "").toLowerCase();
  const isOnline = rawType.includes("online") || rawType.includes("video");

  const apptDate = appointment?.date;
  const apptTime = appointment?.timeSlot || appointment?.time || "Scheduled Slot";
  const fee = appointment?.fee ?? doctor.consultationFee ?? 0;

  // Real payment status verification
  const rawPaymentStatus = String(appointment?.paymentStatus || "Pending");
  const isPaid = rawPaymentStatus.toLowerCase() === "paid";
  const isFailed = rawPaymentStatus.toLowerCase() === "failed";
  const paymentColor = isPaid ? "#10b981" : isFailed ? "#ef4444" : "#f59e0b";
  const paymentStatusLabel = isPaid ? "Paid" : isFailed ? "Payment Failed" : "Payment Pending";

  // Patient profile fields
  const patientName = patient.name || "Patient";
  const patientDisplayId = patient.patientId ? `#${patient.patientId}` : (patient._id ? `#${patient._id.slice(-6)}` : "");
  const patientAge = patient.dob
    ? `${Math.floor((new Date() - new Date(patient.dob)) / (365.25 * 24 * 60 * 60 * 1000))} Years`
    : null;
  const patientGender = patient.gender || null;
  const patientAgeGender = [patientAge, patientGender].filter(Boolean).join(", ") || "Not specified";
  const patientPhone = patient.phone || "Not provided";
  const patientEmail = patient.email || "Not provided";
  const reasonText = appointment?.reason || (Array.isArray(appointment?.symptoms) && appointment.symptoms.length ? `Symptoms: ${appointment.symptoms.join(", ")}` : "General online medical consultation.");

  // Duration: actual duration if recorded, or estimated window
  let durationText = "20–30 Mins";
  if (consultation.startedAt && consultation.endedAt) {
    const elapsedMins = Math.round((new Date(consultation.endedAt) - new Date(consultation.startedAt)) / 60000);
    durationText = `${Math.max(1, elapsedMins)} Mins (Actual)`;
  }

  // Real-time Join calculation
  const normStatus = String(appointment?.status || "").toLowerCase();
  let isJoinable = false;
  let joinDisabledReason = "";

  if (!isOnline) {
    joinDisabledReason = "This appointment is scheduled as an in-person clinic/hospital visit.";
  } else if (normStatus === "cancelled") {
    joinDisabledReason = "This appointment has been cancelled.";
  } else if (normStatus === "completed") {
    joinDisabledReason = "This consultation has already been completed.";
  } else if (normStatus === "pending") {
    joinDisabledReason = "Appointment is awaiting doctor confirmation.";
  } else if (normStatus === "in-progress") {
    isJoinable = true;
  } else if (normStatus === "confirmed") {
    const apptDateTime = parseDateTime(apptDate, apptTime);
    const diffMs = apptDateTime - currentTime;
    // Window: 5 mins before start time up to 45 mins after start time
    if (diffMs > 5 * 60 * 1000) {
      const minsLeft = Math.ceil((diffMs - 5 * 60 * 1000) / 60000);
      joinDisabledReason = `Join button activates 5 minutes before scheduled start time (in ~${minsLeft} min${minsLeft === 1 ? "" : "s"}).`;
    } else if (diffMs < -45 * 60 * 1000) {
      joinDisabledReason = "The scheduled consultation time window has passed.";
    } else {
      isJoinable = true;
    }
  }

  // Status badge config
  const getStatusBadge = () => {
    switch (normStatus) {
      case "confirmed":
        return isJoinable
          ? { label: "Ready to Join", badgeClass: "oc-status-badge--ready" }
          : { label: "Confirmed", badgeClass: "oc-status-badge--confirmed" };
      case "in-progress":
        return { label: "In-Progress", badgeClass: "oc-status-badge--ready" };
      case "completed":
        return { label: "Completed", badgeClass: "oc-status-badge--completed" };
      case "cancelled":
        return { label: "Cancelled", badgeClass: "oc-status-badge--pending" };
      case "pending":
      default:
        return { label: "Pending Approval", badgeClass: "oc-status-badge--pending" };
    }
  };
  const statusCfg = getStatusBadge();

  // Handle Join Navigation
  const handleJoinCall = () => {
    if (!isJoinable || !appointment) return;
    navigate(`/patient/consultation/${appointment._id || id}/room`);
  };

  // Only auto-join if explicitly requested via query parameter AND is verified joinable
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("join") === "true" && isJoinable && appointment) {
      handleJoinCall();
    }
  }, [location.search, isJoinable, appointment]);

  /* ── Loading State ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="ocd-page">
        <header className="ocd-header">
          <button className="ocd-back-btn" onClick={() => navigate("/patient/consultation")} aria-label="Go back">
            <FaArrowLeft />
          </button>
          <div className="ocd-title-area">
            <h1 className="ocd-title">Consultation Details</h1>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--text-secondary)" }}>
          <FaSpinner className="ocr-spin" style={{ fontSize: "2.2rem", color: "#0d9488", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.05rem", fontWeight: 600 }}>Loading consultation record from database...</p>
        </div>
      </div>
    );
  }

  /* ── Error / Not Found / Unauthorized State ─────────────────── */
  if (error || !appointment) {
    return (
      <div className="ocd-page">
        <header className="ocd-header">
          <button className="ocd-back-btn" onClick={() => navigate("/patient/consultation")} aria-label="Go back">
            <FaArrowLeft />
          </button>
          <div className="ocd-title-area">
            <h1 className="ocd-title">Consultation Details</h1>
          </div>
        </header>
        <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
          <FaExclamationCircle style={{ fontSize: "2.75rem", color: "#ef4444", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            {isUnauthorized ? "Unauthorized Access" : "Consultation Record Not Found"}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.75rem", maxWidth: "480px", margin: "0 auto 1.75rem" }}>
            {error || "Unable to locate this consultation in your authenticated account records."}
          </p>
          <button className="ocd-btn ocd-btn--back" onClick={() => navigate("/patient/consultation")}>
            Back to Consultations
          </button>
        </div>
      </div>
    );
  }

  /* ── Real Data View ────────────────────────────────────────── */
  return (
    <div className="ocd-page">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="ocd-header">
        <button className="ocd-back-btn" onClick={() => navigate("/patient/consultation")} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <div className="ocd-title-area">
          <h1 className="ocd-title">Consultation Details</h1>
          <span className="ocd-id-badge">{displayId}</span>
          <span className={`oc-status-badge ${statusCfg.badgeClass}`} style={{ marginLeft: "0.5rem" }}>
            {statusCfg.label}
          </span>
        </div>
      </header>

      {/* ── Body Grid ──────────────────────────────────────────── */}
      <div className="ocd-body-grid">
        {/* Left Column: Doctor & Appointment Info */}
        <div className="ocd-card">
          <h2 className="ocd-card-title">
            <FaUserCircle /> Doctor & Appointment Info
          </h2>

          <div className="ocd-doctor-strip">
            {!imageError && doctorPhoto ? (
              <img
                src={doctorPhoto}
                alt={doctorName}
                className="ocd-doc-avatar-img"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="ocd-doc-avatar-fallback"
                style={{ background: `linear-gradient(135deg, ${doctorColor}cc, ${doctorColor}66)` }}
              >
                {doctorInitials}
              </div>
            )}
            <div className="ocd-doc-details">
              <h3 className="ocd-doc-name">{doctorName}</h3>
              <p className="ocd-doc-spec">
                <FaStethoscope /> {specialization}
              </p>
              <p className="ocd-doc-hosp">
                {doctorType === "clinic" ? <FaClinicMedical /> : <FaHospital />} {hospitalName}
              </p>
            </div>
          </div>

          <dl className="ocd-details-list">
            <div className="ocd-details-row">
              <dt><FaCalendarAlt /> Date</dt>
              <dd>{formatDate(apptDate)}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaClock /> Time</dt>
              <dd>{apptTime}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaClock /> Expected Duration</dt>
              <dd>{durationText}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaVideo /> Consultation Type</dt>
              <dd style={{ color: isOnline ? "#0d9488" : "var(--text-primary)" }}>
                {isOnline ? "Secure Video Consultation" : (appointment.type || "In-Person Visit")}
              </dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaRupeeSign /> Consultation Fee</dt>
              <dd>₹{fee}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaCheckCircle /> Payment Status</dt>
              <dd style={{ color: paymentColor, fontWeight: 600 }}>{paymentStatusLabel}</dd>
            </div>
          </dl>
        </div>

        {/* Right Column: Patient Profile & Reason */}
        <div className="ocd-card">
          <h2 className="ocd-card-title">
            <FaIdCard /> Patient Information
          </h2>

          <div className="ocd-patient-profile">
            <div className="ocd-patient-avatar">
              <FaUserCircle />
            </div>
            <div className="ocd-patient-info">
              <h3 className="ocd-patient-name">{patientName}</h3>
              {patientDisplayId && <span className="ocd-patient-id">{patientDisplayId}</span>}
            </div>
          </div>

          <dl className="ocd-details-list" style={{ marginBottom: "1rem" }}>
            <div className="ocd-details-row">
              <dt>Age & Gender</dt>
              <dd>{patientAgeGender}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaPhoneAlt /> Phone</dt>
              <dd>{patientPhone}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaEnvelope /> Email</dt>
              <dd>{patientEmail}</dd>
            </div>
          </dl>

          <div className="ocd-reason-box">
            <h4 className="ocd-reason-title">Reason for Consultation:</h4>
            <p>{reasonText}</p>
          </div>
        </div>
      </div>

      {/* ── Actions Footer ─────────────────────────────────────── */}
      <div className="ocd-actions-footer">
        <button className="ocd-btn ocd-btn--back" onClick={() => navigate("/patient/consultation")}>
          Back to List
        </button>

        {isJoinable ? (
          <button className="ocd-btn ocd-btn--join-active" onClick={handleJoinCall}>
            <FaVideo /> Join Video Consultation
          </button>
        ) : (
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
            <button className="ocd-btn ocd-btn--join-disabled" disabled title={joinDisabledReason}>
              <FaVideo /> Join Video Consultation
            </button>
            {joinDisabledReason && (
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                {joinDisabledReason}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientConsultationDetails;
