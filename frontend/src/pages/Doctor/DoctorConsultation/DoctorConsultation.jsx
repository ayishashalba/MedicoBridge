import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaFilter,
  FaEye,
  FaPhoneAlt,
  FaFileMedical,
  FaCircle,
  FaSpinner,
  FaCheckCircle,
  FaHashtag,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./DoctorConsultation.css";
import {
  doctorAppointmentsList,
  getTodayConsultationStatus,
  getJoinedConsultations,
} from "../../../services/doctorAppointmentsData";

/* ─── Static Consultations List ──────────────────────────────── */
const initialConsultations = [
  {
    id: "1",
    patient: "Rahul Nair",
    initials: "RN",
    avatarColor: "#0d9488",
    patientId: "PT-1024",
    appointmentId: "APT-2041",
    date: "July 12, 2026",
    time: "10:00 AM",
    type: "Video",
    status: "Today",
    complaint: "Type 2 Diabetes Mellitus Follow-up",
  },
  {
    id: "2",
    patient: "Anjali Thomas",
    initials: "AT",
    avatarColor: "#7c3aed",
    patientId: "PT-1031",
    appointmentId: "APT-2042",
    date: "July 15, 2026",
    time: "02:30 PM",
    type: "Video",
    status: "Upcoming",
    complaint: "Chronic Migraine Review",
  },
  {
    id: "3",
    patient: "Arun Kumar",
    initials: "AK",
    avatarColor: "#0284c7",
    patientId: "PT-1018",
    appointmentId: "APT-2043",
    date: "July 10, 2026",
    time: "11:15 AM",
    type: "Video",
    status: "Completed",
    complaint: "Hypertension Check",
  },
  {
    id: "4",
    patient: "Meera Pillai",
    initials: "MP",
    avatarColor: "#d97706",
    patientId: "PT-1045",
    appointmentId: "APT-2044",
    date: "July 18, 2026",
    time: "09:00 AM",
    type: "Video",
    status: "Upcoming",
    complaint: "Thyroid Follow-up",
  },
  {
    id: "5",
    patient: "Suresh Babu",
    initials: "SB",
    avatarColor: "#dc2626",
    patientId: "PT-1052",
    appointmentId: "APT-2045",
    date: "July 8, 2026",
    time: "04:00 PM",
    type: "Video",
    status: "Cancelled",
    complaint: "Post-Surgery Cardiac Review",
  },
  {
    id: "6",
    patient: "Lakshmi Nair",
    initials: "LN",
    avatarColor: "#059669",
    patientId: "PT-1060",
    appointmentId: "APT-2046",
    date: "July 12, 2026",
    time: "02:00 PM",
    type: "Video",
    status: "Today",
    complaint: "Migraine Consultation",
  },
];

/* ─── Consultation Card ──────────────────────────────────────── */
function ConsultationCard({ item, timeStatus, onJoin, onDetails, onPrescription }) {
  const isReady = timeStatus.isReady;
  const isOngoing = timeStatus.isOngoing;
  const isNeedsAttention = timeStatus.isNeedsAttention;
  const canJoin = timeStatus.canJoin;

  return (
    <div
      className={`dc-card ${
        isReady
          ? "dc-card--ready"
          : isOngoing
          ? "dc-card--ongoing"
          : isNeedsAttention
          ? "dc-card--attention"
          : timeStatus.isCompleted
          ? "dc-card--completed"
          : "dc-card--upcoming"
      }`}
    >
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
          {isReady && <span className="live-dot" />}
          {isOngoing && <span className="live-dot" />}
          {isNeedsAttention && <FaExclamationTriangle />}
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
        <span className="dc-complaint-text">{item.complaint}</span>
      </div>

      {/* ── Action Buttons ──────────────────────── */}
      <div className="dc-card-actions">
        <button
          className={`dc-btn dc-btn--details ${!canJoin && !timeStatus.isCompleted ? "dc-btn--full" : ""}`}
          onClick={() => onDetails(item.id)}
        >
          <FaEye />
          View Details
        </button>

        {canJoin && (
          <button
            className={`dc-btn dc-btn--join ${isReady ? "dc-btn--ready-pulse" : ""}`}
            onClick={() => onJoin(item.id)}
          >
            <FaPhoneAlt />
            {timeStatus.buttonText || "Join Consultation"}
          </button>
        )}

        {timeStatus.isCompleted && (
          <button
            className="dc-btn dc-btn--rx"
            onClick={() => onPrescription(item.id)}
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
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinedMap, setJoinedMap] = useState(getJoinedConsultations());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setJoinedMap(getJoinedConsultations());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute status for all consultations
  const consultationsWithStatus = useMemo(() => {
    return initialConsultations.map((item) => ({
      item,
      timeStatus: getTodayConsultationStatus(item, currentTime, joinedMap),
    }));
  }, [currentTime, joinedMap]);

  const filtered = useMemo(() => {
    return consultationsWithStatus.filter(({ item, timeStatus }) => {
      const matchSearch =
        item.patient.toLowerCase().includes(search.toLowerCase()) ||
        item.appointmentId.toLowerCase().includes(search.toLowerCase()) ||
        item.complaint.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "ready") return timeStatus.isReady;
      if (activeFilter === "ongoing") return timeStatus.isOngoing;
      if (activeFilter === "upcoming") return timeStatus.isUpcoming;
      if (activeFilter === "completed") return timeStatus.isCompleted;
      return true;
    });
  }, [consultationsWithStatus, search, activeFilter]);

  const counts = useMemo(() => {
    const res = {
      all: consultationsWithStatus.length,
      ready: 0,
      ongoing: 0,
      upcoming: 0,
      completed: 0,
    };
    consultationsWithStatus.forEach(({ timeStatus }) => {
      if (timeStatus.isReady) res.ready++;
      if (timeStatus.isOngoing) res.ongoing++;
      if (timeStatus.isUpcoming) res.upcoming++;
      if (timeStatus.isCompleted) res.completed++;
    });
    return res;
  }, [consultationsWithStatus]);

  const handleJoin = (id) => navigate(`/doctor/consultation-room/${id}`);
  const handleDetails = (id) => navigate(`/doctor/appointments/${id}`);
  const handlePrescription = (id) => navigate(`/doctor/prescriptions/${id}`);

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
          onClick={() => {
            setCurrentTime(new Date());
            setJoinedMap(getJoinedConsultations());
          }}
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

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
            { key: "all", label: "All", count: counts.all },
            { key: "ready", label: "Ready to Join", count: counts.ready },
            { key: "ongoing", label: "Ongoing", count: counts.ongoing },
            { key: "upcoming", label: "Upcoming", count: counts.upcoming },
            { key: "completed", label: "Completed", count: counts.completed },
          ].map((f) => (
            <button
              key={f.key}
              className={`dc-filter-btn ${
                activeFilter === f.key ? "dc-filter-btn--active" : ""
              }`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
              <span className="dc-filter-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Consultations Grid ───────────────────────── */}
      {filtered.length === 0 ? (
        <div className="dc-empty">
          <FaVideo className="dc-empty-icon" />
          <h3>No consultations found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="dc-grid">
          {filtered.map(({ item, timeStatus }) => (
            <ConsultationCard
              key={item.id}
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
