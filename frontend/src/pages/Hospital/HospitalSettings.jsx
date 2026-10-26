import React, { useState, useEffect, useCallback } from "react";
import {
  FaHospital,
  FaSlidersH,
  FaLock,
  FaFileInvoiceDollar,
  FaSave,
  FaCheckCircle,
  FaBell,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./HospitalSettings.css";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

function HospitalSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General Tab State
  const [hospitalName, setHospitalName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [address, setAddress] = useState("");

  // Wards & Beds Tab State
  const [autoReleaseBeds, setAutoReleaseBeds] = useState(true);
  const [admitAlertEmails, setAdmitAlertEmails] = useState(true);
  const [icuBedCapacity, setIcuBedCapacity] = useState(20);

  // Billing Tab State
  const [cgstRate, setCgstRate] = useState(2.5);
  const [sgstRate, setSgstRate] = useState(2.5);
  const [icuRoomFeePerDay, setIcuRoomFeePerDay] = useState(15000);
  const [generalWardFeePerDay, setGeneralWardFeePerDay] = useState(2500);
  const [billingReminders, setBillingReminders] = useState(false);

  // Security Tab State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAuditLogs, setLoginAuditLogs] = useState(true);
  const [autoLogoutTimeout, setAutoLogoutTimeout] = useState(30);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch settings & profile on mount
  useEffect(() => {
    const fetchAllSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/hospital/settings`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const { settings, profile } = data.data;
          if (profile) {
            setHospitalName(profile.name || "");
            setEmergencyContact(profile.emergencyContact || "");
            setAdminEmail(profile.email || "");
            setAddress(profile.address || "");
          }
          if (settings) {
            setAutoReleaseBeds(settings.autoReleaseBeds !== undefined ? settings.autoReleaseBeds : true);
            setAdmitAlertEmails(settings.admitAlertEmails !== undefined ? settings.admitAlertEmails : true);
            setIcuBedCapacity(settings.icuBedCapacity !== undefined ? settings.icuBedCapacity : 20);

            setCgstRate(settings.cgstRate !== undefined ? settings.cgstRate : 2.5);
            setSgstRate(settings.sgstRate !== undefined ? settings.sgstRate : 2.5);
            setIcuRoomFeePerDay(settings.icuRoomFeePerDay !== undefined ? settings.icuRoomFeePerDay : 15000);
            setGeneralWardFeePerDay(settings.generalWardFeePerDay !== undefined ? settings.generalWardFeePerDay : 2500);
            setBillingReminders(Boolean(settings.billingReminders));

            setTwoFactorAuth(Boolean(settings.twoFactorAuth));
            setLoginAuditLogs(settings.loginAuditLogs !== undefined ? settings.loginAuditLogs : true);
            setAutoLogoutTimeout(settings.autoLogoutTimeout || 30);
          }
        } else {
          toast.error(data.message || "Failed to load hospital settings.");
        }
      } catch (err) {
        console.error("Error loading hospital settings:", err);
        toast.error("Network error while loading settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllSettings();
  }, [authHeaders]);

  // Save General Profile Info
  const handleSaveProfile = async () => {
    if (!hospitalName.trim()) {
      toast.error("Official Hospital Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/hospital/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name: hospitalName,
          emergencyContact: emergencyContact,
          email: adminEmail,
          address: address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("General profile details updated!");
      } else {
        toast.error(data.message || "Failed to update profile details.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Network error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  // Save Ward Parameters
  const handleSaveWards = async () => {
    const parsedCapacity = Number(icuBedCapacity);
    if (isNaN(parsedCapacity) || parsedCapacity < 0) {
      toast.error("ICU Bed Capacity must be a non-negative number.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/hospital/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          autoReleaseBeds,
          admitAlertEmails,
          icuBedCapacity: parsedCapacity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ward parameters updated!");
      } else {
        toast.error(data.message || "Failed to update ward parameters.");
      }
    } catch (err) {
      console.error("Error saving wards settings:", err);
      toast.error("Network error while updating ward parameters.");
    } finally {
      setSaving(false);
    }
  };

  // Save Billing Margins
  const handleSaveBilling = async () => {
    const cgst = Number(cgstRate);
    const sgst = Number(sgstRate);
    const icuFee = Number(icuRoomFeePerDay);
    const wardFee = Number(generalWardFeePerDay);

    if (isNaN(cgst) || cgst < 0) {
      toast.error("CGST tax rate must be a non-negative number.");
      return;
    }
    if (isNaN(sgst) || sgst < 0) {
      toast.error("SGST tax rate must be a non-negative number.");
      return;
    }
    if (isNaN(icuFee) || icuFee < 0) {
      toast.error("ICU Room Fee must be a non-negative number.");
      return;
    }
    if (isNaN(wardFee) || wardFee < 0) {
      toast.error("General Ward Fee must be a non-negative number.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/hospital/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          cgstRate: cgst,
          sgstRate: sgst,
          icuRoomFeePerDay: icuFee,
          generalWardFeePerDay: wardFee,
          billingReminders,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Billing parameters updated!");
      } else {
        toast.error(data.message || "Failed to update billing parameters.");
      }
    } catch (err) {
      console.error("Error saving billing settings:", err);
      toast.error("Network error while updating billing parameters.");
    } finally {
      setSaving(false);
    }
  };

  // Save Security Setup
  const handleSaveSecurity = async () => {
    const timeout = Number(autoLogoutTimeout);
    if (![15, 30, 60].includes(timeout)) {
      toast.error("Auto logout timeout must be 15, 30, or 60 minutes.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/hospital/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          twoFactorAuth,
          loginAuditLogs,
          autoLogoutTimeout: timeout,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Security configurations updated!");
      } else {
        toast.error(data.message || "Failed to update security configurations.");
      }
    } catch (err) {
      console.error("Error saving security settings:", err);
      toast.error("Network error while updating security configurations.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hosp-settings-page">
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
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="Enter official hospital name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Emergency Line Number</label>
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+91 1800-123-4567"
                    />
                  </div>
                  <div className="form-group half">
                    <label>Administration Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@hospital.in"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Full Address Location</label>
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter hospital address"
                  />
                </div>
                <button
                  className="hosp-btn-save"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Profile Info"}
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
                    <input
                      type="checkbox"
                      checked={autoReleaseBeds}
                      onChange={(e) => setAutoReleaseBeds(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Admit alert emails</h4>
                    <p>Alert nursing staff immediately when a patient checks in.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={admitAlertEmails}
                      onChange={(e) => setAdmitAlertEmails(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Default ICU Ward Bed Capacity</label>
                  <input
                    type="number"
                    value={icuBedCapacity}
                    onChange={(e) => setIcuBedCapacity(e.target.value)}
                  />
                </div>
                <button
                  className="hosp-btn-save"
                  onClick={handleSaveWards}
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Ward Parameters"}
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
                    <input
                      type="number"
                      step="0.1"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(e.target.value)}
                    />
                  </div>
                  <div className="form-group half">
                    <label>Default SGST tax rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>ICU Room Fee Per Day (₹)</label>
                  <input
                    type="number"
                    value={icuRoomFeePerDay}
                    onChange={(e) => setIcuRoomFeePerDay(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>General Ward Bed Fee Per Day (₹)</label>
                  <input
                    type="number"
                    value={generalWardFeePerDay}
                    onChange={(e) => setGeneralWardFeePerDay(e.target.value)}
                  />
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Send Billing Reminders</h4>
                    <p>Send text message invoice links every 24 hours to patients with pending bills.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={billingReminders}
                      onChange={(e) => setBillingReminders(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <button
                  className="hosp-btn-save"
                  onClick={handleSaveBilling}
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Billing Margins"}
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
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group-toggle">
                  <div className="toggle-info">
                    <h4>Login Audit Logs</h4>
                    <p>Keep a historical tracking record of all admin IP addresses and login sessions.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={loginAuditLogs}
                      onChange={(e) => setLoginAuditLogs(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Auto Logout Timeout</label>
                  <select
                    className="hosp-select"
                    value={autoLogoutTimeout}
                    onChange={(e) => setAutoLogoutTimeout(Number(e.target.value))}
                  >
                    <option value="15">15 minutes of inactivity</option>
                    <option value="30">30 minutes of inactivity</option>
                    <option value="60">1 hour of inactivity</option>
                  </select>
                </div>
                <button
                  className="hosp-btn-save"
                  onClick={handleSaveSecurity}
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Saving..." : "Save Security Setup"}
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
