import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";
import {
  FaFileMedical,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaEye,
  FaSearch,
  FaTimes,
  FaDownload,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFlask,
  FaFileAlt,
  FaPrescriptionBottleAlt,
  FaStethoscope,
  FaClipboardList,
  FaNotesMedical,
  FaCloudUploadAlt,
  FaCalendarPlus,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import "./PatientMedicalRecords.css";
import { useNavigate } from "react-router-dom";

/* ─── Static Record Data ────────────────────────────────────────── */
const ALL_RECORDS = [
  // Consultations
  {
    id: "consultation-1",
    kind: "Consultations",
    title: "Consultation — Dr. Sarah Johnson",
    subtitle: "Cardiologist",
    hospital: "Apollo Hospital, Kochi",
    date: "20 Jun 2026",
    sortDate: "2026-06-20",
    status: "Completed",
    badge: "Online Consultation",
    diagnosis: "Mild Hypertension",
    hasPrescription: true,
    notes:
      "Patient advised to monitor blood pressure daily. Reduce salt intake and exercise 30 min/day.",
    followUpDate: "20 Jul 2026",
    fee: "₹800",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
      { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "30 days" },
    ],
  },
  {
    id: "consultation-2",
    kind: "Consultations",
    title: "Consultation — Dr. John Smith",
    subtitle: "Dermatologist",
    hospital: "Aster Clinic, Kochi",
    date: "12 Jun 2026",
    sortDate: "2026-06-12",
    status: "Follow-up Scheduled",
    badge: "Hospital Visit",
    diagnosis: "Skin Allergy",
    hasPrescription: true,
    notes: "Prescribed antihistamines and topical cream. Avoid exposure to allergens.",
    followUpDate: "12 Jul 2026",
    fee: "₹600",
    medicines: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily at night", duration: "14 days" },
      { name: "Calamine Lotion", dosage: "Apply topically", frequency: "Twice daily", duration: "14 days" },
    ],
  },
  {
    id: "consultation-3",
    kind: "Consultations",
    title: "Consultation — Dr. Emily Wilson",
    subtitle: "Neurologist",
    hospital: "Lakeshore Hospital, Ernakulam",
    date: "03 Jun 2026",
    sortDate: "2026-06-03",
    status: "Completed",
    badge: "Online Consultation",
    diagnosis: "Migraine",
    hasPrescription: false,
    notes: "Prescribed Sumatriptan for acute episodes. Maintain a headache diary.",
    fee: "₹1,000",
  },
  // Prescriptions
  {
    id: "prescription-1",
    kind: "Prescriptions",
    title: "Prescription — Dr. Sarah Johnson",
    subtitle: "Cardiologist",
    hospital: "Apollo Hospital, Kochi",
    date: "20 Jun 2026",
    sortDate: "2026-06-20",
    status: "Active",
    diagnosis: "Mild Hypertension",
    hasPrescription: true,
    medicines: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "30 days" },
      { name: "Aspirin", dosage: "75mg", frequency: "Once daily", duration: "30 days" },
    ],
    notes: "Take medicines after breakfast. Report any dizziness immediately.",
  },
  {
    id: "prescription-2",
    kind: "Prescriptions",
    title: "Prescription — Dr. John Smith",
    subtitle: "Dermatologist",
    hospital: "Aster Clinic, Kochi",
    date: "12 Jun 2026",
    sortDate: "2026-06-12",
    status: "Active",
    diagnosis: "Skin Allergy",
    hasPrescription: true,
    medicines: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily at night", duration: "14 days" },
      { name: "Calamine Lotion", dosage: "Apply topically", frequency: "Twice daily", duration: "14 days" },
    ],
    notes: "Avoid scratching affected area. Keep skin moisturized and wear loose cotton clothing.",
  },
  // Lab Reports
  {
    id: "lab-1",
    kind: "Lab Reports",
    title: "Complete Blood Count (CBC)",
    subtitle: "Ordered by Dr. Sarah Johnson",
    hospital: "Apollo Hospital, Kochi",
    date: "18 Jun 2026",
    sortDate: "2026-06-18",
    status: "Available",
    badge: "LAB-APL-2026-0487",
    results: [
      { parameter: "Hemoglobin", value: "14.2 g/dL", normalRange: "13.0–17.0", flag: "Normal" },
      { parameter: "WBC Count", value: "7,500 /μL", normalRange: "4,500–11,000", flag: "Normal" },
      { parameter: "Platelet Count", value: "2,50,000 /μL", normalRange: "1,50,000–4,00,000", flag: "Normal" },
    ],
  },
  {
    id: "lab-2",
    kind: "Lab Reports",
    title: "Blood Sugar Test",
    subtitle: "Ordered by Dr. John Smith",
    hospital: "Aster Clinic, Kochi",
    date: "05 Jun 2026",
    sortDate: "2026-06-05",
    status: "Available",
    badge: "LAB-AST-2026-0312",
    results: [
      { parameter: "Fasting Blood Sugar", value: "98 mg/dL", normalRange: "70–100", flag: "Normal" },
      { parameter: "HbA1c", value: "5.4%", normalRange: "4.0–5.6", flag: "Normal" },
    ],
  },
  // Documents
  {
    id: "doc-1",
    kind: "Documents",
    title: "Chest X-Ray",
    subtitle: "Uploaded by Dr. Sarah Johnson",
    hospital: "Apollo Hospital, Kochi",
    date: "15 Jun 2026",
    sortDate: "2026-06-15",
    status: "X-Ray",
    fileSize: "2.4 MB",
    description: "Chest X-Ray (PA view) — Normal study. No significant abnormality detected.",
  },
  {
    id: "doc-2",
    kind: "Documents",
    title: "MRI Brain Scan",
    subtitle: "Uploaded by Dr. Emily Wilson",
    hospital: "Lakeshore Hospital, Ernakulam",
    date: "02 Jun 2026",
    sortDate: "2026-06-02",
    status: "MRI",
    fileSize: "18.7 MB",
    description: "MRI Brain with contrast — No structural abnormality. No evidence of infarct or hemorrhage.",
  },
  {
    id: "doc-3",
    kind: "Documents",
    title: "ECG Report",
    subtitle: "Uploaded by Dr. Sarah Johnson",
    hospital: "Aster Clinic, Kochi",
    date: "28 May 2026",
    sortDate: "2026-05-28",
    status: "ECG",
    fileSize: "1.1 MB",
    description: "12-lead ECG — Normal sinus rhythm. No ST-T changes or arrhythmia.",
  },
];

/* ─── Config ────────────────────────────────────────────────────── */
const TABS = [
  { key: "All Records", icon: <FaClipboardList /> },
  { key: "Consultations", icon: <FaStethoscope /> },
  { key: "Prescriptions", icon: <FaPrescriptionBottleAlt /> },
  { key: "Lab Reports", icon: <FaFlask /> },
  { key: "Documents", icon: <FaFileAlt /> },
];

const KIND_ICON = {
  Consultations: <FaStethoscope />,
  Prescriptions: <FaPrescriptionBottleAlt />,
  "Lab Reports": <FaFlask />,
  Documents: <FaFileAlt />,
};

const KIND_COLOR = {
  Consultations: { bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9" },
  Prescriptions: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  "Lab Reports":  { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Documents:      { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
};

const STATUS_STYLE = {
  Completed:             { bg: "#d1fae5", color: "#065f46" },
  "Follow-up Scheduled": { bg: "#fef3c7", color: "#92400e" },
  Available:             { bg: "#d1fae5", color: "#065f46" },
  Active:                { bg: "#dbeafe", color: "#1e40af" },
};

/* ─── Real PDF Download ─────────────────────────────────────────── */
function generateRecordPDF(record) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 20;

  const line = () => { doc.setDrawColor(220, 228, 240); doc.line(margin, y, W - margin, y); y += 5; };
  const heading = (txt, size = 13) => {
    doc.setFontSize(size); doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); doc.text(txt, margin, y); y += 7;
  };
  const sub = (label, val, indent = 0) => {
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139); doc.text(label, margin + indent, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
    doc.text(String(val), margin + indent + 38, y); y += 6;
  };
  const body = (txt, indent = 0) => {
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(txt, W - margin * 2 - indent);
    doc.text(lines, margin + indent, y); y += lines.length * 5.5 + 2;
  };

  // Header
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, W, 14, "F");
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
  doc.text("MedicoBridge — Medical Records", margin, 9);
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W - margin, 9, { align: "right" });
  y = 24;

  heading(record.title, 15);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(record.kind, margin, y); y += 8;

  line();
  sub("Hospital:", record.hospital);
  if (record.subtitle) sub("Doctor:", record.subtitle);
  sub("Date:", record.date);
  if (record.status) sub("Status:", record.status);
  if (record.diagnosis) sub("Diagnosis:", record.diagnosis);
  if (record.fee) sub("Fee:", record.fee);
  y += 3;

  if (record.medicines?.length) {
    line();
    heading("Prescribed Medicines");
    record.medicines.forEach((m, i) => {
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(`${i + 1}. ${m.name} ${m.dosage}`, margin + 4, y); y += 6;
      body(`${m.frequency} · Duration: ${m.duration}`, 8);
    });
    y += 2;
  }

  if (record.results?.length) {
    line();
    heading("Lab Results");
    record.results.forEach((r) => {
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
      doc.text(r.parameter, margin + 4, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
      doc.text(`${r.value}  (Normal: ${r.normalRange}) — ${r.flag}`, margin + 55, y); y += 6;
    });
    y += 2;
  }

  if (record.description) {
    line();
    heading("Description");
    body(record.description, 4);
  }

  if (record.notes) {
    line();
    heading("Notes");
    body(record.notes, 4);
  }

  if (record.followUpDate) {
    line();
    sub("Follow-up:", record.followUpDate);
  }

  // Footer
  doc.setDrawColor(220, 228, 240); doc.line(margin, 283, W - margin, 283);
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text("MedicoBridge Digital Health Platform · Confidential Patient Record", margin, 288);
  doc.text("Page 1 of 1", W - margin, 288, { align: "right" });

  const safeName = record.title.replace(/[^a-zA-Z0-9\s\-]/g, "").replace(/\s+/g, "_");
  doc.save(`MedicoBridge_${safeName}_${record.date.replace(/\s/g, "")}.pdf`);
}

/* ─── Prescription View Modal ───────────────────────────────────── */
function PrescriptionModal({ record, onClose }) {
  if (!record) return null;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      generateRecordPDF(record);
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="mr-modal-overlay" onClick={onClose}>
      <div className="mr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mr-modal-header">
          <div className="mr-modal-title-wrap">
            <span className="mr-modal-kind-icon">
              {KIND_ICON[record.kind] || <FaFileMedical />}
            </span>
            <div>
              <h3 className="mr-modal-title">{record.title}</h3>
              <p className="mr-modal-sub">{record.hospital} · {record.date}</p>
            </div>
          </div>
          <button className="mr-modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="mr-modal-body">
          {record.diagnosis && (
            <div className="mr-modal-row">
              <span className="mr-modal-label">Diagnosis</span>
              <span className="mr-modal-val mr-modal-diagnosis">{record.diagnosis}</span>
            </div>
          )}
          {record.status && (
            <div className="mr-modal-row">
              <span className="mr-modal-label">Status</span>
              <span
                className="mr-modal-val"
                style={{
                  ...STATUS_STYLE[record.status],
                  padding: "3px 10px", borderRadius: "999px",
                  fontSize: "0.78rem", fontWeight: 700,
                }}
              >
                {record.status}
              </span>
            </div>
          )}
          {record.fee && (
            <div className="mr-modal-row">
              <span className="mr-modal-label">Consultation Fee</span>
              <span className="mr-modal-val">{record.fee}</span>
            </div>
          )}
          {record.followUpDate && (
            <div className="mr-modal-row">
              <span className="mr-modal-label">Follow-up Date</span>
              <span className="mr-modal-val">{record.followUpDate}</span>
            </div>
          )}

          {/* Medicines */}
          {record.medicines?.length > 0 && (
            <div className="mr-modal-section">
              <p className="mr-modal-section-title">Prescribed Medicines</p>
              <div className="mr-modal-med-list">
                {record.medicines.map((m, i) => (
                  <div className="mr-modal-med-row" key={i}>
                    <div className="mr-modal-med-bullet" />
                    <div>
                      <strong>{m.name}</strong> <span style={{ color: "#64748b" }}>{m.dosage}</span>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                        {m.frequency} · {m.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Results */}
          {record.results?.length > 0 && (
            <div className="mr-modal-section">
              <p className="mr-modal-section-title">Lab Results</p>
              <table className="mr-modal-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Result</th>
                    <th>Normal Range</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {record.results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.parameter}</td>
                      <td><strong>{r.value}</strong></td>
                      <td style={{ color: "#94a3b8" }}>{r.normalRange}</td>
                      <td>
                        <span style={{
                          fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px",
                          borderRadius: "999px",
                          background: r.flag === "Normal" ? "#d1fae5" : "#fee2e2",
                          color: r.flag === "Normal" ? "#065f46" : "#991b1b",
                        }}>
                          {r.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Document description */}
          {record.description && (
            <div className="mr-modal-section">
              <p className="mr-modal-section-title">Description</p>
              <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {record.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div className="mr-modal-section">
              <p className="mr-modal-section-title">Doctor's Notes</p>
              <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {record.notes}
              </p>
            </div>
          )}

          {record.fileSize && (
            <div className="mr-modal-row">
              <span className="mr-modal-label">File Size</span>
              <span className="mr-modal-val">{record.fileSize}</span>
            </div>
          )}
        </div>

        <div className="mr-modal-footer">
          <button className="mr-modal-cancel-btn" onClick={onClose}>Close</button>
          <button
            className="mr-modal-dl-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? <FaSpinner className="spin-icon" /> : <FaDownload />}
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Record Card ───────────────────────────────────────────────── */
function RecordCard({ record, onView }) {
  const [dlDone, setDlDone] = useState(false);
  const colors = KIND_COLOR[record.kind] || KIND_COLOR.Documents;
  const statusStyle = STATUS_STYLE[record.status];

  const handleDownload = (e) => {
    e.stopPropagation();
    generateRecordPDF(record);
    setDlDone(true);
    setTimeout(() => setDlDone(false), 2500);
  };

  return (
    <div className="mr2-card" onClick={() => onView(record)}>
      {/* Left accent bar */}
      <div className="mr2-card-accent" style={{ background: colors.dot }} />

      {/* Icon */}
      <div className="mr2-card-icon" style={{ background: colors.bg, color: colors.color }}>
        {KIND_ICON[record.kind]}
      </div>

      {/* Content */}
      <div className="mr2-card-content">
        <div className="mr2-card-top">
          <div className="mr2-card-title-wrap">
            <h4 className="mr2-card-title">{record.title}</h4>
            {record.kind !== "Consultations" && (
              <span className="mr2-kind-chip" style={{ background: colors.bg, color: colors.color }}>
                {record.kind.replace("Reports", "Report")}
              </span>
            )}
          </div>
          {record.status && statusStyle && (
            <span className="mr2-status-badge" style={statusStyle}>
              {record.status}
            </span>
          )}
          {record.status && !statusStyle && record.kind === "Documents" && (
            <span className="mr2-type-badge">{record.status}</span>
          )}
        </div>

        <div className="mr2-card-meta">
          <span><FaUserMd className="mr2-meta-icon" />{record.subtitle}</span>
          <span><FaHospital className="mr2-meta-icon" />{record.hospital}</span>
          <span><FaCalendarAlt className="mr2-meta-icon" />{record.date}</span>
          {record.badge && (
            <span className="mr2-badge-chip">{record.badge}</span>
          )}
          {record.fileSize && (
            <span className="mr2-badge-chip" style={{ color: "#7c3aed", background: "#ede9fe" }}>
              {record.fileSize}
            </span>
          )}
        </div>

        {record.diagnosis && (
          <p className="mr2-diagnosis">
            Diagnosis: <strong>{record.diagnosis}</strong>
          </p>
        )}
        {record.medicines?.length > 0 && (
          <p className="mr2-meds-preview">
            {record.medicines.map((m) => m.name).join(" · ")}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mr2-card-actions" onClick={(e) => e.stopPropagation()}>
        {record.hasPrescription && (
          <button
            className="mr2-btn mr2-btn--outline"
            onClick={() => onView(record)}
            title="View Prescription"
          >
            <FaEye /> View
          </button>
        )}
        {record.kind !== "Consultations" && (
          <button
            className={`mr2-btn ${dlDone ? "mr2-btn--done" : "mr2-btn--primary"}`}
            onClick={handleDownload}
            title="Download PDF"
          >
            {dlDone ? <FaCheckCircle /> : <FaDownload />}
            {dlDone ? "Saved!" : "PDF"}
          </button>
        )}
        {record.kind === "Consultations" && !record.hasPrescription && (
          <button
            className="mr2-btn mr2-btn--outline"
            onClick={() => onView(record)}
            title="View Details"
          >
            <FaEye /> View
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
function PatientMedicalRecords() {
  const [activeTab, setActiveTab] = useState("All Records");
  const [search, setSearch] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const [viewRecord, setViewRecord] = useState(null);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let data = ALL_RECORDS;

    // Tab filter
    if (activeTab !== "All Records") {
      data = data.filter((r) => r.kind === activeTab);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.subtitle || "").toLowerCase().includes(q) ||
          (r.hospital || "").toLowerCase().includes(q) ||
          (r.diagnosis || "").toLowerCase().includes(q) ||
          (r.badge || "").toLowerCase().includes(q) ||
          (r.medicines || []).some((m) => m.name.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...data].sort((a, b) => {
      const da = new Date(a.sortDate);
      const db = new Date(b.sortDate);
      return sortNewest ? db - da : da - db;
    });
  }, [activeTab, search, sortNewest]);

  // Tab counts
  const counts = useMemo(() => {
    const base = search.trim()
      ? ALL_RECORDS.filter((r) => {
          const q = search.toLowerCase();
          return (
            r.title.toLowerCase().includes(q) ||
            (r.subtitle || "").toLowerCase().includes(q) ||
            (r.hospital || "").toLowerCase().includes(q) ||
            (r.diagnosis || "").toLowerCase().includes(q)
          );
        })
      : ALL_RECORDS;

    const result = { "All Records": base.length };
    ["Consultations", "Prescriptions", "Lab Reports", "Documents"].forEach((k) => {
      result[k] = base.filter((r) => r.kind === k).length;
    });
    return result;
  }, [search]);

  const isEmpty = filtered.length === 0;

  return (
    <div className="medical-records">

      {/* Prescription / Record View Modal */}
      {viewRecord && (
        <PrescriptionModal record={viewRecord} onClose={() => setViewRecord(null)} />
      )}

      {/* ── Header ── */}
      <div className="mr-header">
        <div className="mr-header-left">
          <div className="mr-header-icon"><FaNotesMedical /></div>
          <div>
            <h2 className="mr-title">Medical Records</h2>
            <p className="mr-subtitle">Your complete health history — consultations, prescriptions, lab reports, and documents.</p>
          </div>
        </div>
        <div className="mr-stats-pill">
          <FaFileMedical />
          <span>{counts["All Records"]} {counts["All Records"] === 1 ? "Record" : "Records"}</span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mr-controls">
        <div className="mr-search-wrapper">
          <FaSearch className="mr-search-icon" />
          <input
            id="mr-search"
            className="mr-search-input"
            type="text"
            placeholder="Search by doctor, test, hospital, diagnosis…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="mr-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
              <FaTimes />
            </button>
          )}
        </div>
        <button
          className="mr-sort-btn"
          onClick={() => setSortNewest((p) => !p)}
          title={sortNewest ? "Showing Newest First" : "Showing Oldest First"}
        >
          {sortNewest ? <FaSortAmountDown /> : <FaSortAmountUp />}
          {sortNewest ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="mr-filter-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mr-filter-tab ${activeTab === tab.key ? "mr-filter-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.key}
            <span className="mr-filter-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* ── Records List ── */}
      {!isEmpty ? (
        <div className="mr2-list">
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onView={setViewRecord}
            />
          ))}
        </div>
      ) : (
        <div className="mr-empty-state">
          <div className="mr-empty-illustration"><FaNotesMedical /></div>
          <h3 className="mr-empty-title">No Records Found</h3>
          <p className="mr-empty-subtitle">
            {search
              ? `No results matched "${search}". Try a different term or clear the search.`
              : "You don't have any medical records yet. Book a consultation to get started."}
          </p>
          <div className="mr-empty-actions">
            {search && (
              <button className="mr-empty-clear-btn" onClick={() => { setSearch(""); setActiveTab("All Records"); }}>
                <FaTimes /> Clear Filters
              </button>
            )}
            <button className="mr-empty-upload-btn" onClick={() => alert("Upload feature coming soon!")}>
              <FaCloudUploadAlt /> Upload Records
            </button>
            <button className="mr-empty-book-btn" onClick={() => navigate("/patient/find-doctors")}>
              <FaCalendarPlus /> Book Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientMedicalRecords;