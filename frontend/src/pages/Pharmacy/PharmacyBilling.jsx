import React, { useEffect, useMemo, useState } from "react";

import {
  FaFileInvoiceDollar,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

import "./PharmacyPages.css";

const statusColor = {
  Paid: { bg: "#dcfce7", color: "#16a34a" },
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
  Failed: { bg: "#fee2e2", color: "#dc2626" },
  Refunded: { bg: "#e0e7ff", color: "#4f46e5" },
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInvoiceId = (invoice) => {
  return invoice?.invoiceId || invoice?.id || "-";
};

const getOrderId = (invoice) => {
  if (typeof invoice?.order === "object" && invoice.order !== null) {
    return invoice.order.orderId || invoice.order._id || "-";
  }

  return invoice?.order || "-";
};

const getPatientName = (invoice) => {
  if (invoice?.patient) {
    if (typeof invoice.patient === "string") {
      return invoice.patient;
    }

    return (
      invoice.patient.name ||
      invoice.patient.fullName ||
      "Unknown Patient"
    );
  }

  if (
    typeof invoice?.patientId === "object" &&
    invoice.patientId !== null
  ) {
    return (
      invoice.patientId.name ||
      invoice.patientId.fullName ||
      "Unknown Patient"
    );
  }

  return invoice?.patientId || "Unknown Patient";
};

const getPatientPhone = (invoice) => {
  if (invoice?.phone) {
    return invoice.phone;
  }

  if (
    typeof invoice?.patientId === "object" &&
    invoice.patientId !== null
  ) {
    return invoice.patientId.phone || "";
  }

  return invoice?.deliveryAddress?.phone || "";
};

const getInvoiceItems = (invoice) => {
  if (!Array.isArray(invoice?.items)) {
    return [];
  }

  return invoice.items;
};

const getItemName = (item) => {
  return (
    item?.name ||
    item?.description ||
    item?.medicineName ||
    item?.medicineId?.name ||
    "Medicine"
  );
};

const getItemQuantity = (item) => {
  return Number(item?.quantity || 1);
};

export default function PharmacyBilling() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token missing.");
        }

        const params = new URLSearchParams();

        if (filter !== "All") {
          params.append("paymentStatus", filter);
        }

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const queryString = params.toString();

        const response = await fetch(
          `http://localhost:5000/api/pharmacy/invoices${queryString ? `?${queryString}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to fetch pharmacy invoices."
          );
        }

        const invoiceData = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.invoices)
            ? data.data.invoices
            : Array.isArray(data?.invoices)
              ? data.invoices
              : [];

        setBills(invoiceData);
      } catch (err) {
        console.error("Failed to load pharmacy invoices:", err);
        setError(err.message || "Failed to load invoices.");
        setBills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [filter, search]);

  const filtered = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return bills.filter((bill) => {
      const patient = getPatientName(bill).toLowerCase();
      const invoiceId = getInvoiceId(bill).toLowerCase();
      const orderId = getOrderId(bill).toLowerCase();

      const matchSearch =
        !searchText ||
        patient.includes(searchText) ||
        invoiceId.includes(searchText) ||
        orderId.includes(searchText);

      const status = bill?.status || bill?.paymentStatus || "Pending";

      const matchFilter =
        filter === "All" || status === filter;

      return matchSearch && matchFilter;
    });
  }, [bills, search, filter]);

  const getStatus = (bill) => {
    return bill?.status || bill?.paymentStatus || "Pending";
  };

  const totalRevenue = useMemo(() => {
    return bills
      .filter((bill) => getStatus(bill) === "Paid")
      .reduce(
        (sum, bill) => sum + Number(bill?.total || bill?.totalAmount || 0),
        0
      );
  }, [bills]);

  const pendingPayments = useMemo(() => {
    return bills
      .filter((bill) => getStatus(bill) === "Pending")
      .reduce(
        (sum, bill) => sum + Number(bill?.total || bill?.totalAmount || 0),
        0
      );
  }, [bills]);

  const paidInvoices = bills.filter(
    (bill) => getStatus(bill) === "Paid"
  ).length;

  const markPaid = async (id) => {
    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token missing.");
      }

      const response = await fetch(
        `http://localhost:5000/api/pharmacy/invoices/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentStatus: "Paid",
            paymentMethod: "Cash",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark invoice as paid."
        );
      }

      const updatedOrder = data?.data;

      setBills((prev) =>
        prev.map((bill) => {
          const billId =
            bill?.id ||
            bill?._id;

          if (billId !== id) {
            return bill;
          }

          return {
            ...bill,
            status:
              updatedOrder?.paymentStatus ||
              "Paid",
            paymentStatus:
              updatedOrder?.paymentStatus ||
              "Paid",
            method:
              updatedOrder?.paymentMethod ||
              "Cash",
            paymentMethod:
              updatedOrder?.paymentMethod ||
              "Cash",
          };
        })
      );

      setSelected((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          status:
            updatedOrder?.paymentStatus ||
            "Paid",
          paymentStatus:
            updatedOrder?.paymentStatus ||
            "Paid",
          method:
            updatedOrder?.paymentMethod ||
            "Cash",
          paymentMethod:
            updatedOrder?.paymentMethod ||
            "Cash",
        };
      });
    } catch (err) {
      console.error("Failed to mark invoice as paid:", err);
      setError(err.message || "Failed to update invoice.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title">
            <FaFileInvoiceDollar /> Billing & Payments
          </h2>

          <p className="ph-page-sub">
            Total revenue collected:{" "}
            <strong>
              ₹{totalRevenue.toLocaleString()}
            </strong>
          </p>
        </div>

        <div className="ph-summary-pills">
          {["Paid", "Pending", "Cancelled"].map((s) => {
            const sc = statusColor[s];

            return (
              <span
                key={s}
                className="ph-sum-pill"
                style={{
                  background: sc.bg,
                  color: sc.color,
                }}
              >
                {
                  bills.filter(
                    (b) => getStatus(b) === s
                  ).length
                }{" "}
                {s}
              </span>
            );
          })}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="ph-rev-grid">
        {[
          {
            label: "Total Revenue",
            val: `₹${totalRevenue.toLocaleString()}`,
            color: "#0d9488",
          },
          {
            label: "Pending Payments",
            val: `₹${pendingPayments.toLocaleString()}`,
            color: "#d97706",
          },
          {
            label: "Total Invoices",
            val: bills.length,
            color: "#6366f1",
          },
          {
            label: "Paid Invoices",
            val: paidInvoices,
            color: "#16a34a",
          },
        ].map((r) => (
          <div
            key={r.label}
            className="ph-rev-card"
          >
            <span className="ph-rev-label">
              {r.label}
            </span>

            <span
              className="ph-rev-val"
              style={{ color: r.color }}
            >
              {r.val}
            </span>
          </div>
        ))}
      </div>

      <div className="ph-toolbar">
        <div className="ph-search-box">
          <FaSearch className="ph-search-icon" />

          <input
            placeholder="Search invoice or patient…"
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
            <option>Paid</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      <div className="ph-card">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Order Ref</th>
                <th>Date</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="ph-empty"
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="ph-empty"
                  >
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const status = getStatus(b);
                  const s =
                    statusColor[status] ||
                    statusColor.Pending;

                  const invoiceId =
                    getInvoiceId(b);

                  const patient =
                    getPatientName(b);

                  const orderId =
                    getOrderId(b);

                  const subtotal = Number(
                    b?.subtotal || 0
                  );

                  const tax = Number(
                    b?.tax || 0
                  );

                  const discount = Number(
                    b?.discount || 0
                  );

                  const total = Number(
                    b?.total ||
                    b?.totalAmount ||
                    0
                  );

                  const method =
                    b?.method ||
                    b?.paymentMethod ||
                    "COD";

                  return (
                    <tr
                      key={
                        b?.id ||
                        b?._id ||
                        invoiceId
                      }
                    >
                      <td>
                        <span className="ph-id-badge">
                          {invoiceId}
                        </span>
                      </td>

                      <td>
                        <span className="ph-name">
                          {patient}
                        </span>
                      </td>

                      <td>
                        <span className="ph-tag">
                          {orderId}
                        </span>
                      </td>

                      <td>
                        {formatDate(b?.date)}
                      </td>

                      <td>
                        ₹{subtotal.toLocaleString()}
                      </td>

                      <td>
                        ₹{tax.toLocaleString()}
                      </td>

                      <td>
                        ₹{discount.toLocaleString()}
                      </td>

                      <td>
                        <strong>
                          ₹{total.toLocaleString()}
                        </strong>
                      </td>

                      <td>{method}</td>

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
                            setSelected(b)
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

      {/* Invoice Modal */}
      {selected && (
        <div
          className="ph-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="ph-modal ph-invoice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="ph-modal-header">
              <h3>
                Invoice —{" "}
                {getInvoiceId(selected)}
              </h3>

              <button
                className="ph-modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                <FaTimes />
              </button>
            </div>

            <div className="ph-modal-body">
              <div className="ph-invoice-header">
                <div>
                  <p className="ph-invoice-brand">
                    Pharmacy
                  </p>

                  <p className="ph-invoice-sub">
                    MedicoBridge Portal ·
                    Pharmacy Invoice
                  </p>
                </div>

                <span
                  className="ph-pill"
                  style={{
                    background:
                      statusColor[
                        getStatus(selected)
                      ]?.bg,
                    color:
                      statusColor[
                        getStatus(selected)
                      ]?.color,
                  }}
                >
                  {getStatus(selected)}
                </span>
              </div>

              <div className="ph-modal-info-grid">
                <div>
                  <span className="ph-info-label">
                    Patient
                  </span>

                  <span className="ph-info-val">
                    {getPatientName(selected)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Order Ref
                  </span>

                  <span className="ph-info-val">
                    {getOrderId(selected)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Date
                  </span>

                  <span className="ph-info-val">
                    {formatDate(selected?.date)}
                  </span>
                </div>

                <div>
                  <span className="ph-info-label">
                    Payment Method
                  </span>

                  <span className="ph-info-val">
                    {selected?.method ||
                      selected?.paymentMethod ||
                      "COD"}
                  </span>
                </div>

                {getPatientPhone(selected) && (
                  <div>
                    <span className="ph-info-label">
                      Phone
                    </span>

                    <span className="ph-info-val">
                      {getPatientPhone(selected)}
                    </span>
                  </div>
                )}
              </div>

              <div className="ph-invoice-breakdown">
                <div className="ph-inv-row">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {Number(
                      selected?.subtotal || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="ph-inv-row">
                  <span>Tax (GST)</span>
                  <span>
                    ₹
                    {Number(
                      selected?.tax || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="ph-inv-row">
                  <span>Discount</span>
                  <span>
                    -₹
                    {Number(
                      selected?.discount || 0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="ph-inv-row ph-inv-total">
                  <span>Total</span>
                  <span>
                    ₹
                    {Number(
                      selected?.total ||
                      selected?.totalAmount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {getInvoiceItems(selected).length >
                0 && (
                  <div style={{ marginTop: "20px" }}>
                    {getInvoiceItems(selected).map(
                      (item, index) => (
                        <div
                          key={
                            item?._id ||
                            item?.medicineId ||
                            index
                          }
                          className="ph-inv-row"
                        >
                          <span>
                            {getItemName(item)} ×{" "}
                            {getItemQuantity(item)}
                          </span>

                          <span>
                            ₹
                            {Number(
                              item?.itemTotal ||
                              item?.amount ||
                              0
                            ).toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}

              {getStatus(selected) ===
                "Pending" && (
                  <div className="ph-modal-actions">
                    <button
                      className="ph-btn-dispense"
                      disabled={updating}
                      onClick={() => {
                        const id =
                          selected?.id ||
                          selected?._id;

                        if (id) {
                          markPaid(id);
                        }
                      }}
                    >
                      <FaCheckCircle />

                      {updating
                        ? "Updating..."
                        : "Mark as Paid"}
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