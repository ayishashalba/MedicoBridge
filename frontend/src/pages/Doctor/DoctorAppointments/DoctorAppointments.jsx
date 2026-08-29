import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaUser,
  FaClock,
  FaVideo,
  FaHospital,
  FaEye,
  FaPlay,
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
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./DoctorAppointments.css";

// Toggle this to "Clinic" to test Private Clinic Doctor view
const DOCTOR_TYPE = "Hospital";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const appointmentsData = [
  {
    id: 1,
    patient: "Rahul Nair",
    initials: "RN",
    avatarColor: "#0d9488",
    patientId: "PT-1024",
    date: "July 12, 2026",
    time: "10:00 AM",
    type: "Online",
    status: "Today",
    complaint: "Type 2 Diabetes Mellitus Follow-up",
  },
  {
    id: 2,
    patient: "Anjali Thomas",
    initials: "AT",
    avatarColor: "#7c3aed",
    patientId: "PT-1031",
    date: "July 15, 2026",
    time: "02:30 PM",
    type: "Hospital",
    status: "Upcoming",
    complaint: "Chronic Migraine Review",
  },
  {
    id: 3,
    patient: "Arun Kumar",
    initials: "AK",
    avatarColor: "#0284c7",
    patientId: "PT-1018",
    date: "July 10, 2026",
    time: "11:15 AM",
    type: "Online",
    status: "Completed",
    complaint: "Hypertension Check",
  },
  {
    id: 4,
    patient: "Meera Pillai",
    initials: "MP",
    avatarColor: "#d97706",
    patientId: "PT-1045",
    date: "July 18, 2026",
    time: "09:00 AM",
    type: "Online",
    status: "Upcoming",
    complaint: "Thyroid Follow-up",
  },
  {
    id: 5,
    patient: "Suresh Babu",
    initials: "SB",
    avatarColor: "#dc2626",
    patientId: "PT-1052",
    date: "July 8, 2026",
    time: "04:00 PM",
    type: "Hospital",
    status: "Cancelled",
    complaint: "Post-Surgery Cardiac Review",
  },
  {
    id: 6,
    patient: "Lakshmi Nair",
    initials: "LN",
    avatarColor: "#059669",
    patientId: "PT-1060",
    date: "July 12, 2026",
    time: "02:00 PM",
    type: "Online",
    status: "Today",
    complaint: "Migraine Consultation",
  },
];

const STATUS_GROUPS = ["Today", "Upcoming", "Completed", "Cancelled"];

/* ─── Helper: Get Appointment Timing & Reminder Info ─────────── */
function getAppointmentReminderInfo(item, now = new Date()) {
  if (!item || item.status === "Cancelled" || item.status === "Completed") {
    return null;
  }

  // Parse time (e.g. "10:00 AM" or "02:30 PM")
  const timeMatch = item.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return null;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  // Build target Date for today's appointment
  const apptDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const diffMinutes = Math.round((apptDate.getTime() - now.getTime()) / 60000);

  let state = "UPCOMING_LATER";
  let badgeText = "";
  let reminderMessage = "";
  let urgency = "normal"; // 'urgent' | 'warning' | 'info' | 'normal'
  let isAttentionNeeded = false;
  let isStartingNow = false;
  let isOngoing = false;

  if (diffMinutes <= 0 && diffMinutes >= -15) {
    // 0 to 15 mins into the scheduled slot
    state = "STARTING_NOW";
    isStartingNow = true;
    badgeText = "Starting Now";
    reminderMessage = "Consultation is starting now";
    urgency = "urgent";
    isAttentionNeeded = true;
  } else if (diffMinutes < -15 && diffMinutes >= -180) {
    // Past 15 mins and not yet completed
    state = "ONGOING";
    isOngoing = true;
    badgeText = `Ongoing (${Math.abs(diffMinutes)}m ago)`;
    reminderMessage = "You have an ongoing appointment";
    urgency = "warning";
    isAttentionNeeded = true;
  } else if (diffMinutes > 0 && diffMinutes <= 15) {
    // Starts within 15 minutes
    state = "STARTS_SOON";
    badgeText = `Starts in ${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
    reminderMessage = `Upcoming consultation: ${item.patient} at ${item.time} — starts in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}.`;
    urgency = "urgent";
    isAttentionNeeded = true;
  } else if (diffMinutes > 15 && diffMinutes <= 60) {
    // Starts within an hour
    state = "UPCOMING_SOON";
    badgeText = `Starts in ${diffMinutes} mins`;
    reminderMessage = `Upcoming consultation: ${item.patient} at ${item.time} — starts in ${diffMinutes} minutes.`;
    urgency = "info";
    isAttentionNeeded = true;
  } else if (diffMinutes > 60) {
    const hoursAway = Math.floor(diffMinutes / 60);
    const minsAway = diffMinutes % 60;
    state = "UPCOMING_TODAY";
    badgeText = minsAway > 0 ? `In ${hoursAway}h ${minsAway}m` : `In ${hoursAway}h`;
    reminderMessage = `Upcoming consultation: ${item.patient} at ${item.time} — scheduled for today.`;
    urgency = "normal";
  } else {
    // Over 3 hours past scheduled time
    state = "PAST_SLOT";
    badgeText = `Scheduled at ${item.time}`;
    reminderMessage = `Scheduled at ${item.time}`;
    urgency = "normal";
  }

  return {
    state,
    diffMinutes,
    badgeText,
    reminderMessage,
    urgency,
    isAttentionNeeded,
    isStartingNow,
    isOngoing,
    apptDate,
  };
}

/* ─── Top Reminder Banner Component ───────────────────────────── */
function AppointmentReminderBanner({ todayOnlineAppointments, now, onStartConsultation, onViewDetails }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute reminder info for each today's online appointment
  const remindersWithInfo = useMemo(() => {
    return todayOnlineAppointments
      .map((item) => ({
        item,
        info: getAppointmentReminderInfo(item, now),
      }))
      .filter((entry) => entry.info !== null)
      .sort((a, b) => {
        // Order by urgency priority: STARTING_NOW (1) -> ONGOING (2) -> STARTS_SOON (3) -> UPCOMING_SOON (4) -> others
        const priorityOrder = {
          STARTING_NOW: 1,
          ONGOING: 2,
          STARTS_SOON: 3,
          UPCOMING_SOON: 4,
          UPCOMING_TODAY: 5,
          UPCOMING_LATER: 6,
          PAST_SLOT: 7,
        };
        const pA = priorityOrder[a.info.state] || 99;
        const pB = priorityOrder[b.info.state] || 99;
        if (pA !== pB) return pA - pB;
        return a.info.diffMinutes - b.info.diffMinutes;
      });
  }, [todayOnlineAppointments, now]);

  if (remindersWithInfo.length === 0) return null;

  // Active highlighted entry is the top priority one
  const primaryEntry = remindersWithInfo[0];
  const { item: primaryItem, info: primaryInfo } = primaryEntry;

  const getBannerIcon = () => {
    if (primaryInfo.isStartingNow) return <FaPlay className="banner-icon-pulse" />;
    if (primaryInfo.isOngoing) return <FaExclamationTriangle className="banner-icon-shake" />;
    return <FaBell className="banner-icon-ring" />;
  };

  return (
    <div className={`appointment-reminder-banner reminder-banner--${primaryInfo.urgency}`}>
      <div className="reminder-banner-main">
        <div className="reminder-banner-icon-wrapper">
          {getBannerIcon()}
        </div>

        <div className="reminder-banner-content">
          <div className="reminder-banner-title-row">
            <span className={`reminder-live-pill reminder-live-pill--${primaryInfo.urgency}`}>
              <span className="live-dot" />
              {primaryInfo.isStartingNow
                ? "Starting Now"
                : primaryInfo.isOngoing
                ? "Ongoing Consultation"
                : "Appointment Reminder"}
            </span>
            <span className="reminder-time-tag">
              <FaClock /> Today at {primaryItem.time}
            </span>
          </div>

          <h3 className="reminder-banner-headline">
            {primaryInfo.isStartingNow ? (
              <>Consultation is starting now with <strong>{primaryItem.patient}</strong></>
            ) : primaryInfo.isOngoing ? (
              <>You have an ongoing appointment with <strong>{primaryItem.patient}</strong></>
            ) : (
              <>Upcoming consultation: <strong>{primaryItem.patient}</strong> at {primaryItem.time} {primaryInfo.diffMinutes > 0 && `— starts in ${primaryInfo.diffMinutes} minute${primaryInfo.diffMinutes === 1 ? "" : "s"}`}</>
            )}
          </h3>

          <p className="reminder-banner-desc">
            Patient ID: <strong>{primaryItem.patientId}</strong> · Complaint: {primaryItem.complaint} · Type: Online Consultation
          </p>

          {/* If there are additional appointments today */}
          {remindersWithInfo.length > 1 && (
            <div className="reminder-banner-other-count">
              <FaCalendarCheck /> You have {remindersWithInfo.length} online consultation{remindersWithInfo.length > 1 ? "s" : ""} scheduled for today.
            </div>
          )}
        </div>

        <div className="reminder-banner-actions">
          <button
            className={`banner-action-btn banner-action-btn--primary ${
              primaryInfo.isStartingNow || primaryInfo.isOngoing ? "banner-action-btn--highlighted" : ""
            }`}
            onClick={() => onStartConsultation(primaryItem.id)}
          >
            <FaPlay /> {primaryInfo.isStartingNow ? "Start Consultation Now" : primaryInfo.isOngoing ? "Join Ongoing Call" : "Start Consultation"}
          </button>
          <button
            className="banner-action-btn banner-action-btn--secondary"
            onClick={() => onViewDetails(primaryItem.id)}
          >
            <FaEye /> View Patient Details
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

  // Automatically update every 10 seconds to keep live countdowns and reminder statuses fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Today's Online Appointments for the reminder system
  const todayOnlineAppointments = useMemo(() => {
    return appointmentsData.filter(
      (item) => item.status === "Today" && item.type === "Online"
    );
  }, []);

  // Check how many appointments currently need attention
  const attentionCount = useMemo(() => {
    return appointmentsData.filter((item) => {
      if (item.status !== "Today" && item.status !== "Upcoming") return false;
      const info = getAppointmentReminderInfo(item, currentTime);
      return info?.isAttentionNeeded;
    }).length;
  }, [currentTime]);

  const filteredAppointments = useMemo(() => {
    return appointmentsData.filter((item) => {
      const matchesSearch =
        item.patient.toLowerCase().includes(search.toLowerCase()) ||
        item.complaint.toLowerCase().includes(search.toLowerCase()) ||
        item.patientId.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  // Grouping function
  const groupedAppointments = useMemo(() => {
    const groups = {
      Today: [],
      Upcoming: [],
      Completed: [],
      Cancelled: [],
    };
    filteredAppointments.forEach((item) => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      }
    });
    return groups;
  }, [filteredAppointments]);

  // Counts for filters
  const counts = useMemo(() => {
    const totals = { All: appointmentsData.length, Today: 0, Upcoming: 0, Completed: 0, Cancelled: 0 };
    appointmentsData.forEach((item) => {
      if (totals[item.status] !== undefined) {
        totals[item.status]++;
      }
    });
    return totals;
  }, []);

  const handleStartConsultation = (id) => {
    navigate(`/doctor/consultation-room/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/doctor/appointments/${id}`);
  };

  return (
    <div className="doctor-appointments">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="appointments-header">
        <div className="header-title-section">
          <h2>
            <FaCalendarCheck /> Appointments
          </h2>
          <p>View, search, and manage your clinical consultation schedule.</p>
        </div>

        {/* Live Reminder Pill in Header if attention needed */}
        {attentionCount > 0 && (
          <div className="header-reminder-pill">
            <FaBell className="bell-ring-anim" />
            <span>{attentionCount} Consultation{attentionCount > 1 ? "s" : ""} Needs Attention</span>
          </div>
        )}
      </div>

      {/* ── Appointment Reminder Banner System ────────── */}
      <AppointmentReminderBanner
        todayOnlineAppointments={todayOnlineAppointments}
        now={currentTime}
        onStartConsultation={handleStartConsultation}
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
            <button className="clear-search-btn" onClick={() => setSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="filter-tabs-group">
          <FaFilter className="toolbar-filter-icon" />
          {["All", "Today", "Upcoming", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-tab-btn ${activeFilter === status ? "filter-tab-btn--active" : ""}`}
              onClick={() => setActiveFilter(status)}
            >
              {status}
              <span className="filter-count-badge">
                {counts[status] || filteredAppointments.filter((x) => x.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grouped Appointments List ────────────────── */}
      {filteredAppointments.length === 0 ? (
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
                    // Compute reminder info for this card
                    const reminderInfo = item.status === "Today" ? getAppointmentReminderInfo(item, currentTime) : null;
                    const isStartingNow = reminderInfo?.isStartingNow;
                    const isOngoing = reminderInfo?.isOngoing;
                    const isAttention = reminderInfo?.isAttentionNeeded;

                    return (
                      <div
                        className={`appointment-card-v2 ${
                          isStartingNow ? "appointment-card-v2--starting-now" : ""
                        } ${isOngoing ? "appointment-card-v2--ongoing" : ""}`}
                        key={item.id}
                      >
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
                            {/* Reminder Badge if attention needed */}
                            {reminderInfo && isAttention && (
                              <span
                                className={`reminder-attention-pill reminder-attention-pill--${reminderInfo.urgency}`}
                                title={reminderInfo.reminderMessage}
                              >
                                {isStartingNow ? (
                                  <>
                                    <FaPlay className="mini-pulse-icon" /> Starting Now
                                  </>
                                ) : isOngoing ? (
                                  <>
                                    <FaExclamationTriangle /> Ongoing
                                  </>
                                ) : (
                                  <>
                                    <FaBell className="bell-ring-anim" /> {reminderInfo.badgeText}
                                  </>
                                )}
                              </span>
                            )}

                            <span className={`status-pill status-pill--${item.status.toLowerCase()}`}>
                              {item.status === "Completed" && <FaCheckCircle />}
                              {item.status === "Cancelled" && <FaTimesCircle />}
                              {item.status}
                            </span>
                          </div>
                        </div>

                        {/* Reminder Notice Message inside Card */}
                        {reminderInfo && isAttention && (
                          <div className={`card-reminder-alert-bar card-reminder-alert-bar--${reminderInfo.urgency}`}>
                            {isStartingNow ? (
                              <>
                                <FaPlay className="mini-pulse-icon" />
                                <span><strong>Consultation is starting now</strong> — Patient is ready</span>
                              </>
                            ) : isOngoing ? (
                              <>
                                <FaExclamationCircle />
                                <span><strong>You have an ongoing appointment</strong> ({reminderInfo.diffMinutes ? `${Math.abs(reminderInfo.diffMinutes)}m ago` : "scheduled time passed"})</span>
                              </>
                            ) : (
                              <>
                                <FaClock />
                                <span>Upcoming consultation — starts in {reminderInfo.diffMinutes} mins</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="card-details-body">
                          <div className="detail-item">
                            <FaCalendarAlt />
                            <span>
                              {item.date} at <strong>{item.time}</strong>
                            </span>
                          </div>
                          <div className="detail-item">
                            {item.type === "Online" ? (
                              <>
                                <FaVideo className="type-icon--online" />
                                <span>Online Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <FaHospital className="type-icon--hospital" />
                                <span>{DOCTOR_TYPE === "Hospital" ? "Hospital Visit" : "Clinic Visit"}</span>
                              </>
                            )}
                          </div>
                          <div className="complaint-item">
                            <span className="complaint-label">Complaint:</span>
                            <span className="complaint-text">{item.complaint}</span>
                          </div>
                        </div>

                        <div className="card-actions-row">
                          {/* Status: Today */}
                          {item.status === "Today" && (
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View
                              </button>
                              <button
                                className={`action-btn action-btn--start ${
                                  isStartingNow || isOngoing ? "action-btn--start-highlighted" : ""
                                }`}
                                onClick={() => handleStartConsultation(item.id)}
                              >
                                <FaPlay />
                                {isStartingNow
                                  ? "Start Consultation Now"
                                  : isOngoing
                                  ? "Join Consultation"
                                  : "Start Consultation"}
                              </button>
                            </>
                          )}

                          {/* Status: Upcoming */}
                          {item.status === "Upcoming" && (
                            <button
                              className="action-btn action-btn--view action-btn--full"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <FaEye /> View Details
                            </button>
                          )}

                          {/* Status: Completed */}
                          {item.status === "Completed" && (
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View
                              </button>
                              <button
                                className="action-btn action-btn--prescription"
                                onClick={() => navigate(`/doctor/prescriptions/${item.id}`)}
                              >
                                <FaPrescriptionBottleAlt /> View Prescription
                              </button>
                            </>
                          )}

                          {/* Status: Cancelled */}
                          {item.status === "Cancelled" && (
                            <button
                              className="action-btn action-btn--view action-btn--full"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <FaEye /> View
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