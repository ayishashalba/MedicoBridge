import React from "react";
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
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaStar,
  FaClipboardList,
} from "react-icons/fa";
import "./DoctorDashboard.css";

/* ─── Static Dummy Data ──────────────────────────────────────── */

const summaryStats = [
  {
    label: "Today's Appointments",
    value: "8",
    icon: <FaCalendarCheck />,
    color: "#0d9488",
    bg: "#ccfbf1",
    trend: "+2 vs yesterday",
    trendUp: true,
  },
  {
    label: "Total Patients",
    value: "1,248",
    icon: <FaUsers />,
    color: "#0284c7",
    bg: "#e0f2fe",
    trend: "+14 this month",
    trendUp: true,
  },
  {
    label: "Online Consultations",
    value: "4",
    icon: <FaVideo />,
    color: "#7c3aed",
    bg: "#ede9fe",
    trend: "2 starting soon",
    trendUp: null,
  },
  {
    label: "Pending Prescriptions",
    value: "12",
    icon: <FaPills />,
    color: "#f59e0b",
    bg: "#fef3c7",
    trend: "3 urgent",
    trendUp: false,
  },
];

const todaysAppointments = [
  {
    id: 1,
    patientName: "Zara Ahmed",
    initials: "ZA",
    avatarColor: "#0d9488",
    time: "09:00 AM",
    type: "video",
    complaint: "Chest Pain Follow-up",
    status: "completed",
  },
  {
    id: 2,
    patientName: "Rahul Menon",
    initials: "RM",
    avatarColor: "#0284c7",
    time: "10:30 AM",
    type: "in-person",
    complaint: "Hypertension Check",
    status: "completed",
  },
  {
    id: 3,
    patientName: "Fatima Al-Hassan",
    initials: "FH",
    avatarColor: "#7c3aed",
    time: "11:45 AM",
    type: "video",
    complaint: "ECG Review",
    status: "in-progress",
  },
  {
    id: 4,
    patientName: "David Okonkwo",
    initials: "DO",
    avatarColor: "#f59e0b",
    time: "01:00 PM",
    type: "in-person",
    complaint: "Post-Surgery Follow-up",
    status: "scheduled",
  },
  {
    id: 5,
    patientName: "Priya Nair",
    initials: "PN",
    avatarColor: "#e11d48",
    time: "02:30 PM",
    type: "video",
    complaint: "Arrhythmia Consultation",
    status: "scheduled",
  },
  {
    id: 6,
    patientName: "James Kauffman",
    initials: "JK",
    avatarColor: "#16a34a",
    time: "04:00 PM",
    type: "in-person",
    complaint: "Routine Cardiac Checkup",
    status: "scheduled",
  },
];

const recentPatients = [
  {
    id: 1,
    name: "Zara Ahmed",
    initials: "ZA",
    avatarColor: "#0d9488",
    patientId: "#PT-30214",
    lastVisit: "Today, 09:00 AM",
    complaint: "Chest Pain Follow-up",
    rating: 5,
  },
  {
    id: 2,
    name: "Rahul Menon",
    initials: "RM",
    avatarColor: "#0284c7",
    patientId: "#PT-28841",
    lastVisit: "Today, 10:30 AM",
    complaint: "Hypertension Check",
    rating: 5,
  },
  {
    id: 3,
    name: "Aisha Bello",
    initials: "AB",
    avatarColor: "#7c3aed",
    patientId: "#PT-25543",
    lastVisit: "Yesterday, 03:00 PM",
    complaint: "Shortness of Breath",
    rating: 4,
  },
  {
    id: 4,
    name: "Thomas Müller",
    initials: "TM",
    avatarColor: "#f59e0b",
    patientId: "#PT-22107",
    lastVisit: "Jul 07, 11:00 AM",
    complaint: "Stress Test Results",
    rating: 5,
  },
];

const recentActivity = [
  {
    id: 1,
    icon: <FaPills />,
    iconColor: "#0284c7",
    iconBg: "#e0f2fe",
    message: "Prescription sent to MedPlus Pharmacy for Zara Ahmed",
    time: "28 mins ago",
  },
  {
    id: 2,
    icon: <FaFileMedical />,
    iconColor: "#7c3aed",
    iconBg: "#ede9fe",
    message: "Aisha Bello uploaded echocardiogram report",
    time: "1 hr ago",
  },
  {
    id: 3,
    icon: <FaCalendarCheck />,
    iconColor: "#0d9488",
    iconBg: "#ccfbf1",
    message: "New appointment booked by David Okonkwo for Jan 13",
    time: "2 hrs ago",
  },
  {
    id: 4,
    icon: <FaBell />,
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
    message: "Fatima Al-Hassan's ECG review session starting in 15 mins",
    time: "3 hrs ago",
  },
  {
    id: 5,
    icon: <FaClipboardList />,
    iconColor: "#e11d48",
    iconBg: "#ffe4e6",
    message: "Lab results reviewed and notes added for Rahul Menon",
    time: "5 hrs ago",
  },
];

/* ─── Helper Components ──────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    completed: { label: "Completed", icon: <FaCheckCircle />, cls: "status--completed" },
    "in-progress": { label: "In Progress", icon: <FaSpinner className="spin-icon" />, cls: "status--inprogress" },
    scheduled: { label: "Scheduled", icon: <FaClock />, cls: "status--scheduled" },
  };
  const { label, icon, cls } = map[status] || map.scheduled;
  return (
    <span className={`status-badge ${cls}`}>
      {icon} {label}
    </span>
  );
}

function TypeBadge({ type }) {
  return type === "video" ? (
    <span className="type-badge type-badge--video">
      <FaVideo /> Video
    </span>
  ) : (
    <span className="type-badge type-badge--inperson">
      <FaMapMarkerAlt /> In-Person
    </span>
  );
}

function ActionButton({ type, status }) {
  if (status === "completed") {
    return (
      <button className="appt-action-btn appt-action-btn--records">
        <FaFileMedical /> Records
      </button>
    );
  }
  if (type === "video") {
    return (
      <button className="appt-action-btn appt-action-btn--join">
        <FaVideo /> Join Call
      </button>
    );
  }
  return (
    <button className="appt-action-btn appt-action-btn--view">
      <FaUserMd /> View
    </button>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */

// Toggle this to "Clinic" to test Private Clinic Doctor view
const DOCTOR_TYPE = "Hospital";

function DoctorDashboard() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="doctor-home">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <section className="doctor-welcome">
        <div className="welcome-text">
          <p className="welcome-greeting">
            <FaHeartbeat className="greeting-pulse" /> {greeting},
          </p>
          <h1 className="welcome-name">Dr. Ayisha Shalba 👋</h1>
          <p className="welcome-subtitle">
            You have <strong>8 appointments</strong> today — 4 consultations remaining.
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
          {DOCTOR_TYPE === "Hospital" ? (
            <div className="welcome-badge welcome-badge--phone">
              <span className="badge-icon">🏥</span>
              <div>
                <p className="badge-label">Hospital</p>
                <p className="badge-value">Apollo Hospital</p>
              </div>
            </div>
          ) : (
            <div className="welcome-badge welcome-badge--phone">
              <span className="badge-icon">🏥</span>
              <div>
                <p className="badge-label">Clinic</p>
                <p className="badge-value">HeartCare Clinic</p>
              </div>
            </div>
          )}
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
              <span className={`stat-trend ${stat.trendUp === true ? "trend-up" : stat.trendUp === false ? "trend-down" : "trend-neutral"}`}>
                {stat.trendUp === true ? "↑" : stat.trendUp === false ? "↑" : "•"} {stat.trend}
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
                {todaysAppointments.map((appt) => (
                  <tr key={appt.id} className={`appt-row appt-row--${appt.status}`}>
                    <td>
                      <div className="patient-cell">
                        <div
                          className="patient-initials"
                          style={{ background: appt.avatarColor }}
                        >
                          {appt.initials}
                        </div>
                        <span className="patient-cell-name">{appt.patientName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="appt-time">{appt.time}</span>
                    </td>
                    <td>
                      <TypeBadge type={appt.type} />
                    </td>
                    <td>
                      <span className="appt-complaint">{appt.complaint}</span>
                    </td>
                    <td>
                      <StatusBadge status={appt.status} />
                    </td>
                    <td>
                      <ActionButton type={appt.type} status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="view-all-btn">
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
              <button className="section-link-btn">View All <FaArrowRight /></button>
            </div>
            <ul className="recent-patients-list">
              {recentPatients.map((patient) => (
                <li key={patient.id} className="recent-patient-item">
                  <div
                    className="rp-avatar"
                    style={{ background: patient.avatarColor }}
                  >
                    {patient.initials}
                  </div>
                  <div className="rp-info">
                    <p className="rp-name">{patient.name}</p>
                    <p className="rp-meta">
                      <span className="rp-id">{patient.patientId}</span>
                      <span className="rp-dot">·</span>
                      <span className="rp-complaint">{patient.complaint}</span>
                    </p>
                    <p className="rp-last-visit">{patient.lastVisit}</p>
                  </div>
                  <div className="rp-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < patient.rating ? "star-filled" : "star-empty"}
                      />
                    ))}
                  </div>
                </li>
              ))}
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
              {recentActivity.map((item) => (
                <li key={item.id} className="activity-item">
                  <div
                    className="activity-icon"
                    style={{ color: item.iconColor, background: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <div className="activity-body">
                    <p className="activity-message">{item.message}</p>
                    <p className="activity-time">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

        </div>{/* end right col */}
      </div>{/* end content grid */}

    </div>
  );
}

export default DoctorDashboard;
