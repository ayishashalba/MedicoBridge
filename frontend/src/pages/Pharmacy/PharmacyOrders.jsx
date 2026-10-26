import React, { useEffect, useState, useCallback } from "react";
import {
  FaShoppingCart,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaSync,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./PharmacyPages.css";

const API_URL = "http://localhost:5000/api/pharmacy/orders";

/* ────────────────────────────────────────────────────────────────
   DB statuses vs Display labels
   DB:      Pending → Confirmed → Processing → Shipped → Delivered
   Display: Order Placed  Confirmed  Packed      Dispatched  Delivered
   ──────────────────────────────────────────────────────────────── */
const DB_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

const STATUS_LABELS = {
  Pending: "Order Placed",
  Confirmed: "Confirmed",
  Processing: "Packed",
  Shipped: "Dispatched",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  "Partially Cancelled": "Partially Cancelled",
};

const NEXT_STATUS = {
  Pending: "Confirmed",
  Confirmed: "Processing",
  Processing: "Shipped",
  Shipped: "Delivered",
};

const statusColor = {
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Shipped: { bg: "#ede9fe", color: "#6d28d9" },
  Processing: { bg: "#e0f2fe", color: "#0284c7" },
  Confirmed: { bg: "#fef3c7", color: "#d97706" },
  Pending: { bg: "#fef9c3", color: "#b45309" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
  "Partially Cancelled": { bg: "#ffedd5", color: "#c2410c" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getOrderId = (order) => order.orderId || order._id || order.id || "—";
const getPatientName = (order) => {
  if (order.patientId && typeof order.patientId === "object") return order.patientId.name || "Unknown Patient";
  return order.patientName || order.patient || "Unknown Patient";
};
const getPatientPhone = (order) => {
  if (order.patientId && typeof order.patientId === "object") return order.patientId.phone || "—";
  return order.phone || "—";
};
const getOrderDate = (order) => {
  const date = order.createdAt || order.orderDate || order.date;
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const getOrderType = (order) => order.orderType || order.deliveryType || order.type || "—";
const getOrderAmount = (order) => Number(order.totalAmount ?? order.amount ?? order.total ?? 0);
const getOrderStatus = (order) => order.orderStatus || order.status || "Pending";
const getOrderItems = (order) => {
  if (Array.isArray(order.items)) return order.items;
  if (Array.isArray(order.medicines)) return order.medicines;
  return [];
};
const getItemName = (item) => {
  if (typeof item === "string") return item;
  if (item.medicineId && typeof item.medicineId === "object") return item.medicineId.name || item.name || "Medicine";
  return item.name || item.medicineName || item.medicine || "Medicine";
};
const getItemQuantity = (item) => item.quantity ?? item.qty ?? 1;

export default function PharmacyOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Status update state
  const [updatingId, setUpdatingId] = useState(null); // orderId being updated
  const [trackingInput, setTrackingInput] = useState(""); // manual tracking override

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found. Please login again.");

      const params = new URLSearchParams();
      if (filter !== "All") params.append("status", filter);
      if (search.trim()) params.append("search", search.trim());
      const queryString = params.toString();

      const response = await fetch(`${API_URL}${queryString ? `?${queryString}` : ""}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch pharmacy orders.");

      const orders = data?.data || [];
      setOrdersData(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error("Failed to fetch pharmacy orders:", err);
      setError(err.message || "Failed to load pharmacy orders.");
      setOrdersData([]);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async (order, newStatus) => {
    if (updatingId) return; // prevent concurrent updates
    const orderId = order._id;
    setUpdatingId(orderId);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated.");

      const body = { orderStatus: newStatus };
      if (trackingInput.trim()) body.trackingNumber = trackingInput.trim();

      const res = await fetch(`${API_URL}/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update order status.");

      const updatedOrder = data?.data;
      toast.success(`Order ${getOrderId(order)} updated to "${STATUS_LABELS[newStatus] || newStatus}"`);

      // Update local state immediately
      setOrdersData((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );
      // Sync selected modal
      if (selected && selected._id === orderId) {
        setSelected((prev) => ({ ...prev, ...updatedOrder }));
      }
      setTrackingInput("");
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filter orders ─────────────────────────────────────────────────────────
  const filtered = ordersData.filter((order) => {
    const orderId = String(getOrderId(order)).toLowerCase();
    const patient = getPatientName(order).toLowerCase();
    const type = getOrderType(order);
    const searchValue = search.toLowerCase();

    const matchSearch = patient.includes(searchValue) || orderId.includes(searchValue);
    const matchFilter = filter === "All" || getOrderStatus(order) === filter;
    const matchType = typeFilter === "All" || type === typeFilter;

    return matchSearch && matchFilter && matchType;
  });

  // ── Summary counts ────────────────────────────────────────────────────────
  const counts = {
    Delivered: ordersData.filter((o) => getOrderStatus(o) === "Delivered").length,
    Shipped: ordersData.filter((o) => getOrderStatus(o) === "Shipped").length,
    Processing: ordersData.filter((o) => getOrderStatus(o) === "Processing").length,
    Pending: ordersData.filter((o) => getOrderStatus(o) === "Pending").length,
  };

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaShoppingCart /> Orders
          </h2>
          <p className="ph-page-sub">
            Track and update all pharmacy orders — pickup and home delivery
          </p>
        </div>

        {/* Summary Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {Object.entries(counts).map(([status, count]) => {
            const sc = statusColor[status] || { bg: "#f1f5f9", color: "#475569" };
            return (
              <span key={status} className="ph-sum-pill" style={{ background: sc.bg, color: sc.color }}>
                {count} {STATUS_LABELS[status] || status}
              </span>
            );
          })}
          <button
            title="Refresh orders"
            onClick={() => fetchOrders()}
            style={{
              background: "transparent",
              border: "1.5px solid #e2e8f0",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ marginBottom: "16px", padding: "12px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input
            placeholder="Search by patient or Order ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option value="Pending">Order Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Packed</option>
            <option value="Shipped">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="ph-filter-box">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option>All</option>
            <option>Home Delivery</option>
            <option>Pickup</option>
            <option>Internal</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="ph-card">
        <div className="ph-table-wrap">
          {loading ? (
            <div className="ph-empty" style={{ padding: "40px", textAlign: "center" }}>
              <FaSpinner className="fa-spin" style={{ fontSize: "1.6rem", color: "#0d9488" }} />
              <p style={{ marginTop: "12px", color: "#64748b" }}>Loading orders...</p>
            </div>
          ) : (
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ph-empty">No orders found.</td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const orderId = getOrderId(order);
                    const patient = getPatientName(order);
                    const phone = getPatientPhone(order);
                    const date = getOrderDate(order);
                    const amount = getOrderAmount(order);
                    const orderStatus = getOrderStatus(order);
                    const nextStatus = NEXT_STATUS[orderStatus];
                    const s = statusColor[orderStatus] || { bg: "#f1f5f9", color: "#475569" };
                    const isUpdating = updatingId === order._id;

                    return (
                      <tr key={String(orderId)}>
                        <td>
                          <span className="ph-id-badge">{orderId}</span>
                        </td>
                        <td>
                          <span className="ph-name">{patient}</span>
                        </td>
                        <td>{phone}</td>
                        <td>{date}</td>
                        <td>
                          <strong>₹{amount.toLocaleString()}</strong>
                        </td>
                        <td>
                          <span className="ph-pill" style={{ background: s.bg, color: s.color }}>
                            {STATUS_LABELS[orderStatus] || orderStatus}
                          </span>
                        </td>
                        <td>
                          {nextStatus && orderStatus !== "Cancelled" && orderStatus !== "Delivered" ? (
                            <button
                              className="ph-btn-view"
                              style={{
                                background: statusColor[nextStatus]?.bg || "#f0fdfa",
                                color: statusColor[nextStatus]?.color || "#0d9488",
                                border: `1.5px solid ${statusColor[nextStatus]?.color || "#0d9488"}`,
                                whiteSpace: "nowrap",
                              }}
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(order, nextStatus)}
                              title={`Advance to ${STATUS_LABELS[nextStatus] || nextStatus}`}
                              id={`status-advance-${orderId}`}
                            >
                              {isUpdating ? (
                                <><FaSpinner className="fa-spin" /> Updating…</>
                              ) : (
                                <>✓ Mark {STATUS_LABELS[nextStatus] || nextStatus}</>
                              )}
                            </button>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                              {orderStatus === "Delivered" ? "✓ Complete" : orderStatus === "Cancelled" ? "Cancelled" : "—"}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="ph-btn-view"
                            onClick={() => { setSelected(order); setTrackingInput(""); }}
                            id={`view-order-${orderId}`}
                          >
                            <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ─────────────────────────────────────────────── */}
      {selected && (
        <div className="ph-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "95%" }}>
            <div className="ph-modal-header">
              <h3>Order — {getOrderId(selected)}</h3>
              <button className="ph-modal-close" onClick={() => setSelected(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="ph-modal-body">
              {/* Info Grid */}
              <div className="ph-modal-info-grid">
                <div>
                  <span className="ph-info-label">Patient</span>
                  <span className="ph-info-val">{getPatientName(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Phone</span>
                  <span className="ph-info-val">{getPatientPhone(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Date</span>
                  <span className="ph-info-val">{getOrderDate(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Type</span>
                  <span className="ph-info-val">{getOrderType(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Amount</span>
                  <span className="ph-info-val">₹{getOrderAmount(selected).toLocaleString()}</span>
                </div>
                <div>
                  <span className="ph-info-label">Tracking #</span>
                  <span className="ph-info-val" style={{ fontWeight: 700, color: "#0d9488" }}>
                    {selected.trackingNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="ph-info-label">Payment</span>
                  <span className="ph-info-val">{selected.paymentMethod || "COD"} — {selected.paymentStatus || "Pending"}</span>
                </div>
                <div>
                  <span className="ph-info-label">Current Status</span>
                  <span
                    className="ph-pill"
                    style={{
                      background: statusColor[getOrderStatus(selected)]?.bg || "#f1f5f9",
                      color: statusColor[getOrderStatus(selected)]?.color || "#475569",
                    }}
                  >
                    {STATUS_LABELS[getOrderStatus(selected)] || getOrderStatus(selected)}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              {selected.deliveryAddress && (
                <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", fontSize: "13.5px" }}>
                  <span className="ph-info-label">Delivery Address</span>
                  <p style={{ margin: "4px 0 0", color: "#334155" }}>
                    {[
                      selected.deliveryAddress.fullName,
                      selected.deliveryAddress.street,
                      selected.deliveryAddress.city,
                      selected.deliveryAddress.state,
                      selected.deliveryAddress.pincode,
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {/* ── Status Update Panel ─── */}
              {!["Cancelled", "Delivered"].includes(getOrderStatus(selected)) && (
                <div style={{
                  marginTop: "20px",
                  padding: "16px",
                  background: "#f0fdfa",
                  border: "1px solid #99f6e4",
                  borderRadius: "12px",
                }}>
                  <h4 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: "14px", fontWeight: 700 }}>
                    📦 Update Delivery Status
                  </h4>

                  {/* Status progression buttons */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {DB_STATUSES.map((status) => {
                      const current = getOrderStatus(selected);
                      const currentIdx = DB_STATUSES.indexOf(current);
                      const thisIdx = DB_STATUSES.indexOf(status);
                      const isDone = thisIdx <= currentIdx;
                      const isNext = thisIdx === currentIdx + 1;
                      const sc = statusColor[status] || { bg: "#f1f5f9", color: "#475569" };
                      const isUpdating = updatingId === selected._id;

                      return (
                        <button
                          key={status}
                          onClick={() => isNext && !isUpdating && handleStatusUpdate(selected, status)}
                          disabled={!isNext || isUpdating}
                          id={`modal-status-${status}`}
                          style={{
                            padding: "7px 14px",
                            borderRadius: "20px",
                            border: isDone ? "none" : `1.5px solid ${isNext ? sc.color : "#e2e8f0"}`,
                            background: isDone ? sc.bg : isNext ? "#fff" : "#f8fafc",
                            color: isDone ? sc.color : isNext ? sc.color : "#94a3b8",
                            fontSize: "13px",
                            fontWeight: isDone || isNext ? 700 : 400,
                            cursor: isNext ? "pointer" : "default",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.2s",
                          }}
                        >
                          {isDone && <FaCheckCircle style={{ fontSize: "11px" }} />}
                          {isUpdating && isNext && <FaSpinner className="fa-spin" style={{ fontSize: "11px" }} />}
                          {STATUS_LABELS[status] || status}
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual tracking number input */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      placeholder="Enter/override tracking number (optional)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        background: "#fff",
                      }}
                      id="tracking-input-modal"
                    />
                    {trackingInput.trim() && (
                      <button
                        onClick={() => handleStatusUpdate(selected, getOrderStatus(selected))}
                        disabled={!!updatingId}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          background: "#0d9488",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                        id="save-tracking-btn"
                      >
                        Save Tracking
                      </button>
                    )}
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "#64748b" }}>
                    A tracking number is automatically generated when you mark as Dispatched.
                  </p>
                </div>
              )}

              {/* Items Ordered */}
              <h4 className="ph-modal-section-title" style={{ marginTop: "20px" }}>Items Ordered</h4>
              <ul className="ph-rx-items">
                {getOrderItems(selected).length === 0 ? (
                  <li>No item details available.</li>
                ) : (
                  getOrderItems(selected).map((item, index) => (
                    <li key={index}>
                      {getItemName(item)} × {getItemQuantity(item)}
                      {item.status === "Cancelled" && (
                        <span style={{ marginLeft: "6px", color: "#dc2626", fontSize: "11px" }}>(Cancelled)</span>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}