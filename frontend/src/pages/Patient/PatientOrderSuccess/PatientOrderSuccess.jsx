import React, { useEffect, useState } from "react";
import {
    FaCheckCircle,
    FaShoppingBag,
    FaClipboardList,
    FaDownload,
    FaShieldAlt,
    FaHashtag,
    FaCalendarAlt,
    FaTruck,
    FaWallet,
    FaRupeeSign,
    FaStore,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientOrderSuccess.css";

/* ── Static order details (mirrors checkout data) ── */
const ORDER = {
    id: "MB" + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    }),
    delivery: "Tomorrow, by 8:00 PM",
    payment: "Cash on Delivery",
    total: 290,
};

const summaryFields = [
    {
        icon: <FaHashtag />,
        label: "Order ID",
        value: `#${ORDER.id}`,
        highlight: true,
    },
    {
        icon: <FaCalendarAlt />,
        label: "Order Date & Time",
        value: `${ORDER.date} · ${ORDER.time}`,
    },
    {
        icon: <FaTruck />,
        label: "Estimated Delivery",
        value: ORDER.delivery,
        green: true,
    },
    {
        icon: <FaWallet />,
        label: "Payment Method",
        value: ORDER.payment,
    },
    {
        icon: <FaRupeeSign />,
        label: "Total Amount Paid",
        value: `₹${ORDER.total}`,
        bold: true,
    },
];

function PatientOrderSuccess() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    /* Trigger entrance animation after mount */
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={`pos-page ${visible ? "pos-page--visible" : ""}`}>

            {/* ── Confetti dots (CSS-only decorative) ── */}
            <div className="pos-confetti" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className={`pos-dot pos-dot--${i + 1}`} />
                ))}
            </div>

            <div className="pos-card">

                {/* ── Animated Success Icon ── */}
                <div className="pos-icon-wrap">
                    <div className="pos-ring pos-ring--outer" />
                    <div className="pos-ring pos-ring--inner" />
                    <FaCheckCircle className="pos-check-icon" />
                </div>

                {/* ── Heading ── */}
                <h1 className="pos-heading">Order Placed Successfully!</h1>
                <p className="pos-tagline">
                    🎉 Thank you for shopping with <strong>MedicoBridge</strong>. <br />
                    Your order has been confirmed and sent to the pharmacy.
                </p>

                {/* ── Status pill ── */}
                <div className="pos-status-pill">
                    <span className="pos-status-dot" />
                    Order Confirmed — Processing
                </div>

                {/* ── Order Summary card ── */}
                <div className="pos-summary-card">
                    <div className="pos-summary-header">
                        <FaClipboardList className="pos-summary-header-icon" />
                        <span>Order Summary</span>
                    </div>

                    <div className="pos-summary-rows">
                        {summaryFields.map((field) => (
                            <div className="pos-summary-row" key={field.label}>
                                <span className="pos-row-icon">{field.icon}</span>
                                <span className="pos-row-label">{field.label}</span>
                                <span
                                    className={[
                                        "pos-row-value",
                                        field.highlight ? "pos-row-value--id" : "",
                                        field.green ? "pos-row-value--green" : "",
                                        field.bold ? "pos-row-value--bold" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    {field.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Delivery status message ── */}
                <div className="pos-delivery-msg">
                    <FaTruck className="pos-delivery-icon" />
                    <span>
                        Your medicines will be dispatched within <strong>2 hours</strong> and
                        delivered <strong>by tomorrow</strong>. You'll receive an SMS update.
                    </span>
                </div>

                {/* ── Trust strip ── */}
                <div className="pos-trust-strip">
                    <span><FaShieldAlt /> 100% Genuine Medicines</span>
                    <span>·</span>
                    <span>🔒 Secure Payment</span>
                    <span>·</span>
                    <span>🚀 Fast Delivery</span>
                </div>

                {/* ── Action buttons ── */}
                <div className="pos-actions">
                    <button
                        className="pos-btn pos-btn--primary"
                        onClick={() => navigate("/patient/pharmacy")}
                    >
                        <FaStore />
                        Continue Shopping
                    </button>

                    <button
                        className="pos-btn pos-btn--secondary"
                        onClick={() => navigate("/patient/orders")}
                    >
                        <FaClipboardList />
                        View Orders
                    </button>

                    <button
                        className="pos-btn pos-btn--ghost"
                        onClick={() => alert("Invoice download will be available soon!")}
                        title="Download Invoice"
                    >
                        <FaDownload />
                        Download Invoice
                    </button>
                </div>

            </div>
        </div>
    );
}

export default PatientOrderSuccess;