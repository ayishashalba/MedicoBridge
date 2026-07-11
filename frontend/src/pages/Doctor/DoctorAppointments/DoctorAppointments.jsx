import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaUser,
  FaClock,
  FaVideo,
  FaHospital,
  FaEye,
  FaPlay,
  FaSearch,
  FaFilter,
  FaTimesCircle,
  FaCheckCircle,
  FaCalendarAlt,
  FaChevronRight,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";
import "./DoctorAppointments.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const appointmentsData = [
  {
    id: 1,
    patient: "Rahul Nair",
    initials: "RN",
    avatarColor: "#0d9488",
    patientId: "PT-1024",
    date: "July 12, 2026",
    time: "10:00 AM",
    type: "Online",
    status: "Today",
    complaint: "Type 2 Diabetes Mellitus Follow-up",
  },
  {
    id: 2,
    patient: "Anjali Thomas",
    initials: "AT",
    avatarColor: "#7c3aed",
    patientId: "PT-1031",
    date: "July 15, 2026",
    time: "02:30 PM",
    type: "Hospital",
    status: "Upcoming",
    complaint: "Chronic Migraine Review",
  },
  {
    id: 3,
    patient: "Arun Kumar",
    initials: "AK",
    avatarColor: "#0284c7",
    patientId: "PT-1018",
    date: "July 10, 2026",
    time: "11:15 AM",
    type: "Online",
    status: "Completed",
    complaint: "Hypertension Check",
  },
  {
    id: 4,
    patient: "Meera Pillai",
    initials: "MP",
    avatarColor: "#d97706",
    patientId: "PT-1045",
    date: "July 18, 2026",
    time: "09:00 AM",
    type: "Online",
    status: "Upcoming",
    complaint: "Thyroid Follow-up",
  },
  {
    id: 5,
    patient: "Suresh Babu",
    initials: "SB",
    avatarColor: "#dc2626",
    patientId: "PT-1052",
    date: "July 8, 2026",
    time: "04:00 PM",
    type: "Hospital",
    status: "Cancelled",
    complaint: "Post-Surgery Cardiac Review",
  },
  {
    id: 6,
    patient: "Lakshmi Nair",
    initials: "LN",
    avatarColor: "#059669",
    patientId: "PT-1060",
    date: "July 12, 2026",
    time: "02:00 PM",
    type: "Online",
    status: "Today",
    complaint: "Migraine Consultation",
  },
];

const STATUS_GROUPS = ["Today", "Upcoming", "Completed", "Cancelled"];

function DoctorAppointments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredAppointments = useMemo(() => {
    return appointmentsData.filter((item) => {
      const matchesSearch =
        item.patient.toLowerCase().includes(search.toLowerCase()) ||
        item.complaint.toLowerCase().includes(search.toLowerCase()) ||
        item.patientId.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || item.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  // Grouping function
  const groupedAppointments = useMemo(() => {
    const groups = {
      Today: [],
      Upcoming: [],
      Completed: [],
      Cancelled: [],
    };
    filteredAppointments.forEach((item) => {
      if (groups[item.status]) {
        groups[item.status].push(item);
      }
    });
    return groups;
  }, [filteredAppointments]);

  // Counts for filters
  const counts = useMemo(() => {
    const totals = { All: appointmentsData.length, Today: 0, Upcoming: 0, Completed: 0, Cancelled: 0 };
    appointmentsData.forEach(item => {
      if (totals[item.status] !== undefined) {
        totals[item.status]++;
      }
    });
    return totals;
  }, []);

  return (
    <div className="doctor-appointments">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="appointments-header">
        <div className="header-title-section">
          <h2>
            <FaCalendarCheck /> Appointments
          </h2>
          <p>View, search, and manage your clinical consultation schedule.</p>
        </div>
      </div>

      {/* ── Filter Toolbar ────────────────────────────── */}
      <div className="appointment-toolbar">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient, complaints, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-tabs-group">
          <FaFilter className="toolbar-filter-icon" />
          {["All", "Today", "Upcoming", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={`filter-tab-btn ${activeFilter === status ? "filter-tab-btn--active" : ""}`}
              onClick={() => setActiveFilter(status)}
            >
              {status}
              <span className="filter-count-badge">{counts[status] || filteredAppointments.filter(x => x.status === status).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grouped Appointments List ────────────────── */}
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments-card">
          <FaCalendarCheck className="empty-icon" />
          <h3>No Appointments Found</h3>
          <p>No matching appointment records match your criteria.</p>
        </div>
      ) : (
        <div className="grouped-sections-list">
          {STATUS_GROUPS.map((statusGroup) => {
            const list = groupedAppointments[statusGroup];
            if (!list || list.length === 0) return null;

            return (
              <div className="appointment-status-section" key={statusGroup}>
                <h3 className="section-title-label">
                  <span className={`title-dot title-dot--${statusGroup.toLowerCase()}`} />
                  {statusGroup} Appointments ({list.length})
                </h3>

                <div className="appointments-grid-container">
                  {list.map((item) => (
                    <div className="appointment-card-v2" key={item.id}>
                      <div className="card-top-header">
                        <div className="patient-avatar-cell">
                          <div
                            className="avatar-circle"
                            style={{ backgroundColor: item.avatarColor }}
                          >
                            {item.initials}
                          </div>
                          <div>
                            <h4>{item.patient}</h4>
                            <span className="patient-id-badge">{item.patientId}</span>
                          </div>
                        </div>
                        <span className={`status-pill status-pill--${item.status.toLowerCase()}`}>
                          {item.status === "Completed" && <FaCheckCircle />}
                          {item.status === "Cancelled" && <FaTimesCircle />}
                          {item.status}
                        </span>
                      </div>

                      <div className="card-details-body">
                        <div className="detail-item">
                          <FaCalendarAlt />
                          <span>{item.date} at {item.time}</span>
                        </div>
                        <div className="detail-item">
                          {item.type === "Online" ? (
                            <>
                              <FaVideo className="type-icon--online" />
                              <span>Online Consultation</span>
                            </>
                          ) : (
                            <>
                              <FaHospital className="type-icon--hospital" />
                              <span>Hospital Visit</span>
                            </>
                          )}
                        </div>
                        <div className="complaint-item">
                          <span className="complaint-label">Complaint:</span>
                          <span className="complaint-text">{item.complaint}</span>
                        </div>
                      </div>

                      <div className="card-actions-row">
                        {/* Status: Today */}
                        {item.status === "Today" && (
                          <>
                            <button
                              className="action-btn action-btn--view"
                              onClick={() => navigate(`/doctor/appointments/${item.id}`)}
                            >
                              <FaEye /> View
                            </button>
                            <button
                              className="action-btn action-btn--start"
                              onClick={() => navigate(`/doctor/consultation-room/${item.id}`)}
                            >
                              <FaPlay /> Start Consultation
                            </button>
                          </>
                        )}

                        {/* Status: Upcoming */}
                        {item.status === "Upcoming" && (
                          <button
                            className="action-btn action-btn--view action-btn--full"
                            onClick={() => navigate(`/doctor/appointments/${item.id}`)}
                          >
                            <FaEye /> View Details
                          </button>
                        )}

                        {/* Status: Completed */}
                        {item.status === "Completed" && (
                          <>
                            <button
                              className="action-btn action-btn--view"
                              onClick={() => navigate(`/doctor/appointments/${item.id}`)}
                            >
                              <FaEye /> View
                            </button>
                            <button
                              className="action-btn action-btn--prescription"
                              onClick={() => navigate(`/doctor/prescriptions/${item.id}`)}
                            >
                              <FaPrescriptionBottleAlt /> View Prescription
                            </button>
                          </>
                        )}

                        {/* Status: Cancelled */}
                        {item.status === "Cancelled" && (
                          <button
                            className="action-btn action-btn--view action-btn--full"
                            onClick={() => navigate(`/doctor/appointments/${item.id}`)}
                          >
                            <FaEye /> View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;