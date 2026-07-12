import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaCalendarTimes,
  FaCheck,
  FaTimes,
  FaHospital,
} from "react-icons/fa";
import "./HospitalAppointments.css";

const initialAppointments = [
  {
    id: "APT-2041",
    patientName: "Rahul Nair",
    doctorName: "Dr. Ayisha Shalba",
    specialty: "Cardiology",
    date: "July 12, 2026",
    time: "09:00 AM",
    type: "In-Person",
    status: "Confirmed",
  },
  {
    id: "APT-2042",
    patientName: "Anjali Thomas",
    doctorName: "Dr. Ayisha Shalba",
    specialty: "Cardiology",
    date: "July 12, 2026",
    time: "09:45 AM",
    type: "Video Call",
    status: "Confirmed",
  },
  {
    id: "APT-2043",
    patientName: "Arun Kumar",
    doctorName: "Dr. Rajesh Nair",
    specialty: "Neurology",
    date: "July 12, 2026",
    time: "10:30 AM",
    type: "In-Person",
    status: "Pending",
  },
  {
    id: "APT-2044",
    patientName: "Meera Pillai",
    doctorName: "Dr. Susan George",
    specialty: "Orthopedics",
    date: "July 13, 2026",
    time: "11:15 AM",
    type: "In-Person",
    status: "Pending",
  },
  {
    id: "APT-2045",
    patientName: "Suresh Babu",
    doctorName: "Dr. Priya Thomas",
    specialty: "Pediatrics",
    date: "July 13, 2026",
    time: "12:00 PM",
    type: "In-Person",
    status: "Completed",
  },
  {
    id: "APT-2046",
    patientName: "Lakshmi Nair",
    doctorName: "Dr. Vikram Shekar",
    specialty: "Dermatology",
    date: "July 14, 2026",
    time: "02:00 PM",
    type: "Video Call",
    status: "Cancelled",
  },
];

const specialties = ["All Specialties", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology"];

function HospitalAppointments() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specialtyFilter, setSpecialtyFilter] = useState("All Specialties");

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const matchSearch =
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        apt.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || apt.status === statusFilter;
      const matchSpecialty =
        specialtyFilter === "All Specialties" || apt.specialty === specialtyFilter;
      return matchSearch && matchStatus && matchSpecialty;
    });
  }, [appointments, search, statusFilter, specialtyFilter]);

  const handleStatusChange = (id, nextStatus) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: nextStatus } : apt))
    );
  };

  // Stats calculation
  const total = appointments.length;
  const pending = appointments.filter(a => a.status === "Pending").length;
  const confirmed = appointments.filter(a => a.status === "Confirmed").length;
  const completed = appointments.filter(a => a.status === "Completed").length;

  return (
    <div className="hosp-apts-page">
      {/* Dynamic Summary Cards */}
      <section className="hosp-apts-summary">
        <div className="hosp-apts-summary-card">
          <span className="summary-val">{total}</span>
          <span className="summary-lbl">Total Bookings</span>
        </div>
        <div className="hosp-apts-summary-card summary-card--confirmed">
          <span className="summary-val">{confirmed}</span>
          <span className="summary-lbl">Confirmed</span>
        </div>
        <div className="hosp-apts-summary-card summary-card--pending">
          <span className="summary-val">{pending}</span>
          <span className="summary-lbl">Pending Review</span>
        </div>
        <div className="hosp-apts-summary-card summary-card--completed">
          <span className="summary-val">{completed}</span>
          <span className="summary-lbl">Completed</span>
        </div>
      </section>

      {/* Controls Bar */}
      <div className="hosp-apts-controls">
        <div className="hosp-apts-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search by patient, doctor or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-apts-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="hosp-filter-group">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List Table */}
      <div className="hosp-card hosp-apts-card">
        <div className="hosp-table-wrapper">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Assigned Specialist</th>
                <th>Schedule Slot</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="hosp-table-empty">
                    <FaCalendarCheck className="empty-icon" />
                    <h3>No appointments found</h3>
                    <p>Try adjusting your search criteria or review filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span className="hosp-apt-id-badge">{apt.id}</span>
                    </td>
                    <td>
                      <span className="hosp-apt-pat-name">{apt.patientName}</span>
                    </td>
                    <td>
                      <div className="hosp-doc-info-col">
                        <span className="hosp-doc-info-name">{apt.doctorName}</span>
                        <span className="hosp-doc-info-spec">{apt.specialty}</span>
                      </div>
                    </td>
                    <td>
                      <div className="hosp-time-col">
                        <span className="hosp-time-date">{apt.date}</span>
                        <span className="hosp-time-hour">{apt.time}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`hosp-mode-badge mode--${apt.type.toLowerCase().replace(" ", "-")}`}>
                        {apt.type}
                      </span>
                    </td>
                    <td>
                      <span className={`hosp-apt-status status--${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      {apt.status === "Pending" ? (
                        <div className="hosp-action-buttons">
                          <button
                            className="hosp-btn-action hosp-btn-action--confirm"
                            onClick={() => handleStatusChange(apt.id, "Confirmed")}
                            title="Confirm Booking"
                          >
                            <FaCheck /> Confirm
                          </button>
                          <button
                            className="hosp-btn-action hosp-btn-action--cancel"
                            onClick={() => handleStatusChange(apt.id, "Cancelled")}
                            title="Cancel Booking"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      ) : apt.status === "Confirmed" ? (
                        <button
                          className="hosp-btn-action hosp-btn-action--complete"
                          onClick={() => handleStatusChange(apt.id, "Completed")}
                          title="Mark Completed"
                        >
                          <FaCheck /> Complete
                        </button>
                      ) : (
                        <span className="hosp-action-done">N/A</span>
                      )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HospitalAppointments;
