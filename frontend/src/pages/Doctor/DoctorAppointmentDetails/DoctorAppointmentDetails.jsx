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
                    <div className="detail-icon">
                        <FaUser />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Patient:</strong> {appointment.patient}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaUser />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Age:</strong> {appointment.age}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaUser />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Gender:</strong> {appointment.gender}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaCalendarAlt />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Date:</strong> {appointment.date}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaClock />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Time:</strong> {appointment.time}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaVideo />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Consultation:</strong> {appointment.type}</span>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-icon">
                        <FaNotesMedical />
                    </div>
                    <div className="detail-content">
                        <span className="detail-value"><strong>Symptoms:</strong> {appointment.symptoms}</span>
                    </div>
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