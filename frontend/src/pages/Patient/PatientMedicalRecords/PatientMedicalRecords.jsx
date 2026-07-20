import React, { useState, useMemo } from "react";
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
  FaArrowRight,
  FaCloudUploadAlt,
  FaCalendarPlus,
} from "react-icons/fa";
import "./PatientMedicalRecords.css";
import { useNavigate } from "react-router-dom";

/* ── Mock Data ─────────────────────────────────────────────────── */

const consultations = [
  {
    id: "consultation-1",
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital",
    city: "Kochi",
    date: "20 June 2026",
    sortDate: "2026-06-20",
    type: "Online Consultation",
    diagnosis: "Mild Hypertension",
    status: "Completed",
    consultationFee: "₹800",
    followUpDate: "20 July 2026",
    notes:
      "Patient advised to monitor blood pressure daily. Reduce salt intake and exercise 30 min/day.",
  },
  {
    id: "consultation-2",
    doctor: "Dr. John Smith",
    specialization: "Dermatologist",
    hospital: "Aster Clinic",
    city: "Kochi",
    date: "12 June 2026",
    sortDate: "2026-06-12",
    type: "Hospital Visit",
    diagnosis: "Skin Allergy",
    status: "Follow-up Scheduled",
    consultationFee: "₹600",
    followUpDate: "12 July 2026",
    notes:
      "Prescribed antihistamines and topical cream. Avoid exposure to allergens.",
  },
  {
    id: "consultation-3",
    doctor: "Dr. Emily Wilson",
    specialization: "Neurologist",
    hospital: "Lakeshore Hospital",
    city: "Ernakulam",
    date: "03 June 2026",
    sortDate: "2026-06-03",
    type: "Online Consultation",
    diagnosis: "Migraine",
    status: "Completed",
    consultationFee: "₹1,000",
    followUpDate: null,
    notes:
      "Prescribed Sumatriptan for acute episodes. Maintain a headache diary.",
  },
];

const prescriptions = [
  {
    id: "prescription-1",
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital, Kochi",
    date: "20 June 2026",
    sortDate: "2026-06-20",
    diagnosis: "Mild Hypertension",
    medicines: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "30 days",
      },
      {
        name: "Aspirin",
        dosage: "75mg",
        frequency: "Once daily",
        duration: "30 days",
      },
    ],
    notes: "Take medicines after breakfast. Report any dizziness immediately.",
  },
  {
    id: "prescription-2",
    doctor: "Dr. John Smith",
    specialization: "Dermatologist",
    hospital: "Aster Clinic, Kochi",
    date: "12 June 2026",
    sortDate: "2026-06-12",
    diagnosis: "Skin Allergy",
    medicines: [
      {
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "Once daily at night",
        duration: "14 days",
      },
      {
        name: "Calamine Lotion",
        dosage: "Apply topically",
        frequency: "Twice daily",
        duration: "14 days",
      },
    ],
    notes:
      "Avoid scratching affected area. Keep skin moisturized and wear loose cotton clothing.",
  },
];

const labReports = [
  {
    id: "lab-1",
    test: "Complete Blood Count (CBC)",
    hospital: "Apollo Hospital, Kochi",
    orderedBy: "Dr. Sarah Johnson",
    date: "18 June 2026",
    sortDate: "2026-06-18",
    status: "Available",
    referenceId: "LAB-APL-2026-0487",
    results: [
      {
        parameter: "Hemoglobin",
        value: "14.2 g/dL",
        normalRange: "13.0-17.0",
        status: "Normal",
      },
      {
        parameter: "WBC Count",
        value: "7,500 /μL",
        normalRange: "4,500-11,000",
        status: "Normal",
      },
      {
        parameter: "Platelet Count",
        value: "2,50,000 /μL",
        normalRange: "1,50,000-4,00,000",
        status: "Normal",
      },
    ],
  },
  {
    id: "lab-2",
    test: "Blood Sugar Test",
    hospital: "Aster Clinic, Kochi",
    orderedBy: "Dr. John Smith",
    date: "05 June 2026",
    sortDate: "2026-06-05",
    status: "Available",
    referenceId: "LAB-AST-2026-0312",
    results: [
      {
        parameter: "Fasting Blood Sugar",
        value: "98 mg/dL",
        normalRange: "70-100",
        status: "Normal",
      },
      {
        parameter: "HbA1c",
        value: "5.4%",
        normalRange: "4.0-5.6",
        status: "Normal",
      },
    ],
  },
];

const medicalDocuments = [
  {
    id: "doc-1",
    title: "Chest X-Ray",
    hospital: "Apollo Hospital, Kochi",
    date: "15 June 2026",
    sortDate: "2026-06-15",
    type: "X-Ray",
    fileSize: "2.4 MB",
    uploadedBy: "Dr. Sarah Johnson",
    description:
      "Chest X-Ray (PA view) — Normal study. No significant abnormality detected.",
  },
  {
    id: "doc-2",
    title: "MRI Brain Scan",
    hospital: "Lakeshore Hospital, Ernakulam",
    date: "02 June 2026",
    sortDate: "2026-06-02",
    type: "MRI",
    fileSize: "18.7 MB",
    uploadedBy: "Dr. Emily Wilson",
    description:
      "MRI Brain with contrast — No structural abnormality. No evidence of infarct or hemorrhage.",
  },
  {
    id: "doc-3",
    title: "ECG Report",
    hospital: "Aster Clinic, Kochi",
    date: "28 May 2026",
    sortDate: "2026-05-28",
    type: "ECG",
    fileSize: "1.1 MB",
    uploadedBy: "Dr. Sarah Johnson",
    description:
      "12-lead ECG — Normal sinus rhythm. No ST-T changes or arrhythmia.",
  },
];

/* ── Helpers ───────────────────────────────────────────────────── */

const FILTER_TABS = [
  { key: "All Records", icon: <FaClipboardList />, label: "All Records" },
  { key: "Consultations", icon: <FaStethoscope />, label: "Consultations" },
  {
    key: "Prescriptions",
    icon: <FaPrescriptionBottleAlt />,
    label: "Prescriptions",
  },
  { key: "Lab Reports", icon: <FaFlask />, label: "Lab Reports" },
  { key: "Documents", icon: <FaFileAlt />, label: "Documents" },
];

const STATUS_CLASS_MAP = {
  Completed: "mr-status--completed",
  "Follow-up Scheduled": "mr-status--followup",
  "In Progress": "mr-status--inprogress",
  Cancelled: "mr-status--cancelled",
  Available: "mr-status--completed",
};

function matchSearch(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

function sortByDate(items, key, asc) {
  return [...items].sort((a, b) => {
    const da = new Date(a[key]);
    const db = new Date(b[key]);
    return asc ? da - db : db - da;
  });
}

function handleDownload(name) {
  alert(`Downloading PDF for "${name}"…\n\n(This is a demo — no actual file is generated.)`);
}

/* ── Component ─────────────────────────────────────────────────── */

function PatientMedicalRecords() {
  const [selectedFilter, setSelectedFilter] = useState("All Records");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);
  const navigate = useNavigate();

  /* Filtered + sorted data */
  const filteredConsultations = useMemo(() => {
    let data = consultations;
    if (searchQuery) {
      data = data.filter(
        (r) =>
          matchSearch(r.doctor, searchQuery) ||
          matchSearch(r.specialization, searchQuery) ||
          matchSearch(r.hospital, searchQuery) ||
          matchSearch(r.diagnosis, searchQuery) ||
          matchSearch(r.type, searchQuery)
      );
    }
    return sortByDate(data, "sortDate", !sortNewest);
  }, [searchQuery, sortNewest]);

  const filteredPrescriptions = useMemo(() => {
    let data = prescriptions;
    if (searchQuery) {
      data = data.filter(
        (r) =>
          matchSearch(r.doctor, searchQuery) ||
          matchSearch(r.hospital, searchQuery) ||
          matchSearch(r.diagnosis, searchQuery) ||
          matchSearch(
            r.medicines.map((m) => m.name).join(" "),
            searchQuery
          )
      );
    }
    return sortByDate(data, "sortDate", !sortNewest);
  }, [searchQuery, sortNewest]);

  const filteredLabReports = useMemo(() => {
    let data = labReports;
    if (searchQuery) {
      data = data.filter(
        (r) =>
          matchSearch(r.test, searchQuery) ||
          matchSearch(r.hospital, searchQuery) ||
          matchSearch(r.orderedBy, searchQuery)
      );
    }
    return sortByDate(data, "sortDate", !sortNewest);
  }, [searchQuery, sortNewest]);

  const filteredDocuments = useMemo(() => {
    let data = medicalDocuments;
    if (searchQuery) {
      data = data.filter(
        (r) =>
          matchSearch(r.title, searchQuery) ||
          matchSearch(r.hospital, searchQuery) ||
          matchSearch(r.type, searchQuery)
      );
    }
    return sortByDate(data, "sortDate", !sortNewest);
  }, [searchQuery, sortNewest]);

  /* Counts */
  const counts = {
    "All Records":
      filteredConsultations.length +
      filteredPrescriptions.length +
      filteredLabReports.length +
      filteredDocuments.length,
    Consultations: filteredConsultations.length,
    Prescriptions: filteredPrescriptions.length,
    "Lab Reports": filteredLabReports.length,
    Documents: filteredDocuments.length,
  };

  const activeCount = counts[selectedFilter];

  const showConsultations =
    (selectedFilter === "All Records" || selectedFilter === "Consultations") &&
    filteredConsultations.length > 0;
  const showPrescriptions =
    (selectedFilter === "All Records" || selectedFilter === "Prescriptions") &&
    filteredPrescriptions.length > 0;
  const showLabReports =
    (selectedFilter === "All Records" || selectedFilter === "Lab Reports") &&
    filteredLabReports.length > 0;
  const showDocuments =
    (selectedFilter === "All Records" || selectedFilter === "Documents") &&
    filteredDocuments.length > 0;

  const nothingToShow =
    !showConsultations && !showPrescriptions && !showLabReports && !showDocuments;

  return (
    <div className="medical-records">
      {/* ── Header ── */}
      <div className="mr-header">
        <div className="mr-header-left">
          <div className="mr-header-icon">
            <FaNotesMedical />
          </div>
          <div>
            <h2 className="mr-title">Medical Records</h2>
            <p className="mr-subtitle">
              View your complete consultation history and healthcare records.
            </p>
          </div>
        </div>
        <div className="mr-stats-pill">
          <FaFileMedical />
          <span>
            {activeCount} {activeCount === 1 ? "Record" : "Records"}
          </span>
        </div>
      </div>

      {/* ── Search + Sort ── */}
      <div className="mr-controls">
        <div className="mr-search-wrapper">
          <FaSearch className="mr-search-icon" />
          <input
            className="mr-search-input"
            type="text"
            placeholder="Search by doctor, test, hospital, diagnosis…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="mr-search-clear"
              onClick={() => setSearchQuery("")}
            >
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

      {/* ── Filter Tabs ── */}
      <div className="mr-filter-tabs">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mr-filter-tab ${
              selectedFilter === tab.key ? "mr-filter-tab--active" : ""
            }`}
            onClick={() => setSelectedFilter(tab.key)}
          >
            {tab.icon}
            {tab.label}
            <span className="mr-filter-count">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* ── Sections ── */}

      {/* Consultations */}
      {showConsultations && (
        <div className="mr-section">
          <div className="mr-section-header">
            <FaStethoscope className="mr-section-icon" />
            <h3>Consultation History</h3>
            <span className="mr-section-count">
              {filteredConsultations.length}
            </span>
          </div>

          <div className="mr-cards-list">
            {filteredConsultations.map((record) => (
              <div className="mr-card" key={record.id}>
                <div className="mr-card-body">
                  <div className="mr-card-avatar">
                    <FaUserMd />
                  </div>
                  <div className="mr-card-info">
                    <div className="mr-card-top">
                      <h4 className="mr-card-title">{record.doctor}</h4>
                      <span
                        className={`mr-status-badge ${
                          STATUS_CLASS_MAP[record.status] || ""
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="mr-card-spec">{record.specialization}</p>
                    <div className="mr-card-meta">
                      <span className="mr-meta-item">
                        <FaHospital className="mr-meta-icon" />
                        {record.hospital}, {record.city}
                      </span>
                      <span className="mr-meta-item">
                        <FaCalendarAlt className="mr-meta-icon" />
                        {record.date}
                      </span>
                    </div>
                    <div className="mr-card-tags">
                      <span className="mr-tag mr-tag--type">{record.type}</span>
                      <span className="mr-tag mr-tag--diagnosis">
                        {record.diagnosis}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mr-card-footer">
                  <button
                    className="mr-view-btn"
                    onClick={() =>
                      navigate(
                        `/patient/medical-records/consultation/${record.id}`
                      )
                    }
                  >
                    <FaEye />
                    View Details
                    <FaArrowRight className="mr-btn-arrow" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {showPrescriptions && (
        <div className="mr-section">
          <div className="mr-section-header">
            <FaPrescriptionBottleAlt className="mr-section-icon" />
            <h3>Prescriptions</h3>
            <span className="mr-section-count">
              {filteredPrescriptions.length}
            </span>
          </div>

          <div className="mr-cards-list">
            {filteredPrescriptions.map((item) => (
              <div className="mr-card" key={item.id}>
                <div className="mr-card-body">
                  <div className="mr-card-avatar mr-card-avatar--rx">💊</div>
                  <div className="mr-card-info">
                    <div className="mr-card-top">
                      <h4 className="mr-card-title">{item.doctor}</h4>
                    </div>
                    <p className="mr-card-spec">{item.specialization}</p>
                    <div className="mr-card-meta">
                      <span className="mr-meta-item">
                        <FaHospital className="mr-meta-icon" />
                        {item.hospital}
                      </span>
                      <span className="mr-meta-item">
                        <FaCalendarAlt className="mr-meta-icon" />
                        {item.date}
                      </span>
                    </div>
                    <div className="mr-card-tags">
                      <span className="mr-tag mr-tag--diagnosis">
                        {item.diagnosis}
                      </span>
                      <span className="mr-tag mr-tag--meds">
                        {item.medicines.map((m) => m.name).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mr-card-footer">
                  <button
                    className="mr-download-btn"
                    onClick={() =>
                      handleDownload(`Prescription — ${item.doctor}`)
                    }
                  >
                    <FaDownload />
                    Download PDF
                  </button>
                  <button
                    className="mr-view-btn"
                    onClick={() =>
                      navigate(
                        `/patient/medical-records/prescription/${item.id}`
                      )
                    }
                  >
                    <FaEye />
                    View Prescription
                    <FaArrowRight className="mr-btn-arrow" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Reports */}
      {showLabReports && (
        <div className="mr-section">
          <div className="mr-section-header">
            <FaFlask className="mr-section-icon" />
            <h3>Lab Reports</h3>
            <span className="mr-section-count">
              {filteredLabReports.length}
            </span>
          </div>

          <div className="mr-cards-list">
            {filteredLabReports.map((report) => (
              <div className="mr-card" key={report.id}>
                <div className="mr-card-body">
                  <div className="mr-card-avatar mr-card-avatar--lab">🧪</div>
                  <div className="mr-card-info">
                    <div className="mr-card-top">
                      <h4 className="mr-card-title">{report.test}</h4>
                      <span
                        className={`mr-status-badge ${
                          STATUS_CLASS_MAP[report.status] || ""
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <div className="mr-card-meta">
                      <span className="mr-meta-item">
                        <FaHospital className="mr-meta-icon" />
                        {report.hospital}
                      </span>
                      <span className="mr-meta-item">
                        <FaUserMd className="mr-meta-icon" />
                        {report.orderedBy}
                      </span>
                      <span className="mr-meta-item">
                        <FaCalendarAlt className="mr-meta-icon" />
                        {report.date}
                      </span>
                    </div>
                    <div className="mr-card-tags">
                      <span className="mr-tag mr-tag--ref">
                        Ref: {report.referenceId}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mr-card-footer">
                  <button
                    className="mr-download-btn"
                    onClick={() => handleDownload(`Lab Report — ${report.test}`)}
                  >
                    <FaDownload />
                    Download PDF
                  </button>
                  <button
                    className="mr-view-btn"
                    onClick={() =>
                      navigate(
                        `/patient/medical-records/lab-report/${report.id}`
                      )
                    }
                  >
                    <FaEye />
                    View Report
                    <FaArrowRight className="mr-btn-arrow" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {showDocuments && (
        <div className="mr-section">
          <div className="mr-section-header">
            <FaFileAlt className="mr-section-icon" />
            <h3>Medical Documents</h3>
            <span className="mr-section-count">
              {filteredDocuments.length}
            </span>
          </div>

          <div className="mr-cards-list">
            {filteredDocuments.map((doc) => (
              <div className="mr-card" key={doc.id}>
                <div className="mr-card-body">
                  <div className="mr-card-avatar mr-card-avatar--doc">📄</div>
                  <div className="mr-card-info">
                    <div className="mr-card-top">
                      <h4 className="mr-card-title">{doc.title}</h4>
                      <span className="mr-type-badge">{doc.type}</span>
                    </div>
                    <div className="mr-card-meta">
                      <span className="mr-meta-item">
                        <FaHospital className="mr-meta-icon" />
                        {doc.hospital}
                      </span>
                      <span className="mr-meta-item">
                        <FaCalendarAlt className="mr-meta-icon" />
                        {doc.date}
                      </span>
                    </div>
                    <div className="mr-card-tags">
                      <span className="mr-tag mr-tag--file">
                        {doc.fileSize}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mr-card-footer">
                  <button
                    className="mr-download-btn"
                    onClick={() => handleDownload(`Document — ${doc.title}`)}
                  >
                    <FaDownload />
                    Download PDF
                  </button>
                  <button
                    className="mr-view-btn"
                    onClick={() =>
                      navigate(`/patient/medical-records/document/${doc.id}`)
                    }
                  >
                    <FaEye />
                    View Document
                    <FaArrowRight className="mr-btn-arrow" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {nothingToShow && (
        <div className="mr-empty-state">
          <div className="mr-empty-illustration">
            <FaNotesMedical />
          </div>
          <h3 className="mr-empty-title">No Records Found</h3>
          <p className="mr-empty-subtitle">
            {searchQuery
              ? `No results matched "${searchQuery}". Try a different search term or clear your filters.`
              : "You don't have any medical records yet. Book a consultation or upload your records to get started."}
          </p>
          <div className="mr-empty-actions">
            {searchQuery && (
              <button
                className="mr-empty-clear-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("All Records");
                }}
              >
                <FaTimes /> Clear Filters
              </button>
            )}
            <button
              className="mr-empty-upload-btn"
              onClick={() => alert("Upload records feature coming soon!")}
            >
              <FaCloudUploadAlt /> Upload Records
            </button>
            <button
              className="mr-empty-book-btn"
              onClick={() => navigate("/patient/find-doctors")}
            >
              <FaCalendarPlus /> Book Consultation
              <FaArrowRight className="mr-btn-arrow" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientMedicalRecords;