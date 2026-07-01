import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import "./TopHospitals.css";

function TopHospitals() {
  const hospitals = [
    {
      id: 1,
      name: "Apollo Hospital",
      specialty: "Multi-Specialty & Cardiac",
      location: "Chennai, India",
      rating: "4.8",
      description:
        "A pioneer of modern healthcare with advanced cardiac and cancer care units.",
      image:
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 2,
      name: "Aster Medcity",
      specialty: "Multi-Specialty & Research",
      location: "Kochi, India",
      rating: "4.9",
      description:
        "A premium quaternary care facility set in a peaceful waterfront campus.",
      image:
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 3,
      name: "KIMS Hospital",
      specialty: "Multi-Specialty & Trauma",
      location: "Trivandrum, India",
      rating: "4.7",
      description:
        "A trusted name for affordable, high-quality healthcare and trauma services.",
      image:
        "https://images.unsplash.com/photo-1586773860418-d3b3adb998c0?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 4,
      name: "Amrita Hospital",
      specialty: "Multi-Specialty & Oncology",
      location: "Kochi, India",
      rating: "4.8",
      description:
        "A massive medical research center equipped with state-of-the-art diagnostic labs.",
      image:
        "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 5,
      name: "Fortis Hospital",
      specialty: "Multi-Specialty & Ortho",
      location: "Delhi, India",
      rating: "4.6",
      description:
        "An internationally acclaimed clinic specializing in bone and joint treatments.",
      image:
        "https://images.unsplash.com/photo-1584515901107-568315ea0776?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 6,
      name: "Baby Memorial Hospital",
      specialty: "Multi-Specialty & Pediatric",
      location: "Kozhikode, India",
      rating: "4.7",
      description:
        "A premier referral institution focusing on advanced pediatric and maternal care.",
      image:
        "https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <section className="top-hospitals-section">
      <div className="top-hospitals-container">
        {/* Section Header */}
        <div className="top-hospitals-header">
          <h2 className="top-hospitals-title">Top Hospitals</h2>
          <p className="top-hospitals-subtitle">
            Connecting you with the most trusted hospitals and healthcare
            institutions.
          </p>
        </div>

        {/* Hospital Cards Grid */}
        <div className="top-hospitals-grid">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="hospital-card">
              {/* Card Image Header */}
              <div className="hospital-image-wrapper">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="hospital-img"
                />
                <div className="hospital-rating-badge">
                  <FaStar className="star-icon" />
                  <span>{hospital.rating}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="hospital-info">
                <h3 className="hospital-name">{hospital.name}</h3>
                <span className="hospital-specialty">{hospital.specialty}</span>

                <p className="hospital-description">{hospital.description}</p>

                <div className="hospital-meta">
                  <FaMapMarkerAlt className="meta-icon" />
                  <span>{hospital.location}</span>
                </div>

                <Link
                  to={`/hospital/details/${hospital.id}`}
                  className="btn-outline hospital-card-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopHospitals;
