import React, { useState } from "react";
import { FaHistory, FaSearch, FaFilter, FaFileAlt } from "react-icons/fa";
import "./AdminPages.css";

const initialLogs = [
  { id: "LOG-5510", actor: "Alex Mercer", role: "Super Admin", action: "Approved Doctor application APP-901 (Dr. Sandeep Reddy)", type: "Moderation", date: "15 Jul 2026 00:10 AM", ip: "192.168.1.45" },
  { id: "LOG-5509", actor: "System Daemon", role: "Cron Job", action: "Completed database snapshot backup, compressed: db_backup_20260715.tar.gz (45.2MB)", type: "System", date: "15 Jul 2026 00:00 AM", ip: "127.0.0.1" },
  { id: "LOG-5508", actor: "Alex Mercer", role: "Super Admin", action: "Updated live API key credentials for payment gateway Integration (Razorpay)", type: "Updates", date: "14 Jul 2026 11:22 PM", ip: "192.168.1.45" },
  { id: "LOG-5507", actor: "Alex Mercer", role: "Super Admin", action: "Blocked Patient record PAT-103 (Rohan Verma) for billing issues", type: "Security", date: "14 Jul 2026 10:14 PM", ip: "192.168.1.45" },
  { id: "LOG-5506", actor: "System Daemon", role: "Cron Job", action: "Completed medicine critical thresholds check. Triggered low stock alerts for 12 items", type: "System", date: "14 Jul 2026 06:00 PM", ip: "127.0.0.1" },
  { id: "LOG-5505", actor: "Alex Mercer", role: "Super Admin", action: "Resolved Feedback ID FDB-302, sent notification response", type: "Moderation", date: "14 Jul 2026 04:30 PM", ip: "192.168.1.45" },
];

export default function AdminLogs() {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "All" || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Audit trail of administrative actions, platform updates, and security logs</p>
      </div>

      <div className="ad-card">
        {/* Actions bar */}
        <div className="ad-search-filter-bar">
          <div className="ad-search-wrapper">
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search logs by actor, action, id..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters">
            <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FaFilter /> Log Category:
            </span>
            <select
              className="ad-select"
              style={{ width: "155px", padding: "0.45rem 0.75rem" }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Moderation">Moderation</option>
              <option value="System">System Alerts</option>
              <option value="Updates">Updates</option>
              <option value="Security">Security Logs</option>
            </select>
          </div>
        </div>

        {/* List Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--ad-text-muted)" }}>
              No audit logs match current search filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} style={{
                padding: "1rem",
                borderRadius: "10px",
                border: "1px solid var(--ad-border-color)",
                background: "#f8fafc",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: log.type === "Security" ? "#fee2e2" : log.type === "System" ? "#e0f2fe" : "#ede9fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: log.type === "Security" ? "#dc2626" : log.type === "System" ? "#0284c7" : "#6d28d9",
                  flexShrink: 0
                }}>
                  <FaHistory style={{ fontSize: "0.9rem" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className="ad-id-badge" style={{ fontSize: "0.7rem" }}>{log.id}</span>
                      <strong style={{ fontSize: "0.85rem" }}>{log.actor}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--ad-text-secondary)" }}>({log.role})</span>
                    </div>
                    <span className="ad-pill" style={{
                      background: log.type === "Security" ? "#fee2e2" : log.type === "System" ? "#e0f2fe" : log.type === "Updates" ? "#ccfbf1" : "#f3e8ff",
                      color: log.type === "Security" ? "#dc2626" : log.type === "System" ? "#0284c7" : log.type === "Updates" ? "#0f766e" : "#6b21a8",
                      fontSize: "0.68rem"
                    }}>{log.type}</span>
                  </div>
                  <p style={{ margin: "0.4rem 0 0.15rem 0", fontSize: "0.84rem", color: "var(--ad-text-primary)", lineHeight: 1.4 }}>
                    {log.action}
                  </p>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                    <span>Timestamp: {log.date}</span>
                    <span>IP Address: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
