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
} from "react-icons/fa";
import "./PatientBookingSuccess.css";

function PatientBookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

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
              <div className="bk-confirm-row">
                <dt>
                  <FaFileAlt className="bk-confirm-icon" /> Attached Reports
                </dt>
                <dd>
                  {booking.uploadedFiles.map((f) => f.name).join(", ")}
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
    </div>
  );
}

export default PatientBookingSuccess;
