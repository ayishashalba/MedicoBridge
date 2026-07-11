import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaFolderOpen,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaUser,
    FaUserMd,
    FaDownload,
    FaEye,
    FaFileMedical,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaHashtag,
    FaStethoscope,
    FaSyncAlt,
    FaChevronDown,
} from "react-icons/fa";
import "./DoctorMedicalRecords.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const records = [
    {
        id: "MR-3001",
        patient: "Rahul Nair",
        initials: "RN",
        avatarColor: "#0d9488",
        patientId: "PT-1024",
        diagnosis: "Type 2 Diabetes Mellitus – Quarterly Review",
        visitDate: "2026-06-28",
        visitDateDisplay: "June 28, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "final",
    },
    {
        id: "MR-2998",
        patient: "Anjali Thomas",
        initials: "AT",
        avatarColor: "#7c3aed",
        patientId: "PT-1031",
        diagnosis: "Chronic Migraine with Aura",
        visitDate: "2026-06-22",
        visitDateDisplay: "June 22, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Neurology",
        status: "final",
    },
    {
        id: "MR-2975",
        patient: "Arun Kumar",
        initials: "AK",
        avatarColor: "#0284c7",
        patientId: "PT-1018",
        diagnosis: "Essential Hypertension – Stage 1",
        visitDate: "2026-06-15",
        visitDateDisplay: "June 15, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "pending",
    },
    {
        id: "MR-2960",
        patient: "Meera Pillai",
        initials: "MP",
        avatarColor: "#d97706",
        patientId: "PT-1045",
        diagnosis: "Hypothyroidism – TSH Elevation",
        visitDate: "2026-06-10",
        visitDateDisplay: "June 10, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Endocrinology",
        status: "final",
    },
    {
        id: "MR-2941",
        patient: "Suresh Babu",
        initials: "SB",
        avatarColor: "#dc2626",
        patientId: "PT-1052",
        diagnosis: "Post-CABG Cardiac Rehabilitation",
        visitDate: "2026-06-03",
        visitDateDisplay: "June 3, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "final",
    },
    {
        id: "MR-2919",
        patient: "Lakshmi Nair",
        initials: "LN",
        avatarColor: "#059669",
        patientId: "PT-1060",
        diagnosis: "Tension-Type Headache",
        visitDate: "2026-05-28",
        visitDateDisplay: "May 28, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Neurology",
        status: "cancelled",
    },
    {
        id: "MR-2905",
        patient: "David Okonkwo",
        initials: "DO",
        avatarColor: "#9333ea",
        patientId: "PT-1071",
        diagnosis: "Asthma – Moderate Persistent",
        visitDate: "2026-05-20",
        visitDateDisplay: "May 20, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Pulmonology",
        status: "pending",
    },
    {
        id: "MR-2887",
        patient: "Priya Menon",
        initials: "PM",
        avatarColor: "#e11d48",
        patientId: "PT-1083",
        diagnosis: "Iron Deficiency Anaemia",
        visitDate: "2026-05-12",
        visitDateDisplay: "May 12, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Haematology",
        status: "final",
    },
];

const STATUS_CONFIG = {
    final:     { label: "Final",     cls: "mr-status--final",     icon: FaCheckCircle },
    pending:   { label: "Pending",   cls: "mr-status--pending",   icon: FaClock },
    cancelled: { label: "Cancelled", cls: "mr-status--cancelled", icon: FaTimesCircle },
};

const DATE_FILTERS = [
    { key: "all",    label: "All Time" },
    { key: "30d",    label: "Last 30 Days" },
    { key: "90d",    label: "Last 90 Days" },
    { key: "6m",     label: "Last 6 Months" },
];

function withinDays(dateStr, days) {
    const diff = (new Date() - new Date(dateStr)) / 86400000;
    return diff <= days;
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`mr-status-badge ${cfg.cls}`}>
            <Icon />
            {cfg.label}
        </span>
    );
}

/* ─── Record Row (table) ─────────────────────────────────────── */
function RecordRow({ rec, onView, onDownload }) {
    return (
        <tr className="mr-table-row">
            <td>
                <span className="mr-rec-id">
                    <FaHashtag className="mr-id-icon" />{rec.id}
                </span>
            </td>
            <td>
                <div className="mr-patient-cell">
                    <div className="mr-avatar" style={{ background: rec.avatarColor }}>
                        {rec.initials}
                    </div>
                    <div>
                        <div className="mr-patient-name">{rec.patient}</div>
                        <div className="mr-patient-id">{rec.patientId}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className="mr-diagnosis">{rec.diagnosis}</span>
            </td>
            <td>
                <div className="mr-date-cell">
                    <FaCalendarAlt />
                    <span>{rec.visitDateDisplay}</span>
                </div>
            </td>
            <td>
                <div className="mr-doctor-cell">
                    <FaUserMd />
                    <span>{rec.doctor}</span>
                </div>
            </td>
            <td><StatusBadge status={rec.status} /></td>
            <td>
                <div className="mr-actions-cell">
                    <button className="mr-btn mr-btn--view" onClick={() => onView(rec.id)}>
                        <FaEye /> View
                    </button>
                    <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec.id)}>
                        <FaDownload />
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ─── Record Card (mobile) ───────────────────────────────────── */
function RecordCard({ rec, onView, onDownload }) {
    return (
        <div className="mr-card">
            <div className="mr-card-header">
                <div className="mr-patient-cell">
                    <div className="mr-avatar" style={{ background: rec.avatarColor }}>
                        {rec.initials}
                    </div>
                    <div>
                        <div className="mr-patient-name">{rec.patient}</div>
                        <div className="mr-patient-id">{rec.patientId}</div>
                    </div>
                </div>
                <StatusBadge status={rec.status} />
            </div>

            <div className="mr-card-rec-id">
                <FaHashtag className="mr-id-icon" />{rec.id}
            </div>

            <p className="mr-card-diagnosis">{rec.diagnosis}</p>

            <div className="mr-card-meta">
                <div className="mr-meta-item">
                    <FaCalendarAlt />
                    <span>{rec.visitDateDisplay}</span>
                </div>
                <div className="mr-meta-item">
                    <FaUserMd />
                    <span>{rec.doctor}</span>
                </div>
                <div className="mr-meta-item">
                    <FaStethoscope />
                    <span>{rec.department}</span>
                </div>
            </div>

            <div className="mr-card-actions">
                <button className="mr-btn mr-btn--view mr-btn--full" onClick={() => onView(rec.id)}>
                    <FaEye /> View Record
                </button>
                <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec.id)}>
                    <FaDownload /> Download
                </button>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function DoctorMedicalRecords() {
    const navigate = useNavigate();
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter]   = useState("all");

    const filtered = useMemo(() => {
        return records.filter(r => {
            const q = search.toLowerCase();
            const matchSearch =
                r.patient.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q) ||
                r.diagnosis.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q);

            const matchStatus = statusFilter === "all" || r.status === statusFilter;

            const matchDate =
                dateFilter === "all"   ? true :
                dateFilter === "30d"   ? withinDays(r.visitDate, 30) :
                dateFilter === "90d"   ? withinDays(r.visitDate, 90) :
                                          withinDays(r.visitDate, 180);

            return matchSearch && matchStatus && matchDate;
        });
    }, [search, statusFilter, dateFilter]);

    const handleView     = (id) => alert(`Viewing record ${id}`);
    const handleDownload = (id) => alert(`Downloading record ${id}`);

    const statCounts = {
        final:     records.filter(r => r.status === "final").length,
        pending:   records.filter(r => r.status === "pending").length,
        cancelled: records.filter(r => r.status === "cancelled").length,
    };

    return (
        <div className="mr-page">

            {/* ── Header ──────────────────────────────────── */}
            <div className="mr-header">
                <div className="mr-header-text">
                    <h1 className="mr-page-title">
                        <FaFolderOpen className="mr-title-icon" />
                        Medical Records
                    </h1>
                    <p className="mr-page-subtitle">
                        Complete patient diagnostic and clinical history — <strong>{records.length}</strong> records
                    </p>
                </div>
                <button className="mr-refresh-btn" onClick={() => window.location.reload()}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* ── Stats Strip ─────────────────────────────── */}
            <div className="mr-stats-strip">
                <div className="mr-stat-tile mr-stat-tile--total">
                    <FaFileMedical />
                    <span className="mr-stat-val">{records.length}</span>
                    <span className="mr-stat-lbl">Total Records</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--final">
                    <FaCheckCircle />
                    <span className="mr-stat-val">{statCounts.final}</span>
                    <span className="mr-stat-lbl">Finalised</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--pending">
                    <FaClock />
                    <span className="mr-stat-val">{statCounts.pending}</span>
                    <span className="mr-stat-lbl">Pending</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--cancelled">
                    <FaTimesCircle />
                    <span className="mr-stat-val">{statCounts.cancelled}</span>
                    <span className="mr-stat-lbl">Cancelled</span>
                </div>
            </div>

            {/* ── Controls ────────────────────────────────── */}
            <div className="mr-controls">

                {/* Search */}
                <div className="mr-search">
                    <FaSearch className="mr-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by patient, record ID, or diagnosis..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="mr-search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="mr-filter-group">
                    <FaFilter className="mr-filter-icon" />
                    {["all", "final", "pending", "cancelled"].map(s => (
                        <button
                            key={s}
                            className={`mr-filter-btn ${statusFilter === s ? "mr-filter-btn--active" : ""}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === "all" ? "All Status" : STATUS_CONFIG[s]?.label || s}
                        </button>
                    ))}
                </div>

                {/* Date Filter */}
                <div className="mr-select-wrap">
                    <FaCalendarAlt className="mr-select-icon" />
                    <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="mr-select"
                    >
                        {DATE_FILTERS.map(d => (
                            <option key={d.key} value={d.key}>{d.label}</option>
                        ))}
                    </select>
                    <FaChevronDown className="mr-select-chevron" />
                </div>

            </div>

            {/* ── Results Count ────────────────────────────── */}
            <div className="mr-results-row">
                <span className="mr-results-count">
                    Showing <strong>{filtered.length}</strong> of {records.length} records
                </span>
            </div>

            {/* ── Table (desktop) ──────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="mr-empty">
                    <FaFolderOpen className="mr-empty-icon" />
                    <h3>No records found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="mr-table-wrapper">
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th>Record ID</th>
                                    <th>Patient</th>
                                    <th>Diagnosis</th>
                                    <th>Visit Date</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(rec => (
                                    <RecordRow
                                        key={rec.id}
                                        rec={rec}
                                        onView={handleView}
                                        onDownload={handleDownload}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Cards (mobile) ─────────────────────── */}
                    <div className="mr-cards-list">
                        {filtered.map(rec => (
                            <RecordCard
                                key={rec.id}
                                rec={rec}
                                onView={handleView}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}

export default DoctorMedicalRecords;
