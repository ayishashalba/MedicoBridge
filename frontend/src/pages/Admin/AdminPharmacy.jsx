import React, { useState, useEffect } from "react";
import {
  FaPills,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaTrashAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaEye,
  FaFlask,
  FaBuilding,
  FaFileContract,
  FaUndoAlt,
} from "react-icons/fa";
import {
  getStoredMedicines,
  saveMedicines,
} from "../../utils/adminData";
import "./AdminPages.css";

const statusColors = {
  Approved: { bg: "#dcfce7", color: "#16a34a", icon: <FaCheckCircle /> },
  "Pending Review": { bg: "#fef3c7", color: "#d97706", icon: <FaExclamationTriangle /> },
  Rejected: { bg: "#f1f5f9", color: "#64748b", icon: <FaTimesCircle /> },
  Blocked: { bg: "#fee2e2", color: "#dc2626", icon: <FaBan /> },
};

export default function AdminPharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pharmacyFilter, setPharmacyFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");

  // Modals & Action states
  const [selectedMed, setSelectedMed] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [targetMed, setTargetMed] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

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

  // 1. Approve Medicine
  const handleApprove = (medId) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = medicines.map((m) => {
      if (m.id === medId) {
        return {
          ...m,
          approvalStatus: "Approved",
          reviewedDate: today,
          banReason: null,
          labVerificationStatus: "Passed (Platform Verified)",
        };
      }
      return m;
    });
    updateMedState(updated);
    if (selectedMed && selectedMed.id === medId) {
      setSelectedMed(updated.find((m) => m.id === medId));
    }
    triggerToast(`Medicine verified & approved for platform catalog.`);
  };

  // 2. Reject Submission
  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!targetMed) return;

    const today = new Date().toISOString().split("T")[0];
    const updated = medicines.map((m) => {
      if (m.id === targetMed.id) {
        return {
          ...m,
          approvalStatus: "Rejected",
          reviewedDate: today,
          banReason: actionReason || "Rejected by Drug Safety Administrator.",
        };
      }
      return m;
    });
    updateMedState(updated);
    setShowRejectModal(false);
    setTargetMed(null);
    setActionReason("");
    triggerToast(`Submission rejected and pharmacy notified.`);
  };

  // 3. Block / Ban Drug (Counterfeit / State Ban / Poor Quality)
  const handleBlockSubmit = (e) => {
    e.preventDefault();
    if (!targetMed) return;

    const today = new Date().toISOString().split("T")[0];
    const updated = medicines.map((m) => {
      if (m.id === targetMed.id) {
        return {
          ...m,
          approvalStatus: "Blocked",
          reviewedDate: today,
          banReason: actionReason || "Enforced Drug Recall / Substandard Assay / State Ban.",
        };
      }
      return m;
    });
    updateMedState(updated);
    setShowBlockModal(false);
    setTargetMed(null);
    setActionReason("");
    triggerToast(`DRUG BLOCKED: "${targetMed.name}" banned platform-wide.`);
  };

  // 4. Delist / Delete
  const handleDelete = (id, name) => {
    if (window.confirm(`Permanently delist and remove "${name}" from platform compliance database?`)) {
      const updated = medicines.filter((m) => m.id !== id);
      updateMedState(updated);
      if (selectedMed && selectedMed.id === id) {
        setSelectedMed(null);
      }
      triggerToast(`Delisted "${name}" from platform registry.`);
    }
  };

  // Filtered List
  const filtered = medicines.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(search.toLowerCase())) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase())) ||
      (m.submittingPharmacy && m.submittingPharmacy.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "All" || m.approvalStatus === statusFilter;
    const matchCategory = categoryFilter === "All" || m.category === categoryFilter;
    const matchPharmacy = pharmacyFilter === "All" || m.submittingPharmacy.includes(pharmacyFilter);
    const matchRx = rxFilter === "All" || (rxFilter === "Rx" ? m.requiresPrescription : !m.requiresPrescription);

    return matchSearch && matchStatus && matchCategory && matchPharmacy && matchRx;
  });

  // KPI Metrics
  const totalDrugs = medicines.length;
  const pendingReviewCount = medicines.filter((m) => m.approvalStatus === "Pending Review").length;
  const approvedCount = medicines.filter((m) => m.approvalStatus === "Approved").length;
  const blockedCount = medicines.filter((m) => m.approvalStatus === "Blocked").length;

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
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "adFadeIn 0.3s ease"
        }}>
          <FaShieldAlt style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaShieldAlt style={{ color: "var(--ad-primary)" }} /> Medicine Verification &amp; Drug Safety Authority
        </h2>
        <p>Platform regulatory governance: Inspect pharmacy-submitted medicines, verify manufacturer credentials &amp; batch assays, and approve, reject, or ban substandard/state-blocked drugs</p>
      </div>

      {/* KPI Stats Row */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaPills /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Cataloged Drugs</span>
            <h3 className="ad-kpi-value">{totalDrugs} Drugs</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Across All Pharmacies</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}><FaExclamationTriangle /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Pending Verification</span>
            <h3 className="ad-kpi-value" style={{ color: pendingReviewCount > 0 ? "#d97706" : "inherit" }}>
              {pendingReviewCount} Awaiting Review
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "600" }}>Action Required</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaCheckCircle /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Approved &amp; Active</span>
            <h3 className="ad-kpi-value">{approvedCount} Listed</h3>
            <span className="ad-kpi-delta up">Compliant with DCGI</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaBan /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Blocked / Banned</span>
            <h3 className="ad-kpi-value" style={{ color: blockedCount > 0 ? "#dc2626" : "inherit" }}>
              {blockedCount} Banned
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: "600" }}>Platform Delisted</span>
          </div>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="ad-card">
        {/* Search & Filter Toolbar */}
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search by drug name, generic formula, batch, manufacturer, pharmacy..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "165px" }}
            >
              <option value="All">All Approval Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked / Banned</option>
            </select>

            <select
              className="ad-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "135px" }}
            >
              <option value="All">All Categories</option>
              <option value="Tablet">Tablets</option>
              <option value="Capsule">Capsules</option>
              <option value="Supplement">Supplements</option>
              <option value="Injection">Injections</option>
              <option value="Syrup">Syrups</option>
            </select>

            <select
              className="ad-select"
              value={pharmacyFilter}
              onChange={(e) => setPharmacyFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="All">All Pharmacies</option>
              <option value="MedPlus">MedPlus</option>
              <option value="Apollo">Apollo</option>
              <option value="Aster">Aster</option>
            </select>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Drug &amp; Generic Formula</th>
                <th>Manufacturer &amp; License</th>
                <th>Batch No. &amp; Expiry</th>
                <th>Submitting Pharmacy</th>
                <th>Prescription</th>
                <th>Regulatory Status</th>
                <th>Compliance Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((med) => {
                  const sc = statusColors[med.approvalStatus] || { bg: "#f1f5f9", color: "#64748b" };
                  const isBlocked = med.approvalStatus === "Blocked";
                  const isPending = med.approvalStatus === "Pending Review";

                  return (
                    <tr key={med.id} style={{ background: isBlocked ? "#fff5f5" : isPending ? "#fffdf5" : "inherit" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <span style={{ fontSize: "1.3rem" }}>{med.emoji || "💊"}</span>
                          <div>
                            <strong style={{ display: "block", color: "var(--ad-text-primary)" }}>{med.name}</strong>
                            <span style={{ display: "block", fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>
                              {med.genericName || med.brand} · {med.category}
                            </span>
                            <span className="ad-id-badge" style={{ fontSize: "0.68rem", marginTop: "2px" }}>{med.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{med.manufacturer}</strong>
                          <code style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "2px" }}>
                            {med.manufacturerLicense}
                          </code>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: "0.78rem", background: "var(--ad-bg-secondary)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                          {med.batchNumber}
                        </code>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "2px" }}>
                          Exp: {med.expiryDate}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{med.submittingPharmacy}</strong>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                            {med.pharmacyType} ({med.pharmacyCity})
                          </span>
                        </div>
                      </td>
                      <td>
                        {med.requiresPrescription ? (
                          <span style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#6d28d9", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: "700" }}>
                            Rx (Prescription)
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", background: "#e0f2fe", color: "#0284c7", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: "600" }}>
                            OTC
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="ad-pill" style={{ background: sc.bg, color: sc.color, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {sc.icon} {med.approvalStatus}
                        </span>
                        {med.banReason && (
                          <span style={{ display: "block", fontSize: "0.68rem", color: "#dc2626", marginTop: "3px", maxWidth: "160px" }}>
                            {med.banReason}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                          <button
                            className="ad-btn ad-btn-primary"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            onClick={() => setSelectedMed(med)}
                            title="Inspect Complete Drug Dossier"
                          >
                            <FaEye /> Inspect
                          </button>

                          {med.approvalStatus !== "Approved" && (
                            <button
                              className="ad-btn"
                              style={{ background: "#dcfce7", color: "#15803d", padding: "0.3rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px", border: "none" }}
                              onClick={() => handleApprove(med.id)}
                              title="Approve for platform catalog"
                            >
                              <FaCheckCircle /> Approve
                            </button>
                          )}

                          {med.approvalStatus !== "Rejected" && med.approvalStatus !== "Blocked" && (
                            <button
                              className="ad-btn"
                              style={{ background: "#fef3c7", color: "#b45309", padding: "0.3rem 0.55rem", fontSize: "0.75rem", borderRadius: "6px", border: "none" }}
                              onClick={() => { setTargetMed(med); setShowRejectModal(true); }}
                              title="Reject submission"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          )}

                          {med.approvalStatus !== "Blocked" ? (
                            <button
                              className="ad-btn ad-btn-danger"
                              style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem" }}
                              onClick={() => { setTargetMed(med); setShowBlockModal(true); }}
                              title="Block & Ban Drug Platform-wide"
                            >
                              <FaBan /> Block/Ban
                            </button>
                          ) : (
                            <button
                              className="ad-btn ad-btn-outline"
                              style={{ padding: "0.3rem 0.55rem", fontSize: "0.75rem" }}
                              onClick={() => handleApprove(med.id)}
                              title="Unblock Drug"
                            >
                              <FaUndoAlt /> Unblock
                            </button>
                          )}

                          <button
                            className="ad-btn ad-btn-outline"
                            style={{ padding: "0.3rem 0.45rem", fontSize: "0.75rem", color: "#dc2626" }}
                            onClick={() => handleDelete(med.id, med.name)}
                            title="Permanently Delist Drug"
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

      {/* ── Drug Dossier Inspection Modal ── */}
      {selectedMed && (
        <div className="ad-modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div className="ad-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{selectedMed.emoji || "💊"}</span>
                <div>
                  <h3 className="ad-modal-title" style={{ margin: 0 }}>Drug Verification Dossier: {selectedMed.name}</h3>
                  <span className="ad-id-badge" style={{ marginTop: "3px" }}>{selectedMed.id}</span>
                </div>
              </div>
              <button className="ad-modal-close" onClick={() => setSelectedMed(null)}><FaTimes /></button>
            </div>

            <div className="ad-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Status Banner */}
              <div style={{
                background: statusColors[selectedMed.approvalStatus]?.bg,
                color: statusColors[selectedMed.approvalStatus]?.color,
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "700"
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {statusColors[selectedMed.approvalStatus]?.icon} Verification Status: {selectedMed.approvalStatus}
                </span>
                <span style={{ fontSize: "0.82rem" }}>
                  Lab Status: {selectedMed.labVerificationStatus || "Verified"}
                </span>
              </div>

              {selectedMed.banReason && (
                <div style={{ background: "#fee2e2", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "8px", color: "#dc2626", fontSize: "0.85rem" }}>
                  <strong>Enforcement Notice:</strong> {selectedMed.banReason}
                </div>
              )}

              {/* Formulation & Chemistry */}
              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaFlask /> Active Formulation &amp; Category
                  </h4>
                  <p style={{ margin: "0 0 0.2rem", fontWeight: "700" }}>{selectedMed.genericName}</p>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Form: {selectedMed.category} · Brand: {selectedMed.brand}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Classification: {selectedMed.requiresPrescription ? "Schedule H (Prescription Required)" : "General Sale / OTC"}
                  </p>
                </div>

                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaBuilding /> Manufacturing Credentials
                  </h4>
                  <p style={{ margin: "0 0 0.2rem", fontWeight: "700" }}>{selectedMed.manufacturer}</p>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Mfg License: <code>{selectedMed.manufacturerLicense}</code>
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Batch: <strong>{selectedMed.batchNumber}</strong> · Expiry: <strong>{selectedMed.expiryDate}</strong>
                  </p>
                </div>
              </div>

              {/* Submitting Pharmacy Details */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--ad-border-color)", padding: "1rem", borderRadius: "10px" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <FaFileContract /> Submitting Pharmacy Entity
                </h4>
                <div className="ad-grid-3" style={{ gap: "0.5rem", fontSize: "0.82rem" }}>
                  <div>
                    <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Dispensary</span>
                    <strong>{selectedMed.submittingPharmacy}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Type &amp; Region</span>
                    <strong>{selectedMed.pharmacyType} ({selectedMed.pharmacyCity})</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Submitted On</span>
                    <strong>{selectedMed.submittedDate}</strong>
                  </div>
                </div>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1rem" }}>
                {selectedMed.approvalStatus !== "Approved" && (
                  <button
                    type="button"
                    className="ad-btn"
                    style={{ background: "#dcfce7", color: "#15803d" }}
                    onClick={() => handleApprove(selectedMed.id)}
                  >
                    <FaCheckCircle /> Approve for Platform Listing
                  </button>
                )}

                {selectedMed.approvalStatus !== "Blocked" && (
                  <button
                    type="button"
                    className="ad-btn ad-btn-danger"
                    onClick={() => {
                      setTargetMed(selectedMed);
                      setShowBlockModal(true);
                    }}
                  >
                    <FaBan /> Block/Ban Drug
                  </button>
                )}

                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setSelectedMed(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div className="ad-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaTimesCircle style={{ color: "#d97706" }} /> Reject Medicine Submission</h3>
              <button className="ad-modal-close" onClick={() => setShowRejectModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleRejectSubmit} className="ad-modal-body">
              <p style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                Rejecting submission of <strong>{targetMed?.name}</strong> from <strong>{targetMed?.submittingPharmacy}</strong>.
              </p>
              <div className="ad-form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  rows="3"
                  required
                  className="ad-textarea"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Missing manufacturer assay certificate / Expired license documentation"
                />
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn" style={{ background: "#fef3c7", color: "#b45309" }}>Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Block / Ban Drug Modal ── */}
      {showBlockModal && (
        <div className="ad-modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title" style={{ color: "#dc2626" }}><FaBan /> Enforce Drug Ban / Platform Block</h3>
              <button className="ad-modal-close" onClick={() => setShowBlockModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleBlockSubmit} className="ad-modal-body">
              <p style={{ fontSize: "0.85rem", color: "#dc2626" }}>
                Warning: Blocking <strong>{targetMed?.name}</strong> (Batch: {targetMed?.batchNumber}) will immediately ban and delist this product across all retail and hospital pharmacies on MedicoBridge.
              </p>
              <div className="ad-form-group">
                <label>Regulatory Ban Reason / Defect Flag *</label>
                <textarea
                  rows="3"
                  required
                  className="ad-textarea"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Substandard laboratory assay / Counterfeit packaging detected / Central Drug Recall order"
                />
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowBlockModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-danger"><FaBan /> Enforce Platform Ban</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
