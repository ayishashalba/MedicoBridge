import React, { useEffect, useMemo, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

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
  FaTimes,
} from "react-icons/fa";

import {
  isDoctorSaved,
  toggleSaveDoctorInStorage,
} from "../../../utils/savedDoctorsStorage";

import { API_BASE_URL } from "../../../services/apiConfig";

import "./PatientDoctorProfile.css";

const IMAGE_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function getDoctorLocation(doctor) {
  return (
    doctor.city ||
    doctor.clinicCity ||
    doctor.hospital?.city ||
    doctor.hospitalId?.city ||
    "Location not provided"
  );
}

function getHospitalName(doctor) {
  if (doctor.practiceType === "clinic") {
    return doctor.clinicName || "Private Clinic";
  }

  return (
    doctor.hospitalName ||
    doctor.hospital?.name ||
    doctor.hospitalId?.name ||
    "Hospital not provided"
  );
}

function getDoctorType(doctor) {
  const practiceType = String(
    doctor.practiceType || ""
  ).toLowerCase();

  if (practiceType === "clinic") {
    return "clinic";
  }

  return "hospital";
}

function getInitials(name = "Doctor") {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}

function StarRating({
  rating = 0,
  size = "md",
}) {
  const numericRating = Number(rating) || 0;

  const full = Math.floor(numericRating);

  const half =
    numericRating % 1 >= 0.5;

  return (
    <span
      className={`dp-stars dp-stars--${size}`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) {
          return <FaStar key={i} />;
        }

        if (
          i === full + 1 &&
          half
        ) {
          return (
            <FaStarHalfAlt key={i} />
          );
        }

        return (
          <FaRegStar key={i} />
        );
      })}
    </span>
  );
}

function PatientDoctorProfile() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [doctor, setDoctor] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [bookingMsg, setBookingMsg] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);

  /*
   * Fetch real doctor profile
   */
  useEffect(() => {
    let cancelled = false;

    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        if (!id) {
          throw new Error(
            "Doctor ID is missing."
          );
        }

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/patient/doctors/${encodeURIComponent(
            id
          )}`,
          {
            headers: token
              ? {
                Authorization:
                  `Bearer ${token}`,
              }
              : {},
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            `Failed to fetch doctor profile (${response.status}).`
          );
        }

        const fetchedDoctor =
          data.data;

        if (!fetchedDoctor) {
          throw new Error(
            "Doctor profile was not returned by the server."
          );
        }

        if (cancelled) return;

        setDoctor(fetchedDoctor);

        setSelectedDay(
          fetchedDoctor.availableDays?.[0] ||
          null
        );

        setSelectedSlot(null);

        setIsSaved(
          isDoctorSaved(
            fetchedDoctor._id
          )
        );
      } catch (error) {
        console.error(
          "Patient doctor profile error:",
          error
        );

        if (!cancelled) {
          setDoctor(null);

          setErrorMessage(
            error.message ||
            "Unable to load doctor profile."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDoctor();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * Saved doctor listener
   */
  useEffect(() => {
    if (!doctor?._id) return;

    const handleSavedDoctorsUpdate =
      () => {
        setIsSaved(
          isDoctorSaved(
            doctor._id
          )
        );
      };

    window.addEventListener(
      "savedDoctorsUpdated",
      handleSavedDoctorsUpdate
    );

    return () => {
      window.removeEventListener(
        "savedDoctorsUpdated",
        handleSavedDoctorsUpdate
      );
    };
  }, [doctor?._id]);

  /*
   * Derived data
   */
  const doctorType = useMemo(() => {
    if (!doctor) return "hospital";

    return getDoctorType(doctor);
  }, [doctor]);

  const isHospital =
    doctorType === "hospital";

  const doctorName =
    doctor?.name || "Doctor";

  const initials =
    getInitials(doctorName);

  const location =
    doctor
      ? getDoctorLocation(doctor)
      : "";

  const hospitalName =
    doctor
      ? getHospitalName(doctor)
      : "";

  const consultationFee =
    doctor?.consultationFee != null
      ? Number(
        doctor.consultationFee
      )
      : 500;

  const rating =
    Number(doctor?.rating) || 0;

  const reviews =
    Number(doctor?.reviews) || 0;

  const experience =
    Number(doctor?.experience) || 0;

  const languages =
    Array.isArray(
      doctor?.languages
    )
      ? doctor.languages
      : [];

  const availableDays =
    Array.isArray(
      doctor?.availableDays
    )
      ? doctor.availableDays
      : [];

  const slots = useMemo(() => {
    const raw =
      Array.isArray(doctor?.availableSlots) && doctor.availableSlots.length > 0
        ? doctor.availableSlots
        : Array.isArray(doctor?.slots) && doctor.slots.length > 0
        ? doctor.slots
        : [];
    if (!selectedDay || !raw.length) return [];
    const first = raw[0];
    if (typeof first === "object" && first !== null) {
      return raw
        .filter((s) => s && s.day === selectedDay && s.isAvailable !== false)
        .map((s) => s.startTime || s.endTime || s.time || "")
        .filter(Boolean);
    }
    if (typeof first === "string") {
      return raw.filter(Boolean);
    }
    return [];
  }, [doctor, selectedDay]);

  const education =
    Array.isArray(
      doctor?.education
    )
      ? doctor.education
      : [];

  const certifications =
    Array.isArray(
      doctor?.certifications
    )
      ? doctor.certifications
      : [];

  const services =
    Array.isArray(
      doctor?.services
    )
      ? doctor.services
      : [];

  /*
   * Booking
   */
  const handleBookAppointment =
    () => {
      if (!doctor?._id) return;

      navigate(
        `/patient/book-appointment/${doctor._id}`,
        {
          state: {
            day:
              selectedDay || "",
            slot:
              selectedSlot || "",
          },
        }
      );
    };

  /*
   * Save doctor
   */
  const handleSaveDoctor =
    () => {
      if (!doctor?._id) return;

      const nowSaved =
        toggleSaveDoctorInStorage(
          {
            ...doctor,
            id: doctor._id,
          }
        );

      setIsSaved(nowSaved);

      setBookingMsg(
        nowSaved
          ? "Doctor saved to your profile!"
          : "Doctor removed from saved list."
      );

      setTimeout(() => {
        setBookingMsg("");
      }, 3000);
    };

  /*
   * Share profile
   */
  const handleShareProfile =
    async () => {
      try {
        const url =
          window.location.href;

        if (
          navigator.share
        ) {
          await navigator.share({
            title:
              doctorName,
            text:
              `View ${doctorName}'s doctor profile`,
            url,
          });

          return;
        }

        if (
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            url
          );

          setBookingMsg(
            "Profile link copied to clipboard!"
          );
        } else {
          setBookingMsg(
            `Profile link: ${url}`
          );
        }
      } catch (error) {
        /*
         * User cancelled native share.
         */
        if (
          error?.name !==
          "AbortError"
        ) {
          console.error(
            "Share profile error:",
            error
          );
        }
      }

      setTimeout(() => {
        setBookingMsg("");
      }, 3000);
    };

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="dp-page">
        <div className="dp-empty-state">
          <div className="dp-empty-icon">
            <FaStethoscope />
          </div>

          <h2>
            Loading doctor profile...
          </h2>

          <p>
            Please wait while we fetch
            the doctor's information.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (errorMessage || !doctor) {
    return (
      <div className="dp-page">
        <div className="dp-empty-state">
          <div className="dp-empty-icon">
            <FaTimes />
          </div>

          <h2>
            Unable to load doctor profile
          </h2>

          <p>
            {errorMessage ||
              "Doctor profile not found."}
          </p>

          <button
            className="dp-btn dp-btn--primary"
            onClick={() =>
              navigate(
                "/patient/find-doctors"
              )
            }
          >
            <FaArrowLeft />
            Back to Find Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-page">

      {/* Header */}
      <div className="dp-header-nav-row">

        <button
          className="dp-back-btn"
          onClick={() =>
            navigate(
              "/patient/find-doctors"
            )
          }
          aria-label="Back to Find Doctors"
        >
          <FaArrowLeft />
          <span>
            Back to Find Doctors
          </span>
        </button>

        <div className="dp-header-actions">

          <button
            className={`dp-header-action-btn ${isSaved
                ? "dp-header-action-btn--saved"
                : ""
              }`}
            onClick={
              handleSaveDoctor
            }
          >
            {isSaved
              ? "❤️ Saved"
              : "🤍 Save Doctor"}
          </button>

          <button
            className="dp-header-action-btn"
            onClick={
              handleShareProfile
            }
          >
            <FaShareAlt />
            Share Profile
          </button>

        </div>
      </div>

      {/* Availability */}
      <div
        className={`dp-availability-banner ${doctor.isAvailable === false
            ? "dp-banner--unavail"
            : "dp-banner--avail"
          }`}
      >
        {doctor.isAvailable ===
          false ? (
          <span>
            🔴 Currently Unavailable
          </span>
        ) : (
          <span>
            🟢 Doctor profile available
          </span>
        )}
      </div>

      {/* Hero */}
      <section
        className="dp-hero"
        aria-label="Doctor profile hero"
      >

        <div
          className={`dp-hero-availability ${doctor.isAvailable === false
              ? "dp-avail--no"
              : "dp-avail--yes"
            }`}
        >
          {doctor.isAvailable ===
            false ? (
            <>
              <FaClock />
              Currently Unavailable
            </>
          ) : (
            <>
              <FaCheckCircle />
              Available for Booking
            </>
          )}
        </div>

        <div className="dp-hero-inner">

          {/* Avatar */}
          <div
            className="dp-hero-avatar"
            aria-label={`Photo of ${doctorName}`}
          >
            {doctor.profileImage ? (
              <img
                src={
                  doctor.profileImage.startsWith(
                    "http"
                  )
                    ? doctor.profileImage
                    : `${IMAGE_BASE}${doctor.profileImage}`
                }
                alt={doctorName}
              />
            ) : (
              <span className="dp-hero-initials">
                {initials}
              </span>
            )}

            <span
              className={`dp-hero-status ${doctor.isAvailable === false
                  ? "dp-status--offline"
                  : "dp-status--online"
                }`}
            />
          </div>

          {/* Identity */}
          <div className="dp-hero-identity">

            <div className="dp-hero-name-row">

              <h1 className="dp-hero-name">
                {doctorName}
              </h1>

              <span
                className={`dp-type-pill dp-type-pill--${doctorType}`}
              >
                {isHospital ? (
                  <FaHospital />
                ) : (
                  <FaClinicMedical />
                )}

                {isHospital
                  ? "Hospital Doctor"
                  : "Private Clinic Doctor"}
              </span>

            </div>

            <p className="dp-hero-spec">
              <FaStethoscope className="dp-inline-icon" />

              {doctor.specialization ||
                "General Physician"}
            </p>

            <p className="dp-hero-qual">
              <FaGraduationCap className="dp-inline-icon" />

              {doctor.qualification ||
                "Qualification not provided"}
            </p>

            {/* Stats */}
            <div className="dp-hero-stats">

              <div className="dp-stat-chip">
                <FaBriefcase />

                <div>
                  <span className="dp-stat-val">
                    {experience}+
                  </span>

                  <span className="dp-stat-lbl">
                    Years Exp.
                  </span>
                </div>
              </div>

              <div className="dp-stat-chip">
                <FaStar className="dp-stat-star" />

                <div>
                  <span className="dp-stat-val">
                    {rating > 0
                      ? rating.toFixed(1)
                      : "N/A"}
                  </span>

                  <span className="dp-stat-lbl">
                    {reviews} Reviews
                  </span>
                </div>
              </div>

              <div className="dp-stat-chip">
                <FaMoneyBillWave className="dp-stat-fee" />

                <div>
                  <span className="dp-stat-val">
                    ₹{consultationFee}
                  </span>

                  <span className="dp-stat-lbl">
                    Consult Fee
                  </span>
                </div>
              </div>

              <div className="dp-stat-chip">
                <FaLanguage />

                <div>
                  <span className="dp-stat-val">
                    {languages.length}
                  </span>

                  <span className="dp-stat-lbl">
                    Languages
                  </span>
                </div>
              </div>

            </div>

            {/* Languages */}
            {languages.length >
              0 && (
                <div className="dp-lang-chips">
                  {languages.map(
                    (language) => (
                      <span
                        key={language}
                        className="dp-lang-chip"
                      >
                        🌐 {language}
                      </span>
                    )
                  )}
                </div>
              )}

            {/* CTA */}
            <div className="dp-hero-ctas">

              <button
                className="dp-btn dp-btn--primary"
                onClick={
                  handleBookAppointment
                }
              >
                <FaCalendarCheck />
                Book Appointment
              </button>

            </div>

            {bookingMsg && (
              <div
                className="dp-booking-notice"
                role="status"
              >
                {bookingMsg}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Main */}
      <div className="dp-grid">

        {/* LEFT */}
        <div className="dp-col dp-col--left">

          {/* About */}
          {doctor.about && (
            <section
              className="dp-card"
              aria-labelledby="dp-about-heading"
            >
              <div className="dp-card-header">
                <FaUserMd className="dp-card-header-icon dp-icon--about" />

                <h2
                  id="dp-about-heading"
                  className="dp-card-title"
                >
                  About Doctor
                </h2>
              </div>

              <p className="dp-about-text">
                {doctor.about}
              </p>
            </section>
          )}

          {/* Education */}
          {education.length >
            0 && (
              <section
                className="dp-card"
                aria-labelledby="dp-edu-heading"
              >
                <div className="dp-card-header">
                  <FaGraduationCap className="dp-card-header-icon dp-icon--edu" />

                  <h2
                    id="dp-edu-heading"
                    className="dp-card-title"
                  >
                    Education
                  </h2>
                </div>

                <ol className="dp-timeline">
                  {education.map(
                    (edu, index) => (
                      <li
                        key={index}
                        className="dp-timeline-item"
                      >
                        <div className="dp-timeline-dot" />

                        <div className="dp-timeline-body">
                          <p className="dp-timeline-degree">
                            {edu.degree ||
                              "Qualification"}
                          </p>

                          <p className="dp-timeline-inst">
                            {edu.institution ||
                              "Institution not provided"}
                          </p>

                          {edu.year && (
                            <span className="dp-timeline-year">
                              {edu.year}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  )}
                </ol>
              </section>
            )}

          {/* Certifications */}
          {certifications.length >
            0 && (
              <section
                className="dp-card"
                aria-labelledby="dp-cert-heading"
              >
                <div className="dp-card-header">
                  <FaCertificate className="dp-card-header-icon dp-icon--cert" />

                  <h2
                    id="dp-cert-heading"
                    className="dp-card-title"
                  >
                    Certifications
                  </h2>
                </div>

                <ul className="dp-cert-list">
                  {certifications.map(
                    (cert, index) => (
                      <li
                        key={index}
                        className="dp-cert-item"
                      >
                        <FaCheckCircle className="dp-cert-check" />

                        <span>
                          {cert}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

          {/* Services */}
          {services.length >
            0 && (
              <section
                className="dp-card"
                aria-labelledby="dp-svc-heading"
              >
                <div className="dp-card-header">
                  <FaHeartbeat className="dp-card-header-icon dp-icon--svc" />

                  <h2
                    id="dp-svc-heading"
                    className="dp-card-title"
                  >
                    Services Offered
                  </h2>
                </div>

                <div className="dp-services-grid">
                  {services.map(
                    (service, index) => (
                      <span
                        key={index}
                        className="dp-service-chip"
                      >
                        <FaCheckCircle className="dp-service-icon" />
                        {service}
                      </span>
                    )
                  )}
                </div>
              </section>
            )}

          {/* Contact */}
          {(doctor.phone ||
            doctor.email) && (
              <section
                className="dp-card"
                aria-labelledby="dp-contact-heading"
              >
                <div className="dp-card-header">
                  <FaPhone className="dp-card-header-icon dp-icon--about" />

                  <h2
                    id="dp-contact-heading"
                    className="dp-card-title"
                  >
                    Contact
                  </h2>
                </div>

                <div className="dp-consultation-options">

                  {doctor.phone && (
                    <div className="dp-consult-option-item">
                      <span className="dp-consult-icon">
                        📞
                      </span>

                      <div>
                        <p className="dp-consult-title">
                          Phone
                        </p>

                        <p className="dp-consult-desc">
                          {doctor.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {doctor.email && (
                    <div className="dp-consult-option-item">
                      <span className="dp-consult-icon">
                        ✉️
                      </span>

                      <div>
                        <p className="dp-consult-title">
                          Email
                        </p>

                        <p className="dp-consult-desc">
                          {doctor.email}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </section>
            )}

          {/* Reviews */}
          {Array.isArray(
            doctor.patientReviews
          ) &&
            doctor.patientReviews.length >
            0 && (
              <section
                className="dp-card"
                aria-labelledby="dp-reviews-heading"
              >
                <div className="dp-card-header">

                  <FaStar className="dp-card-header-icon dp-icon--review" />

                  <h2
                    id="dp-reviews-heading"
                    className="dp-card-title"
                  >
                    Patient Reviews
                  </h2>

                  <span className="dp-review-count-badge">
                    {reviews} total
                  </span>

                </div>

                <div className="dp-rating-summary">
                  <div className="dp-rating-big">

                    <span className="dp-rating-number">
                      {rating > 0
                        ? rating
                        : "N/A"}
                    </span>

                    <StarRating
                      rating={rating}
                      size="lg"
                    />

                    <span className="dp-rating-label">
                      out of 5 ·{" "}
                      {reviews} reviews
                    </span>

                  </div>
                </div>

                <div className="dp-reviews-list">

                  {doctor.patientReviews.map(
                    (review) => (
                      <article
                        key={review.id}
                        className="dp-review-card"
                      >

                        <div className="dp-review-header">

                          <div
                            className="dp-review-avatar"
                          >
                            {review.avatar ||
                              getInitials(
                                review.name
                              )}
                          </div>

                          <div className="dp-review-meta">

                            <p className="dp-review-name">
                              {review.name ||
                                "Patient"}
                            </p>

                            <div className="dp-review-rating-row">

                              <StarRating
                                rating={
                                  Number(
                                    review.rating
                                  ) || 0
                                }
                                size="sm"
                              />

                              {review.date && (
                                <span className="dp-review-date">
                                  {review.date}
                                </span>
                              )}

                            </div>

                          </div>
                        </div>

                        <p className="dp-review-comment">
                          <FaQuoteLeft className="dp-quote-icon" />

                          {review.comment ||
                            "No review comment provided."}
                        </p>

                        <button
                          className="dp-helpful-btn"
                          type="button"
                        >
                          <FaThumbsUp />
                          Helpful
                          {review.helpful != null
                            ? ` (${review.helpful})`
                            : ""}
                        </button>

                      </article>
                    )
                  )}

                </div>
              </section>
            )}

        </div>

        {/* RIGHT */}
        <div className="dp-col dp-col--right">

          {/* Practice */}
          <section
            className="dp-card"
            aria-labelledby="dp-practice-heading"
          >
            <div className="dp-card-header">

              {isHospital ? (
                <FaHospital className="dp-card-header-icon dp-icon--hosp" />
              ) : (
                <FaClinicMedical className="dp-card-header-icon dp-icon--clinic" />
              )}

              <h2
                id="dp-practice-heading"
                className="dp-card-title"
              >
                Practice Information
              </h2>

            </div>

            <dl className="dp-practice-list">

              <div className="dp-practice-item">

                <dt className="dp-prac-label">
                  Practice Type
                </dt>

                <dd>
                  <span
                    className={`dp-type-pill dp-type-pill--${doctorType} dp-type-pill--sm`}
                  >
                    {isHospital ? (
                      <FaHospital />
                    ) : (
                      <FaClinicMedical />
                    )}

                    {isHospital
                      ? "Hospital Doctor"
                      : "Private Clinic Doctor"}
                  </span>
                </dd>

              </div>

              <div className="dp-practice-item">

                <dt className="dp-prac-label">
                  {isHospital
                    ? "Hospital Name"
                    : "Clinic Name"}
                </dt>

                <dd className="dp-prac-value">
                  {hospitalName}
                </dd>

              </div>

              <div className="dp-practice-item">

                <dt className="dp-prac-label">
                  City
                </dt>

                <dd className="dp-prac-value">
                  <FaMapMarkerAlt className="dp-prac-icon dp-icon--loc" />

                  {location}
                </dd>

              </div>

              {(doctor.address ||
                doctor.clinicAddress ||
                doctor.hospital?.address) && (
                  <div className="dp-practice-item">

                    <dt className="dp-prac-label">
                      Full Address
                    </dt>

                    <dd className="dp-prac-value dp-prac-address">

                      <span>
                        {doctor.address ||
                          doctor.clinicAddress ||
                          doctor.hospital?.address}
                      </span>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${hospitalName}, ${location}, ${doctor.address ||
                          doctor.clinicAddress ||
                          doctor.hospital?.address ||
                          ""
                          }`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dp-maps-link"
                      >
                        📍 View on Google Maps
                      </a>

                    </dd>
                  </div>
                )}

              <div className="dp-practice-item">

                <dt className="dp-prac-label">
                  Consultation Fee
                </dt>

                <dd className="dp-prac-value">

                  <FaMoneyBillWave className="dp-prac-icon" />

                  ₹{consultationFee}

                </dd>

              </div>

            </dl>
          </section>

          {/* Booking notice */}
          <div
            className={`dp-booking-info-card dp-booking-info--${doctorType}`}
          >

            {isHospital ? (
              <>
                <FaHospital className="dp-booking-info-icon" />

                <div>
                  <p className="dp-booking-info-title">
                    Hospital Booking
                  </p>

                  <p className="dp-booking-info-desc">
                    Appointment will be
                    booked through the
                    hospital.
                  </p>
                </div>
              </>
            ) : (
              <>
                <FaClinicMedical className="dp-booking-info-icon" />

                <div>
                  <p className="dp-booking-info-title">
                    Direct Booking
                  </p>

                  <p className="dp-booking-info-desc">
                    Appointment will be
                    booked directly with
                    the doctor.
                  </p>
                </div>
              </>
            )}

          </div>

          {/* Availability */}
          <section
            className="dp-card"
            aria-labelledby="dp-avail-heading"
          >

            <div className="dp-card-header">

              <FaCalendarCheck className="dp-card-header-icon dp-icon--cal" />

              <h2
                id="dp-avail-heading"
                className="dp-card-title"
              >
                Available Schedule
              </h2>

            </div>

            <p className="dp-avail-sub">
              Available Days
            </p>

            <div
              className="dp-day-chips"
              role="group"
              aria-label="Select available day"
            >

              {DAYS_ORDER
                .filter((day) =>
                  availableDays.includes(
                    day
                  )
                ).length === 0 ? (
                  <p style={{ color: "#ef4444", fontSize: "0.85rem", fontStyle: "italic", margin: "4px 0" }}>
                    No available days configured.
                  </p>
                ) : (
                  DAYS_ORDER
                    .filter((day) =>
                      availableDays.includes(
                        day
                      )
                    )
                    .map((day) => (

                      <button
                        key={day}
                        className={`dp-day-chip ${selectedDay === day
                            ? "dp-day-chip--active"
                            : ""
                          }`}
                        onClick={() => {
                          setSelectedDay(
                            day
                          );
                          setSelectedSlot(
                            null
                          );
                        }}
                        aria-pressed={
                          selectedDay === day
                        }
                      >
                        {day.slice(0, 3)}
                      </button>

                    ))
                )}

            </div>

            {selectedDay && (
              <>
                <p
                  className="dp-avail-sub"
                  style={{
                    marginTop:
                      "1rem",
                  }}
                >
                  Time Slots — {selectedDay}
                </p>

                {slots.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic", margin: "6px 0" }}>
                    No time slots configured for {selectedDay}.
                  </p>
                ) : (
                  <div
                    className="dp-slot-grid"
                    role="group"
                    aria-label="Select time slot"
                  >

                    {slots.map(
                      (slot) => (
                        <button
                          key={slot}
                          className={`dp-slot-btn ${selectedSlot ===
                              slot
                              ? "dp-slot-btn--active"
                              : ""
                            }`}
                          onClick={() =>
                            setSelectedSlot(
                              slot
                            )
                          }
                          aria-pressed={
                            selectedSlot ===
                            slot
                          }
                        >
                          <FaClock className="dp-slot-icon" />

                          {slot}
                        </button>
                      )
                    )}

                  </div>
                )}

                {selectedSlot && (
                  <div className="dp-slot-selected-notice">

                    <FaCheckCircle />

                    Selected:{" "}
                    <strong>
                      {selectedDay}
                    </strong>{" "}
                    at{" "}
                    <strong>
                      {selectedSlot}
                    </strong>

                  </div>
                )}
              </>
            )}

          </section>

          {/* CTA */}
          <div className="dp-cta-sticky">

            <button
              className="dp-btn dp-btn--primary dp-btn--full"
              onClick={
                handleBookAppointment
              }
            >
              <FaCalendarCheck />

              Book Appointment

              {selectedSlot && (
                <span className="dp-cta-slot-tag">
                  {selectedSlot}
                </span>
              )}

            </button>

            <button
              className="dp-btn dp-btn--outline dp-btn--full"
              onClick={() => {
                setBookingMsg(
                  "Video consultation will be available after appointment booking."
                );

                setTimeout(() => {
                  setBookingMsg("");
                }, 3000);
              }}
            >
              <FaVideo />
              Start Consultation
            </button>

          </div>

        </div>
      </div>

      {/* Mobile actions */}
      <div className="dp-mobile-action-bar">

        <button
          className="dp-mobile-action-btn dp-mobile-action-btn--primary"
          onClick={
            handleBookAppointment
          }
        >
          <FaCalendarCheck />
          Book Appointment
        </button>

        <button
          className="dp-mobile-action-btn dp-mobile-action-btn--outline"
          onClick={() => {
            setBookingMsg(
              "Video consultation will be available after appointment booking."
            );

            setTimeout(() => {
              setBookingMsg("");
            }, 3000);
          }}
        >
          <FaVideo />
          Start Consultation
        </button>

      </div>

      {bookingMsg && (
        <div
          className="dp-toast"
          role="alert"
        >
          {bookingMsg}
        </div>
      )}

    </div>
  );
}

export default PatientDoctorProfile;