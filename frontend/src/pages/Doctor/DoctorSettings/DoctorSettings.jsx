import React, { useState } from "react";
import {
  FaUserCog,
  FaBell,
  FaLock,
  FaGlobe,
  FaMoon,
  FaShieldAlt,
  FaChevronRight,
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";
import "./DoctorSettings.css";

function DoctorSettings() {
  const [activeView, setActiveView] = useState(null); // null, 'notifications', 'password', 'privacy', 'language', 'theme'
  const [successMsg, setSuccessMsg] = useState("");

  const triggerSave = (message = "Settings updated successfully!") => {
    setSuccessMsg(message);
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };

  // Sub-component views
  const renderNotifications = () => (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={() => setActiveView(null)}>
          <FaArrowLeft /> Settings
        </button>
        <h2>Notification Preferences</h2>
        <p>Choose when and how you want to be notified by MedicoBridge.</p>
      </div>

      <div className="panel-body">
        <div className="settings-form-group">
          <div className="form-toggle-row">
            <div>
              <h4>Email Notifications</h4>
              <p>Receive email summaries of daily consultations and reports.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-toggle-row">
            <div>
              <h4>SMS Alerts</h4>
              <p>Get instant text messages for urgent appointment cancellations.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-toggle-row">
            <div>
              <h4>Browser Push Notifications</h4>
              <p>Get live desktop notifications for patient check-ins and chat messages.</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-toggle-row">
            <div>
              <h4>Patient Message Reminders</h4>
              <p>Alert me when a patient uploads a new medical record or message.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-input-row">
            <label>Reminder Lead Time</label>
            <select className="settings-select" defaultValue="15">
              <option value="5">5 minutes before appointment</option>
              <option value="15">15 minutes before appointment</option>
              <option value="30">30 minutes before appointment</option>
              <option value="60">1 hour before appointment</option>
            </select>
          </div>
        </div>

        <button className="settings-save-btn" onClick={() => triggerSave()}>
          <FaSave /> Save Preferences
        </button>
      </div>
    </div>
  );

  const renderPassword = () => (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={() => setActiveView(null)}>
          <FaArrowLeft /> Settings
        </button>
        <h2>Change Password</h2>
        <p>Ensure your account is protected with a strong, secure password.</p>
      </div>

      <div className="panel-body">
        <div className="settings-form-group">
          <div className="form-input-row">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" className="settings-text-input" />
          </div>

          <div className="form-input-row">
            <label>New Password</label>
            <input type="password" placeholder="Minimum 8 characters" className="settings-text-input" />
          </div>

          <div className="form-input-row">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Re-enter new password" className="settings-text-input" />
          </div>
        </div>

        <button className="settings-save-btn" onClick={() => triggerSave("Password updated successfully!")}>
          <FaSave /> Update Password
        </button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={() => setActiveView(null)}>
          <FaArrowLeft /> Settings
        </button>
        <h2>Privacy & Security</h2>
        <p>Control visibility options, login audits, and session lifetimes.</p>
      </div>

      <div className="panel-body">
        <div className="settings-form-group">
          <div className="form-toggle-row">
            <div>
              <h4>Two-Factor Authentication (2FA)</h4>
              <p>Use verification codes on your phone to secure logins.</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-toggle-row">
            <div>
              <h4>Public Directory Search</h4>
              <p>Allow unregistered patients to search and view your specialist card details.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-toggle-row">
            <div>
              <h4>Audit Login History</h4>
              <p>Track operating system types, location logs, and active browser sessions.</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-input-row">
            <label>Auto-logout Timeout</label>
            <select className="settings-select" defaultValue="30">
              <option value="15">15 minutes of inactivity</option>
              <option value="30">30 minutes of inactivity</option>
              <option value="60">1 hour of inactivity</option>
              <option value="never">Never (Not recommended)</option>
            </select>
          </div>
        </div>

        <button className="settings-save-btn" onClick={() => triggerSave("Privacy settings saved!")}>
          <FaSave /> Save Security Configurations
        </button>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={() => setActiveView(null)}>
          <FaArrowLeft /> Settings
        </button>
        <h2>Language Settings</h2>
        <p>Choose your preferred interface language for MedicoBridge Portal.</p>
      </div>

      <div className="panel-body">
        <div className="settings-form-group">
          <div className="language-options">
            {[
              { code: "en", name: "English (US/UK)", desc: "Default layout language" },
              { code: "hi", name: "हिन्दी (Hindi)", desc: "Translation summary coverage 90%" },
              { code: "ka", name: "ಕನ್ನಡ (Kannada)", desc: "Translation summary coverage 85%" },
              { code: "ta", name: "தமிழ் (Tamil)", desc: "Translation summary coverage 85%" },
              { code: "ml", name: "മലയാളം (Malayalam)", desc: "Translation summary coverage 80%" },
            ].map((lang) => (
              <label className="language-option-card" key={lang.code}>
                <input type="radio" name="portalLanguage" defaultChecked={lang.code === "en"} />
                <div className="language-info">
                  <span className="language-name">{lang.name}</span>
                  <span className="language-desc">{lang.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button className="settings-save-btn" onClick={() => triggerSave("Language changed successfully!")}>
          <FaSave /> Apply Language change
        </button>
      </div>
    </div>
  );

  const renderTheme = () => (
    <div className="settings-panel">
      <div className="panel-header">
        <button className="panel-back-btn" onClick={() => setActiveView(null)}>
          <FaArrowLeft /> Settings
        </button>
        <h2>Theme Customization</h2>
        <p>Select display modes and accent palette themes.</p>
      </div>

      <div className="panel-body">
        <div className="settings-form-group">
          <label className="section-label-inner">Display Mode</label>
          <div className="theme-mode-grid">
            {[
              { key: "light", label: "Light Mode", desc: "Classic cool white display" },
              { key: "dark", label: "Dark Mode", desc: "Reduced strain dark grey backdrop" },
              { key: "system", label: "System Default", desc: "Matches operating system theme" },
            ].map((mode) => (
              <label className="theme-mode-card" key={mode.key}>
                <input type="radio" name="themeMode" defaultChecked={mode.key === "light"} />
                <div className="mode-card-inner">
                  <h4>{mode.label}</h4>
                  <p>{mode.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <label className="section-label-inner" style={{ marginTop: "1.5rem" }}>Color Accent presets</label>
          <div className="accent-presets-grid">
            {[
              { name: "Premium Teal", color: "#0d9488" },
              { name: "Ocean Blue", color: "#0284c7" },
              { name: "Warm Amber", color: "#f59e0b" },
              { name: "Healing Green", color: "#16a34a" },
            ].map((accent, i) => (
              <label className="accent-pill-card" key={i}>
                <input type="radio" name="colorAccent" defaultChecked={i === 0} />
                <span className="accent-color-bubble" style={{ backgroundColor: accent.color }} />
                <span>{accent.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="settings-save-btn" onClick={() => triggerSave("Theme settings applied!")}>
          <FaSave /> Save Theme Accent
        </button>
      </div>
    </div>
  );

  // Router dispatcher
  if (activeView === "notifications") return renderNotifications();
  if (activeView === "password") return renderPassword();
  if (activeView === "privacy") return renderPrivacy();
  if (activeView === "language") return renderLanguage();
  if (activeView === "theme") return renderTheme();

  return (
    <div className="doctor-settings">
      {/* ── Settings Header ───────────────────────────── */}
      <div className="settings-header">
        <h2>
          <FaUserCog /> Settings
        </h2>
        <p>Manage your account preferences, configurations, and themes.</p>
      </div>

      {/* ── Save Notification Toast Alert ────────────── */}
      {successMsg && (
        <div className="settings-alert-toast">
          <FaCheckCircle />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Settings Grid ─────────────────────────────── */}
      <div className="settings-list">
        <div className="setting-card" onClick={() => setActiveView("notifications")}>
          <div className="setting-left">
            <div className="setting-icon setting-icon--notifications">
              <FaBell />
            </div>
            <div>
              <h3>Notifications</h3>
              <p>Configure sms, email and push reminders lead times.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card" onClick={() => setActiveView("password")}>
          <div className="setting-left">
            <div className="setting-icon setting-icon--password">
              <FaLock />
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Secure your login credentials with a new strong password.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card" onClick={() => setActiveView("privacy")}>
          <div className="setting-left">
            <div className="setting-icon setting-icon--privacy">
              <FaShieldAlt />
            </div>
            <div>
              <h3>Privacy & Security</h3>
              <p>Configure 2FA controls and audit active browser timeouts.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card" onClick={() => setActiveView("language")}>
          <div className="setting-left">
            <div className="setting-icon setting-icon--language">
              <FaGlobe />
            </div>
            <div>
              <h3>Language Settings</h3>
              <p>Choose display translation settings (English, Hindi, etc).</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card" onClick={() => setActiveView("theme")}>
          <div className="setting-left">
            <div className="setting-icon setting-icon--theme">
              <FaMoon />
            </div>
            <div>
              <h3>Theme Customization</h3>
              <p>Change screen backgrounds and color accent highlights.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>
      </div>
    </div>
  );
}

export default DoctorSettings;