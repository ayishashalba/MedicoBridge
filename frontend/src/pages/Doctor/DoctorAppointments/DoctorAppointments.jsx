import React, { useState, useEffect, useMemo } from "react";
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
  FaPhoneAlt,
} from "react-icons/fa";
import "./DoctorAppointments.css";
import {
  doctorAppointmentsList,
  getTodayConsultationStatus,
  getJoinedConsultations,
} from "../../../services/doctorAppointmentsData";

// Toggle this to "Clinic" to test Private Clinic Doctor view
const DOCTOR_TYPE = "Hospital";
const STATUS_GROUPS = ["Today", "Upcoming", "Completed", "Cancelled"];

/* ─── Top Reminder Banner Component (Next Approaching Consultation Only) ─── */
function ApproachingConsultationReminderBanner({
  onlineAppointmentsWithStatus,
  onStartConsultation,
  onViewDetails,
}) {
  // Find the single next approaching consultation or currently active one
  const targetReminder = useMemo(() => {
    const validReminders = onlineAppointmentsWithStatus
      .filter(({ timeStatus }) => {
        // Exclude completed or cancelled
        if (timeStatus.isCompleted || timeStatus.isCancelled) return false;
        // Show if unlocked (within 2 mins or ongoing) OR upcoming within next 60 minutes
        return (
          timeStatus.isUnlocked ||
          timeStatus.isOngoing ||
          (timeStatus.isUpcoming && timeStatus.diffMinutes <= 60 && timeStatus.diffMinutes > 0)
        );
      })
      .sort((a, b) => {
        // Order: Ongoing/Ready first, then closest upcoming
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
        isUnlocked
          ? "reminder-banner--urgent"
          : "reminder-banner--approaching"
      }`}
    >
      <div className="reminder-banner-main">
        <div className="reminder-banner-icon-wrapper">
          {isUnlocked ? (
            <FaPhoneAlt className="banner-icon-pulse" />
          ) : (
            <FaBell className="banner-icon-ring" />
          )}
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
                  ? "Ongoing Consultation"
                  : "Ready to Join"
                : "Upcoming Reminder"}
            </span>
            <span className="reminder-time-tag">
              <FaClock /> Scheduled at {item.time}
            </span>
          </div>

          <h3 className="reminder-banner-headline">
            {timeStatus.reminderText}
          </h3>

          <p className="reminder-banner-desc">
            Patient: <strong>{item.patient}</strong> ({item.patientId}) · Complaint:{" "}
            {item.complaint} · Online Video Consultation
          </p>
        </div>

        <div className="reminder-banner-actions">
          {isUnlocked ? (
            <button
              className="banner-action-btn banner-action-btn--primary banner-action-btn--highlighted"
              onClick={() => onStartConsultation(item.id)}
            >
              <FaPhoneAlt /> Join Consultation
            </button>
          ) : (
            <div className="banner-locked-notice">
              <FaLock /> Join unlocks at {getTwoMinutesBefore(item.time)}
            </div>
          )}

          <button
            className="banner-action-btn banner-action-btn--secondary"
            onClick={() => onViewDetails(item.id)}
          >
            <FaEye /> View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to format "9:58 AM" from "10:00 AM"
function getTwoMinutesBefore(timeStr) {
  const match = timeStr?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  m -= 2;
  if (m < 0) {
    m += 60;
    h -= 1;
    if (h === 0) h = 12;
  }
  const mm = String(m).padStart(2, "0");
  return `${h}:${mm} ${ampm}`;
}

/* ─── Main Doctor Appointments Component ────────────────────────── */
function DoctorAppointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinedMap, setJoinedMap] = useState(getJoinedConsultations());

  // Automatically update every 2 seconds to keep live countdowns and reminder statuses fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setJoinedMap(getJoinedConsultations());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Compute live consultation status for each appointment dynamically
  const appointmentsWithStatus = useMemo(() => {
    return doctorAppointmentsList.map((item) => {
      const timeStatus = getTodayConsultationStatus(item, currentTime, joinedMap);
      return {
        ...item,
        timeStatus,
        effectiveGroup: timeStatus.isCancelled
          ? "Cancelled"
          : timeStatus.isCompleted
          ? "Completed"
          : timeStatus.isToday
          ? "Today"
          : "Upcoming",
      };
    });
  }, [currentTime, joinedMap]);

  // Online appointments with status for top reminder
  const onlineAppointmentsWithStatus = useMemo(() => {
    return appointmentsWithStatus
      .filter((item) => item.type.includes("Online"))
      .map((item) => ({ item, timeStatus: item.timeStatus }));
  }, [appointmentsWithStatus]);

  // Filtered by search & active tab
  const filteredAppointments = useMemo(() => {
    return appointmentsWithStatus.filter((item) => {
      const matchesSearch =
        item.patient.toLowerCase().includes(search.toLowerCase()) ||
        item.complaint.toLowerCase().includes(search.toLowerCase()) ||
        item.patientId.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "All") return true;
      if (activeFilter === "Today") return item.timeStatus.isToday;
      if (activeFilter === "Upcoming") return item.timeStatus.isUpcoming;
      if (activeFilter === "Completed") return item.timeStatus.isCompleted;
      if (activeFilter === "Cancelled") return item.timeStatus.isCancelled;
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
      if (item.timeStatus.isToday) totals.Today++;
      if (item.timeStatus.isUpcoming) totals.Upcoming++;
      if (item.timeStatus.isCompleted) totals.Completed++;
      if (item.timeStatus.isCancelled) totals.Cancelled++;
    });
    return totals;
  }, [appointmentsWithStatus]);

  const handleStartConsultation = (id) => {
    navigate(`/doctor/consultation-room/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/doctor/appointments/${id}`);
  };

  return (
    <div className="doctor-appointments">
      {/* ── Page Header ── */}
      <div className="appointments-header">
        <div className="header-title-section">
          <h2>
            <FaCalendarCheck /> Appointments
          </h2>
          <p>View, search, and manage your clinical consultation schedule.</p>
        </div>
      </div>

      {/* ── Single Approaching Consultation Reminder Banner ── */}
      <ApproachingConsultationReminderBanner
        onlineAppointmentsWithStatus={onlineAppointmentsWithStatus}
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
              <span className="filter-count-badge">
                {counts[status]}
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
                  <span
                    className={`title-dot title-dot--${statusGroup.toLowerCase()}`}
                  />
                  {statusGroup} Appointments ({list.length})
                </h3>

                <div className="appointments-grid-container">
                  {list.map((item) => {
                    const timeStatus = item.timeStatus;
                    const canJoin = timeStatus.canJoin;

                    return (
                      <div
                        className={`appointment-card-v2 ${
                          canJoin ? "appointment-card-v2--ready" : ""
                        }`}
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
                              <span className="patient-id-badge">
                                {item.patientId}
                              </span>
                            </div>
                          </div>

                          <div className="card-top-badges">
                            <span className={`status-pill ${timeStatus.badgeClass}`}>
                              {canJoin && <span className="live-dot" />}
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
                              <strong>Consultation is Ongoing</strong> ({item.time})
                            </span>
                          </div>
                        ) : timeStatus.isReady ? (
                          <div className="card-reminder-alert-bar card-reminder-alert-bar--ready">
                            <span className="live-dot" />
                            <span>
                              <strong>Join Consultation Available</strong> (Starts at {item.time})
                            </span>
                          </div>
                        ) : timeStatus.isUpcoming ? (
                          <div className="card-reminder-alert-bar card-reminder-alert-bar--upcoming">
                            <FaClock />
                            <span>Starts at {item.time} ({timeStatus.timeNotice})</span>
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
                            {item.type.includes("Online") ? (
                              <>
                                <FaVideo className="type-icon--online" />
                                <span>Online Video Consultation</span>
                              </>
                            ) : (
                              <>
                                <FaHospital className="type-icon--hospital" />
                                <span>
                                  {DOCTOR_TYPE === "Hospital"
                                    ? "Hospital Visit"
                                    : "Clinic Visit"}
                                </span>
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
                                onClick={() =>
                                  navigate(`/doctor/prescriptions/${item.id}`)
                                }
                              >
                                <FaPrescriptionBottleAlt /> View Prescription
                              </button>
                            </>
                          ) : timeStatus.isCancelled ? (
                            /* Cancelled appointment: Join button removed */
                            <button
                              className="action-btn action-btn--view action-btn--full"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <FaEye /> View Details
                            </button>
                          ) : canJoin ? (
                            /* 2 mins before or ongoing: Join enabled */
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View Details
                              </button>
                              <button
                                className="action-btn action-btn--join action-btn--ready-pulse"
                                onClick={() => handleStartConsultation(item.id)}
                              >
                                <FaPhoneAlt /> Join Consultation
                              </button>
                            </>
                          ) : (
                            /* Future appointment (> 2 mins): Join locked/disabled */
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View Details
                              </button>
                              {item.type.includes("Online") ? (
                                <button
                                  className="action-btn action-btn--join action-btn--disabled"
                                  disabled
                                  title={`Join Consultation unlocks at ${getTwoMinutesBefore(item.time)} (2 mins before scheduled time)`}
                                >
                                  <FaLock /> Starts at {item.time}
                                </button>
                              ) : null}
                            </>
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