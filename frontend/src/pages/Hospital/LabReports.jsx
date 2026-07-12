import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaFlask,
  FaUpload,
  FaCheck,
  FaFilePdf,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import "./LabReports.css";

const initialReports = [
  {
    id: "LAB-9011",
    patientName: "Devanand S.",
    testName: "Cardiac Troponin Panel",
    doctorName: "Dr. Ayisha Shalba",
    date: "July 12, 2026",
    status: "Processing",
    urgency: "High",
  },
  {
    id: "LAB-9012",
    patientName: "Leela Mathews",
    testName: "Chest X-Ray / CT scan",
    doctorName: "Dr. Amit Varma",
    date: "July 12, 2026",
    status: "Awaiting Sample",
    urgency: "Medium",
  },
  {
    id: "LAB-9013",
    patientName: "John Wesley",
    testName: "HbA1c & Fasting Glucose",
    doctorName: "Dr. Susan George",
    date: "July 11, 2026",
    status: "Completed",
    urgency: "Routine",
  },
  {
    id: "LAB-9014",
    patientName: "Meera Pillai",
    testName: "Thyroid Profile (T3, T4, TSH)",
    doctorName: "Dr. Priya Thomas",
    date: "July 11, 2026",
    status: "Completed",
    urgency: "Routine",
  },
  {
    id: "LAB-9015",
    patientName: "Suresh Babu",
    testName: "Complete Blood Count (CBC)",
    doctorName: "Dr. Amit Varma",
    date: "July 10, 2026",
    status: "Completed",
    urgency: "Routine",
  },
];

function LabReports() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [remarks, setRemarks] = useState("");

  const filtered = useMemo(() => {
    return reports.filter((rep) => {
      const matchSearch =
        rep.patientName.toLowerCase().includes(search.toLowerCase()) ||
        rep.testName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || rep.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reports, search, statusFilter]);

  const handleOpenUpload = (id) => {
    setSelectedReportId(id);
    setShowUploadModal(true);
  };

  const handleUploadReport = (e) => {
    e.preventDefault();
    setReports(
      reports.map((rep) =>
        rep.id === selectedReportId ? { ...rep, status: "Completed" } : rep
      )
    );
    setShowUploadModal(false);
    setRemarks("");
  };

  return (
    <div className="hosp-labs-page">
      {/* Controls */}
      <div className="hosp-labs-controls">
        <div className="hosp-labs-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search lab orders by patient name or test..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-labs-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Awaiting Sample">Awaiting Sample</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="hosp-card hosp-labs-card">
        <div className="hosp-table-wrapper">
          <table className="hosp-table">
            <thead>
              <tr>
                <th>Lab ID</th>
                <th>Patient Name</th>
                <th>Test Ordered</th>
                <th>Prescribed By</th>
                <th>Order Date</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="hosp-table-empty">
                    <FaFlask className="empty-icon" />
                    <h3>No lab requests found</h3>
                    <p>Try refining your search filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <span className="hosp-lab-id-badge">{rep.id}</span>
                    </td>
                    <td>
                      <span className="hosp-lab-pat-name">{rep.patientName}</span>
                    </td>
                    <td>{rep.testName}</td>
                    <td>{rep.doctorName}</td>
                    <td>{rep.date}</td>
                    <td>
                      <span className={`hosp-urg-pill urg--${rep.urgency.toLowerCase()}`}>
                        {rep.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={`hosp-lab-status-badge status--${rep.status.toLowerCase().replace(" ", "-")}`}>
                        {rep.status}
                      </span>
                    </td>
                    <td>
                      {rep.status !== "Completed" ? (
                        <button
                          className="hosp-btn-upload"
                          onClick={() => handleOpenUpload(rep.id)}
                        >
                          <FaUpload /> Upload Results
                        </button>
                      ) : (
                        <button className="hosp-btn-view-pdf" title="View PDF Report">
                          <FaFilePdf /> View Report
                        </button>
                      )}
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Results Modal */}
      {showUploadModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>Upload Test Results</h2>
              <button className="hosp-modal-close" onClick={() => setShowUploadModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUploadReport} className="hosp-modal-form">
              <div className="form-group">
                <label>Select PDF / Scanned Report File</label>
                <input type="file" accept="application/pdf, image/*" required />
              </div>

              <div className="form-group">
                <label>Lab Technician Remarks (Optional)</label>
                <textarea
                  placeholder="Type any quick diagnostic notes or values..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  className="hosp-modal-textarea"
                />
              </div>

              <button type="submit" className="hosp-btn-submit">
                <FaCheckCircle /> Submit &amp; Release Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabReports;
