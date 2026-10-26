import React, { useEffect, useMemo, useState } from "react";

import {
  FaChartBar,
  FaFileDownload,
  FaTimes,
  FaShieldAlt,
  FaPills,
  FaCalendarCheck,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";

import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import { toast } from "react-toastify";

import "./AdminPages.css";

const REPORTS_API = "http://localhost:5000/api/admin/reports";
const MEDICINES_API = "http://localhost:5000/api/admin/medicines";

export default function AdminReports() {
  const [medicines, setMedicines] = useState([]);
  const [reportData, setReportData] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [reportDomain, setReportDomain] = useState("DrugSafety");
  const [reportFormat, setReportFormat] = useState("PDF");

  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // =========================================================
  // FETCH REPORT DATA
  // =========================================================

  const fetchReports = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Admin authentication token not found.");
        return;
      }

      const [reportsResponse, medicinesResponse] = await Promise.all([
        fetch(REPORTS_API, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),

        fetch(MEDICINES_API, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const reportsJson = await reportsResponse.json();
      const medicinesJson = await medicinesResponse.json();

      if (!reportsResponse.ok || reportsJson.success === false) {
        throw new Error(
          reportsJson.message || "Failed to fetch platform reports."
        );
      }

      if (!medicinesResponse.ok || medicinesJson.success === false) {
        throw new Error(
          medicinesJson.message || "Failed to fetch medicine reports."
        );
      }

      setReportData(reportsJson.data || {});

      // Admin medicine controller uses sendSuccess(),
      // so medicine records are inside data.
      const medicineList = Array.isArray(medicinesJson.data)
        ? medicinesJson.data
        : medicinesJson.data?.medicines || [];

      setMedicines(medicineList);
    } catch (error) {
      console.error("Admin reports fetch error:", error);

      toast.error(error.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =========================================================
  // REAL ANALYTICS
  // =========================================================

  const analytics = reportData?.analytics || {};

  const totalAppointments = Number(
    analytics.totalAppointments || 0
  );

  const completedAppointments = Number(
    analytics.completedAppointments || 0
  );

  const cancelledAppointments = Number(
    analytics.cancelledAppointments || 0
  );

  const appointmentCompletionRate = Number(
    analytics.appointmentCompletionRate || 0
  );

  const totalOrders = Number(
    analytics.totalOrders || 0
  );

  const deliveredOrders = Number(
    analytics.deliveredOrders || 0
  );

  const totalSales = Number(
    analytics.totalSales || 0
  );

  // =========================================================
  // MEDICINE COUNTS
  // =========================================================

  const totalApproved = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.approvalStatus === "Approved"
      ).length,
    [medicines]
  );

  const totalBlocked = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.approvalStatus === "Blocked"
      ).length,
    [medicines]
  );

  const totalPending = useMemo(
    () =>
      medicines.filter(
        (medicine) =>
          medicine.approvalStatus === "Pending Review"
      ).length,
    [medicines]
  );

  // =========================================================
  // HELPERS
  // =========================================================

  const getMedicineId = (medicine) => {
    if (medicine?.medicineId) {
      return medicine.medicineId;
    }

    if (medicine?._id) {
      return `MED-${medicine._id
        .slice(-6)
        .toUpperCase()}`;
    }

    if (medicine?.id) {
      return medicine.id;
    }

    return "N/A";
  };

  const getMedicineName = (medicine) => {
    return (
      medicine?.name ||
      medicine?.medicineName ||
      "Unnamed Medicine"
    );
  };

  const getGenericName = (medicine) => {
    return (
      medicine?.genericName ||
      medicine?.generic ||
      "Generic name not provided"
    );
  };

  const getManufacturer = (medicine) => {
    return medicine?.manufacturer || "N/A";
  };

  const getSubmittingPharmacy = (medicine) => {
    if (typeof medicine?.submittingPharmacy === "string") {
      return medicine.submittingPharmacy;
    }

    return (
      medicine?.pharmacyId?.name ||
      medicine?.pharmacy?.name ||
      "N/A"
    );
  };

  const getLabStatus = (medicine) => {
    return (
      medicine?.labVerificationStatus ||
      "Standard Review"
    );
  };

  const getApprovalStatus = (medicine) => {
    return (
      medicine?.approvalStatus ||
      "Pending Review"
    );
  };

  const getExpiryDate = (medicine) => {
    if (!medicine?.expiryDate) {
      return "N/A";
    }

    const date = new Date(medicine.expiryDate);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getStatusStyle = (status) => {
    if (status === "Approved") {
      return {
        background: "#dcfce7",
        color: "#16a34a",
      };
    }

    if (status === "Blocked") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };
    }

    if (status === "Rejected") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };
    }

    return {
      background: "#fef3c7",
      color: "#d97706",
    };
  };

  // =========================================================
  // CSV EXPORT
  // =========================================================

  const downloadCSV = (
    columns,
    data,
    filename
  ) => {
    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      toast.warning(
        "No data available for this report."
      );
      return;
    }

    const escapeCSV = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      const stringValue = String(value).replace(
        /"/g,
        '""'
      );

      return `"${stringValue}"`;
    };

    const headerRow = columns
      .map((column) =>
        escapeCSV(column.header)
      )
      .join(",");

    const dataRows = data.map((row) =>
      columns
        .map((column) =>
          escapeCSV(row[column.dataKey])
        )
        .join(",")
    );

    const csvContent = [
      headerRow,
      ...dataRows,
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // PREPARE DRUG REPORT
  // =========================================================

  const getDrugReportData = () => {
    return medicines.map((medicine) => ({
      id: getMedicineId(medicine),

      name: getMedicineName(medicine),

      manufacturer:
        getManufacturer(medicine),

      batchNumber:
        medicine?.batchNumber || "N/A",

      submittingPharmacy:
        getSubmittingPharmacy(medicine),

      expiryDate:
        getExpiryDate(medicine),

      approvalStatus:
        getApprovalStatus(medicine),
    }));
  };

  // =========================================================
  // APPOINTMENT REPORT
  // =========================================================

  // Current Admin Reports API provides
  // appointment analytics only, not individual
  // appointment records.
  //
  // Do NOT fabricate appointment rows.

  const getAppointmentReportData = () => {
    return [];
  };

  // =========================================================
  // PROVIDER REPORT
  // =========================================================

  // Current Admin Reports API does not provide
  // provider registry rows.
  //
  // Do NOT reuse medicine records as provider data.

  const getProviderReportData = () => {
    return [];
  };

  // =========================================================
  // EXPORT
  // =========================================================

  const handleExport = async (event) => {
    event.preventDefault();

    try {
      setExportLoading(true);

      // =====================================================
      // DRUG SAFETY EXPORT
      // =====================================================

      if (reportDomain === "DrugSafety") {
        const data =
          getDrugReportData();

        if (data.length === 0) {
          toast.warning(
            "No medicine records available for export."
          );
          return;
        }

        const columns = [
          {
            header: "Drug ID",
            dataKey: "id",
          },

          {
            header: "Medicine Name",
            dataKey: "name",
          },

          {
            header: "Manufacturer",
            dataKey: "manufacturer",
          },

          {
            header: "Batch No",
            dataKey: "batchNumber",
          },

          {
            header: "Submitting Pharmacy",
            dataKey: "submittingPharmacy",
          },

          {
            header: "Expiry Date",
            dataKey: "expiryDate",
          },

          {
            header: "Approval Status",
            dataKey: "approvalStatus",
          },
        ];

        // CSV
        if (reportFormat === "CSV") {
          downloadCSV(
            columns,
            data,
            `drug-safety-report-${new Date()
              .toISOString()
              .slice(0, 10)}.csv`
          );
        }

        // PDF
        else {
          generateBloodGroupReport({
            title:
              "Administrative Drug Safety & Regulatory Compliance Report",

            selectedBloodGroup:
              "N/A (Regulatory Platform Audit)",

            generatedBy:
              "System Super Administrator",

            columns,

            data,

            activeFilters: {
              ReportDomain:
                reportDomain,

              Timestamp:
                new Date().toLocaleDateString(),
            },
          });
        }

        toast.success(
          `Successfully generated & exported ${reportDomain} audit report (${reportFormat}).`
        );

        setShowExportModal(false);
      }

      // =====================================================
      // APPOINTMENT EXPORT
      // =====================================================

      else if (
        reportDomain === "Appointments"
      ) {
        const data =
          getAppointmentReportData();

        if (data.length === 0) {
          toast.info(
            "Appointment analytics are available, but detailed appointment rows are not currently provided by the Admin Reports API."
          );
          return;
        }
      }

      // =====================================================
      // PROVIDER EXPORT
      // =====================================================

      else if (
        reportDomain === "Providers"
      ) {
        const data =
          getProviderReportData();

        if (data.length === 0) {
          toast.info(
            "Provider analytics are not currently available as registry rows from the Admin Reports API."
          );
          return;
        }
      }
    } catch (error) {
      console.error(
        "Report export error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to generate report."
      );
    } finally {
      setExportLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="ad-page">
        <div
          className="ad-card"
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <FaChartBar
            style={{
              fontSize: "2rem",
              color:
                "var(--ad-primary)",
            }}
          />

          <strong>
            Loading platform reports...
          </strong>

          <span
            style={{
              color:
                "var(--ad-text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Fetching real-time
            administrative data
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="ad-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaChartBar
            style={{
              color:
                "var(--ad-primary)",
            }}
          />

          Platform Reports & Regulatory Audits
        </h2>

        <p>
          Analyze platform-level regulatory
          metrics, drug safety verifications,
          telehealth activity, orders, revenue,
          and export structured compliance audit
          documents.
        </p>
      </div>

      {/* =====================================================
          KPI ROW
      ====================================================== */}

      <div className="ad-kpi-grid">

        {/* Drug compliance */}

        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <FaShieldAlt />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Drug Regulatory Compliance
            </span>

            <h3 className="ad-kpi-value">
              {totalApproved} /{" "}
              {medicines.length}
            </h3>

            <span className="ad-kpi-delta up">
              {totalBlocked} Flagged/Banned
            </span>
          </div>
        </div>

        {/* Pending */}

        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0e7ff",
              color: "#4f46e5",
            }}
          >
            <FaPills />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Pending Verification Queue
            </span>

            <h3 className="ad-kpi-value">
              {totalPending} Submissions
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#d97706",
                fontWeight: "600",
              }}
            >
              Quality Checks Pending
            </span>
          </div>
        </div>

        {/* Appointments */}

        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <FaCalendarCheck />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Verified Consultations
            </span>

            <h3 className="ad-kpi-value">
              {completedAppointments} Sessions
            </h3>

            <span className="ad-kpi-delta up">
              {appointmentCompletionRate}%
              Completion Rate
            </span>
          </div>
        </div>

        {/* Export */}

        <div
          className="ad-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <button
            className="ad-btn ad-btn-primary"
            onClick={() =>
              setShowExportModal(true)
            }
            style={{
              width: "100%",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <FaFileDownload />

            Export Regulatory Audit Report
          </button>
        </div>
      </div>

      {/* =====================================================
          PLATFORM ANALYTICS
      ====================================================== */}

      <div className="ad-grid-3">

        {/* Appointment analytics */}

        <div
          className="ad-card"
          style={{
            gridColumn: "span 2",
          }}
        >
          <div className="ad-card-header">
            <h3 className="ad-card-title">
              Platform Appointment Analytics
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                background:
                  "var(--ad-bg-secondary)",
                padding:
                  "0.25rem 0.5rem",
                borderRadius: "4px",
                fontWeight: "600",
              }}
            >
              Live API Data
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              padding: "1rem 0",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                }}
              >
                Total Appointments
              </span>

              <strong
                style={{
                  fontSize: "1.5rem",
                }}
              >
                {totalAppointments}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                }}
              >
                Completed
              </span>

              <strong
                style={{
                  fontSize: "1.5rem",
                  color: "#16a34a",
                }}
              >
                {completedAppointments}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                }}
              >
                Cancelled
              </span>

              <strong
                style={{
                  fontSize: "1.5rem",
                  color: "#dc2626",
                }}
              >
                {cancelledAppointments}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.76rem",
                  color: "#0284c7",
                }}
              >
                Completion Rate
              </span>

              <strong
                style={{
                  fontSize: "1.5rem",
                  color: "#0284c7",
                }}
              >
                {appointmentCompletionRate}%
              </strong>
            </div>
          </div>
        </div>

        {/* Supervision indicators */}

        <div className="ad-card">
          <div className="ad-card-header">
            <h3 className="ad-card-title">
              Supervision Indicators
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                  display: "block",
                }}
              >
                Total Orders
              </span>

              <strong
                style={{
                  fontSize: "1.25rem",
                  color: "#4f46e5",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaShoppingCart />

                {totalOrders}
              </strong>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                  display: "block",
                }}
              >
                Delivered Orders
              </span>

              <strong
                style={{
                  fontSize: "1.25rem",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaCalendarCheck />

                {deliveredOrders}
              </strong>
            </div>

            <div>
              <span
                style={{
                  fontSize: "0.76rem",
                  color:
                    "var(--ad-text-muted)",
                  display: "block",
                }}
              >
                Platform Sales
              </span>

              <strong
                style={{
                  fontSize: "1.25rem",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaMoneyBillWave />

                {formatCurrency(totalSales)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DRUG TABLE
      ====================================================== */}

      <div className="ad-card">
        <div className="ad-card-header">
          <h3 className="ad-card-title">
            Recent Drug Compliance & Verification
            Audits
          </h3>

          <span
            style={{
              fontSize: "0.75rem",
              color:
                "var(--ad-text-muted)",
            }}
          >
            {medicines.length} records
          </span>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Drug Code</th>

                <th>
                  Medicine Name & Generic
                </th>

                <th>Manufacturer</th>

                <th>
                  Submitting Pharmacy
                </th>

                <th>
                  Lab Assay Status
                </th>

                <th>
                  Regulatory Decision
                </th>
              </tr>
            </thead>

            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    No medicine compliance
                    records found.
                  </td>
                </tr>
              ) : (
                medicines.map((medicine) => {
                  const status =
                    getApprovalStatus(
                      medicine
                    );

                  return (
                    <tr
                      key={
                        medicine._id ||
                        medicine.id ||
                        getMedicineId(
                          medicine
                        )
                      }
                    >
                      <td>
                        <span className="ad-id-badge">
                          {getMedicineId(
                            medicine
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {getMedicineName(
                            medicine
                          )}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            fontSize: "0.72rem",
                            color:
                              "var(--ad-text-muted)",
                          }}
                        >
                          {getGenericName(
                            medicine
                          )}
                        </span>
                      </td>

                      <td>
                        {getManufacturer(
                          medicine
                        )}
                      </td>

                      <td>
                        {getSubmittingPharmacy(
                          medicine
                        )}
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color:
                              status ===
                                "Blocked"
                                ? "#dc2626"
                                : "var(--ad-text-primary)",
                          }}
                        >
                          {getLabStatus(
                            medicine
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className="ad-pill"
                          style={getStatusStyle(
                            status
                          )}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          EXPORT MODAL
      ====================================================== */}

      {showExportModal && (
        <div
          className="ad-modal-overlay"
          onClick={() =>
            !exportLoading &&
            setShowExportModal(false)
          }
        >
          <div
            className="ad-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              maxWidth: "500px",
            }}
          >
            <div className="ad-modal-header">
              <h3 className="ad-modal-title">
                <FaFileDownload />

                Export Regulatory Audit
                Report
              </h3>

              <button
                className="ad-modal-close"
                onClick={() =>
                  !exportLoading &&
                  setShowExportModal(false)
                }
                disabled={exportLoading}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleExport}
              className="ad-modal-body"
            >
              {/* Domain */}

              <div className="ad-form-group">
                <label>
                  Select Audit Domain *
                </label>

                <select
                  className="ad-select"
                  value={reportDomain}
                  onChange={(event) =>
                    setReportDomain(
                      event.target.value
                    )
                  }
                  disabled={exportLoading}
                >
                  <option value="DrugSafety">
                    Drug Safety & Batch
                    Verification Audit
                  </option>

                  <option value="Appointments">
                    Clinical Telehealth &
                    Appointments Audit
                  </option>

                  <option value="Providers">
                    Healthcare Provider
                    Verification Registry
                  </option>
                </select>
              </div>

              {/* Format */}

              <div className="ad-form-group">
                <label>
                  Export Format
                </label>

                <select
                  className="ad-select"
                  value={reportFormat}
                  onChange={(event) =>
                    setReportFormat(
                      event.target.value
                    )
                  }
                  disabled={exportLoading}
                >
                  <option value="PDF">
                    Formatted Regulatory
                    Document (PDF)
                  </option>

                  <option value="CSV">
                    Spreadsheet Dataset
                    (CSV)
                  </option>
                </select>
              </div>

              {/* Appointment info */}

              {reportDomain ===
                "Appointments" && (
                  <div
                    style={{
                      padding: "0.75rem",
                      marginTop: "1rem",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    Appointment analytics are
                    available from the API, but
                    detailed appointment rows are
                    not currently returned by the
                    backend report endpoint.
                  </div>
                )}

              {/* Provider info */}

              {reportDomain ===
                "Providers" && (
                  <div
                    style={{
                      padding: "0.75rem",
                      marginTop: "1rem",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    Provider registry rows are not
                    currently returned by the
                    backend report endpoint.
                    No fake provider data is
                    generated.
                  </div>
                )}

              {/* Footer */}

              <div
                className="ad-modal-footer"
                style={{
                  marginTop: "1.5rem",
                }}
              >
                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() =>
                    setShowExportModal(false)
                  }
                  disabled={exportLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                  disabled={exportLoading}
                >
                  <FaFileDownload />

                  {exportLoading
                    ? "Generating Report..."
                    : "Download Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}