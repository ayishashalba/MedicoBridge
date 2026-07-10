import React from "react";
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaVideo,
    FaHospital,
    FaNotesMedical,
    FaPlay,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./DoctorAppointmentDetails.css";

function DoctorAppointmentDetails() {
    const navigate = useNavigate();

    const appointment = {
        patient: "Rahul Nair",
        age: 32,
        gender: "Male",
        date: "20 July 2026",
        time: "10:00 AM",
        type: "Online Consultation",
        symptoms: "Fever, Headache, Body Pain",
        status: "Today",
    };

    return (
        <div className="appointment-details-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <div className="details-card">

                <h2>Appointment Details</h2>

                <div className="detail-row">
                    <FaUser className="detail-icon" />
                    <span className="detail-label">Patient Name</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.patient}</span>
                </div>

                <div className="detail-row">
                    <FaUser className="detail-icon" />
                    <span className="detail-label">Age</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.age}</span>
                </div>

                <div className="detail-row">
                    <FaUser className="detail-icon" />
                    <span className="detail-label">Gender</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.gender}</span>
                </div>

                <div className="detail-row">
                    <FaCalendarAlt className="detail-icon" />
                    <span className="detail-label">Date</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.date}</span>
                </div>

                <div className="detail-row">
                    <FaClock className="detail-icon" />
                    <span className="detail-label">Time</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.time}</span>
                </div>

                <div className="detail-row">
                    <FaVideo className="detail-icon" />
                    <span className="detail-label">Consultation</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.type}</span>
                </div>

                <div className="detail-row">
                    <FaNotesMedical className="detail-icon" />
                    <span className="detail-label">Symptoms</span>
                    <span className="colon">:</span>
                    <span className="detail-value">{appointment.symptoms}</span>
                </div>

                <div className="button-group">

                    <button className="start-btn">
                        <FaPlay />
                        Start Consultation
                    </button>

                    <button className="history-btn">
                        <FaHospital />
                        Medical History
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorAppointmentDetails;