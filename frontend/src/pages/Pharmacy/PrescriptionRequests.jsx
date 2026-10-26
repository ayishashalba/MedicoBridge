import React, { useEffect, useState } from "react";

import {
  FaFilePrescription,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
} from "react-icons/fa";

import "./PharmacyPages.css";

const statusColor = {
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Dispensed: { bg: "#dcfce7", color: "#16a34a" },
  "On Hold": { bg: "#fee2e2", color: "#dc2626" },
  Approved: { bg: "#dcfce7", color: "#16a34a" },
};

export default function PrescriptionRequests() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedRx, setSelectedRx] = useState(null);
  const [rxList, setRxList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  // ============================================================
  // FETCH REAL PRESCRIPTIONS
  // ============================================================
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE}/pharmacy/prescriptions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch prescriptions."
        );
      }

      const prescriptions =
        result?.data?.prescriptions ||
        result?.data ||
        [];

      setRxList(
        Array.isArray(prescriptions)
          ? prescriptions
          : []
      );
    } catch (err) {
      console.error(
        "Prescription fetch error:",
        err
      );

      setError(
        err.message ||
        "Failed to load prescriptions."
      );

      setRxList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const getRxId = (rx) => {
    return (
      rx?.prescriptionNumber ||
      rx?.prescriptionId ||
      rx?._id ||
      "—"
    );
  };

  const getPatientName = (rx) => {
    if (rx?.patientId?.name) {
      return rx.patientId.name;
    }

    if (rx?.patient?.name) {
      return rx.patient.name;
    }

    if (typeof rx?.patientId === "string") {
      return rx.patientId;
    }

    return "Unknown Patient";
  };

  const getDoctorName = (rx) => {
    if (rx?.doctorId?.name) {
      return rx.doctorId.name;
    }

    if (rx?.doctor?.name) {
      return rx.doctor.name;
    }

    if (typeof rx?.doctorId === "string") {
      return rx.doctorId;
    }

    return "—";
  };

  const getPatientAge = (rx) => {
    if (rx?.patientId?.dob) {
      const dob = new Date(rx.patientId.dob);
      const today = new Date();

      let age =
        today.getFullYear() -
        dob.getFullYear();

      const monthDifference =
        today.getMonth() - dob.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 &&
          today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age;
    }

    if (rx?.patient?.dob) {
      const dob = new Date(rx.patient.dob);
      const today = new Date();

      let age =
        today.getFullYear() -
        dob.getFullYear();

      const monthDifference =
        today.getMonth() - dob.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 &&
          today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age;
    }

    if (rx?.age !== undefined) {
      return rx.age;
    }

    return "—";
  };

  const getRxDate = (rx) => {
    const date =
      rx?.createdAt ||
      rx?.date ||
      rx?.prescriptionDate;

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRxStatus = (rx) => {
    return (
      rx?.status ||
      rx?.prescriptionStatus ||
      "Pending"
    );
  };

  const getRxType = (rx) => {
    return (
      rx?.type ||
      rx?.prescriptionType ||
      rx?.source ||
      "Online"
    );
  };

  const getItems = (rx) => {
    if (Array.isArray(rx?.medicines)) {
      return rx.medicines;
    }

    if (Array.isArray(rx?.items)) {
      return rx.items;
    }

    if (Array.isArray(rx?.prescribedMedicines)) {
      return rx.prescribedMedicines;
    }

    return [];
  };

  const getMedicineName = (item) => {
    if (typeof item === "string") {
      return item;
    }

    return (
      item?.medicineName ||
      item?.name ||
      item?.medicineId?.name ||
      item?.medicine?.name ||
      "Medicine"
    );
  };

  const getMedicineQuantity = (item) => {
    if (typeof item === "string") {
      return "";
    }

    const quantity =
      item?.quantity ||
      item?.qty ||
      item?.count;

    return quantity
      ? ` x${quantity}`
      : "";
  };

  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filtered = rxList.filter((rx) => {
    const patientName =
      getPatientName(rx).toLowerCase();

    const rxId =
      getRxId(rx).toString().toLowerCase();

    const doctorName =
      getDoctorName(rx).toLowerCase();

    const query =
      search.toLowerCase().trim();

    const matchSearch =
      !query ||
      patientName.includes(query) ||
      rxId.includes(query) ||
      doctorName.includes(query);

    const matchFilter =
      filter === "All" ||
      getRxStatus(rx) === filter;

    return matchSearch && matchFilter;
  });

  // ============================================================
  // VERIFY / DISPENSE
  // ============================================================

  const dispense = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE}/pharmacy/prescriptions/${id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update prescription."
        );
      }

      await fetchPrescriptions();
      setSelectedRx(null);
    } catch (err) {
      console.error(
        "Dispense prescription error:",
        err
      );

      alert(
        err.message ||
        "Failed to mark prescription as dispensed."
      );
    }
  };

  // ============================================================
  // HOLD
  // ============================================================

  const hold = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE}/pharmacy/prescriptions/${id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "On Hold",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update prescription."
        );
      }

      await fetchPrescriptions();
      setSelectedRx(null);
    } catch (err) {
      console.error(
        "Hold prescription error:",
        err
      );

      alert(
        err.message ||
        "Failed to put prescription on hold."
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="ph-page">

      {/* Header */}
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaFilePrescription /> Prescription Requests
          </h2>

          <p className="ph-page-sub">
            Review and dispense incoming prescriptions
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ph-toolbar">

        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />

          <input
            placeholder="Search by patient or Rx ID…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="ph-filter-box">
          <FaFilter className="ph-filter-icon" />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option>All</option>
            <option>Pending</option>
            <option>Dispensed</option>
            <option>On Hold</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="ph-card">
          <div className="ph-empty">
            Loading prescriptions...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="ph-card">
          <div
            className="ph-empty"
            style={{ color: "#dc2626" }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="ph-card">
          <div className="ph-table-wrap">
            <table className="ph-table">

              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="ph-empty"
                    >
                      No prescriptions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((rx) => {
                    const status =
                      getRxStatus(rx);

                    const s =
                      statusColor[status] ||
                      {
                        bg: "#f1f5f9",
                        color: "#475569",
                      };

                    const items =
                      getItems(rx);

                    return (
                      <tr
                        key={
                          rx?._id ||
                          getRxId(rx)
                        }
                      >
                        <td>
                          <span className="ph-id-badge">
                            {getRxId(rx)}
                          </span>
                        </td>

                        <td>
                          <div className="ph-patient-cell">
                            <span className="ph-name">
                              {getPatientName(rx)}
                            </span>

                            <span className="ph-age">
                              Age {getPatientAge(rx)}
                            </span>
                          </div>
                        </td>

                        <td>
                          {getDoctorName(rx)}
                        </td>

                        <td>
                          <span className="ph-count-badge">
                            {items.length} items
                          </span>
                        </td>

                        <td>
                          {getRxDate(rx)}
                        </td>

                        <td>
                          {getRxType(rx)}
                        </td>

                        <td>
                          <span
                            className="ph-pill"
                            style={{
                              background: s.bg,
                              color: s.color,
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="ph-btn-view"
                            onClick={() =>
                              setSelectedRx(rx)
                            }
                          >
                            <FaEye /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRx && (
        <div
          className="ph-modal-overlay"
          onClick={() =>
            setSelectedRx(null)
          }
        >
          <div
            className="ph-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="ph-modal-header">
              <h3>
                Prescription —{" "}
                {getRxId(selectedRx)}
              </h3>

              <button
                className="ph-modal-close"
                onClick={() =>
                  setSelectedRx(null)
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="ph-modal-body">

              <div className="ph-modal-info-grid">

                <div>
                  <span className="ph-info-label">
                    Patient
                  </span>

                  <span className="ph-info-val">
                    {getPatientName(selectedRx)},
                    {" "}
                    Age {getPatientAge(selectedRx)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Doctor
                  </span>

                  <span className="ph-info-val">
                    {getDoctorName(selectedRx)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Date
                  </span>

                  <span className="ph-info-val">
                    {getRxDate(selectedRx)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Type
                  </span>

                  <span className="ph-info-val">
                    {getRxType(selectedRx)}
                  </span>
                </div>

              </div>

              <h4 className="ph-modal-section-title">
                Prescribed Medicines
              </h4>

              <ul className="ph-rx-items">

                {getItems(selectedRx).length > 0 ? (
                  getItems(selectedRx).map(
                    (item, i) => (
                      <li key={i}>
                        <FaCheck className="ph-check-icon" />

                        {getMedicineName(item)}

                        {getMedicineQuantity(item)}
                      </li>
                    )
                  )
                ) : (
                  <li>
                    <FaCheck className="ph-check-icon" />
                    No medicine details available.
                  </li>
                )}

              </ul>

              {getRxStatus(selectedRx) ===
                "Pending" && (
                  <div className="ph-modal-actions">

                    <button
                      className="ph-btn-dispense"
                      onClick={() =>
                        dispense(
                          selectedRx._id
                        )
                      }
                    >
                      <FaCheck /> Mark as Dispensed
                    </button>

                    <button
                      className="ph-btn-hold"
                      onClick={() =>
                        hold(
                          selectedRx._id
                        )
                      }
                    >
                      <FaTimes /> Put On Hold
                    </button>

                  </div>
                )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}