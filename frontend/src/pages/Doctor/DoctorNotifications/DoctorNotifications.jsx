import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
    FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorNotifications.css";

const API_BASE = "http://localhost:5000";

/* ─── Notification Types ─────────────────────────────────────── */
const TYPE_CONFIG = {
    "appointment-booked":    { label: "Appointment Booked",     icon: FaCalendarCheck, color: "#0d9488", bg: "#ccfbf1" },
    "appointment-cancelled": { label: "Appointment Cancelled",  icon: FaCalendarTimes, color: "#dc2626", bg: "#fef2f2" },
    "consultation-reminder": { label: "Consultation Reminder",  icon: FaVideo,         color: "#7c3aed", bg: "#ede9fe" },
    "new-patient":           { label: "New Patient",            icon: FaUserPlus,      color: "#0284c7", bg: "#e0f2fe" },
    "prescription-sent":     { label: "Prescription Sent",      icon: FaPills,         color: "#16a34a", bg: "#f0fdf4" },
    "system-update":         { label: "System Update",          icon: FaCog,           color: "#64748b", bg: "#f1f5f9" },
};

function formatRelativeTime(dateInput) {
    if (!dateInput) return "Just now";
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? "hour" : "hours"} ago`;
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateGroup(dateInput) {
    if (!dateInput) return "Recent";
    const date = new Date(dateInput);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function mapNotificationType(rawType = "", rawTitle = "", rawMessage = "") {
    const text = `${rawType} ${rawTitle} ${rawMessage}`.toLowerCase();
    if (text.includes("cancelled") || text.includes("canceled")) return "appointment-cancelled";
    if (text.includes("appointment") || text.includes("booking") || text.includes("booked")) return "appointment-booked";
    if (text.includes("consultation") || text.includes("meeting") || text.includes("video") || text.includes("call")) return "consultation-reminder";
    if (text.includes("patient") || text.includes("registered")) return "new-patient";
    if (text.includes("prescription") || text.includes("medicine") || text.includes("pharmacy")) return "prescription-sent";
    return "system-update";
}

/* ─── Main Component ─────────────────────────────────────────── */
function DoctorNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to view notifications.");
                navigate("/login");
                return;
            }

            const res = await fetch(`${API_BASE}/api/notifications`, {
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
                const mapped = data.data.map((n) => {
                    const mappedType = mapNotificationType(n.type, n.title, n.message);
                    return {
                        id: n._id,
                        type: mappedType,
                        title: n.title || "Notification",
                        message: n.message || "",
                        time: formatRelativeTime(n.createdAt),
                        date: formatDateGroup(n.createdAt),
                        read: Boolean(n.isRead),
                        rawCreatedAt: n.createdAt,
                    };
                });
                setNotifications(mapped);
            } else {
                setNotifications([]);
            }
        } catch (err) {
            console.error("Error fetching doctor notifications:", err);
            toast.error("Failed to load notifications.");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

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

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                toast.success("All notifications marked as read.");
            } else {
                toast.error("Failed to mark notifications as read.");
            }
        } catch (err) {
            console.error("Mark all read error:", err);
            toast.error("An error occurred while updating notifications.");
        }
    };

    const markOneRead = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
            } else {
                toast.error("Failed to mark notification as read.");
            }
        } catch (err) {
            console.error("Mark one read error:", err);
            toast.error("An error occurred while updating notification.");
        }
    };

    const deleteOne = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success("Notification deleted.");
            } else {
                toast.error("Failed to delete notification.");
            }
        } catch (err) {
            console.error("Delete notification error:", err);
            toast.error("An error occurred while deleting notification.");
        }
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

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        className="dn-item-btn"
                        onClick={fetchNotifications}
                        title="Refresh Notifications"
                        style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#475569" }}
                        disabled={loading}
                    >
                        <FaSyncAlt className={loading ? "mr-spin" : ""} /> Refresh
                    </button>
                    {unreadCount > 0 && (
                        <button className="dn-mark-all-btn" onClick={markAllRead}>
                            <FaCheckDouble />
                            Mark All as Read
                        </button>
                    )}
                </div>
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
            {loading ? (
                <div className="dn-empty">
                    <FaBell className="dn-empty-icon" />
                    <h3>Loading notifications...</h3>
                    <p>Fetching your notifications from database.</p>
                </div>
            ) : filtered.length === 0 ? (
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
                                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG["system-update"];
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
