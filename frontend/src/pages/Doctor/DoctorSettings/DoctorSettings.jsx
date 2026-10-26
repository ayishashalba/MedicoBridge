import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCog,
  FaBell,
  FaLock,
  FaShieldAlt,
  FaGlobe,
  FaMoon,
  FaStar,
  FaChartBar,
  FaQuestionCircle,
  FaInfoCircle,
  FaChevronRight,
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaEnvelope,
  FaDesktop,
  FaHeartbeat,
  FaLifeRing,
  FaCodeBranch,
  FaUsers,
  FaCalendarCheck,
  FaStethoscope,
  FaRegLightbulb,
  FaRegCommentDots,
  FaVideo,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DoctorSettings.css";

const API = "http://localhost:5000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const defaultSettings = {
  notifications: {
    email: true,
    sms: true,
    browserPush: false,
    patientMessages: true,
    reminderLeadTime: 15,
    quietHours: {
      start: "22:00",
      end: "07:00",
    },
  },

  privacy: {
    twoFactor: false,
    publicDirectory: true,
    auditLoginHistory: true,
    showOnlineStatus: true,
    autoLogoutTimeout: "30",
  },

  language: "en",

  theme: {
    mode: "light",
    accent: 0,
  },
};


/* ───────────────────────────────────────────── */

function Panel({
  onBack,
  icon,
  title,
  subtitle,
  accentClass,
  children,
}) {
  return (
    <div className="ds-panel">
      <div className={`ds-panel-hero ds-panel-hero--${accentClass}`}>
        <div className="ds-panel-hero-icon">{icon}</div>

        <div className="ds-panel-hero-text">
          <button
            className="ds-back-btn"
            onClick={onBack}
            type="button"
          >
            <FaArrowLeft /> Back to Settings
          </button>

          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="ds-panel-body">
        {children}
      </div>
    </div>
  );
}


/* ───────────────────────────────────────────── */

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}) {
  return (
    <div className="ds-toggle-row">
      <div className="ds-toggle-info">
        <h4>{label}</h4>
        <p>{desc}</p>
      </div>

      <button
        type="button"
        className={`ds-toggle ${value ? "ds-toggle--on" : ""
          }`}
        onClick={() => onChange(!value)}
        aria-checked={value}
        role="switch"
        aria-label={label}
      >
        <span className="ds-toggle-thumb" />
      </button>
    </div>
  );
}


/* ───────────────────────────────────────────── */

function SaveBtn({
  label = "Save Changes",
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className="ds-save-btn"
      onClick={onClick}
      disabled={disabled}
    >
      <FaSave /> {label}
    </button>
  );
}


/* ══════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════ */

function NotificationsPanel({
  onBack,
  settings,
  setSettings,
}) {
  const [saving, setSaving] = useState(false);

  const notification =
    settings.notifications;

  const updateNotification = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const save = async () => {
    try {
      setSaving(true);

      const response = await fetch(
        `${API}/doctor/settings`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            notifications:
              settings.notifications,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to save notification preferences."
        );
      }

      toast.success(
        "Notification preferences saved successfully!"
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      onBack={onBack}
      icon={<FaBell />}
      title="Notification Preferences"
      subtitle="Choose when and how you want to be notified by MedicoBridge."
      accentClass="notifications"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Channels
        </h3>

        <ToggleRow
          label="Email Notifications"
          desc="Receive email summaries of daily consultations and reports."
          value={notification.email}
          onChange={(value) =>
            updateNotification("email", value)
          }
        />

        <ToggleRow
          label="SMS Alerts"
          desc="Get instant text messages for urgent appointment cancellations."
          value={notification.sms}
          onChange={(value) =>
            updateNotification("sms", value)
          }
        />

        <ToggleRow
          label="Browser Push Notifications"
          desc="Get live desktop notifications for patient check-ins and chat messages."
          value={notification.browserPush}
          onChange={(value) =>
            updateNotification(
              "browserPush",
              value
            )
          }
        />

        <ToggleRow
          label="Patient Message Reminders"
          desc="Alert me when a patient uploads a new medical record or message."
          value={notification.patientMessages}
          onChange={(value) =>
            updateNotification(
              "patientMessages",
              value
            )
          }
        />
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Timing
        </h3>

        <div className="ds-input-row">
          <label>Reminder Lead Time</label>

          <select
            className="ds-select"
            value={notification.reminderLeadTime}
            onChange={(e) =>
              updateNotification(
                "reminderLeadTime",
                Number(e.target.value)
              )
            }
          >
            <option value="5">
              5 minutes before appointment
            </option>

            <option value="15">
              15 minutes before appointment
            </option>

            <option value="30">
              30 minutes before appointment
            </option>

            <option value="60">
              1 hour before appointment
            </option>
          </select>
        </div>

        <div className="ds-input-row">
          <label>
            Quiet Hours (Do Not Disturb)
          </label>

          <div className="ds-time-range">
            <input
              type="time"
              value={
                notification.quietHours.start
              }
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    quietHours: {
                      ...prev.notifications
                        .quietHours,
                      start: e.target.value,
                    },
                  },
                }))
              }
              className="ds-text-input ds-text-input--time"
            />

            <span className="ds-time-sep">
              to
            </span>

            <input
              type="time"
              value={
                notification.quietHours.end
              }
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    quietHours: {
                      ...prev.notifications
                        .quietHours,
                      end: e.target.value,
                    },
                  },
                }))
              }
              className="ds-text-input ds-text-input--time"
            />
          </div>
        </div>
      </section>

      <SaveBtn
        label={
          saving
            ? "Saving..."
            : "Save Preferences"
        }
        onClick={save}
        disabled={saving}
      />
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   PASSWORD
══════════════════════════════════════════════ */

function PasswordPanel({ onBack }) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const save = async () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.warning(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.warning(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning(
        "New passwords do not match."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/doctor/settings/password`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update password."
        );
      }

      toast.success(
        result?.message ||
        "Password updated successfully!"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    setter,
    show,
    setShow,
    placeholder,
  }) => (
    <div className="ds-input-row">
      <label>{label}</label>

      <div className="ds-input-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) =>
            setter(e.target.value)
          }
          placeholder={placeholder}
          className="ds-text-input"
        />

        <button
          className="ds-eye-btn"
          type="button"
          onClick={() =>
            setShow((prev) => !prev)
          }
        >
          {show ? (
            <FaEyeSlash />
          ) : (
            <FaEye />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Panel
      onBack={onBack}
      icon={<FaLock />}
      title="Change Password"
      subtitle="Ensure your account is protected with a strong, secure password."
      accentClass="password"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Update Credentials
        </h3>

        <PasswordInput
          label="Current Password"
          value={currentPassword}
          setter={setCurrentPassword}
          show={showCurrent}
          setShow={setShowCurrent}
          placeholder="Enter current password"
        />

        <PasswordInput
          label="New Password"
          value={newPassword}
          setter={setNewPassword}
          show={showNew}
          setShow={setShowNew}
          placeholder="Minimum 8 characters"
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          setter={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          placeholder="Re-enter new password"
        />
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Password Strength Tips
        </h3>

        <div className="ds-tips-list">
          {[
            "Avoid using personal information like your name or birthdate.",
            "Use a mix of letters, numbers, and special characters (!@#$).",
            "Never reuse passwords from other platforms.",
            "Change your password regularly for better security.",
          ].map((tip, i) => (
            <div
              className="ds-tip-item"
              key={i}
            >
              <FaRegLightbulb className="ds-tip-icon" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </section>

      <SaveBtn
        label={
          saving
            ? "Updating..."
            : "Update Password"
        }
        onClick={save}
        disabled={saving}
      />
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   PRIVACY
══════════════════════════════════════════════ */

function PrivacyPanel({
  onBack,
  settings,
  setSettings,
}) {
  const [saving, setSaving] =
    useState(false);

  const privacy = settings.privacy;

  const updatePrivacy = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  const save = async () => {
    try {
      setSaving(true);

      const response = await fetch(
        `${API}/doctor/settings`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            privacy: settings.privacy,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to save security settings."
        );
      }

      toast.success(
        "Security settings saved!"
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      onBack={onBack}
      icon={<FaShieldAlt />}
      title="Privacy & Security"
      subtitle="Control visibility options, login audits, and session lifetimes."
      accentClass="privacy"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Account Security
        </h3>

        <ToggleRow
          label="Two-Factor Authentication (2FA)"
          desc="Use verification codes on your phone to secure logins."
          value={privacy.twoFactor}
          onChange={(value) =>
            updatePrivacy(
              "twoFactor",
              value
            )
          }
        />

        <ToggleRow
          label="Public Directory Search"
          desc="Allow unregistered patients to search and view your specialist card."
          value={privacy.publicDirectory}
          onChange={(value) =>
            updatePrivacy(
              "publicDirectory",
              value
            )
          }
        />

        <ToggleRow
          label="Audit Login History"
          desc="Track operating system types, location logs, and active browser sessions."
          value={
            privacy.auditLoginHistory
          }
          onChange={(value) =>
            updatePrivacy(
              "auditLoginHistory",
              value
            )
          }
        />

        <ToggleRow
          label="Show Online Status"
          desc="Let patients see when you are actively online in the portal."
          value={
            privacy.showOnlineStatus
          }
          onChange={(value) =>
            updatePrivacy(
              "showOnlineStatus",
              value
            )
          }
        />
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Session Management
        </h3>

        <div className="ds-input-row">
          <label>
            Auto-logout Timeout
          </label>

          <select
            className="ds-select"
            value={
              privacy.autoLogoutTimeout
            }
            onChange={(e) =>
              updatePrivacy(
                "autoLogoutTimeout",
                e.target.value
              )
            }
          >
            <option value="15">
              15 minutes of inactivity
            </option>

            <option value="30">
              30 minutes of inactivity
            </option>

            <option value="60">
              1 hour of inactivity
            </option>

            <option value="never">
              Never (Not recommended)
            </option>
          </select>
        </div>
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Recent Login Sessions
        </h3>

        <div className="ds-sessions-list">
          <div className="ds-session-row">
            <FaDesktop className="ds-session-icon" />

            <div className="ds-session-info">
              <span className="ds-session-device">
                Current Browser Session
              </span>

              <span className="ds-session-meta">
                Current authenticated session
              </span>
            </div>

            <span className="ds-session-badge ds-session-badge--active">
              Active
            </span>
          </div>
        </div>
      </section>

      <SaveBtn
        label={
          saving
            ? "Saving..."
            : "Save Security Settings"
        }
        onClick={save}
        disabled={saving}
      />
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   LANGUAGE
══════════════════════════════════════════════ */

function LanguagePanel({
  onBack,
  settings,
  setSettings,
}) {
  const [saving, setSaving] =
    useState(false);

  const langs = [
    {
      code: "en",
      name: "English (US / UK)",
      desc: "Default portal language",
      flag: "🇺🇸",
    },
    {
      code: "hi",
      name: "हिन्दी (Hindi)",
      desc: "Hindi interface language",
      flag: "🇮🇳",
    },
    {
      code: "ka",
      name: "ಕನ್ನಡ (Kannada)",
      desc: "Kannada interface language",
      flag: "🇮🇳",
    },
    {
      code: "ta",
      name: "தமிழ் (Tamil)",
      desc: "Tamil interface language",
      flag: "🇮🇳",
    },
    {
      code: "ml",
      name: "മലയാളം (Malayalam)",
      desc: "Malayalam interface language",
      flag: "🇮🇳",
    },
    {
      code: "te",
      name: "తెలుగు (Telugu)",
      desc: "Telugu interface language",
      flag: "🇮🇳",
    },
  ];

  const selected =
    settings.language;

  const save = async () => {
    try {
      setSaving(true);

      const response = await fetch(
        `${API}/doctor/settings`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            language: selected,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to save language."
        );
      }

      toast.success(
        "Language preference saved!"
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      onBack={onBack}
      icon={<FaGlobe />}
      title="Language Settings"
      subtitle="Choose your preferred interface language for MedicoBridge Portal."
      accentClass="language"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Select Language
        </h3>

        <div className="ds-lang-grid">
          {langs.map((lang) => (
            <label
              key={lang.code}
              className={`ds-lang-card ${selected === lang.code
                ? "ds-lang-card--active"
                : ""
                }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  language: lang.code,
                }))
              }
            >
              <input
                type="radio"
                name="portalLanguage"
                checked={
                  selected === lang.code
                }
                onChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    language: lang.code,
                  }))
                }
              />

              <span className="ds-lang-flag">
                {lang.flag}
              </span>

              <div className="ds-lang-info">
                <span className="ds-lang-name">
                  {lang.name}
                </span>

                <span className="ds-lang-desc">
                  {lang.desc}
                </span>
              </div>

              {selected === lang.code && (
                <FaCheckCircle className="ds-lang-check" />
              )}
            </label>
          ))}
        </div>
      </section>

      <SaveBtn
        label={
          saving
            ? "Applying..."
            : "Apply Language"
        }
        onClick={save}
        disabled={saving}
      />
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   THEME
══════════════════════════════════════════════ */

function ThemePanel({
  onBack,
  settings,
  setSettings,
}) {
  const [saving, setSaving] =
    useState(false);

  const modes = [
    {
      key: "light",
      label: "Light Mode",
      desc: "Classic cool white display",
      icon: "☀️",
    },
    {
      key: "dark",
      label: "Dark Mode",
      desc: "Reduced eye strain dark backdrop",
      icon: "🌙",
    },
    {
      key: "system",
      label: "System Default",
      desc: "Matches your OS theme setting",
      icon: "🖥️",
    },
  ];

  const accents = [
    {
      name: "Premium Teal",
      color: "#0d9488",
    },
    {
      name: "Ocean Blue",
      color: "#0284c7",
    },
    {
      name: "Warm Amber",
      color: "#f59e0b",
    },
    {
      name: "Healing Green",
      color: "#16a34a",
    },
    {
      name: "Vivid Violet",
      color: "#7c3aed",
    },
    {
      name: "Rose Red",
      color: "#e11d48",
    },
  ];

  const save = async () => {
    try {
      setSaving(true);

      const response = await fetch(
        `${API}/doctor/settings`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            theme: settings.theme,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to save theme."
        );
      }

      toast.success(
        "Theme settings applied!"
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      onBack={onBack}
      icon={<FaMoon />}
      title="Theme Customization"
      subtitle="Select display modes and accent palette themes."
      accentClass="theme"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Display Mode
        </h3>

        <div className="ds-theme-grid">
          {modes.map((mode) => (
            <label
              key={mode.key}
              className={`ds-theme-card ${settings.theme.mode ===
                mode.key
                ? "ds-theme-card--active"
                : ""
                }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    mode: mode.key,
                  },
                }))
              }
            >
              <input
                type="radio"
                name="themeMode"
                checked={
                  settings.theme.mode ===
                  mode.key
                }
                onChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      mode: mode.key,
                    },
                  }))
                }
              />

              <span className="ds-theme-emoji">
                {mode.icon}
              </span>

              <div>
                <h4>{mode.label}</h4>
                <p>{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Color Accent
        </h3>

        <div className="ds-accent-grid">
          {accents.map((accent, index) => (
            <label
              key={index}
              className={`ds-accent-card ${settings.theme.accent ===
                index
                ? "ds-accent-card--active"
                : ""
                }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    accent: index,
                  },
                }))
              }
            >
              <input
                type="radio"
                name="colorAccent"
                checked={
                  settings.theme.accent ===
                  index
                }
                onChange={() =>
                  setSettings((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      accent: index,
                    },
                  }))
                }
              />

              <span
                className="ds-accent-bubble"
                style={{
                  background:
                    accent.color,
                }}
              />

              <span>{accent.name}</span>
            </label>
          ))}
        </div>
      </section>

      <SaveBtn
        label={
          saving
            ? "Applying..."
            : "Apply Theme"
        }
        onClick={save}
        disabled={saving}
      />
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   REVIEWS
══════════════════════════════════════════════ */

function ReviewsPanel({ onBack }) {
  const navigate = useNavigate();

  return (
    <Panel
      onBack={onBack}
      icon={<FaStar />}
      title="Reviews & Ratings"
      subtitle="Monitor your patient feedback and overall satisfaction scores."
      accentClass="reviews"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Reviews
        </h3>

        <p>
          Your patient reviews are managed
          through the existing Reviews section.
        </p>

        <button
          type="button"
          className="ds-save-btn"
          onClick={() =>
            navigate("/doctor/reviews")
          }
        >
          <FaStar />
          Open Reviews
        </button>
      </section>
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════ */

function AnalyticsPanel({ onBack }) {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch(
          `${API}/doctor/analytics`,
          {
            headers: authHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Analytics API unavailable."
          );
        }

        const result =
          await response.json();

        setAnalytics(
          result?.data || null
        );
      } catch (error) {
        console.error(error);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <Panel
      onBack={onBack}
      icon={<FaChartBar />}
      title="Analytics & Reports"
      subtitle="Track your performance metrics, consultation trends, and patient insights."
      accentClass="analytics"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Key Metrics
        </h3>

        {loading ? (
          <p>Loading analytics...</p>
        ) : analytics ? (
          <div className="ds-metrics-grid">
            <div className="ds-metric-card">
              <span className="ds-metric-val">
                {analytics.consultationsThisMonth ??
                  0}
              </span>

              <span className="ds-metric-lbl">
                Consultations This Month
              </span>
            </div>

            <div className="ds-metric-card">
              <span className="ds-metric-val">
                {analytics.patientSatisfaction ??
                  0}
                %
              </span>

              <span className="ds-metric-lbl">
                Patient Satisfaction
              </span>
            </div>

            <div className="ds-metric-card">
              <span className="ds-metric-val">
                {analytics.prescriptionsIssued ??
                  0}
              </span>

              <span className="ds-metric-lbl">
                Prescriptions Issued
              </span>
            </div>

            <div className="ds-metric-card">
              <span className="ds-metric-val">
                {analytics.repeatPatients ??
                  0}
                %
              </span>

              <span className="ds-metric-lbl">
                Repeat Patients
              </span>
            </div>
          </div>
        ) : (
          <p>
            Analytics data is not available yet.
          </p>
        )}
      </section>
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   HELP
══════════════════════════════════════════════ */

function HelpPanel({ onBack }) {
  const [category, setCategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const submitTicket = async () => {
    if (!category || !description.trim()) {
      toast.warning(
        "Please select a category and describe your issue."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API}/feedback`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            category,
            message: description.trim(),
            source: "Doctor Portal",
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to submit support ticket."
        );
      }

      toast.success(
        result?.message ||
        "Support ticket submitted successfully."
      );

      setCategory("");
      setDescription("");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      onBack={onBack}
      icon={<FaLifeRing />}
      title="Help & Support"
      subtitle="Get assistance from our dedicated MedicoBridge support team."
      accentClass="help"
    >
      <section className="ds-section">
        <h3 className="ds-section-title">
          Contact Options
        </h3>

        <div className="ds-contact-list">
          <div className="ds-contact-card">
            <span className="ds-contact-icon">
              <FaPhone />
            </span>

            <div className="ds-contact-info">
              <span className="ds-contact-label">
                Support Hotline
              </span>

              <span className="ds-contact-val">
                MedicoBridge Support
              </span>

              <span className="ds-contact-hint">
                Contact support through the portal.
              </span>
            </div>
          </div>

          <div className="ds-contact-card">
            <span className="ds-contact-icon">
              <FaEnvelope />
            </span>

            <div className="ds-contact-info">
              <span className="ds-contact-label">
                Email Support
              </span>

              <span className="ds-contact-val">
                MedicoBridge Support
              </span>

              <span className="ds-contact-hint">
                Submit a ticket below.
              </span>
            </div>
          </div>

          <div className="ds-contact-card">
            <span className="ds-contact-icon">
              <FaRegCommentDots />
            </span>

            <div className="ds-contact-info">
              <span className="ds-contact-label">
                Live Chat
              </span>

              <span className="ds-contact-val">
                Available in portal
              </span>

              <span className="ds-contact-hint">
                Availability depends on support service.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Submit a Ticket
        </h3>

        <div className="ds-input-row">
          <label>Issue Category</label>

          <select
            className="ds-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="" disabled>
              Select category...
            </option>

            <option value="Account & Login">
              Account & Login
            </option>

            <option value="Appointments">
              Appointments
            </option>

            <option value="Prescriptions">
              Prescriptions
            </option>

            <option value="Payments & Billing">
              Payments & Billing
            </option>

            <option value="Technical Issues">
              Technical Issues
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        <div className="ds-input-row">
          <label>
            Describe Your Issue
          </label>

          <textarea
            className="ds-textarea"
            rows={4}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Please describe your issue in detail..."
          />
        </div>

        <button
          type="button"
          className="ds-save-btn"
          onClick={submitTicket}
          disabled={saving}
        >
          <FaLifeRing />
          {saving
            ? "Submitting..."
            : "Submit Support Ticket"}
        </button>
      </section>
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════ */

function FAQPanel({ onBack }) {
  const [open, setOpen] =
    useState(null);

  const faqs = [
    {
      q: "How do I join an online consultation room?",
      a: "Go to Online Consultations and open an appointment that is available for consultation.",
    },
    {
      q: "How do I write and send a prescription?",
      a: "Open the relevant appointment and create the prescription using the prescription workflow.",
    },
    {
      q: "Can patients see my reviews on the portal?",
      a: "Patients can see reviews according to the visibility configured for your doctor profile.",
    },
    {
      q: "How do I change my availability schedule?",
      a: "Update your doctor profile and availability schedule from the profile management section.",
    },
    {
      q: "What happens if a patient misses their appointment?",
      a: "Appointment status is handled by the appointment workflow and backend.",
    },
    {
      q: "How do I view my patient's medical history?",
      a: "Open the patient from your Patients section and use the available medical-record functionality.",
    },
    {
      q: "Is my consultation data secure?",
      a: "Access to consultation and medical information is controlled by authenticated portal permissions.",
    },
  ];

  return (
    <Panel
      onBack={onBack}
      icon={<FaQuestionCircle />}
      title="Frequently Asked Questions"
      subtitle="Quick answers to common questions about the MedicoBridge Doctor Portal."
      accentClass="faq"
    >
      <section className="ds-section">
        <div className="ds-faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`ds-faq-item ${open === index
                ? "ds-faq-item--open"
                : ""
                }`}
              key={index}
            >
              <button
                type="button"
                className="ds-faq-question"
                onClick={() =>
                  setOpen(
                    open === index
                      ? null
                      : index
                  )
                }
                aria-expanded={
                  open === index
                }
              >
                <span>{faq.q}</span>

                <FaChevronRight
                  className={`ds-faq-chevron ${open === index
                    ? "ds-faq-chevron--open"
                    : ""
                    }`}
                />
              </button>

              {open === index && (
                <div className="ds-faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   ABOUT
══════════════════════════════════════════════ */

function AboutPanel({ onBack }) {
  return (
    <Panel
      onBack={onBack}
      icon={<FaHeartbeat />}
      title="About MedicoBridge"
      subtitle="Empowering healthcare professionals with modern digital tools."
      accentClass="about"
    >
      <section className="ds-section">
        <div className="ds-about-brand">
          <div className="ds-about-logo">
            <FaHeartbeat />
          </div>

          <div className="ds-about-brand-text">
            <h3>MedicoBridge</h3>
            <p>Doctor Portal</p>
          </div>
        </div>

        <div className="ds-about-meta-grid">
          <div className="ds-about-meta-row">
            <span className="ds-about-meta-icon">
              <FaDesktop />
            </span>

            <span className="ds-about-meta-label">
              Platform
            </span>

            <span className="ds-about-meta-val">
              Web App
            </span>
          </div>

          <div className="ds-about-meta-row">
            <span className="ds-about-meta-icon">
              <FaEnvelope />
            </span>

            <span className="ds-about-meta-label">
              Support
            </span>

            <span className="ds-about-meta-val">
              MedicoBridge Support
            </span>
          </div>
        </div>
      </section>

      <section className="ds-section">
        <h3 className="ds-section-title">
          Core Features
        </h3>

        <div className="ds-features-grid">
          {[
            {
              icon: <FaVideo />,
              label: "Video Consultations",
              desc: "Online consultation support.",
            },
            {
              icon: <FaStethoscope />,
              label: "Smart Prescriptions",
              desc: "Digital prescription management.",
            },
            {
              icon: <FaCalendarCheck />,
              label: "Appointment Management",
              desc: "Appointment scheduling and management.",
            },
            {
              icon: <FaUsers />,
              label: "Patient Records",
              desc: "Secure patient information management.",
            },
            {
              icon: <FaChartBar />,
              label: "Analytics Dashboard",
              desc: "Performance and consultation insights.",
            },
            {
              icon: <FaShieldAlt />,
              label: "Security",
              desc: "Authenticated healthcare portal access.",
            },
          ].map((feature, index) => (
            <div
              className="ds-feature-card"
              key={index}
            >
              <span className="ds-feature-icon">
                {feature.icon}
              </span>

              <h4>{feature.label}</h4>

              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <p className="ds-about-legal">
          © 2026 MedicoBridge Pvt. Ltd. All rights reserved.
        </p>
      </section>
    </Panel>
  );
}


/* ══════════════════════════════════════════════
   SETTINGS HUB
══════════════════════════════════════════════ */

const SETTING_CARDS = [
  {
    key: "notifications",
    icon: <FaBell />,
    label: "Notifications",
    desc: "Configure SMS, email and push reminders.",
    color: "#ef4444",
    bg: "#fee2e2",
    group: "Account",
  },
  {
    key: "password",
    icon: <FaLock />,
    label: "Change Password",
    desc: "Secure your login with a new strong password.",
    color: "#0284c7",
    bg: "#e0f2fe",
    group: "Account",
  },
  {
    key: "privacy",
    icon: <FaShieldAlt />,
    label: "Privacy & Security",
    desc: "Control 2FA, session timeouts, and visibility.",
    color: "#7c3aed",
    bg: "#ede9fe",
    group: "Account",
  },
  {
    key: "language",
    icon: <FaGlobe />,
    label: "Language",
    desc: "Set portal display language preference.",
    color: "#0d9488",
    bg: "#ccfbf1",
    group: "Preferences",
  },
  {
    key: "theme",
    icon: <FaMoon />,
    label: "Theme",
    desc: "Switch display mode and color accent.",
    color: "#d97706",
    bg: "#fef3c7",
    group: "Preferences",
  },
  {
    key: "reviews",
    icon: <FaStar />,
    label: "Reviews & Ratings",
    desc: "Monitor patient feedback and satisfaction.",
    color: "#f59e0b",
    bg: "#fef9c3",
    group: "Preferences",
  },
  {
    key: "analytics",
    icon: <FaChartBar />,
    label: "Analytics & Reports",
    desc: "View consultation trends and performance.",
    color: "#0369a1",
    bg: "#dbeafe",
    group: "Insights",
  },
  {
    key: "help",
    icon: <FaLifeRing />,
    label: "Help & Support",
    desc: "Contact support or submit a help ticket.",
    color: "#16a34a",
    bg: "#dcfce7",
    group: "Support",
  },
  {
    key: "faq",
    icon: <FaQuestionCircle />,
    label: "FAQ",
    desc: "Answers to common portal questions.",
    color: "#9333ea",
    bg: "#f3e8ff",
    group: "Support",
  },
  {
    key: "about",
    icon: <FaInfoCircle />,
    label: "About MedicoBridge",
    desc: "App version, features, and legal info.",
    color: "#0d9488",
    bg: "#f0fdfa",
    group: "Support",
  },
];

const GROUPS = [
  "Account",
  "Preferences",
  "Insights",
  "Support",
];


/* ══════════════════════════════════════════════ */

function DoctorSettings() {
  const [activeView, setActiveView] =
    useState(null);

  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          `${API}/doctor/settings`,
          {
            headers: authHeaders(),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
            "Failed to load doctor settings."
          );
        }

        const backendSettings =
          result?.data?.settings ||
          {};

        setSettings({
          ...defaultSettings,
          ...backendSettings,

          notifications: {
            ...defaultSettings.notifications,
            ...(backendSettings.notifications ||
              {}),
            quietHours: {
              ...defaultSettings.notifications
                .quietHours,
              ...(backendSettings.notifications
                ?.quietHours || {}),
            },
          },

          privacy: {
            ...defaultSettings.privacy,
            ...(backendSettings.privacy ||
              {}),
          },

          theme: {
            ...defaultSettings.theme,
            ...(backendSettings.theme ||
              {}),
          },
        });
      } catch (error) {
        console.error(
          "Doctor settings load failed:",
          error
        );

        toast.error(
          error.message ||
          "Failed to load doctor settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="ds-page">
        <div className="ds-header">
          <div className="ds-header-icon">
            <FaUserCog />
          </div>

          <div className="ds-header-text">
            <h1 className="ds-page-title">
              Settings
            </h1>

            <p className="ds-page-subtitle">
              Loading your settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const goBack = () =>
    setActiveView(null);

  if (
    activeView === "notifications"
  ) {
    return (
      <NotificationsPanel
        onBack={goBack}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  if (activeView === "password") {
    return (
      <PasswordPanel
        onBack={goBack}
      />
    );
  }

  if (activeView === "privacy") {
    return (
      <PrivacyPanel
        onBack={goBack}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  if (activeView === "language") {
    return (
      <LanguagePanel
        onBack={goBack}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  if (activeView === "theme") {
    return (
      <ThemePanel
        onBack={goBack}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  if (activeView === "reviews") {
    return (
      <ReviewsPanel
        onBack={goBack}
      />
    );
  }

  if (activeView === "analytics") {
    return (
      <AnalyticsPanel
        onBack={goBack}
      />
    );
  }

  if (activeView === "help") {
    return (
      <HelpPanel
        onBack={goBack}
      />
    );
  }

  if (activeView === "faq") {
    return (
      <FAQPanel
        onBack={goBack}
      />
    );
  }

  if (activeView === "about") {
    return (
      <AboutPanel
        onBack={goBack}
      />
    );
  }

  return (
    <div className="ds-page">

      <div className="ds-header">
        <div className="ds-header-icon">
          <FaUserCog />
        </div>

        <div className="ds-header-text">
          <h1 className="ds-page-title">
            Settings
          </h1>

          <p className="ds-page-subtitle">
            Manage your account preferences,
            security, and portal configurations.
          </p>
        </div>
      </div>

      {GROUPS.map((group) => {
        const cards =
          SETTING_CARDS.filter(
            (card) =>
              card.group === group
          );

        return (
          <div
            className="ds-group"
            key={group}
          >
            <h2 className="ds-group-label">
              {group}
            </h2>

            <div className="ds-cards-grid">
              {cards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  className="ds-card"
                  onClick={() => {
                    if (
                      card.key ===
                      "reviews"
                    ) {
                      setActiveView(
                        "reviews"
                      );
                    } else {
                      setActiveView(
                        card.key
                      );
                    }
                  }}
                >
                  <div className="ds-card-left">
                    <div
                      className="ds-card-icon"
                      style={{
                        background:
                          card.bg,
                        color:
                          card.color,
                      }}
                    >
                      {card.icon}
                    </div>

                    <div className="ds-card-text">
                      <h3>
                        {card.label}
                      </h3>

                      <p>
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <FaChevronRight className="ds-card-chevron" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DoctorSettings;