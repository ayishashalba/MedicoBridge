import React from "react";
import {
  FaUserMd,
  FaCalendarCheck,
  FaLaptopMedical,
  FaPills,
  FaFileMedical,
  FaHospital,
} from "react-icons/fa";
import "./WhyChoose.css";

function WhyChoose() {
  const features = [
    {
      id: 1,
      title: "Smart Doctor Discovery",
      description:
        "Find verified doctors based on specialty and availability.",
      icon: <FaUserMd />,
    },
    {
      id: 2,
      title: "Instant Appointments",
      description: "Book appointments quickly without long waiting times.",
      icon: <FaCalendarCheck />,
    },
    {
      id: 3,
      title: "Online Consultation",
      description:
        "Consult doctors from anywhere via secure virtual sessions.",
      icon: <FaLaptopMedical />,
    },
    {
      id: 4,
      title: "Integrated Pharmacy System",
      description:
        "Access verified pharmacies and real-time medicine availability.",
      icon: <FaPills />,
    },
    {
      id: 5,
      title: "Unified Health Records",
      description: "Manage all your medical records in one secure place.",
      icon: <FaFileMedical />,
    },
    {
      id: 6,
      title: "Hospital Network Access",
      description:
        "Connect with top hospitals and specialized healthcare centers.",
      icon: <FaHospital />,
    },
  ];

  return (
    <section className="why-choose-section">
      <div className="why-choose-container">
        {/* Section Header */}
        <div className="why-choose-header">
          <h2 className="why-choose-title">Why Choose MedicoBridge?</h2>
          <p className="why-choose-subtitle">
            An integrated healthcare ecosystem connecting patients, doctors,
            hospitals, and pharmacies in one smart platform.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="why-choose-grid">
          {features.map((feature) => (
            <div key={feature.id} className="why-choose-card">
              <div className="why-choose-card-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="why-choose-card-title">{feature.title}</h3>
              <p className="why-choose-card-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;
