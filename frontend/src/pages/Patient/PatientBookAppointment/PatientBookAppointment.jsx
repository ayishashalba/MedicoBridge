import React, { useEffect, useState } from "react";
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
  FaFilePdf,
  FaFileImage,
  FaEye,
  FaDownload,
  FaTrashAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientBookAppointment.css";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("patient") ||
      localStorage.getItem("currentUser");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getToken() {
  const user = getStoredUser();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    user?.token ||
    ""
  );
}

function getPatientName() {
  const user = getStoredUser();

  return (
    user?.name ||
    user?.fullName ||
    user?.patient?.name ||
    user?.patient?.fullName ||
    "Patient"
  );
}

function getPatientId() {
  const user = getStoredUser();

  return (
    user?.patientId ||
    user?.patient?.patientId ||
    user?.patient?.id ||
    user?.patient?._id ||
    user?.id ||
    user?._id ||
    ""
  );
}

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  const parts = timeStr.trim().split(" ");

  if (parts.length !== 2) return 0;

  const [time, modifier] = parts;
  let [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  if (hours === 12) {
    hours = modifier === "AM" ? 0 : 12;
  } else if (modifier === "PM") {
    hours += 12;
  }

  return hours * 60 + minutes;
}

function getNextDateForDay(dayName) {
  const todayDate = new Date();

  const targetIndex = DAYS_ORDER.indexOf(dayName);

  if (targetIndex === -1) {
    return todayDate.toISOString().split("T")[0];
  }

  const jsTargetDay = targetIndex === 6 ? 0 : targetIndex + 1;
  const currentDay = todayDate.getDay();

  let daysToAdd = (jsTargetDay - currentDay + 7) % 7;

  const targetDate = new Date();

  targetDate.setDate(todayDate.getDate() + daysToAdd);

  return targetDate.toISOString().split("T")[0];
}

function normalizeDoctor(rawDoctor) {
  if (!rawDoctor) return null;

  const doctor = rawDoctor.doctor || rawDoctor.data || rawDoctor;

  const firstName = doctor.firstName || "";
  const lastName = doctor.lastName || "";

  const fullName =
    doctor.name ||
    doctor.fullName ||
    `${firstName} ${lastName}`.trim();

  const specialization =
    doctor.specialization ||
    doctor.specialisation ||
    doctor.specialty ||
    doctor.department ||
    "";

  const hospital =
    doctor.hospital?.name ||
    doctor.hospitalName ||
    doctor.hospital ||
    doctor.clinic?.name ||
    doctor.clinicName ||
    "";

  const city =
    doctor.city ||
    doctor.location?.city ||
    doctor.hospital?.city ||
    doctor.clinic?.city ||
    "";

  const address =
    doctor.address ||
    doctor.location?.address ||
    doctor.hospital?.address ||
    doctor.clinic?.address ||
    "";

  const fee =
    doctor.fee ??
    doctor.consultationFee ??
    doctor.consultFee ??
    0;

  const availableDays =
    doctor.availableDays ||
    doctor.availability?.days ||
    doctor.schedule?.availableDays ||
    [];

  const slots =
    doctor.slots ||
    doctor.timeSlots ||
    doctor.availableSlots ||
    doctor.availability?.slots ||
    doctor.schedule?.slots ||
    [];

  const rating =
    doctor.rating ??
    doctor.averageRating ??
    0;

  const reviews =
    doctor.reviews ??
    doctor.reviewCount ??
    0;

  const experience =
    doctor.experience ??
    doctor.experienceYears ??
    0;

  const qualification =
    doctor.qualification ||
    doctor.qualifications ||
    "";

  const id =
    doctor._id ||
    doctor.id ||
    doctor.doctorId;

  return {
    ...doctor,
    id,
    mongoId: doctor._id || id,
    name: fullName,
    specialization,
    qualification,
    experience,
    hospital,
    city,
    address,
    type:
      doctor.type ||
      (hospital ? "hospital" : "clinic"),
    fee,
    rating,
    reviews,
    availableDays: Array.isArray(availableDays)
      ? availableDays
      : [],
    slots: Array.isArray(slots)
      ? slots
      : [],
    availableSlots: Array.isArray(doctor.availableSlots)
      ? doctor.availableSlots
      : Array.isArray(slots)
        ? slots
        : [],
    initials:
      doctor.initials ||
      fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    color: doctor.color || "#7c3aed",
  };
}

function ReportPreviewModal({ report, onClose }) {
  const [zoom, setZoom] = useState(1);

  if (!report) return null;

  const isPdf =
    report.type === "pdf" ||
    (report.name &&
      report.name.toLowerCase().endsWith(".pdf"));

  return (
    <div
      className="rpm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rpm-file-title"
    >
      <div className="rpm-modal-card">
        <div className="rpm-modal-header">
          <div className="rpm-header-title">
            <div
              className={`rpm-type-icon rpm-type-icon--${isPdf ? "pdf" : "image"
                }`}
            >
              {isPdf ? <FaFilePdf /> : <FaFileImage />}
            </div>

            <div className="rpm-header-info">
              <h3
                id="rpm-file-title"
                className="rpm-file-name"
                title={report.name}
              >
                {report.name}
              </h3>

              <p className="rpm-file-meta">
                <span
                  className={`rpm-badge rpm-badge--${isPdf ? "pdf" : "image"
                    }`}
                >
                  {report.fileTypeBadge ||
                    (isPdf
                      ? "PDF Document"
                      : "Medical Image")}
                </span>

                <span className="rpm-size">
                  {report.size}
                </span>
              </p>
            </div>
          </div>

          <div className="rpm-header-actions">
            {!isPdf && (
              <div className="rpm-zoom-controls">
                <button
                  type="button"
                  className="rpm-btn-icon"
                  onClick={() =>
                    setZoom((prev) =>
                      Math.max(prev - 0.25, 0.5)
                    )
                  }
                  title="Zoom Out"
                >
                  <FaSearchMinus />
                </button>

                <span className="rpm-zoom-text">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  type="button"
                  className="rpm-btn-icon"
                  onClick={() =>
                    setZoom((prev) =>
                      Math.min(prev + 0.25, 2.5)
                    )
                  }
                  title="Zoom In"
                >
                  <FaSearchPlus />
                </button>

                <button
                  type="button"
                  className="rpm-btn-text"
                  onClick={() => setZoom(1)}
                >
                  Fit
                </button>
              </div>
            )}

            {report.previewUrl && (
              <a
                href={report.previewUrl}
                download={report.name}
                className="rpm-download-btn"
              >
                <FaDownload />
                <span>Download</span>
              </a>
            )}

            <button
              type="button"
              className="rpm-close-btn"
              onClick={onClose}
              aria-label="Close Preview"
            >
              <FaTimes />
            </button>
          </div>
        </div>

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
                  <p>
                    Your browser cannot embed the PDF directly.
                  </p>

                  <a
                    href={report.previewUrl}
                    download={report.name}
                    className="rpm-download-fallback"
                  >
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
                    transition:
                      "transform 0.2s ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rpm-modal-footer">
          <span className="rpm-security-note">
            🔒 Confidential Medical Document — Authorized
            Access Only
          </span>

          <button
            type="button"
            className="rpm-btn-secondary"
            onClick={onClose}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingSuccessCard({
  booking,
  doctor,
  onGoHome,
  onGoAppointments,
  onPreviewReport,
}) {
  return (
    <div
      className="bk-success-overlay"
      role="dialog"
      aria-labelledby="bk-success-title"
      aria-modal="true"
    >
      <div className="bk-success-card">
        <div className="bk-success-icon-wrapper">
          <div className="bk-success-icon">
            <FaCheckCircle />
          </div>

          <div className="bk-success-ring" />
        </div>

        <h2
          id="bk-success-title"
          className="bk-success-title"
        >
          Appointment Booked!
        </h2>

        <p className="bk-success-subtitle">
          Your appointment request has been submitted
          successfully.
        </p>

        <div className="bk-confirm-summary">
          <div className="bk-confirm-header">
            <div
              className="bk-confirm-avatar"
              style={{
                background: `linear-gradient(135deg, ${doctor.color
                  }cc, ${doctor.color}66)`,
              }}
            >
              {doctor.initials}
            </div>

            <div>
              <p className="bk-confirm-doctor">
                {doctor.name}
              </p>

              <p className="bk-confirm-spec">
                {doctor.specialization}
              </p>
            </div>
          </div>

          <dl className="bk-confirm-details">
            <div className="bk-confirm-row">
              <dt>
                <FaIdCard className="bk-confirm-icon" />
                Appointment ID
              </dt>

              <dd className="bk-appt-id">
                {booking.appointmentId}
              </dd>
            </div>

            <div className="bk-confirm-row">
              <dt>
                <FaCalendarCheck className="bk-confirm-icon" />
                Date
              </dt>

              <dd>{booking.date}</dd>
            </div>

            <div className="bk-confirm-row">
              <dt>
                <FaClock className="bk-confirm-icon" />
                Time
              </dt>

              <dd>{booking.slot}</dd>
            </div>

            <div className="bk-confirm-row">
              <dt>
                {booking.consultationType === "video" ? (
                  <FaVideo className="bk-confirm-icon" />
                ) : (
                  <FaHospital className="bk-confirm-icon" />
                )}
                Consultation
              </dt>

              <dd>
                {booking.consultationType === "video"
                  ? "Video Consultation"
                  : "In-Person Visit"}
              </dd>
            </div>

            <div className="bk-confirm-row">
              <dt>
                <FaMapMarkerAlt className="bk-confirm-icon" />
                Location
              </dt>

              <dd>
                {doctor.hospital}
                {doctor.city ? `, ${doctor.city}` : ""}
              </dd>
            </div>

            <div className="bk-confirm-row bk-confirm-row--status">
              <dt>Status</dt>

              <dd>
                <span className="bk-status-badge">
                  <span className="bk-status-dot" />
                  {booking.status}
                </span>
              </dd>
            </div>

            {booking.uploadedFiles?.length > 0 && (
              <div className="bk-confirm-row bk-confirm-row--reports">
                <dt>
                  <FaFileAlt className="bk-confirm-icon" />
                  Attached Reports
                </dt>

                <dd className="bk-reports-chips-wrap">
                  {booking.uploadedFiles.map(
                    (file, idx) => (
                      <div
                        key={file.id || idx}
                        className="bk-report-mini-chip"
                      >
                        <span className="bk-chip-name">
                          {file.name}
                        </span>

                        <button
                          type="button"
                          className="bk-chip-act-btn"
                          onClick={() =>
                            onPreviewReport?.(file)
                          }
                        >
                          <FaEye /> Preview
                        </button>

                        {file.previewUrl && (
                          <a
                            href={file.previewUrl}
                            download={file.name}
                            className="bk-chip-act-btn"
                          >
                            <FaDownload />
                          </a>
                        )}
                      </div>
                    )
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div
            className={`bk-confirm-notice bk-confirm-notice--${doctor.type}`}
          >
            <FaExclamationCircle />

            <span>
              {doctor.type === "hospital"
                ? "This appointment request will be sent to the hospital for confirmation."
                : "This appointment will be booked directly with the doctor."}
            </span>
          </div>
        </div>

        <div className="bk-success-actions">
          <button
            className="bk-btn bk-btn--outline"
            onClick={onGoHome}
          >
            <FaHome /> Go to Dashboard
          </button>

          <button
            className="bk-btn bk-btn--primary"
            onClick={onGoAppointments}
          >
            <FaCalendarCheck /> My Appointments
          </button>
        </div>

        <button
          className="bk-print-btn"
          onClick={() => window.print()}
        >
          <FaPrint /> Print Details
        </button>
      </div>
    </div>
  );
}

function PatientBookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const preState = location.state || {};

  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(
    preState.slot || ""
  );
  const [consultationType, setConsultationType] =
    useState("in-person");
  const [appointmentDate, setAppointmentDate] =
    useState(preState.date || "");

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const [bookingFor, setBookingFor] =
    useState("self");
  const [familyMemberName, setFamilyMemberName] =
    useState("");
  const [familyRelation, setFamilyRelation] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("hospital");
  const [agreePolicy, setAgreePolicy] =
    useState(false);

  const [uploadedFiles, setUploadedFiles] =
    useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [previewingReport, setPreviewingReport] =
    useState(null);
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingBookedSlots, setLoadingBookedSlots] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDoctor = async () => {
      if (!id) {
        setDoctorError("Doctor ID is missing.");
        setDoctorLoading(false);
        return;
      }

      try {
        setDoctorLoading(true);
        setDoctorError("");

        const token = getToken();

        const response = await fetch(
          `${API_BASE_URL}/patient/doctors/${id}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
            data?.error ||
            "Failed to load doctor information."
          );
        }

        const loadedDoctor = normalizeDoctor(data);

        if (!loadedDoctor?.mongoId) {
          throw new Error(
            "Doctor information received from database is invalid."
          );
        }

        if (cancelled) return;

        setDoctor(loadedDoctor);

        const firstAvailableDay =
          preState.day ||
          loadedDoctor.availableDays?.[0] ||
          "";

        const firstAvailableDate =
          preState.date ||
          (firstAvailableDay
            ? getNextDateForDay(firstAvailableDay)
            : "");

        setSelectedDay(firstAvailableDay);
        setAppointmentDate(firstAvailableDate);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Fetch doctor error:",
          error
        );

        setDoctorError(
          error.message ||
          "Unable to load doctor information."
        );
      } finally {
        if (!cancelled) {
          setDoctorLoading(false);
        }
      }
    };

    fetchDoctor();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch booked slots for the chosen doctor and date
  useEffect(() => {
    let cancelled = false;
    const fetchBookedSlots = async () => {
      const doctorId = doctor?.mongoId || doctor?._id || id;
      if (!doctorId || !appointmentDate) {
        setBookedSlots([]);
        return;
      }
      try {
        setLoadingBookedSlots(true);
        const token = getToken();
        const response = await fetch(
          `${API_BASE_URL}/patient/doctors/${doctorId}/booked-slots?date=${appointmentDate}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data.success && data.data?.bookedSlots) {
          setBookedSlots(data.data.bookedSlots);
        } else if (!cancelled) {
          setBookedSlots([]);
        }
      } catch (err) {
        if (!cancelled) setBookedSlots([]);
      } finally {
        if (!cancelled) setLoadingBookedSlots(false);
      }
    };
    fetchBookedSlots();
    return () => {
      cancelled = true;
    };
  }, [doctor?.mongoId, doctor?._id, id, appointmentDate]);

  if (doctorLoading) {
    return (
      <div className="bk-page">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          Loading doctor information...
        </div>
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <div className="bk-page">
        <button
          className="bk-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
          <span>Go Back</span>
        </button>

        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <FaTimesCircle
            style={{
              fontSize: "3rem",
              color: "#dc2626",
            }}
          />

          <h2>Unable to Load Doctor</h2>

          <p>{doctorError}</p>

          <button
            className="bk-btn bk-btn--primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isHospital =
    doctor.type === "hospital";

  const availableDays =
    doctor.availableDays || [];

  // doctor.slots is set by normalizeDoctor from doctor.availableSlots (array of {day,startTime})
  // Build a per-day slot map from the raw availableSlots
  const rawAvailableSlots =
    Array.isArray(doctor.availableSlots) && doctor.availableSlots.length > 0
      ? doctor.availableSlots
      : Array.isArray(doctor.slots) && doctor.slots.length > 0
        ? doctor.slots
        : [];

  // Determine slots for the currently selected day
  const slotsForSelectedDay = (() => {
    if (!selectedDay || !rawAvailableSlots.length) return [];

    const firstItem = rawAvailableSlots[0];
    // Structured slots: array of { day, startTime, endTime, isAvailable }
    if (typeof firstItem === "object" && firstItem !== null) {
      return rawAvailableSlots
        .filter((s) => s && s.day === selectedDay && s.isAvailable !== false)
        .map((s) => s.startTime || s.endTime || s.time || "")
        .filter(Boolean);
    }

    // Flat string array (legacy): ["09:00 AM", "10:00 AM", ...]
    if (typeof firstItem === "string") {
      return rawAvailableSlots.filter(Boolean);
    }

    return [];
  })();

  const slots = slotsForSelectedDay;

  const getRemainingSlotsCount = () => {
    if (!appointmentDate) return null;
    if (!slots.length) return 0;
    return slots.filter(
      (slot) => !isSlotDisabled(slot)
    ).length;
  };

  const isSlotDisabled = (slotTime) => {
    if (bookedSlots.includes(slotTime)) {
      return true;
    }

    if (appointmentDate !== today) {
      return false;
    }

    const now = new Date();

    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    const slotMinutes =
      timeToMinutes(slotTime);

    return slotMinutes <= currentMinutes;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    setUploadError("");

    const validFiles = [];
    let errorMsg = "";

    files.forEach((file) => {
      const ext = file.name
        .split(".")
        .pop()
        ?.toLowerCase();

      const isValidType =
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        ["pdf", "jpg", "jpeg", "png"].includes(
          ext
        );

      if (!isValidType) {
        errorMsg = `Invalid format for "${file.name}". Only PDF, JPEG, or PNG files are supported.`;
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        errorMsg = `File "${file.name}" exceeds the 10MB limit.`;
        return;
      }

      const isPdf =
        file.type === "application/pdf" ||
        ext === "pdf";

      const isPng =
        file.type === "image/png" ||
        ext === "png";

      const fileTypeBadge = isPdf
        ? "PDF"
        : isPng
          ? "PNG"
          : "JPEG";

      const reportType = isPdf
        ? "pdf"
        : "image";

      const formattedSize =
        file.size >= 1024 * 1024
          ? `${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
          : `${(
            file.size / 1024
          ).toFixed(0)} KB`;

      validFiles.push({
        id: `rep_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name: file.name,
        size: formattedSize,
        type: reportType,
        fileTypeBadge,
        previewUrl:
          URL.createObjectURL(file),
        file,
      });
    });

    if (errorMsg) {
      setUploadError(errorMsg);

      setTimeout(
        () => setUploadError(""),
        5000
      );
    }

    if (validFiles.length) {
      setUploading(true);

      setTimeout(() => {
        setUploadedFiles((prev) => [
          ...prev,
          ...validFiles,
        ]);

        setUploading(false);
      }, 300);
    }

    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => {
      const target = prev[index];

      if (target?.previewUrl) {
        URL.revokeObjectURL(
          target.previewUrl
        );
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  const handleDateChange = (value) => {
    setAppointmentDate(value);
    setSelectedSlot("");

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        date: "Please select an appointment date.",
      }));
      return;
    }

    if (value < today) {
      setErrors((prev) => ({
        ...prev,
        date: "Past dates are not allowed.",
      }));
      return;
    }

    const dateObj = new Date(
      `${value}T00:00:00`
    );

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName =
      dayNames[dateObj.getDay()];

    if (
      !availableDays.includes(dayName)
    ) {
      setErrors((prev) => ({
        ...prev,
        date: `Doctor is not available on ${dayName}s.`,
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      date: "",
    }));

    setSelectedDay(dayName);
  };

  const validate = () => {
    const errs = {};

    if (!appointmentDate) {
      errs.date =
        "Please select an appointment date.";
    } else {
      const dateObj = new Date(
        `${appointmentDate}T00:00:00`
      );

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const dayName =
        dayNames[dateObj.getDay()];

      if (appointmentDate < today) {
        errs.date =
          "Past dates are not allowed.";
      } else if (
        !availableDays.includes(dayName)
      ) {
        errs.date =
          `Doctor is not available on ${dayName}s.`;
      }
    }

    if (!selectedSlot) {
      errs.slot =
        "Please choose an available time slot.";
    } else if (
      isSlotDisabled(selectedSlot)
    ) {
      errs.slot =
        "This time slot is no longer available.";
    }

    if (!reason) {
      errs.reason =
        "Please select a reason for your visit.";
    }

    if (bookingFor === "family") {
      if (!familyMemberName.trim()) {
        errs.familyMemberName =
          "Please enter the family member's name.";
      }

      if (!familyRelation) {
        errs.familyRelation =
          "Please select a relationship.";
      }
    }

    if (!agreePolicy) {
      errs.agreePolicy =
        "You must agree to the appointment & cancellation policy.";
    }

    return errs;
  };

  const handleConfirm = async () => {
    if (bookingLoading) return;

    const validationErrors = validate();

    if (
      Object.keys(validationErrors).length
    ) {
      setErrors(validationErrors);

      setTimeout(() => {
        const firstErrorEl =
          document.querySelector(
            ".bk-field-error"
          );

        firstErrorEl?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 50);

      return;
    }

    const token = getToken();

    if (!token) {
      toast.error(
        "Please login before booking an appointment."
      );
      return;
    }

    if (!doctor.mongoId) {
      toast.error(
        "Doctor information is missing."
      );
      return;
    }

    setErrors({});
    setBookingLoading(true);

    try {
      const appointmentType =
        consultationType === "video"
          ? "Online Consultation"
          : "In-Person";

      const payload = {
        doctorId: doctor.mongoId,
        date: appointmentDate,
        timeSlot: selectedSlot,
        type: appointmentType,
        reason,
        notes:
          bookingFor === "family"
            ? `${notes}${notes ? "\n" : ""
            }Booking for: ${familyMemberName} (${familyRelation})`
            : notes,
        fee: doctor.fee,
      };

      const response = await fetch(
        `${API_BASE_URL}/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (Array.isArray(data?.errors) ? data.errors[0] : null) ||
          data?.message ||
          data?.error ||
          "Failed to book appointment."
        );
      }

      const createdAppointment =
        data?.appointment ||
        data?.data ||
        data?.result ||
        data;

      const formattedDate = new Date(
        `${appointmentDate}T00:00:00`
      ).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      navigate(
        "/patient/booking-success",
        {
          state: {
            booking: {
              appointmentId:
                createdAppointment?.appointmentId ||
                createdAppointment?._id,

              date: formattedDate,

              slot:
                createdAppointment?.timeSlot ||
                selectedSlot,

              consultationType,
              paymentMethod,
              bookingFor,
              familyMemberName,
              familyRelation,
              uploadedFiles,
              reason,
              notes,

              status:
                createdAppointment?.status ||
                "Pending",
            },

            doctor,
          },
        }
      );
    } catch (error) {
      console.error(
        "Book appointment error:",
        error
      );

      toast.error(
        error.message ||
        "Unable to book appointment."
      );

      setErrors((prev) => ({
        ...prev,
        submit:
          error.message ||
          "Unable to book appointment.",
      }));
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bk-page">
      <button
        className="bk-back-btn"
        onClick={() =>
          navigate(
            `/patient/doctor-profile/${doctor.mongoId}`
          )
        }
      >
        <FaArrowLeft />
        <span>Back to Doctor Profile</span>
      </button>

      <header className="bk-page-header">
        <div>
          <h1 className="bk-page-title">
            Book Appointment
          </h1>

          <p className="bk-page-subtitle">
            Fill in the details below to request your
            appointment.
          </p>
        </div>

        <div
          className={`bk-booking-type-badge bk-booking-type-badge--${doctor.type}`}
        >
          {isHospital ? (
            <FaHospital />
          ) : (
            <FaClinicMedical />
          )}

          {isHospital
            ? "Hospital Booking"
            : "Direct Booking"}
        </div>
      </header>

      <div className="bk-grid">
        <div className="bk-col bk-col--form">
          <div
            className={`bk-notice bk-notice--${doctor.type}`}
            role="note"
          >
            {isHospital ? (
              <FaHospital className="bk-notice-icon" />
            ) : (
              <FaClinicMedical className="bk-notice-icon" />
            )}

            <p className="bk-notice-text">
              {isHospital
                ? "This appointment request will be sent to the hospital for confirmation."
                : "This appointment will be booked directly with the doctor."}
            </p>
          </div>

          <section className="bk-form-section">
            <h2 className="bk-section-title">
              <FaUser className="bk-section-icon" />
              Patient Information
            </h2>

            <div className="bk-field">
              <label className="bk-label">
                Booking For
              </label>

              <div className="bk-booking-for-group">
                <button
                  type="button"
                  className={`bk-booking-for-btn ${bookingFor === "self"
                    ? "active"
                    : ""
                    }`}
                  onClick={() =>
                    setBookingFor("self")
                  }
                >
                  Self
                </button>

                <button
                  type="button"
                  className={`bk-booking-for-btn ${bookingFor === "family"
                    ? "active"
                    : ""
                    }`}
                  onClick={() =>
                    setBookingFor("family")
                  }
                >
                  Family Member
                </button>
              </div>
            </div>

            {bookingFor === "self" ? (
              <div className="bk-form-grid bk-form-grid--2">
                <div className="bk-field">
                  <label className="bk-label">
                    Patient Name
                  </label>

                  <div className="bk-readonly-field">
                    <FaUser className="bk-field-prefix-icon" />

                    <span>
                      {getPatientName()}
                    </span>

                    <span className="bk-readonly-badge">
                      Auto-filled
                    </span>
                  </div>
                </div>

                <div className="bk-field">
                  <label className="bk-label">
                    Patient ID
                  </label>

                  <div className="bk-readonly-field">
                    <FaIdCard className="bk-field-prefix-icon" />

                    <span>
                      {getPatientId()
                        ? `#${getPatientId()}`
                        : "Auto-filled"}
                    </span>

                    <span className="bk-readonly-badge">
                      Auto-filled
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bk-form-grid bk-form-grid--2">
                <div className="bk-field">
                  <label className="bk-label">
                    Family Member Name{" "}
                    <span className="bk-required">
                      *
                    </span>
                  </label>

                  <div
                    className={`bk-input-wrapper ${errors.familyMemberName
                      ? "bk-input--error"
                      : ""
                      }`}
                  >
                    <FaUser className="bk-input-icon" />

                    <input
                      type="text"
                      className="bk-input"
                      placeholder="Enter full name"
                      value={
                        familyMemberName
                      }
                      onChange={(e) => {
                        setFamilyMemberName(
                          e.target.value
                        );

                        setErrors((prev) => ({
                          ...prev,
                          familyMemberName:
                            "",
                        }));
                      }}
                    />
                  </div>

                  {errors.familyMemberName && (
                    <p className="bk-field-error">
                      <FaTimesCircle />
                      {errors.familyMemberName}
                    </p>
                  )}
                </div>

                <div className="bk-field">
                  <label className="bk-label">
                    Relationship{" "}
                    <span className="bk-required">
                      *
                    </span>
                  </label>

                  <div
                    className={`bk-input-wrapper ${errors.familyRelation
                      ? "bk-input--error"
                      : ""
                      }`}
                  >
                    <FaUser className="bk-input-icon" />

                    <select
                      className="bk-select"
                      value={familyRelation}
                      onChange={(e) => {
                        setFamilyRelation(
                          e.target.value
                        );

                        setErrors((prev) => ({
                          ...prev,
                          familyRelation:
                            "",
                        }));
                      }}
                    >
                      <option value="">
                        Select Relationship...
                      </option>

                      <option value="Spouse">
                        Spouse
                      </option>

                      <option value="Child">
                        Child
                      </option>

                      <option value="Parent">
                        Parent
                      </option>

                      <option value="Sibling">
                        Sibling
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {errors.familyRelation && (
                    <p className="bk-field-error">
                      <FaTimesCircle />
                      {errors.familyRelation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="bk-form-section">
            <h2 className="bk-section-title">
              <FaCalendarCheck className="bk-section-icon" />
              Date &amp; Time
            </h2>

            <div className="bk-field">
              <label className="bk-label">
                Appointment Date{" "}
                <span className="bk-required">
                  *
                </span>
              </label>

              <div
                className={`bk-input-wrapper ${errors.date
                  ? "bk-input--error"
                  : ""
                  }`}
              >
                <FaCalendarCheck className="bk-input-icon" />

                <input
                  type="date"
                  className="bk-input"
                  min={today}
                  value={appointmentDate}
                  onChange={(e) =>
                    handleDateChange(
                      e.target.value
                    )
                  }
                />
              </div>

              {errors.date && (
                <p className="bk-field-error">
                  <FaTimesCircle />
                  {errors.date}
                </p>
              )}
            </div>

            <div className="bk-field">
              <label className="bk-label">
                Available Days
              </label>

              <div className="bk-day-chips">
                {DAYS_ORDER.filter((day) =>
                  availableDays.includes(day)
                ).length === 0 ? (
                  <p style={{ color: "#ef4444", fontSize: "0.87rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaTimesCircle style={{ flexShrink: 0 }} />
                    This doctor has not configured any available days yet.
                  </p>
                ) : (
                  DAYS_ORDER.filter((day) =>
                    availableDays.includes(day)
                  ).map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`bk-day-chip ${selectedDay === day
                        ? "bk-day-chip--active"
                        : ""
                        }`}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot("");

                        const nextDate =
                          getNextDateForDay(
                            day
                          );

                        setAppointmentDate(
                          nextDate
                        );

                        setErrors((prev) => ({
                          ...prev,
                          date: "",
                          slot: "",
                        }));
                      }}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bk-field">
              <label
                className="bk-label"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "0.5rem",
                }}
              >
                <span>
                  Time Slot — {selectedDay}{" "}
                  <span className="bk-required">
                    *
                  </span>
                </span>

                {appointmentDate &&
                  !errors.date && (
                    <span className="bk-slots-remaining">
                      🟢{" "}
                      {getRemainingSlotsCount()}{" "}
                      slots left
                    </span>
                  )}
              </label>

              <div
                className={`bk-slot-grid ${errors.slot
                  ? "bk-slot-grid--error"
                  : ""
                  }`}
              >
                {!selectedDay ? (
                  <p style={{ color: "#94a3b8", fontSize: "0.88rem", fontStyle: "italic" }}>
                    Select an available day above to see time slots.
                  </p>
                ) : slots.length === 0 ? (
                  <p style={{
                    color: "#ef4444",
                    fontSize: "0.88rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <FaTimesCircle style={{ flexShrink: 0 }} />
                    No time slots have been configured for {selectedDay}s. Please select a different day or contact the doctor.
                  </p>
                ) : (
                  slots.map((slot) => {
                    const disabled =
                      isSlotDisabled(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        className={`bk-slot-btn ${selectedSlot === slot
                          ? "bk-slot-btn--active"
                          : ""
                          } ${disabled
                            ? "bk-slot-btn--disabled"
                            : ""
                          }`}
                        onClick={() => {
                          if (disabled) return;

                          setSelectedSlot(
                            slot
                          );

                          setErrors((prev) => ({
                            ...prev,
                            slot: "",
                          }));
                        }}
                        disabled={disabled}
                        title={bookedSlots.includes(slot) ? "This time slot is already booked" : disabled ? "This time slot has passed" : "Click to select slot"}
                      >
                        <FaClock className="bk-slot-icon" />

                        {disabled ? (
                          <del>{slot}</del>
                        ) : (
                          slot
                        )}

                        {disabled && (
                          <span>{bookedSlots.includes(slot) ? "🔒 Booked" : "🔒"}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {errors.slot && (
                <p className="bk-field-error">
                  <FaTimesCircle />
                  {errors.slot}
                </p>
              )}
            </div>
          </section>

          <section className="bk-form-section">
            <h2 className="bk-section-title">
              <FaVideo className="bk-section-icon" />
              Consultation Type
            </h2>

            <div className="bk-consult-options">
              <label
                className={`bk-consult-card ${consultationType ===
                  "in-person"
                  ? "bk-consult-card--active"
                  : ""
                  }`}
              >
                <input
                  type="radio"
                  name="consultationType"
                  className="bk-radio-hidden"
                  checked={
                    consultationType ===
                    "in-person"
                  }
                  onChange={() =>
                    setConsultationType(
                      "in-person"
                    )
                  }
                />

                <div className="bk-consult-icon bk-consult-icon--visit">
                  <FaHospital />
                </div>

                <div className="bk-consult-info">
                  <p className="bk-consult-title">
                    In-Person Visit
                  </p>

                  <p className="bk-consult-desc">
                    Visit the doctor at the
                    clinic / hospital
                  </p>
                </div>

                <div className="bk-consult-check">
                  <FaCheckCircle />
                </div>
              </label>

              <label
                className={`bk-consult-card ${consultationType ===
                  "video"
                  ? "bk-consult-card--active"
                  : ""
                  }`}
              >
                <input
                  type="radio"
                  name="consultationType"
                  className="bk-radio-hidden"
                  checked={
                    consultationType ===
                    "video"
                  }
                  onChange={() =>
                    setConsultationType(
                      "video"
                    )
                  }
                />

                <div className="bk-consult-icon bk-consult-icon--video">
                  <FaVideo />
                </div>

                <div className="bk-consult-info">
                  <p className="bk-consult-title">
                    Video Consultation
                  </p>

                  <p className="bk-consult-desc">
                    Consult online via video
                    call from home
                  </p>
                </div>

                <div className="bk-consult-check">
                  <FaCheckCircle />
                </div>
              </label>
            </div>
          </section>

          <section className="bk-form-section">
            <h2 className="bk-section-title">
              <FaMoneyBillWave className="bk-section-icon" />
              Payment Option
            </h2>

            <div className="bk-payment-options">
              <label
                className={`bk-payment-card ${paymentMethod ===
                  "hospital"
                  ? "bk-payment-card--active"
                  : ""
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="bk-radio-hidden"
                  checked={
                    paymentMethod ===
                    "hospital"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "hospital"
                    )
                  }
                />

                <div className="bk-payment-icon bk-payment-icon--hospital">
                  <FaHospital />
                </div>

                <div className="bk-payment-info">
                  <p className="bk-payment-title">
                    Pay at Hospital
                  </p>

                  <p className="bk-payment-desc">
                    Pay at reception during
                    your visit
                  </p>
                </div>

                <div className="bk-payment-check">
                  <FaCheckCircle />
                </div>
              </label>

              <label
                className={`bk-payment-card ${paymentMethod === "online"
                  ? "bk-payment-card--active"
                  : ""
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  className="bk-radio-hidden"
                  checked={
                    paymentMethod === "online"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "online"
                    )
                  }
                />

                <div className="bk-payment-icon bk-payment-icon--online">
                  <FaMoneyBillWave />
                </div>

                <div className="bk-payment-info">
                  <p className="bk-payment-title">
                    Pay Online
                  </p>

                  <p className="bk-payment-desc">
                    Pay securely using
                    card/UPI
                  </p>
                </div>

                <div className="bk-payment-check">
                  <FaCheckCircle />
                </div>
              </label>
            </div>
          </section>

          <section className="bk-form-section">
            <h2 className="bk-section-title">
              <FaFileAlt className="bk-section-icon" />
              Visit Details
            </h2>

            <div className="bk-field">
              <label className="bk-label">
                Reason for Visit{" "}
                <span className="bk-required">
                  *
                </span>
              </label>

              <div
                className={`bk-input-wrapper ${errors.reason
                  ? "bk-input--error"
                  : ""
                  }`}
              >
                <FaFileAlt className="bk-input-icon" />

                <select
                  className="bk-select"
                  value={reason}
                  onChange={(e) => {
                    setReason(
                      e.target.value
                    );

                    setErrors((prev) => ({
                      ...prev,
                      reason: "",
                    }));
                  }}
                >
                  <option value="">
                    Select reason…
                  </option>

                  {REASON_OPTIONS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {errors.reason && (
                <p className="bk-field-error">
                  <FaTimesCircle />
                  {errors.reason}
                </p>
              )}
            </div>

            <div className="bk-field">
              <label className="bk-label">
                Additional Notes{" "}
                <span className="bk-optional">
                  (optional)
                </span>
              </label>

              <div className="bk-textarea-wrapper">
                <FaStickyNote className="bk-textarea-icon" />

                <textarea
                  className="bk-textarea"
                  placeholder="Describe your symptoms or add any special instructions..."
                  rows={4}
                  maxLength={500}
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                />
              </div>

              <p className="bk-char-count">
                {notes.length}/500 characters
              </p>
            </div>

            <div className="bk-field">
              <label className="bk-label">
                📄 Upload Previous Reports{" "}
                <span className="bk-optional">
                  (optional)
                </span>
              </label>

              <div className="bk-upload-container">
                <label
                  htmlFor="bk-file-upload"
                  className="bk-upload-dropzone"
                >
                  <FaFileAlt className="bk-upload-icon" />

                  <span>
                    Click to upload or drag medical
                    reports here
                  </span>

                  <span className="bk-upload-subtext">
                    PDF, JPEG, or PNG up to 10MB
                  </span>

                  <input
                    type="file"
                    id="bk-file-upload"
                    className="bk-file-input"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={
                      handleFileUpload
                    }
                    disabled={uploading}
                  />
                </label>

                {uploadError && (
                  <div className="bk-upload-error-banner">
                    <FaTimesCircle />
                    {uploadError}
                  </div>
                )}

                {uploading && (
                  <div className="bk-upload-progress">
                    <div className="bk-upload-spinner" />
                    <span>
                      Processing file(s)...
                    </span>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="bk-uploaded-cards-wrap">
                    <h4 className="bk-uploaded-title">
                      Uploaded Medical Reports (
                      {uploadedFiles.length})
                    </h4>

                    <ul className="bk-uploaded-card-list">
                      {uploadedFiles.map(
                        (file, index) => (
                          <li
                            key={
                              file.id ||
                              index
                            }
                            className="bk-uploaded-card"
                          >
                            <div
                              className={`bk-report-type-badge bk-report-type-badge--${file.type}`}
                            >
                              {file.type ===
                                "pdf" ? (
                                <FaFilePdf />
                              ) : (
                                <FaFileImage />
                              )}
                            </div>

                            <div className="bk-report-card-info">
                              <div className="bk-report-card-header">
                                <span className="bk-report-card-name">
                                  {file.name}
                                </span>

                                <span
                                  className={`bk-file-badge bk-file-badge--${file.type}`}
                                >
                                  {
                                    file.fileTypeBadge
                                  }
                                </span>
                              </div>

                              <span className="bk-report-card-size">
                                {file.size}
                              </span>
                            </div>

                            <div className="bk-report-card-actions">
                              <button
                                type="button"
                                className="bk-report-btn bk-report-btn--view"
                                onClick={() =>
                                  setPreviewingReport(
                                    file
                                  )
                                }
                              >
                                <FaEye />
                                <span>
                                  Preview
                                </span>
                              </button>

                              {file.previewUrl && (
                                <a
                                  href={
                                    file.previewUrl
                                  }
                                  download={
                                    file.name
                                  }
                                  className="bk-report-btn bk-report-btn--download"
                                >
                                  <FaDownload />
                                </a>
                              )}

                              <button
                                type="button"
                                className="bk-report-btn bk-report-btn--remove"
                                onClick={() =>
                                  handleRemoveFile(
                                    index
                                  )
                                }
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div
            className="bk-field bk-policy-wrapper"
            style={{
              marginTop: "0.5rem",
            }}
          >
            <label
              className="bk-checkbox-label"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                className="bk-checkbox"
                checked={agreePolicy}
                onChange={(e) => {
                  setAgreePolicy(
                    e.target.checked
                  );

                  setErrors((prev) => ({
                    ...prev,
                    agreePolicy: "",
                  }));
                }}
              />

              <span className="bk-checkbox-text">
                I agree to the{" "}
                <a
                  href="#policy"
                  onClick={(e) => {
                    e.preventDefault();

                    toast.info(
                      "Appointment & Cancellation Policy: Cancellations or rescheduling should be done according to the hospital/doctor policy."
                    );
                  }}
                  style={{
                    color:
                      "var(--primary-color)",
                    fontWeight: "600",
                    textDecoration:
                      "underline",
                  }}
                >
                  appointment &amp;
                  cancellation policy
                </a>

                <span className="bk-required">
                  *
                </span>
              </span>
            </label>

            {errors.agreePolicy && (
              <p className="bk-field-error">
                <FaTimesCircle />
                {errors.agreePolicy}
              </p>
            )}

            {errors.submit && (
              <p className="bk-field-error">
                <FaTimesCircle />
                {errors.submit}
              </p>
            )}
          </div>

          <div
            className="bk-form-actions"
            style={{
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              className="bk-btn bk-btn--cancel"
              onClick={() =>
                navigate(
                  `/patient/doctor-profile/${doctor.mongoId}`
                )
              }
              disabled={bookingLoading}
            >
              <FaTimesCircle />
              Cancel
            </button>

            <button
              type="button"
              className="bk-btn bk-btn--primary"
              onClick={handleConfirm}
              disabled={bookingLoading}
            >
              <FaCalendarCheck />

              {bookingLoading
                ? "Booking..."
                : "Confirm Appointment"}
            </button>
          </div>
        </div>

        <aside
          className="bk-col bk-col--summary"
          aria-label="Appointment summary"
        >
          <div className="bk-summary-card">
            <h3 className="bk-summary-heading">
              Appointment Summary
            </h3>

            <div className="bk-summary-doctor">
              <div
                className="bk-summary-avatar"
                style={{
                  background: `linear-gradient(135deg, ${doctor.color}cc, ${doctor.color}66)`,
                }}
              >
                <span className="bk-summary-initials">
                  {doctor.initials}
                </span>
              </div>

              <div className="bk-summary-doc-info">
                <p className="bk-summary-doc-name">
                  {doctor.name}
                </p>

                <p className="bk-summary-doc-spec">
                  <FaStethoscope className="bk-si" />
                  {doctor.specialization}
                </p>

                <div className="bk-summary-rating">
                  <FaStar className="bk-star" />
                  <span>
                    {doctor.rating}
                  </span>

                  <span className="bk-rev">
                    ({doctor.reviews})
                  </span>
                </div>
              </div>
            </div>

            <hr className="bk-divider" />

            <dl className="bk-summary-rows">
              <div className="bk-summary-row">
                <dt>
                  {isHospital ? (
                    <FaHospital className="bk-si bk-si--hospital" />
                  ) : (
                    <FaClinicMedical className="bk-si bk-si--clinic" />
                  )}

                  {isHospital
                    ? "Hospital"
                    : "Clinic"}
                </dt>

                <dd>
                  {doctor.hospital ||
                    "—"}
                </dd>
              </div>

              <div className="bk-summary-row">
                <dt>
                  <FaMapMarkerAlt className="bk-si bk-si--loc" />
                  Location
                </dt>

                <dd>
                  {doctor.city || "—"}
                </dd>
              </div>

              <div className="bk-summary-row">
                <dt>
                  <FaMoneyBillWave className="bk-si bk-si--fee" />
                  Consult Fee
                </dt>

                <dd className="bk-fee-val">
                  ₹{doctor.fee}
                </dd>
              </div>

              <div className="bk-summary-row">
                <dt>
                  {consultationType ===
                    "video" ? (
                    <FaVideo className="bk-si bk-si--video" />
                  ) : (
                    <FaUserMd className="bk-si bk-si--person" />
                  )}

                  Type
                </dt>

                <dd>
                  {consultationType ===
                    "video"
                    ? "Video Call"
                    : "In-Person"}
                </dd>
              </div>

              {selectedSlot && (
                <div className="bk-summary-row">
                  <dt>
                    <FaClock className="bk-si" />
                    Time Slot
                  </dt>

                  <dd className="bk-slot-val">
                    {selectedSlot}
                  </dd>
                </div>
              )}

              {appointmentDate && (
                <div className="bk-summary-row">
                  <dt>
                    <FaCalendarCheck className="bk-si" />
                    Date
                  </dt>

                  <dd>
                    {new Date(
                      `${appointmentDate}T00:00:00`
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <hr className="bk-divider" />

            <div className="bk-summary-address">
              <p className="bk-summary-address-label">
                <FaMapMarkerAlt className="bk-si bk-si--loc" />
                Full Address
              </p>

              <p className="bk-summary-address-text">
                {doctor.address || "—"}
              </p>

              {doctor.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${doctor.name}, ${doctor.hospital}, ${doctor.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bk-maps-link"
                >
                  📍 View on Google Maps
                </a>
              )}
            </div>

            <div
              className={`bk-summary-notice bk-summary-notice--${doctor.type}`}
            >
              {isHospital ? (
                <FaHospital />
              ) : (
                <FaClinicMedical />
              )}

              <span>
                {isHospital
                  ? "Booked through the hospital"
                  : "Booked directly with the doctor"}
              </span>
            </div>
          </div>

          <div className="bk-help-card">
            <p className="bk-help-title">
              Need Help?
            </p>

            <p className="bk-help-desc">
              For assistance with your appointment,
              contact our support team.
            </p>
          </div>
        </aside>
      </div>

      {previewingReport && (
        <ReportPreviewModal
          report={previewingReport}
          onClose={() =>
            setPreviewingReport(null)
          }
        />
      )}
    </div>
  );
}

export default PatientBookAppointment;