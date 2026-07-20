import React, { useState, useMemo } from "react";
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
} from "react-icons/fa";
import "./PatientOrders.css";
import { useNavigate } from "react-router-dom";

const orders = [
    {
        id: "MB20260001",
        date: "20 June 2026",
        estimatedDate: "23 June 2026",
        deliveredDate: "22 June 2026",
        items: ["Paracetamol 650mg", "Vitamin C Tablets"],
        amount: "₹290",
        payment: "Cash on Delivery",
        status: "Delivered",
    },
    {
        id: "MB20260002",
        date: "22 June 2026",
        estimatedDate: "25 June 2026",
        deliveredDate: null,
        items: ["Cetirizine Tablets"],
        amount: "₹120",
        payment: "UPI",
        status: "Shipped",
    },
    {
        id: "MB20260003",
        date: "24 June 2026",
        estimatedDate: "27 June 2026",
        deliveredDate: null,
        items: ["Blood Pressure Monitor"],
        amount: "₹1,850",
        payment: "Credit Card",
        status: "Pending",
    },
    {
        id: "MB20260004",
        date: "18 June 2026",
        estimatedDate: "21 June 2026",
        deliveredDate: null,
        items: ["Omega-3 Capsules", "Multivitamin Tablets", "Zinc Supplements"],
        amount: "₹560",
        payment: "Net Banking",
        status: "Cancelled",
    },
];

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
    Cancelled: {
        icon: <FaBan />,
        className: "cancelled",
        label: "Cancelled",
        dateLabel: "Cancelled",
    },
};

const MEDICINE_ICONS = ["💊", "🧪", "💉", "🩺", "🔬", "🩹", "🌡️", "⚕️"];

function getMedicineIcon(name) {
    const hash = name.charCodeAt(0) % MEDICINE_ICONS.length;
    return MEDICINE_ICONS[hash];
}

const FILTER_TABS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

function PatientOrders() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesFilter =
                activeFilter === "All" || order.status === activeFilter;
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                order.id.toLowerCase().includes(q) ||
                order.items.some((item) => item.toLowerCase().includes(q)) ||
                order.status.toLowerCase().includes(q) ||
                order.payment.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter]);

    const getStatusCount = (status) => {
        if (status === "All") return orders.length;
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
                            Track and manage all your medicine orders in one place.
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
                        placeholder="Search by order ID, medicine, or status…"
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
            {filteredOrders.length > 0 ? (
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const config = STATUS_CONFIG[order.status];
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
                                            <h3 className="order-id">Order #{order.id}</h3>
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