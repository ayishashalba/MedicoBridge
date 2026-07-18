import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaPills,
  FaCapsules,
  FaSyringe,
  FaHeartbeat,
  FaFileUpload,
  FaArrowRight,
  FaShoppingCart,
  FaFilter,
  FaSort,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaPhone,
  FaExternalLinkAlt,
  FaBoxOpen,
  FaHistory,
  FaEye,
  FaExchangeAlt,
  FaTimesCircle,
  FaLeaf,
  FaFlask,
  FaBan,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaClipboardCheck,
  FaInfoCircle,
  FaTag,
} from "react-icons/fa";
import "./PatientPharmacy.css";

/* ─── Static Data ───────────────────────────────────────────────── */
const categories = [
  { id: 1, name: "Tablets", icon: <FaPills />, type: "prescription" },
  { id: 2, name: "Capsules", icon: <FaCapsules />, type: "prescription" },
  { id: 3, name: "Syrups", icon: <FaHeartbeat />, type: "otc" },
  { id: 4, name: "Injections", icon: <FaSyringe />, type: "prescription" },
  { id: 5, name: "Personal Care", icon: <FaHeartbeat />, type: "healthcare" },
  { id: 6, name: "Supplements", icon: <FaLeaf />, type: "healthcare" },
];

const pharmaciesData = [
  {
    id: 1,
    name: "Apollo Pharmacy",
    rating: 4.8,
    distance: "500 m",
    status: "Open Now",
    phone: "+91 98765 43210",
    address: "12A, MG Road, Bengaluru, Karnataka 560001",
    mapsUrl: "https://maps.google.com/?q=Apollo+Pharmacy+MG+Road+Bengaluru",
    delivery: "Free delivery above ₹299 · Est. 45–60 mins",
    deliveryCharge: 0,
    minForFree: 299,
  },
  {
    id: 2,
    name: "MediPlus Pharmacy",
    rating: 4.7,
    distance: "1.2 km",
    status: "Open Now",
    phone: "+91 91234 56789",
    address: "Plot 7, Koramangala, Bengaluru, Karnataka 560034",
    mapsUrl: "https://maps.google.com/?q=MediPlus+Pharmacy+Koramangala",
    delivery: "₹25 delivery charge · Est. 60–90 mins",
    deliveryCharge: 25,
    minForFree: null,
  },
  {
    id: 3,
    name: "Care Medicals",
    rating: 4.6,
    distance: "2 km",
    status: "Open Now",
    phone: "+91 80012 34567",
    address: "22, Indiranagar Main Road, Bengaluru, Karnataka 560038",
    mapsUrl: "https://maps.google.com/?q=Care+Medicals+Indiranagar",
    delivery: "Free delivery above ₹499 · Est. 60–90 mins",
    deliveryCharge: 0,
    minForFree: 499,
  },
];

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol 650mg",
    brand: "Cipla",
    manufacturer: "Cipla Ltd.",
    dosage: "1 tablet every 4–6 hrs (max 4/day)",
    price: 35,
    mrp: 42,
    stock: 120,
    stockLabel: "In Stock",
    expiry: "Aug 2027",
    category: "Tablets",
    type: "otc",
    popularity: 98,
    description: "Used for fever, headache and mild to moderate pain relief.",
    substitutes: [
      { name: "Dolo 650mg", brand: "Micro Labs", price: 30 },
      { name: "Crocin 650mg", brand: "GSK", price: 38 },
    ],
    requiresPrescription: false,
    emoji: "💊",
  },
  {
    id: 2,
    name: "Vitamin C 500mg",
    brand: "Himalaya",
    manufacturer: "Himalaya Drug Company",
    dosage: "1 tablet daily after meals",
    price: 220,
    mrp: 260,
    stock: 54,
    stockLabel: "In Stock",
    expiry: "Mar 2028",
    category: "Tablets",
    type: "otc",
    popularity: 85,
    description: "Boosts immunity and acts as an antioxidant.",
    substitutes: [
      { name: "Limcee 500mg", brand: "Abbott", price: 195 },
      { name: "Celin 500mg", brand: "GSK", price: 210 },
    ],
    requiresPrescription: false,
    emoji: "🍋",
  },
  {
    id: 3,
    name: "Digital Thermometer",
    brand: "Dr. Morepen",
    manufacturer: "Morepen Laboratories",
    dosage: "Oral / Rectal / Axillary use",
    price: 399,
    mrp: 499,
    stock: 22,
    stockLabel: "In Stock",
    expiry: "Dec 2030",
    category: "Personal Care",
    type: "healthcare",
    popularity: 72,
    description: "Fast, accurate digital thermometer with fever alert.",
    substitutes: [],
    requiresPrescription: false,
    emoji: "🌡️",
  },
  {
    id: 4,
    name: "Amoxicillin 500mg",
    brand: "GSK",
    manufacturer: "GlaxoSmithKline Pharma",
    dosage: "1 capsule 3 times daily for 7 days",
    price: 185,
    mrp: 210,
    stock: 30,
    stockLabel: "In Stock",
    expiry: "Oct 2026",
    category: "Capsules",
    type: "prescription",
    popularity: 77,
    description: "Broad-spectrum antibiotic for bacterial infections.",
    substitutes: [
      { name: "Mox 500mg", brand: "Ranbaxy", price: 170 },
      { name: "Novamox 500mg", brand: "Cipla", price: 175 },
    ],
    requiresPrescription: true,
    emoji: "💊",
  },
  {
    id: 5,
    name: "Benadryl Cough Syrup",
    brand: "Johnson & Johnson",
    manufacturer: "Johnson & Johnson Ltd.",
    dosage: "10ml 3 times daily",
    price: 130,
    mrp: 155,
    stock: 8,
    stockLabel: "Low Stock",
    expiry: "Jun 2027",
    category: "Syrups",
    type: "otc",
    popularity: 80,
    description: "Provides relief from cough and cold symptoms.",
    substitutes: [
      { name: "Honitus Syrup", brand: "Himalaya", price: 110 },
    ],
    requiresPrescription: false,
    emoji: "🍶",
  },
  {
    id: 6,
    name: "Metformin 500mg",
    brand: "Sun Pharma",
    manufacturer: "Sun Pharmaceutical Industries",
    dosage: "1 tablet twice daily with meals",
    price: 65,
    mrp: 80,
    stock: 0,
    stockLabel: "Out of Stock",
    expiry: "Jan 2027",
    category: "Tablets",
    type: "prescription",
    popularity: 90,
    description: "Used for management of type 2 diabetes.",
    substitutes: [
      { name: "Glycomet 500mg", brand: "USV", price: 55 },
      { name: "Glucophage 500mg", brand: "Merck", price: 72 },
    ],
    requiresPrescription: true,
    emoji: "💊",
  },
];

const ordersData = [
  {
    id: "MB20260001",
    date: "20 June 2026",
    items: "Paracetamol 650mg × 2, Vitamin C 500mg × 1",
    amount: 290,
    status: "Delivered",
    pharmacy: "Apollo Pharmacy",
    delivery: "Delivered on 21 June 2026",
  },
  {
    id: "MB20260002",
    date: "22 June 2026",
    items: "Amoxicillin 500mg × 1",
    amount: 185,
    status: "Shipped",
    pharmacy: "MediPlus Pharmacy",
    delivery: "Est. delivery: 23 June 2026",
  },
  {
    id: "MB20260003",
    date: "24 June 2026",
    items: "Digital Thermometer × 1",
    amount: 399,
    status: "Pending",
    pharmacy: "Care Medicals",
    delivery: "Awaiting pickup from pharmacy",
  },
];

/* ─── Helper: Stock color class ─────────────────────────────────── */
function stockClass(label) {
  if (label === "Out of Stock") return "stock-badge--out";
  if (label === "Low Stock") return "stock-badge--low";
  return "stock-badge--in";
}

/* ─── Sub-component: Pharmacy Contact Card ──────────────────────── */
function PharmacyContactCard({ pharmacy }) {
  return (
    <div className="pharm-contact-card">
      <div className="pharm-contact-row">
        <FaPhone className="pharm-contact-icon" />
        <a href={`tel:${pharmacy.phone}`} className="pharm-contact-link">
          {pharmacy.phone}
        </a>
      </div>
      <div className="pharm-contact-row">
        <FaMapMarkerAlt className="pharm-contact-icon" />
        <span className="pharm-contact-addr">{pharmacy.address}</span>
      </div>
      <div className="pharm-contact-row">
        <FaTruck className="pharm-contact-icon" />
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{pharmacy.delivery}</span>
      </div>
      <a
        href={pharmacy.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pharm-maps-btn"
      >
        <FaExternalLinkAlt /> View on Google Maps
      </a>
    </div>
  );
}

/* ─── Sub-component: Medicine Card ─────────────────────────────── */
function MedicineCard({ medicine, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [showSubs, setShowSubs] = useState(false);
  const [added, setAdded] = useState(false);
  const outOfStock = medicine.stock === 0;

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToCart(medicine, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100);

  return (
    <div className={`medicine-card enhanced ${outOfStock ? "medicine-card--oos" : ""}`}>
      {/* Type badge */}
      <span className={`med-type-badge med-type-badge--${medicine.type}`}>
        {medicine.type === "prescription" ? "Rx" : medicine.type === "otc" ? "OTC" : "Health"}
      </span>

      <div className="medicine-image">{medicine.emoji}</div>

      <h4>{medicine.name}</h4>

      {/* Price row */}
      <div className="med-price-row">
        <span className="med-price">₹{medicine.price}</span>
        <span className="med-mrp">₹{medicine.mrp}</span>
        {discount > 0 && <span className="med-discount">{discount}% off</span>}
      </div>

      <span className={`stock-badge ${stockClass(medicine.stockLabel)}`}>
        {medicine.stockLabel}
      </span>

      {/* Compact details */}
      <div className="med-details-grid">
        <span className="med-detail-lbl">Manufacturer</span>
        <span className="med-detail-val">{medicine.manufacturer}</span>
        <span className="med-detail-lbl">Dosage</span>
        <span className="med-detail-val">{medicine.dosage}</span>
        <span className="med-detail-lbl">Expiry</span>
        <span className="med-detail-val">{medicine.expiry}</span>
        <span className="med-detail-lbl">Stock</span>
        <span className="med-detail-val">{outOfStock ? "—" : `${medicine.stock} units`}</span>
      </div>

      {/* Delivery estimate */}
      <div className="med-delivery-info">
        <FaTruck className="med-delivery-icon" />
        <span>Delivery in 45–90 mins · <strong>Free above ₹299</strong></span>
      </div>

      {/* Prescription required notice */}
      {medicine.requiresPrescription && (
        <div className="med-rx-notice">
          <FaClipboardCheck /> Prescription required at checkout
        </div>
      )}

      {/* Quantity + Add to cart */}
      {!outOfStock && (
        <div className="med-cart-row">
          <div className="qty-selector">
            <button
              className="qty-btn"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >−</button>
            <span className="qty-val">{qty}</span>
            <button
              className="qty-btn"
              onClick={() => setQty((q) => Math.min(medicine.stock, q + 1))}
              aria-label="Increase quantity"
            >+</button>
          </div>
          <button
            className={`add-cart-btn ${added ? "add-cart-btn--added" : ""}`}
            onClick={handleAdd}
          >
            {added ? <><FaCheckCircle /> Added!</> : <><FaShoppingCart /> Add to Cart</>}
          </button>
        </div>
      )}

      {/* Substitutes toggle */}
      {medicine.substitutes.length > 0 && (
        <div className="med-subs-section">
          <button
            className="med-subs-toggle"
            onClick={() => setShowSubs(!showSubs)}
          >
            <FaExchangeAlt />
            Generic Alternatives ({medicine.substitutes.length})
            {showSubs ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showSubs && (
            <div className="med-subs-list">
              {medicine.substitutes.map((sub, i) => (
                <div key={i} className="med-sub-item">
                  <span className="med-sub-name">{sub.name}</span>
                  <span className="med-sub-brand">{sub.brand}</span>
                  <span className="med-sub-price">₹{sub.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        className="medicine-btn"
        style={{ marginTop: "0.75rem" }}
        onClick={() => {}}
      >
        View Details <FaArrowRight />
      </button>
    </div>
  );
}

/* ─── Sub-component: Prescription Upload Panel ──────────────────── */
function PrescriptionUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | verifying | verified | rejected
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setStatus("verifying");
    // Simulate async verification
    setTimeout(() => {
      setStatus(Math.random() > 0.25 ? "verified" : "rejected");
    }, 2200);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="upload-prescription">
      <FaFileUpload className="upload-icon" />
      <h3>Upload Prescription</h3>
      <p>Upload your doctor's prescription to order prescription medicines easily.</p>

      {status === "idle" && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            id="rx-upload"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <label htmlFor="rx-upload" className="primary-btn" style={{ cursor: "pointer" }}>
            <FaFileUpload /> Choose Prescription File
          </label>
          <p className="rx-hint">Accepted formats: JPG, PNG, PDF · Max 5 MB</p>
        </>
      )}

      {status === "verifying" && (
        <div className="rx-status rx-status--verifying">
          <FaClock className="rx-status-icon spin-icon" />
          <div>
            <strong>Verifying Prescription…</strong>
            <p>{file?.name}</p>
          </div>
        </div>
      )}

      {status === "verified" && (
        <div className="rx-status rx-status--verified">
          <FaCheckCircle className="rx-status-icon" />
          <div>
            <strong>Prescription Verified ✓</strong>
            <p>{file?.name} — Valid prescription. You may proceed to order.</p>
          </div>
          <button className="rx-reset-btn" onClick={reset} title="Remove">
            <FaTimes />
          </button>
        </div>
      )}

      {status === "rejected" && (
        <div className="rx-status rx-status--rejected">
          <FaTimesCircle className="rx-status-icon" />
          <div>
            <strong>Verification Failed</strong>
            <p>The file could not be verified. Please upload a clear, valid doctor's prescription.</p>
          </div>
          <button className="rx-reset-btn" onClick={reset} title="Try again">
            <FaTimes />
          </button>
        </div>
      )}
    </section>
  );
}

/* ─── Sub-component: My Orders Panel ────────────────────────────── */
function MyOrdersPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active"); // active | history

  const activeOrders = ordersData.filter((o) => o.status !== "Delivered");
  const historyOrders = ordersData.filter((o) => o.status === "Delivered");
  const shown = tab === "active" ? activeOrders : historyOrders;

  const statusIcon = (s) => {
    if (s === "Delivered") return <FaCheckCircle />;
    if (s === "Shipped") return <FaTruck />;
    return <FaClock />;
  };

  return (
    <section className="pharmacy-section orders-panel">
      <div className="orders-panel-header">
        <h3 style={{ marginBottom: 0 }}>
          {tab === "active" ? <><FaBoxOpen /> My Orders</> : <><FaHistory /> Order History</>}
        </h3>
        <div className="orders-tab-group">
          <button
            className={`orders-tab ${tab === "active" ? "orders-tab--active" : ""}`}
            onClick={() => setTab("active")}
          >
            <FaBoxOpen /> Active
          </button>
          <button
            className={`orders-tab ${tab === "history" ? "orders-tab--active" : ""}`}
            onClick={() => setTab("history")}
          >
            <FaHistory /> History
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="orders-empty">
          <FaBoxOpen className="orders-empty-icon" />
          <p>No {tab === "active" ? "active" : "past"} orders found.</p>
        </div>
      ) : (
        <div className="orders-list">
          {shown.map((order) => (
            <div className="order-row" key={order.id}>
              <div className="order-row-left">
                <span className="order-id">#{order.id}</span>
                <span className="order-date">{order.date} · {order.pharmacy}</span>
                <span className="order-items">{order.items}</span>
                <span className="order-delivery-info">
                  <FaTruck style={{ fontSize: "0.75rem", marginRight: "4px" }} />
                  {order.delivery}
                </span>
              </div>
              <div className="order-row-right">
                <span className="order-amount">₹{order.amount}</span>
                <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                  {statusIcon(order.status)} {order.status}
                </span>
                <button
                  className="order-view-btn"
                  onClick={() => navigate(`/patient/order-details/${order.id}`)}
                >
                  <FaEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
function PatientPharmacy() {
  const navigate = useNavigate();

  /* State */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | prescription | otc | healthcare
  const [sortBy, setSortBy] = useState("popularity"); // popularity | price_asc | price_desc | availability
  const [cartCount, setCartCount] = useState(0);
  const [cartToast, setCartToast] = useState("");
  const [expandedPharmacy, setExpandedPharmacy] = useState(null);

  /* Filtering + Sorting */
  const filteredMedicines = medicinesData
    .filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || m.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "availability") return b.stock - a.stock;
      return b.popularity - a.popularity; // default
    });

  const handleAddToCart = (medicine, qty) => {
    setCartCount((c) => c + qty);
    setCartToast(`${medicine.name} × ${qty} added to cart!`);
    setTimeout(() => setCartToast(""), 3000);
  };

  return (
    <div className="patient-pharmacy">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pharmacy-header">
        <div className="pharmacy-header-top">
          <div>
            <h2>💊 Pharmacy</h2>
            <p>Search medicines, browse nearby pharmacies and upload your prescription.</p>
          </div>
          <button
            className="cart-header-btn"
            onClick={() => navigate("/patient/cart")}
            aria-label="View shopping cart"
          >
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            My Cart
          </button>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────── */}
      {cartToast && (
        <div className="pharm-toast">
          <FaShoppingCart /> {cartToast}
        </div>
      )}

      {/* ── Search + Filter + Sort Bar ───────────────────────────── */}
      <div className="pharm-controls">
        <div className="medicine-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search medicines, brands, categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search medicines"
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="pharm-filter-sort">
          {/* Medicine Type Filter */}
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              className="pharm-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by medicine type"
            >
              <option value="all">All Types</option>
              <option value="prescription">Prescription (Rx)</option>
              <option value="otc">OTC Medicines</option>
              <option value="healthcare">Health Care</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="filter-group">
            <FaSort className="filter-icon" />
            <select
              className="pharm-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort medicines"
            >
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="availability">Best Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Type Filter Chips ────────────────────────────────────── */}
      <div className="pharm-type-chips">
        {[
          { val: "all", label: "All", icon: <FaPills /> },
          { val: "prescription", label: "Prescription", icon: <FaFlask /> },
          { val: "otc", label: "OTC", icon: <FaTag /> },
          { val: "healthcare", label: "Health Care", icon: <FaLeaf /> },
        ].map((chip) => (
          <button
            key={chip.val}
            className={`type-chip ${filterType === chip.val ? "type-chip--active" : ""}`}
            onClick={() => setFilterType(chip.val)}
          >
            {chip.icon} {chip.label}
          </button>
        ))}
      </div>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="pharmacy-section">
        <h3>Categories</h3>
        <div className="category-grid">
          {categories.map((cat) => (
            <div
              className="category-card"
              key={cat.id}
              onClick={() => setFilterType(cat.type)}
              role="button"
              tabIndex={0}
              aria-label={`Browse ${cat.name}`}
              onKeyDown={(e) => e.key === "Enter" && setFilterType(cat.type)}
            >
              <div className="category-icon">{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nearby Pharmacies (with contact + maps) ──────────────── */}
      <section className="pharmacy-section">
        <h3>Nearby Pharmacies</h3>
        <div className="pharmacy-grid">
          {pharmaciesData.map((item) => (
            <div className="pharmacy-card" key={item.id}>
              <h4>{item.name}</h4>
              <p>
                <FaStar /> {item.rating}
              </p>
              <p>
                <FaMapMarkerAlt /> {item.distance}
              </p>
              <span className="open-badge">{item.status}</span>

              {/* Delivery info badge */}
              <div className="pharm-delivery-badge">
                <FaTruck />
                {item.deliveryCharge === 0
                  ? `Free delivery above ₹${item.minForFree}`
                  : `₹${item.deliveryCharge} delivery charge`}
              </div>

              <button className="primary-btn">
                View Medicines <FaArrowRight />
              </button>

              {/* Toggle contact info */}
              <button
                className="pharm-contact-toggle"
                onClick={() =>
                  setExpandedPharmacy(expandedPharmacy === item.id ? null : item.id)
                }
              >
                {expandedPharmacy === item.id ? (
                  <><FaChevronUp /> Hide Contact Info</>
                ) : (
                  <><FaPhone /> Show Contact Info</>
                )}
              </button>

              {expandedPharmacy === item.id && <PharmacyContactCard pharmacy={item} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Medicines ────────────────────────────────────── */}
      <section className="pharmacy-section">
        <div className="medicines-section-header">
          <h3>Featured Medicines</h3>
          <span className="medicines-count">
            {filteredMedicines.length} result{filteredMedicines.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="pharm-empty-state">
            <FaBan className="pharm-empty-icon" />
            <h4>No medicines found</h4>
            <p>Try adjusting your search or filter criteria.</p>
            <button
              className="primary-btn"
              style={{ display: "inline-flex", gap: "8px", marginTop: "12px" }}
              onClick={() => { setSearch(""); setFilterType("all"); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="medicine-grid">
            {filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── My Orders + Order History ─────────────────────────────── */}
      <MyOrdersPanel />

      {/* ── Upload Prescription ───────────────────────────────────── */}
      <PrescriptionUpload />

    </div>
  );
}

export default PatientPharmacy;