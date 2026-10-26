import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { toast } from "react-toastify";
import "./LabReports.css";

const API_BASE = "http://localhost:5000/api";
const STATUS_FILTERS = ["All", "Requested", "Sample Collected", "Processing", "Completed", "Abnormal"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

/** Normalise a raw LabReport document from the backend into the shape the UI expects. */
const normaliseReport = (r) => {
  const patient = r.patientId || {};
  const doctor = r.doctorId || {};

  // Compute patient age from dob if available
  let patientAge = "—";
  if (patient.dob) {
    const diff = Date.now() - new Date(patient.dob).getTime();
    patientAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  return {
    _id: r._id,
    id: r.reportId || r._id,
    patientName: patient.name || "—",
    patientId: patient.patientId || "—",
    patientAge,
    patientGender: patient.gender || "—",
    doctorName: doctor.name ? `Dr. ${doctor.name}`.replace(/^Dr\. Dr\./, "Dr.") : "—",
    doctorSpecialty: doctor.specialization || doctor.department || "—",
    testName: r.testName || "—",
    category: r.category || "—",
    testDate: r.reportDate ? new Date(r.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—",
    sampleCollectedDate: r.sampleCollectedDate
      ? new Date(r.sampleCollectedDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      : "—",
    status: r.status || "Requested",
    sampleType: r.sampleType || "—",
    isAbnormal: r.isAbnormal || false,
    associatedWithMedicalRecord: r.associatedWithMedicalRecord || false,
    remarks: r.remarks || r.notes || "",
    results: Array.isArray(r.results) ? r.results : [],
  };
};

function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Patient & Doctor dropdown data for Order modal
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Modals
  const [viewModalReport, setViewModalReport] = useState(null);
  const [updateModalReport, setUpdateModalReport] = useState(null);
  const [showNewTestModal, setShowNewTestModal] = useState(false);

  // Update Form State
  const [editStatus, setEditStatus] = useState("Requested");
  const [editRemarks, setEditRemarks] = useState("");
  const [editResults, setEditResults] = useState([]);
  const [editIsAbnormal, setEditIsAbnormal] = useState(false);

  // New Test Order State
  const [newPatientId, setNewPatientId] = useState("");
  const [newDoctorId, setNewDoctorId] = useState("");
  const [newTestName, setNewTestName] = useState("Complete Blood Count (CBC)");
  const [newCategory, setNewCategory] = useState("Hematology");
  const [newSampleType, setNewSampleType] = useState("Venous Blood");

  // ─── Fetch all lab reports for this hospital ──────────────────────────────

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/hospital/lab-reports`, {
        headers: authHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const data = await res.json();
      if (data.success) {
        setReports((data.data || []).map(normaliseReport));
      } else {
        toast.error(data.message || "Failed to load lab reports.");
      }
    } catch (err) {
      console.error("Fetch lab reports error:", err);
      toast.error("Network error: Could not load lab reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ─── Load patient & doctor lists when Order modal opens ──────────────────

  const fetchDropdowns = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/hospital/patients`, { headers: authHeaders() }),
        fetch(`${API_BASE}/hospital/doctors`, { headers: authHeaders() }),
      ]);

      const pData = await pRes.json();
      const dData = await dRes.json();

      if (pData.success) setPatients(pData.data || []);
      else toast.warning("Could not load patient list.");

      if (dData.success) setDoctors(dData.data || []);
      else toast.warning("Could not load doctor list.");
    } catch {
      toast.warning("Could not load patient/doctor lists.");
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    if (showNewTestModal) {
      fetchDropdowns();
      // Reset form
      setNewPatientId("");
      setNewDoctorId("");
      setNewTestName("Complete Blood Count (CBC)");
      setNewCategory("Hematology");
      setNewSampleType("Venous Blood");
    }
  }, [showNewTestModal, fetchDropdowns]);

  // ─── Metric computations (from backend data) ─────────────────────────────

  const totalTests = reports.length;
  const pendingReports = reports.filter((r) => r.status !== "Completed").length;
  const completedReports = reports.filter((r) => r.status === "Completed").length;
  const abnormalReports = reports.filter((r) => r.isAbnormal).length;

  // ─── Filtered reports ─────────────────────────────────────────────────────

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

  // ─── Handler: Open Update/Upload Modal ───────────────────────────────────

  const handleOpenUpdateModal = (report) => {
    setUpdateModalReport(report);
    setEditStatus(report.status);
    setEditRemarks(report.remarks || "");
    setEditIsAbnormal(report.isAbnormal || false);
    setEditResults(report.results.map((res) => ({ ...res })));
  };

  // ─── Handler: Save Update Report → PUT /api/hospital/lab-reports/:id ─────

  const handleSaveReportUpdate = async (e) => {
    e.preventDefault();
    if (!updateModalReport) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/hospital/lab-reports/${updateModalReport._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          status: editStatus,
          remarks: editRemarks,
          isAbnormal: editIsAbnormal,
          results: editResults,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please log in again.");
        return;
      }
      if (res.status === 404) {
        toast.error("Lab report not found.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        await fetchReports();
        setUpdateModalReport(null);
        if (viewModalReport && viewModalReport._id === updateModalReport._id) {
          setViewModalReport(null);
        }
        toast.success(`Report ${updateModalReport.id} updated successfully.`);
      } else {
        toast.error(data.message || "Failed to update report.");
      }
    } catch (err) {
      console.error("Update lab report error:", err);
      toast.error("Network error: Failed to update report.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Handler: Mark Completed → PUT /api/hospital/lab-reports/:id/complete ─

  const handleMarkCompleted = async (report) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/hospital/lab-reports/${report._id}/complete`, {
        method: "PUT",
        headers: authHeaders(),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please log in again.");
        return;
      }
      if (res.status === 404) {
        toast.error("Lab report not found.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        await fetchReports();
        toast.success(`Report ${report.id} marked as Completed & linked to Medical Records.`);
      } else {
        toast.error(data.message || "Failed to mark report completed.");
      }
    } catch (err) {
      console.error("Complete lab report error:", err);
      toast.error("Network error: Failed to mark report completed.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Handler: Order New Diagnostic Test → POST /api/hospital/lab-reports ──

  const handleCreateNewTest = async (e) => {
    e.preventDefault();

    if (!newPatientId) {
      toast.warning("Please select a patient.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        patientId: newPatientId,
        doctorId: newDoctorId || null,
        testName: newTestName,
        category: newCategory,
        sampleType: newSampleType,
      };

      const res = await fetch(`${API_BASE}/hospital/lab-reports`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please log in again.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        await fetchReports();
        setShowNewTestModal(false);
        const createdId = data.data?.reportId || data.data?._id;
        const patObj = patients.find((p) => p._id === newPatientId);
        toast.success(`Lab order ${createdId} created for ${patObj?.name || "patient"}.`);
      } else {
        // Handle validation errors array
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => toast.error(err));
        } else {
          toast.error(data.message || "Failed to create lab order.");
        }
      }
    } catch (err) {
      console.error("Create lab order error:", err);
      toast.error("Network error: Failed to create lab order.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Status Badge Class Helper ────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="hosp-labs-page">
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
          <div className="stat-value">{loading ? "—" : totalTests}</div>
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
          <div className="stat-value text-amber">{loading ? "—" : pendingReports}</div>
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
          <div className="stat-value text-success">{loading ? "—" : completedReports}</div>
          <div className="stat-meta">
            <span className="meta-badge meta-badge--success">
              {totalTests > 0 ? Math.round((completedReports / totalTests) * 100) : 0}% Verified
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
          <div className="stat-value text-danger">{loading ? "—" : abnormalReports}</div>
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
                <span className="tab-count-badge">{loading ? "—" : count}</span>
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
              {loading ? (
                <tr>
                  <td colSpan="8" className="hosp-table-empty">
                    <FaFlask className="empty-icon" />
                    <h3>Loading lab reports…</h3>
                    <p>Fetching data from the database.</p>
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((rep) => (
                  <tr key={rep._id} className="lab-table-row">
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
                          disabled={saving}
                        >
                          <FaUpload />
                          <span>Update</span>
                        </button>

                        {/* Mark Completed (if not completed) */}
                        {rep.status !== "Completed" && (
                          <button
                            className="hosp-lab-btn btn-mark-completed"
                            onClick={() => handleMarkCompleted(rep)}
                            title="Mark as Completed"
                            disabled={saving}
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
                    <span className="value">
                      {viewModalReport.patientGender !== "—" ? viewModalReport.patientGender : "Not recorded"}
                      {viewModalReport.patientAge !== "—" ? `, ${viewModalReport.patientAge} years` : ""}
                    </span>
                  </div>
                </div>

                {/* Doctor & Order Details */}
                <div className="meta-box doctor-meta-box">
                  <span className="meta-box-title">Requisition Details</span>
                  <div className="meta-info-row">
                    <span className="label">Ordered By:</span>
                    <span className="value font-bold">
                      {viewModalReport.doctorName !== "—" ? viewModalReport.doctorName : "Not recorded"}
                    </span>
                  </div>
                  <div className="meta-info-row">
                    <span className="label">Department:</span>
                    <span className="value">
                      {viewModalReport.doctorSpecialty !== "—" ? viewModalReport.doctorSpecialty : "Not recorded"}
                    </span>
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
                            <td className="font-bold">{param.parameter || "—"}</td>
                            <td className="param-value font-bold">
                              {param.value || "—"}
                            </td>
                            <td className="text-muted">{param.unit || "—"}</td>
                            <td className="text-muted">{param.referenceRange || "—"}</td>
                            <td>
                              <span
                                className={`param-status-pill param-status--${(param.status || "normal").toLowerCase()}`}
                              >
                                {param.status || "—"}
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
                      {viewModalReport.associatedWithMedicalRecord
                        ? `This completed lab report is permanently linked to ${viewModalReport.patientName}'s clinical chart under Medical Records.`
                        : "This report is completed. Medical record association status: not recorded."}
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
                  {editResults.length > 0 ? (
                    editResults.map((param, index) => (
                      <div key={index} className="param-edit-row">
                        <div className="param-name-field">
                          <span className="param-title">{param.parameter}</span>
                          <span className="param-ref text-muted">Ref: {param.referenceRange || "—"}</span>
                        </div>
                        <div className="param-val-field">
                          <input
                            type="text"
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) => {
                              const newVals = [...editResults];
                              newVals[index] = { ...newVals[index], value: e.target.value };
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
                              newVals[index] = { ...newVals[index], status: e.target.value };
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
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: "0.85rem", padding: "0.5rem 0" }}>
                      No result parameters on this report yet.
                    </p>
                  )}
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
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit" disabled={saving}>
                  <FaCheckCircle />
                  <span>{saving ? "Saving…" : "Save Report Changes"}</span>
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
                {/* Patient selector */}
                <div className="form-group half">
                  <label>Patient Full Name *</label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    required
                    disabled={loadingDropdowns}
                  >
                    <option value="">
                      {loadingDropdowns ? "Loading patients…" : "— Select Patient —"}
                    </option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.patientId ? `(${p.patientId})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient ID display (read-only, derived from selection) */}
                <div className="form-group half">
                  <label>Patient ID</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      newPatientId
                        ? patients.find((p) => p._id === newPatientId)?.patientId || "—"
                        : ""
                    }
                    placeholder="Auto-filled on patient selection"
                    style={{ backgroundColor: "var(--bg-secondary, #f9f9f9)", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              <div className="form-row">
                {/* Doctor selector */}
                <div className="form-group half">
                  <label>Ordering Physician</label>
                  <select
                    value={newDoctorId}
                    onChange={(e) => setNewDoctorId(e.target.value)}
                    disabled={loadingDropdowns}
                  >
                    <option value="">
                      {loadingDropdowns ? "Loading doctors…" : "— Select Doctor (optional) —"}
                    </option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        Dr. {d.name} ({d.specialization || d.department || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Name */}
                <div className="form-group half">
                  <label>Test Name</label>
                  <select
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                  >
                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                    <option value="Cardiac Troponin &amp; Lipid Panel">Cardiac Troponin &amp; Lipid Panel</option>
                    <option value="Comprehensive Thyroid Profile">Comprehensive Thyroid Profile</option>
                    <option value="Renal Function &amp; Electrolytes (RFT)">Renal Function &amp; Electrolytes (RFT)</option>
                    <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                    <option value="HbA1c &amp; Fasting Plasma Glucose">HbA1c &amp; Fasting Plasma Glucose</option>
                    <option value="Serum IgE &amp; Allergy Screening">Serum IgE &amp; Allergy Screening</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                {/* Category */}
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

                {/* Sample Type */}
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
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit" disabled={saving || loadingDropdowns}>
                  <FaPlus />
                  <span>{saving ? "Submitting…" : "Submit Lab Order"}</span>
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
