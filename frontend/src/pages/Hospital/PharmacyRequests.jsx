import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaPills,
  FaCheckCircle,
  FaPrint,
} from "react-icons/fa";
import "./PharmacyRequests.css";

const initialRequests = [
  {
    id: "RX-5011",
    patientName: "Rahul Nair",
    doctorName: "Dr. Ayisha Shalba",
    date: "July 12, 2026",
    medicines: [
      { name: "Metformin 500mg", qty: "30 Tabs", dose: "1-0-1" },
      { name: "Atorvastatin 10mg", qty: "15 Tabs", dose: "0-0-1" },
    ],
    status: "Awaiting Dispense",
  },
  {
    id: "RX-5012",
    patientName: "Anjali Thomas",
    doctorName: "Dr. Ayisha Shalba",
    date: "July 12, 2026",
    medicines: [
      { name: "Amlodipine 5mg", qty: "30 Tabs", dose: "1-0-0" },
    ],
    status: "Awaiting Dispense",
  },
  {
    id: "RX-5013",
    patientName: "Suresh Babu",
    doctorName: "Dr. Priya Thomas",
    date: "July 10, 2026",
    medicines: [
      { name: "Amoxicillin 500mg", qty: "15 Capsules", dose: "1-1-1" },
      { name: "Paracetamol 650mg", qty: "10 Tabs", dose: "As needed" },
    ],
    status: "Dispensed",
  },
  {
    id: "RX-5014",
    patientName: "Ramesh Kumar",
    doctorName: "Dr. Amit Varma",
    date: "July 09, 2026",
    medicines: [
      { name: "Pantoprazole 40mg", qty: "14 Tabs", dose: "1-0-0" },
    ],
    status: "Dispensed",
  },
];

function PharmacyRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.patientName.toLowerCase().includes(search.toLowerCase()) ||
        req.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || req.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const handleDispense = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Dispensed" } : req
      )
    );
  };

  return (
    <div className="hosp-pharma-page">
      {/* Controls */}
      <div className="hosp-pharma-controls">
        <div className="hosp-pharma-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search by Patient Name or Rx ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-pharma-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Awaiting Dispense">Awaiting Dispense</option>
              <option value="Dispensed">Dispensed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Prescription Orders */}
      <div className="hosp-pharma-grid">
        {filtered.length === 0 ? (
          <div className="hosp-pharma-empty">
            <FaPills className="empty-icon" />
            <h3>No pharmacy orders found</h3>
            <p>Check filters or type another search term.</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className={`hosp-pharma-card hosp-pharma-card--${req.status.toLowerCase().replace(" ", "-")}`}
            >
              <div className="hosp-pharma-card-header">
                <span className="rx-id-badge">{req.id}</span>
                <span
                  className={`rx-status-badge status--${req.status.toLowerCase().replace(" ", "-")}`}
                >
                  {req.status}
                </span>
              </div>

              <div className="hosp-pharma-card-body">
                <div className="rx-meta-row">
                  <span className="rx-meta-lbl">Patient:</span>
                  <span className="rx-meta-val">{req.patientName}</span>
                </div>
                <div className="rx-meta-row">
                  <span className="rx-meta-lbl">Prescribed by:</span>
                  <span className="rx-meta-val">{req.doctorName}</span>
                </div>
                <div className="rx-meta-row">
                  <span className="rx-meta-lbl">Date:</span>
                  <span className="rx-meta-val">{req.date}</span>
                </div>

                <div className="rx-medicines-list">
                  <h4>Medicines Checklist:</h4>
                  {req.medicines.map((med, index) => (
                    <div key={index} className="rx-med-item">
                      <span className="med-name">{med.name}</span>
                      <span className="med-qty">{med.qty}</span>
                      <span className="med-dose">Dose: {med.dose}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hosp-pharma-card-footer">
                {req.status === "Awaiting Dispense" ? (
                  <button
                    className="hosp-pharma-btn hosp-pharma-btn--dispense"
                    onClick={() => handleDispense(req.id)}
                  >
                    <FaCheckCircle /> Release &amp; Dispense
                  </button>
                ) : (
                  <button className="hosp-pharma-btn hosp-pharma-btn--print">
                    <FaPrint /> Print Rx Label
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PharmacyRequests;
