import React, { useState, useEffect } from "react";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaPills, FaTag, FaTruck, FaExclamationTriangle, FaPercent, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getStockAndDeliveryInfo } from "../../../utils/pharmacyDelivery";
import CouponSection from "../../../components/CouponSection/CouponSection";
import { API_BASE_URL } from "../../../services/apiConfig";
import { toast } from "react-toastify";
import "./PatientCart.css";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 499;

/* ─── PatientCart Component ─────────────────────────────────────── */
function PatientCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isFreeDeliveryCoupon, setIsFreeDeliveryCoupon] = useState(false);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }
            const res = await fetch(`${API_BASE_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.data && Array.isArray(data.data.items)) {
                const mapped = data.data.items.map((item) => {
                    const med = item.medicineId || {};
                    const stockVal = typeof med.stock === "number" ? med.stock : 0;
                    return {
                        id: item._id,
                        medicineId: med._id || item.medicineId,
                        name: med.name || item.name || "Medicine",
                        brand: med.manufacturer || "Generic",
                        emoji: "💊",
                        price: item.finalPrice ?? item.unitPrice ?? med.price ?? 35,
                        mrp: med.mrp || Math.round((item.finalPrice ?? med.price ?? 35) * 1.25),
                        quantity: item.quantity || 1,
                        stockUnits: stockVal,
                        isAvailable: med.isAvailable !== false && stockVal > 0,
                        stock: stockVal <= 0 || med.isAvailable === false ? "out-of-stock" : "in-stock",
                        category: med.category || "Tablet",
                        highlight: "#e8f5e9",
                        accentColor: "#2e7d32",
                    };
                });
                setCartItems(mapped);
                if (data.data.couponCode) {
                    setAppliedCoupon({ code: data.data.couponCode });
                    setCouponDiscount(data.data.couponDiscount || 0);
                }
            } else {
                setCartItems([]);
            }
        } catch (err) {
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [navigate]);

    /* Quantity update with real backend sync */
    const updateQuantity = async (id, delta) => {
        const item = cartItems.find((it) => it.id === id);
        if (!item) return;
        const newQty = item.quantity + delta;
        const maxStock = typeof item.stockUnits === "number" ? item.stockUnits : 99;

        if (delta > 0 && item.quantity >= maxStock) {
            toast.info("All available stock is already added to your cart.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        if (newQty <= 0) {
            await removeItem(id);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: newQty }),
            });
            const data = await res.json();
            if (res.ok) {
                setCartItems((items) =>
                    items.map((it) => (it.id === id ? { ...it, quantity: newQty } : it))
                );
                window.dispatchEvent(new CustomEvent("cartUpdated"));
            } else {
                if (data.message && data.message.includes("All available stock is already added")) {
                    toast.info("All available stock is already added to your cart.");
                } else {
                    toast.error(data.message || "Cannot update quantity.");
                }
            }
        } catch (err) {
            console.error("Failed to update cart item:", err);
        }
    };

    const removeItem = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setCartItems((items) => items.filter((it) => it.id !== id));
                window.dispatchEvent(new CustomEvent("cartUpdated"));
            }
        } catch (err) {
            console.error("Failed to remove cart item:", err);
        }
    };

    /* ── Pricing calculations ────────────────────────────────────── */
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD || isFreeDeliveryCoupon;
    const delivery = cartItems.length > 0 && !isFreeDelivery ? DELIVERY_FEE : 0;
    const total = Math.max(0, subtotal - couponDiscount) + delivery;

    const hasOutOfStock = cartItems.some(
        (item) => (item.stockUnits ?? 0) <= 0 || item.isAvailable === false
    );

    /* Determine overall estimated delivery for cart */
    const mainItemStockInfo = cartItems.length > 0
        ? getStockAndDeliveryInfo(cartItems[0].stockUnits ?? cartItems[0].stock)
        : getStockAndDeliveryInfo(120);

    const handleApplyCoupon = async (result) => {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        setIsFreeDeliveryCoupon(!!result.freesDelivery);
        try {
            const token = localStorage.getItem("token");
            if (token && result.coupon?.code) {
                await fetch(`${API_BASE_URL}/cart`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ couponCode: result.coupon.code }),
                });
            }
        } catch (err) {
            // coupon local state works
        }
    };

    const handleRemoveCoupon = async () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setIsFreeDeliveryCoupon(false);
        try {
            const token = localStorage.getItem("token");
            if (token) {
                await fetch(`${API_BASE_URL}/cart/coupon`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (err) {
            // ignore
        }
    };

    if (loading) {
        return (
            <div className="patient-cart" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem", color: "#0d9488" }}>
                <FaSpinner className="fa-spin" style={{ fontSize: "1.8rem" }} /> Loading your cart...
            </div>
        );
    }

    /* ── Empty State ─────────────────────────────────────────────── */
    if (cartItems.length === 0) {
        return (
            <div className="patient-cart">
                <button className="cart-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="cart-empty-state">
                    <div className="cart-empty-icon">🛒</div>
                    <h3>Your Cart is Empty</h3>
                    <p>Looks like you haven't added any medicines yet. Browse our pharmacy and find what you need.</p>
                    <button
                        className="cart-browse-btn"
                        onClick={() => navigate("/patient/pharmacy")}
                    >
                        <FaPills /> Browse Medicines
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-cart">

            {/* ── Top bar ──────────────────────────────────────────── */}
            <div className="cart-topbar">
                <button className="cart-back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="cart-heading">
                    <FaShoppingCart className="cart-heading-icon" />
                    <div>
                        <h2>My Cart</h2>
                        <p>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
                    </div>
                </div>
            </div>

            {/* ── Two-column layout ────────────────────────────────── */}
            <div className="cart-layout">

                {/* ── Left: Cart Items ────────────────────────────── */}
                <div className="cart-items-col">
                    {cartItems.map((item) => {
                        const maxUnits = typeof item.stockUnits === "number" ? item.stockUnits : 0;
                        const isOutOfStock = maxUnits <= 0 || item.isAvailable === false;
                        const isMaxReached = item.quantity >= maxUnits;
                        const itemSubtotal = item.price * item.quantity;
                        const discountPct = item.mrp
                            ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                            : 0;

                        return (
                            <div className="cart-card" key={item.id}>

                                {/* Medicine image / emoji */}
                                <div
                                    className="cart-med-img"
                                    style={{ background: item.highlight || "#f0f9ff" }}
                                >
                                    <span className="cart-med-emoji" role="img" aria-label={item.name}>
                                        {item.emoji || "💊"}
                                    </span>
                                    {discountPct > 0 && (
                                        <span className="cart-discount-badge">{discountPct}% OFF</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="cart-med-info">
                                    <div className="cart-med-header">
                                        <div>
                                            <h4 className="cart-med-name">{item.name}</h4>
                                            <p className="cart-med-brand">{item.brand}</p>
                                        </div>
                                        <button
                                            className="cart-remove-btn"
                                            onClick={() => removeItem(item.id)}
                                            aria-label={`Remove ${item.name}`}
                                            title="Remove item"
                                        >
                                            <FaTrash />
                                            <span>Remove</span>
                                        </button>
                                    </div>

                                    <div className="cart-med-meta">
                                        {item.category && (
                                            <span className="cart-category-chip">{item.category}</span>
                                        )}
                                    </div>

                                    <div className="cart-med-footer">
                                        {/* Price */}
                                        <div className="cart-price-block">
                                            <span className="cart-price">₹{item.price}</span>
                                            {item.mrp && (
                                                <span className="cart-mrp">MRP ₹{item.mrp}</span>
                                            )}
                                        </div>

                                        {/* Quantity controls + Inline Stock Message */}
                                        <div className="cart-qty-block">
                                            <div className="cart-qty-ctrl">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                    id={`cart-qty-dec-${item.id}`}
                                                >
                                                    −
                                                </button>
                                                <span className="cart-qty-val">{item.quantity}</span>
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    disabled={isMaxReached}
                                                    aria-label="Increase quantity"
                                                    id={`cart-qty-inc-${item.id}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span
                                                className={`cart-stock-inline-msg ${
                                                    isOutOfStock || isMaxReached
                                                        ? "cart-stock-inline-msg--max"
                                                        : "cart-stock-inline-msg--ok"
                                                }`}
                                            >
                                                {isOutOfStock
                                                    ? "Out of Stock"
                                                    : isMaxReached
                                                    ? "All available stock is already added"
                                                    : "Stock available"}
                                            </span>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="cart-item-subtotal">
                                            <span className="cart-subtotal-label">Subtotal</span>
                                            <span className="cart-subtotal-val">₹{itemSubtotal}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}

                    {/* Continue shopping link */}
                    <button
                        className="cart-continue-btn"
                        onClick={() => navigate("/patient/pharmacy")}
                    >
                        <FaPills /> Continue Shopping
                    </button>
                </div>

                {/* ── Right: Order Summary ─────────────────────────── */}
                <div className="cart-summary-col">
                    {/* Coupon Section */}
                    <CouponSection
                        subtotal={subtotal}
                        deliveryFee={DELIVERY_FEE}
                        appliedCoupon={appliedCoupon}
                        couponDiscount={couponDiscount}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                    />

                    <div className="cart-summary-card">
                        <h3 className="cart-summary-title">
                            <FaTag /> Order Summary
                        </h3>

                        <div className="cart-summary-rows">
                            {/* Subtotal */}
                            <div className="cart-summary-row">
                                <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
                                <span>₹{subtotal}</span>
                            </div>

                            {/* Coupon Discount if applied */}
                            {appliedCoupon && couponDiscount > 0 && (
                                <div className="cart-summary-row" style={{ color: "#16a34a", fontWeight: 700 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <FaPercent style={{ fontSize: "0.75rem" }} /> Coupon ({appliedCoupon.code})
                                    </span>
                                    <span>−₹{couponDiscount}</span>
                                </div>
                            )}

                            {/* Estimated Delivery */}
                            <div className="cart-summary-row" style={{ background: "#f0fdf4", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                                <span className="cart-delivery-label" style={{ color: "#15803d", fontWeight: 700 }}>
                                    <FaTruck /> Est. Delivery
                                </span>
                                <span style={{ fontWeight: 800, color: "#166534" }}>
                                    {mainItemStockInfo.deliveryEta}
                                </span>
                            </div>

                            {/* Delivery Charge */}
                            <div className="cart-summary-row">
                                <span className="cart-delivery-label">
                                    Delivery Charge
                                </span>
                                <span className={isFreeDelivery ? "cart-free" : "cart-delivery-amount"}>
                                    {isFreeDelivery ? "FREE" : `₹${DELIVERY_FEE}`}
                                </span>
                            </div>
                        </div>

                        {/* Free-delivery hint */}
                        <div className="cart-delivery-hint">
                            <span className="cart-delivery-hint-icon">🚚</span>
                            {isFreeDelivery ? (
                                <span className="cart-delivery-hint--earned">You've unlocked free delivery!</span>
                            ) : (
                                <span>
                                    Add <strong>₹{FREE_DELIVERY_THRESHOLD - subtotal}</strong> more for free delivery.
                                    <em> (Free on orders above ₹{FREE_DELIVERY_THRESHOLD})</em>
                                </span>
                            )}
                        </div>

                        <div className="cart-summary-divider" />

                        {/* Total */}
                        <div className="cart-summary-total">
                            <span>Total Amount</span>
                            <span className="cart-total-val">₹{total}</span>
                        </div>

                        {hasOutOfStock && (
                            <div style={{ padding: "0.6rem", background: "#fef2f2", border: "1px solid #fecdd3", borderRadius: "6px", color: "#dc2626", fontSize: "0.8rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <FaExclamationTriangle /> Please remove out-of-stock items before checkout.
                            </div>
                        )}

                        <button
                            className="cart-checkout-btn"
                            disabled={hasOutOfStock}
                            onClick={() =>
                                navigate("/patient/checkout", {
                                    state: {
                                        appliedCoupon,
                                        couponDiscount,
                                        isFreeDeliveryCoupon,
                                        subtotal,
                                        total,
                                        cartItems,
                                    },
                                })
                            }
                            style={{ opacity: hasOutOfStock ? 0.5 : 1, cursor: hasOutOfStock ? "not-allowed" : "pointer" }}
                        >
                            Proceed to Checkout →
                        </button>

                        <div className="cart-secure-note">
                            🔒 Safe &amp; Secure Payments
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default PatientCart;