import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
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
  FaPhoneSlash,
  FaCheckCircle,
} from "react-icons/fa";
import "./PatientConsultationDetails.css";

/* ─── Status Configuration ────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending Approval",
    badgeClass: "oc-status-badge--pending",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "oc-status-badge--confirmed",
  },
  ready: {
    label: "Ready to Join",
    badgeClass: "oc-status-badge--ready",
  },
};

/* ─── Extended Dummy Data ─────────────────────────────────────────── */
const consultationsData = {
  "MC-CON-101": {
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
    fee: 800,
    duration: "30 Mins",
    reason: "Experiencing mild chest discomfort and shortness of breath after exercise. Need a routine consultation.",
    patientName: "John Doe",
    patientId: "#PT-20041",
    patientAge: "30 Years",
    patientGender: "Male",
    patientPhone: "+91 98765 43210",
    patientEmail: "john.doe@example.com"
  },
  "MC-CON-102": {
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
    fee: 700,
    duration: "20 Mins",
    reason: "Follow-up for knee joint pain. MRI reports have been uploaded to medical records.",
    patientName: "John Doe",
    patientId: "#PT-20041",
    patientAge: "30 Years",
    patientGender: "Male",
    patientPhone: "+91 98765 43210",
    patientEmail: "john.doe@example.com"
  },
  // Default fallback data
  "default": {
    id: "MC-CON-000",
    doctorName: "Dr. Unknown",
    specialization: "General Physician",
    hospital: "Medico Clinic",
    type: "clinic",
    date: "2026-01-01",
    time: "12:00 PM",
    status: "pending",
    doctorPhoto: "",
    initials: "DR",
    fee: 500,
    duration: "15 Mins",
    reason: "General Checkup",
    patientName: "John Doe",
    patientId: "#PT-20041",
    patientAge: "30 Years",
    patientGender: "Male",
    patientPhone: "+91 98765 43210",
    patientEmail: "john.doe@example.com"
  }
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PatientConsultationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  const data = consultationsData[id] || consultationsData["MC-CON-101"]; // Fallback if not mapped
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.pending;
  const isJoinable = data.status === "ready" || data.status === "confirmed";

  // Check if we navigated here with ?join=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("join") === "true" && isJoinable) {
      handleJoinCall();
    }
  }, [location.search, isJoinable]);

  const handleJoinCall = () => {
    navigate(`/patient/consultation/${id}/room`);
  };

  return (
    <div className="ocd-page">


      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="ocd-header">
        <button className="ocd-back-btn" onClick={() => navigate("/patient/consultation")} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <div className="ocd-title-area">
          <h1 className="ocd-title">Consultation Details</h1>
          <span className="ocd-id-badge">{data.id}</span>
          <span className={`oc-status-badge ${config.badgeClass}`} style={{ marginLeft: "0.5rem" }}>
            {config.label}
          </span>
        </div>
      </header>

      {/* ── Body Grid ──────────────────────────────────────────────── */}
      <div className="ocd-body-grid">
        
        {/* Left Column: Doctor & Appointment Info */}
        <div className="ocd-card">
          <h2 className="ocd-card-title">
            <FaUserCircle /> Doctor & Appointment Info
          </h2>
          
          <div className="ocd-doctor-strip">
            {!imageError && data.doctorPhoto ? (
              <img
                src={data.doctorPhoto}
                alt={data.doctorName}
                className="ocd-doc-avatar-img"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="ocd-doc-avatar-fallback" style={{ background: `linear-gradient(135deg, ${data.color || "#0d9488"}cc, ${data.color || "#0d9488"}66)` }}>
                {data.initials}
              </div>
            )}
            <div className="ocd-doc-details">
              <h3 className="ocd-doc-name">{data.doctorName}</h3>
              <p className="ocd-doc-spec">
                <FaStethoscope /> {data.specialization}
              </p>
              <p className="ocd-doc-hosp">
                {data.type === "hospital" ? <FaHospital /> : <FaClinicMedical />} {data.hospital}
              </p>
            </div>
          </div>

          <dl className="ocd-details-list">
            <div className="ocd-details-row">
              <dt><FaCalendarAlt /> Date</dt>
              <dd>{formatDate(data.date)}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaClock /> Time</dt>
              <dd>{data.time}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaClock /> Expected Duration</dt>
              <dd>{data.duration}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaVideo /> Consultation Type</dt>
              <dd style={{ color: "#0d9488" }}>Secure Video Consultation</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaRupeeSign /> Consultation Fee</dt>
              <dd>₹{data.fee}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaCheckCircle /> Payment Status</dt>
              <dd style={{ color: "#10b981" }}>Paid</dd>
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
              <h3 className="ocd-patient-name">{data.patientName}</h3>
              <span className="ocd-patient-id">{data.patientId}</span>
            </div>
          </div>

          <dl className="ocd-details-list" style={{ marginBottom: "1rem" }}>
            <div className="ocd-details-row">
              <dt>Age & Gender</dt>
              <dd>{data.patientAge}, {data.patientGender}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaPhoneAlt /> Phone</dt>
              <dd>{data.patientPhone}</dd>
            </div>
            <div className="ocd-details-row">
              <dt><FaEnvelope /> Email</dt>
              <dd>{data.patientEmail}</dd>
            </div>
          </dl>

          <div className="ocd-reason-box">
            <h4 className="ocd-reason-title">Reason for Consultation:</h4>
            <p>{data.reason}</p>
          </div>
        </div>

      </div>

      {/* ── Actions Footer ─────────────────────────────────────────── */}
      <div className="ocd-actions-footer">
        <button className="ocd-btn ocd-btn--back" onClick={() => navigate("/patient/consultation")}>
          Back to List
        </button>
        
        {isJoinable ? (
          <button className="ocd-btn ocd-btn--join-active" onClick={handleJoinCall}>
            <FaVideo /> Join Video Consultation
          </button>
        ) : (
          <button className="ocd-btn ocd-btn--join-disabled" disabled>
            <FaVideo /> Join Video Consultation
          </button>
        )}
      </div>

    </div>
  );
}

export default PatientConsultationDetails;
