import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaCheck, FaPills, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaIdCard, FaClock, FaUserTie, FaFileAlt } from "react-icons/fa";
import "./PharmacyPages.css";

const defaultProfiles = {
  Retail: {
    name:         "MediCare Pharmacy",
    role:         "Chief Pharmacist",
    id:           "#PH-8841",
    email:        "retailpharmacy@gmail.com",
    phone:        "+91 98765 43210",
    address:      "14, Linking Road, Bandra West, Mumbai — 400050",
    license:      "DL-MH-2019-00441",
    gst:          "27AADCM1234E1Z5",
    owner:        "Dr. Keerthi Subramaniam",
    hours:        "Mon–Sat: 8:00 AM – 10:00 PM | Sun: 9:00 AM – 6:00 PM",
  },
  Hospital: {
    name:         "Apollo Hospital Pharmacy",
    role:         "Hospital Pharmacist",
    id:           "#HP-1201",
    email:        "hospitalpharmacy@gmail.com",
    phone:        "+91 22 2345 6789",
    address:      "Apollo Hospitals, Parsik Hill Road, Navi Mumbai — 400614",
    license:      "DL-MH-HOSP-2015-8812",
    gst:          "27AAACA1234F1Z9",
    owner:        "Dr. Rajiv Desai",
    hours:        "24/7",
  },
  Wholesale: {
    name:         "Medico Wholesale Distributors",
    role:         "Supply Manager",
    id:           "#WS-5002",
    email:        "wholesalepharmacy@gmail.com",
    phone:        "+91 99887 76655",
    address:      "Phase 2, MIDC, Andheri East, Mumbai — 400093",
    license:      "DL-MH-WHL-2010-0921",
    gst:          "27AAACM9876G1Z2",
    owner:        "Mr. Sanjay Patel",
    hours:        "Mon–Sat: 9:00 AM – 7:00 PM | Sun: Closed",
  }
};

export default function PharmacyProfile() {
  const pharmacyType = localStorage.getItem("pharmacyType") || "Retail";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfiles[pharmacyType]);

  useEffect(() => {
    const saved = localStorage.getItem(`pharmacyProfile_${pharmacyType}`);
    if (saved) {
      setForm(JSON.parse(saved));
    } else {
      setForm(defaultProfiles[pharmacyType]);
    }
  }, [pharmacyType]);

  const handleSave = () => {
    localStorage.setItem(`pharmacyProfile_${pharmacyType}`, JSON.stringify(form));
    setEditing(false);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaUserCircle /> {form.name} Profile</h2>
          <p className="ph-page-sub">Manage your {pharmacyType.toLowerCase()} pharmacy's information and details</p>
        </div>
        <button className="ph-btn-add" onClick={editing ? handleSave : () => setEditing(true)}>
          {editing ? <><FaCheck /> Save Changes</> : <><FaEdit /> Edit Profile</>}
        </button>
      </div>

      <div className="ph-profile-layout">
        {/* Profile Card */}
        <div className="ph-profile-banner">
          <div className="ph-profile-avatar-lg">
            <FaPills />
          </div>
          <div className="ph-profile-banner-info">
            <h3>{form.name}</h3>
            <span className="ph-id-badge" style={{ fontSize:"0.82rem" }}>{form.id}</span>
            <p className="ph-profile-type">{form.role}</p>
            <p className="ph-profile-lic">License: <strong>{form.license}</strong></p>
            <p className="ph-profile-est">Type: {pharmacyType} Pharmacy</p>
          </div>
        </div>

        <div className="ph-profile-grid">
          {/* Primary Info */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Primary Information</h4>
            <div className="ph-profile-field">
              <FaUserCircle className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Pharmacy Name</label>
                {editing ? (
                  <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.name}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaUserTie className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Role</label>
                {editing ? (
                  <input value={form.role} onChange={(e) => handleChange('role', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.role}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaUserTie className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Owner / Manager</label>
                {editing ? (
                  <input value={form.owner} onChange={(e) => handleChange('owner', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.owner}</span>}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Contact Information</h4>
            <div className="ph-profile-field">
              <FaPhone className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Phone</label>
                {editing ? (
                  <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.phone}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaEnvelope className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Email</label>
                {editing ? (
                  <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.email}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaMapMarkerAlt className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Address</label>
                {editing ? (
                  <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.address}</span>}
              </div>
            </div>
          </div>

          {/* Regulatory Info */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Regulatory Details</h4>
            <div className="ph-profile-field">
              <FaIdCard className="ph-field-icon" />
              <div className="ph-field-content">
                <label>License Number</label>
                {editing ? (
                  <input value={form.license} onChange={(e) => handleChange('license', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.license}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaFileAlt className="ph-field-icon" />
              <div className="ph-field-content">
                <label>GST Number</label>
                {editing ? (
                  <input value={form.gst} onChange={(e) => handleChange('gst', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.gst}</span>}
              </div>
            </div>
            <div className="ph-profile-field">
              <FaClock className="ph-field-icon" />
              <div className="ph-field-content">
                <label>Working Hours</label>
                {editing ? (
                  <input value={form.hours} onChange={(e) => handleChange('hours', e.target.value)} className="ph-inline-input" />
                ) : <span>{form.hours}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
