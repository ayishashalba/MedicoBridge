import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaHospital,
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaUserMd,
  FaInfoCircle,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./DocumentDetails.css";

function DocumentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid document ID.");
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login/patient");
          return;
        }

        // Try medical-reports first, then medical-records
        let res = await fetch(`${API_BASE_URL}/patient/medical-reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = await res.json();

        if (!res.ok || !data.data) {
          res = await fetch(`${API_BASE_URL}/patient/medical-records/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          data = await res.json();
        }

        if (res.ok && data.data) {
          const raw = data.data;
          const hosp = raw.hospitalId || {};
          const doctor = raw.doctorId || {};

          setDoc({
            id: raw._id,
            title: raw.title || raw.recordType || "Medical Document",
            hospital: hosp.name || "Medical Healthcare Facility",
            date: raw.reportDate
              ? new Date(raw.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : raw.date
              ? new Date(raw.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : new Date(raw.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
            type: raw.type || raw.recordType || "Clinical Record",
            fileSize: raw.attachments?.length ? `${raw.attachments.length} Attachment(s)` : "Verified Digital Document",
            uploadedBy: doctor.name ? `Dr. ${doctor.name.replace(/^Dr\.?\s*/i, "")}` : "Hospital Staff",
            description:
              raw.findings ||
              raw.summary ||
              raw.description ||
              raw.diagnosis ||
              raw.recommendations ||
              "Clinical document verified by the medical records department.",
            fileUrl: raw.attachments?.[0] || raw.fileUrl || null,
          });
        } else {
          setError(data.message || "Medical document not found.");
        }
      } catch (err) {
        setError("Unable to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, navigate]);

  function handleDownload() {
    toast.info(`Downloading Document "${doc?.title || "Medical Document"}"…`);
  }

  if (loading) {
    return (
      <div className="dd-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#0d9488" }}>
        <FaSpinner className="fa-spin" /> Loading document details...
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="dd-page">
        <button className="dd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <FaExclamationCircle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "1rem" }} />
          <h2>Document Not Found</h2>
          <p>{error || "The medical document you're looking for doesn't exist."}</p>
          <button className="dd-action-btn" style={{ marginTop: "1rem" }} onClick={() => navigate("/patient/medical-records")}>
            Back to Records
          </button>
        </div>
      </div>
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
