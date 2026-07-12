import React, { useState, useMemo } from "react";
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
} from "react-icons/fa";
import "./DoctorReviews.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const REVIEWS = [
    {
        id: 1,
        patientName: "Rahul Nair",
        initials: "RN",
        avatarColor: "#0d9488",
        date: "July 10, 2026",
        rating: 5,
        text: "Dr. Ayisha was incredibly thorough and compassionate. She listened carefully to all my concerns about my cardiac symptoms and explained everything in simple terms. I felt genuinely cared for. Highly recommend!",
        consultationType: "Online",
    },
    {
        id: 2,
        patientName: "Anjali Thomas",
        initials: "AT",
        avatarColor: "#7c3aed",
        date: "July 8, 2026",
        rating: 4,
        text: "Very knowledgeable and professional. The consultation was smooth and efficient. She gave detailed advice on my hypertension management. Would have loved a slightly longer session for more questions.",
        consultationType: "Hospital",
    },
    {
        id: 3,
        patientName: "Arun Kumar",
        initials: "AK",
        avatarColor: "#0284c7",
        date: "July 6, 2026",
        rating: 5,
        text: "Outstanding experience! The doctor identified my issue quickly and prescribed an effective treatment. My cholesterol levels have improved significantly since following her advice. She is simply the best!",
        consultationType: "Hospital",
    },
    {
        id: 4,
        patientName: "Meera Pillai",
        initials: "MP",
        avatarColor: "#d97706",
        date: "July 4, 2026",
        rating: 3,
        text: "The consultation was decent. The doctor was knowledgeable but seemed a bit rushed. I had more questions that were not fully addressed. The follow-up prescription was helpful though.",
        consultationType: "Online",
    },
    {
        id: 5,
        patientName: "Suresh Babu",
        initials: "SB",
        avatarColor: "#dc2626",
        date: "July 2, 2026",
        rating: 5,
        text: "Exceptional doctor! Dr. Ayisha patiently reviewed all my post-surgery reports and provided a comprehensive recovery plan. Her expertise in cardiology is top-notch. Truly grateful for her care.",
        consultationType: "Hospital",
    },
    {
        id: 6,
        patientName: "Lakshmi Nair",
        initials: "LN",
        avatarColor: "#059669",
        date: "June 30, 2026",
        rating: 4,
        text: "Good consultation overall. Doctor was warm and attentive. She thoroughly checked my test reports and adjusted my medication accordingly. The online platform worked perfectly without any technical issues.",
        consultationType: "Online",
    },
    {
        id: 7,
        patientName: "Priya Krishnan",
        initials: "PK",
        avatarColor: "#9333ea",
        date: "June 28, 2026",
        rating: 2,
        text: "Consultation felt too short. I could not get all my doubts cleared. However, the prescription was appropriate. I hope the next appointment allows more time to discuss my ongoing symptoms.",
        consultationType: "Online",
    },
    {
        id: 8,
        patientName: "Deepak Menon",
        initials: "DM",
        avatarColor: "#0369a1",
        date: "June 25, 2026",
        rating: 5,
        text: "Dr. Ayisha is a remarkable physician. Her ability to diagnose complex cardiac conditions is impressive. She takes time to explain every detail and I always leave the consultation feeling confident about my health.",
        consultationType: "Hospital",
    },
    {
        id: 9,
        patientName: "Kavitha Rajan",
        initials: "KR",
        avatarColor: "#be185d",
        date: "June 22, 2026",
        rating: 4,
        text: "Professional and caring doctor. She was very thorough during the hospital visit and spent ample time going through my echocardiogram results. Clear explanations and a well-thought-out treatment plan.",
        consultationType: "Hospital",
    },
    {
        id: 10,
        patientName: "Vikram Shetty",
        initials: "VS",
        avatarColor: "#b45309",
        date: "June 20, 2026",
        rating: 1,
        text: "I had a difficult experience. The waiting time was very long and the consultation felt hurried. I did not feel that my concerns were fully addressed. I hope future appointments are better managed.",
        consultationType: "Hospital",
    },
    {
        id: 11,
        patientName: "Anitha Varma",
        initials: "AV",
        avatarColor: "#047857",
        date: "June 18, 2026",
        rating: 5,
        text: "Absolutely wonderful experience. Dr. Ayisha has an exceptional ability to put her patients at ease. Her diagnosis was spot-on and the treatment plan has made a huge positive difference in my health.",
        consultationType: "Online",
    },
    {
        id: 12,
        patientName: "Sanjay Patel",
        initials: "SP",
        avatarColor: "#1d4ed8",
        date: "June 15, 2026",
        rating: 3,
        text: "Average experience. The doctor was professional but the online platform had some connectivity issues during our session. The prescription was correct though. Technical improvements would enhance the experience.",
        consultationType: "Online",
    },
];

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

/* ─── Filter Dropdown ────────────────────────────────────── */
const FILTER_OPTIONS = [
    { value: "all", label: "All Reviews" },
    { value: "5", label: "5★ Only" },
    { value: "4", label: "4★ Only" },
    { value: "3", label: "3★ Only" },
    { value: "2", label: "2★ Only" },
    { value: "1", label: "1★ Only" },
];

/* ─── Main Page ──────────────────────────────────────────── */
function DoctorReviews() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    /* ── Computed stats ─────────────────────────────────── */
    const totalReviews = REVIEWS.length;
    const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1);

    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: REVIEWS.filter((r) => r.rating === star).length,
    }));

    /* ── Filtered list ──────────────────────────────────── */
    const filtered = useMemo(() => {
        return REVIEWS.filter((r) => {
            const matchSearch = r.patientName.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === "all" || r.rating === parseInt(filter);
            return matchSearch && matchFilter;
        });
    }, [search, filter]);

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
                        <span className="drr-qstat-val">{REVIEWS.filter((r) => r.rating >= 4).length}</span>
                        <span className="drr-qstat-lbl">Positive Reviews</span>
                    </div>
                    <div className="drr-qstat">
                        <span className="drr-qstat-val">{REVIEWS.filter((r) => r.consultationType === "Online").length}</span>
                        <span className="drr-qstat-lbl">Online Consults</span>
                    </div>
                    <div className="drr-qstat">
                        <span className="drr-qstat-val">{REVIEWS.filter((r) => r.consultationType === "Hospital").length}</span>
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
                    <h3>No reviews found</h3>
                    <p>Try adjusting your search or filter.</p>
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
