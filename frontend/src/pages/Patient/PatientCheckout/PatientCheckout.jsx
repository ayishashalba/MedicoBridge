import React, { useState, useEffect } from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaCreditCard,
    FaShoppingBag,
    FaTruck,
    FaShieldAlt,
    FaCheckCircle,
    FaEdit,
    FaPercent,
    FaSpinner,
    FaBolt,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import CouponSection from "../../../components/CouponSection/CouponSection";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientCheckout.css";

const DELIVERY_THRESHOLD = 499;
const DELIVERY_CHARGE = 40;

const paymentMethods = [
    {
        id: "cod",
        label: "Cash on Delivery",
        desc: "Pay securely when your order arrives",
        icon: <FaMoneyBillWave />,
    },
    {
        id: "razorpay",
        label: "Pay Online (Razorpay)",
        desc: "UPI, Cards, Net Banking & Wallets",
        icon: <FaBolt />,
    },
];

/**
 * Dynamically load the Razorpay checkout SDK once and return the
 * Razorpay constructor. Resolves immediately if already loaded.
 */
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function PatientCheckout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [payment, setPayment] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);
    const [subtotal, setSubtotal] = useState(() => location.state?.subtotal || 0);
    const [cartItems, setCartItems] = useState(() => location.state?.cartItems || []);
    const [patientInfo, setPatientInfo] = useState({ name: "Patient", email: "", phone: "" });

    const [userAddress, setUserAddress] = useState({
        name: "Patient",
        phone: "",
        street: "Standard Delivery Address",
        city: "Kochi",
        state: "Kerala",
        pincode: "682001",
        tag: "Home",
    });

    /* Coupon state (initialize from cart navigation state if present) */
    const [appliedCoupon, setAppliedCoupon] = useState(
        () => location.state?.appliedCoupon || null
    );
    const [couponDiscount, setCouponDiscount] = useState(
        () => location.state?.couponDiscount || 0
    );
    const [isFreeDeliveryCoupon, setIsFreeDeliveryCoupon] = useState(
        () => location.state?.isFreeDeliveryCoupon || false
    );

    const [reorderInfo, setReorderInfo] = useState(() => ({
        id: location.state?.reorderedFromOrderId || null,
        number: location.state?.reorderedFromOrderNumber || "",
    }));

    useEffect(() => {
        const loadCheckoutData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                // 1. Fetch user profile for address
                const profRes = await fetch(`${API_BASE_URL}/patient/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const profData = await profRes.json();
                if (profRes.ok && profData.data) {
                    const p = profData.data;
                    setPatientInfo({ name: p.name || "Patient", email: p.email || "", phone: p.phone || "" });

                    const defaultAddr = (p.addresses && p.addresses.length > 0)
                        ? p.addresses.find((a) => a.isDefault) || p.addresses[0]
                        : null;

                    if (defaultAddr) {
                        setUserAddress({
                            name: p.name || "Patient",
                            phone: p.phone || "",
                            street: defaultAddr.street || defaultAddr.address || p.address || "",
                            city: defaultAddr.city || p.city || "Kochi",
                            state: defaultAddr.state || "Kerala",
                            pincode: defaultAddr.pincode || defaultAddr.postalCode || "682001",
                            tag: defaultAddr.label || "Home",
                        });
                    } else {
                        setUserAddress({
                            name: p.name || "Patient",
                            phone: p.phone || "",
                            street: p.address || "Standard Address",
                            city: p.city || "Kochi",
                            state: "Kerala",
                            pincode: "682001",
                            tag: "Home",
                        });
                    }
                }

                // 2. Fetch cart items and subtotal
                const cartRes = await fetch(`${API_BASE_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const cartData = await cartRes.json();
                if (cartRes.ok && cartData.data) {
                    const rawItems = cartData.data.items || [];
                    const mapped = rawItems.map((item) => {
                        const med = item.medicineId || {};
                        return {
                            id: item._id,
                            name: med.name || item.name || "Medicine",
                            quantity: item.quantity || 1,
                            price: item.finalPrice ?? item.unitPrice ?? med.price ?? 0,
                            finalPrice: item.finalPrice ?? item.unitPrice ?? med.price ?? 0,
                            stockUnits: typeof med.stock === "number" ? med.stock : 0,
                        };
                    });
                    setCartItems(mapped);
                    if (!location.state?.subtotal) {
                        const calculated = rawItems.reduce(
                            (acc, i) => acc + (i.finalPrice || i.unitPrice || 0) * (i.quantity || 1),
                            0
                        );
                        setSubtotal(calculated || cartData.data.subtotal || 0);
                    }
                    if (cartData.data.couponCode && !appliedCoupon) {
                        setAppliedCoupon({ code: cartData.data.couponCode });
                        setCouponDiscount(cartData.data.couponDiscount || 0);
                    }
                    if (cartData.data.reorderedFromOrderId && !reorderInfo.id) {
                        setReorderInfo({
                            id: cartData.data.reorderedFromOrderId,
                            number: cartData.data.reorderedFromOrderNumber || "",
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to load checkout details:", err);
            }
        };

        loadCheckoutData();
    }, [location.state, appliedCoupon]);

    const isFreeDelivery = subtotal >= DELIVERY_THRESHOLD || isFreeDeliveryCoupon;
    const deliveryCharge = (subtotal > 0 && !isFreeDelivery) ? DELIVERY_CHARGE : 0;
    const grandTotal = Math.max(0, subtotal - couponDiscount) + deliveryCharge;

    const canPlaceOrder = payment !== "" && agreed && !isPlacing;

    const handleApplyCoupon = (result) => {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        setIsFreeDeliveryCoupon(!!result.freesDelivery);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setIsFreeDeliveryCoupon(false);
    };

    /**
     * Create the MedicoBridge order (COD: done. Razorpay: open payment modal).
     */
    const handlePlaceOrder = async () => {
        if (!canPlaceOrder) return;
        setIsPlacing(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }

            const paymentEnum = payment === "cod" ? "COD" : "Razorpay";
            const deliveryAddressPayload = {
                fullName: userAddress.name,
                phone: userAddress.phone,
                street: userAddress.street,
                city: userAddress.city,
                state: userAddress.state,
                pincode: userAddress.pincode,
            };
            const couponCodeStr = (
                typeof appliedCoupon === "string"
                    ? appliedCoupon
                    : appliedCoupon?.code || appliedCoupon?.coupon?.code || ""
            ) || undefined;

            // ---------- Cash on Delivery ----------
            if (paymentEnum === "COD") {
                const res = await fetch(`${API_BASE_URL}/orders`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        paymentMethod: "COD",
                        deliveryAddress: deliveryAddressPayload,
                        couponCode: couponCodeStr,
                        couponDiscount: Number(couponDiscount) || 0,
                        deliveryFee: deliveryCharge,
                        reorderedFromOrderId: reorderInfo.id || undefined,
                        reorderedFromOrderNumber: reorderInfo.number || undefined,
                    }),
                });

                const data = await res.json();
                if (res.ok && data.data) {
                    window.dispatchEvent(new CustomEvent("cartUpdated"));
                    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
                    toast.success("Order placed successfully!");
                    navigate("/patient/order-success", {
                        state: {
                            order: data.data,
                            appliedCoupon: data.data.couponCode ? { code: data.data.couponCode } : appliedCoupon,
                            couponDiscount: data.data.couponDiscount !== undefined ? data.data.couponDiscount : couponDiscount,
                            total: data.data.totalAmount ?? grandTotal,
                        },
                    });
                } else {
                    toast.error(data.message || "Failed to place order.");
                }
                return;
            }

            // ---------- Razorpay ----------
            // Step 1: Load Razorpay SDK
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                toast.error("Razorpay SDK failed to load. Please check your internet connection.");
                return;
            }

            // Step 2: Create MedicoBridge order (paymentStatus: Pending)
            const orderRes = await fetch(`${API_BASE_URL}/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    paymentMethod: "Razorpay",
                    deliveryAddress: deliveryAddressPayload,
                    couponCode: couponCodeStr,
                    couponDiscount: Number(couponDiscount) || 0,
                    deliveryFee: deliveryCharge,
                    reorderedFromOrderId: reorderInfo.id || undefined,
                    reorderedFromOrderNumber: reorderInfo.number || undefined,
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.data) {
                toast.error(orderData.message || "Failed to create order.");
                return;
            }

            const createdOrder = orderData.data;

            // Step 3: Create Razorpay payment order on backend
            const rzpOrderRes = await fetch(`${API_BASE_URL}/payment/razorpay/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: createdOrder.totalAmount,
                    currency: "INR",
                    receipt: createdOrder.orderId,
                }),
            });

            const rzpOrderData = await rzpOrderRes.json();
            if (!rzpOrderRes.ok || !rzpOrderData.data) {
                toast.error(rzpOrderData.message || "Failed to initiate Razorpay payment.");
                return;
            }

            const { razorpayOrderId, keyId } = rzpOrderData.data;

            // Step 4: Open Razorpay Checkout
            const options = {
                key: keyId,
                amount: Math.round(createdOrder.totalAmount * 100), // paise
                currency: "INR",
                name: "MedicoBridge Pharmacy",
                description: `Payment for Order #${createdOrder.orderId}`,
                order_id: razorpayOrderId,
                prefill: {
                    name: patientInfo.name,
                    email: patientInfo.email,
                    contact: patientInfo.phone,
                },
                theme: { color: "#0d9488" },
                handler: async function (response) {
                    // Step 5: Verify payment on backend
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/payment/razorpay/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: createdOrder._id,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.data?.verified) {
                            window.dispatchEvent(new CustomEvent("cartUpdated"));
                            window.dispatchEvent(new CustomEvent("notificationsUpdated"));
                            toast.success("Payment successful! Order confirmed.");
                            navigate("/patient/order-success", {
                                state: {
                                    order: verifyData.data.order || createdOrder,
                                    appliedCoupon: createdOrder.couponCode ? { code: createdOrder.couponCode } : appliedCoupon,
                                    couponDiscount: createdOrder.couponDiscount !== undefined ? createdOrder.couponDiscount : couponDiscount,
                                    total: createdOrder.totalAmount,
                                },
                            });
                        } else {
                            toast.error(verifyData.message || "Payment verification failed. Please contact support.");
                        }
                    } catch (err) {
                        toast.error("Network error during payment verification.");
                    }
                },
                modal: {
                    ondismiss: function () {
                        toast.warn("Payment cancelled. Your order has been created but is unpaid — you can retry payment from your Orders page.");
                        navigate("/patient/orders");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
                toast.error(`Payment failed: ${response.error.description || "Unknown error. Please retry."}`);
            });
            rzp.open();

        } catch (err) {
            toast.error("Network error while placing order.");
        } finally {
            setIsPlacing(false);
        }
    };

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
                                <p className="pco-address-name">{userAddress.name}</p>
                                <p className="pco-address-text">
                                    {userAddress.street}<br />
                                    {userAddress.city}, {userAddress.state} – {userAddress.pincode}
                                </p>
                                <span className="pco-address-tag">{userAddress.tag}</span>
                            </div>
                            <button className="pco-change-btn" onClick={() => navigate("/patient/addresses")}>
                                <FaEdit />
                                Change Address
                            </button>
                        </div>

                        {/* Estimated Delivery */}
                        <div className="pco-delivery-eta">
                            <FaTruck className="pco-eta-icon" style={{ color: "var(--primary-color)" }} />
                            <span>
                                Estimated Delivery: <strong>1–2 Days</strong> (Pharmacy Sufficient Stock)
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

                        {/* Razorpay info badge */}
                        {payment === "razorpay" && (
                            <div style={{
                                background: "#f0f9ff",
                                border: "1px solid #bae6fd",
                                borderRadius: "10px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                color: "#0369a1",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "10px",
                            }}>
                                <FaShieldAlt />
                                <span>Secured by <strong>Razorpay</strong> — UPI, Cards, Net Banking &amp; Wallets accepted.</span>
                            </div>
                        )}

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
                    {/* Coupon Section */}
                    <CouponSection
                        subtotal={subtotal}
                        deliveryFee={DELIVERY_CHARGE}
                        appliedCoupon={appliedCoupon}
                        couponDiscount={couponDiscount}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                    />

                    <div className="pco-summary-card">

                        <h3 className="pco-summary-title">
                            <FaShoppingBag className="pco-summary-title-icon" />
                            Order Summary
                        </h3>

                        {/* Items */}
                        <div className="pco-summary-items">
                            {cartItems.length > 0 ? (
                                cartItems.map((item, idx) => (
                                    <div
                                        className="pco-summary-item-row"
                                        style={{ alignItems: "flex-start", marginTop: idx > 0 ? "0.5rem" : 0 }}
                                        key={item.id || idx}
                                    >
                                        <div>
                                            <span>💊 {item.name} <span className="pco-qty-chip">×{item.quantity}</span></span>
                                            <small style={{ display: "block", color: "#16a34a", fontSize: "0.75rem", fontWeight: 600 }}>
                                                {item.stockUnits > 0 ? "In Stock · Est. 1–2 Days" : "Low Stock"}
                                            </small>
                                        </div>
                                        <span>₹{(item.price || item.finalPrice || 0) * (item.quantity || 1)}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>No items in checkout.</p>
                            )}
                        </div>

                        <div className="pco-summary-divider" />

                        {/* Pricing Rows */}
                        <div className="pco-pricing-rows">
                            <div className="pco-pricing-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>

                            {/* Coupon discount if applied */}
                            {appliedCoupon && couponDiscount > 0 && (
                                <div className="pco-pricing-row" style={{ color: "#16a34a", fontWeight: 700 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <FaPercent style={{ fontSize: "0.75rem" }} /> Coupon ({appliedCoupon.code})
                                    </span>
                                    <span>−₹{couponDiscount}</span>
                                </div>
                            )}

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
                                    Add <strong>₹{Math.max(0, DELIVERY_THRESHOLD - subtotal)}</strong> more to get
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
                            disabled={!canPlaceOrder || isPlacing}
                            onClick={handlePlaceOrder}
                            id="pco-place-order-btn"
                        >
                            {isPlacing ? (
                                <>
                                    <FaSpinner className="fa-spin" style={{ marginRight: "0.5rem" }} />
                                    {payment === "razorpay" ? "Preparing Payment..." : "Placing Order..."}
                                </>
                            ) : canPlaceOrder ? (
                                payment === "razorpay" ? "⚡ Pay with Razorpay" : "✅ Place Order (COD)"
                            ) : (
                                "Select a Payment Method"
                            )}
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