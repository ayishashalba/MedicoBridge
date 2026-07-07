import React, { useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaUserMd,
  FaPills,
  FaBullhorn,
} from "react-icons/fa";
import "./PatientNotifications.css";

const initialNotifications = [
  {
    id: 1,
    icon: <FaCalendarCheck />,
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Sarah Johnson has been confirmed.",
    time: "Today • 10:30 AM",
    read: false,
  },
  {
    id: 2,
    icon: <FaUserMd />,
    title: "Doctor Message",
    message: "Your doctor has sent you a follow-up message.",
    time: "Yesterday • 6:15 PM",
    read: false,
  },
  {
    id: 3,
    icon: <FaPills />,
    title: "Prescription Ready",
    message: "Your prescription is now available to view.",
    time: "Yesterday • 2:00 PM",
    read: true,
  },
  {
    id: 4,
    icon: <FaBullhorn />,
    title: "Health Update",
    message: "Stay hydrated during this week's hot weather.",
    time: "2 days ago",
    read: true,
  },
];

function PatientNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));
    setNotifications(updated);
  };

  return (
    <div className="patient-notifications">
      <div className="notifications-header">
        <div>
          <h2>
            <FaBell className="header-icon" /> Notifications
          </h2>
          <p>Stay updated with your healthcare activities.</p>
        </div>

        <button
          className="mark-read-btn"
          onClick={markAllAsRead}
        >
          Mark All as Read
        </button>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${notification.read ? "read" : "unread"
              }`}
          >
            <div className="notification-icon">
              {notification.icon}
            </div>

            <div className="notification-content">
              <div className="notification-top">
                <h3>{notification.title}</h3>

                <span
                  className={`status-badge ${notification.read ? "read-badge" : "unread-badge"
                    }`}
                >
                  {notification.read ? "Read" : "Unread"}
                </span>
              </div>

              <p>{notification.message}</p>

              <span className="notification-time">
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientNotifications;