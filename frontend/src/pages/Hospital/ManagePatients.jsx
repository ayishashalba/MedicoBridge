import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaTimes,
  FaCheckCircle,
  FaUser,
  FaCheck,
  FaBan,
} from "react-icons/fa";
import "./ManagePatients.css";

const initialPatients = [
  {
    id: "PAT-4091",
    name: "Ramesh Kumar",
    age: 52,
    gender: "Male",
    phone: "+91 94471 23456",
    ward: "ICU - Bed A4",
    status: "Admitted",
    admissionDate: "July 10, 2026",
  },
  {
    id: "PAT-4092",
    name: "Sonia Sebastian",
    age: 29,
    gender: "Female",
    phone: "+91 94471 23457",
    ward: "General Ward B - Bed 12",
    status: "Admitted",
    admissionDate: "July 11, 2026",
  },
  {
    id: "PAT-4093",
    name: "Mohan Lal",
    age: 64,
    gender: "Male",
    phone: "+91 94471 23458",
    ward: "Special Cabin C2",
    status: "Admitted",
    admissionDate: "July 09, 2026",
  },
  {
    id: "PAT-4094",
    name: "Aparna Nair",
    age: 41,
    gender: "Female",
    phone: "+91 94471 23459",
    ward: "Maternity Ward - Bed 3",
    status: "Admitted",
    admissionDate: "July 12, 2026",
  },
  {
    id: "PAT-4095",
    name: "Thomas Kurian",
    age: 35,
    gender: "Male",
    phone: "+91 94471 23460",
    ward: "None (Outpatient)",
    status: "Outpatient",
    admissionDate: "July 12, 2026",
  },
  {
    id: "PAT-4096",
    name: "Leela Mathews",
    age: 72,
    gender: "Female",
    phone: "+91 94471 23461",
    ward: "General Ward A - Bed 04",
    status: "Discharged",
    admissionDate: "July 05, 2026",
  },
];

const wardsList = ["All Wards", "ICU", "General Ward A", "General Ward B", "Special Cabin", "Maternity Ward", "Outpatient"];

function ManagePatients() {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All Wards");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("General Ward A - Bed 01");
  const [status, setStatus] = useState("Admitted");

  const filteredPatients = useMemo(() => {
    return patients.filter((pat) => {
      const matchSearch =
        pat.name.toLowerCase().includes(search.toLowerCase()) ||
        pat.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || pat.status === statusFilter;
      const matchWard =
        wardFilter === "All Wards" ||
        (wardFilter === "Outpatient" && pat.status === "Outpatient") ||
        pat.ward.toLowerCase().includes(wardFilter.toLowerCase());
      return matchSearch && matchStatus && matchWard;
    });
  }, [patients, search, statusFilter, wardFilter]);

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!name || !age || !phone) return;

    const newPat = {
      id: `PAT-${Math.floor(4000 + Math.random() * 9000)}`,
      name,
      age: parseInt(age),
      gender,
      phone,
      ward: status === "Outpatient" ? "None (Outpatient)" : ward,
      status,
      admissionDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setPatients([newPat, ...patients]);
    setShowAddModal(false);
    // Reset Form
    setName("");
    setAge("");
    setGender("Male");
    setPhone("");
    setWard("General Ward A - Bed 01");
    setStatus("Admitted");
  };

  const handleDischarge = (id) => {
    setPatients(
      patients.map((pat) =>
        pat.id === id
          ? { ...pat, status: "Discharged", ward: "None (Discharged)" }
          : pat
      )
    );
  };

  return (
    <div className="hosp-pats-page">
      {/* Controls Bar */}
      <div className="hosp-pats-controls">
        <div className="hosp-pats-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-pats-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
              <option value="Outpatient">Outpatient</option>
            </select>
          </div>

          <div className="hosp-filter-group">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
            >
              {wardsList.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <button className="hosp-btn-add" onClick={() => setShowAddModal(true)}>
            <FaUserPlus /> Check-In Patient
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="hosp-card hosp-pats-card">
        <div className="hosp-table-wrapper">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Contact</th>
                <th>Admission Date</th>
                <th>Ward / Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="hosp-table-empty">
                    <FaUser className="empty-icon" />
                    <h3>No patient records found</h3>
                    <p>Try adjusting your search criteria or register a new patient.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <div className="hosp-pat-profile">
                        <span className="hosp-pat-id">{pat.id}</span>
                        <div className="hosp-pat-info">
                          <span className="hosp-pat-name">{pat.name}</span>
                          <span className="hosp-pat-sub">
                            {pat.age} years · {pat.gender}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{pat.phone}</td>
                    <td>{pat.admissionDate}</td>
                    <td>{pat.ward}</td>
                    <td>
                      <span
                        className={`hosp-status-badge hosp-status-badge--${pat.status.toLowerCase()}`}
                      >
                        {pat.status}
                      </span>
                    </td>
                    <td>
                      {pat.status === "Admitted" ? (
                        <button
                          className="hosp-btn-discharge"
                          onClick={() => handleDischarge(pat.id)}
                          title="Discharge Patient"
                        >
                          <FaCheck /> Discharge
                        </button>
                      ) : (
                        <span className="hosp-action-disabled">
                          <FaBan /> N/A
                        </span>
                      )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-In Modal */}
      {showAddModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>Register / Check-in Patient</h2>
              <button className="hosp-modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleRegisterPatient} className="hosp-modal-form">
              <div className="form-group">
                <label>Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 90000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registration Mode</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Admitted">In-Patient Admission</option>
                  <option value="Outpatient">Outpatient Consultation</option>
                </select>
              </div>

              {status === "Admitted" && (
                <div className="form-group">
                  <label>Assign Bed / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. ICU - Bed B2"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    required={status === "Admitted"}
                  />
                </div>
              )}

              <button type="submit" className="hosp-btn-submit">
                <FaCheckCircle /> Register Check-In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePatients;
