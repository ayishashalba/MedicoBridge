import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaClock,
  FaCalendarAlt,
  FaHospital,
  FaClinicMedical,
  FaUserMd,
  FaStethoscope,
  FaSearch,
  FaHourglassHalf,
  FaCheckCircle,
  FaVideoSlash,
  FaInfoCircle,
  FaMicrophone,
  FaTimes,
  FaStar,
  FaCheck,
  FaVolumeUp,
  FaUndo,
  FaSpinner,
} from "react-icons/fa";
import "./PatientConsultation.css";

/* ─── Status Configuration ────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending Approval",
    icon: <FaHourglassHalf />,
    badgeClass: "oc-status-badge--pending",
    cardClass: "oc-card--pending",
  },
  confirmed: {
    label: "Confirmed",
    icon: <FaCheckCircle />,
    badgeClass: "oc-status-badge--confirmed",
    cardClass: "oc-card--confirmed",
  },
  ready: {
    label: "Ready to Join",
    icon: <FaVideo />,
    badgeClass: "oc-status-badge--ready",
    cardClass: "oc-card--ready",
  },
  completed: {
    label: "Completed",
    icon: <FaCheckCircle />,
    badgeClass: "oc-status-badge--completed",
    cardClass: "oc-card--completed",
  },
};

/* ─── Helpers for Parsing & Generating Datetime ───────────────────── */
function parseDateTime(dateStr, timeStr) {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return new Date(`${dateStr}T${timeStr}`);
    let [_, hours, minutes, ampm] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch (e) {
    return new Date();
  }
}

function getMockDateTime(minutesOffset) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesOffset);
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  let hours = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes} ${ampm}`;
  
  return { date: dateStr, time: timeStr };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ─── Hardware Testing Sub-component ─────────────────────────────── */
function HardwareTestPanel() {
  const [stream, setStream] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedAudio, setSelectedAudio] = useState("");
  const [permission, setPermission] = useState("checking"); // checking, granted, denied
  const [micLevel, setMicLevel] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let activeStream = null;

    const startStream = async (videoSource, audioSource) => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      const constraints = {
        video: isCameraOn ? (videoSource ? { deviceId: { exact: videoSource } } : true) : false,
        audio: isMicOn ? (audioSource ? { deviceId: { exact: audioSource } } : true) : false,
      };

      try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = newStream;
        setStream(newStream);
        setPermission("granted");

        if (videoRef.current && isCameraOn) {
          videoRef.current.srcObject = newStream;
        }

        if (isMicOn) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(newStream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const level = Math.min(100, Math.floor((average / 128) * 100));
            setMicLevel(level);
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } else {
          setMicLevel(0);
        }
      } catch (err) {
        console.error("Hardware initialization failed", err);
        setPermission("denied");
      }
    };

    startStream(selectedVideo, selectedAudio);

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const video = devices.filter((d) => d.kind === "videoinput");
      const audio = devices.filter((d) => d.kind === "audioinput");
      setVideoDevices(video);
      setAudioDevices(audio);
      if (video.length && !selectedVideo) setSelectedVideo(video[0].deviceId);
      if (audio.length && !selectedAudio) setSelectedAudio(audio[0].deviceId);
    }).catch((err) => {
      console.warn("Could not enumerate devices", err);
    });

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedVideo, selectedAudio, isCameraOn, isMicOn]);

  const toggleCamera = () => setIsCameraOn(!isCameraOn);
  const toggleMic = () => setIsMicOn(!isMicOn);

  return (
    <div className="oc-hw-test-layout">
      <div className="oc-hw-preview-container">
        {permission === "checking" && (
          <div className="oc-hw-placeholder">
            <FaSpinner className="oc-spinner" />
            <p>Requesting camera & microphone permissions...</p>
          </div>
        )}
        {permission === "denied" && (
          <div className="oc-hw-placeholder oc-hw-placeholder--denied">
            <FaVideoSlash className="oc-hw-icon-error" />
            <p className="oc-hw-err-title">Permission Denied / No Devices Detected</p>
            <p className="oc-hw-err-desc">
              Please check your browser settings to grant camera and microphone access, or ensure they are plugged in.
            </p>
            <div className="oc-hw-mock-badge">💡 Simulated Mode Activated below for testing</div>
          </div>
        )}
        {permission === "granted" && (
          <>
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="oc-hw-video-feed"
              />
            ) : (
              <div className="oc-hw-placeholder">
                <FaVideoSlash style={{ fontSize: "2rem", color: "var(--text-muted)" }} />
                <p>Camera is turned off</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="oc-hw-controls">
        <div className="oc-hw-select-group">
          <label className="oc-hw-label">Camera</label>
          <select
            className="oc-hw-select"
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            disabled={permission === "denied" || !isCameraOn}
          >
            {videoDevices.length > 0 ? (
              videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${videoDevices.indexOf(d) + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default Web Camera (Simulated)</option>
            )}
          </select>
        </div>

        <div className="oc-hw-select-group">
          <label className="oc-hw-label">Microphone</label>
          <select
            className="oc-hw-select"
            value={selectedAudio}
            onChange={(e) => setSelectedAudio(e.target.value)}
            disabled={permission === "denied" || !isMicOn}
          >
            {audioDevices.length > 0 ? (
              audioDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${audioDevices.indexOf(d) + 1}`}
                </option>
              ))
            ) : (
              <option value="">Default Microphone (Simulated)</option>
            )}
          </select>
        </div>

        <div className="oc-hw-diagnostics">
          <h4 className="oc-hw-diag-title">Diagnostics Status</h4>
          
          <div className="oc-hw-diag-row">
            <span>Camera Input:</span>
            {permission === "denied" ? (
              <span className="oc-diag-badge oc-diag-badge--warning">🟠 Simulated Connection</span>
            ) : isCameraOn ? (
              <span className="oc-diag-badge oc-diag-badge--success">🟢 Connected & Live</span>
            ) : (
              <span className="oc-diag-badge oc-diag-badge--muted">⚪ Disabled</span>
            )}
          </div>

          <div className="oc-hw-diag-row">
            <span>Microphone Level:</span>
            <div className="oc-hw-meter-container">
              {permission === "denied" ? (
                <div className="oc-hw-meter-bar oc-hw-meter-bar--simulated" />
              ) : isMicOn ? (
                <div
                  className="oc-hw-meter-bar"
                  style={{ width: `${micLevel}%` }}
                />
              ) : (
                <div className="oc-hw-meter-bar" style={{ width: "0%" }} />
              )}
            </div>
          </div>
        </div>

        <div className="oc-hw-action-buttons">
          <button
            className={`oc-hw-toggle-btn ${!isCameraOn ? "oc-hw-toggle-btn--off" : ""}`}
            onClick={toggleCamera}
          >
            {isCameraOn ? <FaVideoSlash /> : <FaVideo />} {isCameraOn ? "Mute Video" : "Start Video"}
          </button>
          <button
            className={`oc-hw-toggle-btn ${!isMicOn ? "oc-hw-toggle-btn--off" : ""}`}
            onClick={toggleMic}
          >
            {isMicOn ? <FaMicrophone /> : <FaMicrophone />} {isMicOn ? "Mute Mic" : "Start Mic"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main PatientConsultation Component ─────────────────────────── */
function PatientConsultation() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Consultation states using relative schedules
  const [consultations, setConsultations] = useState([
    {
      id: "MC-CON-101",
      doctorName: "Dr. Aisha Khan",
      specialization: "Cardiologist",
      hospital: "Apollo Hospitals",
      type: "hospital",
      ...getMockDateTime(10), // Scheduled to start in 10 minutes (Join Active)
      status: "ready",
      doctorPhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
      initials: "AK",
      color: "#7c3aed",
      online: true,
      duration: "20–30 mins",
      fee: 800,
      paymentStatus: "Paid",
    },
    {
      id: "MC-CON-102",
      doctorName: "Dr. Rahul Verma",
      specialization: "Orthopedic Surgeon",
      hospital: "Fortis Healthcare",
      type: "hospital",
      ...getMockDateTime(45), // Scheduled in 45 minutes (Join Disabled)
      status: "confirmed",
      doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
      initials: "RV",
      color: "#0284c7",
      online: false,
      duration: "20–30 mins",
      fee: 700,
      paymentStatus: "Paid",
    },
    {
      id: "MC-CON-103",
      doctorName: "Dr. Priya Sharma",
      specialization: "Dermatologist",
      hospital: "Skin Care Clinic",
      type: "clinic",
      ...getMockDateTime(24 * 60), // Scheduled tomorrow (Join Disabled)
      status: "pending",
      doctorPhoto: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
      initials: "PS",
      color: "#0d9488",
      online: true,
      duration: "20–30 mins",
      fee: 600,
      paymentStatus: "Pending Approval",
    },
    {
      id: "MC-CON-104",
      doctorName: "Dr. Suresh Nair",
      specialization: "Neurologist",
      hospital: "AIIMS Hospital",
      type: "hospital",
      ...getMockDateTime(-60), // Completed 1 hr ago (Shows Completed layout)
      status: "completed",
      doctorPhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
      initials: "SN",
      color: "#f59e0b",
      online: false,
      duration: "30 mins",
      fee: 900,
      paymentStatus: "Paid",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  // Modals visibility state
  const [showHardwareTest, setShowHardwareTest] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [showCancel, setShowCancel] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState(null);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  // Timer loop for active countdown ticks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  const handleImageError = (docId) => {
    setImageErrors((prev) => ({ ...prev, [docId]: true }));
  };

  // Rescheduling Handlers
  const handleOpenReschedule = (id) => {
    const consult = consultations.find((c) => c.id === id);
    if (consult) {
      setRescheduleId(id);
      setRescheduleDate(consult.date);
      setRescheduleTime(consult.time);
      setShowReschedule(true);
    }
  };

  const handleSaveReschedule = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      alert("Please fill in both Date and Time fields.");
      return;
    }

    const scheduledDateObj = parseDateTime(rescheduleDate, rescheduleTime);
    if (scheduledDateObj < new Date()) {
      alert("Please select a future time slot for rescheduling.");
      return;
    }

    setConsultations((prev) =>
      prev.map((c) =>
        c.id === rescheduleId
          ? {
              ...c,
              date: rescheduleDate,
              time: rescheduleTime,
              status: c.status === "ready" ? "confirmed" : c.status,
            }
          : c
      )
    );
    setShowReschedule(false);
    showToast("Your consultation slot was successfully rescheduled!");
  };

  // Cancellation Handlers
  const handleOpenCancel = (id) => {
    setCancelId(id);
    setShowCancel(true);
  };

  const handleConfirmCancel = () => {
    setConsultations((prev) => prev.filter((c) => c.id !== cancelId));
    setShowCancel(false);
    showToast("Consultation cancelled successfully.");
  };

  // Join timing eligibility verification: Join becomes active 15m before and up to 30m after start time
  const isCallJoinable = (consult) => {
    if (consult.status !== "ready" && consult.status !== "confirmed") return false;
    const apptTime = parseDateTime(consult.date, consult.time);
    const diffMs = apptTime - currentTime;
    return diffMs <= 15 * 60 * 1000 && diffMs >= -30 * 60 * 1000;
  };

  // Format dynamic remaining time for countdown UI display
  const renderCountdown = (consult) => {
    if (consult.status === "completed" || consult.status === "pending") return null;

    const apptTime = parseDateTime(consult.date, consult.time);
    const diffMs = apptTime - currentTime;

    if (diffMs <= 0) {
      if (diffMs >= -30 * 60 * 1000) {
        return <span className="oc-countdown-tag oc-countdown-tag--active">🔴 Live Now</span>;
      }
      return <span className="oc-countdown-tag oc-countdown-tag--passed">Passed</span>;
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return (
        <span className="oc-countdown-tag oc-countdown-tag--near">
          Starts in {diffMins} min{diffMins !== 1 ? "s" : ""}
        </span>
      );
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return (
        <span className="oc-countdown-tag">
          Starts in {diffHours} hr{diffHours !== 1 ? "s" : ""}
        </span>
      );
    }

    const diffDays = Math.floor(diffHours / 24);
    return (
      <span className="oc-countdown-tag">
        Starts in {diffDays} day{diffDays !== 1 ? "s" : ""}
      </span>
    );
  };

  /* Filter and search consultations */
  const filteredConsultations = consultations.filter((c) => {
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    const matchesSearch =
      c.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  /* Calculate Counts for Stats */
  const totalCount = consultations.length;
  const readyCount = consultations.filter((c) => c.status === "ready").length;
  const confirmedCount = consultations.filter((c) => c.status === "confirmed").length;
  const pendingCount = consultations.filter((c) => c.status === "pending").length;
  const completedCount = consultations.filter((c) => c.status === "completed").length;

  return (
    <div className="oc-page">
      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "10px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.88rem",
          border: "1px solid #1e293b",
          animation: "ocFadeIn 0.3s ease-out"
        }}>
          <FaInfoCircle style={{ color: "#0d9488" }} />
          <span>{toastMessage}</span>
        </div>,
        document.body
      )}

      {/* ── Page Header ────────────────────────────────────────── */}
      <header className="oc-header">
        <div>
          <h1 className="oc-title">Online Consultation</h1>
          <p className="oc-subtitle">
            Secure video consultations with leading doctors from the comfort of your home.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            className="oc-test-hardware-btn"
            onClick={() => setShowHardwareTest(true)}
            aria-label="Test camera and microphone systems"
          >
            <FaMicrophone /> Test Camera & Mic
          </button>
          
          <button
            className="oc-request-btn"
            onClick={() => navigate("/patient/find-doctors")}
            aria-label="Request a new online consultation"
          >
            <FaVideo /> Request New Consultation
          </button>
        </div>
      </header>

      {/* ── Summary Stats Bar ──────────────────────────────────── */}
      <section className="oc-stats-bar" aria-label="Consultation summaries">
        <div className="oc-stat-chip" style={{ "--stat-color": "#0d9488" }}>
          <span className="oc-stat-val">{totalCount}</span>
          <span className="oc-stat-lbl">Total</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#10b981" }}>
          <span className="oc-stat-val">{readyCount}</span>
          <span className="oc-stat-lbl">Ready to Join</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#0284c7" }}>
          <span className="oc-stat-val">{confirmedCount}</span>
          <span className="oc-stat-lbl">Confirmed</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#f59e0b" }}>
          <span className="oc-stat-val">{pendingCount}</span>
          <span className="oc-stat-lbl">Pending</span>
        </div>
        <div className="oc-stat-chip" style={{ "--stat-color": "#3b82f6" }}>
          <span className="oc-stat-val">{completedCount}</span>
          <span className="oc-stat-lbl">Completed</span>
        </div>
      </section>

      {/* ── Filter / Search Bar ────────────────────────────────── */}
      <section style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }} aria-label="Search and Filter">
        {/* Search input */}
        <div className="appt-search-bar" style={{ flex: 1, minWidth: "260px" }}>
          <FaSearch className="appt-search-icon" />
          <input
            type="text"
            className="appt-search-input"
            placeholder="Search by doctor, specialization, or clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search online consultations"
          />
        </div>

        {/* Filter Tabs */}
        <div className="appt-tabs" style={{ margin: 0 }}>
          <button
            className={`appt-tab ${filterStatus === "all" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`appt-tab ${filterStatus === "ready" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("ready")}
          >
            Ready to Join
          </button>
          <button
            className={`appt-tab ${filterStatus === "confirmed" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={`appt-tab ${filterStatus === "pending" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`appt-tab ${filterStatus === "completed" ? "appt-tab--active" : ""}`}
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </button>
        </div>
      </section>

      {/* ── Section Title ──────────────────────────────────────── */}
      <h2 className="oc-section-title">
        <FaVideo style={{ fontSize: "1rem" }} />
        Upcoming Video Consultations
      </h2>

      {/* ── Consultation Listing Grid ──────────────────────────── */}
      {filteredConsultations.length > 0 ? (
        <div className="oc-cards-grid">
          {filteredConsultations.map((consult) => {
            const config = STATUS_CONFIG[consult.status] || STATUS_CONFIG.pending;
            const hasImageError = imageErrors[consult.id];
            const joinable = isCallJoinable(consult);

            return (
              <article
                key={consult.id}
                className={`oc-card ${config.cardClass}`}
                aria-label={`Consultation with ${consult.doctorName}`}
              >
                {/* Header: Photo and ID info */}
                <div className="oc-card-header">
                  <div className="oc-avatar-wrapper">
                    {!hasImageError && consult.doctorPhoto ? (
                      <img
                        src={consult.doctorPhoto}
                        alt={consult.doctorName}
                        className="oc-avatar-img"
                        onError={() => handleImageError(consult.id)}
                      />
                    ) : (
                      <div
                        className="oc-avatar-fallback"
                        style={{
                          background: `linear-gradient(135deg, ${consult.color}cc, ${consult.color}66)`,
                        }}
                      >
                        {consult.initials}
                      </div>
                    )}
                    <span className={`oc-avatar-status ${consult.online ? "oc-status--online" : "oc-status--offline"}`} />
                  </div>

                  <div className="oc-doctor-info">
                    <h3 className="oc-doc-name">{consult.doctorName}</h3>
                    <p className="oc-doc-spec">
                      <FaStethoscope className="oc-meta-icon" />
                      {consult.specialization}
                    </p>
                    <p className="oc-doc-hosp">
                      {consult.type === "hospital" ? (
                        <FaHospital className="oc-meta-icon" style={{ color: "#0284c7" }} />
                      ) : (
                        <FaClinicMedical className="oc-meta-icon" style={{ color: "#10b981" }} />
                      )}
                      {consult.hospital}
                    </p>
                    {/* Doctor's Online Status Indicator */}
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      marginTop: "0.2rem",
                      color: consult.online ? "#10b981" : "var(--text-muted)"
                    }}>
                      {consult.online ? "🟢 Online" : "⚪ Offline"}
                    </span>
                  </div>
                </div>

                {/* Body: Date and Time & Metadata info */}
                <div className="oc-card-body">
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      <FaCalendarAlt /> Date
                    </span>
                    <span className="oc-meta-value">{formatDate(consult.date)}</span>
                  </div>
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      <FaClock /> Time
                    </span>
                    <span className="oc-meta-value">{consult.time}</span>
                  </div>
                  
                  {/* Meeting Duration */}
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      ⏱ Duration
                    </span>
                    <span className="oc-meta-value">{consult.duration || "20–30 mins"}</span>
                  </div>
                  
                  {/* Consultation Fee and Payment Status */}
                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      💵 Fee & Payment
                    </span>
                    <span className="oc-meta-value">
                      ₹{consult.fee} • <span style={{ color: consult.paymentStatus === "Paid" ? "#10b981" : "#f59e0b", fontWeight: "700" }}>{consult.paymentStatus}</span>
                    </span>
                  </div>

                  <div className="oc-meta-row">
                    <span className="oc-meta-label">
                      Status
                    </span>
                    <span className={`oc-status-badge ${config.badgeClass}`}>
                      {config.icon} {config.label}
                    </span>
                  </div>
                  
                  {/* Countdown Timer displaying remaining time */}
                  {consult.status !== "completed" && renderCountdown(consult) && (
                    <div className="oc-meta-row" style={{ marginTop: "0.2rem", paddingTop: "0.4rem", borderTop: "1px dashed var(--border-color)" }}>
                      <span className="oc-meta-label" style={{ fontWeight: 700 }}>
                        Time Remaining
                      </span>
                      {renderCountdown(consult)}
                    </div>
                  )}
                </div>

                {/* Footer: Action buttons depending on status */}
                <div className="oc-card-footer" style={{ flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                    <button
                      className="oc-btn oc-btn--details"
                      onClick={() => navigate(`/patient/consultation/${consult.id}`)}
                      aria-label={`View details of consultation with ${consult.doctorName}`}
                    >
                      View Details
                    </button>

                    {consult.status === "completed" ? (
                      <button
                        className="oc-btn oc-btn--join"
                        style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                        onClick={() => {
                          setPrescriptionId(consult.id);
                          setShowPrescription(true);
                        }}
                        aria-label="View Prescription for completed call"
                      >
                        Prescription
                      </button>
                    ) : joinable ? (
                      <button
                        className="oc-btn oc-btn--join"
                        onClick={() => navigate(`/patient/consultation/${consult.id}?join=true`)}
                        aria-label="Join video consultation call"
                      >
                        <FaVideo /> Join Call
                      </button>
                    ) : (
                      <button
                        className="oc-btn oc-btn--disabled"
                        disabled
                        title="Link becomes active 15 minutes before scheduled slot"
                        aria-label="Join room disabled"
                      >
                        <FaVideoSlash /> Join Call
                      </button>
                    )}
                  </div>

                  {/* Contextual Options: Reschedule/Cancel for upcoming OR feedback for completed */}
                  {consult.status === "completed" ? (
                    <button
                      className="oc-btn"
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.75rem",
                        fontSize: "0.78rem",
                        background: "transparent",
                        borderColor: "#f59e0b",
                        color: "#d97706",
                      }}
                      onClick={() => {
                        setFeedbackId(consult.id);
                        setShowFeedback(true);
                      }}
                    >
                      ★ Give Feedback
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                      <button
                        className="oc-btn"
                        style={{
                          flex: 1,
                          padding: "0.45rem 0.75rem",
                          fontSize: "0.78rem",
                          background: "transparent",
                          borderColor: "var(--border-color)",
                          color: "var(--text-secondary)",
                        }}
                        onClick={() => handleOpenReschedule(consult.id)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="oc-btn"
                        style={{
                          flex: 1,
                          padding: "0.45rem 0.75rem",
                          fontSize: "0.78rem",
                          background: "transparent",
                          borderColor: "#fca5a5",
                          color: "#dc2626",
                        }}
                        onClick={() => handleOpenCancel(consult.id)}
                      >
                        Cancel Call
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="oc-empty-state">
          <div className="oc-empty-icon">
            <FaVideoSlash />
          </div>
          <h3 className="oc-empty-title">No consultations found</h3>
          <p className="oc-empty-desc">
            {searchQuery
              ? "There are no consultations matching your search terms. Please try another search."
              : "You do not have any consultations listed for the selected filter."}
          </p>
          {searchQuery ? (
            <button className="oc-empty-btn" onClick={() => setSearchQuery("")}>
              Clear Search Query
            </button>
          ) : (
            <button className="oc-empty-btn" onClick={() => navigate("/patient/find-doctors")}>
              Find Doctors & Book
            </button>
          )}
        </div>
      )}

      {/* ── Hardware Test Modal ────────────────────────────────────── */}
      {showHardwareTest && createPortal(
        <div className="oc-modal-backdrop" onClick={() => setShowHardwareTest(false)}>
          <div className="oc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="oc-modal-header">
              <h3>
                <FaVideo /> Test Camera & Microphone
              </h3>
              <button className="oc-modal-close" onClick={() => setShowHardwareTest(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="oc-modal-body" style={{ padding: 0 }}>
              <HardwareTestPanel />
            </div>
            <div className="oc-modal-footer">
              <button className="oc-btn oc-btn--join" onClick={() => setShowHardwareTest(false)}>
                Diagnostics Complete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Reschedule Appointment Modal ────────────────────────────── */}
      {showReschedule && createPortal(
        <div className="oc-modal-backdrop" onClick={() => setShowReschedule(false)}>
          <form className="oc-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSaveReschedule}>
            <div className="oc-modal-header">
              <h3>
                <FaCalendarAlt /> Reschedule Consultation
              </h3>
              <button type="button" className="oc-modal-close" onClick={() => setShowReschedule(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="oc-modal-body">
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
                Choose a new date and preferred time slot for your appointment.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="oc-form-group">
                  <label className="oc-form-label">New Date</label>
                  <input
                    type="date"
                    className="oc-form-input"
                    value={rescheduleDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                  />
                </div>

                <div className="oc-form-group">
                  <label className="oc-form-label">Available Time Slot</label>
                  <select
                    className="oc-form-input"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                  >
                    <option value="">Select a time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:15 AM">11:15 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="oc-modal-footer">
              <button type="button" className="oc-btn oc-btn--details" onClick={() => setShowReschedule(false)}>
                Cancel
              </button>
              <button type="submit" className="oc-btn oc-btn--join" style={{ background: "var(--primary-color)" }}>
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Cancel Appointment Modal ────────────────────────────────── */}
      {showCancel && createPortal(
        <div className="oc-modal-backdrop" onClick={() => setShowCancel(false)}>
          <div className="oc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="oc-modal-header" style={{ borderBottomColor: "#fee2e2" }}>
              <h3 style={{ color: "#dc2626" }}>
                Cancel Consultation Appointment
              </h3>
              <button className="oc-modal-close" onClick={() => setShowCancel(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="oc-modal-body">
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.55" }}>
                Are you sure you want to cancel your scheduled video consultation? Any paid fees will be refunded to your source card/account within 3 to 5 working days.
              </p>
            </div>
            <div className="oc-modal-footer">
              <button className="oc-btn oc-btn--details" onClick={() => setShowCancel(false)}>
                Keep Appointment
              </button>
              <button
                className="oc-btn"
                style={{ backgroundColor: "#dc2626", color: "#fff", borderColor: "transparent" }}
                onClick={handleConfirmCancel}
              >
                Yes, Cancel Call
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Digital Prescription (Rx) Modal ─────────────────────────── */}
      {showPrescription && createPortal(
        <div className="oc-modal-backdrop" onClick={() => setShowPrescription(false)}>
          <div className="oc-modal-card" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
            <div className="oc-modal-header" style={{ borderBottom: "2px solid var(--primary-color)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={{ color: "var(--primary-color)", margin: 0, fontSize: "1.2rem" }}>
                  📁 Digital Prescription (Rx)
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>ID: {prescriptionId || "MC-CON-104"}</span>
              </div>
              <button className="oc-modal-close" onClick={() => setShowPrescription(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="oc-modal-body" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.2rem 0", color: "var(--text-primary)" }}>Dr. Suresh Nair</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--primary-color)", fontWeight: 700 }}>Neurologist</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>AIIMS Hospital, New Delhi</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}><strong>Date:</strong> 18 Jul 2026</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}><strong>Patient:</strong> John Doe</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}><strong>ID:</strong> #PT-20041</p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary-color)", fontFamily: "serif" }}>Rx</span>
                <p style={{ margin: "0.25rem 0 0.5rem 0", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  <strong>Diagnosis:</strong> Mild Tension Headache & Fatigue
                </p>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left", marginBottom: "1.5rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "0.5rem 0" }}>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th style={{ textAlign: "right" }}>Instruction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>Naproxen 250mg</td>
                    <td>1 - 0 - 1</td>
                    <td>5 Days</td>
                    <td style={{ textAlign: "right" }}>After Food</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>Methylcobalamin (Vit B12)</td>
                    <td>0 - 1 - 0</td>
                    <td>30 Days</td>
                    <td style={{ textAlign: "right" }}>Before Food</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.75rem 0", fontWeight: "600" }}>Paracetamol 650mg</td>
                    <td>1 - 0 - 0</td>
                    <td>As needed</td>
                    <td style={{ textAlign: "right" }}>For headache</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.85rem", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", borderLeft: "4px solid var(--primary-color)" }}>
                <strong>Advice:</strong> Keep yourself hydrated. Sleep at least 7-8 hours a day. Limit screen time to under 1 hour continuously. Follow-up in 10 days if symptoms persist.
              </div>
            </div>
            <div className="oc-modal-footer">
              <button className="oc-btn oc-btn--details" onClick={() => setShowPrescription(false)}>
                Close
              </button>
              <button
                className="oc-btn oc-btn--join"
                style={{ background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))" }}
                onClick={() => {
                  setShowPrescription(false);
                  showToast("Prescription downloaded successfully!");
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Feedback & Rating Modal ─────────────────────────────────── */}
      {showFeedback && createPortal(
        <div className="oc-modal-backdrop" onClick={() => setShowFeedback(false)}>
          <div className="oc-modal-card" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <div className="oc-modal-header">
              <h3>
                <FaStar style={{ color: "#f59e0b" }} /> Give Feedback & Review
              </h3>
              <button className="oc-modal-close" onClick={() => setShowFeedback(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="oc-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", textAlign: "center" }}>
                How was your online consultation with your doctor? Your rating helps us improve our service.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", fontSize: "2rem", margin: "0.5rem 0" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", outline: "none", padding: 0 }}
                    onClick={() => setFeedbackRating(star)}
                  >
                    <FaStar color={star <= feedbackRating ? "#f59e0b" : "#cbd5e1"} />
                  </button>
                ))}
              </div>

              <div className="oc-form-group">
                <label className="oc-form-label">Written Review</label>
                <textarea
                  className="oc-form-input"
                  style={{ height: "100px", resize: "none", fontFamily: "inherit" }}
                  placeholder="Share details of your experience (optional)..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>
            </div>
            <div className="oc-modal-footer">
              <button className="oc-btn oc-btn--details" onClick={() => setShowFeedback(false)}>
                Cancel
              </button>
              <button
                className="oc-btn oc-btn--join"
                style={{ background: "var(--primary-color)" }}
                onClick={() => {
                  setShowFeedback(false);
                  showToast("Thank you for your feedback! It helps us improve MedicoBridge.");
                  setFeedbackComment("");
                  setFeedbackRating(5);
                }}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default PatientConsultation;

