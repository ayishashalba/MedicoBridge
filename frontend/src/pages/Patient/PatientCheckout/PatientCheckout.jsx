import React, { useState } from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaMobileAlt,
    FaCreditCard,
    FaShoppingBag,
    FaTruck,
    FaShieldAlt,
    FaCheckCircle,
    FaClock,
    FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientCheckout.css";

const SUBTOTAL = 290;
const DELIVERY_THRESHOLD = 499;
const DELIVERY_CHARGE = 40;

const paymentMethods = [
    {
        id: "cod",
        label: "Cash on Delivery",
        desc: "Pay when your order arrives",
        icon: <FaMoneyBillWave />,
    },
    {
        id: "upi",
        label: "UPI",
        desc: "Google Pay, PhonePe, Paytm & more",
        icon: <FaMobileAlt />,
    },
    {
        id: "card",
        label: "Credit / Debit Card",
        desc: "Visa, Mastercard, RuPay & more",
        icon: <FaCreditCard />,
    },
];

function PatientCheckout() {
    const navigate = useNavigate();

    const [payment, setPayment] = useState("");
    const [agreed, setAgreed] = useState(false);

    const isFreeDelivery = SUBTOTAL >= DELIVERY_THRESHOLD;
    const deliveryCharge = isFreeDelivery ? 0 : DELIVERY_CHARGE;
    const grandTotal = SUBTOTAL + deliveryCharge;

    const canPlaceOrder = payment !== "" && agreed;

    return (
        <div className="pco-page">

            {/* ── Back Button ── */}
            <button className="pco-back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft />
                Back
            </button>

            {/* ── Page Heading ── */}
            <div className="pco-topbar">
                <div className="pco-heading-icon">
                    <FaShoppingBag />
                </div>
                <div>
                    <h2 className="pco-heading">Checkout</h2>
                    <p className="pco-subheading">Review your order and complete payment</p>
                </div>
            </div>

            <div className="pco-layout">

                {/* ── LEFT COLUMN ── */}
                <div className="pco-left-col">

                    {/* Delivery Address */}
                    <div className="pco-card">
                        <div className="pco-card-header">
                            <span className="pco-card-icon pco-card-icon--blue">
                                <FaMapMarkerAlt />
                            </span>
                            <h3 className="pco-card-title">Delivery Address</h3>
                        </div>

                        <div className="pco-address-body">
                            <div className="pco-address-info">
                                <p className="pco-address-name">John Doe</p>
                                <p className="pco-address-text">
                                    House No. 12, MG Road,<br />
                                    Kochi, Kerala – 682001
                                </p>
                                <span className="pco-address-tag">Home</span>
                            </div>
                            <button className="pco-change-btn">
                                <FaEdit />
                                Change Address
                            </button>
                        </div>

                        {/* Estimated Delivery */}
                        <div className="pco-delivery-eta">
                            <FaClock className="pco-eta-icon" />
                            <span>
                                <strong>Delivery by Tomorrow</strong> — by 8:00 PM
                            </span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="pco-card">
                        <div className="pco-card-header">
                            <span className="pco-card-icon pco-card-icon--green">
                                <FaMoneyBillWave />
                            </span>
                            <h3 className="pco-card-title">Payment Method</h3>
                        </div>

                        <div className="pco-payment-methods">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`pco-payment-option ${
                                        payment === method.id
                                            ? "pco-payment-option--active"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method.id}
                                        checked={payment === method.id}
                                        onChange={(e) => setPayment(e.target.value)}
                                        className="pco-radio-hidden"
                                    />
                                    <span className={`pco-method-icon pco-method-icon--${method.id}`}>
                                        {method.icon}
                                    </span>
                                    <span className="pco-method-text">
                                        <span className="pco-method-label">{method.label}</span>
                                        <span className="pco-method-desc">{method.desc}</span>
                                    </span>
                                    <span className="pco-method-check">
                                        {payment === method.id && <FaCheckCircle />}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Terms Checkbox */}
                        <label className="pco-terms-row">
                            <input
                                type="checkbox"
                                className="pco-terms-checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="pco-terms-text">
                                I agree to the{" "}
                                <span className="pco-terms-link">terms and conditions</span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* ── RIGHT COLUMN — Order Summary ── */}
                <div className="pco-right-col">
                    <div className="pco-summary-card">

                        <h3 className="pco-summary-title">
                            <FaShoppingBag className="pco-summary-title-icon" />
                            Order Summary
                        </h3>

                        {/* Items */}
                        <div className="pco-summary-items">
                            <div className="pco-summary-item-row">
                                <span>💊 Paracetamol 650mg <span className="pco-qty-chip">×2</span></span>
                                <span>₹70</span>
                            </div>
                            <div className="pco-summary-item-row">
                                <span>🍊 Vitamin C Tablets <span className="pco-qty-chip">×1</span></span>
                                <span>₹220</span>
                            </div>
                        </div>

                        <div className="pco-summary-divider" />

                        {/* Pricing Rows */}
                        <div className="pco-pricing-rows">
                            <div className="pco-pricing-row">
                                <span>Subtotal</span>
                                <span>₹{SUBTOTAL}</span>
                            </div>
                            <div className="pco-pricing-row">
                                <span className="pco-delivery-label">
                                    <FaTruck className="pco-truck-icon" />
                                    Delivery Charge
                                </span>
                                {isFreeDelivery ? (
                                    <span className="pco-free-tag">FREE</span>
                                ) : (
                                    <span className="pco-delivery-amount">₹{DELIVERY_CHARGE}</span>
                                )}
                            </div>
                        </div>

                        {/* Free delivery hint */}
                        {!isFreeDelivery && (
                            <div className="pco-delivery-hint">
                                <FaTruck className="pco-hint-icon" />
                                <span>
                                    Add <strong>₹{DELIVERY_THRESHOLD - SUBTOTAL}</strong> more to get
                                    <strong> FREE delivery</strong>
                                </span>
                            </div>
                        )}
                        {isFreeDelivery && (
                            <div className="pco-delivery-hint pco-delivery-hint--earned">
                                <FaCheckCircle className="pco-hint-icon" />
                                <span>🎉 You've unlocked <strong>FREE delivery!</strong></span>
                            </div>
                        )}

                        <div className="pco-summary-divider" />

                        {/* Grand Total */}
                        <div className="pco-grand-total-row">
                            <span className="pco-grand-label">Grand Total</span>
                            <span className="pco-grand-value">₹{grandTotal}</span>
                        </div>

                        {/* Trust Badge */}
                        <div className="pco-trust-badge">
                            <FaShieldAlt className="pco-trust-icon" />
                            <span>100% Genuine Medicines — Quality Guaranteed</span>
                        </div>

                        {/* Place Order */}
                        <button
                            className={`pco-place-order-btn ${canPlaceOrder ? "" : "pco-place-order-btn--disabled"}`}
                            disabled={!canPlaceOrder}
                            onClick={() => navigate("/patient/order-success")}
                        >
                            {canPlaceOrder ? "✅ Place Order" : "Select a Payment Method"}
                        </button>

                        {!payment && (
                            <p className="pco-order-hint">Please select a payment method to continue.</p>
                        )}
                        {payment && !agreed && (
                            <p className="pco-order-hint">Please agree to the terms and conditions.</p>
                        )}

                        <p className="pco-secure-note">
                            <FaShieldAlt /> Secured &amp; Encrypted Checkout
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PatientCheckout;