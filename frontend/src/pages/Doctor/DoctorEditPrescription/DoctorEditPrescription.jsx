import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaPills,
    FaSave,
} from "react-icons/fa";
import "./DoctorEditPrescription.css";

function DoctorEditPrescription() {
    const navigate = useNavigate();

    return (
        <div className="prescription-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft />
                Back
            </button>

            <div className="prescription-card">

                <h2>Create Prescription</h2>

                <div className="patient-info">

                    <p>
                        <FaUser />
                        <strong> Patient :</strong> Rahul Nair
                    </p>

                    <p>
                        <FaCalendarAlt />
                        <strong> Date :</strong> 20 July 2026
                    </p>

                </div>

                <label>Diagnosis</label>

                <textarea
                    rows="3"
                    placeholder="Enter diagnosis..."
                />

                <label>Medicines</label>

                <textarea
                    rows="5"
                    placeholder="Example:
Paracetamol 650mg - 1 Tablet - Twice Daily
Vitamin C - 1 Tablet - Morning"
                />

                <label>Advice</label>

                <textarea
                    rows="3"
                    placeholder="Doctor's advice..."
                />

                <button className="save-btn">
                    <FaSave />
                    Save Prescription
                </button>

            </div>

        </div>
    );
}

export default DoctorEditPrescription;