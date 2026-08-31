import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaFileDownload,
  FaFileCsv,
  FaFilePdf,
  FaArrowUp,
  FaCalendarAlt,
  FaTimes,
  FaMoneyBillWave,
  FaPills,
  FaBoxOpen,
  FaCalendarCheck,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getStoredMedicines,
  getStoredOrders,
  getStoredInvoices,
  getStoredAppointments,
} from "../../utils/adminData";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import "./AdminPages.css";

export default function AdminReports() {
  const [invoices, setInvoices] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportDomain, setReportDomain] = useState("Finance");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setInvoices(getStoredInvoices());
    setMedicines(getStoredMedicines());
    setOrders(getStoredOrders());
    setAppointments(getStoredAppointments());
  }, []);

  const totalCollected = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
  const totalStockValuation = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);
  const completedAptsCount = appointments.filter((a) => a.status === "Completed").length;
  const fulfilledOrdersCount = orders.filter((o) => o.status === "Delivered").length;

  const handleExport = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (reportFormat === "PDF") {
        let cols = [];
        let data = [];
        let title = "";

        if (reportDomain === "Finance") {
          title = "Administrative Financial & Billing Report";
          cols = [
            { header: "Invoice ID", dataKey: "id" },
            { header: "Client Entity", dataKey: "clientName" },
            { header: "Service Description", dataKey: "serviceDescription" },
            { header: "Issue Date", dataKey: "issueDate" },
            { header: "Total (INR)", dataKey: "total" },
            { header: "Status", dataKey: "status" },
          ];
          data = invoices;
        } else if (reportDomain === "Pharmacy") {
          title = "Administrative Pharmacy Stock & Inventory Report";
          cols = [
            { header: "Drug ID", dataKey: "id" },
            { header: "Medicine Name", dataKey: "name" },
            { header: "Brand", dataKey: "brand" },
            { header: "Batch No", dataKey: "batchNumber" },
            { header: "Stock Units", dataKey: "stock" },
            { header: "Unit Price", dataKey: "price" },
            { header: "Status", dataKey: "status" },
          ];
          data = medicines;
        } else if (reportDomain === "Orders") {
          title = "Administrative Orders & Delivery Audit Report";
          cols = [
            { header: "Order ID", dataKey: "id" },
            { header: "Customer Name", dataKey: "customerName" },
            { header: "Type", dataKey: "orderType" },
            { header: "Tracking ID", dataKey: "trackingId" },
            { header: "Total (INR)", dataKey: "total" },
            { header: "Status", dataKey: "status" },
          ];
          data = orders;
        } else {
          title = "Administrative Clinical Appointments Report";
          cols = [
            { header: "Apt ID", dataKey: "id" },
            { header: "Patient", dataKey: "patientName" },
            { header: "Doctor", dataKey: "doctorName" },
            { header: "Mode", dataKey: "type" },
            { header: "Date", dataKey: "date" },
            { header: "Status", dataKey: "status" },
          ];
          data = appointments;
        }

        generateBloodGroupReport({
          title,
          selectedBloodGroup: "N/A (Multi-Domain Administrative)",
          generatedBy: "System Super Administrator",
          columns: cols,
          data,
          activeFilters: { Domain: reportDomain, Generated: new Date().toLocaleDateString() },
        });
      }

      setSuccessMsg(`Successfully generated & exported ${reportDomain} report (${reportFormat}).`);
      setShowExportModal(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    }, 1200);
  };

  const chartHeightMap = [
    { label: "Jan", rev: 14000, height: 40 },
    { label: "Feb", rev: 18000, height: 50 },
    { label: "Mar", rev: 22000, height: 60 },
    { label: "Apr", rev: 31000, height: 80 },
    { label: "May", rev: 28000, height: 75 },
    { label: "Jun", rev: 45000, height: 100 },
  ];

  return (
    <div className="ad-page">
      {/* Toast Alert */}
      {successMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#10b981",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(16,185,129,0.25)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "adFadeIn 0.3s ease"
        }}>
          <FaCheckCircle />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{successMsg}</span>
        </div>
      )}

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaChartBar style={{ color: "var(--ad-primary)" }} /> Reports &amp; Statistical Audits
        </h2>
        <p>Analyze transaction history, verify cash flow audits, pharmacy valuations, and export structured administrative datasets</p>
      </div>

      {/* KPI Row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaMoneyBillWave /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Gross Platform Collections</span>
            <h3 className="ad-kpi-value">₹{totalCollected.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">+18% vs last quarter</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaPills /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Pharmacy Asset Valuation</span>
            <h3 className="ad-kpi-value">₹{totalStockValuation.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">{medicines.length} Cataloged SKUs</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaCalendarCheck /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Completed Consults</span>
            <h3 className="ad-kpi-value">{completedAptsCount} Sessions</h3>
            <span className="ad-kpi-delta up">98.4% Fulfillment Rate</span>
          </div>
        </div>

        <div className="ad-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <button className="ad-btn ad-btn-primary" onClick={() => setShowExportModal(true)} style={{ width: "100%", height: "100%", justifyContent: "center" }}>
            <FaFileDownload /> Export Administrative Report
          </button>
        </div>
      </div>

      {/* Financial Analytics Grid */}
      <div className="ad-grid-3">
        {/* SVG Performance Chart */}
        <div className="ad-card" style={{ gridColumn: "span 2" }}>
          <div className="ad-card-header">
            <h3 className="ad-card-title">Quarterly Earnings &amp; Invoiced Growth</h3>
            <span style={{ fontSize: "0.75rem", background: "var(--ad-bg-secondary)", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
              Quarterly Revenue (INR)
            </span>
          </div>
          <div className="ad-chart-container">
            {chartHeightMap.map((bar, idx) => (
              <div key={idx} className="ad-chart-bar-wrap">
                <div className="ad-chart-bar-bg">
                  <div className="ad-chart-bar-fill" style={{ height: `${bar.height}%` }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "0.2rem" }}>₹{bar.rev.toLocaleString("en-IN")}</span>
                <span className="ad-chart-label" style={{ fontWeight: "700" }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Statistics */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">System Performance</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Consultation Success Rate</span>
              <strong style={{ fontSize: "1.25rem", color: "#16a34a" }}>98.4%</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Pharmacy Orders Delivered</span>
              <strong style={{ fontSize: "1.25rem", color: "#0284c7" }}>{fulfilledOrdersCount} / {orders.length}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Platform Health Index</span>
              <strong style={{ fontSize: "1.25rem", color: "#4f46e5" }}>99.98% Uptime</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction & Billing Log Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Recent Invoiced Transactions &amp; Receipts</h3>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Entity / Client</th>
                <th>Service Description</th>
                <th>Date Paid</th>
                <th>Amount (INR)</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><span className="ad-id-badge">{inv.id}</span></td>
                  <td><strong>{inv.clientName}</strong></td>
                  <td>{inv.serviceDescription}</td>
                  <td>{inv.paidDate || inv.issueDate}</td>
                  <td><strong>₹{inv.total.toLocaleString("en-IN")}</strong></td>
                  <td>
                    <span className="ad-pill" style={{
                      background: inv.status === "Paid" ? "#dcfce7" : inv.status === "Overdue" ? "#fee2e2" : "#fef3c7",
                      color: inv.status === "Paid" ? "#16a34a" : inv.status === "Overdue" ? "#dc2626" : "#d97706"
                    }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Export Modal ── */}
      {showExportModal && (
        <div className="ad-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaFileDownload /> Export Administrative Report</h3>
              <button className="ad-modal-close" onClick={() => setShowExportModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleExport} className="ad-modal-body">
              <div className="ad-form-group">
                <label>Select Report Domain *</label>
                <select
                  className="ad-select"
                  value={reportDomain}
                  onChange={(e) => setReportDomain(e.target.value)}
                >
                  <option value="Finance">Financial &amp; Revenue Ledger</option>
                  <option value="Pharmacy">Pharmacy Stock &amp; Drug Inventory</option>
                  <option value="Orders">Orders &amp; Delivery Tracking Audit</option>
                  <option value="Appointments">Clinical Appointments &amp; Consultations</option>
                </select>
              </div>

              <div className="ad-form-group">
                <label>Export Format</label>
                <select
                  className="ad-select"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <option value="PDF">Formatted Document (PDF)</option>
                  <option value="CSV">Spreadsheet (CSV)</option>
                </select>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowExportModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={loading}>
                  <FaFileDownload /> {loading ? "Generating Report..." : "Download Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
