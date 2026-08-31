import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUserCheck,
  FaCalendarCheck,
  FaArrowUp,
  FaArrowDown,
  FaBell,
  FaShieldAlt,
  FaExclamationTriangle,
  FaPills,
  FaTicketAlt,
  FaNotesMedical,
  FaCheckCircle,
  FaHospital,
  FaClinicMedical,
  FaBan,
} from "react-icons/fa";
import {
  getStoredMedicines,
  getStoredAppointments,
  generateAutomatedSystemAlerts,
} from "../../utils/adminData";
import "./AdminPages.css";

const initialPendingProviders = [
  { id: "PROV-801", name: "Dr. Sandeep Reddy", type: "Doctor", specialty: "Cardiology", date: "Today", status: "Pending" },
  { id: "PROV-802", name: "Apex Heart Clinic", type: "Hospital", specialty: "Multi-Specialty", date: "Today", status: "Pending" },
  { id: "PROV-803", name: "MedPlus Pharmacy", type: "Pharmacy", specialty: "Retail Pharmacy", date: "Yesterday", status: "Pending" },
];

export default function AdminDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingProviders);
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setMedicines(getStoredMedicines());
    setAppointments(getStoredAppointments());
    setSystemAlerts(generateAutomatedSystemAlerts());
  }, []);

  const handleApprove = (id, name) => {
    setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
    setToastMsg(`Successfully approved registration request for ${name}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Real-time Governance Metrics
  const pendingMedicineReview = medicines.filter((m) => m.approvalStatus === "Pending Review").length;
  const blockedDrugsCount = medicines.filter((m) => m.approvalStatus === "Blocked").length;
  const approvedDrugsCount = medicines.filter((m) => m.approvalStatus === "Approved").length;
  const activeConsultsCount = appointments.filter((a) => a.status === "Upcoming" || a.status === "Ongoing" || a.status === "Scheduled").length;

  const kpis = [
    { label: "Total Platform Users", value: "24,850", icon: <FaUsers />, bg: "#e0e7ff", color: "#4f46e5", delta: "+12% this month", up: true },
    { label: "Pending Provider Reviews", value: pendingApprovals.length.toString(), icon: <FaUserCheck />, bg: "#fef3c7", color: "#d97706", delta: "Credentials verification", up: null },
    { label: "Verified Listed Drugs", value: `${approvedCount(medicines)} / ${medicines.length}`, icon: <FaPills />, bg: "#dcfce7", color: "#16a34a", delta: `${pendingMedicineReview} pending approval`, up: true },
    { label: "Active Telehealth Consults", value: activeConsultsCount.toString(), icon: <FaCalendarCheck />, bg: "#e0f2fe", color: "#0284c7", delta: "Live digital sessions", up: true },
  ];

  function approvedCount(list) {
    return list.filter((m) => m.approvalStatus === "Approved").length;
  }

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
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          zIndex: 1200,
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
            Platform Governance &amp; Supervision Portal 👋
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.8)" }}>
            Welcome Admin Alex. You have <strong>{pendingApprovals.length}</strong> healthcare providers and <strong>{pendingMedicineReview}</strong> pharmacy drug submissions awaiting regulatory verification.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/admin/pharmacy" className="ad-btn ad-btn-primary">
            <FaShieldAlt /> Medicine Verification ({pendingMedicineReview})
          </Link>
          <Link to="/admin/approvals" className="ad-btn ad-btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
            <FaUserCheck /> Provider Approvals ({pendingApprovals.length})
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

      {/* Analytics Row */}
      <div className="ad-grid-3">
        {/* User Growth */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Monthly Platform Growth</h3>
            <span style={{ fontSize: "0.75rem", background: "var(--ad-bg-secondary)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>
              Active Users (Thousands)
            </span>
          </div>
          <div className="ad-chart-container">
            {chartData.map((d, i) => {
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

        {/* User Distribution */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Registered Participants</h3>
          </div>
          <div className="ad-distribution-list">
            {distribution.map((dist, idx) => (
              <div key={idx} className="ad-dist-item">
                <div className="ad-dist-header">
                  <span className="ad-dist-label">{dist.label}</span>
                  <span className="ad-dist-val">{dist.count} ({dist.pct}%)</span>
                </div>
                <div className="ad-progress-bg">
                  <div className="ad-progress-bar" style={{ width: `${dist.pct}%`, background: dist.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Feeds */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title"><FaBell /> Regulatory Feeds &amp; Alerts</h3>
            <Link to="/admin/notifications" style={{ fontSize: "0.75rem", color: "var(--ad-primary)", fontWeight: "600" }}>
              View All
            </Link>
          </div>
          <div className="ad-alerts-list">
            {systemAlerts.slice(0, 3).map((a) => (
              <div key={a.id} className="ad-alert-item">
                <div className="ad-alert-dot" style={{ background: a.type === "Critical" ? "#ef4444" : a.type === "Warning" ? "#f59e0b" : "#3b82f6" }} />
                <div className="ad-alert-content">
                  <p className="ad-alert-msg">{a.title}</p>
                  <span className="ad-alert-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Provider Applications */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title"><FaUserCheck /> Healthcare Providers Pending Verification</h3>
          <Link to="/admin/approvals" className="ad-btn ad-btn-outline" style={{ fontSize: "0.78rem" }}>
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
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--ad-text-muted)" }}>
                    All provider applications have been reviewed and verified.
                  </td>
                </tr>
              ) : (
                pendingApprovals.map((p) => (
                  <tr key={p.id}>
                    <td><span className="ad-id-badge">{p.id}</span></td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.type}</td>
                    <td>{p.specialty}</td>
                    <td>{p.date}</td>
                    <td>
                      <span className="ad-pill" style={{ background: "#fef3c7", color: "#d97706" }}>Pending Review</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="ad-btn ad-btn-primary"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => handleApprove(p.id, p.name)}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <Link
                          to="/admin/approvals"
                          className="ad-btn ad-btn-secondary"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
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
