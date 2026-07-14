import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserCheck,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUserCheck as FaVerify,
} from "react-icons/fa";
import "./AdminPages.css";

const initialPendingProviders = [
  { id: "PROV-801", name: "Dr. Sandeep Reddy", type: "Doctor", specialty: "Cardiology", date: "14 Jul 2026", status: "Pending" },
  { id: "PROV-802", name: "Apex Heart Clinic", type: "Hospital", specialty: "Multi-Specialty", date: "14 Jul 2026", status: "Pending" },
  { id: "PROV-803", name: "MedPlus Pharmacy", type: "Pharmacy", specialty: "Retail Pharmacy", date: "13 Jul 2026", status: "Pending" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingProviders);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleApprove = (id, name) => {
    setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
    setToastMsg(`Successfully approved registration request for ${name}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const kpis = [
    { label: "Total Platform Users", value: "24,850", icon: <FaUsers />, bg: "#e0e7ff", color: "#4f46e5", delta: "+12% this month", up: true },
    { label: "Pending Verifications", value: pendingApprovals.length.toString(), icon: <FaUserCheck />, bg: "#fef3c7", color: "#d97706", delta: "Action required", up: null },
    { label: "Total Appointments", value: "3,892", icon: <FaCalendarCheck />, bg: "#e0f2fe", color: "#0284c7", delta: "+8% vs yesterday", up: true },
    { label: "Monthly Platform Fee", value: "₹45,300", icon: <FaFileInvoiceDollar />, bg: "#dcfce7", color: "#16a34a", delta: "+15.2% vs last month", up: true },
  ];

  const chartData = [
    { month: "Jan", val: 32 },
    { month: "Feb", val: 45 },
    { month: "Mar", val: 60 },
    { month: "Apr", val: 55 },
    { month: "May", val: 80 },
    { month: "Jun", val: 95 },
    { month: "Jul", val: 110 },
  ];

  const distribution = [
    { label: "Patients", count: "18,420", pct: 74, color: "#4f46e5" },
    { label: "Doctors", count: "4,120", pct: 16, color: "#8b5cf6" },
    { label: "Hospitals", count: "1,290", pct: 6, color: "#0d9488" },
    { label: "Pharmacies", count: "1,020", pct: 4, color: "#f59e0b" },
  ];

  const systemAlerts = [
    { id: 1, type: "Warning", msg: "Backup failed: Disk space low on server Node-3.", time: "10 mins ago" },
    { id: 2, type: "Info", msg: "API traffic spike: Payment processor latency at 240ms.", time: "45 mins ago" },
    { id: 3, type: "Security", msg: "Failed login threshold exceeded for User #DOCT-405.", time: "2 hours ago" },
  ];

  return (
    <div className="ad-page">
      {/* Toast Alert */}
      {showToast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#1e293b",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "adFadeIn 0.3s ease"
        }}>
          <FaShieldAlt style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)",
        borderRadius: "var(--ad-radius-xl)",
        padding: "1.75rem 2rem",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1.25rem",
        boxShadow: "0 10px 25px rgba(49,16,66,0.15)"
      }}>
        <div>
          <h2 style={{ color: "#fff", fontFamily: "var(--ad-font-heading)", fontSize: "1.45rem", fontWeight: "800", margin: "0 0 0.3rem" }}>
            Welcome Back, Admin Alex 👋
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.7)" }}>
            The platform is running smoothly. <strong>{pendingApprovals.length}</strong> medical providers are awaiting registration review.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/admin/approvals" className="ad-btn ad-btn-primary">
            <FaVerify /> Review Applications
          </Link>
          <Link to="/admin/settings" className="ad-btn ad-btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.25)" }}>
            System Settings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="ad-kpi-grid">
        {kpis.map((k, idx) => (
          <div key={idx} className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: k.bg, color: k.color }}>
              {k.icon}
            </div>
            <div className="ad-kpi-body">
              <p className="ad-kpi-label">{k.label}</p>
              <h3 className="ad-kpi-value">{k.value}</h3>
              {k.delta && (
                <span className={`ad-kpi-delta ${k.up === null ? "" : k.up ? "up" : "down"}`} style={{ color: k.up === null ? "#d97706" : "" }}>
                  {k.up !== null && (k.up ? <FaArrowUp /> : <FaArrowDown />)} {k.delta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div className="ad-grid-2">
        {/* Registration Analytics */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Monthly Platform Growth</h3>
            <span style={{ fontSize: "0.75rem", background: "var(--ad-bg-secondary)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>
              Active Users (Thousands)
            </span>
          </div>
          <div className="ad-chart-container">
            {chartData.map((d, i) => {
              // Map val to height percent
              const pct = (d.val / 120) * 100;
              return (
                <div key={i} className="ad-chart-bar-wrap">
                  <div className="ad-chart-bar-bg">
                    <div className="ad-chart-bar-fill" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="ad-chart-label">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Base Distribution */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">User Base Distribution</h3>
            <span style={{ fontSize: "0.75rem", background: "var(--ad-bg-secondary)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>
              Role Split
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", paddingTop: "0.5rem" }}>
            {distribution.map((d, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: "700" }}>{d.label}</span>
                  <span style={{ color: "var(--ad-text-secondary)" }}>
                    <strong>{d.count}</strong> ({d.pct}%)
                  </span>
                </div>
                <div style={{ height: "8px", background: "var(--ad-bg-secondary)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    width: `${d.pct}%`,
                    height: "100%",
                    background: d.color,
                    borderRadius: "999px"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row Grid */}
      <div className="ad-grid-2">
        {/* Verification Queue Preview */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title"><FaVerify /> Awaiting Verification</h3>
            <Link to="/admin/approvals" style={{ fontSize: "0.8rem", color: "var(--ad-primary)", fontWeight: "600" }}>View Queue</Link>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--ad-text-muted)" }}>
                      All registrations are caught up! No pending approvals.
                    </td>
                  </tr>
                ) : (
                  pendingApprovals.map((p) => (
                    <tr key={p.id}>
                      <td><span className="ad-id-badge">{p.id}</span></td>
                      <td><strong>{p.name}</strong></td>
                      <td>
                        <span className="ad-pill" style={{
                          background: p.type === "Doctor" ? "#e0f2fe" : p.type === "Hospital" ? "#ccfbf1" : "#fef3c7",
                          color: p.type === "Doctor" ? "#0369a1" : p.type === "Hospital" ? "#0f766e" : "#d97706"
                        }}>{p.type}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleApprove(p.id, p.name)}
                          className="ad-btn ad-btn-primary"
                          style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Server Health Monitoring */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title"><FaExclamationTriangle style={{ color: "#d97706" }} /> System Status & Core Warnings</h3>
            <Link to="/admin/logs" style={{ fontSize: "0.8rem", color: "var(--ad-primary)", fontWeight: "600" }}>Audit Logs</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {systemAlerts.map((alert) => (
              <div key={alert.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                border: "1px solid var(--ad-border-color)",
                background: alert.type === "Warning" ? "#fffbeb" : alert.type === "Security" ? "#fef2f2" : "#f8fafc"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                  <span className="ad-pill" style={{
                    background: alert.type === "Warning" ? "#fef3c7" : alert.type === "Security" ? "#fee2e2" : "#e0f2fe",
                    color: alert.type === "Warning" ? "#d97706" : alert.type === "Security" ? "#dc2626" : "#0284c7"
                  }}>{alert.type}</span>
                  <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: "500", color: "var(--ad-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {alert.msg}
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", flexShrink: 0, marginLeft: "0.5rem" }}>
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
