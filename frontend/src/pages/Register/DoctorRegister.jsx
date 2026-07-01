import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat, FaStethoscope, FaEye, FaEyeSlash,
  FaUpload, FaFileAlt, FaHospital, FaMedkit, FaCamera, FaUser,
} from "react-icons/fa";
import "./DoctorRegister.css";

const SPECIALIZATIONS = [
  "General Medicine", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "General Surgery", "Gynecology & Obstetrics",
  "Hematology", "Internal Medicine", "Nephrology", "Neurology",
  "Neurosurgery", "Oncology", "Ophthalmology", "Orthopedics",
  "Otolaryngology (ENT)", "Pediatrics", "Psychiatry", "Pulmonology",
  "Radiology", "Rheumatology", "Urology", "Other",
];

const INITIAL = {
  fullName: "", email: "", phone: "", gender: "",
  medRegNumber: "", specialization: "", qualification: "", experience: "",
  practiceType: "hospital",
  // Hospital fields
  hospitalName: "", branchLocation: "", department: "",
  // Clinic fields
  clinicName: "", clinicAddress: "", clinicCity: "", clinicState: "", clinicPincode: "",
  // Account
  password: "", confirmPassword: "",
  acceptTerms: false,
};

function DoctorRegister() {
  const navigate = useNavigate();
  const licenseRef = useRef(null);
  const photoRef   = useRef(null);

  const [form, setForm]               = useState(INITIAL);
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors]           = useState({});

  /* ── Change handlers ─────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleLicense = (e) => {
    const f = e.target.files?.[0] || null;
    setLicenseFile(f);
    if (errors.licenseFile) setErrors(prev => ({ ...prev, licenseFile: "" }));
  };

  const handlePhoto = (e) => {
    const f = e.target.files?.[0] || null;
    setPhotoFile(f);
    if (f) setPhotoPreview(URL.createObjectURL(f));
    else   setPhotoPreview(null);
  };

  /* ── Validation ──────────────────────────────────────── */
  const validate = () => {
    const errs = {};

    // Personal
    if (!form.fullName.trim())           errs.fullName = "Full name is required";
    else if (form.fullName.trim().length < 3) errs.fullName = "Must be at least 3 characters";
    if (!form.email)                     errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Please enter a valid email";
    if (!form.phone)                     errs.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) errs.phone = "Enter a valid 10-digit phone number";
    if (!form.gender)                    errs.gender = "Please select your gender";

    // Professional
    if (!form.medRegNumber.trim())       errs.medRegNumber = "Medical registration number is required";
    if (!form.specialization)            errs.specialization = "Please select a specialization";
    if (!form.qualification.trim())      errs.qualification = "Qualification is required";
    if (!form.experience)                errs.experience = "Years of experience is required";
    else if (isNaN(form.experience) || +form.experience < 0 || +form.experience > 60)
      errs.experience = "Enter a valid number (0–60)";

    // Practice
    if (form.practiceType === "hospital") {
      if (!form.hospitalName.trim())     errs.hospitalName    = "Hospital name is required";
      if (!form.branchLocation.trim())   errs.branchLocation  = "Branch location is required";
      if (!form.department.trim())       errs.department      = "Department is required";
    } else {
      if (!form.clinicName.trim())       errs.clinicName      = "Clinic name is required";
      if (!form.clinicAddress.trim())    errs.clinicAddress   = "Clinic address is required";
      if (!form.clinicCity.trim())       errs.clinicCity      = "City is required";
      if (!form.clinicState.trim())      errs.clinicState     = "State is required";
      if (!form.clinicPincode.trim())    errs.clinicPincode   = "Pincode is required";
      else if (!/^\d{6}$/.test(form.clinicPincode)) errs.clinicPincode = "Enter a valid 6-digit pincode";
    }

    // Account
    if (!form.password)                  errs.password = "Password is required";
    else if (form.password.length < 6)   errs.password = "Minimum 6 characters";
    if (!form.confirmPassword)           errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";

    // Verification
    if (!licenseFile)                    errs.licenseFile = "Medical license is required";

    // Terms
    if (!form.acceptTerms)               errs.acceptTerms = "You must accept the Terms & Conditions";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Doctor registration submitted:", form, { licenseFile, photoFile });
      navigate("/verify-email");
    }
  };

  /* ── Helpers ─────────────────────────────────────────── */
  const fld = (name, label, type = "text", placeholder = "") => (
    <div className="doc-reg-form-group">
      <label htmlFor={`dr-${name}`}>{label}</label>
      <input
        type={type} id={`dr-${name}`} name={name}
        className={`doc-reg-input${errors[name] ? " doc-reg-input-error" : ""}`}
        placeholder={placeholder}
        value={form[name]} onChange={handleChange}
      />
      {errors[name] && <span className="doc-reg-error-msg">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="doc-reg-page-wrapper">
      <div className="doc-reg-card-container">

        {/* Brand */}
        <Link to="/" className="doc-reg-brand">
          <div className="doc-reg-brand-icon-wrapper"><FaHeartbeat /></div>
          <span className="doc-reg-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="doc-reg-card">

          {/* Header */}
          <div className="doc-reg-card-header">
            <div className="doc-reg-icon-circle"><FaStethoscope /></div>
            <h2>Create Doctor Account</h2>
            <p>Join MedicoBridge and connect with patients who need your expertise</p>
          </div>

          <form onSubmit={handleSubmit} className="doc-reg-form" noValidate>

            {/* Profile Photo Upload at the Top */}
            <div className="doc-reg-avatar-section">
              <div
                className={`doc-reg-photo-zone${photoFile ? " doc-reg-upload-filled" : ""}`}
                onClick={() => photoRef.current?.click()}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && photoRef.current?.click()}
              >
                <input ref={photoRef} type="file" accept=".jpg,.jpeg,.png,.webp"
                  className="doc-reg-file-input" onChange={handlePhoto} />
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="doc-reg-photo-preview" />
                ) : (
                  <div className="doc-reg-upload-placeholder">
                    <div className="doc-reg-photo-icon-wrapper">
                      <FaUser className="doc-reg-photo-placeholder-icon" />
                      <FaCamera className="doc-reg-photo-camera" />
                    </div>
                    <span className="doc-reg-upload-text">Upload Photo</span>
                    <span className="doc-reg-upload-hint">JPG, PNG or WebP</span>
                  </div>
                )}
              </div>
            </div>

            {/* ══ SECTION 1 — Personal Details ════════════ */}
            <div className="doc-reg-section">
              <div className="doc-reg-section-title">
                <span className="doc-reg-section-num">1</span>
                Personal Details
              </div>

              <div className="doc-reg-grid-row">
                {fld("fullName", "Full Name", "text", "Dr. Jane Smith")}
                {fld("email", "Email Address", "email", "doctor@example.com")}
              </div>

              <div className="doc-reg-grid-row">
                {fld("phone", "Phone Number", "tel", "e.g. 9876543210")}

                {/* Gender — pill radio */}
                <div className="doc-reg-form-group">
                  <label>Gender</label>
                  <div className={`doc-reg-pill-group${errors.gender ? " doc-reg-pill-group-error" : ""}`}>
                    {["Male", "Female", "Other"].map(g => (
                      <label
                        key={g}
                        className={`doc-reg-pill${form.gender === g ? " doc-reg-pill-active" : ""}`}
                      >
                        <input
                          type="radio" name="gender" value={g}
                          checked={form.gender === g} onChange={handleChange}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                  {errors.gender && <span className="doc-reg-error-msg">{errors.gender}</span>}
                </div>
              </div>
            </div>

            {/* ══ SECTION 2 — Professional Details ════════ */}
            <div className="doc-reg-section">
              <div className="doc-reg-section-title">
                <span className="doc-reg-section-num">2</span>
                Professional Details
              </div>

              <div className="doc-reg-grid-row">
                {fld("medRegNumber", "Medical Registration Number", "text", "e.g. MCI-12345678")}

                <div className="doc-reg-form-group">
                  <label htmlFor="dr-specialization">Specialization</label>
                  <select
                    id="dr-specialization" name="specialization"
                    className={`doc-reg-input doc-reg-select${errors.specialization ? " doc-reg-input-error" : ""}`}
                    value={form.specialization} onChange={handleChange}
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.specialization && <span className="doc-reg-error-msg">{errors.specialization}</span>}
                </div>
              </div>

              <div className="doc-reg-grid-row">
                {fld("qualification", "Qualification", "text", "e.g. MBBS, MD, MS")}
                {fld("experience", "Years of Experience", "number", "e.g. 5")}
              </div>
            </div>

            {/* ══ SECTION 3 — Practice Type ════════════════ */}
            <div className="doc-reg-section">
              <div className="doc-reg-section-title">
                <span className="doc-reg-section-num">3</span>
                Practice Type
              </div>

              {/* Hospital / Clinic radio cards */}
              <div className="doc-reg-practice-row">
                {[
                  { val: "hospital", Icon: FaHospital, label: "Hospital" },
                  { val: "clinic",   Icon: FaMedkit,   label: "Clinic"   },
                ].map(({ val, Icon, label }) => (
                  <label
                    key={val}
                    className={`doc-reg-practice-card${form.practiceType === val ? " doc-reg-practice-active" : ""}`}
                  >
                    <input
                      type="radio" name="practiceType" value={val}
                      checked={form.practiceType === val} onChange={handleChange}
                    />
                    <Icon className="doc-reg-practice-icon" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {/* Conditional — Hospital */}
              {form.practiceType === "hospital" && (
                <div className="doc-reg-conditional">
                  <div className="doc-reg-grid-row">
                    {fld("hospitalName",  "Hospital Name",        "text", "Enter hospital name")}
                    {fld("branchLocation","Branch Location (City)","text", "e.g. Mumbai")}
                  </div>
                  <div className="doc-reg-grid-row-1">
                    {fld("department", "Department", "text", "e.g. Cardiology, ICU")}
                  </div>
                </div>
              )}

              {/* Conditional — Clinic */}
              {form.practiceType === "clinic" && (
                <div className="doc-reg-conditional">
                  <div className="doc-reg-grid-row">
                    {fld("clinicName",    "Clinic Name",    "text", "Enter clinic name")}
                    {fld("clinicAddress", "Clinic Address", "text", "Street / Building")}
                  </div>
                  <div className="doc-reg-grid-row-3">
                    {fld("clinicCity",    "City",    "text", "e.g. Bangalore")}
                    {fld("clinicState",   "State",   "text", "e.g. Karnataka")}
                    {fld("clinicPincode", "Pincode", "text", "6-digit pincode")}
                  </div>
                </div>
              )}
            </div>

            {/* ══ SECTION 4 — Account Details ══════════════ */}
            <div className="doc-reg-section">
              <div className="doc-reg-section-title">
                <span className="doc-reg-section-num">4</span>
                Account Details
              </div>

              <div className="doc-reg-grid-row">
                {/* Password */}
                <div className="doc-reg-form-group">
                  <label htmlFor="dr-password">Password</label>
                  <div className="doc-reg-pw-wrapper">
                    <input
                      type={showPwd ? "text" : "password"} id="dr-password" name="password"
                      className={`doc-reg-input${errors.password ? " doc-reg-input-error" : ""}`}
                      placeholder="Min. 6 characters"
                      value={form.password} onChange={handleChange}
                    />
                    <button type="button" className="doc-reg-eye-btn"
                      onClick={() => setShowPwd(!showPwd)}
                      aria-label={showPwd ? "Hide password" : "Show password"}>
                      {showPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span className="doc-reg-error-msg">{errors.password}</span>}
                </div>

                {/* Confirm Password */}
                <div className="doc-reg-form-group">
                  <label htmlFor="dr-confirmPassword">Confirm Password</label>
                  <div className="doc-reg-pw-wrapper">
                    <input
                      type={showConfirm ? "text" : "password"} id="dr-confirmPassword" name="confirmPassword"
                      className={`doc-reg-input${errors.confirmPassword ? " doc-reg-input-error" : ""}`}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword} onChange={handleChange}
                    />
                    <button type="button" className="doc-reg-eye-btn"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}>
                      {showConfirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="doc-reg-error-msg">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            {/* ══ SECTION 5 — Verification ══════════════════ */}
            <div className="doc-reg-section">
              <div className="doc-reg-section-title">
                <span className="doc-reg-section-num">5</span>
                Verification
              </div>

              <div className="doc-reg-form-group">
                <label>
                  Medical License <span className="doc-reg-required-badge">Required</span>
                </label>
                <div
                  className={`doc-reg-upload-zone${licenseFile ? " doc-reg-upload-filled" : ""}${errors.licenseFile ? " doc-reg-upload-error" : ""}`}
                  onClick={() => licenseRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && licenseRef.current?.click()}
                >
                  <input ref={licenseRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                    className="doc-reg-file-input" onChange={handleLicense} />
                  {licenseFile ? (
                    <div className="doc-reg-upload-preview">
                      <FaFileAlt className="doc-reg-file-icon" />
                      <div>
                        <span className="doc-reg-file-name">{licenseFile.name}</span>
                        <span className="doc-reg-file-size"> ({(licenseFile.size/1024).toFixed(1)} KB)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="doc-reg-upload-placeholder">
                      <FaUpload className="doc-reg-upload-icon" />
                      <span className="doc-reg-upload-text">Upload Medical License</span>
                      <span className="doc-reg-upload-hint">PDF, JPG or PNG · Max 5 MB</span>
                    </div>
                  )}
                </div>
                {errors.licenseFile && <span className="doc-reg-error-msg">{errors.licenseFile}</span>}
              </div>
            </div>

            {/* ══ SECTION 6 — Agreement ═════════════════════ */}
            <div className="doc-reg-terms-group">
              <label className={`doc-reg-terms-label${errors.acceptTerms ? " doc-reg-terms-error" : ""}`}>
                <input type="checkbox" name="acceptTerms"
                  checked={form.acceptTerms} onChange={handleChange}
                  className="doc-reg-checkbox" />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="doc-reg-terms-link">Terms &amp; Conditions</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="doc-reg-terms-link">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="doc-reg-error-msg doc-reg-terms-err-msg">{errors.acceptTerms}</span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="doc-reg-submit-btn">
              Create Doctor Account
            </button>
          </form>

          {/* Footer */}
          <div className="doc-reg-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login/doctor" className="doc-reg-login-link">Login as Doctor</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;
