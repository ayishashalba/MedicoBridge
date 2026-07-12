import React, { useState } from "react";
import {
  FaHospital,
  FaSlidersH,
  FaLock,
  FaFileInvoiceDollar,
  FaSave,
  FaCheckCircle,
  FaBell,
} from "react-icons/fa";
import "./HospitalSettings.css";

function HospitalSettings() {
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const triggerSave = (msg = "Hospital settings saved successfully!") => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="hosp-settings-page">
      {/* Save Notification Toast Alert */}
      {successMsg && (
        <div className="hosp-settings-toast">
          <FaCheckCircle className="toast-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="hosp-settings-container">
        {/* Navigation Sidebar */}
        <aside className="hosp-settings-sidebar">
          <button
            className={`hosp-settings-nav-btn ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <FaHospital /> General Info
          </button>
          <button
            className={`hosp-settings-nav-btn ${activeTab === "wards" ? "active" : ""}`}
            onClick={() => setActiveTab("wards")}
          >
            <FaSlidersH /> Wards &amp; Beds
          </button>
          <button
            className={`hosp-settings-nav-btn ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            <FaFileInvoiceDollar /> Billing Config
          </button>
          <button
            className={`hosp-settings-nav-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Security &amp; Access
          </button>
        </aside>

        {/* Configurations Forms Panel */}
        <div className="hosp-settings-content">
          {activeTab === "general" && (
            <div className="hosp-settings-panel">
              <div className="panel-header">
                <h2>General Hospital Profile</h2>
                <p>Manage hospital registration details, emergency lines, and location address.</p>
              </div>
              <div className="panel-body">
                <div className="form-group">
                  <label>Official Hospital Name</label>
                  <input type="text" defaultValue="City General Hospital" />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Emergency Line Number</label>
                    <input type="tel" defaultValue="+91 1800-123-4567" />
                  </div>
                  <div className="form-group half">
                    <label>Administration Email</label>
                    <input type="email" defaultValue="admin@citygeneral.in" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Full Address Location</label>
                  <textarea rows="3" defaultValue="12, Residency Rd, Ashok Nagar, Bengaluru, Karnataka 560025" />
                </div>
                <button className="hosp-btn-save" onClick={() => triggerSave("General profile details updated!")}>
                  <FaSave /> Save Profile Info
                </button>
              </div>
            </div>
          )}

          {activeTab === "wards" && (
            <div className="hosp-settings-panel">
              <div className="panel-header">
                <h2>Ward &amp; Bed Configuration</h2>
                <p>Customize department occupancy parameters and bed auto-release parameters.</p>
              </div>
              <div className="panel-body">
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Auto-release beds on Discharge</h4>
                    <p>Mark beds immediately available once discharge confirmation is generated.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Admit alert emails</h4>
                    <p>Alert nursing staff immediately when a patient checks in.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Default ICU Ward Bed Capacity</label>
                  <input type="number" defaultValue="20" />
                </div>
                <button className="hosp-btn-save" onClick={() => triggerSave("Ward parameters updated!")}>
                  <FaSave /> Save Ward Parameters
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="hosp-settings-panel">
              <div className="panel-header">
                <h2>Billing &amp; Invoice Configuration</h2>
                <p>Establish default fees, tax margins, and invoice payment timeout parameters.</p>
              </div>
              <div className="panel-body">
                <div className="form-row">
                  <div className="form-group half">
                    <label>Default CGST tax rate (%)</label>
                    <input type="number" defaultValue="2.5" />
                  </div>
                  <div className="form-group half">
                    <label>Default SGST tax rate (%)</label>
                    <input type="number" defaultValue="2.5" />
                  </div>
                </div>
                <div className="form-group">
                  <label>ICU Room Fee Per Day (₹)</label>
                  <input type="number" defaultValue="15000" />
                </div>
                <div className="form-group">
                  <label>General Ward Bed Fee Per Day (₹)</label>
                  <input type="number" defaultValue="2500" />
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Send Billing Reminders</h4>
                    <p>Send text message invoice links every 24 hours to patients with pending bills.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <button className="hosp-btn-save" onClick={() => triggerSave("Billing parameters updated!")}>
                  <FaSave /> Save Billing Margins
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="hosp-settings-panel">
              <div className="panel-header">
                <h2>Security &amp; Access Controls</h2>
                <p>Configure password criteria, login 2FA protocols, and access audits.</p>
              </div>
              <div className="panel-body">
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Two-Factor Authentication (2FA)</h4>
                    <p>Require verification OTP on administrator phone number to log on.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Login Audit Logs</h4>
                    <p>Keep a historical tracking record of all admin IP addresses and login sessions.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Auto Logout Timeout</label>
                  <select className="hosp-select" defaultValue="30">
                    <option value="15">15 minutes of inactivity</option>
                    <option value="30">30 minutes of inactivity</option>
                    <option value="60">1 hour of inactivity</option>
                  </select>
                </div>
                <button className="hosp-btn-save" onClick={() => triggerSave("Security configurations updated!")}>
                  <FaSave /> Save Security Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalSettings;
