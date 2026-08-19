import React, { useState, useMemo } from "react";
import {
  FaBed,
  FaSearch,
  FaFilter,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaUserPlus,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaHospital,
  FaProcedures,
  FaHeartbeat,
  FaUserInjured,
  FaWrench,
  FaCalendarAlt,
  FaUserMd,
  FaInfoCircle,
} from "react-icons/fa";
import "./BedManagement.css";

// Initial Bed Inventory across Categories
const initialBeds = [
  // ICU Beds
  {
    id: "ICU-101",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-A1",
    equipment: "Ventilator, Multi-parameter Monitor, Central Oxygen",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    patientAge: 52,
    patientGender: "Male",
    doctor: "Dr. Rajesh K. Nair",
    status: "Occupied",
    admissionDate: "Aug 12, 2026",
    notes: "Post-cardiac bypass recovery, continuous hemodynamic monitoring.",
  },
  {
    id: "ICU-102",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-A2",
    equipment: "Ventilator, Defibrillator, Syringe Pump",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Sterilized, calibrated, and ready for immediate admission.",
  },
  {
    id: "ICU-103",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-A3",
    equipment: "Dialysis Unit, Advanced Ventilator",
    patientName: "Aravind Swamy",
    patientId: "PAT-4098",
    patientAge: 48,
    patientGender: "Male",
    doctor: "Dr. Ayisha Shalba",
    status: "Occupied",
    admissionDate: "Aug 14, 2026",
    notes: "Acute renal care and respiratory monitoring.",
  },
  {
    id: "ICU-104",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-B1",
    equipment: "Cardiac Monitor, BiPAP Support",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Maintenance",
    admissionDate: "—",
    notes: "Routine quarterly sensor calibration & medical gas line testing.",
  },
  {
    id: "ICU-105",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-B2",
    equipment: "Ventilator, Vital Signs Monitor",
    patientName: "Meera Pillai",
    patientId: "PAT-4105",
    patientAge: 61,
    patientGender: "Female",
    doctor: "Dr. Amit Varma",
    status: "Reserved",
    admissionDate: "Aug 19, 2026",
    notes: "Reserved for incoming emergency trauma transfer from ER.",
  },
  {
    id: "ICU-106",
    wardType: "ICU",
    floor: "3rd Floor - Critical Care Wing",
    room: "ICU-B3",
    equipment: "Ventilator, Infusion Pump Station",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Cleaned and sanitized for next critical case.",
  },

  // General Ward Beds
  {
    id: "GW-201",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2A",
    room: "Ward 2A-01",
    equipment: "Adjustable Hospital Bed, IV Stand, Oxygen Port",
    patientName: "Sonia Sebastian",
    patientId: "PAT-4092",
    patientAge: 29,
    patientGender: "Female",
    doctor: "Dr. Priya Thomas",
    status: "Occupied",
    admissionDate: "Aug 15, 2026",
    notes: "Post-operative appendectomy recovery, stable vitals.",
  },
  {
    id: "GW-202",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2A",
    room: "Ward 2A-02",
    equipment: "Standard Bed, IV Stand",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Bed sanitized and freshly made.",
  },
  {
    id: "GW-203",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2A",
    room: "Ward 2A-03",
    equipment: "Standard Bed, IV Stand, Nebulizer Port",
    patientName: "Mathew V.",
    patientId: "PAT-4102",
    patientAge: 38,
    patientGender: "Male",
    doctor: "Dr. Susan George",
    status: "Occupied",
    admissionDate: "Aug 16, 2026",
    notes: "Orthopedic fracture traction and physical therapy.",
  },
  {
    id: "GW-204",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2A",
    room: "Ward 2A-04",
    equipment: "Standard Bed, IV Stand",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Available for routine inpatient admissions.",
  },
  {
    id: "GW-205",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2B",
    room: "Ward 2B-01",
    equipment: "Standard Bed, IV Stand",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Maintenance",
    admissionDate: "—",
    notes: "Wheel locking mechanism and motorized backrest repair.",
  },
  {
    id: "GW-206",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2B",
    room: "Ward 2B-02",
    equipment: "Standard Bed, IV Stand, Oxygen Port",
    patientName: "Thomas Kurian",
    patientId: "PAT-4095",
    patientAge: 35,
    patientGender: "Male",
    doctor: "Dr. Vikram Shekar",
    status: "Reserved",
    admissionDate: "Aug 19, 2026",
    notes: "Reserved for scheduled hernia elective surgery tomorrow morning.",
  },
  {
    id: "GW-207",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2B",
    room: "Ward 2B-03",
    equipment: "Standard Bed, IV Stand",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Ready for occupancy.",
  },
  {
    id: "GW-208",
    wardType: "General Ward",
    floor: "2nd Floor - Ward 2B",
    room: "Ward 2B-04",
    equipment: "Standard Bed, IV Stand, Oxygen Port",
    patientName: "Aparna Nair",
    patientId: "PAT-4094",
    patientAge: 41,
    patientGender: "Female",
    doctor: "Dr. Priya Thomas",
    status: "Occupied",
    admissionDate: "Aug 17, 2026",
    notes: "Post-ENT observation, under prescribed medication routine.",
  },

  // Private / Cabin Beds
  {
    id: "PC-301",
    wardType: "Private / Cabin",
    floor: "4th Floor - Deluxe Suite Wing",
    room: "Suite 401",
    equipment: "Motorized Deluxe Bed, Attached Bath, Oxygen Console, Smart TV",
    patientName: "Mohan Lal",
    patientId: "PAT-4093",
    patientAge: 64,
    patientGender: "Male",
    doctor: "Dr. Ayisha Shalba",
    status: "Occupied",
    admissionDate: "Aug 11, 2026",
    notes: "Executive cardiac wellness stay and dietary management.",
  },
  {
    id: "PC-302",
    wardType: "Private / Cabin",
    floor: "4th Floor - Deluxe Suite Wing",
    room: "Suite 402",
    equipment: "Motorized Deluxe Bed, Refrigerator, Oxygen Console",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Deluxe cabin deep-cleaned and prepared for check-in.",
  },
  {
    id: "PC-303",
    wardType: "Private / Cabin",
    floor: "4th Floor - Executive Wing",
    room: "Suite 403",
    equipment: "Motorized Deluxe Bed, Attendant Couch, Oxygen Console",
    patientName: "Deepak Menon",
    patientId: "PAT-4110",
    patientAge: 55,
    patientGender: "Male",
    doctor: "Dr. Rajesh K. Nair",
    status: "Occupied",
    admissionDate: "Aug 18, 2026",
    notes: "Neurological migraine profiling and rest suite.",
  },
  {
    id: "PC-304",
    wardType: "Private / Cabin",
    floor: "4th Floor - Executive Wing",
    room: "Suite 404",
    equipment: "Motorized Deluxe Bed, Oxygen Console",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Maintenance",
    admissionDate: "—",
    notes: "Air conditioning filter change and private bath plumbing check.",
  },
  {
    id: "PC-305",
    wardType: "Private / Cabin",
    floor: "4th Floor - Executive Wing",
    room: "Suite 405",
    equipment: "Motorized Deluxe Bed, Attendant Couch, Oxygen Console",
    patientName: "",
    patientId: "",
    patientAge: null,
    patientGender: "",
    doctor: "",
    status: "Available",
    admissionDate: "—",
    notes: "Available for immediate VIP / Private admission.",
  },
  {
    id: "PC-306",
    wardType: "Private / Cabin",
    floor: "4th Floor - Executive Wing",
    room: "Suite 406",
    equipment: "Motorized Deluxe Bed, Attendant Couch, Oxygen Console",
    patientName: "Kavitha R.",
    patientId: "PAT-4115",
    patientAge: 37,
    patientGender: "Female",
    doctor: "Dr. Priya Thomas",
    status: "Reserved",
    admissionDate: "Aug 19, 2026",
    notes: "Reserved for post-natal private cabin admission.",
  },
];

// Sample Available Registered Patients for Quick Selection in Assign Modal
const registeredPatientsList = [
  { id: "PAT-4096", name: "Leela Mathews", age: 72, gender: "Female", doctor: "Dr. Amit Varma" },
  { id: "PAT-4097", name: "George Joseph", age: 45, gender: "Male", doctor: "Dr. Susan George" },
  { id: "PAT-4099", name: "Ananya Sharma", age: 31, gender: "Female", doctor: "Dr. Ayisha Shalba" },
  { id: "PAT-4100", name: "Kiran Prasad", age: 26, gender: "Male", doctor: "Dr. Rajesh K. Nair" },
  { id: "PAT-4101", name: "Fathima Noor", age: 58, gender: "Female", doctor: "Dr. Vikram Shekar" },
];

const CATEGORIES = ["All Categories", "General Ward", "ICU", "Private / Cabin"];
const STATUSES = ["All Statuses", "Available", "Occupied", "Reserved", "Maintenance"];

function BedManagement() {
  const [beds, setBeds] = useState(initialBeds);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Modal States
  const [detailsBed, setDetailsBed] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [targetBed, setTargetBed] = useState(null);

  // Assign Form State
  const [assignBedId, setAssignBedId] = useState("");
  const [patientSource, setPatientSource] = useState("select"); // 'select' or 'custom'
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [customPatName, setCustomPatName] = useState("");
  const [customPatId, setCustomPatId] = useState("");
  const [customAge, setCustomAge] = useState("");
  const [customGender, setCustomGender] = useState("Male");
  const [attendingDoctor, setAttendingDoctor] = useState("Dr. Ayisha Shalba");
  const [admissionDate, setAdmissionDate] = useState("Aug 19, 2026");
  const [assignNotes, setAssignNotes] = useState("");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Summary Metrics calculations
  const totalBedsCount = beds.length;
  const availableBedsCount = beds.filter((b) => b.status === "Available").length;
  const occupiedBedsCount = beds.filter((b) => b.status === "Occupied").length;
  const icuBedsCount = beds.filter((b) => b.wardType === "ICU").length;
  const icuOccupiedCount = beds.filter((b) => b.wardType === "ICU" && b.status === "Occupied").length;
  const icuAvailableCount = beds.filter((b) => b.wardType === "ICU" && b.status === "Available").length;

  // Filtered beds list
  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        bed.id.toLowerCase().includes(q) ||
        bed.wardType.toLowerCase().includes(q) ||
        bed.patientName.toLowerCase().includes(q) ||
        bed.patientId.toLowerCase().includes(q) ||
        bed.room.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "All Categories" || bed.wardType === selectedCategory;

      const matchStatus =
        selectedStatus === "All Statuses" || bed.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [beds, search, selectedCategory, selectedStatus]);

  // Handler: Open Assign Modal
  const handleOpenAssignModal = (preselectedBedId = null) => {
    const availableList = beds.filter((b) => b.status === "Available" || b.status === "Reserved");
    const defaultBedId = preselectedBedId || (availableList.length > 0 ? availableList[0].id : "");

    setAssignBedId(defaultBedId);
    setPatientSource("select");
    setSelectedPatientId(registeredPatientsList[0]?.id || "");
    setCustomPatName("");
    setCustomPatId(`PAT-${Math.floor(4120 + Math.random() * 80)}`);
    setCustomAge("");
    setCustomGender("Male");
    setAttendingDoctor("Dr. Ayisha Shalba");
    setAdmissionDate("Aug 19, 2026");
    setAssignNotes("");
    setAssignModalOpen(true);
  };

  // Handler: Submit Bed Assignment
  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!assignBedId) {
      alert("Please select a bed to assign.");
      return;
    }

    let pName = "";
    let pId = "";
    let pAge = "";
    let pGender = "";
    let pDoc = attendingDoctor;

    if (patientSource === "select") {
      const selectedP = registeredPatientsList.find((p) => p.id === selectedPatientId);
      if (selectedP) {
        pName = selectedP.name;
        pId = selectedP.id;
        pAge = selectedP.age;
        pGender = selectedP.gender;
        pDoc = selectedP.doctor || attendingDoctor;
      }
    } else {
      if (!customPatName.trim()) {
        alert("Please enter patient name.");
        return;
      }
      pName = customPatName.trim();
      pId = customPatId.trim() || `PAT-${Math.floor(4120 + Math.random() * 80)}`;
      pAge = customAge ? parseInt(customAge, 10) : 35;
      pGender = customGender;
    }

    setBeds((prev) =>
      prev.map((bed) =>
        bed.id === assignBedId
          ? {
              ...bed,
              patientName: pName,
              patientId: pId,
              patientAge: pAge,
              patientGender: pGender,
              doctor: pDoc,
              status: "Occupied",
              admissionDate: admissionDate || "Aug 19, 2026",
              notes: assignNotes || bed.notes,
            }
          : bed
      )
    );

    setAssignModalOpen(false);
    showToast(`Bed ${assignBedId} successfully assigned to ${pName} (${pId})`);
  };

  // Handler: Open Release Bed Confirmation Modal
  const handleOpenReleaseModal = (bed) => {
    setTargetBed(bed);
    setReleaseModalOpen(true);
  };

  // Handler: Confirm Release Bed
  const handleConfirmRelease = () => {
    if (!targetBed) return;

    const dischargedName = targetBed.patientName || "Patient";
    const bedNumber = targetBed.id;

    setBeds((prev) =>
      prev.map((bed) =>
        bed.id === targetBed.id
          ? {
              ...bed,
              patientName: "",
              patientId: "",
              patientAge: null,
              patientGender: "",
              doctor: "",
              status: "Available",
              admissionDate: "—",
              notes: "Sterilized and available for admission.",
            }
          : bed
      )
    );

    setReleaseModalOpen(false);
    setTargetBed(null);
    if (detailsBed && detailsBed.id === targetBed.id) {
      setDetailsBed(null);
    }

    showToast(`Bed ${bedNumber} released. ${dischargedName} discharged successfully.`);
  };

  // Helper for Status Badge Class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Available":
        return "hosp-bed-status-pill hosp-bed-status--available";
      case "Occupied":
        return "hosp-bed-status-pill hosp-bed-status--occupied";
      case "Reserved":
        return "hosp-bed-status-pill hosp-bed-status--reserved";
      case "Maintenance":
        return "hosp-bed-status-pill hosp-bed-status--maintenance";
      default:
        return "hosp-bed-status-pill";
    }
  };

  // Helper for Category Badge Class
  const getCategoryBadgeClass = (wardType) => {
    switch (wardType) {
      case "ICU":
        return "hosp-bed-category-pill category-icu";
      case "Private / Cabin":
        return "hosp-bed-category-pill category-private";
      case "General Ward":
      default:
        return "hosp-bed-category-pill category-general";
    }
  };

  return (
    <div className="hosp-beds-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="hosp-bed-toast" role="alert">
          <FaCheckCircle className="toast-icon-check" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Action */}
      <div className="hosp-bed-header-banner">
        <div className="banner-info">
          <div className="banner-icon-box">
            <FaBed />
          </div>
          <div>
            <h2 className="banner-title">Hospital Bed Management</h2>
            <p className="banner-subtitle">
              Monitor real-time ward capacities, allocate inpatient beds, and track patient admissions.
            </p>
          </div>
        </div>
        <button
          className="hosp-btn-assign-top"
          onClick={() => handleOpenAssignModal()}
          id="btn-assign-new-bed"
        >
          <FaUserPlus />
          <span>Assign Bed</span>
        </button>
      </div>

      {/* ── 4 SUMMARY CARDS ── */}
      <section className="hosp-beds-summary-cards" aria-label="Bed summary metrics">
        {/* Total Beds */}
        <div className="hosp-stat-card card-total">
          <div className="stat-card-header">
            <span className="stat-title">Total Beds</span>
            <div className="stat-icon stat-icon--total">
              <FaHospital />
            </div>
          </div>
          <div className="stat-value">{totalBedsCount}</div>
          <div className="stat-meta">
            <span className="meta-highlight">{CATEGORIES.length - 1}</span> active hospital wards
          </div>
        </div>

        {/* Available Beds */}
        <div className="hosp-stat-card card-available">
          <div className="stat-card-header">
            <span className="stat-title">Available Beds</span>
            <div className="stat-icon stat-icon--available">
              <FaCheckCircle />
            </div>
          </div>
          <div className="stat-value text-success">{availableBedsCount}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--success">
              {Math.round((availableBedsCount / totalBedsCount) * 100)}% Available
            </span>
            Ready for check-in
          </div>
        </div>

        {/* Occupied Beds */}
        <div className="hosp-stat-card card-occupied">
          <div className="stat-card-header">
            <span className="stat-title">Occupied Beds</span>
            <div className="stat-icon stat-icon--occupied">
              <FaUserInjured />
            </div>
          </div>
          <div className="stat-value text-danger">{occupiedBedsCount}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--danger">
              {Math.round((occupiedBedsCount / totalBedsCount) * 100)}% Occupancy
            </span>
            Currently admitted
          </div>
        </div>

        {/* ICU Beds */}
        <div className="hosp-stat-card card-icu">
          <div className="stat-card-header">
            <span className="stat-title">ICU Beds</span>
            <div className="stat-icon stat-icon--icu">
              <FaHeartbeat />
            </div>
          </div>
          <div className="stat-value text-primary-color">{icuBedsCount}</div>
          <div className="stat-meta">
            <span className="meta-substat">
              <strong>{icuOccupiedCount}</strong> In Use &bull; <strong>{icuAvailableCount}</strong> Free
            </span>
          </div>
        </div>
      </section>

      {/* ── CONTROLS: CATEGORY TABS, SEARCH & STATUS FILTER ── */}
      <div className="hosp-beds-control-panel hosp-card">
        {/* Category Tabs */}
        <div className="hosp-bed-category-tabs" role="tablist">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All Categories"
                ? beds.length
                : beds.filter((b) => b.wardType === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                className={`category-tab-btn ${isActive ? "category-tab-btn--active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
                <span className="category-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search and Status Dropdown */}
        <div className="hosp-bed-filters-row">
          <div className="hosp-bed-search-box">
            <FaSearch className="hosp-search-icon" />
            <input
              type="text"
              placeholder="Search by Bed #, Patient Name, Patient ID, Ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search beds"
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

          <div className="hosp-bed-filter-select">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by Status"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── BED TABLE SECTION ── */}
      <div className="hosp-card hosp-bed-table-card">
        <div className="hosp-table-header-bar">
          <div>
            <h3 className="hosp-card-title" style={{ marginBottom: "0.2rem" }}>
              Hospital Bed Directory
            </h3>
            <p className="table-subtitle">
              Showing {filteredBeds.length} of {beds.length} registered hospital beds
            </p>
          </div>
        </div>

        <div className="hosp-table-wrapper">
          <table className="hosp-table hosp-bed-table">
            <thead>
              <tr>
                <th>Bed Number</th>
                <th>Ward / Type</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Status</th>
                <th>Admission Date</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.length > 0 ? (
                filteredBeds.map((bed) => (
                  <tr key={bed.id} className={`bed-row status-row--${bed.status.toLowerCase()}`}>
                    {/* Bed Number */}
                    <td>
                      <div className="bed-number-cell">
                        <div className="bed-cell-icon">
                          <FaProcedures />
                        </div>
                        <div>
                          <span className="bed-id-text">{bed.id}</span>
                          <span className="bed-room-text">{bed.room}</span>
                        </div>
                      </div>
                    </td>

                    {/* Ward / Type */}
                    <td>
                      <span className={getCategoryBadgeClass(bed.wardType)}>
                        {bed.wardType}
                      </span>
                    </td>

                    {/* Patient Name */}
                    <td>
                      {bed.patientName ? (
                        <div className="bed-patient-cell">
                          <span className="hosp-pat-name">{bed.patientName}</span>
                          {bed.doctor && (
                            <span className="bed-patient-doctor">
                              <FaUserMd className="mini-icon" /> {bed.doctor}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-dash">—</span>
                      )}
                    </td>

                    {/* Patient ID */}
                    <td>
                      {bed.patientId ? (
                        <span className="hosp-pat-id">{bed.patientId}</span>
                      ) : (
                        <span className="text-muted-dash">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={getStatusBadgeClass(bed.status)}>
                        {bed.status}
                      </span>
                    </td>

                    {/* Admission Date */}
                    <td>
                      <div className="bed-date-cell">
                        {bed.admissionDate && bed.admissionDate !== "—" ? (
                          <>
                            <FaCalendarAlt className="mini-icon text-muted" />
                            <span>{bed.admissionDate}</span>
                          </>
                        ) : (
                          <span className="text-muted-dash">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="hosp-bed-actions-cell">
                        {/* View Details */}
                        <button
                          className="hosp-bed-action-btn btn-view-details"
                          onClick={() => setDetailsBed(bed)}
                          title="View Details"
                        >
                          <FaEye />
                          <span>View Details</span>
                        </button>

                        {/* Assign Bed (for Available or Reserved) */}
                        {bed.status === "Available" && (
                          <button
                            className="hosp-bed-action-btn btn-assign-bed"
                            onClick={() => handleOpenAssignModal(bed.id)}
                            title="Assign Bed"
                          >
                            <FaUserPlus />
                            <span>Assign Bed</span>
                          </button>
                        )}

                        {bed.status === "Reserved" && (
                          <button
                            className="hosp-bed-action-btn btn-assign-bed"
                            onClick={() => handleOpenAssignModal(bed.id)}
                            title="Complete Admission"
                          >
                            <FaUserPlus />
                            <span>Admit</span>
                          </button>
                        )}

                        {/* Release Bed (for Occupied or Reserved) */}
                        {(bed.status === "Occupied" || bed.status === "Reserved") && (
                          <button
                            className="hosp-bed-action-btn btn-release-bed"
                            onClick={() => handleOpenReleaseModal(bed)}
                            title="Release Bed"
                          >
                            <FaSignOutAlt />
                            <span>Release Bed</span>
                          </button>
                        )}

                        {/* Maintenance Action */}
                        {bed.status === "Maintenance" && (
                          <button
                            className="hosp-bed-action-btn btn-maintenance-ready"
                            onClick={() => {
                              setBeds((prev) =>
                                prev.map((b) =>
                                  b.id === bed.id
                                    ? { ...b, status: "Available", notes: "Maintenance complete. Bed ready." }
                                    : b
                                )
                              );
                              showToast(`Bed ${bed.id} set to Available.`);
                            }}
                            title="Set to Available"
                          >
                            <FaCheckCircle />
                            <span>Set Ready</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="hosp-table-empty">
                    <FaBed className="empty-icon" />
                    <h3>No matching beds found</h3>
                    <p>Try adjusting your search query, category selection, or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ASSIGN BED ── */}
      {assignModalOpen && (
        <div className="hosp-modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="hosp-modal hosp-bed-assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUserPlus className="modal-header-icon" />
                <h2>Assign Hospital Bed</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setAssignModalOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="hosp-modal-form">
              {/* Select Available Bed */}
              <div className="form-group">
                <label>Select Available Bed *</label>
                <select
                  value={assignBedId}
                  onChange={(e) => setAssignBedId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Bed --</option>
                  {beds
                    .filter((b) => b.status === "Available" || b.status === "Reserved" || b.id === assignBedId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} — {b.wardType} ({b.room}) [{b.status}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Patient Selection Mode Toggle */}
              <div className="form-group">
                <label>Patient Information</label>
                <div className="patient-source-toggle">
                  <button
                    type="button"
                    className={`source-toggle-btn ${patientSource === "select" ? "source-toggle-btn--active" : ""}`}
                    onClick={() => setPatientSource("select")}
                  >
                    Select Admitted / Registered Patient
                  </button>
                  <button
                    type="button"
                    className={`source-toggle-btn ${patientSource === "custom" ? "source-toggle-btn--active" : ""}`}
                    onClick={() => setPatientSource("custom")}
                  >
                    New / Emergency Patient
                  </button>
                </div>
              </div>

              {/* Patient Choice Dropdown */}
              {patientSource === "select" ? (
                <div className="form-group">
                  <label>Choose Patient *</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    {registeredPatientsList.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.id}) — {pat.gender}, {pat.age} yrs [Attending: {pat.doctor}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Patient Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Anand Sharma"
                        value={customPatName}
                        onChange={(e) => setCustomPatName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group half">
                      <label>Patient ID</label>
                      <input
                        type="text"
                        placeholder="e.g. PAT-4125"
                        value={customPatId}
                        onChange={(e) => setCustomPatId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Age</label>
                      <input
                        type="number"
                        placeholder="e.g. 42"
                        value={customAge}
                        onChange={(e) => setCustomAge(e.target.value)}
                      />
                    </div>
                    <div className="form-group half">
                      <label>Gender</label>
                      <select
                        value={customGender}
                        onChange={(e) => setCustomGender(e.target.value)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Attending Doctor & Admission Date */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Attending Doctor</label>
                  <select
                    value={attendingDoctor}
                    onChange={(e) => setAttendingDoctor(e.target.value)}
                  >
                    <option value="Dr. Ayisha Shalba">Dr. Ayisha Shalba (Cardiology)</option>
                    <option value="Dr. Rajesh K. Nair">Dr. Rajesh K. Nair (Neurology)</option>
                    <option value="Dr. Priya Thomas">Dr. Priya Thomas (Pediatrics)</option>
                    <option value="Dr. Susan George">Dr. Susan George (Orthopedics)</option>
                    <option value="Dr. Vikram Shekar">Dr. Vikram Shekar (Dermatology)</option>
                    <option value="Dr. Amit Varma">Dr. Amit Varma (General Medicine)</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Admission Date *</label>
                  <input
                    type="text"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="form-group">
                <label>Admission Notes / Reason for Admission</label>
                <textarea
                  className="hosp-modal-textarea"
                  rows="2"
                  placeholder="e.g. Admitted under observation following ER consultation..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaCheckCircle />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RELEASE BED CONFIRMATION ── */}
      {releaseModalOpen && targetBed && (
        <div className="hosp-modal-overlay" onClick={() => setReleaseModalOpen(false)}>
          <div className="hosp-modal hosp-bed-release-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header modal-header--warning">
              <div className="modal-title-wrap">
                <FaExclamationTriangle className="modal-header-icon text-warning" />
                <h2>Release Bed Confirmation</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setReleaseModalOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="release-modal-body">
              <p className="release-warning-text">
                Are you sure you want to release <strong>Bed {targetBed.id}</strong>?
              </p>

              <div className="release-patient-summary">
                <div className="summary-line">
                  <span className="summary-label">Bed Number:</span>
                  <span className="summary-val-text font-bold">{targetBed.id} ({targetBed.room})</span>
                </div>
                <div className="summary-line">
                  <span className="summary-label">Ward Type:</span>
                  <span className={getCategoryBadgeClass(targetBed.wardType)}>{targetBed.wardType}</span>
                </div>
                <div className="summary-line">
                  <span className="summary-label">Patient Name:</span>
                  <span className="summary-val-text font-bold text-primary-color">
                    {targetBed.patientName || "Unassigned"}
                  </span>
                </div>
                {targetBed.patientId && (
                  <div className="summary-line">
                    <span className="summary-label">Patient ID:</span>
                    <span className="hosp-pat-id">{targetBed.patientId}</span>
                  </div>
                )}
                <div className="summary-line">
                  <span className="summary-label">Admission Date:</span>
                  <span className="summary-val-text">{targetBed.admissionDate || "—"}</span>
                </div>
              </div>

              <div className="release-notice-box">
                <FaInfoCircle className="notice-icon" />
                <span>
                  Confirming release will discharge the patient from this bed and reset its status to <strong>Available</strong>.
                </span>
              </div>
            </div>

            <div className="hosp-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setReleaseModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={handleConfirmRelease}
              >
                <FaSignOutAlt />
                <span>Confirm Release &amp; Set Available</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW DETAILS ── */}
      {detailsBed && (
        <div className="hosp-modal-overlay" onClick={() => setDetailsBed(null)}>
          <div className="hosp-modal hosp-bed-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaProcedures className="modal-header-icon" />
                <h2>Bed Details — {detailsBed.id}</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setDetailsBed(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="details-modal-body">
              {/* Status & Ward Header strip */}
              <div className="details-top-strip">
                <div>
                  <span className="details-bed-id">{detailsBed.id}</span>
                  <span className="details-room-id">{detailsBed.room}</span>
                </div>
                <div className="details-badges">
                  <span className={getCategoryBadgeClass(detailsBed.wardType)}>
                    {detailsBed.wardType}
                  </span>
                  <span className={getStatusBadgeClass(detailsBed.status)}>
                    {detailsBed.status}
                  </span>
                </div>
              </div>

              {/* Location & Infrastructure Details */}
              <div className="details-section">
                <h4 className="details-section-title">Location &amp; Infrastructure</h4>
                <div className="details-grid">
                  <div className="details-item">
                    <span className="item-label">Floor / Wing:</span>
                    <span className="item-value">{detailsBed.floor}</span>
                  </div>
                  <div className="details-item">
                    <span className="item-label">Room / Unit:</span>
                    <span className="item-value">{detailsBed.room}</span>
                  </div>
                  <div className="details-item full-width">
                    <span className="item-label">Installed Equipment:</span>
                    <span className="item-value text-secondary-info">{detailsBed.equipment}</span>
                  </div>
                </div>
              </div>

              {/* Patient & Occupancy Details */}
              <div className="details-section">
                <h4 className="details-section-title">Occupant Information</h4>
                {detailsBed.patientName ? (
                  <div className="details-patient-box">
                    <div className="patient-box-header">
                      <div>
                        <p className="patient-box-name">{detailsBed.patientName}</p>
                        <span className="hosp-pat-id">{detailsBed.patientId}</span>
                      </div>
                      {detailsBed.patientAge && (
                        <span className="patient-demographics">
                          {detailsBed.patientGender}, {detailsBed.patientAge} years
                        </span>
                      )}
                    </div>

                    <div className="details-grid" style={{ marginTop: "0.85rem" }}>
                      <div className="details-item">
                        <span className="item-label">Admission Date:</span>
                        <span className="item-value font-bold">{detailsBed.admissionDate}</span>
                      </div>
                      <div className="details-item">
                        <span className="item-label">Attending Doctor:</span>
                        <span className="item-value font-bold">{detailsBed.doctor || "General Duty Officer"}</span>
                      </div>
                      <div className="details-item full-width">
                        <span className="item-label">Clinical Notes:</span>
                        <span className="item-value">{detailsBed.notes}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="details-empty-patient">
                    <FaBed className="empty-bed-icon" />
                    <div>
                      <p className="font-bold">Bed is currently {detailsBed.status.toLowerCase()}</p>
                      <p className="text-muted text-sm">{detailsBed.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="hosp-modal-actions">
              {detailsBed.status === "Available" && (
                <button
                  type="button"
                  className="hosp-btn-submit"
                  onClick={() => {
                    const bedId = detailsBed.id;
                    setDetailsBed(null);
                    handleOpenAssignModal(bedId);
                  }}
                >
                  <FaUserPlus />
                  <span>Assign This Bed</span>
                </button>
              )}

              {(detailsBed.status === "Occupied" || detailsBed.status === "Reserved") && (
                <button
                  type="button"
                  className="btn-modal-danger"
                  onClick={() => {
                    const bedObj = detailsBed;
                    setDetailsBed(null);
                    handleOpenReleaseModal(bedObj);
                  }}
                >
                  <FaSignOutAlt />
                  <span>Release Bed</span>
                </button>
              )}

              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDetailsBed(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BedManagement;
