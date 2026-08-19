import React, { useState, useMemo } from "react";
import {
  FaFileInvoiceDollar,
  FaSearch,
  FaFilter,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaCheck,
  FaEye,
  FaPrint,
  FaHospital,
  FaUserInjured,
  FaMoneyBillWave,
  FaReceipt,
  FaCalendarAlt,
  FaCreditCard,
  FaExclamationCircle,
  FaBan,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./BillingManagement.css";

// Realistic initial Invoices spanning all supported services and statuses
const initialInvoices = [
  {
    id: "INV-2026-0811",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    patientAge: 52,
    patientGender: "Male",
    patientPhone: "+91 94471 23456",
    patientEmail: "ramesh.kumar@example.com",
    service: "Hospital Treatment",
    invoiceDate: "Aug 18, 2026",
    dueDate: "Aug 25, 2026",
    paymentMethod: "Insurance / TPA",
    status: "Pending",
    items: [
      { description: "ICU Bed Stay (3 Days)", service: "Hospital Treatment", quantity: 3, unitPrice: 8500, amount: 25500 },
      { description: "Cardiac Monitoring & Critical Care", service: "Hospital Treatment", quantity: 1, unitPrice: 12000, amount: 12000 },
      { description: "Specialist Physician Rounds", service: "Consultation", quantity: 3, unitPrice: 1500, amount: 4500 },
      { description: "Post-op Medications & IV Fluids", service: "Medicine / Pharmacy", quantity: 1, unitPrice: 3500, amount: 3500 },
    ],
    tax: 0,
    discount: 0,
  },
  {
    id: "INV-2026-0812",
    patientName: "Sonia Sebastian",
    patientId: "PAT-4092",
    patientAge: 29,
    patientGender: "Female",
    patientPhone: "+91 94471 23457",
    patientEmail: "sonia.s@example.com",
    service: "Hospital Treatment",
    invoiceDate: "Aug 17, 2026",
    dueDate: "Aug 24, 2026",
    paymentMethod: "Credit Card (HDFC)",
    status: "Paid",
    items: [
      { description: "General Ward Bed Charges (2 Days)", service: "Hospital Treatment", quantity: 2, unitPrice: 3500, amount: 7000 },
      { description: "Laparoscopic Appendectomy Charges", service: "Hospital Treatment", quantity: 1, unitPrice: 22000, amount: 22000 },
      { description: "Nursing & Sanitation Charges", service: "Other Hospital Services", quantity: 1, unitPrice: 2500, amount: 2500 },
    ],
    tax: 0,
    discount: 1500,
  },
  {
    id: "INV-2026-0813",
    patientName: "Thomas Kurian",
    patientId: "PAT-4095",
    patientAge: 35,
    patientGender: "Male",
    patientPhone: "+91 94471 23460",
    patientEmail: "thomas.k@example.com",
    service: "Consultation",
    invoiceDate: "Aug 18, 2026",
    dueDate: "Aug 18, 2026",
    paymentMethod: "UPI (Google Pay)",
    status: "Paid",
    items: [
      { description: "Senior Dermatologist Specialist Consultation", service: "Consultation", quantity: 1, unitPrice: 1200, amount: 1200 },
      { description: "Clinical Diagnostic Dermoscopy", service: "Other Hospital Services", quantity: 1, unitPrice: 800, amount: 800 },
    ],
    tax: 0,
    discount: 0,
  },
  {
    id: "INV-2026-0814",
    patientName: "Leela Mathews",
    patientId: "PAT-4096",
    patientAge: 72,
    patientGender: "Female",
    patientPhone: "+91 94471 23461",
    patientEmail: "leela.m@example.com",
    service: "Lab Test",
    invoiceDate: "Aug 19, 2026",
    dueDate: "Aug 26, 2026",
    paymentMethod: "Pending Selection",
    status: "Pending",
    items: [
      { description: "Complete Blood Count (CBC) Profile", service: "Lab Test", quantity: 1, unitPrice: 650, amount: 650 },
      { description: "High-Resolution Chest CT Scan", service: "Lab Test", quantity: 1, unitPrice: 3800, amount: 3800 },
      { description: "Serum Electrolytes & Renal Panel", service: "Lab Test", quantity: 1, unitPrice: 950, amount: 950 },
    ],
    tax: 0,
    discount: 0,
  },
  {
    id: "INV-2026-0815",
    patientName: "Mohan Lal",
    patientId: "PAT-4093",
    patientAge: 64,
    patientGender: "Male",
    patientPhone: "+91 94471 23458",
    patientEmail: "mohan.lal@example.com",
    service: "Hospital Treatment",
    invoiceDate: "Aug 16, 2026",
    dueDate: "Aug 23, 2026",
    paymentMethod: "Net Banking (SBI)",
    status: "Partially Paid",
    items: [
      { description: "Private Deluxe Cabin Stay (4 Days)", service: "Hospital Treatment", quantity: 4, unitPrice: 6500, amount: 26000 },
      { description: "Cardiac Wellness & Dietary Plan", service: "Other Hospital Services", quantity: 1, unitPrice: 4500, amount: 4500 },
      { description: "Cardiologist Consultation Rounds", service: "Consultation", quantity: 4, unitPrice: 1500, amount: 6000 },
    ],
    tax: 0,
    discount: 2000,
  },
  {
    id: "INV-2026-0816",
    patientName: "Aparna Nair",
    patientId: "PAT-4094",
    patientAge: 41,
    patientGender: "Female",
    patientPhone: "+91 94471 23459",
    patientEmail: "aparna.nair@example.com",
    service: "Medicine / Pharmacy",
    invoiceDate: "Aug 17, 2026",
    dueDate: "Aug 17, 2026",
    paymentMethod: "Cash",
    status: "Paid",
    items: [
      { description: "Amoxicillin 500mg (20 Caps)", service: "Medicine / Pharmacy", quantity: 2, unitPrice: 180, amount: 360 },
      { description: "Cetirizine 10mg (30 Tabs)", service: "Medicine / Pharmacy", quantity: 3, unitPrice: 65, amount: 195 },
      { description: "Montelukast 10mg Strip", service: "Medicine / Pharmacy", quantity: 1, unitPrice: 220, amount: 220 },
      { description: "Saline Nasal Spray 50ml", service: "Medicine / Pharmacy", quantity: 1, unitPrice: 145, amount: 145 },
    ],
    tax: 0,
    discount: 0,
  },
  {
    id: "INV-2026-0817",
    patientName: "John Wesley",
    patientId: "PAT-4090",
    patientAge: 46,
    patientGender: "Male",
    patientPhone: "+91 94471 23465",
    patientEmail: "john.w@example.com",
    service: "Lab Test",
    invoiceDate: "Aug 15, 2026",
    dueDate: "Aug 20, 2026",
    paymentMethod: "Cancelled Requisition",
    status: "Cancelled",
    items: [
      { description: "HbA1c & Fasting Glucose Screening", service: "Lab Test", quantity: 1, unitPrice: 850, amount: 850 },
      { description: "Lipid Profile Diagnostic Panel", service: "Lab Test", quantity: 1, unitPrice: 950, amount: 950 },
    ],
    tax: 0,
    discount: 0,
  },
  {
    id: "INV-2026-0818",
    patientName: "Deepak Menon",
    patientId: "PAT-4110",
    patientAge: 55,
    patientGender: "Male",
    patientPhone: "+91 94471 23470",
    patientEmail: "deepak.m@example.com",
    service: "Other Hospital Services",
    invoiceDate: "Aug 19, 2026",
    dueDate: "Aug 26, 2026",
    paymentMethod: "Pending",
    status: "Pending",
    items: [
      { description: "Physical Therapy & Rehabilitation (5 Sessions)", service: "Other Hospital Services", quantity: 5, unitPrice: 1200, amount: 6000 },
      { description: "Neuro Rehabilitation Consultation", service: "Consultation", quantity: 1, unitPrice: 1500, amount: 1500 },
    ],
    tax: 0,
    discount: 500,
  },
];

const SUPPORTED_SERVICES = [
  "All Services",
  "Consultation",
  "Hospital Treatment",
  "Lab Test",
  "Medicine / Pharmacy",
  "Other Hospital Services",
];

const PAYMENT_STATUSES = ["All", "Paid", "Pending", "Partially Paid", "Cancelled"];

function BillingManagement() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All Services");

  // Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Generate Bill Form State
  const [genPatName, setGenPatName] = useState("");
  const [genPatId, setGenPatId] = useState("");
  const [genService, setGenService] = useState("Consultation");
  const [genLineItems, setGenLineItems] = useState([
    { description: "Doctor Consultation Fee", service: "Consultation", quantity: 1, unitPrice: 1000, amount: 1000 },
  ]);
  const [genPaymentStatus, setGenPaymentStatus] = useState("Pending");
  const [genPaymentMethod, setGenPaymentMethod] = useState("Pending Selection");
  const [genDiscount, setGenDiscount] = useState(0);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Helper to calculate invoice total
  const getInvoiceTotal = (inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = inv.tax || 0;
    const discount = inv.discount || 0;
    return Math.max(0, subtotal + tax - discount);
  };

  // Summary Metrics calculations
  const totalBillsCount = invoices.length;
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const pendingCount = invoices.filter((i) => i.status === "Pending" || i.status === "Partially Paid").length;

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientId.toLowerCase().includes(q) ||
        inv.service.toLowerCase().includes(q);

      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      const matchService = serviceFilter === "All Services" || inv.service === serviceFilter;

      return matchSearch && matchStatus && matchService;
    });
  }, [invoices, search, statusFilter, serviceFilter]);

  // Handler: Mark as Paid
  const handleMarkAsPaid = (invId) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status: "Paid",
              paymentMethod: inv.paymentMethod.includes("Pending") ? "Direct Counter Settlement" : inv.paymentMethod,
            }
          : inv
      )
    );

    if (viewInvoice && viewInvoice.id === invId) {
      setViewInvoice((prev) => ({
        ...prev,
        status: "Paid",
        paymentMethod: prev.paymentMethod.includes("Pending") ? "Direct Counter Settlement" : prev.paymentMethod,
      }));
    }

    showToast(`Invoice ${invId} successfully marked as Paid.`);
  };

  // Handler: Print / Download Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Handler: Add line item in generate modal
  const handleAddLineItem = () => {
    setGenLineItems([
      ...genLineItems,
      { description: "", service: genService, quantity: 1, unitPrice: 500, amount: 500 },
    ]);
  };

  // Handler: Remove line item in generate modal
  const handleRemoveLineItem = (index) => {
    if (genLineItems.length > 1) {
      setGenLineItems(genLineItems.filter((_, i) => i !== index));
    }
  };

  // Handler: Update line item field
  const handleLineItemChange = (index, field, value) => {
    const updated = [...genLineItems];
    updated[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(field === "quantity" ? value : updated[index].quantity) || 0;
      const price = parseFloat(field === "unitPrice" ? value : updated[index].unitPrice) || 0;
      updated[index].amount = qty * price;
    }
    setGenLineItems(updated);
  };

  // Handler: Submit Create Bill Form
  const handleGenerateInvoiceSubmit = (e) => {
    e.preventDefault();
    if (!genPatName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    const newId = `INV-2026-${Math.floor(8020 + Math.random() * 80)}`;
    const pId = genPatId.trim() || `PAT-${Math.floor(4120 + Math.random() * 80)}`;

    const newInvoice = {
      id: newId,
      patientName: genPatName.trim(),
      patientId: pId,
      patientAge: 36,
      patientGender: "Male",
      patientPhone: "+91 94471 00000",
      patientEmail: "patient@example.com",
      service: genService,
      invoiceDate: "Aug 19, 2026",
      dueDate: "Aug 26, 2026",
      paymentMethod: genPaymentMethod,
      status: genPaymentStatus,
      items: genLineItems,
      tax: 0,
      discount: parseFloat(genDiscount) || 0,
    };

    setInvoices([newInvoice, ...invoices]);
    setShowGenerateModal(false);

    // Reset Form
    setGenPatName("");
    setGenPatId("");
    setGenService("Consultation");
    setGenLineItems([
      { description: "Doctor Consultation Fee", service: "Consultation", quantity: 1, unitPrice: 1000, amount: 1000 },
    ]);
    setGenPaymentStatus("Pending");
    setGenDiscount(0);

    showToast(`Invoice ${newId} created for ${newInvoice.patientName}`);
  };

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "hosp-bill-status-pill bill-status--paid";
      case "Pending":
        return "hosp-bill-status-pill bill-status--pending";
      case "Partially Paid":
        return "hosp-bill-status-pill bill-status--partial";
      case "Cancelled":
        return "hosp-bill-status-pill bill-status--cancelled";
      default:
        return "hosp-bill-status-pill";
    }
  };

  // Service Badge Class Helper
  const getServiceBadgeClass = (service) => {
    switch (service) {
      case "Consultation":
        return "hosp-service-pill service-consultation";
      case "Hospital Treatment":
        return "hosp-service-pill service-treatment";
      case "Lab Test":
        return "hosp-service-pill service-lab";
      case "Medicine / Pharmacy":
        return "hosp-service-pill service-pharmacy";
      case "Other Hospital Services":
      default:
        return "hosp-service-pill service-other";
    }
  };

  return (
    <div className="hosp-bill-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hosp-bill-toast" role="alert">
          <FaCheckCircle className="toast-icon-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="hosp-bill-header-banner">
        <div className="banner-info">
          <div className="banner-icon-box">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h2 className="banner-title">Hospital Billing &amp; Invoices</h2>
            <p className="banner-subtitle">
              Manage patient charges, clinical service receipts, settlement logs, and official printable invoices.
            </p>
          </div>
        </div>
        <button
          className="hosp-btn-generate-top"
          onClick={() => setShowGenerateModal(true)}
          id="btn-generate-invoice"
        >
          <FaPlus />
          <span>Generate Bill</span>
        </button>
      </div>

      {/* ── 4 SUMMARY STAT CARDS ── */}
      <section className="hosp-bill-summary-cards" aria-label="Billing summary metrics">
        {/* Total Bills */}
        <div className="hosp-stat-card card-total-bills">
          <div className="stat-card-header">
            <span className="stat-title">Total Bills</span>
            <div className="stat-icon stat-icon--total">
              <FaReceipt />
            </div>
          </div>
          <div className="stat-value">{totalBillsCount}</div>
          <div className="stat-meta">
            <span className="meta-highlight">Active Ledgers</span> across all departments
          </div>
        </div>

        {/* Paid */}
        <div className="hosp-stat-card card-paid-bills">
          <div className="stat-card-header">
            <span className="stat-title">Paid Invoices</span>
            <div className="stat-icon stat-icon--paid">
              <FaCheckCircle />
            </div>
          </div>
          <div className="stat-value text-success">{paidCount}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--success">
              {Math.round((paidCount / totalBillsCount) * 100)}% Settled
            </span>
            Fully cleared payments
          </div>
        </div>

        {/* Pending */}
        <div className="hosp-stat-card card-pending-bills">
          <div className="stat-card-header">
            <span className="stat-title">Pending Invoices</span>
            <div className="stat-icon stat-icon--pending">
              <FaExclamationCircle />
            </div>
          </div>
          <div className="stat-value text-amber">{pendingCount}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--pending">Outstanding</span>
            Awaiting clearance
          </div>
        </div>

        {/* Total Revenue */}
        <div className="hosp-stat-card card-total-revenue">
          <div className="stat-card-header">
            <span className="stat-title">Total Revenue</span>
            <div className="stat-icon stat-icon--revenue">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="stat-value text-primary-color">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--revenue">Settled Revenue</span>
            Financial year 2026
          </div>
        </div>
      </section>

      {/* ── CONTROLS PANEL: STATUS TABS, SERVICE FILTER & SEARCH ── */}
      <div className="hosp-bill-control-panel hosp-card">
        {/* Payment Status Tabs */}
        <div className="hosp-bill-status-tabs" role="tablist">
          {PAYMENT_STATUSES.map((status) => {
            const count =
              status === "All"
                ? invoices.length
                : invoices.filter((i) => i.status === status).length;
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                role="tab"
                aria-selected={isActive}
                className={`bill-status-tab-btn ${isActive ? "bill-status-tab-btn--active" : ""}`}
                onClick={() => setStatusFilter(status)}
              >
                <span>{status === "All" ? "All Invoices" : status}</span>
                <span className="tab-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Service Filter Row */}
        <div className="hosp-bill-filters-row">
          <div className="hosp-bill-search-box">
            <FaSearch className="hosp-search-icon" />
            <input
              type="text"
              placeholder="Search by Invoice ID, Patient Name, Patient ID, or Service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search invoices"
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

          <div className="hosp-bill-filter-select">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              aria-label="Filter by Service"
            >
              {SUPPORTED_SERVICES.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── BILLING & INVOICES TABLE SECTION ── */}
      <div className="hosp-card hosp-bill-table-card">
        <div className="hosp-table-header-bar">
          <div>
            <h3 className="hosp-card-title" style={{ marginBottom: "0.2rem" }}>
              Hospital Billing Register
            </h3>
            <p className="table-subtitle">
              Showing {filteredInvoices.length} of {invoices.length} billing records
            </p>
          </div>
        </div>

        <div className="hosp-table-wrapper">
          <table className="hosp-table hosp-bill-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Service</th>
                <th>Invoice Date</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const grandTotal = getInvoiceTotal(inv);
                  return (
                    <tr key={inv.id} className="bill-table-row">
                      {/* Invoice ID */}
                      <td>
                        <div className="bill-id-cell">
                          <FaReceipt className="bill-id-icon" />
                          <span className="bill-id-text">{inv.id}</span>
                        </div>
                      </td>

                      {/* Patient Name */}
                      <td>
                        <span className="hosp-pat-name">{inv.patientName}</span>
                      </td>

                      {/* Patient ID */}
                      <td>
                        <span className="hosp-pat-id">{inv.patientId}</span>
                      </td>

                      {/* Service */}
                      <td>
                        <span className={getServiceBadgeClass(inv.service)}>
                          {inv.service}
                        </span>
                      </td>

                      {/* Invoice Date */}
                      <td>
                        <div className="bill-date-cell">
                          <FaCalendarAlt className="mini-icon text-muted" />
                          <span>{inv.invoiceDate}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <span className="bill-amount-text font-bold">
                          ₹{grandTotal.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={getStatusBadge(inv.status)}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="hosp-bill-actions-cell">
                          {/* View Invoice */}
                          <button
                            className="hosp-bill-btn btn-view-invoice"
                            onClick={() => setViewInvoice(inv)}
                            title="View Invoice Receipt"
                          >
                            <FaEye />
                            <span>View</span>
                          </button>

                          {/* Mark as Paid (if not Paid/Cancelled) */}
                          {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                            <button
                              className="hosp-bill-btn btn-mark-paid"
                              onClick={() => handleMarkAsPaid(inv.id)}
                              title="Mark as Paid"
                            >
                              <FaCheck />
                              <span>Mark Paid</span>
                            </button>
                          )}

                          {/* Download / Print Invoice */}
                          <button
                            className="hosp-bill-btn btn-print-invoice"
                            onClick={() => {
                              setViewInvoice(inv);
                              setTimeout(() => window.print(), 300);
                            }}
                            title="Print / Download Invoice"
                          >
                            <FaPrint />
                            <span>Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="hosp-table-empty">
                    <FaFileInvoiceDollar className="empty-icon" />
                    <h3>No matching invoices found</h3>
                    <p>Try adjusting your search keywords, payment status tabs, or service category filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: VIEW INVOICE (OFFICIAL RECEIPT FORMAT) ── */}
      {viewInvoice && (
        <div className="hosp-modal-overlay" onClick={() => setViewInvoice(null)}>
          <div
            className="hosp-modal hosp-invoice-view-modal printable-invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Controls (hidden in print) */}
            <div className="hosp-modal-header no-print">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <div>
                  <h2>Hospital Tax Invoice</h2>
                  <span className="modal-ref-id">{viewInvoice.id}</span>
                </div>
              </div>
              <div className="modal-header-btns">
                <button
                  className="hosp-btn-print-action"
                  onClick={handlePrintInvoice}
                  title="Print / Save PDF"
                >
                  <FaPrint /> Print / PDF
                </button>
                <button
                  className="hosp-modal-close"
                  onClick={() => setViewInvoice(null)}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="invoice-sheet" id="printable-invoice-sheet">
              {/* Top Hospital Header */}
              <div className="invoice-hospital-header">
                <div className="hosp-brand-block">
                  <div className="hosp-logo-square">
                    <FaHospital />
                  </div>
                  <div>
                    <h3 className="hosp-invoice-name">City General Hospital</h3>
                    <p className="hosp-invoice-sub">NABH Accredited Tertiary Healthcare Center</p>
                    <span className="hosp-reg-code">Reg No: #REG-HOSP-2024-5021 | GSTIN: 32AABCC8901D1ZF</span>
                  </div>
                </div>
                <div className="invoice-title-block">
                  <span className="invoice-badge-title">OFFICIAL TAX INVOICE</span>
                  <p className="invoice-num-text">{viewInvoice.id}</p>
                  <span className={getStatusBadge(viewInvoice.status)}>{viewInvoice.status}</span>
                </div>
              </div>

              <div className="invoice-divider" />

              {/* Two-Column Patient & Invoice Meta Information */}
              <div className="invoice-meta-row">
                {/* Billed To / Patient Info */}
                <div className="invoice-meta-col">
                  <span className="meta-section-label">Billed To (Patient):</span>
                  <h4 className="meta-patient-name">{viewInvoice.patientName}</h4>
                  <div className="meta-patient-details">
                    <p><strong>Patient ID:</strong> <span className="hosp-pat-id">{viewInvoice.patientId}</span></p>
                    <p><strong>Demographics:</strong> {viewInvoice.patientGender}, {viewInvoice.patientAge} years</p>
                    <p><strong>Contact:</strong> {viewInvoice.patientPhone}</p>
                  </div>
                </div>

                {/* Invoice Timing & Payment Info */}
                <div className="invoice-meta-col text-right">
                  <span className="meta-section-label">Invoice Details:</span>
                  <div className="meta-patient-details" style={{ marginTop: "0.4rem" }}>
                    <p><strong>Invoice Date:</strong> {viewInvoice.invoiceDate}</p>
                    <p><strong>Payment Terms:</strong> Immediate / Due on {viewInvoice.dueDate}</p>
                    <p><strong>Primary Service:</strong> {viewInvoice.service}</p>
                    <p><strong>Payment Mode:</strong> {viewInvoice.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Itemized Services Table */}
              <div className="invoice-items-table-wrap">
                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Service / Item Description</th>
                      <th>Category</th>
                      <th style={{ textAlign: "center" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Unit Price (₹)</th>
                      <th style={{ textAlign: "right" }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="font-bold">{item.description}</td>
                        <td>
                          <span className={getServiceBadgeClass(item.service)}>
                            {item.service}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>₹{item.unitPrice.toLocaleString("en-IN")}</td>
                        <td style={{ textAlign: "right", fontWeight: "700" }}>
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Calculations / Total Summary */}
              <div className="invoice-summary-section">
                <div className="invoice-notes-block">
                  <span className="notes-label">Payment &amp; Settlement Remarks:</span>
                  <p className="notes-text">
                    This is a computer-generated official hospital billing invoice from MedicoBridge Hospital Portal.
                    {viewInvoice.status === "Paid"
                      ? " Payment has been settled in full. Thank you."
                      : " Payment is pending clearance. Please settle before the scheduled due date."}
                  </p>
                </div>

                <div className="invoice-calculations-card">
                  <div className="calc-row">
                    <span className="calc-label">Subtotal:</span>
                    <span className="calc-val">
                      ₹{viewInvoice.items.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {viewInvoice.discount > 0 && (
                    <div className="calc-row text-success">
                      <span className="calc-label">Discount Applied:</span>
                      <span className="calc-val">-₹{viewInvoice.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="calc-row">
                    <span className="calc-label">GST / Healthcare Tax (0% Exempt):</span>
                    <span className="calc-val">₹0</span>
                  </div>
                  <div className="calc-row grand-total-row">
                    <span className="calc-label">Total Amount Due:</span>
                    <span className="calc-val-grand">₹{getInvoiceTotal(viewInvoice).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer / Signatures */}
              <div className="invoice-footer-sign">
                <div>
                  <p className="footer-addr">Medical Center Road, City General Campus, Kochi, Kerala</p>
                  <p className="footer-contact">Ph: +91 484 288 0000 | Email: billing@citygeneralhospital.com</p>
                </div>
                <div className="authorized-sign-box">
                  <div className="sign-line" />
                  <span className="sign-label">Authorized Billing Officer</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions (hidden in print) */}
            <div className="hosp-modal-actions no-print" style={{ padding: "1rem 1.5rem" }}>
              {viewInvoice.status !== "Paid" && viewInvoice.status !== "Cancelled" && (
                <button
                  type="button"
                  className="hosp-btn-submit"
                  onClick={() => handleMarkAsPaid(viewInvoice.id)}
                >
                  <FaCheck />
                  <span>Mark as Paid</span>
                </button>
              )}
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setViewInvoice(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: GENERATE NEW HOSPITAL BILL ── */}
      {showGenerateModal && (
        <div className="hosp-modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="hosp-modal hosp-bill-generate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <h2>Generate Patient Bill &amp; Invoice</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setShowGenerateModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoiceSubmit} className="hosp-modal-form">
              {/* Patient Details */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={genPatName}
                    onChange={(e) => setGenPatName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PAT-4091"
                    value={genPatId}
                    onChange={(e) => setGenPatId(e.target.value)}
                  />
                </div>
              </div>

              {/* Service Category & Payment Method */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Primary Service Category</label>
                  <select
                    value={genService}
                    onChange={(e) => setGenService(e.target.value)}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Hospital Treatment">Hospital Treatment</option>
                    <option value="Lab Test">Lab Test</option>
                    <option value="Medicine / Pharmacy">Medicine / Pharmacy</option>
                    <option value="Other Hospital Services">Other Hospital Services</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Initial Payment Status</label>
                  <select
                    value={genPaymentStatus}
                    onChange={(e) => setGenPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="form-group">
                <div className="line-items-header">
                  <label>Itemized Services &amp; Charges</label>
                  <button
                    type="button"
                    className="btn-add-line-item"
                    onClick={handleAddLineItem}
                  >
                    <FaPlus /> Add Line Item
                  </button>
                </div>

                <div className="line-items-list">
                  {genLineItems.map((item, idx) => (
                    <div key={idx} className="line-item-row">
                      <div className="line-item-desc">
                        <input
                          type="text"
                          placeholder="Service / Item description..."
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                          required
                        />
                      </div>
                      <div className="line-item-qty">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                          required
                        />
                      </div>
                      <div className="line-item-price">
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleLineItemChange(idx, "unitPrice", e.target.value)}
                          required
                        />
                      </div>
                      <div className="line-item-total">
                        <span>₹{item.amount.toLocaleString("en-IN")}</span>
                      </div>
                      {genLineItems.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-line-item"
                          onClick={() => handleRemoveLineItem(idx)}
                          title="Remove Item"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Strip in Modal */}
              <div className="gen-total-strip">
                <span>Calculated Invoice Total:</span>
                <span className="gen-total-amount">
                  ₹{genLineItems.reduce((s, i) => s + i.amount, 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaCheckCircle />
                  <span>Generate &amp; Issue Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingManagement;
