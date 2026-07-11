import React from "react";
import {
  FaUserCog,
  FaBell,
  FaLock,
  FaGlobe,
  FaMoon,
  FaShieldAlt,
  FaChevronRight,
} from "react-icons/fa";
import "./DoctorSettings.css";

function DoctorSettings() {
  return (
    <div className="doctor-settings">

      <div className="settings-header">
        <h2>
          <FaUserCog /> Settings
        </h2>
        <p>Manage your account preferences and privacy.</p>
      </div>

      <div className="settings-list">

        <div className="setting-card">
          <div className="setting-left">
            <FaBell className="setting-icon" />
            <div>
              <h3>Notifications</h3>
              <p>Manage notification preferences.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card">
          <div className="setting-left">
            <FaLock className="setting-icon" />
            <div>
              <h3>Change Password</h3>
              <p>Update your account password.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card">
          <div className="setting-left">
            <FaShieldAlt className="setting-icon" />
            <div>
              <h3>Privacy & Security</h3>
              <p>Manage account privacy settings.</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card">
          <div className="setting-left">
            <FaGlobe className="setting-icon" />
            <div>
              <h3>Language</h3>
              <p>English (UI Only)</p>
            </div>
          </div>
          <FaChevronRight />
        </div>

        <div className="setting-card">
          <div className="setting-left">
            <FaMoon className="setting-icon" />
            <div>
              <h3>Theme</h3>
              <p>Light Mode (UI Only)</p>
            </div>
          </div>

          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>

      </div>

    </div>
  );
}

export default DoctorSettings;