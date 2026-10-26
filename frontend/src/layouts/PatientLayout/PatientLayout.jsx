import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaHeart,
  FaTachometerAlt,
  FaUserCircle,
  FaStethoscope,
  FaCalendarCheck,
  FaVideo,
  FaPills,
  FaBoxOpen,
  FaFolderOpen,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaShoppingCart,
} from "react-icons/fa";
import { getSavedDoctors } from "../../utils/savedDoctorsStorage";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../services/apiConfig";
import "./PatientLayout.css";

const baseSidebarNavItems = [
  {
    label: "Dashboard",
    icon: <FaTachometerAlt />,
    path: "/patient/dashboard",
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
    label: "My Orders",
    icon: <FaBoxOpen />,
    path: "/patient/orders",
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
    isNotification: true,
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
  const [savedCount, setSavedCount] = useState(
    () => getSavedDoctors().length
  );
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Patient profile data
  const [patientProfile, setPatientProfile] = useState(null);

  // ─────────────────────────────────────────────
  // Fetch logged-in patient & live counts
  // ─────────────────────────────────────────────
  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login/patient");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch patient:", data);
        return;
      }

      const profile = data.data?.profile;
      setPatientProfile(profile);
    } catch (error) {
      console.error("Patient profile fetch error:", error);
    }
  };

  const fetchLiveCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch unread notifications
      const notifRes = await fetch(`${API_BASE_URL}/patient/notifications`, { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        const list = notifData.data || notifData.notifications || [];
        const unread = list.filter((n) => !n.isRead).length;
        setUnreadNotificationsCount(unread);
      }

      // Fetch cart items
      const cartRes = await fetch(`${API_BASE_URL}/cart`, { headers });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const cart = cartData.data || cartData.cart;
        const totalItems = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        setCartItemCount(totalItems);
      }
    } catch (err) {
      console.error("Live counts fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
    fetchLiveCounts();

    const handleDataUpdate = () => {
      fetchLiveCounts();
    };

    window.addEventListener("notificationsUpdated", handleDataUpdate);
    window.addEventListener("cartUpdated", handleDataUpdate);

    return () => {
      window.removeEventListener("notificationsUpdated", handleDataUpdate);
      window.removeEventListener("cartUpdated", handleDataUpdate);
    };
  }, []);

  // ─────────────────────────────────────────────
  // Saved doctors count
  // ─────────────────────────────────────────────
  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedDoctors().length);
    };

    window.addEventListener("savedDoctorsUpdated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("savedDoctorsUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const toggleMobileSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isLoggedIn");
    toast.info("You have been logged out successfully.");
    navigate("/login/patient");
  };

  // ─────────────────────────────────────────────
  // Patient data
  // ─────────────────────────────────────────────
  const patientName = patientProfile?.name || "Patient";

  const patientId = patientProfile?._id
    ? patientProfile._id.slice(-3).toUpperCase()
    : "001";

  const profileImage = patientProfile?.profileImage || "";

  const profileImageUrl = profileImage
    ? profileImage.startsWith("http")
      ? profileImage
      : `http://localhost:5000${profileImage}`
    : "";

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

      {/* ─────────────────────────────────────────────
          SIDEBAR
      ───────────────────────────────────────────── */}
      <aside
        className={`patient-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""
          } ${sidebarOpen ? "sidebar-mobile-open" : ""
          }`}
        aria-label="Patient navigation sidebar"
      >

        {/* Sidebar Header */}
        <div className="sidebar-header">

          <NavLink
            to="/patient/dashboard"
            className="sidebar-logo"
            onClick={closeMobileSidebar}
          >
            <div className="sidebar-logo-icon">
              <FaHeartbeat />
            </div>

            {!sidebarCollapsed && (
              <div className="sidebar-logo-text">
                <span className="sidebar-brand-name">
                  MedicoBridge
                </span>

                <span className="sidebar-brand-tagline">
                  Patient Portal
                </span>
              </div>
            )}
          </NavLink>

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

          <button
            className="sidebar-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        {/* ─────────────────────────────────────────────
            PATIENT PROFILE CARD
        ───────────────────────────────────────────── */}
        <NavLink
          to="/patient/profile"
          className={({ isActive }) =>
            `sidebar-profile-card${sidebarCollapsed
              ? " profile-card-collapsed"
              : ""
            }${isActive
              ? " profile-card-active"
              : ""
            }`
          }
          onClick={closeMobileSidebar}
          title="View My Profile"
          aria-label="View My Profile"
        >

          <div className="profile-avatar-wrapper">

            <div className="profile-avatar">

              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={patientName}
                  className="sidebar-profile-image"
                />
              ) : (
                <FaUserCircle />
              )}

            </div>

            <span
              className="profile-status-dot"
              aria-label="Online"
            />

          </div>

          {!sidebarCollapsed && (
            <div className="profile-info">

              <p className="profile-name">
                {patientName}
              </p>

              <p className="profile-role">
                Patient
              </p>

              <span className="profile-id-badge">
                ID: #PT-{patientId}
              </span>

            </div>
          )}

        </NavLink>

        {/* Nav Items */}
        <nav
          className="sidebar-nav"
          aria-label="Patient menu"
        >
          <ul className="sidebar-nav-list">

            {baseSidebarNavItems.map((baseItem) => {
              const badge = baseItem.isNotification && unreadNotificationsCount > 0
                ? unreadNotificationsCount
                : null;
              const item = { ...baseItem, badge };

              return (
                <li
                  key={item.path}
                  className="sidebar-nav-item"
                >
                  <NavLink
                    to={item.path}
                    end={
                      item.path ===
                      "/patient/dashboard"
                    }
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive
                        ? "sidebar-nav-link--active"
                        : ""
                      }`
                    }
                    onClick={closeMobileSidebar}
                    title={
                      sidebarCollapsed
                        ? item.label
                        : undefined
                    }
                  >

                    <span className="nav-link-icon">
                      {item.icon}
                    </span>

                    {!sidebarCollapsed && (
                      <span className="nav-link-label">
                        {item.label}
                      </span>
                    )}

                    {!sidebarCollapsed &&
                      item.badge && (
                        <span className="nav-link-badge">
                          {item.badge}
                        </span>
                      )}

                    {sidebarCollapsed &&
                      item.badge && (
                        <span className="nav-link-badge nav-link-badge--dot" />
                      )}

                  </NavLink>
                </li>
              );
            })}

          </ul>
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title={
              sidebarCollapsed
                ? "Logout"
                : undefined
            }
            aria-label="Logout"
          >

            <span className="nav-link-icon">
              <FaSignOutAlt />
            </span>

            {!sidebarCollapsed && (
              <span className="nav-link-label">
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* Expand button */}
      {sidebarCollapsed && (
        <button
          className="sidebar-expand-btn"
          onClick={toggleCollapse}
          aria-label="Expand Sidebar"
        >
          <FaChevronRight />
        </button>
      )}

      {/* ─────────────────────────────────────────────
          MAIN AREA
      ───────────────────────────────────────────── */}
      <div
        className={`patient-main ${sidebarCollapsed
          ? "main-expanded"
          : ""
          }`}
      >

        {/* Top Navbar */}
        <header className="patient-topnav">

          <div className="topnav-left">

            <button
              className="topnav-hamburger"
              onClick={toggleMobileSidebar}
              aria-label="Open navigation menu"
            >
              <FaBars />
            </button>

            <form
              className="topnav-search"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/patient/find-doctors?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            >

              <FaSearch
                className="topnav-search-icon"
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/patient/find-doctors?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                style={{ cursor: "pointer" }}
              />

              <input
                type="search"
                className="topnav-search-input"
                placeholder="Search doctors, records…"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </form>

          </div>

          <div className="topnav-right">

            {/* Saved Doctors */}
            <NavLink
              to="/patient/saved-doctors"
              className="topnav-icon-btn"
              aria-label="Saved Doctors"
              title="Saved Doctors"
            >
              <FaHeart
                style={{
                  color:
                    savedCount > 0
                      ? "#ef4444"
                      : "inherit",
                }}
              />

              {savedCount > 0 && (
                <span className="topnav-badge">
                  {savedCount}
                </span>
              )}

            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/patient/notifications"
              className="topnav-icon-btn"
              aria-label="Notifications"
            >
              <FaBell />
              {unreadNotificationsCount > 0 && (
                <span className="topnav-badge">
                  {unreadNotificationsCount}
                </span>
              )}
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/patient/cart"
              className="topnav-icon-btn"
              aria-label="Cart"
            >
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <span className="topnav-badge">
                  {cartItemCount}
                </span>
              )}
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/patient/settings"
              className="topnav-icon-btn"
              aria-label="Settings"
            >
              <FaCog />
            </NavLink>

            {/* ─────────────────────────────────────
                NAVBAR PROFILE
            ───────────────────────────────────── */}
            <NavLink
              to="/patient/profile"
              className="topnav-profile-btn"
              aria-label="My Profile"
            >

              <div className="topnav-avatar">

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={patientName}
                    className="topnav-profile-image"
                  />
                ) : (
                  <FaUserCircle />
                )}

              </div>

              <div className="topnav-profile-info">

                <span className="topnav-profile-name">
                  {patientName}
                </span>

                <span className="topnav-profile-role">
                  Patient
                </span>

              </div>

              <FaChevronRight className="topnav-chevron" />

            </NavLink>

          </div>

        </header>

        {/* Content */}
        <main
          className="patient-content"
          id="patient-main-content"
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default PatientLayout;