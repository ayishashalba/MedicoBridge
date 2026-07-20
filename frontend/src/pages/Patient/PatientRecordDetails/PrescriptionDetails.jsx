import React from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaPrescriptionBottleAlt,
  FaNotesMedical,
  FaDownload,
  FaPills,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./PrescriptionDetails.css";

/* ── Mock Data ── */
const prescriptions = [
  {
    id: "prescription-1",
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital, Kochi",
    date: "20 June 2026",
    diagnosis: "Mild Hypertension",
    patientName: "John Doe",
    patientAge: "32 Years",
    patientGender: "Male",
    medicines: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily (Morning)",
        duration: "30 days",
        instructions: "Take after breakfast",
      },
      {
        name: "Aspirin",
        dosage: "75mg",
        frequency: "Once daily (Morning)",
        duration: "30 days",
        instructions: "Take after breakfast with water",
      },
    ],
    notes:
      "Monitor blood pressure daily. Reduce salt intake, maintain healthy diet and exercise 30 min/day. Report any dizziness or unusual symptoms immediately. Follow up after 1 month.",
    nextVisit: "20 July 2026",
  },
  {
    id: "prescription-2",
    doctor: "Dr. John Smith",
    specialization: "Dermatologist",
    hospital: "Aster Clinic, Kochi",
    date: "12 June 2026",
    diagnosis: "Skin Allergy",
    patientName: "John Doe",
    patientAge: "32 Years",
    patientGender: "Male",
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "Once daily at night",
        duration: "14 days",
        instructions: "Take before bedtime",
      },
      {
        name: "Calamine Lotion",
        dosage: "Apply topically",
        frequency: "Twice daily",
        duration: "14 days",
        instructions: "Apply on affected area after cleaning",
      },
    ],
    notes:
      "Avoid scratching affected area. Keep skin moisturized and wear loose cotton clothing. Avoid known allergens. If rashes worsen or fever develops, visit immediately.",
    nextVisit: "12 July 2026",
  },
];

function handleDownload(name) {
  alert(
    `Downloading PDF for "${name}"…\n\n(This is a demo — no actual file is generated.)`
  );
}

function PrescriptionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const rx = prescriptions.find((p) => p.id === id);

  if (!rx) {
    return (
      <div className="pd-page">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="pd-not-found">
          <h2>Prescription Not Found</h2>
          <p>The prescription record you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-page">
      {/* Back */}
      <button
        className="pd-back-btn"
        onClick={() => navigate("/patient/medical-records")}
      >
        <FaArrowLeft /> Back to Records
      </button>

      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <div className="pd-header-icon">
            <FaPrescriptionBottleAlt />
          </div>
          <div>
            <h1 className="pd-title">Prescription Details</h1>
            <p className="pd-subtitle">
              Issued on {rx.date} • {rx.hospital}
            </p>
          </div>
        </div>
        <button
          className="pd-download-btn"
          onClick={() => handleDownload(`Prescription — ${rx.doctor}`)}
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* Prescription Header Card (Hospital letterhead style) */}
      <div className="pd-letterhead">
        <div className="pd-letterhead-top">
          <div className="pd-hospital-logo">
            <FaHospital />
          </div>
          <div className="pd-hospital-info">
            <h3>{rx.hospital}</h3>
            <p>Department of {rx.specialization}</p>
          </div>
        </div>
        <div className="pd-letterhead-divider"></div>
        <div className="pd-rx-meta-grid">
          <div className="pd-rx-meta-item">
            <span className="pd-rx-meta-label">Doctor</span>
            <span className="pd-rx-meta-value">{rx.doctor}</span>
          </div>
          <div className="pd-rx-meta-item">
            <span className="pd-rx-meta-label">Specialization</span>
            <span className="pd-rx-meta-value">{rx.specialization}</span>
          </div>
          <div className="pd-rx-meta-item">
            <span className="pd-rx-meta-label">Date</span>
            <span className="pd-rx-meta-value">{rx.date}</span>
          </div>
          <div className="pd-rx-meta-item">
            <span className="pd-rx-meta-label">Diagnosis</span>
            <span className="pd-rx-meta-value pd-rx-meta-value--highlight">
              {rx.diagnosis}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="pd-section-card">
        <div className="pd-section-label">
          <FaUserMd className="pd-label-icon" /> Patient Information
        </div>
        <div className="pd-patient-grid">
          <div className="pd-patient-item">
            <span className="pd-patient-label">Name</span>
            <span className="pd-patient-value">{rx.patientName}</span>
          </div>
          <div className="pd-patient-item">
            <span className="pd-patient-label">Age</span>
            <span className="pd-patient-value">{rx.patientAge}</span>
          </div>
          <div className="pd-patient-item">
            <span className="pd-patient-label">Gender</span>
            <span className="pd-patient-value">{rx.patientGender}</span>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="pd-section-card">
        <div className="pd-section-label">
          <FaPills className="pd-label-icon" /> Prescribed Medicines
        </div>
        <div className="pd-medicines-table-wrapper">
          <table className="pd-medicines-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              {rx.medicines.map((med, i) => (
                <tr key={i}>
                  <td className="pd-med-num">{i + 1}</td>
                  <td className="pd-med-name">
                    <FaPills className="pd-med-icon" /> {med.name}
                  </td>
                  <td>{med.dosage}</td>
                  <td>{med.frequency}</td>
                  <td>{med.duration}</td>
                  <td className="pd-med-instructions">{med.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Notes */}
      <div className="pd-section-card">
        <div className="pd-section-label">
          <FaNotesMedical className="pd-label-icon" /> Doctor's Notes &
          Instructions
        </div>
        <p className="pd-notes-text">{rx.notes}</p>
      </div>

      {/* Next Visit */}
      {rx.nextVisit && (
        <div className="pd-section-card pd-section-card--next">
          <div className="pd-section-label">
            <FaClock className="pd-label-icon" /> Next Scheduled Visit
          </div>
          <div className="pd-next-row">
            <div className="pd-next-info">
              <FaCalendarAlt />
              <span>{rx.nextVisit}</span>
            </div>
            <button
              className="pd-action-btn"
              onClick={() => navigate("/patient/appointments")}
            >
              View Appointments <FaArrowRight className="pd-btn-arrow" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pd-actions-bar">
        <button
          className="pd-action-btn pd-action-btn--secondary"
          onClick={() => navigate("/patient/medical-records")}
        >
          <FaArrowLeft /> Back to Records
        </button>
        <button
          className="pd-action-btn"
          onClick={() => handleDownload(`Prescription — ${rx.doctor}`)}
        >
          <FaDownload /> Download PDF
        </button>
      </div>
    </div>
  );
}

export default PrescriptionDetails;
