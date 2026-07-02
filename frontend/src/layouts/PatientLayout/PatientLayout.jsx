import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaTachometerAlt,
  FaUserCircle,
  FaStethoscope,
  FaCalendarCheck,
  FaVideo,
  FaPills,
  FaFolderOpen,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaSearch,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import "./PatientLayout.css";

const sidebarNavItems = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: "/patient/dashboard",
  },
  {
    label: "My Profile",
    icon: <FaUserCircle />,
    path: "/patient/profile",
  },
  {
    label: "Find Doctors",
    icon: <FaStethoscope />,
    path: "/patient/find-doctors",
  },
  {
    label: "My Appointments",
    icon: <FaCalendarCheck />,
    path: "/patient/appointments",
  },
  {
    label: "Online Consultation",
    icon: <FaVideo />,
    path: "/patient/consultation",
  },
  {
    label: "Pharmacy",
    icon: <FaPills />,
    path: "/patient/pharmacy",
  },
  {
    label: "Medical Records",
    icon: <FaFolderOpen />,
    path: "/patient/medical-records",
  },
  {
    label: "Notifications",
    icon: <FaBell />,
    path: "/patient/notifications",
    badge: 3,
  },
  {
    label: "Settings",
    icon: <FaCog />,
    path: "/patient/settings",
  },
];

function PatientLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  const handleLogout = () => {
    navigate("/login/patient");
  };

  return (
    <div className="patient-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`patient-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${sidebarOpen ? "sidebar-mobile-open" : ""}`}
        aria-label="Patient navigation sidebar"
      >
        {/* Sidebar Header / Logo */}
        <div className="sidebar-header">
          <NavLink to="/patient/dashboard" className="sidebar-logo" onClick={closeMobileSidebar}>
            <div className="sidebar-logo-icon">
              <FaHeartbeat />
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-brand-name">MedicoBridge</span>
                <span className="sidebar-brand-tagline">Patient Portal</span>
              </div>
            )}
          </NavLink>

          {/* Collapse toggle (desktop) */}
          {!sidebarCollapsed && (
            <button
              className="sidebar-collapse-btn"
              onClick={toggleCollapse}
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
            >
              <FaChevronLeft />
            </button>
          )}
          {/* Close button (mobile) */}
          <button
            className="sidebar-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        {/* Patient Profile Card */}
        <div className={`sidebar-profile-card ${sidebarCollapsed ? "profile-card-collapsed" : ""}`}>
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            <span className="profile-status-dot" aria-label="Online" />
          </div>
          {!sidebarCollapsed && (
            <div className="profile-info">
              <p className="profile-name">John Doe</p>
              <p className="profile-role">Patient</p>
              <span className="profile-id-badge">ID: #PT-20041</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav" aria-label="Patient menu">
          <ul className="sidebar-nav-list">
            {sidebarNavItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
                  end={item.path === "/patient/dashboard"}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? "sidebar-nav-link--active" : ""}`
                  }
                  onClick={closeMobileSidebar}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="nav-link-label">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.badge && (
                    <span className="nav-link-badge">{item.badge}</span>
                  )}
                  {sidebarCollapsed && item.badge && (
                    <span className="nav-link-badge nav-link-badge--dot" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            aria-label="Logout"
          >
            <span className="nav-link-icon">
              <FaSignOutAlt />
            </span>
            {!sidebarCollapsed && <span className="nav-link-label">Logout</span>}
          </button>
        </div>
      </aside>
      {sidebarCollapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={toggleCollapse}
          aria-label="Expand Sidebar"
        >
          <FaChevronRight />
        </button>
      )}

      {/* ─── Main Area ─── */}
      <div className={`patient-main ${sidebarCollapsed ? "main-expanded" : ""}`}>
        {/* Top Navbar */}
        <header className="patient-topnav">
          <div className="topnav-left">
            {/* Mobile hamburger */}
            <button
              className="topnav-hamburger"
              onClick={toggleMobileSidebar}
              aria-label="Open navigation menu"
            >
              <FaBars />
            </button>

            {/* Search bar */}
            <div className="topnav-search">
              <FaSearch className="topnav-search-icon" />
              <input
                type="search"
                className="topnav-search-input"
                placeholder="Search doctors, records…"
                aria-label="Search"
              />
            </div>
          </div>

          <div className="topnav-right">
            {/* Notifications */}
            <NavLink
              to="/patient/notifications"
              className="topnav-icon-btn"
              aria-label="Notifications"
            >
              <FaBell />
              <span className="topnav-badge">3</span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/patient/settings"
              className="topnav-icon-btn"
              aria-label="Settings"
            >
              <FaCog />
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/patient/profile"
              className="topnav-profile-btn"
              aria-label="My Profile"
            >
              <div className="topnav-avatar">
                <FaUserCircle />
              </div>
              <div className="topnav-profile-info">
                <span className="topnav-profile-name">John Doe</span>
                <span className="topnav-profile-role">Patient</span>
              </div>
              <FaChevronRight className="topnav-chevron" />
            </NavLink>
          </div>
        </header>

        {/* Content Area */}
        <main className="patient-content" id="patient-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientLayout;
