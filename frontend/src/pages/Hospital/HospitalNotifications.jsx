import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaBell,
  FaBed,
  FaFlask,
  FaExclamationTriangle,
  FaUserMd,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./HospitalNotifications.css";

const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── RELATIVE TIME FORMATTER ──────────────────────────────────────────────────
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

// ── CATEGORY NORMALIZER ──────────────────────────────────────────────────────
const mapCategory = (rawCategory) => {
  if (!rawCategory) return "System Alerts";
  const cat = String(rawCategory).toLowerCase();
  if (cat.includes("ward") || cat.includes("bed") || cat.includes("admission") || cat.includes("occupancy")) {
    return "Ward Operations";
  }
  if (cat.includes("lab") || cat.includes("pharmacy") || cat.includes("medicine") || cat.includes("stock") || cat.includes("fulfillment")) {
    return "Lab & Pharmacy";
  }
  return "System Alerts";
};

// ── ICON & COLOR MAPPER ──────────────────────────────────────────────────────
const getCategoryIconAndColor = (category, type, title = "", message = "") => {
  const cat = String(category || "").toLowerCase();
  const typ = String(type || "").toLowerCase();
  const text = `${title} ${message}`.toLowerCase();

  if (cat.includes("ward") || text.includes("bed") || text.includes("admitted") || text.includes("occupancy")) {
    return { icon: <FaBed />, color: "blue" };
  }
  if (cat.includes("lab") || cat.includes("pharmacy") || text.includes("lab") || text.includes("prescription") || text.includes("medication")) {
    return { icon: <FaFlask />, color: "teal" };
  }
  if (text.includes("doctor") || text.includes("staff") || text.includes("nurse") || text.includes("shift") || text.includes("clinic")) {
    return { icon: <FaUserMd />, color: "purple" };
  }
  if (typ === "critical" || typ === "warning" || text.includes("critical") || text.includes("alert") || text.includes("shortage") || text.includes("emergency")) {
    return { icon: <FaExclamationTriangle />, color: "red" };
  }
  return { icon: <FaBell />, color: "blue" };
};

// ── NOTIFICATION DOCUMENT NORMALIZER ─────────────────────────────────────────
const normaliseNotification = (doc) => {
  const category = mapCategory(doc.category || doc.type);
  const { icon, color } = getCategoryIconAndColor(category, doc.type, doc.title, doc.message);
  return {
    id: doc._id,
    _id: doc._id,
    category,
    rawCategory: doc.category || "System Alerts",
    title: doc.title || "Hospital Notification",
    message: doc.message || "",
    time: formatRelativeTime(doc.createdAt),
    read: Boolean(doc.isRead),
    icon,
    color,
    createdAt: doc.createdAt,
  };
};

function HospitalNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch real notifications from MongoDB
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const normalised = json.data.map(normaliseNotification);
        setNotifications(normalised);
      } else {
        toast.error(json.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
      toast.error("Failed to connect to notification service");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filtered notifications
  const filtered = useMemo(() => {
    return notifications.filter(
      (n) => filter === "All" || n.category === filter
    );
  }, [notifications, filter]);

  // Mark all as read via backend
  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      } else {
        toast.error(json.message || "Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error("Network error marking notifications as read");
    }
  };

  // Mark an individual notification as read via backend
  const markOneAsRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // Dismiss / delete notification via backend
  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/dismiss`, {
        method: "PUT",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification dismissed");
      } else {
        toast.error(json.message || "Failed to dismiss notification");
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Network error dismissing notification");
    }
  };

  return (
    <div className="hosp-notifs-page">
      <div className="hosp-notifs-controls">
        <div className="hosp-notifs-categories">
          {["All", "System Alerts", "Ward Operations", "Lab & Pharmacy"].map(
            (cat) => (
              <button
                key={cat}
                className={`hosp-notif-tab ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <button className="hosp-btn-mark-read" onClick={markAllRead}>
          Mark All Read
        </button>
      </div>

      <div className="hosp-notifs-feed">
        {loading ? (
          <div className="hosp-notifs-empty">
            <FaBell className="empty-icon" style={{ opacity: 0.5 }} />
            <h3>Loading notifications…</h3>
            <p>Connecting to hospital activity feed…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hosp-notifs-empty">
            <FaBell className="empty-icon" />
            <h3>No notifications here</h3>
            <p>You're all caught up with the hospital activity feed!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`hosp-notif-item ${n.read ? "read" : "unread"}`}
              onClick={() => !n.read && markOneAsRead(n.id)}
              style={{ cursor: n.read ? "default" : "pointer" }}
            >
              <div className={`hosp-notif-icon-box icon--${n.color}`}>
                {n.icon}
              </div>
              <div className="hosp-notif-info">
                <div className="hosp-notif-header">
                  <h4>{n.title}</h4>
                  <span className="hosp-notif-time">{n.time}</span>
                </div>
                <p>{n.message}</p>
              </div>
              <button
                className="hosp-notif-btn-delete"
                onClick={(e) => deleteNotification(n.id, e)}
                title="Dismiss Alert"
              >
                <FaTrashAlt />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HospitalNotifications;
