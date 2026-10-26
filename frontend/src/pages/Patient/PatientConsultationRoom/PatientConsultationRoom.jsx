import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  FaPaperPlane,
  FaSpinner,
  FaArrowLeft,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientConsultationRoom.css";

const API_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

/* ─── Helpers ────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#0d9488", "#7c3aed", "#0284c7", "#d97706", "#dc2626",
  "#16a34a", "#9333ea", "#0891b2", "#b45309",
];
function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  const clean = name.replace(/^Dr\.?\s*/i, "").trim().split(/\s+/);
  return clean.length === 1 ? clean[0][0]?.toUpperCase() : ((clean[0][0] || "") + (clean[clean.length - 1][0] || "")).toUpperCase();
}

function PatientConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Data States
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Call States: waiting | in_progress | completed
  const [callState, setCallState] = useState("waiting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showPrescription, setShowPrescription] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Local media stream references
  const patientVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // PDF Generation States
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState("");
  const [pdfErrorMsg, setPdfErrorMsg] = useState("");
  const prescContentRef = useRef(null);

  // In-session Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatMessagesEndRef = useRef(null);

  const timerIdRef = useRef(null);

  // 1. Fetch real appointment from database
  useEffect(() => {
    let isMounted = true;

    async function loadAppointment() {
      if (!id) {
        setLoading(false);
        setError("Invalid consultation reference.");
        return;
      }

      setLoading(true);
      setError(null);
      setUnauthorized(false);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUnauthorized(true);
          setError("You must be logged in as a patient to join this consultation.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/patient/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.status === 401 || res.status === 403) {
          setUnauthorized(true);
          setError(data.message || "You are not authorized to join this consultation.");
        } else if (res.status === 404 || !data.success || !data.data) {
          setError(data.message || "Consultation record not found in the database.");
        } else {
          const appt = data.data;

          // Verify online consultation type
          const rawType = String(appt.type || "").toLowerCase();
          const isOnline = rawType.includes("online") || rawType.includes("video");

          if (!isOnline) {
            setError("This appointment is scheduled as an In-Person visit. Online consultation room is only available for telehealth video appointments.");
            setAppointment(appt);
            setLoading(false);
            return;
          }

          setAppointment(appt);

          // Determine initial call state based on real status
          const statusLower = String(appt.status || "").toLowerCase();
          if (statusLower === "completed") {
            setCallState("completed");
          } else if (statusLower === "in-progress") {
            setCallState("in_progress");
          } else {
            setCallState("waiting");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load consultation room appointment:", err);
          setError("Unable to connect to server. Please verify your connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAppointment();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Derived variables
  const doctor = appointment?.doctorId || {};
  const hospital = appointment?.hospitalId || {};
  const patient = appointment?.patientId || {};
  const consultation = appointment?.consultation || {};
  const prescription = appointment?.prescription || null;

  const displayId = appointment?.appointmentId || appointment?._id || id;
  const doctorName = doctor.name
    ? (doctor.name.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`)
    : "Doctor";
  const specialization = doctor.specialization || "Medical Specialist";
  const doctorPhoto = doctor.profileImage
    ? (doctor.profileImage.startsWith("http") ? doctor.profileImage : `${API_BASE}${doctor.profileImage}`)
    : null;
  const doctorInitials = getInitials(doctorName);
  const doctorColor = getAvatarColor(doctorName);

  const patientName = patient.name || "Patient";
  const patientAge = patient.dob
    ? `${Math.floor((new Date() - new Date(patient.dob)) / (365.25 * 24 * 60 * 60 * 1000))} Years`
    : null;
  const patientGender = patient.gender || null;
  const patientAgeGender = [patientAge, patientGender].filter(Boolean).join(" / ") || "Not specified";

  const normStatus = String(appointment?.status || "").toLowerCase();
  const meetingLink = appointment?.meetingLink || consultation?.meetingLink || "";

  // Real prescription medicines
  const realMedicines = Array.isArray(prescription?.medicines) ? prescription.medicines : [];
  const hasPrescription = !!prescription && realMedicines.length > 0;
  const prescriptionDiagnosis = prescription?.diagnosis || consultation?.diagnosis || "";
  const prescriptionAdvice = prescription?.advice || consultation?.advice || "";
  const prescriptionDate = prescription?.createdAt
    ? new Date(prescription.createdAt).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  // Duration calculation
  let recordedDurationText = "";
  if (consultation.startedAt && consultation.endedAt) {
    const elapsedMins = Math.round((new Date(consultation.endedAt) - new Date(consultation.startedAt)) / 60000);
    recordedDurationText = `${Math.max(1, elapsedMins)} Mins`;
  }

  // 2. Local User Media Check / Initializer for In-Progress State
  useEffect(() => {
    let isMounted = true;

    async function initWebcam() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: true,
        });

        if (isMounted) {
          mediaStreamRef.current = stream;
          setHasCamera(true);
          setCameraError(false);
          if (patientVideoRef.current) {
            patientVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.info("Webcam / microphone access optional/unavailable:", err);
        if (isMounted) {
          setHasCamera(false);
          setCameraError(true);
        }
      }
    }

    if (callState === "in_progress") {
      initWebcam();
    }

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [callState]);

  // Keep video ref updated if element mounts after stream ready
  useEffect(() => {
    if (patientVideoRef.current && mediaStreamRef.current && hasCamera) {
      patientVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [hasCamera, isVideoOff, callState]);

  // 3. Timer count-up for active call
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

  // 4. Media Device Controls
  const handleToggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
  };

  const handleToggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
  };

  // 5. In-session Chat Handling (Real, non-simulated)
  useEffect(() => {
    if (isChatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: Date.now(),
      sender: "patient",
      senderName: "You",
      text: newMessage.trim(),
      time: currentTimeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");
  };

  // 6. Prescription PDF Generation from Real Data
  const handleDownloadPDF = async () => {
    if (!prescContentRef.current || !hasPrescription || !realMedicines.length) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMsg("");
    setPdfErrorMsg("");

    try {
      const element = prescContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      const fileName = `Prescription_${displayId}.pdf`;
      pdf.save(fileName);

      setPdfSuccessMsg(`E-Prescription downloaded successfully (${fileName})`);
      setTimeout(() => setPdfSuccessMsg(""), 5000);
    } catch (error) {
      console.error("Prescription PDF generation error:", error);
      setPdfErrorMsg("Unable to generate PDF prescription. Please try again.");
      setTimeout(() => setPdfErrorMsg(""), 5000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 7. End Call & Cancel Handlers
  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    // If appointment is already completed in backend, show summary; otherwise return to details
    if (normStatus === "completed") {
      setCallState("completed");
    } else {
      navigate(`/patient/consultation/${appointment?._id || id}`);
    }
  };

  const handleCancelCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate(`/patient/consultation/${appointment?._id || id}`);
  };

  /* ── Loading View ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="ocr-page" style={{ alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <FaSpinner className="ocr-spin" style={{ fontSize: "2.5rem", color: "#0d9488", marginBottom: "1rem" }} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>Connecting to consultation room...</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Verifying patient permissions and loading session data from database.
        </p>
      </div>
    );
  }

  /* ── Error / Not Found / Unauthorized View ─────────────────── */
  if (error || !appointment) {
    return (
      <div className="ocr-page" style={{ alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "2rem" }}>
        <FaExclamationCircle style={{ fontSize: "3rem", color: "#ef4444", marginBottom: "1.25rem" }} />
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {unauthorized ? "Access Denied" : "Unable to Join Consultation"}
        </h2>
        <p style={{ color: "#94a3b8", maxWidth: "500px", lineHeight: 1.5, marginBottom: "1.75rem" }}>
          {error || "We could not find a valid online consultation for this reference."}
        </p>
        <button className="ocr-btn-cancel" onClick={() => navigate("/patient/consultation")} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <FaArrowLeft /> Back to Consultations
        </button>
      </div>
    );
  }

  return (
    <div className="ocr-page">
      {/* ──────────────────────────────────────────────────────────────
         STATE 1: Waiting for Doctor / Session Initiation
         ────────────────────────────────────────────────────────────── */}
      {callState === "waiting" && (
        <div className="ocr-waiting">
          <div className="ocr-waiting-avatar-wrapper">
            {!imageError && doctorPhoto ? (
              <img
                src={doctorPhoto}
                alt={doctorName}
                className="ocr-waiting-avatar"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="ocr-waiting-avatar-fallback"
                style={{ background: `linear-gradient(135deg, ${doctorColor}cc, ${doctorColor}66)` }}
              >
                {doctorInitials}
              </div>
            )}
            <div className="ocr-waiting-pulse1"></div>
            <div className="ocr-waiting-pulse2"></div>
          </div>

          <h2 className="ocr-waiting-title">Consultation Room</h2>
          <p className="ocr-waiting-docname">{doctorName}</p>
          <p className="ocr-waiting-spec">{specialization}</p>

          <div className="ocr-waiting-status-bar" style={{ maxWidth: "420px" }}>
            <div className="ocr-waiting-spinner"></div>
            <span>
              {normStatus === "in-progress"
                ? `Dr. ${doctorName.replace(/^Dr\.?\s*/i, "")} has initiated the consultation.`
                : `Waiting for ${doctorName} to start the session...`}
            </span>
          </div>

          <div style={{ margin: "1.25rem 0", color: "#94a3b8", fontSize: "0.85rem", maxWidth: "400px", lineHeight: 1.5 }}>
            🔒 End-to-end encrypted medical consultation. Video calling service requires active session initiation by the consulting doctor.
          </div>

          {meetingLink && (
            <div style={{ marginBottom: "1.25rem" }}>
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#0d9488",
                  color: "#ffffff",
                  padding: "0.75rem 1.25rem",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                <FaVideo /> Open Live Meeting Link <FaExternalLinkAlt style={{ fontSize: "0.75rem" }} />
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className="ocr-btn-presc"
              style={{ background: "#1e293b", color: "#f8fafc", border: "1px solid #334155" }}
              onClick={() => setCallState("in_progress")}
            >
              Enter Room & Preview Media
            </button>
            <button className="ocr-btn-cancel" onClick={handleCancelCall}>
              Cancel & Leave
            </button>
          </div>
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
              <span>Telehealth Consultation • Session #{displayId}</span>
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
                {!imageError && doctorPhoto ? (
                  <img
                    src={doctorPhoto}
                    alt={doctorName}
                    className="ocr-video-avatar"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div
                    className="ocr-video-avatar-fallback"
                    style={{ background: `linear-gradient(135deg, ${doctorColor}cc, ${doctorColor}66)` }}
                  >
                    {doctorInitials}
                  </div>
                )}
                <div className="ocr-video-username">{doctorName}</div>
                <div className="ocr-video-usersub">
                  {specialization} • {normStatus === "in-progress" ? "Doctor In Consultation" : "Awaiting Remote Stream"}
                </div>

                {meetingLink ? (
                  <div style={{ marginTop: "1rem" }}>
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "#0d9488",
                        color: "#fff",
                        padding: "0.6rem 1.1rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <FaVideo /> Connect via External Video Provider <FaExternalLinkAlt style={{ fontSize: "0.7rem" }} />
                    </a>
                  </div>
                ) : (
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                    Telehealth video calling server awaiting provider connection.
                  </div>
                )}
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

            {/* Patient PIP Overlay View with Real Webcam */}
            <div className="ocr-patient-video-feed">
              {isVideoOff || !hasCamera ? (
                <div style={{ textAlign: "center", padding: "0.5rem" }}>
                  <FaVideoSlash style={{ fontSize: "1.5rem", color: "#ef4444", marginBottom: "0.25rem" }} />
                  <div className="ocr-pip-label" style={{ color: "#ef4444" }}>
                    {cameraError ? "Camera Unavailable" : "Camera Off"}
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={patientVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                      transform: "scaleX(-1)",
                    }}
                  />
                  <div
                    className="ocr-pip-label"
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      left: "4px",
                      background: "rgba(0,0,0,0.6)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                    }}
                  >
                    You (Self)
                  </div>
                </>
              )}
            </div>

            {/* In-Call Interactive Messaging Chat Modal / Panel */}
            {isChatOpen && (
              <div className="ocr-chat-panel">
                <div className="ocr-chat-header">
                  <div className="ocr-chat-header-info">
                    <FaRegComments className="ocr-chat-header-icon" />
                    <div>
                      <h4 className="ocr-chat-title">Consultation Notes & Chat</h4>
                      <span className="ocr-chat-status">
                        <span className="ocr-chat-status-dot" /> Session #{displayId}
                      </span>
                    </div>
                  </div>
                  <button
                    className="ocr-chat-close-btn"
                    onClick={() => setIsChatOpen(false)}
                    title="Close Chat"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="ocr-chat-body">
                  <div className="ocr-chat-notice">
                    🔒 Notes taken during this consultation session are stored locally for this active view.
                  </div>

                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#64748b", padding: "2rem 1rem", fontSize: "0.85rem" }}>
                      No messages recorded yet. Type below to record session observations.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`ocr-chat-bubble-wrap ${
                          msg.sender === "patient" ? "ocr-chat-patient" : "ocr-chat-doctor"
                        }`}
                      >
                        <div className="ocr-chat-sender-name">{msg.senderName}</div>
                        <div className="ocr-chat-bubble">
                          <p className="ocr-chat-text">{msg.text}</p>
                          <span className="ocr-chat-time">{msg.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>

                <form className="ocr-chat-footer" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="ocr-chat-input"
                    placeholder="Type your message or notes..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="ocr-chat-send-btn"
                    disabled={!newMessage.trim()}
                    title="Send Message"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Call Room Action Controls */}
          <div className="ocr-controls-bar">
            <button
              className={`ocr-control-btn ocr-btn-mute ${isMuted ? "active" : ""}`}
              onClick={handleToggleMic}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>

            <button
              className={`ocr-control-btn ocr-btn-video ${isVideoOff ? "active" : ""}`}
              onClick={handleToggleVideo}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
            </button>

            <button
              className={`ocr-control-btn ocr-btn-chat ${isChatOpen ? "active" : ""}`}
              onClick={() => setIsChatOpen(!isChatOpen)}
              title={isChatOpen ? "Close Consultation Chat" : "Open Consultation Chat"}
            >
              <FaRegComments />
              {!isChatOpen && messages.length > 0 && (
                <span className="ocr-chat-unread-dot" title="New message" />
              )}
            </button>

            <button
              className="ocr-control-btn ocr-btn-end"
              onClick={handleEndCall}
              title="Leave Consultation Room"
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
            Your virtual appointment with {doctorName} has concluded.
            You can review the consultation summary or view your electronic prescription below.
          </p>

          <div className="ocr-summary-card">
            <div className="ocr-summary-doc">
              {!imageError && doctorPhoto ? (
                <img
                  src={doctorPhoto}
                  alt={doctorName}
                  className="ocr-summary-avatar-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div
                  className="ocr-summary-avatar-fallback"
                  style={{ background: `linear-gradient(135deg, ${doctorColor}cc, ${doctorColor}66)` }}
                >
                  {doctorInitials}
                </div>
              )}
              <div className="ocr-summary-docinfo">
                <h3 className="ocr-summary-docname">{doctorName}</h3>
                <p className="ocr-summary-docspec">{specialization}</p>
              </div>
            </div>

            <div className="ocr-summary-details">
              <div>
                <div className="ocr-summary-label">Session ID</div>
                <div className="ocr-summary-val">{displayId}</div>
              </div>
              <div>
                <div className="ocr-summary-label">Duration</div>
                <div className="ocr-summary-val">
                  {recordedDurationText || (timerSeconds > 0 ? formatTimer(timerSeconds) : "Standard Session")}
                </div>
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
      {showPrescription &&
        createPortal(
          <div className="ocr-presc-modal-overlay">
            <div className="ocr-presc-modal">
              <div className="ocr-presc-header">
                <h3 className="ocr-presc-title">E-Prescription</h3>
                <button className="ocr-presc-close" onClick={() => setShowPrescription(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="ocr-presc-content" ref={prescContentRef}>
                <div className="ocr-presc-clinic-info">
                  <h4 className="ocr-presc-clinic-name">MedicoBridge Digital Clinic</h4>
                  <p className="ocr-presc-clinic-sub">Telehealth Division • www.medicobridge.com</p>
                </div>

                <div className="ocr-presc-meta-grid">
                  <div>
                    <div className="ocr-presc-meta-row">
                      <strong>Doctor:</strong> {doctorName}
                    </div>
                    <div>
                      <strong>Specialization:</strong> {specialization}
                    </div>
                    {hospital.name && (
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        <strong>Facility:</strong> {hospital.name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="ocr-presc-meta-row">
                      <strong>Patient:</strong> {patientName}
                    </div>
                    <div>
                      <strong>Age/Sex:</strong> {patientAgeGender}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      <strong>Prescription ID:</strong> {prescription?.prescriptionId || `#RX-${displayId}`}
                    </div>
                  </div>
                </div>

                <h3 className="ocr-presc-rx">Rx</h3>

                {hasPrescription ? (
                  <>
                    {prescriptionDiagnosis && (
                      <div style={{ marginBottom: "0.75rem", fontSize: "0.9rem", color: "#334155" }}>
                        <strong>Diagnosis:</strong> {prescriptionDiagnosis}
                      </div>
                    )}

                    <ul className="ocr-presc-med-list">
                      {realMedicines.map((med, index) => (
                        <li key={med._id || index} className="ocr-presc-med-item">
                          <div className="ocr-presc-med-name">
                            {index + 1}. {med.name}
                          </div>
                          <div className="ocr-presc-med-dosage">
                            Dosage: {med.dosage || "As directed"}
                            {med.frequency ? ` • ${med.frequency}` : ""}
                            {med.duration ? ` • ${med.duration}` : ""}
                            {med.timing ? ` (${med.timing})` : ""}
                          </div>
                          {med.instructions && (
                            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                              Instructions: {med.instructions}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    {prescriptionAdvice && (
                      <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#475569" }}>
                        <strong>Advice:</strong> {prescriptionAdvice}
                      </div>
                    )}

                    <div className="ocr-presc-footer">
                      <div>Date: {prescriptionDate}</div>
                      <div className="ocr-presc-sig">
                        Digitally Signed By
                        <br />
                        <strong>{doctorName}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748b" }}>
                    <FaExclamationCircle style={{ fontSize: "2.2rem", color: "#94a3b8", marginBottom: "0.75rem" }} />
                    <p style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>
                      No prescription available
                    </p>
                    <p style={{ fontSize: "0.85rem", marginTop: "0.25rem", color: "#64748b" }}>
                      The consulting doctor has not issued an electronic prescription for this consultation yet.
                    </p>
                  </div>
                )}
              </div>

              {pdfSuccessMsg && (
                <div className="ocr-presc-feedback ocr-presc-feedback--success">
                  {pdfSuccessMsg}
                </div>
              )}
              {pdfErrorMsg && (
                <div className="ocr-presc-feedback ocr-presc-feedback--error">
                  {pdfErrorMsg}
                </div>
              )}

              {hasPrescription ? (
                <button
                  className="ocr-presc-btn-download"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <>
                      <FaSpinner className="ocr-spin" style={{ marginRight: "0.5rem" }} /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FaDownload style={{ marginRight: "0.5rem" }} /> Download Prescription PDF
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="ocr-presc-btn-download"
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                  No Prescription Available to Download
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default PatientConsultationRoom;
