import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaBirthdayCake,
  FaVenusMars,
  FaTint,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaRuler,
  FaWeight,
  FaAllergies,
  FaHeartbeat,
  FaPills,
  FaCalendarAlt,
  FaCalendarCheck,
  FaHistory,
  FaFileMedical,
  FaNotesMedical,
  FaVideo,
  FaIdBadge,
  FaCheckCircle,
  FaStethoscope,
  FaClock,
} from "react-icons/fa";
import "./DoctorPatientDetails.css";

/* ─── Static Dummy Data ───────────────────────────────────────── */
const patientData = {
  id: "PT-1024",
  name: "Rahul Nair",
  age: 32,
  gender: "Male",
  bloodGroup: "B+",
  phone: "+91 9876543210",
  email: "rahul.nair@gmail.com",
  address: "14/B, Green Valley Apartments, Indiranagar, Bengaluru – 560038",
  emergencyContact: {
    name: "Priya Nair",
    relation: "Spouse",
    phone: "+91 9845023456",
  },
  height: "175 cm",
  weight: "72 kg",
  bmi: "23.5",
  allergies: ["Penicillin", "Dust", "Pollen"],
  medicalConditions: ["Type 2 Diabetes (managed)", "Mild Hypertension"],
  currentMedications: [
    { name: "Metformin 500 mg", frequency: "Twice daily", since: "Jan 2024" },
    { name: "Amlodipine 5 mg", frequency: "Once daily", since: "Mar 2024" },
    { name: "Aspirin 75 mg", frequency: "Once daily", since: "Mar 2024" },
  ],
  lastVisit: "June 28, 2026",
  upcomingAppointment: {
    date: "July 15, 2026",
    time: "10:30 AM",
    type: "In-Person",
    reason: "Quarterly Diabetes Review",
  },
  medicalHistorySummary:
    "Patient has a 4-year history of Type 2 Diabetes, currently well-controlled with oral hypoglycemics. Mild hypertension diagnosed in 2024, managed with Amlodipine. No prior surgeries. Occasional seasonal allergies. Last HbA1c: 6.8% (June 2026). Blood pressure stable at 128/84 mmHg. No cardiac events or hospitalisations reported.",
  recentPrescriptions: [
    {
      id: "RX-4521",
      date: "June 28, 2026",
      diagnosis: "Type 2 Diabetes – Routine Follow-up",
      medications: ["Metformin 500 mg", "Amlodipine 5 mg"],
      status: "active",
    },
    {
      id: "RX-4189",
      date: "March 10, 2026",
      diagnosis: "Hypertension Management",
      medications: ["Amlodipine 5 mg", "Aspirin 75 mg"],
      status: "completed",
    },
    {
      id: "RX-3877",
      date: "December 5, 2025",
      diagnosis: "Seasonal Allergic Rhinitis",
      medications: ["Cetirizine 10 mg", "Fluticasone Nasal Spray"],
      status: "completed",
    },
  ],
};

/* ─── Info Row Sub-component ─────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  return (
    <div className="pd-info-row">
      <span className="pd-info-icon">{icon}</span>
      <div className="pd-info-content">
        <span className="pd-info-label">{label}</span>
        <span className="pd-info-value">{value}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function DoctorPatientDetails() {
  const navigate = useNavigate();

  return (
    <div className="pd-page">

      {/* ── Back Button ────────────────────────────────── */}
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back to Patients
      </button>

      {/* ── Patient Hero Card ───────────────────────────── */}
      <div className="pd-hero-card">
        <div className="pd-hero-left">
          <div className="pd-avatar-wrapper">
            <div className="pd-avatar">
              <FaUser />
            </div>
            <span className="pd-avatar-status" />
          </div>
          <div className="pd-hero-info">
            <div className="pd-patient-id">
              <FaIdBadge />
              {patientData.id}
            </div>
            <h1 className="pd-patient-name">{patientData.name}</h1>
            <div className="pd-hero-badges">
              <span className="pd-badge pd-badge--age">
                <FaBirthdayCake />
                {patientData.age} Years
              </span>
              <span className="pd-badge pd-badge--gender">
                <FaVenusMars />
                {patientData.gender}
              </span>
              <span className="pd-badge pd-badge--blood">
                <FaTint />
                {patientData.bloodGroup}
              </span>
            </div>
          </div>
        </div>
        <div className="pd-hero-right">
          <div className="pd-last-visit">
            <FaCalendarAlt />
            <div>
              <span className="pd-lv-label">Last Visit</span>
              <span className="pd-lv-date">{patientData.lastVisit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Grid ─────────────────────────────── */}
      <div className="pd-main-grid">

        {/* LEFT */}
        <div className="pd-left-col">

          {/* Contact Info */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaPhone className="pd-section-icon" />
              <h2 className="pd-section-title">Contact Information</h2>
            </div>
            <div className="pd-info-grid">
              <InfoRow icon={<FaPhone />} label="Phone" value={patientData.phone} />
              <InfoRow icon={<FaEnvelope />} label="Email" value={patientData.email} />
              <InfoRow icon={<FaMapMarkerAlt />} label="Address" value={patientData.address} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pd-section pd-section--warning">
            <div className="pd-section-header">
              <FaExclamationTriangle className="pd-section-icon pd-section-icon--warning" />
              <h2 className="pd-section-title">Emergency Contact</h2>
            </div>
            <div className="pd-emergency-card">
              <div className="pd-emergency-avatar">
                {patientData.emergencyContact.name.charAt(0)}
              </div>
              <div className="pd-emergency-info">
                <span className="pd-emergency-name">{patientData.emergencyContact.name}</span>
                <span className="pd-emergency-relation">{patientData.emergencyContact.relation}</span>
                <span className="pd-emergency-phone">
                  <FaPhone /> {patientData.emergencyContact.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaRuler className="pd-section-icon" />
              <h2 className="pd-section-title">Physical Stats</h2>
            </div>
            <div className="pd-stats-row">
              <div className="pd-stat-tile pd-stat-tile--height">
                <FaRuler />
                <span className="pd-stat-val">{patientData.height}</span>
                <span className="pd-stat-lbl">Height</span>
              </div>
              <div className="pd-stat-tile pd-stat-tile--weight">
                <FaWeight />
                <span className="pd-stat-val">{patientData.weight}</span>
                <span className="pd-stat-lbl">Weight</span>
              </div>
              <div className="pd-stat-tile pd-stat-tile--bmi">
                <FaHeartbeat />
                <span className="pd-stat-val">{patientData.bmi}</span>
                <span className="pd-stat-lbl">BMI</span>
              </div>
            </div>
          </div>

          {/* Medical History Summary */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaHistory className="pd-section-icon" />
              <h2 className="pd-section-title">Medical History Summary</h2>
            </div>
            <p className="pd-history-text">{patientData.medicalHistorySummary}</p>
          </div>

        </div>

        {/* RIGHT */}
        <div className="pd-right-col">

          {/* Allergies */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaAllergies className="pd-section-icon pd-section-icon--danger" />
              <h2 className="pd-section-title">Allergies</h2>
            </div>
            <div className="pd-tag-list">
              {patientData.allergies.map((allergy, i) => (
                <span key={i} className="pd-tag pd-tag--allergy">
                  <FaExclamationTriangle />
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaHeartbeat className="pd-section-icon pd-section-icon--primary" />
              <h2 className="pd-section-title">Medical Conditions</h2>
            </div>
            <div className="pd-condition-list">
              {patientData.medicalConditions.map((cond, i) => (
                <div key={i} className="pd-condition-item">
                  <FaCheckCircle className="pd-condition-icon" />
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div className="pd-section">
            <div className="pd-section-header">
              <FaPills className="pd-section-icon pd-section-icon--purple" />
              <h2 className="pd-section-title">Current Medications</h2>
            </div>
            <div className="pd-med-list">
              {patientData.currentMedications.map((med, i) => (
                <div key={i} className="pd-med-item">
                  <div className="pd-med-icon-wrap">
                    <FaPills />
                  </div>
                  <div className="pd-med-info">
                    <span className="pd-med-name">{med.name}</span>
                    <span className="pd-med-meta">
                      <FaClock /> {med.frequency} · Since {med.since}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointment */}
          <div className="pd-section pd-section--upcoming">
            <div className="pd-section-header">
              <FaCalendarCheck className="pd-section-icon pd-section-icon--success" />
              <h2 className="pd-section-title">Upcoming Appointment</h2>
            </div>
            <div className="pd-upcoming-card">
              <div className="pd-upcoming-row">
                <FaCalendarAlt />
                <span>{patientData.upcomingAppointment.date}</span>
              </div>
              <div className="pd-upcoming-row">
                <FaClock />
                <span>{patientData.upcomingAppointment.time}</span>
              </div>
              <div className="pd-upcoming-row">
                <FaStethoscope />
                <span>{patientData.upcomingAppointment.reason}</span>
              </div>
              <span className="pd-appt-type-badge pd-appt-type-badge--inperson">
                <FaUser />
                {patientData.upcomingAppointment.type}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Recent Prescriptions ─────────────────────────────── */}
      <div className="pd-section pd-section--full">
        <div className="pd-section-header">
          <FaNotesMedical className="pd-section-icon pd-section-icon--primary" />
          <h2 className="pd-section-title">Recent Prescriptions</h2>
        </div>
        <div className="pd-rx-grid">
          {patientData.recentPrescriptions.map((rx) => (
            <div key={rx.id} className="pd-rx-card">
              <div className="pd-rx-header">
                <span className="pd-rx-id">{rx.id}</span>
                <span className={`pd-rx-status pd-rx-status--${rx.status}`}>
                  {rx.status === "active" ? "Active" : "Completed"}
                </span>
              </div>
              <p className="pd-rx-diagnosis">{rx.diagnosis}</p>
              <div className="pd-rx-meds">
                {rx.medications.map((m, i) => (
                  <span key={i} className="pd-rx-med-tag">
                    <FaPills /> {m}
                  </span>
                ))}
              </div>
              <div className="pd-rx-footer">
                <FaCalendarAlt />
                <span>{rx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Action Buttons ───────────────────────────────────── */}
      <div className="pd-actions">
        <button
          className="pd-action-btn pd-action-btn--records"
          onClick={() => navigate("/doctor/medical-records")}
        >
          <FaFileMedical />
          View Medical Records
        </button>
        <button
          className="pd-action-btn pd-action-btn--prescriptions"
          onClick={() => navigate("/doctor/prescriptions")}
        >
          <FaNotesMedical />
          View Prescription History
        </button>
        <button
          className="pd-action-btn pd-action-btn--consult"
          onClick={() => navigate("/doctor/consultation")}
        >
          <FaVideo />
          Start Consultation
        </button>
      </div>

    </div>
  );
}

export default DoctorPatientDetails;