import React, { useState } from "react";
import { FaFilePrescription, FaSearch, FaFilter, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import "./PharmacyPages.css";

const retailRx = [
  { id:"RX-001", patient:"Aarav Sharma",   age:34, doctor:"Dr. Priya Mehta",  date:"12 Jul 2026", status:"Pending",   items:["Paracetamol 500mg x2","Amoxicillin 250mg x1","Vitamin C x1"], type:"Online"  },
  { id:"RX-002", patient:"Sunita Rao",     age:52, doctor:"Dr. Anil Kumar",   date:"12 Jul 2026", status:"Dispensed", items:["Metformin 500mg x1","Atorvastatin 10mg x1","Aspirin 75mg x1","Lisinopril 5mg x1","Omeprazole 20mg x1"], type:"Walk-in" },
  { id:"RX-003", patient:"Rohan Verma",    age:28, doctor:"Dr. Sara Thomas",  date:"11 Jul 2026", status:"Pending",   items:["Cetirizine 10mg x1","Montelukast 10mg x1"], type:"Online"  },
  { id:"RX-004", patient:"Lakshmi Nair",   age:61, doctor:"Dr. Rajiv Kapoor", date:"11 Jul 2026", status:"Dispensed", items:["Amlodipine 5mg x1","Losartan 50mg x1","Furosemide 40mg x1","Spironolactone 25mg x1"], type:"Walk-in" },
  { id:"RX-005", patient:"Karan Malhotra", age:45, doctor:"Dr. Priya Mehta",  date:"10 Jul 2026", status:"On Hold",   items:["Tramadol 50mg x1"], type:"Online"  },
];

const hospitalRx = [
  { id:"HP-RX-001", patient:"Ramesh Iyer",   age:44, doctor:"Dr. A. Menon",  date:"12 Jul 2026", status:"Pending",   items:["IV Fluid x2","Ceftriaxone 1g x1"], type:"Inpatient"  },
  { id:"HP-RX-002", patient:"Sneha Patil",   age:32, doctor:"Dr. S. Kulkarni", date:"12 Jul 2026", status:"Dispensed", items:["Ondansetron 4mg x1"], type:"Outpatient" },
  { id:"HP-RX-003", patient:"Amitabh C.",    age:68, doctor:"Dr. P. Sharma",   date:"11 Jul 2026", status:"On Hold",   items:["Insulin Glargine x1"], type:"Inpatient"  },
];

const wholesaleRx = [
  { id:"WR-001", patient:"Apollo Pharmacy", age:"N/A", doctor:"N/A", date:"12 Jul 2026", status:"Pending", items:["Paracetamol Bulk 1000x","Amoxicillin Bulk 500x"], type:"Bulk Order" },
  { id:"WR-002", patient:"City Health", age:"N/A", doctor:"N/A", date:"11 Jul 2026", status:"Dispensed", items:["Metformin Bulk 2000x"], type:"Bulk Order" },
];

const statusColor = {
  Pending:   { bg:"#fef3c7", color:"#d97706" },
  Dispensed: { bg:"#dcfce7", color:"#16a34a" },
  "On Hold": { bg:"#fee2e2", color:"#dc2626" },
};

export default function PrescriptionRequests() {
  const pharmacyType = localStorage.getItem("pharmacyType") || "Retail";
  
  const getInitialRx = () => {
    switch (pharmacyType) {
      case "Hospital": return hospitalRx;
      case "Wholesale": return wholesaleRx;
      case "Retail":
      default: return retailRx;
    }
  };

  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");
  const [selectedRx, setSelectedRx] = useState(null);
  const [rxList,     setRxList]     = useState(getInitialRx());

  const filtered = rxList.filter((rx) => {
    const matchSearch = rx.patient.toLowerCase().includes(search.toLowerCase()) ||
                        rx.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || rx.status === filter;
    return matchSearch && matchFilter;
  });

  const dispense = (id) => {
    setRxList((prev) => prev.map((rx) => rx.id === id ? { ...rx, status: "Dispensed" } : rx));
    setSelectedRx(null);
  };

  const hold = (id) => {
    setRxList((prev) => prev.map((rx) => rx.id === id ? { ...rx, status: "On Hold" } : rx));
    setSelectedRx(null);
  };

  return (
    <div className="ph-page">
      {/* Header */}
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaFilePrescription /> Prescription Requests</h2>
          <p className="ph-page-sub">Review and dispense incoming prescriptions</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input placeholder="Search by patient or Rx ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>Dispensed</option>
            <option>On Hold</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ph-card">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Rx ID</th><th>Patient</th><th>Doctor</th><th>Items</th><th>Date</th><th>Type</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="ph-empty">No prescriptions found.</td></tr>
              ) : filtered.map((rx) => {
                const s = statusColor[rx.status] || {};
                return (
                  <tr key={rx.id}>
                    <td><span className="ph-id-badge">{rx.id}</span></td>
                    <td>
                      <div className="ph-patient-cell">
                        <span className="ph-name">{rx.patient}</span>
                        <span className="ph-age">Age {rx.age}</span>
                      </div>
                    </td>
                    <td>{rx.doctor}</td>
                    <td><span className="ph-count-badge">{rx.items.length} items</span></td>
                    <td>{rx.date}</td>
                    <td>{rx.type}</td>
                    <td>
                      <span className="ph-pill" style={{ background: s.bg, color: s.color }}>{rx.status}</span>
                    </td>
                    <td>
                      <button className="ph-btn-view" onClick={() => setSelectedRx(rx)}>
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRx && (
        <div className="ph-modal-overlay" onClick={() => setSelectedRx(null)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Prescription — {selectedRx.id}</h3>
              <button className="ph-modal-close" onClick={() => setSelectedRx(null)}><FaTimes /></button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-modal-info-grid">
                <div><span className="ph-info-label">Patient</span><span className="ph-info-val">{selectedRx.patient}, Age {selectedRx.age}</span></div>
                <div><span className="ph-info-label">Doctor</span><span className="ph-info-val">{selectedRx.doctor}</span></div>
                <div><span className="ph-info-label">Date</span><span className="ph-info-val">{selectedRx.date}</span></div>
                <div><span className="ph-info-label">Type</span><span className="ph-info-val">{selectedRx.type}</span></div>
              </div>
              <h4 className="ph-modal-section-title">Prescribed Medicines</h4>
              <ul className="ph-rx-items">
                {selectedRx.items.map((item, i) => (
                  <li key={i}><FaCheck className="ph-check-icon" />{item}</li>
                ))}
              </ul>
              {selectedRx.status === "Pending" && (
                <div className="ph-modal-actions">
                  <button className="ph-btn-dispense" onClick={() => dispense(selectedRx.id)}>
                    <FaCheck /> Mark as Dispensed
                  </button>
                  <button className="ph-btn-hold" onClick={() => hold(selectedRx.id)}>
                    <FaTimes /> Put On Hold
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
