import React, { useState } from "react";
import { FaComments, FaStar, FaTimes, FaReply, FaCheck, FaExclamationCircle } from "react-icons/fa";
import "./AdminPages.css";

const initialFeedbacks = [
  {
    id: "FDB-301",
    user: "Aarav Sharma",
    role: "Patient",
    type: "Complaint",
    subject: "Appointment connection failed",
    message: "Tried joining room ROOM-MHT-994 for Dr Priya Mehta, but video session kept freezing. Requesting appointment refund.",
    rating: 2,
    date: "14 Jul 2026",
    status: "Pending",
  },
  {
    id: "FDB-302",
    user: "Dr. Anil Kumar",
    role: "Doctor",
    type: "Suggestion",
    subject: "Prescription item search shortcut",
    message: "Would be great if the prescription writer page allows pressing Enter to add medicine items to invoice list immediately.",
    rating: 5,
    date: "13 Jul 2026",
    status: "Resolved",
  },
  {
    id: "FDB-303",
    user: "Sunita Rao",
    role: "Patient",
    type: "General Feedback",
    subject: "Medicine delivery was very fast",
    message: "Ordered my prescription drugs from Medicare pharmacy. Received the parcel in under an hour. Outstanding service!",
    rating: 5,
    date: "12 Jul 2026",
    status: "Resolved",
  },
  {
    id: "FDB-304",
    user: "MediCare Pharmacy",
    role: "Pharmacy",
    type: "Bug Report",
    subject: "Inventory PDF export format misaligned",
    message: "Exporting medicine stock lists to PDF clips details when list exceeds 2 pages. Please fix layout scaling.",
    rating: 3,
    date: "11 Jul 2026",
    status: "Pending",
  },
];

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const handleResolve = (id) => {
    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, status: "Resolved" } : fb))
    );
    triggerToast(`Feedback ID ${id} marked as Resolved.`);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === replyingTo.id ? { ...fb, status: "Resolved" } : fb))
    );

    triggerToast(`Response email sent to ${replyingTo.user}. Feedback resolved.`);
    setReplyingTo(null);
    setReplyText("");
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Monitor patient reviews, review medical service complaints, and resolve support tickets</p>
      </div>

      {toastMsg && (
        <div style={{
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
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaCheck style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toastMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="ad-card-title"><FaComments /> User Submissions</h3>

        <div className="ad-list-container">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="ad-list-item">
              <div className="ad-list-icon">
                <FaComments />
              </div>
              <div className="ad-list-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", color: "var(--ad-text-primary)" }}>{fb.subject}</h4>
                    <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>
                      Submitted by <strong>{fb.user}</strong> ({fb.role}) • {fb.date}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className="ad-pill" style={{
                      background: fb.type === "Complaint" ? "#fee2e2" : fb.type === "Bug Report" ? "#fffbeb" : "#e0f2fe",
                      color: fb.type === "Complaint" ? "#dc2626" : fb.type === "Bug Report" ? "#d97706" : "#0284c7",
                      fontSize: "0.72rem"
                    }}>{fb.type}</span>
                    <span className="ad-pill" style={{
                      background: fb.status === "Resolved" ? "#dcfce7" : "#fee2e2",
                      color: fb.status === "Resolved" ? "#16a34a" : "#dc2626",
                      fontSize: "0.72rem"
                    }}>{fb.status}</span>
                  </div>
                </div>

                <p className="ad-list-desc" style={{ marginTop: "0.5rem", fontSize: "0.86rem" }}>{fb.message}</p>

                <div className="ad-list-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.15rem", color: "#eab308" }}>
                    {Array.from({ length: fb.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {fb.status === "Pending" && (
                      <>
                        <button
                          onClick={() => setReplyingTo(fb)}
                          className="ad-btn ad-btn-primary"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.74rem" }}
                        >
                          <FaReply /> Reply
                        </button>
                        <button
                          onClick={() => handleResolve(fb.id)}
                          className="ad-btn ad-btn-outline"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.74rem" }}
                        >
                          <FaCheck /> Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Modal */}
      {replyingTo && (
        <div className="ad-modal-backdrop" onClick={() => setReplyingTo(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>Reply to Feedback Submission</h3>
              <button className="ad-modal-close" onClick={() => setReplyingTo(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleReplySubmit}>
              <div className="ad-modal-body">
                <div style={{ background: "var(--ad-bg-secondary)", padding: "0.85rem", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "1.25rem", borderLeft: "3px solid var(--ad-primary)" }}>
                  <span style={{ display: "block", color: "var(--ad-text-muted)" }}>From User:</span>
                  <strong>{replyingTo.user} ({replyingTo.role})</strong>
                  <span style={{ display: "block", marginTop: "0.4rem", color: "var(--ad-text-muted)" }}>Feedback subject:</span>
                  <strong>{replyingTo.subject}</strong>
                </div>

                <div className="ad-form-group">
                  <label htmlFor="replyMail">Administrative Response Email</label>
                  <textarea
                    id="replyMail"
                    rows="5"
                    className="ad-textarea"
                    placeholder="Write support reply or compensation details. This email will be sent automatically to resolve the case..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="ad-modal-footer">
                <button type="submit" className="ad-btn ad-btn-primary"><FaReply /> Send Response</button>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setReplyingTo(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
