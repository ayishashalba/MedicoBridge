import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeartbeat, FaCheckCircle, FaEnvelopeOpen } from "react-icons/fa";
import { toast } from "react-toastify";

import "./VerifyEmail.css";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const role =
    location.state?.role ||
    localStorage.getItem("pendingVerificationRole") ||
    "Patient";
  // ── OTP state ────────────────────────────────────────────
  const [verifiedRole, setVerifiedRole] = useState(role);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // ── Resend countdown ─────────────────────────────────────
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // ── Input refs for auto-focus ────────────────────────────
  const inputRefs = useRef([]);

  const startCountdown = useCallback(() => {
    clearInterval(timerRef.current);
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, [startCountdown]);

  // ── Derived helpers ──────────────────────────────────────
  const otpValue = digits.join("");
  const isComplete = otpValue.length === OTP_LENGTH && digits.every(Boolean);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    if (!val) return;

    const char = val[val.length - 1]; // take last typed digit
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);
    setOtpError("");

    // Move focus forward
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const updated = [...digits];
      if (digits[index]) {
        // clear current slot
        updated[index] = "";
        setDigits(updated);
      } else if (index > 0) {
        // move back and clear previous slot
        updated[index - 1] = "";
        setDigits(updated);
        inputRefs.current[index - 1]?.focus();
      }
      setOtpError("");
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const updated = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setDigits(updated);
    setOtpError("");

    // Focus last filled or next empty
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    if (!isComplete) {
      setOtpError("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      const email =
        location.state?.email ||
        localStorage.getItem("pendingVerificationEmail");
      if (!email) {
        setOtpError("Email not found. Please register again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otpValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || "Invalid OTP. Please try again.");
        return;
      }
      const backendRole = data.data?.user?.role || role;

      // Only correct OTP reaches here
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userRole", backendRole);
      localStorage.setItem("isLoggedIn", "true");

      setVerifiedRole(backendRole);
      setIsVerified(true);
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("Unable to verify OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    const email =
      location.state?.email ||
      localStorage.getItem("pendingVerificationEmail");
    if (!email) {
      setOtpError("Email not found. Please register again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || "Failed to resend OTP.");
        return;
      }

      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      startCountdown();
      inputRefs.current[0]?.focus();

      toast.info("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setOtpError("Unable to resend OTP. Please try again.");
    }
  };

  return (
    <div className="otp-page-wrapper">
      <div className="otp-card-container">
        {/* Brand */}
        <Link to="/" className="otp-brand">
          <div className="otp-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="otp-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="otp-card">
          {!isVerified ? (
            /* ── Verification Form ── */
            <>
              <div className="otp-card-header">
                <div className="otp-icon-circle">
                  <FaEnvelopeOpen />
                </div>
                <h2>Verify Your Email</h2>
                <p>
                  We've sent a 6-digit verification code to your registered
                  email address. Enter it below to activate your account.
                </p>
              </div>

              {/* OTP boxes */}
              <div className="otp-inputs-wrapper">
                <div className={`otp-inputs-row ${otpError ? "otp-shake" : ""}`}>
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      id={`otp-box-${idx}`}
                      className={`otp-box ${digit ? "otp-box-filled" : ""} ${otpError ? "otp-box-error" : ""
                        }`}
                      onChange={(e) => handleChange(idx, e)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      onFocus={(e) => e.target.select()}
                      autoComplete="one-time-code"
                      aria-label={`OTP digit ${idx + 1}`}
                    />
                  ))}
                </div>
                {otpError && (
                  <span className="otp-error-msg">{otpError}</span>
                )}
              </div>

              {/* Verify button */}
              <button
                type="button"
                className="otp-submit-btn"
                onClick={handleVerify}
                disabled={!isComplete}
              >
                Verify Email
              </button>

              {/* Resend + Change Email */}
              <div className="otp-actions-footer">
                <div className="otp-resend-row">
                  <span className="otp-resend-label">Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      className="otp-resend-btn"
                      onClick={handleResend}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="otp-countdown">
                      Resend in{" "}
                      <strong>{String(countdown).padStart(2, "0")}s</strong>
                    </span>
                  )}
                </div>

                <div className="otp-links-row">
                  <Link
                    to={
                      role === "Doctor"
                        ? "/register/doctor"
                        : role === "Hospital"
                          ? "/register/hospital"
                          : role === "Pharmacy"
                            ? "/register/pharmacy"
                            : "/register/patient"
                    }
                    className="otp-change-email-link"
                  >
                    Change Email
                  </Link>
                  <span className="otp-link-divider">·</span>
                  <button
                    type="button"
                    className="otp-back-btn"
                    onClick={() =>
                      navigate(
                        role === "Doctor"
                          ? "/login/doctor"
                          : role === "Hospital"
                            ? "/login/hospital"
                            : role === "Pharmacy"
                              ? "/login/pharmacy"
                              : "/login/patient"
                      )
                    }
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ── Success State ── */
            <div className="otp-success-state">
              <div className="otp-success-icon-wrapper">
                <FaCheckCircle className="otp-success-icon" />
              </div>
              <h2>Email Verified!</h2>
              <p>
                Your email has been verified successfully. Welcome to
                MedicoBridge — your healthcare journey starts now.
              </p>
              <button
                type="button"
                className="otp-submit-btn"
                onClick={() => {
                  switch (verifiedRole) {
                    case "Doctor":
                      navigate("/doctor/dashboard");
                      break;

                    case "Hospital":
                      navigate("/hospital/dashboard");
                      break;

                    case "Pharmacy":
                      navigate("/pharmacy/dashboard");
                      break;

                    case "Patient":
                    default:
                      navigate("/patient/dashboard");
                      break;
                  }
                }}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}

export default VerifyEmail;
