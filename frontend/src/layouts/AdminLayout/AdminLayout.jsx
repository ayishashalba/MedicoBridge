import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaUserCheck,
  FaCalendarCheck,
  FaChartBar,
  FaCogs,
  FaBell,
  FaComments,
  FaHistory,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaPills,
  FaBoxOpen,
  FaTicketAlt,
  FaFileInvoiceDollar,
  FaNotesMedical,
  FaUndo,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./AdminLayout.css";

const sidebarNavItems = [
  { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
  { label: "User Management", icon: <FaUsers />, path: "/admin/users" },
  { label: "Approvals & Review", icon: <FaUserCheck />, path: "/admin/approvals", badge: 3 },
  { label: "Medicine Verification", icon: <FaPills />, path: "/admin/pharmacy", badge: "Safety" },
  { label: "Refund Management", icon: <FaUndo />, path: "/admin/refunds" },
  { label: "Platform Coupons", icon: <FaTicketAlt />, path: "/admin/coupons" },
  { label: "Medical Records", icon: <FaNotesMedical />, path: "/admin/medical-records" },
  { label: "Appointments", icon: <FaCalendarCheck />, path: "/admin/appointments" },
  { label: "Reports & Analytics", icon: <FaChartBar />, path: "/admin/reports" },
  { label: "System Settings", icon: <FaCogs />, path: "/admin/settings" },
  { label: "Notifications", icon: <FaBell />, path: "/admin/notifications", badge: 2 },
  { label: "Feedback & Reviews", icon: <FaComments />, path: "/admin/feedback" },
  { label: "Activity Logs", icon: <FaHistory />, path: "/admin/logs" },
  { label: "Profile Settings", icon: <FaUserShield />, path: "/admin/profile" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    id: "",
    name: "",
    email: "",
  });
  const toggleMobileSidebar = () => setSidebarOpen((p) => !p);
  const closeMobileSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((p) => !p);
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const response = await fetch(
          "http://localhost:5000/api/admin/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch admin profile");
        }

        const admin = result.data;

        setAdminProfile({
          id: admin.id || admin._id || "",
          name: admin.name || "Admin",
          email: admin.email || "",
        });
      } catch (error) {
        console.error("Fetch admin profile error:", error);
      }
    };

    fetchAdminProfile();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    toast.info("You have been logged out successfully.");
    navigate("/admin/login");
  };

  const getPageTitle = () => {
    const matched = sidebarNavItems.find((i) => i.path === location.pathname);
    return matched ? matched.label : "Admin Portal";
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="adlay-overlay" onClick={closeMobileSidebar} aria-hidden="true" />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`adlay-sidebar ${sidebarCollapsed ? "adlay-sidebar--collapsed" : ""} ${sidebarOpen ? "adlay-sidebar--open" : ""}`}
        aria-label="Admin Navigation"
      >
        {/* Header / Logo */}
        <div className="adlay-sidebar-header">
          <NavLink to="/admin/dashboard" className="adlay-logo" onClick={closeMobileSidebar}>
            <div className="adlay-logo-icon"><FaShieldAlt /></div>
            {!sidebarCollapsed && (
              <div className="adlay-logo-text">
                <span className="adlay-brand-name">MedicoBridge</span>
                <span className="adlay-brand-tag">ADMIN PORTAL</span>
              </div>
            )}
          </NavLink>

          {!sidebarCollapsed && (
            <button className="adlay-collapse-btn" onClick={toggleCollapse} aria-label="Collapse Sidebar">
              <FaChevronLeft />
            </button>
          )}
          <button className="adlay-close-btn" onClick={closeMobileSidebar} aria-label="Close navigation">
            <FaTimes />
          </button>
        </div>

        {/* Profile Card */}
        <div className={`adlay-profile-card ${sidebarCollapsed ? "adlay-profile-card--collapsed" : ""}`}>
          <div className="adlay-profile-avatar-wrap">
            <div className="adlay-profile-avatar">
              {(adminProfile.name || "Admin")
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="adlay-profile-dot" aria-label="Online" />
          </div>
          {!sidebarCollapsed && (
            <div className="adlay-profile-info">
              <p className="adlay-profile-name">
                {adminProfile.name || "Admin"}
              </p>

              <p className="adlay-profile-role">
                Super Administrator
              </p>

              <span className="adlay-profile-badge">
                {adminProfile.id
                  ? adminProfile.id.slice(-3)
                  : "ADMIN"}
              </span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="adlay-nav" aria-label="Admin menu">
          <ul className="adlay-nav-list">
            {sidebarNavItems.map((item) => (
              <li key={item.path} className="adlay-nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `adlay-nav-link ${isActive ? "adlay-nav-link--active" : ""}`}
                  onClick={closeMobileSidebar}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="adlay-nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="adlay-nav-label">{item.label}</span>}
                  {!sidebarCollapsed && item.badge && <span className="adlay-nav-badge">{item.badge}</span>}
                  {sidebarCollapsed && item.badge && <span className="adlay-nav-badge adlay-nav-badge--dot" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="adlay-sidebar-footer">
          <button className="adlay-logout-btn" onClick={handleLogout} aria-label="Logout">
            <span className="adlay-nav-icon"><FaSignOutAlt /></span>
            {!sidebarCollapsed && <span className="adlay-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Expand handle (desktop collapsed) */}
      {sidebarCollapsed && (
        <button className="adlay-expand-btn" style={{ left: sidebarCollapsed ? "92px" : "274px" }} onClick={toggleCollapse} aria-label="Expand Sidebar">
          <FaChevronRight />
        </button>
      )}

      {/* ─── Main Area ─── */}
      <div className={`adlay-main ${sidebarCollapsed ? "adlay-main--expanded" : ""}`}>
        {/* Top Nav */}
        <header className="adlay-topnav">
          <div className="adlay-topnav-left">
            <button className="adlay-hamburger" onClick={toggleMobileSidebar} aria-label="Open navigation">
              <FaBars />
            </button>
            <h1 className="adlay-topnav-title">{getPageTitle()}</h1>
          </div>
          <div className="adlay-topnav-right">
            <NavLink to="/admin/notifications" className="adlay-topnav-icon" aria-label="Notifications">
              <FaBell />
              <span className="adlay-topnav-badge">5</span>
            </NavLink>
            <NavLink to="/admin/settings" className="adlay-topnav-icon" aria-label="Settings">
              <FaCogs />
            </NavLink>
            <div className="adlay-topnav-profile">
              <div className="adlay-topnav-avatar">
                {(adminProfile.name || "Admin")
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="adlay-topnav-profile-info">
                <span className="adlay-topnav-name">
                  {adminProfile.name || "Admin"}
                </span>

                <span className="adlay-topnav-role">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="adlay-content" id="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
