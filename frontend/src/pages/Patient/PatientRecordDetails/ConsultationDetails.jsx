import React, { useState, useEffect } from "react";
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
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./ConsultationDetails.css";

const STATUS_CLASS_MAP = {
  Completed: "cd-status--completed",
  "Follow-up Scheduled": "cd-status--followup",
  "In Progress": "cd-status--inprogress",
  Cancelled: "cd-status--cancelled",
  Confirmed: "cd-status--completed",
  Pending: "cd-status--inprogress",
};

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function ConsultationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid consultation ID.");
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login/patient");
          return;
        }
        const res = await fetch(`${API_BASE_URL}/patient/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const appt = data.data;
          const doc = appt.doctorId || {};
          const hosp = appt.hospitalId || {};
          setRecord({
            doctor: doc.name || "Doctor",
            specialization: doc.specialization || "General Physician",
            hospital: hosp.name || doc.hospitalName || "Facility",
            city: hosp.city || doc.city || "",
            date: appt.date ? new Date(appt.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "",
            type: appt.type || "Consultation",
            diagnosis: appt.consultationId?.diagnosis || appt.notes || "—",
            status: appt.status || "Completed",
            consultationFee: appt.fee ? `₹${appt.fee}` : (doc.consultationFee ? `₹${doc.consultationFee}` : "—"),
            followUpDate: appt.followUpDate || null,
            notes: appt.consultationId?.notes || appt.notes || "—",
            symptoms: appt.consultationId?.symptoms || [],
            vitalSigns: appt.consultationId?.vitalSigns || null,
          });
        } else {
          setError(data.message || "Consultation record not found.");
        }
      } catch (err) {
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="cd-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#0d9488" }}>
        <FaSpinner className="fa-spin" /> Loading consultation details...
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="cd-page">
        <button className="cd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="cd-not-found" style={{ textAlign: "center", padding: "3rem" }}>
          <FaExclamationCircle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "1rem" }} />
          <h2>Consultation Not Found</h2>
          <p>{error || "The consultation record you're looking for doesn't exist."}</p>
          <button className="cd-action-btn" style={{ marginTop: "1rem" }} onClick={() => navigate("/patient/medical-records")}>
            Back to Records
          </button>
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
        <span className={`cd-status-badge ${STATUS_CLASS_MAP[record.status] || "cd-status--completed"}`}>
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
                <FaHospital /> {record.hospital}{record.city ? `, ${record.city}` : ""}
              </span>
              <span>
                {record.type?.toLowerCase().includes("online") || record.type?.toLowerCase().includes("video") ? (
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
            <span className={`cd-status-badge cd-status-badge--sm ${STATUS_CLASS_MAP[record.status] || ""}`}>
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
            {record.vitalSigns.bp && (
              <div className="cd-vital-item">
                <span className="cd-vital-label">Blood Pressure</span>
                <span className="cd-vital-value">{record.vitalSigns.bp}</span>
              </div>
            )}
            {record.vitalSigns.pulse && (
              <div className="cd-vital-item">
                <span className="cd-vital-label">Pulse Rate</span>
                <span className="cd-vital-value">{record.vitalSigns.pulse}</span>
              </div>
            )}
            {record.vitalSigns.temp && (
              <div className="cd-vital-item">
                <span className="cd-vital-label">Temperature</span>
                <span className="cd-vital-value">{record.vitalSigns.temp}</span>
              </div>
            )}
            {record.vitalSigns.spo2 && (
              <div className="cd-vital-item">
                <span className="cd-vital-label">SpO₂</span>
                <span className="cd-vital-value">{record.vitalSigns.spo2}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Symptoms & Diagnosis */}
      <div className="cd-section-card">
        <div className="cd-section-label">
          <FaClipboardCheck className="cd-label-icon" /> Symptoms &amp; Diagnosis
        </div>
        {record.symptoms && record.symptoms.length > 0 && (
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
          <p className="cd-sub-label">Diagnosis / Notes</p>
          <p className="cd-diagnosis-value">{record.diagnosis}</p>
        </div>
      </div>

      {/* Doctor Notes */}
      {record.notes && record.notes !== "—" && (
        <div className="cd-section-card">
          <div className="cd-section-label">
            <FaNotesMedical className="cd-label-icon" /> Doctor's Notes
          </div>
          <p className="cd-notes-text">{record.notes}</p>
        </div>
      )}

      {/* Follow-up */}
      {record.followUpDate && (
        <div className="cd-section-card cd-section-card--followup">
          <div className="cd-section-label">
            <FaCalendarPlus className="cd-label-icon" /> Follow-up Scheduled
          </div>
          <div className="cd-followup-row">
            <div className="cd-followup-info">
              <FaCalendarAlt />
              <span>{formatDate(record.followUpDate)}</span>
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
