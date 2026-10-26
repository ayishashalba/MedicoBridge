import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHospital, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "./HospitalLogin.css";

function HospitalLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
            role: "Hospital",
          }),
        }
      );

      const data = await response.json();

      console.log("HOSPITAL LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Hospital login failed."
        );
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error(
          "Login successful, but authentication token was not received."
        );
      }

      if (user?.role && user.role !== "Hospital") {
        throw new Error(
          "This account is not registered as a Hospital account."
        );
      }

      // Save authentication details
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "Hospital");
      localStorage.setItem("isLoggedIn", "true");

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Clear old verification state
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationRole");

      // Go to Hospital Dashboard
      navigate("/hospital/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Hospital login error:", error);
      toast.error(
        error.message ||
        "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
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
    <div className="hosp-login-page-wrapper">
      <div className="hosp-login-card-container">

        {/* Brand Header */}
        <Link
          to="/"
          className="hosp-login-brand"
        >
          <div className="hosp-brand-icon-wrapper">
            <FaHospital />
          </div>

          <span className="hosp-brand-title">
            MedicoBridge
          </span>
        </Link>

        {/* Login Card */}
        <div className="hosp-login-card">

          {/* Header */}
          <div className="hosp-login-card-header">
            <h2>
              Welcome Back, Hospital
            </h2>

            <p>
              Manage wards, staff, admissions, and
              operations from one place
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="hosp-login-form"
            noValidate
          >

            {/* Email Field */}
            <div className="hosp-form-group">
              <label htmlFor="hosp-email">
                Email Address
              </label>

              <input
                type="email"
                id="hosp-email"
                className={`hosp-form-input ${errors.email
                    ? "hosp-input-error"
                    : ""
                  }`}
                placeholder="Enter your hospital email address"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={isLoading}
              />

              {errors.email && (
                <span className="hosp-form-error-msg">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="hosp-form-group">
              <label htmlFor="hosp-password">
                Password
              </label>

              <div className="hosp-password-input-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="hosp-password"
                  className={`hosp-form-input ${errors.password
                      ? "hosp-input-error"
                      : ""
                    }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="hosp-password-toggle-btn"
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
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>

              {errors.password && (
                <span className="hosp-form-error-msg">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="hosp-form-actions-row">
              <label className="hosp-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={isLoading}
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="hosp-forgot-pwd-link"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="hosp-form-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Login as Hospital"}
            </button>
          </form>

          {/* Footer Redirect */}
          <div className="hosp-login-card-footer">
            <p>
              New to MedicoBridge?{" "}

              <Link
                to="/register/hospital"
                className="hosp-footer-redirect-link"
              >
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