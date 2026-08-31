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
  FaSearch,
  FaCalendarAlt,
  FaBolt,
} from "react-icons/fa";
import {
  getStoredCoupons,
  saveStoredCoupons,
  getCouponTimeStatus,
} from "../../utils/coupons";
import {
  getStoredProductOffers,
  saveProductOffers,
  getOfferTimeStatus,
} from "../../utils/productOffers";
import { getStoredMedicines } from "../../utils/adminData";
import "./AdminPages.css";

const couponStatusColors = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Scheduled: { bg: "#fef3c7", color: "#d97706" },
  Expired: { bg: "#fee2e2", color: "#dc2626" },
};

const offerStatusColors = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Scheduled: { bg: "#fef3c7", color: "#d97706" },
  Expired: { bg: "#fee2e2", color: "#dc2626" },
};

export default function AdminCoupons() {
  // Navigation Tabs: 'offers' (System 1) vs 'coupons' (System 2)
  const [activeTab, setActiveTab] = useState("offers");

  // System 1: Product Offers State
  const [productOffers, setProductOffers] = useState([]);
  const [offerSearch, setOfferSearch] = useState("");
  const [offerStatusFilter, setOfferStatusFilter] = useState("All");
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);

  // System 2: Cart Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("All");
  const [couponTypeFilter, setCouponTypeFilter] = useState("All");
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);

  // Common UI State
  const [toastMsg, setToastMsg] = useState("");
  const [medicinesList, setMedicinesList] = useState([]);

  // ── Form State: Product Offers ──
  const initialOfferForm = {
    id: "",
    offerName: "",
    targetType: "product", // 'product', 'category', 'all'
    targetId: 1,
    targetName: "Paracetamol 650mg",
    discountType: "flat", // 'flat' or 'percent'
    discountValue: 5,
    fromDateTime: "2026-08-01T00:00",
    toDateTime: "2026-12-31T23:59",
    badgeText: "",
    status: "Active",
  };
  const [offerFormData, setOfferFormData] = useState(initialOfferForm);

  // ── Form State: Cart Coupons ──
  const initialCouponForm = {
    id: "",
    code: "",
    title: "",
    description: "",
    type: "percent", // percent, flat, freedelivery
    discountPercent: 10,
    discountAmount: 50,
    maxDiscount: 100,
    minOrder: 499,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    status: "Active",
    badge: "SPECIAL",
  };
  const [couponFormData, setCouponFormData] = useState(initialCouponForm);

  useEffect(() => {
    setProductOffers(getStoredProductOffers());
    setCoupons(getStoredCoupons());
    setMedicinesList(getStoredMedicines());
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // ── PRODUCT OFFERS HANDLERS ───────────────────────────────────────

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!offerFormData.offerName) return;

    let targetName = offerFormData.targetName;
    if (offerFormData.targetType === "product") {
      const found = medicinesList.find((m) => Number(m.id?.toString().replace("MED-", "")) === Number(offerFormData.targetId) || m.id === offerFormData.targetId);
      if (found) targetName = found.name;
    }

    const newOffer = {
      ...offerFormData,
      id: `OFFER-${Date.now().toString().slice(-4)}`,
      targetName,
      badgeText: offerFormData.badgeText || (
        offerFormData.discountType === "flat"
          ? `${offerFormData.offerName}: ₹${offerFormData.discountValue} OFF`
          : `${offerFormData.offerName}: ${offerFormData.discountValue}% OFF`
      ),
    };

    const updated = [newOffer, ...productOffers];
    setProductOffers(updated);
    saveProductOffers(updated);
    setShowAddOfferModal(false);
    setOfferFormData(initialOfferForm);
    triggerToast(`Product Offer "${newOffer.offerName}" created & scheduled successfully!`);
  };

  const handleUpdateOffer = (e) => {
    e.preventDefault();
    const updated = productOffers.map((o) => (o.id === offerFormData.id ? offerFormData : o));
    setProductOffers(updated);
    saveProductOffers(updated);
    setShowEditOfferModal(false);
    triggerToast(`Offer "${offerFormData.offerName}" updated.`);
  };

  const handleDeleteOffer = (id, name) => {
    if (window.confirm(`Delete automatic offer "${name}"?`)) {
      const updated = productOffers.filter((o) => o.id !== id);
      setProductOffers(updated);
      saveProductOffers(updated);
      triggerToast(`Offer removed.`);
    }
  };

  // ── CART COUPON HANDLERS ──────────────────────────────────────────

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponFormData.code) return;

    const normalizedCode = couponFormData.code.trim().toUpperCase();
    if (coupons.some((c) => c.code === normalizedCode)) {
      alert(`Coupon code "${normalizedCode}" already exists.`);
      return;
    }

    const newCoupon = {
      ...couponFormData,
      id: `CPN-${Date.now().toString().slice(-4)}`,
      code: normalizedCode,
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    saveStoredCoupons(updated);
    setShowAddCouponModal(false);
    setCouponFormData(initialCouponForm);
    triggerToast(`Cart Coupon "${newCoupon.code}" created & scheduled!`);
  };

  const handleUpdateCoupon = (e) => {
    e.preventDefault();
    const updated = coupons.map((c) => (c.id === couponFormData.id ? couponFormData : c));
    setCoupons(updated);
    saveStoredCoupons(updated);
    setShowEditCouponModal(false);
    triggerToast(`Coupon "${couponFormData.code}" updated.`);
  };

  const handleDeleteCoupon = (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      const updated = coupons.filter((c) => c.id !== id);
      setCoupons(updated);
      saveStoredCoupons(updated);
      triggerToast(`Coupon "${code}" deleted.`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied "${text}" to clipboard!`);
  };

  // Filtered Product Offers
  const filteredOffers = productOffers.filter((off) => {
    const s = offerSearch.toLowerCase();
    const matchSearch =
      off.offerName.toLowerCase().includes(s) ||
      (off.targetName && off.targetName.toLowerCase().includes(s)) ||
      (off.badgeText && off.badgeText.toLowerCase().includes(s));

    const status = getOfferTimeStatus(off, new Date());
    const matchStatus = offerStatusFilter === "All" || status === offerStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered Cart Coupons
  const filteredCoupons = coupons.filter((cpn) => {
    const s = couponSearch.toLowerCase();
    const matchSearch =
      cpn.code.toLowerCase().includes(s) ||
      (cpn.description && cpn.description.toLowerCase().includes(s)) ||
      (cpn.title && cpn.title.toLowerCase().includes(s));

    const status = getCouponTimeStatus(cpn, new Date());
    const matchStatus = couponStatusFilter === "All" || status === couponStatusFilter;
    const matchType = couponTypeFilter === "All" || cpn.type === couponTypeFilter;

    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="ad-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#1e293b",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
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

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaTag style={{ color: "var(--ad-primary)" }} /> Pharmacy Discounts &amp; Offers Management
        </h2>
        <p>Manage automatic product offers (no code required) and cart checkout promo coupons with date-based scheduling</p>
      </div>

      {/* ── Two System Tabs ── */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid var(--ad-border-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className="ad-btn"
          style={{
            background: activeTab === "offers" ? "var(--ad-primary)" : "var(--ad-bg-secondary)",
            color: activeTab === "offers" ? "#fff" : "var(--ad-text-primary)",
            padding: "0.65rem 1.25rem",
            fontWeight: "700",
            fontSize: "0.9rem",
            borderRadius: "8px"
          }}
          onClick={() => setActiveTab("offers")}
        >
          <FaBolt /> 1. Automatic Product Offers ({productOffers.length})
        </button>

        <button
          className="ad-btn"
          style={{
            background: activeTab === "coupons" ? "var(--ad-primary)" : "var(--ad-bg-secondary)",
            color: activeTab === "coupons" ? "#fff" : "var(--ad-text-primary)",
            padding: "0.65rem 1.25rem",
            fontWeight: "700",
            fontSize: "0.9rem",
            borderRadius: "8px"
          }}
          onClick={() => setActiveTab("coupons")}
        >
          <FaTicketAlt /> 2. Cart &amp; Checkout Coupons ({coupons.length})
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: AUTOMATIC PRODUCT OFFERS ──────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "offers" && (
        <>
          {/* Informational Guidance */}
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            color: "#1e40af",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <strong>⚡ Automatic Product Offers:</strong> Applied automatically on medicine cards and detail pages without requiring a coupon code. Prices return to normal automatically after the End Date/Time.
            </div>
            <button className="ad-btn ad-btn-primary" onClick={() => { setOfferFormData(initialOfferForm); setShowAddOfferModal(true); }}>
              <FaPlus /> Create Product Offer
            </button>
          </div>

          {/* Product Offers Main Card */}
          <div className="ad-card">
            <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
                <FaSearch className="ad-search-icon" />
                <input
                  type="text"
                  placeholder="Search offer name, target product, category, badge..."
                  className="ad-input"
                  value={offerSearch}
                  onChange={(e) => setOfferSearch(e.target.value)}
                />
              </div>

              <div className="ad-filters">
                <select
                  className="ad-select"
                  value={offerStatusFilter}
                  onChange={(e) => setOfferStatusFilter(e.target.value)}
                  style={{ width: "160px" }}
                >
                  <option value="All">All Time Statuses</option>
                  <option value="Active">Active (Now)</option>
                  <option value="Scheduled">Scheduled (Future)</option>
                  <option value="Expired">Expired (Past)</option>
                </select>
              </div>
            </div>

            {/* Table of Product Offers */}
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Offer Title &amp; Badge</th>
                    <th>Applies To</th>
                    <th>Discount Value</th>
                    <th>Schedule Window (From → To)</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                        No product offers found.
                      </td>
                    </tr>
                  ) : (
                    filteredOffers.map((off) => {
                      const status = getOfferTimeStatus(off, new Date());
                      const sc = offerStatusColors[status] || { bg: "#f1f5f9", color: "#64748b" };

                      return (
                        <tr key={off.id}>
                          <td>
                            <strong>{off.offerName}</strong>
                            <span style={{ display: "block", fontSize: "0.74rem", color: "#b45309", marginTop: "2px" }}>
                              🏷️ {off.badgeText || "Special Offer"}
                            </span>
                            <span className="ad-id-badge" style={{ fontSize: "0.68rem", marginTop: "3px" }}>{off.id}</span>
                          </td>
                          <td>
                            <strong style={{ textTransform: "capitalize" }}>{off.targetType}:</strong>{" "}
                            <span>{off.targetName || "All Medicines"}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: "700", color: "#16a34a", fontSize: "0.95rem" }}>
                              {off.discountType === "flat" ? `₹${off.discountValue} FLAT OFF` : `${off.discountValue}% OFF`}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.8rem" }}>
                              <div><strong>From:</strong> {off.fromDateTime?.replace("T", " ")}</div>
                              <div><strong>To:</strong> {off.toDateTime?.replace("T", " ")}</div>
                            </div>
                          </td>
                          <td>
                            <span className="ad-pill" style={{ background: sc.bg, color: sc.color }}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                className="ad-btn ad-btn-outline"
                                style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem" }}
                                onClick={() => { setOfferFormData(off); setShowEditOfferModal(true); }}
                                title="Edit Offer"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="ad-btn ad-btn-outline"
                                style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem", color: "#dc2626" }}
                                onClick={() => handleDeleteOffer(off.id, off.offerName)}
                                title="Delete Offer"
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
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: CART & CHECKOUT COUPONS ───────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "coupons" && (
        <>
          {/* Informational Guidance */}
          <div style={{
            background: "#fdf4ff",
            border: "1px solid #f5d0fe",
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            color: "#86198f",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <strong>🎟️ Cart &amp; Checkout Coupons:</strong> Entered by patients only in Cart and Checkout. Scheduled coupons cannot be used before From Date, and expired coupons cannot be used after To Date.
            </div>
            <button className="ad-btn ad-btn-primary" onClick={() => { setCouponFormData(initialCouponForm); setShowAddCouponModal(true); }}>
              <FaPlus /> Create Cart Coupon
            </button>
          </div>

          {/* Coupons Main Card */}
          <div className="ad-card">
            <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
                <FaSearch className="ad-search-icon" />
                <input
                  type="text"
                  placeholder="Search promo code, description, title..."
                  className="ad-input"
                  value={couponSearch}
                  onChange={(e) => setCouponSearch(e.target.value)}
                />
              </div>

              <div className="ad-filters">
                <select
                  className="ad-select"
                  value={couponStatusFilter}
                  onChange={(e) => setCouponStatusFilter(e.target.value)}
                  style={{ width: "160px" }}
                >
                  <option value="All">All Time Statuses</option>
                  <option value="Active">Active (Now)</option>
                  <option value="Scheduled">Scheduled (Future)</option>
                  <option value="Expired">Expired (Past)</option>
                </select>

                <select
                  className="ad-select"
                  value={couponTypeFilter}
                  onChange={(e) => setCouponTypeFilter(e.target.value)}
                  style={{ width: "150px" }}
                >
                  <option value="All">All Types</option>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="freedelivery">Free Delivery</option>
                </select>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Coupon Code &amp; Title</th>
                    <th>Type &amp; Value</th>
                    <th>Min. Order / Cap</th>
                    <th>Validity Period (From → To)</th>
                    <th>Schedule Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                        No cart coupons found.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((cpn) => {
                      const status = getCouponTimeStatus(cpn, new Date());
                      const sc = couponStatusColors[status] || { bg: "#f1f5f9", color: "#64748b" };

                      return (
                        <tr key={cpn.id || cpn.code}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <strong style={{ fontSize: "0.95rem", color: "var(--ad-primary)", letterSpacing: "0.5px" }}>
                                {cpn.code}
                              </strong>
                              <button
                                type="button"
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ad-text-muted)" }}
                                onClick={() => copyToClipboard(cpn.code)}
                                title="Copy code"
                              >
                                <FaCopy />
                              </button>
                            </div>
                            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--ad-text-secondary)", marginTop: "2px" }}>
                              {cpn.description}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {cpn.type === "percent"
                                ? `${cpn.discountPercent || cpn.discountValue}% OFF`
                                : cpn.type === "flat"
                                ? `₹${cpn.discountAmount || cpn.discountValue} OFF`
                                : "Free Delivery"}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.8rem" }}>
                              <div>Min Order: <strong>₹{cpn.minOrder || 0}</strong></div>
                              {cpn.maxDiscount && <div>Max Cap: ₹{cpn.maxDiscount}</div>}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.8rem" }}>
                              <div><strong>From:</strong> {cpn.fromDate || "2026-01-01"}</div>
                              <div><strong>To:</strong> {cpn.toDate || cpn.expiryDate}</div>
                            </div>
                          </td>
                          <td>
                            <span className="ad-pill" style={{ background: sc.bg, color: sc.color }}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                className="ad-btn ad-btn-outline"
                                style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem" }}
                                onClick={() => { setCouponFormData(cpn); setShowEditCouponModal(true); }}
                                title="Edit Coupon"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="ad-btn ad-btn-outline"
                                style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem", color: "#dc2626" }}
                                onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
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
        </>
      )}

      {/* ── ADD PRODUCT OFFER MODAL ── */}
      {showAddOfferModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAddOfferModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaBolt /> Create Automatic Product Offer</h3>
              <button className="ad-modal-close" onClick={() => setShowAddOfferModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateOffer} className="ad-modal-body">
              <div className="ad-form-group">
                <label>Offer Name *</label>
                <input
                  type="text"
                  required
                  className="ad-input"
                  placeholder="e.g. Christmas Special, Monsoon Deal"
                  value={offerFormData.offerName}
                  onChange={(e) => setOfferFormData({ ...offerFormData, offerName: e.target.value })}
                />
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Applies To *</label>
                  <select
                    className="ad-select"
                    value={offerFormData.targetType}
                    onChange={(e) => setOfferFormData({ ...offerFormData, targetType: e.target.value })}
                  >
                    <option value="product">Specific Medicine</option>
                    <option value="category">Medicine Category</option>
                    <option value="all">All Medicines</option>
                  </select>
                </div>

                {offerFormData.targetType === "product" && (
                  <div className="ad-form-group">
                    <label>Target Medicine *</label>
                    <select
                      className="ad-select"
                      value={offerFormData.targetId}
                      onChange={(e) => setOfferFormData({ ...offerFormData, targetId: e.target.value })}
                    >
                      <option value={1}>Paracetamol 650mg</option>
                      <option value={2}>Amoxicillin 500mg</option>
                      <option value={3}>Vitamin C 1000mg</option>
                      <option value={4}>Azithromycin 500mg</option>
                      <option value={5}>Omeprazole 20mg</option>
                    </select>
                  </div>
                )}

                {offerFormData.targetType === "category" && (
                  <div className="ad-form-group">
                    <label>Target Category *</label>
                    <select
                      className="ad-select"
                      value={offerFormData.targetName}
                      onChange={(e) => setOfferFormData({ ...offerFormData, targetName: e.target.value })}
                    >
                      <option value="Tablet">Tablets</option>
                      <option value="Capsule">Capsules</option>
                      <option value="Supplement">Supplements</option>
                      <option value="Syrup">Syrups</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Discount Type *</label>
                  <select
                    className="ad-select"
                    value={offerFormData.discountType}
                    onChange={(e) => setOfferFormData({ ...offerFormData, discountType: e.target.value })}
                  >
                    <option value="flat">Fixed Amount (₹ OFF)</option>
                    <option value="percent">Percentage (% OFF)</option>
                  </select>
                </div>

                <div className="ad-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="ad-input"
                    placeholder={offerFormData.discountType === "flat" ? "e.g. 5" : "e.g. 20"}
                    value={offerFormData.discountValue}
                    onChange={(e) => setOfferFormData({ ...offerFormData, discountValue: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>From Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={offerFormData.fromDateTime}
                    onChange={(e) => setOfferFormData({ ...offerFormData, fromDateTime: e.target.value })}
                  />
                </div>

                <div className="ad-form-group">
                  <label>To Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={offerFormData.toDateTime}
                    onChange={(e) => setOfferFormData({ ...offerFormData, toDateTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-form-group">
                <label>Offer Badge Text (Optional)</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. Christmas Offer: ₹5 OFF"
                  value={offerFormData.badgeText}
                  onChange={(e) => setOfferFormData({ ...offerFormData, badgeText: e.target.value })}
                />
              </div>

              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowAddOfferModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaBolt /> Schedule Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD CART COUPON MODAL ── */}
      {showAddCouponModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAddCouponModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaTicketAlt /> Create Cart &amp; Checkout Promo Coupon</h3>
              <button className="ad-modal-close" onClick={() => setShowAddCouponModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="ad-modal-body">
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    className="ad-input"
                    placeholder="e.g. CHRISTMAS20"
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="ad-form-group">
                  <label>Coupon Type *</label>
                  <select
                    className="ad-select"
                    value={couponFormData.type}
                    onChange={(e) => setCouponFormData({ ...couponFormData, type: e.target.value })}
                  >
                    <option value="percent">Percentage Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                    <option value="freedelivery">Free Delivery</option>
                  </select>
                </div>
              </div>

              <div className="ad-form-group">
                <label>Description *</label>
                <input
                  type="text"
                  required
                  className="ad-input"
                  placeholder="e.g. Flat 20% discount on cart subtotal"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                />
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                {couponFormData.type === "percent" ? (
                  <div className="ad-form-group">
                    <label>Discount Percentage (%) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      className="ad-input"
                      value={couponFormData.discountPercent}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountPercent: Number(e.target.value) })}
                    />
                  </div>
                ) : couponFormData.type === "flat" ? (
                  <div className="ad-form-group">
                    <label>Discount Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="ad-input"
                      value={couponFormData.discountAmount}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountAmount: Number(e.target.value) })}
                    />
                  </div>
                ) : null}

                <div className="ad-form-group">
                  <label>Minimum Order Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="ad-input"
                    value={couponFormData.minOrder}
                    onChange={(e) => setCouponFormData({ ...couponFormData, minOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>From Date (Start Date) *</label>
                  <input
                    type="date"
                    required
                    className="ad-input"
                    value={couponFormData.fromDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, fromDate: e.target.value })}
                  />
                </div>

                <div className="ad-form-group">
                  <label>To Date (Expiry Date) *</label>
                  <input
                    type="date"
                    required
                    className="ad-input"
                    value={couponFormData.toDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, toDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowAddCouponModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaTicketAlt /> Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
