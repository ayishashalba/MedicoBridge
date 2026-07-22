import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaFilePrescription, FaBoxes, FaShoppingCart,
  FaFileInvoiceDollar, FaTruck, FaBell,
  FaCheckCircle, FaExclamationTriangle, FaClock, FaChartLine,
  FaPills, FaArrowUp, FaArrowDown, FaUserInjured, FaHospitalUser, FaTruckLoading, FaHospital
} from "react-icons/fa";
import "./PharmacyDashboard.css";

const statusColor = {
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Dispensed: { bg: "#dcfce7", color: "#16a34a" },
  "On Hold": { bg: "#fee2e2", color: "#dc2626" },
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Processing: { bg: "#ede9fe", color: "#6d28d9" },
  Shipped: { bg: "#e0f2fe", color: "#0284c7" },
  Approved: { bg: "#dcfce7", color: "#16a34a" },
};

function StatusPill({ status }) {
  const s = statusColor[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ background: s.bg, color: s.color }}
      className="ph-pill">{status}</span>
  );
}

export default function PharmacyDashboard() {
  const pharmacyType =
    localStorage.getItem("pharmacyType") || "Retail";

  const getDashboardData = () => {
    switch (pharmacyType) {
      case "Hospital":
        return {
          title: "Good Morning, Apollo Hospital Pharmacy 👋",
          kpiCards: [
            { label: "Hospital Prescriptions", value: "45", icon: <FaFilePrescription />, color: "#0ea5e9", bg: "#e0f2fe", delta: "+5 today", up: true },
            { label: "Ward Requests", value: "12", icon: <FaHospitalUser />, color: "#f59e0b", bg: "#fef3c7", delta: "3 urgent", up: false },
            { label: "Emergency Medicine Requests", value: "4", icon: <FaBell />, color: "#ef4444", bg: "#fee2e2", delta: "Immediate action", up: false },
            { label: "IP Patients", value: "120", icon: <FaUserInjured />, color: "#8b5cf6", bg: "#ede9fe", delta: "Stable", up: true },
            { label: "Medicine Inventory", value: "5,432", icon: <FaBoxes />, color: "#0d9488", bg: "#ccfbf1", delta: "Healthy", up: true },
            { label: "Today's Dispensed Medicines", value: "89", icon: <FaCheckCircle />, color: "#10b981", bg: "#d1fae5", delta: "+15% vs yesterday", up: true },
          ],
          table1Title: "Hospital Prescriptions",
          table1Icon: <FaFilePrescription />,
          table1Data: [
            { id: "HP-RX-001", patient: "Ramesh Iyer", doctor: "Dr. A. Menon", items: 4, status: "Pending" },
            { id: "HP-RX-002", patient: "Sneha Patil", doctor: "Dr. S. Kulkarni", items: 2, status: "Dispensed" },
            { id: "HP-RX-003", patient: "Amitabh C.", doctor: "Dr. P. Sharma", items: 5, status: "On Hold" },
          ],
          table2Title: "Ward Requests",
          table2Icon: <FaHospitalUser />,
          table2Data: [
            { id: "WR-101", ward: "ICU A", requester: "Nurse Anjali", items: "Adrenaline, Saline", status: "Processing" },
            { id: "WR-102", ward: "General B", requester: "Nurse David", items: "Paracetamol, Bandages", status: "Delivered" },
            { id: "WR-103", ward: "Pediatrics", requester: "Nurse Sunita", items: "Cough Syrup, Inhalers", status: "Pending" },
          ],
          table2Headers: ["Request ID", "Ward", "Requester", "Items", "Status"],
          table2Cols: (row) => (
            <>
              <td><span className="ph-id-badge">{row.id}</span></td>
              <td><span className="ph-name">{row.ward}</span></td>
              <td>{row.requester}</td>
              <td>{row.items}</td>
              <td><StatusPill status={row.status} /></td>
            </>
          )
        };
      case "Wholesale":
        return {
          title: "Good Morning, Medico Wholesale Distributors 👋",
          kpiCards: [
            { label: "Retail Orders", value: "24", icon: <FaShoppingCart />, color: "#0ea5e9", bg: "#e0f2fe", delta: "+8 today", up: true },
            { label: "Hospital Orders", value: "7", icon: <FaHospital />, color: "#8b5cf6", bg: "#ede9fe", delta: "+2 today", up: true },
            { label: "Inventory", value: "1,24,500", icon: <FaBoxes />, color: "#0d9488", bg: "#ccfbf1", delta: "Optimized", up: true },
            { label: "Dispatch", value: "14", icon: <FaTruckLoading />, color: "#f59e0b", bg: "#fef3c7", delta: "Processing", up: true },
            { label: "Pending Deliveries", value: "5", icon: <FaTruck />, color: "#ef4444", bg: "#fee2e2", delta: "In transit", up: false },
            { label: "Revenue", value: "₹4,50,000", icon: <FaFileInvoiceDollar />, color: "#10b981", bg: "#d1fae5", delta: "+₹25K", up: true },
          ],
          table1Title: "Retail Orders",
          table1Icon: <FaShoppingCart />,
          table1Data: [
            { id: "RO-5001", patient: "MediCare Pharmacy", amount: "₹45,000", items: 200, status: "Processing" },
            { id: "RO-5002", patient: "City Health Pharma", amount: "₹12,500", items: 50, status: "Shipped" },
            { id: "RO-5003", patient: "Apollo Pharmacy", amount: "₹38,000", items: 150, status: "Delivered" },
          ],
          table2Title: "Hospital Orders",
          table2Icon: <FaHospital />,
          table2Data: [
            { id: "HO-901", hospital: "Fortis Hospital", amount: "₹1,20,000", status: "Approved" },
            { id: "HO-902", hospital: "Max Super Speciality", amount: "₹85,000", status: "Processing" },
            { id: "HO-903", hospital: "Apollo Hospital", amount: "₹2,50,000", status: "Delivered" },
          ],
          table2Headers: ["Order ID", "Hospital", "Amount", "Status"],
          table2Cols: (row) => (
            <>
              <td><span className="ph-id-badge">{row.id}</span></td>
              <td><span className="ph-name">{row.hospital}</span></td>
              <td><strong>{row.amount}</strong></td>
              <td><StatusPill status={row.status} /></td>
            </>
          )
        };
      case "Retail":
      default:
        return {
          title: "Good Morning, MediCare Pharmacy 👋",
          kpiCards: [
            { label: "Pending Prescriptions", value: "14", icon: <FaFilePrescription />, color: "#0ea5e9", bg: "#e0f2fe", delta: "+3 today", up: true },
            { label: "Medicine Inventory", value: "1,248", icon: <FaBoxes />, color: "#0d9488", bg: "#ccfbf1", delta: "12 low stock", up: false },
            { label: "Orders", value: "38", icon: <FaShoppingCart />, color: "#6366f1", bg: "#ede9fe", delta: "+7 vs yesterday", up: true },
            { label: "Revenue", value: "₹18,400", icon: <FaFileInvoiceDollar />, color: "#f59e0b", bg: "#fef3c7", delta: "+₹2,100", up: true },
          ],
          table1Title: "Recent Prescriptions",
          table1Icon: <FaFilePrescription />,
          table1Data: [
            { id: "RX-001", patient: "Aarav Sharma", doctor: "Dr. Priya Mehta", items: 3, status: "Pending" },
            { id: "RX-002", patient: "Sunita Rao", doctor: "Dr. Anil Kumar", items: 5, status: "Dispensed" },
            { id: "RX-003", patient: "Rohan Verma", doctor: "Dr. Sara Thomas", items: 2, status: "Pending" },
          ],
          table2Title: "Recent Orders",
          table2Icon: <FaShoppingCart />,
          table2Data: [
            { id: "ORD-441", patient: "Anita Singh", type: "Home Delivery", amount: "₹640", status: "Delivered" },
            { id: "ORD-442", patient: "Mohan Das", type: "Pickup", amount: "₹1,200", status: "Processing" },
            { id: "ORD-443", patient: "Priya Patel", type: "Home Delivery", amount: "₹380", status: "Shipped" },
          ],
          table2Headers: ["Order ID", "Patient", "Type", "Amount", "Status"],
          table2Cols: (row) => (
            <>
              <td><span className="ph-id-badge">{row.id}</span></td>
              <td><span className="ph-name">{row.patient}</span></td>
              <td>{row.type}</td>
              <td><strong>{row.amount}</strong></td>
              <td><StatusPill status={row.status} /></td>
            </>
          ),
          showLowStock: true,
          lowStockItems: [
            { name: "Paracetamol 500mg", qty: 18, threshold: 50 },
            { name: "Amoxicillin 250mg", qty: 9, threshold: 30 },
            { name: "Metformin 500mg", qty: 22, threshold: 40 },
          ]
        };
    }
  };

  const data = getDashboardData();

  return (
    <div className="ph-dashboard">
      {/* Welcome Banner */}
      <div className="ph-welcome-banner">
        <div className="ph-welcome-text">
          <h2>{data.title}</h2>
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
        {data.kpiCards.map((k) => (
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

      {/* Two-column grid for Table 1 and Low Stock (if Retail) / or just grids */}
      <div className="ph-grid-2">
        {/* Table 1 */}
        <div className="ph-card">
          <div className="ph-card-header">
            <h3 className="ph-card-title">{data.table1Icon} {data.table1Title}</h3>
            <NavLink to="/pharmacy/prescriptions" className="ph-link-sm">View All</NavLink>
          </div>
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{pharmacyType === 'Wholesale' ? 'Pharmacy' : 'Patient'}</th>
                  {pharmacyType !== 'Wholesale' && <th>Doctor</th>}
                  {pharmacyType === 'Wholesale' && <th>Amount</th>}
                  <th>Items</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.table1Data.map((row) => (
                  <tr key={row.id}>
                    <td><span className="ph-id-badge">{row.id}</span></td>
                    <td><span className="ph-name">{row.patient}</span></td>
                    {pharmacyType !== 'Wholesale' && <td>{row.doctor}</td>}
                    {pharmacyType === 'Wholesale' && <td><strong>{row.amount}</strong></td>}
                    <td>{row.items}</td>
                    <td><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert (Retail only) OR Table 2 (Hospital/Wholesale) */}
        {data.showLowStock ? (
          <div className="ph-card">
            <div className="ph-card-header">
              <h3 className="ph-card-title"><FaExclamationTriangle className="ph-warn-icon" /> Low Stock Alert</h3>
              <NavLink to="/pharmacy/inventory" className="ph-link-sm">Manage</NavLink>
            </div>
            <div className="ph-low-stock-list">
              {data.lowStockItems.map((item) => {
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
        ) : (
          <div className="ph-card">
            <div className="ph-card-header">
              <h3 className="ph-card-title">{data.table2Icon} {data.table2Title}</h3>
              <NavLink to="/pharmacy/orders" className="ph-link-sm">View All</NavLink>
            </div>
            <div className="ph-table-wrap">
              <table className="ph-table">
                <thead>
                  <tr>
                    {data.table2Headers.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.table2Data.map((row) => (
                    <tr key={row.id}>
                      {data.table2Cols(row)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Table 2 for Retail */}
      {data.showLowStock && (
        <div className="ph-card">
          <div className="ph-card-header">
            <h3 className="ph-card-title">{data.table2Icon} {data.table2Title}</h3>
            <NavLink to="/pharmacy/orders" className="ph-link-sm">View All</NavLink>
          </div>
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  {data.table2Headers.map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.table2Data.map((row) => (
                  <tr key={row.id}>
                    {data.table2Cols(row)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
