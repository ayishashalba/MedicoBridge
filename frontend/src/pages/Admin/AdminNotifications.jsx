import React, { useState, useEffect, useCallback } from "react";

import {
  FaBell,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaBullhorn,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import "./AdminPages.css";

const API_BASE_URL = "http://localhost:5000/api/notifications";


// ============================================================
// HELPERS
// ============================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};


const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const getNotificationId = (notification) => {
  if (!notification?._id) return "";

  return `NTF-${String(notification._id).slice(-6).toUpperCase()}`;
};


export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("system");

  // System notifications
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Broadcast history
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Broadcast form
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("All Users");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [alertFilter, setAlertFilter] = useState("All");


  // ==========================================================
  // FETCH SYSTEM NOTIFICATIONS
  // ==========================================================

  const fetchSystemAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch notifications."
        );
      }

      setSystemAlerts(Array.isArray(result?.data) ? result.data : []);
    } catch (error) {
      console.error("Notifications fetch error:", error);

      toast.error(
        error.message || "Failed to load system notifications."
      );
    } finally {
      setLoadingAlerts(false);
    }
  }, []);


  // ==========================================================
  // FETCH BROADCAST HISTORY
  // ==========================================================

  const fetchBroadcastHistory = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);

      const response = await fetch(
        `${API_BASE_URL}/broadcast/history`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch broadcast history."
        );
      }

      setAnnouncements(
        Array.isArray(result?.data) ? result.data : []
      );
    } catch (error) {
      console.error("Broadcast history fetch error:", error);

      toast.error(
        error.message || "Failed to load broadcast history."
      );
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchSystemAlerts();
    fetchBroadcastHistory();
  }, [fetchSystemAlerts, fetchBroadcastHistory]);


  // ==========================================================
  // SEND BROADCAST
  // ==========================================================

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      toast.error("Broadcast title and message are required.");
      return;
    }

    try {
      setSending(true);

      const response = await fetch(
        `${API_BASE_URL}/broadcast`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: trimmedTitle,
            message: trimmedMessage,
            targetRole: target,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to send broadcast."
        );
      }

      toast.success(
        result?.message || "Broadcast sent successfully."
      );

      setTitle("");
      setMessage("");
      setTarget("All Users");

      // Refresh both lists from backend
      await Promise.all([
        fetchSystemAlerts(),
        fetchBroadcastHistory(),
      ]);
    } catch (error) {
      console.error("Broadcast submit error:", error);

      toast.error(
        error.message || "Failed to publish broadcast."
      );
    } finally {
      setSending(false);
    }
  };


  // ==========================================================
  // DISMISS ONE NOTIFICATION
  // ==========================================================

  const handleDismissAlert = async (id) => {
    if (!id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/${id}/dismiss`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to dismiss notification."
        );
      }

      setSystemAlerts((prev) =>
        prev.filter((alert) => alert._id !== id)
      );

      toast.info("Alert dismissed.");
    } catch (error) {
      console.error("Dismiss notification error:", error);

      toast.error(
        error.message || "Failed to dismiss alert."
      );
    }
  };


  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/read-all`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to mark notifications as read."
        );
      }

      setSystemAlerts((prev) =>
        prev.map((alert) => ({
          ...alert,
          isRead: true,
        }))
      );

      toast.success("All alerts marked as read.");
    } catch (error) {
      console.error("Mark all read error:", error);

      toast.error(
        error.message || "Failed to mark alerts as read."
      );
    }
  };


  // ==========================================================
  // FILTER ALERTS
  // ==========================================================

  const filteredAlerts = systemAlerts.filter((alert) => {
    if (alertFilter === "All") {
      return true;
    }

    return (
      alert.type === alertFilter ||
      alert.category === alertFilter
    );
  });


  const unreadAlertsCount = systemAlerts.filter(
    (alert) => !alert.isRead
  ).length;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="ad-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="ad-page-header">

        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaBell
            style={{
              color: "var(--ad-primary)",
            }}
          />

          Notifications &amp; System Alerts
        </h2>

        <p>
          Monitor real-time automated system triggers and
          publish administrative broadcasts
        </p>

      </div>


      {/* ======================================================
          TABS
      ====================================================== */}

      <div className="ad-tabs-container">

        <div className="ad-tabs">

          <button
            onClick={() => setActiveTab("system")}
            className={`ad-tab-btn ${activeTab === "system" ? "active" : ""
              }`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaExclamationTriangle />

            Automated System Alerts

            {unreadAlertsCount > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.7rem",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "10px",
                }}
              >
                {unreadAlertsCount}
              </span>
            )}
          </button>


          <button
            onClick={() => setActiveTab("broadcasts")}
            className={`ad-tab-btn ${activeTab === "broadcasts" ? "active" : ""
              }`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaBullhorn />

            Broadcast Announcements ({announcements.length})
          </button>

        </div>

      </div>


      {/* ======================================================
          SYSTEM ALERTS TAB
      ====================================================== */}

      {activeTab === "system" && (

        <div className="ad-card">

          <div
            className="ad-card-header"
            style={{
              flexWrap: "wrap",
            }}
          >

            <div>

              <h3 className="ad-card-title">
                <FaBell />

                Real-time Automated Event Triggers
              </h3>

              <p
                style={{
                  margin: "0.2rem 0 0",
                  fontSize: "0.82rem",
                  color: "var(--ad-text-secondary)",
                }}
              >
                System notifications generated by the
                platform and administrative broadcasts.
              </p>

            </div>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >

              <select
                className="ad-select"
                value={alertFilter}
                onChange={(e) =>
                  setAlertFilter(e.target.value)
                }
                style={{
                  width: "170px",
                }}
              >

                <option value="All">
                  All Categories
                </option>

                <option value="Critical">
                  Critical Only
                </option>

                <option value="Warning">
                  Warnings Only
                </option>

                <option value="Stock Alert">
                  Stock Alerts
                </option>

                <option value="Billing & Invoices">
                  Billing Alerts
                </option>

                <option value="Order Fulfillment">
                  Order Alerts
                </option>

                <option value="Broadcast">
                  Broadcasts
                </option>

                <option value="System">
                  System
                </option>

              </select>


              <button
                className="ad-btn ad-btn-outline"
                onClick={handleMarkAllRead}
                disabled={
                  loadingAlerts ||
                  unreadAlertsCount === 0
                }
              >
                Mark All Read
              </button>

            </div>

          </div>


          {/* ALERT LIST */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              marginTop: "1rem",
            }}
          >

            {loadingAlerts ? (

              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--ad-text-muted)",
                }}
              >
                Loading notifications...
              </div>

            ) : filteredAlerts.length === 0 ? (

              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "var(--ad-text-muted)",
                }}
              >

                <FaCheckCircle
                  style={{
                    fontSize: "2.5rem",
                    color: "#10b981",
                    marginBottom: "0.75rem",
                  }}
                />

                <h4
                  style={{
                    margin: 0,
                    color: "var(--ad-text-primary)",
                  }}
                >
                  All Systems Healthy
                </h4>

                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.85rem",
                  }}
                >
                  No notifications or alerts requiring
                  immediate intervention.
                </p>

              </div>

            ) : (

              filteredAlerts.map((alert) => {

                const isCrit =
                  alert.type === "Critical";

                const isWarn =
                  alert.type === "Warning";

                const borderColor = isCrit
                  ? "#fca5a5"
                  : isWarn
                    ? "#fde68a"
                    : "#bfdbfe";

                const bgColor = isCrit
                  ? "#fff5f5"
                  : isWarn
                    ? "#fffbeb"
                    : "#eff6ff";

                const iconColor = isCrit
                  ? "#dc2626"
                  : isWarn
                    ? "#d97706"
                    : "#2563eb";

                return (

                  <div
                    key={alert._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: "10px",
                      padding: "1rem 1.25rem",
                      gap: "1rem",
                      animation: "adFadeIn 0.2s ease",
                      opacity: alert.isRead ? 0.75 : 1,
                    }}
                  >

                    {/* LEFT */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                      }}
                    >

                      <div
                        style={{
                          color: iconColor,
                          fontSize: "1.2rem",
                          marginTop: "2px",
                        }}
                      >
                        {isCrit ? (
                          <FaExclamationTriangle />
                        ) : isWarn ? (
                          <FaExclamationTriangle />
                        ) : (
                          <FaInfoCircle />
                        )}
                      </div>


                      <div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.25rem",
                            flexWrap: "wrap",
                          }}
                        >

                          <span
                            className="ad-id-badge"
                            style={{
                              fontSize: "0.68rem",
                            }}
                          >
                            {getNotificationId(alert)}
                          </span>


                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "700",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "4px",
                              background: isCrit
                                ? "#fee2e2"
                                : isWarn
                                  ? "#fef3c7"
                                  : "#dbeafe",
                              color: isCrit
                                ? "#dc2626"
                                : isWarn
                                  ? "#d97706"
                                  : "#1e40af",
                            }}
                          >
                            {alert.category || "System"}
                          </span>


                          <span
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--ad-text-muted)",
                            }}
                          >
                            {formatDate(alert.createdAt)}
                          </span>

                        </div>


                        <h4
                          style={{
                            margin: "0 0 0.25rem",
                            fontSize: "0.95rem",
                            color: "var(--ad-text-primary)",
                          }}
                        >
                          {alert.title}
                        </h4>


                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.84rem",
                            color: "var(--ad-text-secondary)",
                          }}
                        >
                          {alert.message}
                        </p>

                      </div>

                    </div>


                    {/* RIGHT */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexShrink: 0,
                      }}
                    >

                      {alert.actionLink && (
                        <Link
                          to={alert.actionLink}
                          className="ad-btn ad-btn-primary"
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.78rem",
                          }}
                        >
                          Take Action
                        </Link>
                      )}


                      <button
                        className="ad-btn ad-btn-outline"
                        style={{
                          padding: "0.35rem 0.5rem",
                          fontSize: "0.75rem",
                        }}
                        onClick={() =>
                          handleDismissAlert(alert._id)
                        }
                        title="Dismiss Alert"
                      >
                        <FaTimes />
                      </button>

                    </div>

                  </div>

                );
              })

            )}

          </div>

        </div>

      )}


      {/* ======================================================
          BROADCAST TAB
      ====================================================== */}

      {activeTab === "broadcasts" && (

        <div className="ad-grid-2">

          {/* ==================================================
              CREATE BROADCAST
          ================================================== */}

          <div className="ad-card">

            <h3
              className="ad-card-title"
              style={{
                marginBottom: "1.25rem",
              }}
            >
              <FaPaperPlane />

              Publish Administrative Broadcast
            </h3>


            <form onSubmit={handleBroadcastSubmit}>

              {/* TITLE */}

              <div className="ad-form-group">

                <label htmlFor="title">
                  Broadcast Headline *
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Scheduled System Payment Settlement"
                  className="ad-input"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                />

              </div>


              {/* TARGET */}

              <div className="ad-form-group">

                <label htmlFor="target">
                  Target User Segment
                </label>

                <select
                  id="target"
                  className="ad-select"
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value)
                  }
                >

                  <option value="All Users">
                    All Users (Global)
                  </option>

                  <option value="Doctors & Pharmacies">
                    Doctors &amp; Pharmacies
                  </option>

                  <option value="Doctor">
                    Doctors Only
                  </option>

                  <option value="Hospital">
                    Hospitals Only
                  </option>

                  <option value="Pharmacy">
                    Pharmacies Only
                  </option>

                  <option value="Patient">
                    Patients Only
                  </option>

                </select>

              </div>


              {/* MESSAGE */}

              <div
                className="ad-form-group"
                style={{
                  marginBottom: "1.5rem",
                }}
              >

                <label htmlFor="message">
                  Broadcast Message Body *
                </label>

                <textarea
                  id="message"
                  rows="4"
                  className="ad-textarea"
                  placeholder="Write clear announcements. Targets will receive this inside their notification inbox..."
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  required
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                className="ad-btn ad-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
                disabled={sending}
              >

                <FaPaperPlane />

                {sending
                  ? "Broadcasting Alert..."
                  : "Publish Broadcast"}

              </button>

            </form>

          </div>


          {/* ==================================================
              BROADCAST HISTORY
          ================================================== */}

          <div
            className="ad-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >

            <h3 className="ad-card-title">

              <FaBullhorn />

              Sent Broadcast History ({announcements.length})

            </h3>


            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >

              {loadingAnnouncements ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem 1rem",
                    color: "var(--ad-text-muted)",
                  }}
                >
                  Loading broadcast history...
                </div>

              ) : announcements.length === 0 ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem 1rem",
                    color: "var(--ad-text-muted)",
                  }}
                >
                  No broadcasts have been published yet.
                </div>

              ) : (

                announcements.map((announcement, index) => {

                  const broadcast =
                    announcement?._id || {};

                  const broadcastId =
                    `ANN-${String(
                      announcement?.createdAt ||
                      index
                    )
                      .replace(/\D/g, "")
                      .slice(-6)}`;

                  return (

                    <div
                      key={`${announcement?._id || "broadcast"}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        padding: "0.85rem 1rem",
                        border:
                          "1px solid var(--ad-border-color)",
                        borderRadius: "10px",
                        background: "#f8fafc",
                      }}
                    >

                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                          paddingRight: "1rem",
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.2rem",
                            flexWrap: "wrap",
                          }}
                        >

                          <span
                            className="ad-id-badge"
                            style={{
                              fontSize: "0.68rem",
                            }}
                          >
                            {broadcastId}
                          </span>


                          <span
                            className="ad-pill"
                            style={{
                              background: "#ede9fe",
                              color: "#6d28d9",
                              fontSize: "0.68rem",
                            }}
                          >
                            {announcement?.targetRole ||
                              "All Users"}
                          </span>


                          <span
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--ad-text-muted)",
                            }}
                          >
                            {formatDate(
                              announcement?.createdAt
                            )}
                          </span>

                        </div>


                        <h4
                          style={{
                            margin: "0 0 0.2rem",
                            fontSize: "0.88rem",
                          }}
                        >
                          {announcement?.title}
                        </h4>


                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color:
                              "var(--ad-text-secondary)",
                          }}
                        >
                          {announcement?.message}
                        </p>

                      </div>

                    </div>

                  );
                })

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}