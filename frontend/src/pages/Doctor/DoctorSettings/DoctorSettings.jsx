import React, { useState } from "react";
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
import "./DoctorSettings.css";

/* ─── Shared sub-page wrapper ──────────────────────────────── */
function Panel({ onBack, icon, title, subtitle, accentClass, children }) {
    return (
        <div className="ds-panel">
            <div className={`ds-panel-hero ds-panel-hero--${accentClass}`}>
                <div className="ds-panel-hero-icon">{icon}</div>
                <div className="ds-panel-hero-text">
                    <button className="ds-back-btn" onClick={onBack}>
                        <FaArrowLeft /> Back to Settings
                    </button>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </div>
            <div className="ds-panel-body">{children}</div>
        </div>
    );
}

/* ─── Toggle Row ───────────────────────────────────────────── */
function ToggleRow({ label, desc, defaultOn }) {
    const [on, setOn] = useState(!!defaultOn);
    return (
        <div className="ds-toggle-row">
            <div className="ds-toggle-info">
                <h4>{label}</h4>
                <p>{desc}</p>
            </div>
            <button
                className={`ds-toggle ${on ? "ds-toggle--on" : ""}`}
                onClick={() => setOn((p) => !p)}
                aria-checked={on}
                role="switch"
                aria-label={label}
            >
                <span className="ds-toggle-thumb" />
            </button>
        </div>
    );
}

/* ─── Form Input Row ───────────────────────────────────────── */
function InputRow({ label, type = "text", placeholder, hint }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
        <div className="ds-input-row">
            <label>{label}</label>
            <div className="ds-input-wrap">
                <input
                    type={isPassword && show ? "text" : type}
                    placeholder={placeholder}
                    className="ds-text-input"
                />
                {isPassword && (
                    <button
                        className="ds-eye-btn"
                        type="button"
                        onClick={() => setShow((p) => !p)}
                        aria-label={show ? "Hide password" : "Show password"}
                    >
                        {show ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>
            {hint && <span className="ds-input-hint">{hint}</span>}
        </div>
    );
}

/* ─── Save Button ──────────────────────────────────────────── */
function SaveBtn({ label = "Save Changes", onClick }) {
    return (
        <button className="ds-save-btn" onClick={onClick}>
            <FaSave /> {label}
        </button>
    );
}

/* ══════════════════════════════════════════════════════════════
   SUB-PAGES
══════════════════════════════════════════════════════════════ */

/* 1. Notifications */
function NotificationsPanel({ onBack, onSave }) {
    return (
        <Panel
            onBack={onBack}
            icon={<FaBell />}
            title="Notification Preferences"
            subtitle="Choose when and how you want to be notified by MedicoBridge."
            accentClass="notifications"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Channels</h3>
                <ToggleRow label="Email Notifications" desc="Receive email summaries of daily consultations and reports." defaultOn />
                <ToggleRow label="SMS Alerts" desc="Get instant text messages for urgent appointment cancellations." defaultOn />
                <ToggleRow label="Browser Push Notifications" desc="Get live desktop notifications for patient check-ins and chat messages." />
                <ToggleRow label="Patient Message Reminders" desc="Alert me when a patient uploads a new medical record or message." defaultOn />
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Timing</h3>
                <div className="ds-input-row">
                    <label>Reminder Lead Time</label>
                    <select className="ds-select" defaultValue="15">
                        <option value="5">5 minutes before appointment</option>
                        <option value="15">15 minutes before appointment</option>
                        <option value="30">30 minutes before appointment</option>
                        <option value="60">1 hour before appointment</option>
                    </select>
                </div>
                <div className="ds-input-row">
                    <label>Quiet Hours (Do Not Disturb)</label>
                    <div className="ds-time-range">
                        <input type="time" defaultValue="22:00" className="ds-text-input ds-text-input--time" />
                        <span className="ds-time-sep">to</span>
                        <input type="time" defaultValue="07:00" className="ds-text-input ds-text-input--time" />
                    </div>
                </div>
            </section>

            <SaveBtn label="Save Preferences" onClick={onSave} />
        </Panel>
    );
}

/* 2. Change Password */
function PasswordPanel({ onBack, onSave }) {
    return (
        <Panel
            onBack={onBack}
            icon={<FaLock />}
            title="Change Password"
            subtitle="Ensure your account is protected with a strong, secure password."
            accentClass="password"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Update Credentials</h3>
                <InputRow label="Current Password" type="password" placeholder="Enter current password" />
                <InputRow
                    label="New Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    hint="Use uppercase, lowercase, numbers and symbols."
                />
                <InputRow label="Confirm New Password" type="password" placeholder="Re-enter new password" />
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Password Strength Tips</h3>
                <div className="ds-tips-list">
                    {[
                        "Avoid using personal information like your name or birthdate.",
                        "Use a mix of letters, numbers, and special characters (!@#$).",
                        "Never reuse passwords from other platforms.",
                        "Change your password every 90 days for best security.",
                    ].map((tip, i) => (
                        <div className="ds-tip-item" key={i}>
                            <FaRegLightbulb className="ds-tip-icon" />
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            </section>

            <SaveBtn label="Update Password" onClick={() => onSave("Password updated successfully!")} />
        </Panel>
    );
}

/* 3. Privacy & Security */
function PrivacyPanel({ onBack, onSave }) {
    return (
        <Panel
            onBack={onBack}
            icon={<FaShieldAlt />}
            title="Privacy & Security"
            subtitle="Control visibility options, login audits, and session lifetimes."
            accentClass="privacy"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Account Security</h3>
                <ToggleRow label="Two-Factor Authentication (2FA)" desc="Use verification codes on your phone to secure logins." />
                <ToggleRow label="Public Directory Search" desc="Allow unregistered patients to search and view your specialist card." defaultOn />
                <ToggleRow label="Audit Login History" desc="Track operating system types, location logs, and active browser sessions." defaultOn />
                <ToggleRow label="Show Online Status" desc="Let patients see when you are actively online in the portal." defaultOn />
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Session Management</h3>
                <div className="ds-input-row">
                    <label>Auto-logout Timeout</label>
                    <select className="ds-select" defaultValue="30">
                        <option value="15">15 minutes of inactivity</option>
                        <option value="30">30 minutes of inactivity</option>
                        <option value="60">1 hour of inactivity</option>
                        <option value="never">Never (Not recommended)</option>
                    </select>
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Recent Login Sessions</h3>
                <div className="ds-sessions-list">
                    {[
                        { device: "Chrome on Windows 11", location: "Bengaluru, India", time: "Today, 8:42 AM", active: true },
                        { device: "Safari on iPhone 15", location: "Bengaluru, India", time: "Yesterday, 9:15 PM", active: false },
                        { device: "Firefox on macOS", location: "Chennai, India", time: "July 10, 2026", active: false },
                    ].map((s, i) => (
                        <div className="ds-session-row" key={i}>
                            <FaDesktop className="ds-session-icon" />
                            <div className="ds-session-info">
                                <span className="ds-session-device">{s.device}</span>
                                <span className="ds-session-meta">{s.location} · {s.time}</span>
                            </div>
                            {s.active
                                ? <span className="ds-session-badge ds-session-badge--active">Active</span>
                                : <button className="ds-session-revoke">Revoke</button>
                            }
                        </div>
                    ))}
                </div>
            </section>

            <SaveBtn label="Save Security Settings" onClick={() => onSave("Security settings saved!")} />
        </Panel>
    );
}

/* 4. Language */
function LanguagePanel({ onBack, onSave }) {
    const [selected, setSelected] = useState("en");
    const langs = [
        { code: "en", name: "English (US / UK)", desc: "Default portal language", flag: "🇺🇸" },
        { code: "hi", name: "हिन्दी (Hindi)", desc: "Translation coverage 90%", flag: "🇮🇳" },
        { code: "ka", name: "ಕನ್ನಡ (Kannada)", desc: "Translation coverage 85%", flag: "🇮🇳" },
        { code: "ta", name: "தமிழ் (Tamil)", desc: "Translation coverage 85%", flag: "🇮🇳" },
        { code: "ml", name: "മലയാളം (Malayalam)", desc: "Translation coverage 80%", flag: "🇮🇳" },
        { code: "te", name: "తెలుగు (Telugu)", desc: "Translation coverage 78%", flag: "🇮🇳" },
    ];

    return (
        <Panel
            onBack={onBack}
            icon={<FaGlobe />}
            title="Language Settings"
            subtitle="Choose your preferred interface language for MedicoBridge Portal."
            accentClass="language"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Select Language</h3>
                <div className="ds-lang-grid">
                    {langs.map((lang) => (
                        <label
                            key={lang.code}
                            className={`ds-lang-card ${selected === lang.code ? "ds-lang-card--active" : ""}`}
                            onClick={() => setSelected(lang.code)}
                        >
                            <input
                                type="radio"
                                name="portalLanguage"
                                checked={selected === lang.code}
                                onChange={() => setSelected(lang.code)}
                            />
                            <span className="ds-lang-flag">{lang.flag}</span>
                            <div className="ds-lang-info">
                                <span className="ds-lang-name">{lang.name}</span>
                                <span className="ds-lang-desc">{lang.desc}</span>
                            </div>
                            {selected === lang.code && <FaCheckCircle className="ds-lang-check" />}
                        </label>
                    ))}
                </div>
            </section>

            <SaveBtn label="Apply Language" onClick={() => onSave("Language changed successfully!")} />
        </Panel>
    );
}

/* 5. Theme */
function ThemePanel({ onBack, onSave }) {
    const [mode, setMode] = useState("light");
    const [accent, setAccent] = useState(0);
    const modes = [
        { key: "light", label: "Light Mode", desc: "Classic cool white display", icon: "☀️" },
        { key: "dark", label: "Dark Mode", desc: "Reduced eye strain dark backdrop", icon: "🌙" },
        { key: "system", label: "System Default", desc: "Matches your OS theme setting", icon: "🖥️" },
    ];
    const accents = [
        { name: "Premium Teal", color: "#0d9488" },
        { name: "Ocean Blue", color: "#0284c7" },
        { name: "Warm Amber", color: "#f59e0b" },
        { name: "Healing Green", color: "#16a34a" },
        { name: "Vivid Violet", color: "#7c3aed" },
        { name: "Rose Red", color: "#e11d48" },
    ];

    return (
        <Panel
            onBack={onBack}
            icon={<FaMoon />}
            title="Theme Customization"
            subtitle="Select display modes and accent palette themes."
            accentClass="theme"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Display Mode</h3>
                <div className="ds-theme-grid">
                    {modes.map((m) => (
                        <label
                            key={m.key}
                            className={`ds-theme-card ${mode === m.key ? "ds-theme-card--active" : ""}`}
                            onClick={() => setMode(m.key)}
                        >
                            <input type="radio" name="themeMode" checked={mode === m.key} onChange={() => setMode(m.key)} />
                            <span className="ds-theme-emoji">{m.icon}</span>
                            <div>
                                <h4>{m.label}</h4>
                                <p>{m.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Color Accent</h3>
                <div className="ds-accent-grid">
                    {accents.map((a, i) => (
                        <label
                            key={i}
                            className={`ds-accent-card ${accent === i ? "ds-accent-card--active" : ""}`}
                            onClick={() => setAccent(i)}
                        >
                            <input type="radio" name="colorAccent" checked={accent === i} onChange={() => setAccent(i)} />
                            <span className="ds-accent-bubble" style={{ background: a.color }} />
                            <span>{a.name}</span>
                        </label>
                    ))}
                </div>
            </section>

            <SaveBtn label="Apply Theme" onClick={() => onSave("Theme settings applied!")} />
        </Panel>
    );
}

/* 6. Reviews & Ratings */
function ReviewsPanel({ onBack }) {
    const stats = [
        { label: "Total Reviews", val: "12", icon: <FaStar />, color: "#f59e0b" },
        { label: "Average Rating", val: "4.8", icon: <FaTrophy />, color: "#0d9488" },
        { label: "5★ Reviews", val: "7", icon: <FaCheckCircle />, color: "#16a34a" },
        { label: "Patients Served", val: "120+", icon: <FaUsers />, color: "#0284c7" },
    ];
    const recentReviews = [
        { name: "Rahul Nair", rating: 5, text: "Excellent consultation, very thorough.", date: "July 10, 2026", initials: "RN", color: "#0d9488" },
        { name: "Anjali Thomas", rating: 4, text: "Professional and caring approach.", date: "July 8, 2026", initials: "AT", color: "#7c3aed" },
        { name: "Arun Kumar", rating: 5, text: "Best cardiologist I have visited.", date: "July 6, 2026", initials: "AK", color: "#0284c7" },
    ];

    return (
        <Panel
            onBack={onBack}
            icon={<FaStar />}
            title="Reviews & Ratings"
            subtitle="Monitor your patient feedback and overall satisfaction scores."
            accentClass="reviews"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Overview</h3>
                <div className="ds-stats-grid">
                    {stats.map((s, i) => (
                        <div className="ds-stat-card" key={i} style={{ borderTopColor: s.color }}>
                            <span className="ds-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                            <span className="ds-stat-val">{s.val}</span>
                            <span className="ds-stat-lbl">{s.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Recent Patient Reviews</h3>
                <div className="ds-reviews-list">
                    {recentReviews.map((r, i) => (
                        <div className="ds-review-item" key={i}>
                            <div className="ds-review-avatar" style={{ background: r.color }}>{r.initials}</div>
                            <div className="ds-review-content">
                                <div className="ds-review-top">
                                    <span className="ds-review-name">{r.name}</span>
                                    <span className="ds-review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                </div>
                                <p className="ds-review-text">{r.text}</p>
                                <span className="ds-review-date">{r.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </Panel>
    );
}

/* 7. Analytics & Reports */
function AnalyticsPanel({ onBack }) {
    const metrics = [
        { label: "Consultations This Month", val: "48", trend: "+12%", up: true },
        { label: "Patient Satisfaction", val: "94%", trend: "+3%", up: true },
        { label: "Avg. Consultation Duration", val: "22 min", trend: "-2 min", up: false },
        { label: "Prescriptions Issued", val: "36", trend: "+8%", up: true },
        { label: "Repeat Patients", val: "67%", trend: "+5%", up: true },
        { label: "No-Show Rate", val: "4%", trend: "-1%", up: true },
    ];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const barHeights = [40, 55, 38, 70, 60, 85, 95];

    return (
        <Panel
            onBack={onBack}
            icon={<FaChartBar />}
            title="Analytics & Reports"
            subtitle="Track your performance metrics, consultation trends, and patient insights."
            accentClass="analytics"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Key Metrics</h3>
                <div className="ds-metrics-grid">
                    {metrics.map((m, i) => (
                        <div className="ds-metric-card" key={i}>
                            <span className="ds-metric-val">{m.val}</span>
                            <span className="ds-metric-lbl">{m.label}</span>
                            <span className={`ds-metric-trend ${m.up ? "ds-metric-trend--up" : "ds-metric-trend--down"}`}>
                                {m.up ? "▲" : "▼"} {m.trend}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Monthly Consultations (2026)</h3>
                <div className="ds-bar-chart">
                    {months.map((m, i) => (
                        <div className="ds-bar-col" key={i}>
                            <span className="ds-bar-val">{barHeights[i]}</span>
                            <div className="ds-bar-track">
                                <div
                                    className="ds-bar-fill"
                                    style={{ height: `${barHeights[i]}%` }}
                                />
                            </div>
                            <span className="ds-bar-label">{m}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Consultation Type Breakdown</h3>
                <div className="ds-donut-legend">
                    {[
                        { label: "Online / Video", pct: 58, color: "#0d9488" },
                        { label: "Hospital Visit", pct: 42, color: "#0284c7" },
                    ].map((d, i) => (
                        <div className="ds-legend-row" key={i}>
                            <span className="ds-legend-dot" style={{ background: d.color }} />
                            <span className="ds-legend-label">{d.label}</span>
                            <div className="ds-legend-bar-track">
                                <div className="ds-legend-bar-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                            </div>
                            <span className="ds-legend-pct">{d.pct}%</span>
                        </div>
                    ))}
                </div>
            </section>
        </Panel>
    );
}

/* 8. Help & Support */
function HelpPanel({ onBack }) {
    const contacts = [
        { icon: <FaPhone />, label: "Support Hotline", val: "+91 1800-123-4567", hint: "Mon–Sat, 9 AM – 7 PM IST" },
        { icon: <FaEnvelope />, label: "Email Support", val: "support@medicobridge.in", hint: "Response within 24 hours" },
        { icon: <FaRegCommentDots />, label: "Live Chat", val: "Available in portal", hint: "Mon–Fri, 10 AM – 6 PM IST" },
    ];

    return (
        <Panel
            onBack={onBack}
            icon={<FaLifeRing />}
            title="Help & Support"
            subtitle="Get assistance from our dedicated MedicoBridge support team."
            accentClass="help"
        >
            <section className="ds-section">
                <h3 className="ds-section-title">Contact Options</h3>
                <div className="ds-contact-list">
                    {contacts.map((c, i) => (
                        <div className="ds-contact-card" key={i}>
                            <span className="ds-contact-icon">{c.icon}</span>
                            <div className="ds-contact-info">
                                <span className="ds-contact-label">{c.label}</span>
                                <span className="ds-contact-val">{c.val}</span>
                                <span className="ds-contact-hint">{c.hint}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Submit a Ticket</h3>
                <div className="ds-input-row">
                    <label>Issue Category</label>
                    <select className="ds-select" defaultValue="">
                        <option value="" disabled>Select category...</option>
                        <option>Account &amp; Login</option>
                        <option>Appointments</option>
                        <option>Prescriptions</option>
                        <option>Payments &amp; Billing</option>
                        <option>Technical Issues</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="ds-input-row">
                    <label>Describe Your Issue</label>
                    <textarea
                        className="ds-textarea"
                        rows={4}
                        placeholder="Please describe your issue in detail..."
                    />
                </div>
                <button className="ds-save-btn">
                    <FaLifeRing /> Submit Support Ticket
                </button>
            </section>
        </Panel>
    );
}

/* 9. FAQ */
function FAQPanel({ onBack }) {
    const [open, setOpen] = useState(null);
    const faqs = [
        {
            q: "How do I join an online consultation room?",
            a: "Go to Online Consultations from the sidebar, find the appointment with 'Waiting' or 'In Progress' status, and click 'Join Consultation'. Ensure your camera and microphone permissions are granted in the browser.",
        },
        {
            q: "How do I write and send a prescription?",
            a: "After a consultation is completed, navigate to the patient's appointment details and click 'Edit Prescription'. Fill in the medications, dosage, and instructions, then click 'Preview & Confirm' to send it to the patient.",
        },
        {
            q: "Can patients see my reviews on the portal?",
            a: "Yes. Patient reviews are visible on your public doctor profile. You can manage visibility settings under Privacy & Security in the Settings menu.",
        },
        {
            q: "How do I change my availability schedule?",
            a: "Go to My Profile and click Edit Profile. Under the Schedule section, you can set your available days, time slots, and maximum consultation duration per session.",
        },
        {
            q: "What happens if a patient misses their appointment?",
            a: "The appointment will automatically be marked as 'No Show' after 15 minutes past the scheduled time. You can still access the appointment record from your Appointments page.",
        },
        {
            q: "How do I view my patient's medical history?",
            a: "Go to Patients from the sidebar and click on the patient's name. Their full medical history, past prescriptions, uploaded reports, and consultation records will be displayed.",
        },
        {
            q: "Is my consultation data secure?",
            a: "Yes. All data on MedicoBridge is encrypted using TLS 1.3 and stored on HIPAA-compliant servers. You can also enable Two-Factor Authentication from Privacy & Security settings.",
        },
    ];

    return (
        <Panel
            onBack={onBack}
            icon={<FaQuestionCircle />}
            title="Frequently Asked Questions"
            subtitle="Quick answers to the most common questions about the MedicoBridge Doctor Portal."
            accentClass="faq"
        >
            <section className="ds-section">
                <div className="ds-faq-list">
                    {faqs.map((faq, i) => (
                        <div
                            className={`ds-faq-item ${open === i ? "ds-faq-item--open" : ""}`}
                            key={i}
                        >
                            <button
                                className="ds-faq-question"
                                onClick={() => setOpen(open === i ? null : i)}
                                aria-expanded={open === i}
                            >
                                <span>{faq.q}</span>
                                <FaChevronRight className={`ds-faq-chevron ${open === i ? "ds-faq-chevron--open" : ""}`} />
                            </button>
                            {open === i && (
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

/* 10. About MedicoBridge */
function AboutPanel({ onBack }) {
    const features = [
        { icon: <FaVideo />, label: "Video Consultations", desc: "HD video calls with patients from anywhere." },
        { icon: <FaStethoscope />, label: "Smart Prescriptions", desc: "Digital prescriptions with drug interaction alerts." },
        { icon: <FaCalendarCheck />, label: "Appointment Management", desc: "Intelligent scheduling and auto-reminders." },
        { icon: <FaUsers />, label: "Patient Records", desc: "Centralized, secure medical history for every patient." },
        { icon: <FaChartBar />, label: "Analytics Dashboard", desc: "Track performance and consultation trends." },
        { icon: <FaShieldAlt />, label: "HIPAA Compliant", desc: "Enterprise-grade security and data encryption." },
    ];

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
                    {[
                        { label: "Version", val: "v2.4.1", icon: <FaCodeBranch /> },
                        { label: "Release Date", val: "July 2026", icon: <FaCalendarCheck /> },
                        { label: "Platform", val: "Web App (React)", icon: <FaDesktop /> },
                        { label: "Support", val: "support@medicobridge.in", icon: <FaEnvelope /> },
                    ].map((m, i) => (
                        <div className="ds-about-meta-row" key={i}>
                            <span className="ds-about-meta-icon">{m.icon}</span>
                            <span className="ds-about-meta-label">{m.label}</span>
                            <span className="ds-about-meta-val">{m.val}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <h3 className="ds-section-title">Core Features</h3>
                <div className="ds-features-grid">
                    {features.map((f, i) => (
                        <div className="ds-feature-card" key={i}>
                            <span className="ds-feature-icon">{f.icon}</span>
                            <h4>{f.label}</h4>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ds-section">
                <p className="ds-about-legal">
                    © 2026 MedicoBridge Pvt. Ltd. All rights reserved.<br />
                    Licensed under the MedicoBridge Enterprise Agreement.<br />
                    HIPAA Compliant · ISO 27001 Certified · GDPR Ready
                </p>
            </section>
        </Panel>
    );
}



/* ══════════════════════════════════════════════════════════════
   SETTINGS HUB (Main Page)
══════════════════════════════════════════════════════════════ */

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

const GROUPS = ["Account", "Preferences", "Insights", "Support"];

function DoctorSettings() {
    const [activeView, setActiveView] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    const onSave = (msg = "Settings updated successfully!") => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const goBack = () => setActiveView(null);

    /* ── Sub-page routing ── */
    if (activeView === "notifications") return <NotificationsPanel onBack={goBack} onSave={onSave} />;
    if (activeView === "password")      return <PasswordPanel      onBack={goBack} onSave={onSave} />;
    if (activeView === "privacy")       return <PrivacyPanel       onBack={goBack} onSave={onSave} />;
    if (activeView === "language")      return <LanguagePanel      onBack={goBack} onSave={onSave} />;
    if (activeView === "theme")         return <ThemePanel         onBack={goBack} onSave={onSave} />;
    if (activeView === "reviews")       return <ReviewsPanel       onBack={goBack} />;
    if (activeView === "analytics")     return <AnalyticsPanel     onBack={goBack} />;
    if (activeView === "help")          return <HelpPanel          onBack={goBack} />;
    if (activeView === "faq")           return <FAQPanel           onBack={goBack} />;
    if (activeView === "about")         return <AboutPanel         onBack={goBack} />;

    return (
        <div className="ds-page">

            {/* ── Header ─────────────────────────── */}
            <div className="ds-header">
                <div className="ds-header-icon">
                    <FaUserCog />
                </div>
                <div className="ds-header-text">
                    <h1 className="ds-page-title">Settings</h1>
                    <p className="ds-page-subtitle">
                        Manage your account preferences, security, and portal configurations.
                    </p>
                </div>
            </div>

            {/* ── Success Toast ───────────────────── */}
            {successMsg && (
                <div className="ds-toast">
                    <FaCheckCircle className="ds-toast-icon" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* ── Grouped Settings Cards ──────────── */}
            {GROUPS.map((group) => {
                const cards = SETTING_CARDS.filter((c) => c.group === group);
                return (
                    <div className="ds-group" key={group}>
                        <h2 className="ds-group-label">{group}</h2>
                        <div className="ds-cards-grid">
                            {cards.map((card) => (
                                <button
                                    key={card.key}
                                    className="ds-card"
                                    onClick={() => setActiveView(card.key)}
                                    aria-label={`Open ${card.label} settings`}
                                >
                                    <div className="ds-card-left">
                                        <div
                                            className="ds-card-icon"
                                            style={{ background: card.bg, color: card.color }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div className="ds-card-text">
                                            <h3>{card.label}</h3>
                                            <p>{card.desc}</p>
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