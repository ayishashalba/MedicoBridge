import React, { useState } from "react";
import {
  FaCog, FaBell, FaLock, FaTruck, FaFileInvoiceDollar,
  FaGlobe, FaUserShield, FaQuestionCircle, FaInfoCircle,
  FaChevronRight, FaCheck, FaTimes,
} from "react-icons/fa";
import "./PharmacyPages.css";

const settingsSections = [
  {
    title:"Account",
    items:[
      { key:"notifications", icon:<FaBell />,           label:"Notification Preferences",  desc:"Manage alerts, email & SMS notifications" },
      { key:"password",      icon:<FaLock />,            label:"Change Password",            desc:"Update your account password"             },
      { key:"privacy",       icon:<FaUserShield />,      label:"Privacy & Security",         desc:"Manage data privacy and 2FA settings"     },
    ],
  },
  {
    title:"Operations",
    items:[
      { key:"delivery",  icon:<FaTruck />,             label:"Delivery Settings",   desc:"Configure delivery zones, fees, and ETA"      },
      { key:"billing",   icon:<FaFileInvoiceDollar />, label:"Billing & Tax",       desc:"Set GST, invoice format, and payment methods"  },
      { key:"language",  icon:<FaGlobe />,             label:"Language & Region",   desc:"Choose language and regional currency"          },
    ],
  },
  {
    title:"Support",
    items:[
      { key:"help",  icon:<FaQuestionCircle />, label:"Help & Support",      desc:"Contact support or raise a ticket"   },
      { key:"faq",   icon:<FaInfoCircle />,     label:"FAQ",                 desc:"Frequently asked questions"          },
      { key:"about", icon:<FaCog />,            label:"About MedicoBridge",  desc:"Version info, terms and conditions"  },
    ],
  },
];

const panels = {
  notifications: () => (
    <div className="ph-settings-panel">
      <h4>Notification Preferences</h4>
      {["Low stock alerts","New prescription received","Order status updates","Payment reminders","System announcements"].map((label) => (
        <label key={label} className="ph-toggle-row">
          <span>{label}</span>
          <input type="checkbox" defaultChecked className="ph-toggle-input" />
        </label>
      ))}
    </div>
  ),
  password: () => (
    <div className="ph-settings-panel">
      <h4>Change Password</h4>
      {["Current Password","New Password","Confirm New Password"].map((label) => (
        <div key={label} className="ph-form-group">
          <label>{label}</label>
          <input type="password" placeholder={`Enter ${label.toLowerCase()}`} />
        </div>
      ))}
      <button className="ph-btn-submit"><FaCheck /> Update Password</button>
    </div>
  ),
  privacy: () => (
    <div className="ph-settings-panel">
      <h4>Privacy & Security</h4>
      <label className="ph-toggle-row"><span>Enable Two-Factor Authentication</span><input type="checkbox" className="ph-toggle-input" /></label>
      <label className="ph-toggle-row"><span>Share anonymized analytics data</span><input type="checkbox" defaultChecked className="ph-toggle-input" /></label>
      <label className="ph-toggle-row"><span>Allow third-party integrations</span><input type="checkbox" className="ph-toggle-input" /></label>
    </div>
  ),
  delivery: () => (
    <div className="ph-settings-panel">
      <h4>Delivery Settings</h4>
      <div className="ph-form-group"><label>Delivery Radius (km)</label><input type="number" defaultValue={10} /></div>
      <div className="ph-form-group"><label>Minimum Order for Free Delivery (₹)</label><input type="number" defaultValue={500} /></div>
      <div className="ph-form-group"><label>Delivery Fee (₹)</label><input type="number" defaultValue={40} /></div>
      <div className="ph-form-group"><label>Average ETA (minutes)</label><input type="number" defaultValue={45} /></div>
      <button className="ph-btn-submit"><FaCheck /> Save Delivery Settings</button>
    </div>
  ),
  billing: () => (
    <div className="ph-settings-panel">
      <h4>Billing & Tax</h4>
      <div className="ph-form-group"><label>GST Number</label><input defaultValue="27AABCM1234A1Z5" /></div>
      <div className="ph-form-group"><label>GST Rate (%)</label><input type="number" defaultValue={5} /></div>
      <div className="ph-form-group"><label>Invoice Prefix</label><input defaultValue="INV-" /></div>
      <div className="ph-form-group">
        <label>Accepted Payment Methods</label>
        {["Cash","UPI","Card","Insurance"].map((m) => (
          <label key={m} className="ph-checkbox-row"><input type="checkbox" defaultChecked /> {m}</label>
        ))}
      </div>
      <button className="ph-btn-submit"><FaCheck /> Save Billing Settings</button>
    </div>
  ),
  language: () => (
    <div className="ph-settings-panel">
      <h4>Language & Region</h4>
      <div className="ph-form-group"><label>Language</label><select defaultValue="en"><option value="en">English</option><option value="hi">Hindi</option><option value="mr">Marathi</option></select></div>
      <div className="ph-form-group"><label>Currency</label><select defaultValue="INR"><option>INR (₹)</option><option>USD ($)</option></select></div>
      <div className="ph-form-group"><label>Date Format</label><select><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
      <button className="ph-btn-submit"><FaCheck /> Save Preferences</button>
    </div>
  ),
  help: () => (
    <div className="ph-settings-panel">
      <h4>Help & Support</h4>
      <p className="ph-settings-text">Need help? Reach out to our support team.</p>
      <div className="ph-form-group"><label>Subject</label><input placeholder="Describe your issue…" /></div>
      <div className="ph-form-group"><label>Message</label><textarea rows={4} placeholder="Provide more details…" /></div>
      <button className="ph-btn-submit"><FaCheck /> Submit Ticket</button>
    </div>
  ),
  faq: () => (
    <div className="ph-settings-panel">
      <h4>Frequently Asked Questions</h4>
      {[
        ["How do I add a new medicine to inventory?", "Go to Medicine Inventory → click 'Add Medicine' → fill out the form and submit."],
        ["How do I mark a prescription as dispensed?", "Open Prescriptions → find the prescription → click 'View' → click 'Mark as Dispensed'."],
        ["Can I assign delivery agents manually?", "Currently, delivery agent assignment is done automatically. Manual assignment is coming soon."],
        ["How do I update my pharmacy profile?", "Go to Profile → click 'Edit Profile' → update the fields → click 'Save Changes'."],
      ].map(([q, a]) => (
        <div key={q} className="ph-faq-item">
          <p className="ph-faq-q">{q}</p>
          <p className="ph-faq-a">{a}</p>
        </div>
      ))}
    </div>
  ),
  about: () => (
    <div className="ph-settings-panel">
      <h4>About MedicoBridge</h4>
      <div className="ph-about-brand">
        <FaCog className="ph-about-icon" />
        <div>
          <p className="ph-about-name">MedicoBridge Pharmacy Portal</p>
          <p className="ph-about-version">Version 2.1.0 · Build 2026.07</p>
        </div>
      </div>
      <p className="ph-settings-text">MedicoBridge is a comprehensive healthcare management platform connecting pharmacies, hospitals, doctors, and patients for seamless care delivery.</p>
      <div className="ph-about-links">
        <a href="#" className="ph-about-link">Terms of Service</a>
        <a href="#" className="ph-about-link">Privacy Policy</a>
        <a href="#" className="ph-about-link">Contact Us</a>
      </div>
    </div>
  ),
};

export default function PharmacySettings() {
  const [activeKey, setActiveKey] = useState(null);
  const Panel = activeKey ? panels[activeKey] : null;

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaCog /> Settings</h2>
          <p className="ph-page-sub">Manage your pharmacy preferences and configurations</p>
        </div>
        {activeKey && (
          <button className="ph-btn-outline-dark" onClick={() => setActiveKey(null)}>
            <FaTimes /> Close Panel
          </button>
        )}
      </div>

      <div className="ph-settings-layout">
        {/* Settings Menu */}
        <div className="ph-settings-menu">
          {settingsSections.map((section) => (
            <div key={section.title} className="ph-settings-section">
              <p className="ph-settings-section-title">{section.title}</p>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  className={`ph-settings-item ${activeKey === item.key ? "ph-settings-item--active" : ""}`}
                  onClick={() => setActiveKey(activeKey === item.key ? null : item.key)}
                >
                  <span className="ph-settings-item-icon">{item.icon}</span>
                  <div className="ph-settings-item-text">
                    <span className="ph-settings-item-label">{item.label}</span>
                    <span className="ph-settings-item-desc">{item.desc}</span>
                  </div>
                  <FaChevronRight className="ph-settings-item-arrow" />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Settings Panel */}
        {Panel && (
          <div className="ph-card ph-settings-panel-wrapper">
            <Panel />
          </div>
        )}
      </div>
    </div>
  );
}
