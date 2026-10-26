import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPills,
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaFileMedical,
  FaSyncAlt,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorPrescriptions.css";

const API_BASE = "http://localhost:5000";

const AVATAR_COLORS = [
  "#0d9488",
  "#7c3aed",
  "#0284c7",
  "#d97706",
  "#dc2626",
  "#059669",
  "#9333ea",
  "#e11d48",
];

function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "PT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view prescriptions.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/api/doctor/prescriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((p) => {
          const pat = p.patientId || {};
          const patName = pat.name || "Patient";
          const patId = pat.patientId || (pat._id ? `PT-${String(pat._id).slice(-4).toUpperCase()}` : "PT-1000");
          const rxId = p.prescriptionId || `RX-${String(p._id).slice(-4).toUpperCase()}`;
          const rawStatus = (p.status || "Active").toLowerCase();
          const status = rawStatus === "completed" || rawStatus === "dispensed" ? "Completed" : "Active";
          const date = new Date(p.createdAt || new Date()).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          return {
            id: p._id,
            rxId,
            patientName: patName,
            patientId: patId,
            initials: getInitials(patName),
            avatarColor: getColor(patName),
            diagnosis: p.diagnosis || "General Consultation",
            medicinesCount: Array.isArray(p.medicines) ? p.medicines.length : 0,
            medicines: p.medicines || [],
            advice: p.advice || "",
            date,
            status,
            rawStatus: p.status,
          };
        });
        setPrescriptions(mapped);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      toast.error("Failed to load prescriptions.");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (prescription.patientName || "").toLowerCase().includes(q) ||
        (prescription.rxId || "").toLowerCase().includes(q) ||
        (prescription.diagnosis || "").toLowerCase().includes(q);

      const matchesFilter =
        filter === "All" || prescription.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [prescriptions, search, filter]);

  const activeCount = prescriptions.filter(p => p.status === "Active").length;
  const completedCount = prescriptions.filter(p => p.status === "Completed").length;

  const handleDownload = (p) => {
    if (!p) return;
    const divider = "=".repeat(64);
    const subDivider = "-".repeat(64);

    let content = `${divider}\n`;
    content += `             MEDICOBRIDGE MEDICAL PRESCRIPTION\n`;
    content += `${divider}\n\n`;
    content += `Prescription ID:     ${p.rxId}\n`;
    content += `Date:                ${p.date}\n`;
    content += `Status:              ${p.status}\n\n`;

    content += `${subDivider}\n`;
    content += `PATIENT INFORMATION\n`;
    content += `${subDivider}\n`;
    content += `Patient Name:        ${p.patientName}\n`;
    content += `Patient ID:          ${p.patientId}\n\n`;

    content += `${subDivider}\n`;
    content += `CLINICAL DIAGNOSIS\n`;
    content += `${subDivider}\n`;
    content += `Diagnosis:           ${p.diagnosis}\n\n`;

    content += `${subDivider}\n`;
    content += `PRESCRIBED MEDICINES (${p.medicinesCount})\n`;
    content += `${subDivider}\n`;
    (p.medicines || []).forEach((m, idx) => {
      content += `${idx + 1}. ${m.name} | Dosage: ${m.dosage || "1 Tab"} | Frequency: ${m.frequency || "Daily"} | Duration: ${m.duration || "5 days"}\n`;
      if (m.instructions || m.timing) {
        content += `   Instructions: ${m.instructions || m.timing}\n`;
      }
    });
    content += `\n`;

    if (p.advice) {
      content += `${subDivider}\n`;
      content += `DOCTOR ADVICE & INSTRUCTIONS\n`;
      content += `${subDivider}\n`;
      content += `${p.advice}\n\n`;
    }

    content += `${divider}\n`;
    content += `Generated electronically via MedicoBridge Integrated Healthcare System.\n`;
    content += `Timestamp: ${new Date().toLocaleString()}\n`;
    content += `${divider}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${p.rxId}_Prescription.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Prescription ${p.rxId} downloaded.`);
  };

  return (
    <div className="prescriptions-page">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="prescriptions-header">
        <div className="header-title-section">
          <h2>
            <FaPills className="header-icon" /> Prescriptions
          </h2>
          <p>Create and manage digital prescriptions for your patients.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="create-prescription-btn"
            onClick={fetchPrescriptions}
            disabled={loading}
            style={{ background: "#ffffff", color: "#475569", border: "1px solid #e2e8f0" }}
            title="Refresh prescriptions"
          >
            <FaSyncAlt className={loading ? "mr-spin" : ""} /> Refresh
          </button>
          <button
            className="create-prescription-btn"
            onClick={() => navigate("/doctor/edit-prescription/new")}
          >
            <FaPlus /> Create Prescription
          </button>
        </div>
      </div>

      {/* ── Stats Summary Bar ─────────────────────────── */}
      <div className="prescriptions-stats-bar">
        <div className="stat-pill stat-pill--total">
          <FaFileMedical />
          <span className="stat-val">{prescriptions.length}</span>
          <span className="stat-lbl">Total Prescriptions</span>
        </div>
        <div className="stat-pill stat-pill--active">
          <FaClock />
          <span className="stat-val">{activeCount}</span>
          <span className="stat-lbl">Active</span>
        </div>
        <div className="stat-pill stat-pill--completed">
          <FaCheckCircle />
          <span className="stat-val">{completedCount}</span>
          <span className="stat-lbl">Completed</span>
        </div>
      </div>

      {/* ── Filter & Search Controls ────────────────── */}
      <div className="prescriptions-controls">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by patient name, ID, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          {["All", "Active", "Completed"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? "filter-btn--active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Layout (Desktop) & Card Layout (Mobile) ── */}
      {loading ? (
        <div className="no-prescriptions-card">
          <FaPills className="empty-icon" />
          <h3>Loading Prescriptions...</h3>
          <p>Fetching prescription records from database.</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="no-prescriptions-card">
          <FaPills className="empty-icon" />
          <h3>No Prescriptions Found</h3>
          <p>Try refining your search or status filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="prescriptions-table-wrapper">
            <table className="prescriptions-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((p) => (
                  <tr key={p.id}>
                    <td className="rx-id-cell">
                      <span>{p.rxId}</span>
                    </td>
                    <td>
                      <div className="patient-profile-cell">
                        <div
                          className="patient-initials-circle"
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          {p.initials}
                        </div>
                        <div className="patient-profile-info">
                          <span className="patient-name">{p.patientName}</span>
                          <span className="patient-id">{p.patientId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="diagnosis-text">{p.diagnosis}</span>
                    </td>
                    <td className="medicines-count-cell">
                      <span className="meds-badge">
                        {p.medicinesCount} {p.medicinesCount === 1 ? "Medicine" : "Medicines"}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <FaCalendarAlt />
                        <span>{p.date}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge status-badge--${p.status.toLowerCase()}`}
                      >
                        {p.status === "Active" ? <FaClock /> : <FaCheckCircle />}
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => navigate(`/doctor/prescriptions/${p.id}`)}
                          title="View Prescription"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          className="action-btn action-btn--download"
                          onClick={() => handleDownload(p)}
                          title="Download PDF"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="prescriptions-card-grid">
            {filteredPrescriptions.map((p) => (
              <div className="prescription-mobile-card" key={p.id}>
                <div className="card-header">
                  <div className="patient-profile-cell">
                    <div
                      className="patient-initials-circle"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.initials}
                    </div>
                    <div className="patient-profile-info">
                      <span className="patient-name">{p.patientName}</span>
                      <span className="patient-id">{p.patientId}</span>
                    </div>
                  </div>
                  <span
                    className={`status-badge status-badge--${p.status.toLowerCase()}`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-field card-field--rx-id">
                    <span className="field-lbl">Prescription ID</span>
                    <span className="field-val rx-id-val">{p.rxId}</span>
                  </div>

                  <div className="card-field card-field--diagnosis">
                    <span className="field-lbl">Diagnosis</span>
                    <span className="field-val">{p.diagnosis}</span>
                  </div>

                  <div className="card-meta-row">
                    <div className="meta-item">
                      <FaCalendarAlt />
                      <span>{p.date}</span>
                    </div>
                    <div className="meta-item">
                      <FaPills />
                      <span>
                        {p.medicinesCount} {p.medicinesCount === 1 ? "Med" : "Meds"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn action-btn--view"
                    onClick={() => navigate(`/doctor/prescriptions/${p.id}`)}
                  >
                    <FaEye /> View Prescription
                  </button>
                  <button
                    className="action-btn action-btn--download"
                    onClick={() => handleDownload(p)}
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DoctorPrescriptions;
