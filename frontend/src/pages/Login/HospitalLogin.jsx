import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHospital, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./HospitalLogin.css";

function HospitalLogin() {
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
      console.log("Hospital logging in:", { email, password, rememberMe });
      navigate("/hospital/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Hospital Google login initiated");
    window.location.href = "https://accounts.google.com";
  };

  return (
    <div className="hosp-login-page-wrapper">
      <div className="hosp-login-card-container">
        {/* Brand Header */}
        <Link to="/" className="hosp-login-brand">
          <div className="hosp-brand-icon-wrapper">
            <FaHospital />
          </div>
          <span className="hosp-brand-title">MedicoBridge</span>
        </Link>

        {/* Card Body */}
        <div className="hosp-login-card">
          <div className="hosp-login-card-header">
            <h2>Welcome Back, Hospital</h2>
            <p>Manage wards, staff, admissions, and operations from one place</p>
          </div>

          <form onSubmit={handleSubmit} className="hosp-login-form" noValidate>
            {/* Email Field */}
            <div className="hosp-form-group">
              <label htmlFor="hosp-email">Email Address</label>
              <input
                type="email"
                id="hosp-email"
                className={`hosp-form-input ${errors.email ? "hosp-input-error" : ""}`}
                placeholder="Enter your hospital email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className="hosp-form-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="hosp-form-group">
              <label htmlFor="hosp-password">Password</label>
              <div className="hosp-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="hosp-password"
                  className={`hosp-form-input ${
                    errors.password ? "hosp-input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="hosp-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="hosp-form-error-msg">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="hosp-form-actions-row">
              <label className="hosp-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="hosp-forgot-pwd-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="hosp-form-submit-btn">
              Login as Hospital
            </button>
          </form>

          {/* Divider */}
          <div className="hosp-form-divider">
            <span>or</span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            className="hosp-btn-google-login"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="hosp-google-icon" />
            Continue with Google
          </button>

          {/* Footer Redirect */}
          <div className="hosp-login-card-footer">
            <p>
              New to MedicoBridge?{" "}
              <Link to="/register/hospital" className="hosp-footer-redirect-link">
                Register Your Hospital
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalLogin;
