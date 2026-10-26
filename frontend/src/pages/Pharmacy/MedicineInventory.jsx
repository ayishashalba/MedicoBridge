import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaBoxOpen,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const API_URL = "http://localhost:5000/api/pharmacy/medicines";

const categories = [
  "All",
  "Analgesic",
  "Antibiotic",
  "Antidiabetic",
  "Statin",
  "Antihypertensive",
  "Antihistamine",
  "Antacid",
  "NSAID",
  "Antiplatelet",
  "Supplement",
  "Emergency",
  "IV Fluids",
  "Anesthetic",
];

const statusColor = {
  "In Stock": {
    bg: "#dcfce7",
    color: "#16a34a",
  },
  "Low Stock": {
    bg: "#fef3c7",
    color: "#d97706",
  },
  "Out of Stock": {
    bg: "#fee2e2",
    color: "#dc2626",
  },
};

const emptyForm = {
  name: "",
  genericName: "",
  category: "Analgesic",
  manufacturer: "",
  description: "",
  dosageForm: "Tablet",
  requiresPrescription: false,
  qty: "",
  price: "",
  expiry: "",
  image: "",
};

const getToken = () => localStorage.getItem("token");

const getStockStatus = (stock) => {
  const qty = Number(stock) || 0;

  if (qty === 0) return "Out of Stock";
  if (qty <= 10) return "Low Stock";
  return "In Stock";
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toISOString().split("T")[0];
};

const getMedicineId = (medicine) => {
  return medicine._id || medicine.id;
};

const MedicineInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // --------------------------------------------------
  // FETCH MEDICINES
  // --------------------------------------------------
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (catFilter !== "All") {
        params.append("category", catFilter);
      }

      if (statusFilter !== "All") {
        params.append("stockStatus", statusFilter);
      }

      const queryString = params.toString();

      const response = await fetch(
        `${API_URL}${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch medicine inventory."
        );
      }

      const medicines = data?.data || [];

      setInventory(Array.isArray(medicines) ? medicines : []);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
      setError(err.message || "Failed to load medicine inventory.");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMedicines();
  }, []);

  // Refetch when backend-supported filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, catFilter, statusFilter]);

  // --------------------------------------------------
  // FORM HANDLERS
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (medicine) => {
    setEditingId(getMedicineId(medicine));

    setForm({
      name: medicine.name || "",
      genericName: medicine.genericName || "",
      category: medicine.category || "Analgesic",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
      dosageForm: medicine.dosageForm || "Tablet",
      requiresPrescription: Boolean(medicine.requiresPrescription),
      qty:
        medicine.stock !== undefined && medicine.stock !== null
          ? medicine.stock
          : "",
      price:
        medicine.price !== undefined && medicine.price !== null
          ? medicine.price
          : "",
      expiry: medicine.expiryDate
        ? formatDate(medicine.expiryDate)
        : "",
      image: medicine.image || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // --------------------------------------------------
  // ADD / UPDATE MEDICINE
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      if (!form.name.trim()) {
        throw new Error("Medicine name is required.");
      }

      if (form.price === "" || Number.isNaN(Number(form.price))) {
        throw new Error("Valid medicine price is required.");
      }

      if (form.qty === "" || Number.isNaN(Number(form.qty))) {
        throw new Error("Valid medicine stock quantity is required.");
      }

      const payload = {
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        category: form.category,
        manufacturer: form.manufacturer.trim(),
        description: form.description.trim(),
        dosageForm: form.dosageForm,
        requiresPrescription: Boolean(form.requiresPrescription),
        price: Number(form.price),
        stock: Number(form.qty),
        expiryDate: form.expiry || null,
        image: form.image.trim(),
      };

      let response;

      if (editingId) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          (editingId
            ? "Failed to update medicine."
            : "Failed to add medicine.")
        );
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchMedicines();
    } catch (err) {
      console.error("Medicine save error:", err);
      setError(err.message || "Failed to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE MEDICINE
  // --------------------------------------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this medicine from inventory?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete medicine."
        );
      }

      await fetchMedicines();
    } catch (err) {
      console.error("Medicine delete error:", err);
      setError(err.message || "Failed to delete medicine.");
    }
  };

  // --------------------------------------------------
  // CLIENT-SIDE FILTER
  // --------------------------------------------------
  const filteredInventory = useMemo(() => {
    return inventory.filter((medicine) => {
      const medicineName = (medicine.name || "").toLowerCase();
      const genericName = (medicine.genericName || "").toLowerCase();
      const manufacturer = (medicine.manufacturer || "").toLowerCase();
      const category = medicine.category || "";

      const stockStatus = getStockStatus(medicine.stock);

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        medicineName.includes(searchValue) ||
        genericName.includes(searchValue) ||
        manufacturer.includes(searchValue);

      const matchesCategory =
        catFilter === "All" || category === catFilter;

      const matchesStatus =
        statusFilter === "All" || stockStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, search, catFilter, statusFilter]);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------
  const totalMedicines = inventory.length;

  const lowStockCount = inventory.filter(
    (medicine) => getStockStatus(medicine.stock) === "Low Stock"
  ).length;

  const outOfStockCount = inventory.filter(
    (medicine) => getStockStatus(medicine.stock) === "Out of Stock"
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div
      style={{
        padding: "24px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Medicine Inventory
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Manage medicines available in your pharmacy.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          style={{
            border: "none",
            background: "#2563eb",
            color: "#fff",
            padding: "11px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
          }}
        >
          <FaPlus />
          Add Medicine
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#2563eb",
              marginBottom: "8px",
            }}
          >
            <FaBoxOpen />
            <span>Total Medicines</span>
          </div>

          <strong style={{ fontSize: "24px" }}>
            {totalMedicines}
          </strong>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#d97706",
              marginBottom: "8px",
            }}
          >
            <FaExclamationTriangle />
            <span>Low Stock</span>
          </div>

          <strong style={{ fontSize: "24px" }}>
            {lowStockCount}
          </strong>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#dc2626",
              marginBottom: "8px",
            }}
          >
            <FaTimes />
            <span>Out of Stock</span>
          </div>

          <strong style={{ fontSize: "24px" }}>
            {outOfStockCount}
          </strong>
        </div>
      </div>

      {/* LOW STOCK BANNER */}
      {lowStockCount > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            padding: "14px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaExclamationTriangle />
          <span>
            {lowStockCount} medicine
            {lowStockCount !== 1 ? "s are" : " is"} currently low in
            stock.
          </span>
        </div>
      )}

      {/* FILTERS */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1 1 280px",
          }}
        >
          <FaSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 12px 11px 36px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              outline: "none",
            }}
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{
            flex: "0 1 200px",
            padding: "11px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            flex: "0 1 180px",
            padding: "11px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading medicines...
          </div>
        ) : filteredInventory.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <FaBoxOpen
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            />

            <div>No medicines found.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "950px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Medicine Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Qty</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Expiry</th>
                  <th style={thStyle}>Manufacturer</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInventory.map((medicine) => {
                  const id = getMedicineId(medicine);
                  const stockStatus = getStockStatus(medicine.stock);

                  const statusStyle =
                    statusColor[stockStatus] ||
                    statusColor["In Stock"];

                  return (
                    <tr
                      key={id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <td style={tdStyle}>
                        {String(id).slice(-8)}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {medicine.name || "—"}
                        </div>

                        {medicine.genericName && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "3px",
                            }}
                          >
                            {medicine.genericName}
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>
                        {medicine.category || "—"}
                      </td>

                      <td style={tdStyle}>
                        {medicine.stock ?? 0}
                      </td>

                      <td style={tdStyle}>
                        ₹{Number(medicine.price || 0).toFixed(2)}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(medicine.expiryDate)}
                      </td>

                      <td style={tdStyle}>
                        {medicine.manufacturer || "—"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 9px",
                            borderRadius: "999px",
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            fontSize: "12px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stockStatus === "In Stock" && (
                            <FaCheckCircle />
                          )}

                          {stockStatus}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEdit(medicine)}
                            title="Edit medicine"
                            style={actionButtonStyle}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(id)}
                            title="Delete medicine"
                            style={{
                              ...actionButtonStyle,
                              color: "#dc2626",
                            }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                {editingId ? "Edit Medicine" : "Add Medicine"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "18px",
                  cursor: saving ? "not-allowed" : "pointer",
                  color: "#64748b",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Medicine Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Medicine name"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Generic Name
                  </label>

                  <input
                    name="genericName"
                    value={form.genericName}
                    onChange={handleChange}
                    placeholder="Generic name"
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    {categories
                      .filter((category) => category !== "All")
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Manufacturer
                  </label>

                  <input
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleChange}
                    placeholder="Manufacturer"
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Dosage Form
                  </label>

                  <select
                    name="dosageForm"
                    value={form.dosageForm}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Quantity *
                  </label>

                  <input
                    name="qty"
                    type="number"
                    min="0"
                    value={form.qty}
                    onChange={handleChange}
                    placeholder="Stock quantity"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Price *
                  </label>

                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={fieldWrapperStyle}>
                  <label style={labelStyle}>
                    Expiry Date
                  </label>

                  <input
                    name="expiry"
                    type="date"
                    value={form.expiry}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    ...fieldWrapperStyle,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={labelStyle}>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Medicine description"
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    ...fieldWrapperStyle,
                    gridColumn: "1 / -1",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="requiresPrescription"
                      checked={form.requiresPrescription}
                      onChange={handleChange}
                    />

                    Requires Prescription
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#334155",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Medicine"
                      : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "13px 14px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  fontSize: "13px",
  color: "#334155",
  verticalAlign: "middle",
};

const actionButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "7px",
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#2563eb",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const fieldWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
};

export default MedicineInventory;