import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaCalendarCheck,
  FaStethoscope,
  FaThermometerHalf,
  FaPills,
  FaNotesMedical,
  FaClipboardList,
  FaVideo,
  FaHospital,
  FaPrint,
  FaDownload,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaIdBadge,
  FaUserMd,
} from "react-icons/fa";
import "./DoctorPrescriptionDetails.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
// Toggle this to "Clinic" to test Private Clinic Doctor view
const DOCTOR_TYPE = "Hospital";

const prescriptionData = {
  rxId: "RX-4521",
  status: "sent",
  date: "June 28, 2026",
  consultationType: "In-Person",
  patient: {
    name: "Rahul Nair",
    id: "PT-1024",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
  },
  doctor: {
    name: "Dr. Ayisha Shalba",
    specialization: "Cardiologist",
    type: DOCTOR_TYPE,
    ...(DOCTOR_TYPE === "Hospital" 
        ? { hospital: "MedicoBridge Hospital" } 
        : { clinicName: "HeartCare Clinic", clinicAddress: "123 Main St, Kochi" }
    ),
    regNo: "MCI-KL-20849",
  },
  diagnosis: "Type 2 Diabetes Mellitus – Routine Quarterly Review",
  symptoms: [
    "Mild fatigue after meals",
    "Occasional thirst",
    "Slight dizziness in the morning",
    "Stable blood glucose (fasting: 118 mg/dL)",
  ],
  medicines: [
    {
      name: "Metformin",
      strength: "500 mg",
      dosage: "1 Tablet",
      frequency: "Twice Daily (Morning & Night)",
      duration: "90 Days",
      instruction: "Take with meals",
    },
    {
      name: "Amlodipine",
      strength: "5 mg",
      dosage: "1 Tablet",
      frequency: "Once Daily (Morning)",
      duration: "90 Days",
      instruction: "Take before breakfast",
    },
    {
      name: "Aspirin",
      strength: "75 mg",
      dosage: "1 Tablet",
      frequency: "Once Daily (Night)",
      duration: "90 Days",
      instruction: "Take after dinner",
    },
    {
      name: "Vitamin D3",
      strength: "1000 IU",
      dosage: "1 Capsule",
      frequency: "Once Daily (Morning)",
      duration: "30 Days",
      instruction: "Take with milk or a fatty meal",
    },
  ],
  advice:
    "Maintain a low-carbohydrate diet and avoid sugary beverages. Walk briskly for 30 minutes every day. Monitor blood pressure twice a week and log readings. Stay well-hydrated. Avoid stress and ensure at least 7 hours of sleep. Attend diabetic diet counselling session this month.",
  followUpDate: "September 28, 2026",
};

/* ─── Status Badge ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    sent:    { label: "Sent",    cls: "prx-status--sent" },
    pending: { label: "Pending", cls: "prx-status--pending" },
    draft:   { label: "Draft",   cls: "prx-status--draft" },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`prx-status-badge ${s.cls}`}>
      <FaCheckCircle />
      {s.label}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
function DoctorPrescriptionDetails() {
  const navigate = useNavigate();

  const handlePrint = () => window.print();
  const handleDownload = () => alert("PDF download coming soon.");
  const handleSend = () => alert("Prescription sent to patient.");

  return (
    <div className="prx-page">

      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="prx-topbar">
        <button className="prx-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </button>
        <StatusBadge status={prescriptionData.status} />
      </div>

      {/* ── Main Card ────────────────────────────────────── */}
      <div className="prx-card">

        {/* ── Card Header ─────────────────────────────── */}
        <div className="prx-card-header">
          <div className="prx-header-left">
            <div className="prx-rx-badge">
              <FaNotesMedical />
              {prescriptionData.rxId}
            </div>
            <h1 className="prx-title">Prescription Details</h1>
            <div className="prx-meta-row">
              <span className="prx-meta-item">
                <FaCalendarAlt />
                {prescriptionData.date}
              </span>
              <span className="prx-meta-dot" />
              <span className="prx-meta-item">
                {prescriptionData.consultationType === "Video" ? <FaVideo /> : <FaHospital />}
                {prescriptionData.consultationType} Consultation
              </span>
            </div>
          </div>
          <div className="prx-header-right">
            <div className="prx-header-logo">
              <FaUserMd />
            </div>
          </div>
        </div>

        {/* ── Doctor + Patient Info Strip ──────────────── */}
        <div className="prx-parties-grid">
          <div className="prx-party-card prx-party-card--doctor">
            <span className="prx-party-label">Prescribing Doctor</span>
            <span className="prx-party-name">{prescriptionData.doctor.name}</span>
            <span className="prx-party-sub">{prescriptionData.doctor.specialization}</span>
            {prescriptionData.doctor.type === "Hospital" ? (
                <span className="prx-party-sub">{prescriptionData.doctor.hospital}</span>
            ) : (
                <>
                    <span className="prx-party-sub">{prescriptionData.doctor.clinicName}</span>
                    <span className="prx-party-sub">{prescriptionData.doctor.clinicAddress}</span>
                </>
            )}
            <span className="prx-party-reg">
              <FaIdBadge /> Reg. {prescriptionData.doctor.regNo}
            </span>
          </div>

          <div className="prx-party-divider" />

          <div className="prx-party-card prx-party-card--patient">
            <span className="prx-party-label">Patient</span>
            <span className="prx-party-name">{prescriptionData.patient.name}</span>
            <span className="prx-party-sub">
              {prescriptionData.patient.age} yrs · {prescriptionData.patient.gender} · Blood: {prescriptionData.patient.bloodGroup}
            </span>
            <span className="prx-party-reg">
              <FaUser /> {prescriptionData.patient.id}
            </span>
          </div>
        </div>

        {/* ── Diagnosis ───────────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaStethoscope className="prx-section-icon prx-section-icon--primary" />
            <h2 className="prx-section-title">Diagnosis</h2>
          </div>
          <p className="prx-diagnosis-text">{prescriptionData.diagnosis}</p>
        </div>

        {/* ── Symptoms ────────────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaThermometerHalf className="prx-section-icon prx-section-icon--warning" />
            <h2 className="prx-section-title">Presenting Symptoms</h2>
          </div>
          <div className="prx-symptom-list">
            {prescriptionData.symptoms.map((s, i) => (
              <div key={i} className="prx-symptom-item">
                <span className="prx-symptom-dot" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Medicines Table ──────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaPills className="prx-section-icon prx-section-icon--purple" />
            <h2 className="prx-section-title">Prescribed Medicines</h2>
            <span className="prx-med-count">{prescriptionData.medicines.length} Medicines</span>
          </div>

          {/* ── Responsive Table ─────────────────────── */}
          <div className="prx-table-wrapper">
            <table className="prx-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instruction</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.medicines.map((med, i) => (
                  <tr key={i}>
                    <td className="prx-td-num">{i + 1}</td>
                    <td>
                      <div className="prx-med-name">{med.name}</div>
                      <div className="prx-med-strength">{med.strength}</div>
                    </td>
                    <td>{med.dosage}</td>
                    <td>{med.frequency}</td>
                    <td>
                      <span className="prx-duration-badge">
                        <FaClock /> {med.duration}
                      </span>
                    </td>
                    <td className="prx-td-instruction">{med.instruction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards (shown <640px) ───────────── */}
          <div className="prx-med-cards">
            {prescriptionData.medicines.map((med, i) => (
              <div key={i} className="prx-med-card">
                <div className="prx-med-card-header">
                  <span className="prx-med-card-num">{i + 1}</span>
                  <div>
                    <div className="prx-med-name">{med.name}</div>
                    <div className="prx-med-strength">{med.strength}</div>
                  </div>
                </div>
                <div className="prx-med-card-rows">
                  <div className="prx-med-card-row">
                    <span>Dosage</span>
                    <span>{med.dosage}</span>
                  </div>
                  <div className="prx-med-card-row">
                    <span>Frequency</span>
                    <span>{med.frequency}</span>
                  </div>
                  <div className="prx-med-card-row">
                    <span>Duration</span>
                    <span className="prx-duration-badge"><FaClock />{med.duration}</span>
                  </div>
                  <div className="prx-med-card-row">
                    <span>Instruction</span>
                    <span>{med.instruction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Doctor Advice ───────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaClipboardList className="prx-section-icon prx-section-icon--success" />
            <h2 className="prx-section-title">Doctor Advice</h2>
          </div>
          <p className="prx-advice-text">{prescriptionData.advice}</p>
        </div>

        {/* ── Follow-up ───────────────────────────────── */}
        <div className="prx-followup-banner">
          <div className="prx-followup-left">
            <FaCalendarCheck className="prx-followup-icon" />
            <div>
              <span className="prx-followup-label">Follow-up Appointment</span>
              <span className="prx-followup-date">{prescriptionData.followUpDate}</span>
            </div>
          </div>
          <span className="prx-followup-pill">Scheduled</span>
        </div>

        {/* ── Action Buttons ───────────────────────────── */}
        <div className="prx-actions">
          <button className="prx-action-btn prx-action-btn--print" onClick={handlePrint}>
            <FaPrint />
            Print
          </button>
          <button className="prx-action-btn prx-action-btn--download" onClick={handleDownload}>
            <FaDownload />
            Download PDF
          </button>
          <button className="prx-action-btn prx-action-btn--send" onClick={handleSend}>
            <FaPaperPlane />
            Send to Patient
          </button>
        </div>

      </div>
    </div>
  );
}

export default DoctorPrescriptionDetails;
