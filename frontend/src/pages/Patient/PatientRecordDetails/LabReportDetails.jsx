import React from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaFlask,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./LabReportDetails.css";

/* ── Mock Data ── */
const labReports = [
  {
    id: "lab-1",
    test: "Complete Blood Count (CBC)",
    hospital: "Apollo Hospital, Kochi",
    orderedBy: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    date: "18 June 2026",
    status: "Available",
    referenceId: "LAB-APL-2026-0487",
    patientName: "John Doe",
    patientAge: "32 Years",
    patientGender: "Male",
    sampleType: "Venous Blood",
    sampleCollected: "18 June 2026, 8:30 AM",
    reportGenerated: "18 June 2026, 4:00 PM",
    results: [
      {
        parameter: "Hemoglobin",
        value: "14.2 g/dL",
        normalRange: "13.0 – 17.0 g/dL",
        status: "Normal",
      },
      {
        parameter: "WBC Count",
        value: "7,500 /μL",
        normalRange: "4,500 – 11,000 /μL",
        status: "Normal",
      },
      {
        parameter: "RBC Count",
        value: "5.1 million/μL",
        normalRange: "4.5 – 5.5 million/μL",
        status: "Normal",
      },
      {
        parameter: "Platelet Count",
        value: "2,50,000 /μL",
        normalRange: "1,50,000 – 4,00,000 /μL",
        status: "Normal",
      },
      {
        parameter: "Hematocrit (PCV)",
        value: "42%",
        normalRange: "38.3 – 48.6%",
        status: "Normal",
      },
      {
        parameter: "MCV",
        value: "88 fL",
        normalRange: "80 – 100 fL",
        status: "Normal",
      },
    ],
    interpretation:
      "All values are within normal limits. No abnormalities detected. Complete blood count is satisfactory.",
  },
  {
    id: "lab-2",
    test: "Blood Sugar Test",
    hospital: "Aster Clinic, Kochi",
    orderedBy: "Dr. John Smith",
    specialization: "Dermatologist",
    date: "05 June 2026",
    status: "Available",
    referenceId: "LAB-AST-2026-0312",
    patientName: "John Doe",
    patientAge: "32 Years",
    patientGender: "Male",
    sampleType: "Venous Blood (Fasting)",
    sampleCollected: "05 June 2026, 7:00 AM",
    reportGenerated: "05 June 2026, 11:00 AM",
    results: [
      {
        parameter: "Fasting Blood Sugar",
        value: "98 mg/dL",
        normalRange: "70 – 100 mg/dL",
        status: "Normal",
      },
      {
        parameter: "Post-Prandial Sugar",
        value: "132 mg/dL",
        normalRange: "< 140 mg/dL",
        status: "Normal",
      },
      {
        parameter: "HbA1c",
        value: "5.4%",
        normalRange: "4.0 – 5.6%",
        status: "Normal",
      },
    ],
    interpretation:
      "Blood sugar levels are within normal range. No signs of diabetes or pre-diabetic condition. Maintain current diet and lifestyle.",
  },
];

function LabReportDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const report = labReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="lr-page">
        <button className="lr-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="lr-not-found">
          <h2>Lab Report Not Found</h2>
          <p>The lab report you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  function handleDownload() {
    alert(
      `Downloading PDF for "${report.test}"…\n\n(This is a demo — no actual file is generated.)`
    );
  }

  return (
    <div className="lr-page">
      {/* Back */}
      <button
        className="lr-back-btn"
        onClick={() => navigate("/patient/medical-records")}
      >
        <FaArrowLeft /> Back to Records
      </button>

      {/* Header */}
      <div className="lr-header">
        <div className="lr-header-left">
          <div className="lr-header-icon">
            <FaFlask />
          </div>
          <div>
            <h1 className="lr-title">Lab Report</h1>
            <p className="lr-subtitle">
              {report.test} • {report.date}
            </p>
          </div>
        </div>
        <button className="lr-download-btn" onClick={handleDownload}>
          <FaDownload /> Download PDF
        </button>
      </div>

      {/* Report Header */}
      <div className="lr-report-header">
        <div className="lr-report-header-top">
          <div className="lr-hospital-logo">
            <FaHospital />
          </div>
          <div className="lr-hospital-info">
            <h3>{report.hospital}</h3>
            <p>Pathology & Diagnostics Laboratory</p>
          </div>
          <div className="lr-ref-badge">
            <FaFileAlt /> {report.referenceId}
          </div>
        </div>
        <div className="lr-report-divider"></div>
        <div className="lr-meta-grid">
          <div className="lr-meta-item">
            <span className="lr-meta-label">Patient</span>
            <span className="lr-meta-value">{report.patientName}</span>
          </div>
          <div className="lr-meta-item">
            <span className="lr-meta-label">Age / Gender</span>
            <span className="lr-meta-value">
              {report.patientAge}, {report.patientGender}
            </span>
          </div>
          <div className="lr-meta-item">
            <span className="lr-meta-label">Ordered By</span>
            <span className="lr-meta-value">{report.orderedBy}</span>
          </div>
          <div className="lr-meta-item">
            <span className="lr-meta-label">Sample Type</span>
            <span className="lr-meta-value">{report.sampleType}</span>
          </div>
          <div className="lr-meta-item">
            <span className="lr-meta-label">Sample Collected</span>
            <span className="lr-meta-value">{report.sampleCollected}</span>
          </div>
          <div className="lr-meta-item">
            <span className="lr-meta-label">Report Generated</span>
            <span className="lr-meta-value">{report.reportGenerated}</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="lr-section-card">
        <div className="lr-section-label">
          <FaClipboardList className="lr-label-icon" /> Test Results
        </div>
        <div className="lr-results-table-wrapper">
          <table className="lr-results-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Normal Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r, i) => (
                <tr key={i}>
                  <td className="lr-param-name">{r.parameter}</td>
                  <td className="lr-param-value">{r.value}</td>
                  <td className="lr-param-range">{r.normalRange}</td>
                  <td>
                    <span
                      className={`lr-result-badge ${
                        r.status === "Normal"
                          ? "lr-result-badge--normal"
                          : r.status === "High"
                          ? "lr-result-badge--high"
                          : "lr-result-badge--low"
                      }`}
                    >
                      {r.status === "Normal" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaExclamationTriangle />
                      )}
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="lr-section-card">
        <div className="lr-section-label">
          <FaUserMd className="lr-label-icon" /> Doctor's Interpretation
        </div>
        <p className="lr-interpretation-text">{report.interpretation}</p>
      </div>

      {/* Actions */}
      <div className="lr-actions-bar">
        <button
          className="lr-action-btn lr-action-btn--secondary"
          onClick={() => navigate("/patient/medical-records")}
        >
          <FaArrowLeft /> Back to Records
        </button>
        <button className="lr-action-btn" onClick={handleDownload}>
          <FaDownload /> Download PDF
        </button>
      </div>
    </div>
  );
}

export default LabReportDetails;
