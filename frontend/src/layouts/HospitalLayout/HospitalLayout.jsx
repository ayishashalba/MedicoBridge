import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaBed,
  FaFlask,
  FaPills,
  FaFileInvoiceDollar,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaHospital,
} from "react-icons/fa";
import "./HospitalLayout123.css";
import "./hospital-shared.css";

const sidebarNavItems = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: "/hospital/dashboard",
  },
  {
    label: "Manage Doctors",
    icon: <FaUserMd />,
    path: "/hospital/doctors",
  },
  {
    label: "Patients",
    icon: <FaUsers />,
    path: "/hospital/patients",
  },
  {
    label: "Appointments",
    icon: <FaCalendarCheck />,
    path: "/hospital/appointments",
  },
  {
    label: "Bed Management",
    icon: <FaBed />,
    path: "/hospital/beds",
  },
  {
    label: "Lab Reports",
    icon: <FaFlask />,
    path: "/hospital/labs",
  },
  {
    label: "Pharmacy Requests",
    icon: <FaPills />,
    path: "/hospital/pharmacy",
  },
  {
    label: "Billing & Invoices",
    icon: <FaFileInvoiceDollar />,
    path: "/hospital/billing",
  },
  {
    label: "Notifications",
    icon: <FaBell />,
    path: "/hospital/notifications",
    badge: 3,
  },
  {
    label: "Settings",
    icon: <FaCog />,
    path: "/hospital/settings",
  },
];

function HospitalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  const handleLogout = () => {
    navigate("/login/hospital");
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const matchedItem = sidebarNavItems.find(
      (item) => item.path === currentPath
    );
    return matchedItem ? matchedItem.label : "Hospital Portal";
  };

  return (
    <div className="hospital-layout">
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
        className={`hospital-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${sidebarOpen ? "sidebar-mobile-open" : ""}`}
        aria-label="Hospital navigation sidebar"
      >
        {/* Sidebar Header / Logo */}
        <div className="sidebar-header">
          <NavLink to="/hospital/dashboard" className="sidebar-logo" onClick={closeMobileSidebar}>
            <div className="sidebar-logo-icon">
              <FaHospital />
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-brand-name">MedicoBridge</span>
                <span className="sidebar-brand-tagline">Hospital Portal</span>
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

        {/* Hospital Info Card */}
        <div className={`sidebar-profile-card ${sidebarCollapsed ? "profile-card-collapsed" : ""}`}>
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <FaHospital />
            </div>
            <span className="profile-status-dot" aria-label="System Connected" />
          </div>
          {!sidebarCollapsed && (
            <div className="profile-info">
              <p className="profile-name">City General Hospital</p>
              <p className="profile-role">Admin Center</p>
              <span className="profile-id-badge">ID: #HOSP-5021</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav" aria-label="Hospital menu">
          <ul className="sidebar-nav-list">
            {sidebarNavItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
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
      <div className={`hospital-main ${sidebarCollapsed ? "main-expanded" : ""}`}>
        {/* Top Navbar */}
        <header className="hospital-topnav">
          <div className="topnav-left">
            {/* Mobile hamburger */}
            <button
              className="topnav-hamburger"
              onClick={toggleMobileSidebar}
              aria-label="Open navigation menu"
            >
              <FaBars />
            </button>

            {/* Page Title */}
            <h1 className="topnav-title">{getPageTitle()}</h1>
          </div>

          <div className="topnav-right">
            {/* Notifications Shortcut */}
            <NavLink
              to="/hospital/notifications"
              className="topnav-icon-btn"
              aria-label="Notifications"
            >
              <FaBell />
              <span className="topnav-badge">3</span>
            </NavLink>

            {/* Settings Shortcut */}
            <NavLink
              to="/hospital/settings"
              className="topnav-icon-btn"
              aria-label="Settings"
            >
              <FaCog />
            </NavLink>

            {/* Hospital User Badge */}
            <div className="topnav-profile-btn">
              <div className="topnav-avatar">
                <FaHospital />
              </div>
              <div className="topnav-profile-info">
                <span className="topnav-profile-name">City General Hospital</span>
                <span className="topnav-profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="hospital-content" id="hospital-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default HospitalLayout;
