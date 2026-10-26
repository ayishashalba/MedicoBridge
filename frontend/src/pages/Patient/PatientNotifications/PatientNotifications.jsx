import React, { useState, useEffect, useCallback } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaUserMd,
  FaPills,
  FaBullhorn,
  FaFileMedical,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientNotifications.css";

function getNotificationIcon(type) {
  switch (type?.toLowerCase()) {
    case "appointment":
      return <FaCalendarCheck />;
    case "prescription":
      return <FaPills />;
    case "medicalrecord":
    case "report":
      return <FaFileMedical />;
    case "order":
      return <FaShoppingCart />;
    case "broadcast":
    case "announcement":
      return <FaBullhorn />;
    case "doctor":
      return <FaUserMd />;
    default:
      return <FaBell />;
  }
}

function formatNotificationTime(dateStr) {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) {
    const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    return `Today • ${time}`;
  }
  if (diffDays === 1) {
    const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    return `Yesterday • ${time}`;
  }
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function PatientNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success && Array.isArray(result.data)) {
        const mapped = result.data.map((item) => ({
          id: item._id,
          icon: getNotificationIcon(item.type),
          title: item.title,
          message: item.message,
          time: formatNotificationTime(item.createdAt),
          read: Boolean(item.isRead),
        }));
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));
    setNotifications(updated);

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/notifications/read-all`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        window.dispatchEvent(new CustomEvent("notificationsUpdated"));
        toast.success("All notifications marked as read");
      } catch (err) {
        // Backend unavailable
      }
    }
  };

  const markSingleAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        window.dispatchEvent(new CustomEvent("notificationsUpdated"));
      } catch (err) {
        // Backend unavailable
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="patient-notifications">
      <div className="notifications-header">
        <div>
          <h2>
            <FaBell className="header-icon" /> Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  marginLeft: "0.6rem",
                  padding: "0.2rem 0.55rem",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "999px",
                  fontWeight: "700",
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} New
              </span>
            )}
          </h2>
          <p>Stay updated with your healthcare activities.</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-read-btn"
            onClick={markAllAsRead}
            title="Mark all notifications as read"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            <FaCheckCircle style={{ fontSize: "2.5rem", marginBottom: "0.75rem", color: "#10b981" }} />
            <p style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>You're all caught up!</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>No notifications at this moment.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.read ? "read" : "unread"
              }`}
              onClick={() => {
                if (!notification.read) markSingleAsRead(notification.id);
              }}
              style={{ cursor: notification.read ? "default" : "pointer" }}
            >
              <div className="notification-icon">
                {notification.icon}
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <h3>{notification.title}</h3>

                  <span
                    className={`status-badge ${
                      notification.read ? "read-badge" : "unread-badge"
                    }`}
                  >
                    {notification.read ? "Read" : "Unread"}
                  </span>
                </div>

                <p>{notification.message}</p>

                <span className="notification-time">
                  {notification.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PatientNotifications;