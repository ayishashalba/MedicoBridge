import React, { useEffect, useState } from "react";

import {
  FaBell,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

import "./PharmacyPages.css";

const typeStyle = {
  alert: {
    bg: "#fef3c7",
    color: "#d97706",
    border: "#fcd34d",
  },
  info: {
    bg: "#e0f2fe",
    color: "#0284c7",
    border: "#7dd3fc",
  },
  success: {
    bg: "#dcfce7",
    color: "#16a34a",
    border: "#86efac",
  },
};

const getNotificationType = (type) => {
  const value = String(type || "").toLowerCase();

  if (
    value.includes("alert") ||
    value.includes("warning") ||
    value.includes("stock") ||
    value.includes("emergency")
  ) {
    return "alert";
  }

  if (
    value.includes("success") ||
    value.includes("complete") ||
    value.includes("order")
  ) {
    return "success";
  }

  return "info";
};

const getNotificationIcon = (type) => {
  const mappedType = getNotificationType(type);

  if (mappedType === "alert") {
    return <FaExclamationTriangle />;
  }

  if (mappedType === "success") {
    return <FaCheckCircle />;
  }

  return <FaInfoCircle />;
};

const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const diff = Date.now() - parsedDate.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeNotification = (notification) => {
  const type = getNotificationType(
    notification?.type
  );

  return {
    ...notification,

    id:
      notification?._id ||
      notification?.id,

    type,

    icon: getNotificationIcon(
      notification?.type
    ),

    title:
      notification?.title ||
      "Notification",

    message:
      notification?.message ||
      "",

    time: formatTime(
      notification?.createdAt ||
      notification?.updatedAt
    ),

    read: Boolean(
      notification?.isRead
    ),
  };
};

export default function PharmacyNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [filter, setFilter] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token missing."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to fetch notifications."
        );
      }

      const notificationData =
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : Array.isArray(data?.data?.notifications)
              ? data.data.notifications
              : [];

      setNotifications(
        notificationData.map(
          normalizeNotification
        )
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        err.message ||
        "Failed to load notifications."
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token missing."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to mark notifications as read."
        );
      }

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );

      setError(
        err.message ||
        "Failed to mark notifications as read."
      );
    }
  };

  const markRead = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token missing."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to mark notification as read."
        );
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
              ...n,
              read: true,
            }
            : n
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );

      setError(
        err.message ||
        "Failed to update notification."
      );
    }
  };

  const dismiss = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token missing."
        );
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/dismiss`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to dismiss notification."
        );
      }

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    } catch (err) {
      console.error(
        "Failed to dismiss notification:",
        err
      );

      setError(
        err.message ||
        "Failed to dismiss notification."
      );
    }
  };

  const filtered = notifications.filter(
    (n) => {
      if (filter === "Unread") {
        return !n.read;
      }

      if (filter === "Alerts") {
        return n.type === "alert";
      }

      return true;
    }
  );

  const unreadCount =
    notifications.filter(
      (n) => !n.read
    ).length;

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaBell /> Notifications
          </h2>

          <p className="ph-page-sub">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>

        <div className="ph-notif-toolbar">
          <div className="ph-filter-box">
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              <option>All</option>
              <option>Unread</option>
              <option>Alerts</option>
            </select>
          </div>

          {unreadCount > 0 && (
            <button
              className="ph-btn-mark-read"
              onClick={markAllRead}
            >
              <FaCheck /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      <div className="ph-notif-list">
        {loading ? (
          <div className="ph-empty-state">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="ph-empty-state">
            No notifications.
          </div>
        ) : (
          filtered.map((n) => {
            const ts =
              typeStyle[n.type] ||
              typeStyle.info;

            return (
              <div
                key={n.id}
                className={`ph-notif-card ${!n.read
                    ? "ph-notif-card--unread"
                    : ""
                  }`}
                onClick={() =>
                  !n.read &&
                  markRead(n.id)
                }
              >
                <div
                  className="ph-notif-icon"
                  style={{
                    background: ts.bg,
                    color: ts.color,
                    border: `1px solid ${ts.border}`,
                  }}
                >
                  {n.icon}
                </div>

                <div className="ph-notif-content">
                  <div className="ph-notif-title-row">
                    <span className="ph-notif-title">
                      {n.title}
                    </span>

                    {!n.read && (
                      <span className="ph-notif-unread-dot" />
                    )}
                  </div>

                  <p className="ph-notif-msg">
                    {n.message}
                  </p>

                  <span className="ph-notif-time">
                    {n.time}
                  </span>
                </div>

                <button
                  className="ph-notif-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(n.id);
                  }}
                  aria-label="Dismiss"
                >
                  <FaTimes />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}