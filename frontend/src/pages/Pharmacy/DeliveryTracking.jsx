import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaTruck,
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaSync,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./PharmacyPages.css";

/* ────────────────────────────────────────────────────────────────
   Status mapping:
   DB orderStatus  → Delivery display label (5-step patient timeline)
   Pending         → "Order Placed"
   Confirmed       → "Confirmed"
   Processing      → "Packed"
   Shipped         → "Dispatched"
   Delivered       → "Delivered"
   ──────────────────────────────────────────────────────────────── */
const DISPLAY_STEPS = ["Order Placed", "Confirmed", "Packed", "Dispatched", "Delivered"];

const DB_TO_DISPLAY = {
  Pending: "Order Placed",
  Confirmed: "Confirmed",
  Processing: "Packed",
  Shipped: "Dispatched",
  Delivered: "Delivered",
};

// Next DB status for each current DB status
const NEXT_DB_STATUS = {
  Pending: "Confirmed",
  Confirmed: "Processing",
  Processing: "Shipped",
  Shipped: "Delivered",
};

const DB_STATUS_LABELS = {
  Pending: "Order Placed",
  Confirmed: "Confirmed",
  Processing: "Packed",
  Shipped: "Dispatched",
  Delivered: "Delivered",
};

const statusColor = {
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Dispatched: { bg: "#ede9fe", color: "#6d28d9" },
  Packed: { bg: "#fef3c7", color: "#d97706" },
  Confirmed: { bg: "#dbeafe", color: "#1d4ed8" },
  "Order Placed": { bg: "#fef9c3", color: "#b45309" },
};

// DB status → color (for buttons)
const dbStatusColor = {
  Pending: { bg: "#fef9c3", color: "#b45309" },
  Confirmed: { bg: "#dbeafe", color: "#1d4ed8" },
  Processing: { bg: "#fef3c7", color: "#d97706" },
  Shipped: { bg: "#ede9fe", color: "#6d28d9" },
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
};

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getOrderId = (order) => order?.orderId || order?._id || "—";

const getPatientName = (order) => {
  if (order?.patientId?.name) return order.patientId.name;
  return order?.deliveryAddress?.fullName || "Unknown Patient";
};

const getPatientPhone = (order) =>
  order?.patientId?.phone || order?.deliveryAddress?.phone || "";

const getAddress = (order) => {
  const address = order?.deliveryAddress;
  if (!address) return "Address not available";
  return [address.fullName, address.street, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
};

// DB statuses for the order (for progression display)
const DB_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export default function DeliveryTracking() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All"); // filter by display step
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState("");

  // ── Fetch orders (all non-cancelled, i.e., active deliveries) ─────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token missing.");

      const response = await fetch("http://localhost:5000/api/pharmacy/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch pharmacy orders.");

      const orderData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];

      // Delivery tracking shows active delivery orders only
      const deliveryOrders = orderData.filter(
        (order) =>
          ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"].includes(
            order?.orderStatus
          )
      );

      setOrders(deliveryOrders);
    } catch (err) {
      console.error("Failed to load delivery orders:", err);
      setError(err.message || "Failed to load delivery tracking.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async (order, newDbStatus) => {
    if (updatingId) return;
    const orderId = order._id;
    setUpdatingId(orderId);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated.");

      const body = { orderStatus: newDbStatus };
      if (trackingInput.trim()) body.trackingNumber = trackingInput.trim();

      const res = await fetch(`http://localhost:5000/api/pharmacy/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update order status.");

      const updatedOrder = data?.data;
      toast.success(
        `Order ${getOrderId(order)} → "${DB_STATUS_LABELS[newDbStatus] || newDbStatus}"`
      );

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );
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

  // ── Enrich orders with display info ──────────────────────────────────────
  const deliveries = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      deliveryId: `DEL-${String(order?._id || "").slice(-6).toUpperCase()}`,
      displayStatus: DB_TO_DISPLAY[order?.orderStatus] || "Order Placed",
    }));
  }, [orders]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    return deliveries.filter((delivery) => {
      const patient = getPatientName(delivery).toLowerCase();
      const deliveryId = delivery.deliveryId.toLowerCase();
      const orderId = getOrderId(delivery).toLowerCase();

      const matchSearch =
        !searchText ||
        patient.includes(searchText) ||
        deliveryId.includes(searchText) ||
        orderId.includes(searchText);

      const matchFilter =
        filter === "All" || delivery.displayStatus === filter;

      return matchSearch && matchFilter;
    });
  }, [deliveries, search, filter]);

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaTruck /> Delivery Tracking
          </h2>
          <p className="ph-page-sub">
            Monitor and update live delivery status for all orders
          </p>
        </div>

        <button
          onClick={fetchOrders}
          style={{
            background: "transparent",
            border: "1.5px solid #e2e8f0",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <FaSync /> Refresh
        </button>
      </div>

      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />
          <input
            placeholder="Search by patient, order or delivery ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {DISPLAY_STEPS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* ── Delivery Cards ─────────────────────────────────────────────────── */}
      <div className="ph-delivery-grid">
        {loading ? (
          <div className="ph-empty-state">
            <FaSpinner className="fa-spin" style={{ fontSize: "1.8rem", color: "#0d9488" }} />
            <p style={{ marginTop: "12px", color: "#64748b" }}>Loading deliveries...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ph-empty-state">No deliveries found.</div>
        ) : (
          filtered.map((d) => {
            const status = d.displayStatus;
            const s = statusColor[status] || statusColor["Order Placed"];
            const stepIdx = DISPLAY_STEPS.indexOf(status);
            const currentDbStatus = d.orderStatus || "Pending";
            const nextDbStatus = NEXT_DB_STATUS[currentDbStatus];
            const isUpdating = updatingId === d._id;

            return (
              <div key={d._id} className="ph-delivery-card">
                {/* Card Header */}
                <div className="ph-delivery-card-header">
                  <div>
                    <span className="ph-id-badge">{d.deliveryId}</span>
                    <span className="ph-tag" style={{ marginLeft: "0.5rem" }}>{getOrderId(d)}</span>
                  </div>
                  <span className="ph-pill" style={{ background: s.bg, color: s.color }}>
                    {status}
                  </span>
                </div>

                {/* Patient & Address */}
                <div className="ph-delivery-patient">
                  <strong>{getPatientName(d)}</strong>
                  <span>
                    <FaMapMarkerAlt /> {getAddress(d)}
                  </span>
                </div>

                {/* Meta row */}
                <div className="ph-delivery-meta">
                  <span>Phone: {getPatientPhone(d) || "—"}</span>
                  <span style={{ fontWeight: 700, color: d.trackingNumber ? "#0d9488" : "#94a3b8" }}>
                    Tracking: {d.trackingNumber || "—"}
                  </span>
                  <span>Date: {formatDate(d.createdAt)}</span>
                </div>

                {/* Progress Steps */}
                <div className="ph-step-tracker">
                  {DISPLAY_STEPS.map((step, i) => {
                    const done = i <= stepIdx;
                    return (
                      <div key={step} className={`ph-step ${done ? "ph-step--done" : ""}`}>
                        <div className="ph-step-dot">{done && <FaCheckCircle />}</div>
                        <span className="ph-step-label">{step}</span>
                        {i < DISPLAY_STEPS.length - 1 && (
                          <div className={`ph-step-line ${done && i < stepIdx ? "ph-step-line--done" : ""}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Inline Status Advance Button ─── */}
                {nextDbStatus && currentDbStatus !== "Delivered" && (
                  <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <button
                      onClick={() => !isUpdating && handleStatusUpdate(d, nextDbStatus)}
                      disabled={isUpdating}
                      id={`dt-advance-${d._id}`}
                      style={{
                        padding: "7px 16px",
                        borderRadius: "20px",
                        border: `1.5px solid ${dbStatusColor[nextDbStatus]?.color || "#0d9488"}`,
                        background: dbStatusColor[nextDbStatus]?.bg || "#f0fdfa",
                        color: dbStatusColor[nextDbStatus]?.color || "#0d9488",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isUpdating ? (
                        <><FaSpinner className="fa-spin" /> Updating…</>
                      ) : (
                        <>✓ Mark {DB_STATUS_LABELS[nextDbStatus]}</>
                      )}
                    </button>
                    <button
                      onClick={() => setSelected(d)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "20px",
                        border: "1.5px solid #e2e8f0",
                        background: "#fff",
                        color: "#64748b",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                      id={`dt-detail-${d._id}`}
                    >
                      Details
                    </button>
                  </div>
                )}
                {currentDbStatus === "Delivered" && (
                  <div style={{ marginTop: "10px", fontSize: "13px", color: "#16a34a", fontWeight: 700 }}>
                    <FaCheckCircle /> Delivery Complete
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Detail / Full-Control Modal ────────────────────────────────────── */}
      {selected && (
        <div className="ph-modal-overlay" onClick={() => setSelected(null)}>
          <div className="ph-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px", width: "95%" }}>
            <div className="ph-modal-header">
              <h3>Delivery — {selected.deliveryId || getOrderId(selected)}</h3>
              <button className="ph-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="ph-modal-body">
              <div className="ph-modal-info-grid">
                <div>
                  <span className="ph-info-label">Patient</span>
                  <span className="ph-info-val">{getPatientName(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Order ID</span>
                  <span className="ph-info-val">{getOrderId(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Address</span>
                  <span className="ph-info-val">{getAddress(selected)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Patient Phone</span>
                  <span className="ph-info-val">{getPatientPhone(selected) || "—"}</span>
                </div>
                <div>
                  <span className="ph-info-label">Tracking Number</span>
                  <span className="ph-info-val" style={{ fontWeight: 700, color: "#0d9488" }}>
                    {selected.trackingNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="ph-info-label">Order Date</span>
                  <span className="ph-info-val">{formatDate(selected.createdAt)}</span>
                </div>
                <div>
                  <span className="ph-info-label">Current Status</span>
                  <span
                    className="ph-pill"
                    style={{
                      background: statusColor[selected.displayStatus]?.bg || "#f1f5f9",
                      color: statusColor[selected.displayStatus]?.color || "#475569",
                    }}
                  >
                    {selected.displayStatus || DB_TO_DISPLAY[selected.orderStatus] || selected.orderStatus}
                  </span>
                </div>
              </div>

              {/* ── Tracking step list ─── */}
              <h4 className="ph-modal-section-title">Tracking Steps</h4>
              <ul className="ph-rx-items">
                {DISPLAY_STEPS.map((step, i) => {
                  const done = i <= DISPLAY_STEPS.indexOf(
                    selected.displayStatus || DB_TO_DISPLAY[selected.orderStatus] || "Order Placed"
                  );
                  return (
                    <li
                      key={step}
                      style={{
                        color: done ? "#16a34a" : "#94a3b8",
                        fontWeight: done ? 700 : 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 0",
                      }}
                    >
                      {done ? <FaCheckCircle style={{ color: "#16a34a" }} /> : <span style={{ width: "14px" }}>○</span>}
                      {step}
                    </li>
                  );
                })}
              </ul>

              {/* ── Status Progression Panel ─── */}
              {!["Delivered", "Cancelled"].includes(selected.orderStatus) && (
                <div style={{
                  marginTop: "16px",
                  padding: "14px",
                  background: "#f0fdfa",
                  border: "1px solid #99f6e4",
                  borderRadius: "12px",
                }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                    📦 Advance Delivery Status
                  </h4>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {DB_STATUSES.map((dbStatus) => {
                      const currentIdx = DB_STATUSES.indexOf(selected.orderStatus || "Pending");
                      const thisIdx = DB_STATUSES.indexOf(dbStatus);
                      const isDone = thisIdx <= currentIdx;
                      const isNext = thisIdx === currentIdx + 1;
                      const sc = dbStatusColor[dbStatus] || { bg: "#f1f5f9", color: "#475569" };
                      const isUpdating = updatingId === selected._id;

                      return (
                        <button
                          key={dbStatus}
                          onClick={() => isNext && !isUpdating && handleStatusUpdate(selected, dbStatus)}
                          disabled={!isNext || isUpdating}
                          id={`modal-dt-status-${dbStatus}`}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "18px",
                            border: isDone ? "none" : `1.5px solid ${isNext ? sc.color : "#e2e8f0"}`,
                            background: isDone ? sc.bg : isNext ? "#fff" : "#f8fafc",
                            color: isDone ? sc.color : isNext ? sc.color : "#94a3b8",
                            fontSize: "12.5px",
                            fontWeight: isDone || isNext ? 700 : 400,
                            cursor: isNext ? "pointer" : "default",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {isDone && <FaCheckCircle style={{ fontSize: "11px" }} />}
                          {isUpdating && isNext && <FaSpinner className="fa-spin" style={{ fontSize: "11px" }} />}
                          {DB_STATUS_LABELS[dbStatus]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tracking number override */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      placeholder="Override tracking number (optional)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "7px 12px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        background: "#fff",
                      }}
                      id="dt-tracking-input"
                    />
                    {trackingInput.trim() && (
                      <button
                        onClick={() => handleStatusUpdate(selected, selected.orderStatus)}
                        disabled={!!updatingId}
                        style={{
                          padding: "7px 12px",
                          borderRadius: "8px",
                          background: "#0d9488",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                        id="dt-save-tracking"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              )}
              {selected.orderStatus === "Delivered" && (
                <div style={{ marginTop: "16px", padding: "12px 16px", background: "#f0fdf4", borderRadius: "10px", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle /> Delivered successfully — no further updates needed.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}