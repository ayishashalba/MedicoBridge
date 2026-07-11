import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaNotesMedical,
    FaPills,
    FaFileMedical,
    FaPrint,
    FaDownload,
    FaPaperPlane,
    FaEdit,
} from "react-icons/fa";
import "./DoctorPrescriptionPreview.css";

function DoctorPrescriptionPreview() {
    const navigate = useNavigate();

    return (
        <div className="prescription-preview">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <div className="preview-card">

                <h2>Prescription Preview</h2>

                <div className="doctor-info">
                    <h3>Dr. Ayisha Shalba</h3>
                    <p>Cardiologist</p>
                    <p>MedicoBridge Hospital</p>
                </div>

                <div className="patient-details">

                    <p>
                        <FaUser />
                        <strong> Patient :</strong> Rahul Nair
                    </p>

                    <p>
                        <FaCalendarAlt />
                        <strong> Date :</strong> 20 July 2026
                    </p>

                </div>

                <div className="section">

                    <h4>
                        <FaNotesMedical /> Diagnosis
                    </h4>

                    <p>Viral Fever with Mild Headache</p>

                </div>

                <div className="section">

                    <h4>
                        <FaPills /> Prescription
                    </h4>

                    <ul>
                        <li>Paracetamol 650mg - 1 Tablet - Morning & Night</li>
                        <li>Vitamin C - 1 Tablet - Morning</li>
                        <li>ORS - Drink after meals</li>
                    </ul>

                </div>

                <div className="section">

                    <h4>
                        <FaFileMedical /> Doctor Advice
                    </h4>

                    <p>
                        Drink plenty of water, take proper rest and review after 5 days.
                    </p>

                </div>

                <div className="action-buttons">

                    <button
                        className="edit-btn"
                        onClick={() => navigate("/doctor/edit-prescription/1")}
                    >
                        <FaEdit />
                        Edit
                    </button>

                    <button className="print-btn">
                        <FaPrint />
                        Print
                    </button>

                    <button className="download-btn">
                        <FaDownload />
                        Download PDF
                    </button>

                    <button
                        className="send-btn"
                        onClick={() => navigate("/doctor/prescription-success")}
                    >
                        <FaPaperPlane />
                        Send to Patient
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DoctorPrescriptionPreview;