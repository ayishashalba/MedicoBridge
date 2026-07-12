import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaFilePrescription, FaBoxes, FaShoppingCart,
  FaFileInvoiceDollar, FaTruck, FaBell,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaChartLine,
  FaPills, FaArrowUp, FaArrowDown,
} from "react-icons/fa";
import "./PharmacyDashboard.css";

const kpiCards = [
  { label: "Pending Prescriptions", value: "14",   icon: <FaFilePrescription />, color: "#0ea5e9", bg: "#e0f2fe", delta: "+3 today",    up: true  },
  { label: "Medicines in Stock",    value: "1,248", icon: <FaBoxes />,           color: "#0d9488", bg: "#ccfbf1", delta: "12 low stock",  up: false },
  { label: "Orders Today",          value: "38",   icon: <FaShoppingCart />,    color: "#6366f1", bg: "#ede9fe", delta: "+7 vs yesterday",up: true  },
  { label: "Revenue Today",         value: "₹18,400",icon:<FaFileInvoiceDollar />,color:"#f59e0b",bg: "#fef3c7", delta: "+₹2,100",      up: true  },
];

const recentPrescriptions = [
  { id: "RX-001", patient: "Aarav Sharma",   doctor: "Dr. Priya Mehta",  date: "12 Jul 2026", status: "Pending",    items: 3 },
  { id: "RX-002", patient: "Sunita Rao",     doctor: "Dr. Anil Kumar",   date: "12 Jul 2026", status: "Dispensed",  items: 5 },
  { id: "RX-003", patient: "Rohan Verma",    doctor: "Dr. Sara Thomas",  date: "11 Jul 2026", status: "Pending",    items: 2 },
  { id: "RX-004", patient: "Lakshmi Nair",   doctor: "Dr. Rajiv Kapoor", date: "11 Jul 2026", status: "Dispensed",  items: 4 },
  { id: "RX-005", patient: "Karan Malhotra", doctor: "Dr. Priya Mehta",  date: "10 Jul 2026", status: "On Hold",    items: 1 },
];

const lowStockItems = [
  { name: "Paracetamol 500mg",  qty: 18,  threshold: 50 },
  { name: "Amoxicillin 250mg",  qty: 9,   threshold: 30 },
  { name: "Metformin 500mg",    qty: 22,  threshold: 40 },
  { name: "Atorvastatin 10mg",  qty: 14,  threshold: 35 },
];

const recentOrders = [
  { id: "ORD-441", patient: "Anita Singh",   amount: "₹640",   status: "Delivered",  type: "Home Delivery" },
  { id: "ORD-442", patient: "Mohan Das",     amount: "₹1,200", status: "Processing", type: "Pickup"        },
  { id: "ORD-443", patient: "Priya Patel",   amount: "₹380",   status: "Shipped",    type: "Home Delivery" },
  { id: "ORD-444", patient: "Vijay Kumar",   amount: "₹950",   status: "Delivered",  type: "Pickup"        },
];

const statusColor = {
  Pending:    { bg: "#fef3c7", color: "#d97706" },
  Dispensed:  { bg: "#dcfce7", color: "#16a34a" },
  "On Hold":  { bg: "#fee2e2", color: "#dc2626" },
  Delivered:  { bg: "#dcfce7", color: "#16a34a" },
  Processing: { bg: "#ede9fe", color: "#6d28d9" },
  Shipped:    { bg: "#e0f2fe", color: "#0284c7" },
};

function StatusPill({ status }) {
  const s = statusColor[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ background: s.bg, color: s.color }}
      className="ph-pill">{status}</span>
  );
}

export default function PharmacyDashboard() {
  return (
    <div className="ph-dashboard">
      {/* Welcome Banner */}
      <div className="ph-welcome-banner">
        <div className="ph-welcome-text">
          <h2>Good Morning, MediCare Pharmacy 👋</h2>
          <p>Here's what's happening at your pharmacy today.</p>
        </div>
        <div className="ph-welcome-actions">
          <NavLink to="/pharmacy/prescriptions" className="ph-btn-primary">
            <FaFilePrescription /> New Prescription
          </NavLink>
          <NavLink to="/pharmacy/orders" className="ph-btn-outline">
            <FaShoppingCart /> View Orders
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="ph-kpi-grid">
        {kpiCards.map((k) => (
          <div key={k.label} className="ph-kpi-card">
            <div className="ph-kpi-icon" style={{ background: k.bg, color: k.color }}>
              {k.icon}
            </div>
            <div className="ph-kpi-body">
              <p className="ph-kpi-label">{k.label}</p>
              <h3 className="ph-kpi-value">{k.value}</h3>
              <span className={`ph-kpi-delta ${k.up ? "up" : "down"}`}>
                {k.up ? <FaArrowUp /> : <FaArrowDown />} {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="ph-grid-2">
        {/* Recent Prescriptions */}
        <div className="ph-card">
          <div className="ph-card-header">
            <h3 className="ph-card-title"><FaFilePrescription /> Recent Prescriptions</h3>
            <NavLink to="/pharmacy/prescriptions" className="ph-link-sm">View All</NavLink>
          </div>
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPrescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td><span className="ph-id-badge">{rx.id}</span></td>
                    <td><span className="ph-name">{rx.patient}</span></td>
                    <td>{rx.doctor}</td>
                    <td>{rx.items}</td>
                    <td><StatusPill status={rx.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="ph-card">
          <div className="ph-card-header">
            <h3 className="ph-card-title"><FaExclamationTriangle className="ph-warn-icon" /> Low Stock Alert</h3>
            <NavLink to="/pharmacy/inventory" className="ph-link-sm">Manage</NavLink>
          </div>
          <div className="ph-low-stock-list">
            {lowStockItems.map((item) => {
              const pct = Math.round((item.qty / item.threshold) * 100);
              return (
                <div key={item.name} className="ph-low-stock-item">
                  <div className="ph-low-stock-info">
                    <span className="ph-low-stock-name">{item.name}</span>
                    <span className="ph-low-stock-qty">{item.qty} left / {item.threshold} min</span>
                  </div>
                  <div className="ph-progress-bar-bg">
                    <div
                      className="ph-progress-bar-fill"
                      style={{ width: `${pct}%`, background: pct < 35 ? "#dc2626" : "#f59e0b" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="ph-card">
        <div className="ph-card-header">
          <h3 className="ph-card-title"><FaShoppingCart /> Recent Orders</h3>
          <NavLink to="/pharmacy/orders" className="ph-link-sm">View All</NavLink>
        </div>
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><span className="ph-id-badge">{o.id}</span></td>
                  <td><span className="ph-name">{o.patient}</span></td>
                  <td>{o.type}</td>
                  <td><strong>{o.amount}</strong></td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
