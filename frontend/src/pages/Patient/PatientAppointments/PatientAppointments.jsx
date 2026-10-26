import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../services/apiConfig";
const API_BASE = API_BASE_URL.replace(/\/api\/?$/, "");
import jsPDF from "jspdf";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaCalendarAlt,
  FaHospital,
  FaClinicMedical,
  FaVideo,
  FaUserMd,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaDownload,
  FaEye,
  FaPhoneAlt,
  FaIdCard,
  FaStethoscope,
  FaSearch,
  FaInbox,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./PatientAppointments.css";

/* ───────── Status Config ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: <FaHourglassHalf />,
    colorClass: "appt-status--pending",
  },
  confirmed: {
    label: "Confirmed",
    icon: <FaCheckCircle />,
    colorClass: "appt-status--confirmed",
  },
  completed: {
    label: "Completed",
    icon: <FaCalendarCheck />,
    colorClass: "appt-status--completed",
  },
  rejected: {
    label: "Rejected",
    icon: <FaTimesCircle />,
    colorClass: "appt-status--rejected",
  },
  cancelled: {
    label: "Cancelled",
    icon: <FaBan />,
    colorClass: "appt-status--cancelled",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
];

/* ───────── Backend Appointment Normalizer ────────────────────────────────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#7c3aed", "#0284c7", "#0d9488", "#f59e0b", "#ec4899",
  "#8b5cf6", "#14b8a6", "#f97316", "#10b981", "#6366f1",
];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function normalizeAppointment(appt) {
  const doctor = appt.doctorId || {};
  const hospital = appt.hospitalId || {};
  const doctorName = doctor.name || "Doctor";
  const specialization = doctor.specialization || "General Physician";
  // Compute initials from doctor name
  const initials = doctorName
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  // Determine hospital/clinic name and city
  const hospitalName =
    hospital.name || doctor.hospitalName || doctor.clinicName || "Facility";
  const city = hospital.city || doctor.city || appt.city || "";

  // Consultation type: backend stores 'Video' or 'In-Person'
  const rawType = (appt.type || "in-person").toLowerCase();
  const consultationType = rawType === "video" ? "video" : "in-person";

  // Doctor type (hospital vs clinic)
  const practiceType = String(doctor.practiceType || "hospital").toLowerCase();
  const doctorType = practiceType === "clinic" ? "clinic" : "hospital";

  // Status: backend uses sentence-case, UI uses lowercase
  const status = (appt.status || "pending").toLowerCase();

  // Date: store as ISO date-only string for consistency
  let dateStr = "";
  if (appt.date) {
    const d = new Date(appt.date);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dateStr = `${yyyy}-${mm}-${dd}`;
    }
  }

  return {
    id: appt._id || appt.id || "",
    displayId: appt.appointmentId || appt._id || appt.id || "",
    doctorId: typeof appt.doctorId === "object" ? appt.doctorId._id : appt.doctorId,
    doctorName,
    initials,
    color: getAvatarColor(doctorName),
    profileImage: doctor.profileImage || null,
    specialization,
    hospital: hospitalName,
    city,
    type: doctorType,
    consultationType,
    date: dateStr,
    time: appt.timeSlot || appt.time || "",
    fee: appt.fee || doctor.consultationFee || 0,
    rating: doctor.rating || 0,
    status,
    reason: appt.reason || "",
    notes: appt.notes || "",
    rejectionReason: appt.cancellationReason || "",
    prescription: appt.prescription || false,
    slots: doctor.timeSlots || [],
    feedbackRating: appt.rating || null,
    feedbackComment: appt.feedback || "",
    patientName: appt.patientId?.name || appt.patientName || "",
    prescriptionMedicines: appt.prescriptionId?.medicines || [],
  };
}

/* ───────── Helpers ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function isUpcoming(dateStr) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const apptDate = new Date(dateStr);
  apptDate.setHours(0, 0, 0, 0);
  return apptDate >= todayDate;
}

function getCountdownText(dateStr) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const apptDateObj = new Date(dateStr);
  apptDateObj.setHours(0, 0, 0, 0);

  const diffTime = apptDateObj - todayDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Starts today";
  } else if (diffDays === 1) {
    return "Starts tomorrow";
  } else if (diffDays > 1) {
    return `Starts in ${diffDays} days`;
  }
  return "";
}

function getHospitalContact(hospital) {
  const name = hospital ? hospital.toLowerCase() : "";
  if (name.includes("apollo")) {
    return { phone: "+91 22 2826 3000", email: "info@apollohospitals.com" };
  } else if (name.includes("fortis")) {
    return { phone: "+91 11 4277 6222", email: "support@fortishealthcare.com" };
  } else if (name.includes("aiims")) {
    return { phone: "+91 44 2829 4000", email: "contact@aiims.edu" };
  } else {
    return { phone: "+91 80 4926 5000", email: "info@cliniccare.in" };
  }
}

function handleDownloadSlip(appt) {
  const element = document.createElement("a");
  const file = new Blob([
    `MEDICOBRIDGE APPOINTMENT SLIP\n` +
    `==============================\n` +
    `Appointment ID: ${appt.displayId || appt.id}\n` +
    `Doctor: ${appt.doctorName} (${appt.specialization})\n` +
    `Hospital: ${appt.hospital}, ${appt.city}\n` +
    `Date: ${formatDate(appt.date)}\n` +
    `Time: ${appt.time}\n` +
    `Type: ${appt.consultationType === "video" ? "Video Consultation" : "In-Person Visit"}\n` +
    `Fee Paid: ₹${appt.fee}\n` +
    `Status: ${appt.status.toUpperCase()}\n` +
    `==============================\n` +
    `Thank you for using MedicoBridge.`
  ], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = `Appointment_Slip_${appt.displayId || appt.id}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function handleDownloadPrescriptionPDF(appt) {
  try {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(13, 148, 136);
    doc.text("MedicoBridge Digital Clinic", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Telehealth Division • www.medicobridge.com", 14, 26);
    doc.line(14, 30, 196, 30);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`Doctor: ${appt.doctorName}`, 14, 40);
    doc.text(`Patient: ${appt.patientName || "Patient"}`, 120, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Specialization: ${appt.specialization}`, 14, 47);
    doc.text(`Hospital: ${appt.hospital}${appt.city ? ", " + appt.city : ""}`, 14, 54);
    doc.text(`Date: ${formatDate(appt.date)}`, 120, 54);

    doc.line(14, 60, 196, 60);

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136);
    doc.text("Rx", 14, 73);

    // Use real medicines from prescription if available, otherwise show generic note
    const prescMedicines = Array.isArray(appt.prescriptionMedicines) && appt.prescriptionMedicines.length > 0
      ? appt.prescriptionMedicines.map((m, i) => ({
          name: `${i + 1}. ${m.name || m.medicineName || "Medicine"}`,
          dosage: `Dosage: ${m.dosage || m.frequency || "As directed"} • ${m.duration || "As prescribed"}`
        }))
      : [{ name: "1. As per prescription", dosage: "Please refer to your physical prescription slip." }];

    let yPos = 83;
    prescMedicines.forEach((med) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(med.name, 14, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(med.dosage, 14, yPos + 6);

      yPos += 16;
    });

    doc.line(14, yPos + 5, 196, yPos + 5);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Date Issued: ${new Date().toLocaleDateString("en-IN")}`, 14, yPos + 20);
    doc.text("Digitally Signed By:", 140, yPos + 20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(appt.doctorName, 140, yPos + 26);

    const fileName = `E-Prescription_${appt.displayId || appt.id}.pdf`;
    doc.save(fileName);
    toast.success("Prescription downloaded successfully.");
  } catch (err) {
    console.error("Prescription PDF generation error:", err);
    toast.error("Unable to generate PDF prescription. Please try again.");
  }
}

/* ───────── Feedback Modal ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function FeedbackModal({ apptId, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!apptId) return null;

  return (
    <div className="appt-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="appt-modal" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
        <div className="appt-modal-header">
          <h2 className="appt-modal-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaStar style={{ color: "#f59e0b" }} /> Give Feedback & Review
          </h2>
          <button className="appt-modal-close" onClick={onClose} aria-label="Close">
            <FaTimesCircle />
          </button>
        </div>
        <div className="appt-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", textAlign: "center" }}>
            How was your appointment experience? Your feedback helps us improve MedicoBridge.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", fontSize: "2rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", outline: "none", padding: 0 }}
                onClick={() => setRating(star)}
              >
                <FaStar color={star <= rating ? "#f59e0b" : "#cbd5e1"} />
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontWeight: "600", fontSize: "0.85rem", marginBottom: "0.3rem", display: "block" }}>Written Review</label>
            <textarea
              className="appt-search-input"
              style={{ height: "90px", resize: "none", fontFamily: "inherit", width: "100%", padding: "0.6rem" }}
              placeholder="Share details of your experience (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <div className="appt-confirm-actions" style={{ padding: "1rem 1.5rem" }}>
          <button className="appt-action-btn appt-action-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="appt-action-btn"
            style={{ background: "var(--primary-color)", color: "#fff" }}
            onClick={() => onSubmit(apptId, rating, comment)}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Appointment Details Modal ──────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function AppointmentDetailModal({ appt, hasSubmittedFeedback, onGiveFeedback, onClose, onCancel, onReschedule }) {
  if (!appt) return null;
  const cfg = STATUS_CONFIG[appt.status];
  const contact = getHospitalContact(appt.hospital);

  return (
    <div
      className="appt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appt-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="appt-modal">
        {/* Header */}
        <div className="appt-modal-header">
          <h2 id="appt-modal-title" className="appt-modal-title">
            Appointment Details
          </h2>
          <button
            className="appt-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaTimesCircle />
          </button>
        </div>

        {/* Doctor strip */}
        <div className="appt-modal-doctor">
          <div
            className="appt-modal-avatar"
            style={{
              background: `linear-gradient(135deg, ${appt.color}cc, ${appt.color}66)`,
            }}
          >
            {appt.initials}
          </div>
          <div className="appt-modal-doc-info">
            <p className="appt-modal-doc-name">{appt.doctorName}</p>
            <p className="appt-modal-doc-spec">
              <FaStethoscope /> {appt.specialization}
            </p>
          </div>
          <span className={`appt-status-badge ${cfg.colorClass}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Timeline Step Block */}
        <div className="appt-timeline-wrapper">
          <p className="appt-timeline-title">Appointment Progress</p>
          <div className="appt-timeline">
            {/* Step 1: Booked */}
            <div className="appt-timeline-step appt-timeline-step--completed">
              <div className="appt-timeline-dot">✓</div>
              <span className="appt-timeline-label">Booked</span>
            </div>

            <div className="appt-timeline-line appt-timeline-line--active" />

            {/* Step 2: Confirmed */}
            <div className={`appt-timeline-step ${appt.status !== "pending" && appt.status !== "rejected" ? "appt-timeline-step--completed" :
                appt.status === "pending" ? "appt-timeline-step--active" : "appt-timeline-step--inactive"
              }`}>
              <div className="appt-timeline-dot">
                {appt.status !== "pending" && appt.status !== "rejected" ? "✓" : "2"}
              </div>
              <span className="appt-timeline-label">
                {appt.status === "rejected" ? "Rejected" : "Confirmed"}
              </span>
            </div>

            <div className={`appt-timeline-line ${appt.status === "completed" || appt.status === "cancelled" ? "appt-timeline-line--active" : ""
              }`} />

            {/* Step 3: Completed or Cancelled */}
            <div className={`appt-timeline-step ${appt.status === "completed" ? "appt-timeline-step--completed" :
                appt.status === "cancelled" ? "appt-timeline-step--cancelled" : "appt-timeline-step--inactive"
              }`}>
              <div className="appt-timeline-dot">
                {appt.status === "completed" ? "✓" : appt.status === "cancelled" ? "✗" : "3"}
              </div>
              <span className="appt-timeline-label">
                {appt.status === "cancelled" ? "Cancelled" : "Completed"}
              </span>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <dl className="appt-modal-details">
          <div className="appt-modal-row">
            <dt><FaIdCard /> Appointment ID</dt>
            <dd className="appt-id-mono">{appt.displayId || appt.id}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaCalendarAlt /> Date</dt>
            <dd>{formatDate(appt.date)}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaClock /> Time</dt>
            <dd>{appt.time}</dd>
          </div>
          <div className="appt-modal-row">
            <dt>
              {appt.consultationType === "video"
                ? <FaVideo />
                : <FaUserMd />}{" "}
              Type
            </dt>
            <dd>
              {appt.consultationType === "video"
                ? "Video Consultation"
                : "In-Person Visit"}
            </dd>
          </div>
          <div className="appt-modal-row">
            <dt>
              {appt.type === "hospital"
                ? <FaHospital />
                : <FaClinicMedical />}{" "}
              {appt.type === "hospital" ? "Hospital" : "Clinic"}
            </dt>
            <dd>{appt.hospital}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaMapMarkerAlt /> Location</dt>
            <dd>{appt.city}</dd>
          </div>
          <div className="appt-modal-row">
            <dt><FaCalendarCheck /> Reason</dt>
            <dd>{appt.reason}</dd>
          </div>
          {appt.notes && (
            <div className="appt-modal-row appt-modal-row--full">
              <dt>Notes</dt>
              <dd>{appt.notes}</dd>
            </div>
          )}
          {appt.rejectionReason && (
            <div className="appt-modal-row appt-modal-row--full appt-modal-row--alert">
              <dt><FaTimesCircle /> Rejection Reason</dt>
              <dd>{appt.rejectionReason}</dd>
            </div>
          )}

          {/* Hospital Contact details */}
          <div className="appt-modal-row appt-modal-row--full" style={{ borderTop: "1.5px dashed var(--border-color)", paddingTop: "0.8rem", marginTop: "0.4rem" }}>
            <dt style={{ color: "var(--text-primary)", fontWeight: "700" }}>ðŸ¥ Facility Contact Details</dt>
            <dd style={{ textAlign: "left", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.3rem", width: "100%", maxWidth: "100%" }}>
              <div style={{ marginBottom: "0.2rem" }}>ðŸ“ž Phone: <strong style={{ color: "var(--text-primary)" }}>{contact.phone}</strong></div>
              <div>✉ Email: <strong style={{ color: "var(--text-primary)" }}>{contact.email}</strong></div>
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="appt-modal-actions">
          {(appt.status === "pending" || appt.status === "confirmed") && (
            <>
              <button
                className="appt-action-btn appt-action-btn--danger"
                onClick={() => {
                  onClose();
                  onCancel(appt.id);
                }}
              >
                <FaBan /> Cancel Appointment
              </button>
              <button
                className="appt-action-btn"
                style={{ background: "var(--primary-color)", color: "#fff" }}
                onClick={() => {
                  onClose();
                  onReschedule(appt);
                }}
              >
                <FaCalendarAlt /> Reschedule
              </button>
            </>
          )}
          {appt.status === "completed" && (
            <>
              {appt.prescription && (
                <button className="appt-action-btn appt-action-btn--download" onClick={() => handleDownloadPrescriptionPDF(appt)}>
                  <FaDownload /> Download Prescription
                </button>
              )}
              <button className="appt-action-btn appt-action-btn--outline" onClick={() => handleDownloadSlip(appt)}>
                <FaDownload /> Download Slip
              </button>
              {hasSubmittedFeedback ? (
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: "#16a34a",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  ✓ Feedback Submitted
                </span>
              ) : (
                <button
                  className="appt-action-btn appt-action-btn--outline"
                  style={{ borderColor: "#f59e0b", color: "#d97706" }}
                  onClick={() => {
                    onClose();
                    onGiveFeedback(appt.id);
                  }}
                >
                  ★ Give Feedback
                </button>
              )}
            </>
          )}
          <button
            className="appt-action-btn appt-action-btn--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Single Appointment Card ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function AppointmentCard({ appt, hasSubmittedFeedback, onGiveFeedback, onViewDetails, onCancel, onReschedule }) {
  const cfg = STATUS_CONFIG[appt.status];
  const upcoming = isUpcoming(appt.date);
  const isVideo = appt.consultationType === "video";
  const canCancel =
    appt.status === "pending" || appt.status === "confirmed";
  const canDownload = appt.status === "completed" && appt.prescription;

  return (
    <article
      className={`appt-card appt-card--${appt.status}`}
      aria-label={`Appointment with ${appt.doctorName}`}
    >
      {/* Status ribbon */}
      <div className={`appt-card-ribbon ${cfg.colorClass}`}>
        {cfg.icon}
        {cfg.label}
      </div>

      {/* Card body */}
      <div className="appt-card-body">
        {/* Doctor info */}
        <div className="appt-card-doctor">
          <div
            className="appt-card-avatar"
            style={{
              background: `linear-gradient(135deg, ${appt.color}cc, ${appt.color}55)`,
            }}
            aria-label={`Photo of ${appt.doctorName}`}
          >
            <span className="appt-avatar-initials">{appt.initials}</span>
          </div>
          <div className="appt-card-identity">
            <h3 className="appt-doctor-name">{appt.doctorName}</h3>
            <p className="appt-specialization">
              <FaStethoscope className="appt-meta-icon" />
              {appt.specialization}
            </p>
            <p className="appt-hospital">
              {appt.type === "hospital" ? (
                <FaHospital className="appt-meta-icon appt-meta-icon--hosp" />
              ) : (
                <FaClinicMedical className="appt-meta-icon appt-meta-icon--clinic" />
              )}
              {appt.hospital}
            </p>
          </div>
        </div>

        {/* Appointment meta */}
        <div className="appt-card-meta">
          <div className="appt-meta-row" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
            <FaCalendarAlt className="appt-meta-icon appt-meta-icon--date" />
            <span>{formatDate(appt.date)}</span>
            {upcoming && (appt.status === "pending" || appt.status === "confirmed") && (
              <span className="appt-countdown-tag" style={{ marginLeft: "8px", fontSize: "0.72rem", color: "#d97706", fontWeight: "700", background: "#fef3c7", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-sm)" }}>
                ⏳ {getCountdownText(appt.date)}
              </span>
            )}
          </div>
          <div className="appt-meta-row">
            <FaClock className="appt-meta-icon appt-meta-icon--time" />
            <span>{appt.time}</span>
          </div>
          <div className="appt-meta-row">
            <FaMapMarkerAlt className="appt-meta-icon appt-meta-icon--loc" />
            <span>{appt.city}</span>
          </div>
          <div className={`appt-consult-type-chip appt-consult-type-chip--${appt.consultationType}`}>
            {isVideo ? (
              <>
                <FaVideo /> Video Consultation
              </>
            ) : (
              <>
                <FaUserMd /> In-Person Visit
              </>
            )}
          </div>
        </div>

        {/* Appointment ID */}
        <div className="appt-id-row">
          <FaIdCard className="appt-meta-icon" />
          <span className="appt-id-label">ID:</span>
          <span className="appt-id-value">{appt.displayId || appt.id}</span>
        </div>

        {/* Rejection reason chip */}
        {appt.rejectionReason && (
          <div className="appt-rejection-notice">
            <FaTimesCircle />
            <span>{appt.rejectionReason}</span>
          </div>
        )}
      </div>

      {/* Card actions */}
      <div className="appt-card-actions">
        <button
          className="appt-action-btn appt-action-btn--outline"
          onClick={() => onViewDetails(appt)}
          aria-label={`View details for appointment ${appt.id}`}
        >
          <FaEye /> View Details
        </button>

        {canCancel && (
          <button
            className="appt-action-btn appt-action-btn--danger-outline"
            onClick={() => onCancel(appt.id)}
            aria-label={`Cancel appointment ${appt.id}`}
          >
            <FaBan /> Cancel
          </button>
        )}

        {(appt.status === "pending" || appt.status === "confirmed") && (
          <button
            className="appt-action-btn appt-action-btn--outline"
            onClick={() => onReschedule(appt)}
            aria-label={`Reschedule appointment ${appt.id}`}
          >
            Reschedule
          </button>
        )}

        {appt.status === "completed" && (
          <>
            <button
              className="appt-action-btn appt-action-btn--outline"
              onClick={() => handleDownloadSlip(appt)}
              aria-label="Download slip"
            >
              <FaDownload /> Slip
            </button>
            {hasSubmittedFeedback ? (
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  color: "#16a34a",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                ✓ Feedback Submitted
              </span>
            ) : (
              <button
                className="appt-action-btn appt-action-btn--outline"
                style={{ borderColor: "#f59e0b", color: "#d97706" }}
                onClick={() => onGiveFeedback(appt.id)}
              >
                ★ Give Feedback
              </button>
            )}
          </>
        )}

        {canDownload && (
          <button
            className="appt-action-btn appt-action-btn--download"
            onClick={() => handleDownloadPrescriptionPDF(appt)}
            aria-label="Download prescription"
          >
            <FaDownload /> Prescription
          </button>
        )}
      </div>
    </article>
  );
}

/* ───────── Summary Stats Bar ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function AppointmentStats({ data }) {
  const counts = {
    total: data.length,
    pending: data.filter((a) => a.status === "pending").length,
    confirmed: data.filter((a) => a.status === "confirmed").length,
    completed: data.filter((a) => a.status === "completed").length,
    rejected: data.filter((a) => a.status === "rejected").length,
    cancelled: data.filter((a) => a.status === "cancelled").length,
  };
  const stats = [
    { label: "Total", value: counts.total, color: "#0d9488" },
    { label: "Pending", value: counts.pending, color: "#f59e0b" },
    { label: "Confirmed", value: counts.confirmed, color: "#0284c7" },
    { label: "Completed", value: counts.completed, color: "#22c55e" },
    { label: "Rejected", value: counts.rejected, color: "#ef4444" },
    { label: "Cancelled", value: counts.cancelled, color: "#94a3b8" },
  ];
  return (
    <div className="appt-stats-bar">
      {stats.map((s) => (
        <div
          key={s.label}
          className="appt-stat-chip"
          style={{ "--stat-accent": s.color }}
        >
          <span className="appt-stat-val">{s.value}</span>
          <span className="appt-stat-lbl">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── Cancel Confirm Dialog ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function CancelConfirmDialog({ apptId, allAppointments = [], onConfirm, onDismiss }) {
  if (!apptId) return null;
  const target = allAppointments.find((a) => a.id === apptId);
  const displayId = target?.displayId || apptId;
  return (
    <div
      className="appt-modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="appt-confirm-dialog">
        <div className="appt-confirm-icon">
          <FaBan />
        </div>
        <h3 id="cancel-dialog-title" className="appt-confirm-title">
          Cancel Appointment?
        </h3>
        <p className="appt-confirm-desc">
          Are you sure you want to cancel appointment{" "}
          <strong>{displayId}</strong>? This action cannot be undone.
        </p>
        <div className="appt-confirm-actions">
          <button
            className="appt-action-btn appt-action-btn--secondary"
            onClick={onDismiss}
          >
            Keep Appointment
          </button>
          <button
            className="appt-action-btn appt-action-btn--danger"
            onClick={() => onConfirm(apptId)}
          >
            <FaBan /> Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reschedule Modal ──────────────────────────────────────────────── */
function RescheduleModal({ appt, allAppointments = [], onClose, onConfirm }) {
  const [newDate, setNewDate] = useState(appt.date || "");
  const [newSlot, setNewSlot] = useState("");
  const [error, setError] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingBookedSlots, setLoadingBookedSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch doctor's real availability from backend
  useEffect(() => {
    let isMounted = true;
    const loadDoctorAvailability = async () => {
      if (!appt?.doctorId) {
        setLoadingDoctor(false);
        return;
      }
      try {
        setLoadingDoctor(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/patient/doctors/${appt.doctorId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (isMounted && res.ok && data.success && data.data) {
          setDoctor(data.data);
        }
      } catch (err) {
        console.error("Failed to load doctor availability:", err);
      } finally {
        if (isMounted) setLoadingDoctor(false);
      }
    };
    loadDoctorAvailability();
    return () => {
      isMounted = false;
    };
  }, [appt?.doctorId]);

  // Fetch booked slots for the selected date
  useEffect(() => {
    let isMounted = true;
    const loadBookedSlots = async () => {
      if (!appt?.doctorId || !newDate) {
        setBookedSlots([]);
        return;
      }
      try {
        setLoadingBookedSlots(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE}/api/patient/doctors/${appt.doctorId}/booked-slots?date=${newDate}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (isMounted && res.ok && data.success && data.data?.bookedSlots) {
          setBookedSlots(data.data.bookedSlots);
        } else if (isMounted) {
          setBookedSlots([]);
        }
      } catch (err) {
        if (isMounted) setBookedSlots([]);
      } finally {
        if (isMounted) setLoadingBookedSlots(false);
      }
    };
    loadBookedSlots();
    return () => {
      isMounted = false;
    };
  }, [appt?.doctorId, newDate]);

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const selectedDayName = newDate
    ? dayNames[new Date(`${newDate}T00:00:00`).getDay()]
    : "";

  const availableDays = Array.isArray(doctor?.availableDays)
    ? doctor.availableDays
    : [];

  const rawDoctorSlots = Array.isArray(doctor?.availableSlots)
    ? doctor.availableSlots
    : [];

  const isDayAvailable =
    !doctor || availableDays.length === 0 || availableDays.includes(selectedDayName);

  // Slots for the selected day from doctor's real configuration
  const doctorSlots = (() => {
    if (!selectedDayName || !rawDoctorSlots.length) return [];
    const filtered = rawDoctorSlots.filter(
      (s) => s && s.day === selectedDayName && s.isAvailable !== false
    );
    const seen = new Set();
    const result = [];
    filtered.forEach((s) => {
      const slotStr = s.startTime || s.endTime || s.time || "";
      if (slotStr && !seen.has(slotStr)) {
        seen.add(slotStr);
        result.push(slotStr);
      }
    });
    return result;
  })();

  const getSlotStatus = (slotTimeStr) => {
    const selectedDate = newDate || appt.date;

    if (selectedDate < todayStr) {
      return { disabled: true, reason: "Past date" };
    }

    if (selectedDate === todayStr) {
      const now = new Date();
      const currentClockMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = timeToMinutes(slotTimeStr);
      if (slotMinutes <= currentClockMinutes) {
        return { disabled: true, reason: "Past time" };
      }
    }

    if (selectedDate === appt.date && slotTimeStr === appt.time) {
      return { disabled: true, reason: "Current appointment slot" };
    }

    if (bookedSlots.includes(slotTimeStr)) {
      return { disabled: true, reason: "Already booked" };
    }

    return { disabled: false, reason: "" };
  };

  const availableSlotsCount = doctorSlots.filter(
    (slot) => !getSlotStatus(slot).disabled
  ).length;

  const handleSave = async () => {
    if (!newDate) {
      setError("Please select a date.");
      return;
    }
    if (newDate < todayStr) {
      setError("Rescheduled date cannot be in the past.");
      return;
    }
    if (!isDayAvailable) {
      setError(`Doctor is not available on ${selectedDayName}s.`);
      return;
    }
    if (!newSlot) {
      setError("Please select an available time slot.");
      return;
    }
    const status = getSlotStatus(newSlot);
    if (status.disabled) {
      if (status.reason === "Current appointment slot") {
        setError("Your current appointment is already booked for this slot. Please choose another slot.");
      } else if (status.reason === "Past time") {
        setError("This time slot has already passed.");
      } else if (status.reason === "Already booked") {
        setError("This time slot is already booked.");
      } else {
        setError("This time slot is not available.");
      }
      return;
    }

    setError("");
    setIsSubmitting(true);
    const result = await onConfirm(appt.id, newDate, newSlot);
    if (result && !result.success) {
      setError(result.message || "Failed to reschedule appointment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="appt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-title"
    >
      <div className="appt-modal appt-reschedule-modal">
        <div className="appt-modal-header">
          <h2 id="reschedule-title" className="appt-modal-title">
            Reschedule Appointment
          </h2>
          <button className="appt-modal-close" onClick={onClose} aria-label="Close">
            <FaTimesCircle />
          </button>
        </div>

        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
            <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "0.2rem" }}>
              Current Appointment: <strong>{formatDate(appt.date)}</strong> at <strong>{appt.time}</strong>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Doctor: <strong>{appt.doctorName}</strong> ({appt.specialization})
            </p>
          </div>

          {error && (
            <p
              className="appt-field-error"
              style={{
                color: "#ef4444",
                fontSize: "0.78rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <FaTimesCircle /> {error}
            </p>
          )}

          {/* Date Picker */}
          <div className="bk-field" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label
              className="bk-label"
              htmlFor="reschedule-date"
              style={{ fontWeight: "700", fontSize: "0.8rem", color: "var(--text-secondary)" }}
            >
              Select Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              id="reschedule-date"
              className="bk-input"
              min={todayStr}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setNewSlot("");
                setError("");
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            {newDate && selectedDayName && availableDays.length > 0 && (
              <p style={{ fontSize: "0.76rem", color: isDayAvailable ? "var(--text-muted)" : "#dc2626", margin: "0.1rem 0 0" }}>
                {selectedDayName} &bull; Doctor available on: {availableDays.join(", ")}
              </p>
            )}
          </div>

          {/* Doctor Schedule Slots */}
          <div className="bk-field" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label className="bk-label" style={{ fontWeight: "700", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Doctor's Available Slots <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: availableSlotsCount > 0 ? "#16a34a" : "#dc2626" }}>
                {loadingDoctor || loadingBookedSlots ? (
                  "Checking..."
                ) : availableSlotsCount > 0 ? (
                  `🟢 ${availableSlotsCount} available`
                ) : (
                  "🔴 0 available"
                )}
              </span>
            </div>

            {loadingDoctor ? (
              <div style={{ padding: "1rem", textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Loading doctor schedule...
              </div>
            ) : !isDayAvailable ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaTimesCircle /> Doctor is not available on {selectedDayName}s. Available days: {availableDays.join(", ")}.
              </div>
            ) : doctorSlots.length === 0 ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaTimesCircle /> No time slots configured for {selectedDayName || "this date"}. Please choose another date.
              </div>
            ) : availableSlotsCount === 0 ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <FaTimesCircle /> All slots for this date are booked or have passed. Please select another date.
              </div>
            ) : (
              <div
                className="bk-slot-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}
              >
                {doctorSlots.map((slot) => {
                  const status = getSlotStatus(slot);
                  const isSelected = newSlot === slot;

                  let slotTitle = "Click to select slot";
                  if (status.disabled) {
                    if (status.reason === "Current appointment slot") slotTitle = "Current appointment slot";
                    else if (status.reason === "Past time") slotTitle = "Time slot already passed";
                    else if (status.reason === "Already booked") slotTitle = "Slot already booked";
                    else slotTitle = "Unavailable slot";
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={status.disabled}
                      className={`bk-slot-btn ${isSelected ? "bk-slot-btn--active" : ""}`}
                      onClick={() => {
                        if (!status.disabled) {
                          setNewSlot(slot);
                          setError("");
                        }
                      }}
                      title={slotTitle}
                      style={{
                        padding: "0.55rem 0.65rem",
                        border: isSelected
                          ? "1.5px solid var(--primary-color)"
                          : "1.5px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: isSelected
                          ? "linear-gradient(135deg, var(--primary-color), var(--secondary-color))"
                          : status.disabled
                            ? "#f1f5f9"
                            : "var(--bg-secondary)",
                        color: isSelected
                          ? "#fff"
                          : status.disabled
                            ? "#94a3b8"
                            : "var(--text-secondary)",
                        cursor: status.disabled ? "not-allowed" : "pointer",
                        opacity: status.disabled ? 0.55 : 1,
                        textDecoration: status.disabled ? "line-through" : "none",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {slot} {status.disabled && "🔒"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="appt-modal-actions">
          <button className="appt-action-btn appt-action-btn--secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            className="appt-action-btn"
            disabled={availableSlotsCount === 0 || isSubmitting}
            onClick={handleSave}
            style={{
              background: availableSlotsCount > 0 && !isSubmitting ? "var(--primary-color)" : "#cbd5e1",
              color: "#fff",
              cursor: availableSlotsCount > 0 && !isSubmitting ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Main Page Component ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
function PatientAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailAppt, setDetailAppt] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [feedbackApptId, setFeedbackApptId] = useState(null);
  const [submittedFeedback, setSubmittedFeedback] = useState({});
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(10);

  /* Fetch real appointments from backend */
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in. Please log in to view your appointments.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_BASE}/api/patient/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const normalized = (data.data || []).map(normalizeAppointment);
        setAppointments(normalized);
        // Rebuild feedback state from persisted data
        const feedbackMap = {};
        normalized.forEach((a) => {
          if (a.feedbackRating != null) {
            feedbackMap[a.id] = true;
          }
        });
        setSubmittedFeedback(feedbackMap);
      } else {
        setError(data.message || "Failed to load appointments.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* Filter by tab + search */
  const filtered = appointments
    .filter((a) => {
      const matchTab = activeTab === "all" || a.status === activeTab;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.doctorName.toLowerCase().includes(q) ||
        a.specialization.toLowerCase().includes(q) ||
        a.hospital.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.displayId && a.displayId.toLowerCase().includes(q));
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  /* Cancel logic — calls backend API */
  const handleCancelConfirm = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/patient/appointments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancellationReason: "Cancelled by patient" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.info("Appointment cancelled successfully.");
        await fetchAppointments();
      } else {
        toast.error(data.message || "Failed to cancel appointment.");
      }
    } catch (err) {
      toast.error("Unable to cancel. Please try again.");
    } finally {
      setCancelId(null);
    }
  };

  /* Reschedule logic — calls backend API */
  const handleRescheduleConfirm = async (id, newDate, newSlot) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/patient/appointments/${id}/reschedule`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: newDate, timeSlot: newSlot }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedAppt = normalizeAppointment(data.data);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updatedAppt : a))
        );
        setRescheduleAppt(null);
        toast.success("Appointment rescheduled successfully.");
        return { success: true };
      } else {
        const errMsg =
          data.message ||
          (Array.isArray(data.errors) ? data.errors[0] : null) ||
          "Failed to reschedule appointment.";
        toast.error(errMsg);
        return { success: false, message: errMsg };
      }
    } catch (err) {
      toast.error("Unable to connect to server. Please try again.");
      return { success: false, message: "Unable to connect to server." };
    }
  };

  /* Tab counts */
  const tabCount = (key) =>
    key === "all"
      ? appointments.length
      : appointments.filter((a) => a.status === key).length;

  return (
    <div className="appt-page">
      {/* ────── Page Header ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <header className="appt-page-header">
        <div className="appt-header-text">
          <h1 className="appt-page-title">My Appointments</h1>
          <p className="appt-page-subtitle">
            Track, manage and review all your medical appointments in one place.
          </p>
        </div>
        <button
          className="appt-book-btn"
          onClick={() => navigate("/patient/find-doctors")}
          aria-label="Book a new appointment"
        >
          <FaCalendarCheck />
          Book New Appointment
        </button>
      </header>

      {/* ────── Stats Bar ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <AppointmentStats data={appointments} />

      {/* ────── Search & Filter Controls ───────────────────────────────────────────────────────────────────────────────── */}
      <div className="appt-filters-row" style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap", flexShrink: 0 }}>
        <div className="appt-search-bar" style={{ flex: 1, minWidth: "280px", margin: 0 }}>
          <FaSearch className="appt-search-icon" />
          <input
            id="appt-search-input"
            type="text"
            className="appt-search-input"
            placeholder="Search by doctor name, specialization, hospital, city or appointment ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(10); }}
            aria-label="Search appointments"
          />
          {search && (
            <button
              className="appt-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimesCircle />
            </button>
          )}
        </div>
        <div className="appt-filter-select-wrapper" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Sort:</span>
          <select
            id="appt-sort-select"
            className="appt-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "0.6rem 1rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", outline: "none" }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div className="appt-filter-select-wrapper" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Status:</span>
          <select
            id="appt-status-select"
            className="appt-filter-select"
            value={activeTab}
            onChange={(e) => { setActiveTab(e.target.value); setVisibleCount(10); }}
            style={{ padding: "0.6rem 1rem", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ────── Tabs ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <div className="appt-tabs" role="tablist" aria-label="Appointment status filter">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={activeTab === tab.key}
            className={`appt-tab ${activeTab === tab.key ? "appt-tab--active" : ""}`}
            onClick={() => { setActiveTab(tab.key); setVisibleCount(10); }}
          >
            {tab.label}
            <span
              className={`appt-tab-count ${activeTab === tab.key ? "appt-tab-count--active" : ""}`}
            >
              {tabCount(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {/* ────── Content Area ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <div
        className="appt-content"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {filtered.length > 0 ? (
          <>
            <p className="appt-result-count">
              Showing <strong>{Math.min(filtered.length, visibleCount)}</strong> of <strong>{filtered.length}</strong> appointment
              {filtered.length !== 1 ? "s" : ""}
              {activeTab !== "all" && (
                <span> · {STATUS_CONFIG[activeTab]?.label || "All"}</span>
              )}
            </p>
            <div className="appt-cards-grid">
              {filtered.slice(0, visibleCount).map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  hasSubmittedFeedback={!!submittedFeedback[appt.id]}
                  onGiveFeedback={(id) => setFeedbackApptId(id)}
                  onViewDetails={setDetailAppt}
                  onCancel={(id) => setCancelId(id)}
                  onReschedule={(appt) => setRescheduleAppt(appt)}
                />
              ))}
            </div>

            {/* Load More Pagination */}
            {filtered.length > visibleCount && (
              <div className="appt-load-more-wrapper" style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                <button
                  className="appt-action-btn"
                  onClick={() => setVisibleCount((prev) => prev + 10)}
                  style={{
                    background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                    color: "#fff",
                    border: "none",
                    padding: "0.75rem 2rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(13, 148, 136, 0.25)",
                    transition: "transform var(--transition-fast)"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Load More Appointments
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="appt-empty-state">
            <div className="appt-empty-icon">
              <FaInbox />
            </div>
            <h3 className="appt-empty-title">No appointments found</h3>
            <p className="appt-empty-desc">
              {search
                ? "No appointments match your search. Try different keywords."
                : "You don't have any appointments in this category yet."}
            </p>
            {search ? (
              <button
                className="appt-empty-btn"
                onClick={() => setSearch("")}
              >
                <FaTimesCircle /> Clear Search
              </button>
            ) : (
              <button
                className="appt-empty-btn"
                onClick={() => navigate("/patient/find-doctors")}
              >
                <FaSearch /> Find a Doctor
              </button>
            )}
          </div>
        )}
      </div>

      {/* ────── Modals ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
      <AppointmentDetailModal
        appt={detailAppt}
        hasSubmittedFeedback={detailAppt ? !!submittedFeedback[detailAppt.id] : false}
        onGiveFeedback={(id) => setFeedbackApptId(id)}
        onClose={() => setDetailAppt(null)}
        onCancel={(id) => setCancelId(id)}
        onReschedule={(appt) => setRescheduleAppt(appt)}
      />
      <CancelConfirmDialog
        apptId={cancelId}
        allAppointments={appointments}
        onConfirm={handleCancelConfirm}
        onDismiss={() => setCancelId(null)}
      />
      {rescheduleAppt && (
        <RescheduleModal
          appt={rescheduleAppt}
          allAppointments={appointments}
          onClose={() => setRescheduleAppt(null)}
          onConfirm={handleRescheduleConfirm}
        />
      )}
      {feedbackApptId && (
        <FeedbackModal
          apptId={feedbackApptId}
          onClose={() => setFeedbackApptId(null)}
          onSubmit={async (id, rating, comment) => {
            try {
              const token = localStorage.getItem("token");
              const res = await fetch(`${API_BASE}/api/patient/appointments/${id}/feedback`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ rating, comment }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                setSubmittedFeedback((prev) => ({ ...prev, [id]: true }));
                setFeedbackApptId(null);
                toast.success("Thank you for your feedback! It has been submitted.");
              } else {
                const errMsg =
                  data.message ||
                  (Array.isArray(data.errors) ? data.errors[0] : null) ||
                  "Failed to submit feedback.";
                toast.error(errMsg);
              }
            } catch (err) {
              toast.error("Unable to submit feedback. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
}

export default PatientAppointments;
