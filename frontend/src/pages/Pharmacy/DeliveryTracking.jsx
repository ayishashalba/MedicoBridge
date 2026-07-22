import React, { useState } from "react";
import { FaTruck, FaSearch, FaFilter, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import "./PharmacyPages.css";

const retailDeliveries = [
  { id:"DEL-001", order:"ORD-441", patient:"Anita Singh",   address:"14, MG Road, Bangalore",       assigned:"Ramu Kumar",   phone:"9812341234", date:"12 Jul 2026", eta:"3:30 PM",   status:"Delivered",  steps:["Order Placed","Packed","Dispatched","Delivered"] },
  { id:"DEL-002", order:"ORD-443", patient:"Priya Patel",   address:"22, Park Street, Mumbai",       assigned:"Suresh Rao",   phone:"9823453456", date:"11 Jul 2026", eta:"5:00 PM",   status:"Out for Delivery", steps:["Order Placed","Packed","Dispatched"] },
  { id:"DEL-003", order:"ORD-445", patient:"Nisha Gupta",   address:"8, Civil Lines, Delhi",         assigned:"—",            phone:"—",          date:"10 Jul 2026", eta:"Tomorrow",  status:"Packed",     steps:["Order Placed","Packed"] },
  { id:"DEL-004", order:"ORD-447", patient:"Sonia Bhatia",  address:"33, Jubilee Hills, Hyderabad", assigned:"Mohan Lal",    phone:"9867896789", date:"09 Jul 2026", eta:"Delivered", status:"Delivered",  steps:["Order Placed","Packed","Dispatched","Delivered"] },
];

const hospitalDeliveries = [
  { id:"HDEL-101", order:"HORD-101", patient:"ICU Ward",   address:"Building A, Floor 3", assigned:"Ward Boy Suresh", phone:"Ext 105", date:"12 Jul 2026", eta:"10 Mins", status:"Out for Delivery", steps:["Order Placed","Packed","Dispatched"] },
  { id:"HDEL-102", order:"HORD-102", patient:"ER Dept",    address:"Ground Floor, Emergency", assigned:"Nurse Priya", phone:"Ext 200", date:"11 Jul 2026", eta:"Delivered", status:"Delivered", steps:["Order Placed","Packed","Dispatched","Delivered"] },
];

const wholesaleDeliveries = [
  { id:"WDEL-501", order:"WORD-501", patient:"Apollo Pharmacy", address:"45, Health St, Pune", assigned:"Express Cargo", phone:"1800-111-222", date:"12 Jul 2026", eta:"2 Days", status:"Dispatched", steps:["Order Placed","Packed","Dispatched"] },
  { id:"WDEL-502", order:"WORD-502", patient:"City Health", address:"90, Ring Road, Surat", assigned:"Safe Logistics", phone:"1800-333-444", date:"11 Jul 2026", eta:"Tomorrow", status:"Packed", steps:["Order Placed","Packed"] },
];

const allSteps = ["Order Placed","Packed","Dispatched","Out for Delivery","Delivered"];

const statusColor = {
  Delivered:           { bg:"#dcfce7", color:"#16a34a" },
  "Out for Delivery":  { bg:"#e0f2fe", color:"#0284c7" },
  Dispatched:          { bg:"#ede9fe", color:"#6d28d9" },
  Packed:              { bg:"#fef3c7", color:"#d97706" },
};

export default function DeliveryTracking() {
  const pharmacyType = localStorage.getItem("pharmacyType") || "Retail";
  
  const getInitialDeliveries = () => {
    switch (pharmacyType) {
      case "Hospital": return hospitalDeliveries;
      case "Wholesale": return wholesaleDeliveries;
      case "Retail":
      default: return retailDeliveries;
    }
  };

  const deliveries = getInitialDeliveries();

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = deliveries.filter((d) => {
    const matchSearch = d.patient.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaTruck /> Delivery Tracking</h2>
          <p className="ph-page-sub">Monitor live delivery status for all home delivery orders</p>
        </div>
      </div>

      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input placeholder="Search by patient or delivery ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option><option>Packed</option><option>Dispatched</option>
            <option>Out for Delivery</option><option>Delivered</option>
          </select>
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="ph-delivery-grid">
        {filtered.length === 0 ? (
          <div className="ph-empty-state">No deliveries found.</div>
        ) : filtered.map((d) => {
          const s = statusColor[d.status] || {};
          const stepIdx = allSteps.indexOf(d.status);
          return (
            <div key={d.id} className="ph-delivery-card" onClick={() => setSelected(d)}>
              <div className="ph-delivery-card-header">
                <div>
                  <span className="ph-id-badge">{d.id}</span>
                  <span className="ph-tag" style={{ marginLeft: "0.5rem" }}>{d.order}</span>
                </div>
                <span className="ph-pill" style={{ background: s.bg, color: s.color }}>{d.status}</span>
              </div>
              <div className="ph-delivery-patient">
                <strong>{d.patient}</strong>
                <span><FaMapMarkerAlt /> {d.address}</span>
              </div>
              <div className="ph-delivery-meta">
                <span>Agent: {d.assigned}</span>
                <span>ETA: {d.eta}</span>
                <span>Date: {d.date}</span>
              </div>
              {/* Progress Steps */}
              <div className="ph-step-tracker">
                {allSteps.map((step, i) => {
                  const done = i <= stepIdx;
                  return (
                    <div key={step} className={`ph-step ${done ? "ph-step--done" : ""}`}>
                      <div className="ph-step-dot">{done && <FaCheckCircle />}</div>
                      <span className="ph-step-label">{step}</span>
                      {i < allSteps.length - 1 && <div className={`ph-step-line ${done && i < stepIdx ? "ph-step-line--done" : ""}`} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="ph-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Delivery — {selected.id}</h3>
              <button className="ph-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-modal-info-grid">
                <div><span className="ph-info-label">Patient</span><span className="ph-info-val">{selected.patient}</span></div>
                <div><span className="ph-info-label">Order</span><span className="ph-info-val">{selected.order}</span></div>
                <div><span className="ph-info-label">Address</span><span className="ph-info-val">{selected.address}</span></div>
                <div><span className="ph-info-label">Delivery Agent</span><span className="ph-info-val">{selected.assigned}</span></div>
                <div><span className="ph-info-label">Agent Phone</span><span className="ph-info-val">{selected.phone}</span></div>
                <div><span className="ph-info-label">ETA</span><span className="ph-info-val">{selected.eta}</span></div>
              </div>
              <h4 className="ph-modal-section-title">Tracking Steps</h4>
              <ul className="ph-rx-items">
                {allSteps.map((step, i) => {
                  const done = i <= allSteps.indexOf(selected.status);
                  return (
                    <li key={step} style={{ color: done ? "#16a34a" : "#94a3b8", fontWeight: done ? 700 : 500 }}>
                      {done ? "✓" : "○"} {step}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
