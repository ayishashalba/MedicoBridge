import React from "react";
import {
    FaArrowLeft,
    FaMicrophone,
    FaVideo,
    FaPhoneSlash,
    FaSave,
    FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DoctorConsultationRoom.css";

function DoctorConsultationRoom() {
    const navigate = useNavigate();

    return (
        <div className="consultation-room">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft />
                Back
            </button>

            <div className="consultation-container">

                {/* Left Side */}

                <div className="video-section">

                    <div className="video-box">
                        <FaUser className="patient-icon" />
                        <h3>Rahul Nair</h3>
                        <p>Patient Video (UI Only)</p>
                    </div>

                    <div className="video-controls">

                        <button className="icon-btn">
                            <FaMicrophone />
                        </button>

                        <button className="icon-btn">
                            <FaVideo />
                        </button>

                        <button className="end-btn">
                            <FaPhoneSlash />
                            End Call
                        </button>

                    </div>

                </div>

                {/* Right Side */}

                <div className="notes-section">

                    <h2>Consultation Notes</h2>

                    <label>Symptoms</label>
                    <textarea
                        rows="3"
                        placeholder="Enter symptoms..."
                    />

                    <label>Diagnosis</label>
                    <textarea
                        rows="3"
                        placeholder="Enter diagnosis..."
                    />

                    <label>Prescription</label>
                    <textarea
                        rows="4"
                        placeholder="Enter medicines..."
                    />

                    <button
                        className="save-btn"
                        onClick={() => navigate("/doctor/prescription/new/1")}
                    >
                        <FaSave />
                        Save Consultation
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorConsultationRoom;