import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaHospital,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import "./HospitalRegister.css";

const HOSPITAL_TYPES = ["Government", "Private", "Trust / NGO"];

const DEPARTMENTS_LIST = [
  "Accident & Emergency",
  "Anesthesiology",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Gynecology & Obstetrics",
  "ICU / Critical Care",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology",
];

const INITIAL_FORM_STATE = {
  hospitalName: "",
  regNumber: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  hospitalType: "",
  departments: [],
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function HospitalRegister() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [licenseFile, setLicenseFile] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectDepartment = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    if (!form.departments.includes(selectedValue)) {
      setForm((prev) => ({
        ...prev,
        departments: [...prev.departments, selectedValue],
      }));
      if (errors.departments) {
        setErrors((prev) => ({ ...prev, departments: "" }));
      }
    }
    // Reset dropdown selector
    e.target.value = "";
  };

  const handleRemoveDepartment = (deptToRemove) => {
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.filter((dept) => dept !== deptToRemove),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLicenseFile(file);
    if (errors.licenseFile) {
      setErrors((prev) => ({ ...prev, licenseFile: "" }));
    }
  };

  const validate = () => {
    const errs = {};

    // Basic Details
    if (!form.hospitalName.trim()) {
      errs.hospitalName = "Hospital name is required";
    }
    if (!form.regNumber.trim()) {
      errs.regNumber = "Registration number is required";
    }
    if (!form.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^\d+$/.test(form.phone.replace(/\s/g, ""))) {
      errs.phone = "Phone number must contain digits only";
    }

    // Location Details
    if (!form.address.trim()) {
      errs.address = "Address is required";
    }
    if (!form.city.trim()) {
      errs.city = "City is required";
    }
    if (!form.state.trim()) {
      errs.state = "State is required";
    }

    // Hospital Info
    if (!form.hospitalType) {
      errs.hospitalType = "Please select hospital type";
    }
    if (form.departments.length === 0) {
      errs.departments = "Please select at least one department";
    }

    // Compliance
    if (!licenseFile) {
      errs.licenseFile = "Medical license is required";
    }

    // Security
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
    }

    // Agreement
    if (!form.acceptTerms) {
      errs.acceptTerms = "You must accept the Terms & Conditions";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Hospital registration submitted:", form, { licenseFile });
      // Navigate to OTP page, passing hospital role in state
      navigate("/verify-email", { state: { role: "hospital" } });
    }
  };

  const renderField = (name, label, type = "text", placeholder = "") => (
    <div className="hosp-reg-form-group">
      <label htmlFor={`hosp-reg-${name}`}>{label}</label>
      <input
        type={type}
        id={`hosp-reg-${name}`}
        name={name}
        className={`hosp-reg-input${errors[name] ? " hosp-reg-input-error" : ""}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
      />
      {errors[name] && <span className="hosp-reg-error-msg">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="hosp-reg-page-wrapper">
      <div className="hosp-reg-card-container">
        {/* Brand */}
        <Link to="/" className="hosp-reg-brand">
          <div className="hosp-reg-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="hosp-reg-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="hosp-reg-card">
          <div className="hosp-reg-card-header">
            <div className="hosp-reg-icon-circle">
              <FaHospital />
            </div>
            <h2>Register Hospital</h2>
            <p>Join MedicoBridge to manage wards, admissions, staff, and provide smart care</p>
          </div>

          <form onSubmit={handleSubmit} className="hosp-reg-form" noValidate>
            {/* ── Basic Details Section ── */}
            <div className="hosp-reg-grid-row">
              {renderField("hospitalName", "Hospital Name", "text", "e.g. City General Hospital")}
              {renderField("regNumber", "Hospital Registration Number", "text", "e.g. REG-123456")}
            </div>

            <div className="hosp-reg-grid-row">
              {renderField("email", "Email Address", "email", "e.g. contact@cityhospital.com")}
              {renderField("phone", "Phone Number", "tel", "e.g. 9876543210")}
            </div>

            {/* ── Location Details Section ── */}
            <div className="hosp-reg-grid-row-full">
              {renderField("address", "Address", "text", "e.g. 123 Healthcare Blvd, Sector 4")}
            </div>
            <div className="hosp-reg-grid-row">
              {renderField("city", "City", "text", "e.g. Mumbai")}
              {renderField("state", "State", "text", "e.g. Maharashtra")}
            </div>

            {/* ── Hospital Info Section ── */}
            <div className="hosp-reg-grid-row">
              {/* Hospital Type Dropdown */}
              <div className="hosp-reg-form-group">
                <select
                  id="hosp-reg-hospitalType"
                  name="hospitalType"
                  className={`hosp-reg-input hosp-reg-select${errors.hospitalType ? " hosp-reg-input-error" : ""
                    }`}
                  value={form.hospitalType}
                  onChange={handleChange}
                >
                  <option value="">Select hospital type</option>
                  {HOSPITAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.hospitalType && (
                  <span className="hosp-reg-error-msg">{errors.hospitalType}</span>
                )}
              </div>

              {/* Number of Beds */}

            </div>

            {/* Departments Multi-select UI */}
            <div className="hosp-reg-form-group hosp-reg-full-width">
              <select
                id="hosp-reg-departments-select"
                className={`hosp-reg-input hosp-reg-select${errors.departments ? " hosp-reg-input-error" : ""
                  }`}
                onChange={handleSelectDepartment}
                defaultValue=""
              >
                <option value="">Choose department(s)</option>
                {DEPARTMENTS_LIST.map((dept) => (
                  <option
                    key={dept}
                    value={dept}
                    disabled={form.departments.includes(dept)}
                  >
                    {dept}
                  </option>
                ))}
              </select>
              {errors.departments && (
                <span className="hosp-reg-error-msg">{errors.departments}</span>
              )}

              {/* Render Selected Department Pills */}
              {form.departments.length > 0 && (
                <div className="hosp-reg-tags-container">
                  {form.departments.map((dept) => (
                    <span key={dept} className="hosp-reg-tag">
                      {dept}
                      <button
                        type="button"
                        className="hosp-reg-tag-remove"
                        onClick={() => handleRemoveDepartment(dept)}
                        aria-label={`Remove ${dept}`}
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Compliance Section ── */}
            <div className="hosp-reg-grid-row">
              {/* Medical License Upload (UI only) */}
              <div className="hosp-reg-form-group">
                <label>
                  Medical License <span className="hosp-reg-required-badge">Required</span>
                </label>
                <div
                  className={`hosp-reg-upload-zone${licenseFile ? " hosp-reg-upload-filled" : ""
                    }${errors.licenseFile ? " hosp-reg-upload-error" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hosp-reg-file-input"
                    onChange={handleFileChange}
                  />
                  {licenseFile ? (
                    <div className="hosp-reg-upload-preview">
                      <FaFileAlt className="hosp-reg-file-icon" />
                      <div className="hosp-reg-upload-preview-details">
                        <span className="hosp-reg-file-name">{licenseFile.name}</span>
                        <span className="hosp-reg-file-size">
                          {" "}
                          ({(licenseFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="hosp-reg-upload-placeholder">
                      <FaUpload className="hosp-reg-upload-icon" />
                      <span className="hosp-reg-upload-text">Upload Medical License</span>
                      <span className="hosp-reg-upload-hint">PDF, JPG or PNG · Max 5 MB</span>
                    </div>
                  )}
                </div>
                {errors.licenseFile && (
                  <span className="hosp-reg-error-msg">{errors.licenseFile}</span>
                )}
              </div>
            </div>

            {/* ── Security Section ── */}
            <div className="hosp-reg-grid-row">
              {/* Password */}
              <div className="hosp-reg-form-group">
                <label htmlFor="hosp-reg-password">Password</label>
                <div className="hosp-reg-pw-wrapper">
                  <input
                    type={showPwd ? "text" : "password"}
                    id="hosp-reg-password"
                    name="password"
                    className={`hosp-reg-input${errors.password ? " hosp-reg-input-error" : ""}`}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="hosp-reg-eye-btn"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="hosp-reg-error-msg">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="hosp-reg-form-group">
                <label htmlFor="hosp-reg-confirmPassword">Confirm Password</label>
                <div className="hosp-reg-pw-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="hosp-reg-confirmPassword"
                    name="confirmPassword"
                    className={`hosp-reg-input${errors.confirmPassword ? " hosp-reg-input-error" : ""
                      }`}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="hosp-reg-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="hosp-reg-error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* ── Agreement checkbox ── */}
            <div className="hosp-reg-terms-group">
              <label
                className={`hosp-reg-terms-label${errors.acceptTerms ? " hosp-reg-terms-error" : ""}`}
              >
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  className="hosp-reg-checkbox"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="hosp-reg-terms-link">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="hosp-reg-terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="hosp-reg-error-msg hosp-reg-terms-err-msg">
                  {errors.acceptTerms}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="hosp-reg-submit-btn">
              Register Hospital
            </button>
          </form>

          {/* Footer link to login */}
          <div className="hosp-reg-footer">
            <p>
              Already have a hospital account?{" "}
              <Link to="/login/hospital" className="hosp-reg-login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalRegister;
