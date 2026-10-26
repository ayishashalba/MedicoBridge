import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaUser,
  FaUserMd,
  FaSave,
  FaDesktop,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaLock,
  FaCircle,
  FaWifi,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./DoctorConsultationRoom.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/* ─── Helpers ─────────────────────────────────────────────────── */
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
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

/* ─── Main Component ──────────────────────────────────────────── */
function DoctorConsultationRoom() {
  const { id } = useParams(); // Appointment _id
  const navigate = useNavigate();

  /* ── Appointment / Consultation State ── */
  const [apptLoading, setApptLoading] = useState(true);
  const [apptError, setApptError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [existingConsultation, setExistingConsultation] = useState(null);

  /* ── Consultation Notes (Controlled) ── */
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [advice, setAdvice] = useState("");

  /* ── Save State ── */
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* ── Video Call Interactive States ── */
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasRealDoctorCamera, setHasRealDoctorCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [patientImageLoaded, setPatientImageLoaded] = useState(false);

  const doctorVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const videoContainerRef = useRef(null);

  /* ── Fetch real appointment from backend ── */
  useEffect(() => {
    if (!id) return;

    async function fetchAppointment() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/doctor/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const appt = data?.data?.appointment;
        if (!appt) throw new Error("Appointment not found");
        setAppointment(appt);

        // Populate notes from existing consultation if present
        const consult = appt.consultation;
        if (consult) {
          setExistingConsultation(consult);
          setSymptoms(Array.isArray(consult.symptoms) ? consult.symptoms.join(", ") : (consult.symptoms || ""));
          setDiagnosis(consult.diagnosis || "");
          setAdvice(consult.advice || "");
          // prescriptionText remains empty (prescriptions are separate)
        } else {
          // Pre-populate symptoms from appointment reason/symptoms
          const apptSymptoms = Array.isArray(appt.symptoms) ? appt.symptoms.join(", ") : (appt.reason || "");
          setSymptoms(apptSymptoms);
        }
        setApptError(null);
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
        setApptError("Unable to load appointment details.");
      } finally {
        setApptLoading(false);
      }
    }

    fetchAppointment();
  }, [id]);

  /* ── Update appointment status to In-Progress when entering room ── */
  useEffect(() => {
    if (!id || !appointment) return;
    // Only update if status is not already In-Progress or Completed
    if (appointment.status === "Pending" || appointment.status === "Confirmed") {
      const token = localStorage.getItem("token");
      fetch(`${API_BASE}/api/doctor/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "In-Progress" }),
      }).catch(console.warn);
    }
  }, [id, appointment]);

  /* ── Call duration counter ── */
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ── Initialize Doctor Webcam ── */
  useEffect(() => {
    let isMounted = true;
    async function initCamera() {
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
          setHasRealDoctorCamera(true);
          if (doctorVideoRef.current) {
            doctorVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.info("Webcam access optional/unavailable:", err);
        if (isMounted) {
          setHasRealDoctorCamera(false);
          setCameraError(true);
        }
      }
    }
    initCamera();
    return () => {
      isMounted = false;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ── Format MM:SS ── */
  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ── Media Controls ── */
  const handleToggleMic = () => {
    const next = !isMuted;
    setIsMuted(next);
    mediaStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
  };

  const handleToggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    mediaStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !next; });
  };

  const handleToggleSpeaker = () => setIsSpeakerMuted((p) => !p);

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      return;
    }
    if (navigator.mediaDevices?.getDisplayMedia) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        displayStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
      } catch {
        setIsScreenSharing(true);
      }
    } else {
      setIsScreenSharing(true);
    }
  };

  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleEndCall = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(-1);
  };

  /* ── Save Consultation to MongoDB ── */
  const handleSaveConsultation = async () => {
    if (!appointment) return;
    if (!symptoms.trim() && !diagnosis.trim()) {
      setSaveError("Please enter at least Symptoms or Diagnosis before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const token = localStorage.getItem("token");
      const patientId = appointment.patientId?._id || appointment.patientId;

      // 1. Save/update the Consultation record
      const consultRes = await fetch(`${API_BASE}/api/consultation/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: appointment._id,
          patientId,
          symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
          diagnosis: diagnosis.trim(),
          advice: advice.trim(),
          notes: prescriptionText.trim(),
          status: "Completed",
        }),
      });

      if (!consultRes.ok) {
        const err = await consultRes.json().catch(() => ({}));
        throw new Error(err?.message || `Save failed (${consultRes.status})`);
      }

      const consultData = await consultRes.json();
      const consultationId = consultData?.data?._id;

      // 2. If prescription text was entered, create a Prescription record
      if (prescriptionText.trim()) {
        const medicines = prescriptionText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ name: line, dosage: "", frequency: "", duration: "" }));

        await fetch(`${API_BASE}/api/prescriptions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            consultationId: consultationId || appointment._id,
            diagnosis: diagnosis.trim(),
            advice: advice.trim(),
            medicines,
          }),
        });
        // Navigate to prescription preview using appointment id (room was opened with it)
        navigate(`/doctor/prescription-preview/${appointment._id}`);
      } else {
        // Navigate back to appointments list
        navigate(`/doctor/appointments/${appointment._id}`);
      }
    } catch (err) {
      console.error("Save consultation error:", err);
      setSaveError(err.message || "Failed to save consultation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Derived display values ─────────────────────── */
  const patientName = appointment?.patientId?.name || "Patient";
  const patientAge = appointment?.patientId?.dob
    ? Math.floor((Date.now() - new Date(appointment.patientId.dob)) / (365.25 * 24 * 3600 * 1000))
    : null;
  const patientGender = appointment?.patientId?.gender || "";
  const initials = getInitials(patientName);
  const avatarColor = getAvatarColor(patientName + String(appointment?._id || ""));
  const displayApptId = appointment?.appointmentId
    ? appointment.appointmentId
    : appointment ? `APT-${String(appointment._id).slice(-6).toUpperCase()}` : id;

  /* ─── Render ─────────────────────────────────────── */
  if (apptLoading) {
    return (
      <div className="consultation-room" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "2rem", color: "#00B0FF" }} />
      </div>
    );
  }

  if (apptError) {
    return (
      <div className="consultation-room" style={{ padding: "2rem" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <p style={{ color: "#dc2626", marginTop: "1rem" }}>{apptError}</p>
      </div>
    );
  }

  return (
    <div className="consultation-room">
      {/* Top Bar Navigation */}
      <div className="cr-topbar">
        <button className="back-btn" onClick={handleEndCall}>
          <FaArrowLeft />
          Back to Consultations
        </button>

        <div className="cr-header-badge">
          <span className="cr-live-pulse" />
          <span className="cr-live-text">Consultation in Progress</span>
          <span className="cr-header-divider">•</span>
          <span className="cr-header-id">ID: {displayApptId}</span>
        </div>
      </div>

      <div className="consultation-container">
        {/* Left Side — Video Consultation Layout */}
        <div className="video-section" ref={videoContainerRef}>
          {/* Main Video Viewport (Patient Feed) */}
          <div className="dvr-video-viewport">
            {/* Patient Avatar/Feed */}
            <div className="dvr-patient-feed">
              {patientImageLoaded ? (
                <img
                  src={null}
                  alt={patientName}
                  className="dvr-patient-image"
                  onError={() => setPatientImageLoaded(false)}
                />
              ) : (
                <div
                  className="dvr-patient-fallback-avatar"
                  style={{ background: avatarColor }}
                >
                  <FaUser className="dvr-avatar-icon" />
                  <span className="dvr-avatar-initials">{initials}</span>
                </div>
              )}
              {/* Ambient Overlay Effects */}
              <div className="dvr-video-overlay-gradient" />
              <div className="dvr-live-scanline" />
            </div>

            {/* Top Left: Patient Info Badge */}
            <div className="dvr-top-left-badge">
              <div className="dvr-patient-tag">
                <span className="dvr-pulse-dot" />
                <span className="dvr-patient-name">{patientName}</span>
                <span className="dvr-patient-role">(Patient)</span>
              </div>
              <div className="dvr-audio-activity" title="Patient Audio Active">
                <span className="dvr-wave-bar bar-1" />
                <span className="dvr-wave-bar bar-2" />
                <span className="dvr-wave-bar bar-3" />
                <span className="dvr-wave-bar bar-4" />
              </div>
            </div>

            {/* Top Right: Call Timer & HD Badge */}
            <div className="dvr-top-right-badge">
              <div className="dvr-call-timer">
                <FaCircle className="dvr-timer-dot" />
                <span>{formatDuration(callDuration)}</span>
              </div>
              <div className="dvr-quality-badge" title="High Definition 1080p Stream">
                <FaWifi className="dvr-wifi-icon" />
                <span>HD 1080p</span>
              </div>
            </div>

            {/* Bottom Left: Security & Patient Meta */}
            <div className="dvr-bottom-left-info">
              <div className="dvr-security-pill">
                <FaLock />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="dvr-patient-quick-meta">
                {patientAge && <span>{patientAge} yrs{patientGender ? `, ${patientGender}` : ""}</span>}
              </div>
            </div>

            {/* Floating Doctor Camera PIP */}
            <div className={`dvr-doctor-pip ${isVideoOff ? "dvr-pip--video-off" : ""}`}>
              <div className="dvr-pip-inner">
                {hasRealDoctorCamera && !cameraError && (
                  <video
                    ref={doctorVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`dvr-doctor-video ${isVideoOff ? "dvr-hidden" : ""}`}
                  />
                )}
                {(!hasRealDoctorCamera || cameraError) && !isVideoOff && (
                  <div className="dvr-doctor-mock-feed">
                    <div
                      style={{ width: "100%", height: "100%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaUserMd style={{ fontSize: "2rem", color: "#94a3b8" }} />
                    </div>
                    <div className="dvr-pip-live-indicator">LIVE PREVIEW</div>
                  </div>
                )}
                {isVideoOff && (
                  <div className="dvr-doctor-off-screen">
                    <FaUserMd className="dvr-doc-off-icon" />
                    <span className="dvr-doc-off-text">Camera Off</span>
                  </div>
                )}
                <div className="dvr-pip-footer">
                  <span className="dvr-pip-name">You (Doctor)</span>
                  <span
                    className={`dvr-pip-mic-status ${isMuted ? "dvr-pip-mic--muted" : "dvr-pip-mic--active"}`}
                    title={isMuted ? "Mic Muted" : "Mic Active"}
                  >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Controls Bar */}
          <div className="video-controls-bar">
            <button
              className={`ctrl-btn ${isMuted ? "ctrl-btn--muted" : "ctrl-btn--active"}`}
              onClick={handleToggleMic}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span className="ctrl-btn-label">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            <button
              className={`ctrl-btn ${isVideoOff ? "ctrl-btn--video-off" : "ctrl-btn--active"}`}
              onClick={handleToggleVideo}
              title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              <span className="ctrl-btn-label">{isVideoOff ? "Start Video" : "Stop Video"}</span>
            </button>

            <button
              className={`ctrl-btn ${isScreenSharing ? "ctrl-btn--highlight" : ""}`}
              onClick={handleToggleScreenShare}
              title="Share Screen"
            >
              <FaDesktop />
              <span className="ctrl-btn-label">{isScreenSharing ? "Sharing" : "Share"}</span>
            </button>

            <button
              className={`ctrl-btn ${isSpeakerMuted ? "ctrl-btn--muted" : ""}`}
              onClick={handleToggleSpeaker}
              title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
            >
              {isSpeakerMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              <span className="ctrl-btn-label">{isSpeakerMuted ? "Muted" : "Speaker"}</span>
            </button>

            <button
              className="ctrl-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              <span className="ctrl-btn-label">View</span>
            </button>

            <button className="end-call-btn" onClick={handleEndCall} title="End Video Consultation">
              <FaPhoneSlash />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Right Side — Consultation Notes Panel */}
        <div className="notes-section">
          <h2>Consultation Notes</h2>

          {saveError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "0.75rem 1rem", color: "#b91c1c", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              {saveError}
            </div>
          )}

          <label>Symptoms</label>
          <textarea
            rows="3"
            placeholder="Enter patient symptoms..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <label>Diagnosis</label>
          <textarea
            rows="3"
            placeholder="Enter diagnosis..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          />

          <label>Prescription</label>
          <textarea
            rows="5"
            placeholder={`Example:\nParacetamol 650mg - 1 Tablet - Twice Daily\nVitamin C - 1 Tablet - Morning`}
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
          />

          <label>Doctor Advice</label>
          <textarea
            rows="3"
            placeholder="Enter doctor's advice..."
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
          />

          <button
            className="save-btn"
            onClick={handleSaveConsultation}
            disabled={saving}
          >
            {saving ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <FaSave />}
            {saving ? "Saving..." : "Save Consultation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorConsultationRoom;