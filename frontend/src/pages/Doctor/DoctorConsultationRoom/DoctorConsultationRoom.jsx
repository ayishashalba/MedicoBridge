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
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./DoctorConsultationRoom.css";
import {
  doctorAppointmentsList,
  markConsultationJoined,
} from "../../../services/doctorAppointmentsData";

// Patient Profiles for realistic video feed
const PATIENT_PROFILES = {
  "1": {
    patient: "Rahul Nair",
    photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=900",
    initials: "RN",
    avatarColor: "#0d9488",
    age: 32,
    gender: "Male",
  },
  "2": {
    patient: "Anjali Thomas",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=900",
    initials: "AT",
    avatarColor: "#7c3aed",
    age: 27,
    gender: "Female",
  },
  "3": {
    patient: "Arun Kumar",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=900",
    initials: "AK",
    avatarColor: "#0284c7",
    age: 41,
    gender: "Male",
  },
  "4": {
    patient: "Meera Pillai",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=900",
    initials: "MP",
    avatarColor: "#d97706",
    age: 35,
    gender: "Female",
  },
  "5": {
    patient: "Suresh Babu",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=900",
    initials: "SB",
    avatarColor: "#dc2626",
    age: 58,
    gender: "Male",
  },
};

const DOCTOR_SAMPLE_PHOTO =
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400";

function DoctorConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find appointment details
  const apptFromData = doctorAppointmentsList.find(
    (a) => String(a.id) === String(id)
  );

  const profileFromMap = PATIENT_PROFILES[String(id)] || {};

  const appointment = {
    id: id || "1",
    patient: profileFromMap.patient || apptFromData?.patient || "Rahul Nair",
    initials: profileFromMap.initials || apptFromData?.initials || "RN",
    avatarColor: profileFromMap.avatarColor || apptFromData?.avatarColor || "#0d9488",
    photo: profileFromMap.photo || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=900",
    complaint: apptFromData?.complaint || "Type 2 Diabetes Mellitus Follow-up",
    symptoms: apptFromData?.symptoms || "Fever, Headache, Body Pain",
    age: profileFromMap.age || apptFromData?.age || 32,
    gender: profileFromMap.gender || apptFromData?.gender || "Male",
  };

  // Video Call Interactive States
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [hasRealDoctorCamera, setHasRealDoctorCamera] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [patientImageLoaded, setPatientImageLoaded] = useState(true);

  const doctorVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Mark as joined
  useEffect(() => {
    if (id) {
      markConsultationJoined(id);
    }
  }, [id]);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format MM:SS
  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Initialize Doctor Camera Feed (Webcam with fallback to doctor face preview)
  useEffect(() => {
    let isMounted = true;

    async function initCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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
        console.info("Webcam access optional/unavailable, using doctor preview stream.", err);
        if (isMounted) {
          setHasRealDoctorCamera(false);
          setCameraError(true);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Toggle Microphone
  const handleToggleMic = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
  };

  // Toggle Doctor Camera
  const handleToggleVideo = () => {
    const nextVideoOff = !isVideoOff;
    setIsVideoOff(nextVideoOff);

    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !nextVideoOff;
      });
    }
  };

  // Toggle Speaker / Patient Audio
  const handleToggleSpeaker = () => {
    setIsSpeakerMuted((prev) => !prev);
  };

  // Toggle Screen Share
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          setIsScreenSharing(true);
          displayStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        } catch (err) {
          console.info("Screen sharing cancelled or unavailable", err);
          setIsScreenSharing(!isScreenSharing);
        }
      } else {
        setIsScreenSharing(true);
      }
    }
  };

  // Toggle Fullscreen
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

  // Clean End Call
  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate(-1);
  };

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
          <span className="cr-header-id">ID: APT-204{appointment.id}</span>
        </div>
      </div>

      <div className="consultation-container">
        {/* Left Side — Video Consultation Layout */}
        <div className="video-section" ref={videoContainerRef}>
          {/* Main Video Viewport (Patient Feed) */}
          <div className="dvr-video-viewport">
            {/* Patient Mock/Live Video Feed */}
            <div className="dvr-patient-feed">
              {patientImageLoaded ? (
                <img
                  src={appointment.photo}
                  alt={appointment.patient}
                  className="dvr-patient-image"
                  onError={() => setPatientImageLoaded(false)}
                />
              ) : (
                <div
                  className="dvr-patient-fallback-avatar"
                  style={{ background: appointment.avatarColor }}
                >
                  <FaUser className="dvr-avatar-icon" />
                  <span className="dvr-avatar-initials">{appointment.initials}</span>
                </div>
              )}

              {/* Ambient Telehealth Overlay Effects */}
              <div className="dvr-video-overlay-gradient" />
              <div className="dvr-live-scanline" />
            </div>

            {/* Top Left: Patient Stream Info & Audio Activity */}
            <div className="dvr-top-left-badge">
              <div className="dvr-patient-tag">
                <span className="dvr-pulse-dot" />
                <span className="dvr-patient-name">{appointment.patient}</span>
                <span className="dvr-patient-role">(Patient)</span>
              </div>
              <div className="dvr-audio-activity" title="Patient Audio Active">
                <span className="dvr-wave-bar bar-1" />
                <span className="dvr-wave-bar bar-2" />
                <span className="dvr-wave-bar bar-3" />
                <span className="dvr-wave-bar bar-4" />
              </div>
            </div>

            {/* Top Right: Live Call Status, Duration Timer & HD Badge */}
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

            {/* Bottom Left: Security & Patient Details Pill */}
            <div className="dvr-bottom-left-info">
              <div className="dvr-security-pill">
                <FaLock />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="dvr-patient-quick-meta">
                <span>{appointment.age} yrs, {appointment.gender}</span>
              </div>
            </div>

            {/* Floating Doctor Camera Preview (PIP) */}
            <div className={`dvr-doctor-pip ${isVideoOff ? "dvr-pip--video-off" : ""}`}>
              <div className="dvr-pip-inner">
                {/* Doctor Live Webcam Video Feed */}
                {hasRealDoctorCamera && !cameraError && (
                  <video
                    ref={doctorVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`dvr-doctor-video ${isVideoOff ? "dvr-hidden" : ""}`}
                  />
                )}

                {/* Fallback Doctor Preview / Photo when real webcam is not available */}
                {(!hasRealDoctorCamera || cameraError) && !isVideoOff && (
                  <div className="dvr-doctor-mock-feed">
                    <img
                      src={DOCTOR_SAMPLE_PHOTO}
                      alt="Doctor Camera"
                      className="dvr-doctor-photo"
                    />
                    <div className="dvr-pip-live-indicator">LIVE PREVIEW</div>
                  </div>
                )}

                {/* When Doctor Video is Muted/Off */}
                {isVideoOff && (
                  <div className="dvr-doctor-off-screen">
                    <FaUserMd className="dvr-doc-off-icon" />
                    <span className="dvr-doc-off-text">Camera Off</span>
                  </div>
                )}

                {/* Doctor Preview Overlay Badges */}
                <div className="dvr-pip-footer">
                  <span className="dvr-pip-name">You (Doctor)</span>
                  <span
                    className={`dvr-pip-mic-status ${
                      isMuted ? "dvr-pip-mic--muted" : "dvr-pip-mic--active"
                    }`}
                    title={isMuted ? "Mic Muted" : "Mic Active"}
                  >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Consultation Controls Bar */}
          <div className="video-controls-bar">
            {/* Mic Toggle */}
            <button
              className={`ctrl-btn ${isMuted ? "ctrl-btn--muted" : "ctrl-btn--active"}`}
              onClick={handleToggleMic}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span className="ctrl-btn-label">{isMuted ? "Unmute" : "Mute"}</span>
            </button>

            {/* Camera Toggle */}
            <button
              className={`ctrl-btn ${isVideoOff ? "ctrl-btn--video-off" : "ctrl-btn--active"}`}
              onClick={handleToggleVideo}
              title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              <span className="ctrl-btn-label">{isVideoOff ? "Start Video" : "Stop Video"}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              className={`ctrl-btn ${isScreenSharing ? "ctrl-btn--highlight" : ""}`}
              onClick={handleToggleScreenShare}
              title="Share Screen"
            >
              <FaDesktop />
              <span className="ctrl-btn-label">{isScreenSharing ? "Sharing" : "Share"}</span>
            </button>

            {/* Speaker / Volume Toggle */}
            <button
              className={`ctrl-btn ${isSpeakerMuted ? "ctrl-btn--muted" : ""}`}
              onClick={handleToggleSpeaker}
              title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
            >
              {isSpeakerMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              <span className="ctrl-btn-label">{isSpeakerMuted ? "Muted" : "Speaker"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              className="ctrl-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
              <span className="ctrl-btn-label">View</span>
            </button>

            {/* End Call Button */}
            <button
              className="end-call-btn"
              onClick={handleEndCall}
              title="End Video Consultation"
            >
              <FaPhoneSlash />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Right Side — Preserved Existing Consultation Notes Panel */}
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
            placeholder={`Example:
Paracetamol 650mg - 1 Tablet - Twice Daily
Vitamin C - 1 Tablet - Morning`}
          />

          <label>Doctor Advice</label>
          <textarea rows="3" placeholder="Enter doctor's advice..." />

          <button
            className="save-btn"
            onClick={() =>
              navigate(`/doctor/prescription-preview/${appointment.id || 1}`)
            }
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