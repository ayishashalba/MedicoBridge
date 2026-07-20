import React from "react";
import {
  FaArrowLeft,
  FaHospital,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaUserMd,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./DocumentDetails.css";

/* ── Mock Data ── */
const medicalDocuments = [
  {
    id: "doc-1",
    title: "Chest X-Ray",
    hospital: "Apollo Hospital, Kochi",
    date: "15 June 2026",
    type: "X-Ray",
    fileSize: "2.4 MB",
    uploadedBy: "Dr. Sarah Johnson",
    description:
      "Chest X-Ray (PA view) — Normal study. No significant abnormality detected in lungs, heart size, or mediastinum.",
  },
  {
    id: "doc-2",
    title: "MRI Brain Scan",
    hospital: "Lakeshore Hospital, Ernakulam",
    date: "02 June 2026",
    type: "MRI",
    fileSize: "18.7 MB",
    uploadedBy: "Dr. Emily Wilson",
    description:
      "MRI Brain with contrast — No structural abnormality. No evidence of acute infarct, hemorrhage, or space-occupying lesion.",
  },
  {
    id: "doc-3",
    title: "ECG Report",
    hospital: "Aster Clinic, Kochi",
    date: "28 May 2026",
    type: "ECG",
    fileSize: "1.1 MB",
    uploadedBy: "Dr. Sarah Johnson",
    description:
      "12-lead ECG — Normal sinus rhythm. No ST-T changes or arrhythmia detected. Heart rate is stable at 72 bpm.",
  },
];

function DocumentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const doc = medicalDocuments.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="dd-page">
        <button className="dd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="dd-not-found">
          <h2>Document Not Found</h2>
          <p>The medical document you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  function handleDownload() {
    alert(
      `Downloading Document "${doc.title}"…\n\n(This is a demo — no actual file is generated.)`
    );
  }

  return (
    <div className="dd-page">
      {/* Back */}
      <button
        className="dd-back-btn"
        onClick={() => navigate("/patient/medical-records")}
      >
        <FaArrowLeft /> Back to Records
      </button>

      {/* Header */}
      <div className="dd-header">
        <div className="dd-header-left">
          <div className="dd-header-icon">
            <FaFileAlt />
          </div>
          <div>
            <h1 className="dd-title">Medical Document</h1>
            <p className="dd-subtitle">
              {doc.title} • {doc.date}
            </p>
          </div>
        </div>
        <button className="dd-download-btn" onClick={handleDownload}>
          <FaDownload /> Download Document
        </button>
      </div>

      {/* Document Information Card */}
      <div className="dd-document-card">
        <div className="dd-document-card-top">
          <div className="dd-hospital-logo">
            <FaHospital />
          </div>
          <div className="dd-hospital-info">
            <h3>{doc.hospital}</h3>
            <p>Medical Records Department</p>
          </div>
          <div className="dd-type-badge">{doc.type}</div>
        </div>
        <div className="dd-document-divider"></div>
        <div className="dd-meta-grid">
          <div className="dd-meta-item">
            <span className="dd-meta-label">Document Title</span>
            <span className="dd-meta-value">{doc.title}</span>
          </div>
          <div className="dd-meta-item">
            <span className="dd-meta-label">Document Type</span>
            <span className="dd-meta-value">{doc.type}</span>
          </div>
          <div className="dd-meta-item">
            <span className="dd-meta-label">Upload Date</span>
            <span className="dd-meta-value">
              <FaCalendarAlt /> {doc.date}
            </span>
          </div>
          <div className="dd-meta-item">
            <span className="dd-meta-label">File Size</span>
            <span className="dd-meta-value">{doc.fileSize}</span>
          </div>
          <div className="dd-meta-item">
            <span className="dd-meta-label">Uploaded By</span>
            <span className="dd-meta-value">
              <FaUserMd /> {doc.uploadedBy}
            </span>
          </div>
        </div>
      </div>

      {/* Description / Summary */}
      <div className="dd-section-card">
        <div className="dd-section-label">
          <FaInfoCircle className="dd-label-icon" /> Description & Clinical Findings
        </div>
        <p className="dd-description-text">{doc.description}</p>
      </div>

      {/* Preview Section */}
      <div className="dd-section-card">
        <div className="dd-section-label">
          <FaFileAlt className="dd-label-icon" /> Document Preview
        </div>
        <div className="dd-preview-placeholder">
          <FaFileAlt className="dd-preview-placeholder-icon" />
          <h4>Preview Not Available</h4>
          <p>
            For security reasons, please download the document to view the full
            high-resolution file.
          </p>
          <button className="dd-preview-download-btn" onClick={handleDownload}>
            <FaDownload /> Download {doc.title}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="dd-actions-bar">
        <button
          className="dd-action-btn dd-action-btn--secondary"
          onClick={() => navigate("/patient/medical-records")}
        >
          <FaArrowLeft /> Back to Records
        </button>
        <button className="dd-action-btn" onClick={handleDownload}>
          <FaDownload /> Download PDF
        </button>
      </div>
    </div>
  );
}

export default DocumentDetails;
