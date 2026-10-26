import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaUsers,
  FaVideo,
  FaPills,
  FaHeartbeat,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaUserMd,
  FaFileMedical,
  FaBell,
  FaMapMarkerAlt,
  FaStar,
  FaClipboardList,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorDashboard.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/* ─── Avatar & Time Helpers ──────────────────────────────────── */

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

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Recently";
  const date = new Date(timestamp);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const formatTimeSlot = (timeSlot, date) => {
  if (timeSlot) return timeSlot;
  if (date) {
    try {
      return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Scheduled";
    }
  }
  return "Scheduled";
};

const formatPatientLastVisit = (dateVal, timeSlot) => {
  if (!dateVal) return "Recent visit";
  const d = new Date(dateVal);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  const timeStr =
    timeSlot || d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const diffDays = Math.round((today - checkDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${d.toLocaleDateString("en-IN", { month: "short", day: "2-digit" })}, ${timeStr}`;
};

const getActivityMeta = (type) => {
  switch (type) {
    case "prescription":
      return { icon: <FaPills />, color: "#0284c7", bg: "#e0f2fe" };
    case "medical-record":
    case "lab":
      return { icon: <FaFileMedical />, color: "#7c3aed", bg: "#ede9fe" };
    case "appointment":
      return { icon: <FaCalendarCheck />, color: "#0d9488", bg: "#ccfbf1" };
    case "notification":
    default:
      return { icon: <FaBell />, color: "#f59e0b", bg: "#fef3c7" };
  }
};

/* ─── Helper Badge & Action Components ────────────────────────── */

function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();
  let mappedKey = "scheduled";
  if (normalized === "completed") mappedKey = "completed";
  else if (normalized === "in-progress" || normalized === "inprogress") mappedKey = "in-progress";
  else if (normalized === "cancelled") mappedKey = "cancelled";

  const map = {
    completed: { label: "Completed", icon: <FaCheckCircle />, cls: "status--completed" },
    "in-progress": { label: "In Progress", icon: <FaSpinner className="spin-icon" />, cls: "status--inprogress" },
    scheduled: { label: "Scheduled", icon: <FaClock />, cls: "status--scheduled" },
    cancelled: { label: "Cancelled", icon: <FaTimesCircle />, cls: "status--scheduled" },
  };
  const { label, icon, cls } = map[mappedKey] || map.scheduled;
  return (
    <span className={`status-badge ${cls}`}>
      {icon} {label}
    </span>
  );
}

function TypeBadge({ type }) {
  const isVideo = /video|online/i.test(type || "");
  return isVideo ? (
    <span className="type-badge type-badge--video">
      <FaVideo /> Video
    </span>
  ) : (
    <span className="type-badge type-badge--inperson">
      <FaMapMarkerAlt /> In-Person
    </span>
  );
}

function ActionButton({ appt, onAction }) {
  const status = (appt.status || "").toLowerCase();
  const isVideo = /video|online/i.test(appt.type || "");

  if (status === "completed") {
    return (
      <button
        className="appt-action-btn appt-action-btn--records"
        onClick={() => onAction("records", appt)}
      >
        <FaFileMedical /> Records
      </button>
    );
  }
  if (isVideo) {
    return (
      <button
        className="appt-action-btn appt-action-btn--join"
        onClick={() => onAction("join", appt)}
      >
        <FaVideo /> Join Call
      </button>
    );
  }
  return (
    <button
      className="appt-action-btn appt-action-btn--view"
      onClick={() => onAction("view", appt)}
    >
      <FaUserMd /> View
    </button>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

function DoctorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctor/dashboard`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDashboardData(data.data);
      } else {
        toast.error(data.message || "Failed to load doctor dashboard.");
      }
    } catch (err) {
      console.error("Error loading doctor dashboard:", err);
      toast.error("Network error while loading doctor dashboard.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const doctor = dashboardData?.doctor || {};
  const metrics = dashboardData?.metrics || {};
  const todaysAppointments = dashboardData?.todaysAppointments || [];
  const recentPatients = dashboardData?.recentPatients || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const remainingToday = metrics.remainingToday ?? 0;

  // Determine organization type and badge
  const practiceType = (doctor.practiceType || "").toLowerCase();
  const isHospital =
    practiceType === "hospital" || Boolean(doctor.hospital) || Boolean(doctor.hospitalName);
  const organizationName = isHospital
    ? doctor.hospital?.name || doctor.hospitalName || "Not Provided"
    : doctor.clinicName || "Not Provided";
  const organizationLabel = isHospital ? "Hospital" : "Clinic";

  // Dynamic Summary Stats Cards
  const summaryStats = useMemo(() => {
    const todaysCount = metrics.todaysAppointments ?? 0;
    const totalPatientsCount = metrics.totalPatients ?? 0;
    const onlineCount = metrics.onlineConsultations ?? 0;
    const pendingRxCount = metrics.pendingPrescriptions ?? 0;

    return [
      {
        label: "Today's Appointments",
        value: todaysCount.toString(),
        icon: <FaCalendarCheck />,
        color: "#0d9488",
        bg: "#ccfbf1",
        trend: remainingToday > 0 ? `${remainingToday} remaining` : "All completed",
        trendUp: remainingToday > 0 ? true : null,
      },
      {
        label: "Total Patients",
        value: totalPatientsCount.toLocaleString(),
        icon: <FaUsers />,
        color: "#0284c7",
        bg: "#e0f2fe",
        trend: "Associated patients",
        trendUp: null,
      },
      {
        label: "Online Consultations",
        value: onlineCount.toLocaleString(),
        icon: <FaVideo />,
        color: "#7c3aed",
        bg: "#ede9fe",
        trend: "In-person & online",
        trendUp: null,
      },
      {
        label: "Pending Prescriptions",
        value: pendingRxCount.toString(),
        icon: <FaPills />,
        color: "#f59e0b",
        bg: "#fef3c7",
        trend: pendingRxCount > 0 ? `${pendingRxCount} pending` : "All cleared",
        trendUp: pendingRxCount > 0 ? false : true,
      },
    ];
  }, [metrics, remainingToday]);

  // Appointment actions
  const handleAppointmentAction = (action, appt) => {
    if (action === "records") {
      const pId = appt.patientId?._id || appt.patientId;
      if (pId) {
        navigate(`/doctor/patients/${pId}`);
      } else {
        navigate("/doctor/medical-records");
      }
    } else if (action === "join") {
      navigate(`/doctor/consultation-room/${appt._id}`);
    } else if (action === "view") {
      navigate(`/doctor/appointments/${appt._id}`);
    }
  };

  return (
    <div className="doctor-home">
      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <section className="doctor-welcome">
        <div className="welcome-text">
          <p className="welcome-greeting">
            <FaHeartbeat className="greeting-pulse" /> {greeting},
          </p>
          <h1 className="welcome-name">
            {doctor.name ? `Dr. ${doctor.name} 👋` : "Welcome Doctor 👋"}
          </h1>
          <p className="welcome-subtitle">
            You have{" "}
            <strong>
              {todaysAppointments.length} appointment
              {todaysAppointments.length === 1 ? "" : "s"}
            </strong>{" "}
            today — {remainingToday} consultation{remainingToday === 1 ? "" : "s"} remaining.
          </p>
        </div>
        <div className="welcome-meta">
          <div className="welcome-badge">
            <span className="badge-icon">📅</span>
            <div>
              <p className="badge-label">Today's Date</p>
              <p className="badge-value">{today}</p>
            </div>
          </div>
          <div className="welcome-badge welcome-badge--phone">
            <span className="badge-icon">🏥</span>
            <div>
              <p className="badge-label">{organizationLabel}</p>
              <p className="badge-value">{organizationName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Summary Stats ──────────────────────────────────────── */}
      <section className="doctor-stats">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ "--stat-color": stat.color, "--stat-bg": stat.bg }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <span
                className={`stat-trend ${
                  stat.trendUp === true
                    ? "trend-up"
                    : stat.trendUp === false
                    ? "trend-down"
                    : "trend-neutral"
                }`}
              >
                {stat.trendUp === true ? "↑" : stat.trendUp === false ? "•" : "•"} {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Main Content Grid ───────────────────────────────────── */}
      <div className="doctor-content-grid">
        {/* ── LEFT: Today's Appointments ─────────────────────── */}
        <section className="doctor-section appt-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaCalendarCheck className="section-title-icon" /> Today's Appointments
            </h2>
            <span className="section-count">{todaysAppointments.length} total</span>
          </div>

          <div className="appt-table-wrapper">
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "2.5rem 1rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <FaCalendarCheck
                        style={{
                          fontSize: "1.8rem",
                          marginBottom: "0.5rem",
                          opacity: 0.5,
                          display: "block",
                          margin: "0 auto 0.5rem",
                        }}
                      />
                      No appointments scheduled for today.
                    </td>
                  </tr>
                ) : (
                  todaysAppointments.map((appt) => {
                    const patientName = appt.patientId?.name || "Patient";
                    const initials = getInitials(patientName);
                    const avatarColor = getAvatarColor(patientName);
                    const time = formatTimeSlot(appt.timeSlot, appt.date);
                    const complaint = appt.reason || (appt.symptoms && appt.symptoms[0]) || "General Consultation";
                    const status = (appt.status || "scheduled").toLowerCase();

                    return (
                      <tr key={appt._id} className={`appt-row appt-row--${status}`}>
                        <td>
                          <div className="patient-cell">
                            <div
                              className="patient-initials"
                              style={{ background: avatarColor }}
                            >
                              {initials}
                            </div>
                            <span className="patient-cell-name">{patientName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="appt-time">{time}</span>
                        </td>
                        <td>
                          <TypeBadge type={appt.type} />
                        </td>
                        <td>
                          <span className="appt-complaint" title={complaint}>
                            {complaint}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={status} />
                        </td>
                        <td>
                          <ActionButton appt={appt} onAction={handleAppointmentAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <button className="view-all-btn" onClick={() => navigate("/doctor/appointments")}>
            View Full Schedule <FaArrowRight />
          </button>
        </section>

        {/* ── RIGHT COLUMN ────────────────────────────────────── */}
        <div className="doctor-right-col">
          {/* Recent Patients */}
          <section className="doctor-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaUsers className="section-title-icon" /> Recent Patients
              </h2>
              <button
                className="section-link-btn"
                onClick={() => navigate("/doctor/patients")}
              >
                View All <FaArrowRight />
              </button>
            </div>
            <ul className="recent-patients-list">
              {recentPatients.length === 0 ? (
                <li
                  style={{
                    padding: "1.5rem 0",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  No recent patient records found.
                </li>
              ) : (
                recentPatients.map((patient) => {
                  const initials = getInitials(patient.name);
                  const avatarColor = getAvatarColor(patient.name);
                  const lastVisit = formatPatientLastVisit(
                    patient.lastVisitDate,
                    patient.timeSlot
                  );

                  return (
                    <li key={patient._id} className="recent-patient-item">
                      <div
                        className="rp-avatar"
                        style={{ background: avatarColor }}
                      >
                        {initials}
                      </div>
                      <div className="rp-info">
                        <p className="rp-name">{patient.name}</p>
                        <p className="rp-meta">
                          <span className="rp-id">{patient.patientId}</span>
                          <span className="rp-dot">·</span>
                          <span className="rp-complaint" title={patient.complaint}>
                            {patient.complaint}
                          </span>
                        </p>
                        <p className="rp-last-visit">{lastVisit}</p>
                      </div>
                      <div className="rp-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < (patient.rating || 0) ? "star-filled" : "star-empty"}
                          />
                        ))}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          {/* Recent Activity */}
          <section className="doctor-section">
            <div className="section-header">
              <h2 className="section-title">
                <FaBell className="section-title-icon" /> Recent Activity
              </h2>
            </div>
            <ul className="activity-feed">
              {recentActivity.length === 0 ? (
                <li
                  style={{
                    padding: "1.5rem 0",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  No recent activity recorded.
                </li>
              ) : (
                recentActivity.map((item) => {
                  const meta = getActivityMeta(item.type);
                  const time = formatRelativeTime(item.timestamp);

                  return (
                    <li key={item.id} className="activity-item">
                      <div
                        className="activity-icon"
                        style={{ color: meta.color, background: meta.bg }}
                      >
                        {meta.icon}
                      </div>
                      <div className="activity-body">
                        <p className="activity-message">{item.message}</p>
                        <p className="activity-time">{time}</p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>
        {/* end right col */}
      </div>
      {/* end content grid */}
    </div>
  );
}

export default DoctorDashboard;
