import React, { useEffect, useState } from "react";

import {
  FaHistory,
  FaSearch,
  FaFilter,
  FaExclamationCircle,
} from "react-icons/fa";

import "./AdminPages.css";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/reports",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch audit logs.");
      }

      const reportData = data.data || {};

      setLogs(Array.isArray(reportData.recentLogs) ? reportData.recentLogs : []);
    } catch (err) {
      console.error("Fetch admin logs error:", err);
      setError(err.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const actor =
      log.adminId?.name ||
      log.adminId?.email ||
      "Admin";

    const action = log.action || "";
    const id = log.targetId || "";
    const type = log.targetType || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      action.toLowerCase().includes(searchText) ||
      actor.toLowerCase().includes(searchText) ||
      id.toLowerCase().includes(searchText);

    const matchesType =
      typeFilter === "All" || type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getLogType = (log) => {
    const targetType = log.targetType || "";

    if (
      targetType === "User" ||
      targetType === "Doctor" ||
      targetType === "Patient" ||
      targetType === "Hospital" ||
      targetType === "Pharmacy"
    ) {
      return "Moderation";
    }

    if (
      targetType === "Medicine" ||
      targetType === "Offer" ||
      targetType === "Coupon"
    ) {
      return "Updates";
    }

    if (targetType === "System") {
      return "System";
    }

    return "Security";
  };

  const getActorRole = (log) => {
    if (log.adminId?.role) {
      return log.adminId.role;
    }

    return "Admin";
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>
          Audit trail of administrative actions, platform updates, and
          security logs
        </p>
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
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <FaFilter /> Log Category:
            </span>

            <select
              className="ad-select"
              style={{
                width: "155px",
                padding: "0.45rem 0.75rem",
              }}
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

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--ad-text-muted)",
            }}
          >
            Loading audit logs...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaExclamationCircle />
            {error}
          </div>
        )}

        {/* Logs */}
        {!loading && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {filteredLogs.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--ad-text-muted)",
                }}
              >
                No audit logs match current search filters.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const logType = getLogType(log);

                const actor =
                  log.adminId?.name ||
                  log.adminId?.email ||
                  "Admin";

                const role = getActorRole(log);

                return (
                  <div
                    key={log._id}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      border: "1px solid var(--ad-border-color)",
                      background: "#f8fafc",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background:
                          logType === "Security"
                            ? "#fee2e2"
                            : logType === "System"
                              ? "#e0f2fe"
                              : "#ede9fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color:
                          logType === "Security"
                            ? "#dc2626"
                            : logType === "System"
                              ? "#0284c7"
                              : "#6d28d9",
                        flexShrink: 0,
                      }}
                    >
                      <FaHistory
                        style={{
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            className="ad-id-badge"
                            style={{
                              fontSize: "0.7rem",
                            }}
                          >
                            {log.targetId
                              ? `LOG-${String(log._id).slice(-6)}`
                              : `LOG-${String(log._id).slice(-6)}`}
                          </span>

                          <strong
                            style={{
                              fontSize: "0.85rem",
                            }}
                          >
                            {actor}
                          </strong>

                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ad-text-secondary)",
                            }}
                          >
                            ({role})
                          </span>
                        </div>

                        <span
                          className="ad-pill"
                          style={{
                            background:
                              logType === "Security"
                                ? "#fee2e2"
                                : logType === "System"
                                  ? "#e0f2fe"
                                  : logType === "Updates"
                                    ? "#ccfbf1"
                                    : "#f3e8ff",
                            color:
                              logType === "Security"
                                ? "#dc2626"
                                : logType === "System"
                                  ? "#0284c7"
                                  : logType === "Updates"
                                    ? "#0f766e"
                                    : "#6b21a8",
                            fontSize: "0.68rem",
                          }}
                        >
                          {logType}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "0.4rem 0 0.15rem 0",
                          fontSize: "0.84rem",
                          color: "var(--ad-text-primary)",
                          lineHeight: 1.4,
                        }}
                      >
                        {log.description || log.action || "No description"}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.72rem",
                          color: "var(--ad-text-muted)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          Timestamp:{" "}
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : "N/A"}
                        </span>

                        <span>
                          IP Address:{" "}
                          {log.ipAddress || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}