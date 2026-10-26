import React, { useState, useEffect, useMemo } from "react";
import {
    FaClipboardList,
    FaTruck,
    FaCheckCircle,
    FaClock,
    FaEye,
    FaSearch,
    FaTimesCircle,
    FaPills,
    FaCreditCard,
    FaCalendarAlt,
    FaShoppingBag,
    FaBoxOpen,
    FaBan,
    FaArrowRight,
    FaSpinner,
    FaRedo,
    FaTimes,
} from "react-icons/fa";
import "./PatientOrders.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";

const STATUS_CONFIG = {
    Delivered: {
        icon: <FaCheckCircle />,
        className: "delivered",
        label: "Delivered",
        dateLabel: "Delivered on",
    },
    Shipped: {
        icon: <FaTruck />,
        className: "shipped",
        label: "Shipped",
        dateLabel: "Est. Delivery",
    },
    Pending: {
        icon: <FaClock />,
        className: "pending",
        label: "Pending",
        dateLabel: "Est. Delivery",
    },
    Processing: {
        icon: <FaClock />,
        className: "pending",
        label: "Processing",
        dateLabel: "Est. Delivery",
    },
    Confirmed: {
        icon: <FaCheckCircle />,
        className: "confirmed",
        label: "Confirmed",
        dateLabel: "Est. Delivery",
    },
    "Partially Cancelled": {
        icon: <FaBan />,
        className: "partially-cancelled",
        label: "Partially Cancelled",
        dateLabel: "Est. Delivery",
    },
    Cancelled: {
        icon: <FaBan />,
        className: "cancelled",
        label: "Cancelled",
        dateLabel: "Cancelled",
    },
};

const MEDICINE_ICONS = ["💊", "🧪", "💉", "🩺", "🔬", "🩹", "🌡️", "⚕️"];

function getMedicineIcon(name) {
    const hash = (name || "").charCodeAt(0) % MEDICINE_ICONS.length;
    return MEDICINE_ICONS[hash];
}

const FILTER_TABS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

function PatientOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [reorderingId, setReorderingId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }
            const res = await fetch(`${API_BASE_URL}/patient/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const ordersList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            if (res.ok && ordersList.length >= 0) {
                const mapped = ordersList.map((o) => {
                    const rawStatus = o.orderStatus || "Pending";
                    const dateStr = o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                          })
                        : "Recent";
                    const items = (o.items || []).map((i) => i.name || "Medicine");
                    const numTotal = typeof o.totalAmount === "number" ? o.totalAmount : parseFloat(o.totalAmount || 0);
                    return {
                        id: o.orderId || o._id,
                        rawId: o._id,
                        date: dateStr,
                        estimatedDate:
                            rawStatus === "Delivered"
                                ? `Delivered on ${new Date(o.updatedAt || o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                                : rawStatus === "Cancelled"
                                ? "Cancelled"
                                : "1–2 Days (Standard Delivery)",
                        deliveredDate:
                            rawStatus === "Delivered"
                                ? new Date(o.updatedAt || o.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                  })
                                : null,
                        items: items.length > 0 ? items : ["Medicines"],
                        amount: `₹${numTotal}`,
                        payment: o.paymentMethod || "COD",
                        status: rawStatus,
                        isReorder: !!o.isReorder,
                        reorderedFromOrderId: o.reorderedFromOrderId,
                        reorderedFromOrderNumber: o.reorderedFromOrderNumber,
                        refundAmount: o.refundAmount || 0,
                        refundStatus: o.refundStatus || "None",
                    };
                });
                setOrders(mapped);
            } else {
                setOrders([]);
            }
        } catch (err) {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    const handleQuickReorder = async (order) => {
        try {
            setReorderingId(order.id);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }

            const res = await fetch(`${API_BASE_URL}/orders/${order.rawId || order.id}/reorder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (res.ok && data.data) {
                window.dispatchEvent(new CustomEvent("cartUpdated"));
                if (data.data.outOfStockItems && data.data.outOfStockItems.length > 0) {
                    const names = data.data.outOfStockItems.map((i) => i.name).join(", ");
                    toast.warn(`Note: ${names} is currently out of stock and could not be added.`);
                }
                toast.success("Medicines added to your cart with current prices!");
                navigate("/patient/cart", {
                    state: {
                        reorderedFromOrderId: order.rawId,
                        reorderedFromOrderNumber: order.id,
                    },
                });
            } else {
                toast.error(data.message || "Failed to reorder items.");
            }
        } catch (err) {
            toast.error("Network error while reordering.");
        } finally {
            setReorderingId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            let matchesFilter = false;
            if (activeFilter === "All") {
                matchesFilter = true;
            } else if (activeFilter === "Pending") {
                matchesFilter = order.status === "Pending" || order.status === "Confirmed" || order.status === "Processing";
            } else if (activeFilter === "Cancelled") {
                matchesFilter = order.status === "Cancelled" || order.status === "Partially Cancelled";
            } else {
                matchesFilter = order.status === activeFilter;
            }

            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                String(order.id || "").toLowerCase().includes(q) ||
                order.items.some((item) => String(item || "").toLowerCase().includes(q)) ||
                String(order.status || "").toLowerCase().includes(q) ||
                String(order.payment || "").toLowerCase().includes(q) ||
                (order.reorderedFromOrderNumber && String(order.reorderedFromOrderNumber).toLowerCase().includes(q));

            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, orders]);

    const getStatusCount = (status) => {
        if (status === "All") return orders.length;
        if (status === "Pending") {
            return orders.filter((o) => o.status === "Pending" || o.status === "Confirmed" || o.status === "Processing").length;
        }
        if (status === "Cancelled") {
            return orders.filter((o) => o.status === "Cancelled" || o.status === "Partially Cancelled").length;
        }
        return orders.filter((o) => o.status === status).length;
    };

    return (
        <div className="patient-orders">
            {/* Header */}
            <div className="orders-header">
                <div className="orders-header-left">
                    <div className="orders-header-icon">
                        <FaClipboardList />
                    </div>
                    <div>
                        <h1 className="orders-title">My Orders</h1>
                        <p className="orders-subtitle">
                            Track, manage, and reorder all your medicine orders in one place.
                        </p>
                    </div>
                </div>
                <div className="orders-stats-pill">
                    <FaShoppingBag />
                    <span>{orders.length} Total Orders</span>
                </div>
            </div>

            {/* Search + Filters Row */}
            <div className="orders-controls">
                <div className="orders-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="search"
                        className="orders-search-input"
                        placeholder="Search by order ID, medicine, status, reorders…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search orders"
                        id="orders-search-input"
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-btn"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear search"
                        >
                            <FaTimesCircle />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="orders-filter-tabs" role="tablist" aria-label="Filter orders">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab}
                        role="tab"
                        aria-selected={activeFilter === tab}
                        className={`filter-tab ${activeFilter === tab ? "filter-tab--active" : ""} ${tab !== "All" ? `filter-tab--${tab.toLowerCase()}` : ""}`}
                        onClick={() => setActiveFilter(tab)}
                        id={`filter-tab-${tab.toLowerCase()}`}
                    >
                        <span className="filter-tab-label">{tab}</span>
                        <span className="filter-tab-count">{getStatusCount(tab)}</span>
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--primary-color, #0d9488)" }}>
                    <FaSpinner className="fa-spin" style={{ fontSize: "2.2rem", marginBottom: "1rem" }} />
                    <p style={{ color: "#64748b", margin: 0, fontWeight: 500 }}>Loading your orders...</p>
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                        const dateToShow =
                            order.status === "Delivered"
                                ? order.deliveredDate
                                : order.estimatedDate;

                        return (
                            <div className="order-card" key={order.id}>
                                {/* Card Left: Medicine Icons + Info */}
                                <div className="order-card-body">
                                    {/* Medicine thumbnails */}
                                    <div className="order-medicine-thumbnails">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div
                                                className="medicine-thumb"
                                                key={idx}
                                                title={item}
                                                style={{ zIndex: 3 - idx }}
                                            >
                                                {getMedicineIcon(item)}
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="medicine-thumb medicine-thumb--more">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Info */}
                                    <div className="order-info">
                                        <div className="order-info-top">
                                            <div className="order-id-group">
                                                <h3 className="order-id">Order #{order.id}</h3>
                                                {/* Reorder Badge */}
                                                {order.isReorder && (
                                                    <span className="reorder-pill" title={`Reordered from ${order.reorderedFromOrderNumber}`}>
                                                        <FaRedo /> Reorder of #{order.reorderedFromOrderNumber || order.reorderedFromOrderId}
                                                    </span>
                                                )}
                                                {/* Refund Badge */}
                                                {order.refundAmount > 0 && (
                                                    <span className="refund-pill" title={`Refund status: ${order.refundStatus || "Pending"}`}>
                                                        Refund: ₹{order.refundAmount} ({order.refundStatus || "Pending"})
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`status-badge status-badge--${config.className}`}
                                            >
                                                {config.icon}
                                                {config.label}
                                            </span>
                                        </div>

                                        <div className="order-medicines-list">
                                            <FaPills className="order-meta-icon" />
                                            <span>
                                                {order.items.join(" · ")}
                                            </span>
                                        </div>

                                        <div className="order-meta-row">
                                            <div className="order-meta-item">
                                                <FaCalendarAlt className="order-meta-icon" />
                                                <span>Ordered: <strong>{order.date}</strong></span>
                                            </div>
                                            {dateToShow && (
                                                <div className="order-meta-item">
                                                    <FaTruck className="order-meta-icon" />
                                                    <span>
                                                        {config.dateLabel}: <strong>{dateToShow}</strong>
                                                    </span>
                                                </div>
                                            )}
                                            <div className="order-meta-item">
                                                <FaCreditCard className="order-meta-icon" />
                                                <span>{order.payment}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="order-card-footer">
                                    <div className="order-amount">
                                        <span className="order-amount-label">Total Amount</span>
                                        <span className="order-amount-value">{order.amount}</span>
                                    </div>
                                    <div className="order-card-actions">
                                        {/* Quick Reorder button */}
                                        <button
                                            className="quick-reorder-btn"
                                            onClick={() => handleQuickReorder(order)}
                                            disabled={reorderingId === order.id}
                                            id={`reorder-btn-${order.id}`}
                                            title="Add items to cart with current availability"
                                        >
                                            {reorderingId === order.id ? (
                                                <FaSpinner className="fa-spin" />
                                            ) : (
                                                <FaRedo />
                                            )}
                                            <span>Reorder</span>
                                        </button>

                                        {/* Cancel Button */}
                                        {['Pending', 'Confirmed', 'Processing', 'Partially Cancelled'].includes(order.status) ? (
                                            <button
                                                className="quick-cancel-btn"
                                                onClick={() => navigate(`/patient/order-details/${order.id}`)}
                                                id={`cancel-order-btn-${order.id}`}
                                                title="Cancel order or individual medicines"
                                            >
                                                <FaTimes />
                                                <span>Cancel</span>
                                            </button>
                                        ) : (
                                            <button
                                                className="quick-cancel-btn quick-cancel-btn--disabled"
                                                disabled={true}
                                                aria-disabled="true"
                                                id={`cancel-order-btn-${order.id}`}
                                                title={
                                                    order.status === 'Cancelled'
                                                        ? 'This order has already been cancelled.'
                                                        : `Cannot cancel: Order is already ${order.status.toLowerCase()}`
                                                }
                                            >
                                                <FaTimes />
                                                <span>{order.status === 'Cancelled' ? 'Cancelled' : 'Cancel'}</span>
                                            </button>
                                        )}

                                        {/* View Details */}
                                        <button
                                            className="view-order-btn"
                                            onClick={() =>
                                                navigate(`/patient/order-details/${order.id}`)
                                            }
                                            id={`view-order-btn-${order.id}`}
                                            aria-label={`View details for order ${order.id}`}
                                        >
                                            <FaEye />
                                            View Details
                                            <FaArrowRight className="btn-arrow" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="orders-empty-state">
                    <div className="empty-state-illustration">
                        <FaBoxOpen />
                    </div>
                    <h2 className="empty-state-title">
                        {searchQuery || activeFilter !== "All"
                            ? "No orders found"
                            : "No Orders Yet"}
                    </h2>
                    <p className="empty-state-subtitle">
                        {searchQuery
                            ? `We couldn't find any orders matching "${searchQuery}". Try a different search.`
                            : activeFilter !== "All"
                            ? `You have no ${activeFilter.toLowerCase()} orders at the moment.`
                            : "You haven't placed any orders yet. Browse our pharmacy and get your medicines delivered to your doorstep!"}
                    </p>
                    <div className="empty-state-actions">
                        {(searchQuery || activeFilter !== "All") && (
                            <button
                                className="empty-clear-btn"
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveFilter("All");
                                }}
                                id="empty-clear-filters-btn"
                            >
                                Clear Filters
                            </button>
                        )}
                        <button
                            className="empty-browse-btn"
                            onClick={() => navigate("/patient/pharmacy")}
                            id="empty-browse-medicines-btn"
                        >
                            <FaPills />
                            Browse Medicines
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientOrders;