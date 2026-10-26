import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";

import "./AdminPages.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

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
            role: "Admin",
          }),
        }
      );

      const data = await response.json();

      console.log("ADMIN LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error(
          "Login succeeded, but authentication token was not received."
        );
      }

      // Extra frontend safety check
      if (user?.role && user.role !== "Admin") {
        throw new Error(
          "User doesn't exist. Please register."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", "Admin");
      localStorage.setItem("isLoggedIn", "true");

      // Remove old fake admin token if it exists
      localStorage.removeItem("admin_token");

      toast.success("Login successful! Welcome, Admin.");

      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);

      toast.error(
        error.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ad-login-container">
      <div className="ad-login-card">

        <div className="ad-login-header">
          <div className="ad-login-logo">
            <FaShieldAlt />
          </div>

          <h2>MedicoBridge Admin</h2>

          <p>
            Sign in to access platform governance controls
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="ad-form-group">
            <label htmlFor="email">
              Admin Email Address
            </label>

            <div style={{ position: "relative" }}>
              <FaEnvelope
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                id="email"
                type="email"
                className="ad-input"
                style={{ paddingLeft: "35px" }}
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter admin email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div
            className="ad-form-group"
            style={{ marginBottom: "1.75rem" }}
          >
            <label htmlFor="password">
              Security Password
            </label>

            <div style={{ position: "relative" }}>
              <FaLock
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />

              <input
                id="password"
                type="password"
                className="ad-input"
                style={{ paddingLeft: "35px" }}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.75rem",
            }}
            disabled={loading}
          >
            {loading
              ? "Verifying Credentials..."
              : "Authenticate Admin Portal"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AdminLogin;