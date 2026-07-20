import React from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaCreditCard,
    FaCheckCircle,
    FaDownload,
    FaClipboardList,
    FaPills,
    FaTruck,
    FaClock,
    FaBoxOpen,
    FaShoppingBag,
    FaArrowRight,
    FaRedo,
    FaReceipt,
    FaCalendarAlt,
    FaShieldAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientOrderDetails.css";

const MEDICINE_ICONS = ["💊", "🧪", "💉", "🩺", "🔬", "🩹", "🌡️", "⚕️"];

function getMedicineIcon(name) {
    const hash = name.charCodeAt(0) % MEDICINE_ICONS.length;
    return MEDICINE_ICONS[hash];
}

function PatientOrderDetails() {
    const navigate = useNavigate();

    const order = {
        id: "MB20260001",
        date: "20 June 2026",
        payment: "Cash on Delivery",
        status: "Delivered",
        subtotal: 260,
        delivery: 30,
        total: 290,
        address: "John Doe, MG Road, Kochi, Kerala - 682001",
        phone: "+91 98765 43210",
        medicines: [
            {
                name: "Paracetamol 650mg",
                qty: 2,
                price: 35,
                dosage: "500mg",
                type: "Tablet",
            },
            {
                name: "Vitamin C Tablets",
                qty: 1,
                price: 220,
                dosage: "1000mg",
                type: "Tablet",
            },
        ],
        timeline: [
            { step: "Order Placed", date: "20 Jun, 10:30 AM", completed: true },
            { step: "Confirmed", date: "20 Jun, 10:45 AM", completed: true },
            { step: "Packed", date: "20 Jun, 02:15 PM", completed: true },
            { step: "Shipped", date: "21 Jun, 09:00 AM", completed: true },
            { step: "Delivered", date: "22 Jun, 11:30 AM", completed: true },
        ],
    };

    const timelineIcons = {
        "Order Placed": <FaClipboardList />,
        Confirmed: <FaCheckCircle />,
        Packed: <FaBoxOpen />,
        Shipped: <FaTruck />,
        Delivered: <FaShieldAlt />,
    };

    return (
        <div className="od-page">
            {/* Header */}
            <div className="od-header">
                <div className="od-header-left">
                    <button
                        className="od-back-btn"
                        onClick={() => navigate("/patient/orders")}
                        id="od-back-btn"
                    >
                        <FaArrowLeft />
                        <span>Back to Orders</span>
                    </button>
                </div>
                <div className="od-header-right">
                    <div className="od-header-icon">
                        <FaReceipt />
                    </div>
                    <div>
                        <h1 className="od-title">Order Details</h1>
                        <p className="od-subtitle">
                            Order #{order.id} · Placed on {order.date}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="od-grid">
                {/* Left Column */}
                <div className="od-col-main">
                    {/* Order Info Card */}
                    <div className="od-card od-info-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--blue">
                                <FaClipboardList />
                            </div>
                            <h2 className="od-card-title">Order Information</h2>
                            <span className="od-status-badge od-status-badge--delivered">
                                <FaCheckCircle />
                                {order.status}
                            </span>
                        </div>
                        <div className="od-info-grid">
                            <div className="od-info-item">
                                <span className="od-info-label">Order ID</span>
                                <span className="od-info-value od-info-value--mono">
                                    #{order.id}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Order Date</span>
                                <span className="od-info-value">
                                    <FaCalendarAlt className="od-info-inline-icon" />
                                    {order.date}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Payment Method</span>
                                <span className="od-info-value">
                                    <FaCreditCard className="od-info-inline-icon" />
                                    {order.payment}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Items</span>
                                <span className="od-info-value">
                                    <FaPills className="od-info-inline-icon" />
                                    {order.medicines.length} medicines
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Medicines Card */}
                    <div className="od-card od-medicines-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--teal">
                                <FaPills />
                            </div>
                            <h2 className="od-card-title">Ordered Medicines</h2>
                            <span className="od-items-count">
                                {order.medicines.length} items
                            </span>
                        </div>
                        <div className="od-medicines-list">
                            {order.medicines.map((medicine, index) => (
                                <div className="od-medicine-item" key={index}>
                                    <div className="od-medicine-thumb">
                                        {getMedicineIcon(medicine.name)}
                                    </div>
                                    <div className="od-medicine-info">
                                        <h4 className="od-medicine-name">{medicine.name}</h4>
                                        <div className="od-medicine-meta">
                                            <span className="od-medicine-tag">{medicine.type}</span>
                                            <span className="od-medicine-tag">{medicine.dosage}</span>
                                        </div>
                                    </div>
                                    <div className="od-medicine-qty">
                                        <span className="od-qty-label">Qty</span>
                                        <span className="od-qty-value">{medicine.qty}</span>
                                    </div>
                                    <div className="od-medicine-price">
                                        <span className="od-price-label">Price</span>
                                        <span className="od-price-value">
                                            ₹{medicine.price * medicine.qty}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="od-summary">
                            <div className="od-summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="od-summary-row">
                                <span>Delivery Charges</span>
                                <span className="od-delivery-fee">₹{order.delivery}</span>
                            </div>
                            <div className="od-summary-row od-summary-total">
                                <span>Total Amount</span>
                                <span>₹{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="od-card od-address-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--orange">
                                <FaMapMarkerAlt />
                            </div>
                            <h2 className="od-card-title">Delivery Address</h2>
                        </div>
                        <div className="od-address-body">
                            <p className="od-address-text">{order.address}</p>
                            <p className="od-address-phone">{order.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="od-col-side">
                    {/* Timeline Card */}
                    <div className="od-card od-timeline-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--green">
                                <FaClock />
                            </div>
                            <h2 className="od-card-title">Order Timeline</h2>
                        </div>
                        <div className="od-timeline">
                            {order.timeline.map((step, index) => (
                                <div
                                    className={`od-timeline-step ${
                                        step.completed ? "od-timeline-step--completed" : ""
                                    } ${
                                        index === order.timeline.length - 1
                                            ? "od-timeline-step--last"
                                            : ""
                                    }`}
                                    key={index}
                                >
                                    <div className="od-timeline-connector">
                                        <div className="od-timeline-dot">
                                            {step.completed ? (
                                                timelineIcons[step.step] || <FaCheckCircle />
                                            ) : (
                                                <div className="od-timeline-dot-inner" />
                                            )}
                                        </div>
                                        {index < order.timeline.length - 1 && (
                                            <div className="od-timeline-line" />
                                        )}
                                    </div>
                                    <div className="od-timeline-content">
                                        <span className="od-timeline-label">{step.step}</span>
                                        <span className="od-timeline-date">{step.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="od-card od-actions-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--purple">
                                <FaShoppingBag />
                            </div>
                            <h2 className="od-card-title">Quick Actions</h2>
                        </div>
                        <div className="od-actions-list">
                            <button className="od-action-btn od-action-btn--primary" id="od-download-invoice-btn">
                                <FaDownload className="od-action-btn-icon" />
                                <span className="od-action-btn-text">
                                    <strong>Download Invoice</strong>
                                    <small>Get PDF receipt</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>
                            <button
                                className="od-action-btn od-action-btn--secondary"
                                id="od-reorder-btn"
                            >
                                <FaRedo className="od-action-btn-icon" />
                                <span className="od-action-btn-text">
                                    <strong>Reorder</strong>
                                    <small>Add items to cart</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>
                            <button
                                className="od-action-btn od-action-btn--outline"
                                onClick={() => navigate("/patient/pharmacy")}
                                id="od-continue-shopping-btn"
                            >
                                <FaPills className="od-action-btn-icon" />
                                <span className="od-action-btn-text">
                                    <strong>Continue Shopping</strong>
                                    <small>Browse medicines</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>
                        </div>
                    </div>

                    {/* Help Note */}
                    <div className="od-help-note">
                        <span className="od-help-icon">💬</span>
                        <p>
                            Need help with this order?{" "}
                            <a href="#" className="od-help-link">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientOrderDetails;