import React, { useState } from "react";
import { FaUserShield, FaSave, FaCheckCircle, FaLock } from "react-icons/fa";
import "./AdminPages.css";

export default function AdminProfile() {
  const [name, setName] = useState("Alex Mercer");
  const [email, setEmail] = useState("admin@medicobridge.com");
  const [phone, setPhone] = useState("+91 99887 76655");
  const [dept, setDept] = useState("Platform Security & Governance");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      triggerToast("Administrator details updated successfully.");
    }, 1000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation fields do not match.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      triggerToast("Security password passcode successfully rotated.");
    }, 1200);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Edit system administrative profiles, update security tags, and rotate login credentials</p>
      </div>

      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0d9488",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          zIndex: 1100,
          boxShadow: "0 10px 25px rgba(13,148,136,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaCheckCircle />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      <div className="ad-grid-2">
        {/* Profile Card details */}
        <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 className="ad-card-title"><FaUserShield /> Account Specifications</h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="ad-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="ad-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="ad-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group">
              <label htmlFor="phone">Contact Number</label>
              <input
                id="phone"
                type="text"
                className="ad-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="department">Assigned Governance Department</label>
              <input
                id="department"
                type="text"
                className="ad-input"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="ad-btn ad-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={saving}>
              <FaSave /> {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Change password security */}
        <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 className="ad-card-title"><FaLock /> Rotates Security Password</h3>

          <form onSubmit={handleChangePassword}>
            <div className="ad-form-group">
              <label htmlFor="oldPass">Current Password</label>
              <input
                id="oldPass"
                type="password"
                className="ad-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group">
              <label htmlFor="newPass">New Password</label>
              <input
                id="newPass"
                type="password"
                className="ad-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="ad-form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="confirmPass">Confirm New Password</label>
              <input
                id="confirmPass"
                type="password"
                className="ad-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="ad-btn ad-btn-primary" style={{ width: "100%", justifyContent: "center", background: "#311042" }} disabled={saving}>
              <FaLock /> {saving ? "Updating Password..." : "Rotate Credentials"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
