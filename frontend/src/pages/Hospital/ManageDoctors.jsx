import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaUserMd,
  FaPlus,
  FaPhoneAlt,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import "./ManageDoctors.css";

const initialDoctors = [
  {
    id: "DR-80241",
    name: "Dr. Ayisha Shalba",
    specialty: "Cardiology",
    email: "ayisha.shalba@medicobridge.com",
    phone: "+91 98765 43210",
    status: "Available",
    avatarBg: "#0d9488",
    patientsCount: 8,
  },
  {
    id: "DR-80242",
    name: "Dr. Rajesh K. Nair",
    specialty: "Neurology",
    email: "rajesh.nair@medicobridge.com",
    phone: "+91 98765 43211",
    status: "In Surgery",
    avatarBg: "#8b5cf6",
    patientsCount: 4,
  },
  {
    id: "DR-80243",
    name: "Dr. Priya Thomas",
    specialty: "Pediatrics",
    email: "priya.t@medicobridge.com",
    phone: "+91 98765 43212",
    status: "On Leave",
    avatarBg: "#ec4899",
    patientsCount: 0,
  },
  {
    id: "DR-80244",
    name: "Dr. Susan George",
    specialty: "Orthopedics",
    email: "susan.g@medicobridge.com",
    phone: "+91 98765 43213",
    status: "Available",
    avatarBg: "#f59e0b",
    patientsCount: 9,
  },
  {
    id: "DR-80245",
    name: "Dr. Vikram Shekar",
    specialty: "Dermatology",
    email: "vikram.s@medicobridge.com",
    phone: "+91 98765 43214",
    status: "Available",
    avatarBg: "#10b981",
    patientsCount: 6,
  },
  {
    id: "DR-80246",
    name: "Dr. Amit Varma",
    specialty: "General Medicine",
    email: "amit.v@medicobridge.com",
    phone: "+91 98765 43215",
    status: "In Surgery",
    avatarBg: "#0284c7",
    patientsCount: 11,
  },
];

const specialties = ["All", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology", "General Medicine"];

function ManageDoctors() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Doctor Form States
  const [newDocName, setNewDocName] = useState("");
  const [newDocSpecialty, setNewDocSpecialty] = useState("Cardiology");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocPhone, setNewDocPhone] = useState("");

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase());
      const matchDept = selectedDept === "All" || doc.specialty === selectedDept;
      const matchStatus = selectedStatus === "All" || doc.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [doctors, search, selectedDept, selectedStatus]);

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocEmail || !newDocPhone) return;

    const newDoc = {
      id: `DR-${Math.floor(80000 + Math.random() * 9000)}`,
      name: newDocName,
      specialty: newDocSpecialty,
      email: newDocEmail,
      phone: newDocPhone,
      status: "Available",
      avatarBg: ["#0d9488", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0284c7"][Math.floor(Math.random() * 6)],
      patientsCount: 0,
    };

    setDoctors([newDoc, ...doctors]);
    setShowAddModal(false);
    // Reset Form
    setNewDocName("");
    setNewDocSpecialty("Cardiology");
    setNewDocEmail("");
    setNewDocPhone("");
  };

  const handleStatusChange = (id, nextStatus) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, status: nextStatus } : d));
  };

  return (
    <div className="hosp-docs-page">
      {/* Search and Action Bar */}
      <div className="hosp-docs-controls">
        <div className="hosp-docs-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-docs-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="hosp-filter-group">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Surgery">In Surgery</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <button className="hosp-btn-add" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Doctor
          </button>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="hosp-docs-grid">
        {filteredDoctors.length === 0 ? (
          <div className="hosp-docs-empty">
            <FaUserMd className="empty-icon" />
            <h3>No doctors found</h3>
            <p>Try clearing your filters or check back later.</p>
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div className="hosp-doc-card" key={doc.id}>
              {/* Card Header */}
              <div className="hosp-doc-card-header">
                <div className="hosp-doc-avatar" style={{ backgroundColor: doc.avatarBg }}>
                  {doc.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="hosp-doc-header-info">
                  <h3>{doc.name}</h3>
                  <span className="hosp-doc-spec">{doc.specialty}</span>
                  <span className="hosp-doc-id">{doc.id}</span>
                </div>
              </div>

              {/* Card Status & Stats */}
              <div className="hosp-doc-body">
                <div className="hosp-doc-stat-row">
                  <span className="hosp-doc-stat-lbl">Active Consultations</span>
                  <span className="hosp-doc-stat-val">{doc.patientsCount} patients</span>
                </div>
                <div className="hosp-doc-stat-row">
                  <span className="hosp-doc-stat-lbl">On-duty Status</span>
                  <select
                    className={`hosp-doc-status-select status--${doc.status.toLowerCase().replace(" ", "-")}`}
                    value={doc.status}
                    onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="In Surgery">In Surgery</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              {/* Card Footer Contacts */}
              <div className="hosp-doc-footer">
                <a href={`tel:${doc.phone}`} className="hosp-doc-contact-link">
                  <FaPhoneAlt /> {doc.phone}
                </a>
                <a href={`mailto:${doc.email}`} className="hosp-doc-contact-link">
                  <FaEnvelope /> Email Specialist
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>Add New Staff Doctor</h2>
              <button className="hosp-modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddDoctor} className="hosp-modal-form">
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Watson"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialty Department</label>
                <select value={newDocSpecialty} onChange={(e) => setNewDocSpecialty(e.target.value)}>
                  {specialties.slice(1).map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="doctorname@medicobridge.com"
                  value={newDocEmail}
                  onChange={(e) => setNewDocEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={newDocPhone}
                  onChange={(e) => setNewDocPhone(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="hosp-btn-submit">
                <FaCheckCircle /> Register Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDoctors;
