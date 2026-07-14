import React, { useState } from "react";
import { FaSearch, FaEye, FaBan, FaCheck, FaFilter, FaTimes } from "react-icons/fa";
import "./AdminPages.css";

const initialPatients = [
  { id: "PAT-101", name: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "+91 98765 43210", city: "Mumbai", status: "Active", joined: "10 Mar 2026" },
  { id: "PAT-102", name: "Sunita Rao", email: "sunita.rao@example.com", phone: "+91 87654 32109", city: "Bangalore", status: "Active", joined: "12 Mar 2026" },
  { id: "PAT-103", name: "Rohan Verma", email: "rohan.verma@example.com", phone: "+91 76543 21098", city: "Delhi", status: "Blocked", joined: "15 Apr 2026" },
  { id: "PAT-104", name: "Lakshmi Nair", email: "lakshmi.nair@example.com", phone: "+91 65432 10987", city: "Kochi", status: "Active", joined: "22 May 2026" },
  { id: "PAT-105", name: "Karan Malhotra", email: "karan.m@example.com", phone: "+91 54321 09876", city: "Pune", status: "Active", joined: "01 Jun 2026" },
];

const initialDoctors = [
  { id: "DOC-201", name: "Dr. Priya Mehta", email: "priya.mehta@example.com", specialty: "Pediatrics", phone: "+91 99112 23344", status: "Active", verified: "Yes" },
  { id: "DOC-202", name: "Dr. Anil Kumar", email: "anil.kumar@example.com", specialty: "Dermatology", phone: "+91 88223 34455", status: "Active", verified: "Yes" },
  { id: "DOC-203", name: "Dr. Sara Thomas", email: "sara.thomas@example.com", specialty: "General Medicine", phone: "+91 77334 45566", status: "Pending", verified: "No" },
  { id: "DOC-204", name: "Dr. Rajiv Kapoor", email: "rajiv.kapoor@example.com", specialty: "Orthopedics", phone: "+91 66445 56677", status: "Blocked", verified: "Yes" },
];

const initialHospitals = [
  { id: "HSP-301", name: "City Care Hospital", email: "contact@citycare.org", city: "Chennai", beds: "120", status: "Active", verified: "Yes" },
  { id: "HSP-302", name: "St. Stephens Clinic", email: "info@ststephens.com", city: "Delhi", beds: "45", status: "Pending", verified: "No" },
  { id: "HSP-303", name: "Metro General Hospital", email: "metro.hosp@metro.in", city: "Hyderabad", beds: "350", status: "Active", verified: "Yes" },
  { id: "HSP-304", name: "Fortis Health Clinic", email: "reachus@fortis.com", city: "Mumbai", beds: "80", status: "Blocked", verified: "Yes" },
];

const initialPharmacies = [
  { id: "PHR-401", name: "MediCare Pharmacy", email: "medicare.rx@gmail.com", license: "LIC-PH-99411", city: "Kolkata", status: "Active", verified: "Yes" },
  { id: "PHR-402", name: "Apollo Pharmacy Store", email: "apollo.store5@apollo.in", license: "LIC-PH-82410", city: "Bangalore", status: "Active", verified: "Yes" },
  { id: "PHR-403", name: "Wellness Chemist", email: "wellness.chemist@wellness.com", license: "LIC-PH-77241", city: "Noida", status: "Pending", verified: "No" },
];

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("Patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);

  // States for dynamic edits/blocks
  const [patients, setPatients] = useState(initialPatients);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [pharmacies, setPharmacies] = useState(initialPharmacies);

  const getActiveData = () => {
    switch (activeTab) {
      case "Patients": return { data: patients, setter: setPatients };
      case "Doctors": return { data: doctors, setter: setDoctors };
      case "Hospitals": return { data: hospitals, setter: setHospitals };
      case "Pharmacies": return { data: pharmacies, setter: setPharmacies };
      default: return { data: [], setter: null };
    }
  };

  const { data, setter } = getActiveData();

  const handleToggleStatus = (id) => {
    if (!setter) return;
    setter((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "Active" ? "Blocked" : "Active";
          // If we are modifying a selected user in details modal, update that as well
          if (selectedUser && selectedUser.id === id) {
            setSelectedUser({ ...selectedUser, status: nextStatus });
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Filter & Search logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Register, inspect, and moderate all platform participants</p>
      </div>

      {/* Tabs */}
      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {["Patients", "Doctors", "Hospitals", "Pharmacies"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className={`ad-tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="ad-card" style={{ padding: "1.25rem" }}>
        <div className="ad-search-filter-bar">
          <div className="ad-search-wrapper">
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by ID, name, email...`}
              className="ad-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ad-filters">
            <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FaFilter /> Status:
            </span>
            <select
              className="ad-select"
              style={{ width: "130px", padding: "0.45rem 0.75rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              {activeTab === "Patients" && (
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
              {activeTab === "Doctors" && (
                <tr>
                  <th>Doctor ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
              {activeTab === "Hospitals" && (
                <tr>
                  <th>Hospital ID</th>
                  <th>Hospital Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Beds</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
              {activeTab === "Pharmacies" && (
                <tr>
                  <th>Pharmacy ID</th>
                  <th>Pharmacy Name</th>
                  <th>License Number</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No matching users found for search queries.
                  </td>
                </tr>
              ) : (
                filteredData.map((user) => (
                  <tr key={user.id}>
                    <td><span className="ad-id-badge">{user.id}</span></td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>

                    {activeTab === "Patients" && (
                      <>
                        <td>{user.phone}</td>
                        <td>{user.city}</td>
                      </>
                    )}

                    {activeTab === "Doctors" && (
                      <>
                        <td>{user.specialty}</td>
                        <td>
                          <span className="ad-pill" style={{
                            background: user.verified === "Yes" ? "#dcfce7" : "#fee2e2",
                            color: user.verified === "Yes" ? "#15803d" : "#b91c1c"
                          }}>{user.verified === "Yes" ? "Verified" : "Unverified"}</span>
                        </td>
                      </>
                    )}

                    {activeTab === "Hospitals" && (
                      <>
                        <td>{user.city}</td>
                        <td>{user.beds} Beds</td>
                      </>
                    )}

                    {activeTab === "Pharmacies" && (
                      <>
                        <td><code>{user.license}</code></td>
                        <td>{user.city}</td>
                      </>
                    )}

                    <td>
                      <span className="ad-pill" style={{
                        background: user.status === "Active" ? "#dcfce7" : user.status === "Pending" ? "#fef3c7" : "#fee2e2",
                        color: user.status === "Active" ? "#16a34a" : user.status === "Pending" ? "#d97706" : "#dc2626"
                      }}>{user.status}</span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="ad-btn ad-btn-secondary"
                          title="Inspect Details"
                          style={{ padding: "0.35rem", borderRadius: "6px" }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`ad-btn ${user.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
                          title={user.status === "Active" ? "Block User" : "Activate User"}
                          style={{ padding: "0.35rem", borderRadius: "6px" }}
                        >
                          {user.status === "Active" ? <FaBan /> : <FaCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="ad-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>User Profiles — Details</h3>
              <button className="ad-modal-close" onClick={() => setSelectedUser(null)}><FaTimes /></button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-profile-details">
                <div style={{ textAlign: "center" }}>
                  <div className="ad-profile-avatar-large">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="ad-id-badge" style={{ marginTop: "1rem", display: "inline-block" }}>{selectedUser.id}</span>
                  <div style={{ marginTop: "0.75rem" }}>
                    <span className="ad-pill" style={{
                      background: selectedUser.status === "Active" ? "#dcfce7" : "#fee2e2",
                      color: selectedUser.status === "Active" ? "#16a34a" : "#dc2626",
                      fontSize: "0.8rem",
                      padding: "0.25rem 0.8rem"
                    }}>{selectedUser.status}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Full Name</span>
                    <strong style={{ fontSize: "1.1rem" }}>{selectedUser.name}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Email Address</span>
                    <span>{selectedUser.email}</span>
                  </div>

                  {selectedUser.phone && (
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Contact Number</span>
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}

                  {activeTab === "Doctors" && (
                    <>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Specialty / Area</span>
                        <span>{selectedUser.specialty}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Board Verified</span>
                        <span>{selectedUser.verified}</span>
                      </div>
                    </>
                  )}

                  {activeTab === "Hospitals" && (
                    <>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Bed Capacity</span>
                        <span>{selectedUser.beds} Intensive & General Beds</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>City</span>
                        <span>{selectedUser.city}</span>
                      </div>
                    </>
                  )}

                  {activeTab === "Pharmacies" && (
                    <>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Pharmacy license</span>
                        <span><code>{selectedUser.license}</code></span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Branch City</span>
                        <span>{selectedUser.city}</span>
                      </div>
                    </>
                  )}

                  {selectedUser.joined && (
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", display: "block" }}>Registration Date</span>
                      <span>{selectedUser.joined}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="ad-modal-footer">
              <button
                onClick={() => handleToggleStatus(selectedUser.id)}
                className={`ad-btn ${selectedUser.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
              >
                {selectedUser.status === "Active" ? "Block Access" : "Approve & Activate"}
              </button>
              <button className="ad-btn ad-btn-outline" onClick={() => setSelectedUser(null)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
