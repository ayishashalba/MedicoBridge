import React, { useState, useMemo } from "react";
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

/* ===================================================================
   MOCK DATA: MEDICINE INVENTORY (HOSPITAL PHARMACY)
=================================================================== */
const initialInventory = [
  {
    id: "MED-HP-101",
    name: "Augmentin 625 Duo",
    genericName: "Amoxicillin + Clavulanic Acid (500mg/125mg)",
    category: "Antibiotics",
    price: 185.50,
    stock: 240,
    expiryDate: "Dec 2027",
    prescriptionRequired: "Yes",
    availability: "In Stock",
    batchNumber: "AUG-2024-88A",
    manufacturer: "GSK Pharmaceuticals",
    storageTemp: "Below 25°C",
    unit: "Strip of 10 Tablets"
  },
  {
    id: "MED-HP-102",
    name: "Metoprolol Succinate ER 50",
    genericName: "Metoprolol Succinate (50mg)",
    category: "Cardiovascular",
    price: 92.00,
    stock: 180,
    expiryDate: "Oct 2027",
    prescriptionRequired: "Yes",
    availability: "In Stock",
    batchNumber: "MTP-9921",
    manufacturer: "AstraZeneca",
    storageTemp: "Room Temperature",
    unit: "Strip of 15 Tablets"
  },
  {
    id: "MED-HP-103",
    name: "Paracetamol IV Infusion 100ml",
    genericName: "Acetaminophen Infusion 1000mg/100ml",
    category: "Analgesic & Antipyretic",
    price: 120.00,
    stock: 45,
    expiryDate: "Aug 2026",
    prescriptionRequired: "Yes",
    availability: "Low Stock",
    batchNumber: "PCM-IV-4011",
    manufacturer: "Fresenius Kabi",
    storageTemp: "20°C–25°C (Do not freeze)",
    unit: "100ml Glass Bottle"
  },
  {
    id: "MED-HP-104",
    name: "Pantoprazole 40mg Injection",
    genericName: "Pantoprazole Sodium for Inj.",
    category: "Gastrointestinal",
    price: 54.00,
    stock: 310,
    expiryDate: "Mar 2028",
    prescriptionRequired: "Yes",
    availability: "In Stock",
    batchNumber: "PAN-INJ-772",
    manufacturer: "Alkem Labs",
    storageTemp: "Store in cool dry place",
    unit: "1 Vial + WFI Ampoule"
  },
  {
    id: "MED-HP-105",
    name: "Human Mixtard 30/70 100IU",
    genericName: "Biphasic Isophane Insulin",
    category: "Antidiabetic",
    price: 410.00,
    stock: 12,
    expiryDate: "Jan 2027",
    prescriptionRequired: "Yes",
    availability: "Low Stock",
    batchNumber: "INS-MIX-201",
    manufacturer: "Novo Nordisk",
    storageTemp: "2°C–8°C (Refrigerated)",
    unit: "10ml Vial"
  },
  {
    id: "MED-HP-106",
    name: "Salbutamol Respirator Solution",
    genericName: "Salbutamol 5mg/ml Solution",
    category: "Respiratory",
    price: 75.00,
    stock: 0,
    expiryDate: "Jul 2026",
    prescriptionRequired: "Yes",
    availability: "Out of Stock",
    batchNumber: "SAL-RESP-109",
    manufacturer: "Cipla Ltd",
    storageTemp: "Room Temperature",
    unit: "15ml Dropper Bottle"
  },
  {
    id: "MED-HP-107",
    name: "Normal Saline 0.9% (NS 500ml)",
    genericName: "Sodium Chloride IV Infusion",
    category: "IV Fluids & Injections",
    price: 48.00,
    stock: 450,
    expiryDate: "May 2029",
    prescriptionRequired: "No",
    availability: "In Stock",
    batchNumber: "NS-500-8812",
    manufacturer: "Otsuka Pharma",
    storageTemp: "Room Temperature",
    unit: "500ml IV Bottle"
  },
  {
    id: "MED-HP-108",
    name: "Ceftriaxone 1g Injection",
    genericName: "Ceftriaxone Sodium IP 1000mg",
    category: "Antibiotics",
    price: 68.00,
    stock: 195,
    expiryDate: "Nov 2027",
    prescriptionRequired: "Yes",
    availability: "In Stock",
    batchNumber: "CEF-1G-339",
    manufacturer: "Aristo Pharmaceuticals",
    storageTemp: "Protect from light",
    unit: "1 Vial + Sterile Water"
  }
];

/* ===================================================================
   MOCK DATA: PRESCRIPTION REQUESTS (HOSPITAL PATIENTS)
=================================================================== */
const initialPrescriptions = [
  {
    id: "RX-HOSP-901",
    patientName: "Rahul Nair",
    patientId: "PAT-4091",
    doctorName: "Dr. Ayisha Shalba",
    doctorSpecialty: "Cardiology",
    date: "14 Jul 2026",
    status: "Pending",
    diagnosis: "Acute Coronary Syndrome / Post-Angioplasty",
    ward: "Cardiology CCU - Bed 04",
    notes: "Administer Metoprolol with breakfast. Monitor blood pressure and heart rate Q4H.",
    medicines: [
      { name: "Metoprolol Succinate ER 50", qty: "30 Tabs", dose: "1 Tab Morning (Post Meal)", days: "30 Days" },
      { name: "Atorvastatin 40mg", qty: "30 Tabs", dose: "1 Tab Night", days: "30 Days" },
      { name: "Aspirin 75mg Gastro-resistant", qty: "30 Tabs", dose: "1 Tab Afternoon", days: "30 Days" }
    ]
  },
  {
    id: "RX-HOSP-902",
    patientName: "Anjali Thomas",
    patientId: "PAT-4092",
    doctorName: "Dr. Neha Gokhale",
    doctorSpecialty: "Pediatrics",
    date: "14 Jul 2026",
    status: "Verified",
    diagnosis: "Bronchopneumonia with High Fever",
    ward: "Pediatric Ward - Bed 12",
    notes: "IV antibiotics schedule for 5 days. Ensure nebulization every 6 hours.",
    medicines: [
      { name: "Augmentin 625 Duo", qty: "15 Tabs", dose: "1 Tab BD (After food)", days: "7 Days" },
      { name: "Paracetamol 250mg Suspension", qty: "1 Bottle (60ml)", dose: "5ml TDS SOS", days: "5 Days" },
      { name: "Salbutamol Nebulizer Solution", qty: "2 Respules", dose: "BD Nebulization", days: "3 Days" }
    ]
  },
  {
    id: "RX-HOSP-903",
    patientName: "Suresh Babu",
    patientId: "PAT-4093",
    doctorName: "Dr. Vikram Batra",
    doctorSpecialty: "Orthopedics",
    date: "13 Jul 2026",
    status: "Approved",
    diagnosis: "Post Total Knee Arthroplasty (Day 2)",
    ward: "Orthopedics Cabin - SC-201",
    notes: "DVT prophylaxis and post-op analgesia. Check renal parameters before NSAID administration.",
    medicines: [
      { name: "Enoxaparin Sodium 40mg Inj", qty: "5 Pre-filled Syringes", dose: "Subcutaneously OD", days: "5 Days" },
      { name: "Pantoprazole 40mg Injection", qty: "5 Vials", dose: "IV OD Morning", days: "5 Days" },
      { name: "Paracetamol IV Infusion 100ml", qty: "4 Bottles", dose: "IV Infusion Q8H", days: "2 Days" }
    ]
  },
  {
    id: "RX-HOSP-904",
    patientName: "Mathew Varghese",
    patientId: "PAT-4102",
    doctorName: "Dr. Sara Thomas",
    doctorSpecialty: "General Medicine",
    date: "12 Jul 2026",
    status: "Dispensed",
    diagnosis: "Type 2 Diabetes Mellitus with Uncontrolled Glycemia",
    ward: "General Ward - GW-105",
    notes: "Insulin titration chart attached. Review fasting sugars daily.",
    medicines: [
      { name: "Human Mixtard 30/70 100IU", qty: "2 Vials (10ml)", dose: "16U Morning, 10U Night", days: "30 Days" },
      { name: "Metformin 500mg SR", qty: "60 Tabs", dose: "1 Tab BD Post Meals", days: "30 Days" }
    ]
  },
  {
    id: "RX-HOSP-905",
    patientName: "Aravind Swamy",
    patientId: "PAT-4098",
    doctorName: "Dr. Sandeep Reddy",
    doctorSpecialty: "Critical Care (ICU)",
    date: "11 Jul 2026",
    status: "Rejected",
    diagnosis: "Septic Shock / Multi-Organ Dysfunction",
    ward: "ICU Ward - ICU-A4",
    notes: "Rejected due to dosage mismatch with current eGFR test. Corrected prescription requested from ICU resident.",
    medicines: [
      { name: "Ceftriaxone 1g Injection", qty: "6 Vials", dose: "IV BD", days: "3 Days" }
    ]
  }
];

/* ===================================================================
   MOCK DATA: PHARMACY ORDERS (HOSPITAL DISPENSING ORDERS)
=================================================================== */
const initialOrders = [
  {
    id: "ORD-HP-701",
    patient: "Rahul Nair (PAT-4091)",
    medicines: "Metoprolol ER 50mg, Atorvastatin 40mg, Aspirin 75mg",
    quantity: "3 Items / 90 Units",
    amount: 540.00,
    orderDate: "14 Jul 2026, 11:15 AM",
    status: "Pending",
    wardLocation: "CCU Bed 04",
    paymentMode: "Hospital Inpatient Billing (Insurance TPA)"
  },
  {
    id: "ORD-HP-702",
    patient: "Anjali Thomas (PAT-4092)",
    medicines: "Augmentin 625 Duo, Paracetamol Susp., Salbutamol Sol.",
    quantity: "3 Items / 18 Units",
    amount: 325.50,
    orderDate: "14 Jul 2026, 10:30 AM",
    status: "Preparing",
    wardLocation: "Pediatric Ward Bed 12",
    paymentMode: "Cashless MedicoBridge Cover"
  },
  {
    id: "ORD-HP-703",
    patient: "Suresh Babu (PAT-4093)",
    medicines: "Enoxaparin 40mg, Pantoprazole Inj, Paracetamol IV Infusion",
    quantity: "3 Items / 14 Units",
    amount: 1450.00,
    orderDate: "13 Jul 2026, 04:20 PM",
    status: "Ready",
    wardLocation: "Cabin SC-201",
    paymentMode: "Direct Hospital Cash Billing"
  },
  {
    id: "ORD-HP-704",
    patient: "Mathew Varghese (PAT-4102)",
    medicines: "Human Mixtard 30/70, Metformin 500mg SR",
    quantity: "2 Items / 62 Units",
    amount: 980.00,
    orderDate: "12 Jul 2026, 02:45 PM",
    status: "Dispensed",
    wardLocation: "General Ward GW-105",
    paymentMode: "Hospital Discharge Settlement"
  },
  {
    id: "ORD-HP-705",
    patient: "Kavita Pillai (PAT-4109)",
    medicines: "Pantoprazole 40mg Inj, Normal Saline 500ml",
    quantity: "2 Items / 12 Units",
    amount: 210.00,
    orderDate: "12 Jul 2026, 09:10 AM",
    status: "Approved",
    wardLocation: "Day Care Ward 02",
    paymentMode: "Hospital IP Billing"
  },
  {
    id: "ORD-HP-706",
    patient: "Aravind Swamy (PAT-4098)",
    medicines: "Ceftriaxone 1g Injection",
    quantity: "1 Item / 6 Vials",
    amount: 408.00,
    orderDate: "11 Jul 2026, 08:30 AM",
    status: "Cancelled",
    wardLocation: "ICU Bed A4",
    paymentMode: "Cancelled by Physician"
  }
];

export default function HospitalPharmacy() {
  const [activeTab, setActiveTab] = useState("inventory");

  // Tab 1: Inventory State
  const [inventory, setInventory] = useState(initialInventory);
  const [invSearch, setInvSearch] = useState("");
  const [invCategoryFilter, setInvCategoryFilter] = useState("All");
  const [invAvailFilter, setInvAvailFilter] = useState("All");
  const [selectedMed, setSelectedMed] = useState(null);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showEditMedModal, setShowEditMedModal] = useState(null);
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(null);
  const [newStockVal, setNewStockVal] = useState("");

  const [medFormData, setMedFormData] = useState({
    name: "",
    genericName: "",
    category: "Antibiotics",
    price: "",
    stock: "",
    expiryDate: "",
    prescriptionRequired: "Yes",
    availability: "In Stock",
    batchNumber: "",
    manufacturer: "",
    storageTemp: "",
    unit: ""
  });

  // Tab 2: Prescriptions State
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [rxSearch, setRxSearch] = useState("");
  const [rxStatusFilter, setRxStatusFilter] = useState("All");
  const [selectedRx, setSelectedRx] = useState(null);
  const [rejectingRx, setRejectingRx] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Tab 3: Orders State
  const [orders, setOrders] = useState(initialOrders);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* ── FILTERED INVENTORY ────────────────────────────────── */
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = invSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.genericName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchCategory =
        invCategoryFilter === "All" || item.category === invCategoryFilter;

      const matchAvail =
        invAvailFilter === "All" || item.availability === invAvailFilter;

      return matchSearch && matchCategory && matchAvail;
    });
  }, [inventory, invSearch, invCategoryFilter, invAvailFilter]);

  /* ── FILTERED PRESCRIPTIONS ────────────────────────────── */
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((rx) => {
      const q = rxSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.patientId.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.id.toLowerCase().includes(q);

      const matchStatus =
        rxStatusFilter === "All" || rx.status === rxStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [prescriptions, rxSearch, rxStatusFilter]);

  /* ── FILTERED ORDERS ───────────────────────────────────── */
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const q = orderSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        ord.patient.toLowerCase().includes(q) ||
        ord.medicines.toLowerCase().includes(q);

      const matchStatus =
        orderStatusFilter === "All" || ord.status === orderStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  /* ── ACTIONS: INVENTORY ────────────────────────────────── */
  const handleAddMedSubmit = (e) => {
    e.preventDefault();
    if (!medFormData.name) return;

    const stockNum = Number(medFormData.stock) || 0;
    const avail = stockNum === 0 ? "Out of Stock" : stockNum < 30 ? "Low Stock" : "In Stock";

    const newMed = {
      id: `MED-HP-${Math.floor(100 + Math.random() * 900)}`,
      name: medFormData.name,
      genericName: medFormData.genericName || medFormData.name,
      category: medFormData.category || "General",
      price: Number(medFormData.price) || 0,
      stock: stockNum,
      expiryDate: medFormData.expiryDate || "Dec 2027",
      prescriptionRequired: medFormData.prescriptionRequired,
      availability: avail,
      batchNumber: medFormData.batchNumber || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturer: medFormData.manufacturer || "Hospital Formulary",
      storageTemp: medFormData.storageTemp || "Room Temperature",
      unit: medFormData.unit || "Unit Pack"
    };

    setInventory([newMed, ...inventory]);
    setShowAddMedModal(false);
    showToast(`Added "${newMed.name}" to Hospital Pharmacy inventory`);
    setMedFormData({
      name: "", genericName: "", category: "Antibiotics", price: "", stock: "",
      expiryDate: "", prescriptionRequired: "Yes", availability: "In Stock",
      batchNumber: "", manufacturer: "", storageTemp: "", unit: ""
    });
  };

  const handleEditMedSubmit = (e) => {
    e.preventDefault();
    if (!showEditMedModal) return;

    const stockNum = Number(showEditMedModal.stock) || 0;
    const avail = stockNum === 0 ? "Out of Stock" : stockNum < 30 ? "Low Stock" : "In Stock";

    setInventory((prev) =>
      prev.map((item) =>
        item.id === showEditMedModal.id ? { ...showEditMedModal, stock: stockNum, availability: avail } : item
      )
    );
    showToast(`Updated "${showEditMedModal.name}" details`);
    setShowEditMedModal(null);
  };

  const handleUpdateStockSubmit = (e) => {
    e.preventDefault();
    if (!showUpdateStockModal) return;
    const stockNum = Number(newStockVal);
    if (isNaN(stockNum) || stockNum < 0) return;

    const avail = stockNum === 0 ? "Out of Stock" : stockNum < 30 ? "Low Stock" : "In Stock";

    setInventory((prev) =>
      prev.map((item) =>
        item.id === showUpdateStockModal.id ? { ...item, stock: stockNum, availability: avail } : item
      )
    );
    showToast(`Stock updated for "${showUpdateStockModal.name}" to ${stockNum} units`);
    setShowUpdateStockModal(null);
    setNewStockVal("");
  };

  /* ── ACTIONS: PRESCRIPTION REQUESTS ────────────────────── */
  const handleVerifyRx = (id) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status: "Verified" } : rx))
    );
    showToast(`Prescription ${id} verified by hospital pharmacist`);
  };

  const handleApproveRx = (id) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status: "Approved" } : rx))
    );
    showToast(`Prescription ${id} approved for preparation & dispensing`);
  };

  const handleOpenRejectRx = (rx) => {
    setRejectingRx(rx);
    setRejectReason("");
  };

  const handleRejectRxSubmit = (e) => {
    e.preventDefault();
    if (!rejectingRx) return;
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === rejectingRx.id ? { ...rx, status: "Rejected", notes: rejectReason || rx.notes } : rx))
    );
    showToast(`Prescription ${rejectingRx.id} rejected. Doctor notified.`);
    setRejectingRx(null);
  };

  const handleDispenseRx = (id) => {
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, status: "Dispensed" } : rx))
    );
    showToast(`Prescription ${id} marked as Dispensed to patient`);
  };

  /* ── ACTIONS: PHARMACY ORDERS ──────────────────────────── */
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Order ${orderId} updated to status: ${newStatus}`);
  };

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
              <span className="hosp-ph-inst-badge"><FaHospital /> City General Hospital</span>
              <span className="hosp-ph-id-tag">ID: #HOSP-5021-PHARM</span>
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
            <span className="hosp-ph-kpi-val">{inventory.reduce((acc, i) => acc + i.stock, 0)}</span>
            <span className="hosp-ph-kpi-lbl">Total Stock Units</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#f59e0b" }}>
              {prescriptions.filter((r) => r.status === "Pending").length}
            </span>
            <span className="hosp-ph-kpi-lbl">Pending Rx Requests</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#3b82f6" }}>
              {orders.filter((o) => o.status === "Preparing" || o.status === "Approved").length}
            </span>
            <span className="hosp-ph-kpi-lbl">Active Orders</span>
          </div>
          <div className="hosp-ph-kpi-card">
            <span className="hosp-ph-kpi-val" style={{ color: "#10b981" }}>
              {prescriptions.filter((r) => r.status === "Dispensed").length}
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
          {prescriptions.filter((r) => r.status === "Pending").length > 0 && (
            <span className="hosp-ph-tab-badge">
              {prescriptions.filter((r) => r.status === "Pending").length}
            </span>
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
                  <option value="Analgesic & Antipyretic">Analgesic & Antipyretic</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="IV Fluids & Injections">IV Fluids & Injections</option>
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
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaBoxes style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No medicines match the selected search or category filters.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((med) => (
                    <tr key={med.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div className="hosp-ph-med-icon">
                            <FaPills />
                          </div>
                          <div>
                            <strong>{med.name}</strong>
                            <span className="hosp-ph-sub-id">{med.id}</span>
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
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaFilePrescription style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No prescription requests found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>
                        <span className="hosp-ph-id-badge">{rx.id}</span>
                        {rx.ward && (
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
                          {rx.medicines.map((m, idx) => (
                            <span key={idx} className="hosp-ph-med-chip">
                              <strong>{m.name}</strong> ({m.qty})
                            </span>
                          ))}
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
                          {/* View Prescription */}
                          <button
                            className="hosp-ph-btn hosp-ph-btn-view"
                            title="View Prescription Details"
                            onClick={() => setSelectedRx(rx)}
                          >
                            <FaEye /> View
                          </button>

                          {/* Verify */}
                          {rx.status === "Pending" && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-verify"
                              title="Verify Prescription"
                              onClick={() => handleVerifyRx(rx.id)}
                            >
                              <FaShieldAlt /> Verify
                            </button>
                          )}

                          {/* Approve */}
                          {(rx.status === "Pending" || rx.status === "Verified") && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-approve"
                              title="Approve for preparation"
                              onClick={() => handleApproveRx(rx.id)}
                            >
                              <FaCheck /> Approve
                            </button>
                          )}

                          {/* Mark as Dispensed */}
                          {rx.status === "Approved" && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-dispense"
                              title="Mark as Dispensed"
                              onClick={() => handleDispenseRx(rx.id)}
                            >
                              <FaCheckCircle /> Dispense
                            </button>
                          )}

                          {/* Reject */}
                          {(rx.status === "Pending" || rx.status === "Verified") && (
                            <button
                              className="hosp-ph-btn hosp-ph-btn-reject"
                              title="Reject Prescription"
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
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                      <FaShoppingCart style={{ fontSize: "2rem", color: "#cbd5e1", display: "block", margin: "0 auto 0.5rem" }} />
                      No pharmacy orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <span className="hosp-ph-id-badge">{ord.id}</span>
                        {ord.wardLocation && (
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
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
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
                      <option value="Analgesic & Antipyretic">Analgesic & Antipyretic</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="IV Fluids & Injections">IV Fluids & Injections</option>
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
                <button type="submit" className="hosp-ph-primary-btn">Save Medicine</button>
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
                <button type="submit" className="hosp-ph-primary-btn">Save Changes</button>
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
                  Adjust available inventory count for <strong>{showUpdateStockModal.name}</strong> ({showUpdateStockModal.id}).
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
                <button type="submit" className="hosp-ph-primary-btn">Apply Stock</button>
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
                  <span className="hosp-ph-id-badge">{selectedMed.id}</span>
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
                      <th>Dosage & Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines.map((m, idx) => (
                      <tr key={idx}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.qty}</td>
                        <td>{m.dose}</td>
                        <td>{m.days}</td>
                      </tr>
                    ))}
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
                    onClick={() => {
                      handleVerifyRx(selectedRx.id);
                      setSelectedRx({ ...selectedRx, status: "Verified" });
                    }}
                  >
                    <FaShieldAlt /> Verify Prescription
                  </button>
                  <button
                    className="hosp-ph-btn hosp-ph-btn-approve"
                    onClick={() => {
                      handleApproveRx(selectedRx.id);
                      setSelectedRx({ ...selectedRx, status: "Approved" });
                    }}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="hosp-ph-btn hosp-ph-btn-reject"
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
                  onClick={() => {
                    handleApproveRx(selectedRx.id);
                    setSelectedRx({ ...selectedRx, status: "Approved" });
                  }}
                >
                  <FaCheck /> Approve for Preparation
                </button>
              )}

              {selectedRx.status === "Approved" && (
                <button
                  className="hosp-ph-btn hosp-ph-btn-dispense"
                  onClick={() => {
                    handleDispenseRx(selectedRx.id);
                    setSelectedRx({ ...selectedRx, status: "Dispensed" });
                  }}
                >
                  <FaCheckCircle /> Release & Dispense Medicines
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
                <button type="submit" className="hosp-ph-btn hosp-ph-btn-reject">Confirm Rejection</button>
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
                  <span>{selectedOrder.wardLocation || "Inpatient Ward"}</span>
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
                  onChange={(e) => {
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
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
