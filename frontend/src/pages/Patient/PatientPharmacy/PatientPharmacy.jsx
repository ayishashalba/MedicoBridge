import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaStar,
  FaPills,
  FaCapsules,
  FaSyringe,
  FaHeartbeat,
  FaFileUpload,
  FaArrowRight,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaPhone,
  FaExternalLinkAlt,
  FaBoxOpen,
  FaHistory,
  FaEye,
  FaTimesCircle,
  FaLeaf,
  FaChevronUp,
  FaTimes,
} from "react-icons/fa";
import "./PatientPharmacy.css";
import FeaturedMedicines from "./FeaturedMedicines";

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
  const [expandedPharmacy, setExpandedPharmacy] = useState(null);

  return (
    <div className="patient-pharmacy">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pharmacy-header">
        <div className="pharmacy-header-top">
          <div>
            <h2>💊 Pharmacy</h2>
            <p>Search medicines, browse nearby pharmacies and upload your prescription.</p>
          </div>
        </div>
      </div>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="pharmacy-section">
        <h3>Categories</h3>
        <div className="category-grid">
          {categories.map((cat) => (
            <div
              className="category-card"
              key={cat.id}
              role="button"
              tabIndex={0}
              aria-label={`Browse ${cat.name}`}
            >
              <div className="category-icon">{cat.icon}</div>
              <p>{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Medicines ─────────────────────────────────────── */}
      <FeaturedMedicines />

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

      {/* ── My Orders + Order History ─────────────────────────────── */}
      <MyOrdersPanel />

      {/* ── Upload Prescription ───────────────────────────────────── */}
      <PrescriptionUpload />

    </div>
  );
}

export default PatientPharmacy;