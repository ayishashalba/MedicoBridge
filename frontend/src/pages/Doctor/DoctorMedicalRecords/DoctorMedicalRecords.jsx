import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    FaTimes,
    FaNotesMedical,
    FaPrescriptionBottleAlt,
    FaFlask,
    FaFileAlt,
    FaThermometerHalf,
    FaIdCard,
    FaBuilding,
    FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorMedicalRecords.css";

const API_BASE = "http://localhost:5000";

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
    if (!dateStr) return false;
    const diff = (new Date() - new Date(dateStr)) / 86400000;
    return diff <= days;
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
    const key = (status || "pending").toLowerCase();
    const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`mr-status-badge ${cfg.cls}`}>
            <Icon />
            {cfg.label}
        </span>
    );
}

/* ─── Medical Record Details Modal ──────────────────────────── */
function MedicalRecordModal({ rec, onClose, onDownload, onDownloadDoc }) {
    if (!rec) return null;

    const key = (rec.status || "pending").toLowerCase();
    const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;

    return (
        <div className="mrd-overlay" onClick={onClose}>
            <div className="mrd-modal" onClick={(e) => e.stopPropagation()}>

                {/* ── Modal Header ── */}
                <div className="mrd-header">
                    <div className="mrd-header-left">
                        <div className="mrd-avatar" style={{ background: rec.avatarColor || "#0d9488" }}>
                            {rec.initials || "PT"}
                        </div>
                        <div>
                            <div className="mrd-header-id">
                                <FaHashtag className="mrd-id-icon" />{rec.id}
                            </div>
                            <h2 className="mrd-header-patient">{rec.patient}</h2>
                            <div className="mrd-header-sub">
                                <FaUserMd />
                                <span>{rec.doctor}</span>
                                <span className="mrd-dot">·</span>
                                <FaBuilding />
                                <span>{rec.department}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mrd-header-right">
                        <span className={`mr-status-badge ${cfg.cls} mrd-status-lg`}>
                            <cfg.icon />{cfg.label}
                        </span>
                        <button className="mrd-close-btn" onClick={onClose} aria-label="Close">
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* ── Modal Body ── */}
                <div className="mrd-body">

                    {/* Overview Section */}
                    <section className="mrd-section">
                        <h3 className="mrd-section-title">
                            <FaIdCard className="mrd-section-icon" /> Record Overview
                        </h3>
                        <div className="mrd-info-grid">
                            <div className="mrd-info-item">
                                <span className="mrd-info-label">Patient ID</span>
                                <span className="mrd-info-val mrd-info-val--id">{rec.patientId}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-info-label">Visit Date</span>
                                <span className="mrd-info-val">
                                    <FaCalendarAlt className="mrd-inline-icon" />
                                    {rec.visitDateDisplay || rec.visitDate}
                                </span>
                            </div>
                            <div className="mrd-info-item mrd-info-item--full">
                                <span className="mrd-info-label">Diagnosis / Reason for Visit</span>
                                <span className="mrd-info-val mrd-diagnosis-chip">{rec.diagnosis}</span>
                            </div>
                        </div>
                    </section>

                    {/* Symptoms */}
                    {rec.symptoms && rec.symptoms.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaThermometerHalf className="mrd-section-icon" /> Symptoms
                            </h3>
                            <div className="mrd-tags">
                                {rec.symptoms.map((s, i) => (
                                    <span key={i} className="mrd-tag">{s}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Consultation Notes */}
                    {rec.consultationNotes && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaNotesMedical className="mrd-section-icon" /> Consultation Notes
                            </h3>
                            <p className="mrd-notes-text">{rec.consultationNotes}</p>
                        </section>
                    )}

                    {/* Prescriptions */}
                    {rec.prescriptions && rec.prescriptions.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaPrescriptionBottleAlt className="mrd-section-icon" /> Prescription
                            </h3>
                            <div className="mrd-med-list">
                                {rec.prescriptions.map((m, i) => (
                                    <div key={i} className="mrd-med-row">
                                        <div className="mrd-med-bullet" />
                                        <div className="mrd-med-info">
                                            <div className="mrd-med-name">
                                                {m.name}
                                                <span className="mrd-med-dosage">{m.dosage}</span>
                                            </div>
                                            <div className="mrd-med-meta">
                                                {m.frequency} &middot; {m.duration}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Lab Reports */}
                    {rec.labReports && rec.labReports.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaFlask className="mrd-section-icon" /> Lab Reports
                            </h3>
                            <div className="mrd-table-wrap">
                                <table className="mrd-table">
                                    <thead>
                                        <tr>
                                            <th>Test</th>
                                            <th>Result</th>
                                            <th>Normal Range</th>
                                            <th>Flag</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rec.labReports.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.test}</td>
                                                <td><strong>{r.value}</strong></td>
                                                <td className="mrd-table-muted">{r.normalRange}</td>
                                                <td>
                                                    <span className={`mrd-flag mrd-flag--${(r.flag || "normal").toLowerCase()}`}>
                                                        {r.flag}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Other Medical Documents */}
                    {rec.otherDocs && rec.otherDocs.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaFileAlt className="mrd-section-icon" /> Other Medical Documents
                            </h3>
                            <div className="mrd-doc-list">
                                {rec.otherDocs.map((d, i) => (
                                    <div key={i} className="mrd-doc-row">
                                        <div className="mrd-doc-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="mrd-doc-info">
                                            <div className="mrd-doc-name">{d.name}</div>
                                            <div className="mrd-doc-meta">{d.type} &middot; {d.size}</div>
                                        </div>
                                        <button
                                            className="mrd-doc-dl-btn"
                                            title="Download"
                                            onClick={() => onDownloadDoc ? onDownloadDoc(d) : onDownload(rec)}
                                        >
                                            <FaDownload />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Record Status */}
                    <section className="mrd-section mrd-section--status">
                        <h3 className="mrd-section-title">
                            <FaFileMedical className="mrd-section-icon" /> Record Status
                        </h3>
                        <div className="mrd-status-block">
                            <span className={`mr-status-badge ${cfg.cls} mrd-status-lg`}>
                                <cfg.icon />{cfg.label}
                            </span>
                            {rec.status === "final" && (
                                <p className="mrd-status-note">This record has been finalised and signed off by the attending physician.</p>
                            )}
                            {rec.status === "pending" && (
                                <p className="mrd-status-note">This record is awaiting finalisation. Additional results may be pending.</p>
                            )}
                            {rec.status === "cancelled" && (
                                <p className="mrd-status-note">This consultation was cancelled. No clinical assessment was conducted.</p>
                            )}
                        </div>
                    </section>

                </div>

                {/* ── Modal Footer ── */}
                <div className="mrd-footer">
                    <button className="mrd-close-footer-btn" onClick={onClose}>Close</button>
                    <button className="mrd-dl-btn" onClick={() => onDownload(rec)}>
                        <FaDownload /> Download Record
                    </button>
                </div>

            </div>
        </div>
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
                    <div className="mr-avatar" style={{ background: rec.avatarColor || "#0d9488" }}>
                        {rec.initials || "PT"}
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
                    <span>{rec.visitDateDisplay || rec.visitDate}</span>
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
                    <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec)}>
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
                    <div className="mr-avatar" style={{ background: rec.avatarColor || "#0d9488" }}>
                        {rec.initials || "PT"}
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
                    <span>{rec.visitDateDisplay || rec.visitDate}</span>
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
                <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec)}>
                    <FaDownload /> Download
                </button>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function DoctorMedicalRecords() {
    const navigate = useNavigate();
    const [records, setRecords]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter]   = useState("all");
    const [viewRec, setViewRec]       = useState(null);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to view medical records.");
                navigate("/login");
                return;
            }

            const res = await fetch(`${API_BASE}/api/doctor/medical-records`, {
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
                setRecords(data.data);
            } else {
                setRecords([]);
            }
        } catch (err) {
            console.error("Error fetching medical records:", err);
            toast.error("Failed to load medical records.");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const filtered = useMemo(() => {
        return records.filter(r => {
            const q = search.toLowerCase();
            const matchSearch =
                (r.patient || "").toLowerCase().includes(q) ||
                (r.id || "").toLowerCase().includes(q) ||
                (r.diagnosis || "").toLowerCase().includes(q) ||
                (r.patientId || "").toLowerCase().includes(q);

            const matchStatus = statusFilter === "all" || (r.status || "").toLowerCase() === statusFilter.toLowerCase();

            const matchDate =
                dateFilter === "all"   ? true :
                dateFilter === "30d"   ? withinDays(r.visitDate, 30) :
                dateFilter === "90d"   ? withinDays(r.visitDate, 90) :
                                          withinDays(r.visitDate, 180);

            return matchSearch && matchStatus && matchDate;
        });
    }, [records, search, statusFilter, dateFilter]);

    const handleView = (id) => {
        const rec = records.find(r => r.id === id || r._id === id);
        if (rec) setViewRec(rec);
    };

    const handleDownload = (rec) => {
        if (!rec) return;
        const divider = "=".repeat(64);
        const subDivider = "-".repeat(64);

        let content = `${divider}\n`;
        content += `             MEDICOBRIDGE CLINICAL MEDICAL RECORD\n`;
        content += `${divider}\n\n`;
        content += `Record ID:          ${rec.id || "N/A"}\n`;
        content += `Visit Date:         ${rec.visitDateDisplay || rec.visitDate || "N/A"}\n`;
        content += `Record Status:      ${(rec.status || "Final").toUpperCase()}\n\n`;

        content += `${subDivider}\n`;
        content += `PATIENT INFORMATION\n`;
        content += `${subDivider}\n`;
        content += `Patient Name:       ${rec.patient || "N/A"}\n`;
        content += `Patient ID:         ${rec.patientId || "N/A"}\n\n`;

        content += `${subDivider}\n`;
        content += `ATTENDING PHYSICIAN & CLINICAL UNIT\n`;
        content += `${subDivider}\n`;
        content += `Doctor:             ${rec.doctor || "N/A"}\n`;
        content += `Department:         ${rec.department || "General Practice"}\n\n`;

        content += `${subDivider}\n`;
        content += `CLINICAL ASSESSMENT & DIAGNOSIS\n`;
        content += `${subDivider}\n`;
        content += `Diagnosis/Reason:   ${rec.diagnosis || "Clinical Review"}\n`;
        if (rec.symptoms && rec.symptoms.length > 0) {
            content += `Reported Symptoms:  ${rec.symptoms.join(", ")}\n`;
        }
        if (rec.consultationNotes) {
            content += `Consultation Notes: ${rec.consultationNotes}\n`;
        }
        content += `\n`;

        if (rec.prescriptions && rec.prescriptions.length > 0) {
            content += `${subDivider}\n`;
            content += `PRESCRIBED MEDICATIONS\n`;
            content += `${subDivider}\n`;
            rec.prescriptions.forEach((p, idx) => {
                content += `${idx + 1}. ${p.name} - ${p.dosage || "1 dose"} | ${p.frequency || "Regular"} | ${p.duration || "Prescribed course"}\n`;
            });
            content += `\n`;
        }

        if (rec.labReports && rec.labReports.length > 0) {
            content += `${subDivider}\n`;
            content += `LAB INVESTIGATIONS\n`;
            content += `${subDivider}\n`;
            rec.labReports.forEach((l, idx) => {
                content += `${idx + 1}. ${l.test}: ${l.value} (Normal Range: ${l.normalRange || "-"}) [Status: ${l.flag || "Normal"}]\n`;
            });
            content += `\n`;
        }

        if (rec.otherDocs && rec.otherDocs.length > 0) {
            content += `${subDivider}\n`;
            content += `ASSOCIATED MEDICAL ATTACHMENTS\n`;
            content += `${subDivider}\n`;
            rec.otherDocs.forEach((d, idx) => {
                content += `${idx + 1}. ${d.name} (${d.type || "Document"} - ${d.size || "Available"})\n`;
            });
            content += `\n`;
        }

        content += `${divider}\n`;
        content += `Generated electronically via MedicoBridge Integrated Healthcare System.\n`;
        content += `Timestamp: ${new Date().toLocaleString()}\n`;
        content += `${divider}\n`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${rec.id || "Medical_Record"}_Report.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Medical record ${rec.id} downloaded.`);
    };

    const handleDownloadDoc = (doc) => {
        if (doc.url && doc.url.startsWith("http")) {
            window.open(doc.url, "_blank");
            return;
        }
        const fileContent = `MedicoBridge Document File\nDocument: ${doc.name}\nType: ${doc.type}\nStatus: Verified Clinical Record\nTimestamp: ${new Date().toLocaleString()}`;
        const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${doc.name || "Document"}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Document ${doc.name} downloaded.`);
    };

    const statCounts = {
        final:     records.filter(r => (r.status || "").toLowerCase() === "final").length,
        pending:   records.filter(r => (r.status || "").toLowerCase() === "pending").length,
        cancelled: records.filter(r => (r.status || "").toLowerCase() === "cancelled").length,
    };

    return (
        <div className="mr-page">

            {/* ── Medical Record Details Modal ── */}
            {viewRec && (
                <MedicalRecordModal
                    rec={viewRec}
                    onClose={() => setViewRec(null)}
                    onDownload={handleDownload}
                    onDownloadDoc={handleDownloadDoc}
                />
            )}

            {/* ── Header ──────────────────────────────────── */}
            <div className="mr-header">
                <div className="mr-header-text">
                    <h1 className="mr-page-title">
                        <FaFolderOpen className="mr-title-icon" />
                        Medical Records
                    </h1>
                    <p className="mr-page-subtitle">
                        Complete patient diagnostic and clinical history — <strong>{records.length}</strong> {records.length === 1 ? "record" : "records"}
                    </p>
                </div>
                <button className="mr-refresh-btn" onClick={fetchRecords} disabled={loading}>
                    <FaSyncAlt className={loading ? "mr-spin" : ""} /> {loading ? "Refreshing..." : "Refresh"}
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
            {loading ? (
                <div className="mr-empty">
                    <FaFolderOpen className="mr-empty-icon" />
                    <h3>Loading medical records...</h3>
                    <p>Fetching clinical records from database.</p>
                </div>
            ) : filtered.length === 0 ? (
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
                                        key={rec.id || rec._id}
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
                                key={rec.id || rec._id}
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
