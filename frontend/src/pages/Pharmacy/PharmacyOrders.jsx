import React, { useState } from "react";
import { FaShoppingCart, FaSearch, FaFilter, FaEye, FaTimes } from "react-icons/fa";
import "./PharmacyPages.css";

const ordersData = [
  { id:"ORD-441", patient:"Anita Singh",   phone:"9876543210", date:"12 Jul 2026", type:"Home Delivery", amount:640,  status:"Delivered",  items:["Cetirizine 10mg x2","Vitamin C 500mg x1"]                         },
  { id:"ORD-442", patient:"Mohan Das",     phone:"9823456781", date:"12 Jul 2026", type:"Pickup",        amount:1200, status:"Processing", items:["Metformin 500mg x3","Atorvastatin 10mg x2","Losartan 50mg x1"]     },
  { id:"ORD-443", patient:"Priya Patel",   phone:"9811234567", date:"11 Jul 2026", type:"Home Delivery", amount:380,  status:"Shipped",    items:["Paracetamol 500mg x4","Ibuprofen 400mg x2"]                        },
  { id:"ORD-444", patient:"Vijay Kumar",   phone:"9800000001", date:"11 Jul 2026", type:"Pickup",        amount:950,  status:"Delivered",  items:["Amlodipine 5mg x1","Aspirin 75mg x2","Omeprazole 20mg x1"]        },
  { id:"ORD-445", patient:"Nisha Gupta",   phone:"9876000002", date:"10 Jul 2026", type:"Home Delivery", amount:1850, status:"Pending",    items:["Doxycycline 100mg x2","Amoxicillin 250mg x1","Probiotics x2"]      },
  { id:"ORD-446", patient:"Ravi Shankar",  phone:"9876000003", date:"10 Jul 2026", type:"Pickup",        amount:220,  status:"Cancelled",  items:["Paracetamol 500mg x2"]                                             },
  { id:"ORD-447", patient:"Sonia Bhatia",  phone:"9876000004", date:"09 Jul 2026", type:"Home Delivery", amount:760,  status:"Delivered",  items:["Cetirizine 10mg x1","Montelukast 10mg x1","Vitamin C 500mg x2"]   },
];

const statusColor = {
  Delivered:  { bg:"#dcfce7", color:"#16a34a" },
  Processing: { bg:"#ede9fe", color:"#6d28d9" },
  Shipped:    { bg:"#e0f2fe", color:"#0284c7" },
  Pending:    { bg:"#fef3c7", color:"#d97706" },
  Cancelled:  { bg:"#fee2e2", color:"#dc2626" },
};

export default function PharmacyOrders() {
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("All");
  const [typeFilter,setTypeFilter]= useState("All");
  const [selected,  setSelected]  = useState(null);

  const filtered = ordersData.filter((o) => {
    const matchSearch = o.patient.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || o.status === filter;
    const matchType   = typeFilter === "All" || o.type === typeFilter;
    return matchSearch && matchFilter && matchType;
  });

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaShoppingCart /> Orders</h2>
          <p className="ph-page-sub">Track all pharmacy orders — pickup and home delivery</p>
        </div>

        {/* Summary Pills */}
        <div className="ph-summary-pills">
          {["Delivered","Processing","Shipped","Pending"].map((s) => {
            const sc = statusColor[s];
            return (
              <span key={s} className="ph-sum-pill" style={{ background: sc.bg, color: sc.color }}>
                {ordersData.filter((o) => o.status === s).length} {s}
              </span>
            );
          })}
        </div>
      </div>

      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input placeholder="Search by patient or Order ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option><option>Pending</option><option>Processing</option>
            <option>Shipped</option><option>Delivered</option><option>Cancelled</option>
          </select>
        </div>
        <div className="ph-filter-box">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option><option>Home Delivery</option><option>Pickup</option>
          </select>
        </div>
      </div>

      <div className="ph-card">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Patient</th><th>Phone</th><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="ph-empty">No orders found.</td></tr>
              ) : filtered.map((o) => {
                const s = statusColor[o.status] || {};
                return (
                  <tr key={o.id}>
                    <td><span className="ph-id-badge">{o.id}</span></td>
                    <td><span className="ph-name">{o.patient}</span></td>
                    <td>{o.phone}</td>
                    <td>{o.date}</td>
                    <td><span className="ph-tag">{o.type}</span></td>
                    <td><strong>₹{o.amount.toLocaleString()}</strong></td>
                    <td><span className="ph-pill" style={{ background: s.bg, color: s.color }}>{o.status}</span></td>
                    <td>
                      <button className="ph-btn-view" onClick={() => setSelected(o)}>
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

      {/* Modal */}
      {selected && (
        <div className="ph-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Order — {selected.id}</h3>
              <button className="ph-modal-close" onClick={() => setSelected(null)}><FaTimes /></button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-modal-info-grid">
                <div><span className="ph-info-label">Patient</span><span className="ph-info-val">{selected.patient}</span></div>
                <div><span className="ph-info-label">Phone</span><span className="ph-info-val">{selected.phone}</span></div>
                <div><span className="ph-info-label">Date</span><span className="ph-info-val">{selected.date}</span></div>
                <div><span className="ph-info-label">Type</span><span className="ph-info-val">{selected.type}</span></div>
                <div><span className="ph-info-label">Amount</span><span className="ph-info-val">₹{selected.amount.toLocaleString()}</span></div>
                <div>
                  <span className="ph-info-label">Status</span>
                  <span className="ph-pill" style={{ background: statusColor[selected.status]?.bg, color: statusColor[selected.status]?.color }}>{selected.status}</span>
                </div>
              </div>
              <h4 className="ph-modal-section-title">Items Ordered</h4>
              <ul className="ph-rx-items">
                {selected.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
