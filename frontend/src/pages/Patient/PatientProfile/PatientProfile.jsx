import React, { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientProfile.css";

const IMAGE_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

const formatDateForInput = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const formatDateForDisplay = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
};
const calculateAge = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  if (isNaN(birthDate.getTime())) return "";

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
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
            {options.map((opt) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const lbl = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })}
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
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 PATIENT PROFILE COMPONENT LOADED");
    fetchProfile();
  }, []);
  const handlePhotoChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    // Preview image immediately
    const imageUrl =
      URL.createObjectURL(file);

    setDraft((prev) => ({
      ...prev,

      profileImage: imageUrl,

      profileImageFile: file
    }));
  };
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login/patient";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      console.log("ME RESPONSE:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch profile");
      }

      const backendProfile =
        result?.data?.profile ||
        result?.data?.patient ||
        result?.data;
      if (!backendProfile) {
        console.error("Patient profile missing from /api/auth/me", result);
        setProfile(null);
        return;
      }

      const formattedProfile = {
        fullName: backendProfile.name || "",
        email: backendProfile.email || result?.data?.email || "",
        phone: backendProfile.phone || "",
        dob: formatDateForInput(backendProfile.dob),
        age: calculateAge(backendProfile.dob),
        gender: backendProfile.gender || "",
        bloodGroup: backendProfile.bloodGroup || "Not Provided",
        city: backendProfile.city || "",
        address: backendProfile.address || "",

        isDonorAvailable:
          backendProfile.isDonorAvailable ?? false,

        profileImage: backendProfile.profileImage || "",

        allergies: Array.isArray(backendProfile.allergies)
          ? backendProfile.allergies.join(", ")
          : backendProfile.allergies || "",

        conditions: Array.isArray(backendProfile.chronicConditions)
          ? backendProfile.chronicConditions.join(", ")
          : Array.isArray(backendProfile.conditions)
            ? backendProfile.conditions.join(", ")
            : backendProfile.conditions || "",

        emergencyName:
          backendProfile.emergencyContact?.name ||
          backendProfile.emergencyName ||
          "",

        emergencyPhone:
          backendProfile.emergencyContact?.phone ||
          backendProfile.emergencyPhone ||
          "",

        emergencyRelation:
          backendProfile.emergencyContact?.relation ||
          backendProfile.emergencyRelation ||
          "",
      };

      setProfile(formattedProfile);
      setDraft(formattedProfile);

    } catch (error) {
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setDraft(profile);
    setEditMode(true);
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login/patient";
        return;
      }

      const formData = new FormData();

      formData.append("name", draft.fullName);
      formData.append("phone", draft.phone);
      formData.append("dob", draft.dob);
      formData.append("gender", draft.gender);
      formData.append("bloodGroup", draft.bloodGroup || "");
      formData.append("city", draft.city);
      formData.append("address", draft.address);

      // Medical information
      formData.append("allergies", draft.allergies || "");
      formData.append("chronicConditions", draft.conditions || "");

      // Emergency contact
      formData.append(
        "emergencyContact",
        JSON.stringify({
          name: draft.emergencyName || "",
          phone: draft.emergencyPhone || "",
          relation: draft.emergencyRelation || "",
        })
      );

      // Donor availability
      formData.append(
        "isDonorAvailable",
        String(draft.isDonorAvailable ?? false)
      );

      // Profile image
      if (draft.profileImageFile) {
        formData.append("profileImage", draft.profileImageFile);
      }

      const response = await fetch(
        `${API_BASE_URL}/patient/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      console.log("PROFILE UPDATED:", data);

      // Update frontend state with backend response
      const patient = data.data;

      const updatedProfile = {
        fullName: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
        dob: formatDateForInput(patient.dob),
        age: calculateAge(patient.dob),
        gender: patient.gender || "",
        bloodGroup: patient.bloodGroup || "Not Provided",
        city: patient.city || "",
        address: patient.address || "",

        allergies: Array.isArray(patient.allergies)
          ? patient.allergies.join(", ")
          : patient.allergies || "",

        conditions: Array.isArray(patient.chronicConditions)
          ? patient.chronicConditions.join(", ")
          : "",

        emergencyName: patient.emergencyContact?.name || "",
        emergencyPhone: patient.emergencyContact?.phone || "",
        emergencyRelation: patient.emergencyContact?.relation || "",

        profileImage: patient.profileImage || "",

        isDonorAvailable: patient.isDonorAvailable ?? false,
      };

      setProfile(updatedProfile);
      setDraft(updatedProfile);

      setEditMode(false);
      setSaved(true);
      toast.success("Profile updated successfully!");

      setTimeout(() => {
        setSaved(false);
      }, 3000);

    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditMode(false);
  };

  const data = editMode ? draft : profile;
  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }
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

                {data.profileImage ? (

                  <img
                    src={
                      data.profileImage.startsWith("blob:")
                        ? data.profileImage
                        : `${IMAGE_BASE}${data.profileImage}`
                    }
                    alt="Profile"
                    className="pp-avatar-image"
                  />

                ) : (

                  <FaUserCircle
                    className="pp-avatar-icon"
                  />

                )}

              </div>


              <label
                htmlFor="profileImage"
                className="pp-camera-btn"
                title="Change photo"
              >
                <FaCamera />
              </label>


              <input
                id="profileImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                disabled={!editMode}
                onChange={handlePhotoChange}
              />

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
                <span className="pp-stat-val">
                  {calculateAge(profile.dob) || "—"}
                </span>
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
                icon={<FaMapMarkerAlt />}
                label="City / District"
                name="city"
                value={data.city}
                editMode={editMode}
                onChange={handleChange}
              />
              <ProfileField
                icon={<FaEnvelope />}
                label="Email Address"
                name="email"
                value={data.email}
                type="email"
                editMode={false}
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
                value={
                  editMode
                    ? data.dob
                    : formatDateForDisplay(data.dob)
                }
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
                options={[
                  { value: "", label: "Not provided" },
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                ]}
              />
              <ProfileField
                icon={<FaHeartbeat />}
                label="Blood Donation Availability"
                name="isDonorAvailable"
                value={data.isDonorAvailable ? "Available" : "Not Available"}
                editMode={false}
                onChange={handleChange}
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
