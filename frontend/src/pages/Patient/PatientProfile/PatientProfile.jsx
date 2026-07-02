import React, { useState } from "react";
import {
  FaUserCircle,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaTint,
  FaMapMarkerAlt,
  FaHeartbeat,
  FaAllergies,
  FaPhoneAlt,
  FaIdCard,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./PatientProfile.css";

/* ── Static profile data (UI only) ─────────────────────────── */
const defaultProfile = {
  fullName: "John Doe",
  email: "johndoe@email.com",
  phone: "+91 98765 43210",
  dob: "1995-04-12",
  gender: "Male",
  bloodGroup: "O+",
  address: "42, MG Road, Koramangala, Bengaluru, Karnataka – 560034",
  allergies: "Penicillin, Peanuts",
  conditions: "Type 2 Diabetes, Hypertension",
  emergencyName: "Jane Doe",
  emergencyPhone: "+91 91234 56789",
  emergencyRelation: "Spouse",
};

/* ── Individual field component ────────────────────────────── */
function ProfileField({ icon, label, name, value, type = "text", editMode, onChange, options }) {
  return (
    <div className="pf-field">
      <label className="pf-field-label" htmlFor={name}>
        <span className="pf-field-icon">{icon}</span>
        {label}
      </label>
      {editMode ? (
        options ? (
          <select
            id={name}
            name={name}
            className="pf-input"
            value={value}
            onChange={onChange}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            className="pf-input"
            value={value}
            onChange={onChange}
            autoComplete="off"
          />
        )
      ) : (
        <p className="pf-value">{value || <span className="pf-empty">Not provided</span>}</p>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
function PatientProfile() {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [draft, setDraft] = useState(defaultProfile);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setDraft(profile);
    setEditMode(true);
    setSaved(false);
  };

  const handleSave = () => {
    setProfile(draft);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const data = editMode ? draft : profile;

  return (
    <div className="patient-profile-page">

      {/* ── Page Header ── */}
      <div className="pp-page-header">
        <div className="pp-page-title-group">
          <h1 className="pp-page-title">My Profile</h1>
          <p className="pp-page-subtitle">Manage your personal, medical, and emergency information</p>
        </div>

        <div className="pp-header-actions">
          {saved && (
            <span className="pp-saved-toast">
              <FaCheckCircle /> Changes saved
            </span>
          )}
          {editMode ? (
            <>
              <button className="pp-btn pp-btn-ghost" onClick={handleCancel} aria-label="Cancel editing">
                <FaTimes /> Cancel
              </button>
              <button className="pp-btn pp-btn-primary" onClick={handleSave} aria-label="Save changes">
                <FaSave /> Save Changes
              </button>
            </>
          ) : (
            <button className="pp-btn pp-btn-primary" onClick={handleEdit} aria-label="Edit profile">
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="pp-grid">

        {/* ─── LEFT COLUMN ─── */}
        <aside className="pp-sidebar-col">

          {/* Profile Photo Card */}
          <div className="pp-card pp-photo-card">
            <div className="pp-avatar-ring">
              <div className="pp-avatar">
                <FaUserCircle className="pp-avatar-icon" />
              </div>
              <button
                className="pp-camera-btn"
                aria-label="Change profile photo"
                title="Change photo"
                disabled={!editMode}
              >
                <FaCamera />
              </button>
            </div>

            <div className="pp-avatar-info">
              <h2 className="pp-avatar-name">{profile.fullName}</h2>
              <span className="pp-avatar-role">Patient</span>
              <span className="pp-avatar-id">ID: #PT-20041</span>
            </div>

            {editMode && (
              <button className="pp-btn pp-btn-outline pp-change-photo-btn" aria-label="Upload new photo">
                <FaCamera /> Change Photo
              </button>
            )}

            {/* Quick Stats */}
            <div className="pp-quick-stats">
              <div className="pp-stat-item">
                <span className="pp-stat-val" style={{ color: "#ef4444" }}>{profile.bloodGroup}</span>
                <span className="pp-stat-key">Blood Group</span>
              </div>
              <div className="pp-stat-divider" />
              <div className="pp-stat-item">
                <span className="pp-stat-val">{profile.gender}</span>
                <span className="pp-stat-key">Gender</span>
              </div>
              <div className="pp-stat-divider" />
              <div className="pp-stat-item">
                <span className="pp-stat-val">31</span>
                <span className="pp-stat-key">Age</span>
              </div>
            </div>
          </div>

          {/* Health Badge Card */}
          <div className="pp-card pp-health-badge-card">
            <div className="pp-health-badge-header">
              <FaShieldAlt className="pp-shield-icon" />
              <span>Health Summary</span>
            </div>
            <ul className="pp-health-tag-list">
              {profile.conditions.split(",").map((c) => (
                <li key={c.trim()} className="pp-health-tag pp-tag-condition">
                  <FaHeartbeat /> {c.trim()}
                </li>
              ))}
              {profile.allergies.split(",").map((a) => (
                <li key={a.trim()} className="pp-health-tag pp-tag-allergy">
                  <FaAllergies /> {a.trim()}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="pp-main-col">

          {/* Personal Information */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-icon-wrap" style={{ "--card-color": "#0d9488" }}>
                <FaUser />
              </div>
              <div>
                <h3 className="pp-card-title">Personal Information</h3>
                <p className="pp-card-desc">Your basic personal details</p>
              </div>
            </div>

            <div className="pp-fields-grid">
              <ProfileField
                icon={<FaUser />}
                label="Full Name"
                name="fullName"
                value={data.fullName}
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaEnvelope />}
                label="Email Address"
                name="email"
                value={data.email}
                type="email"
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaPhone />}
                label="Phone Number"
                name="phone"
                value={data.phone}
                type="tel"
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaCalendarAlt />}
                label="Date of Birth"
                name="dob"
                value={data.dob}
                type="date"
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaVenusMars />}
                label="Gender"
                name="gender"
                value={data.gender}
                editMode={editMode}
                onChange={handleChange}
                options={["Male", "Female", "Other", "Prefer not to say"]}
              />
              <ProfileField
                icon={<FaTint />}
                label="Blood Group"
                name="bloodGroup"
                value={data.bloodGroup}
                editMode={editMode}
                onChange={handleChange}
                options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
              />
            </div>

            {/* Full-width Address */}
            <div className="pf-field pf-field--full">
              <label className="pf-field-label" htmlFor="address">
                <span className="pf-field-icon"><FaMapMarkerAlt /></span>
                Address
              </label>
              {editMode ? (
                <textarea
                  id="address"
                  name="address"
                  className="pf-input pf-textarea"
                  value={draft.address}
                  onChange={handleChange}
                  rows={3}
                />
              ) : (
                <p className="pf-value">{profile.address}</p>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-icon-wrap" style={{ "--card-color": "#0284c7" }}>
                <FaHeartbeat />
              </div>
              <div>
                <h3 className="pp-card-title">Medical Information</h3>
                <p className="pp-card-desc">Conditions and allergies important for treatment</p>
              </div>
            </div>

            <div className="pp-fields-grid pp-fields-grid--single">
              <ProfileField
                icon={<FaAllergies />}
                label="Allergies"
                name="allergies"
                value={data.allergies}
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaHeartbeat />}
                label="Existing Medical Conditions"
                name="conditions"
                value={data.conditions}
                editMode={editMode}
                onChange={handleChange}
              />
            </div>

            {!editMode && (
              <div className="pp-medical-tags">
                {profile.allergies.split(",").map((a) => (
                  <span key={a} className="pp-tag pp-tag--red">{a.trim()}</span>
                ))}
                {profile.conditions.split(",").map((c) => (
                  <span key={c} className="pp-tag pp-tag--blue">{c.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="pp-card">
            <div className="pp-card-header">
              <div className="pp-card-icon-wrap" style={{ "--card-color": "#f59e0b" }}>
                <FaPhoneAlt />
              </div>
              <div>
                <h3 className="pp-card-title">Emergency Contact</h3>
                <p className="pp-card-desc">Person to contact in case of emergency</p>
              </div>
            </div>

            <div className="pp-fields-grid">
              <ProfileField
                icon={<FaIdCard />}
                label="Contact Name"
                name="emergencyName"
                value={data.emergencyName}
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaPhoneAlt />}
                label="Contact Number"
                name="emergencyPhone"
                value={data.emergencyPhone}
                type="tel"
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaUser />}
                label="Relationship"
                name="emergencyRelation"
                value={data.emergencyRelation}
                editMode={editMode}
                onChange={handleChange}
                options={["Spouse", "Parent", "Child", "Sibling", "Friend", "Guardian", "Other"]}
              />
            </div>
          </div>

          {/* Bottom action row (visible on mobile / repeat) */}
          {editMode && (
            <div className="pp-bottom-actions">
              <button className="pp-btn pp-btn-ghost" onClick={handleCancel}>
                <FaTimes /> Cancel
              </button>
              <button className="pp-btn pp-btn-primary" onClick={handleSave}>
                <FaSave /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
