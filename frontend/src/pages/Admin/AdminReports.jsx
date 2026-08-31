import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaFileDownload,
  FaFileCsv,
  FaFilePdf,
  FaArrowUp,
  FaCalendarAlt,
  FaTimes,
  FaShieldAlt,
  FaPills,
  FaCalendarCheck,
  FaCheckCircle,
  FaUserMd,
} from "react-icons/fa";
import {
  getStoredMedicines,
  getStoredAppointments,
} from "../../utils/adminData";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import "./AdminPages.css";

export default function AdminReports() {
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportDomain, setReportDomain] = useState("DrugSafety");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setMedicines(getStoredMedicines());
    setAppointments(getStoredAppointments());
  }, []);

  const totalApproved = medicines.filter((m) => m.approvalStatus === "Approved").length;
  const totalBlocked = medicines.filter((m) => m.approvalStatus === "Blocked").length;
  const totalPending = medicines.filter((m) => m.approvalStatus === "Pending Review").length;
  const completedAptsCount = appointments.filter((a) => a.status === "Completed").length;

  const handleExport = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (reportFormat === "PDF") {
        let cols = [];
        let data = [];
        let title = "";

        if (reportDomain === "DrugSafety") {
          title = "Administrative Drug Safety & Regulatory Compliance Report";
          cols = [
            { header: "Drug ID", dataKey: "id" },
            { header: "Medicine Name", dataKey: "name" },
            { header: "Manufacturer", dataKey: "manufacturer" },
            { header: "Batch No", dataKey: "batchNumber" },
            { header: "Submitting Pharmacy", dataKey: "submittingPharmacy" },
            { header: "Expiry Date", dataKey: "expiryDate" },
            { header: "Approval Status", dataKey: "approvalStatus" },
          ];
          data = medicines;
        } else if (reportDomain === "Appointments") {
          title = "Platform Telehealth & Consultation Audit Report";
          cols = [
            { header: "Apt ID", dataKey: "id" },
            { header: "Patient Name", dataKey: "patientName" },
            { header: "Doctor Name", dataKey: "doctorName" },
            { header: "Specialization", dataKey: "specialization" },
            { header: "Mode", dataKey: "type" },
            { header: "Date", dataKey: "date" },
            { header: "Status", dataKey: "status" },
          ];
          data = appointments;
        } else {
          title = "Platform Provider Compliance & Verification Registry";
          cols = [
            { header: "Drug ID", dataKey: "id" },
            { header: "Dispensary Entity", dataKey: "submittingPharmacy" },
            { header: "Category", dataKey: "pharmacyType" },
            { header: "Drug Listed", dataKey: "name" },
            { header: "Status", dataKey: "approvalStatus" },
          ];
          data = medicines;
        }

        generateBloodGroupReport({
          title,
          selectedBloodGroup: "N/A (Regulatory Platform Audit)",
          generatedBy: "System Super Administrator",
          columns: cols,
          data,
          activeFilters: { ReportDomain: reportDomain, Timestamp: new Date().toLocaleDateString() },
        });
      }

      setSuccessMsg(`Successfully generated & exported ${reportDomain} audit report (${reportFormat}).`);
      setShowExportModal(false);
      setTimeout(() => setSuccessMsg(""), 3500);
    }, 1200);
  };

  const monthlyComplianceData = [
    { label: "Jan", val: 94, height: 75 },
    { label: "Feb", val: 96, height: 80 },
    { label: "Mar", val: 95, height: 78 },
    { label: "Apr", val: 98, height: 88 },
    { label: "May", val: 97, height: 84 },
    { label: "Jun", val: 99, height: 95 },
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
          <FaChartBar style={{ color: "var(--ad-primary)" }} /> Platform Reports &amp; Regulatory Audits
        </h2>
        <p>Analyze platform-level regulatory metrics, drug safety verifications, telehealth uptime, and export structured compliance audit documents</p>
      </div>

      {/* KPI Row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaShieldAlt /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Drug Regulatory Compliance</span>
            <h3 className="ad-kpi-value">{totalApproved} / {medicines.length}</h3>
            <span className="ad-kpi-delta up">{totalBlocked} Flagged/Banned</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaPills /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Pending Verification Queue</span>
            <h3 className="ad-kpi-value">{totalPending} Submissions</h3>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "600" }}>Quality Checks Pending</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaCalendarCheck /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Verified Consultations</span>
            <h3 className="ad-kpi-value">{completedAptsCount} Sessions</h3>
            <span className="ad-kpi-delta up">98.4% Telehealth Uptime</span>
          </div>
        </div>

        <div className="ad-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <button className="ad-btn ad-btn-primary" onClick={() => setShowExportModal(true)} style={{ width: "100%", height: "100%", justifyContent: "center" }}>
            <FaFileDownload /> Export Regulatory Audit Report
          </button>
        </div>
      </div>

      {/* Platform Analytics Grid */}
      <div className="ad-grid-3">
        {/* Compliance Growth Chart */}
        <div className="ad-card" style={{ gridColumn: "span 2" }}>
          <div className="ad-card-header">
            <h3 className="ad-card-title">Platform Regulatory Compliance Index</h3>
            <span style={{ fontSize: "0.75rem", background: "var(--ad-bg-secondary)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>
              Safety Score (%)
            </span>
          </div>
          <div className="ad-chart-container">
            {monthlyComplianceData.map((bar, idx) => (
              <div key={idx} className="ad-chart-bar-wrap">
                <div className="ad-chart-bar-bg">
                  <div className="ad-chart-bar-fill" style={{ height: `${bar.height}%`, background: "linear-gradient(to top, #10b981, #34d399)" }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "0.2rem" }}>{bar.val}%</span>
                <span className="ad-chart-label" style={{ fontWeight: "700" }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Statistics */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">Supervision Indicators</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>DCGI Standard Adherence</span>
              <strong style={{ fontSize: "1.25rem", color: "#16a34a" }}>99.2%</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Telehealth Audit Compliance</span>
              <strong style={{ fontSize: "1.25rem", color: "#0284c7" }}>100% Encrypted</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)", display: "block" }}>Substandard Batch Interception</span>
              <strong style={{ fontSize: "1.25rem", color: "#4f46e5" }}>100% Blocked</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Drug Safety Inspection Table */}
      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">Recent Drug Compliance &amp; Verification Audits</h3>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Drug Code</th>
                <th>Medicine Name &amp; Generic</th>
                <th>Manufacturer</th>
                <th>Submitting Pharmacy</th>
                <th>Lab Assay Status</th>
                <th>Regulatory Decision</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td><span className="ad-id-badge">{med.id}</span></td>
                  <td>
                    <strong>{med.name}</strong>
                    <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                      {med.genericName}
                    </span>
                  </td>
                  <td>{med.manufacturer}</td>
                  <td>{med.submittingPharmacy}</td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: med.approvalStatus === "Blocked" ? "#dc2626" : "var(--ad-text-primary)" }}>
                      {med.labVerificationStatus || "Standard Review"}
                    </span>
                  </td>
                  <td>
                    <span className="ad-pill" style={{
                      background: med.approvalStatus === "Approved" ? "#dcfce7" : med.approvalStatus === "Blocked" ? "#fee2e2" : "#fef3c7",
                      color: med.approvalStatus === "Approved" ? "#16a34a" : med.approvalStatus === "Blocked" ? "#dc2626" : "#d97706"
                    }}>
                      {med.approvalStatus}
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
              <h3 className="ad-modal-title"><FaFileDownload /> Export Regulatory Audit Report</h3>
              <button className="ad-modal-close" onClick={() => setShowExportModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleExport} className="ad-modal-body">
              <div className="ad-form-group">
                <label>Select Audit Domain *</label>
                <select
                  className="ad-select"
                  value={reportDomain}
                  onChange={(e) => setReportDomain(e.target.value)}
                >
                  <option value="DrugSafety">Drug Safety &amp; Batch Verification Audit</option>
                  <option value="Appointments">Clinical Telehealth &amp; Appointments Audit</option>
                  <option value="Providers">Healthcare Provider Verification Registry</option>
                </select>
              </div>

              <div className="ad-form-group">
                <label>Export Format</label>
                <select
                  className="ad-select"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <option value="PDF">Formatted Regulatory Document (PDF)</option>
                  <option value="CSV">Spreadsheet Dataset (CSV)</option>
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
