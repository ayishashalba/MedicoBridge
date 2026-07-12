import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFilePrescription,
  FaBoxes,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaTruck,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPills,
} from "react-icons/fa";
import "./PharmacyLayout.css";

const sidebarNavItems = [
  { label: "Dashboard",            icon: <FaTachometerAlt />,      path: "/pharmacy/dashboard" },
  { label: "Prescriptions",        icon: <FaFilePrescription />,    path: "/pharmacy/prescriptions" },
  { label: "Medicine Inventory",   icon: <FaBoxes />,              path: "/pharmacy/inventory" },
  { label: "Orders",               icon: <FaShoppingCart />,       path: "/pharmacy/orders" },
  { label: "Billing & Payments",   icon: <FaFileInvoiceDollar />,  path: "/pharmacy/billing" },
  { label: "Delivery Tracking",    icon: <FaTruck />,              path: "/pharmacy/delivery" },
  { label: "Notifications",        icon: <FaBell />,               path: "/pharmacy/notifications", badge: 4 },
  { label: "Profile",              icon: <FaUserCircle />,         path: "/pharmacy/profile" },
  { label: "Settings",             icon: <FaCog />,                path: "/pharmacy/settings" },
];

function PharmacyLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleMobileSidebar = () => setSidebarOpen((p) => !p);
  const closeMobileSidebar  = () => setSidebarOpen(false);
  const toggleCollapse      = () => setSidebarCollapsed((p) => !p);

  const handleLogout = () => navigate("/login/pharmacy");

  const getPageTitle = () => {
    const matched = sidebarNavItems.find((i) => i.path === location.pathname);
    return matched ? matched.label : "Pharmacy Portal";
  };

  return (
    <div className="pharmacy-layout">
      {sidebarOpen && (
        <div className="phlay-overlay" onClick={closeMobileSidebar} aria-hidden="true" />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`phlay-sidebar ${sidebarCollapsed ? "phlay-sidebar--collapsed" : ""} ${sidebarOpen ? "phlay-sidebar--open" : ""}`}
        aria-label="Pharmacy navigation"
      >
        {/* Header / Logo */}
        <div className="phlay-sidebar-header">
          <NavLink to="/pharmacy/dashboard" className="phlay-logo" onClick={closeMobileSidebar}>
            <div className="phlay-logo-icon"><FaPills /></div>
            {!sidebarCollapsed && (
              <div className="phlay-logo-text">
                <span className="phlay-brand-name">MedicoBridge</span>
                <span className="phlay-brand-tag">Pharmacy Portal</span>
              </div>
            )}
          </NavLink>

          {!sidebarCollapsed && (
            <button className="phlay-collapse-btn" onClick={toggleCollapse} aria-label="Collapse Sidebar">
              <FaChevronLeft />
            </button>
          )}
          <button className="phlay-close-btn" onClick={closeMobileSidebar} aria-label="Close navigation">
            <FaTimes />
          </button>
        </div>

        {/* Profile Card */}
        <div className={`phlay-profile-card ${sidebarCollapsed ? "phlay-profile-card--collapsed" : ""}`}>
          <div className="phlay-profile-avatar-wrap">
            <div className="phlay-profile-avatar"><FaPills /></div>
            <span className="phlay-profile-dot" aria-label="Online" />
          </div>
          {!sidebarCollapsed && (
            <div className="phlay-profile-info">
              <p className="phlay-profile-name">MediCare Pharmacy</p>
              <p className="phlay-profile-role">Chief Pharmacist</p>
              <span className="phlay-profile-badge">ID: #PH-8841</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="phlay-nav" aria-label="Pharmacy menu">
          <ul className="phlay-nav-list">
            {sidebarNavItems.map((item) => (
              <li key={item.path} className="phlay-nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `phlay-nav-link ${isActive ? "phlay-nav-link--active" : ""}`}
                  onClick={closeMobileSidebar}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="phlay-nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="phlay-nav-label">{item.label}</span>}
                  {!sidebarCollapsed && item.badge && <span className="phlay-nav-badge">{item.badge}</span>}
                  {sidebarCollapsed  && item.badge && <span className="phlay-nav-badge phlay-nav-badge--dot" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="phlay-sidebar-footer">
          <button className="phlay-logout-btn" onClick={handleLogout} aria-label="Logout">
            <span className="phlay-nav-icon"><FaSignOutAlt /></span>
            {!sidebarCollapsed && <span className="phlay-nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Expand handle (desktop collapsed) */}
      {sidebarCollapsed && (
        <button className="phlay-expand-btn" onClick={toggleCollapse} aria-label="Expand Sidebar">
          <FaChevronRight />
        </button>
      )}

      {/* ─── Main Area ─── */}
      <div className={`phlay-main ${sidebarCollapsed ? "phlay-main--expanded" : ""}`}>
        {/* Top Nav */}
        <header className="phlay-topnav">
          <div className="phlay-topnav-left">
            <button className="phlay-hamburger" onClick={toggleMobileSidebar} aria-label="Open navigation">
              <FaBars />
            </button>
            <h1 className="phlay-topnav-title">{getPageTitle()}</h1>
          </div>
          <div className="phlay-topnav-right">
            <NavLink to="/pharmacy/notifications" className="phlay-topnav-icon" aria-label="Notifications">
              <FaBell />
              <span className="phlay-topnav-badge">4</span>
            </NavLink>
            <NavLink to="/pharmacy/settings" className="phlay-topnav-icon" aria-label="Settings">
              <FaCog />
            </NavLink>
            <div className="phlay-topnav-profile">
              <div className="phlay-topnav-avatar"><FaPills /></div>
              <div className="phlay-topnav-profile-info">
                <span className="phlay-topnav-name">MediCare Pharmacy</span>
                <span className="phlay-topnav-role">Chief Pharmacist</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="phlay-content" id="pharmacy-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PharmacyLayout;
