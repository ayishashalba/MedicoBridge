import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaUser,
  FaClock,
  FaVideo,
  FaHospital,
  FaEye,
  FaSearch,
  FaFilter,
  FaTimesCircle,
  FaCheckCircle,
  FaCalendarAlt,
  FaChevronRight,
  FaPrescriptionBottleAlt,
  FaBell,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaLock,
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorAppointments.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");
const STATUS_GROUPS = ["Today", "Upcoming", "Completed", "Cancelled"];

/* ─── Avatar & Date/Time Helpers ─────────────────────────────── */

const AVATAR_COLORS = ["#0d9488", "#0284c7", "#7c3aed", "#f59e0b", "#e11d48", "#16a34a"];
const getAvatarColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "PT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDateDisplay = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime12h = (date) => {
  if (!date || isNaN(date.getTime())) return "10:00 AM";
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const parseAppointmentDateTime = (dateVal, timeSlotVal) => {
  if (!dateVal) return new Date();
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return new Date();

  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();

  let hours = 9;
  let minutes = 0;

  if (timeSlotVal && typeof timeSlotVal === "string") {
    const match = timeSlotVal.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  } else if (d.getHours() !== 0 || d.getMinutes() !== 0) {
    hours = d.getHours();
    minutes = d.getMinutes();
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
};

const computeTimeStatus = (appointment, now) => {
  const patientName = appointment.patientId?.name || "Patient";
  const status = (appointment.status || "Pending").trim();
  const isOnline = /video|online/i.test(appointment.type || "");

  const apptDate = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
  const diffMs = apptDate.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.ceil(diffSeconds / 60);

  const isToday =
    apptDate.getFullYear() === now.getFullYear() &&
    apptDate.getMonth() === now.getMonth() &&
    apptDate.getDate() === now.getDate();

  const formattedTime = appointment.timeSlot || formatTime12h(apptDate);

  // 1. COMPLETED
  if (status.toLowerCase() === "completed") {
    return {
      status: "Completed",
      badgeLabel: "Completed",
      badgeClass: "status-pill--completed",
      effectiveGroup: "Completed",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: true,
      isCancelled: false,
      timeNotice: "Completed",
      reminderText: "This consultation has been completed.",
      scheduledTime: formattedTime,
      apptDate,
      isToday,
      diffMinutes,
      diffSeconds,
    };
  }

  // 2. CANCELLED
  if (status.toLowerCase() === "cancelled") {
    const cancelReason = appointment.cancellationReason
      ? `Cancelled: ${appointment.cancellationReason}`
      : "This appointment was cancelled.";
    return {
      status: "Cancelled",
      badgeLabel: "Cancelled",
      badgeClass: "status-pill--cancelled",
      effectiveGroup: "Cancelled",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
      timeNotice: "Cancelled",
      reminderText: cancelReason,
      scheduledTime: formattedTime,
      apptDate,
      isToday,
      diffMinutes,
      diffSeconds,
    };
  }

  // 3. ONGOING / IN-PROGRESS
  if (status.toLowerCase() === "in-progress" || appointment.consultation?.status === "In-Progress") {
    return {
      status: "Ongoing",
      badgeLabel: "Ongoing",
      badgeClass: "status-pill--ongoing",
      effectiveGroup: isToday ? "Today" : "Upcoming",
      canJoin: true,
      isUnlocked: true,
      isReady: false,
      isOngoing: true,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: false,
      timeNotice: "Ongoing",
      reminderText: `Your consultation with ${patientName} is currently active.`,
      scheduledTime: formattedTime,
      apptDate,
      isToday,
      diffMinutes,
      diffSeconds,
    };
  }

  // 4. PRE-JOIN WINDOW: Within 2 minutes before scheduled time (0 <= diffSeconds <= 120)
  if (isOnline && isToday && diffSeconds >= 0 && diffSeconds <= 120) {
    const minsLeft = Math.max(1, diffMinutes);
    return {
      status: "Starting Soon",
      badgeLabel: "Starting Soon",
      badgeClass: "status-pill--ready",
      effectiveGroup: "Today",
      canJoin: true,
      isUnlocked: true,
      isReady: true,
      isOngoing: false,
      isUpcoming: true,
      isCompleted: false,
      isCancelled: false,
      timeNotice: `Starts in ${Math.max(1, diffSeconds)}s`,
      reminderText: `Your consultation with ${patientName} starts in ${minsLeft} minute${
        minsLeft === 1 ? "" : "s"
      }! Join is now available.`,
      scheduledTime: formattedTime,
      apptDate,
      isToday,
      diffMinutes,
      diffSeconds,
    };
  }

  // 5. FUTURE / UPCOMING
  const timeNotice = isToday
    ? diffMinutes > 60
      ? `Starts in ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`
      : diffMinutes > 0
      ? `Starts in ${diffMinutes}m`
      : `Starts at ${formattedTime}`
    : `Starts at ${formattedTime}`;

  const reminderText = isToday
    ? `Your consultation with ${patientName} starts in ${diffMinutes} minute${
        diffMinutes === 1 ? "" : "s"
      }.`
    : `Consultation with ${patientName} scheduled for ${formatDateDisplay(apptDate)} at ${formattedTime}.`;

  return {
    status: "Upcoming",
    badgeLabel: status === "Confirmed" ? "Confirmed" : "Upcoming",
    badgeClass: "status-pill--upcoming",
    effectiveGroup: isToday ? "Today" : "Upcoming",
    canJoin: false,
    isUnlocked: false,
    isReady: false,
    isOngoing: false,
    isUpcoming: true,
    isCompleted: false,
    isCancelled: false,
    timeNotice,
    reminderText,
    scheduledTime: formattedTime,
    apptDate,
    isToday,
    diffMinutes,
    diffSeconds,
  };
};

/* ─── Top Reminder Banner Component (Next Approaching Consultation Only) ─── */
function ApproachingConsultationReminderBanner({
  onlineAppointmentsWithStatus,
  onViewDetails,
}) {
  const targetReminder = useMemo(() => {
    const validReminders = onlineAppointmentsWithStatus
      .filter(({ timeStatus }) => {
        if (timeStatus.isCompleted || timeStatus.isCancelled) return false;
        return (
          timeStatus.isUnlocked ||
          timeStatus.isOngoing ||
          (timeStatus.isUpcoming && timeStatus.diffMinutes <= 60 && timeStatus.diffMinutes > 0)
        );
      })
      .sort((a, b) => {
        if (a.timeStatus.isUnlocked && !b.timeStatus.isUnlocked) return -1;
        if (!a.timeStatus.isUnlocked && b.timeStatus.isUnlocked) return 1;
        return a.timeStatus.diffSeconds - b.timeStatus.diffSeconds;
      });

    return validReminders.length > 0 ? validReminders[0] : null;
  }, [onlineAppointmentsWithStatus]);

  if (!targetReminder) return null;

  const { item, timeStatus } = targetReminder;
  const isUnlocked = timeStatus.isUnlocked;

  return (
    <div
      className={`appointment-reminder-banner ${
        isUnlocked ? "reminder-banner--urgent" : "reminder-banner--approaching"
      }`}
    >
      <div className="reminder-banner-main">
        <div className="reminder-banner-icon-wrapper">
          <FaBell className="banner-icon-ring" />
        </div>

        <div className="reminder-banner-content">
          <div className="reminder-banner-title-row">
            <span
              className={`reminder-live-pill ${
                isUnlocked
                  ? "reminder-live-pill--urgent"
                  : "reminder-live-pill--approaching"
              }`}
            >
              <span className="live-dot" />
              {isUnlocked
                ? timeStatus.isOngoing
                  ? "Ongoing Online Consultation"
                  : "Online Consultation Ready"
                : "Upcoming Consultation Reminder"}
            </span>
            <span className="reminder-time-tag">
              <FaClock /> Scheduled at {item.time}
            </span>
          </div>

          <h3 className="reminder-banner-headline">{timeStatus.reminderText}</h3>

          <p className="reminder-banner-desc">
            Patient: <strong>{item.patient}</strong> ({item.patientId}) · Complaint:{" "}
            {item.complaint} · Online Video Consultation
          </p>
        </div>

        <div className="reminder-banner-actions">
          <button
            className="banner-action-btn banner-action-btn--primary"
            onClick={() => onViewDetails(item.id)}
          >
            <FaEye /> View Details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Doctor Appointments Component ────────────────────────── */
function DoctorAppointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState({});

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctor/appointments`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const list = Array.isArray(data.data) ? data.data : data.data.appointments || [];
        setRawAppointments(list);
        if (data.data.doctor) {
          setDoctorInfo(data.data.doctor);
        }
      } else {
        toast.error(data.message || "Failed to load doctor appointments.");
      }
    } catch (err) {
      console.error("Error loading doctor appointments:", err);
      toast.error("Network error while loading doctor appointments.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Update current time every 2 seconds to keep live countdowns fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Determine practice organization for visit label
  const isHospital = useMemo(() => {
    const pt = (doctorInfo.practiceType || "").toLowerCase();
    return pt === "hospital" || Boolean(doctorInfo.hospitalName) || !doctorInfo.clinicName;
  }, [doctorInfo]);

  // Transform backend appointments into mapped UI structure with real time status
  const appointmentsWithStatus = useMemo(() => {
    return rawAppointments.map((appt) => {
      const patientName = appt.patientId?.name || "Patient";
      const initials = getInitials(patientName);
      const avatarColor = getAvatarColor(patientName);
      const patientCode = appt.patientId?.patientId
        ? `#${appt.patientId.patientId}`
        : appt.patientId?._id
        ? `#PT-${String(appt.patientId._id).slice(-5).toUpperCase()}`
        : "#PT-NEW";

      const apptDate = parseAppointmentDateTime(appt.date, appt.timeSlot);
      const dateDisplay = formatDateDisplay(apptDate);
      const timeDisplay = appt.timeSlot || formatTime12h(apptDate);
      const complaint = appt.reason || (appt.symptoms && appt.symptoms[0]) || "General Consultation";
      const timeStatus = computeTimeStatus(appt, currentTime);

      return {
        id: appt._id,
        _raw: appt,
        patient: patientName,
        initials,
        avatarColor,
        patientId: patientCode,
        date: dateDisplay,
        time: timeDisplay,
        type: appt.type || "In-Person",
        complaint,
        status: appt.status || "Pending",
        prescriptionId: appt.prescriptionId,
        timeStatus,
        effectiveGroup: timeStatus.effectiveGroup,
      };
    });
  }, [rawAppointments, currentTime]);

  // Online appointments with status for top reminder banner
  const onlineAppointmentsWithStatus = useMemo(() => {
    return appointmentsWithStatus
      .filter((item) => /video|online/i.test(item.type))
      .map((item) => ({ item, timeStatus: item.timeStatus }));
  }, [appointmentsWithStatus]);

  // Filtered by search & active tab
  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointmentsWithStatus.filter((item) => {
      const matchesSearch =
        !query ||
        item.patient.toLowerCase().includes(query) ||
        item.complaint.toLowerCase().includes(query) ||
        item.patientId.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      if (activeFilter === "Today") return item.effectiveGroup === "Today";
      if (activeFilter === "Upcoming") return item.effectiveGroup === "Upcoming";
      if (activeFilter === "Completed") return item.effectiveGroup === "Completed";
      if (activeFilter === "Cancelled") return item.effectiveGroup === "Cancelled";
      return true;
    });
  }, [appointmentsWithStatus, search, activeFilter]);

  // Grouping function
  const groupedAppointments = useMemo(() => {
    const groups = {
      Today: [],
      Upcoming: [],
      Completed: [],
      Cancelled: [],
    };
    filteredAppointments.forEach((item) => {
      if (groups[item.effectiveGroup]) {
        groups[item.effectiveGroup].push(item);
      }
    });
    return groups;
  }, [filteredAppointments]);

  // Dynamic filter counts
  const counts = useMemo(() => {
    const totals = {
      All: appointmentsWithStatus.length,
      Today: 0,
      Upcoming: 0,
      Completed: 0,
      Cancelled: 0,
    };
    appointmentsWithStatus.forEach((item) => {
      if (item.effectiveGroup === "Today") totals.Today++;
      if (item.effectiveGroup === "Upcoming") totals.Upcoming++;
      if (item.effectiveGroup === "Completed") totals.Completed++;
      if (item.effectiveGroup === "Cancelled") totals.Cancelled++;
    });
    return totals;
  }, [appointmentsWithStatus]);

  const handleViewDetails = (id) => {
    navigate(`/doctor/appointments/${id}`);
  };

  const handleViewPrescription = (item) => {
    if (item.prescriptionId) {
      navigate(`/doctor/prescriptions/${item.prescriptionId}`);
    } else {
      navigate(`/doctor/prescriptions/${item.id}`);
    }
  };

  return (
    <div className="doctor-appointments">
      {/* ── Page Header ── */}
      <div className="appointments-header">
        <div className="header-title-section">
          <h2>
            <FaCalendarCheck /> Appointments
          </h2>
          <p>View, search, and manage your clinical consultation schedule and patient records.</p>
        </div>
      </div>

      {/* ── Single Approaching Consultation Reminder Banner ── */}
      <ApproachingConsultationReminderBanner
        onlineAppointmentsWithStatus={onlineAppointmentsWithStatus}
        onViewDetails={handleViewDetails}
      />

      {/* ── Filter Toolbar ────────────────────────────── */}
      <div className="appointment-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient, complaints, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-tabs-group">
          <FaFilter className="toolbar-filter-icon" />
          {["All", "Today", "Upcoming", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-tab-btn ${
                activeFilter === status ? "filter-tab-btn--active" : ""
              }`}
              onClick={() => setActiveFilter(status)}
            >
              {status}
              <span className="filter-count-badge">{counts[status]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grouped Appointments List ────────────────── */}
      {loading ? (
        <div className="no-appointments-card">
          <FaSpinner className="spin-icon" style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: "0.5rem" }} />
          <h3>Loading Appointments...</h3>
          <p>Fetching your latest clinical appointment records.</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="no-appointments-card">
          <FaCalendarCheck className="empty-icon" />
          <h3>No Appointments Found</h3>
          <p>No matching appointment records match your criteria.</p>
        </div>
      ) : (
        <div className="grouped-sections-list">
          {STATUS_GROUPS.map((statusGroup) => {
            const list = groupedAppointments[statusGroup];
            if (!list || list.length === 0) return null;

            return (
              <div className="appointment-status-section" key={statusGroup}>
                <h3 className="section-title-label">
                  <span className={`title-dot title-dot--${statusGroup.toLowerCase()}`} />
                  {statusGroup} Appointments ({list.length})
                </h3>

                <div className="appointments-grid-container">
                  {list.map((item) => {
                    const timeStatus = item.timeStatus;

                    return (
                      <div className="appointment-card-v2" key={item.id}>
                        <div className="card-top-header">
                          <div className="patient-avatar-cell">
                            <div
                              className="avatar-circle"
                              style={{ backgroundColor: item.avatarColor }}
                            >
                              {item.initials}
                            </div>
                            <div>
                              <h4>{item.patient}</h4>
                              <span className="patient-id-badge">{item.patientId}</span>
                            </div>
                          </div>

                          <div className="card-top-badges">
                            <span className={`status-pill ${timeStatus.badgeClass}`}>
                              {(timeStatus.isReady || timeStatus.isOngoing) && (
                                <span className="live-dot" />
                              )}
                              {timeStatus.isCompleted && <FaCheckCircle />}
                              {timeStatus.isCancelled && <FaTimesCircle />}
                              {timeStatus.badgeLabel}
                            </span>
                          </div>
                        </div>

                        {/* Status Notice Message inside Card */}
                        {timeStatus.isOngoing ? (
                          <div className="card-reminder-alert-bar card-reminder-alert-bar--ready">
                            <span className="live-dot" />
                            <span>
                              <strong>Ongoing Online Consultation</strong> ({item.time})
                            </span>
                          </div>
                        ) : timeStatus.isReady ? (
                          <div className="card-reminder-alert-bar card-reminder-alert-bar--ready">
                            <span className="live-dot" />
                            <span>
                              <strong>Online Consultation Starting Soon</strong> (Starts at{" "}
                              {item.time})
                            </span>
                          </div>
                        ) : timeStatus.isUpcoming ? (
                          <div className="card-reminder-alert-bar card-reminder-alert-bar--upcoming">
                            <FaClock />
                            <span>
                              Starts at {item.time} ({timeStatus.timeNotice})
                            </span>
                          </div>
                        ) : timeStatus.isCancelled ? (
                          <div
                            className="card-reminder-alert-bar card-reminder-alert-bar--cancelled"
                            style={{
                              background: "rgba(239, 68, 68, 0.08)",
                              color: "#dc2626",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                            }}
                          >
                            <FaTimesCircle />
                            <span>{timeStatus.reminderText}</span>
                          </div>
                        ) : null}

                        <div className="card-details-body">
                          <div className="detail-item">
                            <FaCalendarAlt />
                            <span>
                              {item.date} at <strong>{item.time}</strong>
                            </span>
                          </div>
                          <div className="detail-item">
                            {/video|online/i.test(item.type) ? (
                              <>
                                <FaVideo className="type-icon--online" />
                                <span>Online Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <FaHospital className="type-icon--hospital" />
                                <span>{isHospital ? "Hospital Visit" : "Clinic Visit"}</span>
                              </>
                            )}
                          </div>
                          <div className="complaint-item">
                            <span className="complaint-label">Complaint:</span>
                            <span className="complaint-text">{item.complaint}</span>
                          </div>
                        </div>

                        <div className="card-actions-row">
                          {/* Completed appointment */}
                          {timeStatus.isCompleted ? (
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View Details
                              </button>
                              <button
                                className="action-btn action-btn--prescription"
                                onClick={() => handleViewPrescription(item)}
                              >
                                <FaPrescriptionBottleAlt /> View Prescription
                              </button>
                            </>
                          ) : (
                            /* All active / upcoming / cancelled appointments focus on View Details */
                            <button
                              className="action-btn action-btn--view action-btn--full"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <FaEye /> View Details
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;