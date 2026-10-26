import React, { useEffect, useMemo, useState } from "react";

import {
  FaNotesMedical,
  FaSearch,
  FaFileMedical,
  FaUserMd,
  FaHospital,
  FaPills,
  FaFlask,
  FaEye,
  FaTimes,
  FaLock,
  FaCalendarAlt,
  FaUser,
  FaPaperclip,
} from "react-icons/fa";

import "./AdminPages.css";

const API_BASE_URL = "http://localhost:5000/api/medical-records";

const typeIcons = {
  Prescription: <FaPills style={{ color: "#16a34a" }} />,
  "Lab Report": <FaFlask style={{ color: "#0284c7" }} />,
  "Discharge Summary": <FaFileMedical style={{ color: "#d97706" }} />,
  Diagnosis: <FaNotesMedical style={{ color: "#4f46e5" }} />,
  General: <FaFileMedical style={{ color: "#64748b" }} />,
  Vaccination: <FaNotesMedical style={{ color: "#0891b2" }} />,
};

const recordTypes = [
  "All",
  "Prescription",
  "Lab Report",
  "Discharge Summary",
  "Diagnosis",
  "General",
  "Vaccination",
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRecordId = (record) => {
  if (!record?._id) return "—";

  return `MR-${String(record._id).slice(-6).toUpperCase()}`;
};

const getPatientName = (record) => {
  return (
    record?.patientId?.name ||
    record?.patientId?.fullName ||
    record?.patientId?.userId?.name ||
    record?.patientName ||
    "Unknown Patient"
  );
};

const getPatientId = (record) => {
  if (record?.patientId?._id) {
    return String(record.patientId._id).slice(-8).toUpperCase();
  }

  if (typeof record?.patientId === "string") {
    return record.patientId.slice(-8).toUpperCase();
  }

  return "—";
};

const getDoctorName = (record) => {
  return (
    record?.doctorName ||
    record?.doctorId?.name ||
    record?.doctorId?.userId?.name ||
    "Not Assigned"
  );
};

const getHospitalName = (record) => {
  return (
    record?.hospitalName ||
    record?.hospitalId?.name ||
    "Not Assigned"
  );
};

const getPatientBloodGroup = (record) => {
  return (
    record?.patientId?.bloodGroup ||
    record?.patientId?.userId?.bloodGroup ||
    "Not Provided"
  );
};

const getPatientGender = (record) => {
  return (
    record?.patientId?.gender ||
    record?.patientId?.userId?.gender ||
    "Not Provided"
  );
};

const getPatientAge = (record) => {
  const dob =
    record?.patientId?.dob ||
    record?.patientId?.userId?.dob;

  if (!dob) return null;

  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
};

const getDoctorSpecialization = (record) => {
  return (
    record?.doctorId?.specialization ||
    "Medical Professional"
  );
};

const getDoctorPhone = (record) => {
  return (
    record?.doctorId?.phone ||
    record?.doctorId?.userId?.phone ||
    ""
  );
};

const getDoctorEmail = (record) => {
  return (
    record?.doctorId?.email ||
    record?.doctorId?.userId?.email ||
    ""
  );
};

const getPatientPhone = (record) => {
  return (
    record?.patientId?.phone ||
    record?.patientId?.userId?.phone ||
    ""
  );
};

const getPatientEmail = (record) => {
  return (
    record?.patientId?.email ||
    record?.patientId?.userId?.email ||
    ""
  );
};

const getAttachments = (record) => {
  return Array.isArray(record?.attachments)
    ? record.attachments
    : [];
};

export default function AdminMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (typeFilter !== "All") {
        params.append("recordType", typeFilter);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_BASE_URL}${query ? `?${query}` : ""}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch medical records."
        );
      }

      setRecords(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error("Medical records fetch error:", err);

      setRecords([]);
      setError(
        err.message ||
        "Unable to load medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (typeFilter === "All") {
        return true;
      }

      return record?.recordType === typeFilter;
    });
  }, [records, typeFilter]);

  const totalAttachments = useMemo(() => {
    return records.reduce((total, record) => {
      return total + getAttachments(record).length;
    }, 0);
  }, [records]);

  const handleViewRecord = async (record) => {
    if (!record?._id) {
      setSelectedRecord(record);
      return;
    }

    try {
      setDetailLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/${record._id}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to fetch medical record details."
        );
      }

      setSelectedRecord(result.data);
    } catch (err) {
      console.error(
        "Medical record detail error:",
        err
      );

      // Fallback to already-loaded record
      setSelectedRecord(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    if (!detailLoading) {
      setSelectedRecord(null);
    }
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaNotesMedical
            style={{ color: "var(--ad-primary)" }}
          />

          Medical Records &amp; Clinical Registry
        </h2>

        <p>
          Audit electronic medical records, diagnoses,
          prescriptions, lab reports, and clinical
          documentation.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="ad-kpi-grid">
        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0e7ff",
              color: "#4f46e5",
            }}
          >
            <FaNotesMedical />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Medical Records
            </span>

            <h3 className="ad-kpi-value">
              {loading ? "—" : records.length} Records
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#16a34a",
                fontWeight: "600",
              }}
            >
              Backend Registry
            </span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#dcfce7",
              color: "#16a34a",
            }}
          >
            <FaPills />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Prescription Records
            </span>

            <h3 className="ad-kpi-value">
              {loading
                ? "—"
                : records.filter(
                  (record) =>
                    record?.recordType ===
                    "Prescription"
                ).length}{" "}
              Issued
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--ad-text-muted)",
              }}
            >
              From MedicalRecord
            </span>
          </div>
        </div>

        <div className="ad-kpi-card">
          <div
            className="ad-kpi-icon"
            style={{
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <FaPaperclip />
          </div>

          <div className="ad-kpi-body">
            <span className="ad-kpi-label">
              Attachments
            </span>

            <h3 className="ad-kpi-value">
              {loading ? "—" : totalAttachments} Files
            </h3>

            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--ad-text-muted)",
              }}
            >
              Clinical Documents
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="ad-card">
        <div
          className="ad-search-filter-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <div
            className="ad-search-wrapper"
            style={{
              flex: 1,
              minWidth: "260px",
            }}
          >
            <FaSearch className="ad-search-icon" />

            <input
              type="text"
              placeholder="Search by Patient, Doctor, Diagnosis, Record..."
              className="ad-input"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div
            className="ad-filters"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <select
              className="ad-select"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              style={{ width: "190px" }}
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All"
                    ? "All Record Types"
                    : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div
            style={{
              margin: "0 1rem 1rem",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Record Ref</th>
                <th>Patient</th>
                <th>Record Category</th>
                <th>Consulting Doctor</th>
                <th>Clinical Record</th>
                <th>Encounter Date</th>
                <th>Integrity Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    Loading medical records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    No medical records match your
                    search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <strong className="ad-id-badge">
                        {getRecordId(rec)}
                      </strong>
                    </td>

                    <td>
                      <div>
                        <strong>
                          {getPatientName(rec)}
                        </strong>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginTop: "2px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color:
                                "var(--ad-text-muted)",
                            }}
                          >
                            ID: {getPatientId(rec)}
                          </span>

                          <span
                            style={{
                              fontSize: "0.68rem",
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding:
                                "0.05rem 0.35rem",
                              borderRadius: "3px",
                              fontWeight: "700",
                            }}
                          >
                            {getPatientBloodGroup(rec)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                        }}
                      >
                        {typeIcons[
                          rec.recordType
                        ] || <FaFileMedical />}

                        {rec.recordType ||
                          "General"}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong>
                          {getDoctorName(rec)}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            fontSize: "0.72rem",
                            color:
                              "var(--ad-text-muted)",
                          }}
                        >
                          {getDoctorSpecialization(
                            rec
                          )}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <strong
                          style={{
                            fontSize: "0.84rem",
                          }}
                        >
                          {rec.title || "Untitled Record"}
                        </strong>

                        {rec.description && (
                          <span
                            style={{
                              display: "block",
                              maxWidth: "240px",
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                              fontSize: "0.72rem",
                              color:
                                "var(--ad-text-muted)",
                              marginTop: "2px",
                            }}
                          >
                            {rec.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "0.82rem",
                        }}
                      >
                        {formatDate(rec.date)}
                      </span>
                    </td>

                    <td>
                      <span
                        className="ad-pill"
                        style={{
                          background: "#dcfce7",
                          color: "#16a34a",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <FaLock
                          style={{
                            fontSize: "0.7rem",
                          }}
                        />

                        Recorded
                      </span>
                    </td>

                    <td>
                      <button
                        className="ad-btn ad-btn-primary"
                        style={{
                          padding:
                            "0.35rem 0.65rem",
                          fontSize: "0.78rem",
                        }}
                        onClick={() =>
                          handleViewRecord(rec)
                        }
                        disabled={detailLoading}
                        title="View Clinical Record Details"
                      >
                        <FaEye /> Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div
          className="ad-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "750px",
            }}
          >
            <div className="ad-modal-header">
              <div>
                <h3
                  className="ad-modal-title"
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaNotesMedical
                    style={{
                      color:
                        "var(--ad-primary)",
                    }}
                  />

                  Clinical Record Audit
                </h3>

                <span
                  className="ad-id-badge"
                  style={{
                    marginTop: "4px",
                  }}
                >
                  {getRecordId(selectedRecord)}
                </span>
              </div>

              <button
                className="ad-modal-close"
                onClick={closeModal}
                disabled={detailLoading}
              >
                <FaTimes />
              </button>
            </div>

            <div
              className="ad-modal-body"
              style={{
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              {/* Patient + Doctor */}
              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaUser /> Patient Profile
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontWeight: "700",
                    }}
                  >
                    {getPatientName(
                      selectedRecord
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize: "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    ID:{" "}
                    {getPatientId(
                      selectedRecord
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize: "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Blood Group:{" "}
                    <strong>
                      {getPatientBloodGroup(
                        selectedRecord
                      )}
                    </strong>
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize: "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Gender:{" "}
                    {getPatientGender(
                      selectedRecord
                    )}
                  </p>

                  {getPatientAge(
                    selectedRecord
                  ) !== null && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize: "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Age:{" "}
                        {getPatientAge(
                          selectedRecord
                        )}{" "}
                        years
                      </p>
                    )}

                  {getPatientPhone(
                    selectedRecord
                  ) && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize: "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Phone:{" "}
                        {getPatientPhone(
                          selectedRecord
                        )}
                      </p>
                    )}

                  {getPatientEmail(
                    selectedRecord
                  ) && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Email:{" "}
                        {getPatientEmail(
                          selectedRecord
                        )}
                      </p>
                    )}
                </div>

                <div
                  style={{
                    background:
                      "var(--ad-bg-secondary)",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin:
                        "0 0 0.4rem",
                      fontSize: "0.88rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <FaUserMd /> Attending Physician
                  </h4>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontWeight: "700",
                    }}
                  >
                    {getDoctorName(
                      selectedRecord
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize: "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    {getDoctorSpecialization(
                      selectedRecord
                    )}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.15rem",
                      fontSize: "0.82rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    Hospital:{" "}
                    {getHospitalName(
                      selectedRecord
                    )}
                  </p>

                  {getDoctorPhone(
                    selectedRecord
                  ) && (
                      <p
                        style={{
                          margin:
                            "0 0 0.15rem",
                          fontSize: "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Phone:{" "}
                        {getDoctorPhone(
                          selectedRecord
                        )}
                      </p>
                    )}

                  {getDoctorEmail(
                    selectedRecord
                  ) && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.82rem",
                          color:
                            "var(--ad-text-secondary)",
                        }}
                      >
                        Email:{" "}
                        {getDoctorEmail(
                          selectedRecord
                        )}
                      </p>
                    )}
                </div>
              </div>

              {/* Record Information */}
              <div
                style={{
                  marginBottom: "1.25rem",
                }}
              >
                <h4
                  style={{
                    margin:
                      "0 0 0.5rem",
                    fontSize: "0.95rem",
                  }}
                >
                  Medical Record Information
                </h4>

                <div
                  style={{
                    background: "#f8fafc",
                    border:
                      "1px solid var(--ad-border-color)",
                    borderRadius: "8px",
                    padding:
                      "0.85rem 1rem",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 0.4rem",
                    }}
                  >
                    <strong>
                      Title:
                    </strong>{" "}
                    {selectedRecord.title ||
                      "—"}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.4rem",
                    }}
                  >
                    <strong>
                      Record Type:
                    </strong>{" "}
                    {selectedRecord.recordType ||
                      "General"}
                  </p>

                  <p
                    style={{
                      margin:
                        "0 0 0.4rem",
                    }}
                  >
                    <strong>
                      Date:
                    </strong>{" "}
                    {formatDate(
                      selectedRecord.date
                    )}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color:
                        "var(--ad-text-secondary)",
                    }}
                  >
                    <strong>
                      Description:
                    </strong>{" "}
                    {selectedRecord.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {getAttachments(
                selectedRecord
              ).length > 0 && (
                  <div
                    style={{
                      marginBottom:
                        "1.25rem",
                    }}
                  >
                    <h4
                      style={{
                        margin:
                          "0 0 0.5rem",
                        fontSize: "0.95rem",
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "0.4rem",
                      }}
                    >
                      <FaPaperclip
                        style={{
                          color:
                            "#0284c7",
                        }}
                      />

                      Attachments
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "0.5rem",
                      }}
                    >
                      {getAttachments(
                        selectedRecord
                      ).map(
                        (
                          attachment,
                          index
                        ) => (
                          <a
                            key={`${attachment}-${index}`}
                            href={
                              attachment.startsWith(
                                "http"
                              )
                                ? attachment
                                : `http://localhost:5000${attachment.startsWith("/") ? "" : "/"}${attachment}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "0.5rem",
                              padding:
                                "0.65rem 0.8rem",
                              border:
                                "1px solid var(--ad-border-color)",
                              borderRadius:
                                "7px",
                              color:
                                "var(--ad-primary)",
                              textDecoration:
                                "none",
                              fontSize:
                                "0.82rem",
                            }}
                          >
                            <FaFileMedical />

                            Attachment{" "}
                            {index + 1}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Audit Metadata */}
              <div
                style={{
                  background:
                    "var(--ad-bg-secondary)",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  marginBottom:
                    "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "0.5rem",
                    marginBottom:
                      "0.35rem",
                  }}
                >
                  <FaLock
                    style={{
                      color:
                        "#16a34a",
                    }}
                  />

                  <strong
                    style={{
                      fontSize:
                        "0.85rem",
                    }}
                  >
                    Record Integrity
                  </strong>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "0.78rem",
                    color:
                      "var(--ad-text-muted)",
                  }}
                >
                  Record stored in the
                  MedicoBridge MedicalRecord
                  registry.
                </p>
              </div>

              <div
                className="ad-modal-footer"
                style={{
                  marginTop:
                    "1.5rem",
                }}
              >
                <button
                  type="button"
                  className="ad-btn ad-btn-primary"
                  onClick={() =>
                    window.print()
                  }
                >
                  Print Medical Summary
                </button>

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={closeModal}
                  disabled={detailLoading}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}