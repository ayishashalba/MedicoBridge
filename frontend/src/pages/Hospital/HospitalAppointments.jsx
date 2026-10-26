import React, { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import "./HospitalAppointments.css";

function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specialtyFilter, setSpecialtyFilter] =
    useState("All Specialties");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // --------------------------------------------------
  // FETCH REAL HOSPITAL APPOINTMENTS
  // --------------------------------------------------
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/hospital/appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch appointments."
        );
      }

      const data = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      const normalized = data.map((apt) => {
        const patient = apt.patientId || {};
        const doctor = apt.doctorId || {};

        return {
          id: apt._id || apt.id,
          appointmentId:
            apt.appointmentId ||
            apt._id ||
            apt.id ||
            "N/A",

          patientName:
            patient.name ||
            apt.patientName ||
            "Unknown Patient",

          doctorName:
            doctor.name ||
            apt.doctorName ||
            "Unassigned",

          specialty:
            doctor.specialization ||
            doctor.department ||
            apt.department ||
            "Not Provided",

          date: apt.date
            ? new Date(apt.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : "Not Provided",

          time:
            apt.timeSlot ||
            apt.time ||
            "Not Provided",

          type:
            apt.type ||
            "In-Person",

          status:
            apt.status ||
            "Pending",
        };
      });

      setAppointments(normalized);
    } catch (error) {
      console.error(
        "Failed to load hospital appointments:",
        error
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  // --------------------------------------------------
  // SPECIALTIES FROM REAL DATA
  // --------------------------------------------------
  const specialties = useMemo(() => {
    const uniqueSpecialties = [
      ...new Set(
        appointments
          .map((apt) => apt.specialty)
          .filter(
            (specialty) =>
              specialty &&
              specialty !== "Not Provided"
          )
      ),
    ];

    return ["All Specialties", ...uniqueSpecialties];
  }, [appointments]);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------
  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        apt.patientName
          .toLowerCase()
          .includes(searchValue) ||
        apt.doctorName
          .toLowerCase()
          .includes(searchValue) ||
        apt.appointmentId
          .toLowerCase()
          .includes(searchValue);

      const matchStatus =
        statusFilter === "All" ||
        apt.status === statusFilter;

      const matchSpecialty =
        specialtyFilter === "All Specialties" ||
        apt.specialty === specialtyFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchSpecialty
      );
    });
  }, [
    appointments,
    search,
    statusFilter,
    specialtyFilter,
  ]);

  // --------------------------------------------------
  // UPDATE APPOINTMENT STATUS
  // --------------------------------------------------
  const handleStatusChange = async (
    id,
    nextStatus
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update appointment status."
        );
      }

      setAppointments((current) =>
        current.map((apt) =>
          apt.id === id
            ? {
              ...apt,
              status: nextStatus,
            }
            : apt
        )
      );
    } catch (error) {
      console.error(
        "Failed to update appointment:",
        error
      );
      alert(
        error.message ||
        "Failed to update appointment status."
      );
    }
  };

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------
  const total = appointments.length;

  const pending = appointments.filter(
    (apt) => apt.status === "Pending"
  ).length;

  const confirmed = appointments.filter(
    (apt) => apt.status === "Confirmed"
  ).length;

  const completed = appointments.filter(
    (apt) => apt.status === "Completed"
  ).length;

  return (
    <div className="hosp-apts-page">
      {/* Summary Cards */}
      <section className="hosp-apts-summary">
        <div className="hosp-apts-summary-card">
          <span className="summary-val">
            {total}
          </span>

          <span className="summary-lbl">
            Total Bookings
          </span>
        </div>

        <div className="hosp-apts-summary-card summary-card--confirmed">
          <span className="summary-val">
            {confirmed}
          </span>

          <span className="summary-lbl">
            Confirmed
          </span>
        </div>

        <div className="hosp-apts-summary-card summary-card--pending">
          <span className="summary-val">
            {pending}
          </span>

          <span className="summary-lbl">
            Pending Review
          </span>
        </div>

        <div className="hosp-apts-summary-card summary-card--completed">
          <span className="summary-val">
            {completed}
          </span>

          <span className="summary-lbl">
            Completed
          </span>
        </div>
      </section>

      {/* Controls */}
      <div className="hosp-apts-controls">
        <div className="hosp-apts-search">
          <FaSearch className="hosp-search-icon" />

          <input
            type="text"
            placeholder="Search by patient, doctor or ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="hosp-apts-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div className="hosp-filter-group">
            <select
              value={specialtyFilter}
              onChange={(e) =>
                setSpecialtyFilter(e.target.value)
              }
            >
              {specialties.map((spec) => (
                <option
                  key={spec}
                  value={spec}
                >
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
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
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="hosp-table-empty"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="hosp-table-empty"
                  >
                    <FaCalendarCheck className="empty-icon" />

                    <h3>
                      No appointments found
                    </h3>

                    <p>
                      Try adjusting your search
                      criteria or review filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <span className="hosp-apt-id-badge">
                        {apt.appointmentId}
                      </span>
                    </td>

                    <td>
                      <span className="hosp-apt-pat-name">
                        {apt.patientName}
                      </span>
                    </td>

                    <td>
                      <div className="hosp-doc-info-col">
                        <span className="hosp-doc-info-name">
                          {apt.doctorName}
                        </span>

                        <span className="hosp-doc-info-spec">
                          {apt.specialty}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="hosp-time-col">
                        <span className="hosp-time-date">
                          {apt.date}
                        </span>

                        <span className="hosp-time-hour">
                          {apt.time}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`hosp-mode-badge mode--${apt.type
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {apt.type}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`hosp-apt-status status--${apt.status.toLowerCase()}`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    <td>
                      {apt.status === "Pending" ? (
                        <div className="hosp-action-buttons">
                          <button
                            className="hosp-btn-action hosp-btn-action--confirm"
                            onClick={() =>
                              handleStatusChange(
                                apt.id,
                                "Confirmed"
                              )
                            }
                            title="Confirm Booking"
                          >
                            <FaCheck /> Confirm
                          </button>

                          <button
                            className="hosp-btn-action hosp-btn-action--cancel"
                            onClick={() =>
                              handleStatusChange(
                                apt.id,
                                "Cancelled"
                              )
                            }
                            title="Cancel Booking"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </div>
                      ) : apt.status === "Confirmed" ? (
                        <button
                          className="hosp-btn-action hosp-btn-action--complete"
                          onClick={() =>
                            handleStatusChange(
                              apt.id,
                              "Completed"
                            )
                          }
                          title="Mark Completed"
                        >
                          <FaCheck /> Complete
                        </button>
                      ) : (
                        <span className="hosp-action-done">
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HospitalAppointments;