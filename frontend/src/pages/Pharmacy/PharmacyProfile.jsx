import React, { useState, useEffect } from "react";

import {
  FaUserCircle,
  FaEdit,
  FaCheck,
  FaPills,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaUserTie,
} from "react-icons/fa";

import { toast } from "react-toastify";
import "./PharmacyPages.css";

export default function PharmacyProfile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    pharmacyId: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    licenseNumber: "",
    type: "Retail",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/pharmacy/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load pharmacy profile.");
      }

      const profile = data.data?.pharmacy || data.data?.profile || data.data;

      if (!profile) {
        throw new Error("Pharmacy profile data not found.");
      }

      setForm({
        name: profile.name || "",
        pharmacyId: profile.pharmacyId || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        licenseNumber: profile.licenseNumber || "",
        type: profile.type || "Retail",
      });
    } catch (err) {
      console.error("Pharmacy profile error:", err);
      setError(err.message || "Unable to load pharmacy profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/pharmacy/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            licenseNumber: form.licenseNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      const updatedProfile =
        data.data?.pharmacy ||
        data.data?.profile ||
        data.data;

      if (updatedProfile) {
        setForm({
          name: updatedProfile.name || "",
          pharmacyId: updatedProfile.pharmacyId || "",
          email: updatedProfile.email || "",
          phone: updatedProfile.phone || "",
          address: updatedProfile.address || "",
          city: updatedProfile.city || "",
          state: updatedProfile.state || "",
          licenseNumber: updatedProfile.licenseNumber || "",
          type: updatedProfile.type || "Retail",
        });
      }

      setEditing(false);
      toast.success("Pharmacy profile updated successfully.");
    } catch (err) {
      console.error("Pharmacy profile update error:", err);
      const msg = err.message || "Unable to update pharmacy profile.";
      toast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ph-page">
        <div className="ph-card">
          <p>Loading pharmacy profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaUserCircle /> {form.name || "Pharmacy"} Profile
          </h2>

          <p className="ph-page-sub">
            Manage your retail pharmacy's information and details
          </p>
        </div>

        <button
          className="ph-btn-add"
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {editing ? (
            <>
              <FaCheck /> {saving ? "Saving..." : "Save Changes"}
            </>
          ) : (
            <>
              <FaEdit /> Edit Profile
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="ph-card" style={{ marginBottom: "20px" }}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      )}

      <div className="ph-profile-layout">

        {/* Profile Banner */}
        <div className="ph-profile-banner">
          <div className="ph-profile-avatar-lg">
            <FaPills />
          </div>

          <div className="ph-profile-banner-info">
            <h3>{form.name || "Pharmacy"}</h3>

            <span
              className="ph-id-badge"
              style={{ fontSize: "0.82rem" }}
            >
              {form.pharmacyId || "ID not available"}
            </span>

            <p className="ph-profile-type">
              Retail Pharmacy
            </p>

            <p className="ph-profile-lic">
              License:{" "}
              <strong>
                {form.licenseNumber || "Not Provided"}
              </strong>
            </p>

            <p className="ph-profile-est">
              Type: Retail Pharmacy
            </p>
          </div>
        </div>

        <div className="ph-profile-grid">

          {/* Primary Information */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">
              Primary Information
            </h4>

            <div className="ph-profile-field">
              <FaUserCircle className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Pharmacy Name</label>

                {editing ? (
                  <input
                    value={form.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>{form.name || "Not Provided"}</span>
                )}
              </div>
            </div>

            <div className="ph-profile-field">
              <FaUserTie className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Pharmacy Type</label>
                <span>Retail Pharmacy</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">
              Contact Information
            </h4>

            <div className="ph-profile-field">
              <FaPhone className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Phone</label>

                {editing ? (
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      handleChange("phone", e.target.value)
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>{form.phone || "Not Provided"}</span>
                )}
              </div>
            </div>

            <div className="ph-profile-field">
              <FaEnvelope className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Email</label>

                <span>{form.email || "Not Provided"}</span>
              </div>
            </div>

            <div className="ph-profile-field">
              <FaMapMarkerAlt className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Address</label>

                {editing ? (
                  <input
                    value={form.address}
                    onChange={(e) =>
                      handleChange("address", e.target.value)
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>
                    {form.address || "Not Provided"}
                  </span>
                )}
              </div>
            </div>

            <div className="ph-profile-field">
              <FaMapMarkerAlt className="ph-field-icon" />

              <div className="ph-field-content">
                <label>City</label>

                {editing ? (
                  <input
                    value={form.city}
                    onChange={(e) =>
                      handleChange("city", e.target.value)
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>{form.city || "Not Provided"}</span>
                )}
              </div>
            </div>

            <div className="ph-profile-field">
              <FaMapMarkerAlt className="ph-field-icon" />

              <div className="ph-field-content">
                <label>State</label>

                {editing ? (
                  <input
                    value={form.state}
                    onChange={(e) =>
                      handleChange("state", e.target.value)
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>{form.state || "Not Provided"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Regulatory Information */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">
              Regulatory Details
            </h4>

            <div className="ph-profile-field">
              <FaIdCard className="ph-field-icon" />

              <div className="ph-field-content">
                <label>License Number</label>

                {editing ? (
                  <input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      handleChange(
                        "licenseNumber",
                        e.target.value
                      )
                    }
                    className="ph-inline-input"
                  />
                ) : (
                  <span>
                    {form.licenseNumber || "Not Provided"}
                  </span>
                )}
              </div>
            </div>

            <div className="ph-profile-field">
              <FaIdCard className="ph-field-icon" />

              <div className="ph-field-content">
                <label>Pharmacy ID</label>

                <span>
                  {form.pharmacyId || "Not Available"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}