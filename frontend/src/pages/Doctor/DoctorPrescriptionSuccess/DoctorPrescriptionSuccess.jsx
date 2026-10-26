import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaCheckCircle,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaTachometerAlt,
    FaCalendarCheck,
    FaSpinner,
} from "react-icons/fa";
import "./DoctorPrescriptionSuccess.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function DoctorPrescriptionSuccess() {
    const navigate  = useNavigate();
    const { id }    = useParams();

    const [info, setInfo]       = useState(null);   // { patientName, date, time }
    const [loading, setLoading] = useState(!!id);   // only fetch if id present

    /* ── Fetch prescription to get real patient name + sent timestamp ── */
    const fetchInfo = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) { setLoading(false); return; }

            const res  = await fetch(`${API_BASE}/api/prescriptions/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();

            if (res.ok) {
                const rx          = data.data || data;
                const sentAt      = rx.updatedAt || rx.createdAt
                    ? new Date(rx.updatedAt || rx.createdAt)
                    : new Date();

                setInfo({
                    patientName: rx.patient?.name || "Patient",
                    date: sentAt.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    }),
                    time: sentAt.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                });
            }
        } catch (err) {
            console.error("Failed to fetch prescription info:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    /* ── Derive display values — fall back gracefully if no id / fetch failed ── */
    const now         = new Date();
    const patientName = info?.patientName || "Patient";
    const displayDate = info?.date || now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const displayTime = info?.time || now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="prescription-success-page">

            <div className="success-card">

                {loading ? (
                    <FaSpinner
                        className="success-icon"
                        style={{ animation: "spin 1s linear infinite", opacity: 0.5 }}
                    />
                ) : (
                    <FaCheckCircle className="success-icon" />
                )}

                <h2>Prescription Sent Successfully</h2>

                <p className="success-message">
                    The prescription has been shared with {patientName}.
                </p>

                <div className="success-details">

                    <div className="detail-row">
                        <FaUser />
                        <span className="label">Patient</span>
                        <span className="colon">:</span>
                        <span className="value">
                            {loading ? <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "0.85rem" }} /> : patientName}
                        </span>
                    </div>

                    <div className="detail-row">
                        <FaCalendarAlt />
                        <span className="label">Date</span>
                        <span className="colon">:</span>
                        <span className="value">
                            {loading ? <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "0.85rem" }} /> : displayDate}
                        </span>
                    </div>

                    <div className="detail-row">
                        <FaClock />
                        <span className="label">Time</span>
                        <span className="colon">:</span>
                        <span className="value">
                            {loading ? <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "0.85rem" }} /> : displayTime}
                        </span>
                    </div>

                </div>

                <div className="success-actions">

                    <button
                        className="dashboard-btn"
                        onClick={() => navigate("/doctor/dashboard")}
                    >
                        <FaTachometerAlt />
                        Back to Dashboard
                    </button>

                    <button
                        className="appointments-btn"
                        onClick={() => navigate("/doctor/appointments")}
                    >
                        <FaCalendarCheck />
                        View Appointments
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorPrescriptionSuccess;