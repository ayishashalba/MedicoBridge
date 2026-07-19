import React, { useState } from "react";
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
  FaHeart,
  FaShareAlt,
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaInfoCircle,
} from "react-icons/fa";
import "./PatientMedicineDetails.css";

/* ─── Medicine Data Store ──────────────────────────────────────── */
const medicinesDB = {
  1: { id: 1, name: "Paracetamol 650mg", brand: "Calpol", manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd.", category: "Tablet", isRx: false, emoji: "💊", highlight: "#e8f5e9", accentColor: "#2e7d32", price: 28, mrp: 35, stock: "in-stock", expiryDate: "March 2027", description: "Calpol 650mg Tablet is a common painkiller used to treat aches and pain. It also helps in reducing high temperature (fever). It works by blocking the release of certain chemical messengers that cause fever and pain. It is used to relieve pain in conditions like headache, migraine, nerve pain, toothache, sore throat, period (menstrual) pains, arthritis, muscle aches, and the common cold.", dosageInstructions: "Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole. Do not chew, crush or break it. Calpol 650mg Tablet may be taken with or without food, but it is better to take it at a fixed time. Adults: 1-2 tablets every 4-6 hours. Maximum: 8 tablets (5200mg) in 24 hours.", sideEffects: ["Nausea", "Vomiting", "Allergic skin reactions", "Liver damage (on overdose)", "Stomach upset"], storageInstructions: "Store below 30°C in a cool, dry place away from direct sunlight and moisture. Keep out of reach of children. Do not use after the expiry date.", genericAlternatives: [{ name: "Dolo 650", brand: "Micro Labs", price: 26 }, { name: "Paracip 650", brand: "Cipla", price: 24 }, { name: "Fepanil 650", brand: "FDC Ltd.", price: 22 }], rating: 4.7, reviewCount: 2841 },
  2: { id: 2, name: "Amoxicillin 500mg", brand: "Novamox", manufacturer: "Cipla Ltd.", category: "Capsule", isRx: true, emoji: "💉", highlight: "#e3f2fd", accentColor: "#1565c0", price: 145, mrp: 185, stock: "in-stock", expiryDate: "June 2027", description: "Novamox 500mg Capsule is a penicillin-type antibiotic. It is used to treat bacterial infections of the ear, nose, throat, lung, skin, and urinary tract. It works by preventing the formation of the bacterial protective covering (cell wall) which is necessary for the survival of bacteria in the human body.", dosageInstructions: "Take this medicine in the dose and duration as advised by your doctor. Swallow it as a whole. Novamox 500mg Capsule may be taken with or without food. Complete the full course of treatment even if you feel better.", sideEffects: ["Diarrhoea", "Nausea", "Skin rash", "Vomiting", "Superinfection"], storageInstructions: "Store below 25°C in a cool, dry place. Keep out of reach of children. Do not refrigerate unless directed.", genericAlternatives: [{ name: "Mox 500", brand: "Ranbaxy", price: 138 }, { name: "Amoxil 500", brand: "GSK", price: 155 }], rating: 4.5, reviewCount: 1204 },
  3: { id: 3, name: "Vitamin C 1000mg", brand: "Limcee", manufacturer: "Abbott India Ltd.", category: "Supplement", isRx: false, emoji: "🍊", highlight: "#fff8e1", accentColor: "#e65100", price: 62, mrp: 80, stock: "low-stock", expiryDate: "January 2028", description: "Limcee 1000mg is a Vitamin C supplement used to prevent and treat Vitamin C deficiency and scurvy. Vitamin C acts as an antioxidant and helps in maintaining healthy teeth and gums. It helps the body absorb iron and is essential for wound healing.", dosageInstructions: "Take one tablet daily or as directed by your doctor. The tablet can be chewed or dissolved in water. Best taken with meals to reduce the risk of stomach upset.", sideEffects: ["Nausea", "Heartburn", "Stomach cramps", "Diarrhoea (at high doses)", "Kidney stones (prolonged very high doses)"], storageInstructions: "Store in a cool, dry place below 30°C. Protect from light and moisture. Keep out of reach of children.", genericAlternatives: [{ name: "Celin 1000", brand: "GSK", price: 58 }, { name: "Ascorbic Acid 1000mg", brand: "Mankind", price: 45 }], rating: 4.8, reviewCount: 3512 },
  4: { id: 4, name: "Azithromycin 500mg", brand: "Zithromax", manufacturer: "Pfizer Ltd.", category: "Tablet", isRx: true, emoji: "🔬", highlight: "#f3e5f5", accentColor: "#6a1b9a", price: 210, mrp: 265, stock: "in-stock", expiryDate: "September 2027", description: "Zithromax 500mg Tablet is an antibiotic medicine used to treat bacterial infections of the respiratory tract, skin, and soft tissues. It works by preventing the synthesis of essential proteins required by bacteria to carry out vital functions.", dosageInstructions: "Take as directed by your doctor. Usually taken once daily for 3-5 days. Can be taken with or without food. Take at the same time each day. Complete the full prescribed course.", sideEffects: ["Diarrhoea", "Nausea", "Stomach pain", "Vomiting", "Headache"], storageInstructions: "Store at room temperature (below 30°C). Keep away from heat, moisture, and direct sunlight. Keep out of reach of children.", genericAlternatives: [{ name: "Azee 500", brand: "Cipla", price: 190 }, { name: "Aziwin 500", brand: "Mankind", price: 175 }], rating: 4.6, reviewCount: 980 },
  5: { id: 5, name: "Omeprazole 20mg", brand: "Omez", manufacturer: "Dr. Reddy's Laboratories Ltd.", category: "Capsule", isRx: false, emoji: "🌿", highlight: "#e8f5e9", accentColor: "#2e7d32", price: 55, mrp: 68, stock: "low-stock", expiryDate: "May 2027", description: "Omez 20mg Capsule is a proton pump inhibitor (PPI) used to treat conditions related to excess acid production in the stomach, such as acid reflux (GERD), peptic ulcers, and Zollinger-Ellison syndrome.", dosageInstructions: "Swallow the capsule whole before meals. Usually taken once or twice daily. Do not crush, chew, or open the capsule. Follow your doctor's instructions carefully.", sideEffects: ["Headache", "Diarrhoea", "Nausea", "Stomach pain", "Vitamin B12 deficiency (long term)"], storageInstructions: "Store below 25°C in a dry place. Keep out of reach of children. Protect from light and moisture.", genericAlternatives: [{ name: "Omeprazole 20", brand: "Ranbaxy", price: 48 }, { name: "Prilosec 20", brand: "AstraZeneca", price: 72 }], rating: 4.5, reviewCount: 1623 },
  6: { id: 6, name: "Cetirizine 10mg", brand: "Zyrtec", manufacturer: "Strides Pharma", category: "Tablet", isRx: false, emoji: "🌸", highlight: "#fce4ec", accentColor: "#880e4f", price: 38, mrp: 50, stock: "out-of-stock", expiryDate: "November 2027", description: "Zyrtec 10mg Tablet is an antiallergic medication used to treat symptoms of allergy such as runny nose, watery eyes, sneezing, and skin rashes. It blocks histamine, a natural substance that causes allergic symptoms.", dosageInstructions: "Take one tablet once daily with or without food. Best taken in the evening if drowsiness is a concern. Swallow with water. Do not exceed 10mg per day.", sideEffects: ["Drowsiness", "Dry mouth", "Fatigue", "Headache", "Stomach upset"], storageInstructions: "Store at room temperature below 30°C. Keep away from sunlight and moisture.", genericAlternatives: [{ name: "Cetzine 10", brand: "GSK", price: 32 }, { name: "Alerid 10", brand: "Cipla", price: 29 }], rating: 4.4, reviewCount: 2110 },
  7: { id: 7, name: "Metformin 500mg", brand: "Glycomet", manufacturer: "USV Ltd.", category: "Tablet", isRx: true, emoji: "⚡", highlight: "#e3f2fd", accentColor: "#0d47a1", price: 35, mrp: 45, stock: "in-stock", expiryDate: "August 2027", description: "Glycomet 500mg Tablet is an antidiabetic medicine used to treat type 2 diabetes mellitus. It works by lowering blood glucose production in the liver and by improving the body's sensitivity to insulin.", dosageInstructions: "Take with meals to reduce stomach upset. Usually taken 2-3 times daily as directed by your doctor. Swallow whole with water. Regular blood glucose monitoring is recommended.", sideEffects: ["Nausea", "Vomiting", "Diarrhoea", "Stomach upset", "Lactic acidosis (rare but serious)"], storageInstructions: "Store below 25°C in a cool, dry place away from sunlight. Keep out of reach of children.", genericAlternatives: [{ name: "Glucophage 500", brand: "Merck", price: 42 }, { name: "Metforal 500", brand: "Torrent", price: 30 }], rating: 4.6, reviewCount: 3890 },
  8: { id: 8, name: "D3 Vitamin 60K", brand: "Calcirol", manufacturer: "Cadila Healthcare Ltd.", category: "Supplement", isRx: false, emoji: "☀️", highlight: "#fffde7", accentColor: "#f57f17", price: 90, mrp: 120, stock: "in-stock", expiryDate: "December 2027", description: "Calcirol 60K is a Vitamin D3 supplement used to treat and prevent Vitamin D deficiency. Vitamin D is essential for the absorption of calcium and phosphorus, helping maintain healthy bones and teeth. It also supports immune function and muscle health.", dosageInstructions: "Dissolve one sachet in water or juice and consume once a week, or as directed by your doctor. Can be taken with or without food. Do not exceed the recommended dose without medical advice.", sideEffects: ["Nausea", "Vomiting", "Constipation", "Weakness", "Hypercalcaemia (at very high doses)"], storageInstructions: "Store in a cool, dry place below 25°C. Protect from direct sunlight. Keep out of reach of children.", genericAlternatives: [{ name: "D-Rise 60K", brand: "USV", price: 82 }, { name: "Arachitol 60K", brand: "Abbott", price: 95 }], rating: 4.9, reviewCount: 5201 },
};

const defaultMedicine = medicinesDB[1];

const discountPct = (price, mrp) => Math.round(((mrp - price) / mrp) * 100);

const stockConfig = {
  "in-stock": { label: "In Stock", icon: "✓", cls: "medicine-details-stock--in" },
  "low-stock": { label: "Low Stock", icon: "⚠", cls: "medicine-details-stock--low" },
  "out-of-stock": { label: "Out of Stock", icon: "✕", cls: "medicine-details-stock--out" },
};

function StarRating({ rating }) {
  return (
    <div className="medicine-details-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "medicine-details-star medicine-details-star--filled" : "medicine-details-star"}>★</span>
      ))}
      <span className="medicine-details-rating-val">{rating}</span>
    </div>
  );
}

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

  const medicine = medicinesDB[parseInt(id)] || defaultMedicine;
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const outOfStock = medicine.stock === "out-of-stock";
  const discount = discountPct(medicine.price, medicine.mrp);
  const stockInfo = stockConfig[medicine.stock] || stockConfig["in-stock"];
  const totalPrice = (medicine.price * qty).toFixed(2);

  const handleAddToCart = () => {
    if (outOfStock) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => { if (!outOfStock) navigate("/patient/checkout"); };

  return (
    <div className="medicine-details-page">
      {/* Top Nav */}
      <div className="medicine-details-topbar">
        <button className="medicine-details-back-btn" onClick={() => navigate(-1)} aria-label="Go back" id="medicine-details-back">
          <FaArrowLeft /><span>Back to Pharmacy</span>
        </button>
        <div className="medicine-details-topbar-actions">
          <button className={`medicine-details-wishlist-btn${wishlisted ? " medicine-details-wishlist-btn--active" : ""}`} onClick={() => setWishlisted(w => !w)} aria-label="Wishlist" id="medicine-details-wishlist">
            <FaHeart /><span>{wishlisted ? "Wishlisted" : "Wishlist"}</span>
          </button>
          <button className="medicine-details-share-btn" aria-label="Share" id="medicine-details-share">
            <FaShareAlt /><span>Share</span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="medicine-details-container">
        {/* Left */}
        <div className="medicine-details-left">
          <div className="medicine-details-image-wrap" style={{ background: medicine.highlight }}>
            {discount > 0 && (
              <div className="medicine-details-ribbon"><FaTag /><span>{discount}% OFF</span></div>
            )}
            <span className="medicine-details-emoji" role="img" aria-label={medicine.name}>{medicine.emoji}</span>
            <span className="medicine-details-cat-chip" style={{ background: medicine.accentColor + "22", color: medicine.accentColor, border: `1px solid ${medicine.accentColor}44` }}>{medicine.category}</span>
          </div>
          <div className="medicine-details-trust-row">
            <div className="medicine-details-trust-item"><FaShieldAlt className="medicine-details-trust-icon" /><span>100% Genuine</span></div>
            <div className="medicine-details-trust-item"><FaTruck className="medicine-details-trust-icon" /><span>Fast Delivery</span></div>
            <div className="medicine-details-trust-item"><FaUndo className="medicine-details-trust-icon" /><span>Easy Returns</span></div>
          </div>
        </div>

        {/* Right */}
        <div className="medicine-details-right">
          <div className="medicine-details-badge-row">
            <span className={`medicine-details-rx-badge${medicine.isRx ? " medicine-details-rx-badge--rx" : " medicine-details-rx-badge--otc"}`}>
              {medicine.isRx ? "℞ Prescription Required" : "OTC"}
            </span>
            <span className="medicine-details-cat-badge">{medicine.category}</span>
          </div>

          <h1 className="medicine-details-name">{medicine.name}</h1>
          <div className="medicine-details-meta-row">
            <span className="medicine-details-brand"><strong>Brand:</strong> {medicine.brand}</span>
            <span className="medicine-details-manufacturer"><strong>Mfr:</strong> {medicine.manufacturer}</span>
          </div>
          <StarRating rating={medicine.rating} />
          <p className="medicine-details-review-count">{medicine.reviewCount?.toLocaleString()} verified reviews</p>

          <hr className="medicine-details-divider" />

          <div className="medicine-details-pricing">
            <span className="medicine-details-price">₹{medicine.price}</span>
            <span className="medicine-details-mrp">MRP ₹{medicine.mrp}</span>
            {discount > 0 && <span className="medicine-details-discount-badge">{discount}% OFF</span>}
          </div>
          <p className="medicine-details-incl-tax">Inclusive of all taxes</p>

          <div className={`medicine-details-stock-badge ${stockInfo.cls}`}>
            <span className="medicine-details-stock-icon">{stockInfo.icon}</span>
            <span>{stockInfo.label}</span>
          </div>

          <div className="medicine-details-expiry">
            <FaCalendarAlt className="medicine-details-expiry-icon" />
            <span>Expires: <strong>{medicine.expiryDate}</strong></span>
          </div>

          {/* Qty */}
          <div className="medicine-details-qty-section">
            <label className="medicine-details-qty-label">Quantity</label>
            <div className="medicine-details-qty-ctrl">
              <button className="medicine-details-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={outOfStock || qty <= 1} aria-label="Decrease quantity" id="medicine-details-qty-dec">−</button>
              <span className="medicine-details-qty-val">{qty}</span>
              <button className="medicine-details-qty-btn" onClick={() => setQty(q => Math.min(99, q + 1))} disabled={outOfStock} aria-label="Increase quantity" id="medicine-details-qty-inc">+</button>
            </div>
            {!outOfStock && <span className="medicine-details-qty-total">Total: <strong>₹{totalPrice}</strong></span>}
          </div>

          {/* Actions */}
          <div className="medicine-details-actions">
            <button className={`medicine-details-cart-btn${addedToCart ? " medicine-details-cart-btn--added" : ""}`} onClick={handleAddToCart} disabled={outOfStock} id="medicine-details-add-cart" aria-label="Add to cart">
              <FaShoppingCart /><span>{outOfStock ? "Unavailable" : addedToCart ? "✓ Added to Cart!" : "Add to Cart"}</span>
            </button>
            <button className="medicine-details-buy-btn" onClick={handleBuyNow} disabled={outOfStock} id="medicine-details-buy-now" aria-label="Buy now">
              <FaBolt /><span>Buy Now</span>
            </button>
          </div>

          {outOfStock && (
            <p className="medicine-details-oos-msg">
              <FaInfoCircle /> This item is currently out of stock. Please check back later.
            </p>
          )}
        </div>
      </div>

      {/* Info Sections */}
      <div className="medicine-details-sections">
        <InfoBlock icon={<FaInfoCircle />} title="About this Medicine">
          <p className="medicine-details-description">{medicine.description}</p>
        </InfoBlock>

        <InfoBlock icon={<FaPills />} title="Dosage &amp; Usage Instructions">
          <p className="medicine-details-description">{medicine.dosageInstructions}</p>
        </InfoBlock>

        <InfoBlock icon={<FaExclamationTriangle />} title="Side Effects">
          <ul className="medicine-details-side-effects-list">
            {(medicine.sideEffects || []).map((effect, i) => (
              <li key={i} className="medicine-details-side-effect-item"><span className="medicine-details-dot" />{effect}</li>
            ))}
          </ul>
          <p className="medicine-details-side-effects-note">Not all side effects may occur. If you notice any unexpected effects, consult your doctor or pharmacist.</p>
        </InfoBlock>

        <InfoBlock icon={<FaThermometerHalf />} title="Storage Instructions">
          <p className="medicine-details-description">{medicine.storageInstructions}</p>
        </InfoBlock>

        <InfoBlock icon={<FaCalendarAlt />} title="Expiry Date">
          <div className="medicine-details-expiry-detail">
            <FaCalendarAlt className="medicine-details-expiry-detail-icon" />
            <span>This batch expires in <strong>{medicine.expiryDate}</strong></span>
          </div>
        </InfoBlock>

        {medicine.genericAlternatives && medicine.genericAlternatives.length > 0 && (
          <InfoBlock icon={<FaFlask />} title="Generic Alternatives">
            <p className="medicine-details-generics-note">The following generics contain the same active ingredient and may be substituted as advised by your doctor:</p>
            <div className="medicine-details-generics-grid">
              {(medicine.genericAlternatives || []).map((alt, i) => (
                <div key={i} className="medicine-details-generic-card">
                  <div className="medicine-details-generic-info">
                    <span className="medicine-details-generic-name">{alt.name}</span>
                    <span className="medicine-details-generic-brand">{alt.brand}</span>
                  </div>
                  <span className="medicine-details-generic-price">₹{alt.price}</span>
                </div>
              ))}
            </div>
          </InfoBlock>
        )}

        <InfoBlock icon={<FaBoxOpen />} title="Product Information">
          <div className="medicine-details-product-grid">
            <div className="medicine-details-product-item"><span className="medicine-details-product-key">Brand</span><span className="medicine-details-product-val">{medicine.brand}</span></div>
            <div className="medicine-details-product-item"><span className="medicine-details-product-key">Manufacturer</span><span className="medicine-details-product-val">{medicine.manufacturer}</span></div>
            <div className="medicine-details-product-item"><span className="medicine-details-product-key">Category</span><span className="medicine-details-product-val">{medicine.category}</span></div>
            <div className="medicine-details-product-item"><span className="medicine-details-product-key">Prescription Type</span><span className="medicine-details-product-val">{medicine.isRx ? "Prescription Required (Rx)" : "Over The Counter (OTC)"}</span></div>
            <div className="medicine-details-product-item"><span className="medicine-details-product-key">Expiry Date</span><span className="medicine-details-product-val">{medicine.expiryDate}</span></div>
          </div>
        </InfoBlock>
      </div>

      {/* Sticky Bar */}
      <div className="medicine-details-sticky-bar">
        <div className="medicine-details-sticky-price">
          <span>₹{medicine.price}</span>
          {discount > 0 && <span className="medicine-details-sticky-off">{discount}% off</span>}
        </div>
        <div className="medicine-details-sticky-actions">
          <button className="medicine-details-sticky-cart" onClick={handleAddToCart} disabled={outOfStock} id="medicine-details-sticky-cart"><FaShoppingCart /> Cart</button>
          <button className="medicine-details-sticky-buy" onClick={handleBuyNow} disabled={outOfStock} id="medicine-details-sticky-buy"><FaBolt /> Buy Now</button>
        </div>
      </div>
    </div>
  );
}
