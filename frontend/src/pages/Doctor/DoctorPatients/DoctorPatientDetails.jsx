import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaUser,
    FaBirthdayCake,
    FaVenusMars,
    FaPhone,
    FaEnvelope,
    FaTint,
    FaHistory,
    FaNotesMedical,
    FaCalendarAlt,
    FaFileMedical,
} from "react-icons/fa";
import "./DoctorPatientDetails.css";

function DoctorPatientDetails() {
    const navigate = useNavigate();

    const patient = {
        name: "Rahul Nair",
        age: 32,
        gender: "Male",
        blood: "B+",
        phone: "+91 9876543210",
        email: "rahul@gmail.com",
        history: "Hypertension since 2022",
        allergies: "No Known Allergies",
        lastVisit: "20 July 2026",
    };

    return (
        <div className="patient-details-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <div className="patient-card">

                <div className="patient-header">

                    <div className="patient-avatar">
                        <FaUser />
                    </div>

                    <div>
                        <h2>{patient.name}</h2>
                        <p>Patient ID : PT-1024</p>
                    </div>

                </div>

                <div className="details-list">

                    <div className="detail-item">
                        <FaBirthdayCake />
                        <strong>Age</strong>
                        <span>{patient.age} Years</span>
                    </div>

                    <div className="detail-item">
                        <FaVenusMars />
                        <strong>Gender</strong>
                        <span>{patient.gender}</span>
                    </div>

                    <div className="detail-item">
                        <FaTint />
                        <strong>Blood Group</strong>
                        <span>{patient.blood}</span>
                    </div>

                    <div className="detail-item">
                        <FaPhone />
                        <strong>Phone</strong>
                        <span>{patient.phone}</span>
                    </div>

                    <div className="detail-item">
                        <FaEnvelope />
                        <strong>Email</strong>
                        <span>{patient.email}</span>
                    </div>

                    <div className="detail-item">
                        <FaCalendarAlt />
                        <strong>Last Visit</strong>
                        <span>{patient.lastVisit}</span>
                    </div>

                    <div className="detail-item">
                        <FaHistory />
                        <strong>Medical History</strong>
                        <span>{patient.history}</span>
                    </div>

                    <div className="detail-item">
                        <FaNotesMedical />
                        <strong>Allergies</strong>
                        <span>{patient.allergies}</span>
                    </div>

                </div>

                <div className="action-buttons">

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/doctor/medical-records")}
                    >
                        <FaFileMedical />
                        View Medical Records
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/doctor/prescriptions")}
                    >
                        <FaNotesMedical />
                        Previous Prescriptions
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorPatientDetails;