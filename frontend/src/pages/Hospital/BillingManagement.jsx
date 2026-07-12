import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaFileInvoiceDollar,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaCheck,
} from "react-icons/fa";
import "./BillingManagement.css";

const initialInvoices = [
  {
    id: "INV-3011",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    type: "Admission / ICU",
    amount: "₹45,500",
    date: "July 12, 2026",
    status: "Pending",
  },
  {
    id: "INV-3012",
    patientName: "Sonia Sebastian",
    patientId: "PAT-4092",
    type: "Admission / Ward",
    amount: "₹18,200",
    date: "July 12, 2026",
    status: "Paid",
  },
  {
    id: "INV-3013",
    patientName: "Thomas Kurian",
    patientId: "PAT-4095",
    type: "Consultation",
    amount: "₹1,500",
    date: "July 11, 2026",
    status: "Paid",
  },
  {
    id: "INV-3014",
    patientName: "Leela Mathews",
    patientId: "PAT-4096",
    type: "Lab Testing Panel",
    amount: "₹3,400",
    date: "July 10, 2026",
    status: "Unpaid",
  },
];

function BillingManagement() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [patId, setPatId] = useState("");
  const [patName, setPatName] = useState("");
  const [billType, setBillType] = useState("Consultation");
  const [roomFee, setRoomFee] = useState("");
  const [treatmentFee, setTreatmentFee] = useState("");
  const [medicineFee, setMedicineFee] = useState("");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!patId || !patName) return;

    const total =
      (parseFloat(roomFee) || 0) +
      (parseFloat(treatmentFee) || 0) +
      (parseFloat(medicineFee) || 0);

    const newInv = {
      id: `INV-${Math.floor(3000 + Math.random() * 9000)}`,
      patientName: patName,
      patientId: patId,
      type: billType,
      amount: `₹${total.toLocaleString("en-IN")}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      status: "Pending",
    };

    setInvoices([newInv, ...invoices]);
    setShowAddModal(false);

    // Reset Form
    setPatId("");
    setPatName("");
    setRoomFee("");
    setTreatmentFee("");
    setMedicineFee("");
  };

  const handleMarkPaid = (id) => {
    setInvoices(
      invoices.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );
  };

  return (
    <div className="hosp-bill-page">
      {/* Controls */}
      <div className="hosp-bill-controls">
        <div className="hosp-bill-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search invoices by patient name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-bill-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <button className="hosp-btn-add" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Generate Bill
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="hosp-card hosp-bill-card">
        <div className="hosp-table-wrapper">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient Details</th>
                <th>Service Type</th>
                <th>Amount Due</th>
                <th>Generated Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="hosp-table-empty">
                    <FaFileInvoiceDollar className="empty-icon" />
                    <h3>No invoices found</h3>
                    <p>Adjust your search query or generate a new bill.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="hosp-bill-id-badge">{inv.id}</span>
                    </td>
                    <td>
                      <div className="hosp-bill-pat-col">
                        <span className="hosp-bill-pat-name">{inv.patientName}</span>
                        <span className="hosp-bill-pat-id">{inv.patientId}</span>
                      </div>
                    </td>
                    <td>{inv.type}</td>
                    <td>
                      <span className="hosp-bill-amount">{inv.amount}</span>
                    </td>
                    <td>{inv.date}</td>
                    <td>
                      <span className={`hosp-bill-status status--${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.status !== "Paid" ? (
                        <button
                          className="hosp-btn-pay"
                          onClick={() => handleMarkPaid(inv.id)}
                        >
                          <FaCheck /> Mark Paid
                        </button>
                      ) : (
                        <span className="hosp-bill-settled">Settled</span>
                      )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Generation Modal */}
      {showAddModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>Generate Hospital Invoice</h2>
              <button className="hosp-modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="hosp-modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PAT-4091"
                    value={patId}
                    onChange={(e) => setPatId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Billing Service / Category</label>
                <select value={billType} onChange={(e) => setBillType(e.target.value)}>
                  <option value="Consultation">Doctor Consultation</option>
                  <option value="Admission / ICU">ICU Admission Fees</option>
                  <option value="Admission / Ward">General Ward Bed Allocation</option>
                  <option value="Lab Testing Panel">Clinical Lab Panel</option>
                  <option value="Surgery charges">OR &amp; Surgery charges</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Room / Ward Fees (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={roomFee}
                    onChange={(e) => setRoomFee(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label>Treatment / Consultation (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={treatmentFee}
                    onChange={(e) => setTreatmentFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Pharmacy Dispensary / Medicines (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={medicineFee}
                  onChange={(e) => setMedicineFee(e.target.value)}
                />
              </div>

              <button type="submit" className="hosp-btn-submit">
                <FaCheckCircle /> Finalize &amp; Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingManagement;
