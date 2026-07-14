import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaLock, FaEnvelope, FaExclamationTriangle } from "react-icons/fa";
import "./AdminPages.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@medicobridge.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (email === "admin@medicobridge.com" && password === "admin123") {
        localStorage.setItem("admin_token", "dummy_admin_session_token");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email address or passcode.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="ad-login-container">
      <div className="ad-login-card">
        <div className="ad-login-header">
          <div className="ad-login-logo">
            <FaShieldAlt />
          </div>
          <h2>MedicoBridge Admin</h2>
          <p>Sign in to access platform governance controls</p>
        </div>

        {error && (
          <div className="ad-login-alert">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ad-form-group">
            <label htmlFor="email">Admin Email Address</label>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medicobridge.com"
                required
              />
            </div>
          </div>

          <div className="ad-form-group" style={{ marginBottom: "1.75rem" }}>
            <label htmlFor="password">Security Password</label>
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
            disabled={loading}
          >
            {loading ? "Verifying Credentials..." : "Authenticate Admin Portal"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.78rem",
            color: "#64748b",
            background: "#f1f5f9",
            padding: "0.6rem",
            borderRadius: "8px",
          }}
        >
          <strong>Demo Access:</strong> admin@medicobridge.com / admin123
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
