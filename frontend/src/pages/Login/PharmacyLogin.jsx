import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPills, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import "./PharmacyLogin.css";

function PharmacyLogin() {
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
      console.log("Pharmacy logging in:", { email, password, rememberMe });
      navigate("/pharmacy/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Pharmacy Google login initiated");
    window.location.href = "https://accounts.google.com";
  };

  return (
    <div className="pharm-login-page-wrapper">
      <div className="pharm-login-card-container">
        {/* Brand Header */}
        <Link to="/" className="pharm-login-brand">
          <div className="pharm-brand-icon-wrapper">
            <FaPills />
          </div>
          <span className="pharm-brand-title">MedicoBridge</span>
        </Link>

        {/* Card Body */}
        <div className="pharm-login-card">
          <div className="pharm-login-card-header">
            <h2>Welcome Back, Pharmacy</h2>
            <p>Access your dispensing dashboard, inventory, and prescriptions</p>
          </div>

          <form onSubmit={handleSubmit} className="pharm-login-form" noValidate>
            {/* Email Field */}
            <div className="pharm-form-group">
              <label htmlFor="pharm-email">Email Address</label>
              <input
                type="email"
                id="pharm-email"
                className={`pharm-form-input ${errors.email ? "pharm-input-error" : ""}`}
                placeholder="Enter your pharmacy email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className="pharm-form-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="pharm-form-group">
              <label htmlFor="pharm-password">Password</label>
              <div className="pharm-password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="pharm-password"
                  className={`pharm-form-input ${
                    errors.password ? "pharm-input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pharm-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="pharm-form-error-msg">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="pharm-form-actions-row">
              <label className="pharm-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="pharm-forgot-pwd-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="pharm-form-submit-btn">
              Login as Pharmacy
            </button>
          </form>

          {/* Divider */}
          <div className="pharm-form-divider">
            <span>or</span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            className="pharm-btn-google-login"
            onClick={handleGoogleLogin}
          >
            <FaGoogle className="pharm-google-icon" />
            Continue with Google
          </button>

          {/* Footer Redirect */}
          <div className="pharm-login-card-footer">
            <p>
              New to MedicoBridge?{" "}
              <Link to="/register/pharmacy" className="pharm-footer-redirect-link">
                Register Your Pharmacy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyLogin;
