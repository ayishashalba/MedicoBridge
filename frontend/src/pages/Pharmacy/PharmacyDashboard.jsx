import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaFilePrescription,
  FaBoxes,
  FaShoppingCart,
  FaFileInvoiceDollar,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaUserInjured,
  FaHospitalUser,
} from "react-icons/fa";
import "./PharmacyDashboard.css";

const statusColor = {
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Dispensed: { bg: "#dcfce7", color: "#16a34a" },
  "On Hold": { bg: "#fee2e2", color: "#dc2626" },
  Delivered: { bg: "#dcfce7", color: "#16a34a" },
  Processing: { bg: "#ede9fe", color: "#6d28d9" },
  Shipped: { bg: "#e0f2fe", color: "#0284c7" },
  Approved: { bg: "#dcfce7", color: "#16a34a" },
};

function StatusPill({ status }) {
  const s = statusColor[status] || {
    bg: "#f1f5f9",
    color: "#475569",
  };

  return (
    <span
      style={{ background: s.bg, color: s.color }}
      className="ph-pill"
    >
      {status || "Pending"}
    </span>
  );
}

export default function PharmacyDashboard() {
  const pharmacyType =
    localStorage.getItem("pharmacyType") || "Retail";

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Dashboard
        const dashboardResponse = await fetch(
          "http://localhost:5000/api/pharmacy/dashboard",
          {
            headers,
          }
        );

        const dashboardData = await dashboardResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData?.message || "Failed to load dashboard."
          );
        }

        setDashboard(dashboardData?.data || null);

        // Prescriptions
        try {
          const prescriptionResponse = await fetch(
            "http://localhost:5000/api/pharmacy/prescriptions",
            {
              headers,
            }
          );

          if (prescriptionResponse.ok) {
            const prescriptionData =
              await prescriptionResponse.json();

            const prescriptionList =
              prescriptionData?.data?.prescriptions ||
              prescriptionData?.data ||
              [];

            setPrescriptions(
              Array.isArray(prescriptionList)
                ? prescriptionList.slice(0, 6)
                : []
            );
          }
        } catch (prescriptionError) {
          console.error(
            "Failed to load prescriptions:",
            prescriptionError
          );
        }

        // Medicines
        try {
          const medicineResponse = await fetch(
            "http://localhost:5000/api/pharmacy/medicines",
            {
              headers,
            }
          );

          if (medicineResponse.ok) {
            const medicineData = await medicineResponse.json();

            const medicineList =
              medicineData?.data?.medicines ||
              medicineData?.data ||
              [];

            setMedicines(
              Array.isArray(medicineList)
                ? medicineList.filter(
                  (medicine) =>
                    Number(medicine.stock || 0) <=
                    Number(
                      medicine.lowStockThreshold ||
                      medicine.threshold ||
                      10
                    )
                )
                : []
            );
          }
        } catch (medicineError) {
          console.error(
            "Failed to load medicines:",
            medicineError
          );
        }
      } catch (err) {
        console.error("Failed to load pharmacy dashboard:", err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metrics = dashboard?.metrics || {};
  const pharmacy = dashboard?.pharmacy || {};
  const recentOrders = dashboard?.recentOrders || [];

  const isHospital = pharmacyType === "Hospital";

  const title = isHospital
    ? `Good Morning, ${pharmacy?.name || "Hospital Pharmacy"} 👋`
    : `Good Morning, ${pharmacy?.name || "Pharmacy"} 👋`;

  const kpiCards = isHospital
    ? [
      {
        label: "Hospital Prescriptions",
        value: metrics.pendingOrders ?? 0,
        icon: <FaFilePrescription />,
        color: "#0ea5e9",
        bg: "#e0f2fe",
        delta: "Pending",
        up: true,
      },
      {
        label: "Ward Requests",
        value: metrics.totalOrders ?? 0,
        icon: <FaHospitalUser />,
        color: "#f59e0b",
        bg: "#fef3c7",
        delta: "Total orders",
        up: false,
      },
      {
        label: "Emergency Medicine Requests",
        value: metrics.outOfStockMedicines ?? 0,
        icon: <FaBell />,
        color: "#ef4444",
        bg: "#fee2e2",
        delta: "Out of stock",
        up: false,
      },
      {
        label: "IP Patients",
        value: "—",
        icon: <FaUserInjured />,
        color: "#8b5cf6",
        bg: "#ede9fe",
        delta: "Not available",
        up: false,
      },
      {
        label: "Medicine Inventory",
        value: metrics.totalMedicines ?? 0,
        icon: <FaBoxes />,
        color: "#0d9488",
        bg: "#ccfbf1",
        delta: `${metrics.lowStockMedicines ?? 0} low stock`,
        up: false,
      },
      {
        label: "Today's Dispensed Medicines",
        value: metrics.deliveredOrders ?? 0,
        icon: <FaCheckCircle />,
        color: "#10b981",
        bg: "#d1fae5",
        delta: "Delivered",
        up: true,
      },
    ]
    : [
      {
        label: "Pending Prescriptions",
        value: metrics.pendingOrders ?? 0,
        icon: <FaFilePrescription />,
        color: "#0ea5e9",
        bg: "#e0f2fe",
        delta: "Pending",
        up: false,
      },
      {
        label: "Medicine Inventory",
        value: metrics.totalMedicines ?? 0,
        icon: <FaBoxes />,
        color: "#0d9488",
        bg: "#ccfbf1",
        delta: `${metrics.lowStockMedicines ?? 0} low stock`,
        up: false,
      },
      {
        label: "Orders",
        value: metrics.totalOrders ?? 0,
        icon: <FaShoppingCart />,
        color: "#6366f1",
        bg: "#ede9fe",
        delta: `${metrics.deliveredOrders ?? 0} delivered`,
        up: true,
      },
      {
        label: "Revenue",
        value: `₹${Number(
          metrics.totalRevenue || 0
        ).toLocaleString("en-IN")}`,
        icon: <FaFileInvoiceDollar />,
        color: "#f59e0b",
        bg: "#fef3c7",
        delta: "Total revenue",
        up: true,
      },
    ];

  const getPatientName = (order) => {
    if (order?.patientId?.name) {
      return order.patientId.name;
    }

    if (order?.patient?.name) {
      return order.patient.name;
    }

    if (typeof order?.patientId === "string") {
      return order.patientId;
    }

    return "Unknown Patient";
  };

  const getOrderAmount = (order) => {
    const amount =
      order?.totalAmount ??
      order?.amount ??
      0;

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const getOrderType = (order) => {
    if (order?.deliveryType) {
      return order.deliveryType;
    }

    if (order?.orderType) {
      return order.orderType;
    }

    if (order?.deliveryMethod) {
      return order.deliveryMethod;
    }

    return "Order";
  };

  const getPrescriptionPatient = (prescription) => {
    if (prescription?.patientId?.name) {
      return prescription.patientId.name;
    }

    if (prescription?.patient?.name) {
      return prescription.patient.name;
    }

    return "Unknown Patient";
  };

  const getPrescriptionDoctor = (prescription) => {
    if (prescription?.doctorId?.name) {
      return prescription.doctorId.name;
    }

    if (prescription?.doctor?.name) {
      return prescription.doctor.name;
    }

    return "—";
  };

  const getPrescriptionId = (prescription, index) => {
    return (
      prescription?.prescriptionNumber ||
      prescription?.prescriptionId ||
      prescription?._id ||
      `RX-${index + 1}`
    );
  };

  const getPrescriptionItems = (prescription) => {
    if (Array.isArray(prescription?.medicines)) {
      return prescription.medicines.length;
    }

    if (Array.isArray(prescription?.items)) {
      return prescription.items.length;
    }

    return prescription?.items || 0;
  };

  const getPrescriptionStatus = (prescription) => {
    return (
      prescription?.status ||
      prescription?.prescriptionStatus ||
      "Pending"
    );
  };

  const lowStockItems = medicines.slice(0, 6);

  return (
    <div className="ph-dashboard">

      {/* Welcome Banner */}
      <div className="ph-welcome-banner">
        <div className="ph-welcome-text">
          <h2>{title}</h2>
          <p>
            Here's what's happening at your pharmacy today.
          </p>
        </div>

        <div className="ph-welcome-actions">
          <NavLink
            to="/pharmacy/prescriptions"
            className="ph-btn-primary"
          >
            <FaFilePrescription /> New Prescription
          </NavLink>

          <NavLink
            to="/pharmacy/orders"
            className="ph-btn-outline"
          >
            <FaShoppingCart /> View Orders
          </NavLink>
        </div>
      </div>

      {loading && (
        <div className="ph-card">
          <p>Loading dashboard...</p>
        </div>
      )}

      {!loading && error && (
        <div className="ph-card">
          <p style={{ color: "#dc2626" }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="ph-kpi-grid">
            {kpiCards.map((k) => (
              <div
                key={k.label}
                className="ph-kpi-card"
              >
                <div
                  className="ph-kpi-icon"
                  style={{
                    background: k.bg,
                    color: k.color,
                  }}
                >
                  {k.icon}
                </div>

                <div className="ph-kpi-body">
                  <p className="ph-kpi-label">
                    {k.label}
                  </p>

                  <h3 className="ph-kpi-value">
                    {k.value}
                  </h3>

                  <span
                    className={`ph-kpi-delta ${k.up ? "up" : "down"
                      }`}
                  >
                    {k.up ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )}{" "}
                    {k.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Two-column grid */}
          <div className="ph-grid-2">

            {/* Recent Prescriptions */}
            <div className="ph-card">
              <div className="ph-card-header">
                <h3 className="ph-card-title">
                  <FaFilePrescription />{" "}
                  {isHospital
                    ? "Hospital Prescriptions"
                    : "Recent Prescriptions"}
                </h3>

                <NavLink
                  to="/pharmacy/prescriptions"
                  className="ph-link-sm"
                >
                  View All
                </NavLink>
              </div>

              <div className="ph-table-wrap">
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prescriptions.length > 0 ? (
                      prescriptions.map(
                        (prescription, index) => (
                          <tr
                            key={
                              prescription?._id ||
                              index
                            }
                          >
                            <td>
                              <span className="ph-id-badge">
                                {getPrescriptionId(
                                  prescription,
                                  index
                                )}
                              </span>
                            </td>

                            <td>
                              <span className="ph-name">
                                {getPrescriptionPatient(
                                  prescription
                                )}
                              </span>
                            </td>

                            <td>
                              {getPrescriptionDoctor(
                                prescription
                              )}
                            </td>

                            <td>
                              {getPrescriptionItems(
                                prescription
                              )}
                            </td>

                            <td>
                              <StatusPill
                                status={getPrescriptionStatus(
                                  prescription
                                )}
                              />
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: "center",
                            padding: "20px",
                          }}
                        >
                          No prescriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="ph-card">
              <div className="ph-card-header">
                <h3 className="ph-card-title">
                  <FaExclamationTriangle className="ph-warn-icon" />{" "}
                  Low Stock Alert
                </h3>

                <NavLink
                  to="/pharmacy/inventory"
                  className="ph-link-sm"
                >
                  Manage
                </NavLink>
              </div>

              <div className="ph-low-stock-list">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => {
                    const qty = Number(item.stock || 0);

                    const threshold = Number(
                      item.lowStockThreshold ||
                      item.threshold ||
                      10
                    );

                    const pct =
                      threshold > 0
                        ? Math.min(
                          100,
                          Math.round(
                            (qty / threshold) * 100
                          )
                        )
                        : 0;

                    return (
                      <div
                        key={item._id || item.name}
                        className="ph-low-stock-item"
                      >
                        <div className="ph-low-stock-info">
                          <span className="ph-low-stock-name">
                            {item.name ||
                              item.medicineName ||
                              "Medicine"}
                          </span>

                          <span className="ph-low-stock-qty">
                            {qty} left / {threshold} min
                          </span>
                        </div>

                        <div className="ph-progress-bar-bg">
                          <div
                            className="ph-progress-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct < 35
                                  ? "#dc2626"
                                  : "#f59e0b",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No low-stock medicines.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="ph-card">
            <div className="ph-card-header">
              <h3 className="ph-card-title">
                <FaShoppingCart /> Recent Orders
              </h3>

              <NavLink
                to="/pharmacy/orders"
                className="ph-link-sm"
              >
                View All
              </NavLink>
            </div>

            <div className="ph-table-wrap">
              <table className="ph-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => (
                      <tr
                        key={
                          order?._id ||
                          order?.orderId ||
                          index
                        }
                      >
                        <td>
                          <span className="ph-id-badge">
                            {order?.orderNumber ||
                              order?.orderId ||
                              order?._id ||
                              `ORD-${index + 1}`}
                          </span>
                        </td>

                        <td>
                          <span className="ph-name">
                            {getPatientName(order)}
                          </span>
                        </td>

                        <td>
                          {getOrderType(order)}
                        </td>

                        <td>
                          <strong>
                            {getOrderAmount(order)}
                          </strong>
                        </td>

                        <td>
                          <StatusPill
                            status={
                              order?.orderStatus ||
                              order?.status ||
                              "Pending"
                            }
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}