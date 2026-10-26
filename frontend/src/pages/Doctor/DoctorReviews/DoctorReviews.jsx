import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FaStar,
    FaSearch,
    FaRegStar,
    FaStarHalfAlt,
    FaHospital,
    FaVideo,
    FaCommentAlt,
    FaFilter,
    FaThumbsUp,
    FaSpinner,
    FaExclamationTriangle,
} from "react-icons/fa";
import "./DoctorReviews.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/* ─── Star Rating Display ─────────────────────────────────── */
function StarDisplay({ rating, size = "sm" }) {
    return (
        <div className={`drr-stars drr-stars--${size}`} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => {
                if (rating >= star) return <FaStar key={star} className="drr-star drr-star--filled" />;
                if (rating >= star - 0.5) return <FaStarHalfAlt key={star} className="drr-star drr-star--half" />;
                return <FaRegStar key={star} className="drr-star drr-star--empty" />;
            })}
        </div>
    );
}

/* ─── Review Card ────────────────────────────────────────── */
function ReviewCard({ review }) {
    const [liked, setLiked] = useState(false);

    return (
        <div className="drr-card">
            {/* Card Header */}
            <div className="drr-card-header">
                <div className="drr-avatar" style={{ background: review.avatarColor }}>
                    {review.initials}
                </div>
                <div className="drr-card-info">
                    <h3 className="drr-patient-name">{review.patientName}</h3>
                    <span className="drr-date">{review.date}</span>
                </div>
                <span className={`drr-type-badge drr-type-badge--${review.consultationType.toLowerCase()}`}>
                    {review.consultationType === "Online" ? <FaVideo /> : <FaHospital />}
                    {review.consultationType}
                </span>
            </div>

            {/* Star Rating */}
            <div className="drr-card-rating">
                <StarDisplay rating={review.rating} size="md" />
                <span className="drr-rating-num">{review.rating}.0</span>
            </div>

            {/* Review Text */}
            <p className="drr-review-text">
                <FaCommentAlt className="drr-quote-icon" />
                {review.text}
            </p>

            {/* Card Footer */}
            <div className="drr-card-footer">
                <button
                    className={`drr-helpful-btn ${liked ? "drr-helpful-btn--liked" : ""}`}
                    onClick={() => setLiked((p) => !p)}
                    aria-label="Mark as helpful"
                >
                    <FaThumbsUp />
                    {liked ? "Helpful!" : "Helpful"}
                </button>
                <div className={`drr-rating-chip drr-rating-chip--${review.rating}`}>
                    {"★".repeat(review.rating)}
                </div>
            </div>
        </div>
    );
}

/* ─── Rating Breakdown Bar ───────────────────────────────── */
function BreakdownBar({ star, count, total }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="drr-breakdown-row">
            <span className="drr-breakdown-label">{star}★</span>
            <div className="drr-breakdown-track">
                <div
                    className={`drr-breakdown-fill drr-breakdown-fill--${star}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="drr-breakdown-count">{count}</span>
        </div>
    );
}

/* ─── Filter Options ─────────────────────────────────────── */
const FILTER_OPTIONS = [
    { value: "all", label: "All Reviews" },
    { value: "5",   label: "5★ Only" },
    { value: "4",   label: "4★ Only" },
    { value: "3",   label: "3★ Only" },
    { value: "2",   label: "2★ Only" },
    { value: "1",   label: "1★ Only" },
];

/* ─── Main Page ──────────────────────────────────────────── */
function DoctorReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [search, setSearch]   = useState("");
    const [filter, setFilter]   = useState("all");

    /* ── Fetch reviews from backend ── */
    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }
            const res  = await fetch(`${API_BASE}/api/doctor/reviews`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to load reviews.");
                setLoading(false);
                return;
            }
            setReviews(data.data || []);
        } catch (err) {
            console.error("Fetch reviews error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    /* ── Computed stats (from real data) ── */
    const totalReviews = reviews.length;
    const avgRating    = totalReviews
        ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    const positiveCount = reviews.filter((r) => r.rating >= 4).length;
    const onlineCount   = reviews.filter((r) => r.consultationType === "Online").length;
    const visitCount    = reviews.filter((r) => r.consultationType !== "Online").length;

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        return reviews.filter((r) => {
            const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase()) ||
                                r.text.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === "all" || r.rating === parseInt(filter);
            return matchSearch && matchFilter;
        });
    }, [reviews, search, filter]);

    /* ── Loading State ── */
    if (loading) {
        return (
            <div className="drr-page">
                <div className="drr-header">
                    <div className="drr-header-text">
                        <h1 className="drr-page-title">
                            <FaStar className="drr-title-icon" />
                            Reviews &amp; Ratings
                        </h1>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "14px" }}>
                    <FaSpinner style={{ fontSize: "2rem", animation: "spin 1s linear infinite", color: "#6366f1" }} />
                    <p style={{ color: "#94a3b8" }}>Loading reviews…</p>
                </div>
            </div>
        );
    }

    /* ── Error State ── */
    if (error) {
        return (
            <div className="drr-page">
                <div className="drr-header">
                    <div className="drr-header-text">
                        <h1 className="drr-page-title">
                            <FaStar className="drr-title-icon" />
                            Reviews &amp; Ratings
                        </h1>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "14px", textAlign: "center" }}>
                    <FaExclamationTriangle style={{ fontSize: "2.2rem", color: "#ef4444" }} />
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
                    <button className="drr-helpful-btn" onClick={fetchReviews} style={{ marginTop: "8px" }}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="drr-page">

            {/* ── Page Header ──────────────────────────── */}
            <div className="drr-header">
                <div className="drr-header-text">
                    <h1 className="drr-page-title">
                        <FaStar className="drr-title-icon" />
                        Reviews &amp; Ratings
                    </h1>
                    <p className="drr-page-subtitle">
                        Patient feedback for your consultations &mdash; <strong>{totalReviews}</strong> total reviews
                    </p>
                </div>
            </div>

            {/* ── Summary Section ───────────────────────── */}
            <div className="drr-summary">

                {/* Average Rating Card */}
                <div className="drr-avg-card">
                    <div className="drr-avg-score">{avgRating}</div>
                    <StarDisplay rating={parseFloat(avgRating)} size="lg" />
                    <p className="drr-avg-label">Average Rating</p>
                    <div className="drr-avg-total">
                        Based on <strong>{totalReviews}</strong> reviews
                    </div>
                </div>

                {/* Rating Breakdown */}
                <div className="drr-breakdown-card">
                    <h2 className="drr-breakdown-title">Rating Breakdown</h2>
                    {breakdown.map(({ star, count }) => (
                        <BreakdownBar key={star} star={star} count={count} total={totalReviews} />
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="drr-quick-stats">
                    <div className="drr-qstat">
                        <span className="drr-qstat-val">{positiveCount}</span>
                        <span className="drr-qstat-lbl">Positive Reviews</span>
                    </div>
                    <div className="drr-qstat">
                        <span className="drr-qstat-val">{onlineCount}</span>
                        <span className="drr-qstat-lbl">Online Consults</span>
                    </div>
                    <div className="drr-qstat">
                        <span className="drr-qstat-val">{visitCount}</span>
                        <span className="drr-qstat-lbl">Hospital Visits</span>
                    </div>
                    <div className="drr-qstat drr-qstat--highlight">
                        <span className="drr-qstat-val">{avgRating}</span>
                        <span className="drr-qstat-lbl">Overall Score</span>
                    </div>
                </div>
            </div>

            {/* ── Controls Row ─────────────────────────── */}
            <div className="drr-controls">
                {/* Search */}
                <div className="drr-search">
                    <FaSearch className="drr-search-icon" />
                    <input
                        id="drr-search-input"
                        type="text"
                        placeholder="Search reviews by patient name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="drr-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Dropdown */}
                <div className="drr-filter-wrap">
                    <FaFilter className="drr-filter-icon" />
                    <select
                        id="drr-rating-filter"
                        className="drr-filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        aria-label="Filter reviews by star rating"
                    >
                        {FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Results count */}
                <span className="drr-results-count">
                    {filtered.length} {filtered.length === 1 ? "review" : "reviews"} found
                </span>
            </div>

            {/* ── Reviews Grid ─────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="drr-empty">
                    <FaStar className="drr-empty-icon" />
                    <h3>{totalReviews === 0 ? "No reviews yet" : "No reviews found"}</h3>
                    <p>
                        {totalReviews === 0
                            ? "Patient reviews for your consultations will appear here."
                            : "Try adjusting your search or filter."}
                    </p>
                </div>
            ) : (
                <div className="drr-grid">
                    {filtered.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}

        </div>
    );
}

export default DoctorReviews;
