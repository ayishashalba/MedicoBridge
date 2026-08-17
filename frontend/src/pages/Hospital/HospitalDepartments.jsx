import React, { useState } from "react";
import {
  FaBuilding,
  FaSearch,
  FaUserMd,
  FaBed,
  FaUsers,
  FaPlus,
  FaCheckCircle,
  FaStethoscope,
  FaPhoneAlt,
  FaEllipsisV
} from "react-icons/fa";
import "./HospitalDepartments.css";

const initialDepartments = [
  {
    id: "DEP-101",
    name: "Cardiology",
    head: "Dr. Ayisha Shalba",
    doctorsCount: 8,
    bedsCount: 28,
    patientsCount: 64,
    phone: "+91 44 2234 5681",
    status: "Active",
    description: "Advanced cardiac care, ECG, echo, catheterization lab, and post-op CCU."
  },
  {
    id: "DEP-102",
    name: "Pediatrics & Neonatology",
    head: "Dr. Neha Gokhale",
    doctorsCount: 6,
    bedsCount: 20,
    patientsCount: 42,
    phone: "+91 44 2234 5682",
    status: "Active",
    description: "Child health, immunization, NICU, pediatric emergency, and adolescent clinic."
  },
  {
    id: "DEP-103",
    name: "Orthopedics & Joint Care",
    head: "Dr. Vikram Batra",
    doctorsCount: 5,
    bedsCount: 24,
    patientsCount: 38,
    phone: "+91 44 2234 5683",
    status: "Active",
    description: "Joint replacement, fracture treatment, arthroscopy, and physiotherapy rehab."
  },
  {
    id: "DEP-104",
    name: "General Medicine & Internal Care",
    head: "Dr. Sara Thomas",
    doctorsCount: 10,
    bedsCount: 35,
    patientsCount: 92,
    phone: "+91 44 2234 5684",
    status: "Active",
    description: "Comprehensive adult medical diagnosis, chronic illness management, and fever clinic."
  },
  {
    id: "DEP-105",
    name: "Emergency & Critical Care (ICU)",
    head: "Dr. Sandeep Reddy",
    doctorsCount: 7,
    bedsCount: 16,
    patientsCount: 14,
    phone: "+91 44 2234 5685",
    status: "Active",
    description: "24/7 Level-1 trauma care, ventilator support, resuscitation, and emergency triage."
  },
  {
    id: "DEP-106",
    name: "Oncology",
    head: "Dr. K. Ramanathan",
    doctorsCount: 4,
    bedsCount: 18,
    patientsCount: 29,
    phone: "+91 44 2234 5686",
    status: "Active",
    description: "Medical and surgical oncology, day-care chemotherapy unit, and palliative care."
  }
];

export default function HospitalDepartments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({
    name: "",
    head: "",
    doctorsCount: "",
    bedsCount: "",
    phone: "",
    description: ""
  });

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newDept.name) return;

    const created = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      name: newDept.name,
      head: newDept.head || "To be assigned",
      doctorsCount: Number(newDept.doctorsCount) || 1,
      bedsCount: Number(newDept.bedsCount) || 10,
      patientsCount: 0,
      phone: newDept.phone || "+91 44 2234 5600",
      status: "Active",
      description: newDept.description || "General hospital medical division."
    };

    setDepartments([created, ...departments]);
    setShowAddModal(false);
    setNewDept({ name: "", head: "", doctorsCount: "", bedsCount: "", phone: "", description: "" });
  };

  return (
    <div className="hosp-dept-page">
      <div className="hosp-dept-header">
        <div>
          <h2 className="hosp-dept-title">
            <FaBuilding style={{ color: "var(--primary-color, #4f46e5)" }} /> Hospital Departments
          </h2>
          <p className="hosp-dept-subtitle">
            Manage medical divisions, department heads, staffing allocation, and bed capacity
          </p>
        </div>
        <button className="hosp-dept-add-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="hosp-dept-controls">
        <div className="hosp-dept-search">
          <FaSearch className="hosp-dept-search-icon" />
          <input
            type="text"
            placeholder="Search departments by name, head of department, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="hosp-dept-grid">
        {filtered.length === 0 ? (
          <div className="hosp-dept-empty">
            <FaBuilding style={{ fontSize: "2.5rem", color: "#cbd5e1", marginBottom: "0.75rem" }} />
            <h3>No departments found</h3>
            <p>Try searching with another keyword.</p>
          </div>
        ) : (
          filtered.map((dept) => (
            <div key={dept.id} className="hosp-dept-card">
              <div className="hosp-dept-card-top">
                <div>
                  <span className="hosp-dept-id">{dept.id}</span>
                  <h3 className="hosp-dept-card-name">{dept.name}</h3>
                </div>
                <span className="hosp-dept-status-badge">{dept.status}</span>
              </div>

              <p className="hosp-dept-desc">{dept.description}</p>

              <div className="hosp-dept-head-info">
                <FaStethoscope className="hosp-dept-head-icon" />
                <div>
                  <span className="hosp-dept-head-lbl">Head of Department:</span>
                  <strong>{dept.head}</strong>
                </div>
              </div>

              <div className="hosp-dept-stats">
                <div className="hosp-dept-stat">
                  <FaUserMd />
                  <span><strong>{dept.doctorsCount}</strong> Doctors</span>
                </div>
                <div className="hosp-dept-stat">
                  <FaBed />
                  <span><strong>{dept.bedsCount}</strong> Beds</span>
                </div>
                <div className="hosp-dept-stat">
                  <FaUsers />
                  <span><strong>{dept.patientsCount}</strong> Active Inpatients</span>
                </div>
              </div>

              <div className="hosp-dept-card-footer">
                <span className="hosp-dept-phone">
                  <FaPhoneAlt /> {dept.phone}
                </span>
                <button
                  className="hosp-dept-action-btn"
                  onClick={() => alert(`Managing settings for ${dept.name} department`)}
                >
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="hosp-dept-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="hosp-dept-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-dept-modal-header">
              <h3>Add New Hospital Department</h3>
              <button className="hosp-dept-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="hosp-dept-modal-body">
                <div className="hosp-dept-form-group">
                  <label>Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dermatology & Cosmetology"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  />
                </div>
                <div className="hosp-dept-form-group">
                  <label>Head of Department (Lead Physician)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={newDept.head}
                    onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="hosp-dept-form-group">
                    <label>Allocated Doctors</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={newDept.doctorsCount}
                      onChange={(e) => setNewDept({ ...newDept, doctorsCount: e.target.value })}
                    />
                  </div>
                  <div className="hosp-dept-form-group">
                    <label>Assigned Beds</label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={newDept.bedsCount}
                      onChange={(e) => setNewDept({ ...newDept, bedsCount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="hosp-dept-form-group">
                  <label>Direct Extension / Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 44 2234 5689"
                    value={newDept.phone}
                    onChange={(e) => setNewDept({ ...newDept, phone: e.target.value })}
                  />
                </div>
                <div className="hosp-dept-form-group">
                  <label>Description / Specialization Scope</label>
                  <textarea
                    rows="3"
                    placeholder="Scope of clinical care and diagnostic facilities provided..."
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="hosp-dept-modal-footer">
                <button type="submit" className="hosp-dept-submit-btn">Create Department</button>
                <button type="button" className="hosp-dept-cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
