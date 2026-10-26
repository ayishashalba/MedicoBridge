import React, { useEffect, useState } from "react";
import {
  FaComments,
  FaStar,
  FaTimes,
  FaReply,
  FaCheck,
  FaExclamationCircle,
} from "react-icons/fa";

import "./AdminPages.css";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Fetch real feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch feedbacks.");
      }

      const feedbackData = Array.isArray(data.data) ? data.data : [];

      setFeedbacks(feedbackData);
    } catch (err) {
      console.error("Fetch feedbacks error:", err);
      setError(err.message || "Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Resolve feedback
  const handleResolve = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/feedback/${id}/resolve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resolve feedback.");
      }

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb._id === id ? { ...fb, status: "Resolved" } : fb
        )
      );

      triggerToast("Feedback marked as Resolved.");
    } catch (err) {
      console.error("Resolve feedback error:", err);
      triggerToast(err.message || "Failed to resolve feedback.");
    }
  };

  // Reply to feedback
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim() || !replyingTo) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/feedback/${replyingTo._id}/reply`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reply: replyText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply.");
      }

      setFeedbacks((prev) =>
        prev.map((fb) =>
          fb._id === replyingTo._id
            ? {
              ...fb,
              status: "Resolved",
              adminReply: replyText.trim(),
              repliedAt: new Date().toISOString(),
            }
            : fb
        )
      );

      triggerToast(
        `Response saved for ${replyingTo.user || "user"}. Feedback resolved.`
      );

      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error("Reply feedback error:", err);
      triggerToast(err.message || "Failed to send reply.");
    }
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>
          Monitor patient reviews, review medical service complaints, and
          resolve support tickets
        </p>
      </div>

      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#1e293b",
            color: "#fff",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            zIndex: 1100,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation: "adFadeIn 0.2s ease",
          }}
        >
          <FaCheck style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
            {toastMsg}
          </span>
        </div>
      )}

      <div
        className="ad-card"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h3 className="ad-card-title">
          <FaComments /> User Submissions
        </h3>

        {loading && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--ad-text-secondary)",
            }}
          >
            Loading feedbacks...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaExclamationCircle />
            {error}
          </div>
        )}

        {!loading && !error && feedbacks.length === 0 && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--ad-text-secondary)",
            }}
          >
            No feedback submissions found.
          </div>
        )}

        {!loading && !error && feedbacks.length > 0 && (
          <div className="ad-list-container">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="ad-list-item">
                <div className="ad-list-icon">
                  <FaComments />
                </div>

                <div className="ad-list-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "0.95rem",
                          color: "var(--ad-text-primary)",
                        }}
                      >
                        {fb.subject}
                      </h4>

                      <span
                        style={{
                          fontSize: "0.74rem",
                          color: "var(--ad-text-secondary)",
                        }}
                      >
                        Submitted by{" "}
                        <strong>{fb.user || "Unknown User"}</strong>{" "}
                        ({fb.role}) •{" "}
                        {fb.createdAt
                          ? new Date(fb.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="ad-pill"
                        style={{
                          background:
                            fb.type === "Complaint"
                              ? "#fee2e2"
                              : fb.type === "Bug Report"
                                ? "#fffbeb"
                                : "#e0f2fe",
                          color:
                            fb.type === "Complaint"
                              ? "#dc2626"
                              : fb.type === "Bug Report"
                                ? "#d97706"
                                : "#0284c7",
                          fontSize: "0.72rem",
                        }}
                      >
                        {fb.type}
                      </span>

                      <span
                        className="ad-pill"
                        style={{
                          background:
                            fb.status === "Resolved"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            fb.status === "Resolved"
                              ? "#16a34a"
                              : "#dc2626",
                          fontSize: "0.72rem",
                        }}
                      >
                        {fb.status}
                      </span>
                    </div>
                  </div>

                  <p
                    className="ad-list-desc"
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.86rem",
                    }}
                  >
                    {fb.message}
                  </p>

                  <div
                    className="ad-list-meta"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "0.15rem",
                        color: "#eab308",
                      }}
                    >
                      {fb.rating ? (
                        Array.from({ length: fb.rating }).map((_, i) => (
                          <FaStar key={i} />
                        ))
                      ) : (
                        <span
                          style={{
                            color: "var(--ad-text-muted)",
                            fontSize: "0.75rem",
                          }}
                        >
                          No rating
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      {fb.status === "Pending" && (
                        <>
                          <button
                            onClick={() => setReplyingTo(fb)}
                            className="ad-btn ad-btn-primary"
                            style={{
                              padding: "0.35rem 0.75rem",
                              fontSize: "0.74rem",
                            }}
                          >
                            <FaReply /> Reply
                          </button>

                          <button
                            onClick={() => handleResolve(fb._id)}
                            className="ad-btn ad-btn-outline"
                            style={{
                              padding: "0.35rem 0.75rem",
                              fontSize: "0.74rem",
                            }}
                          >
                            <FaCheck /> Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {fb.adminReply && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: "var(--ad-bg-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <strong>Admin Reply:</strong>
                      <div style={{ marginTop: "0.3rem" }}>
                        {fb.adminReply}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {replyingTo && (
        <div
          className="ad-modal-backdrop"
          onClick={() => setReplyingTo(null)}
        >
          <div
            className="ad-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-modal-header">
              <h3>Reply to Feedback Submission</h3>

              <button
                className="ad-modal-close"
                onClick={() => setReplyingTo(null)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleReplySubmit}>
              <div className="ad-modal-body">
                <div
                  style={{
                    background: "var(--ad-bg-secondary)",
                    padding: "0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    marginBottom: "1.25rem",
                    borderLeft: "3px solid var(--ad-primary)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "var(--ad-text-muted)",
                    }}
                  >
                    From User:
                  </span>

                  <strong>
                    {replyingTo.user || "Unknown User"} (
                    {replyingTo.role})
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "0.4rem",
                      color: "var(--ad-text-muted)",
                    }}
                  >
                    Feedback subject:
                  </span>

                  <strong>{replyingTo.subject}</strong>
                </div>

                <div className="ad-form-group">
                  <label htmlFor="replyMail">
                    Administrative Response
                  </label>

                  <textarea
                    id="replyMail"
                    rows="5"
                    className="ad-textarea"
                    placeholder="Write your administrative response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ad-modal-footer">
                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                >
                  <FaReply /> Send Response
                </button>

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}