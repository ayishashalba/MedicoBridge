import React from "react";
import {
  FaCalendarCheck,
  FaUser,
  FaClock,
  FaVideo,
  FaHospital,
  FaEye,
  FaPlay,
  FaSearch,
} from "react-icons/fa";
import "./DoctorAppointments.css";

const appointments = [
  {
    id: 1,
    patient: "Rahul Nair",
    date: "20 July 2026",
    time: "10:00 AM",
    type: "Online",
    status: "Today",
  },
  {
    id: 2,
    patient: "Anjali Thomas",
    date: "21 July 2026",
    time: "02:30 PM",
    type: "Hospital",
    status: "Upcoming",
  },
  {
    id: 3,
    patient: "Arun Kumar",
    date: "18 July 2026",
    time: "11:15 AM",
    type: "Online",
    status: "Completed",
  },
];

function DoctorAppointments() {
  return (
    <div className="doctor-appointments">

      <div className="appointments-header">
        <h2>
          <FaCalendarCheck /> Appointments
        </h2>
        <p>Manage all your patient appointments.</p>
      </div>

      <div className="appointment-toolbar">

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search patient..."
          />
        </div>

        <select className="filter-select">
          <option>All</option>
          <option>Today</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

      </div>

      {appointments.map((item) => (
        <div className="appointment-card" key={item.id}>

          <div className="appointment-left">

            <div className="patient-avatar">
              <FaUser />
            </div>

            <div>

              <h3>{item.patient}</h3>

              <p>
                <FaClock /> {item.date} • {item.time}
              </p>

              <p>
                {item.type === "Online" ? (
                  <>
                    <FaVideo /> Online Consultation
                  </>
                ) : (
                  <>
                    <FaHospital /> Hospital Visit
                  </>
                )}
              </p>

            </div>

          </div>

          <div className="appointment-right">

            <span className={`status ${item.status.toLowerCase()}`}>
              {item.status}
            </span>

            <div className="btn-group">

              <button className="view-btn">
                <FaEye />
                View
              </button>

              {item.type === "Online" && (
                <button className="start-btn">
                  <FaPlay />
                  Start
                </button>
              )}

            </div>

          </div>

        </div>
      ))}

    </div>
  );
}

export default DoctorAppointments;