import React, { useState, useEffect } from "react";
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
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PrescriptionDetails.css";

function PrescriptionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [rx, setRx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid prescription ID.");
      setLoading(false);
      return;
    }

    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login/patient");
          return;
        }
        const res = await fetch(`${API_BASE_URL}/patient/prescriptions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const presc = data.data;
          const doc = presc.doctorId || {};
          const appt = presc.appointmentId || {};
          setRx({
            doctor: doc.name || "Doctor",
            specialization: doc.specialization || "General Physician",
            hospital: doc.hospitalName || doc.clinicName || "Medical Facility",
            date: presc.createdAt
              ? new Date(presc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : presc.date
                ? new Date(presc.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : "—",
            diagnosis: presc.diagnosis || appt.notes || "—",
            patientName: presc.patientId?.name || "Patient",
            medicines: presc.medicines || [],
            notes: presc.notes || presc.advice || "—",
            nextVisit: presc.nextVisit || null,
            prescriptionId: presc.prescriptionId || presc._id,
          });
        } else {
          setError(data.message || "Prescription not found.");
        }
      } catch (err) {
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id, navigate]);

  const handleDownload = (label) => {
    toast.info(`Downloading "${label}" — PDF generation coming soon.`);
  };

  if (loading) {
    return (
      <div className="pd-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#0d9488" }}>
        <FaSpinner className="fa-spin" /> Loading prescription details...
      </div>
    );
  }

  if (error || !rx) {
    return (
      <div className="pd-page">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <FaExclamationCircle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "1rem" }} />
          <h2>Prescription Not Found</h2>
          <p>{error || "The prescription record you're looking for doesn't exist."}</p>
          <button className="pd-action-btn" style={{ marginTop: "1rem" }} onClick={() => navigate("/patient/medical-records")}>
            Back to Records
          </button>
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

      {/* Letterhead */}
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
            <span className="pd-patient-label">Prescription ID</span>
            <span className="pd-patient-value">{rx.prescriptionId}</span>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="pd-section-card">
        <div className="pd-section-label">
          <FaPills className="pd-label-icon" /> Prescribed Medicines
        </div>
        {rx.medicines.length > 0 ? (
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
                      <FaPills className="pd-med-icon" /> {med.name || med.medicineName}
                    </td>
                    <td>{med.dosage || "—"}</td>
                    <td>{med.frequency || "—"}</td>
                    <td>{med.duration || "—"}</td>
                    <td className="pd-med-instructions">{med.instructions || med.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#64748b", padding: "1rem 0" }}>No medicines listed in this prescription.</p>
        )}
      </div>

      {/* Doctor Notes */}
      {rx.notes && rx.notes !== "—" && (
        <div className="pd-section-card">
          <div className="pd-section-label">
            <FaNotesMedical className="pd-label-icon" /> Doctor's Notes &amp; Instructions
          </div>
          <p className="pd-notes-text">{rx.notes}</p>
        </div>
      )}

      {/* Next Visit */}
      {rx.nextVisit && (
        <div className="pd-section-card pd-section-card--next">
          <div className="pd-section-label">
            <FaClock className="pd-label-icon" /> Next Scheduled Visit
          </div>
          <div className="pd-next-row">
            <div className="pd-next-info">
              <FaCalendarAlt />
              <span>{new Date(rx.nextVisit).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
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
