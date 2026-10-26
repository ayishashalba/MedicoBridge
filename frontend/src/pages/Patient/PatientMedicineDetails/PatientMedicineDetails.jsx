import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaTag,
  FaPills,
  FaFlask,
  FaBoxOpen,
  FaThermometerHalf,
  FaCalendarAlt,
  FaShareAlt,
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaInfoCircle,
  FaStore,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import { getStockAndDeliveryInfo } from "../../../utils/pharmacyDelivery";
import { getEffectiveMedicinePrice } from "../../../utils/productOffers";
import "./PatientMedicineDetails.css";

const CATEGORY_EMOJIS = {
  Tablet: "💊",
  Capsule: "💊",
  Supplement: "🍊",
  Syrup: "🧪",
  Injection: "💉",
  Ointment: "🩹",
  Drops: "💧",
  Inhaler: "🫁",
  Cream: "🧴",
  Gel: "🧴",
  Powder: "🧂",
};

const discountPct = (price, mrp) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

function InfoBlock({ icon, title, children }) {
  return (
    <div className="medicine-details-info-block">
      <div className="medicine-details-info-block-header">
        <span className="medicine-details-info-block-icon">{icon}</span>
        <h3 className="medicine-details-info-block-title">{title}</h3>
      </div>
      <div className="medicine-details-info-block-body">{children}</div>
    </div>
  );
}

export default function PatientMedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [medicine, setMedicine] = useState(() => location.state?.medicine || null);
  const [loading, setLoading] = useState(!location.state?.medicine);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [hasUploadedRx, setHasUploadedRx] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Medicine ID is missing.");
      setLoading(false);
      return;
    }

    const fetchMed = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/medicines/${id}`);
        const data = await res.json();

        if (res.ok && data.data) {
          setMedicine(data.data);
          const rawStock = data.data.stock;
          const numStock =
            typeof rawStock === "number"
              ? rawStock
              : rawStock !== null && rawStock !== undefined
              ? Number(rawStock)
              : 0;
          const isAvail = data.data.isAvailable !== false && numStock > 0;
          if (!isAvail) {
            setQty(0);
          } else {
            setQty(1);
          }
        } else {
          setError(data.message || "Medicine not found.");
          setMedicine(null);
        }
      } catch (err) {
        console.error("Failed to load medicine details:", err);
        setError("Medicine not found.");
        setMedicine(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMed();
  }, [id]);

  if (loading) {
    return (
      <div className="medicine-details-page">
        <div className="medicine-details-topbar">
          <button
            className="medicine-details-back-btn"
            onClick={() => navigate("/patient/pharmacy")}
            aria-label="Go back"
            id="medicine-details-back"
          >
            <FaArrowLeft />
            <span>Back to Pharmacy</span>
          </button>
        </div>
        <div className="medicine-details-loading-state">
          <div className="medicine-details-spinner"></div>
          <p style={{ color: "#64748b", fontWeight: "500" }}>Loading medicine details...</p>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="medicine-details-page">
        <div className="medicine-details-topbar">
          <button
            className="medicine-details-back-btn"
            onClick={() => navigate("/patient/pharmacy")}
            aria-label="Go back"
            id="medicine-details-back"
          >
            <FaArrowLeft />
            <span>Back to Pharmacy</span>
          </button>
        </div>
        <div className="medicine-details-error-state">
          <FaExclamationTriangle style={{ fontSize: "3.5rem", color: "#f59e0b", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.75rem", color: "#1e293b", marginBottom: "0.5rem", fontWeight: "700" }}>
            Medicine not found.
          </h2>
          <p style={{ color: "#64748b", maxWidth: "420px", marginBottom: "1.75rem", lineHeight: "1.5" }}>
            The medicine you requested could not be located in our verified pharmacy catalog or has been removed.
          </p>
          <button
            className="medicine-details-back-btn"
            style={{ background: "#2563eb", color: "#fff", borderColor: "#2563eb" }}
            onClick={() => navigate("/patient/pharmacy")}
          >
            Browse Available Medicines
          </button>
        </div>
      </div>
    );
  }

  // Stock availability based on real MongoDB stock quantity
  const rawStock = medicine.stock;
  const numStock =
    typeof rawStock === "number"
      ? rawStock
      : rawStock !== null && rawStock !== undefined
      ? Number(rawStock)
      : 0;
  const isAvailable = medicine.isAvailable !== false;

  // Show "Out of Stock" only when the actual MongoDB stock quantity is 0 or less, or the medicine is unavailable.
  const isOutOfStock = !isAvailable || numStock <= 0;
  const availableStock = isOutOfStock ? 0 : numStock;
  const isRx = Boolean(medicine.requiresPrescription);

  // Delivery estimation
  const deliveryInfo = getStockAndDeliveryInfo(medicine.stock, isAvailable);

  // Live Automatic Product Offers calculation
  const pricing = getEffectiveMedicinePrice(medicine);
  const effectivePrice = pricing.finalPrice ?? medicine.price ?? 0;
  const originalPrice = pricing.originalPrice ?? medicine.price ?? 0;
  const mrp = pricing.mrp || Math.round(originalPrice * 1.25);
  const discount = discountPct(effectivePrice, mrp);
  const totalPrice = (effectivePrice * (isOutOfStock ? 0 : qty)).toFixed(2);

  const emoji = CATEGORY_EMOJIS[medicine.category] || "💊";

  // Quantity controls: 1 up to availableStock (0 when out of stock)
  const handleDecreaseQty = () => {
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (availableStock > 0 && qty < availableStock) {
      setQty((prev) => prev + 1);
    } else if (availableStock > 0) {
      toast.info(`Maximum available quantity is ${availableStock}.`);
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("This medicine is currently out of stock.");
      return;
    }
    if (isRx && !hasUploadedRx) {
      setShowRxModal(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to add items to your cart.");
      navigate("/login/patient");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: medicine._id || medicine.id,
          quantity: qty,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setAddedToCart(true);
        toast.success(`${medicine.name} (${qty}) added to cart!`);
        setTimeout(() => setAddedToCart(false), 2500);
      } else {
        if (data.message && data.message.includes("All available stock is already added")) {
          toast.info("All available stock is already added to your cart.");
        } else {
          toast.error(data.message || "Failed to add medicine to cart.");
        }
      }
    } catch (err) {
      console.error("Cart error:", err);
      toast.error("Network error while adding to cart.");
    }
  };

  // Buy Now
  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast.error("This medicine is currently out of stock.");
      return;
    }
    if (isRx && !hasUploadedRx) {
      setShowRxModal(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to proceed with purchase.");
      navigate("/login/patient");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineId: medicine._id || medicine.id,
          quantity: qty,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        navigate("/patient/checkout");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to prepare order.");
      }
    } catch (err) {
      console.error("Buy now error:", err);
      navigate("/patient/checkout");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: medicine.name,
          text: `Check out ${medicine.name} on MedicoBridge!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Medicine link copied to clipboard!");
    }
  };

  const formattedExpiry = medicine.expiryDate
    ? new Date(medicine.expiryDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="medicine-details-page">
      {/* Top Nav Bar */}
      <div className="medicine-details-topbar">
        <button
          className="medicine-details-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          id="medicine-details-back"
        >
          <FaArrowLeft />
          <span>Back to Pharmacy</span>
        </button>
        <div className="medicine-details-topbar-actions">
          <button
            className="medicine-details-share-btn"
            onClick={handleShare}
            aria-label="Share"
            id="medicine-details-share"
          >
            <FaShareAlt />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Hero Container */}
      <div className="medicine-details-container">
        {/* Left Side: Product Media */}
        <div className="medicine-details-left">
          <div className="medicine-details-image-wrap" style={{ background: "#f8fafc" }}>
            {discount > 0 && (
              <div className="medicine-details-ribbon">
                <FaTag />
                <span>{discount}% OFF</span>
              </div>
            )}
            {medicine.image ? (
              <img
                src={medicine.image}
                alt={medicine.name}
                className="medicine-details-img"
              />
            ) : (
              <span className="medicine-details-emoji" role="img" aria-label={medicine.name}>
                {emoji}
              </span>
            )}
            <span
              className="medicine-details-cat-chip"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
              }}
            >
              {medicine.category || "General"}
            </span>
          </div>

          <div className="medicine-details-trust-row">
            <div className="medicine-details-trust-item">
              <FaShieldAlt className="medicine-details-trust-icon" />
              <span>100% Genuine Medicine</span>
            </div>
            <div className="medicine-details-trust-item">
              <FaTruck className="medicine-details-trust-icon" />
              <span>{deliveryInfo.deliveryEta} Delivery</span>
            </div>
            <div className="medicine-details-trust-item">
              <FaUndo className="medicine-details-trust-icon" />
              <span>Easy Returns &amp; Replacement</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="medicine-details-right">
          <div className="medicine-details-badge-row">
            <span
              className={`medicine-details-rx-badge ${
                isRx ? "medicine-details-rx-badge--rx" : "medicine-details-rx-badge--otc"
              }`}
            >
              {isRx ? "℞ Prescription Required" : "OTC (No Prescription Required)"}
            </span>
            <span className="medicine-details-cat-badge">{medicine.category}</span>
          </div>

          <h1 className="medicine-details-name">{medicine.name}</h1>

          <div className="medicine-details-meta-row">
            {medicine.genericName && (
              <span className="medicine-details-brand">
                <strong>Salt / Generic:</strong> {medicine.genericName}
              </span>
            )}
            <span className="medicine-details-manufacturer">
              <strong>Manufacturer:</strong>{" "}
              {medicine.manufacturer || "Verified Pharmaceutical"}
            </span>
            {medicine.pharmacyId?.name && (
              <span className="medicine-details-brand">
                <strong><FaStore style={{ marginRight: "4px" }} />Pharmacy:</strong>{" "}
                {medicine.pharmacyId.name} {medicine.pharmacyId.city ? `(${medicine.pharmacyId.city})` : ""}
              </span>
            )}
          </div>

          {medicine.pharmacyId?.rating && (
            <div className="medicine-details-stars" style={{ margin: "4px 0 12px" }}>
              <span style={{ color: "#f59e0b", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.95rem" }}>
                <FaStar /> {medicine.pharmacyId.rating.toFixed(1)}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.85rem", marginLeft: "4px" }}>
                Verified Partner Rating
              </span>
            </div>
          )}

          <hr className="medicine-details-divider" />

          {/* Automatic Product Offer Banner */}
          {pricing.hasOffer && (
            <div
              style={{
                background: "#fef3c7",
                color: "#b45309",
                fontSize: "0.85rem",
                fontWeight: "700",
                padding: "0.45rem 0.85rem",
                borderRadius: "6px",
                marginBottom: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                border: "1px solid #fde68a",
              }}
            >
              🏷️ {pricing.badgeText} (Auto Applied)
            </div>
          )}

          {/* Pricing */}
          <div className="medicine-details-pricing">
            <span className="medicine-details-price">₹{effectivePrice}</span>
            {pricing.hasOffer && (
              <span
                style={{
                  fontSize: "1.1rem",
                  textDecoration: "line-through",
                  color: "#94a3b8",
                  fontWeight: "600",
                  marginRight: "0.4rem",
                }}
              >
                ₹{originalPrice}
              </span>
            )}
            <span className="medicine-details-mrp">MRP ₹{mrp}</span>
            {discount > 0 && (
              <span className="medicine-details-discount-badge">{discount}% OFF</span>
            )}
          </div>
          <p className="medicine-details-incl-tax">Inclusive of all taxes</p>

          {/* Stock Status Badge: Show Out of Stock only if 0/unavailable, else In Stock without warnings */}
          <div
            className={`medicine-details-stock-badge ${
              isOutOfStock
                ? "medicine-details-stock--out"
                : "medicine-details-stock--in"
            }`}
          >
            <span className="medicine-details-stock-icon">
              {isOutOfStock ? "✕" : "✓"}
            </span>
            <span>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>

          <div className="medicine-details-expiry" style={{ marginTop: "0.5rem" }}>
            <FaTruck
              className="medicine-details-expiry-icon"
              style={{ color: "var(--primary-color, #2563eb)" }}
            />
            <span>
              Estimated Delivery: <strong>{deliveryInfo.deliveryEta}</strong>
            </span>
          </div>

          {/* Quantity Selector: 1 up to availableStock */}
          <div className="medicine-details-qty-section">
            <label className="medicine-details-qty-label">Quantity</label>
            <div className="medicine-details-qty-ctrl">
              <button
                className="medicine-details-qty-btn"
                onClick={handleDecreaseQty}
                disabled={isOutOfStock || qty <= 1}
                aria-label="Decrease quantity"
                id="medicine-details-qty-dec"
              >
                −
              </button>
              <span className="medicine-details-qty-val">
                {isOutOfStock ? 0 : qty}
              </span>
              <button
                className="medicine-details-qty-btn"
                onClick={handleIncreaseQty}
                disabled={isOutOfStock || qty >= availableStock}
                aria-label="Increase quantity"
                id="medicine-details-qty-inc"
              >
                +
              </button>
            </div>
            {!isOutOfStock && (
              <span className="medicine-details-qty-total">
                Total: <strong>₹{totalPrice}</strong>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="medicine-details-actions">
            <button
              className={`medicine-details-cart-btn${
                addedToCart ? " medicine-details-cart-btn--added" : ""
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              id="medicine-details-add-cart"
              aria-label="Add to cart"
            >
              <FaShoppingCart />
              <span>
                {isOutOfStock
                  ? "Out of Stock"
                  : addedToCart
                  ? "✓ Added to Cart!"
                  : "Add to Cart"}
              </span>
            </button>
            <button
              className="medicine-details-buy-btn"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              id="medicine-details-buy-now"
              aria-label="Buy now"
            >
              <FaBolt />
              <span>Buy Now</span>
            </button>
          </div>

          {isOutOfStock && (
            <p className="medicine-details-oos-msg">
              <FaInfoCircle /> This medicine is currently out of stock. Please check back later.
            </p>
          )}
        </div>
      </div>

      {/* Information Sections */}
      <div className="medicine-details-sections">
        {medicine.description && (
          <InfoBlock icon={<FaInfoCircle />} title="About this Medicine">
            <p className="medicine-details-description">{medicine.description}</p>
          </InfoBlock>
        )}

        <InfoBlock icon={<FaPills />} title="Dosage &amp; Usage Instructions">
          <p className="medicine-details-description">
            {medicine.dosageForm
              ? `Dosage Form: ${medicine.dosageForm}. Take as directed by your physician or pharmacist.`
              : "Take this medicine in the dosage and frequency prescribed by your healthcare professional."}
          </p>
        </InfoBlock>

        <InfoBlock icon={<FaThermometerHalf />} title="Storage Instructions">
          <p className="medicine-details-description">
            {medicine.storageTemp
              ? `Store at ${medicine.storageTemp}. Keep in a cool, dry place away from direct heat and moisture.`
              : "Store below 30°C in a dry place. Protect from direct heat, sunlight, and moisture. Keep out of reach of children."}
          </p>
        </InfoBlock>

        {formattedExpiry && (
          <InfoBlock icon={<FaCalendarAlt />} title="Expiry Date">
            <div className="medicine-details-expiry-detail">
              <FaCalendarAlt className="medicine-details-expiry-detail-icon" />
              <span>
                Batch expires in <strong>{formattedExpiry}</strong>
              </span>
            </div>
          </InfoBlock>
        )}

        <InfoBlock icon={<FaBoxOpen />} title="Product Specifications">
          <div className="medicine-details-product-grid">
            <div className="medicine-details-product-item">
              <span className="medicine-details-product-key">Medicine Name</span>
              <span className="medicine-details-product-val">{medicine.name}</span>
            </div>
            {medicine.genericName && (
              <div className="medicine-details-product-item">
                <span className="medicine-details-product-key">Generic Composition</span>
                <span className="medicine-details-product-val">{medicine.genericName}</span>
              </div>
            )}
            <div className="medicine-details-product-item">
              <span className="medicine-details-product-key">Category</span>
              <span className="medicine-details-product-val">{medicine.category}</span>
            </div>
            {medicine.dosageForm && (
              <div className="medicine-details-product-item">
                <span className="medicine-details-product-key">Dosage Form</span>
                <span className="medicine-details-product-val">{medicine.dosageForm}</span>
              </div>
            )}
            <div className="medicine-details-product-item">
              <span className="medicine-details-product-key">Manufacturer</span>
              <span className="medicine-details-product-val">
                {medicine.manufacturer || "Verified Pharmaceutical"}
              </span>
            </div>
            {medicine.unit && (
              <div className="medicine-details-product-item">
                <span className="medicine-details-product-key">Packaging Unit</span>
                <span className="medicine-details-product-val">{medicine.unit}</span>
              </div>
            )}
            {medicine.batchNumber && (
              <div className="medicine-details-product-item">
                <span className="medicine-details-product-key">Batch Number</span>
                <span className="medicine-details-product-val">{medicine.batchNumber}</span>
              </div>
            )}
            <div className="medicine-details-product-item">
              <span className="medicine-details-product-key">Prescription Requirement</span>
              <span className="medicine-details-product-val">
                {isRx ? "Prescription Required (Rx)" : "Over-The-Counter (OTC)"}
              </span>
            </div>
            <div className="medicine-details-product-item">
              <span className="medicine-details-product-key">Stock Availability</span>
              <span className="medicine-details-product-val">
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </span>
            </div>
            {formattedExpiry && (
              <div className="medicine-details-product-item">
                <span className="medicine-details-product-key">Expiry Date</span>
                <span className="medicine-details-product-val">{formattedExpiry}</span>
              </div>
            )}
          </div>
        </InfoBlock>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="medicine-details-sticky-bar">
        <div className="medicine-details-sticky-price">
          <span>₹{effectivePrice}</span>
          {discount > 0 && (
            <span className="medicine-details-sticky-off">{discount}% off</span>
          )}
        </div>
        <div className="medicine-details-sticky-actions">
          <button
            className="medicine-details-sticky-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            id="medicine-details-sticky-cart"
          >
            <FaShoppingCart /> Cart
          </button>
          <button
            className="medicine-details-sticky-buy"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            id="medicine-details-sticky-buy"
          >
            <FaBolt /> Buy Now
          </button>
        </div>
      </div>

      {/* Prescription Requirement Modal */}
      {showRxModal && (
        <div
          className="appt-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
          onClick={() => setShowRxModal(false)}
        >
          <div
            style={{
              background: "var(--bg-primary, #ffffff)",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "460px",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              border: "1px solid var(--border-color, #e2e8f0)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                color: "#d97706",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>℞</span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Prescription Required
              </h3>
            </div>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#475569",
                lineHeight: "1.5",
                marginBottom: "1.25rem",
              }}
            >
              <strong>{medicine.name}</strong> is a prescription medication (Rx). Please
              upload a doctor's prescription or attach an existing record to complete your
              order.
            </p>
            <div
              style={{
                backgroundColor: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "8px",
                padding: "0.85rem",
                marginBottom: "1.25rem",
              }}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                id="rx-modal-file"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setHasUploadedRx(true);
                    setShowRxModal(false);
                    toast.success("Prescription attached successfully!");
                  }
                }}
              />
              <label
                htmlFor="rx-modal-file"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.65rem 1rem",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Upload Prescription (JPG, PNG, PDF)
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
                onClick={() => setShowRxModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
