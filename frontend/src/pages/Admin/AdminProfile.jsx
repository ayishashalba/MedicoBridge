import React, { useEffect, useState } from "react";

import { FaUserShield, FaSave, FaLock } from "react-icons/fa";

import { toast } from "react-toastify";

import "./AdminPages.css";

export default function AdminProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch current admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Authentication session not found. Please log in again.");
          return;
        }

        const response = await fetch("http://localhost:5000/api/admin/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load admin profile.");
        }

        const admin = result.data;

        setName(admin.name || "");
        setEmail(admin.email || "");
        setPhone(admin.phone || "");
        setDept(admin.department || "");
      } catch (error) {
        console.error("Fetch admin profile error:", error);
        toast.error(error.message || "Failed to load admin profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Update admin profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication session not found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          department: dept.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update profile.");
      }

      const updatedAdmin = result.data;

      setName(updatedAdmin.name || "");
      setEmail(updatedAdmin.email || "");
      setPhone(updatedAdmin.phone || "");
      setDept(updatedAdmin.department || "");

      toast.success("Administrator details updated successfully.");
    } catch (error) {
      console.error("Update admin profile error:", error);
      toast.error(error.message || "Failed to update administrator details.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change admin password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication session not found. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/profile/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: oldPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update password.");
      }

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Security password updated successfully.");
    } catch (error) {
      console.error("Change admin password error:", error);
      toast.error(error.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>
          Edit system administrative profiles, update security tags, and
          rotate login credentials
        </p>
      </div>

      <div className="ad-grid-2">
        {/* Profile Card */}
        <div
          className="ad-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h3 className="ad-card-title">
            <FaUserShield /> Account Specifications
          </h3>

          {loadingProfile ? (
            <p>Loading profile...</p>
          ) : (
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

              <div
                className="ad-form-group"
                style={{ marginBottom: "1.5rem" }}
              >
                <label htmlFor="department">
                  Assigned Governance Department
                </label>

                <input
                  id="department"
                  type="text"
                  className="ad-input"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="ad-btn ad-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
                disabled={savingProfile}
              >
                <FaSave />

                {savingProfile
                  ? "Saving Changes..."
                  : "Save Profile Details"}
              </button>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div
          className="ad-card"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <h3 className="ad-card-title">
            <FaLock /> Rotates Security Password
          </h3>

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

            <div
              className="ad-form-group"
              style={{ marginBottom: "1.5rem" }}
            >
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

            <button
              type="submit"
              className="ad-btn ad-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                background: "#311042",
              }}
              disabled={savingPassword}
            >
              <FaLock />

              {savingPassword
                ? "Updating Password..."
                : "Rotate Credentials"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}