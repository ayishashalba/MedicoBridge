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
  todayOnlineAppointments,
  now,
  joinedMap,
  onStartConsultation,
  onViewDetails,
}) {
  // Find the single next approaching consultation or currently active one
  const targetReminder = useMemo(() => {
    const validReminders = todayOnlineAppointments
      .map((item) => ({
        item,
        timeStatus: getTodayConsultationStatus(item, now, joinedMap),
      }))
      .filter(({ timeStatus }) => {
        // Show if unlocked (within 2 mins or ongoing) OR upcoming within next 60 minutes
        return (
          timeStatus.isUnlocked ||
          (timeStatus.isUpcoming && timeStatus.diffMinutes <= 60 && timeStatus.diffMinutes > 0)
        );
      })
      .sort((a, b) => {
        // Order: Active/Ready first, then closest upcoming
        if (a.timeStatus.isUnlocked && !b.timeStatus.isUnlocked) return -1;
        if (!a.timeStatus.isUnlocked && b.timeStatus.isUnlocked) return 1;
        return a.timeStatus.diffSeconds - b.timeStatus.diffSeconds;
      });

    return validReminders.length > 0 ? validReminders[0] : null;
  }, [todayOnlineAppointments, now, joinedMap]);

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

  // Automatically update every 10 seconds to keep live countdowns and reminder statuses fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setJoinedMap(getJoinedConsultations());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Today's Online Appointments for the reminder system
  const todayOnlineAppointments = useMemo(() => {
    return doctorAppointmentsList.filter(
      (item) => item.status === "Today" && item.type.includes("Online")
    );
  }, []);

  const filteredAppointments = useMemo(() => {
    return doctorAppointmentsList.filter((item) => {
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
    const totals = {
      All: doctorAppointmentsList.length,
      Today: 0,
      Upcoming: 0,
      Completed: 0,
      Cancelled: 0,
    };
    doctorAppointmentsList.forEach((item) => {
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
      {/* ── Page Header (Clean, no "Active Today" pill) ── */}
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
        todayOnlineAppointments={todayOnlineAppointments}
        now={currentTime}
        joinedMap={joinedMap}
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
                {counts[status] ||
                  filteredAppointments.filter((x) => x.status === status).length}
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
                    // Compute live consultation time status
                    const timeStatus = getTodayConsultationStatus(
                      item,
                      currentTime,
                      joinedMap
                    );
                    const isUnlocked = timeStatus.isUnlocked;

                    return (
                      <div
                        className={`appointment-card-v2 ${
                          isUnlocked ? "appointment-card-v2--ready" : ""
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
                            {/* Dynamic Live Status Badge */}
                            {item.status === "Today" ? (
                              <span className={`status-pill ${timeStatus.badgeClass}`}>
                                {isUnlocked && <span className="live-dot" />}
                                {timeStatus.badgeLabel}
                              </span>
                            ) : (
                              <span
                                className={`status-pill status-pill--${item.status.toLowerCase()}`}
                              >
                                {item.status === "Completed" && <FaCheckCircle />}
                                {item.status === "Cancelled" && <FaTimesCircle />}
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Notice Message inside Card */}
                        {item.status === "Today" && (
                          <div
                            className={`card-reminder-alert-bar ${
                              isUnlocked
                                ? "card-reminder-alert-bar--ready"
                                : "card-reminder-alert-bar--upcoming"
                            }`}
                          >
                            {isUnlocked ? (
                              <>
                                <span className="live-dot" />
                                <span>
                                  <strong>Join Consultation Available</strong> ({item.time})
                                </span>
                              </>
                            ) : (
                              <>
                                <FaClock />
                                <span>Starts at {item.time}</span>
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
                          {/* Status: Today */}
                          {item.status === "Today" && (
                            <>
                              <button
                                className="action-btn action-btn--view"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <FaEye /> View Details
                              </button>

                              {/* Unlocked at 2 mins before scheduled time (e.g. 1:58 PM for 2:00 PM), locked before */}
                              {isUnlocked ? (
                                <button
                                  className="action-btn action-btn--join action-btn--ready-pulse"
                                  onClick={() => handleStartConsultation(item.id)}
                                >
                                  <FaPhoneAlt /> Join Consultation
                                </button>
                              ) : (
                                <button
                                  className="action-btn action-btn--join action-btn--disabled"
                                  disabled
                                  title={`Join Consultation unlocks at ${getTwoMinutesBefore(item.time)} (2 mins before scheduled time)`}
                                >
                                  <FaLock /> Starts at {item.time}
                                </button>
                              )}
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
                          )}

                          {/* Status: Cancelled */}
                          {item.status === "Cancelled" && (
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