import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStethoscope, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./DoctorLogin.css";

function DoctorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {

      // Hospital doctor
      if (email === "hospitaldoctor@gmail.com") {
        localStorage.setItem("doctorType", "Hospital");
        navigate("/doctor/dashboard");
      }

      // Private clinic doctor
      else if (email === "clinicdoctor@gmail.com") {
        localStorage.setItem("doctorType", "Clinic");
        navigate("/doctor/dashboard");
      }

      else {
        alert("Invalid doctor account");
      }
    }
  };

  const handleGoogleLogin = () => {
    console.log("Doctor Google login initiated");
    window.location.href = "https://accounts.google.com";
  };

  return (
    <div className="doctor-login-page-wrapper">
      <div className="doctor-login-card-container">
        {/* Brand Header */}
        <Link to="/" className="doctor-login-brand">
          <div className="doctor-brand-icon-wrapper">
            <FaStethoscope />
          </div>
          <span className="doctor-brand-title">MedicoBridge</span>
        </Link>

        {/* Card Body */}
        <div className="doctor-login-card">
          <div className="doctor-login-card-header">
            <h2>Welcome Back, Doctor</h2>
            <p>Access your practice dashboard, schedules, and patient records</p>
          </div>

          <form onSubmit={handleSubmit} className="doctor-login-form" noValidate>
            {/* Email Field */}
            <div className="doctor-form-group">
              <label htmlFor="doctor-email">Email Address</label>
              <input
                type="email"
                id="doctor-email"
                className={`doctor-form-input ${errors.email ? "doctor-input-error" : ""}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className="doctor-form-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="doctor-form-group">
              <label htmlFor="doctor-password">Password</label>
              <div className="doctor-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="doctor-password"
                  className={`doctor-form-input ${errors.password ? "doctor-input-error" : ""
                    }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="doctor-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="doctor-form-error-msg">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="doctor-form-actions-row">
              <label className="doctor-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="doctor-forgot-pwd-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="doctor-form-submit-btn">
              Login as Doctor
            </button>
          </form>

          {/* Divider */}
          <div className="doctor-form-divider">
            <span>or</span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            className="doctor-btn-google-login"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="doctor-google-icon" />
            Continue with Google
          </button>

          {/* Footer Redirect */}
          <div className="doctor-login-card-footer">
            <p>
              New to MedicoBridge?{" "}
              <Link to="/register/doctor" className="doctor-footer-redirect-link">
                Create Doctor Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
