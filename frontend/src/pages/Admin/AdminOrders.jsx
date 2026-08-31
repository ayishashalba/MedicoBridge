import React, { useState, useEffect } from "react";
import {
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaFileInvoiceDollar,
  FaShippingFast,
  FaExclamationCircle,
  FaEdit,
} from "react-icons/fa";
import { getStoredOrders, saveOrders } from "../../utils/adminData";
import "./AdminPages.css";

const statusConfig = {
  Placed: { bg: "#f1f5f9", color: "#475569", icon: <FaClock /> },
  Confirmed: { bg: "#ede9fe", color: "#6d28d9", icon: <FaCheckCircle /> },
  Processing: { bg: "#e0f2fe", color: "#0284c7", icon: <FaBoxOpen /> },
  "Out for Delivery": { bg: "#fef3c7", color: "#d97706", icon: <FaShippingFast /> },
  Delivered: { bg: "#dcfce7", color: "#16a34a", icon: <FaCheckCircle /> },
  Cancelled: { bg: "#fee2e2", color: "#dc2626", icon: <FaTimes /> },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Edit status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState("Processing");
  const [courierName, setCourierName] = useState("");
  const [deliveryAgent, setDeliveryAgent] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    setOrders(getStoredOrders());
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const updateOrdersState = (updatedList) => {
    setOrders(updatedList);
    saveOrders(updatedList);
  };

  const openStatusUpdateModal = (order) => {
    setSelectedOrder(order);
    setTargetStatus(order.status);
    setCourierName(order.courierName || "MedicoExpress Courier");
    setDeliveryAgent(order.deliveryAgent || "");
    setAgentPhone(order.agentPhone || "");
    setStatusNote("");
    setShowStatusModal(true);
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const nowStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedTimeline = [...(selectedOrder.timeline || [])];
    const existingStepIndex = updatedTimeline.findIndex((t) => t.status === targetStatus);

    if (existingStepIndex >= 0) {
      updatedTimeline[existingStepIndex] = {
        ...updatedTimeline[existingStepIndex],
        completed: true,
        time: nowStr,
        note: statusNote || updatedTimeline[existingStepIndex].note,
      };
    } else {
      updatedTimeline.push({
        status: targetStatus,
        time: nowStr,
        completed: true,
        note: statusNote || `Status updated to ${targetStatus} by System Administrator`,
      });
    }

    const updated = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: targetStatus,
          courierName,
          deliveryAgent,
          agentPhone,
          timeline: updatedTimeline,
        };
      }
      return o;
    });

    updateOrdersState(updated);
    setSelectedOrder(updated.find((o) => o.id === selectedOrder.id));
    setShowStatusModal(false);
    triggerToast(`Order ${selectedOrder.id} status updated to "${targetStatus}".`);
  };

  // Filtered orders
  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.phone && o.phone.includes(search)) ||
      (o.trackingId && o.trackingId.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    const matchType = typeFilter === "All" || o.orderType === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // KPI Metrics
  const totalOrders = orders.length;
  const processingCount = orders.filter((o) => o.status === "Processing" || o.status === "Placed" || o.status === "Confirmed").length;
  const outForDeliveryCount = orders.filter((o) => o.status === "Out for Delivery").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0), 0);

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
          <FaBoxOpen style={{ color: "var(--ad-primary)" }} /> Orders &amp; Delivery Tracking
        </h2>
        <p>Monitor patient prescriptions, warehouse dispatches, courier handovers, and final delivery milestones</p>
      </div>

      {/* KPI Cards */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0e7ff", color: "#4f46e5" }}><FaBoxOpen /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Total Orders</span>
            <h3 className="ad-kpi-value">{totalOrders}</h3>
            <span style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }}>Platform-wide Volume</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}><FaClock /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Pending / Processing</span>
            <h3 className="ad-kpi-value">{processingCount}</h3>
            <span style={{ fontSize: "0.75rem", color: "#0284c7", fontWeight: "600" }}>Awaiting Dispatch</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#fef3c7", color: "#d97706" }}><FaShippingFast /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Out for Delivery</span>
            <h3 className="ad-kpi-value">{outForDeliveryCount}</h3>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "600" }}>Active Couriers</span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div className="ad-kpi-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><FaFileInvoiceDollar /></div>
          <div className="ad-kpi-body">
            <span className="ad-kpi-label">Order Revenue</span>
            <h3 className="ad-kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</h3>
            <span className="ad-kpi-delta up">{deliveredCount} Fulfilled</span>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="ad-card">
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, tracking ID..."
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
              style={{ width: "160px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="ad-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "160px" }}
            >
              <option value="All">All Types</option>
              <option value="Home Delivery">Home Delivery</option>
              <option value="Store Pickup">Store Pickup</option>
              <option value="Hospital Internal">Hospital Internal</option>
            </select>
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer / Recipient</th>
                <th>Order Type</th>
                <th>Items Count</th>
                <th>Total Bill</th>
                <th>Tracking ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const sc = statusConfig[order.status] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={order.id}>
                      <td>
                        <strong className="ad-id-badge">{order.id}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ad-text-muted)", marginTop: "2px" }}>
                          {order.date} · {order.time}
                        </span>
                      </td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <span style={{ display: "block", fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>
                          {order.phone}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", fontWeight: "600" }}>{order.orderType}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem" }}>{order.items.length} item(s)</span>
                      </td>
                      <td>
                        <strong>₹{order.total}</strong>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "#16a34a", fontWeight: "600" }}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: "0.78rem", background: "var(--ad-bg-secondary)", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>
                          {order.trackingId || "Pending"}
                        </code>
                      </td>
                      <td>
                        <span className="ad-pill" style={{ background: sc.bg, color: sc.color, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          {sc.icon} {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <button
                            className="ad-btn ad-btn-primary"
                            style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem" }}
                            onClick={() => setSelectedOrder(order)}
                            title="View Order & Tracking Details"
                          >
                            <FaTruck /> Track
                          </button>
                          <button
                            className="ad-btn ad-btn-secondary"
                            style={{ padding: "0.35rem", borderRadius: "6px" }}
                            onClick={() => openStatusUpdateModal(order)}
                            title="Update Status / Courier"
                          >
                            <FaEdit />
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

      {/* ── Order Details & Live Tracking Modal ── */}
      {selectedOrder && (
        <div className="ad-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
            <div className="ad-modal-header">
              <div>
                <h3 className="ad-modal-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaTruck style={{ color: "var(--ad-primary)" }} /> Order &amp; Delivery Tracking
                </h3>
                <span className="ad-id-badge" style={{ marginTop: "4px" }}>{selectedOrder.id}</span>
              </div>
              <button className="ad-modal-close" onClick={() => setSelectedOrder(null)}><FaTimes /></button>
            </div>

            <div className="ad-modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Recipient & Courier Header */}
              <div className="ad-grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaUser /> Customer Information
                  </h4>
                  <p style={{ margin: "0 0 0.2rem", fontWeight: "700" }}>{selectedOrder.customerName}</p>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    <FaPhoneAlt style={{ fontSize: "0.7rem" }} /> {selectedOrder.phone}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    <FaMapMarkerAlt style={{ fontSize: "0.7rem" }} /> {selectedOrder.address}
                  </p>
                </div>

                <div style={{ background: "var(--ad-bg-secondary)", padding: "1rem", borderRadius: "10px" }}>
                  <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <FaShippingFast /> Delivery Partner
                  </h4>
                  <p style={{ margin: "0 0 0.2rem", fontWeight: "700" }}>{selectedOrder.courierName}</p>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Tracking ID: <strong>{selectedOrder.trackingId}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                    Agent: {selectedOrder.deliveryAgent} ({selectedOrder.agentPhone})
                  </p>
                </div>
              </div>

              {/* Live Tracking Timeline */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 0.85rem", fontSize: "0.95rem" }}>Delivery Milestone Progress</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", paddingLeft: "0.5rem" }}>
                  {selectedOrder.timeline && selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", position: "relative" }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: step.completed ? "#10b981" : "#e2e8f0",
                        color: step.completed ? "#fff" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        flexShrink: 0,
                        zIndex: 1,
                      }}>
                        {step.completed ? "✓" : idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "0.88rem", color: step.completed ? "var(--ad-text-primary)" : "var(--ad-text-muted)" }}>
                            {step.status}
                          </strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--ad-text-muted)" }}>{step.time}</span>
                        </div>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--ad-text-secondary)" }}>{step.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items Ordered List */}
              <div style={{ borderTop: "1px solid var(--ad-border-color)", paddingTop: "1rem" }}>
                <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Medicines in Order</h4>
                <table className="ad-table" style={{ fontSize: "0.85rem" }}>
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((it, i) => (
                      <tr key={i}>
                        <td><strong>{it.name}</strong></td>
                        <td>{it.quantity}</td>
                        <td>₹{it.price}</td>
                        <td><strong>₹{it.quantity * it.price}</strong></td>
                      </tr>
                    ))}
                    <tr style={{ background: "var(--ad-bg-secondary)", fontWeight: "700" }}>
                      <td colSpan="3" style={{ textAlign: "right" }}>Total Amount (inc. taxes &amp; discounts):</td>
                      <td>₹{selectedOrder.total} ({selectedOrder.paymentStatus})</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={() => openStatusUpdateModal(selectedOrder)}
                >
                  <FaEdit /> Update Order Status / Courier
                </button>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Status & Courier Update Modal ── */}
      {showStatusModal && (
        <div className="ad-modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div className="ad-modal-header">
              <h3 className="ad-modal-title"><FaEdit /> Update Status for {selectedOrder?.id}</h3>
              <button className="ad-modal-close" onClick={() => setShowStatusModal(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleStatusSubmit} className="ad-modal-body">
              <div className="ad-form-group">
                <label>Order Workflow Status *</label>
                <select
                  className="ad-select"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing / Packaging</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="ad-form-group">
                <label>Assigned Courier Partner</label>
                <input
                  type="text"
                  className="ad-input"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. MedicoExpress, BlueDart, Dunzo"
                />
              </div>

              <div className="ad-grid-2" style={{ gap: "1rem" }}>
                <div className="ad-form-group">
                  <label>Delivery Agent Name</label>
                  <input
                    type="text"
                    className="ad-input"
                    value={deliveryAgent}
                    onChange={(e) => setDeliveryAgent(e.target.value)}
                    placeholder="e.g. Suresh Pillai"
                  />
                </div>
                <div className="ad-form-group">
                  <label>Agent Contact Phone</label>
                  <input
                    type="text"
                    className="ad-input"
                    value={agentPhone}
                    onChange={(e) => setAgentPhone(e.target.value)}
                    placeholder="+91 98460 12345"
                  />
                </div>
              </div>

              <div className="ad-form-group">
                <label>Status Update Note / Milestone Comment</label>
                <textarea
                  rows="2"
                  className="ad-textarea"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package dispatched from Central Hub. Expected delivery in 2 hours."
                />
              </div>

              <div className="ad-modal-footer" style={{ marginTop: "1.25rem" }}>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button type="submit" className="ad-btn ad-btn-primary"><FaCheckCircle /> Save &amp; Notify Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
