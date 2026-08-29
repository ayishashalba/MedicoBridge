import React, { useEffect } from "react";
import {
  FaArrowLeft,
  FaVideo,
  FaMicrophone,
  FaPhoneSlash,
  FaUser,
  FaSave,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./DoctorConsultationRoom.css";
import {
  doctorAppointmentsList,
  markConsultationJoined,
} from "../../../services/doctorAppointmentsData";

function DoctorConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment =
    doctorAppointmentsList.find((a) => String(a.id) === String(id)) || {
      id: id || "1",
      patient: "Rahul Nair",
      complaint: "Type 2 Diabetes Mellitus Follow-up",
      symptoms: "Fever, Headache, Body Pain",
    };

  useEffect(() => {
    if (id) {
      markConsultationJoined(id);
    }
  }, [id]);

  return (
    <div className="consultation-room">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
        Back
      </button>

      <div className="consultation-container">
        {/* Left Side */}
        <div className="video-section">
          <div className="video-box">
            <FaUser className="patient-icon" />
            <h3>{appointment.patient}</h3>
            <p>Patient Video (Live Consultation Room)</p>
          </div>

          <div className="video-controls">
            <button className="icon-btn" aria-label="Microphone">
              <FaMicrophone />
            </button>

            <button className="icon-btn" aria-label="Video">
              <FaVideo />
            </button>

            <button className="end-btn" onClick={() => navigate(-1)}>
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
            placeholder="Enter patient symptoms..."
            defaultValue={appointment.symptoms || ""}
          />

          <label>Diagnosis</label>
          <textarea
            rows="3"
            placeholder="Enter diagnosis..."
            defaultValue={appointment.complaint || ""}
          />

          <label>Prescription</label>
          <textarea
            rows="5"
            placeholder="Example:
Paracetamol 650mg - 1 Tablet - Twice Daily
Vitamin C - 1 Tablet - Morning"
          />

          <label>Doctor Advice</label>
          <textarea rows="3" placeholder="Enter doctor's advice..." />

          <button
            className="save-btn"
            onClick={() => navigate(`/doctor/prescription-preview/${appointment.id || 1}`)}
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