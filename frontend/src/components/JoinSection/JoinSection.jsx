import React from "react";
import { Link } from "react-router-dom";
import { FaUser, FaUserMd, FaHospital, FaPills } from "react-icons/fa";
import "./JoinSection.css";

function JoinSection() {
  const roles = [
    {
      id: "patient",
      title: "Patient",
      description:
        "Book appointments, consult doctors online, manage health records",
      buttonText: "Join as Patient",
      link: "/register/patient",
      icon: <FaUser />,
      colorClass: "patient-theme",
    },
    {
      id: "doctor",
      title: "Doctor",
      description:
        "Manage patients, offer online consultation, grow your practice",
      buttonText: "Join as Doctor",
      link: "/apply/doctor",
      icon: <FaUserMd />,
      colorClass: "doctor-theme",
    },
    {
      id: "hospital",
      title: "Hospital",
      description:
        "Manage departments, doctors, and patient records efficiently",
      buttonText: "Join as Hospital",
      link: "/register/hospital",
      icon: <FaHospital />,
      colorClass: "hospital-theme",
    },
    {
      id: "pharmacy",
      title: "Pharmacy",
      description:
        "Manage medicine inventory, upload stock, and fulfill prescriptions for patients and hospitals.",
      buttonText: "Join as Pharmacy",
      link: "/register/pharmacy",
      icon: <FaPills />,
      colorClass: "pharmacy-theme",
    },
  ];

  return (
    <section className="join-section">
      <div className="join-container">
        {/* Section Header */}
        <div className="join-header">
          <h2 className="join-title">Join MedicoBridge Today</h2>
          <p className="join-subtitle">
            Connect with the healthcare ecosystem and get access to smarter,
            faster, and better medical services.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="join-grid">
          {roles.map((role) => (
            <div key={role.id} className={`join-card ${role.colorClass}`}>
              <div className="join-card-icon-wrapper">{role.icon}</div>
              <h3 className="join-card-title">{role.title}</h3>
              <p className="join-card-description">{role.description}</p>
              <Link to={role.link} className="btn-primary join-card-btn">
                {role.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
