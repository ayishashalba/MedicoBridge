import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEye, FaEyeSlash, FaCheckCircle, FaLockOpen } from "react-icons/fa";
import "./ResetPassword.css";

/* ── Password-strength scorer ────────────────────────────
   Returns { label, level }
   level: "weak" | "medium" | "strong"
───────────────────────────────────────────────────────── */
function getPasswordStrength(password) {
  if (!password) return { label: "", level: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", level: "weak" };
  if (score === 3) return { label: "Medium", level: "medium" };
  return { label: "Strong", level: "strong" };
}

function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Password reset submitted for:", email);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="rp-page-wrapper">
      <div className="rp-card-container">
        {/* Brand Header */}
        <Link to="/" className="rp-brand">
          <div className="rp-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="rp-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="rp-card">
          {!isSubmitted ? (
            /* ── Form State ── */
            <>
              <div className="rp-card-header">
                <div className="rp-icon-circle">
                  <FaLockOpen />
                </div>
                <h2>Reset Your Password</h2>
                <p>
                  Enter your email and choose a strong new password to regain
                  access to your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="rp-form" noValidate>
                {/* Email */}
                <div className="rp-form-group">
                  <label htmlFor="rp-email">Email Address</label>
                  <input
                    type="email"
                    id="rp-email"
                    className={`rp-form-input ${errors.email ? "rp-input-error" : ""}`}
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className="rp-form-error-msg">{errors.email}</span>
                  )}
                </div>

                {/* New Password */}
                <div className="rp-form-group">
                  <label htmlFor="rp-new-password">New Password</label>
                  <div className="rp-password-wrapper">
                    <input
                      type={showNew ? "text" : "password"}
                      id="rp-new-password"
                      className={`rp-form-input ${errors.newPassword ? "rp-input-error" : ""}`}
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowNew(!showNew)}
                      aria-label={showNew ? "Hide new password" : "Show new password"}
                    >
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <span className="rp-form-error-msg">{errors.newPassword}</span>
                  )}

                  {/* Strength Indicator */}
                  {newPassword && (
                    <div className="rp-strength-wrapper">
                      <div className="rp-strength-bars">
                        <span
                          className={`rp-strength-bar ${
                            strength.level ? "rp-bar-filled rp-bar-" + strength.level : ""
                          }`}
                        />
                        <span
                          className={`rp-strength-bar ${
                            strength.level === "medium" || strength.level === "strong"
                              ? "rp-bar-filled rp-bar-" + strength.level
                              : ""
                          }`}
                        />
                        <span
                          className={`rp-strength-bar ${
                            strength.level === "strong"
                              ? "rp-bar-filled rp-bar-strong"
                              : ""
                          }`}
                        />
                      </div>
                      <span className={`rp-strength-label rp-label-${strength.level}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="rp-form-group">
                  <label htmlFor="rp-confirm-password">Confirm Password</label>
                  <div className="rp-password-wrapper">
                    <input
                      type={showConfirm ? "text" : "password"}
                      id="rp-confirm-password"
                      className={`rp-form-input ${errors.confirmPassword ? "rp-input-error" : ""}`}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rp-eye-btn"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="rp-form-error-msg">{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Submit */}
                <button type="submit" className="rp-submit-btn">
                  Reset Password
                </button>
              </form>

              <div className="rp-back-row">
                <button
                  type="button"
                  className="rp-back-btn"
                  onClick={() => navigate(-1)}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="rp-success-state">
              <div className="rp-success-icon-wrapper">
                <FaCheckCircle className="rp-success-icon" />
              </div>
              <h2>Password Reset Successful</h2>
              <p>
                Your password has been updated successfully. You can now log in
                with your new credentials.
              </p>
              <button
                type="button"
                className="rp-submit-btn"
                onClick={() => navigate(-2)}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
