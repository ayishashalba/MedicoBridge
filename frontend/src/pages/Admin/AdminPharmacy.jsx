import React, { useState, useEffect } from "react";

import {
  FaPills,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaTrashAlt,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaEye,
  FaFlask,
  FaBuilding,
  FaFileContract,
  FaUndoAlt,
} from "react-icons/fa";

import "./AdminPages.css";

const statusColors = {
  Approved: {
    bg: "#dcfce7",
    color: "#16a34a",
    icon: <FaCheckCircle />,
  },
  "Pending Review": {
    bg: "#fef3c7",
    color: "#d97706",
    icon: <FaExclamationTriangle />,
  },
  Rejected: {
    bg: "#f1f5f9",
    color: "#64748b",
    icon: <FaTimesCircle />,
  },
  Blocked: {
    bg: "#fee2e2",
    color: "#dc2626",
    icon: <FaBan />,
  },
};

export default function AdminPharmacy() {
  const [medicines, setMedicines] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pharmacyFilter, setPharmacyFilter] = useState("All");
  const [rxFilter, setRxFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [selectedMed, setSelectedMed] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [actionReason, setActionReason] = useState("");
  const [targetMed, setTargetMed] = useState(null);

  const [toastMsg, setToastMsg] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);

    setTimeout(() => {
      setToastMsg("");
    }, 3000);
  };

  // ============================================================
  // FETCH ADMIN MEDICINES
  // ============================================================

  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (statusFilter !== "All") {
        params.append("approvalStatus", statusFilter);
      }

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch medicines."
        );
      }

      const medicineList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      setMedicines(medicineList);
    } catch (error) {
      console.error("Fetch admin medicines error:", error);
      triggerToast(error.message || "Failed to fetch medicines.");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search, statusFilter]);

  // ============================================================
  // HELPER
  // ============================================================

  const getMedicineId = (med) => {
    return med?._id || med?.id;
  };

  const getPharmacyName = (med) => {
    if (med?.pharmacyId?.name) {
      return med.pharmacyId.name;
    }

    return "Unknown Pharmacy";
  };

  const getPharmacyCity = (med) => {
    if (med?.pharmacyId?.city) {
      return med.pharmacyId.city;
    }

    return "Location not provided";
  };

  const getPharmacyType = (med) => {
    return med?.isHospital ? "Hospital" : "Retail";
  };

  const getExpiryDate = (date) => {
    if (!date) {
      return "Not provided";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not provided";
    }

    return parsedDate.toLocaleDateString();
  };

  const getSubmittedDate = (date) => {
    if (!date) {
      return "Not provided";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not provided";
    }

    return parsedDate.toLocaleDateString();
  };

  // ============================================================
  // 1. APPROVE MEDICINE
  // ============================================================

  const handleApprove = async (med) => {
    const id = getMedicineId(med);

    if (!id) {
      triggerToast("Medicine ID not found.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to approve medicine."
        );
      }

      triggerToast(
        "Medicine verified & approved for platform catalog."
      );

      await fetchMedicines();

      setSelectedMed(null);
    } catch (error) {
      console.error("Approve medicine error:", error);

      triggerToast(
        error.message || "Failed to approve medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // 2. REJECT MEDICINE
  // ============================================================

  const handleRejectSubmit = async (e) => {
    e.preventDefault();

    if (!targetMed) {
      return;
    }

    const id = getMedicineId(targetMed);

    if (!id) {
      triggerToast("Medicine ID not found.");
      return;
    }

    if (!actionReason.trim()) {
      triggerToast("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            rejectionReason: actionReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to reject medicine."
        );
      }

      setShowRejectModal(false);
      setTargetMed(null);
      setActionReason("");
      setSelectedMed(null);

      triggerToast(
        "Submission rejected and pharmacy notified."
      );

      await fetchMedicines();
    } catch (error) {
      console.error("Reject medicine error:", error);

      triggerToast(
        error.message || "Failed to reject medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // 3. BLOCK / BAN MEDICINE
  // ============================================================

  const handleBlockSubmit = async (e) => {
    e.preventDefault();

    if (!targetMed) {
      return;
    }

    const id = getMedicineId(targetMed);

    if (!id) {
      triggerToast("Medicine ID not found.");
      return;
    }

    if (!actionReason.trim()) {
      triggerToast("Please provide a ban reason.");
      return;
    }

    try {
      setActionLoading(true);

      const medicineName = targetMed.name;

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines/${id}/block`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            banReason: actionReason.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to block medicine."
        );
      }

      setShowBlockModal(false);
      setTargetMed(null);
      setActionReason("");
      setSelectedMed(null);

      triggerToast(
        `DRUG BLOCKED: "${medicineName}" banned platform-wide.`
      );

      await fetchMedicines();
    } catch (error) {
      console.error("Block medicine error:", error);

      triggerToast(
        error.message || "Failed to block medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // 4. UNBLOCK MEDICINE
  // ============================================================

  const handleUnblock = async (med) => {
    const id = getMedicineId(med);

    if (!id) {
      triggerToast("Medicine ID not found.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines/${id}/unblock`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to unblock medicine."
        );
      }

      triggerToast(
        "Medicine unblocked and restored to approved status."
      );

      await fetchMedicines();

      setSelectedMed(null);
    } catch (error) {
      console.error("Unblock medicine error:", error);

      triggerToast(
        error.message || "Failed to unblock medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // 5. DELETE MEDICINE
  // ============================================================

  const handleDelete = async (med) => {
    const id = getMedicineId(med);
    const name = med?.name || "this medicine";

    if (!id) {
      triggerToast("Medicine ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delist and remove "${name}" from platform compliance database?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/admin/medicines/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete medicine."
        );
      }

      setSelectedMed(null);

      triggerToast(
        `Delisted "${name}" from platform registry.`
      );

      await fetchMedicines();
    } catch (error) {
      console.error("Delete medicine error:", error);

      triggerToast(
        error.message || "Failed to delete medicine."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // FILTERED LIST
  // ============================================================

  const filtered = medicines.filter((m) => {
    const searchValue = search.toLowerCase().trim();

    const medicineName = (m?.name || "").toLowerCase();
    const genericName = (m?.genericName || "").toLowerCase();
    const manufacturer = (m?.manufacturer || "").toLowerCase();
    const pharmacyName = getPharmacyName(m).toLowerCase();
    const pharmacyCity = getPharmacyCity(m).toLowerCase();

    const matchSearch =
      !searchValue ||
      medicineName.includes(searchValue) ||
      genericName.includes(searchValue) ||
      manufacturer.includes(searchValue) ||
      pharmacyName.includes(searchValue) ||
      pharmacyCity.includes(searchValue);

    const matchStatus =
      statusFilter === "All" ||
      m?.approvalStatus === statusFilter;

    const matchCategory =
      categoryFilter === "All" ||
      m?.category === categoryFilter;

    const matchPharmacy =
      pharmacyFilter === "All" ||
      pharmacyName === pharmacyFilter.toLowerCase();

    const matchRx =
      rxFilter === "All" ||
      (rxFilter === "Rx"
        ? m?.requiresPrescription === true
        : m?.requiresPrescription !== true);

    return (
      matchSearch &&
      matchStatus &&
      matchCategory &&
      matchPharmacy &&
      matchRx
    );
  });

  // ============================================================
  // DYNAMIC FILTER OPTIONS
  // ============================================================

  const categories = [
    ...new Set(
      medicines
        .map((m) => m?.category)
        .filter(Boolean)
    ),
  ];

  const pharmacies = [
    ...new Set(
      medicines
        .map((m) => getPharmacyName(m))
        .filter(
          (name) => name && name !== "Unknown Pharmacy"
        )
    ),
  ];

  // ============================================================
  // KPI METRICS
  // ============================================================

  const totalDrugs = medicines.length;

  const pendingReviewCount = medicines.filter(
    (m) => m?.approvalStatus === "Pending Review"
  ).length;

  const approvedCount = medicines.filter(
    (m) => m?.approvalStatus === "Approved"
  ).length;

  const blockedCount = medicines.filter(
    (m) => m?.approvalStatus === "Blocked"
  ).length;

  return (
    <div className="ad-page">

      {/* ====================================================== */}
      {/* TOAST */}
      {/* ====================================================== */}

      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#1e293b",
            color: "#fff",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "adFadeIn 0.3s ease",
          }}
        >
          <FaShieldAlt style={{ color: "#10b981" }} />

          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            {toastMsg}
          </span>
        </div>
      )}

      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaShieldAlt
            style={{
              color: "var(--ad-primary)",
            }}
          />

          Medicine Verification & Drug Safety Authority
        </h2>

        <p>
          Platform regulatory governance: Inspect pharmacy-submitted
          medicines, verify manufacturer information, and approve,
          reject, or ban substandard/state-blocked drugs
        </p>
      </div>

      {/* ====================================================== */}
      {/* KPI STATS */}
      {/* ====================================================== */}

      <div className="ad-kpi-grid">

        {/* Total */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0e7ff",
              color: "#4f46e5",
            }}
          >
            <FaPills />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Cataloged Drugs
            </span>

            <h3 className="ad-kpi-value">
              {totalDrugs} Drugs
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--ad-text-muted)",
              }}
            >
              Across All Pharmacies
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#fef3c7",
              color: "#d97706",
            }}
          >
            <FaExclamationTriangle />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Pending Verification
            </span>

            <h3
              className="ad-kpi-value"
              style={{
                color:
                  pendingReviewCount > 0
                    ? "#d97706"
                    : "inherit",
              }}
            >
              {pendingReviewCount} Awaiting Review
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#d97706",
                fontWeight: "600",
              }}
            >
              Action Required
            </span>
          </div>
        </div>

        {/* Approved */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <FaCheckCircle />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Approved & Active
            </span>

            <h3 className="ad-kpi-value">
              {approvedCount} Listed
            </h3>

            <span className="ad-kpi-delta up">
              Compliant Medicines
            </span>
          </div>
        </div>

        {/* Blocked */}
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#fee2e2",
              color: "#dc2626",
            }}
          >
            <FaBan />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Blocked / Banned
            </span>

            <h3
              className="ad-kpi-value"
              style={{
                color:
                  blockedCount > 0
                    ? "#dc2626"
                    : "inherit",
              }}
            >
              {blockedCount} Banned
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#dc2626",
                fontWeight: "600",
              }}
            >
              Platform Delisted
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* MAIN CARD */}
      {/* ====================================================== */}

      <div className="ad-card">

        {/* ==================================================== */}
        {/* SEARCH + FILTER */}
        {/* ==================================================== */}

        <div
          className="ad-search-filter-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >

          {/* Search */}
          <div
            className="ad-search-wrapper"
            style={{
              flex: 1,
              minWidth: "260px",
            }}
          >
            <FaSearch className="ad-search-icon" />

            <input
              type="text"
              placeholder="Search by drug name, generic formula, manufacturer, pharmacy..."
              className="ad-input"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div
            className="ad-filters"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >

            {/* Status */}
            <select
              className="ad-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              style={{
                width: "165px",
              }}
            >
              <option value="All">
                All Approval Statuses
              </option>

              <option value="Pending Review">
                Pending Review
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Blocked">
                Blocked / Banned
              </option>
            </select>

            {/* Category */}
            <select
              className="ad-select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              style={{
                width: "145px",
              }}
            >
              <option value="All">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {/* Pharmacy */}
            <select
              className="ad-select"
              value={pharmacyFilter}
              onChange={(e) =>
                setPharmacyFilter(e.target.value)
              }
              style={{
                width: "160px",
              }}
            >
              <option value="All">
                All Pharmacies
              </option>

              {pharmacies.map((pharmacy) => (
                <option
                  key={pharmacy}
                  value={pharmacy}
                >
                  {pharmacy}
                </option>
              ))}
            </select>

            {/* Prescription */}
            <select
              className="ad-select"
              value={rxFilter}
              onChange={(e) =>
                setRxFilter(e.target.value)
              }
              style={{
                width: "135px",
              }}
            >
              <option value="All">
                All Types
              </option>

              <option value="Rx">
                Prescription
              </option>

              <option value="OTC">
                OTC
              </option>
            </select>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TABLE */}
        {/* ==================================================== */}

        <div className="ad-table-wrap">

          <table className="ad-table">

            <thead>
              <tr>
                <th>
                  Drug & Generic Formula
                </th>

                <th>
                  Manufacturer
                </th>

                <th>
                  Stock & Expiry
                </th>

                <th>
                  Submitting Pharmacy
                </th>

                <th>
                  Prescription
                </th>

                <th>
                  Regulatory Status
                </th>

                <th>
                  Compliance Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    Loading medicines...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    No medicines match the selected
                    filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((med) => {

                  const sc =
                    statusColors[
                    med?.approvalStatus
                    ] || {
                      bg: "#f1f5f9",
                      color: "#64748b",
                      icon: null,
                    };

                  const isBlocked =
                    med?.approvalStatus ===
                    "Blocked";

                  const isPending =
                    med?.approvalStatus ===
                    "Pending Review";

                  return (
                    <tr
                      key={getMedicineId(med)}
                      style={{
                        background: isBlocked
                          ? "#fff5f5"
                          : isPending
                            ? "#fffdf5"
                            : "inherit",
                      }}
                    >

                      {/* Drug */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.6rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.3rem",
                            }}
                          >
                            💊
                          </span>

                          <div>
                            <strong
                              style={{
                                display: "block",
                                color:
                                  "var(--ad-text-primary)",
                              }}
                            >
                              {med?.name ||
                                "Unnamed Medicine"}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                fontSize:
                                  "0.74rem",
                                color:
                                  "var(--ad-text-secondary)",
                              }}
                            >
                              {med?.genericName ||
                                "Generic not provided"}{" "}
                              ·{" "}
                              {med?.category ||
                                "General"}
                            </span>

                            <span
                              className="ad-id-badge"
                              style={{
                                fontSize: "0.68rem",
                                marginTop: "2px",
                              }}
                            >
                              {getMedicineId(med)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Manufacturer */}
                      <td>
                        <div>
                          <strong>
                            {med?.manufacturer ||
                              "Not provided"}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              color:
                                "var(--ad-text-muted)",
                              marginTop: "3px",
                            }}
                          >
                            {med?.dosageForm ||
                              "Tablet"}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td>
                        <strong>
                          {med?.stock ?? 0}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            fontSize: "0.72rem",
                            color:
                              med?.stock === 0
                                ? "#dc2626"
                                : med?.stock <= 10
                                  ? "#d97706"
                                  : "#16a34a",
                            marginTop: "2px",
                          }}
                        >
                          {med?.stock === 0
                            ? "Out of Stock"
                            : med?.stock <= 10
                              ? "Low Stock"
                              : "Normal Stock"}
                        </span>

                        <span
                          style={{
                            display: "block",
                            fontSize: "0.72rem",
                            color:
                              "var(--ad-text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          Exp:{" "}
                          {getExpiryDate(
                            med?.expiryDate
                          )}
                        </span>
                      </td>

                      {/* Pharmacy */}
                      <td>
                        <div>
                          <strong>
                            {getPharmacyName(med)}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              color:
                                "var(--ad-text-muted)",
                            }}
                          >
                            {getPharmacyType(med)}{" "}
                            (
                            {getPharmacyCity(med)}
                            )
                          </span>
                        </div>
                      </td>

                      {/* Prescription */}
                      <td>
                        {med?.requiresPrescription ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              background:
                                "#ede9fe",
                              color:
                                "#6d28d9",
                              padding:
                                "0.15rem 0.45rem",
                              borderRadius: "4px",
                              fontWeight: "700",
                            }}
                          >
                            Rx (Prescription)
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              background:
                                "#e0f2fe",
                              color:
                                "#0284c7",
                              padding:
                                "0.15rem 0.45rem",
                              borderRadius: "4px",
                              fontWeight: "600",
                            }}
                          >
                            OTC
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className="ad-pill"
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          {sc.icon}

                          {med?.approvalStatus ||
                            "Pending Review"}
                        </span>

                        {med?.banReason && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.68rem",
                              color: "#dc2626",
                              marginTop: "3px",
                              maxWidth: "160px",
                            }}
                          >
                            {med.banReason}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            flexWrap: "wrap",
                          }}
                        >

                          {/* Inspect */}
                          <button
                            className="ad-btn ad-btn-primary"
                            style={{
                              padding:
                                "0.3rem 0.6rem",
                              fontSize:
                                "0.75rem",
                            }}
                            onClick={() =>
                              setSelectedMed(
                                med
                              )
                            }
                            disabled={actionLoading}
                            title="Inspect Complete Drug Dossier"
                          >
                            <FaEye /> Inspect
                          </button>

                          {/* Approve */}
                          {med?.approvalStatus !==
                            "Approved" &&
                            med?.approvalStatus !==
                            "Blocked" && (
                              <button
                                className="ad-btn"
                                style={{
                                  background:
                                    "#dcfce7",
                                  color:
                                    "#15803d",
                                  padding:
                                    "0.3rem 0.6rem",
                                  fontSize:
                                    "0.75rem",
                                  borderRadius:
                                    "6px",
                                  border: "none",
                                }}
                                onClick={() =>
                                  handleApprove(
                                    med
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                title="Approve for platform catalog"
                              >
                                <FaCheckCircle />{" "}
                                Approve
                              </button>
                            )}

                          {/* Reject */}
                          {med?.approvalStatus !==
                            "Rejected" &&
                            med?.approvalStatus !==
                            "Blocked" && (
                              <button
                                className="ad-btn"
                                style={{
                                  background:
                                    "#fef3c7",
                                  color:
                                    "#b45309",
                                  padding:
                                    "0.3rem 0.55rem",
                                  fontSize:
                                    "0.75rem",
                                  borderRadius:
                                    "6px",
                                  border: "none",
                                }}
                                onClick={() => {
                                  setTargetMed(
                                    med
                                  );
                                  setActionReason(
                                    ""
                                  );
                                  setShowRejectModal(
                                    true
                                  );
                                }}
                                disabled={
                                  actionLoading
                                }
                                title="Reject submission"
                              >
                                <FaTimesCircle />{" "}
                                Reject
                              </button>
                            )}

                          {/* Block / Unblock */}
                          {med?.approvalStatus !==
                            "Blocked" ? (
                            <button
                              className="ad-btn ad-btn-danger"
                              style={{
                                padding:
                                  "0.3rem 0.55rem",
                                fontSize:
                                  "0.75rem",
                              }}
                              onClick={() => {
                                setTargetMed(
                                  med
                                );
                                setActionReason(
                                  ""
                                );
                                setShowBlockModal(
                                  true
                                );
                              }}
                              disabled={
                                actionLoading
                              }
                              title="Block & Ban Drug Platform-wide"
                            >
                              <FaBan /> Block/Ban
                            </button>
                          ) : (
                            <button
                              className="ad-btn ad-btn-outline"
                              style={{
                                padding:
                                  "0.3rem 0.55rem",
                                fontSize:
                                  "0.75rem",
                              }}
                              onClick={() =>
                                handleUnblock(
                                  med
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              title="Unblock Drug"
                            >
                              <FaUndoAlt /> Unblock
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            className="ad-btn ad-btn-outline"
                            style={{
                              padding:
                                "0.3rem 0.45rem",
                              fontSize:
                                "0.75rem",
                              color: "#dc2626",
                            }}
                            onClick={() =>
                              handleDelete(med)
                            }
                            disabled={
                              actionLoading
                            }
                            title="Permanently Delist Drug"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================== */}
      {/* DRUG DOSSIER MODAL */}
      {/* ====================================================== */}

      {selectedMed && (
        <div
          className="ad-modal-overlay"
          onClick={() =>
            !actionLoading &&
            setSelectedMed(null)
          }
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "680px",
            }}
          >

            {/* Header */}
            <div className="ad-modal-header">

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                  }}
                >
                  💊
                </span>

                <div>
                  <h3
                    className="ad-modal-title"
                    style={{
                      margin: 0,
                    }}
                  >
                    Drug Verification Dossier:{" "}
                    {selectedMed?.name}
                  </h3>

                  <span
                    className="ad-id-badge"
                    style={{
                      marginTop: "3px",
                    }}
                  >
                    {getMedicineId(
                      selectedMed
                    )}
                  </span>
                </div>
              </div>

              <button
                className="ad-modal-close"
                onClick={() =>
                  !actionLoading &&
                  setSelectedMed(null)
                }
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div
              className="ad-modal-body"
              style={{
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >

              {/* Status */}
              <div
                style={{
                  background:
                    statusColors[
                      selectedMed
                        ?.approvalStatus
                    ]?.bg || "#f1f5f9",
                  color:
                    statusColors[
                      selectedMed
                        ?.approvalStatus
                    ]?.color || "#64748b",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  fontWeight: "700",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  {
                    statusColors[
                      selectedMed
                        ?.approvalStatus
                    ]?.icon
                  }

                  Verification Status:{" "}
                  {selectedMed?.approvalStatus ||
                    "Pending Review"}
                </span>

                <span
                  style={{
                    fontSize: "0.82rem",
                  }}
                >
                  Lab Status:{" "}
                  {selectedMed
                    ?.labVerificationStatus ||
                    "Pending"}
                </span>
              </div>

              {/* Ban Reason */}
              {selectedMed?.banReason && (
                <div
                  style={{
                    background: "#fee2e2",
                    border:
                      "1px solid #fecaca",
                    padding:
                      "0.75rem 1rem",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "0.85rem",
                    marginTop: "1rem",
                  }}
                >
                  <strong>
                    Enforcement Notice:
                  </strong>{" "}
                  {selectedMed.banReason}
                </div>
              )}

              {/* Medicine Info */}
              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >

                {/* Formulation */}
                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize:
                        "0.88rem",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaFlask />

                    Medicine Information
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontWeight: "700",
                    }}
                  >
                    {selectedMed
                      ?.genericName ||
                      "Generic name not provided"}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Form:{" "}
                    {selectedMed
                      ?.dosageForm ||
                      "Tablet"}{" "}
                    · Category:{" "}
                    {selectedMed
                      ?.category ||
                      "General"}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Price: ₹
                    {selectedMed?.price ??
                      0}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Classification:{" "}
                    {selectedMed
                      ?.requiresPrescription
                      ? "Prescription Required"
                      : "General Sale / OTC"}
                  </p>
                </div>

                {/* Manufacturer */}
                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize:
                        "0.88rem",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaBuilding />

                    Manufacturing Information
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontWeight: "700",
                    }}
                  >
                    {selectedMed
                      ?.manufacturer ||
                      "Not provided"}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Stock:{" "}
                    <strong>
                      {selectedMed?.stock ??
                        0}
                    </strong>
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.2rem",
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Expiry:{" "}
                    <strong>
                      {getExpiryDate(
                        selectedMed
                          ?.expiryDate
                      )}
                    </strong>
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Availability:{" "}
                    <strong>
                      {selectedMed
                        ?.isAvailable
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Pharmacy */}
              <div
                style={{
                  background: "#f8fafc",
                  border:
                    "1px solid var(--ad-border-color)",
                  padding: "1rem",
                  borderRadius: "10px",
                  marginTop: "1rem",
                }}
              >
                <h4
                  style={{
                    margin:
                      "0 0 0.5rem",
                    fontSize:
                      "0.9rem",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "0.4rem",
                  }}
                >
                  <FaFileContract />

                  Submitting Pharmacy Entity
                </h4>

                <div
                  className="ad-grid-3"
                  style={{
                    gap: "0.5rem",
                    fontSize:
                      "0.82rem",
                  }}
                >

                  <div>
                    <span
                      style={{
                        color:
                          "var(--ad-text-muted)",
                        display:
                          "block",
                      }}
                    >
                      Pharmacy
                    </span>

                    <strong>
                      {getPharmacyName(
                        selectedMed
                      )}
                    </strong>
                  </div>

                  <div>
                    <span
                      style={{
                        color:
                          "var(--ad-text-muted)",
                        display:
                          "block",
                      }}
                    >
                      Type & Region
                    </span>

                    <strong>
                      {getPharmacyType(
                        selectedMed
                      )}{" "}
                      (
                      {getPharmacyCity(
                        selectedMed
                      )}
                      )
                    </strong>
                  </div>

                  <div>
                    <span
                      style={{
                        color:
                          "var(--ad-text-muted)",
                        display:
                          "block",
                      }}
                    >
                      Submitted On
                    </span>

                    <strong>
                      {getSubmittedDate(
                        selectedMed?.createdAt
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedMed?.description && (
                <div
                  style={{
                    marginTop: "1rem",
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize:
                        "0.88rem",
                    }}
                  >
                    Description
                  </h4>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    {selectedMed.description}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div
                className="ad-modal-footer"
                style={{
                  marginTop: "1rem",
                }}
              >

                {selectedMed?.approvalStatus !==
                  "Approved" &&
                  selectedMed?.approvalStatus !==
                  "Blocked" && (
                    <button
                      type="button"
                      className="ad-btn"
                      style={{
                        background:
                          "#dcfce7",
                        color:
                          "#15803d",
                      }}
                      onClick={() =>
                        handleApprove(
                          selectedMed
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaCheckCircle />

                      {actionLoading
                        ? "Processing..."
                        : "Approve for Platform Listing"}
                    </button>
                  )}

                {selectedMed?.approvalStatus ===
                  "Blocked" && (
                    <button
                      type="button"
                      className="ad-btn ad-btn-outline"
                      onClick={() =>
                        handleUnblock(
                          selectedMed
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <FaUndoAlt />

                      {actionLoading
                        ? "Processing..."
                        : "Unblock Drug"}
                    </button>
                  )}

                {selectedMed?.approvalStatus !==
                  "Blocked" && (
                    <button
                      type="button"
                      className="ad-btn ad-btn-danger"
                      onClick={() => {
                        setTargetMed(
                          selectedMed
                        );
                        setActionReason(
                          ""
                        );
                        setShowBlockModal(
                          true
                        );
                      }}
                      disabled={
                        actionLoading
                      }
                    >
                      <FaBan />

                      Block/Ban Drug
                    </button>
                  )}

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() =>
                    !actionLoading &&
                    setSelectedMed(null)
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* REJECT MODAL */}
      {/* ====================================================== */}

      {showRejectModal && (
        <div
          className="ad-modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setShowRejectModal(false);
              setTargetMed(null);
              setActionReason("");
            }
          }}
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "480px",
            }}
          >

            <div className="ad-modal-header">

              <h3 className="ad-modal-title">
                <FaTimesCircle
                  style={{
                    color: "#d97706",
                  }}
                />

                Reject Medicine Submission
              </h3>

              <button
                className="ad-modal-close"
                onClick={() => {
                  if (!actionLoading) {
                    setShowRejectModal(
                      false
                    );
                    setTargetMed(null);
                    setActionReason("");
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleRejectSubmit
              }
              className="ad-modal-body"
            >

              <p
                style={{
                  fontSize: "0.85rem",
                  color:
                    "var(--ad-text-secondary)",
                }}
              >
                Rejecting submission of{" "}
                <strong>
                  {targetMed?.name}
                </strong>{" "}
                from{" "}
                <strong>
                  {getPharmacyName(
                    targetMed
                  )}
                </strong>
                .
              </p>

              <div className="ad-form-group">

                <label>
                  Reason for Rejection *
                </label>

                <textarea
                  rows="3"
                  required
                  className="ad-textarea"
                  value={actionReason}
                  onChange={(e) =>
                    setActionReason(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Missing manufacturer information / Invalid medicine submission"
                  disabled={
                    actionLoading
                  }
                />
              </div>

              <div className="ad-modal-footer">

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() => {
                    if (!actionLoading) {
                      setShowRejectModal(
                        false
                      );
                      setTargetMed(null);
                      setActionReason("");
                    }
                  }}
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn"
                  style={{
                    background:
                      "#fef3c7",
                    color:
                      "#b45309",
                  }}
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Processing..."
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* BLOCK / BAN MODAL */}
      {/* ====================================================== */}

      {showBlockModal && (
        <div
          className="ad-modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setShowBlockModal(false);
              setTargetMed(null);
              setActionReason("");
            }
          }}
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "480px",
            }}
          >

            <div className="ad-modal-header">

              <h3
                className="ad-modal-title"
                style={{
                  color: "#dc2626",
                }}
              >
                <FaBan />

                Enforce Drug Ban / Platform Block
              </h3>

              <button
                className="ad-modal-close"
                onClick={() => {
                  if (!actionLoading) {
                    setShowBlockModal(
                      false
                    );
                    setTargetMed(null);
                    setActionReason("");
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleBlockSubmit
              }
              className="ad-modal-body"
            >

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#dc2626",
                }}
              >
                Warning: Blocking{" "}
                <strong>
                  {targetMed?.name}
                </strong>{" "}
                will immediately ban and
                delist this product across
                MedicoBridge.
              </p>

              <div className="ad-form-group">

                <label>
                  Regulatory Ban Reason /
                  Defect Flag *
                </label>

                <textarea
                  rows="3"
                  required
                  className="ad-textarea"
                  value={actionReason}
                  onChange={(e) =>
                    setActionReason(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Substandard laboratory assay / Counterfeit packaging detected / Central Drug Recall order"
                  disabled={
                    actionLoading
                  }
                />
              </div>

              <div className="ad-modal-footer">

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() => {
                    if (!actionLoading) {
                      setShowBlockModal(
                        false
                      );
                      setTargetMed(null);
                      setActionReason("");
                    }
                  }}
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn ad-btn-danger"
                  disabled={
                    actionLoading
                  }
                >
                  <FaBan />

                  {actionLoading
                    ? "Processing..."
                    : "Enforce Platform Ban"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}