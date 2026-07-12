import React, { useState } from "react";
import { FaUserCircle, FaEdit, FaCheck, FaPills, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from "react-icons/fa";
import "./PharmacyPages.css";

const profileData = {
  name:         "MediCare Pharmacy",
  id:           "#PH-8841",
  license:      "DL-MH-2019-00441",
  type:         "Retail Pharmacy",
  phone:        "+91 98765 43210",
  email:        "info@medicarepharmacy.in",
  website:      "www.medicarepharmacy.in",
  address:      "14, Linking Road, Bandra West, Mumbai — 400050",
  established:  "2009",
  timings:      "Mon–Sat: 8:00 AM – 10:00 PM  |  Sun: 9:00 AM – 6:00 PM",
  pharmacist:   "Dr. Keerthi Subramaniam (Reg. No. PCI-MH-29341)",
  specialities: ["Prescription Medicines","OTC Products","Wellness & Vitamins","Baby Care","Surgical Supplies"],
  deliveryZones:["Bandra","Khar","Santacruz","Vile Parle","Andheri"],
};

export default function PharmacyProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ phone: profileData.phone, email: profileData.email, address: profileData.address, timings: profileData.timings });

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaUserCircle /> Pharmacy Profile</h2>
          <p className="ph-page-sub">Manage your pharmacy's public information and contact details</p>
        </div>
        <button className="ph-btn-add" onClick={() => setEditing((p) => !p)}>
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
            <h3>{profileData.name}</h3>
            <span className="ph-id-badge" style={{ fontSize:"0.82rem" }}>{profileData.id}</span>
            <p className="ph-profile-type">{profileData.type}</p>
            <p className="ph-profile-lic">License: <strong>{profileData.license}</strong></p>
            <p className="ph-profile-est">Est. {profileData.established}</p>
          </div>
        </div>

        <div className="ph-profile-grid">
          {/* Contact Info */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Contact Information</h4>
            <div className="ph-profile-field">
              <FaPhone className="ph-field-icon" />
              {editing ? (
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="ph-inline-input" />
              ) : <span>{form.phone}</span>}
            </div>
            <div className="ph-profile-field">
              <FaEnvelope className="ph-field-icon" />
              {editing ? (
                <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="ph-inline-input" />
              ) : <span>{form.email}</span>}
            </div>
            <div className="ph-profile-field">
              <FaGlobe className="ph-field-icon" />
              <span>{profileData.website}</span>
            </div>
            <div className="ph-profile-field">
              <FaMapMarkerAlt className="ph-field-icon" />
              {editing ? (
                <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="ph-inline-input" />
              ) : <span>{form.address}</span>}
            </div>
          </div>

          {/* Timings */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Operating Hours</h4>
            {editing ? (
              <input value={form.timings} onChange={(e) => setForm((p) => ({ ...p, timings: e.target.value }))} className="ph-inline-input" style={{ width:"100%" }} />
            ) : <p className="ph-profile-text">{form.timings}</p>}
            <h4 className="ph-section-title" style={{ marginTop:"1.5rem" }}>Chief Pharmacist</h4>
            <p className="ph-profile-text">{profileData.pharmacist}</p>
          </div>

          {/* Specialities */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Specialities & Products</h4>
            <div className="ph-tag-list">
              {profileData.specialities.map((s) => <span key={s} className="ph-tag ph-tag--teal">{s}</span>)}
            </div>
          </div>

          {/* Delivery Zones */}
          <div className="ph-card ph-profile-section">
            <h4 className="ph-section-title">Delivery Zones</h4>
            <div className="ph-tag-list">
              {profileData.deliveryZones.map((z) => <span key={z} className="ph-tag">{z}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
