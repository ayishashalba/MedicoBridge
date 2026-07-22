import React, { useState } from "react";
import { FaFileInvoiceDollar, FaSearch, FaFilter, FaEye, FaTimes, FaCheckCircle, FaDownload } from "react-icons/fa";
import "./PharmacyPages.css";

const retailBills = [
  { id:"INV-2201", patient:"Anita Singh",   order:"ORD-441", date:"12 Jul 2026", subtotal:600,  tax:40,   discount:0,   total:640,  method:"UPI",         status:"Paid"    },
  { id:"INV-2202", patient:"Mohan Das",     order:"ORD-442", date:"12 Jul 2026", subtotal:1100, tax:110,  discount:10,  total:1200, method:"Cash",        status:"Pending" },
  { id:"INV-2203", patient:"Priya Patel",   order:"ORD-443", date:"11 Jul 2026", subtotal:360,  tax:20,   discount:0,   total:380,  method:"Card",        status:"Paid"    },
];

const hospitalBills = [
  { id:"HINV-101", patient:"ICU Ward",      order:"HORD-101", date:"12 Jul 2026", subtotal:4000, tax:500, discount:0, total:4500, method:"Internal Transfer", status:"Paid" },
  { id:"HINV-102", patient:"ER Dept",       order:"HORD-102", date:"11 Jul 2026", subtotal:1100, tax:100, discount:0, total:1200, method:"Internal Transfer", status:"Paid" },
];

const wholesaleBills = [
  { id:"WINV-501", patient:"Apollo Pharmacy", order:"WORD-501", date:"12 Jul 2026", subtotal:40000, tax:5000, discount:0, total:45000, method:"Bank Transfer", status:"Pending" },
  { id:"WINV-502", patient:"City Health",     order:"WORD-502", date:"11 Jul 2026", subtotal:11000, tax:1500, discount:0, total:12500, method:"Card",          status:"Paid"    },
];

const statusColor = {
  Paid:      { bg:"#dcfce7", color:"#16a34a" },
  Pending:   { bg:"#fef3c7", color:"#d97706" },
  Cancelled: { bg:"#fee2e2", color:"#dc2626" },
};

export default function PharmacyBilling() {
  const pharmacyType = localStorage.getItem("pharmacyType") || "Retail";
  
  const getInitialBills = () => {
    switch (pharmacyType) {
      case "Hospital": return hospitalBills;
      case "Wholesale": return wholesaleBills;
      case "Retail":
      default: return retailBills;
    }
  };

  const initialBills = getInitialBills();
  const totalRevenue = initialBills.filter((b) => b.status === "Paid").reduce((s,b) => s + b.total, 0);

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState(null);
  const [bills,    setBills]    = useState(initialBills);

  const filtered = bills.filter((b) => {
    const matchSearch = b.patient.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || b.status === filter;
    return matchSearch && matchFilter;
  });

  const markPaid = (id) => {
    setBills((prev) => prev.map((b) => b.id === id ? { ...b, status: "Paid", method: "Cash" } : b));
    setSelected(null);
  };

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaFileInvoiceDollar /> Billing & Payments</h2>
          <p className="ph-page-sub">Total revenue collected: <strong>₹{totalRevenue.toLocaleString()}</strong></p>
        </div>
        <div className="ph-summary-pills">
          {["Paid","Pending","Cancelled"].map((s) => {
            const sc = statusColor[s];
            return (
              <span key={s} className="ph-sum-pill" style={{ background: sc.bg, color: sc.color }}>
                {bills.filter((b) => b.status === s).length} {s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="ph-rev-grid">
        {[
          { label:"Total Revenue",   val:`₹${totalRevenue.toLocaleString()}`,   color:"#0d9488" },
          { label:"Pending Payments",val:`₹${bills.filter((b)=>b.status==="Pending").reduce((s,b)=>s+b.total,0).toLocaleString()}`, color:"#d97706" },
          { label:"Total Invoices",  val:bills.length,    color:"#6366f1" },
          { label:"Paid Invoices",   val:bills.filter((b)=>b.status==="Paid").length, color:"#16a34a" },
        ].map((r) => (
          <div key={r.label} className="ph-rev-card">
            <span className="ph-rev-label">{r.label}</span>
            <span className="ph-rev-val" style={{ color: r.color }}>{r.val}</span>
          </div>
        ))}
      </div>

      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input placeholder="Search invoice or patient…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option><option>Paid</option><option>Pending</option><option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="ph-card">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Invoice</th><th>Patient</th><th>Order Ref</th><th>Date</th>
                <th>Subtotal</th><th>Tax</th><th>Discount</th><th>Total</th><th>Method</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="ph-empty">No invoices found.</td></tr>
              ) : filtered.map((b) => {
                const s = statusColor[b.status] || {};
                return (
                  <tr key={b.id}>
                    <td><span className="ph-id-badge">{b.id}</span></td>
                    <td><span className="ph-name">{b.patient}</span></td>
                    <td><span className="ph-tag">{b.order}</span></td>
                    <td>{b.date}</td>
                    <td>₹{b.subtotal}</td>
                    <td>₹{b.tax}</td>
                    <td>₹{b.discount}</td>
                    <td><strong>₹{b.total}</strong></td>
                    <td>{b.method}</td>
                    <td><span className="ph-pill" style={{ background: s.bg, color: s.color }}>{b.status}</span></td>
                    <td>
                      <button className="ph-btn-view" onClick={() => setSelected(b)}><FaEye /> View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selected && (
        <div className="ph-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ph-modal ph-invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Invoice — {selected.id}</h3>
              <button className="ph-modal-close" onClick={() => setSelected(null)}><FaTimes /></button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-invoice-header">
                <div>
                  <p className="ph-invoice-brand">MediCare Pharmacy</p>
                  <p className="ph-invoice-sub">MedicoBridge Portal · ID: #PH-8841</p>
                </div>
                <span className="ph-pill" style={{ background: statusColor[selected.status]?.bg, color: statusColor[selected.status]?.color }}>
                  {selected.status}
                </span>
              </div>
              <div className="ph-modal-info-grid">
                <div><span className="ph-info-label">Patient</span><span className="ph-info-val">{selected.patient}</span></div>
                <div><span className="ph-info-label">Order Ref</span><span className="ph-info-val">{selected.order}</span></div>
                <div><span className="ph-info-label">Date</span><span className="ph-info-val">{selected.date}</span></div>
                <div><span className="ph-info-label">Payment Method</span><span className="ph-info-val">{selected.method}</span></div>
              </div>
              <div className="ph-invoice-breakdown">
                <div className="ph-inv-row"><span>Subtotal</span><span>₹{selected.subtotal}</span></div>
                <div className="ph-inv-row"><span>Tax (GST)</span><span>₹{selected.tax}</span></div>
                <div className="ph-inv-row"><span>Discount</span><span>-₹{selected.discount}</span></div>
                <div className="ph-inv-row ph-inv-total"><span>Total</span><span>₹{selected.total}</span></div>
              </div>
              {selected.status === "Pending" && (
                <div className="ph-modal-actions">
                  <button className="ph-btn-dispense" onClick={() => markPaid(selected.id)}>
                    <FaCheckCircle /> Mark as Paid
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
