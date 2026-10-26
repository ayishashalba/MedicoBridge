import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaNotesMedical,
    FaPills,
    FaFileMedical,
    FaPrint,
    FaDownload,
    FaPaperPlane,
    FaEdit,
    FaSpinner,
    FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorPrescriptionPreview.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function DoctorPrescriptionPreview() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [sending, setSending]           = useState(false);

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
            const res  = await fetch(`${API_BASE}/api/prescriptions/${id}`, {
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
            const res   = await fetch(`${API_BASE}/api/prescriptions/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
                const blob = await res.blob();
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement("a");
                a.href     = url;
                a.download = `prescription-${prescription?.rxId || id}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            } else {
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
            const res   = await fetch(`${API_BASE}/api/prescriptions/${id}/send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Prescription sent to patient successfully.");
                navigate(`/doctor/prescription-success/${id}`);
            } else {
                toast.error(data.message || "Failed to send prescription.");
            }
        } catch {
            toast.error("Network error. Failed to send prescription.");
        } finally {
            setSending(false);
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="prescription-preview">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <div className="preview-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "14px" }}>
                    <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "#6366f1" }} />
                    <p style={{ color: "#94a3b8" }}>Loading prescription…</p>
                </div>
            </div>
        );
    }

    /* ── Error ── */
    if (error || !prescription) {
        return (
            <div className="prescription-preview">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>
                <div className="preview-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "14px", textAlign: "center" }}>
                    <FaExclamationTriangle style={{ fontSize: "2.2rem", color: "#ef4444" }} />
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>{error || "Prescription not found."}</p>
                    <button className="back-btn" onClick={fetchPrescription} style={{ marginTop: "8px" }}>Retry</button>
                </div>
            </div>
        );
    }

    const rx = prescription;

    return (
        <div className="prescription-preview">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <div className="preview-card">

                <h2>Prescription Preview</h2>

                <div className="doctor-info">
                    <h3>{rx.doctor?.name}</h3>
                    <p>{rx.doctor?.specialization}</p>
                    {rx.doctor?.type === "Hospital" ? (
                        <p>{rx.doctor?.hospital}</p>
                    ) : (
                        <>
                            <p>{rx.doctor?.clinicName}</p>
                            <p>{rx.doctor?.clinicAddress}</p>
                        </>
                    )}
                </div>

                <div className="patient-details">

                    <p>
                        <FaUser />
                        <strong> Patient :</strong> {rx.patient?.name}
                    </p>

                    <p>
                        <FaCalendarAlt />
                        <strong> Date :</strong> {rx.date}
                    </p>

                </div>

                <div className="section">

                    <h4>
                        <FaNotesMedical /> Diagnosis
                    </h4>

                    <p>{rx.diagnosis}</p>

                </div>

                <div className="section">

                    <h4>
                        <FaPills /> Prescription
                    </h4>

                    <ul>
                        {(rx.medicines || []).map((med, i) => (
                            <li key={i}>
                                {med.name}{med.strength ? ` ${med.strength}` : ""}{med.dosage ? ` - ${med.dosage}` : ""}{med.frequency ? ` - ${med.frequency}` : ""}
                            </li>
                        ))}
                    </ul>

                </div>

                {rx.advice && (
                    <div className="section">

                        <h4>
                            <FaFileMedical /> Doctor Advice
                        </h4>

                        <p>{rx.advice}</p>

                    </div>
                )}

                <div className="action-buttons">

                    <button
                        className="edit-btn"
                        onClick={() => navigate(`/doctor/edit-prescription/${id}`)}
                    >
                        <FaEdit />
                        Edit
                    </button>

                    <button className="print-btn" onClick={handlePrint}>
                        <FaPrint />
                        Print
                    </button>

                    <button className="download-btn" onClick={handleDownload}>
                        <FaDownload />
                        Download PDF
                    </button>

                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={sending}
                    >
                        {sending
                            ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                            : <FaPaperPlane />
                        }
                        {sending ? "Sending…" : "Send to Patient"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorPrescriptionPreview;