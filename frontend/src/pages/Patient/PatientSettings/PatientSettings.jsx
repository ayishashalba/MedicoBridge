import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaLock,
  FaBell,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaSignOutAlt,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";
import "./PatientSettings.css";

function PatientSettings() {
  // Toggle states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [apptReminders, setApptReminders] = useState(true);
  
  const [profileVis, setProfileVis] = useState(true);
  const [shareRecords, setShareRecords] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const [language, setLanguage] = useState("en");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    const langNames = {
      en: "English",
      hi: "Hindi",
      es: "Spanish",
      ar: "Arabic"
    };
    triggerToast(`Language changed to ${langNames[e.target.value]} (UI simulation only)`);
  };

  return (
    <div className="ps-page">
      {/* Toast Notification (Portal) */}
      {toastMessage && createPortal(
        <div className="ps-toast">
          <FaInfoCircle style={{ color: "#0d9488" }} />
          <span>{toastMessage}</span>
        </div>,
        document.body
      )}

      {/* Header */}
      <header className="ps-header">
        <h1 className="ps-title">Settings</h1>
        <p className="ps-subtitle">Manage your account configurations and preferences</p>
      </header>

      {/* ── SECTION 1: Account Security ── */}
      <div className="ps-section">
        <h2 className="ps-section-title">Account Security</h2>
        
        <div 
          className="ps-row ps-row-clickable" 
          onClick={() => triggerToast("Change Password page is approved but under construction")}
        >
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--security">
              <FaLock />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Change Password</span>
              <span className="ps-item-desc">Update your login password regularly for safety</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <FaChevronRight className="ps-chevron" />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Notifications ── */}
      <div className="ps-section">
        <h2 className="ps-section-title">Notification Preferences</h2>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--notifications">
              <FaBell />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Email Notifications</span>
              <span className="ps-item-desc">Receive lab reports and bills directly in email inbox</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={emailNotif} 
                onChange={(e) => setEmailNotif(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--notifications">
              <FaBell />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">SMS Notifications</span>
              <span className="ps-item-desc">Receive updates about appointment timings over SMS</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={smsNotif} 
                onChange={(e) => setSmsNotif(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--notifications">
              <FaBell />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Appointment Reminders</span>
              <span className="ps-item-desc">Enable reminder push notifications 30 minutes before booking</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={apptReminders} 
                onChange={(e) => setApptReminders(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Privacy & Security ── */}
      <div className="ps-section">
        <h2 className="ps-section-title">Privacy & Security</h2>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--privacy">
              <FaShieldAlt />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Profile Visibility</span>
              <span className="ps-item-desc">Allow verified MedicoBridge doctors to view your profile and medical history</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={profileVis} 
                onChange={(e) => setProfileVis(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--privacy">
              <FaShieldAlt />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Anonymous Research Sharing</span>
              <span className="ps-item-desc">Anonymously share diagnosed symptoms for scientific medical study cases</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={shareRecords} 
                onChange={(e) => setShareRecords(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--privacy">
              <FaShieldAlt />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Two-Factor Authentication</span>
              <span className="ps-item-desc">Require OTP confirmation from registered device during login attempts</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <label className="ps-switch">
              <input 
                type="checkbox" 
                checked={twoFactor} 
                onChange={(e) => setTwoFactor(e.target.checked)} 
              />
              <span className="ps-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Saved Addresses ── */}
      <div className="ps-section">
        <h2 className="ps-section-title">Saved Addresses</h2>

        <div 
          className="ps-row ps-row-clickable"
          onClick={() => triggerToast("Address Manager drawer is approved but under construction")}
        >
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--addresses">
              <FaMapMarkerAlt />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Saved Addresses</span>
              <span className="ps-item-desc">Manage home, work, and family shipping address cards</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <span style={{ fontSize: "0.85rem", color: "#64748b", marginRight: "0.5rem" }}>1 Address</span>
            <FaChevronRight className="ps-chevron" />
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Regional & System ── */}
      <div className="ps-section">
        <h2 className="ps-section-title">Regional Preference</h2>

        <div className="ps-row">
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--language">
              <FaGlobe />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title">Display Language</span>
              <span className="ps-item-desc">Choose language for interface labels and reports</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <select className="ps-select" value={language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SECTION 6: Logout ── */}
      <div className="ps-section" style={{ borderColor: "#fca5a5" }}>
        <h2 className="ps-section-title" style={{ color: "#ef4444", borderColor: "#fee2e2" }}>Danger Zone</h2>

        <div 
          className="ps-row ps-row-clickable"
          onClick={() => triggerToast("Session logout requested (auth middleware simulation)")}
        >
          <div className="ps-meta-wrapper">
            <div className="ps-icon-box ps-icon--logout">
              <FaSignOutAlt />
            </div>
            <div className="ps-text-group">
              <span className="ps-item-title" style={{ color: "#ef4444", fontWeight: 600 }}>Log Out Account</span>
              <span className="ps-item-desc">Sign out of this device. You will need to login again to access patient record dashboard</span>
            </div>
          </div>
          <div className="ps-control-wrapper">
            <FaChevronRight className="ps-chevron" style={{ color: "#ef4444" }} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default PatientSettings;
