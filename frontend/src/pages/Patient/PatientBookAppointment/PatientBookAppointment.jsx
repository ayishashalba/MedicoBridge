import React, { useState, useId } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserMd,
  FaStethoscope,
  FaHospital,
  FaClinicMedical,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaClock,
  FaVideo,
  FaUser,
  FaFileAlt,
  FaStickyNote,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaStar,
  FaIdCard,
  FaPrint,
  FaHome,
} from "react-icons/fa";
import "./PatientBookAppointment.css";

/* ─── Shared Doctor Data ─────────────────────────────────────────── */
const doctorsData = [
  {
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
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    slots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:30 PM"],
  },
  {
    id: 2,
    name: "Dr. Rahul Verma",
    specialization: "Orthopedic Surgeon",
    qualification: "MBBS, MS (Orthopaedics), Fellowship in Joint Replacement",
    experience: 10,
    hospital: "Fortis Healthcare",
    city: "Delhi",
    address: "B-22, Vasant Kunj, New Delhi – 110070",
    type: "hospital",
    fee: 700,
    rating: 4.7,
    reviews: 245,
    available: true,
    initials: "RV",
    color: "#0284c7",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    slots: ["10:00 AM", "10:30 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    experience: 8,
    hospital: "Skin Care Clinic",
    city: "Bangalore",
    address: "No. 45, 2nd Floor, Residency Road, Bangalore – 560025",
    type: "clinic",
    fee: 500,
    rating: 4.8,
    reviews: 198,
    available: false,
    initials: "PS",
    color: "#0d9488",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:00 PM"],
  },
  {
    id: 4,
    name: "Dr. Suresh Nair",
    specialization: "Neurologist",
    qualification: "MBBS, MD (Neurology), DM (Neurology)",
    experience: 18,
    hospital: "AIIMS",
    city: "Chennai",
    address: "Greams Rd, Thousand Lights, Chennai, Tamil Nadu – 600006",
    type: "hospital",
    fee: 1200,
    rating: 4.9,
    reviews: 512,
    available: true,
    initials: "SN",
    color: "#f59e0b",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
  },
  {
    id: 5,
    name: "Dr. Meera Patel",
    specialization: "Gynecologist",
    qualification: "MBBS, MS (Obstetrics & Gynaecology)",
    experience: 12,
    hospital: "Wockhardt Hospital",
    city: "Pune",
    address: "1877, Wockhardt Hospital, Sanjay Park, Pune – 411001",
    type: "hospital",
    fee: 600,
    rating: 4.6,
    reviews: 178,
    available: true,
    initials: "MP",
    color: "#ec4899",
    availableDays: ["Monday", "Wednesday", "Friday"],
    slots: ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
  },
  {
    id: 6,
    name: "Dr. Arjun Mehta",
    specialization: "Pediatrician",
    qualification: "MBBS, MD (Paediatrics)",
    experience: 7,
    hospital: "Child Care Clinic",
    city: "Hyderabad",
    address: "Flat 2B, Sunshine Complex, Banjara Hills, Hyderabad – 500034",
    type: "clinic",
    fee: 450,
    rating: 4.5,
    reviews: 133,
    available: false,
    initials: "AM",
    color: "#10b981",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM", "05:00 PM"],
  },
  {
    id: 7,
    name: "Dr. Kavitha Reddy",
    specialization: "Ophthalmologist",
    qualification: "MBBS, MS (Ophthalmology)",
    experience: 9,
    hospital: "Vision Eye Hospital",
    city: "Kochi",
    address: "NH Bypass, Thrikkakara, Kochi, Kerala – 682021",
    type: "hospital",
    fee: 550,
    rating: 4.7,
    reviews: 162,
    available: true,
    initials: "KR",
    color: "#6366f1",
    availableDays: ["Monday", "Wednesday", "Friday"],
    slots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"],
  },
  {
    id: 8,
    name: "Dr. Vikram Singh",
    specialization: "Psychiatrist",
    qualification: "MBBS, MD (Psychiatry)",
    experience: 11,
    hospital: "MindCare Clinic",
    city: "Jaipur",
    address: "B-45, Tilak Nagar, Jaipur, Rajasthan – 302004",
    type: "clinic",
    fee: 700,
    rating: 4.8,
    reviews: 89,
    available: true,
    initials: "VS",
    color: "#8b5cf6",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
  },
  {
    id: 9,
    name: "Dr. Ananya Das",
    specialization: "Endocrinologist",
    qualification: "MBBS, MD (Endocrinology)",
    experience: 13,
    hospital: "Max Healthcare",
    city: "Kolkata",
    address: "1, Manohar Pukur Rd, Kalighat, Kolkata – 700026",
    type: "hospital",
    fee: 900,
    rating: 4.6,
    reviews: 204,
    available: false,
    initials: "AD",
    color: "#ef4444",
    availableDays: ["Wednesday", "Thursday", "Saturday"],
    slots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
  },
  {
    id: 10,
    name: "Dr. Rohit Gupta",
    specialization: "General Physician",
    qualification: "MBBS, DNB (General Medicine)",
    experience: 5,
    hospital: "HealthFirst Clinic",
    city: "Lucknow",
    address: "16, Ashok Marg, Hazratganj, Lucknow, UP – 226001",
    type: "clinic",
    fee: 300,
    rating: 4.4,
    reviews: 76,
    available: true,
    initials: "RG",
    color: "#f97316",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    slots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "04:00 PM", "05:00 PM"],
  },
  {
    id: 11,
    name: "Dr. Sunita Joshi",
    specialization: "Rheumatologist",
    qualification: "MBBS, MD (Rheumatology)",
    experience: 16,
    hospital: "Medanta Hospital",
    city: "Gurugram",
    address: "CH Baktawar Singh Rd, Sector 38, Gurugram, Haryana – 122001",
    type: "hospital",
    fee: 1000,
    rating: 4.9,
    reviews: 298,
    available: true,
    initials: "SJ",
    color: "#14b8a6",
    availableDays: ["Monday", "Wednesday", "Friday"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
  },
  {
    id: 12,
    name: "Dr. Kiran Kumar",
    specialization: "Urologist",
    qualification: "MBBS, MS (Urology)",
    experience: 15,
    hospital: "Urology Specialty Clinic",
    city: "Ahmedabad",
    address: "304 Sterling Centre, Navarangpura, Ahmedabad, Gujarat – 380009",
    type: "clinic",
    fee: 750,
    rating: 4.5,
    reviews: 141,
    available: false,
    initials: "KK",
    color: "#64748b",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    slots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
  },
];

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const REASON_OPTIONS = [
  "General Consultation",
  "Follow-up Visit",
  "Second Opinion",
  "Routine Health Check-up",
  "New Symptoms / Complaint",
  "Prescription Renewal",
  "Test Results Discussion",
  "Pre-surgery Consultation",
  "Post-surgery Follow-up",
  "Chronic Disease Management",
  "Other",
];

/* ─── Generate Appointment ID ────────────────────────────────────── */
function generateAppointmentId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const seg1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const seg2 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * 36)].replace(/[A-Z]/, (c) => c)).join("").toUpperCase();
  return `MB-${seg1}-${seg2}`;
}

/* ─── Booking Success Card ───────────────────────────────────────── */
function BookingSuccessCard({ booking, doctor, onGoHome, onGoAppointments }) {
  return (
    <div className="bk-success-overlay" role="dialog" aria-labelledby="bk-success-title" aria-modal="true">
      <div className="bk-success-card">
        {/* Animated checkmark */}
        <div className="bk-success-icon-wrapper">
          <div className="bk-success-icon">
            <FaCheckCircle />
          </div>
          <div className="bk-success-ring" />
        </div>

        <h2 id="bk-success-title" className="bk-success-title">
          Appointment Booked!
        </h2>
        <p className="bk-success-subtitle">
          Your appointment request has been submitted successfully.
        </p>

        {/* Appointment Summary Card */}
        <div className="bk-confirm-summary">
          <div className="bk-confirm-header">
            <div
              className="bk-confirm-avatar"
              style={{ background: `linear-gradient(135deg, ${doctor.color}cc, ${doctor.color}66)` }}
            >
              {doctor.initials}
            </div>
            <div>
              <p className="bk-confirm-doctor">{doctor.name}</p>
              <p className="bk-confirm-spec">{doctor.specialization}</p>
            </div>
          </div>

          <dl className="bk-confirm-details">
            <div className="bk-confirm-row">
              <dt><FaIdCard className="bk-confirm-icon" /> Appointment ID</dt>
              <dd className="bk-appt-id">{booking.appointmentId}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt><FaCalendarCheck className="bk-confirm-icon" /> Date</dt>
              <dd>{booking.date}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt><FaClock className="bk-confirm-icon" /> Time</dt>
              <dd>{booking.slot}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt>
                {booking.consultationType === "video"
                  ? <FaVideo className="bk-confirm-icon" />
                  : <FaHospital className="bk-confirm-icon" />
                }
                Consultation
              </dt>
              <dd>{booking.consultationType === "video" ? "Video Consultation" : "In-Person Visit"}</dd>
            </div>
            <div className="bk-confirm-row">
              <dt><FaMapMarkerAlt className="bk-confirm-icon" /> Location</dt>
              <dd>{doctor.hospital}, {doctor.city}</dd>
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

          {/* Booking notice */}
          <div className={`bk-confirm-notice bk-confirm-notice--${doctor.type}`}>
            <FaExclamationCircle />
            <span>
              {doctor.type === "hospital"
                ? "This appointment request will be sent to the hospital for confirmation."
                : "This appointment will be booked directly with the doctor."}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="bk-success-actions">
          <button className="bk-btn bk-btn--outline" onClick={onGoHome} aria-label="Go to dashboard">
            <FaHome /> Go to Dashboard
          </button>
          <button className="bk-btn bk-btn--primary" onClick={onGoAppointments} aria-label="View my appointments">
            <FaCalendarCheck /> My Appointments
          </button>
        </div>

        <button className="bk-print-btn" onClick={() => window.print()} aria-label="Print appointment details">
          <FaPrint /> Print Details
        </button>
      </div>
    </div>
  );
}

/* ─── Main Booking Component ─────────────────────────────────────── */
function PatientBookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  /* Pre-filled from DoctorProfile navigation state */
  const preState = location.state || {};

  const doctor = doctorsData.find((d) => String(d.id) === String(id)) || doctorsData[0];
  const isHospital = doctor.type === "hospital";

  /* ── Form State ─────────────────────────────────────────────── */
  const today = new Date().toISOString().split("T")[0];

  const [selectedDay, setSelectedDay] = useState(preState.day || doctor.availableDays[0]);
  const [selectedSlot, setSelectedSlot] = useState(preState.slot || "");
  const [consultationType, setConsultationType] = useState("in-person");
  const [appointmentDate, setAppointmentDate] = useState(preState.date || "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);

  /* ── Validation ─────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!appointmentDate) errs.date = "Please select an appointment date.";
    if (!selectedSlot) errs.slot = "Please choose an available time slot.";
    if (!reason) errs.reason = "Please select a reason for your visit.";
    return errs;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleConfirm = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorEl = document.querySelector(".bk-field-error");
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});

    const formatted = new Date(appointmentDate).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setBooking({
      appointmentId: generateAppointmentId(),
      date: formatted,
      slot: selectedSlot,
      consultationType,
      reason,
      notes,
    });
  };

  /* ── Success screen ─────────────────────────────────────────── */
  if (booking) {
    return (
      <BookingSuccessCard
        booking={booking}
        doctor={doctor}
        onGoHome={() => navigate("/patient/dashboard")}
        onGoAppointments={() => navigate("/patient/appointments")}
      />
    );
  }

  return (
    <div className="bk-page">
      {/* ── Back Button ─────────────────────────────────────────── */}
      <button
        className="bk-back-btn"
        onClick={() => navigate(`/patient/doctor-profile/${doctor.id}`)}
        aria-label="Back to Doctor Profile"
      >
        <FaArrowLeft />
        <span>Back to Doctor Profile</span>
      </button>

      {/* ── Page Title ──────────────────────────────────────────── */}
      <header className="bk-page-header">
        <div>
          <h1 className="bk-page-title">Book Appointment</h1>
          <p className="bk-page-subtitle">
            Fill in the details below to request your appointment.
          </p>
        </div>
        <div className={`bk-booking-type-badge bk-booking-type-badge--${doctor.type}`}>
          {isHospital ? <FaHospital /> : <FaClinicMedical />}
          {isHospital ? "Hospital Booking" : "Direct Booking"}
        </div>
      </header>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      <div className="bk-grid">

        {/* ── LEFT: Booking Form ──────────────────────────── */}
        <div className="bk-col bk-col--form">

          {/* Booking Logic Notice */}
          <div className={`bk-notice bk-notice--${doctor.type}`} role="note">
            {isHospital ? <FaHospital className="bk-notice-icon" /> : <FaClinicMedical className="bk-notice-icon" />}
            <p className="bk-notice-text">
              {isHospital
                ? "This appointment request will be sent to the hospital for confirmation."
                : "This appointment will be booked directly with the doctor."}
            </p>
          </div>

          {/* ── Section: Patient Info ────────────────────── */}
          <section className="bk-form-section" aria-labelledby="bk-patient-heading">
            <h2 id="bk-patient-heading" className="bk-section-title">
              <FaUser className="bk-section-icon" />
              Patient Information
            </h2>
            <div className="bk-form-grid bk-form-grid--2">
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-patient-name">
                  Patient Name
                </label>
                <div className="bk-readonly-field" id="bk-patient-name" aria-readonly="true">
                  <FaUser className="bk-field-prefix-icon" />
                  <span>John Doe</span>
                  <span className="bk-readonly-badge">Auto-filled</span>
                </div>
              </div>
              <div className="bk-field">
                <label className="bk-label" htmlFor="bk-patient-id">
                  Patient ID
                </label>
                <div className="bk-readonly-field" id="bk-patient-id" aria-readonly="true">
                  <FaIdCard className="bk-field-prefix-icon" />
                  <span>#PT-20041</span>
                  <span className="bk-readonly-badge">Auto-filled</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section: Date & Time ─────────────────────── */}
          <section className="bk-form-section" aria-labelledby="bk-datetime-heading">
            <h2 id="bk-datetime-heading" className="bk-section-title">
              <FaCalendarCheck className="bk-section-icon" />
              Date &amp; Time
            </h2>

            {/* Date Picker */}
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-date">
                Appointment Date <span className="bk-required">*</span>
              </label>
              <div className={`bk-input-wrapper ${errors.date ? "bk-input--error" : ""}`}>
                <FaCalendarCheck className="bk-input-icon" />
                <input
                  id="bk-date"
                  type="date"
                  className="bk-input"
                  min={today}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: "" }));
                  }}
                  aria-describedby={errors.date ? "bk-date-error" : undefined}
                  aria-invalid={!!errors.date}
                />
              </div>
              {errors.date && (
                <p id="bk-date-error" className="bk-field-error" role="alert">
                  <FaTimesCircle /> {errors.date}
                </p>
              )}
            </div>

            {/* Available Days */}
            <div className="bk-field">
              <label className="bk-label">Available Days</label>
              <div className="bk-day-chips" role="group" aria-label="Select day">
                {DAYS_ORDER.filter((d) => doctor.availableDays.includes(d)).map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`bk-day-chip ${selectedDay === day ? "bk-day-chip--active" : ""}`}
                    onClick={() => { setSelectedDay(day); setSelectedSlot(""); }}
                    aria-pressed={selectedDay === day}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bk-field">
              <label className="bk-label">
                Time Slot — {selectedDay} <span className="bk-required">*</span>
              </label>
              <div
                className={`bk-slot-grid ${errors.slot ? "bk-slot-grid--error" : ""}`}
                role="group"
                aria-label="Select time slot"
                aria-describedby={errors.slot ? "bk-slot-error" : undefined}
              >
                {doctor.slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`bk-slot-btn ${selectedSlot === slot ? "bk-slot-btn--active" : ""}`}
                    onClick={() => {
                      setSelectedSlot(slot);
                      if (errors.slot) setErrors((prev) => ({ ...prev, slot: "" }));
                    }}
                    aria-pressed={selectedSlot === slot}
                  >
                    <FaClock className="bk-slot-icon" />
                    {slot}
                  </button>
                ))}
              </div>
              {errors.slot && (
                <p id="bk-slot-error" className="bk-field-error" role="alert">
                  <FaTimesCircle /> {errors.slot}
                </p>
              )}
            </div>
          </section>

          {/* ── Section: Consultation Type ───────────────── */}
          <section className="bk-form-section" aria-labelledby="bk-type-heading">
            <h2 id="bk-type-heading" className="bk-section-title">
              <FaVideo className="bk-section-icon" />
              Consultation Type
            </h2>
            <div className="bk-consult-options" role="radiogroup" aria-label="Choose consultation type">
              <label
                className={`bk-consult-card ${consultationType === "in-person" ? "bk-consult-card--active" : ""}`}
                htmlFor="bk-type-inperson"
              >
                <input
                  type="radio"
                  id="bk-type-inperson"
                  name="consultationType"
                  value="in-person"
                  className="bk-radio-hidden"
                  checked={consultationType === "in-person"}
                  onChange={() => setConsultationType("in-person")}
                />
                <div className="bk-consult-icon bk-consult-icon--visit">
                  <FaHospital />
                </div>
                <div className="bk-consult-info">
                  <p className="bk-consult-title">In-Person Visit</p>
                  <p className="bk-consult-desc">Visit the doctor at the clinic / hospital</p>
                </div>
                <div className="bk-consult-check">
                  <FaCheckCircle />
                </div>
              </label>

              <label
                className={`bk-consult-card ${consultationType === "video" ? "bk-consult-card--active" : ""}`}
                htmlFor="bk-type-video"
              >
                <input
                  type="radio"
                  id="bk-type-video"
                  name="consultationType"
                  value="video"
                  className="bk-radio-hidden"
                  checked={consultationType === "video"}
                  onChange={() => setConsultationType("video")}
                />
                <div className="bk-consult-icon bk-consult-icon--video">
                  <FaVideo />
                </div>
                <div className="bk-consult-info">
                  <p className="bk-consult-title">Video Consultation</p>
                  <p className="bk-consult-desc">Consult online via video call from home</p>
                </div>
                <div className="bk-consult-check">
                  <FaCheckCircle />
                </div>
              </label>
            </div>
          </section>

          {/* ── Section: Visit Details ───────────────────── */}
          <section className="bk-form-section" aria-labelledby="bk-visit-heading">
            <h2 id="bk-visit-heading" className="bk-section-title">
              <FaFileAlt className="bk-section-icon" />
              Visit Details
            </h2>

            {/* Reason for Visit */}
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-reason">
                Reason for Visit <span className="bk-required">*</span>
              </label>
              <div className={`bk-input-wrapper ${errors.reason ? "bk-input--error" : ""}`}>
                <FaFileAlt className="bk-input-icon" />
                <select
                  id="bk-reason"
                  className="bk-select"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
                  }}
                  aria-describedby={errors.reason ? "bk-reason-error" : undefined}
                  aria-invalid={!!errors.reason}
                >
                  <option value="">Select reason…</option>
                  {REASON_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {errors.reason && (
                <p id="bk-reason-error" className="bk-field-error" role="alert">
                  <FaTimesCircle /> {errors.reason}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bk-field">
              <label className="bk-label" htmlFor="bk-notes">
                Additional Notes{" "}
                <span className="bk-optional">(optional)</span>
              </label>
              <div className="bk-textarea-wrapper">
                <FaStickyNote className="bk-textarea-icon" />
                <textarea
                  id="bk-notes"
                  className="bk-textarea"
                  placeholder="Describe your symptoms, share previous reports, or add any special instructions for the doctor…"
                  rows={4}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <p className="bk-char-count">{notes.length}/500 characters</p>
            </div>
          </section>

          {/* ── Action Buttons ───────────────────────────── */}
          <div className="bk-form-actions">
            <button
              type="button"
              className="bk-btn bk-btn--cancel"
              onClick={() => navigate(`/patient/doctor-profile/${doctor.id}`)}
              aria-label="Cancel and go back"
            >
              <FaTimesCircle />
              Cancel
            </button>
            <button
              type="button"
              className="bk-btn bk-btn--primary"
              onClick={handleConfirm}
              aria-label="Confirm appointment"
            >
              <FaCalendarCheck />
              Confirm Appointment
            </button>
          </div>
        </div>

        {/* ── RIGHT: Appointment Summary ──────────────── */}
        <aside className="bk-col bk-col--summary" aria-label="Appointment summary">

          {/* Doctor Card */}
          <div className="bk-summary-card">
            <h3 className="bk-summary-heading">Appointment Summary</h3>

            {/* Doctor info */}
            <div className="bk-summary-doctor">
              <div
                className="bk-summary-avatar"
                style={{ background: `linear-gradient(135deg, ${doctor.color}cc, ${doctor.color}66)` }}
                aria-label={`Photo of ${doctor.name}`}
              >
                <span className="bk-summary-initials">{doctor.initials}</span>
              </div>
              <div className="bk-summary-doc-info">
                <p className="bk-summary-doc-name">{doctor.name}</p>
                <p className="bk-summary-doc-spec">
                  <FaStethoscope className="bk-si" />
                  {doctor.specialization}
                </p>
                <div className="bk-summary-rating">
                  <FaStar className="bk-star" />
                  <span>{doctor.rating}</span>
                  <span className="bk-rev">({doctor.reviews})</span>
                </div>
              </div>
            </div>

            <hr className="bk-divider" />

            {/* Summary rows */}
            <dl className="bk-summary-rows">
              <div className="bk-summary-row">
                <dt>
                  {isHospital
                    ? <FaHospital className="bk-si bk-si--hospital" />
                    : <FaClinicMedical className="bk-si bk-si--clinic" />
                  }
                  {isHospital ? "Hospital" : "Clinic"}
                </dt>
                <dd>{doctor.hospital}</dd>
              </div>
              <div className="bk-summary-row">
                <dt><FaMapMarkerAlt className="bk-si bk-si--loc" /> Location</dt>
                <dd>{doctor.city}</dd>
              </div>
              <div className="bk-summary-row">
                <dt><FaMoneyBillWave className="bk-si bk-si--fee" /> Consult Fee</dt>
                <dd className="bk-fee-val">₹{doctor.fee}</dd>
              </div>
              <div className="bk-summary-row">
                <dt>
                  {consultationType === "video"
                    ? <FaVideo className="bk-si bk-si--video" />
                    : <FaUserMd className="bk-si bk-si--person" />
                  }
                  Type
                </dt>
                <dd>{consultationType === "video" ? "Video Call" : "In-Person"}</dd>
              </div>
              {selectedSlot && (
                <div className="bk-summary-row">
                  <dt><FaClock className="bk-si" /> Time Slot</dt>
                  <dd className="bk-slot-val">{selectedSlot}</dd>
                </div>
              )}
              {appointmentDate && (
                <div className="bk-summary-row">
                  <dt><FaCalendarCheck className="bk-si" /> Date</dt>
                  <dd>{new Date(appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</dd>
                </div>
              )}
            </dl>

            <hr className="bk-divider" />

            {/* Address */}
            <div className="bk-summary-address">
              <p className="bk-summary-address-label">
                <FaMapMarkerAlt className="bk-si bk-si--loc" /> Full Address
              </p>
              <p className="bk-summary-address-text">{doctor.address}</p>
            </div>

            {/* Booking type notice (right column) */}
            <div className={`bk-summary-notice bk-summary-notice--${doctor.type}`}>
              {isHospital ? <FaHospital /> : <FaClinicMedical />}
              <span>
                {isHospital
                  ? "Booked through the hospital"
                  : "Booked directly with the doctor"}
              </span>
            </div>
          </div>

          {/* Help card */}
          <div className="bk-help-card">
            <p className="bk-help-title">Need Help?</p>
            <p className="bk-help-desc">
              For assistance with your appointment, contact our support team.
            </p>
            <p className="bk-help-contact">📞 1800-123-4567 <span>(Toll Free)</span></p>
            <p className="bk-help-contact">✉ support@medicobridge.in</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PatientBookAppointment;
