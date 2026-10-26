import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaHeartbeat,
  FaTachometerAlt,
  FaUserMd,
  FaCalendarCheck,
  FaVideo,
  FaUsers,
  FaPills,
  FaFolderOpen,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorLayout.css";

const sidebarNavItems = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: "/doctor/dashboard",
  },
  {
    label: "Appointments",
    icon: <FaCalendarCheck />,
    path: "/doctor/appointments",
  },
  {
    label: "Online Consultation",
    icon: <FaVideo />,
    path: "/doctor/consultation",
  },
  {
    label: "Patients",
    icon: <FaUsers />,
    path: "/doctor/patients",
  },
  {
    label: "Prescriptions",
    icon: <FaPills />,
    path: "/doctor/prescriptions",
  },
  {
    label: "Medical Records",
    icon: <FaFolderOpen />,
    path: "/doctor/medical-records",
  },
  {
    label: "Notifications",
    icon: <FaBell />,
    path: "/doctor/notifications",
    badge: 5,
  },
  {
    label: "Settings",
    icon: <FaCog />,
    path: "/doctor/settings",
  },
];

function DoctorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(
          "http://localhost:5000/api/doctor/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setDoctorProfile(
            data?.data?.profile ||
            data?.data ||
            data?.profile ||
            null
          );
        }
      } catch (error) {
        console.error("DOCTOR LAYOUT PROFILE ERROR:", error);
      }
    };

    fetchDoctorProfile();
  }, []);

  const toggleMobileSidebar = () => setSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    toast.info("You have been logged out successfully.");
    navigate("/login/doctor");
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;

    if (currentPath === "/doctor/profile") {
      return "My Profile";
    }

    if (currentPath === "/doctor/reviews") {
      return "Reviews & Ratings";
    }

    const matchedItem = sidebarNavItems.find(
      (item) => item.path === currentPath
    );

    return matchedItem ? matchedItem.label : "Doctor Portal";
  };

  return (
    <div className="doctor-layout">
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
        className={`doctor-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${sidebarOpen ? "sidebar-mobile-open" : ""}`}
        aria-label="Doctor navigation sidebar"
      >
        {/* Sidebar Header / Logo */}
        <div className="sidebar-header">
          <NavLink to="/doctor/dashboard" className="sidebar-logo" onClick={closeMobileSidebar}>
            <div className="sidebar-logo-icon">
              <FaHeartbeat />
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-brand-name">MedicoBridge</span>
                <span className="sidebar-brand-tagline">Doctor Portal</span>
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

        {/* Doctor Profile Card — clickable, navigates to /doctor/profile */}
        <NavLink
          to="/doctor/profile"
          className={({ isActive }) =>
            `sidebar-profile-card${sidebarCollapsed ? " profile-card-collapsed" : ""}${isActive ? " profile-card-active" : ""}`
          }
          onClick={closeMobileSidebar}
          title="View My Profile"
          aria-label="View My Profile"
        >
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <FaUserMd />
            </div>
            <span className="profile-status-dot" aria-label="Online" />
          </div>
          {!sidebarCollapsed && (
            <div className="profile-info">
              <p className="profile-name">
                {doctorProfile?.name
                  ? `Dr. ${doctorProfile.name}`
                  : "Doctor"}
              </p>

              <p className="profile-role">
                {doctorProfile?.specialization || "Doctor"}
              </p>

              <span className="profile-id-badge">
                ID: #{doctorProfile?.medRegNumber || "Not Provided"}
              </span>
            </div>
          )}
        </NavLink>

        {/* Nav Items */}
        <nav className="sidebar-nav" aria-label="Doctor menu">
          <ul className="sidebar-nav-list">
            {sidebarNavItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
                  end={item.path === "/doctor/dashboard"}
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
      <div className={`doctor-main ${sidebarCollapsed ? "main-expanded" : ""}`}>
        {/* Top Navbar */}
        <header className="doctor-topnav">
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
            {/* Notifications */}
            <NavLink
              to="/doctor/notifications"
              className="topnav-icon-btn"
              aria-label="Notifications"
            >
              <FaBell />
              <span className="topnav-badge">5</span>
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/doctor/settings"
              className="topnav-icon-btn"
              aria-label="Settings"
            >
              <FaCog />
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/doctor/profile"
              className="topnav-profile-btn"
              aria-label="My Profile"
            >
              <div className="topnav-avatar">
                <FaUserMd />
              </div>
              <div className="topnav-profile-info">
                <span className="topnav-profile-name">
                  {doctorProfile?.name
                    ? `Dr. ${doctorProfile.name}`
                    : "Doctor"}
                </span>

                <span className="topnav-profile-role">
                  {doctorProfile?.specialization || "Doctor"}
                </span>
              </div>
              <FaChevronRight className="topnav-chevron" />
            </NavLink>
          </div>
        </header>

        {/* Content Area */}
        <main className="doctor-content" id="doctor-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;
