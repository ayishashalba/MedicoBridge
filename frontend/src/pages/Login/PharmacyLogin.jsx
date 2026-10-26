import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPills, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "./PharmacyLogin.css";

function PharmacyLogin() {
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
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
            role: "Pharmacy",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Pharmacy login failed."
        );
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error(
          "Login successful, but authentication token was not received."
        );
      }

      /*
       * Make sure this account is actually a Pharmacy account.
       */
      if (user?.role && user.role !== "Pharmacy") {
        throw new Error(
          "This account is not registered as a Pharmacy account."
        );
      }

      /*
       * Store authentication data.
       */
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "Pharmacy");
      localStorage.setItem("isLoggedIn", "true");

      /*
       * Retail Pharmacy only.
       * We don't use this value to authenticate the user.
       * It is only kept for compatibility with any old frontend code.
       */
      localStorage.setItem("pharmacyType", "Retail");

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      /*
       * Clear old registration/OTP state.
       */
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationRole");

      /*
       * Go to the Pharmacy dashboard only after
       * successful backend authentication.
       */
      navigate("/pharmacy/dashboard", { replace: true });
    } catch (error) {
      console.error("Pharmacy login error:", error);
      toast.error(
        error.message || "Unable to login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);

    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: "",
      }));
    }
  };

  return (
    <div className="pharm-login-page-wrapper">
      <div className="pharm-login-card-container">

        {/* Brand Header */}
        <Link
          to="/"
          className="pharm-login-brand"
        >
          <div className="pharm-brand-icon-wrapper">
            <FaPills />
          </div>

          <span className="pharm-brand-title">
            MedicoBridge
          </span>
        </Link>

        {/* Login Card */}
        <div className="pharm-login-card">

          {/* Header */}
          <div className="pharm-login-card-header">
            <h2>
              Welcome Back, Retail Pharmacy
            </h2>

            <p>
              Access your dispensing dashboard, inventory,
              orders, and prescriptions
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="pharm-login-form"
            noValidate
          >

            {/* Email */}
            <div className="pharm-form-group">
              <label htmlFor="pharm-email">
                Email Address
              </label>

              <input
                type="email"
                id="pharm-email"
                className={`pharm-form-input ${errors.email
                    ? "pharm-input-error"
                    : ""
                  }`}
                placeholder="Enter your retail pharmacy email address"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={isLoading}
              />

              {errors.email && (
                <span className="pharm-form-error-msg">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="pharm-form-group">
              <label htmlFor="pharm-password">
                Password
              </label>

              <div className="pharm-password-input-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="pharm-password"
                  className={`pharm-form-input ${errors.password
                      ? "pharm-input-error"
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
                  className="pharm-password-toggle-btn"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
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
                <span className="pharm-form-error-msg">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="pharm-form-actions-row">
              <label className="pharm-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  disabled={isLoading}
                />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="pharm-forgot-pwd-link"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="pharm-form-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? "Logging in..."
                : "Login as Retail Pharmacy"}
            </button>
          </form>

          {/* Footer */}
          <div className="pharm-login-card-footer">
            <p>
              New to MedicoBridge?{" "}
              <Link
                to="/register/pharmacy"
                className="pharm-footer-redirect-link"
              >
                Register Your Retail Pharmacy
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PharmacyLogin;