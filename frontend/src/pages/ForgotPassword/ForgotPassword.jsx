import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (value) => {
    if (!value) return "Email address is required";
    if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(validateEmail(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
  };

  const handleTryAgain = () => {
    setEmail("");
    setEmailError("");
    setIsSubmitted(false);
  };

  return (
    <div className="fp-page-wrapper">
      <div className="fp-card-container">
        {/* Brand Header */}
        <Link to="/" className="fp-brand">
          <div className="fp-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="fp-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="fp-card">
          {!isSubmitted ? (
            /* ── Form State ── */
            <>
              <div className="fp-card-header">
                <div className="fp-icon-circle">
                  <FaEnvelope />
                </div>
                <h2>Forgot Password?</h2>
                <p>
                  No worries! Enter your registered email and we'll send you a
                  link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="fp-form" noValidate>
                <div className="fp-form-group">
                  <label htmlFor="fp-email">Email Address</label>
                  <input
                    type="email"
                    id="fp-email"
                    className={`fp-form-input ${emailError ? "fp-input-error" : ""}`}
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {emailError && (
                    <span className="fp-form-error-msg">{emailError}</span>
                  )}
                </div>

                <button type="submit" className="fp-submit-btn">
                  Send Reset Link
                </button>
              </form>

              <div className="fp-back-row">
                <button
                  type="button"
                  className="fp-back-btn"
                  onClick={() => navigate(-1)}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="fp-success-state">
              <div className="fp-success-icon-wrapper">
                <FaCheckCircle className="fp-success-icon" />
              </div>
              <h2>Check Your Email</h2>
              <p>
                We've sent a password reset link to{" "}
                <span className="fp-success-email">{email}</span>. Please check
                your inbox and follow the instructions.
              </p>
              <p className="fp-success-note">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  className="fp-retry-link"
                  onClick={handleTryAgain}
                >
                  try a different address
                </button>
                .
              </p>
              <button
                type="button"
                className="fp-submit-btn fp-back-home-btn"
                onClick={() => navigate(-1)}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
