import React, { useEffect, useState } from "react";

import {
  FaSearch,
  FaFilter,
  FaEye,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaBriefcase,
  FaBuilding,
  FaPills,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaHistory,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaCertificate,
  FaStethoscope,
  FaFlask,
  FaClock,
} from "react-icons/fa";

import { toast } from "react-toastify";
import "./AdminPages.css";

/* ===================================================================
   HELPERS & COMMON COMPONENTS
=================================================================== */

const statusColors = {
  Active: {
    bg: "#dcfce7",
    color: "#16a34a",
  },
  Blocked: {
    bg: "#fee2e2",
    color: "#dc2626",
  },
  Pending: {
    bg: "#fef3c7",
    color: "#d97706",
  },
  Approved: {
    bg: "#dbeafe",
    color: "#1d4ed8",
  },
  Rejected: {
    bg: "#fee2e2",
    color: "#dc2626",
  },
};

function StatusPill({ status }) {
  const s =
    statusColors[status] || {
      bg: "#f3f4f6",
      color: "#374151",
    };

  return (
    <span
      className="ad-pill"
      style={{
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="adv-detail-row">
      <span className="adv-detail-label">{label}</span>
      <span className="adv-detail-value">
        {children ?? value ?? "—"}
      </span>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="adv-section-title">
      {icon && (
        <span className="adv-section-icon">
          {icon}
        </span>
      )}
      <span>{title}</span>
    </div>
  );
}

/* ===================================================================
   VIEW DOCUMENTS MODAL

   IMPORTANT:
   Current Doctor/Hospital/Pharmacy schemas do not contain a documents
   array. Therefore this modal only shows documents when the API
   actually provides them.
=================================================================== */

function ViewDocumentsModal({
  item,
  onClose,
  onApprove,
  onReject,
}) {
  const [activePreviewDoc, setActivePreviewDoc] =
    useState(null);

  const displayId =
    item.doctorId ||
    item.hospitalId ||
    item.pharmacyId ||
    item.id;

  const documents = Array.isArray(item.documents)
    ? item.documents
    : [];

  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div
              className="adv-avatar"
              style={{
                background:
                  "linear-gradient(135deg, #0ea5e9, #6366f1)",
              }}
            >
              <FaFileAlt />
            </div>

            <div>
              <h3 className="adv-drawer-title">
                Verification Documents
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span className="ad-id-badge">
                  {displayId}
                </span>

                <span
                  style={{
                    fontSize: "0.82rem",
                    color:
                      "var(--ad-text-secondary)",
                  }}
                >
                  {item.name}
                </span>
              </div>
            </div>
          </div>

          <button
            className="ad-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="adv-drawer-body">
          {/* Security Banner */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius:
                "var(--ad-radius-md)",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <FaShieldAlt
              style={{
                color: "#16a34a",
                fontSize: "1.3rem",
                flexShrink: 0,
              }}
            />

            <div>
              <strong
                style={{
                  fontSize: "0.82rem",
                  color: "#166534",
                  display: "block",
                }}
              >
                Credential Authenticity Verification
              </strong>

              <span
                style={{
                  fontSize: "0.76rem",
                  color: "#15803d",
                }}
              >
                Verify registration licenses with
                the relevant state medical, drug, or
                healthcare authority registries.
              </span>
            </div>
          </div>

          <SectionTitle
            icon={<FaCertificate />}
            title={`Submitted Documents (${documents.length})`}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            {documents.length > 0 ? (
              documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    border:
                      "1px solid var(--ad-border-color)",
                    borderRadius:
                      "var(--ad-radius-md)",
                    padding: "1rem",
                    background:
                      activePreviewDoc === doc.name
                        ? "#f8faff"
                        : "#fff",
                    borderColor:
                      activePreviewDoc === doc.name
                        ? "var(--ad-primary)"
                        : "var(--ad-border-color)",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          fontSize: "1.1rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaFileAlt />
                      </div>

                      <div>
                        <strong
                          style={{
                            fontSize: "0.88rem",
                            color:
                              "var(--ad-text-primary)",
                            display: "block",
                          }}
                        >
                          {doc.name || "Document"}
                        </strong>

                        <span
                          style={{
                            fontSize: "0.75rem",
                            color:
                              "var(--ad-text-secondary)",
                          }}
                        >
                          {doc.type || "File"}
                        </span>
                      </div>
                    </div>

                    <span
                      className="ad-pill"
                      style={{
                        background:
                          doc.status === "Verified"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          doc.status === "Verified"
                            ? "#16a34a"
                            : "#d97706",
                        fontSize: "0.72rem",
                      }}
                    >
                      {doc.status || "Submitted"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      fontSize: "0.74rem",
                      color:
                        "var(--ad-text-muted)",
                      paddingTop: "0.4rem",
                      borderTop:
                        "1px dashed rgba(0,0,0,0.06)",
                    }}
                  >
                    <span>
                      Size: {doc.size || "—"} •
                      Uploaded:{" "}
                      {doc.date || "—"}
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          setActivePreviewDoc(
                            activePreviewDoc ===
                              doc.name
                              ? null
                              : doc.name
                          )
                        }
                        className="ad-btn ad-btn-secondary"
                        style={{
                          padding:
                            "0.25rem 0.6rem",
                          fontSize: "0.74rem",
                        }}
                      >
                        {activePreviewDoc ===
                          doc.name
                          ? "Hide Preview"
                          : "Inspect File"}
                      </button>

                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ad-btn ad-btn-outline"
                          style={{
                            padding:
                              "0.25rem 0.6rem",
                            fontSize: "0.74rem",
                            textDecoration: "none",
                          }}
                          title="Download File"
                        >
                          <FaDownload />
                        </a>
                      )}
                    </div>
                  </div>

                  {activePreviewDoc === doc.name && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "1rem",
                        background: "#0f172a",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        animation:
                          "adFadeIn 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginBottom: "0.5rem",
                          borderBottom:
                            "1px solid #334155",
                          paddingBottom: "0.4rem",
                        }}
                      >
                        <span
                          style={{
                            color: "#94a3b8",
                          }}
                        >
                          Preview Document:{" "}
                          <strong>
                            {doc.name}
                          </strong>
                        </span>

                        <span
                          style={{
                            color: "#38bdf8",
                          }}
                        >
                          Document Preview
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "0.3rem 0",
                          color: "#cbd5e1",
                        }}
                      >
                        <strong>
                          Document Title:
                        </strong>{" "}
                        {doc.type || "—"}
                      </p>

                      <p
                        style={{
                          margin: "0.3rem 0",
                          color: "#cbd5e1",
                        }}
                      >
                        <strong>
                          Applicant Name:
                        </strong>{" "}
                        {item.name} ({displayId})
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div
                className="adv-empty-msg"
                style={{
                  border:
                    "1px dashed var(--ad-border-color)",
                  borderRadius:
                    "var(--ad-radius-md)",
                  padding: "1.25rem",
                }}
              >
                <FaFileAlt
                  style={{
                    display: "block",
                    margin: "0 auto 0.6rem",
                    fontSize: "1.5rem",
                    color:
                      "var(--ad-text-muted)",
                  }}
                />

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  No uploaded documents are
                  currently available for this
                  request.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {item.approvalStatus === "Pending" && (
            <>
              <button
                className="ad-btn adv-btn-approve"
                onClick={() => {
                  onApprove(item.id, item.name);
                  onClose();
                }}
              >
                <FaCheckCircle />
                Approve Request
              </button>

              <button
                className="ad-btn adv-btn-reject"
                onClick={() => {
                  onReject(item);
                  onClose();
                }}
              >
                <FaTimesCircle />
                Reject Request
              </button>
            </>
          )}

          <button
            className="ad-btn ad-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   DOCTOR APPROVAL DETAILS MODAL
=================================================================== */

function DoctorApprovalDetailsModal({
  doctor,
  onClose,
  onApprove,
  onReject,
  onViewDocs,
}) {
  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-doc">
              {(doctor.name || "Doctor")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h3 className="adv-drawer-title">
                {doctor.name}
              </h3>

              <span className="ad-id-badge">
                {doctor.doctorId || doctor.id}
              </span>
            </div>
          </div>

          <button
            className="ad-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle
            icon={<FaStethoscope />}
            title="Doctor Approval Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Doctor Name"
              value={doctor.name}
            />

            <DetailRow
              label="Doctor ID"
              value={
                doctor.doctorId || doctor.id
              }
            />

            <DetailRow
              label="Doctor Type"
              value={doctor.doctorType}
            />

            <DetailRow
              label="Specialization"
              value={doctor.specialization}
            />

            <DetailRow
              label="Qualification"
              value={doctor.qualification}
            />

            <DetailRow
              label="Experience"
              value={doctor.experience}
            />

            <DetailRow
              label="Hospital / Clinic"
              value={doctor.facility}
            />

            <DetailRow
              label="Department"
              value={doctor.department}
            />

            <DetailRow label="License Number">
              <code
                style={{
                  fontSize: "0.82rem",
                }}
              >
                {doctor.licenseNumber || "—"}
              </code>
            </DetailRow>

            <DetailRow
              label="Submitted Date"
              value={doctor.submittedDate}
            />

            <DetailRow label="Approval Status">
              <StatusPill
                status={doctor.approvalStatus}
              />
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaEnvelope />}
            title="Contact Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Email Address"
              value={doctor.email}
            />

            <DetailRow
              label="Phone Number"
              value={doctor.phone}
            />

            <DetailRow
              label="Location"
              value={doctor.city}
            />
          </div>

          <SectionTitle
            icon={<FaCertificate />}
            title="Submitted Verification Credentials"
          />

          <div
            style={{
              background:
                "var(--ad-bg-secondary)",
              borderRadius:
                "var(--ad-radius-md)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              border:
                "1px dashed var(--ad-border-color)",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <FaFileAlt
                style={{
                  color: "var(--ad-primary)",
                  fontSize: "1.5rem",
                }}
              />

              <div>
                <strong
                  style={{
                    fontSize: "0.85rem",
                    display: "block",
                  }}
                >
                  {doctor.documents?.length || 0}{" "}
                  Documents Submitted
                </strong>

                <span
                  style={{
                    fontSize: "0.74rem",
                    color:
                      "var(--ad-text-secondary)",
                  }}
                >
                  Verification documents available
                  through the submitted application
                  data.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDocs(doctor);
              }}
              className="ad-btn ad-btn-secondary"
              style={{
                fontSize: "0.78rem",
                padding: "0.4rem 0.75rem",
              }}
            >
              <FaFileAlt />
              View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {doctor.approvalStatus === "Pending" && (
            <>
              <button
                className="ad-btn adv-btn-approve"
                onClick={() => {
                  onApprove(
                    doctor.id,
                    doctor.name
                  );
                  onClose();
                }}
              >
                <FaCheckCircle />
                Approve Doctor
              </button>

              <button
                className="ad-btn adv-btn-reject"
                onClick={() => {
                  onReject(doctor);
                  onClose();
                }}
              >
                <FaTimesCircle />
                Reject
              </button>
            </>
          )}

          <button
            className="ad-btn ad-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HOSPITAL APPROVAL DETAILS MODAL
=================================================================== */

function HospitalApprovalDetailsModal({
  hospital,
  onClose,
  onApprove,
  onReject,
  onViewDocs,
}) {
  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-hosp">
              <FaHospital />
            </div>

            <div>
              <h3 className="adv-drawer-title">
                {hospital.name}
              </h3>

              <span className="ad-id-badge">
                {hospital.hospitalId ||
                  hospital.id}
              </span>
            </div>
          </div>

          <button
            className="ad-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle
            icon={<FaBuilding />}
            title="Hospital Approval Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Hospital Name"
              value={hospital.name}
            />

            <DetailRow
              label="Hospital ID"
              value={
                hospital.hospitalId ||
                hospital.id
              }
            />

            <DetailRow
              label="Email"
              value={hospital.email}
            />

            <DetailRow
              label="Phone"
              value={hospital.phone}
            />

            <DetailRow
              label="Location"
              value={hospital.location}
            />

            <DetailRow label="Registration Number">
              <code
                style={{
                  fontSize: "0.82rem",
                }}
              >
                {hospital.registrationNumber ||
                  "—"}
              </code>
            </DetailRow>

            <DetailRow
              label="Hospital Type"
              value={hospital.hospitalType}
            />

            <DetailRow
              label="Departments Count"
              value={`${hospital.departmentsCount} Departments`}
            />

            <DetailRow
              label="Submitted Date"
              value={hospital.submittedDate}
            />

            <DetailRow label="Approval Status">
              <StatusPill
                status={hospital.approvalStatus}
              />
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaFlask />}
            title="Departments"
          />

          <div className="adv-tags-wrap">
            {hospital.departments?.length > 0 ? (
              hospital.departments.map((d) => (
                <span
                  key={d}
                  className="adv-tag"
                >
                  {d}
                </span>
              ))
            ) : (
              <span
                style={{
                  color:
                    "var(--ad-text-muted)",
                  fontSize: "0.8rem",
                }}
              >
                No departments provided.
              </span>
            )}
          </div>

          <SectionTitle
            icon={<FaCertificate />}
            title="Submitted Verification Credentials"
          />

          <div
            style={{
              background:
                "var(--ad-bg-secondary)",
              borderRadius:
                "var(--ad-radius-md)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              border:
                "1px dashed var(--ad-border-color)",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <FaFileAlt
                style={{
                  color: "var(--ad-primary)",
                  fontSize: "1.5rem",
                }}
              />

              <div>
                <strong
                  style={{
                    fontSize: "0.85rem",
                    display: "block",
                  }}
                >
                  {hospital.documents?.length || 0}{" "}
                  Documents Submitted
                </strong>

                <span
                  style={{
                    fontSize: "0.74rem",
                    color:
                      "var(--ad-text-secondary)",
                  }}
                >
                  Verification documents available
                  through the submitted application
                  data.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDocs(hospital);
              }}
              className="ad-btn ad-btn-secondary"
              style={{
                fontSize: "0.78rem",
                padding: "0.4rem 0.75rem",
              }}
            >
              <FaFileAlt />
              View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {hospital.approvalStatus === "Pending" && (
            <>
              <button
                className="ad-btn adv-btn-approve"
                onClick={() => {
                  onApprove(
                    hospital.id,
                    hospital.name
                  );
                  onClose();
                }}
              >
                <FaCheckCircle />
                Approve Hospital
              </button>

              <button
                className="ad-btn adv-btn-reject"
                onClick={() => {
                  onReject(hospital);
                  onClose();
                }}
              >
                <FaTimesCircle />
                Reject
              </button>
            </>
          )}

          <button
            className="ad-btn ad-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   RETAIL PHARMACY APPROVAL DETAILS MODAL
=================================================================== */

function RetailPharmacyApprovalDetailsModal({
  pharmacy,
  onClose,
  onApprove,
  onReject,
  onViewDocs,
}) {
  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-pharm">
              <FaPills />
            </div>

            <div>
              <h3 className="adv-drawer-title">
                {pharmacy.name}
              </h3>

              <span className="ad-id-badge">
                {pharmacy.pharmacyId ||
                  pharmacy.id}
              </span>
            </div>
          </div>

          <button
            className="ad-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle
            icon={<FaPills />}
            title="Retail Pharmacy Approval Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Pharmacy Name"
              value={pharmacy.name}
            />

            <DetailRow
              label="Pharmacy ID"
              value={
                pharmacy.pharmacyId ||
                pharmacy.id
              }
            />

            <DetailRow label="Pharmacy Type">
              <span className="adv-type-badge">
                Retail Pharmacy
              </span>
            </DetailRow>

            <DetailRow
              label="Email Address"
              value={pharmacy.email}
            />

            <DetailRow
              label="Phone Number"
              value={pharmacy.phone}
            />

            <DetailRow
              label="Location"
              value={pharmacy.location}
            />

            <DetailRow label="License Number">
              <code
                style={{
                  fontSize: "0.82rem",
                }}
              >
                {pharmacy.licenseNumber ||
                  "—"}
              </code>
            </DetailRow>

            <DetailRow
              label="Submitted Date"
              value={pharmacy.submittedDate}
            />

            <DetailRow label="Approval Status">
              <StatusPill
                status={pharmacy.approvalStatus}
              />
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaCertificate />}
            title="Submitted Verification Credentials"
          />

          <div
            style={{
              background:
                "var(--ad-bg-secondary)",
              borderRadius:
                "var(--ad-radius-md)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              border:
                "1px dashed var(--ad-border-color)",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <FaFileAlt
                style={{
                  color: "var(--ad-primary)",
                  fontSize: "1.5rem",
                }}
              />

              <div>
                <strong
                  style={{
                    fontSize: "0.85rem",
                    display: "block",
                  }}
                >
                  {pharmacy.documents?.length || 0}{" "}
                  Documents Submitted
                </strong>

                <span
                  style={{
                    fontSize: "0.74rem",
                    color:
                      "var(--ad-text-secondary)",
                  }}
                >
                  Verification documents available
                  through the submitted application
                  data.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDocs(pharmacy);
              }}
              className="ad-btn ad-btn-secondary"
              style={{
                fontSize: "0.78rem",
                padding: "0.4rem 0.75rem",
              }}
            >
              <FaFileAlt />
              View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {pharmacy.approvalStatus === "Pending" && (
            <>
              <button
                className="ad-btn adv-btn-approve"
                onClick={() => {
                  onApprove(
                    pharmacy.id,
                    pharmacy.name
                  );
                  onClose();
                }}
              >
                <FaCheckCircle />
                Approve Pharmacy
              </button>

              <button
                className="ad-btn adv-btn-reject"
                onClick={() => {
                  onReject(pharmacy);
                  onClose();
                }}
              >
                <FaTimesCircle />
                Reject
              </button>
            </>
          )}

          <button
            className="ad-btn ad-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HOSPITAL PHARMACY APPROVAL DETAILS MODAL
=================================================================== */

function HospitalPharmacyApprovalDetailsModal({
  pharmacy,
  onClose,
  onApprove,
  onReject,
  onViewDocs,
}) {
  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-pharm">
              <FaPills />
            </div>

            <div>
              <h3 className="adv-drawer-title">
                {pharmacy.name}
              </h3>

              <span className="ad-id-badge">
                {pharmacy.pharmacyId ||
                  pharmacy.id}
              </span>
            </div>
          </div>

          <button
            className="ad-modal-close"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle
            icon={<FaPills />}
            title="Hospital Pharmacy Approval Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Pharmacy Name"
              value={pharmacy.name}
            />

            <DetailRow
              label="Pharmacy ID"
              value={
                pharmacy.pharmacyId ||
                pharmacy.id
              }
            />

            <DetailRow label="Pharmacy Type">
              <span className="adv-type-badge">
                Hospital Pharmacy
              </span>
            </DetailRow>

            <DetailRow
              label="Linked Hospital"
              value={pharmacy.linkedHospital}
            />

            <DetailRow
              label="Email Address"
              value={pharmacy.email}
            />

            <DetailRow
              label="Phone Number"
              value={pharmacy.phone}
            />

            <DetailRow
              label="Location"
              value={pharmacy.location}
            />

            <DetailRow label="License Number">
              <code
                style={{
                  fontSize: "0.82rem",
                }}
              >
                {pharmacy.licenseNumber ||
                  "—"}
              </code>
            </DetailRow>

            <DetailRow
              label="Submitted Date"
              value={pharmacy.submittedDate}
            />

            <DetailRow label="Approval Status">
              <StatusPill
                status={pharmacy.approvalStatus}
              />
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaCertificate />}
            title="Submitted Verification Credentials"
          />

          <div
            style={{
              background:
                "var(--ad-bg-secondary)",
              borderRadius:
                "var(--ad-radius-md)",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              border:
                "1px dashed var(--ad-border-color)",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <FaFileAlt
                style={{
                  color: "var(--ad-primary)",
                  fontSize: "1.5rem",
                }}
              />

              <div>
                <strong
                  style={{
                    fontSize: "0.85rem",
                    display: "block",
                  }}
                >
                  {pharmacy.documents?.length || 0}{" "}
                  Documents Submitted
                </strong>

                <span
                  style={{
                    fontSize: "0.74rem",
                    color:
                      "var(--ad-text-secondary)",
                  }}
                >
                  Verification documents available
                  through the submitted application
                  data.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewDocs(pharmacy);
              }}
              className="ad-btn ad-btn-secondary"
              style={{
                fontSize: "0.78rem",
                padding: "0.4rem 0.75rem",
              }}
            >
              <FaFileAlt />
              View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {pharmacy.approvalStatus === "Pending" && (
            <>
              <button
                className="ad-btn adv-btn-approve"
                onClick={() => {
                  onApprove(
                    pharmacy.id,
                    pharmacy.name
                  );
                  onClose();
                }}
              >
                <FaCheckCircle />
                Approve Pharmacy
              </button>

              <button
                className="ad-btn adv-btn-reject"
                onClick={() => {
                  onReject(pharmacy);
                  onClose();
                }}
              >
                <FaTimesCircle />
                Reject
              </button>
            </>
          )}

          <button
            className="ad-btn ad-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   MAIN COMPONENT
=================================================================== */

export default function AdminApprovals() {
  const [activeTab, setActiveTab] =
    useState("Pending Doctors");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("Pending");

  /* Approval datasets */
  const [doctorApprovals, setDoctorApprovals] =
    useState([]);

  const [hospitalApprovals, setHospitalApprovals] =
    useState([]);

  const [
    retailPharmacyApprovals,
    setRetailPharmacyApprovals,
  ] = useState([]);

  const [
    hospitalPharmacyApprovals,
    setHospitalPharmacyApprovals,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  /* Modal states */
  const [selectedDetailsItem, setSelectedDetailsItem] =
    useState(null);

  const [selectedDocsItem, setSelectedDocsItem] =
    useState(null);

  const [rejectingItem, setRejectingItem] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  /* Activity audit log */
  const [activityLogs, setActivityLogs] =
    useState([]);

  const API_BASE =
    "http://localhost:5000/api";

  /* =================================================================
     FETCH APPROVALS
  ================================================================= */

  const fetchApprovals = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Admin authentication token not found."
        );
      }

      const response = await fetch(
        `${API_BASE}/admin/approvals`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to fetch approvals."
        );
      }

      const approvalData =
        result.data || {};

      /* =============================================================
         NORMALIZE DOCTOR

         CRITICAL:
         id = MongoDB _id
         doctorId = readable DR-xxxxx
      ============================================================= */

      const normalizeDoctor = (item) => ({
        ...item,

        // API ID - MUST be MongoDB _id
        id: item._id || "",

        // Display ID
        doctorId:
          item.doctorId ||
          item._id ||
          "",

        name:
          item.name ||
          "Unnamed Doctor",

        email:
          item.email ||
          item.userId?.email ||
          "",

        phone:
          item.phone ||
          item.userId?.phone ||
          "",

        city:
          item.city ||
          item.userId?.city ||
          "",

        specialization:
          item.specialization || "",

        qualification:
          item.qualification || "",

        experience:
          item.experience || "",

        doctorType:
          item.practiceType || "",

        facility:
          item.hospitalName ||
          item.clinicName ||
          "",

        department:
          item.department || "",

        licenseNumber:
          item.medRegNumber ||
          item.medicalLicense ||
          "",

        submittedDate: item.createdAt
          ? new Date(
            item.createdAt
          ).toLocaleDateString()
          : "—",

        approvalStatus:
          item.status === "verified"
            ? "Approved"
            : item.status === "rejected"
              ? "Rejected"
              : "Pending",

        /*
          Current Doctor schema does not have
          documents. If backend later supplies
          documents, they will be preserved.
        */
        documents: Array.isArray(
          item.documents
        )
          ? item.documents
          : [],
      });

      /* =============================================================
         NORMALIZE HOSPITAL

         CRITICAL:
         id = MongoDB _id
         hospitalId = readable HOSP-xxxx
      ============================================================= */

      const normalizeHospital = (item) => ({
        ...item,

        // API ID
        id: item._id || "",

        // Display ID
        hospitalId:
          item.hospitalId ||
          item._id ||
          "",

        name:
          item.name ||
          "Unnamed Hospital",

        email:
          item.email ||
          item.userId?.email ||
          "",

        phone:
          item.phone ||
          item.userId?.phone ||
          "",

        location: [
          item.city,
          item.state,
        ]
          .filter(Boolean)
          .join(", "),

        registrationNumber:
          item.regNumber || "",

        hospitalType:
          item.hospitalType || "",

        departments: Array.isArray(
          item.departments
        )
          ? item.departments
          : [],

        departmentsCount:
          Array.isArray(item.departments)
            ? item.departments.length
            : 0,

        submittedDate: item.createdAt
          ? new Date(
            item.createdAt
          ).toLocaleDateString()
          : "—",

        approvalStatus:
          item.status === "verified"
            ? "Approved"
            : item.status === "rejected"
              ? "Rejected"
              : "Pending",

        documents: Array.isArray(
          item.documents
        )
          ? item.documents
          : [],
      });

      /* =============================================================
         NORMALIZE PHARMACY

         CRITICAL:
         id = MongoDB _id
         pharmacyId = readable PHARM-xxxx
      ============================================================= */

      const normalizePharmacy = (item) => ({
        ...item,

        // API ID
        id: item._id || "",

        // Display ID
        pharmacyId:
          item.pharmacyId ||
          item._id ||
          "",

        name:
          item.name ||
          "Unnamed Pharmacy",

        email:
          item.email ||
          item.userId?.email ||
          "",

        phone:
          item.phone ||
          item.userId?.phone ||
          "",

        location: [
          item.city,
          item.state,
        ]
          .filter(Boolean)
          .join(", "),

        licenseNumber:
          item.licenseNumber || "",

        pharmacyType:
          item.type || "Retail",

        type:
          item.type || "Retail",

        linkedHospital:
          item.hospitalId?.name ||
          item.hospitalName ||
          "",

        submittedDate: item.createdAt
          ? new Date(
            item.createdAt
          ).toLocaleDateString()
          : "—",

        approvalStatus:
          item.status === "verified"
            ? "Approved"
            : item.status === "rejected"
              ? "Rejected"
              : "Pending",

        documents: Array.isArray(
          item.documents
        )
          ? item.documents
          : [],
      });

      setDoctorApprovals(
        (
          approvalData.doctors || []
        ).map(normalizeDoctor)
      );

      setHospitalApprovals(
        (
          approvalData.hospitals || []
        ).map(normalizeHospital)
      );

      setRetailPharmacyApprovals(
        (
          approvalData.retailPharmacies ||
          []
        ).map(normalizePharmacy)
      );

      setHospitalPharmacyApprovals(
        (
          approvalData.hospitalPharmacies ||
          []
        ).map(normalizePharmacy)
      );
    } catch (error) {
      console.error(
        "Admin approvals fetch error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to load approvals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  /* =================================================================
     ACTIVE TAB DATA
  ================================================================= */

  const getActiveTabConfig = () => {
    switch (activeTab) {
      case "Pending Doctors":
        return {
          data: doctorApprovals,
          setter: setDoctorApprovals,
          typeLabel: "Doctor",
          badgeClass:
            "adv-avatar-doc",
        };

      case "Pending Hospitals":
        return {
          data: hospitalApprovals,
          setter:
            setHospitalApprovals,
          typeLabel: "Hospital",
          badgeClass:
            "adv-avatar-hosp",
        };

      case "Pending Retail Pharmacies":
        return {
          data:
            retailPharmacyApprovals,
          setter:
            setRetailPharmacyApprovals,
          typeLabel:
            "Retail Pharmacy",
          badgeClass:
            "adv-avatar-pharm",
        };

      case "Pending Hospital Pharmacies":
        return {
          data:
            hospitalPharmacyApprovals,
          setter:
            setHospitalPharmacyApprovals,
          typeLabel:
            "Hospital Pharmacy",
          badgeClass:
            "adv-avatar-pharm",
        };

      default:
        return {
          data: [],
          setter: null,
          typeLabel: "",
          badgeClass: "",
        };
    }
  };

  const { data, setter } =
    getActiveTabConfig();

  /* =================================================================
     PENDING COUNTS
  ================================================================= */

  const pendingDoctorCount =
    doctorApprovals.filter(
      (d) =>
        d.approvalStatus ===
        "Pending"
    ).length;

  const pendingHospitalCount =
    hospitalApprovals.filter(
      (h) =>
        h.approvalStatus ===
        "Pending"
    ).length;

  const pendingRetailCount =
    retailPharmacyApprovals.filter(
      (r) =>
        r.approvalStatus ===
        "Pending"
    ).length;

  const pendingHospPharmCount =
    hospitalPharmacyApprovals.filter(
      (p) =>
        p.approvalStatus ===
        "Pending"
    ).length;

  /* =================================================================
     APPROVE

     IMPORTANT:
     id passed here is MongoDB _id.
     UI readable IDs are stored separately.
  ================================================================= */

  const handleApprove = async (
    id,
    name
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      if (!id) {
        throw new Error(
          "MongoDB provider ID is missing."
        );
      }

      let endpoint = "";

      if (
        activeTab ===
        "Pending Doctors"
      ) {
        endpoint =
          `/admin/doctor/approve/${id}`;
      } else if (
        activeTab ===
        "Pending Hospitals"
      ) {
        endpoint =
          `/admin/hospital/approve/${id}`;
      } else if (
        activeTab ===
        "Pending Retail Pharmacies"
      ) {
        endpoint =
          `/admin/pharmacy/approve/${id}`;
      } else if (
        activeTab ===
        "Pending Hospital Pharmacies"
      ) {
        endpoint =
          `/admin/pharmacy/approve/${id}`;
      } else {
        throw new Error(
          "Unknown approval type."
        );
      }

      console.log(
        "Approve request:",
        endpoint
      );

      const response =
        await fetch(
          `${API_BASE}${endpoint}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Approval failed."
        );
      }

      const logMsg =
        `Approved registration for ${name}.`;

      toast.success(
        `${name} approved successfully.`
      );

      setActivityLogs(
        (prev) => [
          {
            id: Date.now(),
            text: logMsg,
            time: "Just now",
            type: "approved",
          },
          ...prev.slice(0, 9),
        ]
      );

      await fetchApprovals();

      setSelectedDetailsItem(null);
      setSelectedDocsItem(null);
    } catch (error) {
      console.error(
        "Approval error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to approve request."
      );
    }
  };

  /* =================================================================
     OPEN REJECT MODAL
  ================================================================= */

  const handleOpenRejectModal = (
    item
  ) => {
    setRejectingItem(item);
    setRejectionReason("");
  };

  /* =================================================================
     REJECT SUBMIT

     IMPORTANT:
     rejectionReason is now actually sent
     to backend.
  ================================================================= */

  const handleRejectSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!rejectingItem) return;

    const reason =
      rejectionReason.trim();

    if (!reason) {
      toast.error(
        "Please enter a rejection reason."
      );
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      if (!rejectingItem.id) {
        throw new Error(
          "MongoDB provider ID is missing."
        );
      }

      let endpoint = "";

      if (
        activeTab ===
        "Pending Doctors"
      ) {
        endpoint =
          `/admin/doctor/reject/${rejectingItem.id}`;
      } else if (
        activeTab ===
        "Pending Hospitals"
      ) {
        endpoint =
          `/admin/hospital/reject/${rejectingItem.id}`;
      } else if (
        activeTab ===
        "Pending Retail Pharmacies"
      ) {
        endpoint =
          `/admin/pharmacy/reject/${rejectingItem.id}`;
      } else if (
        activeTab ===
        "Pending Hospital Pharmacies"
      ) {
        endpoint =
          `/admin/pharmacy/reject/${rejectingItem.id}`;
      } else {
        throw new Error(
          "Unknown rejection type."
        );
      }

      console.log(
        "Reject request:",
        endpoint
      );

      const response =
        await fetch(
          `${API_BASE}${endpoint}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },

            /*
              Backend reads:
              req.body.rejectionReason
            */
            body: JSON.stringify({
              rejectionReason:
                reason,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Rejection failed."
        );
      }

      const logMsg =
        `Rejected registration for ${rejectingItem.name}. Reason: ${reason}`;

      toast.success(
        "Request rejected successfully."
      );

      setActivityLogs(
        (prev) => [
          {
            id: Date.now(),
            text: logMsg,
            time: "Just now",
            type: "rejected",
          },
          ...prev.slice(0, 9),
        ]
      );

      setRejectingItem(null);
      setRejectionReason("");

      await fetchApprovals();

      setSelectedDetailsItem(null);
      setSelectedDocsItem(null);
    } catch (error) {
      console.error(
        "Rejection error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to reject request."
      );
    }
  };

  /* =================================================================
     SEARCH + STATUS FILTER
  ================================================================= */

  const filteredData = data.filter(
    (item) => {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      const readableId =
        item.doctorId ||
        item.hospitalId ||
        item.pharmacyId ||
        item.id ||
        "";

      const matchesSearch =
        !query ||
        (item.name || "")
          .toLowerCase()
          .includes(query) ||
        readableId
          .toLowerCase()
          .includes(query) ||
        (item.email || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.approvalStatus ===
        statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  /* =================================================================
     RENDER
  ================================================================= */

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>
          Review licensing credentials,
          verify registration
          documentation, and moderate
          access requests
        </p>
      </div>

      {/* ============================================================
          TABS
      ============================================================ */}

      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {[
            {
              key: "Pending Doctors",
              count:
                pendingDoctorCount,
            },
            {
              key: "Pending Hospitals",
              count:
                pendingHospitalCount,
            },
            {
              key:
                "Pending Retail Pharmacies",
              count:
                pendingRetailCount,
            },
            {
              key:
                "Pending Hospital Pharmacies",
              count:
                pendingHospPharmCount,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(
                  tab.key
                );
                setSearchQuery("");
                setStatusFilter(
                  "Pending"
                );
                setSelectedDetailsItem(
                  null
                );
                setSelectedDocsItem(
                  null
                );
              }}
              className={`ad-tab-btn ${activeTab === tab.key
                  ? "active"
                  : ""
                }`}
            >
              {tab.key}

              {tab.count > 0 && (
                <span
                  style={{
                    background:
                      activeTab ===
                        tab.key
                        ? "var(--ad-primary)"
                        : "#e2e8f0",
                    color:
                      activeTab ===
                        tab.key
                        ? "#fff"
                        : "#475569",
                    fontSize:
                      "0.7rem",
                    fontWeight: "700",
                    padding:
                      "0.1rem 0.45rem",
                    borderRadius:
                      "10px",
                    marginLeft:
                      "0.35rem",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          SEARCH + FILTER
      ============================================================ */}

      <div
        className="ad-card"
        style={{
          padding: "1.25rem",
        }}
      >
        <div className="ad-search-filter-bar">
          <div className="ad-search-wrapper">
            <FaSearch className="ad-search-icon" />

            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by name, ID, email...`}
              className="ad-input"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />
          </div>

          <div className="ad-filters">
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "0.3rem",
              }}
            >
              <FaFilter />
              Status:
            </span>

            <select
              className="ad-select"
              style={{
                width: "140px",
                padding:
                  "0.45rem 0.75rem",
              }}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="Pending">
                Pending (
                {
                  data.filter(
                    (d) =>
                      d.approvalStatus ===
                      "Pending"
                  ).length
                }
                )
              </option>

              <option value="Approved">
                Approved (
                {
                  data.filter(
                    (d) =>
                      d.approvalStatus ===
                      "Approved"
                  ).length
                }
                )
              </option>

              <option value="Rejected">
                Rejected (
                {
                  data.filter(
                    (d) =>
                      d.approvalStatus ===
                      "Rejected"
                  ).length
                }
                )
              </option>

              <option value="All">
                All Statuses (
                {data.length}
                )
              </option>
            </select>
          </div>
        </div>

        {/* ==========================================================
            TABLE
        ========================================================== */}

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type</th>
                <th>Email</th>
                <th>
                  Submitted Date
                </th>
                <th>Status</th>
                <th
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "3rem 1.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    <FaClock
                      style={{
                        fontSize:
                          "1.7rem",
                        display:
                          "block",
                        margin:
                          "0 auto 0.75rem",
                      }}
                    />

                    Loading approval
                    requests...
                  </td>
                </tr>
              ) : filteredData.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "3rem 1.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    <FaShieldAlt
                      style={{
                        fontSize:
                          "2rem",
                        color:
                          "var(--ad-border-color)",
                        display:
                          "block",
                        margin:
                          "0 auto 0.75rem auto",
                      }}
                    />

                    No requests found
                    matching the current
                    filters.
                  </td>
                </tr>
              ) : (
                filteredData.map(
                  (item) => {
                    const displayId =
                      item.doctorId ||
                      item.hospitalId ||
                      item.pharmacyId ||
                      item.id;

                    return (
                      <tr
                        key={
                          item.id
                        }
                      >
                        {/* NAME */}
                        <td>
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "0.75rem",
                            }}
                          >
                            <div className="adv-avatar">
                              {(item.name ||
                                "User")
                                .split(
                                  " "
                                )
                                .map(
                                  (n) =>
                                    n[0]
                                )
                                .join(
                                  ""
                                )
                                .slice(
                                  0,
                                  2
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              {item.specialization && (
                                <span
                                  style={{
                                    display:
                                      "block",
                                    fontSize:
                                      "0.74rem",
                                    color:
                                      "var(--ad-text-secondary)",
                                  }}
                                >
                                  {
                                    item.specialization
                                  }
                                </span>
                              )}

                              {item.linkedHospital && (
                                <span
                                  style={{
                                    display:
                                      "block",
                                    fontSize:
                                      "0.74rem",
                                    color:
                                      "var(--ad-text-secondary)",
                                  }}
                                >
                                  {
                                    item.linkedHospital
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td>
                          <span className="ad-id-badge">
                            {displayId}
                          </span>
                        </td>

                        {/* TYPE */}
                        <td>
                          <span className="adv-type-badge">
                            {item.doctorType ||
                              item.pharmacyType ||
                              item.type ||
                              activeTab.replace(
                                "Pending ",
                                ""
                              )}
                          </span>
                        </td>

                        {/* EMAIL */}
                        <td>
                          {item.email ||
                            "—"}
                        </td>

                        {/* DATE */}
                        <td>
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap:
                                "0.3rem",
                              fontSize:
                                "0.82rem",
                              color:
                                "var(--ad-text-secondary)",
                            }}
                          >
                            <FaCalendarAlt
                              style={{
                                fontSize:
                                  "0.75rem",
                                color:
                                  "var(--ad-text-muted)",
                              }}
                            />

                            {
                              item.submittedDate
                            }
                          </span>
                        </td>

                        {/* STATUS */}
                        <td>
                          <StatusPill
                            status={
                              item.approvalStatus
                            }
                          />
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "0.4rem",
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            {/* VIEW DETAILS */}
                            <button
                              onClick={() =>
                                setSelectedDetailsItem(
                                  item
                                )
                              }
                              className="ad-btn ad-btn-secondary"
                              title="View Application Details"
                              style={{
                                padding:
                                  "0.4rem 0.65rem",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              <FaEye />
                              View Details
                            </button>

                            {/* DOCUMENTS */}
                            <button
                              onClick={() =>
                                setSelectedDocsItem(
                                  item
                                )
                              }
                              className="ad-btn ad-btn-outline"
                              title="View Verification Documents"
                              style={{
                                padding:
                                  "0.4rem 0.65rem",
                                fontSize:
                                  "0.78rem",
                              }}
                            >
                              <FaFileAlt />
                              Documents
                            </button>

                            {/* APPROVE */}
                            {item.approvalStatus ===
                              "Pending" && (
                                <button
                                  onClick={() =>
                                    handleApprove(
                                      item.id,
                                      item.name
                                    )
                                  }
                                  className="ad-btn adv-btn-approve"
                                  title="Verify & Approve"
                                  style={{
                                    padding:
                                      "0.4rem 0.65rem",
                                    fontSize:
                                      "0.78rem",
                                  }}
                                >
                                  <FaCheck />
                                  Approve
                                </button>
                              )}

                            {/* REJECT */}
                            {item.approvalStatus ===
                              "Pending" && (
                                <button
                                  onClick={() =>
                                    handleOpenRejectModal(
                                      item
                                    )
                                  }
                                  className="ad-btn adv-btn-reject"
                                  title="Reject Request"
                                  style={{
                                    padding:
                                      "0.4rem 0.65rem",
                                    fontSize:
                                      "0.78rem",
                                  }}
                                >
                                  <FaTimes />
                                  Reject
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          ACTIVITY LOG
      ============================================================ */}

      <div
        className="ad-card"
        style={{
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            marginBottom:
              "0.75rem",
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize:
                "0.95rem",
              display:
                "flex",
              alignItems:
                "center",
              gap: "0.5rem",
            }}
          >
            <FaHistory
              style={{
                color:
                  "var(--ad-primary)",
              }}
            />

            Recent Verification
            Activity Log
          </h4>

          <span
            style={{
              fontSize:
                "0.76rem",
              color:
                "var(--ad-text-muted)",
            }}
          >
            Live Session Audit
            Trail
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "0.5rem",
          }}
        >
          {activityLogs.length ===
            0 ? (
            <div
              style={{
                padding:
                  "0.75rem 0.85rem",
                background:
                  "var(--ad-bg-secondary)",
                borderRadius:
                  "var(--ad-radius-md)",
                fontSize:
                  "0.8rem",
                color:
                  "var(--ad-text-muted)",
              }}
            >
              No approval or rejection
              actions performed in
              this session yet.
            </div>
          ) : (
            activityLogs.map(
              (log) => (
                <div
                  key={log.id}
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap:
                      "0.75rem",
                    padding:
                      "0.6rem 0.85rem",
                    background:
                      "var(--ad-bg-secondary)",
                    borderRadius:
                      "var(--ad-radius-md)",
                    fontSize:
                      "0.82rem",
                    borderLeft: `3px solid ${log.type ===
                        "approved"
                        ? "#16a34a"
                        : log.type ===
                          "rejected"
                          ? "#dc2626"
                          : "var(--ad-primary)"
                      }`,
                  }}
                >
                  <span
                    style={{
                      color:
                        "var(--ad-text-primary)",
                    }}
                  >
                    {log.text}
                  </span>

                  <span
                    style={{
                      fontSize:
                        "0.72rem",
                      color:
                        "var(--ad-text-muted)",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "0.25rem",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <FaClock
                      style={{
                        fontSize:
                          "0.68rem",
                      }}
                    />

                    {log.time}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* ============================================================
          DOCTOR DETAILS MODAL
      ============================================================ */}

      {selectedDetailsItem &&
        activeTab ===
        "Pending Doctors" && (
          <DoctorApprovalDetailsModal
            doctor={
              selectedDetailsItem
            }
            onClose={() =>
              setSelectedDetailsItem(
                null
              )
            }
            onApprove={
              handleApprove
            }
            onReject={
              handleOpenRejectModal
            }
            onViewDocs={
              setSelectedDocsItem
            }
          />
        )}

      {/* ============================================================
          HOSPITAL DETAILS MODAL
      ============================================================ */}

      {selectedDetailsItem &&
        activeTab ===
        "Pending Hospitals" && (
          <HospitalApprovalDetailsModal
            hospital={
              selectedDetailsItem
            }
            onClose={() =>
              setSelectedDetailsItem(
                null
              )
            }
            onApprove={
              handleApprove
            }
            onReject={
              handleOpenRejectModal
            }
            onViewDocs={
              setSelectedDocsItem
            }
          />
        )}

      {/* ============================================================
          RETAIL PHARMACY DETAILS MODAL
      ============================================================ */}

      {selectedDetailsItem &&
        activeTab ===
        "Pending Retail Pharmacies" && (
          <RetailPharmacyApprovalDetailsModal
            pharmacy={
              selectedDetailsItem
            }
            onClose={() =>
              setSelectedDetailsItem(
                null
              )
            }
            onApprove={
              handleApprove
            }
            onReject={
              handleOpenRejectModal
            }
            onViewDocs={
              setSelectedDocsItem
            }
          />
        )}

      {/* ============================================================
          HOSPITAL PHARMACY DETAILS MODAL
      ============================================================ */}

      {selectedDetailsItem &&
        activeTab ===
        "Pending Hospital Pharmacies" && (
          <HospitalPharmacyApprovalDetailsModal
            pharmacy={
              selectedDetailsItem
            }
            onClose={() =>
              setSelectedDetailsItem(
                null
              )
            }
            onApprove={
              handleApprove
            }
            onReject={
              handleOpenRejectModal
            }
            onViewDocs={
              setSelectedDocsItem
            }
          />
        )}

      {/* ============================================================
          DOCUMENTS MODAL
      ============================================================ */}

      {selectedDocsItem && (
        <ViewDocumentsModal
          item={selectedDocsItem}
          onClose={() =>
            setSelectedDocsItem(
              null
            )
          }
          onApprove={
            handleApprove
          }
          onReject={
            handleOpenRejectModal
          }
        />
      )}

      {/* ============================================================
          REJECTION REASON MODAL
      ============================================================ */}

      {rejectingItem && (
        <div
          className="ad-modal-backdrop"
          onClick={() =>
            setRejectingItem(
              null
            )
          }
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="ad-modal-header">
              <h3
                style={{
                  margin: 0,
                }}
              >
                Reject Verification
                Request
              </h3>

              <button
                className="ad-modal-close"
                onClick={() => {
                  setRejectingItem(
                    null
                  );
                  setRejectionReason(
                    ""
                  );
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleRejectSubmit
              }
            >
              <div className="ad-modal-body">
                <p
                  style={{
                    fontSize:
                      "0.85rem",
                    color:
                      "var(--ad-text-secondary)",
                    marginBottom:
                      "1rem",
                  }}
                >
                  Please specify the
                  reason for rejecting{" "}
                  <strong>
                    {
                      rejectingItem.name
                    }
                  </strong>{" "}
                  (
                  {rejectingItem.doctorId ||
                    rejectingItem.hospitalId ||
                    rejectingItem.pharmacyId ||
                    rejectingItem.id}
                  ).
                </p>

                <div className="ad-form-group">
                  <label htmlFor="rejectionReason">
                    Rejection Reason /
                    Required Corrections
                  </label>

                  <textarea
                    id="rejectionReason"
                    rows="4"
                    className="ad-textarea"
                    placeholder="e.g. Uploaded license is expired, registration details do not match, or submitted information is incomplete."
                    value={
                      rejectionReason
                    }
                    onChange={(e) =>
                      setRejectionReason(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="ad-modal-footer">
                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                  style={{
                    background:
                      "#dc2626",
                  }}
                >
                  <FaTimesCircle />
                  Confirm Rejection
                </button>

                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={() => {
                    setRejectingItem(
                      null
                    );
                    setRejectionReason(
                      ""
                    );
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}