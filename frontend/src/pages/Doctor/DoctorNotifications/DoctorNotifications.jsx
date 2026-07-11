import React, { useState, useMemo } from "react";
import {
    FaBell,
    FaSearch,
    FaFilter,
    FaCheckDouble,
    FaCalendarCheck,
    FaCalendarTimes,
    FaVideo,
    FaUserPlus,
    FaPills,
    FaCog,
    FaCircle,
    FaClock,
    FaTrashAlt,
    FaCheck,
} from "react-icons/fa";
import "./DoctorNotifications.css";

/* ─── Notification Types ─────────────────────────────────────── */
const TYPE_CONFIG = {
    "appointment-booked":    { label: "Appointment Booked",     icon: FaCalendarCheck, color: "#0d9488", bg: "#ccfbf1" },
    "appointment-cancelled": { label: "Appointment Cancelled",  icon: FaCalendarTimes, color: "#dc2626", bg: "#fef2f2" },
    "consultation-reminder": { label: "Consultation Reminder",  icon: FaVideo,         color: "#7c3aed", bg: "#ede9fe" },
    "new-patient":           { label: "New Patient",            icon: FaUserPlus,      color: "#0284c7", bg: "#e0f2fe" },
    "prescription-sent":     { label: "Prescription Sent",      icon: FaPills,         color: "#16a34a", bg: "#f0fdf4" },
    "system-update":         { label: "System Update",          icon: FaCog,           color: "#64748b", bg: "#f1f5f9" },
};

/* ─── Static Dummy Data ─────────────────────────────────────── */
const initialNotifications = [
    {
        id: 1,
        type: "appointment-booked",
        title: "New Appointment Booked",
        message: "Rahul Nair has booked a video consultation for July 15, 2026 at 10:30 AM. Chief complaint: Quarterly Diabetes Review.",
        time: "10 minutes ago",
        date: "Today",
        read: false,
    },
    {
        id: 2,
        type: "consultation-reminder",
        title: "Upcoming Consultation in 30 min",
        message: "Reminder: Video consultation with Anjali Thomas starts at 09:45 AM. Complaint: Chest Pain Review.",
        time: "25 minutes ago",
        date: "Today",
        read: false,
    },
    {
        id: 3,
        type: "appointment-cancelled",
        title: "Appointment Cancelled",
        message: "Meera Pillai has cancelled the in-person appointment originally scheduled for July 14, 2026 at 02:00 PM.",
        time: "1 hour ago",
        date: "Today",
        read: false,
    },
    {
        id: 4,
        type: "prescription-sent",
        title: "Prescription Delivered",
        message: "Prescription RX-4521 for Rahul Nair has been successfully sent to the patient and their registered pharmacy.",
        time: "2 hours ago",
        date: "Today",
        read: true,
    },
    {
        id: 5,
        type: "new-patient",
        title: "New Patient Registered",
        message: "David Okonkwo (PT-1071) has registered and selected you as their primary physician. Profile is ready for review.",
        time: "3 hours ago",
        date: "Today",
        read: true,
    },
    {
        id: 6,
        type: "system-update",
        title: "Platform Maintenance Scheduled",
        message: "MedicoBridge will undergo scheduled maintenance on July 13, 2026 from 02:00 AM to 04:00 AM IST. Save your work.",
        time: "5 hours ago",
        date: "Today",
        read: true,
    },
    {
        id: 7,
        type: "consultation-reminder",
        title: "Missed Consultation",
        message: "You missed the scheduled video consultation with Lakshmi Nair at 02:00 PM. Please reschedule at the earliest.",
        time: "Yesterday, 02:15 PM",
        date: "Yesterday",
        read: true,
    },
    {
        id: 8,
        type: "appointment-booked",
        title: "Follow-up Appointment Confirmed",
        message: "Suresh Babu has confirmed his follow-up appointment for July 20, 2026 at 11:00 AM — Post-Surgery Review.",
        time: "Yesterday, 10:30 AM",
        date: "Yesterday",
        read: true,
    },
    {
        id: 9,
        type: "prescription-sent",
        title: "Prescription Viewed by Patient",
        message: "Arun Kumar has viewed and acknowledged prescription RX-2975 sent on June 15, 2026.",
        time: "July 10, 2026",
        date: "July 10",
        read: true,
    },
    {
        id: 10,
        type: "system-update",
        title: "New Feature: E-Prescriptions",
        message: "You can now digitally sign and send e-prescriptions directly to participating pharmacies across India.",
        time: "July 8, 2026",
        date: "July 8",
        read: true,
    },
];

/* ─── Main Component ─────────────────────────────────────────── */
function DoctorNotifications() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const unreadCount = notifications.filter(n => !n.read).length;

    const filtered = useMemo(() => {
        return notifications.filter(n => {
            const q = search.toLowerCase();
            const matchSearch =
                n.title.toLowerCase().includes(q) ||
                n.message.toLowerCase().includes(q);
            const matchFilter =
                filter === "all" ? true :
                filter === "unread" ? !n.read :
                n.read;
            return matchSearch && matchFilter;
        });
    }, [notifications, search, filter]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markOneRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const deleteOne = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    /* Group by date label */
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(n => {
            if (!map[n.date]) map[n.date] = [];
            map[n.date].push(n);
        });
        return Object.entries(map);
    }, [filtered]);

    return (
        <div className="dn-page">

            {/* ── Header ──────────────────────────────────── */}
            <div className="dn-header">
                <div className="dn-header-text">
                    <h1 className="dn-page-title">
                        <span className="dn-title-icon-wrap">
                            <FaBell className="dn-title-icon" />
                            {unreadCount > 0 && (
                                <span className="dn-title-badge">{unreadCount}</span>
                            )}
                        </span>
                        Notifications
                    </h1>
                    <p className="dn-page-subtitle">
                        Stay updated with appointments, consultations, and platform alerts
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button className="dn-mark-all-btn" onClick={markAllRead}>
                        <FaCheckDouble />
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* ── Controls ────────────────────────────────── */}
            <div className="dn-controls">
                <div className="dn-search">
                    <FaSearch className="dn-search-icon" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="dn-search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                <div className="dn-filters">
                    <FaFilter className="dn-filter-icon" />
                    {[
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "read", label: "Read" },
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`dn-filter-btn ${filter === f.key ? "dn-filter-btn--active" : ""}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                            {f.key === "unread" && unreadCount > 0 && (
                                <span className="dn-filter-count">{unreadCount}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Summary Pills ────────────────────────────── */}
            <div className="dn-summary-row">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const count = notifications.filter(n => n.type === key).length;
                    const Icon = cfg.icon;
                    return (
                        <div key={key} className="dn-summary-pill" style={{ borderLeftColor: cfg.color }}>
                            <span className="dn-pill-icon" style={{ background: cfg.bg, color: cfg.color }}>
                                <Icon />
                            </span>
                            <span className="dn-pill-val">{count}</span>
                            <span className="dn-pill-lbl">{cfg.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* ── Notification List ────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="dn-empty">
                    <FaBell className="dn-empty-icon" />
                    <h3>No notifications</h3>
                    <p>You're all caught up! Check back later.</p>
                </div>
            ) : (
                <div className="dn-list">
                    {grouped.map(([dateLabel, items]) => (
                        <div key={dateLabel} className="dn-group">
                            <div className="dn-group-label">{dateLabel}</div>
                            {items.map(n => {
                                const cfg = TYPE_CONFIG[n.type];
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={n.id}
                                        className={`dn-item ${!n.read ? "dn-item--unread" : ""}`}
                                    >
                                        <div
                                            className="dn-item-icon"
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            <Icon />
                                        </div>

                                        <div className="dn-item-body">
                                            <div className="dn-item-top">
                                                <h4 className="dn-item-title">
                                                    {!n.read && <FaCircle className="dn-unread-dot" />}
                                                    {n.title}
                                                </h4>
                                                <span
                                                    className="dn-item-type-badge"
                                                    style={{ background: cfg.bg, color: cfg.color }}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="dn-item-message">{n.message}</p>
                                            <div className="dn-item-footer">
                                                <span className="dn-item-time">
                                                    <FaClock /> {n.time}
                                                </span>
                                                <div className="dn-item-actions">
                                                    {!n.read && (
                                                        <button
                                                            className="dn-item-btn dn-item-btn--read"
                                                            onClick={() => markOneRead(n.id)}
                                                            title="Mark as Read"
                                                        >
                                                            <FaCheck /> Read
                                                        </button>
                                                    )}
                                                    <button
                                                        className="dn-item-btn dn-item-btn--delete"
                                                        onClick={() => deleteOne(n.id)}
                                                        title="Delete"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default DoctorNotifications;
