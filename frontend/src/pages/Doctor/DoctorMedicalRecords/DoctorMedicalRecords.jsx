import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaFolderOpen,
    FaSearch,
    FaFilter,
    FaCalendarAlt,
    FaUser,
    FaUserMd,
    FaDownload,
    FaEye,
    FaFileMedical,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaHashtag,
    FaStethoscope,
    FaSyncAlt,
    FaChevronDown,
    FaTimes,
    FaNotesMedical,
    FaPrescriptionBottleAlt,
    FaFlask,
    FaFileAlt,
    FaThermometerHalf,
    FaIdCard,
    FaBuilding,
} from "react-icons/fa";
import "./DoctorMedicalRecords.css";

/* ─── Static Dummy Data ─────────────────────────────────────── */
const records = [
    {
        id: "MR-3001",
        patient: "Rahul Nair",
        initials: "RN",
        avatarColor: "#0d9488",
        patientId: "PT-1024",
        diagnosis: "Type 2 Diabetes Mellitus – Quarterly Review",
        visitDate: "2026-06-28",
        visitDateDisplay: "June 28, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "final",
        symptoms: ["Polyuria", "Polydipsia", "Fatigue", "Blurred vision"],
        consultationNotes: "Patient presented for quarterly diabetes review. HbA1c improved from 8.2% to 7.4%. Blood pressure within acceptable range. Advised continued diet control and daily exercise. No signs of peripheral neuropathy. Fundoscopy deferred to ophthalmology.",
        prescriptions: [
            { name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals", duration: "90 days" },
            { name: "Glimepiride", dosage: "2mg", frequency: "Once daily before breakfast", duration: "90 days" },
            { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "90 days" },
        ],
        labReports: [
            { test: "HbA1c", value: "7.4%", normalRange: "4.0–5.6%", flag: "High" },
            { test: "Fasting Blood Glucose", value: "118 mg/dL", normalRange: "70–100 mg/dL", flag: "High" },
            { test: "Serum Creatinine", value: "0.9 mg/dL", normalRange: "0.7–1.2 mg/dL", flag: "Normal" },
        ],
        otherDocs: [
            { name: "Fundoscopy Referral Letter", type: "Referral", size: "0.3 MB" },
        ],
    },
    {
        id: "MR-2998",
        patient: "Anjali Thomas",
        initials: "AT",
        avatarColor: "#7c3aed",
        patientId: "PT-1031",
        diagnosis: "Chronic Migraine with Aura",
        visitDate: "2026-06-22",
        visitDateDisplay: "June 22, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Neurology",
        status: "final",
        symptoms: ["Severe throbbing headache", "Visual aura", "Nausea", "Photophobia", "Phonophobia"],
        consultationNotes: "Patient reports 3–4 migraine episodes per month, each lasting 12–24 hours. Aura predominantly visual (zigzag patterns). Triggers identified: stress, irregular sleep, screen exposure. MRI brain (previous) — normal. Starting prophylactic therapy.",
        prescriptions: [
            { name: "Topiramate", dosage: "25mg", frequency: "Once daily at night", duration: "60 days" },
            { name: "Sumatriptan", dosage: "50mg", frequency: "At onset of migraine (max 2/day)", duration: "30 days" },
            { name: "Domperidone", dosage: "10mg", frequency: "With Sumatriptan for nausea", duration: "30 days" },
        ],
        labReports: [],
        otherDocs: [
            { name: "MRI Brain Report (Jan 2026)", type: "MRI Report", size: "18.2 MB" },
        ],
    },
    {
        id: "MR-2975",
        patient: "Arun Kumar",
        initials: "AK",
        avatarColor: "#0284c7",
        patientId: "PT-1018",
        diagnosis: "Essential Hypertension – Stage 1",
        visitDate: "2026-06-15",
        visitDateDisplay: "June 15, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "pending",
        symptoms: ["Persistent headache", "Occasional dizziness", "Mild chest tightness"],
        consultationNotes: "BP recorded at 148/92 mmHg on two separate readings. No secondary causes identified. ECG — normal sinus rhythm. Lifestyle modification counselled: low-sodium diet, 30 min brisk walking daily, no smoking. Follow-up in 4 weeks. Awaiting 24-hour ambulatory BP monitoring results.",
        prescriptions: [
            { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
        ],
        labReports: [
            { test: "Serum Sodium", value: "141 mEq/L", normalRange: "136–145 mEq/L", flag: "Normal" },
            { test: "Serum Potassium", value: "3.9 mEq/L", normalRange: "3.5–5.0 mEq/L", flag: "Normal" },
        ],
        otherDocs: [
            { name: "12-Lead ECG Report", type: "ECG", size: "1.1 MB" },
        ],
    },
    {
        id: "MR-2960",
        patient: "Meera Pillai",
        initials: "MP",
        avatarColor: "#d97706",
        patientId: "PT-1045",
        diagnosis: "Hypothyroidism – TSH Elevation",
        visitDate: "2026-06-10",
        visitDateDisplay: "June 10, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Endocrinology",
        status: "final",
        symptoms: ["Fatigue", "Weight gain", "Cold intolerance", "Constipation", "Dry skin", "Hair loss"],
        consultationNotes: "TSH markedly elevated at 12.4 mIU/L. Free T4 low. Clinical hypothyroidism confirmed. No goitre on examination. Started levothyroxine replacement. Repeat thyroid function tests in 6 weeks. Patient educated on medication compliance and early morning fasting administration.",
        prescriptions: [
            { name: "Levothyroxine", dosage: "50mcg", frequency: "Once daily (30 min before breakfast)", duration: "60 days" },
        ],
        labReports: [
            { test: "TSH", value: "12.4 mIU/L", normalRange: "0.4–4.0 mIU/L", flag: "High" },
            { test: "Free T4", value: "0.6 ng/dL", normalRange: "0.8–1.8 ng/dL", flag: "Low" },
            { test: "Anti-TPO Antibodies", value: "142 IU/mL", normalRange: "< 35 IU/mL", flag: "High" },
        ],
        otherDocs: [],
    },
    {
        id: "MR-2941",
        patient: "Suresh Babu",
        initials: "SB",
        avatarColor: "#dc2626",
        patientId: "PT-1052",
        diagnosis: "Post-CABG Cardiac Rehabilitation",
        visitDate: "2026-06-03",
        visitDateDisplay: "June 3, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Cardiology",
        status: "final",
        symptoms: ["Exertional breathlessness", "Sternal wound tenderness", "Low exercise tolerance"],
        consultationNotes: "Patient is 6 weeks post triple-vessel CABG. Sternal wound healing well, no signs of infection. Echo shows EF improved to 48% from pre-op 35%. Enrolled in Phase II cardiac rehab programme. Dual antiplatelet therapy continued. Statins optimised. Cardiac diet counselling provided.",
        prescriptions: [
            { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "90 days" },
            { name: "Clopidogrel", dosage: "75mg", frequency: "Once daily", duration: "90 days" },
            { name: "Atorvastatin", dosage: "40mg", frequency: "Once daily at night", duration: "90 days" },
            { name: "Bisoprolol", dosage: "2.5mg", frequency: "Once daily", duration: "90 days" },
        ],
        labReports: [
            { test: "LDL Cholesterol", value: "68 mg/dL", normalRange: "< 70 mg/dL", flag: "Normal" },
            { test: "Ejection Fraction (Echo)", value: "48%", normalRange: "> 55%", flag: "Low" },
        ],
        otherDocs: [
            { name: "Operative Note – CABG", type: "Surgical Report", size: "1.8 MB" },
            { name: "Pre-discharge Echo Report", type: "Echocardiogram", size: "4.2 MB" },
        ],
    },
    {
        id: "MR-2919",
        patient: "Lakshmi Nair",
        initials: "LN",
        avatarColor: "#059669",
        patientId: "PT-1060",
        diagnosis: "Tension-Type Headache",
        visitDate: "2026-05-28",
        visitDateDisplay: "May 28, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Neurology",
        status: "cancelled",
        symptoms: ["Bilateral pressing headache", "Neck stiffness", "Mild nausea"],
        consultationNotes: "Consultation was cancelled by the patient on the day of appointment. No clinical assessment conducted. Record marked cancelled. Patient advised to reschedule.",
        prescriptions: [],
        labReports: [],
        otherDocs: [],
    },
    {
        id: "MR-2905",
        patient: "David Okonkwo",
        initials: "DO",
        avatarColor: "#9333ea",
        patientId: "PT-1071",
        diagnosis: "Asthma – Moderate Persistent",
        visitDate: "2026-05-20",
        visitDateDisplay: "May 20, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Pulmonology",
        status: "pending",
        symptoms: ["Recurrent wheezing", "Nocturnal cough", "Shortness of breath on exertion", "Chest tightness"],
        consultationNotes: "Spirometry shows FEV1/FVC ratio of 0.68 (moderate obstruction). Inhaler technique assessed — poor technique noted, re-educated. Controller therapy stepped up. Awaiting allergy panel results. Environmental trigger avoidance counselled. Follow-up in 4 weeks with peak flow diary.",
        prescriptions: [
            { name: "Fluticasone/Salmeterol Inhaler", dosage: "250/25mcg", frequency: "Two puffs twice daily", duration: "60 days" },
            { name: "Salbutamol Inhaler (Rescue)", dosage: "100mcg", frequency: "As needed (max 4 puffs/day)", duration: "30 days" },
            { name: "Montelukast", dosage: "10mg", frequency: "Once daily at night", duration: "30 days" },
        ],
        labReports: [
            { test: "Spirometry FEV1", value: "68%", normalRange: "> 80%", flag: "Low" },
            { test: "Spirometry FVC", value: "82%", normalRange: "> 80%", flag: "Normal" },
            { test: "Peak Flow Rate", value: "340 L/min", normalRange: "> 450 L/min", flag: "Low" },
        ],
        otherDocs: [
            { name: "Spirometry Full Report", type: "Pulmonary Function Test", size: "0.6 MB" },
        ],
    },
    {
        id: "MR-2887",
        patient: "Priya Menon",
        initials: "PM",
        avatarColor: "#e11d48",
        patientId: "PT-1083",
        diagnosis: "Iron Deficiency Anaemia",
        visitDate: "2026-05-12",
        visitDateDisplay: "May 12, 2026",
        doctor: "Dr. Ayisha Shalba",
        department: "Haematology",
        status: "final",
        symptoms: ["Fatigue", "Pallor", "Palpitations", "Exertional dyspnoea", "Brittle nails"],
        consultationNotes: "Haemoglobin 8.6 g/dL. Serum ferritin markedly low. Peripheral smear shows microcytic hypochromic picture. Dietary history reveals inadequate iron intake. No occult blood loss identified. Starting oral iron therapy. Vitamin C co-supplementation advised for absorption. Repeat CBC in 4 weeks.",
        prescriptions: [
            { name: "Ferrous Sulphate", dosage: "200mg", frequency: "Twice daily (1 hr before meals)", duration: "60 days" },
            { name: "Vitamin C", dosage: "500mg", frequency: "Twice daily with iron tablet", duration: "60 days" },
            { name: "Folic Acid", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
        ],
        labReports: [
            { test: "Haemoglobin", value: "8.6 g/dL", normalRange: "12.0–16.0 g/dL", flag: "Low" },
            { test: "Serum Ferritin", value: "4 ng/mL", normalRange: "12–150 ng/mL", flag: "Low" },
            { test: "MCV", value: "68 fL", normalRange: "80–100 fL", flag: "Low" },
            { test: "TIBC", value: "490 μg/dL", normalRange: "250–370 μg/dL", flag: "High" },
        ],
        otherDocs: [
            { name: "Peripheral Blood Smear Report", type: "Lab Report", size: "0.4 MB" },
        ],
    },
];

const STATUS_CONFIG = {
    final:     { label: "Final",     cls: "mr-status--final",     icon: FaCheckCircle },
    pending:   { label: "Pending",   cls: "mr-status--pending",   icon: FaClock },
    cancelled: { label: "Cancelled", cls: "mr-status--cancelled", icon: FaTimesCircle },
};

const DATE_FILTERS = [
    { key: "all",    label: "All Time" },
    { key: "30d",    label: "Last 30 Days" },
    { key: "90d",    label: "Last 90 Days" },
    { key: "6m",     label: "Last 6 Months" },
];

function withinDays(dateStr, days) {
    const diff = (new Date() - new Date(dateStr)) / 86400000;
    return diff <= days;
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`mr-status-badge ${cfg.cls}`}>
            <Icon />
            {cfg.label}
        </span>
    );
}

/* ─── Medical Record Details Modal ──────────────────────────── */
function MedicalRecordModal({ rec, onClose }) {
    if (!rec) return null;

    const cfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.pending;

    return (
        <div className="mrd-overlay" onClick={onClose}>
            <div className="mrd-modal" onClick={(e) => e.stopPropagation()}>

                {/* ── Modal Header ── */}
                <div className="mrd-header">
                    <div className="mrd-header-left">
                        <div className="mrd-avatar" style={{ background: rec.avatarColor }}>
                            {rec.initials}
                        </div>
                        <div>
                            <div className="mrd-header-id">
                                <FaHashtag className="mrd-id-icon" />{rec.id}
                            </div>
                            <h2 className="mrd-header-patient">{rec.patient}</h2>
                            <div className="mrd-header-sub">
                                <FaUserMd />
                                <span>{rec.doctor}</span>
                                <span className="mrd-dot">·</span>
                                <FaBuilding />
                                <span>{rec.department}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mrd-header-right">
                        <span className={`mr-status-badge ${cfg.cls} mrd-status-lg`}>
                            <cfg.icon />{cfg.label}
                        </span>
                        <button className="mrd-close-btn" onClick={onClose} aria-label="Close">
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* ── Modal Body ── */}
                <div className="mrd-body">

                    {/* Overview Section */}
                    <section className="mrd-section">
                        <h3 className="mrd-section-title">
                            <FaIdCard className="mrd-section-icon" /> Record Overview
                        </h3>
                        <div className="mrd-info-grid">
                            <div className="mrd-info-item">
                                <span className="mrd-info-label">Patient ID</span>
                                <span className="mrd-info-val mrd-info-val--id">{rec.patientId}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-info-label">Visit Date</span>
                                <span className="mrd-info-val">
                                    <FaCalendarAlt className="mrd-inline-icon" />
                                    {rec.visitDateDisplay}
                                </span>
                            </div>
                            <div className="mrd-info-item mrd-info-item--full">
                                <span className="mrd-info-label">Diagnosis / Reason for Visit</span>
                                <span className="mrd-info-val mrd-diagnosis-chip">{rec.diagnosis}</span>
                            </div>
                        </div>
                    </section>

                    {/* Symptoms */}
                    {rec.symptoms?.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaThermometerHalf className="mrd-section-icon" /> Symptoms
                            </h3>
                            <div className="mrd-tags">
                                {rec.symptoms.map((s, i) => (
                                    <span key={i} className="mrd-tag">{s}</span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Consultation Notes */}
                    {rec.consultationNotes && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaNotesMedical className="mrd-section-icon" /> Consultation Notes
                            </h3>
                            <p className="mrd-notes-text">{rec.consultationNotes}</p>
                        </section>
                    )}

                    {/* Prescriptions */}
                    {rec.prescriptions?.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaPrescriptionBottleAlt className="mrd-section-icon" /> Prescription
                            </h3>
                            <div className="mrd-med-list">
                                {rec.prescriptions.map((m, i) => (
                                    <div key={i} className="mrd-med-row">
                                        <div className="mrd-med-bullet" />
                                        <div className="mrd-med-info">
                                            <div className="mrd-med-name">
                                                {m.name}
                                                <span className="mrd-med-dosage">{m.dosage}</span>
                                            </div>
                                            <div className="mrd-med-meta">
                                                {m.frequency} &middot; {m.duration}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Lab Reports */}
                    {rec.labReports?.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaFlask className="mrd-section-icon" /> Lab Reports
                            </h3>
                            <div className="mrd-table-wrap">
                                <table className="mrd-table">
                                    <thead>
                                        <tr>
                                            <th>Test</th>
                                            <th>Result</th>
                                            <th>Normal Range</th>
                                            <th>Flag</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rec.labReports.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.test}</td>
                                                <td><strong>{r.value}</strong></td>
                                                <td className="mrd-table-muted">{r.normalRange}</td>
                                                <td>
                                                    <span className={`mrd-flag mrd-flag--${r.flag.toLowerCase()}`}>
                                                        {r.flag}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Other Medical Documents */}
                    {rec.otherDocs?.length > 0 && (
                        <section className="mrd-section">
                            <h3 className="mrd-section-title">
                                <FaFileAlt className="mrd-section-icon" /> Other Medical Documents
                            </h3>
                            <div className="mrd-doc-list">
                                {rec.otherDocs.map((d, i) => (
                                    <div key={i} className="mrd-doc-row">
                                        <div className="mrd-doc-icon">
                                            <FaFileAlt />
                                        </div>
                                        <div className="mrd-doc-info">
                                            <div className="mrd-doc-name">{d.name}</div>
                                            <div className="mrd-doc-meta">{d.type} &middot; {d.size}</div>
                                        </div>
                                        <button className="mrd-doc-dl-btn" title="Download">
                                            <FaDownload />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Record Status */}
                    <section className="mrd-section mrd-section--status">
                        <h3 className="mrd-section-title">
                            <FaFileMedical className="mrd-section-icon" /> Record Status
                        </h3>
                        <div className="mrd-status-block">
                            <span className={`mr-status-badge ${cfg.cls} mrd-status-lg`}>
                                <cfg.icon />{cfg.label}
                            </span>
                            {rec.status === "final" && (
                                <p className="mrd-status-note">This record has been finalised and signed off by the attending physician.</p>
                            )}
                            {rec.status === "pending" && (
                                <p className="mrd-status-note">This record is awaiting finalisation. Additional results may be pending.</p>
                            )}
                            {rec.status === "cancelled" && (
                                <p className="mrd-status-note">This consultation was cancelled. No clinical assessment was conducted.</p>
                            )}
                        </div>
                    </section>

                </div>

                {/* ── Modal Footer ── */}
                <div className="mrd-footer">
                    <button className="mrd-close-footer-btn" onClick={onClose}>Close</button>
                    <button className="mrd-dl-btn" onClick={() => alert(`Downloading ${rec.id}...`)}>
                        <FaDownload /> Download Record
                    </button>
                </div>

            </div>
        </div>
    );
}

/* ─── Record Row (table) ─────────────────────────────────────── */
function RecordRow({ rec, onView, onDownload }) {
    return (
        <tr className="mr-table-row">
            <td>
                <span className="mr-rec-id">
                    <FaHashtag className="mr-id-icon" />{rec.id}
                </span>
            </td>
            <td>
                <div className="mr-patient-cell">
                    <div className="mr-avatar" style={{ background: rec.avatarColor }}>
                        {rec.initials}
                    </div>
                    <div>
                        <div className="mr-patient-name">{rec.patient}</div>
                        <div className="mr-patient-id">{rec.patientId}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className="mr-diagnosis">{rec.diagnosis}</span>
            </td>
            <td>
                <div className="mr-date-cell">
                    <FaCalendarAlt />
                    <span>{rec.visitDateDisplay}</span>
                </div>
            </td>
            <td>
                <div className="mr-doctor-cell">
                    <FaUserMd />
                    <span>{rec.doctor}</span>
                </div>
            </td>
            <td><StatusBadge status={rec.status} /></td>
            <td>
                <div className="mr-actions-cell">
                    <button className="mr-btn mr-btn--view" onClick={() => onView(rec.id)}>
                        <FaEye /> View
                    </button>
                    <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec.id)}>
                        <FaDownload />
                    </button>
                </div>
            </td>
        </tr>
    );
}

/* ─── Record Card (mobile) ───────────────────────────────────── */
function RecordCard({ rec, onView, onDownload }) {
    return (
        <div className="mr-card">
            <div className="mr-card-header">
                <div className="mr-patient-cell">
                    <div className="mr-avatar" style={{ background: rec.avatarColor }}>
                        {rec.initials}
                    </div>
                    <div>
                        <div className="mr-patient-name">{rec.patient}</div>
                        <div className="mr-patient-id">{rec.patientId}</div>
                    </div>
                </div>
                <StatusBadge status={rec.status} />
            </div>

            <div className="mr-card-rec-id">
                <FaHashtag className="mr-id-icon" />{rec.id}
            </div>

            <p className="mr-card-diagnosis">{rec.diagnosis}</p>

            <div className="mr-card-meta">
                <div className="mr-meta-item">
                    <FaCalendarAlt />
                    <span>{rec.visitDateDisplay}</span>
                </div>
                <div className="mr-meta-item">
                    <FaUserMd />
                    <span>{rec.doctor}</span>
                </div>
                <div className="mr-meta-item">
                    <FaStethoscope />
                    <span>{rec.department}</span>
                </div>
            </div>

            <div className="mr-card-actions">
                <button className="mr-btn mr-btn--view mr-btn--full" onClick={() => onView(rec.id)}>
                    <FaEye /> View Record
                </button>
                <button className="mr-btn mr-btn--dl" onClick={() => onDownload(rec.id)}>
                    <FaDownload /> Download
                </button>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function DoctorMedicalRecords() {
    const navigate = useNavigate();
    const [search, setSearch]         = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter]   = useState("all");

    const filtered = useMemo(() => {
        return records.filter(r => {
            const q = search.toLowerCase();
            const matchSearch =
                r.patient.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q) ||
                r.diagnosis.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q);

            const matchStatus = statusFilter === "all" || r.status === statusFilter;

            const matchDate =
                dateFilter === "all"   ? true :
                dateFilter === "30d"   ? withinDays(r.visitDate, 30) :
                dateFilter === "90d"   ? withinDays(r.visitDate, 90) :
                                          withinDays(r.visitDate, 180);

            return matchSearch && matchStatus && matchDate;
        });
    }, [search, statusFilter, dateFilter]);

    const [viewRec, setViewRec] = useState(null);
    const handleView     = (id) => {
        const rec = records.find(r => r.id === id);
        if (rec) setViewRec(rec);
    };
    const handleDownload = (id) => alert(`Downloading record ${id}`);

    const statCounts = {
        final:     records.filter(r => r.status === "final").length,
        pending:   records.filter(r => r.status === "pending").length,
        cancelled: records.filter(r => r.status === "cancelled").length,
    };

    return (
        <div className="mr-page">

            {/* ── Medical Record Details Modal ── */}
            {viewRec && (
                <MedicalRecordModal rec={viewRec} onClose={() => setViewRec(null)} />
            )}

            {/* ── Header ──────────────────────────────────── */}
            <div className="mr-header">
                <div className="mr-header-text">
                    <h1 className="mr-page-title">
                        <FaFolderOpen className="mr-title-icon" />
                        Medical Records
                    </h1>
                    <p className="mr-page-subtitle">
                        Complete patient diagnostic and clinical history — <strong>{records.length}</strong> records
                    </p>
                </div>
                <button className="mr-refresh-btn" onClick={() => window.location.reload()}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* ── Stats Strip ─────────────────────────────── */}
            <div className="mr-stats-strip">
                <div className="mr-stat-tile mr-stat-tile--total">
                    <FaFileMedical />
                    <span className="mr-stat-val">{records.length}</span>
                    <span className="mr-stat-lbl">Total Records</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--final">
                    <FaCheckCircle />
                    <span className="mr-stat-val">{statCounts.final}</span>
                    <span className="mr-stat-lbl">Finalised</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--pending">
                    <FaClock />
                    <span className="mr-stat-val">{statCounts.pending}</span>
                    <span className="mr-stat-lbl">Pending</span>
                </div>
                <div className="mr-stat-tile mr-stat-tile--cancelled">
                    <FaTimesCircle />
                    <span className="mr-stat-val">{statCounts.cancelled}</span>
                    <span className="mr-stat-lbl">Cancelled</span>
                </div>
            </div>

            {/* ── Controls ────────────────────────────────── */}
            <div className="mr-controls">

                {/* Search */}
                <div className="mr-search">
                    <FaSearch className="mr-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by patient, record ID, or diagnosis..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="mr-search-clear" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="mr-filter-group">
                    <FaFilter className="mr-filter-icon" />
                    {["all", "final", "pending", "cancelled"].map(s => (
                        <button
                            key={s}
                            className={`mr-filter-btn ${statusFilter === s ? "mr-filter-btn--active" : ""}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === "all" ? "All Status" : STATUS_CONFIG[s]?.label || s}
                        </button>
                    ))}
                </div>

                {/* Date Filter */}
                <div className="mr-select-wrap">
                    <FaCalendarAlt className="mr-select-icon" />
                    <select
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                        className="mr-select"
                    >
                        {DATE_FILTERS.map(d => (
                            <option key={d.key} value={d.key}>{d.label}</option>
                        ))}
                    </select>
                    <FaChevronDown className="mr-select-chevron" />
                </div>

            </div>

            {/* ── Results Count ────────────────────────────── */}
            <div className="mr-results-row">
                <span className="mr-results-count">
                    Showing <strong>{filtered.length}</strong> of {records.length} records
                </span>
            </div>

            {/* ── Table (desktop) ──────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="mr-empty">
                    <FaFolderOpen className="mr-empty-icon" />
                    <h3>No records found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="mr-table-wrapper">
                        <table className="mr-table">
                            <thead>
                                <tr>
                                    <th>Record ID</th>
                                    <th>Patient</th>
                                    <th>Diagnosis</th>
                                    <th>Visit Date</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(rec => (
                                    <RecordRow
                                        key={rec.id}
                                        rec={rec}
                                        onView={handleView}
                                        onDownload={handleDownload}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Cards (mobile) ─────────────────────── */}
                    <div className="mr-cards-list">
                        {filtered.map(rec => (
                            <RecordCard
                                key={rec.id}
                                rec={rec}
                                onView={handleView}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}

export default DoctorMedicalRecords;
