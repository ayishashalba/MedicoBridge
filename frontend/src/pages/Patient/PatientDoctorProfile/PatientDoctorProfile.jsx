import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaStethoscope,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaHospital,
  FaClinicMedical,
  FaMoneyBillWave,
  FaBriefcase,
  FaCalendarCheck,
  FaVideo,
  FaGraduationCap,
  FaCertificate,
  FaLanguage,
  FaCheckCircle,
  FaClock,
  FaUserMd,
  FaQuoteLeft,
  FaThumbsUp,
  FaPhone,
  FaEnvelope,
  FaShareAlt,
  FaHeartbeat,
} from "react-icons/fa";
import "./PatientDoctorProfile.css";

/* ─── Full Dummy Doctor Dataset ──────────────────────────────────── */
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
    languages: ["English", "Hindi", "Urdu"],
    about:
      "Dr. Aisha Khan is a highly experienced Cardiologist at Apollo Hospitals, Mumbai, with over 14 years of expertise in diagnosing and treating complex heart conditions. She specializes in interventional cardiology, echocardiography, and preventive cardiac care. Known for her compassionate approach, she has successfully treated thousands of patients with heart disease, hypertension, and cardiac arrhythmias.",
    availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
    slots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:30 PM"],
    education: [
      { degree: "MBBS", institution: "King Edward Memorial Hospital, Mumbai", year: "2005" },
      { degree: "MD – Internal Medicine", institution: "Seth GS Medical College, Mumbai", year: "2009" },
      { degree: "DM – Cardiology", institution: "AIIMS New Delhi", year: "2012" },
    ],
    certifications: [
      "Fellow of the Cardiological Society of India (FCSI)",
      "Board Certified in Interventional Cardiology",
      "Advanced Cardiac Life Support (ACLS) Certified",
      "Certified in Echocardiography – ICCE",
    ],
    services: [
      "Interventional Cardiology",
      "Echocardiography (Echo)",
      "Cardiac Risk Assessment",
      "Hypertension Management",
      "Arrhythmia Treatment",
      "Heart Failure Management",
      "Preventive Cardiology",
      "Lipid Disorder Treatment",
    ],
    patientReviews: [
      {
        id: 1,
        name: "Ravi Mehta",
        rating: 5,
        date: "June 2025",
        comment:
          "Dr. Aisha is absolutely brilliant! She explained my condition in simple terms and the treatment plan she suggested worked wonders. Highly recommend!",
        helpful: 24,
        avatar: "RM",
        avatarColor: "#0284c7",
      },
      {
        id: 2,
        name: "Sunita Sharma",
        rating: 5,
        date: "May 2025",
        comment:
          "Very thorough and caring doctor. She spent a lot of time with me and answered all my questions. The clinic is well-organized and the staff is friendly.",
        helpful: 18,
        avatar: "SS",
        avatarColor: "#10b981",
      },
      {
        id: 3,
        name: "Anil Desai",
        rating: 4,
        date: "April 2025",
        comment:
          "Good experience overall. Had to wait a bit but the consultation was worth it. Dr. Khan is very knowledgeable and professional.",
        helpful: 11,
        avatar: "AD",
        avatarColor: "#f59e0b",
      },
    ],
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
    languages: ["English", "Hindi", "Punjabi"],
    about:
      "Dr. Rahul Verma is an accomplished Orthopedic Surgeon at Fortis Healthcare with a decade of experience in joint replacement surgeries, sports injuries, and spinal disorders. He has performed over 2,000 successful joint replacement procedures and is known for his minimally invasive surgical techniques that ensure faster recovery.",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    slots: ["10:00 AM", "10:30 AM", "11:00 AM", "12:00 PM", "03:00 PM", "04:00 PM"],
    education: [
      { degree: "MBBS", institution: "Maulana Azad Medical College, Delhi", year: "2007" },
      { degree: "MS – Orthopaedics", institution: "AIIMS, New Delhi", year: "2011" },
      { degree: "Fellowship in Joint Replacement", institution: "Hospital for Special Surgery, New York", year: "2013" },
    ],
    certifications: [
      "Fellow of the Indian Orthopaedic Association (IOA)",
      "Certified in Minimally Invasive Joint Replacement",
      "AO Trauma Certification",
      "Advanced Arthroscopy Certification",
    ],
    services: [
      "Total Knee Replacement",
      "Total Hip Replacement",
      "Shoulder Replacement",
      "Arthroscopic Surgery",
      "Sports Injury Treatment",
      "Spinal Disorder Management",
      "Fracture Management",
      "Bone Infection Treatment",
    ],
    patientReviews: [
      {
        id: 1,
        name: "Priya Kapoor",
        rating: 5,
        date: "June 2025",
        comment:
          "Dr. Verma performed my knee replacement surgery and I am fully recovered. Exceptional skill and very caring attitude throughout my treatment.",
        helpful: 31,
        avatar: "PK",
        avatarColor: "#7c3aed",
      },
      {
        id: 2,
        name: "Mohan Lal",
        rating: 4,
        date: "May 2025",
        comment:
          "Very professional. Explained the procedure clearly before my surgery. Recovery was smooth thanks to his guidance.",
        helpful: 15,
        avatar: "ML",
        avatarColor: "#ef4444",
      },
    ],
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
    languages: ["English", "Hindi", "Kannada"],
    about:
      "Dr. Priya Sharma is a dedicated Dermatologist running her own private clinic in Bangalore. With 8 years of expertise, she specializes in cosmetic dermatology, hair disorders, and treating chronic skin conditions. Her clinic is equipped with state-of-the-art laser and aesthetic devices.",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    slots: ["10:00 AM", "11:00 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:00 PM"],
    education: [
      { degree: "MBBS", institution: "Bangalore Medical College, Bangalore", year: "2010" },
      { degree: "MD – Dermatology", institution: "St. John's Medical College, Bangalore", year: "2014" },
    ],
    certifications: [
      "Member of Indian Association of Dermatologists",
      "Certified Laser Therapist",
      "Cosmetic Dermatology Certification",
    ],
    services: [
      "Acne & Acne Scar Treatment",
      "Hair Loss Treatment (PRP)",
      "Laser Skin Resurfacing",
      "Pigmentation Treatment",
      "Anti-Aging Treatments",
      "Eczema & Psoriasis Management",
      "Chemical Peels",
      "Skin Allergy Testing",
    ],
    patientReviews: [
      {
        id: 1,
        name: "Meena Iyer",
        rating: 5,
        date: "June 2025",
        comment:
          "Dr. Priya is amazing! My skin has improved significantly after just 3 sessions. She is very thorough and the clinic is spotless.",
        helpful: 28,
        avatar: "MI",
        avatarColor: "#0d9488",
      },
      {
        id: 2,
        name: "Ranjith Kumar",
        rating: 5,
        date: "April 2025",
        comment:
          "Excellent doctor. Treated my psoriasis very effectively. Would highly recommend to anyone with chronic skin conditions.",
        helpful: 20,
        avatar: "RK",
        avatarColor: "#f59e0b",
      },
    ],
  },
];

/* Fallback for ids not in our partial list */
const fallbackDoctor = doctorsData[0];

/* ─── Helpers ────────────────────────────────────────────────────── */
function StarRating({ rating, size = "md" }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className={`dp-stars dp-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) return <FaStar key={i} />;
        if (i === full + 1 && half) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} />;
      })}
    </span>
  );
}

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ─── Main Component ─────────────────────────────────────────────── */
function PatientDoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const doctor =
    doctorsData.find((d) => String(d.id) === String(id)) || fallbackDoctor;

  const [selectedDay, setSelectedDay] = useState(doctor.availableDays[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingMsg, setBookingMsg] = useState("");

  const isHospital = doctor.type === "hospital";

  const handleBookAppointment = () => {
    navigate(`/patient/book-appointment/${doctor.id}`, {
      state: {
        day: selectedDay,
        slot: selectedSlot || "",
      }
    });
  };

  return (
    <div className="dp-page">
      {/* ── Back Button ───────────────────────────────────────── */}
      <button
        className="dp-back-btn"
        onClick={() => navigate("/patient/find-doctors")}
        aria-label="Back to Find Doctors"
      >
        <FaArrowLeft />
        <span>Back to Find Doctors</span>
      </button>

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="dp-hero" aria-label="Doctor profile hero">
        {/* Availability badge */}
        <div
          className={`dp-hero-availability ${doctor.available ? "dp-avail--yes" : "dp-avail--no"}`}
        >
          {doctor.available ? <FaCheckCircle /> : <FaClock />}
          {doctor.available ? "Available Today" : "Currently Unavailable"}
        </div>

        <div className="dp-hero-inner">
          {/* Avatar */}
          <div
            className="dp-hero-avatar"
            style={{
              background: `linear-gradient(135deg, ${doctor.color}dd, ${doctor.color}88)`,
              boxShadow: `0 8px 32px ${doctor.color}44`,
            }}
            aria-label={`Photo of ${doctor.name}`}
          >
            <span className="dp-hero-initials">{doctor.initials}</span>
            <span
              className={`dp-hero-status ${doctor.available ? "dp-status--online" : "dp-status--offline"}`}
            />
          </div>

          {/* Identity */}
          <div className="dp-hero-identity">
            <div className="dp-hero-name-row">
              <h1 className="dp-hero-name">{doctor.name}</h1>
              <span
                className={`dp-type-pill dp-type-pill--${doctor.type}`}
              >
                {isHospital ? <FaHospital /> : <FaClinicMedical />}
                {isHospital ? "Hospital Doctor" : "Private Clinic Doctor"}
              </span>
            </div>

            <p className="dp-hero-spec">
              <FaStethoscope className="dp-inline-icon" />
              {doctor.specialization}
            </p>
            <p className="dp-hero-qual">
              <FaGraduationCap className="dp-inline-icon" />
              {doctor.qualification}
            </p>

            {/* Stats row */}
            <div className="dp-hero-stats">
              <div className="dp-stat-chip">
                <FaBriefcase />
                <div>
                  <span className="dp-stat-val">{doctor.experience}+</span>
                  <span className="dp-stat-lbl">Years Exp.</span>
                </div>
              </div>
              <div className="dp-stat-chip">
                <FaStar className="dp-stat-star" />
                <div>
                  <span className="dp-stat-val">{doctor.rating}</span>
                  <span className="dp-stat-lbl">{doctor.reviews} Reviews</span>
                </div>
              </div>
              <div className="dp-stat-chip">
                <FaMoneyBillWave className="dp-stat-fee" />
                <div>
                  <span className="dp-stat-val">₹{doctor.fee}</span>
                  <span className="dp-stat-lbl">Consult Fee</span>
                </div>
              </div>
              <div className="dp-stat-chip">
                <FaLanguage />
                <div>
                  <span className="dp-stat-val">{doctor.languages.length}</span>
                  <span className="dp-stat-lbl">Languages</span>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="dp-lang-chips">
              {doctor.languages.map((lang) => (
                <span key={lang} className="dp-lang-chip">
                  {lang}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="dp-hero-ctas">
              <button
                className="dp-btn dp-btn--primary"
                onClick={handleBookAppointment}
                aria-label="Book appointment"
              >
                <FaCalendarCheck />
                Book Appointment
              </button>
              <button
                className="dp-btn dp-btn--outline"
                aria-label="Start online consultation (UI only)"
              >
                <FaVideo />
                Start Consultation
              </button>
              <button
                className="dp-btn dp-btn--ghost"
                aria-label="Share profile"
              >
                <FaShareAlt />
              </button>
            </div>

            {/* Booking message */}
            {bookingMsg && (
              <div className="dp-booking-notice" role="status">
                {bookingMsg}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Grid ─────────────────────────────────────────── */}
      <div className="dp-grid">
        {/* ── LEFT COLUMN ─────────────────────────── */}
        <div className="dp-col dp-col--left">

          {/* About */}
          <section className="dp-card" aria-labelledby="dp-about-heading">
            <div className="dp-card-header">
              <FaUserMd className="dp-card-header-icon dp-icon--about" />
              <h2 id="dp-about-heading" className="dp-card-title">About Doctor</h2>
            </div>
            <p className="dp-about-text">{doctor.about}</p>
          </section>

          {/* Education */}
          <section className="dp-card" aria-labelledby="dp-edu-heading">
            <div className="dp-card-header">
              <FaGraduationCap className="dp-card-header-icon dp-icon--edu" />
              <h2 id="dp-edu-heading" className="dp-card-title">Education</h2>
            </div>
            <ol className="dp-timeline">
              {doctor.education.map((edu, idx) => (
                <li key={idx} className="dp-timeline-item">
                  <div className="dp-timeline-dot" />
                  <div className="dp-timeline-body">
                    <p className="dp-timeline-degree">{edu.degree}</p>
                    <p className="dp-timeline-inst">{edu.institution}</p>
                    <span className="dp-timeline-year">{edu.year}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Certifications */}
          <section className="dp-card" aria-labelledby="dp-cert-heading">
            <div className="dp-card-header">
              <FaCertificate className="dp-card-header-icon dp-icon--cert" />
              <h2 id="dp-cert-heading" className="dp-card-title">Certifications</h2>
            </div>
            <ul className="dp-cert-list">
              {doctor.certifications.map((cert, idx) => (
                <li key={idx} className="dp-cert-item">
                  <FaCheckCircle className="dp-cert-check" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Services */}
          <section className="dp-card" aria-labelledby="dp-svc-heading">
            <div className="dp-card-header">
              <FaHeartbeat className="dp-card-header-icon dp-icon--svc" />
              <h2 id="dp-svc-heading" className="dp-card-title">Services Offered</h2>
            </div>
            <div className="dp-services-grid">
              {doctor.services.map((svc, idx) => (
                <span key={idx} className="dp-service-chip">
                  <FaCheckCircle className="dp-service-icon" />
                  {svc}
                </span>
              ))}
            </div>
          </section>

          {/* Patient Reviews */}
          <section className="dp-card" aria-labelledby="dp-reviews-heading">
            <div className="dp-card-header">
              <FaStar className="dp-card-header-icon dp-icon--review" />
              <h2 id="dp-reviews-heading" className="dp-card-title">
                Patient Reviews
              </h2>
              <span className="dp-review-count-badge">
                {doctor.reviews} total
              </span>
            </div>
            {/* Overall rating summary */}
            <div className="dp-rating-summary">
              <div className="dp-rating-big">
                <span className="dp-rating-number">{doctor.rating}</span>
                <StarRating rating={doctor.rating} size="lg" />
                <span className="dp-rating-label">
                  out of 5 · {doctor.reviews} reviews
                </span>
              </div>
            </div>
            {/* Individual reviews */}
            <div className="dp-reviews-list">
              {doctor.patientReviews.map((rev) => (
                <article key={rev.id} className="dp-review-card">
                  <div className="dp-review-header">
                    <div
                      className="dp-review-avatar"
                      style={{ background: `linear-gradient(135deg, ${rev.avatarColor}cc, ${rev.avatarColor}66)` }}
                    >
                      {rev.avatar}
                    </div>
                    <div className="dp-review-meta">
                      <p className="dp-review-name">{rev.name}</p>
                      <div className="dp-review-rating-row">
                        <StarRating rating={rev.rating} size="sm" />
                        <span className="dp-review-date">{rev.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="dp-review-comment">
                    <FaQuoteLeft className="dp-quote-icon" />
                    {rev.comment}
                  </p>
                  <button
                    className="dp-helpful-btn"
                    aria-label={`Mark review by ${rev.name} as helpful`}
                  >
                    <FaThumbsUp />
                    Helpful ({rev.helpful})
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────── */}
        <div className="dp-col dp-col--right">

          {/* Practice Information */}
          <section className="dp-card" aria-labelledby="dp-practice-heading">
            <div className="dp-card-header">
              {isHospital
                ? <FaHospital className="dp-card-header-icon dp-icon--hosp" />
                : <FaClinicMedical className="dp-card-header-icon dp-icon--clinic" />
              }
              <h2 id="dp-practice-heading" className="dp-card-title">
                Practice Information
              </h2>
            </div>
            <dl className="dp-practice-list">
              <div className="dp-practice-item">
                <dt className="dp-prac-label">Practice Type</dt>
                <dd>
                  <span className={`dp-type-pill dp-type-pill--${doctor.type} dp-type-pill--sm`}>
                    {isHospital ? <FaHospital /> : <FaClinicMedical />}
                    {isHospital ? "Hospital Doctor" : "Private Clinic Doctor"}
                  </span>
                </dd>
              </div>
              <div className="dp-practice-item">
                <dt className="dp-prac-label">
                  {isHospital ? "Hospital Name" : "Clinic Name"}
                </dt>
                <dd className="dp-prac-value">{doctor.hospital}</dd>
              </div>
              <div className="dp-practice-item">
                <dt className="dp-prac-label">City</dt>
                <dd className="dp-prac-value">
                  <FaMapMarkerAlt className="dp-prac-icon dp-icon--loc" />
                  {doctor.city}
                </dd>
              </div>
              <div className="dp-practice-item">
                <dt className="dp-prac-label">Full Address</dt>
                <dd className="dp-prac-value dp-prac-address">{doctor.address}</dd>
              </div>
            </dl>
          </section>

          {/* Booking Notice */}
          <div className={`dp-booking-info-card dp-booking-info--${doctor.type}`}>
            {isHospital ? (
              <>
                <FaHospital className="dp-booking-info-icon" />
                <div>
                  <p className="dp-booking-info-title">Hospital Booking</p>
                  <p className="dp-booking-info-desc">
                    Appointment will be booked through the hospital. Our coordination team will assist you.
                  </p>
                </div>
              </>
            ) : (
              <>
                <FaClinicMedical className="dp-booking-info-icon" />
                <div>
                  <p className="dp-booking-info-title">Direct Booking</p>
                  <p className="dp-booking-info-desc">
                    Appointment will be booked directly with the doctor. Confirmation within 30 minutes.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Availability Schedule */}
          <section className="dp-card" aria-labelledby="dp-avail-heading">
            <div className="dp-card-header">
              <FaCalendarCheck className="dp-card-header-icon dp-icon--cal" />
              <h2 id="dp-avail-heading" className="dp-card-title">Available Schedule</h2>
            </div>

            {/* Day selector */}
            <p className="dp-avail-sub">Available Days</p>
            <div className="dp-day-chips" role="group" aria-label="Select available day">
              {DAYS_ORDER.filter((d) => doctor.availableDays.includes(d)).map((day) => (
                <button
                  key={day}
                  className={`dp-day-chip ${selectedDay === day ? "dp-day-chip--active" : ""}`}
                  onClick={() => { setSelectedDay(day); setSelectedSlot(null); }}
                  aria-pressed={selectedDay === day}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Time slots */}
            <p className="dp-avail-sub" style={{ marginTop: "1rem" }}>
              Time Slots — {selectedDay}
            </p>
            <div className="dp-slot-grid" role="group" aria-label="Select time slot">
              {doctor.slots.map((slot) => (
                <button
                  key={slot}
                  className={`dp-slot-btn ${selectedSlot === slot ? "dp-slot-btn--active" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={selectedSlot === slot}
                >
                  <FaClock className="dp-slot-icon" />
                  {slot}
                </button>
              ))}
            </div>

            {selectedSlot && (
              <div className="dp-slot-selected-notice">
                <FaCheckCircle />
                Selected: <strong>{selectedDay}</strong> at <strong>{selectedSlot}</strong>
              </div>
            )}
          </section>

          {/* Book CTA (sticky in right col) */}
          <div className="dp-cta-sticky">
            <button
              className="dp-btn dp-btn--primary dp-btn--full"
              onClick={handleBookAppointment}
              aria-label="Book appointment"
            >
              <FaCalendarCheck />
              Book Appointment
              {selectedSlot && <span className="dp-cta-slot-tag">{selectedSlot}</span>}
            </button>
            <button
              className="dp-btn dp-btn--outline dp-btn--full"
              aria-label="Start consultation (UI only)"
            >
              <FaVideo />
              Start Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Floating booking toast */}
      {bookingMsg && (
        <div className="dp-toast" role="alert">
          {bookingMsg}
        </div>
      )}
    </div>
  );
}

export default PatientDoctorProfile;
