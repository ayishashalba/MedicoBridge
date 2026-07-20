import React from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaStethoscope,
  FaClipboardCheck,
  FaNotesMedical,
  FaCalendarPlus,
  FaMoneyBillWave,
  FaVideo,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./ConsultationDetails.css";

/* ── Mock Data (same source as listing) ── */
const consultations = [
  {
    id: "consultation-1",
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital",
    city: "Kochi",
    date: "20 June 2026",
    type: "Online Consultation",
    diagnosis: "Mild Hypertension",
    status: "Completed",
    consultationFee: "₹800",
    followUpDate: "20 July 2026",
    notes:
      "Patient advised to monitor blood pressure daily. Reduce salt intake and exercise 30 min/day. Prescribed Amlodipine 5mg and Aspirin 75mg. Lifestyle modifications include weight management and stress reduction techniques.",
    symptoms: ["Headache", "Dizziness", "Elevated BP readings"],
    vitalSigns: {
      bp: "140/90 mmHg",
      pulse: "82 bpm",
      temp: "98.4°F",
      spo2: "98%",
    },
  },
  {
    id: "consultation-2",
    doctor: "Dr. John Smith",
    specialization: "Dermatologist",
    hospital: "Aster Clinic",
    city: "Kochi",
    date: "12 June 2026",
    type: "Hospital Visit",
    diagnosis: "Skin Allergy",
    status: "Follow-up Scheduled",
    consultationFee: "₹600",
    followUpDate: "12 July 2026",
    notes:
      "Prescribed antihistamines and topical cream. Avoid exposure to allergens. Patient should maintain a diary of foods and environmental triggers. If rashes worsen, consider patch testing.",
    symptoms: ["Itching", "Red rashes", "Swelling on arms"],
    vitalSigns: {
      bp: "120/80 mmHg",
      pulse: "76 bpm",
      temp: "98.6°F",
      spo2: "99%",
    },
  },
  {
    id: "consultation-3",
    doctor: "Dr. Emily Wilson",
    specialization: "Neurologist",
    hospital: "Lakeshore Hospital",
    city: "Ernakulam",
    date: "03 June 2026",
    type: "Online Consultation",
    diagnosis: "Migraine",
    status: "Completed",
    consultationFee: "₹1,000",
    followUpDate: null,
    notes:
      "Prescribed Sumatriptan for acute episodes. Maintain a headache diary tracking frequency, intensity, and triggers. Adequate hydration and sleep hygiene recommended. Follow up only if frequency increases.",
    symptoms: [
      "Severe headache",
      "Nausea",
      "Sensitivity to light",
      "Aura",
    ],
    vitalSigns: {
      bp: "118/76 mmHg",
      pulse: "72 bpm",
      temp: "98.2°F",
      spo2: "99%",
    },
  },
];

const STATUS_CLASS_MAP = {
  Completed: "cd-status--completed",
  "Follow-up Scheduled": "cd-status--followup",
  "In Progress": "cd-status--inprogress",
  Cancelled: "cd-status--cancelled",
};

function ConsultationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const record = consultations.find((c) => c.id === id);

  if (!record) {
    return (
      <div className="cd-page">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="cd-not-found">
          <h2>Consultation Not Found</h2>
          <p>The consultation record you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-page">
      {/* Back */}
      <button
        className="cd-back-btn"
        onClick={() => navigate("/patient/medical-records")}
      >
        <FaArrowLeft /> Back to Records
      </button>

      {/* Header */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-header-icon">
            <FaStethoscope />
          </div>
          <div>
            <h1 className="cd-title">Consultation Details</h1>
            <p className="cd-subtitle">
              {record.type} • {record.date}
            </p>
          </div>
        </div>
        <span className={`cd-status-badge ${STATUS_CLASS_MAP[record.status]}`}>
          {record.status}
        </span>
      </div>

      {/* Doctor Card */}
      <div className="cd-section-card">
        <div className="cd-section-label">
          <FaUserMd className="cd-label-icon" /> Doctor Information
        </div>
        <div className="cd-doctor-card">
          <div className="cd-doctor-avatar">
            <FaUserMd />
          </div>
          <div className="cd-doctor-info">
            <h3>{record.doctor}</h3>
            <p className="cd-doctor-spec">{record.specialization}</p>
            <div className="cd-doctor-meta">
              <span>
                <FaHospital /> {record.hospital}, {record.city}
              </span>
              <span>
                {record.type === "Online Consultation" ? (
                  <FaVideo />
                ) : (
                  <FaMapMarkerAlt />
                )}{" "}
                {record.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Summary */}
      <div className="cd-section-card">
        <div className="cd-section-label">
          <FaClipboardCheck className="cd-label-icon" /> Consultation Summary
        </div>
        <div className="cd-info-grid">
          <div className="cd-info-item">
            <span className="cd-info-label">Date</span>
            <span className="cd-info-value">
              <FaCalendarAlt /> {record.date}
            </span>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-label">Type</span>
            <span className="cd-info-value">{record.type}</span>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-label">Consultation Fee</span>
            <span className="cd-info-value cd-info-value--fee">
              <FaMoneyBillWave /> {record.consultationFee}
            </span>
          </div>
          <div className="cd-info-item">
            <span className="cd-info-label">Status</span>
            <span
              className={`cd-status-badge cd-status-badge--sm ${STATUS_CLASS_MAP[record.status]}`}
            >
              {record.status}
            </span>
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      {record.vitalSigns && (
        <div className="cd-section-card">
          <div className="cd-section-label">
            <FaNotesMedical className="cd-label-icon" /> Vital Signs
          </div>
          <div className="cd-vitals-grid">
            <div className="cd-vital-item">
              <span className="cd-vital-label">Blood Pressure</span>
              <span className="cd-vital-value">{record.vitalSigns.bp}</span>
            </div>
            <div className="cd-vital-item">
              <span className="cd-vital-label">Pulse Rate</span>
              <span className="cd-vital-value">{record.vitalSigns.pulse}</span>
            </div>
            <div className="cd-vital-item">
              <span className="cd-vital-label">Temperature</span>
              <span className="cd-vital-value">{record.vitalSigns.temp}</span>
            </div>
            <div className="cd-vital-item">
              <span className="cd-vital-label">SpO₂</span>
              <span className="cd-vital-value">{record.vitalSigns.spo2}</span>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms & Diagnosis */}
      <div className="cd-section-card">
        <div className="cd-section-label">
          <FaClipboardCheck className="cd-label-icon" /> Symptoms & Diagnosis
        </div>
        {record.symptoms && (
          <div className="cd-symptoms">
            <p className="cd-sub-label">Reported Symptoms</p>
            <div className="cd-symptom-tags">
              {record.symptoms.map((s, i) => (
                <span key={i} className="cd-symptom-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="cd-diagnosis-block">
          <p className="cd-sub-label">Diagnosis</p>
          <p className="cd-diagnosis-value">{record.diagnosis}</p>
        </div>
      </div>

      {/* Doctor Notes */}
      <div className="cd-section-card">
        <div className="cd-section-label">
          <FaNotesMedical className="cd-label-icon" /> Doctor's Notes
        </div>
        <p className="cd-notes-text">{record.notes}</p>
      </div>

      {/* Follow-up */}
      {record.followUpDate && (
        <div className="cd-section-card cd-section-card--followup">
          <div className="cd-section-label">
            <FaCalendarPlus className="cd-label-icon" /> Follow-up Scheduled
          </div>
          <div className="cd-followup-row">
            <div className="cd-followup-info">
              <FaCalendarAlt />
              <span>{record.followUpDate}</span>
            </div>
            <button
              className="cd-action-btn"
              onClick={() => navigate("/patient/appointments")}
            >
              View Appointments <FaArrowRight className="cd-btn-arrow" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="cd-actions-bar">
        <button
          className="cd-action-btn cd-action-btn--secondary"
          onClick={() => navigate("/patient/medical-records")}
        >
          <FaArrowLeft /> Back to Records
        </button>
        <button
          className="cd-action-btn"
          onClick={() => navigate("/patient/find-doctors")}
        >
          <FaCalendarPlus /> Book Follow-up
          <FaArrowRight className="cd-btn-arrow" />
        </button>
      </div>
    </div>
  );
}

export default ConsultationDetails;
