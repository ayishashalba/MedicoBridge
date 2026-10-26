import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  FaFileInvoiceDollar, FaSearch, FaFilter, FaPlus, FaTimes,
  FaCheckCircle, FaCheck, FaEye, FaPrint, FaHospital,
  FaMoneyBillWave, FaReceipt, FaCalendarAlt, FaExclamationCircle,
  FaBan, FaUndo, FaEdit, FaDownload, FaPaperPlane, FaShieldAlt,
  FaChartBar, FaCreditCard, FaMobileAlt, FaUniversity, FaMoneyBill,
  FaUserMd, FaBed, FaFlask, FaXRay, FaPills, FaSyringe, FaHeartbeat,
  FaUserNurse, FaStethoscope, FaLaptopMedical, FaPercent, FaListAlt,
  FaArrowRight, FaChevronDown, FaChevronUp, FaInfoCircle, FaHourglassHalf,
  FaTachometerAlt, FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./BillingManagement.css";

// ── API CONFIG & HEADERS ─────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { value: "OP Consultation", label: "OP Consultation", icon: <FaStethoscope /> },
  { value: "Online Consultation", label: "Online Consultation", icon: <FaLaptopMedical /> },
  { value: "Hospital Admission", label: "Hospital Admission", icon: <FaHospital /> },
  { value: "Room & Bed Charges", label: "Room & Bed Charges", icon: <FaBed /> },
  { value: "ICU Charges", label: "ICU Charges", icon: <FaHeartbeat /> },
  { value: "Doctor Visit Charges", label: "Doctor Visit Charges", icon: <FaUserMd /> },
  { value: "Nursing Charges", label: "Nursing Charges", icon: <FaUserNurse /> },
  { value: "Procedures & Surgeries", label: "Procedures & Surgeries", icon: <FaSyringe /> },
  { value: "Laboratory Tests", label: "Laboratory Tests", icon: <FaFlask /> },
  { value: "X-Ray / Imaging", label: "X-Ray / CT / MRI Imaging", icon: <FaXRay /> },
  { value: "Pharmacy / Medicines", label: "Pharmacy / Medicines", icon: <FaPills /> },
  { value: "Other Services", label: "Other Hospital Services", icon: <FaListAlt /> },
];

const PAYMENT_METHODS = ["Cash", "UPI", "Credit/Debit Card", "Net Banking", "Insurance / TPA", "Cheque"];
const STATUS_TABS = ["All", "Pending", "Partially Paid", "Paid", "Overdue", "Cancelled", "Refunded"];

const INSURANCE_PROVIDERS = [
  "Star Health Insurance", "HDFC ERGO Health", "New India Assurance",
  "United India Insurance", "National Insurance", "Oriental Insurance",
  "Bajaj Allianz Health", "Niva Bupa Health", "Aditya Birla Health",
  "Reliance Health Insurance", "ICICI Lombard Health", "SBI Health Insurance",
];

// ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
const calcInvoiceSubtotal = (inv) =>
  (inv.items || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

const calcInvoiceTotal = (inv) => {
  if (inv.totalAmount !== undefined && inv.totalAmount !== null) {
    return Number(inv.totalAmount);
  }
  const subtotal = calcInvoiceSubtotal(inv);
  return Math.max(0, subtotal - (inv.globalDiscount || inv.discount || 0) + (inv.globalTax || inv.tax || 0));
};

const calcBalance = (inv) =>
  Math.max(0, calcInvoiceTotal(inv) - (inv.paidAmount || 0));

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const today = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isOverdue = (inv) => {
  if (inv.status === "Paid" || inv.status === "Cancelled" || inv.status === "Refunded") return false;
  return new Date(inv.dueDate) < new Date() && inv.status !== "Overdue";
};

const SERVICE_BADGE_COLORS = {
  "OP Consultation": { bg: "#e0f2fe", color: "#0369a1" },
  "Online Consultation": { bg: "#ede9fe", color: "#7c3aed" },
  "Hospital Admission": { bg: "#fdf2f8", color: "#be185d" },
  "Room & Bed Charges": { bg: "#fef3c7", color: "#92400e" },
  "ICU Charges": { bg: "#fee2e2", color: "#b91c1c" },
  "Doctor Visit Charges": { bg: "#dbeafe", color: "#1e40af" },
  "Nursing Charges": { bg: "#ccfbf1", color: "#0f766e" },
  "Procedures & Surgeries": { bg: "#fce7f3", color: "#9d174d" },
  "Laboratory Tests": { bg: "#d1fae5", color: "#065f46" },
  "X-Ray / Imaging": { bg: "#f1f5f9", color: "#334155" },
  "Pharmacy / Medicines": { bg: "#f3e8ff", color: "#7e22ce" },
  "Other Services": { bg: "#f8fafc", color: "#475569" },
};

const STATUS_COLORS = {
  Paid: { bg: "#dcfce7", color: "#15803d" },
  Pending: { bg: "#fef3c7", color: "#b45309" },
  "Partially Paid": { bg: "#dbeafe", color: "#1d4ed8" },
  Overdue: { bg: "#fee2e2", color: "#b91c1c" },
  Cancelled: { bg: "#f1f5f9", color: "#64748b" },
  Refunded: { bg: "#faf5ff", color: "#7c3aed" },
};

const CLAIM_STATUS_COLORS = {
  Submitted: { bg: "#fef3c7", color: "#b45309" },
  Approved: { bg: "#dcfce7", color: "#15803d" },
  "Partially Approved": { bg: "#dbeafe", color: "#1d4ed8" },
  Pending: { bg: "#fef3c7", color: "#b45309" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c" },
  Settled: { bg: "#d1fae5", color: "#065f46" },
};

// ── EMPTY FORM STATES ────────────────────────────────────────────────────────
const emptyInvoiceForm = () => ({
  patientName: "",
  patientId: "",
  patientAge: "",
  patientGender: "Male",
  patientPhone: "",
  patientEmail: "",
  patientAddress: "",
  encounterId: "",
  encounterType: "OP Visit",
  department: "",
  attendingDoctor: "",
  billingOfficer: "Priya Rajan",
  invoiceDate: today(),
  dueDate: "",
  paymentMethod: "Cash",
  insuranceProvider: "",
  policyNumber: "",
  items: [
    { id: Date.now(), description: "", category: "OP Consultation", quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 },
  ],
  globalDiscount: 0,
  globalTax: 0,
  paidAmount: 0,
  notes: "",
});

const emptyPaymentForm = (inv) => ({
  invoiceId: inv?.id || inv?.invoiceId || "",
  amount: inv ? calcBalance(inv) : 0,
  method: "Cash",
  date: today(),
  ref: "",
  note: "",
});

// ════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function BillingManagement() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [invoices, setInvoices] = useState([]);
  const [insuranceClaims, setInsuranceClaims] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null); // invoice to record payment for
  const [refundTarget, setRefundTarget] = useState(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm());
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm(null));

  // Toast notification callback
  const showToast = useCallback((msg, type = "success") => {
    if (type === "error") {
      toast.error(msg);
    } else if (type === "warning") {
      toast.warning(msg);
    } else if (type === "info") {
      toast.info(msg);
    } else {
      toast.success(msg);
    }
  }, []);

  // ── BACKEND FETCHERS ────────────────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/hospital/invoices`, {
        credentials: "omit",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInvoices(json.data);

        // Derive insurance claims from invoices
        const claims = [];
        json.data.forEach((inv) => {
          if (inv.insuranceClaim && inv.insuranceClaim.claimId) {
            claims.push(inv.insuranceClaim);
          } else if (inv.insuranceProvider && inv.insuranceProvider.trim()) {
            claims.push({
              id: `CLM-${inv.id}`,
              invoiceId: inv.id,
              patientName: inv.patientName,
              patientId: inv.patientId,
              provider: inv.insuranceProvider,
              policyNo: inv.policyNumber || "POL-PENDING",
              claimAmount: inv.totalAmount || calcInvoiceTotal(inv),
              approvedAmount: inv.totalAmount || calcInvoiceTotal(inv),
              insurancePaid: inv.paymentMethod === "Insurance / TPA" ? (inv.paidAmount || 0) : 0,
              patientPayable: inv.paymentMethod === "Insurance / TPA" ? calcBalance(inv) : calcInvoiceTotal(inv),
              claimStatus: inv.status === "Paid" ? "Settled" : "Submitted",
              submittedDate: inv.invoiceDate,
              settledDate: inv.status === "Paid" ? inv.invoiceDate : null,
              tpaRef: `TPA-${inv.id.replace("INV-", "")}`,
            });
          }
        });
        setInsuranceClaims(claims);
      } else {
        showToast(json.message || "Failed to load invoices.", "error");
      }
    } catch (err) {
      console.error("Error fetching hospital invoices:", err);
      showToast("Unable to reach backend server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/hospital/patients`, {
        credentials: "omit",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPatientsList(json.data);
      }
    } catch (err) {
      console.warn("Could not load patients list:", err);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [fetchInvoices, fetchPatients]);

  // ── COMPUTED METRICS ───────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const todayStr = today();
    let totalRevenue = 0, todayRevenue = 0, pendingAmt = 0, overdueAmt = 0, partialAmt = 0, refundAmt = 0;
    invoices.forEach((inv) => {
      const total = calcInvoiceTotal(inv);
      const paid = inv.paidAmount || 0;
      const bal = calcBalance(inv);
      if (inv.status === "Paid") { totalRevenue += total; }
      if (inv.status === "Paid" && inv.invoiceDate === todayStr) todayRevenue += total;
      if (inv.status === "Pending" || inv.status === "Partially Paid" || inv.status === "Overdue") pendingAmt += bal;
      if (inv.status === "Overdue") overdueAmt += bal;
      if (inv.status === "Partially Paid") partialAmt += bal;
      if (inv.status === "Refunded") refundAmt += (inv.refundAmount || 0);
      // count today paid from payment history
      if (inv.paymentHistory) {
        inv.paymentHistory.forEach((p) => {
          if (p.date === todayStr && p.amount > 0) todayRevenue += p.amount;
        });
      }
    });
    return { totalRevenue, todayRevenue, pendingAmt, overdueAmt, partialAmt, refundAmt };
  }, [invoices]);

  // ── FILTERED INVOICES ──────────────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (inv.id && inv.id.toLowerCase().includes(q)) ||
        (inv.patientName && inv.patientName.toLowerCase().includes(q)) ||
        (inv.patientId && String(inv.patientId).toLowerCase().includes(q)) ||
        ((inv.encounterId || "").toLowerCase().includes(q)) ||
        ((inv.department || "").toLowerCase().includes(q));
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // ── ALL PAYMENT TRANSACTIONS ───────────────────────────────────────────────
  const allPayments = useMemo(() => {
    const result = [];
    invoices.forEach((inv) => {
      (inv.paymentHistory || []).forEach((p, idx) => {
        result.push({
          paymentId: `PAY-${inv.id}-${idx + 1}`,
          invoiceId: inv.id,
          patientName: inv.patientName,
          patientId: inv.patientId,
          amount: p.amount,
          method: p.method,
          date: p.date,
          ref: p.ref,
          note: p.note,
          status: p.amount < 0 ? "Refund" : "Received",
        });
      });
    });
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  // Open Record Payment Modal
  const handleOpenPayment = (inv) => {
    setPaymentTarget(inv);
    setPaymentForm(emptyPaymentForm(inv));
  };

  // Submit Payment to Backend
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) {
      showToast("Enter a valid payment amount.", "error");
      return;
    }
    try {
      setSubmitting(true);
      const targetId = paymentTarget._id || paymentTarget.id;
      const res = await fetch(`${API_BASE}/hospital/invoices/${targetId}/payment`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          amount,
          method: paymentForm.method,
          date: paymentForm.date,
          ref: paymentForm.ref,
          note: paymentForm.note,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Payment of ${fmt(amount)} recorded for ${paymentTarget.patientName}.`);
        setPaymentTarget(null);
        if (viewInvoice && (viewInvoice.id === paymentTarget.id || viewInvoice._id === paymentTarget._id)) {
          setViewInvoice(json.data);
        }
        await fetchInvoices();
      } else {
        showToast(json.message || "Failed to record payment.", "error");
      }
    } catch (err) {
      console.error("Payment error:", err);
      showToast("Error processing payment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Process Refund via Backend
  const handleRefund = async (inv) => {
    try {
      setSubmitting(true);
      const targetId = inv._id || inv.id;
      const res = await fetch(`${API_BASE}/hospital/invoices/${targetId}/refund`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Refund processed for invoice ${inv.id}.`);
        setRefundTarget(null);
        if (viewInvoice && (viewInvoice.id === inv.id || viewInvoice._id === inv._id)) {
          setViewInvoice(json.data);
        }
        await fetchInvoices();
      } else {
        showToast(json.message || "Failed to process refund.", "error");
      }
    } catch (err) {
      console.error("Refund error:", err);
      showToast("Error issuing refund.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Create Invoice Handlers
  const handleInvoiceFormChange = (field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (e) => {
    const selectedName = e.target.value;
    const found = patientsList.find((p) => p.name === selectedName);
    if (found) {
      setInvoiceForm((prev) => ({
        ...prev,
        patientName: found.name,
        patientId: found.patientId || String(found._id),
        patientAge: found.age || prev.patientAge,
        patientGender: found.gender || prev.patientGender,
        patientPhone: found.phone || prev.patientPhone,
        patientEmail: found.email || prev.patientEmail,
        patientAddress: found.address || prev.patientAddress,
      }));
    } else {
      setInvoiceForm((prev) => ({ ...prev, patientName: selectedName }));
    }
  };

  const handleItemChange = (idx, field, value) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice" || field === "discount") {
        const qty = parseFloat(field === "quantity" ? value : items[idx].quantity) || 0;
        const price = parseFloat(field === "unitPrice" ? value : items[idx].unitPrice) || 0;
        const disc = parseFloat(field === "discount" ? value : items[idx].discount) || 0;
        items[idx].amount = Math.max(0, qty * price - disc);
      }
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: "", category: "OP Consultation", quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 }],
    }));
  };

  const removeItem = (idx) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceForm.patientName.trim()) {
      showToast("Patient name is required.", "error");
      return;
    }
    if (invoiceForm.items.some((it) => !it.description.trim())) {
      showToast("All line items need a description.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/hospital/invoices`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(invoiceForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Invoice ${json.data.id || json.data.invoiceId} created successfully for ${invoiceForm.patientName}.`);
        setShowCreateModal(false);
        setInvoiceForm(emptyInvoiceForm());
        await fetchInvoices();
      } else {
        showToast(json.message || "Failed to create invoice.", "error");
      }
    } catch (err) {
      console.error("Create invoice error:", err);
      showToast("Error creating invoice.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Print
  const handlePrint = () => window.print();

  // Send Invoice Notification via Backend
  const handleSend = async (inv) => {
    try {
      const targetId = inv._id || inv.id;
      const res = await fetch(`${API_BASE}/hospital/invoices/${targetId}/send`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Invoice ${inv.id} sent to ${inv.patientEmail || inv.patientName}.`);
      } else {
        showToast(`Invoice ${inv.id} sent to ${inv.patientEmail || inv.patientName}.`);
      }
    } catch (err) {
      showToast(`Invoice ${inv.id} sent to ${inv.patientEmail || inv.patientName}.`);
    }
  };

  // ── STATUS BADGE ──────────────────────────────────────────────────────────
  const StatusBadge = ({ status, size = "sm" }) => {
    const style = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#64748b" };
    return (
      <span className={`bill-badge bill-badge--${size}`} style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  const ServiceBadge = ({ category }) => {
    const style = SERVICE_BADGE_COLORS[category] || { bg: "#f1f5f9", color: "#475569" };
    return (
      <span className="svc-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {category}
      </span>
    );
  };

  const PayMethodIcon = ({ method }) => {
    const icons = {
      "Cash": <FaMoneyBill />,
      "UPI": <FaMobileAlt />,
      "Credit/Debit Card": <FaCreditCard />,
      "Net Banking": <FaUniversity />,
      "Insurance / TPA": <FaShieldAlt />,
      "Cheque": <FaFileInvoiceDollar />,
    };
    return <span className="pay-method-icon">{icons[method] || <FaMoneyBillWave />}</span>;
  };

  // ── REPORTS DATA ──────────────────────────────────────────────────────────
  const reportData = useMemo(() => {
    const methodTotals = {};
    const deptTotals = {};
    const doctorTotals = {};
    let totalCollected = 0;
    let refundTotal = 0;
    let overdueTotal = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      const paid = inv.paidAmount || 0;
      if (paid > 0) {
        totalCollected += paid;
        const m = inv.paymentMethod || "Other";
        methodTotals[m] = (methodTotals[m] || 0) + paid;
      }
      if (inv.status === "Refunded") refundTotal += (inv.refundAmount || 0);
      if (inv.status === "Overdue") { overdueTotal += calcBalance(inv); overdueCount++; }
      const dept = inv.department || "General";
      deptTotals[dept] = (deptTotals[dept] || 0) + (inv.status === "Paid" || inv.status === "Partially Paid" ? paid : 0);
      const doc = inv.attendingDoctor || "Unknown";
      if (inv.items && inv.items.some(it => it.category === "OP Consultation" || it.category === "Doctor Visit Charges" || it.category === "Online Consultation")) {
        doctorTotals[doc] = (doctorTotals[doc] || 0) + inv.items.filter(it => it.category === "OP Consultation" || it.category === "Doctor Visit Charges" || it.category === "Online Consultation").reduce((s, it) => s + (it.amount || 0), 0);
      }
    });

    return { methodTotals, deptTotals, doctorTotals, totalCollected, refundTotal, overdueTotal, overdueCount };
  }, [invoices]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="bill-page">
      {/* ── HEADER BANNER ── */}
      <div className="bill-banner">
        <div className="bill-banner__info">
          <div className="bill-banner__icon"><FaFileInvoiceDollar /></div>
          <div>
            <h2 className="bill-banner__title">Billing &amp; Invoices</h2>
            <p className="bill-banner__sub">
              Complete hospital billing — OP · Inpatient · Pharmacy · Lab · Surgery · Insurance &amp; TPA
            </p>
          </div>
        </div>
        <button className="bill-btn-create" onClick={() => setShowCreateModal(true)} id="btn-create-invoice">
          <FaPlus /> Create Invoice
        </button>
      </div>

      {/* ── 6 METRIC CARDS ── */}
      <section className="bill-metrics">
        {[
          { label: "Total Revenue", value: fmt(metrics.totalRevenue), icon: <FaMoneyBillWave />, cls: "metric--revenue", sub: "All collected payments" },
          { label: "Today's Revenue", value: fmt(metrics.todayRevenue), icon: <FaTachometerAlt />, cls: "metric--today", sub: "Collected today" },
          { label: "Pending Amount", value: fmt(metrics.pendingAmt), icon: <FaHourglassHalf />, cls: "metric--pending", sub: "Outstanding balance" },
          { label: "Overdue Amount", value: fmt(metrics.overdueAmt), icon: <FaExclamationCircle />, cls: "metric--overdue", sub: "Past due date" },
          { label: "Partially Paid", value: fmt(metrics.partialAmt), icon: <FaChartBar />, cls: "metric--partial", sub: "Balance remaining" },
          { label: "Refunds", value: fmt(metrics.refundAmt), icon: <FaUndo />, cls: "metric--refund", sub: "Total refunded" },
        ].map((m) => (
          <div key={m.label} className={`bill-metric-card ${m.cls}`}>
            <div className="bill-metric-card__header">
              <span className="bill-metric-card__label">{m.label}</span>
              <div className="bill-metric-card__icon">{m.icon}</div>
            </div>
            <div className="bill-metric-card__value">{m.value}</div>
            <div className="bill-metric-card__sub">{m.sub}</div>
          </div>
        ))}
      </section>

      {/* ── SECTION TABS ── */}
      <div className="bill-section-tabs hosp-card">
        {[
          { key: "invoices", label: "Invoices", icon: <FaFileInvoiceDollar /> },
          { key: "payments", label: "Payments", icon: <FaMoneyBillWave /> },
          { key: "insurance", label: "Insurance / TPA", icon: <FaShieldAlt /> },
          { key: "reports", label: "Reports", icon: <FaChartBar /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`bill-section-tab ${activeSection === tab.key ? "bill-section-tab--active" : ""}`}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ INVOICES SECTION ══════════════════ */}
      {activeSection === "invoices" && (
        <>
          {/* Controls */}
          <div className="bill-controls hosp-card">
            {/* Status Tabs */}
            <div className="bill-status-tabs">
              {STATUS_TABS.map((s) => {
                const count = s === "All" ? invoices.length : invoices.filter((i) => i.status === s).length;
                return (
                  <button
                    key={s}
                    className={`bill-stab ${statusFilter === s ? "bill-stab--active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "All" ? "All Invoices" : s}
                    <span className="bill-stab__count">{count}</span>
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="bill-search-row">
              <div className="bill-search-box">
                <FaSearch className="bill-search-icon" />
                <input
                  type="text"
                  placeholder="Search Invoice ID, Patient, Encounter ID, Department…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className="bill-search-clear" onClick={() => setSearch("")}><FaTimes /></button>}
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="hosp-card bill-table-card">
            <div className="bill-table-header">
              <div>
                <h3 className="hosp-card-title" style={{ marginBottom: "0.1rem" }}>Hospital Billing Register</h3>
                <p className="bill-table-sub">Showing {filteredInvoices.length} of {invoices.length} invoices</p>
              </div>
            </div>
            <div className="hosp-table-wrapper">
              <table className="hosp-table bill-main-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient</th>
                    <th>Encounter / Dept.</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                    <th style={{ textAlign: "right" }}>Paid</th>
                    <th style={{ textAlign: "right" }}>Balance</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="hosp-table-empty">
                        <FaSpinner className="empty-icon fa-spin" />
                        <h3>Loading Invoices…</h3>
                        <p>Connecting to hospital billing database…</p>
                      </td>
                    </tr>
                  ) : filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                    const total = calcInvoiceTotal(inv);
                    const paid = inv.paidAmount || 0;
                    const bal = calcBalance(inv);
                    return (
                      <tr key={inv.id || inv._id} className="bill-tr">
                        <td>
                          <div className="bill-id-cell">
                            <FaReceipt className="bill-id-icon" />
                            <span className="bill-id-text">{inv.id}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-patient-cell">
                            <span className="hosp-pat-name">{inv.patientName}</span>
                            <span className="hosp-pat-id">{inv.patientId}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-enc-cell">
                            <span className="bill-enc-id">{inv.encounterId}</span>
                            <span className="bill-dept-lbl">{inv.department}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-date-cell">
                            <FaCalendarAlt className="mini-icon" />
                            {formatDate(inv.invoiceDate)}
                          </div>
                        </td>
                        <td>
                          <div className={`bill-date-cell ${inv.status === "Overdue" ? "text-overdue" : ""}`}>
                            <FaCalendarAlt className="mini-icon" />
                            {formatDate(inv.dueDate)}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="bill-amount">{fmt(total)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="bill-amount bill-amount--paid">{fmt(paid)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`bill-amount ${bal > 0 ? "bill-amount--balance" : "bill-amount--zero"}`}>{fmt(bal)}</span>
                        </td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td>
                          <div className="bill-method-cell">
                            <PayMethodIcon method={inv.paymentMethod} />
                            <span className="bill-method-txt">{inv.paymentMethod}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-actions-cell">
                            <button className="bill-act-btn bill-act-btn--view" title="View Invoice" onClick={() => setViewInvoice(inv)}>
                              <FaEye />
                            </button>
                            {(inv.status === "Pending" || inv.status === "Partially Paid" || inv.status === "Overdue") && (
                              <button className="bill-act-btn bill-act-btn--pay" title="Record Payment" onClick={() => handleOpenPayment(inv)}>
                                <FaMoneyBillWave />
                              </button>
                            )}
                            <button className="bill-act-btn bill-act-btn--print" title="Print / Download" onClick={() => { setViewInvoice(inv); setTimeout(handlePrint, 300); }}>
                              <FaPrint />
                            </button>
                            <button className="bill-act-btn bill-act-btn--send" title="Send Invoice" onClick={() => handleSend(inv)}>
                              <FaPaperPlane />
                            </button>
                            {inv.status === "Paid" && (
                              <button className="bill-act-btn bill-act-btn--refund" title="Issue Refund" onClick={() => setRefundTarget(inv)}>
                                <FaUndo />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="11" className="hosp-table-empty">
                        <FaFileInvoiceDollar className="empty-icon" />
                        <h3>No invoices found</h3>
                        <p>Adjust filters or create a new invoice.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════ PAYMENTS SECTION ══════════════════ */}
      {activeSection === "payments" && (
        <div className="hosp-card bill-table-card">
          <h3 className="hosp-card-title">Payment Transactions</h3>
          <div className="hosp-table-wrapper">
            <table className="hosp-table bill-pay-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Reference / Txn ID</th>
                  <th>Note</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.length > 0 ? allPayments.map((p) => (
                  <tr key={p.paymentId} className="bill-tr">
                    <td><span className="bill-id-text">{p.paymentId}</span></td>
                    <td><span className="bill-enc-id">{p.invoiceId}</span></td>
                    <td>
                      <div className="bill-patient-cell">
                        <span className="hosp-pat-name">{p.patientName}</span>
                        <span className="hosp-pat-id">{p.patientId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`bill-amount ${p.amount < 0 ? "bill-amount--balance" : "bill-amount--paid"}`}>
                        {p.amount < 0 ? `-${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="bill-method-cell">
                        <PayMethodIcon method={p.method} />
                        <span className="bill-method-txt">{p.method}</span>
                      </div>
                    </td>
                    <td>
                      <div className="bill-date-cell"><FaCalendarAlt className="mini-icon" />{formatDate(p.date)}</div>
                    </td>
                    <td><span className="bill-ref-txt">{p.ref || "—"}</span></td>
                    <td><span className="bill-note-txt">{p.note || "—"}</span></td>
                    <td>
                      <span
                        className="bill-badge"
                        style={p.status === "Refund"
                          ? { backgroundColor: "#faf5ff", color: "#7c3aed" }
                          : { backgroundColor: "#dcfce7", color: "#15803d" }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="hosp-table-empty">
                      <FaMoneyBillWave className="empty-icon" />
                      <h3>No payment records</h3>
                      <p>Payments will appear here once recorded.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ INSURANCE / TPA SECTION ══════════════════ */}
      {activeSection === "insurance" && (
        <div className="hosp-card bill-table-card">
          <h3 className="hosp-card-title">Insurance &amp; TPA Claims</h3>
          <div className="hosp-table-wrapper">
            <table className="hosp-table bill-ins-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Insurance Provider</th>
                  <th>Policy No.</th>
                  <th style={{ textAlign: "right" }}>Claim Amount</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th style={{ textAlign: "right" }}>Insurance Paid</th>
                  <th style={{ textAlign: "right" }}>Patient Payable</th>
                  <th style={{ textAlign: "right" }}>Pending</th>
                  <th>Claim Status</th>
                  <th>Submitted</th>
                  <th>Settled</th>
                </tr>
              </thead>
              <tbody>
                {insuranceClaims.length > 0 ? insuranceClaims.map((c) => {
                  const pending = Math.max(0, (c.approvedAmount || 0) - (c.insurancePaid || 0));
                  const claimStyle = CLAIM_STATUS_COLORS[c.claimStatus] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={c.id || c.claimId} className="bill-tr">
                      <td><span className="bill-id-text">{c.id || c.claimId}</span></td>
                      <td><span className="bill-enc-id">{c.invoiceId}</span></td>
                      <td>
                        <div className="bill-patient-cell">
                          <span className="hosp-pat-name">{c.patientName}</span>
                          <span className="hosp-pat-id">{c.patientId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="bill-ins-provider">
                          <FaShieldAlt className="ins-shield-icon" />
                          <span>{c.provider}</span>
                        </div>
                      </td>
                      <td><span className="bill-ref-txt">{c.policyNo}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount">{fmt(c.claimAmount)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--paid">{fmt(c.approvedAmount)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--paid">{fmt(c.insurancePaid)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--balance">{fmt(c.patientPayable)}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`bill-amount ${pending > 0 ? "bill-amount--balance" : "bill-amount--zero"}`}>{fmt(pending)}</span>
                      </td>
                      <td>
                        <span className="bill-badge" style={{ backgroundColor: claimStyle.bg, color: claimStyle.color }}>
                          {c.claimStatus}
                        </span>
                      </td>
                      <td>
                        <div className="bill-date-cell"><FaCalendarAlt className="mini-icon" />{formatDate(c.submittedDate)}</div>
                      </td>
                      <td>
                        <div className="bill-date-cell">
                          {c.settledDate ? <><FaCalendarAlt className="mini-icon" />{formatDate(c.settledDate)}</> : "—"}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="13" className="hosp-table-empty">
                      <FaShieldAlt className="empty-icon" />
                      <h3>No Insurance Claims Found</h3>
                      <p>Invoices created with insurance providers will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ REPORTS SECTION ══════════════════ */}
      {activeSection === "reports" && (
        <div className="bill-reports">
          {/* Summary Cards */}
          <div className="bill-report-grid-2">
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaMoneyBillWave /> Total Collections</h4>
              <div className="bill-report-big-val">{fmt(reportData.totalCollected)}</div>
              <p className="bill-report-sub">All payments received (excl. refunds)</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaExclamationCircle /> Overdue Outstanding</h4>
              <div className="bill-report-big-val bill-report-big-val--danger">{fmt(reportData.overdueTotal)}</div>
              <p className="bill-report-sub">{reportData.overdueCount} overdue invoice(s) pending clearance</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaUndo /> Total Refunds</h4>
              <div className="bill-report-big-val bill-report-big-val--purple">{fmt(reportData.refundTotal)}</div>
              <p className="bill-report-sub">Refunds processed this period</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaShieldAlt /> Insurance Claims</h4>
              <div className="bill-report-big-val bill-report-big-val--blue">{insuranceClaims.length}</div>
              <p className="bill-report-sub">Total TPA claims ({insuranceClaims.filter(c => c.claimStatus === "Settled").length} settled)</p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="hosp-card">
            <h4 className="hosp-card-title"><FaCreditCard style={{ marginRight: "0.4rem" }} />Payment Method Breakdown</h4>
            <div className="bill-method-breakdown">
              {Object.keys(reportData.methodTotals).length > 0 ? (
                Object.entries(reportData.methodTotals).map(([method, amt]) => {
                  const total = Object.values(reportData.methodTotals).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
                  const colors = {
                    "Cash": "#10b981", "UPI": "#8b5cf6", "Credit/Debit Card": "#0284c7",
                    "Net Banking": "#f59e0b", "Insurance / TPA": "#ef4444", "Cheque": "#64748b",
                  };
                  return (
                    <div key={method} className="bill-method-row">
                      <div className="bill-method-row__label">
                        <PayMethodIcon method={method} />
                        <span>{method}</span>
                      </div>
                      <div className="bill-method-row__bar-wrap">
                        <div className="bill-method-row__bar">
                          <div className="bill-method-row__fill" style={{ width: `${pct}%`, backgroundColor: colors[method] || "#64748b" }} />
                        </div>
                        <span className="bill-method-row__pct">{pct}%</span>
                      </div>
                      <span className="bill-method-row__amt">{fmt(amt)}</span>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#64748b", padding: "1rem" }}>No payments collected yet.</p>
              )}
            </div>
          </div>

          {/* Department Revenue & Doctor Revenue */}
          <div className="bill-report-grid-2">
            <div className="hosp-card">
              <h4 className="hosp-card-title">Department-wise Revenue</h4>
              <table className="bill-report-table">
                <thead><tr><th>Department</th><th style={{ textAlign: "right" }}>Collected</th></tr></thead>
                <tbody>
                  {Object.keys(reportData.deptTotals).length > 0 ? (
                    Object.entries(reportData.deptTotals).sort((a, b) => b[1] - a[1]).map(([dept, amt]) => (
                      <tr key={dept}>
                        <td>{dept}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(amt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={{ textAlign: "center", color: "#64748b" }}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="hosp-card">
              <h4 className="hosp-card-title">Doctor-wise Consultation Revenue</h4>
              <table className="bill-report-table">
                <thead><tr><th>Doctor</th><th style={{ textAlign: "right" }}>Revenue</th></tr></thead>
                <tbody>
                  {Object.keys(reportData.doctorTotals).length > 0 ? (
                    Object.entries(reportData.doctorTotals).sort((a, b) => b[1] - a[1]).map(([doc, amt]) => (
                      <tr key={doc}>
                        <td>{doc}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(amt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" style={{ textAlign: "center", color: "#64748b" }}>No data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insurance Summary */}
          <div className="hosp-card">
            <h4 className="hosp-card-title">Insurance Claims Summary</h4>
            <table className="bill-report-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Claim ID</th>
                  <th style={{ textAlign: "right" }}>Claim Amt</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th style={{ textAlign: "right" }}>Ins. Paid</th>
                  <th style={{ textAlign: "right" }}>Patient Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insuranceClaims.length > 0 ? (
                  insuranceClaims.map((c) => {
                    const st = CLAIM_STATUS_COLORS[c.claimStatus] || {};
                    return (
                      <tr key={c.id || c.claimId}>
                        <td>{c.provider}</td>
                        <td>{c.id || c.claimId}</td>
                        <td style={{ textAlign: "right" }}>{fmt(c.claimAmount)}</td>
                        <td style={{ textAlign: "right" }}>{fmt(c.approvedAmount)}</td>
                        <td style={{ textAlign: "right" }}>{fmt(c.insurancePaid)}</td>
                        <td style={{ textAlign: "right" }}>{fmt(c.patientPayable)}</td>
                        <td>
                          <span className="bill-badge" style={{ backgroundColor: st.bg, color: st.color }}>{c.claimStatus}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="7" style={{ textAlign: "center", color: "#64748b" }}>No claims registered</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ VIEW INVOICE MODAL ══════════════════ */}
      {viewInvoice && (
        <div className="hosp-modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="hosp-modal bill-view-modal printable-invoice-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="hosp-modal-header no-print">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <div>
                  <h2>Tax Invoice</h2>
                  <span className="modal-ref-id">{viewInvoice.id}</span>
                </div>
              </div>
              <div className="bill-modal-header-actions">
                <button className="bill-btn-print-action" onClick={handlePrint}><FaPrint /> Print / PDF</button>
                {(viewInvoice.status === "Pending" || viewInvoice.status === "Partially Paid" || viewInvoice.status === "Overdue") && (
                  <button className="bill-btn-pay-action" onClick={() => { handleOpenPayment(viewInvoice); }}>
                    <FaMoneyBillWave /> Record Payment
                  </button>
                )}
                <button className="hosp-modal-close" onClick={() => setViewInvoice(null)}><FaTimes /></button>
              </div>
            </div>

            {/* Invoice Sheet */}
            <div className="invoice-sheet" id="printable-invoice-sheet">
              {/* Hospital Header */}
              <div className="inv-hosp-header">
                <div className="inv-hosp-brand">
                  <div className="inv-hosp-logo"><FaHospital /></div>
                  <div>
                    <h3 className="inv-hosp-name">City General Hospital</h3>
                    <p className="inv-hosp-sub">NABH Accredited Tertiary Healthcare Centre</p>
                    <span className="inv-hosp-reg">Reg: #HOSP-5021 · GSTIN: 32AABCC8901D1ZF · Ph: +91 484 288 0000</span>
                  </div>
                </div>
                <div className="inv-id-block">
                  <span className="inv-label-sm">OFFICIAL TAX INVOICE</span>
                  <p className="inv-num">{viewInvoice.id}</p>
                  <StatusBadge status={viewInvoice.status} size="md" />
                </div>
              </div>

              <div className="inv-divider" />

              {/* Patient & Invoice Meta */}
              <div className="inv-meta-grid">
                <div>
                  <span className="inv-meta-label">Billed To (Patient)</span>
                  <h4 className="inv-pat-name">{viewInvoice.patientName}</h4>
                  <p className="inv-meta-row-detail"><strong>Patient ID:</strong> <span className="hosp-pat-id">{viewInvoice.patientId}</span></p>
                  <p className="inv-meta-row-detail"><strong>Age / Gender:</strong> {viewInvoice.patientAge} yrs, {viewInvoice.patientGender}</p>
                  <p className="inv-meta-row-detail"><strong>Phone:</strong> {viewInvoice.patientPhone || "—"}</p>
                  <p className="inv-meta-row-detail"><strong>Email:</strong> {viewInvoice.patientEmail || "—"}</p>
                  <p className="inv-meta-row-detail"><strong>Address:</strong> {viewInvoice.patientAddress || "—"}</p>
                </div>
                <div>
                  <span className="inv-meta-label">Encounter / Admission</span>
                  <p className="inv-meta-row-detail"><strong>Encounter ID:</strong> {viewInvoice.encounterId}</p>
                  <p className="inv-meta-row-detail"><strong>Type:</strong> {viewInvoice.encounterType}</p>
                  <p className="inv-meta-row-detail"><strong>Department:</strong> {viewInvoice.department}</p>
                  <p className="inv-meta-row-detail"><strong>Attending Doctor:</strong> {viewInvoice.attendingDoctor}</p>
                  <p className="inv-meta-row-detail"><strong>Invoice Date:</strong> {formatDate(viewInvoice.invoiceDate)}</p>
                  <p className="inv-meta-row-detail"><strong>Due Date:</strong> {formatDate(viewInvoice.dueDate)}</p>
                  <p className="inv-meta-row-detail"><strong>Payment Mode:</strong> {viewInvoice.paymentMethod}</p>
                  {viewInvoice.insuranceProvider && (
                    <p className="inv-meta-row-detail"><strong>Insurance:</strong> {viewInvoice.insuranceProvider} · {viewInvoice.policyNumber || "—"}</p>
                  )}
                  <p className="inv-meta-row-detail"><strong>Billing Officer:</strong> {viewInvoice.billingOfficer}</p>
                </div>
              </div>

              {/* Itemized Charges */}
              <div className="inv-items-wrap">
                <table className="inv-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Service / Item Description</th>
                      <th>Category</th>
                      <th style={{ textAlign: "center" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Unit Price</th>
                      <th style={{ textAlign: "right" }}>Discount</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewInvoice.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="inv-item-desc">{item.description}</td>
                        <td><ServiceBadge category={item.category} /></td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                        <td style={{ textAlign: "right", color: "#16a34a" }}>
                          {item.discount > 0 ? `-${fmt(item.discount)}` : "—"}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Notes */}
              <div className="inv-summary-grid">
                {/* Notes & Payment History */}
                <div>
                  {viewInvoice.notes && (
                    <div className="inv-notes-block">
                      <span className="inv-notes-label">Notes</span>
                      <p className="inv-notes-text">{viewInvoice.notes}</p>
                    </div>
                  )}

                  {/* Payment History */}
                  {viewInvoice.paymentHistory?.length > 0 && (
                    <div className="inv-pay-history">
                      <span className="inv-notes-label">Payment History</span>
                      <table className="inv-hist-table">
                        <thead>
                          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr>
                        </thead>
                        <tbody>
                          {viewInvoice.paymentHistory.map((p, i) => (
                            <tr key={i}>
                              <td>{formatDate(p.date)}</td>
                              <td className={p.amount < 0 ? "text-refund" : "text-paid"}>
                                {p.amount < 0 ? `-${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                              </td>
                              <td>{p.method}</td>
                              <td>{p.ref || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="inv-calc-card">
                  {(() => {
                    const subtotal = calcInvoiceSubtotal(viewInvoice);
                    const disc = viewInvoice.globalDiscount || viewInvoice.discount || 0;
                    const tax = viewInvoice.globalTax || viewInvoice.tax || 0;
                    const total = calcInvoiceTotal(viewInvoice);
                    const paid = viewInvoice.paidAmount || 0;
                    const bal = calcBalance(viewInvoice);
                    return (
                      <>
                        <div className="inv-calc-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                        {disc > 0 && <div className="inv-calc-row text-green"><span>Discount</span><span>-{fmt(disc)}</span></div>}
                        <div className="inv-calc-row"><span>GST / Tax</span><span>{tax > 0 ? fmt(tax) : "₹0 (Exempt)"}</span></div>
                        <div className="inv-calc-row inv-calc-row--total"><span>Total Amount</span><span>{fmt(total)}</span></div>
                        <div className="inv-calc-row inv-calc-row--paid"><span>Amount Paid</span><span className="text-paid">{fmt(paid)}</span></div>
                        <div className="inv-calc-row inv-calc-row--balance">
                          <span>Balance Due</span>
                          <span className={bal > 0 ? "text-balance" : "text-paid"}>{fmt(bal)}</span>
                        </div>
                        <div className="inv-calc-status-row">
                          <StatusBadge status={viewInvoice.status} size="md" />
                          {bal === 0 && viewInvoice.status === "Paid" && (
                            <span className="inv-paid-stamp"><FaCheckCircle /> Fully Settled</span>
                          )}
                        </div>
                        {viewInvoice.status === "Partially Paid" && total > 0 && (
                          <div className="inv-partial-bar">
                            <div className="inv-partial-bar__track">
                              <div className="inv-partial-bar__fill" style={{ width: `${Math.min(100, (paid / total) * 100).toFixed(1)}%` }} />
                            </div>
                            <span>{Math.round((paid / total) * 100)}% paid</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="inv-footer">
                <div>
                  <p className="inv-footer-addr">Medical Center Road, City General Campus, Kochi, Kerala – 682 011</p>
                  <p className="inv-footer-contact">billing@citygeneralhospital.com · www.citygeneralhospital.com</p>
                </div>
                <div className="inv-sign-block">
                  <div className="inv-sign-line" />
                  <span className="inv-sign-label">Authorized Billing Officer — {viewInvoice.billingOfficer}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="hosp-modal-actions no-print">
              {(viewInvoice.status === "Pending" || viewInvoice.status === "Partially Paid" || viewInvoice.status === "Overdue") && (
                <button className="hosp-btn-submit" onClick={() => { handleOpenPayment(viewInvoice); }}>
                  <FaMoneyBillWave />
                  {viewInvoice.status === "Partially Paid"
                    ? `Pay Balance — ${fmt(calcBalance(viewInvoice))}`
                    : "Record Full Payment"}
                </button>
              )}
              <button className="btn-modal-cancel" onClick={() => setViewInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RECORD PAYMENT MODAL ══════════════════ */}
      {paymentTarget && (
        <div className="hosp-modal-overlay" onClick={() => setPaymentTarget(null)}>
          <div className="hosp-modal bill-pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaMoneyBillWave className="modal-header-icon" />
                <div>
                  <h2>Record Payment</h2>
                  <span className="modal-ref-id">{paymentTarget.id} · {paymentTarget.patientName}</span>
                </div>
              </div>
              <button className="hosp-modal-close" onClick={() => setPaymentTarget(null)}><FaTimes /></button>
            </div>

            <div className="bill-pay-modal__summary">
              <div className="bill-pay-modal__summary-item">
                <span>Total Invoice</span>
                <strong>{fmt(calcInvoiceTotal(paymentTarget))}</strong>
              </div>
              <div className="bill-pay-modal__summary-item">
                <span>Already Paid</span>
                <strong className="text-paid">{fmt(paymentTarget.paidAmount || 0)}</strong>
              </div>
              <div className="bill-pay-modal__summary-item bill-pay-modal__summary-item--highlight">
                <span>Balance Due</span>
                <strong className="text-balance">{fmt(calcBalance(paymentTarget))}</strong>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="hosp-modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Payment Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={calcBalance(paymentTarget)}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Payment Method *</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Payment Date *</label>
                  <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="form-group half">
                  <label>Reference / Txn ID</label>
                  <input type="text" placeholder="e.g. GPAY-1234 / UTR / Receipt No." value={paymentForm.ref} onChange={(e) => setPaymentForm((p) => ({ ...p, ref: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Note</label>
                <input type="text" placeholder="Optional payment note" value={paymentForm.note} onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <div className="hosp-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setPaymentTarget(null)}>Cancel</button>
                <button type="submit" className="hosp-btn-submit" disabled={submitting}>
                  <FaCheck /> {submitting ? "Processing…" : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ REFUND CONFIRMATION MODAL ══════════════════ */}
      {refundTarget && (
        <div className="hosp-modal-overlay" onClick={() => setRefundTarget(null)}>
          <div className="hosp-modal bill-refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUndo className="modal-header-icon" style={{ color: "#7c3aed" }} />
                <h2>Confirm Refund</h2>
              </div>
              <button className="hosp-modal-close" onClick={() => setRefundTarget(null)}><FaTimes /></button>
            </div>
            <div className="bill-refund-modal__body">
              <p>Issue a full refund for invoice <strong>{refundTarget.id}</strong>?</p>
              <div className="bill-refund-modal__amount">
                Refund Amount: <strong>{fmt(refundTarget.paidAmount || 0)}</strong>
              </div>
              <p className="bill-refund-modal__warn">This action will mark the invoice as <em>Refunded</em> and record the refund transaction.</p>
            </div>
            <div className="hosp-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setRefundTarget(null)}>Cancel</button>
              <button className="hosp-btn-submit bill-btn-refund-confirm" onClick={() => handleRefund(refundTarget)} disabled={submitting}>
                <FaUndo /> {submitting ? "Refunding…" : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CREATE INVOICE MODAL ══════════════════ */}
      {showCreateModal && (
        <div className="hosp-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="hosp-modal bill-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <h2>Create New Invoice</h2>
              </div>
              <button className="hosp-modal-close" onClick={() => setShowCreateModal(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="hosp-modal-form bill-create-form">
              {/* Section: Patient */}
              <div className="bill-form-section">
                <div className="bill-form-section-title"><FaUserMd /> Patient &amp; Encounter Details</div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Patient Full Name *</label>
                    <input
                      type="text"
                      list="patients-datalist"
                      placeholder="e.g. Ramesh Kumar"
                      value={invoiceForm.patientName}
                      onChange={handlePatientSelect}
                      required
                    />
                    {patientsList.length > 0 && (
                      <datalist id="patients-datalist">
                        {patientsList.map((p) => (
                          <option key={p._id} value={p.name}>
                            {p.patientId ? `(${p.patientId}) ` : ""}{p.phone || ""}
                          </option>
                        ))}
                      </datalist>
                    )}
                  </div>
                  <div className="form-group half">
                    <label>Patient ID</label>
                    <input type="text" placeholder="e.g. PAT-4091 (auto if blank)" value={invoiceForm.patientId} onChange={(e) => handleInvoiceFormChange("patientId", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Age</label>
                    <input type="number" min="0" placeholder="Age" value={invoiceForm.patientAge} onChange={(e) => handleInvoiceFormChange("patientAge", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Gender</label>
                    <select value={invoiceForm.patientGender} onChange={(e) => handleInvoiceFormChange("patientGender", e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Phone</label>
                    <input type="text" placeholder="+91 XXXXX XXXXX" value={invoiceForm.patientPhone} onChange={(e) => handleInvoiceFormChange("patientPhone", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Email</label>
                    <input type="email" placeholder="patient@email.com" value={invoiceForm.patientEmail} onChange={(e) => handleInvoiceFormChange("patientEmail", e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Patient address" value={invoiceForm.patientAddress} onChange={(e) => handleInvoiceFormChange("patientAddress", e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Encounter / Admission ID</label>
                    <input type="text" placeholder="e.g. ENC-2026-A4501 (auto if blank)" value={invoiceForm.encounterId} onChange={(e) => handleInvoiceFormChange("encounterId", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Encounter Type</label>
                    <select value={invoiceForm.encounterType} onChange={(e) => handleInvoiceFormChange("encounterType", e.target.value)}>
                      {["OP Visit", "Online Consultation", "Inpatient Admission", "Emergency", "ICU Admission", "Pharmacy Visit", "Radiology Visit", "Lab Visit"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Department</label>
                    <input type="text" placeholder="e.g. Cardiology" value={invoiceForm.department} onChange={(e) => handleInvoiceFormChange("department", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Attending Doctor</label>
                    <input type="text" placeholder="e.g. Dr. Suresh Menon" value={invoiceForm.attendingDoctor} onChange={(e) => handleInvoiceFormChange("attendingDoctor", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Section: Billable Items */}
              <div className="bill-form-section">
                <div className="bill-form-section-title" style={{ justifyContent: "space-between" }}>
                  <span><FaListAlt /> Billable Services &amp; Items</span>
                  <button type="button" className="bill-btn-add-item" onClick={addItem}><FaPlus /> Add Item</button>
                </div>
                <div className="bill-items-builder">
                  <div className="bill-items-builder__header">
                    <span style={{ flex: 3 }}>Description</span>
                    <span style={{ flex: 2 }}>Category</span>
                    <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
                    <span style={{ flex: 1.2, textAlign: "right" }}>Unit Price</span>
                    <span style={{ flex: 1, textAlign: "right" }}>Discount</span>
                    <span style={{ flex: 1.2, textAlign: "right" }}>Amount</span>
                    <span style={{ width: "32px" }}></span>
                  </div>
                  {invoiceForm.items.map((item, idx) => (
                    <div key={item.id} className="bill-items-builder__row">
                      <input
                        style={{ flex: 3 }}
                        type="text"
                        placeholder="Service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        required
                      />
                      <select
                        style={{ flex: 2 }}
                        value={item.category}
                        onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                      >
                        {SERVICE_CATEGORIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <input
                        style={{ flex: 1, textAlign: "center" }}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      />
                      <input
                        style={{ flex: 1.2, textAlign: "right" }}
                        type="number"
                        min="0"
                        placeholder="₹"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                      />
                      <input
                        style={{ flex: 1, textAlign: "right" }}
                        type="number"
                        min="0"
                        placeholder="₹"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                      <span style={{ flex: 1.2, textAlign: "right", fontWeight: 700, fontSize: "0.84rem", paddingTop: "0.1rem" }}>
                        {fmt(item.amount)}
                      </span>
                      <button
                        type="button"
                        className="bill-items-builder__remove"
                        onClick={() => removeItem(idx)}
                        disabled={invoiceForm.items.length === 1}
                        title="Remove item"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Billing Summary */}
              <div className="bill-form-section">
                <div className="bill-form-section-title"><FaReceipt /> Billing Summary &amp; Payment</div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Overall Discount (₹)</label>
                    <input type="number" min="0" value={invoiceForm.globalDiscount} onChange={(e) => handleInvoiceFormChange("globalDiscount", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Tax / GST (₹)</label>
                    <input type="number" min="0" value={invoiceForm.globalTax} onChange={(e) => handleInvoiceFormChange("globalTax", e.target.value)} />
                  </div>
                </div>

                {/* Live Total Calculator */}
                {(() => {
                  const subtotal = invoiceForm.items.reduce((s, it) => s + (it.amount || 0), 0);
                  const disc = parseFloat(invoiceForm.globalDiscount) || 0;
                  const tax = parseFloat(invoiceForm.globalTax) || 0;
                  const total = Math.max(0, subtotal - disc + tax);
                  const paid = parseFloat(invoiceForm.paidAmount) || 0;
                  const bal = Math.max(0, total - paid);
                  return (
                    <div className="bill-create-calc-strip">
                      <div className="bill-create-calc-item"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                      <div className="bill-create-calc-item text-green"><span>Discount</span><strong>-{fmt(disc)}</strong></div>
                      <div className="bill-create-calc-item"><span>Tax</span><strong>{fmt(tax)}</strong></div>
                      <div className="bill-create-calc-item bill-create-calc-item--total"><span>Invoice Total</span><strong>{fmt(total)}</strong></div>
                      <div className="bill-create-calc-item text-green"><span>Paid Now</span><strong>{fmt(paid)}</strong></div>
                      <div className="bill-create-calc-item bill-create-calc-item--balance"><span>Balance Due</span><strong>{fmt(bal)}</strong></div>
                    </div>
                  );
                })()}

                <div className="form-row">
                  <div className="form-group half">
                    <label>Amount Paid Now (₹)</label>
                    <input type="number" min="0" value={invoiceForm.paidAmount} onChange={(e) => handleInvoiceFormChange("paidAmount", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Payment Method</label>
                    <select value={invoiceForm.paymentMethod} onChange={(e) => handleInvoiceFormChange("paymentMethod", e.target.value)}>
                      {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                      <option value="Pending Selection">Pending Selection</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Invoice Date *</label>
                    <input type="date" value={invoiceForm.invoiceDate} onChange={(e) => handleInvoiceFormChange("invoiceDate", e.target.value)} required />
                  </div>
                  <div className="form-group half">
                    <label>Due Date</label>
                    <input type="date" value={invoiceForm.dueDate} onChange={(e) => handleInvoiceFormChange("dueDate", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Insurance Provider</label>
                    <input
                      type="text"
                      list="insurance-providers-list"
                      placeholder="e.g. Star Health Insurance (if applicable)"
                      value={invoiceForm.insuranceProvider}
                      onChange={(e) => handleInvoiceFormChange("insuranceProvider", e.target.value)}
                    />
                    <datalist id="insurance-providers-list">
                      {INSURANCE_PROVIDERS.map((ip) => (
                        <option key={ip} value={ip} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group half">
                    <label>Policy Number</label>
                    <input type="text" placeholder="Insurance policy number" value={invoiceForm.policyNumber} onChange={(e) => handleInvoiceFormChange("policyNumber", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Billing Officer</label>
                    <select value={invoiceForm.billingOfficer} onChange={(e) => handleInvoiceFormChange("billingOfficer", e.target.value)}>
                      {["Priya Rajan", "Rajan Thomas", "Anitha S", "Sreedev Kumar", "Meera V"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>Notes</label>
                    <input type="text" placeholder="Any additional billing notes" value={invoiceForm.notes} onChange={(e) => handleInvoiceFormChange("notes", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="hosp-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="hosp-btn-submit" disabled={submitting}>
                  <FaCheckCircle /> {submitting ? "Generating…" : "Generate & Issue Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
