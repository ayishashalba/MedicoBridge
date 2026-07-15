import React from "react";
import { Link } from "react-router-dom";
import {
  FaUserMd,
  FaCalendarCheck,
  FaLaptopMedical,
  FaPills,
  FaFileMedical,
  FaHeadset,
} from "react-icons/fa";
import heroImg from "../../assets/hero_illustration.png";
import "./HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Content Column */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Your Health, Our Priority
          </div>

          <h1 className="hero-title">
            Quality Healthcare <br />
            <span className="highlight-text">Connected to You</span>
          </h1>

          <p className="hero-subtitle">
            Book appointments, consult doctors online, buy medicines, and manage
            your health — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="hero-ctas">
            <a href="#find-doctors" className="btn-primary hero-btn">
              Find Doctors
            </a>
            <a href="/#hospitals" className="btn-outline hero-btn">
              Find Hospitals
            </a>
          </div>

          {/* Features Grid */}
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaUserMd />
              </div>
              <span className="feature-text">Find Doctors</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaCalendarCheck />
              </div>
              <span className="feature-text">Book Appointments</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaLaptopMedical />
              </div>
              <span className="feature-text">Online Consultation</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaPills />
              </div>
              <span className="feature-text">Buy Medicines</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <FaFileMedical />
              </div>
              <span className="feature-text">Health Records</span>
            </div>
          </div>
        </div>

        {/* Right Graphic Column */}
        <div className="hero-graphic">
          <div className="illustration-wrapper">
            <img
              src={heroImg}
              alt="MedicoBridge Smart Healthcare & Connectivity"
              className="hero-illustration-img"
            />

            {/* Floating Support Card */}
            <div className="floating-card support-card">
              <div className="floating-card-icon">
                <FaHeadset />
              </div>
              <div className="floating-card-content">
                <h4>24/7 Healthcare Support</h4>
                <p>Always here for your wellness</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
