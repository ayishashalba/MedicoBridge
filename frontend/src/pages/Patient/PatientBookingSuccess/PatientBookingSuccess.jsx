import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaHome,
  FaCalendarCheck,
  FaPrint,
  FaIdCard,
  FaClock,
  FaVideo,
  FaHospital,
  FaClinicMedical,
  FaMapMarkerAlt,
  FaUser,
  FaMoneyBillWave,
  FaFileAlt,
  FaStar,
  FaStethoscope,
  FaFilePdf,
  FaFileImage,
  FaEye,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaTimes,
} from "react-icons/fa";
import "./PatientBookingSuccess.css";

/* ─── Report Preview Modal ────────────────────────────────────────── */
function ReportPreviewModal({ report, onClose }) {
  const [zoom, setZoom] = React.useState(1);

  if (!report) return null;

  const isPdf = report.type === "pdf" || (report.name && report.name.toLowerCase().endsWith(".pdf"));

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="rpm-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rpm-file-title">
      <div className="rpm-modal-card">
        {/* Modal Header */}
        <div className="rpm-modal-header">
          <div className="rpm-header-title">
            <div className={`rpm-type-icon rpm-type-icon--${isPdf ? "pdf" : "image"}`}>
              {isPdf ? <FaFilePdf /> : <FaFileImage />}
            </div>
            <div className="rpm-header-info">
              <h3 id="rpm-file-title" className="rpm-file-name" title={report.name}>{report.name}</h3>
              <p className="rpm-file-meta">
                <span className={`rpm-badge rpm-badge--${isPdf ? "pdf" : "image"}`}>
                  {report.fileTypeBadge || (isPdf ? "PDF Document" : "Medical Image")}
                </span>
                <span className="rpm-size">{report.size}</span>
              </p>
            </div>
          </div>

          <div className="rpm-header-actions">
            {!isPdf && (
              <div className="rpm-zoom-controls">
                <button type="button" className="rpm-btn-icon" onClick={handleZoomOut} title="Zoom Out (-)">
                  <FaSearchMinus />
                </button>
                <span className="rpm-zoom-text">{Math.round(zoom * 100)}%</span>
                <button type="button" className="rpm-btn-icon" onClick={handleZoomIn} title="Zoom In (+)">
                  <FaSearchPlus />
                </button>
                <button type="button" className="rpm-btn-text" onClick={handleResetZoom} title="Fit to Screen">
                  Fit
                </button>
              </div>
            )}

            {report.previewUrl && (
              <a
                href={report.previewUrl}
                download={report.name}
                className="rpm-download-btn"
                title="Download Report File"
              >
                <FaDownload />
                <span>Download</span>
              </a>
            )}

            <button type="button" className="rpm-close-btn" onClick={onClose} aria-label="Close Preview" title="Close Preview">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Content Viewer */}
        <div className="rpm-modal-body">
          {isPdf ? (
            <div className="rpm-pdf-container">
              <object
                data={report.previewUrl}
                type="application/pdf"
                width="100%"
                height="540px"
                className="rpm-pdf-object"
              >
                <iframe
                  src={report.previewUrl}
                  title={report.name}
                  width="100%"
                  height="540px"
                  style={{ border: "none" }}
                />
                <div className="rpm-pdf-fallback">
                  <p>Your browser cannot embed the PDF directly.</p>
                  <a href={report.previewUrl} download={report.name} className="rpm-download-fallback">
                    <FaDownload /> Download {report.name}
                  </a>
                </div>
              </object>
            </div>
          ) : (
            <div className="rpm-image-container">
              <div className="rpm-image-viewport">
                <img
                  src={report.previewUrl}
                  alt={report.name}
                  className="rpm-image-preview"
                  style={{
                    transform: `scale(${zoom})`,
                    transition: "transform 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="rpm-modal-footer">
          <span className="rpm-security-note">
            🔒 Confidential Medical Document — Authorized Access Only
          </span>
          <button type="button" className="rpm-btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientBookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [previewingReport, setPreviewingReport] = React.useState(null);

  // Robust fallback for direct access
  const { booking, doctor } = location.state || {
    booking: {
      appointmentId: "MB-W1E-92K81",
      date: "Monday, 20 July 2026",
      slot: "10:00 AM",
      consultationType: "in-person",
      paymentMethod: "hospital",
      bookingFor: "self",
      reason: "General Consultation",
      notes: "Routine checkup",
      uploadedFiles: [],
    },
    doctor: {
      id: 1,
      name: "Dr. Aisha Khan",
      specialization: "Cardiologist",
      qualification: "MBBS, MD (Cardiology), DM (Cardiology)",
      experience: 14,
      hospital: "Apollo Hospitals",
      city: "Mumbai",
      address: "Plot No. 13, Sector 6, Vikhroli West, Mumbai, Maharashtra – 400083",
      type: "hospital",
      fee: 800,
      rating: 4.9,
      reviews: 312,
      available: true,
      initials: "AK",
      color: "#7c3aed",
    },
  };

  const isHospital = doctor.type === "hospital";
  const estConfirmation = isHospital ? "1–2 Hours" : "Under 30 Minutes";

  return (
    <div className="bk-success-page">
      <div className="bk-success-card">
        {/* Animated checkmark */}
        <div className="bk-success-icon-wrapper">
          <div className="bk-success-icon">
            <FaCheckCircle />
          </div>
          <div className="bk-success-ring" />
        </div>

        <h1 className="bk-success-title">Appointment Booked!</h1>
        <p className="bk-success-subtitle">
          Your appointment request has been submitted successfully.
        </p>

        {/* Summary Card */}
        <div className="bk-confirm-summary">
          <div className="bk-confirm-header">
            <div
              className="bk-confirm-avatar"
              style={{
                background: `linear-gradient(135deg, ${doctor.color}cc, ${doctor.color}66)`,
              }}
            >
              {doctor.initials}
            </div>
            <div>
              <p className="bk-confirm-doctor">{doctor.name}</p>
              <p className="bk-confirm-spec">
                <FaStethoscope className="bk-si" /> {doctor.specialization}
              </p>
            </div>
          </div>

          <dl className="bk-confirm-details">
            <div className="bk-confirm-row">
              <dt>
                <FaIdCard className="bk-confirm-icon" /> Appointment ID
              </dt>
              <dd className="bk-appt-id">{booking.appointmentId}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                <FaCalendarCheck className="bk-confirm-icon" /> Date
              </dt>
              <dd>{booking.date}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                <FaClock className="bk-confirm-icon" /> Time Slot
              </dt>
              <dd className="bk-slot-val">{booking.slot}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                {booking.consultationType === "video" ? (
                  <FaVideo className="bk-confirm-icon" />
                ) : (
                  <FaHospital className="bk-confirm-icon" />
                )}
                Consultation Type
              </dt>
              <dd>
                {booking.consultationType === "video"
                  ? "Video Consultation"
                  : "In-Person Visit"}
              </dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                <FaMoneyBillWave className="bk-confirm-icon" /> Payment Option
              </dt>
              <dd>
                {booking.paymentMethod === "online"
                  ? "Paid Online"
                  : "Pay at Hospital"}
              </dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                <FaUser className="bk-confirm-icon" /> Booking For
              </dt>
              <dd>
                {booking.bookingFor === "self"
                  ? "Self (John Doe)"
                  : `Family Member (${booking.familyMemberName} - ${booking.familyRelation})`}
              </dd>
            </div>
            {booking.uploadedFiles && booking.uploadedFiles.length > 0 && (
              <div className="bk-confirm-row bk-confirm-row--reports">
                <dt>
                  <FaFileAlt className="bk-confirm-icon" /> Attached Reports
                </dt>
                <dd className="bk-reports-chips-wrap">
                  {booking.uploadedFiles.map((file, idx) => (
                    <div key={file.id || idx} className="bk-report-mini-chip">
                      <span className="bk-chip-name">{file.name}</span>
                      <button
                        type="button"
                        className="bk-chip-act-btn"
                        onClick={() => setPreviewingReport(file)}
                        title="Preview Report"
                      >
                        <FaEye /> Preview
                      </button>
                      {file.previewUrl && (
                        <a
                          href={file.previewUrl}
                          download={file.name}
                          className="bk-chip-act-btn"
                          title="Download Report"
                        >
                          <FaDownload />
                        </a>
                      )}
                    </div>
                  ))}
                </dd>
              </div>
            )}
            <div className="bk-confirm-row">
              <dt>
                <FaClock className="bk-confirm-icon" /> Est. Confirmation
              </dt>
              <dd className="bk-confirm-est">{estConfirmation}</dd>
            </div>
            <div className="bk-confirm-row bk-confirm-row--status">
              <dt>Status</dt>
              <dd>
                <span className="bk-status-badge">
                  <span className="bk-status-dot" />
                  Pending Confirmation
                </span>
              </dd>
            </div>
          </dl>

          {/* Booking type notice */}
          <div className={`bk-confirm-notice bk-confirm-notice--${doctor.type}`}>
            {isHospital ? <FaHospital /> : <FaClinicMedical />}
            <span>
              {isHospital
                ? "This appointment request will be sent to the hospital for confirmation. We will notify you once confirmed."
                : "This appointment will be booked directly with the doctor. Confirmation details are sent to your email."}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="bk-success-actions">
          <button
            className="bk-btn bk-btn--outline"
            onClick={() => navigate("/patient/dashboard")}
            aria-label="Back to Dashboard"
          >
            <FaHome /> Back to Dashboard
          </button>
          <button
            className="bk-btn bk-btn--primary"
            onClick={() => navigate("/patient/appointments")}
            aria-label="View My Appointments"
          >
            <FaCalendarCheck /> View My Appointments
          </button>
        </div>

        <button
          className="bk-print-btn"
          onClick={() => window.print()}
          aria-label="Print appointment details"
        >
          <FaPrint /> Print Details
        </button>
      </div>
      {/* Report Preview Modal */}
      {previewingReport && (
        <ReportPreviewModal
          report={previewingReport}
          onClose={() => setPreviewingReport(null)}
        />
      )}
    </div>
  );
}

export default PatientBookingSuccess;
