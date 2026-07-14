import React, { useState } from "react";
import { FaCogs, FaDatabase, FaCreditCard, FaLock, FaCheckCircle } from "react-icons/fa";
import "./AdminPages.css";

export default function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [autoVerify, setAutoVerify] = useState(false);
  const [telehealth, setTelehealth] = useState(true);
  const [billingFee, setBillingFee] = useState("10");
  const [gateway, setGateway] = useState("Razorpay");
  const [apiKey, setApiKey] = useState("rzp_live_v9841fS220DskL");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Configure platform features, control billing fees, and manage gateway credentials</p>
      </div>

      {saved && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0d9488",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          zIndex: 1100,
          boxShadow: "0 10px 25px rgba(13,148,136,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaCheckCircle />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>System settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="ad-grid-2">
          {/* General Platform Config */}
          <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 className="ad-card-title"><FaCogs /> Platform Controls</h3>

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">System Maintenance Mode</span>
                <span className="ad-switch-desc">Block access to public frontends and mobile apps</span>
              </div>
              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) => setMaintenance(e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">Auto-Verify Medical Registrations</span>
                <span className="ad-switch-desc">Approve clinics immediately without credential file validation</span>
              </div>
              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">Telehealth Video Consultations</span>
                <span className="ad-switch-desc">Enable virtual consulting rooms for doctors</span>
              </div>
              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={telehealth}
                  onChange={(e) => setTelehealth(e.target.checked)}
                />
                <span className="ad-slider" />
              </label>
            </div>
          </div>

          {/* Pricing & Fees Settings */}
          <div className="ad-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="ad-card-title"><FaDatabase /> System Limits & Fees</h3>

            <div className="ad-form-group">
              <label htmlFor="billingFee">Platform Fee Percent (%)</label>
              <input
                id="billingFee"
                type="number"
                min="0"
                max="50"
                className="ad-input"
                value={billingFee}
                onChange={(e) => setBillingFee(e.target.value)}
              />
            </div>

            <div className="ad-form-group">
              <label htmlFor="deliveryLimit">Pharmacy Delivery Distance (km)</label>
              <select id="deliveryLimit" className="ad-select">
                <option>Up to 10 km (Standard)</option>
                <option>Up to 25 km (Extended)</option>
                <option>Up to 50 km (Regional)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Integration Credentials */}
        <div className="ad-card" style={{ marginTop: "1.5rem" }}>
          <h3 className="ad-card-title" style={{ marginBottom: "1.25rem" }}><FaCreditCard /> Payment Gateway Credentials</h3>
          <div className="ad-grid-2" style={{ gap: "1.25rem" }}>
            <div className="ad-form-group">
              <label htmlFor="gateway">Active Payment Gateway</label>
              <select
                id="gateway"
                className="ad-select"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
              >
                <option value="Razorpay">Razorpay Checkout (India)</option>
                <option value="Stripe">Stripe Payments (Global)</option>
                <option value="Paytm">Paytm Merchant Wallet</option>
              </select>
            </div>

            <div className="ad-form-group">
              <label htmlFor="apiKey">Live API Secret Token</label>
              <div style={{ position: "relative" }}>
                <FaLock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  id="apiKey"
                  type="password"
                  className="ad-input"
                  style={{ paddingLeft: "35px" }}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="ad-btn ad-btn-primary" style={{ padding: "0.75rem 2rem" }} disabled={saving}>
            {saving ? "Saving Configurations..." : "Save System Config"}
          </button>
        </div>
      </form>
    </div>
  );
}
