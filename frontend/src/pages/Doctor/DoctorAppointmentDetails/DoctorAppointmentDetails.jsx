import React, { useState, useEffect, useMemo } from "react";
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
} from "react-icons/fa";
import "./DoctorAppointmentDetails.css";
import {
  doctorAppointmentsList,
  getTodayConsultationStatus,
  getJoinedConsultations,
  fetchPatientMedicalRecords,
} from "../../../services/doctorAppointmentsData";

/* ─── Medical History Modal Sub-component ──────────────────────── */
function PatientMedicalHistoryModal({ patientId, patientName, onClose }) {
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPatientMedicalRecords(patientId).then((records) => {
      if (isMounted) {
        setHistoryData(records);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [patientId]);

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
                <span className="history-id-tag">{patientId}</span>
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
                {historyData.medicalConditions?.join(", ") || "None"}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Allergies:</span>
              <span className="summary-val">
                {historyData.allergies?.join(", ") || "None Known"}
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
                <strong>{patientName}</strong> ({patientId}).
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
  const [joinedMap, setJoinedMap] = useState(getJoinedConsultations());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Live timer tick to update time status automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setJoinedMap(getJoinedConsultations());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Look up appointment from shared data list or use default
  const appointment = useMemo(() => {
    if (!id) return doctorAppointmentsList[0];
    const found = doctorAppointmentsList.find(
      (a) => String(a.id) === String(id)
    );
    return (
      found || {
        id: Number(id) || 1,
        patient: "Rahul Nair",
        patientId: "PT-1024",
        age: 32,
        gender: "Male",
        date: "Today",
        time: "10:00 AM",
        type: "Online Consultation",
        symptoms: "Fever, Headache, Body Pain",
        complaint: "Type 2 Diabetes Mellitus Follow-up",
      }
    );
  }, [id]);

  // Compute live consultation time status with 2-minute unlock rule
  const timeStatus = useMemo(() => {
    return getTodayConsultationStatus(appointment, currentTime, joinedMap);
  }, [appointment, currentTime, joinedMap]);

  const handleJoinConsultation = () => {
    if (!timeStatus.canJoin) return;
    navigate(`/doctor/consultation-room/${appointment.id}`);
  };

  return (
    <div className="appointment-details-page">
      {/* ── Medical History Modal ────────────────────── */}
      {showHistoryModal && (
        <PatientMedicalHistoryModal
          patientId={appointment.patientId}
          patientName={appointment.patient}
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
              Patient ID: <strong>{appointment.patientId}</strong>
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
                <p>Scheduled for {appointment.time}. You can join or resume the call room below.</p>
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
                <strong>Upcoming Consultation — Starts at {appointment.time}</strong>
                <p>The Join Consultation button unlocks 2 minutes before scheduled start time.</p>
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
            <span className="detail-value detail-value--bold">
              {appointment.patient}
            </span>
          </div>

          <div className="detail-row">
            <FaUser className="detail-icon" />
            <span className="detail-label">Age</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointment.age} Years</span>
          </div>

          <div className="detail-row">
            <FaUser className="detail-icon" />
            <span className="detail-label">Gender</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointment.gender}</span>
          </div>

          <div className="detail-row">
            <FaCalendarAlt className="detail-icon" />
            <span className="detail-label">Date</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointment.date}</span>
          </div>

          <div className="detail-row">
            <FaClock className="detail-icon" />
            <span className="detail-label">Time</span>
            <span className="colon">:</span>
            <span className="detail-value detail-value--time">
              {appointment.time}
            </span>
          </div>

          <div className="detail-row">
            <FaVideo className="detail-icon" />
            <span className="detail-label">Consultation Type</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointment.type}</span>
          </div>

          <div className="detail-row">
            <FaNotesMedical className="detail-icon" />
            <span className="detail-label">Symptoms</span>
            <span className="colon">:</span>
            <span className="detail-value">{appointment.symptoms}</span>
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────── */}
        <div className="button-group">
          {/* Medical History Action */}
          <button
            className="history-btn"
            onClick={() => setShowHistoryModal(true)}
            title={`View Medical History for ${appointment.patient}`}
          >
            <FaHistory />
            Medical History
          </button>

          {/* Time-controlled Consultation Action */}
          {timeStatus.isCompleted ? (
            <button
              className="prescription-view-btn"
              onClick={() => navigate(`/doctor/prescriptions/${appointment.id}`)}
            >
              <FaPrescriptionBottleAlt />
              View Prescription
            </button>
          ) : timeStatus.isCancelled ? (
            <div className="upcoming-starts-badge" style={{ color: "#dc2626", borderColor: "rgba(239, 68, 68, 0.3)" }}>
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
              Starts at {appointment.time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentDetails;