import React, { useState, useEffect, useCallback } from "react";
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
    FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorPatientDetails.css";

const API_BASE = "http://localhost:5000";

/* ─── Info Row Sub-component ─────────────────────────────────── */
function InfoRow({ icon, label, value }) {
    return (
        <div className="pd-info-row">
            <span className="pd-info-icon">{icon}</span>
            <div className="pd-info-content">
                <span className="pd-info-label">{label}</span>
                <span className="pd-info-value">{value || "Not Provided"}</span>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
function DoctorPatientDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatientDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to view patient details.");
                navigate("/login");
                return;
            }

            const res = await fetch(`${API_BASE}/api/doctor/patients/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }

            if (res.status === 403) {
                setError("Access denied. You are not authorized to view this patient's details.");
                setLoading(false);
                return;
            }

            if (res.status === 404) {
                setError("Patient record not found.");
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (data.success && data.data) {
                setPatient(data.data);
            } else {
                setError(data.message || "Failed to load patient details.");
            }
        } catch (err) {
            console.error("Error fetching patient details:", err);
            setError("An error occurred while fetching patient details.");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchPatientDetails();
    }, [fetchPatientDetails]);

    if (loading) {
        return (
            <div className="pd-page">
                <button className="pd-back-btn" onClick={() => navigate("/doctor/patients")}>
                    <FaArrowLeft />
                    Back to Patients
                </button>
                <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
                    <FaSpinner className="mr-spin" style={{ fontSize: "2rem", marginBottom: "12px", color: "#0d9488" }} />
                    <h2>Loading Patient Details...</h2>
                    <p>Fetching clinical records from database.</p>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="pd-page">
                <button className="pd-back-btn" onClick={() => navigate("/doctor/patients")}>
                    <FaArrowLeft />
                    Back to Patients
                </button>
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", marginTop: "20px", border: "1px solid #e2e8f0" }}>
                    <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "16px" }} />
                    <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>{error || "Patient Not Found"}</h2>
                    <p style={{ color: "#64748b", marginBottom: "24px" }}>The requested patient record could not be loaded or accessed.</p>
                    <button
                        className="pd-action-btn pd-action-btn--records"
                        style={{ margin: "0 auto" }}
                        onClick={() => navigate("/doctor/patients")}
                    >
                        Return to Patients List
                    </button>
                </div>
            </div>
        );
    }

    const patientData = patient;

    const handleStartConsultation = () => {
        if (patientData.activeAppointmentId) {
            navigate(`/doctor/consultation-room/${patientData.activeAppointmentId}`);
        } else {
            toast.info("No active appointment found for this patient. Please schedule or confirm an appointment first.");
        }
    };

    return (
        <div className="pd-page">

            {/* ── Back Button ────────────────────────────────── */}
            <button className="pd-back-btn" onClick={() => navigate("/doctor/patients")}>
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
                                {typeof patientData.age === "number" ? `${patientData.age} Years` : (patientData.age || "Age Not Provided")}
                            </span>
                            <span className="pd-badge pd-badge--gender">
                                <FaVenusMars />
                                {patientData.gender || "Not Provided"}
                            </span>
                            <span className="pd-badge pd-badge--blood">
                                <FaTint />
                                {patientData.bloodGroup || "Not Provided"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="pd-hero-right">
                    <div className="pd-last-visit">
                        <FaCalendarAlt />
                        <div>
                            <span className="pd-lv-label">Last Visit</span>
                            <span className="pd-lv-date">{patientData.lastVisit || "None recorded"}</span>
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
                        {patientData.emergencyContact ? (
                            <div className="pd-emergency-card">
                                <div className="pd-emergency-avatar">
                                    {(patientData.emergencyContact.name || "E").charAt(0).toUpperCase()}
                                </div>
                                <div className="pd-emergency-info">
                                    <span className="pd-emergency-name">{patientData.emergencyContact.name}</span>
                                    <span className="pd-emergency-relation">{patientData.emergencyContact.relation || "Contact"}</span>
                                    <span className="pd-emergency-phone">
                                        <FaPhone /> {patientData.emergencyContact.phone || "Not Provided"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="pd-history-text" style={{ color: "#94a3b8" }}>No emergency contact recorded for this patient.</p>
                        )}
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
                                <span className="pd-stat-val">{patientData.height || "Not Provided"}</span>
                                <span className="pd-stat-lbl">Height</span>
                            </div>
                            <div className="pd-stat-tile pd-stat-tile--weight">
                                <FaWeight />
                                <span className="pd-stat-val">{patientData.weight || "Not Provided"}</span>
                                <span className="pd-stat-lbl">Weight</span>
                            </div>
                            <div className="pd-stat-tile pd-stat-tile--bmi">
                                <FaHeartbeat />
                                <span className="pd-stat-val">{patientData.bmi || "Not Provided"}</span>
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
                        <p className="pd-history-text">
                            {patientData.medicalHistorySummary || "No prior clinical history recorded in database."}
                        </p>
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
                        {patientData.allergies && patientData.allergies.length > 0 ? (
                            <div className="pd-tag-list">
                                {patientData.allergies.map((allergy, i) => (
                                    <span key={i} className="pd-tag pd-tag--allergy">
                                        <FaExclamationTriangle />
                                        {allergy}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="pd-history-text" style={{ color: "#94a3b8" }}>No known allergies recorded.</p>
                        )}
                    </div>

                    {/* Medical Conditions */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <FaHeartbeat className="pd-section-icon pd-section-icon--primary" />
                            <h2 className="pd-section-title">Medical Conditions</h2>
                        </div>
                        {patientData.medicalConditions && patientData.medicalConditions.length > 0 ? (
                            <div className="pd-condition-list">
                                {patientData.medicalConditions.map((cond, i) => (
                                    <div key={i} className="pd-condition-item">
                                        <FaCheckCircle className="pd-condition-icon" />
                                        <span>{cond}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="pd-history-text" style={{ color: "#94a3b8" }}>No chronic conditions recorded.</p>
                        )}
                    </div>

                    {/* Current Medications */}
                    <div className="pd-section">
                        <div className="pd-section-header">
                            <FaPills className="pd-section-icon pd-section-icon--purple" />
                            <h2 className="pd-section-title">Current Medications</h2>
                        </div>
                        {patientData.currentMedications && patientData.currentMedications.length > 0 ? (
                            <div className="pd-med-list">
                                {patientData.currentMedications.map((med, i) => (
                                    <div key={i} className="pd-med-item">
                                        <div className="pd-med-icon-wrap">
                                            <FaPills />
                                        </div>
                                        <div className="pd-med-info">
                                            <span className="pd-med-name">{med.name}</span>
                                            <span className="pd-med-meta">
                                                <FaClock /> {med.frequency} {med.since ? `· Since ${med.since}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="pd-history-text" style={{ color: "#94a3b8" }}>No active medications on record.</p>
                        )}
                    </div>

                    {/* Upcoming Appointment */}
                    <div className="pd-section pd-section--upcoming">
                        <div className="pd-section-header">
                            <FaCalendarCheck className="pd-section-icon pd-section-icon--success" />
                            <h2 className="pd-section-title">Upcoming Appointment</h2>
                        </div>
                        {patientData.upcomingAppointment ? (
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
                                <span className={`pd-appt-type-badge pd-appt-type-badge--${patientData.upcomingAppointment.type?.toLowerCase().includes("video") || patientData.upcomingAppointment.type?.toLowerCase().includes("online") ? "video" : "inperson"}`}>
                                    {patientData.upcomingAppointment.type?.toLowerCase().includes("video") || patientData.upcomingAppointment.type?.toLowerCase().includes("online") ? <FaVideo /> : <FaUser />}
                                    {patientData.upcomingAppointment.type}
                                </span>
                            </div>
                        ) : (
                            <p className="pd-history-text" style={{ color: "#94a3b8", padding: "12px 0" }}>No upcoming appointments scheduled.</p>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Recent Prescriptions ─────────────────────────────── */}
            <div className="pd-section pd-section--full">
                <div className="pd-section-header">
                    <FaNotesMedical className="pd-section-icon pd-section-icon--primary" />
                    <h2 className="pd-section-title">Recent Prescriptions</h2>
                </div>
                {patientData.recentPrescriptions && patientData.recentPrescriptions.length > 0 ? (
                    <div className="pd-rx-grid">
                        {patientData.recentPrescriptions.map((rx) => (
                            <div key={rx.id || rx._id} className="pd-rx-card">
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
                ) : (
                    <p className="pd-history-text" style={{ color: "#94a3b8" }}>No recent prescriptions found for this patient.</p>
                )}
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
                    onClick={handleStartConsultation}
                >
                    <FaVideo />
                    Start Consultation
                </button>
            </div>

        </div>
    );
}

export default DoctorPatientDetails;