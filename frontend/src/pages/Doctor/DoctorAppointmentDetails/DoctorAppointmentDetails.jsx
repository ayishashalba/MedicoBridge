import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaHospital,
  FaNotesMedical,
  FaPlay,
  FaLock,
  FaHistory,
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaFlask,
  FaFileAlt,
  FaTimes,
  FaIdBadge,
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaPhoneAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorAppointmentDetails.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

/* ─── Date & Time Formatting Helpers ─────────────────────────── */

const formatDateDisplay = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime12h = (date) => {
  if (!date || isNaN(date.getTime())) return "10:00 AM";
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

const parseAppointmentDateTime = (dateVal, timeSlotVal) => {
  if (!dateVal) return new Date();
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return new Date();

  let year = d.getFullYear();
  let month = d.getMonth();
  let day = d.getDate();

  let hours = 9;
  let minutes = 0;

  if (timeSlotVal && typeof timeSlotVal === "string") {
    const match = timeSlotVal.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  } else if (d.getHours() !== 0 || d.getMinutes() !== 0) {
    hours = d.getHours();
    minutes = d.getMinutes();
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
};

const calculateAge = (dob) => {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "N/A";
  const diffMs = Date.now() - birth.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
};

/* ─── Medical History Modal Sub-component ──────────────────────── */
function PatientMedicalHistoryModal({
  patientId,
  patientName,
  patientCode,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/doctor/patients/${patientId}/medical-history`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setHistoryData(data.data);
      } else {
        toast.error(data.message || "Failed to load patient medical history.");
      }
    } catch (err) {
      console.error("Error fetching medical history:", err);
      toast.error("Network error while loading medical history.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const consultations = historyData?.consultations || [];
  const prescriptions = historyData?.prescriptions || [];
  const labReports = historyData?.labReports || [];
  const documents = historyData?.documents || [];

  const totalRecords =
    consultations.length +
    prescriptions.length +
    labReports.length +
    documents.length;

  const hasAnyRecord = totalRecords > 0;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div
        className="history-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="history-modal-header">
          <div className="history-header-left">
            <div className="history-header-icon">
              <FaHistory />
            </div>
            <div>
              <h3>Patient Medical History</h3>
              <p>
                Patient: <strong>{patientName}</strong> · ID:{" "}
                <span className="history-id-tag">{patientCode}</span>
              </p>
            </div>
          </div>
          <button
            className="history-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Patient Summary Banner */}
        {historyData && (
          <div className="history-patient-summary-strip">
            <div className="summary-item">
              <span className="summary-label">Blood Group:</span>
              <span className="summary-val">
                {historyData.bloodGroup || "Not Provided"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Conditions:</span>
              <span className="summary-val">
                {historyData.medicalConditions?.length > 0
                  ? historyData.medicalConditions.join(", ")
                  : "None"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Allergies:</span>
              <span className="summary-val">
                {historyData.allergies?.length > 0
                  ? historyData.allergies.join(", ")
                  : "None Known"}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="history-tabs-nav">
          {[
            { key: "All", label: "All Records", count: totalRecords },
            {
              key: "Consultations",
              label: "Consultations",
              count: consultations.length,
            },
            {
              key: "Prescriptions",
              label: "Prescriptions",
              count: prescriptions.length,
            },
            {
              key: "Lab Reports",
              label: "Lab Reports",
              count: labReports.length,
            },
            {
              key: "Documents",
              label: "Documents",
              count: documents.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`history-tab-btn ${
                activeTab === tab.key ? "history-tab-btn--active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="history-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="history-modal-body">
          {loading ? (
            <div className="history-loading-box">
              <FaSpinner className="history-spin-icon" />
              <p>Loading patient medical history...</p>
            </div>
          ) : !hasAnyRecord ? (
            <div className="history-empty-state">
              <div className="history-empty-icon">
                <FaNotesMedical />
              </div>
              <h4>No previous medical history available.</h4>
              <p>
                There are no prior medical consultations, prescriptions, lab
                reports, or uploaded documents recorded for patient{" "}
                <strong>{patientName}</strong> ({patientCode}).
              </p>
            </div>
          ) : (
            <div className="history-records-list">
              {/* Consultations */}
              {(activeTab === "All" || activeTab === "Consultations") &&
                consultations.map((item) => (
                  <div className="history-record-card" key={item.id}>
                    <div className="record-card-top">
                      <div className="record-type-chip record-type--consultation">
                        <FaStethoscope /> Previous Consultation
                      </div>
                      <span className="record-date-tag">{item.date}</span>
                    </div>

                    <h4 className="record-title">{item.diagnosis}</h4>
                    <p className="record-doctor-meta">
                      {item.doctor} · {item.specialization} · {item.hospital}
                    </p>

                    {item.symptoms && (
                      <div className="record-field-row">
                        <span className="record-field-label">
                          Reported Symptoms:
                        </span>
                        <span className="record-field-value">
                          {item.symptoms}
                        </span>
                      </div>
                    )}

                    {item.treatment && (
                      <div className="record-field-row">
                        <span className="record-field-label">
                          Treatment / Plan:
                        </span>
                        <span className="record-field-value">
                          {item.treatment}
                        </span>
                      </div>
                    )}

                    {item.notes && (
                      <div className="record-notes-box">
                        <strong>Clinical Notes:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                ))}

              {/* Prescriptions */}
              {(activeTab === "All" || activeTab === "Prescriptions") &&
                prescriptions.map((item) => (
                  <div className="history-record-card" key={item.id}>
                    <div className="record-card-top">
                      <div className="record-type-chip record-type--prescription">
                        <FaPrescriptionBottleAlt /> Prescription #{item.id}
                      </div>
                      <span className="record-date-tag">{item.date}</span>
                    </div>

                    <h4 className="record-title">Diagnosis: {item.diagnosis}</h4>
                    <p className="record-doctor-meta">
                      Prescribed by {item.doctor} · {item.hospital}
                    </p>

                    <div className="prescribed-meds-table-wrap">
                      <table className="prescribed-meds-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th>Dosage</th>
                            <th>Duration</th>
                            <th>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.medicines?.map((med, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{med.name}</strong>
                              </td>
                              <td>{med.dosage}</td>
                              <td>{med.duration}</td>
                              <td>{med.instructions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {item.notes && (
                      <div className="record-notes-box">
                        <strong>Doctor's Advice:</strong> {item.notes}
                      </div>
                    )}
                  </div>
                ))}

              {/* Lab Reports */}
              {(activeTab === "All" || activeTab === "Lab Reports") &&
                labReports.map((item) => (
                  <div className="history-record-card" key={item.id}>
                    <div className="record-card-top">
                      <div className="record-type-chip record-type--lab">
                        <FaFlask /> Lab Test Report
                      </div>
                      <span className="record-date-tag">{item.date}</span>
                    </div>

                    <h4 className="record-title">{item.test}</h4>
                    <p className="record-doctor-meta">
                      Ordered by {item.orderedBy} · {item.hospital} · Ref:{" "}
                      {item.referenceId}
                    </p>

                    <div className="lab-results-table-wrap">
                      <table className="lab-results-table">
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Measured Value</th>
                            <th>Normal Range</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.results?.map((res, idx) => (
                            <tr key={idx}>
                              <td>{res.parameter}</td>
                              <td>
                                <strong>{res.value}</strong>
                              </td>
                              <td>{res.normalRange}</td>
                              <td>
                                <span
                                  className={`lab-status-badge lab-status--${
                                    res.flag === "Normal"
                                      ? "normal"
                                      : res.flag === "Borderline"
                                      ? "borderline"
                                      : "abnormal"
                                  }`}
                                >
                                  {res.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

              {/* Documents */}
              {(activeTab === "All" || activeTab === "Documents") &&
                documents.map((item) => (
                  <div className="history-record-card" key={item.id}>
                    <div className="record-card-top">
                      <div className="record-type-chip record-type--document">
                        <FaFileAlt /> Medical Document ({item.type})
                      </div>
                      <span className="record-date-tag">{item.date}</span>
                    </div>

                    <h4 className="record-title">{item.title}</h4>
                    <p className="record-doctor-meta">
                      Uploaded by {item.uploadedBy} · {item.hospital} · Size:{" "}
                      {item.fileSize}
                    </p>

                    <div className="record-notes-box">
                      <strong>Report Findings:</strong> {item.description}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="history-modal-footer">
          <button className="history-close-btn" onClick={onClose}>
            Close Medical History
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Doctor Appointment Details Component ─────────────────── */
function DoctorAppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({});
  const [error, setError] = useState("");

  const fetchAppointmentDetails = useCallback(async () => {
    if (!id) {
      setError("No appointment ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/doctor/appointments/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success && data.data?.appointment) {
        setAppointment(data.data.appointment);
        if (data.data.doctor) {
          setDoctorInfo(data.data.doctor);
        }
      } else {
        setError(data.message || "Appointment not found or not authorized.");
      }
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setError("Network error while loading appointment details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [fetchAppointmentDetails]);

  // Live timer tick to update time status automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Compute live consultation time status with 2-minute unlock rule
  const timeStatus = useMemo(() => {
    if (!appointment) {
      return {
        badgeLabel: "Unknown",
        badgeClass: "status-pill--upcoming",
        canJoin: false,
        isReady: false,
        isOngoing: false,
        isCompleted: false,
        isCancelled: false,
        message: "",
      };
    }

    const patientName = appointment.patientId?.name || "Patient";
    const status = (appointment.status || "Pending").trim();
    const isOnline = /video|online/i.test(appointment.type || "");

    const apptDate = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
    const diffMs = apptDate.getTime() - currentTime.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.ceil(diffSeconds / 60);

    const isToday =
      apptDate.getFullYear() === currentTime.getFullYear() &&
      apptDate.getMonth() === currentTime.getMonth() &&
      apptDate.getDate() === currentTime.getDate();

    const formattedTime = appointment.timeSlot || formatTime12h(apptDate);

    // 1. Completed
    if (status.toLowerCase() === "completed") {
      return {
        badgeLabel: "Completed",
        badgeClass: "status-pill--completed",
        canJoin: false,
        isReady: false,
        isOngoing: false,
        isCompleted: true,
        isCancelled: false,
        message: "This session has already been completed and documented.",
        formattedTime,
      };
    }

    // 2. Cancelled
    if (status.toLowerCase() === "cancelled") {
      return {
        badgeLabel: "Cancelled",
        badgeClass: "status-pill--cancelled",
        canJoin: false,
        isReady: false,
        isOngoing: false,
        isCompleted: false,
        isCancelled: true,
        message: appointment.cancellationReason
          ? `Cancelled: ${appointment.cancellationReason}`
          : "This appointment was cancelled.",
        formattedTime,
      };
    }

    // 3. Ongoing / In-Progress
    if (status.toLowerCase() === "in-progress" || appointment.consultation?.status === "In-Progress") {
      return {
        badgeLabel: "Ongoing",
        badgeClass: "status-pill--ongoing",
        canJoin: true,
        isReady: false,
        isOngoing: true,
        isCompleted: false,
        isCancelled: false,
        message: `Scheduled for ${formattedTime}. You can join or resume the call room below.`,
        formattedTime,
      };
    }

    // 4. Pre-join window: within 2 mins of scheduled time (0 <= diffSeconds <= 120)
    if (isOnline && isToday && diffSeconds >= 0 && diffSeconds <= 120) {
      return {
        badgeLabel: "Starting Soon",
        badgeClass: "status-pill--ready",
        canJoin: true,
        isReady: true,
        isOngoing: false,
        isCompleted: false,
        isCancelled: false,
        message: `Starts in ${Math.max(1, diffSeconds)}s. Join Consultation is now available.`,
        formattedTime,
      };
    }

    // 5. Upcoming (> 2 minutes)
    return {
      badgeLabel: status === "Confirmed" ? "Confirmed" : "Upcoming",
      badgeClass: "status-pill--upcoming",
      canJoin: false,
      isReady: false,
      isOngoing: false,
      isCompleted: false,
      isCancelled: false,
      message: isToday
        ? `Starts in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}. The Join Consultation button unlocks 2 minutes before scheduled start time.`
        : `Upcoming consultation scheduled for ${formatDateDisplay(apptDate)} at ${formattedTime}. The Join Consultation button unlocks 2 minutes before scheduled start time.`,
      formattedTime,
    };
  }, [appointment, currentTime]);

  const handleJoinConsultation = () => {
    if (!timeStatus.canJoin || !appointment) return;
    navigate(`/doctor/consultation-room/${appointment._id}`);
  };

  if (loading) {
    return (
      <div className="appointment-details-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Appointments
        </button>
        <div className="details-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <FaSpinner className="spin-icon" style={{ fontSize: "2.4rem", color: "var(--primary-color)", marginBottom: "1rem" }} />
          <h2>Loading Appointment Details...</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Fetching live record from database.</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-details-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Appointments
        </button>
        <div className="details-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#f59e0b", marginBottom: "1rem" }} />
          <h2>Appointment Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            {error || "The requested appointment record could not be found or you are not authorized to view it."}
          </p>
        </div>
      </div>
    );
  }

  const patient = appointment.patientId || {};
  const patientName = patient.name || "Patient";
  const patientCode = patient.patientId
    ? `#${patient.patientId}`
    : patient._id
    ? `#PT-${String(patient._id).slice(-5).toUpperCase()}`
    : "#PT-NEW";
  const patientAge = calculateAge(patient.dob);
  const patientGender = patient.gender || "Not Provided";

  const apptDateObj = parseAppointmentDateTime(appointment.date, appointment.timeSlot);
  const appointmentDateDisplay = formatDateDisplay(apptDateObj);
  const appointmentTimeDisplay = appointment.timeSlot || formatTime12h(apptDateObj);

  const isOnline = /video|online/i.test(appointment.type || "");
  const isHospital =
    /hospital/i.test(doctorInfo.practiceType || "") ||
    Boolean(doctorInfo.hospitalName) ||
    !doctorInfo.clinicName;
  const consultationTypeDisplay = isOnline
    ? "Online Video Consultation"
    : isHospital
    ? "Hospital Visit"
    : "Clinic Visit";

  const symptomsDisplay =
    appointment.reason ||
    (appointment.symptoms && appointment.symptoms.length > 0
      ? appointment.symptoms.join(", ")
      : "Not Provided");

  return (
    <div className="appointment-details-page">
      {/* ── Medical History Modal ────────────────────── */}
      {showHistoryModal && (
        <PatientMedicalHistoryModal
          patientId={patient._id}
          patientName={patientName}
          patientCode={patientCode}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* ── Back Button ──────────────────────────────── */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back to Appointments
      </button>

      <div className="details-card">
        <div className="details-card-header">
          <div>
            <h2>Appointment Details</h2>
            <p className="details-card-sub">
              Patient ID: <strong>{patientCode}</strong>
            </p>
          </div>
          <span className={`status-pill-lg ${timeStatus.badgeClass}`}>
            {timeStatus.badgeLabel}
          </span>
        </div>

        {/* ── Time-based Consultation Status Alert Banner ── */}
        <div
          className={`time-status-alert-banner time-status-alert-banner--${
            timeStatus.isReady
              ? "active"
              : timeStatus.isOngoing
              ? "ongoing"
              : timeStatus.isCompleted
              ? "completed"
              : timeStatus.isCancelled
              ? "cancelled"
              : "disabled"
          }`}
        >
          {timeStatus.isCancelled ? (
            <div className="alert-banner-content">
              <FaTimesCircle />
              <div>
                <strong>Appointment Cancelled</strong>
                <p>{timeStatus.message}</p>
              </div>
            </div>
          ) : timeStatus.isReady ? (
            <div className="alert-banner-content">
              <FaPhoneAlt className="alert-pulse-icon" />
              <div>
                <strong>Join Consultation is Available</strong>
                <p>{timeStatus.message}</p>
              </div>
            </div>
          ) : timeStatus.isOngoing ? (
            <div className="alert-banner-content">
              <FaVideo className="alert-pulse-icon" />
              <div>
                <strong>Consultation is currently Ongoing</strong>
                <p>
                  Scheduled for {appointmentTimeDisplay}. You can join or resume the call room below.
                </p>
              </div>
            </div>
          ) : timeStatus.isCompleted ? (
            <div className="alert-banner-content">
              <FaCheckCircle />
              <div>
                <strong>Consultation Completed</strong>
                <p>This session has already been completed and documented.</p>
              </div>
            </div>
          ) : (
            <div className="alert-banner-content">
              <FaLock />
              <div>
                <strong>
                  Upcoming Consultation — Starts at {appointmentTimeDisplay}
                </strong>
                <p>
                  The Join Consultation button unlocks 2 minutes before scheduled start time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Detail Rows ──────────────────────────────── */}
        <div className="detail-rows-container">
          <div className="detail-row">
            <FaUser className="detail-icon" />
            <span className="detail-label">Patient Name</span>
            <span className="colon">:</span>
            <span className="detail-value detail-value--bold">{patientName}</span>
          </div>

          <div className="detail-row">
            <FaUser className="detail-icon" />
            <span className="detail-label">Age</span>
            <span className="colon">:</span>
            <span className="detail-value">{patientAge} Years</span>
          </div>

          <div className="detail-row">
            <FaUser className="detail-icon" />
            <span className="detail-label">Gender</span>
            <span className="colon">:</span>
            <span className="detail-value">{patientGender}</span>
          </div>

          <div className="detail-row">
            <FaCalendarAlt className="detail-icon" />
            <span className="detail-label">Date</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointmentDateDisplay}</span>
          </div>

          <div className="detail-row">
            <FaClock className="detail-icon" />
            <span className="detail-label">Time</span>
            <span className="colon">:</span>
            <span className="detail-value detail-value--time">
              {appointmentTimeDisplay}
            </span>
          </div>

          <div className="detail-row">
            {isOnline ? (
              <FaVideo className="detail-icon" />
            ) : (
              <FaHospital className="detail-icon" />
            )}
            <span className="detail-label">Consultation Type</span>
            <span className="colon">:</span>
            <span className="detail-value">{consultationTypeDisplay}</span>
          </div>

          <div className="detail-row">
            <FaNotesMedical className="detail-icon" />
            <span className="detail-label">Symptoms</span>
            <span className="colon">:</span>
            <span className="detail-value">{symptomsDisplay}</span>
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────── */}
        <div className="button-group">
          {/* Medical History Action */}
          <button
            className="history-btn"
            onClick={() => setShowHistoryModal(true)}
            title={`View Medical History for ${patientName}`}
          >
            <FaHistory />
            Medical History
          </button>

          {/* Time-controlled Consultation Action */}
          {timeStatus.isCompleted ? (
            <button
              className="prescription-view-btn"
              onClick={() =>
                navigate(
                  `/doctor/prescriptions/${
                    appointment.prescriptionId || appointment._id
                  }`
                )
              }
            >
              <FaPrescriptionBottleAlt />
              View Prescription
            </button>
          ) : timeStatus.isCancelled ? (
            <div
              className="upcoming-starts-badge"
              style={{ color: "#dc2626", borderColor: "rgba(239, 68, 68, 0.3)" }}
            >
              <FaTimesCircle />
              Cancelled
            </div>
          ) : timeStatus.canJoin ? (
            <button
              className={`start-btn ${
                timeStatus.isReady ? "start-btn--active-pulse" : "start-btn--ongoing"
              }`}
              onClick={handleJoinConsultation}
            >
              <FaPhoneAlt />
              Join Consultation
            </button>
          ) : (
            <div className="upcoming-starts-badge">
              <FaLock />
              Starts at {appointmentTimeDisplay}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentDetails;