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
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "./PatientOrderSuccess.css";

function PatientOrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const [visible, setVisible] = useState(false);

    const rawOrder = location.state?.order;
    const orderId = rawOrder?.orderId || rawOrder?._id || location.state?.orderId;
    const paidTotal = rawOrder?.totalAmount ?? location.state?.total ?? 0;
    const couponCode = rawOrder?.couponCode || location.state?.appliedCoupon?.code || (typeof location.state?.appliedCoupon === "string" ? location.state.appliedCoupon : "");
    const couponDiscount = rawOrder?.couponDiscount !== undefined ? rawOrder.couponDiscount : (location.state?.couponDiscount ?? 0);
    const deliveryFee = rawOrder?.deliveryFee !== undefined ? rawOrder.deliveryFee : (location.state?.deliveryFee !== undefined ? location.state.deliveryFee : 40);

    const orderDate = rawOrder?.createdAt
        ? new Date(rawOrder.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
          });

    const orderTime = rawOrder?.createdAt
        ? new Date(rawOrder.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
          });

    const paymentMethod = rawOrder?.paymentMethod || "Cash on Delivery";

    useEffect(() => {
        if (!orderId && !location.state) {
            navigate("/patient/orders", { replace: true });
            return;
        }
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, [orderId, location.state, navigate]);

    const summaryFields = [
        {
            icon: <FaHashtag />,
            label: "Order ID",
            value: `#${orderId || "MB-ORDER"}`,
            highlight: true,
        },
        {
            icon: <FaCalendarAlt />,
            label: "Order Date & Time",
            value: `${orderDate} · ${orderTime}`,
        },
        {
            icon: <FaTruck />,
            label: "Estimated Delivery",
            value: "1–2 Days (Standard Pharmacy Delivery)",
            green: true,
        },
        ...(rawOrder?.subtotal ? [{
            icon: <FaWallet />,
            label: "Items Subtotal",
            value: `₹${rawOrder.subtotal}`,
        }] : []),
        ...(rawOrder?.offerDiscount > 0 ? [{
            icon: <FaWallet />,
            label: "Special Offer Discount",
            value: `Saved ₹${rawOrder.offerDiscount}`,
            green: true,
        }] : []),
        ...(couponCode && couponDiscount > 0 ? [{
            icon: <FaWallet />,
            label: `Coupon Applied (${couponCode})`,
            value: `Saved ₹${couponDiscount}`,
            green: true,
        }] : []),
        {
            icon: <FaTruck />,
            label: "Delivery Fee",
            value: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`,
        },
        {
            icon: <FaWallet />,
            label: "Payment Method",
            value: paymentMethod,
        },
        {
            icon: <FaRupeeSign />,
            label: "Total Amount Paid",
            value: `₹${paidTotal}`,
            bold: true,
        },
    ];

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
                        Your medicines will be processed and delivered within <strong>1–2 days</strong> (Sufficient Pharmacy Stock). You'll receive real-time tracking updates.
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
                        onClick={() => toast.info("Invoice download will be available soon!")}
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