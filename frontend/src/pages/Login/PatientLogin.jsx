import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHeartbeat,
  FaEye,
  FaEyeSlash,
  FaGoogle,
} from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import "./PatientLogin.css";

function PatientLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const destination =
    location.state?.redirectTo || "/patient/dashboard";

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters long";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            role: "Patient",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Patient login failed."
        );
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error(
          "Login successful, but authentication token was not received."
        );
      }

      if (user?.role && user.role !== "Patient") {
        throw new Error(
          "This account is not registered as a Patient account."
        );
      }

      // Save authentication
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "Patient");
      localStorage.setItem("isLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Clear old verification state
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationRole");

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Patient login error:", error);
      toast.error(
        error.message ||
        "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrors({});

    try {
      setGoogleLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
            role: "Patient",
          }),
        }
      );

      const data = await response.json();

      console.log("PATIENT GOOGLE LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Google login failed."
        );
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error(
          "Google login succeeded, but authentication token was not received."
        );
      }

      if (user?.role && user.role !== "Patient") {
        throw new Error(
          "This Google account is not registered as a Patient account."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "Patient");
      localStorage.setItem("isLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationRole");

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Patient Google login error:", error);
      toast.error(
        error.message ||
        "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleLoading(false);
    toast.error("Google login was cancelled or failed. Please try again.");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (errors.email || errors.general) {
      setErrors((prev) => ({
        ...prev,
        email: "",
        general: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    if (errors.password || errors.general) {
      setErrors((prev) => ({
        ...prev,
        password: "",
        general: "",
      }));
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">

        {/* Brand Header */}
        <Link
          to="/"
          className="login-brand"
        >
          <div className="brand-icon-wrapper">
            <FaHeartbeat />
          </div>

          <span className="brand-title">
            MedicoBridge
          </span>
        </Link>

        {/* Login Card */}
        <div className="login-card">

          {/* Header */}
          <div className="login-card-header">
            <h2>
              Welcome Back, Patient
            </h2>

            <p>
              Access your health dashboard,
              appointments, and records
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
          >

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                className={`form-input ${errors.email
                  ? "input-error"
                  : ""
                  }`}
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={isLoading || googleLoading}
              />

              {errors.email && (
                <span className="form-error-msg">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-input-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  className={`form-input ${errors.password
                    ? "input-error"
                    : ""
                    }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={isLoading || googleLoading}
                />

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={
                    isLoading || googleLoading
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="form-error-msg">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="form-actions-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={
                    isLoading || googleLoading
                  }
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-pwd-link"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Normal Login */}
            <button
              type="submit"
              className="btn-primary form-submit-btn"
              disabled={isLoading || googleLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Login as Patient"}
            </button>
          </form>

          {/* Divider */}
          <div className="form-divider">
            <span>or</span>
          </div>

          {/* Google Login */}
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {/* Footer */}
          <div className="login-card-footer">
            <p>
              New to MedicoBridge?{" "}

              <Link
                to="/register/patient"
                className="footer-redirect-link"
              >
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