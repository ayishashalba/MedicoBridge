import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaHeartbeat,
} from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Main Columns Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand details */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <div className="logo-icon-wrapper">
                <FaHeartbeat className="logo-icon" />
              </div>
              <span className="logo-title">MedicoBridge</span>
            </Link>
            <p className="footer-description">
              Smart healthcare platform connecting patients, doctors, hospitals,
              and pharmacies.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/find-doctors">Find Doctors</Link>
              </li>
              <li>
                <Link to="/hospitals">Hospitals</Link>
              </li>
              <li>
                <Link to="/pharmacy">Pharmacies</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="footer-col">
            <h4 className="footer-col-title">Services</h4>
            <ul className="footer-links">
              <li>
                <Link to="/services/consultation">Online Consultation</Link>
              </li>
              <li>
                <Link to="/services/appointments">Appointment Booking</Link>
              </li>
              <li>
                <Link to="/services/ordering">Medicine Ordering</Link>
              </li>
              <li>
                <Link to="/services/records">Health Records</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links">
              <li>
                <Link to="/support/help">Help Center</Link>
              </li>
              <li>
                <Link to="/support/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/support/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/support/faqs">FAQs</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; 2026 MedicoBridge. All rights reserved.
          </p>
          <div className="footer-socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter/X"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
