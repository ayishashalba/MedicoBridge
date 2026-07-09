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
                    <FaUser />
                    <span><strong>Patient:</strong> {appointment.patient}</span>
                </div>

                <div className="detail-row">
                    <FaUser />
                    <span><strong>Age:</strong> {appointment.age}</span>
                </div>

                <div className="detail-row">
                    <FaUser />
                    <span><strong>Gender:</strong> {appointment.gender}</span>
                </div>

                <div className="detail-row">
                    <FaCalendarAlt />
                    <span><strong>Date:</strong> {appointment.date}</span>
                </div>

                <div className="detail-row">
                    <FaClock />
                    <span><strong>Time:</strong> {appointment.time}</span>
                </div>

                <div className="detail-row">
                    <FaVideo />
                    <span><strong>Consultation:</strong> {appointment.type}</span>
                </div>

                <div className="detail-row">
                    <FaNotesMedical />
                    <span><strong>Symptoms:</strong> {appointment.symptoms}</span>
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