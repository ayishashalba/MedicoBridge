import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaPaperPlane,
  FaUserCheck,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaPills,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaFilter,
  FaBullhorn,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { generateAutomatedSystemAlerts } from "../../utils/adminData";
import "./AdminPages.css";

const initialAnnouncements = [
  { id: "ANN-101", title: "Scheduled Platform Payment Settlement", target: "Doctors & Pharmacies", date: "Today", message: "Automated monthly platform payouts will be processed by 5:00 PM IST.", status: "Sent" },
  { id: "ANN-102", title: "Urgent: Cloud Database Security Patch Applied", target: "All Providers", date: "Yesterday", message: "Security patch 2.4.1 applied successfully with zero downtime.", status: "Sent" },
  { id: "ANN-103", title: "New Telehealth Clinical Guidelines Released", target: "Doctors Only", date: "28 Aug 2026", message: "Updated protocol for remote e-prescriptions now live in Doctor portal.", status: "Sent" },
];

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("system"); // 'system' or 'broadcasts'
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("All Users");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertFilter, setAlertFilter] = useState("All");

  useEffect(() => {
    // Generate live system triggers based on active inventory, billing, appointments
    const liveAlerts = generateAutomatedSystemAlerts();
    setSystemAlerts(liveAlerts);
  }, []);

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);

    setTimeout(() => {
      const newAnn = {
        id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
        title,
        target,
        date: "Just Now",
        message,
        status: "Sent",
      };

      setAnnouncements([newAnn, ...announcements]);
      setSending(false);
      setSuccess(true);
      setTitle("");
      setMessage("");

      setTimeout(() => setSuccess(false), 2500);
    }, 800);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDismissAlert = (id) => {
    setSystemAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleMarkAllRead = () => {
    setSystemAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const filteredAlerts = systemAlerts.filter((a) => {
    if (alertFilter === "All") return true;
    return a.type === alertFilter || a.category === alertFilter;
  });

  const unreadAlertsCount = systemAlerts.filter((a) => !a.isRead).length;

  return (
    <div className="ad-page">
      {/* Success Toast */}
      {success && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0d9488",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          zIndex: 1200,
          boxShadow: "0 10px 25px rgba(13,148,136,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaCheckCircle />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Broadcast published &amp; sent to all target inboxes.</span>
        </div>
      )}

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaBell style={{ color: "var(--ad-primary)" }} /> Notifications &amp; System Alerts
        </h2>
        <p>Monitor real-time automated system triggers (low stock, overdue invoices, orders) and publish administrative broadcasts</p>
      </div>

      {/* Tabs */}
      <div className="ad-tabs-container">
        <div className="ad-tabs">
          <button
            onClick={() => setActiveTab("system")}
            className={`ad-tab-btn ${activeTab === "system" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FaExclamationTriangle /> Automated System Alerts
            {unreadAlertsCount > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: "0.7rem", padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("broadcasts")}
            className={`ad-tab-btn ${activeTab === "broadcasts" ? "active" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FaBullhorn /> Broadcast Announcements ({announcements.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: SYSTEM ALERTS ── */}
      {activeTab === "system" && (
        <div className="ad-card">
          <div className="ad-card-header" style={{ flexWrap: "wrap" }}>
            <div>
              <h3 className="ad-card-title">
                <FaBell /> Real-time Automated Event Triggers
              </h3>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                Dynamically triggered when inventory falls below thresholds, invoices become overdue, or orders require action.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <select
                className="ad-select"
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="All">All Categories</option>
                <option value="Critical">Critical Only</option>
                <option value="Warning">Warnings Only</option>
                <option value="Stock Alert">Stock Alerts</option>
                <option value="Billing & Invoices">Billing Alerts</option>
                <option value="Order Fulfillment">Order Alerts</option>
              </select>
              <button className="ad-btn ad-btn-outline" onClick={handleMarkAllRead}>
                Mark All Read
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--ad-text-muted)" }}>
                <FaCheckCircle style={{ fontSize: "2.5rem", color: "#10b981", marginBottom: "0.75rem" }} />
                <h4 style={{ margin: 0, color: "var(--ad-text-primary)" }}>All Systems Healthy</h4>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>No active alerts or stock warnings requiring immediate intervention.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isCrit = alert.type === "Critical";
                const isWarn = alert.type === "Warning";
                const borderColor = isCrit ? "#fca5a5" : isWarn ? "#fde68a" : "#bfdbfe";
                const bgColor = isCrit ? "#fff5f5" : isWarn ? "#fffbeb" : "#eff6ff";
                const iconColor = isCrit ? "#dc2626" : isWarn ? "#d97706" : "#2563eb";

                return (
                  <div
                    key={alert.id}
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
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                      <div style={{ color: iconColor, fontSize: "1.2rem", marginTop: "2px" }}>
                        {isCrit ? <FaExclamationTriangle /> : isWarn ? <FaExclamationTriangle /> : <FaInfoCircle />}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span className="ad-id-badge" style={{ fontSize: "0.68rem" }}>{alert.id}</span>
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "4px",
                            background: isCrit ? "#fee2e2" : isWarn ? "#fef3c7" : "#dbeafe",
                            color: isCrit ? "#dc2626" : isWarn ? "#d97706" : "#1e40af",
                          }}>
                            {alert.category}
                          </span>
                          <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>{alert.time}</span>
                        </div>
                        <h4 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", color: "var(--ad-text-primary)" }}>
                          {alert.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--ad-text-secondary)" }}>
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      {alert.actionLink && (
                        <Link to={alert.actionLink} className="ad-btn ad-btn-primary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}>
                          Take Action
                        </Link>
                      )}
                      <button
                        className="ad-btn ad-btn-outline"
                        style={{ padding: "0.35rem 0.5rem", fontSize: "0.75rem" }}
                        onClick={() => handleDismissAlert(alert.id)}
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

      {/* ── TAB 2: BROADCAST ANNOUNCEMENTS ── */}
      {activeTab === "broadcasts" && (
        <div className="ad-grid-2">
          {/* Dispatch new alert */}
          <div className="ad-card">
            <h3 className="ad-card-title" style={{ marginBottom: "1.25rem" }}>
              <FaPaperPlane /> Publish Administrative Broadcast
            </h3>
            <form onSubmit={handleBroadcastSubmit}>
              <div className="ad-form-group">
                <label htmlFor="title">Broadcast Headline *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Scheduled System Payment Settlement"
                  className="ad-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="ad-form-group">
                <label htmlFor="target">Target User Segment</label>
                <select
                  id="target"
                  className="ad-select"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="All Users">All Users (Global)</option>
                  <option value="Doctors & Pharmacies">Doctors &amp; Pharmacies (Healthcare Providers)</option>
                  <option value="Doctors Only">Doctors Only</option>
                  <option value="Hospitals Only">Hospitals Only</option>
                  <option value="Pharmacies Only">Pharmacies Only</option>
                  <option value="Patients Only">Patients Only</option>
                </select>
              </div>

              <div className="ad-form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="message">Broadcast Message Body *</label>
                <textarea
                  id="message"
                  rows="4"
                  className="ad-textarea"
                  placeholder="Write clear announcements. Targets will receive this inside their notification inbox..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="ad-btn ad-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={sending}>
                <FaPaperPlane /> {sending ? "Broadcasting Alert..." : "Publish Broadcast"}
              </button>
            </form>
          </div>

          {/* History Alerts */}
          <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="ad-card-title">
              <FaBullhorn /> Sent Broadcast History ({announcements.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {announcements.map((a) => (
                <div key={a.id} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "0.85rem 1rem",
                  border: "1px solid var(--ad-border-color)",
                  borderRadius: "10px",
                  background: "#f8fafc"
                }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <span className="ad-id-badge" style={{ fontSize: "0.68rem" }}>{a.id}</span>
                      <span className="ad-pill" style={{ background: "#ede9fe", color: "#6d28d9", fontSize: "0.68rem" }}>{a.target}</span>
                      <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>{a.date}</span>
                    </div>
                    <h4 style={{ margin: "0 0 0.2rem", fontSize: "0.88rem" }}>{a.title}</h4>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--ad-text-secondary)" }}>{a.message}</p>
                  </div>
                  <button
                    className="ad-btn ad-btn-danger"
                    style={{ padding: "0.35rem 0.5rem", borderRadius: "6px" }}
                    onClick={() => handleDeleteAnnouncement(a.id)}
                    title="Delete Announcement"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
