import React, { useState } from "react";
import { FaBell, FaPaperPlane, FaUserCheck, FaTrash, FaCheckCircle } from "react-icons/fa";
import "./AdminPages.css";

const initialAnnouncements = [
  { id: "ANN-101", title: "Scheduled Payment Settlement Delay", target: "Doctors & Pharmacies", date: "14 Jul 2026", status: "Sent" },
  { id: "ANN-102", title: "Urgent: Cloud Database Security Patch", target: "All Providers", date: "12 Jul 2026", status: "Sent" },
  { id: "ANN-103", title: "New Telehealth Guidelines Update", target: "Doctors Only", date: "10 Jul 2026", status: "Sent" },
];

export default function AdminNotifications() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("All Users");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    setSending(true);

    setTimeout(() => {
      const newAnn = {
        id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
        title,
        target,
        date: "Today",
        status: "Sent",
      };

      setAnnouncements([newAnn, ...announcements]);
      setSending(false);
      setSuccess(true);
      setTitle("");
      setMessage("");

      setTimeout(() => setSuccess(false), 2500);
    }, 1000);
  };

  const handleDelete = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Broadcast announcements, dispatch emergency notifications, and manage sent alerts</p>
      </div>

      {success && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0d9488",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          zIndex: 1100,
          boxShadow: "0 10px 25px rgba(13,148,136,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaCheckCircle />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Announcement broadcasted to active targets.</span>
        </div>
      )}

      <div className="ad-grid-2">
        {/* Dispatches new alert */}
        <div className="ad-card">
          <h3 className="ad-card-title" style={{ marginBottom: "1.25rem" }}><FaPaperPlane /> Dispatch New Announcement</h3>
          <form onSubmit={handleSubmit}>
            <div className="ad-form-group">
              <label htmlFor="title">Announcement Headline</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Server Upgrade Maintenance Tonight"
                className="ad-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group">
              <label htmlFor="target">Target User Segments</label>
              <select
                id="target"
                className="ad-select"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="All Users">All Users (Global)</option>
                <option value="Doctors & Pharmacies">Doctors & Pharmacies (Service Providers)</option>
                <option value="Doctors Only">Doctors Only</option>
                <option value="Hospitals Only">Hospitals Only</option>
                <option value="Pharmacies Only">Pharmacies Only</option>
                <option value="Patients Only">Patients Only</option>
              </select>
            </div>

            <div className="ad-form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="message">Announcement Message Body</label>
              <textarea
                id="message"
                rows="4"
                className="ad-textarea"
                placeholder="Write detailed announcements here. Targets will receive this inside their notification inbox..."
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
          <h3 className="ad-card-title"><FaBell /> Broadcast History ({announcements.length})</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {announcements.map((a) => (
              <div key={a.id} style={{
                display: "flex",
                alignItems: "center",
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
                  </div>
                  <h4 style={{ margin: 0, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</h4>
                  <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>Sent {a.date}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  <span className="ad-pill" style={{ background: "#dcfce7", color: "#16a34a", fontSize: "0.7rem" }}><FaUserCheck /> {a.status}</span>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="ad-btn"
                    style={{ background: "#fee2e2", color: "#dc2626", padding: "0.35rem", borderRadius: "6px" }}
                    title="Remove Log"
                  >
                    <FaTrash style={{ fontSize: "0.8rem" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
