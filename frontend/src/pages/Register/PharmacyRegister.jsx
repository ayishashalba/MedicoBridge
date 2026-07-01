import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaPills,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaFileAlt,
} from "react-icons/fa";
import "./PharmacyRegister.css";

const PHARMACY_TYPES = ["Retail Pharmacy", "Hospital Pharmacy", "Wholesale Pharmacy"];

const INITIAL_FORM_STATE = {
  pharmacyName: "",
  licenseNumber: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pharmacyType: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function PharmacyRegister() {
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLicenseFile(file);
    if (errors.licenseFile) {
      setErrors((prev) => ({ ...prev, licenseFile: "" }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.pharmacyName.trim()) {
      errs.pharmacyName = "Pharmacy name is required";
    }
    if (!form.licenseNumber.trim()) {
      errs.licenseNumber = "License number is required";
    }
    if (!form.ownerName.trim()) {
      errs.ownerName = "Owner name is required";
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
    if (!form.address.trim()) {
      errs.address = "Address is required";
    }
    if (!form.city.trim()) {
      errs.city = "City is required";
    }
    if (!form.state.trim()) {
      errs.state = "State is required";
    }
    if (!form.pharmacyType) {
      errs.pharmacyType = "Please select a pharmacy type";
    }
    if (!licenseFile) {
      errs.licenseFile = "Pharmacy license is required";
    }
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
    if (!form.acceptTerms) {
      errs.acceptTerms = "You must accept the Terms & Conditions";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Pharmacy registration submitted:", form, { licenseFile });
      navigate("/verify-email", { state: { role: "pharmacy" } });
    }
  };

  const renderField = (name, label, type = "text", placeholder = "") => (
    <div className="ph-reg-form-group">
      <label htmlFor={`ph-reg-${name}`}>{label}</label>
      <input
        type={type}
        id={`ph-reg-${name}`}
        name={name}
        className={`ph-reg-input${errors[name] ? " ph-reg-input-error" : ""}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
      />
      {errors[name] && <span className="ph-reg-error-msg">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="ph-reg-page-wrapper">
      <div className="ph-reg-card-container">
        {/* Brand */}
        <Link to="/" className="ph-reg-brand">
          <div className="ph-reg-brand-icon-wrapper">
            <FaHeartbeat />
          </div>
          <span className="ph-reg-brand-title">MedicoBridge</span>
        </Link>

        {/* Card */}
        <div className="ph-reg-card">
          <div className="ph-reg-card-header">
            <div className="ph-reg-icon-circle">
              <FaPills />
            </div>
            <h2>Register Pharmacy</h2>
            <p>Join MedicoBridge to manage prescriptions, inventory, and deliver smart pharmacy care</p>
          </div>

          <form onSubmit={handleSubmit} className="ph-reg-form" noValidate>
            {/* ── Pharmacy Details ── */}
            <div className="ph-reg-grid-row">
              {renderField("pharmacyName", "Pharmacy Name", "text", "e.g. LifeCare Pharmacy")}
              {renderField("licenseNumber", "Pharmacy License Number", "text", "e.g. PH-LIC-789012")}
            </div>

            <div className="ph-reg-grid-row">
              {renderField("ownerName", "Owner Name", "text", "e.g. Dr. Ayesha Khan")}
              {renderField("email", "Email Address", "email", "e.g. owner@lifecarepharmacy.com")}
            </div>

            <div className="ph-reg-grid-row">
              {renderField("phone", "Phone Number", "tel", "e.g. 9876543210")}

              {/* Pharmacy Type Dropdown */}
              <div className="ph-reg-form-group">
                <label htmlFor="ph-reg-pharmacyType">Pharmacy Type</label>
                <select
                  id="ph-reg-pharmacyType"
                  name="pharmacyType"
                  className={`ph-reg-input ph-reg-select${errors.pharmacyType ? " ph-reg-input-error" : ""}`}
                  value={form.pharmacyType}
                  onChange={handleChange}
                >
                  <option value="">Select pharmacy type</option>
                  {PHARMACY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.pharmacyType && (
                  <span className="ph-reg-error-msg">{errors.pharmacyType}</span>
                )}
              </div>
            </div>

            {/* ── Location Details ── */}
            <div className="ph-reg-grid-row-full">
              {renderField("address", "Address", "text", "e.g. 45 Wellness Street, Sector 12")}
            </div>
            <div className="ph-reg-grid-row">
              {renderField("city", "City", "text", "e.g. Chennai")}
              {renderField("state", "State", "text", "e.g. Tamil Nadu")}
            </div>

            {/* ── License Upload ── */}
            <div className="ph-reg-form-group">
              <label>
                Pharmacy License <span className="ph-reg-required-badge">Required</span>
              </label>
              <div
                className={`ph-reg-upload-zone${licenseFile ? " ph-reg-upload-filled" : ""}${errors.licenseFile ? " ph-reg-upload-error" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="ph-reg-file-input"
                  onChange={handleFileChange}
                />
                {licenseFile ? (
                  <div className="ph-reg-upload-preview">
                    <FaFileAlt className="ph-reg-file-icon" />
                    <div className="ph-reg-upload-preview-details">
                      <span className="ph-reg-file-name">{licenseFile.name}</span>
                      <span className="ph-reg-file-size">
                        ({(licenseFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="ph-reg-upload-placeholder">
                    <FaUpload className="ph-reg-upload-icon" />
                    <span className="ph-reg-upload-text">Upload Pharmacy License</span>
                    <span className="ph-reg-upload-hint">PDF, JPG or PNG · Max 5 MB</span>
                  </div>
                )}
              </div>
              {errors.licenseFile && (
                <span className="ph-reg-error-msg">{errors.licenseFile}</span>
              )}
            </div>

            {/* ── Security ── */}
            <div className="ph-reg-grid-row">
              {/* Password */}
              <div className="ph-reg-form-group">
                <label htmlFor="ph-reg-password">Password</label>
                <div className="ph-reg-pw-wrapper">
                  <input
                    type={showPwd ? "text" : "password"}
                    id="ph-reg-password"
                    name="password"
                    className={`ph-reg-input${errors.password ? " ph-reg-input-error" : ""}`}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="ph-reg-eye-btn"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="ph-reg-error-msg">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="ph-reg-form-group">
                <label htmlFor="ph-reg-confirmPassword">Confirm Password</label>
                <div className="ph-reg-pw-wrapper">
                  <input
                    type={showConfirm ? "text" : "password"}
                    id="ph-reg-confirmPassword"
                    name="confirmPassword"
                    className={`ph-reg-input${errors.confirmPassword ? " ph-reg-input-error" : ""}`}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="ph-reg-eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="ph-reg-error-msg">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* ── Agreement Checkbox ── */}
            <div className="ph-reg-terms-group">
              <label
                className={`ph-reg-terms-label${errors.acceptTerms ? " ph-reg-terms-error" : ""}`}
              >
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  className="ph-reg-checkbox"
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="ph-reg-terms-link">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="ph-reg-terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="ph-reg-error-msg ph-reg-terms-err-msg">
                  {errors.acceptTerms}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="ph-reg-submit-btn">
              Register Pharmacy
            </button>
          </form>

          {/* Footer link to login */}
          <div className="ph-reg-footer">
            <p>
              Already have a pharmacy account?{" "}
              <Link to="/login/pharmacy" className="ph-reg-login-link">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PharmacyRegister;
