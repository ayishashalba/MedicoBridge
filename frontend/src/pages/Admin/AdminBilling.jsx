import React, { useState, useEffect } from "react";
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimes,
  FaPrint,
  FaBell,
  FaUndoAlt,
  FaMoneyBillWave,
  FaExclamationCircle,
  FaEye,
  FaShieldAlt,
  FaUserMd,
  FaHospital,
  FaPills,
  FaUser,
} from "react-icons/fa";
import { getStoredInvoices, saveInvoices } from "../../utils/adminData";
import "./AdminPages.css";

const statusConfig = {
  Paid: { bg: "#dcfce7", color: "#16a34a", icon: <FaCheckCircle /> },
  Pending: { bg: "#fef3c7", color: "#d97706", icon: <FaExclamationCircle /> },
  Overdue: { bg: "#fee2e2", color: "#dc2626", icon: <FaExclamationCircle /> },
  Refunded: { bg: "#ede9fe", color: "#6d28d9", icon: <FaUndoAlt /> },
};

export default function AdminBilling() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    setInvoices(getStoredInvoices());
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateInvoicesState = (updatedList) => {
    setInvoices(updatedList);
    saveInvoices(updatedList);
  };

  // Mark invoice as Paid
  const handleMarkAsPaid = (invId) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = invoices.map((inv) => {
      if (inv.id === invId) {
        return {
          ...inv,
          status: "Paid",
          paidDate: today,
          paymentMethod: inv.paymentMethod.includes("Pending") ? "Admin Recorded (Direct)" : inv.paymentMethod,
          transactionRef: `REC-ADM-${Math.floor(10000 + Math.random() * 90000)}`,
        };
      }
      return inv;
    });
    updateInvoicesState(updated);
    if (selectedInvoice && selectedInvoice.id === invId) {
      setSelectedInvoice(updated.find((i) => i.id === invId));
    }
    triggerToast(`Invoice ${invId} marked as Paid.`);
  };

  // Send Payment Reminder
  const handleSendReminder = (inv) => {
    triggerToast(`Payment reminder dispatched to ${inv.clientName} (${inv.clientEmail}).`);
  };

  // Process Refund
  const handleProcessRefund = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const updated = invoices.map((inv) => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          status: "Refunded",
          transactionRef: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
        };
      }
      return inv;
    });

    updateInvoicesState(updated);
    setSelectedInvoice(updated.find((i) => i.id === selectedInvoice.id));
    setShowRefundModal(false);
    setRefundReason("");
    triggerToast(`Refund processed for ${selectedInvoice.id}.`);
  };

  // Filtered List
  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.serviceDescription.toLowerCase().includes(search.toLowerCase()) ||
      (inv.transactionRef && inv.transactionRef.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    const matchType = typeFilter === "All" || inv.clientType === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // Financial Metrics
  const totalBilled = invoices.reduce((sum, i) => sum + (i.status !== "Refunded" ? i.total : 0), 0);
  const totalCollected = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.total, 0);
  const outstandingBalance = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((sum, i) => sum + i.total, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

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

      <div className="ad-page-header">
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FaFileInvoiceDollar style={{ color: "var(--ad-primary)" }} /> Billing, Invoices &amp; Payments
        </h2>
        <p>Monitor platform fees, subscriptions, e-pharmacy orders, doctor payouts, and tax receipts</p>
      </div>

      {/* KPI Financial Overview */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaMoneyBillWave /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Gross Invoiced Volume</span>
            <h3 className="ad-kpi-value">₹{totalBilled.toLocaleString("en-IN")}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>{invoices.length} Total Tax Invoices</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaCheckCircle /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Total Realized Revenue</span>
            <h3 className="ad-kpi-value">₹{totalCollected.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">Settled to Bank Account</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fee2e2", color: "#dc2626" }}><FaExclamationCircle /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Outstanding / Overdue</span>
            <h3 className="ad-kpi-value" style={{ color: outstandingBalance > 0 ? "#dc2626" : "inherit" }}>
              ₹{outstandingBalance.toLocaleString("en-IN")}
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: "600" }}>
              {overdueCount} Overdue Invoices
            </span>
          </div>
        </div>
      </div>

      {/* Main Invoices Card */}
      <div className="ad-card">
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search invoice ID, client name, service..."
              className="ad-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ad-filters" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <select
              className="ad-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="All">All Client Roles</option>
              <option value="Doctor">Doctors</option>
              <option value="Hospital">Hospitals</option>
              <option value="Pharmacy">Pharmacies</option>
              <option value="Patient">Patients</option>
            </select>

            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "140px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Client / Entity</th>
                <th>Service Description</th>
                <th>Issue / Due Date</th>
                <th>Amount &amp; Tax</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No invoices match the query.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const sc = statusConfig[inv.status] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong className="ad-id-badge">{inv.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{inv.clientName}</strong>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>
                            {inv.clientType} · {inv.clientEmail}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--ad-text-primary)" }}>
                          {inv.serviceDescription}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", display: "block" }}>Issued: {inv.issueDate}</span>
                        <span style={{ fontSize: "0.75rem", color: inv.status === "Overdue" ? "#dc2626" : "var(--ad-text-muted)" }}>
                          Due: {inv.dueDate}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "0.95rem" }}>₹{inv.total.toLocaleString("en-IN")}</strong>
                        {inv.tax > 0 && (
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>
                            GST ₹{inv.tax}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="ad-pill" style={{ background: sc.bg, color: sc.color, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {sc.icon} {inv.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--ad-text-secondary)" }}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <button
                            className="ad-btn ad-btn-primary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                            onClick={() => setSelectedInvoice(inv)}
                            title="View Detailed Tax Invoice"
                          >
                            <FaEye /> View
                          </button>
                          {(inv.status === "Pending" || inv.status === "Overdue") && (
                            <>
                              <button
                                className="ad-btn ad-btn-secondary"
                                style={{ padding: "0.35rem", borderRadius: "6px" }}
                                onClick={() => handleSendReminder(inv)}
                                title="Send Payment Reminder"
                              >
                                <FaBell />
                              </button>
                              <button
                                className="ad-btn"
                                style={{ background: "#dcfce7", color: "#16a34a", padding: "0.35rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }}
                                onClick={() => handleMarkAsPaid(inv.id)}
                                title="Record Manual Payment"
                              >
                                Mark Paid
                              </button>
                            </>
                          )}
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

      {/* ── Tax Invoice Viewer Modal ── */}
      {selectedInvoice && (
        <div className="ad-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div className="ad-modal-header" style={{ borderBottom: "none", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaShieldAlt style={{ color: "var(--ad-primary)", fontSize: "1.2rem" }} />
                <h3 className="ad-modal-title" style={{ margin: 0 }}>Tax Invoice &amp; Payment Statement</h3>
              </div>
              <button className="ad-modal-close" onClick={() => setSelectedInvoice(null)}><FaTimes /></button>
            </div>

            {/* Printable Invoice Container */}
            <div className="ad-modal-body" style={{ background: "#fafafa", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.5rem" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #334155", paddingBottom: "1rem", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.2rem", fontWeight: "800", color: "#1e1b4b" }}>MedicoBridge Digital Health</h3>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                    GSTIN: 32AABCU9603R1ZX · support@medicobridge.com
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="ad-id-badge" style={{ fontSize: "0.9rem" }}>{selectedInvoice.id}</span>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    Date: {selectedInvoice.issueDate}
                  </p>
                </div>
              </div>

              {/* Billed To */}
              <div className="ad-grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Billed To</span>
                  <h4 style={{ margin: "0.2rem 0 0.1rem", fontSize: "0.95rem" }}>{selectedInvoice.clientName}</h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>{selectedInvoice.clientType} Entity</p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>{selectedInvoice.clientEmail}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Payment Details</span>
                  <div style={{ marginTop: "0.2rem" }}>
                    <span className="ad-pill" style={{
                      background: statusConfig[selectedInvoice.status]?.bg,
                      color: statusConfig[selectedInvoice.status]?.color,
                      fontSize: "0.78rem"
                    }}>
                      Status: {selectedInvoice.status}
                    </span>
                  </div>
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "#475569" }}>
                    Ref: <code>{selectedInvoice.transactionRef || "N/A"}</code>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="ad-table" style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th>Service Description</th>
                    <th>Subtotal</th>
                    <th>GST (18%)</th>
                    <th>Discount</th>
                    <th>Net Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>{selectedInvoice.serviceDescription}</strong></td>
                    <td>₹{selectedInvoice.subtotal}</td>
                    <td>₹{selectedInvoice.tax}</td>
                    <td>₹{selectedInvoice.discount}</td>
                    <td><strong>₹{selectedInvoice.total}</strong></td>
                  </tr>
                </tbody>
              </table>

              {/* Summary Breakdown */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "240px", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                    <span>GST (18%):</span>
                    <span>₹{selectedInvoice.tax}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", color: "#16a34a" }}>
                      <span>Discount Applied:</span>
                      <span>-₹{selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderTop: "2px solid #334155", fontWeight: "800", fontSize: "1rem" }}>
                    <span>Grand Total:</span>
                    <span>₹{selectedInvoice.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ad-modal-footer" style={{ marginTop: "1.25rem" }}>
              {selectedInvoice.status === "Paid" && (
                <button
                  type="button"
                  className="ad-btn ad-btn-danger"
                  onClick={() => setShowRefundModal(true)}
                >
                  <FaUndoAlt /> Issue Refund
                </button>
              )}

              {(selectedInvoice.status === "Pending" || selectedInvoice.status === "Overdue") && (
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                >
                  <FaCheckCircle /> Record Payment
                </button>
              )}

              <button
                type="button"
                className="ad-btn ad-btn-outline"
                onClick={() => window.print()}
              >
                <FaPrint /> Print Invoice
              </button>
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Refund Modal ── */}
      {showRefundModal && (
        <div className="ad-modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaUndoAlt /> Process Invoice Refund</h3>
              <button className="ad-modal-close" onClick={() => setShowRefundModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleProcessRefund} className="ad-modal-body">
              <p style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                You are issuing a full refund of <strong>₹{selectedInvoice?.total}</strong> for invoice <strong>{selectedInvoice?.id}</strong>.
              </p>
              <div className="ad-form-group">
                <label>Reason for Refund *</label>
                <textarea
                  rows="3"
                  required
                  className="ad-textarea"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Appointment cancelled by doctor / Duplicate billing"
                />
              </div>
              <div className="ad-modal-footer">
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowRefundModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-danger"><FaUndoAlt /> Confirm &amp; Process Refund</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
