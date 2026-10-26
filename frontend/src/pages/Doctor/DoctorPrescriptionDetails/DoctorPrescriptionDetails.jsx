import React, { useState, useEffect, useCallback } from "react";
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
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorPrescriptionDetails.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
  const { id } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  /* ── Fetch prescription from backend ── */
  const fetchPrescription = useCallback(async () => {
    if (!id) {
      setError("No prescription ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/prescriptions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load prescription.");
        setLoading(false);
        return;
      }

      setPrescription(data.data || data);
    } catch (err) {
      console.error("Fetch prescription error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  /* ── Print ── */
  const handlePrint = () => window.print();

  /* ── Download PDF ── */
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/prescriptions/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prescription-${prescription?.rxId || id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback: print as PDF
        toast.info("Tip: Use Print → Save as PDF to download this prescription.");
        window.print();
      }
    } catch {
      toast.info("Tip: Use Print → Save as PDF to download this prescription.");
      window.print();
    }
  };

  /* ── Send to Patient ── */
  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/prescriptions/${id}/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Prescription sent to patient successfully.");
        // Refresh to update status
        fetchPrescription();
      } else {
        toast.error(data.message || "Failed to send prescription.");
      }
    } catch {
      toast.error("Network error. Failed to send prescription.");
    } finally {
      setSending(false);
    }
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="prx-page">
        <div className="prx-topbar">
          <button className="prx-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            Back
          </button>
        </div>
        <div className="prx-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px" }}>
          <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "var(--prx-primary, #6366f1)" }} />
          <p style={{ color: "var(--prx-muted, #94a3b8)", fontSize: "1rem" }}>Loading prescription details…</p>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error || !prescription) {
    return (
      <div className="prx-page">
        <div className="prx-topbar">
          <button className="prx-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            Back
          </button>
        </div>
        <div className="prx-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "16px", textAlign: "center" }}>
          <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#ef4444" }} />
          <p style={{ color: "#ef4444", fontWeight: 600, fontSize: "1.1rem" }}>{error || "Prescription not found."}</p>
          <button className="prx-back-btn" onClick={fetchPrescription} style={{ marginTop: "8px" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const rx = prescription;

  return (
    <div className="prx-page">

      {/* ── Top Bar ──────────────────────────────────────── */}
      <div className="prx-topbar">
        <button className="prx-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          Back
        </button>
        <StatusBadge status={rx.status} />
      </div>

      {/* ── Main Card ────────────────────────────────────── */}
      <div className="prx-card">

        {/* ── Card Header ─────────────────────────────── */}
        <div className="prx-card-header">
          <div className="prx-header-left">
            <div className="prx-rx-badge">
              <FaNotesMedical />
              {rx.rxId}
            </div>
            <h1 className="prx-title">Prescription Details</h1>
            <div className="prx-meta-row">
              <span className="prx-meta-item">
                <FaCalendarAlt />
                {rx.date}
              </span>
              <span className="prx-meta-dot" />
              <span className="prx-meta-item">
                {rx.consultationType === "Video" ? <FaVideo /> : <FaHospital />}
                {rx.consultationType} Consultation
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
            <span className="prx-party-name">{rx.doctor?.name}</span>
            <span className="prx-party-sub">{rx.doctor?.specialization}</span>
            {rx.doctor?.type === "Hospital" ? (
              <span className="prx-party-sub">{rx.doctor?.hospital}</span>
            ) : (
              <>
                <span className="prx-party-sub">{rx.doctor?.clinicName}</span>
                <span className="prx-party-sub">{rx.doctor?.clinicAddress}</span>
              </>
            )}
            <span className="prx-party-reg">
              <FaIdBadge /> Reg. {rx.doctor?.regNo}
            </span>
          </div>

          <div className="prx-party-divider" />

          <div className="prx-party-card prx-party-card--patient">
            <span className="prx-party-label">Patient</span>
            <span className="prx-party-name">{rx.patient?.name}</span>
            <span className="prx-party-sub">
              {rx.patient?.age} yrs · {rx.patient?.gender} · Blood: {rx.patient?.bloodGroup}
            </span>
            <span className="prx-party-reg">
              <FaUser /> {rx.patient?.id}
            </span>
          </div>
        </div>

        {/* ── Diagnosis ───────────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaStethoscope className="prx-section-icon prx-section-icon--primary" />
            <h2 className="prx-section-title">Diagnosis</h2>
          </div>
          <p className="prx-diagnosis-text">{rx.diagnosis}</p>
        </div>

        {/* ── Symptoms ────────────────────────────────── */}
        {rx.symptoms && rx.symptoms.length > 0 && (
          <div className="prx-section">
            <div className="prx-section-header">
              <FaThermometerHalf className="prx-section-icon prx-section-icon--warning" />
              <h2 className="prx-section-title">Presenting Symptoms</h2>
            </div>
            <div className="prx-symptom-list">
              {rx.symptoms.map((s, i) => (
                <div key={i} className="prx-symptom-item">
                  <span className="prx-symptom-dot" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Medicines Table ──────────────────────────── */}
        <div className="prx-section">
          <div className="prx-section-header">
            <FaPills className="prx-section-icon prx-section-icon--purple" />
            <h2 className="prx-section-title">Prescribed Medicines</h2>
            <span className="prx-med-count">{rx.medicines?.length || 0} Medicines</span>
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
                {(rx.medicines || []).map((med, i) => (
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
            {(rx.medicines || []).map((med, i) => (
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
        {rx.advice && (
          <div className="prx-section">
            <div className="prx-section-header">
              <FaClipboardList className="prx-section-icon prx-section-icon--success" />
              <h2 className="prx-section-title">Doctor Advice</h2>
            </div>
            <p className="prx-advice-text">{rx.advice}</p>
          </div>
        )}

        {/* ── Follow-up ───────────────────────────────── */}
        {rx.followUpDate && (
          <div className="prx-followup-banner">
            <div className="prx-followup-left">
              <FaCalendarCheck className="prx-followup-icon" />
              <div>
                <span className="prx-followup-label">Follow-up Appointment</span>
                <span className="prx-followup-date">{rx.followUpDate}</span>
              </div>
            </div>
            <span className="prx-followup-pill">Scheduled</span>
          </div>
        )}

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
          <button
            className="prx-action-btn prx-action-btn--send"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaPaperPlane />}
            {sending ? "Sending…" : "Send to Patient"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default DoctorPrescriptionDetails;
