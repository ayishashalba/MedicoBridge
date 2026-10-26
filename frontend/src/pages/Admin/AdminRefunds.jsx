import React, { useState, useEffect } from "react";
import {
  FaUndo,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaSearch,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUniversity,
  FaQrcode,
  FaMobileAlt,
  FaEye,
  FaTimes,
  FaRedo,
  FaCheck,
  FaBan,
  FaInfoCircle,
  FaShieldAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaFileAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../services/apiConfig";
import "./AdminPages.css";
import "./AdminRefunds.css";

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(dateVal) {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(dateVal) {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    processingCount: 0,
    processingAmount: 0,
    refundedCount: 0,
    totalRefundedAmount: 0,
    rejectedCount: 0,
    rejectedAmount: 0,
    failedCount: 0,
    failedAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // QR Preview Modal
  const [previewQrImage, setPreviewQrImage] = useState(null);

  // Action Confirmation Modals
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'process' | 'retry'
  const [targetRefund, setTargetRefund] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (statusFilter && statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      if (activeSearch.trim()) {
        params.append("search", activeSearch.trim());
      }

      const res = await fetch(`${API_BASE_URL}/refunds/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.data) {
        setRefunds(data.data.refunds || []);
        if (data.data.stats) {
          setStats((prev) => ({
            ...prev,
            ...data.data.stats,
          }));
        }
        setTotalPages(data.data.pages || 1);
      } else {
        toast.error(data.message || "Failed to load refund requests.");
      }
    } catch (err) {
      toast.error("Network error fetching refund requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [statusFilter, activeSearch, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  };

  const handleOpenApproveModal = (refund) => {
    setTargetRefund(refund);
    setActionType("approve");
    setActionNotes("");
  };

  const handleOpenRejectModal = (refund) => {
    setTargetRefund(refund);
    setActionType("reject");
    setRejectionReason("");
    setActionNotes("");
  };

  const handleOpenProcessModal = (refund) => {
    setTargetRefund(refund);
    setActionType("process");
    setSimulateFailure(false);
  };

  const handleOpenRetryModal = (refund) => {
    setTargetRefund(refund);
    setActionType("retry");
    setSimulateFailure(false);
  };

  const handleConfirmAction = async () => {
    if (!targetRefund || !actionType) return;
    try {
      setSubmittingAction(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      let url = "";
      let method = "POST";
      let body = {};

      if (actionType === "approve") {
        url = `${API_BASE_URL}/refunds/admin/${targetRefund._id}/approve`;
        method = "PUT";
        body = { adminNotes: actionNotes };
      } else if (actionType === "reject") {
        if (!rejectionReason.trim()) {
          toast.error("Please provide a reason for rejecting this refund request.");
          setSubmittingAction(false);
          return;
        }
        url = `${API_BASE_URL}/refunds/admin/${targetRefund._id}/reject`;
        method = "PUT";
        body = { reason: rejectionReason.trim(), adminNotes: actionNotes };
      } else if (actionType === "process") {
        url = `${API_BASE_URL}/refunds/admin/${targetRefund._id}/process`;
        method = "POST";
        body = {
          simulateFailure,
          failureReasonText: simulateFailure
            ? "Bank network timeout / IFSC routing unreachable during simulated transfer"
            : "",
        };
      } else if (actionType === "retry") {
        url = `${API_BASE_URL}/refunds/admin/${targetRefund._id}/retry`;
        method = "POST";
        body = {};
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Action ${actionType} completed successfully.`);
        setActionType(null);
        setTargetRefund(null);
        if (detailModalOpen && selectedRefund?._id === targetRefund._id) {
          setDetailModalOpen(false);
          setSelectedRefund(null);
        }
        fetchRefunds();
      } else {
        toast.error(data.message || `Failed to perform ${actionType}.`);
      }
    } catch (err) {
      toast.error("Network error while submitting action.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="ad-status-pill ad-status-pill--pending">
            <FaClock /> Pending Approval
          </span>
        );
      case "Approved":
        return (
          <span className="ad-status-pill ad-status-pill--approved">
            <FaCheck /> Approved (Ready)
          </span>
        );
      case "Processing":
        return (
          <span className="ad-status-pill ad-status-pill--processing">
            <FaSpinner className="fa-spin" /> Processing
          </span>
        );
      case "Refunded":
        return (
          <span className="ad-status-pill ad-status-pill--refunded">
            <FaCheckCircle /> Refunded
          </span>
        );
      case "Rejected":
        return (
          <span className="ad-status-pill ad-status-pill--rejected">
            <FaBan /> Rejected
          </span>
        );
      case "Failed":
        return (
          <span className="ad-status-pill ad-status-pill--failed">
            <FaExclamationTriangle /> Transfer Failed
          </span>
        );
      default:
        return <span className="ad-status-pill">{status || "Unknown"}</span>;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "UPI":
        return <FaMobileAlt style={{ color: "#0284c7" }} />;
      case "Bank Account":
        return <FaUniversity style={{ color: "#0d9488" }} />;
      case "QR Code":
        return <FaQrcode style={{ color: "#7c3aed" }} />;
      default:
        return <FaMoneyBillWave style={{ color: "#64748b" }} />;
    }
  };

  return (
    <div className="ad-page ad-refunds-container">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <div className="ad-page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "0.6rem", margin: "0 0 0.35rem" }}>
              <FaUndo style={{ color: "var(--ad-primary, #6366f1)" }} />
              Refund Management System
            </h2>
            <p style={{ margin: 0 }}>
              Review, approve, and execute simulated refunds for patient cancellations with full audit history.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="ad-refund-simulation-badge">
              <FaShieldAlt style={{ color: "#16a34a" }} /> Demo Gateway Simulation Active
            </span>
            <button
              className="ad-btn ad-btn-outline"
              onClick={fetchRefunds}
              title="Refresh records from database"
              disabled={loading}
              style={{ padding: "0.45rem 0.9rem" }}
            >
              <FaRedo className={loading ? "fa-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          4 SUMMARY CARDS (RESPONSIVE HORIZONTAL GRID)
      ============================================================ */}
      <div className="ad-refund-kpi-grid">
        {/* Card 1: Pending Approval */}
        <div className="ad-refund-kpi-card ad-refund-kpi-card--pending">
          <div className="ad-refund-kpi-icon">
            <FaClock />
          </div>
          <div className="ad-refund-kpi-body">
            <span className="ad-refund-kpi-label">Pending Approval</span>
            <h3 className="ad-refund-kpi-value">{stats.pendingCount || 0}</h3>
            <span className="ad-refund-kpi-subtext" title={formatCurrency(stats.pendingAmount)}>
              {formatCurrency(stats.pendingAmount)} awaiting approval
            </span>
          </div>
        </div>

        {/* Card 2: Approved / Ready */}
        <div className="ad-refund-kpi-card ad-refund-kpi-card--approved">
          <div className="ad-refund-kpi-icon">
            <FaCheckCircle />
          </div>
          <div className="ad-refund-kpi-body">
            <span className="ad-refund-kpi-label">Approved / Ready</span>
            <h3 className="ad-refund-kpi-value">{stats.approvedCount || 0}</h3>
            <span className="ad-refund-kpi-subtext" title={formatCurrency(stats.approvedAmount)}>
              {formatCurrency(stats.approvedAmount)} ready for transfer
            </span>
          </div>
        </div>

        {/* Card 3: Completed Refunds */}
        <div className="ad-refund-kpi-card ad-refund-kpi-card--completed">
          <div className="ad-refund-kpi-icon">
            <FaMoneyBillWave />
          </div>
          <div className="ad-refund-kpi-body">
            <span className="ad-refund-kpi-label">Completed Refunds</span>
            <h3 className="ad-refund-kpi-value">{stats.refundedCount || 0}</h3>
            <span className="ad-refund-kpi-subtext" title={formatCurrency(stats.totalRefundedAmount)}>
              {formatCurrency(stats.totalRefundedAmount)} successfully refunded
            </span>
          </div>
        </div>

        {/* Card 4: Rejected / Failed */}
        <div className="ad-refund-kpi-card ad-refund-kpi-card--rejected">
          <div className="ad-refund-kpi-icon">
            <FaExclamationTriangle />
          </div>
          <div className="ad-refund-kpi-body">
            <span className="ad-refund-kpi-label">Rejected / Failed</span>
            <h3 className="ad-refund-kpi-value">
              {(stats.rejectedCount || 0) + (stats.failedCount || 0)}
            </h3>
            <span className="ad-refund-kpi-subtext">
              {stats.rejectedCount || 0} rejected · {stats.failedCount || 0} failed
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SEARCH & FILTER TOOLBAR
      ============================================================ */}
      <div className="ad-card" style={{ padding: "1.1rem 1.25rem" }}>
        <div className="ad-refund-toolbar">
          {/* Status Tabs */}
          <div className="ad-refund-tabs">
            {[
              { id: "All", label: "All Requests", count: stats.totalRequests },
              { id: "Pending", label: "Pending", count: stats.pendingCount },
              { id: "Approved", label: "Approved", count: stats.approvedCount },
              { id: "Processing", label: "Processing", count: stats.processingCount },
              { id: "Refunded", label: "Refunded", count: stats.refundedCount },
              { id: "Rejected", label: "Rejected", count: stats.rejectedCount },
              { id: "Failed", label: "Failed", count: stats.failedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ad-refund-tab-btn ${statusFilter === tab.id ? "active" : ""}`}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span className="ad-refund-tab-count">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="ad-refund-search-box">
            <div className="ad-search-wrapper" style={{ width: "100%", maxWidth: "100%" }}>
              <FaSearch className="ad-search-icon" />
              <input
                type="text"
                className="ad-input"
                placeholder="Search order, refund ID, patient, UPI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <button type="submit" className="ad-btn ad-btn-primary" style={{ padding: "0.55rem 0.9rem" }}>
              Search
            </button>
            {activeSearch && (
              <button
                type="button"
                className="ad-btn ad-btn-outline"
                onClick={handleClearSearch}
                title="Reset search"
                style={{ padding: "0.55rem 0.75rem" }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ============================================================
          REFUND REQUESTS DATA TABLE
      ============================================================ */}
      <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="ad-refund-table-wrap">
          <table className="ad-refund-table">
            <thead>
              <tr>
                <th>Request & Order ID</th>
                <th>Patient Details</th>
                <th>Cancelled Medicines</th>
                <th>Refund Amount</th>
                <th>Destination Details</th>
                <th>Status</th>
                <th>Date Requested</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--ad-text-secondary)" }}>
                    <FaSpinner className="fa-spin" style={{ fontSize: "1.8rem", color: "var(--ad-primary)", marginBottom: "0.5rem" }} />
                    <div style={{ fontWeight: 600 }}>Loading refund requests...</div>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--ad-text-secondary)" }}>
                    <FaInfoCircle style={{ fontSize: "2rem", color: "var(--ad-text-muted)", marginBottom: "0.5rem" }} />
                    <p style={{ margin: "0.25rem 0", fontWeight: 700, fontSize: "0.95rem" }}>
                      No refund requests found.
                    </p>
                    <span style={{ fontSize: "0.82rem", color: "var(--ad-text-muted)" }}>
                      {activeSearch
                        ? `No results matching "${activeSearch}". Try clearing the search.`
                        : `No refund records found with status filter: ${statusFilter}.`}
                    </span>
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => {
                  const patientName = refund.patientName || refund.orderId?.deliveryAddress?.fullName || "Patient";
                  const patientContact = refund.patientPhone || refund.patientEmail || refund.orderId?.deliveryAddress?.phone || "—";
                  const cancelledItems = Array.isArray(refund.cancelledItems) ? refund.cancelledItems : [];

                  return (
                    <tr key={refund._id}>
                      {/* 1. Request & Order ID */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span className="ad-id-badge" style={{ alignSelf: "flex-start" }}>
                            {refund.refundId || "—"}
                          </span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ad-primary, #6366f1)" }}>
                            Order #{refund.orderNumber || refund.orderId?.orderId || "—"}
                          </span>
                          <span
                            className="ad-pill"
                            style={{
                              alignSelf: "flex-start",
                              background: refund.cancellationType === "Order" ? "#fee2e2" : "#f1f5f9",
                              color: refund.cancellationType === "Order" ? "#b91c1c" : "#475569",
                              fontSize: "0.7rem",
                              padding: "0.15rem 0.45rem",
                            }}
                          >
                            {refund.cancellationType === "Order" ? "Full Order" : "Item-Level"}
                          </span>
                        </div>
                      </td>

                      {/* 2. Patient Details */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <strong style={{ fontSize: "0.88rem", color: "var(--ad-text-primary)" }}>{patientName}</strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--ad-text-secondary)" }}>{patientContact}</span>
                          {refund.patientEmail && refund.patientPhone && (
                            <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)" }}>{refund.patientEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Cancelled Medicines */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxWidth: "230px" }}>
                          {cancelledItems.length > 0 ? (
                            cancelledItems.map((item, idx) => (
                              <div key={idx} style={{ fontSize: "0.82rem", lineHeight: 1.35, whiteSpace: "normal" }}>
                                <strong>• {item.name || "Medicine"}</strong>{" "}
                                <span style={{ color: "var(--ad-text-secondary)" }}>(Qty: {item.quantity || 1})</span>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: "0.8rem", color: "var(--ad-text-muted)" }}>Order Cancellation</span>
                          )}
                          {refund.cancellationReason && (
                            <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)", fontStyle: "italic", marginTop: "0.2rem" }}>
                              Reason: {refund.cancellationReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Refund Amount */}
                      <td>
                        <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#047857", whiteSpace: "nowrap" }}>
                          {formatCurrency(refund.refundAmount)}
                        </div>
                      </td>

                      {/* 5. Destination Details */}
                      <td>
                        <div className="ad-refund-dest">
                          <div className="ad-refund-dest-method">
                            {getMethodIcon(refund.refundMethod)}
                            <span>{refund.refundMethod || "None"}</span>
                          </div>

                          {refund.refundMethod === "UPI" && (
                            <div className="ad-refund-dest-detail" style={{ fontWeight: 600, color: "#0369a1" }}>
                              {refund.refundDetails?.upiId || "—"}
                            </div>
                          )}

                          {refund.refundMethod === "Bank Account" && (
                            <div className="ad-refund-dest-detail">
                              {refund.refundDetails?.bankName && (
                                <div style={{ fontWeight: 600 }}>{refund.refundDetails.bankName}</div>
                              )}
                              <div>Acc: {refund.refundDetails?.accountNumberMasked || "••••"}</div>
                              {refund.refundDetails?.ifscCode && (
                                <div style={{ fontSize: "0.72rem" }}>IFSC: {refund.refundDetails.ifscCode}</div>
                              )}
                            </div>
                          )}

                          {refund.refundMethod === "QR Code" && (
                            <div className="ad-refund-dest-detail">
                              {refund.refundDetails?.qrCodeImage ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewQrImage(`http://localhost:5000${refund.refundDetails.qrCodeImage}`)}
                                  className="ad-action-btn-sm ad-action-btn-sm--view"
                                  style={{ padding: "0.25rem 0.55rem", fontSize: "0.74rem" }}
                                >
                                  <FaQrcode /> View QR Code
                                </button>
                              ) : (
                                <span style={{ color: "var(--ad-text-muted)" }}>No QR uploaded</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td>{getStatusBadge(refund.status)}</td>

                      {/* 7. Date Requested */}
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem", color: "var(--ad-text-secondary)" }}>
                        {formatDateTime(refund.createdAt)}
                      </td>

                      {/* 8. Available Admin Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="ad-refund-actions">
                          {/* View Details */}
                          <button
                            type="button"
                            className="ad-action-btn-sm ad-action-btn-sm--view"
                            title="Inspect Complete Details & Audit Trail"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setDetailModalOpen(true);
                            }}
                          >
                            <FaEye /> Details
                          </button>

                          {/* Approve (Only for Pending) */}
                          {refund.status === "Pending" && (
                            <button
                              type="button"
                              className="ad-action-btn-sm ad-action-btn-sm--approve"
                              title="Approve Refund Request"
                              onClick={() => handleOpenApproveModal(refund)}
                            >
                              <FaCheck /> Approve
                            </button>
                          )}

                          {/* Reject (Only for Pending) */}
                          {refund.status === "Pending" && (
                            <button
                              type="button"
                              className="ad-action-btn-sm ad-action-btn-sm--reject"
                              title="Reject Refund Request"
                              onClick={() => handleOpenRejectModal(refund)}
                            >
                              <FaBan /> Reject
                            </button>
                          )}

                          {/* Process Transfer (For Approved) */}
                          {refund.status === "Approved" && (
                            <button
                              type="button"
                              className="ad-action-btn-sm ad-action-btn-sm--process"
                              title="Execute Simulated Payout"
                              onClick={() => handleOpenProcessModal(refund)}
                            >
                              <FaMoneyBillWave /> Process
                            </button>
                          )}

                          {/* Retry (For Failed) */}
                          {refund.status === "Failed" && (
                            <button
                              type="button"
                              className="ad-action-btn-sm ad-action-btn-sm--retry"
                              title="Retry Failed Transfer"
                              onClick={() => handleOpenRetryModal(refund)}
                            >
                              <FaRedo /> Retry
                            </button>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="ad-refund-pagination">
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Previous
            </button>
            <span style={{ fontSize: "0.82rem", color: "var(--ad-text-secondary)", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="ad-btn ad-btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ============================================================
          VIEW DETAILS MODAL
      ============================================================ */}
      {detailModalOpen && selectedRefund && (
        <div className="ad-modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div className="ad-modal" style={{ maxWidth: "650px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaFileAlt style={{ color: "var(--ad-primary)" }} />
                Refund Request Details
              </h3>
              <button type="button" className="ad-modal-close" onClick={() => setDetailModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="ad-modal-body" style={{ padding: "1.25rem 1.5rem" }}>
              {/* Key Info Grid */}
              <div className="ad-refund-detail-grid">
                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Refund Request ID</span>
                  <div className="ad-refund-detail-value">
                    <span className="ad-id-badge">{selectedRefund.refundId || "—"}</span>
                  </div>
                </div>

                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Order Reference</span>
                  <div className="ad-refund-detail-value" style={{ color: "var(--ad-primary)" }}>
                    #{selectedRefund.orderNumber}
                  </div>
                </div>

                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Current Status</span>
                  <div>{getStatusBadge(selectedRefund.status)}</div>
                </div>

                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Refund Amount</span>
                  <div className="ad-refund-detail-value" style={{ color: "#047857", fontSize: "1.2rem" }}>
                    {formatCurrency(selectedRefund.refundAmount)}
                  </div>
                </div>

                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Patient Name</span>
                  <div className="ad-refund-detail-value">{selectedRefund.patientName || "Patient"}</div>
                </div>

                <div className="ad-refund-detail-item">
                  <span className="ad-refund-detail-label">Contact</span>
                  <div style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)" }}>
                    {selectedRefund.patientPhone || "—"} {selectedRefund.patientEmail ? `· ${selectedRefund.patientEmail}` : ""}
                  </div>
                </div>
              </div>

              {/* Cancelled Medicines Table */}
              <div style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", color: "var(--ad-text-primary)" }}>
                  Cancelled Medicines & Recalculation
                </h4>
                <div style={{ border: "1px solid var(--ad-border-color)", borderRadius: "var(--ad-radius-md)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ background: "var(--ad-bg-secondary)", borderBottom: "1px solid var(--ad-border-color)" }}>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "left" }}>Medicine</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>Qty</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Unit Price</th>
                        <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Item Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedRefund.cancelledItems || []).map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--ad-border-color)" }}>
                          <td style={{ padding: "0.6rem 0.8rem" }}>
                            <strong>{it.name}</strong>
                          </td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>{it.quantity}</td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>{formatCurrency(it.unitPrice)}</td>
                          <td style={{ padding: "0.6rem 0.8rem", textAlign: "right", fontWeight: 700 }}>
                            {formatCurrency(it.itemTotal || it.unitPrice * it.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedRefund.cancellationReason && (
                  <div style={{ fontSize: "0.8rem", color: "var(--ad-text-secondary)", marginTop: "0.4rem" }}>
                    <strong>Cancellation Reason:</strong> {selectedRefund.cancellationReason}
                  </div>
                )}
              </div>

              {/* Destination Details */}
              <div style={{ background: "#f8fafc", border: "1px solid var(--ad-border-color)", borderRadius: "var(--ad-radius-md)", padding: "1rem", marginBottom: "1.25rem" }}>
                <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {getMethodIcon(selectedRefund.refundMethod)}
                  Refund Destination: {selectedRefund.refundMethod}
                </h4>

                {selectedRefund.refundMethod === "UPI" && (
                  <div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                    <div>
                      Recipient UPI ID: <strong style={{ color: "#0369a1" }}>{selectedRefund.refundDetails?.upiId || "—"}</strong>
                    </div>
                  </div>
                )}

                {selectedRefund.refundMethod === "Bank Account" && (
                  <div style={{ fontSize: "0.85rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      Account Holder: <strong>{selectedRefund.refundDetails?.accountHolderName || "—"}</strong>
                    </div>
                    <div>
                      Account Number: <strong>{selectedRefund.refundDetails?.accountNumberMasked || "—"}</strong>
                    </div>
                    <div>
                      IFSC Code: <strong>{selectedRefund.refundDetails?.ifscCode || "—"}</strong>
                    </div>
                    {selectedRefund.refundDetails?.bankName && (
                      <div>
                        Bank Name: <strong>{selectedRefund.refundDetails.bankName}</strong>
                      </div>
                    )}
                  </div>
                )}

                {selectedRefund.refundMethod === "QR Code" && (
                  <div style={{ textAlign: "center", padding: "0.5rem" }}>
                    {selectedRefund.refundDetails?.qrCodeImage ? (
                      <div>
                        <img
                          src={`http://localhost:5000${selectedRefund.refundDetails.qrCodeImage}`}
                          alt="Patient UPI QR Code"
                          style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid var(--ad-border-color)" }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)", marginTop: "0.3rem" }}>
                          Uploaded Patient QR Code
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "var(--ad-text-muted)", fontSize: "0.82rem" }}>No QR code image uploaded.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Transaction Reference (if processed) */}
              {selectedRefund.transactionReference && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "var(--ad-radius-md)", padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#065f46" }}>
                  <strong>Transaction Reference (Simulated):</strong> {selectedRefund.transactionReference}
                  <div style={{ fontSize: "0.76rem", color: "#047857", marginTop: "0.25rem" }}>
                    Executed in Demo / Simulation Mode on {formatDateTime(selectedRefund.processedAt || selectedRefund.updatedAt)}
                  </div>
                </div>
              )}

              {/* Rejection / Failure Notice */}
              {selectedRefund.rejectionReason && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--ad-radius-md)", padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#991b1b" }}>
                  <strong>Rejection Reason:</strong> {selectedRefund.rejectionReason}
                </div>
              )}
              {selectedRefund.failureReason && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--ad-radius-md)", padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem", color: "#92400e" }}>
                  <strong>Failure Reason:</strong> {selectedRefund.failureReason}
                </div>
              )}

              {/* Status History / Audit Trail */}
              {Array.isArray(selectedRefund.statusHistory) && selectedRefund.statusHistory.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", color: "var(--ad-text-primary)" }}>
                    Audit Trail & Lifecycle History
                  </h4>
                  <div className="ad-refund-timeline">
                    {selectedRefund.statusHistory.map((hist, idx) => (
                      <div key={idx} className="ad-refund-timeline-item">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                          <strong style={{ color: "var(--ad-text-primary)" }}>{hist.status}</strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>{formatDateTime(hist.timestamp)}</span>
                        </div>
                        <div style={{ color: "var(--ad-text-secondary)", marginTop: "0.15rem" }}>{hist.note}</div>
                        {hist.changedBy && (
                          <div style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "0.1rem" }}>
                            Actor: {hist.changedBy}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="ad-modal-footer" style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {selectedRefund.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="ad-btn ad-btn-primary"
                      onClick={() => handleOpenApproveModal(selectedRefund)}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      type="button"
                      className="ad-btn ad-btn-danger"
                      onClick={() => handleOpenRejectModal(selectedRefund)}
                    >
                      <FaBan /> Reject
                    </button>
                  </>
                )}
                {selectedRefund.status === "Approved" && (
                  <button
                    type="button"
                    className="ad-btn"
                    style={{ background: "#10b981", color: "#fff" }}
                    onClick={() => handleOpenProcessModal(selectedRefund)}
                  >
                    <FaMoneyBillWave /> Process Payout
                  </button>
                )}
                {selectedRefund.status === "Failed" && (
                  <button
                    type="button"
                    className="ad-btn"
                    style={{ background: "#f59e0b", color: "#fff" }}
                    onClick={() => handleOpenRetryModal(selectedRefund)}
                  >
                    <FaRedo /> Retry Transfer
                  </button>
                )}
              </div>
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          QR CODE IMAGE PREVIEW MODAL
      ============================================================ */}
      {previewQrImage && (
        <div className="ad-modal-backdrop" onClick={() => setPreviewQrImage(null)}>
          <div className="ad-modal" style={{ maxWidth: "380px", textAlign: "center", padding: "1.5rem" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ margin: 0 }}>UPI QR Code Preview</h4>
              <button type="button" className="ad-modal-close" onClick={() => setPreviewQrImage(null)}>
                <FaTimes />
              </button>
            </div>
            <img
              src={previewQrImage}
              alt="QR Preview"
              style={{ width: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "10px", border: "1px solid var(--ad-border-color)" }}
            />
            <div style={{ marginTop: "1rem" }}>
              <button type="button" className="ad-btn ad-btn-outline" onClick={() => setPreviewQrImage(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ACTION CONFIRMATION MODALS (Approve / Reject / Process / Retry)
      ============================================================ */}
      {actionType && targetRefund && (
        <div className="ad-modal-backdrop" onClick={() => !submittingAction && setActionType(null)}>
          <div className="ad-modal" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {actionType === "approve" && <><FaCheck style={{ color: "#2563eb" }} /> Approve Refund Request</>}
                {actionType === "reject" && <><FaBan style={{ color: "#dc2626" }} /> Reject Refund Request</>}
                {actionType === "process" && <><FaMoneyBillWave style={{ color: "#10b981" }} /> Process Simulated Payout</>}
                {actionType === "retry" && <><FaRedo style={{ color: "#f59e0b" }} /> Retry Refund Transfer</>}
              </h3>
              <button type="button" className="ad-modal-close" onClick={() => !submittingAction && setActionType(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="ad-modal-body" style={{ padding: "1.25rem 1.5rem" }}>
              {/* Approve Case */}
              {actionType === "approve" && (
                <div>
                  <p style={{ fontSize: "0.88rem", color: "var(--ad-text-secondary)", margin: "0 0 1rem" }}>
                    Are you sure you want to approve this refund of <strong>{formatCurrency(targetRefund.refundAmount)}</strong> for Order <strong>#{targetRefund.orderNumber}</strong>?
                  </p>
                  <div className="ad-form-group">
                    <label>Admin Notes (Optional)</label>
                    <textarea
                      className="ad-textarea"
                      rows="3"
                      placeholder="Add an internal note or communication for the patient..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Reject Case */}
              {actionType === "reject" && (
                <div>
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.85rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#991b1b" }}>
                    Rejecting this refund of <strong>{formatCurrency(targetRefund.refundAmount)}</strong> will notify the patient with the specified reason.
                  </div>
                  <div className="ad-form-group">
                    <label>Reason for Rejection *</label>
                    <textarea
                      className="ad-textarea"
                      rows="3"
                      placeholder="State the regulatory or verification reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ad-form-group">
                    <label>Admin Notes (Optional)</label>
                    <input
                      type="text"
                      className="ad-input"
                      placeholder="Optional internal remarks..."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Process Case */}
              {actionType === "process" && (
                <div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                    <div style={{ fontWeight: 800, color: "#15803d", fontSize: "1.1rem" }}>
                      Simulated Payout: {formatCurrency(targetRefund.refundAmount)}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#166534", marginTop: "0.3rem" }}>
                      Destination: <strong>{targetRefund.refundMethod}</strong> (
                      {targetRefund.refundMethod === "UPI" && targetRefund.refundDetails?.upiId}
                      {targetRefund.refundMethod === "Bank Account" && targetRefund.refundDetails?.accountNumberMasked}
                      {targetRefund.refundMethod === "QR Code" && "UPI QR Code"}
                      )
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#047857", marginTop: "0.4rem", lineHeight: 1.4 }}>
                      ℹ️ This will execute in <strong>Demo / Simulation Mode</strong>. A simulated UTR reference will be recorded in the accounting system without actual bank debit.
                    </div>
                  </div>

                  <div style={{ margin: "1rem 0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.82rem", color: "#b91c1c", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                      />
                      <span>Simulate gateway transfer failure (for testing retry workflow)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Retry Case */}
              {actionType === "retry" && (
                <div>
                  <p style={{ fontSize: "0.88rem", color: "var(--ad-text-secondary)", margin: 0 }}>
                    Retry simulated payout of <strong>{formatCurrency(targetRefund.refundAmount)}</strong> to <strong>{targetRefund.refundMethod}</strong> for Order #{targetRefund.orderNumber}.
                  </p>
                </div>
              )}
            </div>

            <div className="ad-modal-footer" style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                className="ad-btn ad-btn-outline"
                onClick={() => setActionType(null)}
                disabled={submittingAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`ad-btn ${actionType === "reject" ? "ad-btn-danger" : "ad-btn-primary"}`}
                onClick={handleConfirmAction}
                disabled={submittingAction}
              >
                {submittingAction ? (
                  <>
                    <FaSpinner className="fa-spin" /> Processing...
                  </>
                ) : actionType === "approve" ? (
                  "Confirm Approval"
                ) : actionType === "reject" ? (
                  "Confirm Rejection"
                ) : (
                  "Execute Transfer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRefunds;
