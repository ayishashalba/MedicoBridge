import React, { useState, useEffect, useMemo } from "react";
import {
  FaBuilding,
  FaSearch,
  FaUserMd,
  FaBed,
  FaUsers,
  FaPlus,
  FaStethoscope,
  FaPhoneAlt,
  FaEdit,
  FaHospitalAlt,
  FaToggleOn,
  FaToggleOff,
  FaSave,
  FaTimes,
  FaHeartbeat,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./HospitalDepartments.css";

/* ─────────────────────────────────────────────
   Manage Department Modal
───────────────────────────────────────────── */
function ManageModal({ dept, onClose, onSave }) {
  const [form, setForm] = useState({
    name: dept.name || "",
    description: dept.description || "",
    headOfDepartment: dept.headOfDepartment || "",
    isActive: dept.isActive !== false,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warning("Department name is required.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/hospital/departments/${dept._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
            headOfDepartment:
              form.headOfDepartment.trim(),
            isActive: form.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update department."
        );
      }

      const updatedDepartment = result?.data;

      setSaved(true);

      onSave(updatedDepartment);

      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        "Update department error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to update department."
      );
    } finally {
      setSaving(false);
    }
  };

  const isInactive = !form.isActive;

  return (
    <div
      className="hosp-dept-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="hosp-dept-manage-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="hdmm-header">
          <div className="hdmm-header-left">
            <span className="hdmm-dept-id">
              {dept._id}
            </span>

            <h3 className="hdmm-title">
              <FaEdit
                style={{
                  fontSize: "1rem",
                  color: "#4f46e5",
                }}
              />
              Manage Department
            </h3>
          </div>

          <button
            className="hdmm-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="hdmm-body">
          {/* Status */}
          <div
            className={`hdmm-status-banner ${isInactive
                ? "hdmm-status-inactive"
                : "hdmm-status-active"
              }`}
          >
            <div className="hdmm-status-left">
              {isInactive ? (
                <FaToggleOff className="hdmm-toggle-icon" />
              ) : (
                <FaToggleOn className="hdmm-toggle-icon" />
              )}

              <div>
                <span className="hdmm-status-label">
                  Department Status
                </span>

                <strong className="hdmm-status-value">
                  {isInactive
                    ? "Inactive"
                    : "Active"}
                </strong>
              </div>
            </div>

            <button
              className={`hdmm-status-btn ${isInactive
                  ? "hdmm-status-btn-off"
                  : "hdmm-status-btn-on"
                }`}
              onClick={() =>
                set(
                  "isActive",
                  !form.isActive
                )
              }
              disabled={saving}
            >
              Set{" "}
              {isInactive
                ? "Active"
                : "Inactive"}
            </button>
          </div>

          {/* Existing statistics */}
          <div className="hdmm-patient-chip">
            <FaHeartbeat className="hdmm-patient-icon" />

            <span>
              Active Inpatients (read-only)
            </span>

            <strong>
              {dept.patientsCount ?? 0}
            </strong>
          </div>

          {/* Basic Info */}
          <div className="hdmm-section-title">
            <FaHospitalAlt /> Basic Information
          </div>

          <div className="hosp-dept-form-group">
            <label>Department Name *</label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                set("name", e.target.value)
              }
              placeholder="e.g. Cardiology"
              disabled={saving}
            />
          </div>

          <div className="hosp-dept-form-group">
            <label>
              Description / Specialization Scope
            </label>

            <textarea
              rows="3"
              value={form.description}
              onChange={(e) =>
                set(
                  "description",
                  e.target.value
                )
              }
              placeholder="Clinical care scope, diagnostic facilities..."
              disabled={saving}
            />
          </div>

          <div className="hosp-dept-form-group">
            <label>
              Direct Extension / Contact
            </label>

            <input
              type="text"
              value={dept.phone || ""}
              readOnly
              placeholder="Not provided"
            />
          </div>

          {/* Staff */}
          <div className="hdmm-section-title">
            <FaUserMd /> Staff Management
          </div>

          <div className="hosp-dept-form-group">
            <label>
              Head of Department (Lead Physician)
            </label>

            <input
              type="text"
              value={form.headOfDepartment}
              onChange={(e) =>
                set(
                  "headOfDepartment",
                  e.target.value
                )
              }
              placeholder="e.g. Dr. Rajesh Khanna"
              disabled={saving}
            />
          </div>

          <div className="hdmm-grid-2">
            <div className="hosp-dept-form-group">
              <label>Allocated Doctors</label>

              <input
                type="number"
                value={dept.doctorsCount ?? 0}
                readOnly
              />
            </div>

            <div className="hosp-dept-form-group">
              <label>Support Staff</label>

              <input
                type="number"
                value={dept.staffCount ?? 0}
                readOnly
              />
            </div>
          </div>

          {/* Beds */}
          <div className="hdmm-section-title">
            <FaBed /> Bed Capacity
          </div>

          <div className="hdmm-grid-2">
            <div className="hosp-dept-form-group">
              <label>Total Beds</label>

              <input
                type="number"
                value={dept.totalBeds ?? 0}
                readOnly
              />
            </div>

            <div className="hosp-dept-form-group">
              <label>Available Beds</label>

              <input
                type="number"
                value={dept.bedsCount ?? 0}
                readOnly
              />
            </div>
          </div>

          {Number(dept.totalBeds) > 0 && (
            <div className="hdmm-bed-bar-wrap">
              <div className="hdmm-bed-bar-track">
                <div
                  className="hdmm-bed-bar-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      ((Number(
                        dept.totalBeds
                      ) -
                        Number(
                          dept.bedsCount || 0
                        )) /
                        Number(
                          dept.totalBeds
                        )) *
                      100
                    ).toFixed(1)}%`,
                  }}
                />
              </div>

              <span className="hdmm-bed-bar-label">
                {Number(dept.totalBeds) -
                  Number(
                    dept.bedsCount || 0
                  )}{" "}
                / {dept.totalBeds} beds
                occupied
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="hdmm-footer">
          <button
            className="hosp-dept-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            <FaTimes /> Cancel
          </button>

          <button
            className={`hdmm-save-btn ${saved
                ? "hdmm-save-btn--saved"
                : ""
              }`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              "✓ Saved!"
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function HospitalDepartments() {
  const [departments, setDepartments] =
    useState([]);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [manageDept, setManageDept] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [newDept, setNewDept] = useState({
    name: "",
    head: "",
    phone: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  /* ─────────────────────────────────────────
     Fetch Departments
  ───────────────────────────────────────── */
  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/hospital/departments",
        {
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
          "Failed to fetch departments."
        );
      }

      const data = result?.data || [];

      /*
       * Use only real backend department data.
       * No hardcoded department records.
       */
      const normalizedDepartments =
        data.map((dept) => ({
          ...dept,

          id: dept._id,

          head:
            dept.headOfDepartment ||
            "To be assigned",

          status:
            dept.isActive === false
              ? "Inactive"
              : "Active",

          description:
            dept.description || "",

          phone:
            dept.phone || "",

          doctorsCount:
            dept.doctorsCount ?? 0,

          staffCount:
            dept.staffCount ?? 0,

          totalBeds:
            dept.totalBeds ?? 0,

          bedsCount:
            dept.bedsCount ?? 0,

          patientsCount:
            dept.patientsCount ?? 0,
        }));

      setDepartments(
        normalizedDepartments
      );
    } catch (error) {
      console.error(
        "Fetch departments error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to load departments."
      );

      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);

      toast.error(
        "Authentication token not found."
      );

      return;
    }

    fetchDepartments();
  }, []);

  /* ─────────────────────────────────────────
     Search
  ───────────────────────────────────────── */
  const filtered = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return departments;
    }

    return departments.filter(
      (dept) =>
        String(dept.name || "")
          .toLowerCase()
          .includes(value) ||
        String(
          dept.headOfDepartment ||
          dept.head ||
          ""
        )
          .toLowerCase()
          .includes(value) ||
        String(dept._id || "")
          .toLowerCase()
          .includes(value)
    );
  }, [departments, search]);

  /* ─────────────────────────────────────────
     Add Department
  ───────────────────────────────────────── */
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!newDept.name.trim()) {
      toast.warning(
        "Department name is required."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/hospital/departments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newDept.name.trim(),

            description:
              newDept.description.trim(),

            headOfDepartment:
              newDept.head.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to create department."
        );
      }

      toast.success(
        "Department created successfully."
      );

      setShowAddModal(false);

      setNewDept({
        name: "",
        head: "",
        phone: "",
        description: "",
      });

      await fetchDepartments();
    } catch (error) {
      console.error(
        "Create department error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to create department."
      );
    }
  };

  /* ─────────────────────────────────────────
     Save Department
  ───────────────────────────────────────── */
  const handleSaveDept = (updated) => {
    if (!updated) return;

    setDepartments((prev) =>
      prev.map((dept) =>
        dept._id === updated._id
          ? {
            ...dept,
            ...updated,

            id: updated._id,

            head:
              updated.headOfDepartment ||
              "To be assigned",

            status:
              updated.isActive === false
                ? "Inactive"
                : "Active",

            description:
              updated.description || "",

            phone:
              updated.phone || "",
          }
          : dept
      )
    );
  };

  /* ─────────────────────────────────────────
     Delete Department
  ───────────────────────────────────────── */
  const handleDeleteDepartment = async (
    department
  ) => {
    const confirmed = window.confirm(
      `Delete "${department.name}" department?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/hospital/departments/${department._id}`,
        {
          method: "DELETE",
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
          "Failed to delete department."
        );
      }

      setDepartments((prev) =>
        prev.filter(
          (dept) =>
            dept._id !== department._id
        )
      );

      toast.success(
        "Department deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete department error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to delete department."
      );
    }
  };

  return (
    <div className="hosp-dept-page">
      {/* Header */}
      <div className="hosp-dept-header">
        <div>
          <h2 className="hosp-dept-title">
            <FaBuilding
              style={{
                color:
                  "var(--primary-color, #4f46e5)",
              }}
            />{" "}
            Hospital Departments
          </h2>

          <p className="hosp-dept-subtitle">
            Manage medical divisions,
            department heads, staffing
            allocation, and bed capacity
          </p>
        </div>

        <button
          className="hosp-dept-add-btn"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          <FaPlus /> Add Department
        </button>
      </div>

      {/* Search */}
      <div className="hosp-dept-controls">
        <div className="hosp-dept-search">
          <FaSearch className="hosp-dept-search-icon" />

          <input
            type="text"
            placeholder="Search departments by name, head of department, or ID..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* Department Cards */}
      <div className="hosp-dept-grid">
        {loading ? (
          <div className="hosp-dept-empty">
            <h3>
              Loading departments...
            </h3>

            <p>
              Fetching hospital departments.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hosp-dept-empty">
            <FaBuilding
              style={{
                fontSize: "2.5rem",
                color: "#cbd5e1",
                marginBottom: "0.75rem",
              }}
            />

            <h3>
              No departments found
            </h3>

            <p>
              Try searching with another
              keyword.
            </p>
          </div>
        ) : (
          filtered.map((dept) => (
            <div
              key={dept._id}
              className="hosp-dept-card"
            >
              {/* Top */}
              <div className="hosp-dept-card-top">
                <div>
                  <span className="hosp-dept-id">
                    {dept._id}
                  </span>

                  <h3 className="hosp-dept-card-name">
                    {dept.name}
                  </h3>
                </div>

                <span
                  className="hosp-dept-status-badge"
                  style={
                    dept.status ===
                      "Inactive"
                      ? {
                        background:
                          "#fee2e2",
                        color:
                          "#dc2626",
                      }
                      : {}
                  }
                >
                  {dept.status}
                </span>
              </div>

              {/* Description */}
              <p className="hosp-dept-desc">
                {dept.description ||
                  "No department description provided."}
              </p>

              {/* Head */}
              <div className="hosp-dept-head-info">
                <FaStethoscope className="hosp-dept-head-icon" />

                <div>
                  <span className="hosp-dept-head-lbl">
                    Head of Department:
                  </span>

                  <strong>
                    {dept.head ||
                      "To be assigned"}
                  </strong>
                </div>
              </div>

              {/* Stats */}
              <div className="hosp-dept-stats">
                <div className="hosp-dept-stat">
                  <FaUserMd />

                  <span>
                    <strong>
                      {dept.doctorsCount ??
                        0}
                    </strong>{" "}
                    Doctors
                  </span>
                </div>

                <div className="hosp-dept-stat">
                  <FaBed />

                  <span>
                    <strong>
                      {dept.bedsCount ??
                        0}
                    </strong>{" "}
                    Beds
                  </span>
                </div>

                <div className="hosp-dept-stat">
                  <FaUsers />

                  <span>
                    <strong>
                      {dept.patientsCount ??
                        0}
                    </strong>{" "}
                    Active Inpatients
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="hosp-dept-card-footer">
                <span className="hosp-dept-phone">
                  <FaPhoneAlt />{" "}
                  {dept.phone ||
                    "Not provided"}
                </span>

                <div>
                  <button
                    className="hosp-dept-action-btn"
                    onClick={() =>
                      setManageDept(dept)
                    }
                  >
                    Manage
                  </button>

                  <button
                    className="hosp-dept-action-btn"
                    onClick={() =>
                      handleDeleteDepartment(
                        dept
                      )
                    }
                    style={{
                      marginLeft: "8px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div
          className="hosp-dept-modal-backdrop"
          onClick={() =>
            setShowAddModal(false)
          }
        >
          <div
            className="hosp-dept-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="hosp-dept-modal-header">
              <h3>
                Add New Hospital Department
              </h3>

              <button
                className="hosp-dept-modal-close"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddSubmit}
            >
              <div className="hosp-dept-modal-body">
                <div className="hosp-dept-form-group">
                  <label>
                    Department Name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Dermatology & Cosmetology"
                    value={newDept.name}
                    onChange={(e) =>
                      setNewDept({
                        ...newDept,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="hosp-dept-form-group">
                  <label>
                    Head of Department
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Khanna"
                    value={newDept.head}
                    onChange={(e) =>
                      setNewDept({
                        ...newDept,
                        head: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="hosp-dept-form-group">
                  <label>
                    Direct Extension / Contact
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. +91 44 2234 5689"
                    value={newDept.phone}
                    onChange={(e) =>
                      setNewDept({
                        ...newDept,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="hosp-dept-form-group">
                  <label>
                    Description / Specialization Scope
                  </label>

                  <textarea
                    rows="3"
                    placeholder="Scope of clinical care and diagnostic facilities provided..."
                    value={
                      newDept.description
                    }
                    onChange={(e) =>
                      setNewDept({
                        ...newDept,
                        description:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="hosp-dept-modal-footer">
                <button
                  type="submit"
                  className="hosp-dept-submit-btn"
                >
                  Create Department
                </button>

                <button
                  type="button"
                  className="hosp-dept-cancel-btn"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Department Modal */}
      {manageDept && (
        <ManageModal
          dept={manageDept}
          onClose={() =>
            setManageDept(null)
          }
          onSave={handleSaveDept}
        />
      )}
    </div>
  );
}