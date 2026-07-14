import React, { useState } from "react";
import { FaFileAlt, FaCheck, FaTimes, FaShieldAlt, FaBriefcase, FaBuilding, FaPills } from "react-icons/fa";
import "./AdminPages.css";

const initialQueue = [
  {
    id: "APP-901",
    name: "Dr. Sandeep Reddy",
    type: "Doctor",
    specialty: "Cardiology",
    email: "sandeep.reddy@heartcare.com",
    license: "MCI-44912",
    experience: "14 years",
    docName: "medical_degree_reddy.pdf",
    clinic: "Reddy Heart Care Center",
    date: "14 Jul 2026",
  },
  {
    id: "APP-902",
    name: "Apex Heart Clinic",
    type: "Hospital",
    specialty: "Multi-Specialty",
    email: "admin@apexheartclinic.in",
    license: "HSP-LIC-88241",
    experience: "Established 2012",
    docName: "hospital_accreditation_2026.pdf",
    clinic: "Apex Building, Sec 5, Gurgaon",
    date: "14 Jul 2026",
  },
  {
    id: "APP-903",
    name: "MedPlus Pharmacy",
    type: "Pharmacy",
    specialty: "Retail Pharmacy",
    email: "license@medplusrx.com",
    license: "DL-2415-A",
    experience: "3 branches",
    docName: "drug_license_retail.pdf",
    clinic: "Main Market, Sector 2, Noida",
    date: "13 Jul 2026",
  },
  {
    id: "APP-904",
    name: "Dr. Neha Gokhale",
    type: "Doctor",
    specialty: "Pediatrics",
    email: "neha.gokhale@kidscare.com",
    license: "MCI-55248",
    experience: "8 years",
    docName: "pediatrics_cert_mci.pdf",
    clinic: "Kids Clinic, Bandra, Mumbai",
    date: "12 Jul 2026",
  },
];

export default function AdminApprovals() {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toast, setToast] = useState(null);

  const handleApprove = (id, name) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    setSelectedApp(null);
    triggerToast(`Approved registration for ${name}. Account is now fully active.`);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setQueue((prev) => prev.filter((item) => item.id !== rejectingApp.id));
    triggerToast(`Rejected registration for ${rejectingApp.name}. Reason: ${rejectionReason}`);
    setRejectingApp(null);
    setRejectionReason("");
    setSelectedApp(null);
  };

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Doctor": return <FaBriefcase style={{ color: "#4f46e5" }} />;
      case "Hospital": return <FaBuilding style={{ color: "#0d9488" }} />;
      case "Pharmacy": return <FaPills style={{ color: "#f59e0b" }} />;
      default: return <FaFileAlt />;
    }
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Review licensing credentials, verify registration documentation, and moderate access requests</p>
      </div>

      {toast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0f172a",
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
          <FaShieldAlt style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toast}</span>
        </div>
      )}

      <div className="ad-grid-2">
        {/* Verification Requests List */}
        <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="ad-card-title"><FaFileAlt /> Pending Review ({queue.length})</h3>

          {queue.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--ad-text-muted)" }}>
              No applications are currently awaiting approval. System is up to date!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {queue.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: selectedApp && selectedApp.id === app.id ? "var(--ad-primary)" : "var(--ad-border-color)",
                    background: selectedApp && selectedApp.id === app.id ? "var(--ad-secondary-light)" : "#fff",
                    cursor: "pointer",
                    transition: "all var(--ad-transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--ad-bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem"
                    }}>
                      {getIcon(app.type)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.88rem", color: "var(--ad-text-primary)" }}>{app.name}</h4>
                      <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>
                        {app.type} • Submitted {app.date}
                      </span>
                    </div>
                  </div>
                  <span className="ad-id-badge" style={{ fontSize: "0.72rem" }}>{app.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Application Details Panel */}
        <div className="ad-card" style={{ minHeight: "350px" }}>
          {selectedApp ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "adFadeIn 0.2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--ad-border-color)", paddingBottom: "1rem" }}>
                <div>
                  <span className="ad-pill" style={{
                    background: selectedApp.type === "Doctor" ? "#e0f2fe" : selectedApp.type === "Hospital" ? "#ccfbf1" : "#fef3c7",
                    color: selectedApp.type === "Doctor" ? "#0369a1" : selectedApp.type === "Hospital" ? "#0f766e" : "#d97706",
                    marginBottom: "0.35rem"
                  }}>{selectedApp.type}</span>
                  <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{selectedApp.name}</h3>
                </div>
                <span className="ad-id-badge">{selectedApp.id}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Contact Email</span>
                  <strong>{selectedApp.email}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>License Number</span>
                  <strong><code>{selectedApp.license}</code></strong>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Experience / Scale</span>
                  <span>{selectedApp.experience}</span>
                </div>
                <div>
                  <span style={{ color: "var(--ad-text-muted)", display: "block" }}>Practice Location</span>
                  <span>{selectedApp.clinic}</span>
                </div>
              </div>

              {/* Uploaded Credential Document Placeholder */}
              <div style={{
                background: "var(--ad-bg-secondary)",
                borderRadius: "10px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px dashed var(--ad-border-color)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FaFileAlt style={{ color: "var(--ad-text-secondary)", fontSize: "1.5rem" }} />
                  <div>
                    <span style={{ display: "block", fontSize: "0.82rem", fontWeight: "600" }}>{selectedApp.docName}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--ad-text-muted)" }}>PDF Document • 2.4 MB • Digitally Signed</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Simulated PDF credential download: ${selectedApp.docName}`)}
                  className="ad-btn ad-btn-outline"
                  style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                >
                  View File
                </button>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", borderTop: "1px solid var(--ad-border-color)", paddingTop: "1.25rem" }}>
                <button
                  onClick={() => handleApprove(selectedApp.id, selectedApp.name)}
                  className="ad-btn ad-btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <FaCheck /> Verify & Approve
                </button>
                <button
                  onClick={() => setRejectingApp(selectedApp)}
                  className="ad-btn ad-btn-danger"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <FaTimes /> Reject Application
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--ad-text-muted)", padding: "3rem 0" }}>
              <FaShieldAlt style={{ fontSize: "3rem", color: "var(--ad-border-color)", marginBottom: "1rem" }} />
              <p style={{ margin: 0, fontSize: "0.88rem" }}>Select an application from the sidebar to review license credentials</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Application Modal */}
      {rejectingApp && (
        <div className="ad-modal-backdrop" onClick={() => setRejectingApp(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3>Reject Application</h3>
              <button className="ad-modal-close" onClick={() => setRejectingApp(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="ad-modal-body">
                <p style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)", marginBottom: "1rem" }}>
                  Please specify the reason for rejecting <strong>{rejectingApp.name}</strong>'s verification request. An email will be sent notifying them.
                </p>
                <div className="ad-form-group">
                  <label htmlFor="reason">Rejection Reason</label>
                  <textarea
                    id="reason"
                    rows="4"
                    className="ad-textarea"
                    placeholder="e.g. Expired medical practitioner license, uploaded certificate document is illegible, etc."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="ad-modal-footer">
                <button type="submit" className="ad-btn ad-btn-primary" style={{ background: "#dc2626" }}>Confirm Rejection</button>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setRejectingApp(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
