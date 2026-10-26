import React, { useState, useMemo, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../services/apiConfig";
const API_BASE = API_BASE_URL.replace(/\/api\/?$/, "");
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
  FaExclamationTriangle,
} from "react-icons/fa";
import "./PatientMedicalRecords.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
  "Lab Reports": { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Documents: { bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
};

const STATUS_STYLE = {
  Completed: { bg: "#d1fae5", color: "#065f46" },
  "Follow-up Scheduled": { bg: "#fef3c7", color: "#92400e" },
  Available: { bg: "#d1fae5", color: "#065f46" },
  Active: { bg: "#dbeafe", color: "#1e40af" },
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

  const safeName = (record.title || "Record").replace(/[^a-zA-Z0-9\s\-]/g, "").replace(/\s+/g, "_");
  doc.save(`MedicoBridge_${safeName}_${(record.date || "").replace(/\s/g, "")}.pdf`);
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
      toast.success("Medical record PDF downloaded successfully.");
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
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecords = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your medical records.");
      setLoading(false);
      setRecords([]);
      return;
    }

    setLoading(true);
    setError(null);

    const headers = { Authorization: `Bearer ${token}` };
    const fetchEndpoint = async (url) => {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    };

    try {
      const [mrRes, pRes, lrRes, docRes] = await Promise.allSettled([
        fetchEndpoint(`${API_BASE}/api/patient/medical-records`),
        fetchEndpoint(`${API_BASE}/api/patient/prescriptions`),
        fetchEndpoint(`${API_BASE}/api/patient/lab-reports`),
        fetchEndpoint(`${API_BASE}/api/patient/medical-reports`),
      ]);

      const allFailed = [mrRes, pRes, lrRes, docRes].every((r) => r.status === "rejected");
      if (allFailed) {
        throw new Error("Unable to connect to healthcare server. Please check your network connection or login session.");
      }

      const parsedRecords = [];

      // 1. Consultations & Clinical Medical Records
      if (mrRes.status === "fulfilled" && mrRes.value?.success && Array.isArray(mrRes.value.data)) {
        mrRes.value.data.forEach((mr) => {
          const doc = mr.doctorId || {};
          const hosp = mr.hospitalId || {};
          const docName = doc.name || mr.doctorName || "Doctor";
          const spec = doc.specialization || "General Physician";
          const hospName = hosp.name || mr.hospitalName || (hosp.city ? `Hospital, ${hosp.city}` : "Medical Facility");
          const dateObj = new Date(mr.date || mr.createdAt);
          const sortDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split("T")[0] : "";
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "";

          let kind = "Consultations";
          if (mr.recordType === "Prescription") kind = "Prescriptions";
          else if (mr.recordType === "Lab Report") kind = "Lab Reports";
          else if (["Discharge Summary", "Vaccination", "General"].includes(mr.recordType) || (mr.attachments && mr.attachments.length > 0)) {
            kind = "Documents";
          }

          parsedRecords.push({
            id: String(mr._id),
            kind,
            title: mr.title || `Consultation — ${docName}`,
            subtitle: spec,
            hospital: hospName,
            date: dateStr,
            sortDate,
            status: mr.recordType === "Discharge Summary" ? "Completed" : "Completed",
            badge: mr.recordType || "Clinical Consultation",
            diagnosis: mr.recordType === "Diagnosis" ? mr.title : (mr.description || ""),
            hasPrescription: Boolean(mr.recordType === "Prescription" || mr.prescription),
            notes: mr.description || "",
            description: mr.description || "",
            fileSize: mr.attachments && mr.attachments.length > 0 ? `${mr.attachments.length} Attachment(s)` : undefined,
            attachments: mr.attachments || [],
          });
        });
      }

      // 2. Real Prescriptions
      if (pRes.status === "fulfilled" && pRes.value?.success && Array.isArray(pRes.value.data)) {
        pRes.value.data.forEach((p) => {
          const doc = p.doctorId || {};
          const hosp = p.hospitalId || {};
          const docName = doc.name || "Doctor";
          const spec = doc.specialization || "General Physician";
          const hospName = hosp.name || doc.hospitalName || "Hospital";
          const dateObj = new Date(p.createdAt);
          const sortDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split("T")[0] : "";
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "";

          parsedRecords.push({
            id: String(p._id),
            kind: "Prescriptions",
            title: `Prescription — ${docName}`,
            subtitle: spec,
            hospital: hospName,
            date: dateStr,
            sortDate,
            status: p.status === "Active" ? "Active" : "Completed",
            badge: p.prescriptionId || "Digital Prescription",
            diagnosis: p.diagnosis || "Prescription Issued",
            hasPrescription: true,
            notes: [p.advice, p.notes].filter(Boolean).join(" · ") || "",
            medicines: (p.medicines || []).map((m) => ({
              name: m.name || m.medicineName || "Medicine",
              dosage: m.dosage || "",
              frequency: [m.frequency, m.timing].filter(Boolean).join(", ") || "",
              duration: m.duration || "",
              instructions: m.instructions || "",
            })),
          });
        });
      }

      // 3. Real Lab Reports
      if (lrRes.status === "fulfilled" && lrRes.value?.success && Array.isArray(lrRes.value.data)) {
        lrRes.value.data.forEach((lr) => {
          const doc = lr.doctorId || {};
          const hosp = lr.hospitalId || {};
          const docName = doc.name ? `Ordered by ${doc.name}` : (lr.category || "Clinical Pathology");
          const hospName = hosp.name || "Diagnostic Laboratory";
          const dateObj = new Date(lr.reportDate || lr.createdAt);
          const sortDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split("T")[0] : "";
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "";

          const mappedResults = (lr.results || []).map((r) => ({
            parameter: r.parameter || "",
            value: [r.value, r.unit].filter(Boolean).join(" "),
            normalRange: r.referenceRange || "Standard",
            flag: r.status === "High" || r.status === "Low" || r.status === "Abnormal" ? r.status : "Normal",
          }));

          parsedRecords.push({
            id: String(lr._id),
            kind: "Lab Reports",
            title: lr.testName || "Diagnostic Lab Report",
            subtitle: docName,
            hospital: hospName,
            date: dateStr,
            sortDate,
            status: lr.status === "Completed" ? "Available" : lr.status || "Available",
            badge: lr.reportId || lr.category || "Lab Report",
            diagnosis: lr.remarks || lr.notes || "",
            notes: [lr.notes, lr.remarks].filter(Boolean).join(" · ") || "",
            results: mappedResults,
            fileSize: lr.fileUrl ? "Document Available" : undefined,
            fileUrl: lr.fileUrl || "",
          });
        });
      }

      // 4. Real Medical Reports / Clinical Documents
      if (docRes.status === "fulfilled" && docRes.value?.success && Array.isArray(docRes.value.data)) {
        docRes.value.data.forEach((dr) => {
          const doc = dr.doctorId || {};
          const hosp = dr.hospitalId || {};
          const docName = doc.name ? `Dr. ${doc.name.replace(/^Dr\.?\s*/i, "")}` : "Authorized Medical Center";
          const hospName = hosp.name || "Medical Center";
          const dateObj = new Date(dr.reportDate || dr.createdAt);
          const sortDate = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split("T")[0] : "";
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "";

          parsedRecords.push({
            id: String(dr._id),
            kind: "Documents",
            title: dr.title || "Clinical Report",
            subtitle: doc.specialization ? `${docName} (${doc.specialization})` : docName,
            hospital: hospName,
            date: dateStr,
            sortDate,
            status: "Available",
            badge: dr.reportId || "Medical Document",
            description: [dr.summary, dr.findings].filter(Boolean).join("\n\n") || "",
            notes: dr.recommendations || "",
            fileSize: dr.attachments?.length ? `${dr.attachments.length} Attachment(s)` : undefined,
            attachments: dr.attachments || [],
          });
        });
      }

      // Deduplicate by ID
      const uniqueRecords = [];
      const seenIds = new Set();
      for (const item of parsedRecords) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueRecords.push(item);
        }
      }

      setRecords(uniqueRecords);
    } catch (err) {
      console.error("Failed to fetch medical records:", err);
      setError(err.message || "Failed to load medical records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    let data = records;

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
  }, [activeTab, search, sortNewest, records]);

  // Tab counts
  const counts = useMemo(() => {
    const base = search.trim()
      ? records.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          (r.subtitle || "").toLowerCase().includes(q) ||
          (r.hospital || "").toLowerCase().includes(q) ||
          (r.diagnosis || "").toLowerCase().includes(q)
        );
      })
      : records;

    const result = { "All Records": base.length };
    ["Consultations", "Prescriptions", "Lab Reports", "Documents"].forEach((k) => {
      result[k] = base.filter((r) => r.kind === k).length;
    });
    return result;
  }, [search, records]);

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

      {/* ── Content States ── */}
      {loading ? (
        <div className="mr-loading-state" style={{ textAlign: "center", padding: "4rem 1rem", color: "#64748b" }}>
          <FaSpinner className="spin-icon" style={{ fontSize: "2.2rem", color: "var(--primary-color)", marginBottom: "1rem" }} />
          <h3 style={{ fontWeight: 600, fontSize: "1.1rem", color: "#1e293b", margin: "0 0 0.5rem" }}>
            Loading your medical records…
          </h3>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
            Fetching verified records from your healthcare providers.
          </p>
        </div>
      ) : error ? (
        <div className="mr-empty-state">
          <div className="mr-empty-illustration" style={{ color: "#ef4444" }}>
            <FaExclamationTriangle />
          </div>
          <h3 className="mr-empty-title">Unable to Load Medical Records</h3>
          <p className="mr-empty-subtitle">{error}</p>
          <div className="mr-empty-actions">
            <button className="mr-empty-book-btn" onClick={fetchRecords}>
              Retry
            </button>
          </div>
        </div>
      ) : !isEmpty ? (
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
          <h3 className="mr-empty-title">
            {search || activeTab !== "All Records" ? "No Records Found" : "No medical records available"}
          </h3>
          <p className="mr-empty-subtitle">
            {search
              ? `No results matched "${search}". Try a different term or clear the filter.`
              : activeTab !== "All Records"
              ? `No records found under ${activeTab}. Records will appear when added by an authorized doctor or hospital.`
              : "Medical records will appear here once they are added by an authorized doctor or hospital after your consultation or clinical visit."}
          </p>
          <div className="mr-empty-actions">
            {(search || activeTab !== "All Records") && (
              <button
                className="mr-empty-clear-btn"
                onClick={() => { setSearch(""); setActiveTab("All Records"); }}
              >
                <FaTimes /> Clear Filters
              </button>
            )}
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