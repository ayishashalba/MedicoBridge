import React, { useState, useEffect } from "react";
import {
  FaPills,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaBoxes,
  FaMoneyBillWave,
  FaSyncAlt,
  FaFilePrescription,
  FaWarehouse,
} from "react-icons/fa";
import {
  getStoredMedicines,
  saveMedicines,
} from "../../utils/adminData";
import "./AdminPages.css";

export default function AdminPharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockStatusFilter, setStockStatusFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [adjustQty, setAdjustQty] = useState(10);
  const [toastMsg, setToastMsg] = useState("");

  // Form State for Add / Edit
  const initialForm = {
    id: "",
    name: "",
    brand: "",
    category: "Tablet",
    batchNumber: "",
    stock: 50,
    minThreshold: 15,
    price: 50,
    mrp: 65,
    requiresPrescription: false,
    expiryDate: "2027-12-31",
    manufacturer: "",
    pharmacyName: "MedPlus Central Pharmacy",
    emoji: "💊",
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setMedicines(getStoredMedicines());
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateMedState = (updatedList) => {
    setMedicines(updatedList);
    saveMedicines(updatedList);
  };

  // Quick Stock Adjustment (+/-)
  const handleQuickAdjust = (medId, delta) => {
    const updated = medicines.map((m) => {
      if (m.id === medId) {
        const newStock = Math.max(0, m.stock + delta);
        return {
          ...m,
          stock: newStock,
          status: newStock === 0 ? "out-of-stock" : newStock <= m.minThreshold ? "low-stock" : "in-stock",
        };
      }
      return m;
    });
    updateMedState(updated);
    triggerToast(`Stock updated for ${medicines.find((m) => m.id === medId)?.name}`);
  };

  // Save new medicine
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = `MED-${Math.floor(100 + Math.random() * 900)}`;
    const status = Number(formData.stock) === 0 ? "out-of-stock" : Number(formData.stock) <= Number(formData.minThreshold) ? "low-stock" : "in-stock";
    
    const newMed = {
      ...formData,
      id: newId,
      stock: Number(formData.stock),
      minThreshold: Number(formData.minThreshold),
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      status,
    };

    const updated = [newMed, ...medicines];
    updateMedState(updated);
    setShowAddModal(false);
    setFormData(initialForm);
    triggerToast(`Medicine "${newMed.name}" added successfully.`);
  };

  // Save Edit medicine
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const status = Number(formData.stock) === 0 ? "out-of-stock" : Number(formData.stock) <= Number(formData.minThreshold) ? "low-stock" : "in-stock";
    
    const updated = medicines.map((m) => {
      if (m.id === formData.id) {
        return {
          ...formData,
          stock: Number(formData.stock),
          minThreshold: Number(formData.minThreshold),
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          status,
        };
      }
      return m;
    });

    updateMedState(updated);
    setShowEditModal(false);
    setSelectedMed(null);
    triggerToast(`Medicine "${formData.name}" updated successfully.`);
  };

  // Delete Medicine
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      const updated = medicines.filter((m) => m.id !== id);
      updateMedState(updated);
      triggerToast(`Removed "${name}" from catalog.`);
    }
  };

  // Restock to safe threshold
  const handleRestockSafe = (med) => {
    const target = (med.minThreshold || 20) * 3;
    const updated = medicines.map((m) => {
      if (m.id === med.id) {
        return { ...m, stock: target, status: "in-stock" };
      }
      return m;
    });
    updateMedState(updated);
    triggerToast(`Restocked ${med.name} to ${target} units.`);
  };

  // Computed metrics
  const totalItems = medicines.length;
  const totalStockUnits = medicines.reduce((sum, m) => sum + m.stock, 0);
  const outOfStockCount = medicines.filter((m) => m.stock === 0).length;
  const lowStockCount = medicines.filter((m) => m.stock > 0 && m.stock <= (m.minThreshold || 15)).length;
  const totalValuation = medicines.reduce((sum, m) => sum + (m.stock * m.price), 0);

  // Filtered List
  const filtered = medicines.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = categoryFilter === "All" || m.category === categoryFilter;
    
    let matchStock = true;
    if (stockStatusFilter === "in-stock") matchStock = m.stock > (m.minThreshold || 15);
    else if (stockStatusFilter === "low-stock") matchStock = m.stock > 0 && m.stock <= (m.minThreshold || 15);
    else if (stockStatusFilter === "out-of-stock") matchStock = m.stock === 0;

    let matchRx = true;
    if (rxFilter === "Rx") matchRx = m.requiresPrescription === true;
    else if (rxFilter === "OTC") matchRx = m.requiresPrescription === false;

    return matchSearch && matchCategory && matchStock && matchRx;
  });

  return (
    <div className="ad-page">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#1e293b",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "adFadeIn 0.3s ease"
        }}>
          <FaCheckCircle style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      <div className="ad-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FaPills style={{ color: "var(--ad-primary)" }} /> Pharmacy & Stock Management
          </h2>
          <p>Supervise multi-pharmacy drug inventories, batch controls, reorder levels, and restock actions</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={() => { setFormData(initialForm); setShowAddModal(true); }}>
          <FaPlus /> Add New Medicine
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaBoxes /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Cataloged Drugs</span>
            <h3 className="ad-kpi-value">{totalItems}</h3>
            <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)" }}>{totalStockUnits} Total Units in Warehouses</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaExclamationTriangle /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Stock Critical</span>
            <h3 className="ad-kpi-value" style={{ color: (outOfStockCount + lowStockCount) > 0 ? "#dc2626" : "inherit" }}>
              {outOfStockCount} Out · {lowStockCount} Low
            </h3>
            <span style={{ fontSize: "0.76rem", color: "#dc2626", fontWeight: "600" }}>Reorders Recommended</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaMoneyBillWave /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Total Inventory Valuation</span>
            <h3 className="ad-kpi-value">₹{totalValuation.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">+8.4% vs last audit</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaWarehouse /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active Warehouses</span>
            <h3 className="ad-kpi-value">3 Dispensaries</h3>
            <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)" }}>MedPlus · Apollo · Aster</span>
          </div>
        </div>
      </div>

      {/* Main Inventory Card */}
      <div className="ad-card">
        {/* Search & Filter Toolbar */}
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search medicine name, brand, batch ID..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "130px" }}
            >
              <option value="All">All Categories</option>
              <option value="Tablet">Tablets</option>
              <option value="Capsule">Capsules</option>
              <option value="Supplement">Supplements</option>
              <option value="Injection">Injections</option>
            </select>

            <select
              className="ad-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              style={{ width: "135px" }}
            >
              <option value="All">All Stock Levels</option>
              <option value="in-stock">In Stock (&gt;15)</option>
              <option value="low-stock">Low Stock (1–15)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>

            <select
              className="ad-select"
              value={rxFilter}
              onChange={(e) => setRxFilter(e.target.value)}
              style={{ width: "115px" }}
            >
              <option value="All">All Types</option>
              <option value="Rx">Prescription (Rx)</option>
              <option value="OTC">OTC Only</option>
            </select>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Drug &amp; ID</th>
                <th>Brand / Category</th>
                <th>Batch No.</th>
                <th>Unit Price</th>
                <th>Stock Quantity</th>
                <th>Reorder Threshold</th>
                <th>Status</th>
                <th>Assigned Facility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No medicines match the selected search &amp; filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((med) => {
                  const isOut = med.stock === 0;
                  const isLow = med.stock > 0 && med.stock <= (med.minThreshold || 15);
                  return (
                    <tr key={med.id} style={{ background: isOut ? "#fff5f5" : isLow ? "#fffdf5" : "inherit" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.3rem" }}>{med.emoji || "💊"}</span>
                          <div>
                            <strong style={{ display: "block", color: "var(--ad-text-primary)" }}>{med.name}</strong>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <span className="ad-id-badge" style={{ fontSize: "0.68rem" }}>{med.id}</span>
                              {med.requiresPrescription && (
                                <span style={{ fontSize: "0.68rem", background: "#ede9fe", color: "#6d28d9", padding: "0.1rem 0.35rem", borderRadius: "3px", fontWeight: "700" }}>
                                  Rx Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{med.brand}</strong>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>{med.category}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: "0.78rem", background: "var(--ad-bg-secondary)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                          {med.batchNumber || "BAT-2026"}
                        </code>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ad-text-muted)", marginTop: "2px" }}>
                          Exp: {med.expiryDate || "2027"}
                        </span>
                      </td>
                      <td>
                        <strong>₹{med.price}</strong>
                        {med.mrp > med.price && (
                          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)", textDecoration: "line-through" }}>
                            MRP ₹{med.mrp}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleQuickAdjust(med.id, -5)}
                            className="ad-btn ad-btn-outline"
                            style={{ padding: "0.2rem 0.45rem", fontSize: "0.75rem" }}
                            title="Decrease 5 units"
                            disabled={med.stock <= 0}
                          >
                            -5
                          </button>
                          <strong style={{ fontSize: "0.95rem", minWidth: "32px", textAlign: "center" }}>{med.stock}</strong>
                          <button
                            onClick={() => handleQuickAdjust(med.id, 10)}
                            className="ad-btn ad-btn-outline"
                            style={{ padding: "0.2rem 0.45rem", fontSize: "0.75rem" }}
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                          {med.minThreshold || 15} units
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="ad-pill" style={{ background: "#fee2e2", color: "#dc2626" }}>Out of Stock</span>
                        ) : isLow ? (
                          <span className="ad-pill" style={{ background: "#fef3c7", color: "#d97706" }}>Low Stock</span>
                        ) : (
                          <span className="ad-pill" style={{ background: "#dcfce7", color: "#16a34a" }}>In Stock</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--ad-text-secondary)" }}>
                          {med.pharmacyName || "Central Dispensary"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          {(isOut || isLow) && (
                            <button
                              className="ad-btn ad-btn-primary"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                              onClick={() => handleRestockSafe(med)}
                              title="Restock to safe level"
                            >
                              <FaSyncAlt /> Restock
                            </button>
                          )}
                          <button
                            className="ad-btn ad-btn-secondary"
                            style={{ padding: "0.35rem", borderRadius: "6px" }}
                            onClick={() => {
                              setSelectedMed(med);
                              setFormData({ ...med });
                              setShowEditModal(true);
                            }}
                            title="Edit Medicine Details"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="ad-btn ad-btn-danger"
                            style={{ padding: "0.35rem", borderRadius: "6px" }}
                            onClick={() => handleDelete(med.id, med.name)}
                            title="Remove Medicine"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Medicine Modal ── */}
      {showAddModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaPlus /> Add New Medicine to Inventory</h3>
              <button className="ad-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="ad-modal-body">
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol 650mg"
                    className="ad-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Brand / Generic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Calpol"
                    className="ad-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-grid-3" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Category</label>
                  <select
                    className="ad-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div className="ad-form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="BAT-2026-001"
                    className="ad-input"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    className="ad-input"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-grid-4" style={{ gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                <div className="ad-form-group">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="ad-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="ad-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. GSK Pharmaceuticals"
                    className="ad-input"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Dispensary / Pharmacy</label>
                  <select
                    className="ad-select"
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                  >
                    <option value="MedPlus Central Pharmacy">MedPlus Central Pharmacy</option>
                    <option value="Apollo Pharmacy, Kochi">Apollo Pharmacy, Kochi</option>
                    <option value="Aster Medcity Pharmacy">Aster Medcity Pharmacy</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="rxReq"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                />
                <label htmlFor="rxReq" style={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                  Requires Doctor Prescription (Schedule H / Rx Drug)
                </label>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaPlus /> Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Medicine Modal ── */}
      {showEditModal && (
        <div className="ad-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaEdit /> Edit Medicine Details</h3>
              <button className="ad-modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="ad-modal-body">
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Medicine Name</label>
                  <input
                    type="text"
                    required
                    className="ad-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Brand / Generic</label>
                  <input
                    type="text"
                    required
                    className="ad-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-grid-3" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Category</label>
                  <select
                    className="ad-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Supplement">Supplement</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div className="ad-form-group">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    required
                    className="ad-input"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="ad-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-grid-3" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>MRP (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="rxReqEdit"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                />
                <label htmlFor="rxReqEdit" style={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                  Requires Doctor Prescription (Schedule H / Rx Drug)
                </label>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaCheckCircle /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
