import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import "./TopDoctors.css";

function TopDoctors() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;

  const doctors = [
    {
      id: 1,
      name: "Dr. Ananya Menon",
      specialty: "Cardiologist",
      experience: "12+ Years",
      rating: "4.9",
      location: "Mumbai, India",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 2,
      name: "Dr. Rahul Nair",
      specialty: "Neurologist",
      experience: "15+ Years",
      rating: "4.8",
      location: "Bangalore, India",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 3,
      name: "Dr. Meera Iyer",
      specialty: "General Physician",
      experience: "10+ Years",
      rating: "4.7",
      location: "Chennai, India",
      image:
        "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 4,
      name: "Dr. John Mathew",
      specialty: "Orthopedic Surgeon",
      experience: "8+ Years",
      rating: "4.9",
      location: "Kochi, India",
      image:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 5,
      name: "Dr. Asha Varma",
      specialty: "Dermatologist",
      experience: "7+ Years",
      rating: "4.6",
      location: "Delhi, India",
      image:
        "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 6,
      name: "Dr. Vivek Das",
      specialty: "Pediatrician",
      experience: "9+ Years",
      rating: "4.8",
      location: "Kolkata, India",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <section className="top-doctors-section">
      <div className="top-doctors-container">
        {/* Section Header */}
        <div className="top-doctors-header">
          <h2 className="top-doctors-title">Top Doctors</h2>
          <p className="top-doctors-subtitle">
            Meet our most experienced and highly rated medical professionals.
          </p>
        </div>

        {/* Doctor Cards Grid */}
        <div className="top-doctors-grid">
          {doctors
            .slice(startIndex, startIndex + visibleCount)
            .map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                {/* Doctor Avatar Wrapper */}
                <div className="doctor-image-wrapper">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="doctor-img"
                  />
                  <div className="doctor-rating-badge">
                    <FaStar className="star-icon" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>

                {/* Doctor Details */}
                <div className="doctor-info">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <span className="doctor-specialty">{doctor.specialty}</span>

                  <div className="doctor-meta">
                    <div className="meta-item">
                      <FaBriefcase className="meta-icon" />
                      <span>{doctor.experience} Exp</span>
                    </div>
                    <div className="meta-item">
                      <FaMapMarkerAlt className="meta-icon" />
                      <span>{doctor.location}</span>
                    </div>
                  </div>

                  <Link
                    to={`/doctor/profile/${doctor.id}`}
                    className="btn-outline doctor-card-btn"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
        </div>
        <div className="doctor-nav">
          <button
            onClick={() =>
              setStartIndex((prev) => Math.max(prev - 1, 0))
            }
            className="nav-btn"
          >
            ◀
          </button>

          <button
            onClick={() =>
              setStartIndex((prev) =>
                prev + visibleCount < doctors.length ? prev + 1 : prev
              )
            }
            className="nav-btn"
          >
            ▶
          </button>
        </div>
      </div>
    </section>
  );
}

export default TopDoctors;
