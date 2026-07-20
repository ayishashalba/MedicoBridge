import React, { useState } from "react";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaPills, FaTag, FaTruck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientCart.css";

/* ─── Mock cart data enriched with brand/emoji/stock ─────────────── */
const initialCart = [
    {
        id: 1,
        name: "Paracetamol 650mg",
        brand: "Calpol",
        emoji: "💊",
        price: 35,
        mrp: 45,
        quantity: 2,
        stock: "in-stock",
        category: "Tablet",
        highlight: "#e8f5e9",
        accentColor: "#2e7d32",
    },
    {
        id: 2,
        name: "Vitamin C Tablets",
        brand: "Limcee",
        emoji: "🍊",
        price: 220,
        mrp: 280,
        quantity: 1,
        stock: "low-stock",
        category: "Supplement",
        highlight: "#fff8e1",
        accentColor: "#e65100",
    },
];

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 499;

const stockConfig = {
    "in-stock": { label: "In Stock", cls: "cart-stock--in" },
    "low-stock": { label: "Low Stock", cls: "cart-stock--low" },
    "out-of-stock": { label: "Out of Stock", cls: "cart-stock--out" },
};

/* ─── PatientCart Component ─────────────────────────────────────── */
function PatientCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(initialCart);

    /* keep original logic — only wrap with ±1 controls */
    const updateQuantity = (id, delta) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    /* ── Pricing calculations ────────────────────────────────────── */
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
    const delivery = cartItems.length > 0 && !isFreeDelivery ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

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
                        const stock = stockConfig[item.stock] || stockConfig["in-stock"];
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
                                        <span className={`cart-stock-badge ${stock.cls}`}>
                                            {stock.label}
                                        </span>
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

                                        {/* Quantity controls */}
                                        <div className="cart-qty-ctrl">
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="cart-qty-val">{item.quantity}</span>
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
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

                            {/* Delivery */}
                            <div className="cart-summary-row">
                                <span className="cart-delivery-label">
                                    <FaTruck /> Delivery Charge
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

                        <button
                            className="cart-checkout-btn"
                            onClick={() => navigate("/patient/checkout")}
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