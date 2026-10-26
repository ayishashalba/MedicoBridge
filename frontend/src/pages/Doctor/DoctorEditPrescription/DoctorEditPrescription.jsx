import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaPills,
    FaSave,
    FaSpinner,
} from "react-icons/fa";
import "./DoctorEditPrescription.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/* ─── Helpers ─────────────────────────────────────────────────── */
function formatDate(dateInput) {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * DoctorEditPrescription — create or update a real prescription for an appointment.
 *
 * Route: /doctor/edit-prescription/:id   (id = appointment _id OR existing prescription _id)
 *
 * Strategy:
 *  1. Try fetching as appointment  → GET /api/doctor/appointments/:id
 *  2. If that fails, try as prescription → GET /api/prescriptions/:id
 *     (for the "edit existing" case navigated from View Prescription)
 */
function DoctorEditPrescription() {
    const navigate = useNavigate();
    const { id } = useParams(); // appointment _id or prescription _id

    /* ── Load State ── */
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    /* ── Context data ── */
    const [patientName, setPatientName] = useState("");
    const [patientId, setPatientId] = useState(null);          // MongoDB Patient _id
    const [appointmentId, setAppointmentId] = useState(null);  // MongoDB Appointment _id
    const [appointmentDate, setAppointmentDate] = useState("");
    const [existingPrescriptionId, setExistingPrescriptionId] = useState(null);

    /* ── Form fields ── */
    const [diagnosis, setDiagnosis] = useState("");
    const [medicinesText, setMedicinesText] = useState("");
    const [advice, setAdvice] = useState("");

    /* ── Save state ── */
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    /* ── Load data from backend ── */
    useEffect(() => {
        if (!id) {
            setLoadError("No appointment or prescription ID provided.");
            setLoading(false);
            return;
        }

        async function fetchData() {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Try appointment endpoint first
            try {
                const res = await fetch(`${API_BASE}/api/doctor/appointments/${id}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    const appt = data?.data?.appointment;
                    if (appt) {
                        setPatientName(appt.patientId?.name || "Unknown Patient");
                        setPatientId(appt.patientId?._id || appt.patientId);
                        setAppointmentId(appt._id);
                        setAppointmentDate(formatDate(appt.date));

                        // Pre-fill from existing prescription if present
                        if (appt.prescriptionId) {
                            const rxRes = await fetch(`${API_BASE}/api/doctor/prescriptions`, { headers });
                            if (rxRes.ok) {
                                const rxData = await rxRes.json();
                                const rxList = rxData?.data || [];
                                const existing = rxList.find(
                                    (p) =>
                                        String(p._id) === String(appt.prescriptionId) ||
                                        (String(p.patientId?._id || p.patientId) === String(appt.patientId?._id || appt.patientId))
                                );
                                if (existing) {
                                    setExistingPrescriptionId(existing._id);
                                    setDiagnosis(existing.diagnosis || "");
                                    setAdvice(existing.advice || "");
                                    const meds = (existing.medicines || [])
                                        .map((m) => {
                                            const parts = [m.name, m.dosage, m.frequency, m.duration].filter(Boolean);
                                            return parts.join(" - ");
                                        })
                                        .join("\n");
                                    setMedicinesText(meds);
                                }
                            }
                        }
                        setLoadError(null);
                        return;
                    }
                }
            } catch { /* fall through to prescription lookup */ }

            // 2. Try fetching as a prescription _id (edit existing prescription flow)
            try {
                const rxListRes = await fetch(`${API_BASE}/api/doctor/prescriptions`, { headers });
                if (rxListRes.ok) {
                    const rxData = await rxListRes.json();
                    const rxList = rxData?.data || [];
                    const existing = rxList.find((p) => String(p._id) === String(id));
                    if (existing) {
                        setExistingPrescriptionId(existing._id);
                        setPatientName(existing.patientId?.name || "Unknown Patient");
                        setPatientId(existing.patientId?._id || existing.patientId);
                        setAppointmentId(null);
                        setAppointmentDate(formatDate(existing.createdAt));
                        setDiagnosis(existing.diagnosis || "");
                        setAdvice(existing.advice || "");
                        const meds = (existing.medicines || [])
                            .map((m) => {
                                const parts = [m.name, m.dosage, m.frequency, m.duration].filter(Boolean);
                                return parts.join(" - ");
                            })
                            .join("\n");
                        setMedicinesText(meds);
                        setLoadError(null);
                        return;
                    }
                }
            } catch { /* fall through */ }

            setLoadError("Could not load appointment or prescription data.");
        }

        fetchData().finally(() => setLoading(false));
    }, [id]);

    /* ── Save Prescription ── */
    const handleSave = async () => {
        if (!medicinesText.trim()) {
            setSaveError("Please enter at least one medicine before saving.");
            return;
        }
        if (!patientId) {
            setSaveError("Patient information is missing. Cannot save prescription.");
            return;
        }

        setSaving(true);
        setSaveError(null);

        try {
            const token = localStorage.getItem("token");
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            // Parse medicines — each non-empty line becomes a medicine entry
            const medicines = medicinesText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const parts = line.split("-").map((p) => p.trim());
                    return {
                        name: parts[0] || line,
                        dosage: parts[1] || "",
                        frequency: parts[2] || "",
                        duration: parts[3] || "",
                    };
                });

            let savedId;

            if (existingPrescriptionId) {
                // UPDATE existing prescription
                const res = await fetch(`${API_BASE}/api/prescriptions/${existingPrescriptionId}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({
                        medicines,
                        diagnosis: diagnosis.trim(),
                        advice: advice.trim(),
                    }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Update failed (${res.status})`);
                }
                savedId = existingPrescriptionId;
            } else {
                // CREATE new prescription
                const body = {
                    patientId,
                    medicines,
                    diagnosis: diagnosis.trim(),
                    advice: advice.trim(),
                };
                if (appointmentId) body.consultationId = appointmentId;

                const res = await fetch(`${API_BASE}/api/prescriptions`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Create failed (${res.status})`);
                }
                const data = await res.json();
                savedId = data?.data?._id;
            }

            // Navigate to the prescription preview with the real saved ID
            navigate(`/doctor/prescription-preview/${savedId || id}`);
        } catch (err) {
            console.error("Save prescription error:", err);
            setSaveError(err.message || "Failed to save prescription. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    /* ─── Render ─────────────────────────────────────── */
    if (loading) {
        return (
            <div className="prescription-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "2rem", color: "#0ea5e9" }} />
            </div>
        );
    }

    return (
        <div className="prescription-page">

            <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft />
                Back
            </button>

            <div className="prescription-card">

                <h2>{existingPrescriptionId ? "Edit Prescription" : "Create Prescription"}</h2>

                {loadError && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.75rem 1rem", color: "#b91c1c", fontSize: "0.9rem", marginBottom: "1rem" }}>
                        {loadError}
                    </div>
                )}

                <div className="patient-info">
                    <p>
                        <FaUser />
                        <strong> Patient :</strong> {patientName}
                    </p>
                    <p>
                        <FaCalendarAlt />
                        <strong> Date :</strong> {appointmentDate || "—"}
                    </p>
                </div>

                <label>Diagnosis</label>
                <textarea
                    rows="3"
                    placeholder="Enter diagnosis..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                />

                <label>Medicines</label>
                <textarea
                    rows="5"
                    placeholder={`Example:\nParacetamol 650mg - 1 Tablet - Twice Daily\nVitamin C - 1 Tablet - Morning`}
                    value={medicinesText}
                    onChange={(e) => setMedicinesText(e.target.value)}
                />

                <label>Advice</label>
                <textarea
                    rows="3"
                    placeholder="Doctor's advice..."
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                />

                {saveError && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.75rem 1rem", color: "#b91c1c", fontSize: "0.9rem", marginTop: "1rem" }}>
                        {saveError}
                    </div>
                )}

                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                        <FaSave />
                    )}
                    {saving ? "Saving..." : "Save Prescription"}
                </button>

            </div>

        </div>
    );
}

export default DoctorEditPrescription;