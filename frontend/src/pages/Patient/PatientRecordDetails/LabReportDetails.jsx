import React, { useState, useEffect } from "react";
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
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./LabReportDetails.css";

function LabReportDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid lab report ID.");
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login/patient");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/patient/lab-reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.data) {
          const raw = data.data;
          const patient = raw.patientId || {};
          const doc = raw.doctorId || {};
          const hosp = raw.hospitalId || {};

          let calculatedAge = "—";
          if (patient.dob) {
            const ageDiff = Date.now() - new Date(patient.dob).getTime();
            calculatedAge = `${Math.abs(new Date(ageDiff).getUTCFullYear() - 1970)} Years`;
          }

          setReport({
            id: raw._id,
            test: raw.testName || "Diagnostic Lab Report",
            hospital: hosp.name || "Pathology & Diagnostics Laboratory",
            orderedBy: doc.name ? `Dr. ${doc.name.replace(/^Dr\.?\s*/i, "")}` : "Attending Physician",
            specialization: doc.specialization || raw.category || "General Pathology",
            date: raw.reportDate
              ? new Date(raw.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
            status: raw.status || "Completed",
            referenceId: raw.reportId || raw._id,
            patientName: patient.name || "Patient",
            patientAge: calculatedAge,
            patientGender: patient.gender || "—",
            sampleType: raw.sampleType || "Venous Blood",
            sampleCollected: raw.sampleCollectedDate
              ? new Date(raw.sampleCollectedDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Standard collection",
            reportGenerated: raw.reportDate
              ? new Date(raw.reportDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Completed",
            results: (raw.results || []).map((r) => ({
              parameter: r.parameter || "Parameter",
              value: r.unit ? `${r.value} ${r.unit}` : r.value || "—",
              normalRange: r.referenceRange || r.normalRange || "Standard range",
              status: r.status || "Normal",
            })),
            interpretation:
              raw.remarks ||
              raw.notes ||
              "All reported values have been verified and processed by the laboratory. Please consult your physician for clinical correlation.",
          });
        } else {
          setError(data.message || "Lab report not found.");
        }
      } catch (err) {
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  function handleDownload() {
    toast.info(`Downloading PDF for "${report?.test || "Lab Report"}"…`);
  }

  if (loading) {
    return (
      <div className="lr-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#0d9488" }}>
        <FaSpinner className="fa-spin" /> Loading lab report details...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="lr-page">
        <button className="lr-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <FaExclamationCircle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "1rem" }} />
          <h2>Lab Report Not Found</h2>
          <p>{error || "The lab report you're looking for doesn't exist."}</p>
          <button className="lr-action-btn" style={{ marginTop: "1rem" }} onClick={() => navigate("/patient/medical-records")}>
            Back to Records
          </button>
        </div>
      </div>
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
