import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ENABLE_BACKEND_API } from "../../../services/apiConfig";
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
  FaExclamationTriangle,
  FaSpinner,
  FaShoppingCart,
  FaFileAlt,
  FaInfoCircle,
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
    delivery: "Est. delivery: 1–2 Days (Sufficient Stock) · Delivered 21 June",
  },
  {
    id: "MB20260002",
    date: "22 June 2026",
    items: "Amoxicillin 500mg × 1",
    amount: 185,
    status: "Shipped",
    pharmacy: "MediPlus Pharmacy",
    delivery: "Est. delivery: 1–2 Days (Sufficient Stock)",
  },
  {
    id: "MB20260003",
    date: "24 June 2026",
    items: "Digital Thermometer × 1",
    amount: 399,
    status: "Pending",
    pharmacy: "Care Medicals",
    delivery: "Est. delivery: 2–3 Days (Medium Stock)",
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

/* ─── Sub-component: Rx Requirement Modal ───────────────────────── */
function RxRequiredModal({ medicine, onClose, onUpload }) {
  const fileRef = useRef(null);
  if (!medicine) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(15,23,42,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-primary)",
          borderRadius: "14px",
          maxWidth: "480px",
          width: "100%",
          padding: "1.75rem",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>℞</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Prescription Required
            </h3>
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              This is a prescription-only medicine
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "0.85rem", marginBottom: "1.25rem" }}>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "#92400e", lineHeight: 1.5 }}>
            <FaInfoCircle style={{ marginRight: "0.4rem" }} />
            <strong>{medicine.name}</strong> requires a valid doctor's prescription. Please upload your prescription to add this medicine to your cart.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,.pdf"
          id="rx-req-upload"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) {
              const f = e.target.files[0];
              if (f.size > 5 * 1024 * 1024) {
                alert("File too large. Max 5 MB allowed.");
                return;
              }
              onUpload(f);
              onClose();
            }
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1rem" }}>
          <label
            htmlFor="rx-req-upload"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              padding: "0.75rem 1rem",
              background: "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
              color: "#fff", borderRadius: "8px",
              fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
              transition: "opacity 0.2s",
            }}
          >
            <FaFileUpload /> Upload Prescription (JPG, PNG, PDF · Max 5 MB)
          </label>
          <button
            style={{
              padding: "0.65rem", borderRadius: "8px",
              border: "1px solid var(--border-color)", background: "transparent",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-component: Extracted Medicine Card ─────────────────────── */
function ExtractedMedicineCard({ item, onAddToCart }) {
  const [qty, setQty] = useState(item.quantity || 1);
  const [added, setAdded] = useState(false);

  const isAvailable = item.matched && item.product?.stock !== "out-of-stock";

  const handleAdd = () => {
    if (!isAvailable) return;
    setAdded(true);
    onAddToCart(item, qty);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      style={{
        background: "var(--bg-primary)",
        border: `1px solid ${item.matched ? "var(--border-color)" : "#fecdd3"}`,
        borderRadius: "10px",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        boxShadow: "var(--shadow-sm)",
        borderLeft: `4px solid ${item.matched ? (item.product?.stock === "out-of-stock" ? "#94a3b8" : "var(--primary-color)") : "#f87171"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
            {item.name}
          </p>
          <p style={{ margin: "0.1rem 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            {item.dosage} · Qty: {item.quantity}
          </p>
          {item.instruction && (
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              {item.instruction}
            </p>
          )}
        </div>
        {item.matched && item.product ? (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-color)" }}>
              ₹{item.product.price}
            </span>
          </div>
        ) : null}
      </div>

      {item.matched ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{
            fontSize: "0.75rem", fontWeight: 600, padding: "0.2rem 0.55rem",
            borderRadius: "4px",
            background: item.product?.stock === "in-stock" ? "#f0fdf4" : item.product?.stock === "low-stock" ? "#fffbeb" : "#f8fafc",
            color: item.product?.stock === "in-stock" ? "#16a34a" : item.product?.stock === "low-stock" ? "#d97706" : "#94a3b8",
            border: `1px solid ${item.product?.stock === "in-stock" ? "#bbf7d0" : item.product?.stock === "low-stock" ? "#fde68a" : "#e2e8f0"}`,
          }}>
            {item.product?.stock === "in-stock" ? "✓ In Stock" : item.product?.stock === "low-stock" ? "⚠ Low Stock" : "Out of Stock"}
          </span>

          {isAvailable ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: "none", background: "var(--bg-secondary)", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>−</button>
                <span style={{ padding: "0.2rem 0.5rem", fontSize: "0.85rem", fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(99, q + 1))} style={{ border: "none", background: "var(--bg-secondary)", padding: "0.25rem 0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>+</button>
              </div>
              <button
                onClick={handleAdd}
                style={{
                  display: "flex", alignItems: "center", gap: "0.3rem",
                  padding: "0.4rem 0.85rem",
                  background: added ? "#16a34a" : "var(--primary-color)",
                  color: "#fff", border: "none", borderRadius: "6px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <FaShoppingCart style={{ fontSize: "0.7rem" }} />
                {added ? "Added!" : "Add to Cart"}
              </button>
            </div>
          ) : (
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600 }}>Unavailable</span>
          )}
        </div>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          background: "#fff1f2", border: "1px solid #fecdd3",
          borderRadius: "6px", padding: "0.45rem 0.65rem",
          fontSize: "0.8rem", color: "#e11d48",
        }}>
          <FaExclamationTriangle style={{ fontSize: "0.75rem" }} />
          Not available in our pharmacy
        </div>
      )}
    </div>
  );
}

/* ─── Sub-component: Prescription Upload Panel ──────────────────── */
function PrescriptionUpload({ onPrescriptionVerified }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | processing | done | error
  const [extractedData, setExtractedData] = useState(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleFile = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(selected.type)) {
      showToast("Invalid file type. Please upload JPG, PNG, or PDF.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      showToast("File too large. Maximum size is 5 MB.");
      return;
    }

    setFile(selected);
    setStatus("uploading");

    // Simulate file upload delay then call backend prescription processing
    setTimeout(async () => {
      setStatus("processing");
      const processMock = () => {
        setExtractedData({
          prescriptionId: "RX-2026-DEMO",
          fileName: selected.name,
          prescriptionDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          doctorName: "Dr. Suresh Nair",
          clinicName: "MedicoBridge Digital Clinic",
          medicines: [
            { name: "Amoxicillin 500mg", dosage: "500mg", quantity: 10, instruction: "Take 1 capsule twice daily after food", requiresPrescription: true, matched: true, product: { price: 145, stock: "in-stock" } },
            { name: "Paracetamol 650mg", dosage: "650mg", quantity: 10, instruction: "Take 1 tablet as needed for fever", requiresPrescription: false, matched: true, product: { price: 28, stock: "in-stock" } },
            { name: "Azithromycin 500mg", dosage: "500mg", quantity: 5, instruction: "Take 1 tablet daily for 5 days", requiresPrescription: true, matched: true, product: { price: 210, stock: "in-stock" } },
            { name: "Ciprofloxacin 500mg", dosage: "500mg", quantity: 10, instruction: "Take 1 tablet every 12 hours", requiresPrescription: true, matched: false, product: null },
          ],
        });
        setStatus("done");
        showToast("Prescription uploaded successfully! Medicines extracted below.");
        if (onPrescriptionVerified) onPrescriptionVerified(true);
      };

      if (!ENABLE_BACKEND_API) {
        processMock();
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/pharmacy/process-prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selected.name,
            fileType: selected.type,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setExtractedData(data);
          setStatus("done");
          showToast("Prescription uploaded successfully! Medicines extracted below.");
          if (onPrescriptionVerified) onPrescriptionVerified(true);
        } else {
          setStatus("error");
        }
      } catch (err) {
        // Fallback with mock data if backend unavailable
        processMock();
      }
    }, 1800);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setExtractedData(null);
    if (fileRef.current) fileRef.current.value = "";
    if (onPrescriptionVerified) onPrescriptionVerified(false);
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.25rem", right: "1.25rem",
          background: "#10b981", color: "#fff",
          padding: "0.75rem 1.25rem", borderRadius: "8px",
          fontSize: "0.85rem", fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 9999, animation: "ocFadeIn 0.3s ease",
        }}>
          ✓ {toast}
        </div>
      )}

      <section className="upload-prescription">
        <FaFileUpload className="upload-icon" />
        <h3>Upload Prescription</h3>
        <p>Upload your doctor's prescription — we'll extract all medicines and match them with our pharmacy catalog.</p>

        {status === "idle" && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,.pdf"
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

        {status === "uploading" && (
          <div className="rx-status rx-status--verifying">
            <FaSpinner className="rx-status-icon spin-icon" />
            <div>
              <strong>Uploading…</strong>
              <p>{file?.name}</p>
            </div>
          </div>
        )}

        {status === "processing" && (
          <div className="rx-status rx-status--verifying">
            <FaClock className="rx-status-icon spin-icon" />
            <div>
              <strong>Extracting Medicines from Prescription…</strong>
              <p>Analysing {file?.name} and matching with pharmacy catalog</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="rx-status rx-status--rejected">
            <FaTimesCircle className="rx-status-icon" />
            <div>
              <strong>Processing Failed</strong>
              <p>Could not process prescription. Please try uploading again.</p>
            </div>
            <button className="rx-reset-btn" onClick={reset} title="Try again">
              <FaTimes />
            </button>
          </div>
        )}

        {status === "done" && extractedData && (
          <>
            <div className="rx-status rx-status--verified" style={{ marginBottom: "1.25rem" }}>
              <FaCheckCircle className="rx-status-icon" />
              <div>
                <strong>Prescription Uploaded Successfully ✓</strong>
                <p>{file?.name} — Extracted {extractedData.medicines?.length} medicine(s)</p>
              </div>
              <button className="rx-reset-btn" onClick={reset} title="Remove">
                <FaTimes />
              </button>
            </div>

            {/* Extracted Medicines Section */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1.25rem",
              marginTop: "0.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <FaFileAlt style={{ color: "var(--primary-color)", fontSize: "1.1rem" }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    Medicines from Your Prescription
                  </h4>
                  <p style={{ margin: "0.1rem 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    Prescribed by {extractedData.doctorName} · {extractedData.prescriptionDate}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.85rem" }}>
                {extractedData.medicines?.map((item, i) => (
                  <ExtractedMedicineCard
                    key={i}
                    item={item}
                    onAddToCart={(item, qty) => {
                      console.log("Add to cart:", item.name, "× " + qty);
                    }}
                  />
                ))}
              </div>

              {extractedData.medicines?.some(m => !m.matched) && (
                <div style={{
                  marginTop: "0.85rem", padding: "0.65rem 0.85rem",
                  background: "#fff7ed", borderRadius: "8px",
                  border: "1px solid #fed7aa",
                  fontSize: "0.8rem", color: "#92400e",
                  display: "flex", alignItems: "flex-start", gap: "0.4rem",
                }}>
                  <FaInfoCircle style={{ marginTop: "0.1rem", flexShrink: 0 }} />
                  Some medicines from your prescription are not currently available in our catalog.
                  Please contact your nearby pharmacy or consult your doctor for alternatives.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ marginBottom: 0 }}>
            {tab === "active" ? <><FaBoxOpen /> My Orders</> : <><FaHistory /> Order History</>}
          </h3>
          <button
            className="orders-page-link-btn"
            onClick={() => navigate("/patient/orders")}
            id="pharmacy-panel-view-all-orders-btn"
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              fontSize: "0.82rem",
              fontWeight: "600",
              color: "var(--primary-color)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            View All Orders <FaArrowRight style={{ fontSize: "0.75rem" }} />
          </button>
        </div>
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
  const [expandedPharmacy, setExpandedPharmacy] = useState(null);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [rxRequiredMedicine, setRxRequiredMedicine] = useState(null); // medicine that triggered the modal

  const handlePrescriptionRequired = (medicine) => {
    setRxRequiredMedicine(medicine);
  };

  const handleRxUpload = (file) => {
    setHasPrescription(true);
    setRxRequiredMedicine(null);
  };

  return (
    <div className="patient-pharmacy">

      {/* ── Rx Required Modal (triggered from medicine card) ──────── */}
      {rxRequiredMedicine && (
        <RxRequiredModal
          medicine={rxRequiredMedicine}
          onClose={() => setRxRequiredMedicine(null)}
          onUpload={handleRxUpload}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="pharmacy-header">
        <div className="pharmacy-header-top">
          <div>
            <h2>💊 Pharmacy</h2>
            <p>Search medicines, browse nearby pharmacies and upload your prescription.</p>
          </div>
          <button
            className="primary-btn pharmacy-my-orders-btn"
            onClick={() => navigate("/patient/orders")}
            id="pharmacy-my-orders-header-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              padding: "0.75rem 1.25rem",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <FaBoxOpen /> My Orders
          </button>
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
      <FeaturedMedicines
        hasPrescription={hasPrescription}
        onPrescriptionRequired={handlePrescriptionRequired}
      />

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

      {/* ── Upload Prescription with OCR Extraction ───────────────── */}
      <PrescriptionUpload
        onPrescriptionVerified={(val) => setHasPrescription(val)}
      />

    </div>
  );
}

export default PatientPharmacy;