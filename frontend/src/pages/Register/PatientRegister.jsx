import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import "./PatientRegister.css";

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  address: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function PatientRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear the field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) {
      errs.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 3) {
      errs.fullName = "Full name must be at least 3 characters";
    }

    if (!form.email) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.phone) {
      errs.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) {
      errs.phone = "Please enter a valid phone number";
    }

    if (!form.dob) {
      errs.dob = "Date of birth is required";
    } else {
      const today = new Date();
      const birthDate = new Date(form.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (birthDate >= today) errs.dob = "Date of birth must be in the past";
      else if (age > 120) errs.dob = "Please enter a valid date of birth";
    }

    if (!form.gender) {
      errs.gender = "Please select your gender";
    }

    if (!form.address.trim()) {
      errs.address = "Address is required";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters long";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
    }

    if (!form.acceptTerms) {
      errs.acceptTerms = "You must accept the Terms & Conditions to register";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Patient registration submitted:", form);
      navigate("/verify-email");
    }
  };

  return (
    <div className="pat-reg-page-wrapper">
      <div className="pat-reg-card-container">
        {/* Brand Header */}
        <Link to="/" className="pat-reg-brand">
          <div className="pat-reg-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="pat-reg-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="pat-reg-card">
          <div className="pat-reg-card-header">
            <div className="pat-reg-icon-circle">
              <FaUserPlus />
            </div>
            <h2>Create Patient Account</h2>
            <p>Join MedicoBridge and take charge of your healthcare journey</p>
          </div>

          <form onSubmit={handleSubmit} className="pat-reg-form" noValidate>
            {/* ── Row: Full Name | Email ─────────────────── */}
            <div className="pat-reg-grid-row">
              <div className="pat-reg-form-group">
                <label htmlFor="pr-fullName">Full Name</label>
                <input
                  type="text"
                  id="pr-fullName"
                  name="fullName"
                  className={`pat-reg-input ${errors.fullName ? "pat-reg-input-error" : ""}`}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <span className="pat-reg-error-msg">{errors.fullName}</span>
                )}
              </div>

              <div className="pat-reg-form-group">
                <label htmlFor="pr-email">Email Address</label>
                <input
                  type="email"
                  id="pr-email"
                  name="email"
                  className={`pat-reg-input ${errors.email ? "pat-reg-input-error" : ""}`}
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="pat-reg-error-msg">{errors.email}</span>
                )}
              </div>
            </div>

            {/* ── Row: Phone | Date of Birth ─────────────── */}
            <div className="pat-reg-grid-row">
              <div className="pat-reg-form-group">
                <label htmlFor="pr-phone">Phone Number</label>
                <input
                  type="tel"
                  id="pr-phone"
                  name="phone"
                  className={`pat-reg-input ${errors.phone ? "pat-reg-input-error" : ""}`}
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <span className="pat-reg-error-msg">{errors.phone}</span>
                )}
              </div>

              <div className="pat-reg-form-group">
                <label htmlFor="pr-dob">Date of Birth</label>
                <input
                  type="date"
                  id="pr-dob"
                  name="dob"
                  className={`pat-reg-input pat-reg-date-input ${errors.dob ? "pat-reg-input-error" : ""}`}
                  value={form.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.dob && (
                  <span className="pat-reg-error-msg">{errors.dob}</span>
                )}
              </div>
            </div>

            {/* ── Row: Gender | Address ──────────────────── */}
            <div className="pat-reg-grid-row">
              <div className="pat-reg-form-group">
                <label htmlFor="pr-gender">Gender</label>
                <select
                  id="pr-gender"
                  name="gender"
                  className={`pat-reg-input pat-reg-select ${errors.gender ? "pat-reg-input-error" : ""}`}
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not">Prefer not to say</option>
                </select>
                {errors.gender && (
                  <span className="pat-reg-error-msg">{errors.gender}</span>
                )}
              </div>

              <div className="pat-reg-form-group">
                <label htmlFor="pr-address">Address</label>
                <input
                  type="text"
                  id="pr-address"
                  name="address"
                  className={`pat-reg-input ${errors.address ? "pat-reg-input-error" : ""}`}
                  placeholder="Enter your full address"
                  value={form.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <span className="pat-reg-error-msg">{errors.address}</span>
                )}
              </div>
            </div>

            {/* ── Row: Password | Confirm Password ──────── */}
            <div className="pat-reg-grid-row">
              <div className="pat-reg-form-group">
                <label htmlFor="pr-password">Password</label>
                <div className="pat-reg-pw-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="pr-password"
                    name="password"
                    className={`pat-reg-input ${errors.password ? "pat-reg-input-error" : ""}`}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="pat-reg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="pat-reg-error-msg">{errors.password}</span>
                )}
              </div>

              <div className="pat-reg-form-group">
                <label htmlFor="pr-confirmPassword">Confirm Password</label>
                <div className="pat-reg-pw-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="pr-confirmPassword"
                    name="confirmPassword"
                    className={`pat-reg-input ${errors.confirmPassword ? "pat-reg-input-error" : ""}`}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="pat-reg-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="pat-reg-error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* ── Terms & Conditions ─────────────────────── */}
            <div className="pat-reg-terms-group">
              <label className={`pat-reg-terms-label ${errors.acceptTerms ? "pat-reg-terms-error" : ""}`}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  className="pat-reg-checkbox"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="pat-reg-terms-link">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="pat-reg-terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="pat-reg-error-msg pat-reg-terms-err-msg">
                  {errors.acceptTerms}
                </span>
              )}
            </div>

            {/* ── Submit ─────────────────────────────────── */}
            <button type="submit" className="pat-reg-submit-btn">
              Create Patient Account
            </button>
          </form>

          {/* Footer */}
          <div className="pat-reg-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login/patient" className="pat-reg-login-link">
                Login as Patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientRegister;
