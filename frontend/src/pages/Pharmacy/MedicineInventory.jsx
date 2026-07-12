import React, { useState } from "react";
import { FaBoxes, FaSearch, FaFilter, FaPlus, FaTimes, FaEdit, FaExclamationTriangle } from "react-icons/fa";
import "./PharmacyPages.css";

const initialInventory = [
  { id:"MED-001", name:"Paracetamol 500mg",    category:"Analgesic",      qty:18,   price:5,    expiry:"2027-03-01", manufacturer:"Sun Pharma",    status:"Low Stock"  },
  { id:"MED-002", name:"Amoxicillin 250mg",    category:"Antibiotic",     qty:9,    price:35,   expiry:"2026-11-15", manufacturer:"Cipla",         status:"Low Stock"  },
  { id:"MED-003", name:"Metformin 500mg",      category:"Antidiabetic",   qty:22,   price:12,   expiry:"2027-01-20", manufacturer:"Dr. Reddy's",   status:"Low Stock"  },
  { id:"MED-004", name:"Atorvastatin 10mg",    category:"Statin",         qty:14,   price:28,   expiry:"2027-06-10", manufacturer:"Lupin",         status:"Low Stock"  },
  { id:"MED-005", name:"Amlodipine 5mg",       category:"Antihypertensive",qty:120, price:18,   expiry:"2028-02-28", manufacturer:"Sun Pharma",    status:"In Stock"   },
  { id:"MED-006", name:"Cetirizine 10mg",      category:"Antihistamine",  qty:95,   price:8,    expiry:"2027-09-05", manufacturer:"GSK",           status:"In Stock"   },
  { id:"MED-007", name:"Losartan 50mg",        category:"Antihypertensive",qty:78,  price:22,   expiry:"2027-12-01", manufacturer:"Cipla",         status:"In Stock"   },
  { id:"MED-008", name:"Omeprazole 20mg",      category:"Antacid",        qty:160,  price:14,   expiry:"2028-05-15", manufacturer:"Zydus",         status:"In Stock"   },
  { id:"MED-009", name:"Doxycycline 100mg",    category:"Antibiotic",     qty:55,   price:42,   expiry:"2027-04-10", manufacturer:"Dr. Reddy's",   status:"In Stock"   },
  { id:"MED-010", name:"Vitamin C 500mg",      category:"Supplement",     qty:200,  price:6,    expiry:"2028-01-01", manufacturer:"Himalaya",      status:"In Stock"   },
  { id:"MED-011", name:"Ibuprofen 400mg",      category:"NSAID",          qty:0,    price:10,   expiry:"2026-08-20", manufacturer:"Abbott",        status:"Out of Stock"},
  { id:"MED-012", name:"Aspirin 75mg",         category:"Antiplatelet",   qty:310,  price:4,    expiry:"2028-07-01", manufacturer:"Bayer",         status:"In Stock"   },
];

const categories = ["All", "Analgesic", "Antibiotic", "Antidiabetic", "Statin", "Antihypertensive",
                     "Antihistamine", "Antacid", "NSAID", "Antiplatelet", "Supplement"];

const statusColor = {
  "In Stock":     { bg:"#dcfce7", color:"#16a34a" },
  "Low Stock":    { bg:"#fef3c7", color:"#d97706" },
  "Out of Stock": { bg:"#fee2e2", color:"#dc2626" },
};

const emptyForm = { name:"", category:"Analgesic", qty:"", price:"", expiry:"", manufacturer:"", status:"In Stock" };

export default function MedicineInventory() {
  const [inventory, setInventory] = useState(initialInventory);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(emptyForm);

  const filtered = inventory.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All" || m.category === catFilter;
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleAdd = () => {
    const newItem = { ...form, id: `MED-${String(inventory.length + 1).padStart(3,"0")}`, qty: Number(form.qty), price: Number(form.price) };
    setInventory((prev) => [newItem, ...prev]);
    setShowModal(false);
    setForm(emptyForm);
  };

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaBoxes /> Medicine Inventory</h2>
          <p className="ph-page-sub">{inventory.length} medicines — {inventory.filter((m) => m.status === "Low Stock").length} low stock, {inventory.filter((m) => m.status === "Out of Stock").length} out of stock</p>
        </div>
        <button className="ph-btn-add" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Medicine
        </button>
      </div>

      {/* Low Stock Banner */}
      {inventory.filter((m) => m.status !== "In Stock").length > 0 && (
        <div className="ph-alert-banner">
          <FaExclamationTriangle />
          <span><strong>{inventory.filter((m) => m.status !== "In Stock").length} items</strong> need restocking — review low stock and out-of-stock items below.</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input placeholder="Search medicine…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="ph-filter-box">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ph-card">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>ID</th><th>Medicine Name</th><th>Category</th><th>Qty</th><th>Price (₹)</th>
                <th>Expiry</th><th>Manufacturer</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="ph-empty">No medicines found.</td></tr>
              ) : filtered.map((m) => {
                const s = statusColor[m.status] || {};
                return (
                  <tr key={m.id}>
                    <td><span className="ph-id-badge">{m.id}</span></td>
                    <td><span className="ph-name">{m.name}</span></td>
                    <td><span className="ph-tag">{m.category}</span></td>
                    <td>
                      <span style={{ fontWeight: 800, color: m.qty === 0 ? "#dc2626" : m.qty < 25 ? "#d97706" : "#16a34a" }}>
                        {m.qty}
                      </span>
                    </td>
                    <td>₹{m.price}</td>
                    <td>{m.expiry}</td>
                    <td>{m.manufacturer}</td>
                    <td>
                      <span className="ph-pill" style={{ background: s.bg, color: s.color }}>{m.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="ph-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>Add New Medicine</h3>
              <button className="ph-modal-close" onClick={() => setShowModal(false)}><FaTimes /></button>
            </div>
            <div className="ph-modal-body">
              <div className="ph-form-grid">
                {[
                  { label:"Medicine Name",  key:"name",         type:"text"   },
                  { label:"Manufacturer",   key:"manufacturer", type:"text"   },
                  { label:"Quantity",       key:"qty",          type:"number" },
                  { label:"Price (₹)",      key:"price",        type:"number" },
                  { label:"Expiry Date",    key:"expiry",       type:"date"   },
                ].map(({ label, key, type }) => (
                  <div key={key} className="ph-form-group">
                    <label>{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="ph-form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {categories.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className="ph-btn-submit" onClick={handleAdd}><FaPlus /> Add Medicine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
