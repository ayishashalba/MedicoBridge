import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaStethoscope, FaEye, FaEyeSlash, FaUpload, FaFileAlt } from "react-icons/fa";
import { FaHeartbeat } from "react-icons/fa";
import "./DoctorRegister.css";

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Gynecology & Obstetrics",
  "Hematology",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Other",
];

const INITIAL = {
  fullName: "",
  email: "",
  phone: "",
  medRegNumber: "",
  specialization: "",
  qualification: "",
  experience: "",
  hospitalName: "",
  consultationFee: "",
  address: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function DoctorRegister() {
  const navigate = useNavigate();
  const licenseInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [licenseFile, setLicenseFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFeeChange = (e) => {
    // Allow only digits and one decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setForm((prev) => ({ ...prev, consultationFee: val }));
    if (errors.consultationFee) setErrors((prev) => ({ ...prev, consultationFee: "" }));
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLicenseFile(file);
    if (errors.licenseFile) setErrors((prev) => ({ ...prev, licenseFile: "" }));
  };

  const validate = () => {
    const errs = {};

    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    else if (form.fullName.trim().length < 3) errs.fullName = "Full name must be at least 3 characters";

    if (!form.email) errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Please enter a valid email address";

    if (!form.phone) errs.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) errs.phone = "Please enter a valid phone number";

    if (!form.medRegNumber.trim()) errs.medRegNumber = "Medical registration number is required";

    if (!form.specialization) errs.specialization = "Please select a specialization";

    if (!form.qualification.trim()) errs.qualification = "Qualification is required";

    if (!form.experience) {
      errs.experience = "Years of experience is required";
    } else if (isNaN(form.experience) || Number(form.experience) < 0 || Number(form.experience) > 60) {
      errs.experience = "Please enter a valid number of years (0–60)";
    }

    if (!form.hospitalName.trim()) errs.hospitalName = "Hospital / Clinic name is required";

    if (!form.consultationFee) {
      errs.consultationFee = "Consultation fee is required";
    } else if (isNaN(form.consultationFee) || Number(form.consultationFee) <= 0) {
      errs.consultationFee = "Please enter a valid consultation fee";
    }

    if (!form.address.trim()) errs.address = "Address is required";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters long";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";

    if (!licenseFile) errs.licenseFile = "Medical license document is required";

    if (!form.acceptTerms) errs.acceptTerms = "You must accept the Terms & Conditions to register";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Doctor registration submitted:", form, licenseFile);
      navigate("/verify-email");
    }
  };

  return (
    <div className="doc-reg-page-wrapper">
      <div className="doc-reg-card-container">
        {/* Brand */}
        <Link to="/" className="doc-reg-brand">
          <div className="doc-reg-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="doc-reg-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="doc-reg-card">
          <div className="doc-reg-card-header">
            <div className="doc-reg-icon-circle">
              <FaStethoscope />
            </div>
            <h2>Create Doctor Account</h2>
            <p>Join MedicoBridge and connect with patients who need your expertise</p>
          </div>

          <form onSubmit={handleSubmit} className="doc-reg-form" noValidate>

            {/* ── Row 1: Full Name | Email ───────────────── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-fullName">Full Name</label>
                <input
                  type="text" id="dr-fullName" name="fullName"
                  className={`doc-reg-input ${errors.fullName ? "doc-reg-input-error" : ""}`}
                  placeholder="Dr. John Smith"
                  value={form.fullName} onChange={handleChange}
                />
                {errors.fullName && <span className="doc-reg-error-msg">{errors.fullName}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-email">Email Address</label>
                <input
                  type="email" id="dr-email" name="email"
                  className={`doc-reg-input ${errors.email ? "doc-reg-input-error" : ""}`}
                  placeholder="Enter your email address"
                  value={form.email} onChange={handleChange}
                />
                {errors.email && <span className="doc-reg-error-msg">{errors.email}</span>}
              </div>
            </div>

            {/* ── Row 2: Phone | Medical Reg Number ─────── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-phone">Phone Number</label>
                <input
                  type="tel" id="dr-phone" name="phone"
                  className={`doc-reg-input ${errors.phone ? "doc-reg-input-error" : ""}`}
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone} onChange={handleChange}
                />
                {errors.phone && <span className="doc-reg-error-msg">{errors.phone}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-medRegNumber">Medical Registration Number</label>
                <input
                  type="text" id="dr-medRegNumber" name="medRegNumber"
                  className={`doc-reg-input ${errors.medRegNumber ? "doc-reg-input-error" : ""}`}
                  placeholder="e.g. MCI-12345678"
                  value={form.medRegNumber} onChange={handleChange}
                />
                {errors.medRegNumber && <span className="doc-reg-error-msg">{errors.medRegNumber}</span>}
              </div>
            </div>

            {/* ── Row 3: Specialization | Qualification ─── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-specialization">Specialization</label>
                <select
                  id="dr-specialization" name="specialization"
                  className={`doc-reg-input doc-reg-select ${errors.specialization ? "doc-reg-input-error" : ""}`}
                  value={form.specialization} onChange={handleChange}
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.specialization && <span className="doc-reg-error-msg">{errors.specialization}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-qualification">Qualification</label>
                <input
                  type="text" id="dr-qualification" name="qualification"
                  className={`doc-reg-input ${errors.qualification ? "doc-reg-input-error" : ""}`}
                  placeholder="e.g. MBBS, MD, MS"
                  value={form.qualification} onChange={handleChange}
                />
                {errors.qualification && <span className="doc-reg-error-msg">{errors.qualification}</span>}
              </div>
            </div>

            {/* ── Row 4: Experience | Consultation Fee ──── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-experience">Years of Experience</label>
                <input
                  type="number" id="dr-experience" name="experience" min="0" max="60"
                  className={`doc-reg-input ${errors.experience ? "doc-reg-input-error" : ""}`}
                  placeholder="e.g. 5"
                  value={form.experience} onChange={handleChange}
                />
                {errors.experience && <span className="doc-reg-error-msg">{errors.experience}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-consultationFee">Consultation Fee (₹)</label>
                <input
                  type="text" id="dr-consultationFee" name="consultationFee"
                  inputMode="decimal"
                  className={`doc-reg-input ${errors.consultationFee ? "doc-reg-input-error" : ""}`}
                  placeholder="e.g. 500"
                  value={form.consultationFee} onChange={handleFeeChange}
                />
                {errors.consultationFee && <span className="doc-reg-error-msg">{errors.consultationFee}</span>}
              </div>
            </div>

            {/* ── Row 5: Hospital Name | Address ───────── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-hospitalName">Hospital / Clinic Name</label>
                <input
                  type="text" id="dr-hospitalName" name="hospitalName"
                  className={`doc-reg-input ${errors.hospitalName ? "doc-reg-input-error" : ""}`}
                  placeholder="Enter hospital or clinic name"
                  value={form.hospitalName} onChange={handleChange}
                />
                {errors.hospitalName && <span className="doc-reg-error-msg">{errors.hospitalName}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-address">Address</label>
                <input
                  type="text" id="dr-address" name="address"
                  className={`doc-reg-input ${errors.address ? "doc-reg-input-error" : ""}`}
                  placeholder="Enter your full address"
                  value={form.address} onChange={handleChange}
                />
                {errors.address && <span className="doc-reg-error-msg">{errors.address}</span>}
              </div>
            </div>

            {/* ── Row 6: Password | Confirm Password ───── */}
            <div className="doc-reg-grid-row">
              <div className="doc-reg-form-group">
                <label htmlFor="dr-password">Password</label>
                <div className="doc-reg-pw-wrapper">
                  <input
                    type={showPassword ? "text" : "password"} id="dr-password" name="password"
                    className={`doc-reg-input ${errors.password ? "doc-reg-input-error" : ""}`}
                    placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange}
                  />
                  <button type="button" className="doc-reg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="doc-reg-error-msg">{errors.password}</span>}
              </div>

              <div className="doc-reg-form-group">
                <label htmlFor="dr-confirmPassword">Confirm Password</label>
                <div className="doc-reg-pw-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"} id="dr-confirmPassword" name="confirmPassword"
                    className={`doc-reg-input ${errors.confirmPassword ? "doc-reg-input-error" : ""}`}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword} onChange={handleChange}
                  />
                  <button type="button" className="doc-reg-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="doc-reg-error-msg">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* ── Medical License Upload (full width) ───── */}
            <div className="doc-reg-form-group doc-reg-full-width">
              <label>Medical License Document</label>
              <div
                className={`doc-reg-upload-zone ${licenseFile ? "doc-reg-upload-filled" : ""} ${errors.licenseFile ? "doc-reg-upload-error" : ""}`}
                onClick={() => licenseInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && licenseInputRef.current?.click()}
              >
                <input
                  ref={licenseInputRef}
                  type="file"
                  id="dr-licenseFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="doc-reg-file-input"
                  onChange={handleLicenseChange}
                />
                {licenseFile ? (
                  <div className="doc-reg-upload-preview">
                    <FaFileAlt className="doc-reg-file-icon" />
                    <span className="doc-reg-file-name">{licenseFile.name}</span>
                    <span className="doc-reg-file-size">
                      ({(licenseFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <div className="doc-reg-upload-placeholder">
                    <FaUpload className="doc-reg-upload-icon" />
                    <span className="doc-reg-upload-text">
                      Click to upload Medical License
                    </span>
                    <span className="doc-reg-upload-hint">PDF, JPG, or PNG · Max 5 MB</span>
                  </div>
                )}
              </div>
              {errors.licenseFile && (
                <span className="doc-reg-error-msg">{errors.licenseFile}</span>
              )}
            </div>

            {/* ── Terms & Conditions ─────────────────────── */}
            <div className="doc-reg-terms-group">
              <label className={`doc-reg-terms-label ${errors.acceptTerms ? "doc-reg-terms-error" : ""}`}>
                <input
                  type="checkbox" name="acceptTerms"
                  checked={form.acceptTerms} onChange={handleChange}
                  className="doc-reg-checkbox"
                />
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

            {/* ── Submit ─────────────────────────────────── */}
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
