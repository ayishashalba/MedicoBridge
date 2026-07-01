import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaCheckCircle, FaEnvelopeOpen } from "react-icons/fa";
import "./VerifyEmail.css";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function VerifyEmail() {
  const navigate = useNavigate();

  // ── OTP state ────────────────────────────────────────────
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

  const handleVerify = () => {
    if (!isComplete) {
      setOtpError("Please enter the complete 6-digit verification code");
      return;
    }
    console.log("OTP verified:", otpValue);
    setIsVerified(true);
  };

  const handleResend = () => {
    if (!canResend) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    startCountdown();
    inputRefs.current[0]?.focus();
    console.log("OTP resent");
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
                      className={`otp-box ${digit ? "otp-box-filled" : ""} ${
                        otpError ? "otp-box-error" : ""
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
                  <Link to="/register/patient" className="otp-change-email-link">
                    Change Email
                  </Link>
                  <span className="otp-link-divider">·</span>
                  <button
                    type="button"
                    className="otp-back-btn"
                    onClick={() => navigate("/login/patient")}
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
                onClick={() => navigate("/patient/dashboard")}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
