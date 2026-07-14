import React, { useState } from "react";
import { FaChartBar, FaFileDownload, FaFileCsv, FaFilePdf, FaArrowUp, FaCalendarAlt, FaTimes } from "react-icons/fa";
import "./AdminPages.css";

const revenueLogs = [
  { ref: "TXN-88419", entity: "Dr. Priya Mehta", desc: "Subscription Fee", date: "15 Jul 2026", amount: "₹2,500", status: "Paid" },
  { ref: "TXN-88420", entity: "Aarav Sharma", desc: "Consultation Commission", date: "15 Jul 2026", amount: "₹180", status: "Paid" },
  { ref: "TXN-88421", entity: "MediCare Pharmacy", desc: "Order Platform Fee", date: "14 Jul 2026", amount: "₹640", status: "Paid" },
  { ref: "TXN-88422", entity: "St. Stephens Clinic", desc: "Portal Integration Fee", date: "13 Jul 2026", amount: "₹12,000", status: "Paid" },
  { ref: "TXN-88423", entity: "Apex Heart Clinic", desc: "Portal Integration Fee", date: "12 Jul 2026", amount: "₹12,000", status: "Paid" },
];

export default function AdminReports() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportType, setReportType] = useState("Finance");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Simulate file generation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowExportModal(false);
      }, 1500);
    }, 1800);
  };

  // SVG Chart Height Metrics
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
      <div className="ad-page-header">
        <p>Analyze transaction history, verify cash flow audits, and export statistical datasets</p>
      </div>

      {/* KPI row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaArrowUp /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Gross Margin</span>
            <h3 className="ad-kpi-value">₹1,58,400</h3>
            <span className="ad-kpi-delta up">+18% vs last quarter</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaChartBar /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active Subscriptions</span>
            <h3 className="ad-kpi-value">124</h3>
            <span className="ad-kpi-delta up">+6 new this week</span>
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
            <h3 className="ad-card-title">Earnings Distribution Chart</h3>
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
                <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "0.2rem" }}>{bar.rev.toLocaleString("en-IN")}</span>
                <span className="ad-chart-label" style={{ fontWeight: "700" }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement Stats */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Engagement Statistics</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Consultation Success Rate</span>
              <strong style={{ fontSize: "1.25rem" }}>97.8%</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Avg Appointment Duration</span>
              <strong style={{ fontSize: "1.25rem" }}>18.4 mins</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Patient Feedback Score</span>
              <strong style={{ fontSize: "1.25rem" }}>4.85 / 5.00</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Recent Transactions</h3>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Txn Reference</th>
                <th>Subscriber / Client</th>
                <th>Description</th>
                <th>Date Paid</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revenueLogs.map((log) => (
                <tr key={log.ref}>
                  <td><span className="ad-id-badge">{log.ref}</span></td>
                  <td><strong>{log.entity}</strong></td>
                  <td>{log.desc}</td>
                  <td>{log.date}</td>
                  <td><strong>{log.amount}</strong></td>
                  <td>
                    <span className="ad-pill" style={{ background: "#dcfce7", color: "#15803d" }}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="ad-modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>Generate & Export Dataset</h3>
              <button className="ad-modal-close" onClick={() => setShowExportModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleExport}>
              <div className="ad-modal-body">
                {success ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#16a34a" }}>
                    <FaFilePdf style={{ fontSize: "3rem", marginBottom: "1rem" }} />
                    <h4>File Export Initiated!</h4>
                    <p style={{ color: "var(--ad-text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                      Your download will start automatically in a moment.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="ad-form-group">
                      <label htmlFor="reportType">Report Content</label>
                      <select
                        id="reportType"
                        className="ad-select"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="Finance">Financial Audits & Revenue Split</option>
                        <option value="Users">User Registrations and Growth stats</option>
                        <option value="Apts">Appointments & Clinic Performance logs</option>
                      </select>
                    </div>

                    <div className="ad-form-group">
                      <label htmlFor="reportFormat">Export File Format</label>
                      <select
                        id="reportFormat"
                        className="ad-select"
                        value={reportFormat}
                        onChange={(e) => setReportFormat(e.target.value)}
                      >
                        <option value="PDF">Adobe PDF (.pdf)</option>
                        <option value="CSV">Comma Separated Values (.csv)</option>
                        <option value="XLS">Excel Sheet (.xlsx)</option>
                      </select>
                    </div>

                    <div className="ad-form-group">
                      <label htmlFor="reportRange">Date Duration</label>
                      <div style={{ position: "relative" }}>
                        <FaCalendarAlt style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <select
                          id="reportRange"
                          className="ad-select"
                          style={{ paddingLeft: "35px" }}
                        >
                          <option>Last 30 Days (Current Month)</option>
                          <option>Last Quarter (90 Days)</option>
                          <option>Year to Date (YTD)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="ad-modal-footer">
                {!success && (
                  <>
                    <button type="submit" className="ad-btn ad-btn-primary" disabled={loading}>
                      {loading ? "Generating Report..." : "Build Export"}
                    </button>
                    <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowExportModal(false)} disabled={loading}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
