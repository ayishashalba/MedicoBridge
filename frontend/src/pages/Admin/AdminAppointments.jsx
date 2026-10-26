import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaUserMd,
  FaUser,
  FaHospital,
  FaCalendarCheck,
  FaExclamationCircle,
  FaPlay,
  FaShieldAlt,
} from "react-icons/fa";
import "./AdminPages.css";

const API_BASE_URL = "http://localhost:5000/api/admin/appointments";

const statusConfig = {
  Upcoming: {
    bg: "#e0f2fe",
    color: "#0284c7",
    icon: <FaCalendarAlt />,
  },
  Ongoing: {
    bg: "#ede9fe",
    color: "#6d28d9",
    icon: <FaPlay />,
  },
  Completed: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: <FaCheckCircle />,
  },
  Cancelled: {
    bg: "#fee2e2",
    color: "#dc2626",
    icon: <FaTimes />,
  },
  Overdue: {
    bg: "#fef3c7",
    color: "#d97706",
    icon: <FaExclamationCircle />,
  },
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (value, fallback = "Not provided") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value || fallback;
  }

  return (
    value.name ||
    value.fullName ||
    value.userId?.name ||
    value.userId?.fullName ||
    fallback
  );
};

const getPhone = (value) => {
  if (!value || typeof value === "string") return "";

  return (
    value.phone ||
    value.mobile ||
    value.contactNumber ||
    value.userId?.phone ||
    ""
  );
};

const getEmail = (value) => {
  if (!value || typeof value === "string") return "";

  return value.email || value.userId?.email || "";
};

const getSpecialization = (doctor) => {
  if (!doctor || typeof doctor === "string") return "";

  return doctor.specialization || doctor.department || "";
};

const getHospitalName = (hospital) => {
  if (!hospital) return "Not assigned";

  if (typeof hospital === "string") {
    return hospital;
  }

  return hospital.name || hospital.hospitalName || "Not assigned";
};

const formatDate = (value) => {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeSlot) => {
  if (!timeSlot) return "Not provided";
  return timeSlot;
};

const getAppointmentId = (appointment) => {
  return (
    appointment.appointmentId ||
    `APT-${String(appointment._id || "").slice(-6).toUpperCase()}`
  );
};

const normalizeType = (type) => {
  if (!type) return "In-Person";

  if (type === "Online Consultation") {
    return "Online Consultation";
  }

  if (type === "In-Person") {
    return "In-Person";
  }

  if (type === "Emergency") {
    return "Emergency";
  }

  if (type === "General Visit") {
    return "General Visit";
  }

  return type;
};

/*
 * Converts backend Appointment status into the admin's
 * display status while considering the scheduled date.
 *
 * Backend statuses:
 * Pending
 * Confirmed
 * In-Progress
 * Completed
 * Cancelled
 */
const getComputedStatus = (appointment) => {
  const backendStatus = appointment?.status || "Pending";

  if (backendStatus === "Cancelled") {
    return "Cancelled";
  }

  if (backendStatus === "Completed") {
    return "Completed";
  }

  if (backendStatus === "In-Progress") {
    return "Ongoing";
  }

  const appointmentDate = appointment?.date
    ? new Date(appointment.date)
    : null;

  if (!appointmentDate || Number.isNaN(appointmentDate.getTime())) {
    return backendStatus === "Pending" || backendStatus === "Confirmed"
      ? "Upcoming"
      : backendStatus;
  }

  const now = new Date();

  /*
   * If the appointment date is before today and it is still
   * Pending/Confirmed, consider it overdue.
   */
  const appointmentDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate()
  );

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  if (appointmentDay < today) {
    return "Overdue";
  }

  /*
   * For today's appointments, use timeSlot when possible.
   * If exact time cannot be parsed, keep it Upcoming.
   */
  if (appointmentDay.getTime() === today.getTime()) {
    const slot = String(appointment.timeSlot || "").trim();

    const match = slot.match(
      /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/
    );

    if (match) {
      let hours = Number(match[1]);
      const minutes = Number(match[2] || 0);
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === "PM" && hours < 12) {
        hours += 12;
      }

      if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }

      const startTime = new Date(
        appointmentDay.getFullYear(),
        appointmentDay.getMonth(),
        appointmentDay.getDate(),
        hours,
        minutes,
        0,
        0
      );

      /*
       * Assume a consultation slot is approximately 60 minutes
       * for display-status calculation only.
       */
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      if (now >= startTime && now <= endTime) {
        return "Ongoing";
      }

      if (now > endTime) {
        return "Overdue";
      }
    }
  }

  return "Upcoming";
};

const getSymptomsText = (symptoms) => {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return "Not provided";
  }

  return symptoms.join(", ");
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedApt, setSelectedApt] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Admin authentication token not found.");
      }

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch appointments."
        );
      }

      const data = Array.isArray(result?.data)
        ? result.data
        : [];

      setAppointments(data);
    } catch (err) {
      console.error("Admin appointments fetch error:", err);
      setError(
        err.message || "Failed to load appointments."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /*
   * Re-evaluate time-based statuses periodically.
   * This allows an appointment to move from Upcoming -> Ongoing
   * without refreshing the page.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointments((current) => [...current]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((appointment) => ({
      ...appointment,
      computedStatus: getComputedStatus(appointment),
    }));
  }, [appointments]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedAppointments.filter((apt) => {
      const patientName = getName(apt.patientId, "");
      const doctorName = getName(apt.doctorId, "");
      const hospitalName = getHospitalName(apt.hospitalId);
      const specialization = getSpecialization(apt.doctorId);
      const appointmentId = getAppointmentId(apt);

      const matchesSearch =
        !query ||
        patientName.toLowerCase().includes(query) ||
        doctorName.toLowerCase().includes(query) ||
        hospitalName.toLowerCase().includes(query) ||
        specialization.toLowerCase().includes(query) ||
        appointmentId.toLowerCase().includes(query) ||
        String(apt.department || "")
          .toLowerCase()
          .includes(query) ||
        String(apt.reason || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        apt.computedStatus === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        normalizeType(apt.type) === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    normalizedAppointments,
    search,
    statusFilter,
    typeFilter,
  ]);

  const activeCount = normalizedAppointments.filter(
    (appointment) =>
      appointment.computedStatus === "Upcoming" ||
      appointment.computedStatus === "Ongoing"
  ).length;

  const ongoingCount = normalizedAppointments.filter(
    (appointment) =>
      appointment.computedStatus === "Ongoing"
  ).length;

  const completedCount = normalizedAppointments.filter(
    (appointment) =>
      appointment.computedStatus === "Completed"
  ).length;

  const cancelledCount = normalizedAppointments.filter(
    (appointment) =>
      appointment.computedStatus === "Cancelled"
  ).length;

  const totalCount = normalizedAppointments.length;

  const fulfillmentRate =
    totalCount > 0
      ? ((completedCount / totalCount) * 100).toFixed(1)
      : "0.0";

  const selectedStatus = selectedApt
    ? getComputedStatus(selectedApt)
    : "";

  const selectedStatusConfig =
    statusConfig[selectedStatus] || {
      bg: "#f1f5f9",
      color: "#475569",
      icon: <FaCalendarAlt />,
    };

  return (
    <div className="ad-page">
      {/* Header */}
      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaCalendarCheck
            style={{ color: "var(--ad-primary)" }}
          />
          Appointments &amp; Telehealth Oversight
        </h2>

        <p>
          Platform supervision: View-only monitoring of
          scheduled appointments, consultation modes, and
          appointment compliance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="ad-kpi-grid">
        {/* Active */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <FaCalendarAlt />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Active / Upcoming
            </span>

            <h3 className="ad-kpi-value">
              {activeCount} Bookings
            </h3>

            {ongoingCount > 0 && (
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "#6d28d9",
                  fontWeight: "700",
                }}
              >
                ● {ongoingCount} In-Session Right Now
              </span>
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <FaClock />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Completed Consults
            </span>

            <h3 className="ad-kpi-value">
              {completedCount} Sessions
            </h3>

            <span className="ad-kpi-delta up">
              {fulfillmentRate}% Completion Rate
            </span>
          </div>
        </div>

        {/* Cancelled */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#fee2e2",
              color: "#dc2626",
            }}
          >
            <FaTimes />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Cancelled Appointments
            </span>

            <h3 className="ad-kpi-value">
              {cancelledCount}
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--ad-text-muted)",
              }}
            >
              Managed by Doctor/Hospital
            </span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="ad-card">
        {/* Search + Filters */}
        <div
          className="ad-search-filter-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <div
            className="ad-search-wrapper"
            style={{
              flex: 1,
              minWidth: "260px",
            }}
          >
            <FaSearch className="ad-search-icon" />

            <input
              type="text"
              placeholder="Search by Patient, Doctor, Hospital, Specialization, Apt ID..."
              className="ad-input"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div
            className="ad-filters"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <select
              className="ad-select"
              style={{ width: "160px" }}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Ongoing">
                In-Progress / Ongoing
              </option>

              <option value="Upcoming">
                Upcoming / Scheduled
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

              <option value="Overdue">
                Overdue
              </option>
            </select>

            <select
              className="ad-select"
              style={{ width: "180px" }}
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="All">
                All Formats
              </option>

              <option value="Online Consultation">
                Online Consultation
              </option>

              <option value="In-Person">
                In-Person
              </option>

              <option value="Emergency">
                Emergency
              </option>

              <option value="General Visit">
                General Visit
              </option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              margin: "0 1rem 1rem",
              padding: "0.8rem 1rem",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--ad-text-muted)",
            }}
          >
            Loading appointments...
          </div>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient Name</th>
                  <th>
                    Doctor &amp; Specialization
                  </th>
                  <th>Consultation Mode</th>
                  <th>Date &amp; Time Slot</th>
                  <th>Fee Status</th>
                  <th>Time-Based Status</th>
                  <th>Audit</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "2.5rem",
                        color:
                          "var(--ad-text-muted)",
                      }}
                    >
                      {appointments.length === 0
                        ? "No appointments found in the database."
                        : "No appointments match the selected query."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((apt) => {
                    const appointmentId =
                      getAppointmentId(apt);

                    const patientName =
                      getName(
                        apt.patientId,
                        "Unknown Patient"
                      );

                    const patientPhone =
                      getPhone(apt.patientId);

                    const doctorName =
                      getName(
                        apt.doctorId,
                        "Unknown Doctor"
                      );

                    const specialization =
                      getSpecialization(
                        apt.doctorId
                      );

                    const hospitalName =
                      getHospitalName(
                        apt.hospitalId
                      );

                    const consultationType =
                      normalizeType(apt.type);

                    const effectiveStatus =
                      apt.computedStatus;

                    const sc =
                      statusConfig[
                      effectiveStatus
                      ] || {
                        bg: "#f1f5f9",
                        color: "#475569",
                        icon: <FaCalendarAlt />,
                      };

                    return (
                      <tr key={apt._id}>
                        {/* Appointment ID */}
                        <td>
                          <strong className="ad-id-badge">
                            {appointmentId}
                          </strong>
                        </td>

                        {/* Patient */}
                        <td>
                          <strong>
                            {patientName}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              color:
                                "var(--ad-text-muted)",
                            }}
                          >
                            {patientPhone ||
                              getId(
                                apt.patientId
                              ) ||
                              "Registered Patient"}
                          </span>
                        </td>

                        {/* Doctor */}
                        <td>
                          <div>
                            <strong>
                              {doctorName}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                fontSize: "0.72rem",
                                color:
                                  "var(--ad-text-muted)",
                              }}
                            >
                              {specialization ||
                                apt.department ||
                                "General"}
                              {" · "}
                              {hospitalName}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "0.45rem",
                              fontSize: "0.82rem",
                            }}
                          >
                            {consultationType ===
                              "Online Consultation" ? (
                              <FaVideo
                                style={{
                                  color:
                                    "var(--ad-primary)",
                                }}
                              />
                            ) : (
                              <FaCalendarAlt
                                style={{
                                  color:
                                    "var(--ad-text-secondary)",
                                }}
                              />
                            )}

                            {consultationType}
                          </span>
                        </td>

                        {/* Date */}
                        <td>
                          <strong>
                            {formatDate(
                              apt.date
                            )}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color:
                                "var(--ad-text-muted)",
                            }}
                          >
                            {formatTime(
                              apt.timeSlot
                            )}
                          </span>
                        </td>

                        {/* Fee */}
                        <td>
                          <strong>
                            ₹{apt.fee ?? 500}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              color:
                                apt.paymentStatus ===
                                  "Paid"
                                  ? "#16a34a"
                                  : apt.paymentStatus ===
                                    "Pending"
                                    ? "#d97706"
                                    : "#dc2626",
                              fontWeight: "600",
                            }}
                          >
                            {apt.paymentStatus ||
                              "Pending"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className="ad-pill"
                            style={{
                              background: sc.bg,
                              color: sc.color,
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "0.3rem",
                            }}
                          >
                            {sc.icon}
                            {effectiveStatus}
                          </span>
                        </td>

                        {/* Audit */}
                        <td>
                          <button
                            onClick={() =>
                              setSelectedApt(
                                apt
                              )
                            }
                            className="ad-btn ad-btn-primary"
                            style={{
                              padding:
                                "0.35rem 0.65rem",
                              fontSize:
                                "0.78rem",
                            }}
                            title="View Appointment Audit"
                          >
                            <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Audit Modal */}
      {selectedApt && (
        <div
          className="ad-modal-overlay"
          onClick={() =>
            setSelectedApt(null)
          }
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "720px",
            }}
          >
            {/* Modal Header */}
            <div className="ad-modal-header">
              <div>
                <h3
                  className="ad-modal-title"
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaShieldAlt
                    style={{
                      color:
                        "var(--ad-primary)",
                    }}
                  />
                  Appointment Audit
                  (View Only)
                </h3>

                <span
                  className="ad-id-badge"
                  style={{
                    marginTop: "4px",
                  }}
                >
                  {getAppointmentId(
                    selectedApt
                  )}
                </span>
              </div>

              <button
                className="ad-modal-close"
                onClick={() =>
                  setSelectedApt(null)
                }
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="ad-modal-body"
              style={{
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              {/* Status Header */}
              <div
                style={{
                  background:
                    selectedStatusConfig.bg,
                  color:
                    selectedStatusConfig.color,
                  padding:
                    "0.75rem 1rem",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom:
                    "1.25rem",
                  fontWeight: "700",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "0.4rem",
                  }}
                >
                  {
                    selectedStatusConfig.icon
                  }

                  Status: {selectedStatus}
                </span>

                <span
                  style={{
                    fontSize: "0.85rem",
                  }}
                >
                  Fee: ₹
                  {selectedApt.fee ??
                    500}{" "}
                  (
                  {
                    selectedApt.paymentStatus ||
                    "Pending"
                  }
                  )
                </span>
              </div>

              {/* Patient & Doctor */}
              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                  marginBottom:
                    "1.25rem",
                }}
              >
                {/* Patient */}
                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius:
                      "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize:
                        "0.88rem",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaUser />
                    Patient Profile
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontWeight: "700",
                    }}
                  >
                    {getName(
                      selectedApt.patientId,
                      "Unknown Patient"
                    )}
                  </p>

                  {getPhone(
                    selectedApt.patientId
                  ) && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize:
                            "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Phone:{" "}
                        {getPhone(
                          selectedApt.patientId
                        )}
                      </p>
                    )}

                  {getEmail(
                    selectedApt.patientId
                  ) && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize:
                            "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Email:{" "}
                        {getEmail(
                          selectedApt.patientId
                        )}
                      </p>
                    )}

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    ID:{" "}
                    {getId(
                      selectedApt.patientId
                    ) ||
                      "PAT-Registered"}
                  </p>
                </div>

                {/* Doctor */}
                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius:
                      "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize:
                        "0.88rem",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaUserMd />
                    Attending Doctor
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontWeight: "700",
                    }}
                  >
                    {getName(
                      selectedApt.doctorId,
                      "Unknown Doctor"
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    {getSpecialization(
                      selectedApt.doctorId
                    ) ||
                      selectedApt.department ||
                      "General"}
                  </p>

                  {getPhone(
                    selectedApt.doctorId
                  ) && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize:
                            "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Phone:{" "}
                        {getPhone(
                          selectedApt.doctorId
                        )}
                      </p>
                    )}

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Hospital:{" "}
                    {getHospitalName(
                      selectedApt.hospitalId
                    )}
                  </p>
                </div>
              </div>

              {/* Appointment Details */}
              <div
                style={{
                  background: "#f8fafc",
                  border:
                    "1px solid var(--ad-border-color)",
                  padding: "1rem",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "1.25rem",
                }}
              >
                <h4
                  style={{
                    margin:
                      "0 0 0.6rem",
                    fontSize:
                      "0.92rem",
                  }}
                >
                  Appointment Details
                </h4>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Scheduled Date:
                  </strong>{" "}
                  {formatDate(
                    selectedApt.date
                  )}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Time Slot:
                  </strong>{" "}
                  {selectedApt.timeSlot ||
                    "Not provided"}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Consultation Mode:
                  </strong>{" "}
                  {normalizeType(
                    selectedApt.type
                  )}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Department:
                  </strong>{" "}
                  {selectedApt.department ||
                    "Not specified"}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Reason:
                  </strong>{" "}
                  {selectedApt.reason ||
                    "Not provided"}
                </p>

                <p
                  style={{
                    margin:
                      "0 0 0.35rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Symptoms:
                  </strong>{" "}
                  {getSymptomsText(
                    selectedApt.symptoms
                  )}
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "0.85rem",
                  }}
                >
                  <strong>
                    Notes:
                  </strong>{" "}
                  {selectedApt.notes ||
                    "No notes provided."}
                </p>
              </div>

              {/* Payment */}
              <div
                style={{
                  background:
                    "var(--ad-bg-secondary)",
                  padding:
                    "0.75rem 1rem",
                  borderRadius:
                    "8px",
                  marginBottom:
                    "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        "0.85rem",
                      fontWeight:
                        "600",
                    }}
                  >
                    Payment Status
                  </span>

                  <span
                    className="ad-pill"
                    style={{
                      background:
                        selectedApt.paymentStatus ===
                          "Paid"
                          ? "#dcfce7"
                          : selectedApt.paymentStatus ===
                            "Pending"
                            ? "#fef3c7"
                            : "#fee2e2",
                      color:
                        selectedApt.paymentStatus ===
                          "Paid"
                          ? "#16a34a"
                          : selectedApt.paymentStatus ===
                            "Pending"
                            ? "#d97706"
                            : "#dc2626",
                    }}
                  >
                    {selectedApt.paymentStatus ||
                      "Pending"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop:
                      "0.5rem",
                    fontSize:
                      "0.85rem",
                  }}
                >
                  Consultation Fee: ₹
                  {selectedApt.fee ??
                    500}
                </div>
              </div>

              {/* Cancellation */}
              {selectedApt.status ===
                "Cancelled" && (
                  <div
                    style={{
                      background:
                        "#fff7ed",
                      border:
                        "1px solid #fed7aa",
                      padding:
                        "0.9rem 1rem",
                      borderRadius:
                        "8px",
                      marginBottom:
                        "1rem",
                    }}
                  >
                    <strong
                      style={{
                        color: "#c2410c",
                        fontSize:
                          "0.85rem",
                      }}
                    >
                      Cancellation Details
                    </strong>

                    <p
                      style={{
                        margin:
                          "0.4rem 0 0.2rem",
                        fontSize:
                          "0.83rem",
                      }}
                    >
                      Cancelled By:{" "}
                      {selectedApt.cancelledBy ||
                        "Not specified"}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize:
                          "0.83rem",
                      }}
                    >
                      Reason:{" "}
                      {selectedApt.cancellationReason ||
                        "No cancellation reason provided."}
                    </p>
                  </div>
                )}

              {/* Admin Notice */}
              <div
                style={{
                  marginTop: "1rem",
                  padding:
                    "0.75rem",
                  background:
                    "#f1f5f9",
                  borderRadius:
                    "8px",
                  fontSize:
                    "0.78rem",
                  color:
                    "var(--ad-text-secondary)",
                }}
              >
                ℹ️{" "}
                <em>
                  Admin access is view-only.
                  Appointment booking,
                  status changes,
                  cancellations, and
                  clinical modifications are
                  managed through the Patient,
                  Doctor, and Hospital portals.
                </em>
              </div>

              {/* Footer */}
              <div
                className="ad-modal-footer"
                style={{
                  marginTop:
                    "1.25rem",
                }}
              >
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={() =>
                    setSelectedApt(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}