import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStockAndDeliveryInfo } from "../../../utils/pharmacyDelivery";
import { getEffectiveMedicinePrice } from "../../../utils/productOffers";
import { API_BASE_URL } from "../../../services/apiConfig";
import { toast } from "react-toastify";
import "./FeaturedMedicines.css";

const CATEGORY_EMOJIS = {
  Tablet: "💊",
  Capsule: "💉",
  Supplement: "🍊",
  Syrup: "🧪",
  Injection: "💉",
  Ointment: "🩹",
};

/* ─── Utility ───────────────────────────────────────────────────── */
const discountPct = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

/* ─── Single Medicine Card ───────────────────────────────────────── */
function MedicineCard({ med, hasPrescription, onPrescriptionRequired }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const stockInfo = getStockAndDeliveryInfo(med.stock, med.isAvailable);
  const outOfStock = !stockInfo.canOrder;
  const isStockMissing = stockInfo.status === "unavailable";
  const availableStock = stockInfo.availableStock;

  // Evaluate Automatic Product Offer
  const pricing = getEffectiveMedicinePrice(med);
  const effectivePrice = pricing.finalPrice ?? med.price ?? 0;
  const originalPrice = pricing.originalPrice ?? med.price ?? 0;
  const mrp = pricing.mrp || Math.round(originalPrice * 1.25);
  const discount = discountPct(effectivePrice, mrp);

  const handleDecreaseQty = () => {
    setQty((q) => Math.max(1, q - 1));
  };

  const handleIncreaseQty = () => {
    if (availableStock > 0 && qty >= availableStock) {
      return;
    }
    setQty((q) => q + 1);
  };

  const handleAddToCart = async () => {
    if (outOfStock) return;
    if ((med.requiresPrescription || med.isRx) && !hasPrescription) {
      if (onPrescriptionRequired) {
        onPrescriptionRequired(med);
      }
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login/patient");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: med.rawId || med.id,
          quantity: qty,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setAdded(true);
        toast.success(`${med.name} (${qty}) added to cart!`);
        setTimeout(() => setAdded(false), 2200);
      } else {
        if (data.message && data.message.includes("All available stock is already added")) {
          toast.info("All available stock is already added to your cart.");
        } else {
          toast.error(data.message || "Failed to add to cart.");
        }
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    }
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
        {stockInfo.status === "low-stock" && (
          <div className="featured-stock-badge-wrap">
            <span className="featured-stock-badge featured-stock--low">
              Low Stock ({stockInfo.stockText})
            </span>
          </div>
        )}
        {stockInfo.status === "out-of-stock" && (
          <div className="featured-stock-badge-wrap">
            <span className="featured-stock-badge featured-stock--out">
              Out of Stock
            </span>
          </div>
        )}
        {stockInfo.status === "unavailable" && (
          <div className="featured-stock-badge-wrap">
            <span
              className="featured-stock-badge featured-stock--out"
              style={{ background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }}
            >
              Stock unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Info block ────────────────────────────────────────── */}
      <div className="featured-info">
        <h4 className="featured-med-name">{med.name}</h4>
        <p className="featured-brand-name">{med.brand}</p>

        {/* Automatic Product Offer Badge */}
        {pricing.hasOffer && (
          <div style={{
            background: "#fef3c7",
            color: "#b45309",
            fontSize: "0.72rem",
            fontWeight: "700",
            padding: "0.2rem 0.5rem",
            borderRadius: "4px",
            marginBottom: "0.35rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            border: "1px solid #fde68a"
          }}>
            🏷️ {pricing.badgeText}
          </div>
        )}

        <div className="featured-price-row">
          <span className="featured-price">₹{effectivePrice}</span>
          {pricing.hasOffer && (
            <span style={{ fontSize: "0.82rem", textDecoration: "line-through", color: "#94a3b8", fontWeight: "600" }}>
              ₹{originalPrice}
            </span>
          )}
          <span className="featured-mrp">MRP ₹{mrp}</span>
        </div>
      </div>

      {/* ── Quantity selector ─────────────────────────────────── */}
      <div className="featured-qty-area">
        <div className="featured-qty-ctrl">
          <button
            className="featured-qty-btn"
            onClick={handleDecreaseQty}
            disabled={outOfStock || qty <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="featured-qty-val">{outOfStock ? 0 : qty}</span>
          <button
            className="featured-qty-btn"
            onClick={handleIncreaseQty}
            disabled={outOfStock || (availableStock > 0 && qty >= availableStock)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="featured-qty-total">
          ₹{(effectivePrice * (outOfStock ? 0 : qty)).toFixed(2)}
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
          {outOfStock
            ? isStockMissing
              ? "Unavailable"
              : "Out of Stock"
            : added
            ? "✓ Added!"
            : "🛒 Add to Cart"}
        </button>
        <button
          className="featured-detail-btn"
          id={`view-details-${med.id}`}
          aria-label={`View details for ${med.name}`}
          onClick={() => navigate(`/patient/medicine/${med.id}`, { state: { medicine: med } })}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

/* ─── Featured Medicines Section (export) ───────────────────────── */
export default function FeaturedMedicines({ hasPrescription, onPrescriptionRequired }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const filterOptions = ["All", "Tablet", "Capsule", "Supplement"];

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/medicines`);
        const data = await res.json();
        if (res.ok && data.data && Array.isArray(data.data)) {
          const mapped = data.data.map((m) => {
            const numStock = typeof m.stock === "number" ? m.stock : (m.stock !== null && m.stock !== undefined ? Number(m.stock) : null);
            return {
              id: m._id,
              rawId: m._id,
              name: m.name,
              brand: m.manufacturer || "Generic",
              price: m.finalPrice ?? m.price ?? 50,
              mrp: m.mrp || Math.round((m.price || 50) * 1.25),
              emoji: CATEGORY_EMOJIS[m.category] || "💊",
              stock: numStock,
              stockStatus: m.stockStatus,
              isAvailable: m.isAvailable !== false,
              requiresPrescription: Boolean(m.requiresPrescription),
              isRx: Boolean(m.requiresPrescription),
              category: m.category || "Tablet",
              highlight: "#e8f5e9",
              accentColor: "#2e7d32",
            };
          });
          setMedicines(mapped);
        } else {
          setMedicines([]);
        }
      } catch (err) {
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

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

      {filtered.length === 0 && !loading && (
        <div className="featured-empty">
          <span>🔍</span>
          <p>No medicines found in this category.</p>
        </div>
      )}
    </section>
  );
}
