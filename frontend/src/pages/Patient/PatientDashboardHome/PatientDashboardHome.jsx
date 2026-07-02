import React from "react";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaStethoscope,
  FaFolderOpen,
  FaPills,
  FaVideo,
  FaHeartbeat,
  FaArrowRight,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./PatientDashboardHome.css";

const quickStats = [
  {
    label: "Upcoming Appointments",
    value: "2",
    icon: <FaCalendarCheck />,
    color: "#0d9488",
    bg: "#ccfbf1",
    path: "/patient/appointments",
  },
  {
    label: "Active Prescriptions",
    value: "5",
    icon: <FaPills />,
    color: "#0284c7",
    bg: "#e0f2fe",
    path: "/patient/pharmacy",
  },
  {
    label: "Doctors Consulted",
    value: "8",
    icon: <FaStethoscope />,
    color: "#7c3aed",
    bg: "#ede9fe",
    path: "/patient/find-doctors",
  },
  {
    label: "Medical Records",
    value: "14",
    icon: <FaFolderOpen />,
    color: "#f59e0b",
    bg: "#fef3c7",
    path: "/patient/medical-records",
  },
];

const quickLinks = [
  {
    label: "Find a Doctor",
    desc: "Search specialists near you",
    icon: <FaStethoscope />,
    path: "/patient/find-doctors",
    color: "#0d9488",
  },
  {
    label: "Online Consultation",
    desc: "Video call with your doctor",
    icon: <FaVideo />,
    path: "/patient/consultation",
    color: "#0284c7",
  },
  {
    label: "Order Medicine",
    desc: "Pharmacy & prescriptions",
    icon: <FaPills />,
    path: "/patient/pharmacy",
    color: "#7c3aed",
  },
  {
    label: "Book Appointment",
    desc: "Schedule a visit",
    icon: <FaCalendarCheck />,
    path: "/patient/appointments",
    color: "#f59e0b",
  },
];

function PatientDashboardHome() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="dashboard-home">
      {/* Welcome Banner */}
      <section className="dashboard-welcome">
        <div className="welcome-text">
          <p className="welcome-greeting">
            <FaHeartbeat className="greeting-pulse" /> {greeting},
          </p>
          <h1 className="welcome-name">John Doe 👋</h1>
          <p className="welcome-subtitle">
            Here's a summary of your health activity today.
          </p>
        </div>
        <div className="welcome-badge">
          <span className="badge-icon">🩺</span>
          <div>
            <p className="badge-label">Health Status</p>
            <p className="badge-value">Good</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="dashboard-stats">
        {quickStats.map((stat) => (
          <NavLink
            key={stat.label}
            to={stat.path}
            className="stat-card"
            style={{ "--stat-color": stat.color, "--stat-bg": stat.bg }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </NavLink>
        ))}
      </section>

      {/* Quick Links */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className="quick-link-card"
              style={{ "--link-color": link.color }}
            >
              <div className="quick-link-icon">{link.icon}</div>
              <div className="quick-link-info">
                <p className="quick-link-label">{link.label}</p>
                <p className="quick-link-desc">{link.desc}</p>
              </div>
              <FaArrowRight className="quick-link-arrow" />
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PatientDashboardHome;
