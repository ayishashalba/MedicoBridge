import React, { useEffect, useState } from "react";

import {
  FaCalendarCheck,
  FaStethoscope,
  FaFolderOpen,
  FaPills,
  FaVideo,
  FaHeartbeat,
  FaArrowRight,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../../../services/apiConfig";

import "./PatientDashboardHome.css";

const quickLinks = [
  {
    label: "Find a Doctor",
    desc: "Search specialists near you",
    icon: <FaStethoscope />,
    path: "/patient/find-doctors",
    color: "#0d9488",
  },
  {
    label: "Online Consultation",
    desc: "Video call with your doctor",
    icon: <FaVideo />,
    path: "/patient/consultation",
    color: "#0284c7",
  },
  {
    label: "Order Medicine",
    desc: "Pharmacy & prescriptions",
    icon: <FaPills />,
    path: "/patient/pharmacy",
    color: "#7c3aed",
  },
  {
    label: "Book Appointment",
    desc: "Schedule a visit",
    icon: <FaCalendarCheck />,
    path: "/patient/appointments",
    color: "#f59e0b",
  },
];

function PatientDashboardHome() {
  const [patientName, setPatientName] = useState("Patient");

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    doctorsConsulted: 0,
    medicalRecords: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch profile
        const profileResponse = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            headers,
          }
        );

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          const profile = profileData.data?.profile;
          setPatientName(profile?.name || "Patient");
        }

        // Fetch appointments
        const appointmentsResponse = await fetch(
          `${API_BASE_URL}/patient/appointments`,
          {
            headers,
          }
        );

        const appointmentsData = await appointmentsResponse.json();

        const appointments = appointmentsResponse.ok
          ? appointmentsData.data || []
          : [];

        // Fetch prescriptions
        const prescriptionsResponse = await fetch(
          `${API_BASE_URL}/patient/prescriptions`,
          {
            headers,
          }
        );

        const prescriptionsData = await prescriptionsResponse.json();

        const prescriptions = prescriptionsResponse.ok
          ? prescriptionsData.data || []
          : [];

        // Fetch medical records
        const recordsResponse = await fetch(
          `${API_BASE_URL}/patient/medical-records`,
          {
            headers,
          }
        );

        const recordsData = await recordsResponse.json();

        const medicalRecords = recordsResponse.ok
          ? recordsData.data || []
          : [];

        // Today's date
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Upcoming appointments
        const upcomingAppointments = appointments.filter((appointment) => {
          if (!appointment.date) return false;

          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);

          return (
            appointmentDate >= todayDate &&
            appointment.status !== "Cancelled" &&
            appointment.status !== "Completed"
          );
        });

        // Unique doctors consulted
        const doctorIds = new Set();

        appointments.forEach((appointment) => {
          if (
            appointment.doctorId &&
            appointment.status !== "Cancelled"
          ) {
            const doctorId =
              typeof appointment.doctorId === "object"
                ? appointment.doctorId._id
                : appointment.doctorId;

            if (doctorId) {
              doctorIds.add(String(doctorId));
            }
          }
        });

        setStats({
          upcomingAppointments: upcomingAppointments.length,
          activePrescriptions: prescriptions.length,
          doctorsConsulted: doctorIds.size,
          medicalRecords: medicalRecords.length,
        });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const quickStats = [
    {
      label: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      icon: <FaCalendarCheck />,
      color: "#0d9488",
      bg: "#ccfbf1",
      path: "/patient/appointments",
    },
    {
      label: "Active Prescriptions",
      value: stats.activePrescriptions,
      icon: <FaPills />,
      color: "#0284c7",
      bg: "#e0f2fe",
      path: "/patient/pharmacy",
    },
    {
      label: "Doctors Consulted",
      value: stats.doctorsConsulted,
      icon: <FaStethoscope />,
      color: "#7c3aed",
      bg: "#ede9fe",
      path: "/patient/find-doctors",
    },
    {
      label: "Medical Records",
      value: stats.medicalRecords,
      icon: <FaFolderOpen />,
      color: "#f59e0b",
      bg: "#fef3c7",
      path: "/patient/medical-records",
    },
  ];

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
        ? "Good Afternoon"
        : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-home">
      {/* Welcome Banner */}
      <section className="dashboard-welcome">
        <div className="welcome-text">
          <p className="welcome-greeting">
            <FaHeartbeat className="greeting-pulse" /> {greeting},
          </p>

          <h1 className="welcome-name">
            {patientName || "Patient"} 👋
          </h1>

          <p className="welcome-subtitle">
            Here's a summary of your health activity today.
          </p>
        </div>

        <div className="welcome-badge">
          <span className="badge-icon">📅</span>

          <div>
            <p className="badge-label">Today's Date</p>
            <p className="badge-value">{today}</p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="dashboard-stats">
        {quickStats.map((stat) => (
          <NavLink
            key={stat.label}
            to={stat.path}
            className="stat-card"
            style={{
              "--stat-color": stat.color,
              "--stat-bg": stat.bg,
            }}
          >
            <div className="stat-icon-wrapper">
              <span className="stat-icon">{stat.icon}</span>
            </div>

            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>

            <FaArrowRight className="stat-arrow" />
          </NavLink>
        ))}
      </section>

      {/* Quick Links */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>

        <div className="quick-links-grid">
          {quickLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className="quick-link-card"
              style={{ "--link-color": link.color }}
            >
              <div className="quick-link-icon">
                {link.icon}
              </div>

              <div className="quick-link-info">
                <p className="quick-link-label">
                  {link.label}
                </p>

                <p className="quick-link-desc">
                  {link.desc}
                </p>
              </div>

              <FaArrowRight className="quick-link-arrow" />
            </NavLink>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PatientDashboardHome;