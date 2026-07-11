import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCheckCircle,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaTachometerAlt,
    FaCalendarCheck,
} from "react-icons/fa";
import "./DoctorPrescriptionSuccess.css";

function DoctorPrescriptionSuccess() {
    const navigate = useNavigate();

    return (
        <div className="prescription-success-page">

            <div className="success-card">

                <FaCheckCircle className="success-icon" />

                <h2>Prescription Sent Successfully</h2>

                <p className="success-message">
                    The prescription has been shared with Rahul Nair.
                </p>

                <div className="success-details">

                    <div className="detail-row">
                        <FaUser />
                        <span className="label">Patient</span>
                        <span className="colon">:</span>
                        <span className="value">Rahul Nair</span>
                    </div>

                    <div className="detail-row">
                        <FaCalendarAlt />
                        <span className="label">Date</span>
                        <span className="colon">:</span>
                        <span className="value">20 July 2026</span>
                    </div>

                    <div className="detail-row">
                        <FaClock />
                        <span className="label">Time</span>
                        <span className="colon">:</span>
                        <span className="value">10:45 AM</span>
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