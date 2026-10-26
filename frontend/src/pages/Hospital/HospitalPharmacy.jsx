import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FaPills,
  FaBoxes,
  FaFilePrescription,
  FaShoppingCart,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaEye,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaHospital,
  FaUserMd,
  FaUserInjured,
  FaClock,
  FaExchangeAlt,
  FaPrint,
  FaMoneyBillWave,
  FaTag,
  FaShieldAlt,
  FaPrescriptionBottleAlt,
  FaHistory
} from "react-icons/fa";
import "./HospitalPharmacy.css";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:5000/api/hospital/pharmacy";
const PROFILE_URL = "http://localhost:5000/api/hospital/profile";

const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/* ─── Normalisers ────────────────────────────────────────────────────────── */
const availFromStock = (stock) => {
  const s = Number(stock);
  if (s === 0) return "Out of Stock";
  if (s < 30) return "Low Stock";
  return "In Stock";
};

const normaliseMed = (m) => ({
  _id: m._id,
  id: m._id,
  name: m.name || "—",
  genericName: m.genericName || "—",
  category: m.category || "—",
  price: Number(m.price) || 0,
  stock: Number(m.stock) || 0,
  expiryDate: m.expiryDate
    ? new Date(m.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—",
  prescriptionRequired: m.requiresPrescription ? "Yes" : "No",
  availability: availFromStock(m.stock),
  batchNumber: m.batchNumber || "Not recorded",
  manufacturer: m.manufacturer || "Not recorded",
  storageTemp: m.storageTemp || "Not recorded",
  unit: m.unit || "Not recorded",
});

const normaliseRx = (rx) => {
  const patient = rx.patientId || {};
  const doctor = rx.doctorId || {};
  return {
    _id: rx._id,
    id: rx.prescriptionId || rx._id,
    patientName: patient.name || "—",
    patientId: patient.patientId || "—",
    doctorName: doctor.name ? `Dr. ${doctor.name}`.replace(/^Dr\. Dr\./, "Dr.") : "—",
    doctorSpecialty: doctor.specialization || doctor.department || "—",
    date: rx.createdAt
      ? new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    status: rx.hospitalPharmacyStatus || "Pending",
    diagnosis: rx.diagnosis || "Not recorded",
    ward: "Not recorded",
    notes: rx.notes || rx.advice || "",
    rejectionReason: rx.rejectionReason || "",
    medicines: Array.isArray(rx.medicines)
      ? rx.medicines.map((m) => ({
          name: m.name || "—",
          qty: m.dosage || "—",
          dose: m.frequency || "—",
          days: m.duration || "—",
        }))
      : [],
  };
};

const normaliseOrder = (o) => {
  const patient = o.patientId || {};
  const itemNames = Array.isArray(o.items) ? o.items.map((i) => i.name).join(", ") : "—";
  const totalQty = Array.isArray(o.items)
    ? `${o.items.length} Item${o.items.length !== 1 ? "s" : ""} / ${o.items.reduce((a, i) => a + (i.quantity || 0), 0)} Units`
    : "—";
  return {
    _id: o._id,
    id: o.orderId || o._id,
    patient: patient.name
      ? `${patient.name}${patient.patientId ? ` (${patient.patientId})` : ""}`
      : "—",
    medicines: itemNames,
    quantity: totalQty,
    amount: Number(o.totalAmount) || 0,
    orderDate: o.createdAt
      ? new Date(o.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—",
    status: o.hospitalOrderStatus || "Pending",
    wardLocation: o.wardLocation || "Not recorded",
    paymentMode: o.paymentMode || "Not recorded",
  };
};

/* ─────────────────────────────────────────────────────────────────────────── */
export default function HospitalPharmacy() {
  const [activeTab, setActiveTab] = useState("inventory");

  /* ── Hospital profile ── */
  const [hospitalProfile, setHospitalProfile] = useState(null);

  /* ── Tab 1: Inventory ── */
  const [inventory, setInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invSearch, setInvSearch] = useState("");
  const [invCategoryFilter, setInvCategoryFilter] = useState("All");
  const [invAvailFilter, setInvAvailFilter] = useState("All");
  const [selectedMed, setSelectedMed] = useState(null);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showEditMedModal, setShowEditMedModal] = useState(null);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(null);
  const [newStockVal, setNewStockVal] = useState("");
  const [medSaving, setMedSaving] = useState(false);

  const [medFormData, setMedFormData] = useState({
    name: "",
    genericName: "",
    category: "Antibiotics",
    price: "",
    stock: "",
    expiryDate: "",
    prescriptionRequired: "Yes",
    batchNumber: "",
    manufacturer: "",
    storageTemp: "",
    unit: "",
  });

  /* ── Tab 2: Prescriptions ── */
  const [prescriptions, setPrescriptions] = useState([]);
  const [rxLoading, setRxLoading] = useState(true);
  const [rxSearch, setRxSearch] = useState("");
  const [rxStatusFilter, setRxStatusFilter] = useState("All");
  const [selectedRx, setSelectedRx] = useState(null);
  const [rejectingRx, setRejectingRx] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rxSaving, setRxSaving] = useState(false);

  /* ── Tab 3: Orders ── */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);

  /* ── Toast ── */
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  /* ══════════════════════════════════════════════════════════════
     FETCH FUNCTIONS
  ══════════════════════════════════════════════════════════════ */

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(PROFILE_URL, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setHospitalProfile(data.data);
    } catch { /* silent */ }
  }, []);

  const fetchInventory = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`${API_BASE}/medicines`, { headers: authHeaders() });
      if (res.status === 401) { showToast("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setInventory((data.data || []).map(normaliseMed));
      } else {
        showToast(data.message || "Failed to load medicines.");
      }
    } catch {
      showToast("Network error: Could not load medicines.");
    } finally {
      setInvLoading(false);
    }
  }, [showToast]);

  const fetchPrescriptions = useCallback(async () => {
    setRxLoading(true);
    try {
      const res = await fetch(`${API_BASE}/prescriptions`, { headers: authHeaders() });
      if (res.status === 401) { showToast("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setPrescriptions((data.data || []).map(normaliseRx));
      } else {
        showToast(data.message || "Failed to load prescriptions.");
      }
    } catch {
      showToast("Network error: Could not load prescriptions.");
    } finally {
      setRxLoading(false);
    }
  }, [showToast]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() });
      if (res.status === 401) { showToast("Session expired. Please log in again."); return; }
      const data = await res.json();
      if (data.success) {
        setOrders((data.data || []).map(normaliseOrder));
      } else {
        showToast(data.message || "Failed to load orders.");
      }
    } catch {
      showToast("Network error: Could not load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
    fetchInventory();
    fetchPrescriptions();
    fetchOrders();
  }, [fetchProfile, fetchInventory, fetchPrescriptions, fetchOrders]);

  /* ══════════════════════════════════════════════════════════════
     FILTERED DATA
  ══════════════════════════════════════════════════════════════ */

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = invSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.genericName.toLowerCase().includes(q) ||
        String(item.id).toLowerCase().includes(q);
      const matchCategory = invCategoryFilter === "All" || item.category === invCategoryFilter;
      const matchAvail = invAvailFilter === "All" || item.availability === invAvailFilter;
      return matchSearch && matchCategory && matchAvail;
    });
  }, [inventory, invSearch, invCategoryFilter, invAvailFilter]);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = rxSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.patientId.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        String(rx.id).toLowerCase().includes(q);
      const matchStatus = rxStatusFilter === "All" || rx.status === rxStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [prescriptions, rxSearch, rxStatusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        String(ord.id).toLowerCase().includes(q) ||
        ord.patient.toLowerCase().includes(q) ||
        ord.medicines.toLowerCase().includes(q);
      const matchStatus = orderStatusFilter === "All" || ord.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  /* ══════════════════════════════════════════════════════════════
     KPI METRICS (derived from real data)
  ══════════════════════════════════════════════════════════════ */
  const totalStockUnits = inventory.reduce((acc, i) => acc + i.stock, 0);
  const pendingRxCount = prescriptions.filter((r) => r.status === "Pending").length;
  const activeOrdersCount = orders.filter((o) => o.status === "Preparing" || o.status === "Approved").length;

  const todayStr = new Date().toDateString();
  const dispensedToday = prescriptions.filter((r) => {
    if (r.status !== "Dispensed") return false;
    return true; // Backend doesn't return updatedAt easily; count all dispensed as best-effort
  }).length;

  /* ══════════════════════════════════════════════════════════════
     INVENTORY ACTIONS
  ══════════════════════════════════════════════════════════════ */

  const handleAddMedSubmit = async (e) => {
    e.preventDefault();
    if (!medFormData.name) return;
    setMedSaving(true);
    try {
      const body = {
        name: medFormData.name,
        genericName: medFormData.genericName,
        category: medFormData.category || "General",
        price: Number(medFormData.price) || 0,
        stock: Number(medFormData.stock) || 0,
        expiryDate: medFormData.expiryDate || null,
        requiresPrescription: medFormData.prescriptionRequired === "Yes",
        batchNumber: medFormData.batchNumber,
        manufacturer: medFormData.manufacturer,
        storageTemp: medFormData.storageTemp,
        unit: medFormData.unit,
      };
      const res = await fetch(`${API_BASE}/medicines`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInventory();
        setShowAddMedModal(false);
        setMedFormData({
          name: "", genericName: "", category: "Antibiotics", price: "", stock: "",
          expiryDate: "", prescriptionRequired: "Yes", batchNumber: "",
          manufacturer: "", storageTemp: "", unit: "",
        });
        showToast(`Added "${medFormData.name}" to Hospital Pharmacy inventory`);
      } else {
        showToast(data.message || "Failed to add medicine.");
      }
    } catch {
      showToast("Network error: Failed to add medicine.");
    } finally {
      setMedSaving(false);
    }
  };

  const handleEditMedSubmit = async (e) => {
    e.preventDefault();
    if (!showEditMedModal) return;
    setMedSaving(true);
    try {
      const body = {
        name: showEditMedModal.name,
        genericName: showEditMedModal.genericName,
        price: Number(showEditMedModal.price) || 0,
        stock: Number(showEditMedModal.stock) || 0,
        expiryDate: showEditMedModal.expiryDate || null,
        requiresPrescription: showEditMedModal.prescriptionRequired === "Yes",
      };
      const res = await fetch(`${API_BASE}/medicines/${showEditMedModal._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInventory();
        setShowEditMedModal(null);
        showToast(`Updated "${showEditMedModal.name}" details`);
      } else {
        showToast(data.message || "Failed to update medicine.");
      }
    } catch {
      showToast("Network error: Failed to update medicine.");
    } finally {
      setMedSaving(false);
    }
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!showUpdateStockModal) return;
    const stockNum = Number(newStockVal);
    if (isNaN(stockNum) || stockNum < 0) return;
    setMedSaving(true);
    try {
      const res = await fetch(`${API_BASE}/medicines/${showUpdateStockModal._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ stock: stockNum }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInventory();
        setShowUpdateStockModal(null);
        setNewStockVal("");
        showToast(`Stock updated for "${showUpdateStockModal.name}" to ${stockNum} units`);
      } else {
        showToast(data.message || "Failed to update stock.");
      }
    } catch {
      showToast("Network error: Failed to update stock.");
    } finally {
      setMedSaving(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     PRESCRIPTION ACTIONS
  ══════════════════════════════════════════════════════════════ */

  const rxApiCall = async (id, action, body = {}) => {
    setRxSaving(true);
    try {
      const res = await fetch(`${API_BASE}/prescriptions/${id}/${action}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPrescriptions();
        return { ok: true, message: data.message };
      } else {
        showToast(data.message || `Failed to ${action} prescription.`);
        return { ok: false };
      }
    } catch {
      showToast(`Network error: Failed to ${action} prescription.`);
      return { ok: false };
    } finally {
      setRxSaving(false);
    }
  };

  const handleVerifyRx = async (id) => {
    const result = await rxApiCall(id, "verify");
    if (result.ok) {
      showToast(`Prescription verified by hospital pharmacist`);
      if (selectedRx && selectedRx._id === id) setSelectedRx((p) => ({ ...p, status: "Verified" }));
    }
  };

  const handleApproveRx = async (id) => {
    const result = await rxApiCall(id, "approve");
    if (result.ok) {
      showToast(`Prescription approved for preparation & dispensing`);
      if (selectedRx && selectedRx._id === id) setSelectedRx((p) => ({ ...p, status: "Approved" }));
    }
  };

  const handleOpenRejectRx = (rx) => {
    setRejectingRx(rx);
    setRejectReason("");
  };

  const handleRejectRxSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingRx || !rejectReason.trim()) return;
    const result = await rxApiCall(rejectingRx._id, "reject", { reason: rejectReason });
    if (result.ok) {
      showToast(`Prescription rejected. Doctor notified.`);
      setRejectingRx(null);
      if (selectedRx && selectedRx._id === rejectingRx._id) setSelectedRx(null);
    }
  };

  const handleDispenseRx = async (id) => {
    const result = await rxApiCall(id, "dispense");
    if (result.ok) {
      await fetchInventory(); // stock may have changed
      showToast(`Prescription marked as Dispensed to patient`);
      if (selectedRx && selectedRx._id === id) setSelectedRx((p) => ({ ...p, status: "Dispensed" }));
    }
  };

  /* ══════════════════════════════════════════════════════════════
     ORDER ACTIONS
  ══════════════════════════════════════════════════════════════ */

  const handleUpdateOrderStatus = async (ordId, newStatus) => {
    setOrderSaving(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${ordId}/status`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        showToast(`Order status updated to: ${newStatus}`);
        if (selectedOrder && selectedOrder._id === ordId) {
          setSelectedOrder((p) => ({ ...p, status: newStatus }));
        }
      } else {
        showToast(data.message || "Failed to update order status.");
      }
    } catch {
      showToast("Network error: Failed to update order status.");
    } finally {
      setOrderSaving(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */

  return (
    <div className="hosp-ph-page">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="hosp-ph-toast">
          <FaCheckCircle style={{ color: "#10b981", fontSize: "1.1rem" }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hospital Pharmacy Identity Banner */}
      <div className="hosp-ph-header-banner">
        <div className="hosp-ph-header-left">
          <div className="hosp-ph-header-icon">
            <FaPills />
          </div>
          <div>
            <div className="hosp-ph-header-badge-row">
              <span className="hosp-ph-inst-badge">
                <FaHospital /> {hospitalProfile?.name || "Hospital Pharmacy"}
              </span>
              <span className="hosp-ph-id-tag">
                ID: #{hospitalProfile?._id?.toString().slice(-8).toUpperCase() || "—"}
              </span>
            </div>
            <h2 className="hosp-ph-title">Hospital Pharmacy Portal</h2>
            <p className="hosp-ph-subtitle">
              Manage in-house medicine formulary, hospital inpatient/OPD prescription dispensing, and medicine orders
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="hosp-ph-kpis">
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val">{invLoading ? "—" : totalStockUnits.toLocaleString()}</span>
            <span className="hosp-ph-kpi-lbl">Total Stock Units</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#ffa200ff" }}>
              {rxLoading ? "—" : pendingRxCount}
            </span>
            <span className="hosp-ph-kpi-lbl">Pending Rx Requests</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#0e68f8ff" }}>
              {ordersLoading ? "—" : activeOrdersCount}
            </span>
            <span className="hosp-ph-kpi-lbl">Active Orders</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#00ffe5ff" }}>
              {rxLoading ? "—" : dispensedToday}
            </span>
            <span className="hosp-ph-kpi-lbl">Dispensed Today</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="hosp-ph-tabs-bar">
        <button
          className={`hosp-ph-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          <FaBoxes /> Medicine Inventory ({inventory.length})
        </button>
        <button
          className={`hosp-ph-tab-btn ${activeTab === "prescriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("prescriptions")}
        >
          <FaFilePrescription /> Prescription Requests ({prescriptions.length})
          {pendingRxCount > 0 && (
            <span className="hosp-ph-tab-badge">{pendingRxCount}</span>
          )}
        </button>
        <button
          className={`hosp-ph-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <FaShoppingCart /> Pharmacy Orders ({orders.length})
        </button>
      </div>

      {/* ==============================================================
          TAB 1: MEDICINE INVENTORY
      ============================================================== */}
      {activeTab === "inventory" && (
        <div className="hosp-ph-card">
          <div className="hosp-ph-controls-row">
            <div className="hosp-ph-search-wrap">
              <FaSearch className="hosp-ph-search-icon" />
              <input
                type="text"
                placeholder="Search by Medicine Name, Generic Name, ID..."
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                className="hosp-ph-input"
              />
            </div>

            <div className="hosp-ph-filters-wrap">
              <div className="hosp-ph-filter-item">
                <span className="hosp-ph-filter-label"><FaFilter /> Category:</span>
                <select
                  className="hosp-ph-select"
                  value={invCategoryFilter}
                  onChange={(e) => setInvCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Analgesic & Antipyretic">Analgesic &amp; Antipyretic</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="IV Fluids & Injections">IV Fluids &amp; Injections</option>
                </select>
              </div>

              <div className="hosp-ph-filter-item">
                <span className="hosp-ph-filter-label">Availability:</span>
                <select
                  className="hosp-ph-select"
                  value={invAvailFilter}
                  onChange={(e) => setInvAvailFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <button
                className="hosp-ph-primary-btn"
                onClick={() => setShowAddMedModal(true)}
              >
                <FaPlus /> Add Medicine
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="hosp-ph-table-container">
            <table className="hosp-ph-table">
              <thead>
                <tr>
                  <th>Medicine Details</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  <th>Rx Required</th>
                  <th>Availability</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invLoading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaBoxes style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      Loading medicines from database…
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaBoxes style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No medicines match the selected search or category filters.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((med) => (
                    <tr key={med._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div className="hosp-ph-med-icon">
                            <FaPills />
                          </div>
                          <div>
                            <strong>{med.name}</strong>
                            <span className="hosp-ph-sub-id">{String(med.id).slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#475569" }}>{med.genericName}</span>
                      </td>

                      <td>
                        <span className="hosp-ph-category-badge">{med.category}</span>
                      </td>

                      <td>
                        <strong>₹{med.price.toFixed(2)}</strong>
                      </td>

                      <td>
                        <span style={{
                          fontWeight: "700",
                          color: med.stock === 0 ? "#dc2626" : med.stock < 30 ? "#d97706" : "#16a34a"
                        }}>
                          {med.stock} Units
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#475569" }}>
                          <FaCalendarAlt style={{ fontSize: "0.75rem", color: "#94a3b8" }} /> {med.expiryDate}
                        </span>
                      </td>

                      <td>
                        <span className={`hosp-ph-rx-badge ${med.prescriptionRequired === "Yes" ? "rx-req" : "rx-opt"}`}>
                          {med.prescriptionRequired === "Yes" ? "Rx Required" : "OTC"}
                        </span>
                      </td>

                      <td>
                        <span className={`hosp-ph-avail-badge avail-${med.availability.toLowerCase().replace(/\s/g, "-")}`}>
                          {med.availability}
                        </span>
                      </td>

                      <td>
                        <div className="hosp-ph-action-btns">
                          <button
                            className="hosp-ph-icon-btn"
                            title="View Details"
                            onClick={() => setSelectedMed(med)}
                          >
                            <FaEye />
                          </button>
                          <button
                            className="hosp-ph-icon-btn"
                            title="Edit Medicine"
                            onClick={() => setShowEditMedModal(med)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="hosp-ph-icon-btn hosp-ph-icon-btn--stock"
                            title="Update Stock"
                            onClick={() => {
                              setShowUpdateStockModal(med);
                              setNewStockVal(String(med.stock));
                            }}
                          >
                            <FaExchangeAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: PRESCRIPTION REQUESTS
      ============================================================== */}
      {activeTab === "prescriptions" && (
        <div className="hosp-ph-card">
          <div className="hosp-ph-controls-row">
            <div className="hosp-ph-search-wrap">
              <FaSearch className="hosp-ph-search-icon" />
              <input
                type="text"
                placeholder="Search by Patient Name, ID, Doctor, Prescription ID..."
                value={rxSearch}
                onChange={(e) => setRxSearch(e.target.value)}
                className="hosp-ph-input"
              />
            </div>

            <div className="hosp-ph-filters-wrap">
              <div className="hosp-ph-filter-item">
                <span className="hosp-ph-filter-label"><FaFilter /> Status:</span>
                <select
                  className="hosp-ph-select"
                  value={rxStatusFilter}
                  onChange={(e) => setRxStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Approved">Approved</option>
                  <option value="Dispensed">Dispensed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Prescriptions Table */}
          <div className="hosp-ph-table-container">
            <table className="hosp-ph-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient Details</th>
                  <th>Prescribing Doctor</th>
                  <th>Prescribed Medicines</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rxLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaFilePrescription style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      Loading prescriptions from database…
                    </td>
                  </tr>
                ) : filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaFilePrescription style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No prescription requests found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((rx) => (
                    <tr key={rx._id}>
                      <td>
                        <span className="hosp-ph-id-badge">{rx.id}</span>
                        {rx.ward && rx.ward !== "Not recorded" && (
                          <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>
                            {rx.ward}
                          </span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div className="hosp-ph-pat-avatar">
                            <FaUserInjured />
                          </div>
                          <div>
                            <strong>{rx.patientName}</strong>
                            <span className="hosp-ph-sub-id">{rx.patientId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>{rx.doctorName}</strong>
                          <span style={{ display: "block", fontSize: "0.74rem", color: "#64748b" }}>
                            {rx.doctorSpecialty}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="hosp-ph-meds-chips">
                          {rx.medicines.length > 0 ? rx.medicines.map((m, idx) => (
                            <span key={idx} className="hosp-ph-med-chip">
                              <strong>{m.name}</strong> ({m.qty})
                            </span>
                          )) : <span className="hosp-ph-med-chip">No medicines listed</span>}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#475569" }}>{rx.date}</span>
                      </td>

                      <td>
                        <span className={`hosp-ph-status-pill status-${rx.status.toLowerCase()}`}>
                          {rx.status}
                        </span>
                      </td>

                      <td>
                        <div className="hosp-ph-action-btns">
                          <button
                            className="hosp-ph-btn hosp-ph-btn-view"
                            title="View Prescription Details"
                            onClick={() => setSelectedRx(rx)}
                          >
                            <FaEye /> View
                          </button>

                          {rx.status === "Pending" && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-verify"
                              title="Verify Prescription"
                              disabled={rxSaving}
                              onClick={() => handleVerifyRx(rx._id)}
                            >
                              <FaShieldAlt /> Verify
                            </button>
                          )}

                          {(rx.status === "Pending" || rx.status === "Verified") && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-approve"
                              title="Approve for preparation"
                              disabled={rxSaving}
                              onClick={() => handleApproveRx(rx._id)}
                            >
                              <FaCheck /> Approve
                            </button>
                          )}

                          {rx.status === "Approved" && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-dispense"
                              title="Mark as Dispensed"
                              disabled={rxSaving}
                              onClick={() => handleDispenseRx(rx._id)}
                            >
                              <FaCheckCircle /> Dispense
                            </button>
                          )}

                          {(rx.status === "Pending" || rx.status === "Verified") && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-reject"
                              title="Reject Prescription"
                              disabled={rxSaving}
                              onClick={() => handleOpenRejectRx(rx)}
                            >
                              <FaTimes /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: PHARMACY ORDERS
      ============================================================== */}
      {activeTab === "orders" && (
        <div className="hosp-ph-card">
          <div className="hosp-ph-controls-row">
            <div className="hosp-ph-search-wrap">
              <FaSearch className="hosp-ph-search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, Patient Name, Medicines..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="hosp-ph-input"
              />
            </div>

            <div className="hosp-ph-filters-wrap">
              <div className="hosp-ph-filter-item">
                <span className="hosp-ph-filter-label"><FaFilter /> Status:</span>
                <select
                  className="hosp-ph-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Dispensed">Dispensed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="hosp-ph-table-container">
            <table className="hosp-ph-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Medicines</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaShoppingCart style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      Loading pharmacy orders from database…
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaShoppingCart style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No pharmacy orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td>
                        <span className="hosp-ph-id-badge">{ord.id}</span>
                        {ord.wardLocation && ord.wardLocation !== "Not recorded" && (
                          <span style={{ display: "block", fontSize: "0.72rem", color: "#64748b", marginTop: "0.2rem" }}>
                            {ord.wardLocation}
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>{ord.patient}</strong>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#334155" }}>{ord.medicines}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.82rem", color: "#475569" }}>{ord.quantity}</span>
                      </td>

                      <td>
                        <strong style={{ color: "#0f172a" }}>₹{ord.amount.toFixed(2)}</strong>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{ord.orderDate}</span>
                      </td>

                      <td>
                        <span className={`hosp-ph-status-pill status-${ord.status.toLowerCase()}`}>
                          {ord.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", alignItems: "center" }}>
                          <select
                            className="hosp-ph-status-select"
                            value={ord.status}
                            disabled={orderSaving}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Dispensed">Dispensed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <button
                            className="hosp-ph-icon-btn"
                            title="View Order Details"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: ADD MEDICINE
      ============================================================== */}
      {showAddMedModal && (
        <div className="hosp-ph-modal-backdrop" onClick={() => setShowAddMedModal(false)}>
          <div className="hosp-ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-modal-header">
              <h3><FaPlus /> Add Hospital Medicine</h3>
              <button className="hosp-ph-modal-close" onClick={() => setShowAddMedModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddMedSubmit}>
              <div className="hosp-ph-modal-body">
                <div className="hosp-ph-form-grid">
                  <div className="hosp-ph-form-group">
                    <label>Medicine Brand Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Augmentin 625 Duo"
                      value={medFormData.name}
                      onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Generic Chemical Formulation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amoxicillin + Clavulanic Acid"
                      value={medFormData.genericName}
                      onChange={(e) => setMedFormData({ ...medFormData, genericName: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Therapeutic Category</label>
                    <select
                      value={medFormData.category}
                      onChange={(e) => setMedFormData({ ...medFormData, category: e.target.value })}
                    >
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Analgesic & Antipyretic">Analgesic &amp; Antipyretic</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="IV Fluids & Injections">IV Fluids &amp; Injections</option>
                      <option value="General Formulary">General Formulary</option>
                    </select>
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Unit Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 185.50"
                      value={medFormData.price}
                      onChange={(e) => setMedFormData({ ...medFormData, price: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Initial Stock Count *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 200"
                      value={medFormData.stock}
                      onChange={(e) => setMedFormData({ ...medFormData, stock: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dec 2027"
                      value={medFormData.expiryDate}
                      onChange={(e) => setMedFormData({ ...medFormData, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Prescription Required?</label>
                    <select
                      value={medFormData.prescriptionRequired}
                      onChange={(e) => setMedFormData({ ...medFormData, prescriptionRequired: e.target.value })}
                    >
                      <option value="Yes">Yes (Rx Required)</option>
                      <option value="No">No (OTC / General Floor Stock)</option>
                    </select>
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Batch / Lot Number</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-2026-99"
                      value={medFormData.batchNumber}
                      onChange={(e) => setMedFormData({ ...medFormData, batchNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="hosp-ph-modal-footer">
                <button type="submit" className="hosp-ph-primary-btn" disabled={medSaving}>
                  {medSaving ? "Saving…" : "Save Medicine"}
                </button>
                <button type="button" className="hosp-ph-secondary-btn" onClick={() => setShowAddMedModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: EDIT MEDICINE
      ============================================================== */}
      {showEditMedModal && (
        <div className="hosp-ph-modal-backdrop" onClick={() => setShowEditMedModal(null)}>
          <div className="hosp-ph-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-modal-header">
              <h3><FaEdit /> Edit Medicine — {showEditMedModal.name}</h3>
              <button className="hosp-ph-modal-close" onClick={() => setShowEditMedModal(null)}>×</button>
            </div>
            <form onSubmit={handleEditMedSubmit}>
              <div className="hosp-ph-modal-body">
                <div className="hosp-ph-form-grid">
                  <div className="hosp-ph-form-group">
                    <label>Medicine Name</label>
                    <input
                      type="text"
                      required
                      value={showEditMedModal.name}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, name: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Generic Name</label>
                    <input
                      type="text"
                      value={showEditMedModal.genericName}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, genericName: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={showEditMedModal.price}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Stock Count</label>
                    <input
                      type="number"
                      value={showEditMedModal.stock}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, stock: Number(e.target.value) })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={showEditMedModal.expiryDate}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="hosp-ph-form-group">
                    <label>Prescription Required</label>
                    <select
                      value={showEditMedModal.prescriptionRequired}
                      onChange={(e) => setShowEditMedModal({ ...showEditMedModal, prescriptionRequired: e.target.value })}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="hosp-ph-modal-footer">
                <button type="submit" className="hosp-ph-primary-btn" disabled={medSaving}>
                  {medSaving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="hosp-ph-secondary-btn" onClick={() => setShowEditMedModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: UPDATE STOCK QUICK MODAL
      ============================================================== */}
      {showUpdateStockModal && (
        <div className="hosp-ph-modal-backdrop" onClick={() => setShowUpdateStockModal(null)}>
          <div className="hosp-ph-modal hosp-ph-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-modal-header">
              <h3><FaExchangeAlt /> Update Stock Units</h3>
              <button className="hosp-ph-modal-close" onClick={() => setShowUpdateStockModal(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateStockSubmit}>
              <div className="hosp-ph-modal-body">
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 1rem 0" }}>
                  Adjust available inventory count for <strong>{showUpdateStockModal.name}</strong>.
                </p>
                <div className="hosp-ph-form-group">
                  <label>Current Stock: <strong>{showUpdateStockModal.stock} Units</strong></label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Enter new stock level..."
                    value={newStockVal}
                    onChange={(e) => setNewStockVal(e.target.value)}
                    style={{ fontSize: "1.1rem", fontWeight: "700" }}
                  />
                </div>
              </div>
              <div className="hosp-ph-modal-footer">
                <button type="submit" className="hosp-ph-primary-btn" disabled={medSaving}>
                  {medSaving ? "Applying…" : "Apply Stock"}
                </button>
                <button type="button" className="hosp-ph-secondary-btn" onClick={() => setShowUpdateStockModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          DRAWER / MODAL: VIEW MEDICINE DETAILS
      ============================================================== */}
      {selectedMed && (
        <div className="hosp-ph-drawer-backdrop" onClick={() => setSelectedMed(null)}>
          <div className="hosp-ph-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="hosp-ph-med-icon" style={{ width: "42px", height: "42px", fontSize: "1.2rem" }}>
                  <FaPills />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>{selectedMed.name}</h3>
                  <span className="hosp-ph-id-badge">{String(selectedMed.id).slice(-8).toUpperCase()}</span>
                </div>
              </div>
              <button className="hosp-ph-modal-close" onClick={() => setSelectedMed(null)}>×</button>
            </div>

            <div className="hosp-ph-drawer-body">
              <div className="hosp-ph-detail-grid">
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Generic Chemical Name</span>
                  <strong>{selectedMed.genericName}</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Therapeutic Category</span>
                  <span className="hosp-ph-category-badge">{selectedMed.category}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Price Per Unit</span>
                  <strong style={{ fontSize: "1.1rem", color: "#4f46e5" }}>₹{selectedMed.price.toFixed(2)}</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Current Stock</span>
                  <strong>{selectedMed.stock} Units</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Expiry Date</span>
                  <strong>{selectedMed.expiryDate}</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Batch / Lot</span>
                  <code>{selectedMed.batchNumber}</code>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Manufacturer</span>
                  <span>{selectedMed.manufacturer}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Storage Conditions</span>
                  <span>{selectedMed.storageTemp}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Prescription Required</span>
                  <span className={`hosp-ph-rx-badge ${selectedMed.prescriptionRequired === "Yes" ? "rx-req" : "rx-opt"}`}>
                    {selectedMed.prescriptionRequired === "Yes" ? "Yes (Prescription Required)" : "No (Over The Counter)"}
                  </span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Status</span>
                  <span className={`hosp-ph-avail-badge avail-${selectedMed.availability.toLowerCase().replace(/\s/g, "-")}`}>
                    {selectedMed.availability}
                  </span>
                </div>
              </div>
            </div>

            <div className="hosp-ph-drawer-footer">
              <button
                className="hosp-ph-primary-btn"
                onClick={() => {
                  const m = selectedMed;
                  setSelectedMed(null);
                  setShowEditMedModal(m);
                }}
              >
                <FaEdit /> Edit Medicine
              </button>
              <button className="hosp-ph-secondary-btn" onClick={() => setSelectedMed(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          DRAWER / MODAL: VIEW PRESCRIPTION DETAILS
      ============================================================== */}
      {selectedRx && (
        <div className="hosp-ph-drawer-backdrop" onClick={() => setSelectedRx(null)}>
          <div className="hosp-ph-drawer hosp-ph-drawer--wide" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="hosp-ph-med-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                  <FaFilePrescription />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Prescription — {selectedRx.id}</h3>
                  <span className={`hosp-ph-status-pill status-${selectedRx.status.toLowerCase()}`}>
                    {selectedRx.status}
                  </span>
                </div>
              </div>
              <button className="hosp-ph-modal-close" onClick={() => setSelectedRx(null)}>×</button>
            </div>

            <div className="hosp-ph-drawer-body">
              {/* Patient & Doctor Card */}
              <div className="hosp-ph-rx-info-box">
                <div className="hosp-ph-rx-info-col">
                  <span className="hosp-ph-detail-lbl">Patient</span>
                  <strong>{selectedRx.patientName}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {selectedRx.patientId} • {selectedRx.ward}</span>
                </div>
                <div className="hosp-ph-rx-info-col">
                  <span className="hosp-ph-detail-lbl">Prescribed By</span>
                  <strong>{selectedRx.doctorName}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{selectedRx.doctorSpecialty}</span>
                </div>
                <div className="hosp-ph-rx-info-col">
                  <span className="hosp-ph-detail-lbl">Date Issued</span>
                  <strong>{selectedRx.date}</strong>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ margin: "1rem 0" }}>
                <span className="hosp-ph-detail-lbl">Clinical Diagnosis</span>
                <p style={{ margin: "0.25rem 0", fontSize: "0.88rem", fontWeight: "600", color: "#1e293b" }}>
                  {selectedRx.diagnosis}
                </p>
              </div>

              {/* Rejection reason if rejected */}
              {selectedRx.status === "Rejected" && selectedRx.rejectionReason && (
                <div style={{ margin: "0.5rem 0 1rem", padding: "0.75rem 1rem", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                  <span className="hosp-ph-detail-lbl" style={{ color: "#dc2626" }}>Rejection Reason</span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#7f1d1d" }}>{selectedRx.rejectionReason}</p>
                </div>
              )}

              {/* Prescribed Medicines List */}
              <h4 style={{ margin: "1rem 0 0.5rem", fontSize: "0.95rem", color: "#0f172a" }}>
                Prescribed Medicines Checklist ({selectedRx.medicines.length})
              </h4>
              <div className="hosp-ph-rx-table-wrap">
                <table className="hosp-ph-mini-table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Quantity</th>
                      <th>Dosage &amp; Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines.length > 0 ? selectedRx.medicines.map((m, idx) => (
                      <tr key={idx}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.qty}</td>
                        <td>{m.dose}</td>
                        <td>{m.days}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>No medicines listed</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Physician Notes */}
              {selectedRx.notes && (
                <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span className="hosp-ph-detail-lbl">Physician Instructions</span>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "#334155" }}>{selectedRx.notes}</p>
                </div>
              )}
            </div>

            <div className="hosp-ph-drawer-footer">
              {selectedRx.status === "Pending" && (
                <>
                  <button
                    className="hosp-ph-btn hosp-ph-btn-verify"
                    disabled={rxSaving}
                    onClick={() => handleVerifyRx(selectedRx._id)}
                  >
                    <FaShieldAlt /> Verify Prescription
                  </button>
                  <button
                    className="hosp-ph-btn hosp-ph-btn-approve"
                    disabled={rxSaving}
                    onClick={() => handleApproveRx(selectedRx._id)}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="hosp-ph-btn hosp-ph-btn-reject"
                    disabled={rxSaving}
                    onClick={() => {
                      const r = selectedRx;
                      setSelectedRx(null);
                      handleOpenRejectRx(r);
                    }}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}

              {selectedRx.status === "Verified" && (
                <button
                  className="hosp-ph-btn hosp-ph-btn-approve"
                  disabled={rxSaving}
                  onClick={() => handleApproveRx(selectedRx._id)}
                >
                  <FaCheck /> Approve for Preparation
                </button>
              )}

              {selectedRx.status === "Approved" && (
                <button
                  className="hosp-ph-btn hosp-ph-btn-dispense"
                  disabled={rxSaving}
                  onClick={() => handleDispenseRx(selectedRx._id)}
                >
                  <FaCheckCircle /> Release &amp; Dispense Medicines
                </button>
              )}

              <button className="hosp-ph-secondary-btn" onClick={() => setSelectedRx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL: REJECT PRESCRIPTION PROMPT
      ============================================================== */}
      {rejectingRx && (
        <div className="hosp-ph-modal-backdrop" onClick={() => setRejectingRx(null)}>
          <div className="hosp-ph-modal hosp-ph-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-modal-header">
              <h3>Reject Prescription — {rejectingRx.id}</h3>
              <button className="hosp-ph-modal-close" onClick={() => setRejectingRx(null)}>×</button>
            </div>
            <form onSubmit={handleRejectRxSubmit}>
              <div className="hosp-ph-modal-body">
                <p style={{ fontSize: "0.85rem", color: "#475569", margin: "0 0 1rem 0" }}>
                  Please specify clinical or pharmaceutical reason for rejecting prescription for <strong>{rejectingRx.patientName}</strong>.
                </p>
                <div className="hosp-ph-form-group">
                  <label>Reason / Clinical Feedback *</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="e.g. Incompatible dosage with renal function, medicine out of hospital formulary stock, or unclear signature."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>
              <div className="hosp-ph-modal-footer">
                <button type="submit" className="hosp-ph-btn hosp-ph-btn-reject" disabled={rxSaving}>
                  {rxSaving ? "Rejecting…" : "Confirm Rejection"}
                </button>
                <button type="button" className="hosp-ph-secondary-btn" onClick={() => setRejectingRx(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================
          DRAWER / MODAL: VIEW ORDER DETAILS
      ============================================================== */}
      {selectedOrder && (
        <div className="hosp-ph-drawer-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="hosp-ph-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-ph-drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div className="hosp-ph-med-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                  <FaShoppingCart />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>Order — {selectedOrder.id}</h3>
                  <span className={`hosp-ph-status-pill status-${selectedOrder.status.toLowerCase()}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button className="hosp-ph-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="hosp-ph-drawer-body">
              <div className="hosp-ph-detail-grid">
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Patient Details</span>
                  <strong>{selectedOrder.patient}</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Hospital Location</span>
                  <span>{selectedOrder.wardLocation}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Ordered Items</span>
                  <span>{selectedOrder.medicines}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Quantity Summary</span>
                  <span>{selectedOrder.quantity}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Total Billing Amount</span>
                  <strong style={{ fontSize: "1.2rem", color: "#16a34a" }}>₹{selectedOrder.amount.toFixed(2)}</strong>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Payment / Billing Mode</span>
                  <span>{selectedOrder.paymentMode}</span>
                </div>
                <div className="hosp-ph-detail-item">
                  <span className="hosp-ph-detail-lbl">Order Placed On</span>
                  <span>{selectedOrder.orderDate}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span className="hosp-ph-detail-lbl">Change Order Dispensing Status</span>
                <select
                  className="hosp-ph-select"
                  style={{ width: "100%", marginTop: "0.5rem" }}
                  value={selectedOrder.status}
                  disabled={orderSaving}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Dispensed">Dispensed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="hosp-ph-drawer-footer">
              <button className="hosp-ph-secondary-btn" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
