import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTruck } from "react-icons/fa";
import { getStockAndDeliveryInfo } from "../../../utils/pharmacyDelivery";
import "./FeaturedMedicines.css";

/* ─── Medicine Data ─────────────────────────────────────────────── */
const medicines = [
  {
    id: 1,
    name: "Paracetamol 650mg",
    brand: "Calpol",
    price: 28,
    mrp: 35,
    emoji: "💊",
    stockUnits: 120, // >40 units -> 1-2 days
    stock: "in-stock",
    requiresPrescription: false,
    isRx: false,
    category: "Tablet",
    highlight: "#e8f5e9",
    accentColor: "#2e7d32",
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    brand: "Novamox",
    price: 145,
    mrp: 185,
    emoji: "💉",
    stockUnits: 55, // >40 units -> 1-2 days
    stock: "in-stock",
    requiresPrescription: true,
    isRx: true,
    category: "Capsule",
    highlight: "#e3f2fd",
    accentColor: "#1565c0",
  },
  {
    id: 3,
    name: "Vitamin C 1000mg",
    brand: "Limcee",
    price: 62,
    mrp: 80,
    emoji: "🍊",
    stockUnits: 8, // <10 units -> 3-5 days
    stock: "low-stock",
    requiresPrescription: false,
    isRx: false,
    category: "Supplement",
    highlight: "#fff8e1",
    accentColor: "#e65100",
  },
  {
    id: 4,
    name: "Azithromycin 500mg",
    brand: "Zithromax",
    price: 210,
    mrp: 265,
    emoji: "🔬",
    stockUnits: 25, // 10-40 units -> 2-3 days
    stock: "in-stock",
    requiresPrescription: true,
    isRx: true,
    category: "Tablet",
    highlight: "#f3e5f5",
    accentColor: "#6a1b9a",
  },
  {
    id: 5,
    name: "Omeprazole 20mg",
    brand: "Omez",
    price: 55,
    mrp: 68,
    emoji: "🌿",
    stockUnits: 5, // <10 units -> 3-5 days
    stock: "low-stock",
    requiresPrescription: false,
    isRx: false,
    category: "Capsule",
    highlight: "#e8f5e9",
    accentColor: "#2e7d32",
  },
  {
    id: 6,
    name: "Cetirizine 10mg",
    brand: "Zyrtec",
    price: 38,
    mrp: 50,
    emoji: "🌸",
    stockUnits: 0, // 0 units -> Out of Stock
    stock: "out-of-stock",
    requiresPrescription: false,
    isRx: false,
    category: "Tablet",
    highlight: "#fce4ec",
    accentColor: "#880e4f",
  },
  {
    id: 7,
    name: "Metformin 500mg",
    brand: "Glycomet",
    price: 35,
    mrp: 45,
    emoji: "⚡",
    stockUnits: 80, // >40 units -> 1-2 days
    stock: "in-stock",
    requiresPrescription: true,
    isRx: true,
    category: "Tablet",
    highlight: "#e3f2fd",
    accentColor: "#0d47a1",
  },
  {
    id: 8,
    name: "D3 Vitamin 60K",
    brand: "Calcirol",
    price: 90,
    mrp: 120,
    emoji: "☀️",
    stockUnits: 60, // >40 units -> 1-2 days
    stock: "in-stock",
    requiresPrescription: false,
    isRx: false,
    category: "Supplement",
    highlight: "#fffde7",
    accentColor: "#f57f17",
  },
];

/* ─── Utility ───────────────────────────────────────────────────── */
const discountPct = (price, mrp) => Math.round(((mrp - price) / mrp) * 100);

/* ─── Single Medicine Card ───────────────────────────────────────── */
function MedicineCard({ med, hasPrescription, onPrescriptionRequired }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const stockInfo = getStockAndDeliveryInfo(med.stockUnits ?? med.stock);
  const outOfStock = !stockInfo.canOrder;
  const discount = discountPct(med.price, med.mrp);

  const handleAddToCart = () => {
    if (outOfStock) return;
    if ((med.requiresPrescription || med.isRx) && !hasPrescription) {
      if (onPrescriptionRequired) {
        onPrescriptionRequired(med);
      }
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div
      className={`featured-card${outOfStock ? " featured-card--oos" : ""}`}
      style={{ "--card-accent": med.accentColor }}
    >
      {/* ── Badge row ─────────────────────────────────────────── */}
      <div className="featured-badges-row">
        {(med.requiresPrescription || med.isRx) ? (
          <span className="featured-badge featured-badge--rx" title="Prescription Required">
            ℞ Rx Required
          </span>
        ) : (
          <span className="featured-badge" style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
            OTC (No Rx)
          </span>
        )}
        {discount > 0 && (
          <span className="featured-badge featured-badge--discount">{discount}% OFF</span>
        )}
      </div>

      {/* ── Image / Icon area ─────────────────────────────────── */}
      <div className="featured-img-wrap" style={{ background: med.highlight }}>
        <span className="featured-emoji" role="img" aria-label={med.name}>
          {med.emoji}
        </span>
        <span
          className="featured-category-chip"
          style={{
            background: med.accentColor + "22",
            color: med.accentColor,
            borderColor: med.accentColor + "44",
          }}
        >
          {med.category}
        </span>
      </div>

      {/* ── Info block ────────────────────────────────────────── */}
      <div className="featured-info">
        <h4 className="featured-med-name">{med.name}</h4>
        <p className="featured-brand-name">{med.brand}</p>

        <div className="featured-price-row">
          <span className="featured-price">₹{med.price}</span>
          <span className="featured-mrp">MRP ₹{med.mrp}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
          <span className={`featured-stock-badge ${stockInfo.status === "in-stock" || stockInfo.status === "medium-stock" ? "featured-stock--in" : stockInfo.status === "low-stock" ? "featured-stock--low" : "featured-stock--out"}`}>
            {stockInfo.label} ({stockInfo.stockText})
          </span>
          <span style={{ fontSize: "0.75rem", color: stockInfo.canOrder ? "var(--primary-color)" : "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <FaTruck style={{ fontSize: "0.7rem" }} /> {stockInfo.deliveryDesc}
          </span>
        </div>
      </div>

      {/* ── Quantity selector ─────────────────────────────────── */}
      <div className="featured-qty-area">
        <div className="featured-qty-ctrl">
          <button
            className="featured-qty-btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="featured-qty-val">{qty}</span>
          <button
            className="featured-qty-btn"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={outOfStock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="featured-qty-total">
          ₹{(med.price * qty).toFixed(2)}
        </span>
      </div>

      {/* ── Action buttons ────────────────────────────────────── */}
      <div className="featured-actions">
        <button
          className={`featured-cart-btn${added ? " featured-cart-btn--added" : ""}`}
          onClick={handleAddToCart}
          disabled={outOfStock}
          id={`add-cart-${med.id}`}
          aria-label={`Add ${med.name} to cart`}
        >
          {outOfStock ? "Unavailable" : added ? "✓ Added!" : "🛒 Add to Cart"}
        </button>
        <button
          className="featured-detail-btn"
          id={`view-details-${med.id}`}
          aria-label={`View details for ${med.name}`}
          onClick={() => navigate(`/patient/medicine/${med.id}`, { state: { medicine: med } })}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/* ─── Featured Medicines Section (export) ───────────────────────── */
export default function FeaturedMedicines({ hasPrescription, onPrescriptionRequired }) {
  const [filter, setFilter] = useState("All");
  const filterOptions = ["All", "Tablet", "Capsule", "Supplement"];

  const filtered =
    filter === "All" ? medicines : medicines.filter((m) => m.category === filter);

  return (
    <section className="featured-section pharmacy-section">
      {/* Header */}
      <div className="featured-sec-header">
        <div>
          <h3 className="featured-sec-title">🏆 Featured Medicines</h3>
          <p className="featured-sec-subtitle">
            Top-rated, doctor-recommended medicines at best prices
          </p>
        </div>

        {/* Filter pills */}
        <div className="featured-filter-row" role="group" aria-label="Filter by category">
          {filterOptions.map((f) => (
            <button
              key={f}
              className={`featured-filter-pill${filter === f ? " featured-filter-pill--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="featured-grid">
        {filtered.map((med) => (
          <MedicineCard
            key={med.id}
            med={med}
            hasPrescription={hasPrescription}
            onPrescriptionRequired={onPrescriptionRequired}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="featured-empty">
          <span>🔍</span>
          <p>No medicines found in this category.</p>
        </div>
      )}
    </section>
  );
}
