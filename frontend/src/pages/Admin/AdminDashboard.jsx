import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  FaUsers,
  FaUserCheck,
  FaCalendarCheck,
  FaArrowUp,
  FaBell,
  FaShieldAlt,
  FaPills,
  FaCheckCircle,
} from "react-icons/fa";

import "./AdminPages.css";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Admin authentication required.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch dashboard data."
          );
        }

        setDashboardData(result.data);
      } catch (err) {
        console.error("Admin dashboard error:", err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ad-page">
        <div
          className="ad-card"
          style={{
            textAlign: "center",
            padding: "3rem",
          }}
        >
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="ad-page">
        <div
          className="ad-card"
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // BACKEND DATA
  // ─────────────────────────────────────────────
  const counts = dashboardData?.counts || {};

  const pendingMedicineReview =
    counts.pendingMedicineReviews || 0;

  const approvedDrugsCount =
    counts.approvedMedicines || 0;

  const activeConsultsCount =
    (counts.upcomingAppointments || 0) +
    (counts.ongoingAppointments || 0);

  const pendingApprovals =
    counts.pendingApprovals || 0;

  // ─────────────────────────────────────────────
  // KPI CARDS
  // ─────────────────────────────────────────────
  const kpis = [
    {
      label: "Total Platform Users",
      value: (counts.totalUsers || 0).toLocaleString(),
      icon: <FaUsers />,
      bg: "#e0e7ff",
      color: "#4f46e5",
      delta: `${(counts.activeUsers || 0).toLocaleString()} active users`,
      up: true,
    },
    {
      label: "Pending Provider Reviews",
      value: pendingApprovals.toLocaleString(),
      icon: <FaUserCheck />,
      bg: "#fef3c7",
      color: "#d97706",
      delta: "Credentials verification",
      up: null,
    },
    {
      label: "Verified Listed Drugs",
      value: `${approvedDrugsCount} / ${counts.totalMedicines || 0
        }`,
      icon: <FaPills />,
      bg: "#dcfce7",
      color: "#16a34a",
      delta: `${pendingMedicineReview} pending approval`,
      up: true,
    },
    {
      label: "Active Telehealth Consults",
      value: activeConsultsCount.toLocaleString(),
      icon: <FaCalendarCheck />,
      bg: "#e0f2fe",
      color: "#0284c7",
      delta: "Upcoming + ongoing sessions",
      up: true,
    },
  ];

  // ─────────────────────────────────────────────
  // MONTHLY USER GROWTH
  // ─────────────────────────────────────────────
  const chartData =
    dashboardData?.monthlyUserGrowth || [];

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.count || 0),
    1
  );

  // ─────────────────────────────────────────────
  // USER DISTRIBUTION
  // ─────────────────────────────────────────────
  const totalParticipants =
    (counts.totalPatients || 0) +
    (counts.totalDoctors || 0) +
    (counts.totalHospitals || 0) +
    (counts.totalPharmacies || 0);

  const distribution = [
    {
      label: "Patients",
      count: counts.totalPatients || 0,
      pct: totalParticipants
        ? Math.round(
          ((counts.totalPatients || 0) /
            totalParticipants) *
          100
        )
        : 0,
      color: "#4f46e5",
    },
    {
      label: "Doctors",
      count: counts.totalDoctors || 0,
      pct: totalParticipants
        ? Math.round(
          ((counts.totalDoctors || 0) /
            totalParticipants) *
          100
        )
        : 0,
      color: "#8b5cf6",
    },
    {
      label: "Hospitals",
      count: counts.totalHospitals || 0,
      pct: totalParticipants
        ? Math.round(
          ((counts.totalHospitals || 0) /
            totalParticipants) *
          100
        )
        : 0,
      color: "#0d9488",
    },
    {
      label: "Pharmacies",
      count: counts.totalPharmacies || 0,
      pct: totalParticipants
        ? Math.round(
          ((counts.totalPharmacies || 0) /
            totalParticipants) *
          100
        )
        : 0,
      color: "#f59e0b",
    },
  ];

  // ─────────────────────────────────────────────
  // PENDING PROVIDERS
  // ─────────────────────────────────────────────
  const pendingProviders = [
    ...(dashboardData?.pendingProviders?.doctors || []).map(
      (doctor) => ({
        id: doctor._id,
        name: doctor.name || doctor.email || "Doctor",
        type: "Doctor",
        specialty:
          doctor.specialization || "Doctor",
        date: doctor.createdAt,
      })
    ),

    ...(dashboardData?.pendingProviders?.hospitals || []).map(
      (hospital) => ({
        id: hospital._id,
        name:
          hospital.name ||
          hospital.email ||
          "Hospital",
        type: "Hospital",
        specialty: hospital.city || "Hospital",
        date: hospital.createdAt,
      })
    ),

    ...(dashboardData?.pendingProviders?.pharmacies || []).map(
      (pharmacy) => ({
        id: pharmacy._id,
        name:
          pharmacy.name ||
          pharmacy.email ||
          "Pharmacy",
        type: "Pharmacy",
        specialty: pharmacy.city || "Pharmacy",
        date: pharmacy.createdAt,
      })
    ),
  ];

  return (
    <div className="ad-page">
      {/* Welcome Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
          borderRadius: "var(--ad-radius-xl)",
          padding: "1.75rem 2rem",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          boxShadow:
            "0 10px 25px rgba(49,16,66,0.15)",
        }}
      >
        <div>
          <h2
            style={{
              color: "#fff",
              fontFamily: "var(--ad-font-heading)",
              fontSize: "1.45rem",
              fontWeight: "800",
              margin: "0 0 0.3rem",
            }}
          >
            Platform Governance &amp; Supervision Portal 👋
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Welcome Admin. You have{" "}
            <strong>{pendingApprovals}</strong>{" "}
            healthcare provider applications and{" "}
            <strong>{pendingMedicineReview}</strong>{" "}
            pharmacy drug submissions awaiting regulatory
            verification.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/admin/pharmacy"
            className="ad-btn ad-btn-primary"
          >
            <FaShieldAlt /> Medicine Verification (
            {pendingMedicineReview})
          </Link>

          <Link
            to="/admin/approvals"
            className="ad-btn ad-btn-outline"
            style={{
              color: "#fff",
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <FaUserCheck /> Provider Approvals (
            {pendingApprovals})
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="ad-kpi-grid">
        {kpis.map((k, idx) => (
          <div key={idx} className="ad-kpi-card">
            <div
              className="ad-kpi-icon"
              style={{
                background: k.bg,
                color: k.color,
              }}
            >
              {k.icon}
            </div>

            <div className="ad-kpi-body">
              <p className="ad-kpi-label">
                {k.label}
              </p>

              <h3 className="ad-kpi-value">
                {k.value}
              </h3>

              {k.delta && (
                <span
                  className={`ad-kpi-delta ${k.up === null
                      ? ""
                      : k.up
                        ? "up"
                        : "down"
                    }`}
                  style={{
                    color:
                      k.up === null
                        ? "#d97706"
                        : "",
                  }}
                >
                  {k.up !== null && (
                    k.up ? <FaArrowUp /> : null
                  )}{" "}
                  {k.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="ad-grid-3">
        {/* User Growth */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">
              Monthly Platform Growth
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                background:
                  "var(--ad-bg-secondary)",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontWeight: "600",
              }}
            >
              New Users
            </span>
          </div>

          <div className="ad-chart-container">
            {chartData.length === 0 ? (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  color: "var(--ad-text-muted)",
                  padding: "2rem 0",
                }}
              >
                No growth data available.
              </div>
            ) : (
              chartData.map((d, i) => {
                const pct =
                  ((d.count || 0) /
                    maxChartValue) *
                  100;

                const monthName = new Date(
                  d._id.year,
                  d._id.month - 1
                ).toLocaleString("en-US", {
                  month: "short",
                });

                return (
                  <div
                    key={i}
                    className="ad-chart-bar-wrap"
                  >
                    <div className="ad-chart-bar-bg">
                      <div
                        className="ad-chart-bar-fill"
                        style={{
                          height: `${pct}%`,
                        }}
                      />
                    </div>

                    <span className="ad-chart-label">
                      {monthName}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">
              Registered Participants
            </h3>
          </div>

          <div className="ad-distribution-list">
            {distribution.map((dist, idx) => (
              <div
                key={idx}
                className="ad-dist-item"
              >
                <div className="ad-dist-header">
                  <span className="ad-dist-label">
                    {dist.label}
                  </span>

                  <span className="ad-dist-val">
                    {dist.count.toLocaleString()} (
                    {dist.pct}%)
                  </span>
                </div>

                <div className="ad-progress-bg">
                  <div
                    className="ad-progress-bar"
                    style={{
                      width: `${dist.pct}%`,
                      background: dist.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Feeds */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">
              <FaBell /> Regulatory Feeds &amp; Alerts
            </h3>

            <Link
              to="/admin/notifications"
              style={{
                fontSize: "0.75rem",
                color: "var(--ad-primary)",
                fontWeight: "600",
              }}
            >
              View All
            </Link>
          </div>

          <div className="ad-alerts-list">
            {(dashboardData?.recentLogs || [])
              .slice(0, 3)
              .map((log) => (
                <div
                  key={log._id}
                  className="ad-alert-item"
                >
                  <div
                    className="ad-alert-dot"
                    style={{
                      background: "#3b82f6",
                    }}
                  />

                  <div className="ad-alert-content">
                    <p className="ad-alert-msg">
                      {log.action ||
                        "Admin activity"}
                    </p>

                    <span className="ad-alert-time">
                      {log.description ||
                        "Recent system activity"}
                    </span>
                  </div>
                </div>
              ))}

            {(!dashboardData?.recentLogs ||
              dashboardData.recentLogs.length === 0) && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "var(--ad-text-muted)",
                  }}
                >
                  No recent admin activity.
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Pending Provider Applications */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">
            <FaUserCheck /> Healthcare Providers Pending
            Verification
          </h3>

          <Link
            to="/admin/approvals"
            className="ad-btn ad-btn-outline"
            style={{ fontSize: "0.78rem" }}
          >
            View Approvals Hub
          </Link>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Provider Name</th>
                <th>Provider Type</th>
                <th>Specialization / Category</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingProviders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--ad-text-muted)",
                    }}
                  >
                    No provider applications are currently
                    pending.
                  </td>
                </tr>
              ) : (
                pendingProviders.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="ad-id-badge">
                        {p.id}
                      </span>
                    </td>

                    <td>
                      <strong>{p.name}</strong>
                    </td>

                    <td>{p.type}</td>

                    <td>{p.specialty}</td>

                    <td>
                      {p.date
                        ? new Date(
                          p.date
                        ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <span
                        className="ad-pill"
                        style={{
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        Pending Review
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                        }}
                      >
                        <Link
                          to="/admin/approvals"
                          className="ad-btn ad-btn-primary"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          <FaCheckCircle /> Review
                        </Link>

                        <Link
                          to="/admin/approvals"
                          className="ad-btn ad-btn-secondary"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          Inspect Docs
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}