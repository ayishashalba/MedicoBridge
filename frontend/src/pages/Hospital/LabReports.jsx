import React, { useState, useMemo } from "react";
import {
  FaFlask,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaUpload,
  FaCheck,
  FaFilePdf,
  FaExclamationTriangle,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaFileMedical,
  FaNotesMedical,
  FaPlus,
  FaHeartbeat,
  FaMicroscope,
  FaVial,
  FaLink,
} from "react-icons/fa";
import "./LabReports.css";

// Realistic initial Lab Reports
const initialLabReports = [
  {
    id: "LAB-9011",
    patientName: "Devanand S.",
    patientId: "PAT-4088",
    patientAge: 56,
    patientGender: "Male",
    doctorName: "Dr. Ayisha Shalba",
    doctorSpecialty: "Cardiology",
    testName: "Cardiac Troponin & Lipid Panel",
    category: "Cardiology",
    testDate: "Aug 18, 2026",
    sampleCollectedDate: "Aug 18, 2026, 08:30 AM",
    status: "Processing",
    sampleType: "Venous Blood",
    isAbnormal: true,
    associatedWithMedicalRecord: false,
    remarks: "Elevated Troponin-I and serum cholesterol levels. Advised urgent clinical correlation.",
    results: [
      { parameter: "High-Sensitivity Troponin I", value: "0.14", unit: "ng/mL", referenceRange: "< 0.04 ng/mL", status: "High" },
      { parameter: "Total Cholesterol", value: "245", unit: "mg/dL", referenceRange: "< 200 mg/dL", status: "High" },
      { parameter: "HDL Cholesterol", value: "38", unit: "mg/dL", referenceRange: "> 40 mg/dL", status: "Low" },
      { parameter: "LDL Cholesterol", value: "162", unit: "mg/dL", referenceRange: "< 100 mg/dL", status: "High" },
      { parameter: "Triglycerides", value: "190", unit: "mg/dL", referenceRange: "< 150 mg/dL", status: "High" },
    ],
  },
  {
    id: "LAB-9012",
    patientName: "Leela Mathews",
    patientId: "PAT-4096",
    patientAge: 72,
    patientGender: "Female",
    doctorName: "Dr. Amit Varma",
    doctorSpecialty: "General Medicine",
    testName: "Complete Blood Count (CBC)",
    category: "Hematology",
    testDate: "Aug 19, 2026",
    sampleCollectedDate: "Aug 19, 2026, 09:15 AM",
    status: "Sample Collected",
    sampleType: "Whole Blood (EDTA)",
    isAbnormal: false,
    associatedWithMedicalRecord: false,
    remarks: "Sample drawn and transferred to automated hematology analyzer.",
    results: [
      { parameter: "Hemoglobin", value: "11.8", unit: "g/dL", referenceRange: "12.0 – 15.5 g/dL", status: "Normal" },
      { parameter: "Total WBC Count", value: "6,800", unit: "/μL", referenceRange: "4,000 – 11,000 /μL", status: "Normal" },
      { parameter: "Platelet Count", value: "240,000", unit: "/μL", referenceRange: "150,000 – 450,000 /μL", status: "Normal" },
      { parameter: "RBC Count", value: "4.2", unit: "million/μL", referenceRange: "3.8 – 5.2 million/μL", status: "Normal" },
    ],
  },
  {
    id: "LAB-9013",
    patientName: "John Wesley",
    patientId: "PAT-4090",
    patientAge: 46,
    patientGender: "Male",
    doctorName: "Dr. Susan George",
    doctorSpecialty: "Orthopedics",
    testName: "HbA1c & Fasting Plasma Glucose",
    category: "Endocrinology",
    testDate: "Aug 17, 2026",
    sampleCollectedDate: "Aug 17, 2026, 07:45 AM",
    status: "Completed",
    sampleType: "Fluoride Blood & EDTA",
    isAbnormal: true,
    associatedWithMedicalRecord: true,
    remarks: "Elevated glycated hemoglobin indicating sub-optimal glycemic control. Diabetic review advised.",
    results: [
      { parameter: "HbA1c (Glycated Hemoglobin)", value: "8.4", unit: "%", referenceRange: "< 5.7 %", status: "High" },
      { parameter: "Estimated Average Glucose", value: "194", unit: "mg/dL", referenceRange: "< 117 mg/dL", status: "High" },
      { parameter: "Fasting Blood Glucose", value: "156", unit: "mg/dL", referenceRange: "70 – 99 mg/dL", status: "High" },
    ],
  },
  {
    id: "LAB-9014",
    patientName: "Meera Pillai",
    patientId: "PAT-4105",
    patientAge: 61,
    patientGender: "Female",
    doctorName: "Dr. Priya Thomas",
    doctorSpecialty: "Pediatrics",
    testName: "Comprehensive Thyroid Profile",
    category: "Biochemistry",
    testDate: "Aug 16, 2026",
    sampleCollectedDate: "Aug 16, 2026, 08:15 AM",
    status: "Completed",
    sampleType: "Serum",
    isAbnormal: false,
    associatedWithMedicalRecord: true,
    remarks: "Euthyroid state. Thyroid hormone levels within optimal therapeutic range.",
    results: [
      { parameter: "TSH (Thyroid Stimulating Hormone)", value: "2.45", unit: "μIU/mL", referenceRange: "0.45 – 4.50 μIU/mL", status: "Normal" },
      { parameter: "Free T3 (Triiodothyronine)", value: "3.1", unit: "pg/mL", referenceRange: "2.0 – 4.4 pg/mL", status: "Normal" },
      { parameter: "Free T4 (Thyroxine)", value: "1.22", unit: "ng/dL", referenceRange: "0.82 – 1.77 ng/dL", status: "Normal" },
    ],
  },
  {
    id: "LAB-9015",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    patientAge: 52,
    patientGender: "Male",
    doctorName: "Dr. Rajesh K. Nair",
    doctorSpecialty: "Neurology",
    testName: "Renal Function & Electrolytes (RFT)",
    category: "Biochemistry",
    testDate: "Aug 18, 2026",
    sampleCollectedDate: "Aug 18, 2026, 09:00 AM",
    status: "Completed",
    sampleType: "Serum",
    isAbnormal: true,
    associatedWithMedicalRecord: true,
    remarks: "Mildly elevated serum creatinine and blood urea nitrogen. Maintain hydration.",
    results: [
      { parameter: "Serum Creatinine", value: "1.65", unit: "mg/dL", referenceRange: "0.74 – 1.35 mg/dL", status: "High" },
      { parameter: "Blood Urea Nitrogen (BUN)", value: "26", unit: "mg/dL", referenceRange: "7 – 20 mg/dL", status: "High" },
      { parameter: "Serum Sodium (Na+)", value: "139", unit: "mEq/L", referenceRange: "135 – 145 mEq/L", status: "Normal" },
      { parameter: "Serum Potassium (K+)", value: "4.4", unit: "mEq/L", referenceRange: "3.5 – 5.1 mEq/L", status: "Normal" },
    ],
  },
  {
    id: "LAB-9016",
    patientName: "Sonia Sebastian",
    patientId: "PAT-4092",
    patientAge: 29,
    patientGender: "Female",
    doctorName: "Dr. Priya Thomas",
    doctorSpecialty: "Pediatrics",
    testName: "Liver Function Test (LFT)",
    category: "Biochemistry",
    testDate: "Aug 19, 2026",
    sampleCollectedDate: "—",
    status: "Requested",
    sampleType: "Serum",
    isAbnormal: false,
    associatedWithMedicalRecord: false,
    remarks: "Awaiting sample collection from general ward 2A-01.",
    results: [
      { parameter: "Total Bilirubin", value: "—", unit: "mg/dL", referenceRange: "0.2 – 1.2 mg/dL", status: "Pending" },
      { parameter: "SGOT / AST", value: "—", unit: "U/L", referenceRange: "8 – 48 U/L", status: "Pending" },
      { parameter: "SGPT / ALT", value: "—", unit: "U/L", referenceRange: "7 – 55 U/L", status: "Pending" },
      { parameter: "Alkaline Phosphatase (ALP)", value: "—", unit: "U/L", referenceRange: "44 – 147 U/L", status: "Pending" },
    ],
  },
  {
    id: "LAB-9017",
    patientName: "Mohan Lal",
    patientId: "PAT-4093",
    patientAge: 64,
    patientGender: "Male",
    doctorName: "Dr. Ayisha Shalba",
    doctorSpecialty: "Cardiology",
    testName: "Serum Electrolytes & Calcium",
    category: "Biochemistry",
    testDate: "Aug 17, 2026",
    sampleCollectedDate: "Aug 17, 2026, 11:30 AM",
    status: "Completed",
    sampleType: "Serum",
    isAbnormal: false,
    associatedWithMedicalRecord: true,
    remarks: "Electrolytes and ionized calcium within normal baseline limits.",
    results: [
      { parameter: "Serum Sodium", value: "141", unit: "mmol/L", referenceRange: "136 – 145 mmol/L", status: "Normal" },
      { parameter: "Serum Potassium", value: "4.1", unit: "mmol/L", referenceRange: "3.5 – 5.0 mmol/L", status: "Normal" },
      { parameter: "Serum Chloride", value: "102", unit: "mmol/L", referenceRange: "98 – 107 mmol/L", status: "Normal" },
      { parameter: "Serum Calcium", value: "9.4", unit: "mg/dL", referenceRange: "8.6 – 10.3 mg/dL", status: "Normal" },
    ],
  },
  {
    id: "LAB-9018",
    patientName: "Aparna Nair",
    patientId: "PAT-4094",
    patientAge: 41,
    patientGender: "Female",
    doctorName: "Dr. Vikram Shekar",
    doctorSpecialty: "Dermatology",
    testName: "Serum IgE & Allergy Screening",
    category: "Immunology",
    testDate: "Aug 19, 2026",
    sampleCollectedDate: "Aug 19, 2026, 10:00 AM",
    status: "Processing",
    sampleType: "Serum",
    isAbnormal: true,
    associatedWithMedicalRecord: false,
    remarks: "Elevated IgE antibody titer detected in serum. Assay verification underway.",
    results: [
      { parameter: "Total Serum IgE", value: "380", unit: "IU/mL", referenceRange: "< 100 IU/mL", status: "High" },
      { parameter: "Absolute Eosinophil Count", value: "540", unit: "/μL", referenceRange: "20 – 500 /μL", status: "High" },
    ],
  },
];

const STATUS_FILTERS = ["All", "Requested", "Sample Collected", "Processing", "Completed", "Abnormal"];

function LabReports() {
  const [reports, setReports] = useState(initialLabReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [viewModalReport, setViewModalReport] = useState(null);
  const [updateModalReport, setUpdateModalReport] = useState(null);
  const [showNewTestModal, setShowNewTestModal] = useState(false);

  // Update Form State
  const [editStatus, setEditStatus] = useState("Completed");
  const [editRemarks, setEditRemarks] = useState("");
  const [editResults, setEditResults] = useState([]);
  const [editIsAbnormal, setEditIsAbnormal] = useState(false);

  // New Test Order State
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientId, setNewPatientId] = useState("");
  const [newDoctorName, setNewDoctorName] = useState("Dr. Ayisha Shalba");
  const [newTestName, setNewTestName] = useState("Complete Blood Count (CBC)");
  const [newCategory, setNewCategory] = useState("Hematology");
  const [newSampleType, setNewSampleType] = useState("Venous Blood");

  // Toast Feedback State
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Metric computations
  const totalTests = reports.length;
  const pendingReports = reports.filter((r) => r.status !== "Completed").length;
  const completedReports = reports.filter((r) => r.status === "Completed").length;
  const abnormalReports = reports.filter((r) => r.isAbnormal).length;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        rep.id.toLowerCase().includes(q) ||
        rep.patientName.toLowerCase().includes(q) ||
        rep.patientId.toLowerCase().includes(q) ||
        rep.doctorName.toLowerCase().includes(q) ||
        rep.testName.toLowerCase().includes(q);

      let matchFilter = true;
      if (statusFilter === "Abnormal") {
        matchFilter = rep.isAbnormal;
      } else if (statusFilter !== "All") {
        matchFilter = rep.status === statusFilter;
      }

      return matchSearch && matchFilter;
    });
  }, [reports, search, statusFilter]);

  // Handler: Open Update/Upload Modal
  const handleOpenUpdateModal = (report) => {
    setUpdateModalReport(report);
    setEditStatus(report.status);
    setEditRemarks(report.remarks || "");
    setEditIsAbnormal(report.isAbnormal || false);
    setEditResults(
      report.results.map((res) => ({ ...res }))
    );
  };

  // Handler: Save Update Report
  const handleSaveReportUpdate = (e) => {
    e.preventDefault();
    if (!updateModalReport) return;

    const isMarkedCompleted = editStatus === "Completed";

    setReports((prev) =>
      prev.map((rep) =>
        rep.id === updateModalReport.id
          ? {
              ...rep,
              status: editStatus,
              remarks: editRemarks,
              isAbnormal: editIsAbnormal,
              results: editResults,
              associatedWithMedicalRecord: isMarkedCompleted ? true : rep.associatedWithMedicalRecord,
            }
          : rep
      )
    );

    setUpdateModalReport(null);
    if (viewModalReport && viewModalReport.id === updateModalReport.id) {
      setViewModalReport(null);
    }

    if (isMarkedCompleted) {
      showToast(`Report ${updateModalReport.id} completed & associated with patient's Medical Records.`);
    } else {
      showToast(`Report ${updateModalReport.id} updated successfully.`);
    }
  };

  // Handler: Mark Completed Directly
  const handleMarkCompleted = (reportId) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          // Adjust any pending parameters to normal
          const updatedResults = rep.results.map((r) =>
            r.value === "—" ? { ...r, value: "Verified", status: "Normal" } : r
          );
          return {
            ...rep,
            status: "Completed",
            associatedWithMedicalRecord: true,
            results: updatedResults,
            remarks: rep.remarks.includes("Awaiting") ? "Sample analysis completed. Findings verified." : rep.remarks,
          };
        }
        return rep;
      })
    );

    showToast(`Report ${reportId} marked as Completed & linked to Medical Records.`);
  };

  // Handler: Order New Diagnostic Test
  const handleCreateNewTest = (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    const newId = `LAB-${Math.floor(9020 + Math.random() * 80)}`;
    const pId = newPatientId.trim() || `PAT-${Math.floor(4120 + Math.random() * 80)}`;

    const newReport = {
      id: newId,
      patientName: newPatientName.trim(),
      patientId: pId,
      patientAge: 38,
      patientGender: "Male",
      doctorName: newDoctorName,
      doctorSpecialty: "General Medicine",
      testName: newTestName,
      category: newCategory,
      testDate: "Aug 19, 2026",
      sampleCollectedDate: "—",
      status: "Requested",
      sampleType: newSampleType,
      isAbnormal: false,
      associatedWithMedicalRecord: false,
      remarks: "Test requisition created. Awaiting sample collection.",
      results: [
        { parameter: "Routine Assay Parameter", value: "—", unit: "—", referenceRange: "Standard Range", status: "Pending" },
      ],
    };

    setReports([newReport, ...reports]);
    setShowNewTestModal(false);
    setNewPatientName("");
    setNewPatientId("");
    showToast(`Lab order ${newId} created for ${newPatientName}`);
  };

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "hosp-lab-status-badge lab-status--completed";
      case "Processing":
        return "hosp-lab-status-badge lab-status--processing";
      case "Sample Collected":
        return "hosp-lab-status-badge lab-status--sample";
      case "Requested":
      default:
        return "hosp-lab-status-badge lab-status--requested";
    }
  };

  return (
    <div className="hosp-labs-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hosp-lab-toast" role="alert">
          <FaCheckCircle className="toast-icon-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="hosp-lab-header-banner">
        <div className="banner-info">
          <div className="banner-icon-box">
            <FaFlask />
          </div>
          <div>
            <h2 className="banner-title">Hospital Laboratory &amp; Diagnostic Reports</h2>
            <p className="banner-subtitle">
              Manage clinical pathology, test requisitions, specimen processing, and automated Medical Record sync.
            </p>
          </div>
        </div>
        <button
          className="hosp-btn-new-order"
          onClick={() => setShowNewTestModal(true)}
          id="btn-order-lab-test"
        >
          <FaPlus />
          <span>Order Lab Test</span>
        </button>
      </div>

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <section className="hosp-lab-summary-cards" aria-label="Laboratory Metrics">
        {/* Total Tests */}
        <div className="hosp-stat-card card-total-tests">
          <div className="stat-card-header">
            <span className="stat-title">Total Tests</span>
            <div className="stat-icon stat-icon--total">
              <FaMicroscope />
            </div>
          </div>
          <div className="stat-value">{totalTests}</div>
          <div className="stat-meta">
            <span className="meta-highlight">Diagnostic Lab</span> active inventory
          </div>
        </div>

        {/* Pending Reports */}
        <div className="hosp-stat-card card-pending-reports">
          <div className="stat-card-header">
            <span className="stat-title">Pending Reports</span>
            <div className="stat-icon stat-icon--pending">
              <FaClock />
            </div>
          </div>
          <div className="stat-value text-amber">{pendingReports}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--pending">In Progress</span>
            Requisitions &amp; Analysis
          </div>
        </div>

        {/* Completed Reports */}
        <div className="hosp-stat-card card-completed-reports">
          <div className="stat-card-header">
            <span className="stat-title">Completed Reports</span>
            <div className="stat-icon stat-icon--completed">
              <FaCheckCircle />
            </div>
          </div>
          <div className="stat-value text-success">{completedReports}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--success">
              {Math.round((completedReports / totalTests) * 100)}% Verified
            </span>
            Synced with Patient Records
          </div>
        </div>

        {/* Abnormal Reports */}
        <div className="hosp-stat-card card-abnormal-reports">
          <div className="stat-card-header">
            <span className="stat-title">Abnormal Reports</span>
            <div className="stat-icon stat-icon--abnormal">
              <FaExclamationTriangle />
            </div>
          </div>
          <div className="stat-value text-danger">{abnormalReports}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--danger">Critical / Alert</span>
            Out-of-range parameters
          </div>
        </div>
      </section>

      {/* ── CONTROLS: FILTER TABS & SEARCH BAR ── */}
      <div className="hosp-lab-control-panel hosp-card">
        {/* Status Filter Tabs */}
        <div className="hosp-lab-status-tabs" role="tablist">
          {STATUS_FILTERS.map((tab) => {
            const count =
              tab === "All"
                ? reports.length
                : tab === "Abnormal"
                ? reports.filter((r) => r.isAbnormal).length
                : reports.filter((r) => r.status === tab).length;
            const isActive = statusFilter === tab;

            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                className={`lab-status-tab-btn ${isActive ? "lab-status-tab-btn--active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                <span>{tab}</span>
                <span className="tab-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="hosp-lab-search-row">
          <div className="hosp-lab-search-box">
            <FaSearch className="hosp-search-icon" />
            <input
              type="text"
              placeholder="Search by Report ID, Patient Name, Patient ID, Doctor, Test..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search lab reports"
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LAB REPORTS TABLE SECTION ── */}
      <div className="hosp-card hosp-lab-table-card">
        <div className="hosp-table-header-bar">
          <div>
            <h3 className="hosp-card-title" style={{ marginBottom: "0.2rem" }}>
              Laboratory Test Log &amp; Requisitions
            </h3>
            <p className="table-subtitle">
              Showing {filteredReports.length} of {reports.length} diagnostic requisitions
            </p>
          </div>
        </div>

        <div className="hosp-table-wrapper">
          <table className="hosp-table hosp-lab-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Doctor Name</th>
                <th>Test Name</th>
                <th>Test Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((rep) => (
                  <tr key={rep.id} className="lab-table-row">
                    {/* Report ID */}
                    <td>
                      <div className="lab-id-cell">
                        <FaVial className="lab-id-icon" />
                        <span className="lab-id-text">{rep.id}</span>
                        {rep.isAbnormal && (
                          <span className="abnormal-flag-dot" title="Abnormal findings flagged" />
                        )}
                      </div>
                    </td>

                    {/* Patient Name */}
                    <td>
                      <span className="hosp-pat-name">{rep.patientName}</span>
                    </td>

                    {/* Patient ID */}
                    <td>
                      <span className="hosp-pat-id">{rep.patientId}</span>
                    </td>

                    {/* Doctor Name */}
                    <td>
                      <div className="doctor-cell">
                        <span className="doc-name">{rep.doctorName}</span>
                        <span className="doc-dept">{rep.doctorSpecialty}</span>
                      </div>
                    </td>

                    {/* Test Name */}
                    <td>
                      <div className="test-name-cell">
                        <span className="test-title">{rep.testName}</span>
                        <span className="test-category-tag">{rep.category}</span>
                      </div>
                    </td>

                    {/* Test Date */}
                    <td>
                      <div className="test-date-cell">
                        <FaCalendarAlt className="mini-icon text-muted" />
                        <span>{rep.testDate}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={getStatusBadge(rep.status)}>
                        {rep.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="hosp-lab-actions-cell">
                        {/* View Report */}
                        <button
                          className="hosp-lab-btn btn-view-report"
                          onClick={() => setViewModalReport(rep)}
                          title="View Full Report"
                        >
                          <FaEye />
                          <span>View Report</span>
                        </button>

                        {/* Upload / Update Report */}
                        <button
                          className="hosp-lab-btn btn-update-report"
                          onClick={() => handleOpenUpdateModal(rep)}
                          title="Upload / Update Findings"
                        >
                          <FaUpload />
                          <span>Update</span>
                        </button>

                        {/* Mark Completed (if not completed) */}
                        {rep.status !== "Completed" && (
                          <button
                            className="hosp-lab-btn btn-mark-completed"
                            onClick={() => handleMarkCompleted(rep.id)}
                            title="Mark as Completed"
                          >
                            <FaCheck />
                            <span>Mark Completed</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="hosp-table-empty">
                    <FaFlask className="empty-icon" />
                    <h3>No matching lab reports found</h3>
                    <p>Try modifying your search criteria or selecting a different status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: VIEW REPORT ── */}
      {viewModalReport && (
        <div className="hosp-modal-overlay" onClick={() => setViewModalReport(null)}>
          <div className="hosp-modal hosp-lab-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaFileMedical className="modal-header-icon" />
                <div>
                  <h2>Diagnostic Laboratory Report</h2>
                  <span className="modal-ref-id">{viewModalReport.id}</span>
                </div>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setViewModalReport(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="lab-view-modal-body">
              {/* Status Header Strip */}
              <div className="report-header-strip">
                <div className="strip-left">
                  <span className="strip-test-name">{viewModalReport.testName}</span>
                  <span className="strip-category">{viewModalReport.category} &bull; Sample: {viewModalReport.sampleType}</span>
                </div>
                <div className="strip-right">
                  <span className={getStatusBadge(viewModalReport.status)}>
                    {viewModalReport.status}
                  </span>
                  {viewModalReport.isAbnormal && (
                    <span className="badge-abnormal-alert">
                      <FaExclamationTriangle /> Abnormal Findings
                    </span>
                  )}
                </div>
              </div>

              {/* Patient & Doctor Two-Column Block */}
              <div className="report-meta-grid">
                {/* Patient Details */}
                <div className="meta-box patient-meta-box">
                  <span className="meta-box-title">Patient Details</span>
                  <div className="meta-info-row">
                    <span className="label">Name:</span>
                    <span className="value font-bold">{viewModalReport.patientName}</span>
                  </div>
                  <div className="meta-info-row">
                    <span className="label">Patient ID:</span>
                    <span className="hosp-pat-id">{viewModalReport.patientId}</span>
                  </div>
                  <div className="meta-info-row">
                    <span className="label">Demographics:</span>
                    <span className="value">{viewModalReport.patientGender}, {viewModalReport.patientAge} years</span>
                  </div>
                </div>

                {/* Doctor & Order Details */}
                <div className="meta-box doctor-meta-box">
                  <span className="meta-box-title">Requisition Details</span>
                  <div className="meta-info-row">
                    <span className="label">Ordered By:</span>
                    <span className="value font-bold">{viewModalReport.doctorName}</span>
                  </div>
                  <div className="meta-info-row">
                    <span className="label">Department:</span>
                    <span className="value">{viewModalReport.doctorSpecialty}</span>
                  </div>
                  <div className="meta-info-row">
                    <span className="label">Test Date:</span>
                    <span className="value">{viewModalReport.testDate}</span>
                  </div>
                </div>
              </div>

              {/* Parameter Findings & Reference Ranges Table */}
              <div className="report-parameters-section">
                <h4 className="section-heading">Diagnostic Results &amp; Reference Ranges</h4>
                <div className="results-table-wrapper">
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Observed Result</th>
                        <th>Unit</th>
                        <th>Normal Reference Range</th>
                        <th>Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewModalReport.results && viewModalReport.results.length > 0 ? (
                        viewModalReport.results.map((param, idx) => (
                          <tr
                            key={idx}
                            className={
                              param.status === "High" || param.status === "Low"
                                ? "param-row--abnormal"
                                : "param-row--normal"
                            }
                          >
                            <td className="font-bold">{param.parameter}</td>
                            <td className="param-value font-bold">
                              {param.value}
                            </td>
                            <td className="text-muted">{param.unit}</td>
                            <td className="text-muted">{param.referenceRange}</td>
                            <td>
                              <span
                                className={`param-status-pill param-status--${param.status.toLowerCase()}`}
                              >
                                {param.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">
                            No parameter results recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pathologist Remarks */}
              <div className="report-remarks-section">
                <h4 className="section-heading">Clinical Remarks &amp; Interpretation</h4>
                <div className="remarks-box">
                  <p>{viewModalReport.remarks || "No clinical remarks added for this test requisition."}</p>
                </div>
              </div>

              {/* Medical Records Association Indicator */}
              {viewModalReport.status === "Completed" && (
                <div className="medical-record-sync-badge">
                  <FaLink className="sync-icon" />
                  <div>
                    <span className="sync-title">Associated with Patient Medical Records</span>
                    <p className="sync-desc">
                      This completed lab report is permanently linked to {viewModalReport.patientName}'s clinical chart under Medical Records.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="hosp-modal-actions">
              <button
                type="button"
                className="btn-modal-update"
                onClick={() => {
                  const rep = viewModalReport;
                  setViewModalReport(null);
                  handleOpenUpdateModal(rep);
                }}
              >
                <FaUpload />
                <span>Update Report</span>
              </button>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setViewModalReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD / UPDATE REPORT ── */}
      {updateModalReport && (
        <div className="hosp-modal-overlay" onClick={() => setUpdateModalReport(null)}>
          <div className="hosp-modal hosp-lab-update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUpload className="modal-header-icon" />
                <h2>Update Lab Report &mdash; {updateModalReport.id}</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setUpdateModalReport(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveReportUpdate} className="hosp-modal-form">
              {/* Test Info Header */}
              <div className="update-info-strip">
                <div>
                  <span className="info-patient-name font-bold">{updateModalReport.patientName}</span>
                  <span className="info-patient-id hosp-pat-id">{updateModalReport.patientId}</span>
                </div>
                <span className="info-test-title">{updateModalReport.testName}</span>
              </div>

              {/* Status Selector */}
              <div className="form-group">
                <label>Report Status *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  required
                >
                  <option value="Requested">Requested</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed (Syncs to Medical Records)</option>
                </select>
              </div>

              {/* Parameter Values Editor */}
              <div className="form-group">
                <label>Test Parameters &amp; Observed Results</label>
                <div className="param-editor-list">
                  {editResults.map((param, index) => (
                    <div key={index} className="param-edit-row">
                      <div className="param-name-field">
                        <span className="param-title">{param.parameter}</span>
                        <span className="param-ref text-muted">Ref: {param.referenceRange}</span>
                      </div>
                      <div className="param-val-field">
                        <input
                          type="text"
                          placeholder="Value"
                          value={param.value}
                          onChange={(e) => {
                            const newVals = [...editResults];
                            newVals[index].value = e.target.value;
                            setEditResults(newVals);
                          }}
                        />
                        <span className="param-unit">{param.unit}</span>
                      </div>
                      <div className="param-status-field">
                        <select
                          value={param.status}
                          onChange={(e) => {
                            const newVals = [...editResults];
                            newVals[index].status = e.target.value;
                            setEditResults(newVals);
                          }}
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abnormal Flag Toggle */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editIsAbnormal}
                    onChange={(e) => setEditIsAbnormal(e.target.checked)}
                  />
                  <span>Flag as Abnormal / Out of Reference Range</span>
                </label>
              </div>

              {/* Remarks */}
              <div className="form-group">
                <label>Pathologist Remarks &amp; Clinical Notes</label>
                <textarea
                  className="hosp-modal-textarea"
                  rows="3"
                  placeholder="Enter interpretation, diagnostic impressions, and clinical remarks..."
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                />
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setUpdateModalReport(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaCheckCircle />
                  <span>Save Report Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ORDER NEW LAB TEST ── */}
      {showNewTestModal && (
        <div className="hosp-modal-overlay" onClick={() => setShowNewTestModal(false)}>
          <div className="hosp-modal hosp-lab-new-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaPlus className="modal-header-icon" />
                <h2>Order Laboratory Test</h2>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setShowNewTestModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateNewTest} className="hosp-modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    placeholder="e.g. PAT-4091"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Ordering Physician</label>
                  <select
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                  >
                    <option value="Dr. Ayisha Shalba">Dr. Ayisha Shalba (Cardiology)</option>
                    <option value="Dr. Rajesh K. Nair">Dr. Rajesh K. Nair (Neurology)</option>
                    <option value="Dr. Priya Thomas">Dr. Priya Thomas (Pediatrics)</option>
                    <option value="Dr. Susan George">Dr. Susan George (Orthopedics)</option>
                    <option value="Dr. Amit Varma">Dr. Amit Varma (General Medicine)</option>
                    <option value="Dr. Vikram Shekar">Dr. Vikram Shekar (Dermatology)</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Test Name</label>
                  <select
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                  >
                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                    <option value="Cardiac Troponin & Lipid Panel">Cardiac Troponin &amp; Lipid Panel</option>
                    <option value="Comprehensive Thyroid Profile">Comprehensive Thyroid Profile</option>
                    <option value="Renal Function & Electrolytes (RFT)">Renal Function &amp; Electrolytes (RFT)</option>
                    <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                    <option value="HbA1c & Fasting Plasma Glucose">HbA1c &amp; Fasting Plasma Glucose</option>
                    <option value="Serum IgE & Allergy Screening">Serum IgE &amp; Allergy Screening</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Diagnostic Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Sample / Specimen Type</label>
                  <select
                    value={newSampleType}
                    onChange={(e) => setNewSampleType(e.target.value)}
                  >
                    <option value="Venous Blood">Venous Blood</option>
                    <option value="Serum">Serum</option>
                    <option value="Whole Blood (EDTA)">Whole Blood (EDTA)</option>
                    <option value="Urine Specimen">Urine Specimen</option>
                    <option value="Plasma">Plasma</option>
                  </select>
                </div>
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowNewTestModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaPlus />
                  <span>Submit Lab Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabReports;
