import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FaPills,
  FaBoxOpen,
  FaTicketAlt,
  FaNotesMedical,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getStoredMedicines,
  getStoredOrders,
  getStoredInvoices,
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
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    setMedicines(getStoredMedicines());
    setOrders(getStoredOrders());
    setInvoices(getStoredInvoices());
    setAppointments(getStoredAppointments());
    setSystemAlerts(generateAutomatedSystemAlerts());
  }, []);

  const handleApprove = (id, name) => {
    setPendingApprovals((prev) => prev.filter((p) => p.id !== id));
    setToastMsg(`Successfully approved registration request for ${name}.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Dynamic real-time metrics
  const totalRevenue = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
  const lowStockCount = medicines.filter((m) => m.stock <= (m.minThreshold || 15)).length;
  const activeOrdersCount = orders.filter((o) => o.status === "Placed" || o.status === "Processing" || o.status === "Out for Delivery").length;
  const scheduledAptsCount = appointments.filter((a) => a.status === "Upcoming" || a.status === "Ongoing" || a.status === "Scheduled").length;

  const kpis = [
    { label: "Total Platform Users", value: "24,850", icon: <FaUsers />, bg: "#e0e7ff", color: "#4f46e5", delta: "+12% this month", up: true },
    { label: "Active Consultations", value: scheduledAptsCount.toString(), icon: <FaCalendarCheck />, bg: "#e0f2fe", color: "#0284c7", delta: "Live Schedules", up: true },
    { label: "Realized Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <FaFileInvoiceDollar />, bg: "#dcfce7", color: "#16a34a", delta: "+18.4% vs last month", up: true },
    { label: "Active Pharmacy Orders", value: activeOrdersCount.toString(), icon: <FaBoxOpen />, bg: "#fef3c7", color: "#d97706", delta: `${lowStockCount} low-stock alerts`, up: null },
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
            Welcome Back, Admin Alex 👋
          </h2>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(255,255,255,0.8)" }}>
            Real-time platform status: <strong>{activeOrdersCount}</strong> orders processing, <strong>{lowStockCount}</strong> inventory warnings, and <strong>{pendingApprovals.length}</strong> provider verifications pending.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/admin/pharmacy" className="ad-btn ad-btn-primary">
            <FaPills /> Stock Management
          </Link>
          <Link to="/admin/orders" className="ad-btn ad-btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
            <FaBoxOpen /> Orders &amp; Delivery
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

      {/* Quick Access Control Matrix */}
      <div className="ad-grid-4" style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Link to="/admin/pharmacy" className="ad-card" style={{ padding: "1.2rem", textDecoration: "none", color: "inherit", transition: "transform 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#e0e7ff", color: "#4f46e5", padding: "0.75rem", borderRadius: "10px", fontSize: "1.2rem" }}>
              <FaPills />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.2rem", fontSize: "0.95rem" }}>Pharmacy &amp; Stock</h4>
              <span style={{ fontSize: "0.75rem", color: lowStockCount > 0 ? "#dc2626" : "#16a34a", fontWeight: "600" }}>
                {lowStockCount} Stock Alerts
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders" className="ad-card" style={{ padding: "1.2rem", textDecoration: "none", color: "inherit", transition: "transform 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#fef3c7", color: "#d97706", padding: "0.75rem", borderRadius: "10px", fontSize: "1.2rem" }}>
              <FaBoxOpen />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.2rem", fontSize: "0.95rem" }}>Orders &amp; Courier</h4>
              <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "600" }}>
                {activeOrdersCount} Dispatches Active
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/coupons" className="ad-card" style={{ padding: "1.2rem", textDecoration: "none", color: "inherit", transition: "transform 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#dcfce7", color: "#16a34a", padding: "0.75rem", borderRadius: "10px", fontSize: "1.2rem" }}>
              <FaTicketAlt />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.2rem", fontSize: "0.95rem" }}>Coupons &amp; Promos</h4>
              <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "600" }}>
                Voucher CRUD &amp; Rules
              </span>
            </div>
          </div>
        </Link>

        <Link to="/admin/billing" className="ad-card" style={{ padding: "1.2rem", textDecoration: "none", color: "inherit", transition: "transform 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#ede9fe", color: "#6d28d9", padding: "0.75rem", borderRadius: "10px", fontSize: "1.2rem" }}>
              <FaFileInvoiceDollar />
            </div>
            <div>
              <h4 style={{ margin: "0 0 0.2rem", fontSize: "0.95rem" }}>Billing &amp; Invoices</h4>
              <span style={{ fontSize: "0.75rem", color: "#6d28d9", fontWeight: "600" }}>
                Settlements &amp; Taxes
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Analytics Charts Row */}
      <div className="ad-grid-3">
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
            <h3 className="ad-card-title">User Distribution</h3>
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

        {/* Live System Alerts */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title"><FaBell /> Real-time System Feeds</h3>
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
          <h3 className="ad-card-title"><FaUserCheck /> Pending Healthcare Provider Applications</h3>
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
