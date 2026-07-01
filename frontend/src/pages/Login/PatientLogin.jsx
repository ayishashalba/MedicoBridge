import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./PatientLogin.css";

function PatientLogin() {
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
      console.log("Patient logging in:", { email, password, rememberMe });
      // Simulate successful login and redirect to patient dashboard
      navigate("/patient/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Patient Google login initiated");
    // Simulate oauth redirection
    window.location.href = "https://accounts.google.com";
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <Link to="/" className="login-brand">
          <div className="brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="brand-title">MedicoBridge</span>
        </Link>

        {/* Card Body */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back, Patient</h2>
            <p>Access your health dashboard, appointments, and records</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className="form-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`form-input ${
                    errors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error-msg">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password Links */}
            <div className="form-actions-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-pwd-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-primary form-submit-btn">
              Login as Patient
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>or</span>
          </div>

          {/* Social Sign-in */}
          <button
            type="button"
            className="btn-google-login"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="google-icon" />
            Continue with Google
          </button>

          {/* Redirect Footer */}
          <div className="login-card-footer">
            <p>
              New to MedicoBridge?{" "}
              <Link to="/register/patient" className="footer-redirect-link">
                Create Patient Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientLogin;
