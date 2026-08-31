import React, { useState, useEffect } from "react";
import {
  FaTicketAlt,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimes,
  FaCopy,
  FaTag,
  FaPercentage,
  FaMoneyBillWave,
  FaTruck,
  FaPlay,
  FaSearch,
} from "react-icons/fa";
import { getStoredCoupons, saveCoupons } from "../../utils/adminData";
import { validateAndApplyCoupon } from "../../utils/coupons";
import "./AdminPages.css";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Simulator state
  const [simCode, setSimCode] = useState("MEDI10");
  const [simAmount, setSimAmount] = useState(650);
  const [simResult, setSimResult] = useState(null);

  // Form State
  const initialForm = {
    id: "",
    code: "",
    title: "",
    description: "",
    type: "percent", // percent, flat, freedelivery
    discountPercent: 10,
    discountAmount: 50,
    maxDiscount: 100,
    minOrder: 499,
    expiryDate: "2027-12-31",
    status: "Active",
    badge: "SPECIAL",
    usageCount: 0,
    totalSavingsGranted: 0,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    setCoupons(getStoredCoupons());
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateCouponsState = (updatedList) => {
    setCoupons(updatedList);
    saveCoupons(updatedList);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    triggerToast(`Copied "${code}" to clipboard!`);
  };

  const handleToggleStatus = (id) => {
    const updated = coupons.map((c) => {
      if (c.id === id) {
        const nextStatus = c.status === "Active" ? "Inactive" : "Active";
        return { ...c, status: nextStatus };
      }
      return c;
    });
    updateCouponsState(updated);
    triggerToast("Coupon status updated.");
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      const updated = coupons.filter((c) => c.id !== id);
      updateCouponsState(updated);
      triggerToast(`Coupon "${code}" deleted.`);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (coupons.some((c) => c.code === cleanCode)) {
      alert(`Coupon code "${cleanCode}" already exists! Please choose a unique code.`);
      return;
    }

    const newCoupon = {
      ...formData,
      id: `CPN-${Math.floor(100 + Math.random() * 900)}`,
      code: cleanCode,
      minOrder: Number(formData.minOrder) || 0,
      discountPercent: Number(formData.discountPercent) || 0,
      discountAmount: Number(formData.discountAmount) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      usageCount: 0,
      totalSavingsGranted: 0,
    };

    const updated = [newCoupon, ...coupons];
    updateCouponsState(updated);
    setShowAddModal(false);
    setFormData(initialForm);
    triggerToast(`Coupon "${cleanCode}" created & active across platform!`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    const updated = coupons.map((c) => {
      if (c.id === formData.id) {
        return {
          ...formData,
          code: cleanCode,
          minOrder: Number(formData.minOrder) || 0,
          discountPercent: Number(formData.discountPercent) || 0,
          discountAmount: Number(formData.discountAmount) || 0,
          maxDiscount: Number(formData.maxDiscount) || 0,
        };
      }
      return c;
    });

    updateCouponsState(updated);
    setShowEditModal(false);
    triggerToast(`Coupon "${cleanCode}" updated successfully.`);
  };

  const handleRunSimulator = () => {
    const res = validateAndApplyCoupon(simCode, Number(simAmount) || 0);
    setSimResult(res);
  };

  // Filtered List
  const filtered = coupons.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === "All" || c.type === typeFilter;
    const matchStatus = statusFilter === "All" || c.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const totalCoupons = coupons.length;
  const activeCount = coupons.filter((c) => c.status === "Active").length;
  const totalSavings = coupons.reduce((sum, c) => sum + (c.totalSavingsGranted || 0), 0);
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

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
            <FaTicketAlt style={{ color: "var(--ad-primary)" }} /> Coupons &amp; Promo Codes
          </h2>
          <p>Create, configure, and monitor platform promotional discount vouchers and free-delivery codes</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={() => { setFormData(initialForm); setShowAddModal(true); }}>
          <FaPlus /> Create New Coupon
        </button>
      </div>

      {/* KPI Stats */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaTicketAlt /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Active Promo Codes</span>
            <h3 className="ad-kpi-value">{activeCount} / {totalCoupons}</h3>
            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "600" }}>Ready in Checkout</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaMoneyBillWave /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Total Customer Savings</span>
            <h3 className="ad-kpi-value">₹{totalSavings.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">Promotional Impact</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}><FaTag /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Times Redeemed</span>
            <h3 className="ad-kpi-value">{totalRedemptions} Orders</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Platform Total</span>
          </div>
        </div>
      </div>

      {/* Grid: Coupons Table + Live Simulator */}
      <div className="ad-grid-3">
        {/* Main Coupons List (2 cols) */}
        <div className="ad-card" style={{ gridColumn: "span 2" }}>
          <div className="ad-card-header">
            <h3 className="ad-card-title">Configured Promo Vouchers</h3>
          </div>

          <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "200px" }}>
              <FaSearch className="ad-search-icon" />
              <input
                type="text"
                placeholder="Search coupon code, title..."
                className="ad-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="ad-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "135px" }}
            >
              <option value="All">All Types</option>
              <option value="percent">Percentage %</option>
              <option value="flat">Flat Amount</option>
              <option value="freedelivery">Free Delivery</option>
            </select>

            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "120px" }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Code &amp; Badge</th>
                  <th>Title &amp; Benefit</th>
                  <th>Min Order</th>
                  <th>Redemptions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cpn) => {
                    const isActive = cpn.status === "Active";
                    return (
                      <tr key={cpn.id} style={{ opacity: isActive ? 1 : 0.65 }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <strong className="ad-id-badge" style={{ fontSize: "0.85rem", letterSpacing: "0.5px" }}>
                              {cpn.code}
                            </strong>
                            <button
                              className="ad-btn ad-btn-outline"
                              style={{ padding: "0.2rem 0.35rem", fontSize: "0.7rem" }}
                              onClick={() => copyToClipboard(cpn.code)}
                              title="Copy Code"
                            >
                              <FaCopy />
                            </button>
                          </div>
                          {cpn.badge && (
                            <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#d97706", padding: "0.1rem 0.4rem", borderRadius: "4px", fontWeight: "700", display: "inline-block", marginTop: "3px" }}>
                              {cpn.badge}
                            </span>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: "var(--ad-text-primary)" }}>{cpn.title}</strong>
                          <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--ad-text-secondary)" }}>
                            {cpn.description}
                          </p>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                            {cpn.minOrder > 0 ? `₹${cpn.minOrder}` : "No Min"}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.85rem" }}>{cpn.usageCount || 0} times</span>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>
                            Saved: ₹{(cpn.totalSavingsGranted || 0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(cpn.id)}
                            className={`ad-pill ${isActive ? "ad-pill-success" : "ad-pill-danger"}`}
                            style={{
                              background: isActive ? "#dcfce7" : "#fee2e2",
                              color: isActive ? "#16a34a" : "#dc2626",
                              cursor: "pointer",
                              border: "none"
                            }}
                            title="Click to Toggle Active/Inactive"
                          >
                            {cpn.status}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <button
                              className="ad-btn ad-btn-secondary"
                              style={{ padding: "0.35rem", borderRadius: "6px" }}
                              onClick={() => {
                                setFormData({ ...cpn });
                                setShowEditModal(true);
                              }}
                              title="Edit Coupon"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="ad-btn ad-btn-danger"
                              style={{ padding: "0.35rem", borderRadius: "6px" }}
                              onClick={() => handleDelete(cpn.id, cpn.code)}
                              title="Delete Coupon"
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

        {/* Live Coupon Simulator (1 col) */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title"><FaPlay /> Test Coupon Logic</h3>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--ad-text-secondary)", marginBottom: "1rem" }}>
            Simulate real patient cart discount math against active rules in real-time.
          </p>

          <div className="ad-form-group">
            <label>Coupon Code to Test</label>
            <input
              type="text"
              className="ad-input"
              value={simCode}
              onChange={(e) => setSimCode(e.target.value.toUpperCase())}
              placeholder="e.g. MEDI10"
            />
          </div>

          <div className="ad-form-group">
            <label>Cart Subtotal (₹)</label>
            <input
              type="number"
              min="0"
              className="ad-input"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
            />
          </div>

          <button
            className="ad-btn ad-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginBottom: "1.25rem" }}
            onClick={handleRunSimulator}
          >
            <FaPlay /> Test Validation
          </button>

          {simResult && (
            <div style={{
              background: simResult.success ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${simResult.success ? "#bbf7d0" : "#fecaca"}`,
              padding: "1rem",
              borderRadius: "10px",
              animation: "adFadeIn 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                {simResult.success ? <FaCheckCircle style={{ color: "#16a34a" }} /> : <FaTimes style={{ color: "#dc2626" }} />}
                <strong style={{ fontSize: "0.88rem", color: simResult.success ? "#16a34a" : "#dc2626" }}>
                  {simResult.success ? "Coupon Valid & Applied" : "Validation Failed"}
                </strong>
              </div>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#334155" }}>{simResult.message}</p>
              {simResult.success && (
                <div style={{ fontSize: "0.8rem", borderTop: "1px dashed #cbd5e1", paddingTop: "0.5rem" }}>
                  <div>Discount Granted: <strong>₹{simResult.discount}</strong></div>
                  <div>Final Amount to Pay: <strong>₹{Math.max(0, simAmount - simResult.discount + (simResult.freesDelivery ? 0 : 40))}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Coupon Modal ── */}
      {showAddModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaPlus /> Create New Promo Voucher</h3>
              <button className="ad-modal-close" onClick={() => setShowAddModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="ad-modal-body">
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Coupon Promo Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONSOON25"
                    className="ad-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Display Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. SPECIAL, 25% OFF"
                    className="ad-input"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-form-group">
                <label>Voucher Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Health Savings (25% OFF)"
                  className="ad-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="ad-form-group">
                <label>Description Body</label>
                <input
                  type="text"
                  placeholder="e.g. 25% off up to ₹200 on all medicine orders above ₹499"
                  className="ad-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="ad-grid-3" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Discount Type</label>
                  <select
                    className="ad-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="freedelivery">Free Delivery</option>
                  </select>
                </div>

                {formData.type === "percent" && (
                  <>
                    <div className="ad-form-group">
                      <label>Percent Off (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="ad-input"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      />
                    </div>
                    <div className="ad-form-group">
                      <label>Max Cap (₹)</label>
                      <input
                        type="number"
                        min="1"
                        className="ad-input"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {formData.type === "flat" && (
                  <div className="ad-form-group">
                    <label>Discount Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="ad-input"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Minimum Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="ad-input"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
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

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaPlus /> Publish Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Coupon Modal ── */}
      {showEditModal && (
        <div className="ad-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaEdit /> Edit Coupon: {formData.code}</h3>
              <button className="ad-modal-close" onClick={() => setShowEditModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="ad-modal-body">
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Coupon Promo Code *</label>
                  <input
                    type="text"
                    required
                    className="ad-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="ad-form-group">
                  <label>Display Badge</label>
                  <input
                    type="text"
                    className="ad-input"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-form-group">
                <label>Voucher Title</label>
                <input
                  type="text"
                  required
                  className="ad-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="ad-form-group">
                <label>Description Body</label>
                <input
                  type="text"
                  className="ad-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="ad-grid-3" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Discount Type</label>
                  <select
                    className="ad-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="freedelivery">Free Delivery</option>
                  </select>
                </div>

                {formData.type === "percent" && (
                  <>
                    <div className="ad-form-group">
                      <label>Percent Off (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="ad-input"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      />
                    </div>
                    <div className="ad-form-group">
                      <label>Max Cap (₹)</label>
                      <input
                        type="number"
                        min="1"
                        className="ad-input"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {formData.type === "flat" && (
                  <div className="ad-form-group">
                    <label>Discount Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      className="ad-input"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Minimum Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="ad-input"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
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
