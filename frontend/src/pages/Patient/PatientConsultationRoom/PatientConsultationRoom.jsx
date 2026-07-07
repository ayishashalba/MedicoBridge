import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhone,
  FaRegComments,
  FaClock,
  FaCheckCircle,
  FaDownload,
  FaTimes,
  FaUserCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import "./PatientConsultationRoom.css";

/* ─── Extended Dummy Data ─────────────────────────────────────────── */
const consultationsData = {
  "MC-CON-101": {
    id: "MC-CON-101",
    doctorName: "Dr. Aisha Khan",
    specialization: "Cardiologist",
    hospital: "Apollo Hospitals",
    doctorPhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    initials: "AK",
    reason: "Experiencing mild chest discomfort and shortness of breath after exercise. Need a routine consultation.",
    patientName: "John Doe",
    patientAge: "30 Years",
    patientGender: "Male",
  },
  "MC-CON-102": {
    id: "MC-CON-102",
    doctorName: "Dr. Rahul Verma",
    specialization: "Orthopedic Surgeon",
    hospital: "Fortis Healthcare",
    doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    initials: "RV",
    reason: "Follow-up for knee joint pain. MRI reports have been uploaded to medical records.",
    patientName: "John Doe",
    patientAge: "30 Years",
    patientGender: "Male",
  },
};

function PatientConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
  const [callState, setCallState] = useState("waiting"); // waiting -> in_progress -> completed
  const [waitingMessage, setWaitingMessage] = useState("Connecting to secure server...");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showPrescription, setShowPrescription] = useState(false);
  const [imageError, setImageError] = useState(false);

  const data = consultationsData[id] || consultationsData["MC-CON-101"];
  const timerIdRef = useRef(null);

  // 1. Waiting state transitions
  useEffect(() => {
    if (callState === "waiting") {
      const msgTimeout = setTimeout(() => {
        setWaitingMessage(`Waiting for ${data.doctorName} to join...`);
      }, 1500);

      const joinTimeout = setTimeout(() => {
        setCallState("in_progress");
      }, 4000);

      return () => {
        clearTimeout(msgTimeout);
        clearTimeout(joinTimeout);
      };
    }
  }, [callState, data.doctorName]);

  // 2. Timer count-up for active call
  useEffect(() => {
    if (callState === "in_progress") {
      timerIdRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    }

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [callState]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallState("completed");
  };

  const handleCancelCall = () => {
    navigate(`/patient/consultation/${id}`);
  };

  return (
    <div className="ocr-page">
      {/* ──────────────────────────────────────────────────────────────
         STATE 1: Waiting for Doctor
         ────────────────────────────────────────────────────────────── */}
      {callState === "waiting" && (
        <div className="ocr-waiting">
          <div className="ocr-waiting-avatar-wrapper">
            {!imageError && data.doctorPhoto ? (
              <img
                src={data.doctorPhoto}
                alt={data.doctorName}
                className="ocr-waiting-avatar"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="ocr-waiting-avatar-fallback">
                {data.initials}
              </div>
            )}
            <div className="ocr-waiting-pulse1"></div>
            <div className="ocr-waiting-pulse2"></div>
          </div>

          <h2 className="ocr-waiting-title">Joining Room</h2>
          <p className="ocr-waiting-docname">{data.doctorName}</p>
          <p className="ocr-waiting-spec">{data.specialization}</p>

          <div className="ocr-waiting-status-bar">
            <div className="ocr-waiting-spinner"></div>
            <span>{waitingMessage}</span>
          </div>

          <button className="ocr-btn-cancel" onClick={handleCancelCall}>
            Cancel & Leave
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
         STATE 2: In-Progress Call
         ────────────────────────────────────────────────────────────── */}
      {callState === "in_progress" && (
        <div className="ocr-active">
          <div className="ocr-active-header">
            <div className="ocr-active-title">
              <span className="ocr-active-badge">Live</span>
              <span>Telehealth Consultation</span>
            </div>
            <div className="ocr-timer-box">
              <FaClock />
              <span>{formatTimer(timerSeconds)}</span>
            </div>
          </div>

          <div className="ocr-video-stage">
            {/* Doctor's Main View */}
            <div className="ocr-doctor-video-feed">
              <div className="ocr-video-avatar-container">
                {!imageError && data.doctorPhoto ? (
                  <img
                    src={data.doctorPhoto}
                    alt={data.doctorName}
                    className="ocr-video-avatar"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="ocr-video-avatar-fallback">
                    {data.initials}
                  </div>
                )}
                <div className="ocr-video-username">{data.doctorName}</div>
                <div className="ocr-video-usersub">{data.specialization} • Connected</div>
              </div>

              {/* Floating audio visualization wave */}
              <div className="ocr-audio-wave">
                <div className="ocr-wave-bar"></div>
                <div className="ocr-wave-bar"></div>
                <div className="ocr-wave-bar"></div>
                <div className="ocr-wave-bar"></div>
                <div className="ocr-wave-bar"></div>
              </div>
            </div>

            {/* Patient PIP Overlay View */}
            <div className="ocr-patient-video-feed">
              {isVideoOff ? (
                <div style={{ textAlign: "center" }}>
                  <FaVideoSlash style={{ fontSize: "1.5rem", color: "#ef4444", marginBottom: "0.25rem" }} />
                  <div className="ocr-pip-label" style={{ color: "#ef4444" }}>Camera Off</div>
                </div>
              ) : (
                <>
                  <FaUserCircle className="ocr-pip-avatar" />
                  <div className="ocr-pip-label">You (Self)</div>
                </>
              )}
            </div>
          </div>

          {/* Call Room Action Controls */}
          <div className="ocr-controls-bar">
            <button
              className={`ocr-control-btn ocr-btn-mute ${isMuted ? "active" : ""}`}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            <button
              className={`ocr-control-btn ocr-btn-video ${isVideoOff ? "active" : ""}`}
              onClick={() => setIsVideoOff(!isVideoOff)}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </button>

            <button className="ocr-control-btn ocr-btn-chat" title="Simulated Room Details">
              <FaRegComments />
            </button>

            <button
              className="ocr-control-btn ocr-btn-end"
              onClick={handleEndCall}
              title="End Consultation"
            >
              <FaPhone style={{ transform: "rotate(135deg)" }} />
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
         STATE 3: Consultation Completed Screen
         ────────────────────────────────────────────────────────────── */}
      {callState === "completed" && (
        <div className="ocr-completed">
          <div className="ocr-success-ring">
            <FaCheckCircle />
          </div>

          <h2 className="ocr-completed-title">Consultation Completed</h2>
          <p className="ocr-completed-subtitle">
            Your virtual appointment with {data.doctorName} has ended successfully. 
            You can now view or download your prescription below.
          </p>

          <div className="ocr-summary-card">
            <div className="ocr-summary-doc">
              {!imageError && data.doctorPhoto ? (
                <img
                  src={data.doctorPhoto}
                  alt={data.doctorName}
                  className="ocr-summary-avatar-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="ocr-summary-avatar-fallback">
                  {data.initials}
                </div>
              )}
              <div className="ocr-summary-docinfo">
                <h3 className="ocr-summary-docname">{data.doctorName}</h3>
                <p className="ocr-summary-docspec">{data.specialization}</p>
              </div>
            </div>

            <div className="ocr-summary-details">
              <div>
                <div className="ocr-summary-label">Session ID</div>
                <div className="ocr-summary-val">{id}</div>
              </div>
              <div>
                <div className="ocr-summary-label">Total Duration</div>
                <div className="ocr-summary-val">15:24 Mins</div>
              </div>
            </div>
          </div>

          <div className="ocr-completed-actions">
            <button className="ocr-btn-presc" onClick={() => setShowPrescription(true)}>
              View Prescription
            </button>
            <button className="ocr-btn-home" onClick={() => navigate("/patient/consultation")}>
              Back to Consultations
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
         PRESCRIPTION VIEW MODAL (createPortal to render at body root)
         ────────────────────────────────────────────────────────────── */}
      {showPrescription && createPortal(
        <div className="ocr-presc-modal-overlay">
          <div className="ocr-presc-modal">
            <div className="ocr-presc-header">
              <h3 className="ocr-presc-title">E-Prescription</h3>
              <button className="ocr-presc-close" onClick={() => setShowPrescription(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="ocr-presc-content">
              <div className="ocr-presc-clinic-info">
                <h4 className="ocr-presc-clinic-name">MedicoBridge Digital Clinic</h4>
                <p className="ocr-presc-clinic-sub">Telehealth Division • www.medicobridge.com</p>
              </div>

              <div className="ocr-presc-meta-grid">
                <div>
                  <div className="ocr-presc-meta-row"><strong>Doctor:</strong> {data.doctorName}</div>
                  <div><strong>Spec:</strong> {data.specialization}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="ocr-presc-meta-row"><strong>Patient:</strong> {data.patientName}</div>
                  <div><strong>Age/Sex:</strong> {data.patientAge} / {data.patientGender}</div>
                </div>
              </div>

              <h3 className="ocr-presc-rx">Rx</h3>
              
              <ul className="ocr-presc-med-list">
                <li className="ocr-presc-med-item">
                  <div className="ocr-presc-med-name">1. Tab. Pantoprazole 40mg</div>
                  <div className="ocr-presc-med-dosage">Dosage: 1-0-0 (Before food) • 7 Days</div>
                </li>
                <li className="ocr-presc-med-item">
                  <div className="ocr-presc-med-name">2. Cap. Amoxicillin 500mg</div>
                  <div className="ocr-presc-med-dosage">Dosage: 1-0-1 (After food) • 5 Days</div>
                </li>
                <li className="ocr-presc-med-item">
                  <div className="ocr-presc-med-name">3. Tab. Paracetamol 650mg</div>
                  <div className="ocr-presc-med-dosage">Dosage: 1-0-1 (SOS - If fever) • 3 Days</div>
                </li>
              </ul>

              <div className="ocr-presc-footer">
                <div>
                  Date: {new Date().toLocaleDateString("en-IN")}
                </div>
                <div className="ocr-presc-sig">
                  Digitally Signed By<br />
                  <strong>{data.doctorName}</strong>
                </div>
              </div>
            </div>

            <button
              className="ocr-presc-btn-download"
              onClick={() => alert("E-Prescription download started (Simulated).")}
            >
              <FaDownload style={{ marginRight: "0.5rem" }} /> Download Prescription PDF
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default PatientConsultationRoom;
