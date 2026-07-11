import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaVideo,
    FaSearch,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaFilter,
    FaEye,
    FaPhoneAlt,
    FaFileMedical,
    FaCircle,
    FaSpinner,
    FaCheckCircle,
    FaHashtag,
    FaSyncAlt,
} from "react-icons/fa";
import "./DoctorConsultation.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const consultations = [
    {
        id: "CON-1001",
        patient: "Rahul Nair",
        initials: "RN",
        avatarColor: "#0d9488",
        appointmentId: "APT-2041",
        date: "July 12, 2026",
        time: "09:00 AM",
        type: "Video",
        complaint: "Diabetes Follow-up",
        status: "waiting",
    },
    {
        id: "CON-1002",
        patient: "Anjali Thomas",
        initials: "AT",
        avatarColor: "#7c3aed",
        appointmentId: "APT-2042",
        date: "July 12, 2026",
        time: "09:45 AM",
        type: "Video",
        complaint: "Chest Pain Review",
        status: "inprogress",
    },
    {
        id: "CON-1003",
        patient: "Arun Kumar",
        initials: "AK",
        avatarColor: "#0284c7",
        appointmentId: "APT-2043",
        date: "July 12, 2026",
        time: "10:30 AM",
        type: "Video",
        complaint: "Hypertension Check",
        status: "completed",
    },
    {
        id: "CON-1004",
        patient: "Meera Pillai",
        initials: "MP",
        avatarColor: "#d97706",
        appointmentId: "APT-2044",
        date: "July 12, 2026",
        time: "11:15 AM",
        type: "Video",
        complaint: "Thyroid Evaluation",
        status: "waiting",
    },
    {
        id: "CON-1005",
        patient: "Suresh Babu",
        initials: "SB",
        avatarColor: "#dc2626",
        appointmentId: "APT-2045",
        date: "July 12, 2026",
        time: "12:00 PM",
        type: "Video",
        complaint: "Post-Surgery Review",
        status: "completed",
    },
    {
        id: "CON-1006",
        patient: "Lakshmi Nair",
        initials: "LN",
        avatarColor: "#059669",
        appointmentId: "APT-2046",
        date: "July 12, 2026",
        time: "02:00 PM",
        type: "Video",
        complaint: "Migraine Consultation",
        status: "waiting",
    },
];

const STATUS_FILTERS = [
    { key: "all",        label: "All",         count: consultations.length },
    { key: "waiting",    label: "Waiting",     count: consultations.filter(c => c.status === "waiting").length },
    { key: "inprogress", label: "In Progress", count: consultations.filter(c => c.status === "inprogress").length },
    { key: "completed",  label: "Completed",   count: consultations.filter(c => c.status === "completed").length },
];

/* ─── Status Config ──────────────────────────────────────────── */
const STATUS_CONFIG = {
    waiting:    { label: "Waiting",     icon: FaCircle,    cls: "dc-status--waiting" },
    inprogress: { label: "In Progress", icon: FaSpinner,   cls: "dc-status--inprogress" },
    completed:  { label: "Completed",   icon: FaCheckCircle, cls: "dc-status--completed" },
};

/* ─── Consultation Card ──────────────────────────────────────── */
function ConsultationCard({ item, onJoin, onDetails, onPrescription }) {
    const cfg = STATUS_CONFIG[item.status];
    const StatusIcon = cfg.icon;
    const canJoin = item.status === "waiting" || item.status === "inprogress";

    return (
        <div className={`dc-card dc-card--${item.status}`}>

            {/* ── Card Header ─────────────────────────── */}
            <div className="dc-card-header">
                <div className="dc-avatar" style={{ background: item.avatarColor }}>
                    {item.initials}
                </div>
                <div className="dc-card-header-info">
                    <h3 className="dc-patient-name">{item.patient}</h3>
                    <span className="dc-appt-id">
                        <FaHashtag /> {item.appointmentId}
                    </span>
                </div>
                <span className={`dc-status-badge ${cfg.cls}`}>
                    <StatusIcon className={item.status === "inprogress" ? "dc-spin" : ""} />
                    {cfg.label}
                </span>
            </div>

            {/* ── Card Meta ───────────────────────────── */}
            <div className="dc-card-meta">
                <div className="dc-meta-item">
                    <FaCalendarAlt />
                    <span>{item.date}</span>
                </div>
                <div className="dc-meta-item">
                    <FaClock />
                    <span>{item.time}</span>
                </div>
                <div className="dc-meta-item">
                    <FaVideo />
                    <span>{item.type}</span>
                </div>
            </div>

            {/* ── Complaint ───────────────────────────── */}
            <div className="dc-complaint">
                <span className="dc-complaint-label">Chief Complaint</span>
                <span className="dc-complaint-text">{item.complaint}</span>
            </div>

            {/* ── Action Buttons ──────────────────────── */}
            <div className="dc-card-actions">
                <button
                    className="dc-btn dc-btn--details"
                    onClick={() => onDetails(item.id)}
                >
                    <FaEye />
                    View Details
                </button>

                {canJoin && (
                    <button
                        className="dc-btn dc-btn--join"
                        onClick={() => onJoin(item.id)}
                    >
                        <FaPhoneAlt />
                        Join Consultation
                    </button>
                )}

                {item.status === "completed" && (
                    <button
                        className="dc-btn dc-btn--rx"
                        onClick={() => onPrescription(item.id)}
                    >
                        <FaFileMedical />
                        View Prescription
                    </button>
                )}
            </div>

        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function DoctorConsultation() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    const filtered = useMemo(() => {
        return consultations.filter(c => {
            const matchSearch =
                c.patient.toLowerCase().includes(search.toLowerCase()) ||
                c.appointmentId.toLowerCase().includes(search.toLowerCase()) ||
                c.complaint.toLowerCase().includes(search.toLowerCase());
            const matchFilter = activeFilter === "all" || c.status === activeFilter;
            return matchSearch && matchFilter;
        });
    }, [search, activeFilter]);

    const handleJoin   = (id) => navigate(`/doctor/consultation-room/${id}`);
    const handleDetails = (id) => navigate(`/doctor/appointments/${id}`);
    const handlePrescription = (id) => navigate(`/doctor/prescriptions/${id}`);

    return (
        <div className="dc-page">

            {/* ── Page Header ──────────────────────────────── */}
            <div className="dc-header">
                <div className="dc-header-text">
                    <h1 className="dc-page-title">
                        <FaVideo className="dc-title-icon" />
                        Online Consultations
                    </h1>
                    <p className="dc-page-subtitle">
                        Today's virtual appointments &mdash; <strong>{consultations.length}</strong> scheduled
                    </p>
                </div>
                <button
                    className="dc-refresh-btn"
                    title="Refresh"
                    onClick={() => window.location.reload()}
                >
                    <FaSyncAlt />
                    Refresh
                </button>
            </div>

            {/* ── Controls Row ─────────────────────────────── */}
            <div className="dc-controls">

                {/* Search */}
                <div className="dc-search">
                    <FaSearch className="dc-search-icon" />
                    <input
                        type="text"
                        placeholder="Search patient, appointment ID or complaint..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="dc-search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="dc-filters">
                    <FaFilter className="dc-filter-icon" />
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`dc-filter-btn ${activeFilter === f.key ? "dc-filter-btn--active" : ""}`}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                            <span className="dc-filter-count">{f.count}</span>
                        </button>
                    ))}
                </div>

            </div>

            {/* ── Stats Bar ────────────────────────────────── */}
            <div className="dc-stats-bar">
                {STATUS_FILTERS.slice(1).map(f => (
                    <div key={f.key} className={`dc-stat-pill dc-stat-pill--${f.key}`}>
                        {f.key === "waiting"    && <FaCircle />}
                        {f.key === "inprogress" && <FaSpinner className="dc-spin" />}
                        {f.key === "completed"  && <FaCheckCircle />}
                        <span className="dc-stat-pill-val">{f.count}</span>
                        <span className="dc-stat-pill-lbl">{f.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Consultations Grid ───────────────────────── */}
            {filtered.length === 0 ? (
                <div className="dc-empty">
                    <FaVideo className="dc-empty-icon" />
                    <h3>No consultations found</h3>
                    <p>Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="dc-grid">
                    {filtered.map(item => (
                        <ConsultationCard
                            key={item.id}
                            item={item}
                            onJoin={handleJoin}
                            onDetails={handleDetails}
                            onPrescription={handlePrescription}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}

export default DoctorConsultation;
