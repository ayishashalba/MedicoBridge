import React, { useState } from "react";
import {
  FaBell,
  FaHospital,
  FaBed,
  FaFlask,
  FaExclamationTriangle,
  FaUserMd,
  FaTrashAlt,
} from "react-icons/fa";
import "./HospitalNotifications.css";

const initialNotifications = [
  {
    id: 1,
    category: "System Alerts",
    title: "Critical Bed Shortage",
    message: "ICU occupancy has reached 90% (18/20 beds occupied). Monitor incoming emergencies.",
    time: "10 mins ago",
    read: false,
    icon: <FaExclamationTriangle />,
    color: "red",
  },
  {
    id: 2,
    category: "Ward Operations",
    title: "New Admitted Patient",
    message: "Ramesh Kumar (PAT-4091) was admitted to ICU - Bed A4 by Dr. Ayisha Shalba.",
    time: "1 hour ago",
    read: false,
    icon: <FaBed />,
    color: "blue",
  },
  {
    id: 3,
    category: "Lab & Pharmacy",
    title: "Lab Results Ready",
    message: "Pathology completed Cardiac Troponin Panel for patient Devanand S. (LAB-9011).",
    time: "2 hours ago",
    read: true,
    icon: <FaFlask />,
    color: "teal",
  },
  {
    id: 4,
    category: "System Alerts",
    title: "Doctor Shift Login",
    message: "Dr. Rajesh K. Nair checked-in and logged onto General Neurology Clinic.",
    time: "4 hours ago",
    read: true,
    icon: <FaUserMd />,
    color: "purple",
  },
];

function HospitalNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("All");

  const filtered = notifications.filter(
    (n) => filter === "All" || n.category === filter
  );

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="hosp-notifs-page">
      <div className="hosp-notifs-controls">
        <div className="hosp-notifs-categories">
          {["All", "System Alerts", "Ward Operations", "Lab & Pharmacy"].map(
            (cat) => (
              <button
                key={cat}
                className={`hosp-notif-tab ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <button className="hosp-btn-mark-read" onClick={markAllRead}>
          Mark All Read
        </button>
      </div>

      <div className="hosp-notifs-feed">
        {filtered.length === 0 ? (
          <div className="hosp-notifs-empty">
            <FaBell className="empty-icon" />
            <h3>No notifications here</h3>
            <p>You're all caught up with the hospital activity feed!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`hosp-notif-item ${n.read ? "read" : "unread"}`}
            >
              <div className={`hosp-notif-icon-box icon--${n.color}`}>
                {n.icon}
              </div>
              <div className="hosp-notif-info">
                <div className="hosp-notif-header">
                  <h4>{n.title}</h4>
                  <span className="hosp-notif-time">{n.time}</span>
                </div>
                <p>{n.message}</p>
              </div>
              <button
                className="hosp-notif-btn-delete"
                onClick={() => deleteNotification(n.id)}
                title="Dismiss Alert"
              >
                <FaTrashAlt />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HospitalNotifications;
