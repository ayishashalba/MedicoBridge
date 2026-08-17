import React, { useState } from "react";
import {
  FaSearch, FaFilter, FaEye, FaFileAlt, FaCheck, FaTimes,
  FaShieldAlt, FaBriefcase, FaBuilding, FaPills, FaUserMd,
  FaHospital, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaDownload, FaHistory, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaIdCard, FaCertificate, FaStethoscope, FaFlask, FaClock
} from "react-icons/fa";
import "./AdminPages.css";

/* ===================================================================
   INITIAL DATA FOR THE 4 SECTIONS
=================================================================== */
const initialDoctorApprovals = [
  {
    id: "DOC-APP-201",
    name: "Dr. Sandeep Reddy",
    type: "Doctor",
    doctorType: "Hospital Doctor",
    specialization: "Cardiology",
    qualification: "MBBS, MD (Cardiology), DM",
    experience: "14 Years",
    facility: "Reddy Heart Care Center",
    department: "Cardiology OPD & ICU",
    licenseNumber: "MCI-44912",
    email: "sandeep.reddy@heartcare.com",
    phone: "+91 98451 22334",
    submittedDate: "14 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "medical_degree_reddy.pdf", type: "MBBS & MD Medical Degree", size: "3.2 MB", date: "14 Jul 2026", status: "Pending Review" },
      { name: "mci_registration_cert.pdf", type: "Medical Council Registration (MCI)", size: "1.8 MB", date: "14 Jul 2026", status: "Pending Review" },
      { name: "national_id_proof.pdf", type: "Government Identity Proof (Aadhaar)", size: "950 KB", date: "14 Jul 2026", status: "Verified" },
    ]
  },
  {
    id: "DOC-APP-202",
    name: "Dr. Neha Gokhale",
    type: "Doctor",
    doctorType: "Clinic Doctor",
    specialization: "Pediatrics",
    qualification: "MBBS, DCH (Pediatrics)",
    experience: "8 Years",
    facility: "Kids Clinic, Bandra",
    department: "Pediatrics OPD",
    licenseNumber: "MCI-55248",
    email: "neha.gokhale@kidscare.com",
    phone: "+91 98220 11445",
    submittedDate: "12 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "pediatrics_cert_mci.pdf", type: "Pediatrics Board Certificate", size: "2.4 MB", date: "12 Jul 2026", status: "Pending Review" },
      { name: "clinic_practice_permit.pdf", type: "Local Health Dept Practice Permit", size: "1.5 MB", date: "12 Jul 2026", status: "Pending Review" },
      { name: "mbbs_degree_gokhale.pdf", type: "MBBS Degree Certificate", size: "2.9 MB", date: "12 Jul 2026", status: "Verified" },
    ]
  },
  {
    id: "DOC-APP-203",
    name: "Dr. Sara Thomas",
    type: "Doctor",
    doctorType: "Hospital Doctor",
    specialization: "General Medicine",
    qualification: "MBBS, DNB (Gen Medicine)",
    experience: "5 Years",
    facility: "Metro General Hospital",
    department: "General Medicine",
    licenseNumber: "MCI-GM-41882",
    email: "sara.thomas@example.com",
    phone: "+91 77334 45566",
    submittedDate: "10 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "dnb_degree_cert.pdf", type: "DNB General Medicine Degree", size: "2.8 MB", date: "10 Jul 2026", status: "Pending Review" },
      { name: "mci_state_council_reg.pdf", type: "State Medical Council License", size: "1.2 MB", date: "10 Jul 2026", status: "Pending Review" },
    ]
  },
  {
    id: "DOC-APP-204",
    name: "Dr. Vikram Batra",
    type: "Doctor",
    doctorType: "Clinic Doctor",
    specialization: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experience: "11 Years",
    facility: "Batra Bone & Joint Clinic",
    department: "Orthopedics",
    licenseNumber: "MCI-ORT-39012",
    email: "dr.batra@jointcare.in",
    phone: "+91 94112 33445",
    submittedDate: "08 Jul 2026",
    approvalStatus: "Approved",
    documents: [
      { name: "ms_orthopedics_degree.pdf", type: "MS Orthopedics Degree", size: "3.5 MB", date: "08 Jul 2026", status: "Verified" },
      { name: "mci_renewal_2026.pdf", type: "Medical Council License Renewal", size: "1.1 MB", date: "08 Jul 2026", status: "Verified" },
    ]
  }
];

const initialHospitalApprovals = [
  {
    id: "HSP-APP-301",
    name: "Apex Heart Clinic & Hospital",
    type: "Hospital",
    email: "admin@apexheartclinic.in",
    phone: "+91 124 4567890",
    location: "Apex Building, Sec 5, Gurgaon, Haryana",
    registrationNumber: "HSP-LIC-88241",
    departments: ["Cardiology", "Neurology", "Emergency & ICU", "Radiology", "Pathology"],
    departmentsCount: 5,
    beds: "150",
    submittedDate: "14 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "hospital_establishment_license.pdf", type: "Clinical Establishment Act License", size: "4.5 MB", date: "14 Jul 2026", status: "Pending Review" },
      { name: "fire_safety_noc_gurgaon.pdf", type: "Fire & Pollution Safety NOC", size: "2.1 MB", date: "14 Jul 2026", status: "Pending Review" },
      { name: "nabh_accreditation_cert.pdf", type: "NABH Quality Accreditation", size: "3.8 MB", date: "14 Jul 2026", status: "Verified" },
    ]
  },
  {
    id: "HSP-APP-302",
    name: "St. Stephens Multi-Specialty Clinic",
    type: "Hospital",
    email: "info@ststephens.com",
    phone: "+91 11 3344 5566",
    location: "45, Church Road, Connaught Place, Delhi",
    registrationNumber: "DL-HOSP-20220305",
    departments: ["General Medicine", "ENT", "Pediatrics", "Diagnostics"],
    departmentsCount: 4,
    beds: "45",
    submittedDate: "08 Feb 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "delhi_health_dept_registration.pdf", type: "Delhi Health Directorate Registration", size: "3.4 MB", date: "08 Feb 2026", status: "Pending Review" },
      { name: "building_safety_clearance.pdf", type: "Municipal Building Clearance", size: "1.9 MB", date: "08 Feb 2026", status: "Pending Review" },
    ]
  },
  {
    id: "HSP-APP-303",
    name: "Sunrise Medicare Hospital",
    type: "Hospital",
    email: "contact@sunrisemedicare.in",
    phone: "+91 80 2345 6789",
    location: "88, Indiranagar 100ft Road, Bangalore, Karnataka",
    registrationNumber: "KA-HOSP-20200881",
    departments: ["Oncology", "Cardiology", "Nephrology", "Orthopedics", "General Medicine", "ICU"],
    departmentsCount: 6,
    beds: "220",
    submittedDate: "05 Jul 2026",
    approvalStatus: "Approved",
    documents: [
      { name: "karnataka_establishment_cert.pdf", type: "Clinical Establishment Certificate", size: "4.1 MB", date: "05 Jul 2026", status: "Verified" },
      { name: "nabh_full_accreditation.pdf", type: "NABH Hospital Accreditation", size: "5.2 MB", date: "05 Jul 2026", status: "Verified" },
    ]
  }
];

const initialRetailPharmacyApprovals = [
  {
    id: "PHR-RET-401",
    name: "MedPlus Pharmacy",
    type: "Pharmacy",
    pharmacyType: "Retail Pharmacy",
    email: "license@medplusrx.com",
    phone: "+91 120 2345678",
    location: "Shop 12, Main Market, Sector 2, Noida, Uttar Pradesh",
    licenseNumber: "DL-20B-2415A",
    submittedDate: "13 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "retail_drug_license_form20.pdf", type: "State Drug Control Form 20/21 Retail License", size: "2.7 MB", date: "13 Jul 2026", status: "Pending Review" },
      { name: "registered_pharmacist_cert.pdf", type: "Registered Pharmacist Certificate & Registration", size: "1.4 MB", date: "13 Jul 2026", status: "Pending Review" },
      { name: "gst_trade_license.pdf", type: "GST & Municipal Trade License", size: "850 KB", date: "13 Jul 2026", status: "Verified" },
    ]
  },
  {
    id: "PHR-RET-402",
    name: "Apollo Community Chemist",
    type: "Pharmacy",
    pharmacyType: "Retail Pharmacy",
    email: "apollo.comm.chem@apollo.in",
    phone: "+91 44 2829 3344",
    location: "18, TTK Road, Alwarpet, Chennai, Tamil Nadu",
    licenseNumber: "TN-RET-PH-99411",
    submittedDate: "11 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "tamilnadu_retail_license.pdf", type: "Tamil Nadu Drug Control License", size: "2.5 MB", date: "11 Jul 2026", status: "Pending Review" },
      { name: "pharmacist_degree_certificate.pdf", type: "B.Pharm Degree & State Council Card", size: "1.9 MB", date: "11 Jul 2026", status: "Pending Review" },
    ]
  },
  {
    id: "PHR-RET-403",
    name: "LifeCare Retail Chemist",
    type: "Pharmacy",
    pharmacyType: "Retail Pharmacy",
    email: "lifecare.retail@gmail.com",
    phone: "+91 22 2678 1234",
    location: "5, Hill Road, Bandra West, Mumbai, Maharashtra",
    licenseNumber: "MH-RET-PH-82410",
    submittedDate: "06 Jul 2026",
    approvalStatus: "Approved",
    documents: [
      { name: "maharashtra_form20_license.pdf", type: "Form 20 Drug License", size: "3.0 MB", date: "06 Jul 2026", status: "Verified" },
      { name: "pharmacist_council_stamp.pdf", type: "Pharmacist Council Registration", size: "1.2 MB", date: "06 Jul 2026", status: "Verified" },
    ]
  }
];

const initialHospitalPharmacyApprovals = [
  {
    id: "PHR-HSP-501",
    name: "Metro Hospital In-House Pharmacy",
    type: "Pharmacy",
    pharmacyType: "Hospital Pharmacy",
    linkedHospital: "Metro General Hospital, Hyderabad",
    email: "pharmacy@metrohosp.in",
    phone: "+91 40 6677 8890",
    location: "Ground Floor, Metro General Hospital Campus, Road 5, Banjara Hills, Hyderabad",
    licenseNumber: "DL-HSP-88210",
    submittedDate: "12 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "hospital_pharmacy_permit.pdf", type: "Institutional / Hospital Drug License", size: "3.1 MB", date: "12 Jul 2026", status: "Pending Review" },
      { name: "hospital_mou_authorization.pdf", type: "Hospital Management Authorization & MoU", size: "2.9 MB", date: "12 Jul 2026", status: "Pending Review" },
      { name: "chief_pharmacist_credentials.pdf", type: "Chief Pharmacist License & Reg.", size: "1.6 MB", date: "12 Jul 2026", status: "Verified" },
    ]
  },
  {
    id: "PHR-HSP-502",
    name: "City Care On-Site Dispensary",
    type: "Pharmacy",
    pharmacyType: "Hospital Pharmacy",
    linkedHospital: "City Care Hospital, Chennai",
    email: "pharmacy@citycare.org",
    phone: "+91 44 2234 5679",
    location: "Block B, City Care Hospital, 12 Park Road, Adyar, Chennai",
    licenseNumber: "LIC-HPH-44211",
    submittedDate: "09 Jul 2026",
    approvalStatus: "Pending",
    documents: [
      { name: "hospital_dispensary_license.pdf", type: "In-House Pharmacy Drug Authority Permit", size: "2.8 MB", date: "09 Jul 2026", status: "Pending Review" },
      { name: "pharmacist_supervision_cert.pdf", type: "Registered Pharmacist In-Charge Card", size: "1.3 MB", date: "09 Jul 2026", status: "Pending Review" },
    ]
  },
  {
    id: "PHR-HSP-503",
    name: "Fortis Hospital Care Pharmacy",
    type: "Pharmacy",
    pharmacyType: "Hospital Pharmacy",
    linkedHospital: "Fortis Health Clinic, Mumbai",
    email: "pharmacy@fortiscare.in",
    phone: "+91 22 5566 7799",
    location: "9, Linking Road, Bandra West, Mumbai",
    licenseNumber: "MH-HSP-PH-33109",
    submittedDate: "04 Jul 2026",
    approvalStatus: "Approved",
    documents: [
      { name: "fortis_inhouse_permit.pdf", type: "Institutional Pharmacy License", size: "3.3 MB", date: "04 Jul 2026", status: "Verified" },
      { name: "fda_hospital_clearance.pdf", type: "FDA Hospital Clearance Certificate", size: "1.7 MB", date: "04 Jul 2026", status: "Verified" },
    ]
  }
];

/* ===================================================================
   HELPERS & COMMON COMPONENTS
=================================================================== */
const statusColors = {
  Active:   { bg: "#dcfce7", color: "#16a34a" },
  Blocked:  { bg: "#fee2e2", color: "#dc2626" },
  Pending:  { bg: "#fef3c7", color: "#d97706" },
  Approved: { bg: "#dbeafe", color: "#1d4ed8" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};

function StatusPill({ status }) {
  const s = statusColors[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="ad-pill" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="adv-detail-row">
      <span className="adv-detail-label">{label}</span>
      <span className="adv-detail-value">{children ?? value ?? "—"}</span>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="adv-section-title">
      {icon && <span className="adv-section-icon">{icon}</span>}
      <span>{title}</span>
    </div>
  );
}

/* ===================================================================
   VIEW DOCUMENTS MODAL
=================================================================== */
function ViewDocumentsModal({ item, onClose, onApprove, onReject }) {
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);

  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar" style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
              <FaFileAlt />
            </div>
            <div>
              <h3 className="adv-drawer-title">Verification Documents</h3>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                <span className="ad-id-badge">{item.id}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>{item.name}</span>
              </div>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="adv-drawer-body">
          {/* Security Banner */}
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--ad-radius-md)",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem"
          }}>
            <FaShieldAlt style={{ color: "#16a34a", fontSize: "1.3rem", flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.82rem", color: "#166534", display: "block" }}>Credential Authenticity Verification</strong>
              <span style={{ fontSize: "0.76rem", color: "#15803d" }}>
                All documents submitted under digital signature protocol. Verify registration licenses with state medical/drug authority registries.
              </span>
            </div>
          </div>

          <SectionTitle icon={<FaCertificate />} title={`Submitted Documents (${item.documents?.length || 0})`} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            {item.documents && item.documents.length > 0 ? (
              item.documents.map((doc, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid var(--ad-border-color)",
                    borderRadius: "var(--ad-radius-md)",
                    padding: "1rem",
                    background: activePreviewDoc === doc.name ? "#f8faff" : "#fff",
                    borderColor: activePreviewDoc === doc.name ? "var(--ad-primary)" : "var(--ad-border-color)",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        flexShrink: 0
                      }}>
                        <FaFileAlt />
                      </div>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "var(--ad-text-primary)", display: "block" }}>
                          {doc.name}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--ad-text-secondary)" }}>
                          {doc.type}
                        </span>
                      </div>
                    </div>
                    <span className="ad-pill" style={{
                      background: doc.status === "Verified" ? "#dcfce7" : "#fef3c7",
                      color: doc.status === "Verified" ? "#16a34a" : "#d97706",
                      fontSize: "0.72rem"
                    }}>
                      {doc.status}
                    </span>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.74rem",
                    color: "var(--ad-text-muted)",
                    paddingTop: "0.4rem",
                    borderTop: "1px dashed rgba(0,0,0,0.06)"
                  }}>
                    <span>Size: {doc.size} • Uploaded: {doc.date}</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => setActivePreviewDoc(activePreviewDoc === doc.name ? null : doc.name)}
                        className="ad-btn ad-btn-secondary"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.74rem" }}
                      >
                        {activePreviewDoc === doc.name ? "Hide Preview" : "Inspect File"}
                      </button>
                      <button
                        onClick={() => alert(`Simulated Download of: ${doc.name}`)}
                        className="ad-btn ad-btn-outline"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.74rem" }}
                        title="Download File"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  </div>

                  {/* Document Simulated Preview Pane */}
                  {activePreviewDoc === doc.name && (
                    <div style={{
                      marginTop: "0.75rem",
                      padding: "1rem",
                      background: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      animation: "adFadeIn 0.2s ease"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", borderBottom: "1px solid #334155", paddingBottom: "0.4rem" }}>
                        <span style={{ color: "#94a3b8" }}>Preview Document: <strong>{doc.name}</strong></span>
                        <span style={{ color: "#38bdf8" }}>PDF Viewer</span>
                      </div>
                      <p style={{ margin: "0.3rem 0", color: "#cbd5e1" }}>
                        <strong>Document Title:</strong> {doc.type}
                      </p>
                      <p style={{ margin: "0.3rem 0", color: "#cbd5e1" }}>
                        <strong>Applicant Name:</strong> {item.name} ({item.id})
                      </p>
                      <p style={{ margin: "0.3rem 0", color: "#cbd5e1" }}>
                        <strong>Official License No:</strong> {item.licenseNumber || item.registrationNumber || "N/A"}
                      </p>
                      <p style={{ margin: "0.3rem 0", color: "#cbd5e1" }}>
                        <strong>Digital Seal:</strong> VERIFIED_SHA256_STAMP_OK
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="adv-empty-msg">No uploaded documents available for this request.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {item.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => { onApprove(item.id, item.name); onClose(); }}>
                <FaCheckCircle /> Approve Request
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => { onReject(item); onClose(); }}>
                <FaTimesCircle /> Reject Request
              </button>
            </>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   DOCTOR APPROVAL DETAILS MODAL
=================================================================== */
function DoctorApprovalDetailsModal({ doctor, onClose, onApprove, onReject, onViewDocs }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-doc">
              {doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="adv-drawer-title">{doctor.name}</h3>
              <span className="ad-id-badge">{doctor.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaStethoscope />} title="Doctor Approval Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Doctor Name" value={doctor.name} />
            <DetailRow label="Doctor ID" value={doctor.id} />
            <DetailRow label="Doctor Type" value={doctor.doctorType} />
            <DetailRow label="Specialization" value={doctor.specialization} />
            <DetailRow label="Qualification" value={doctor.qualification} />
            <DetailRow label="Experience" value={doctor.experience} />
            <DetailRow label="Hospital / Clinic" value={doctor.facility} />
            <DetailRow label="Department" value={doctor.department} />
            <DetailRow label="License Number">
              <code style={{ fontSize: "0.82rem" }}>{doctor.licenseNumber}</code>
            </DetailRow>
            <DetailRow label="Submitted Date" value={doctor.submittedDate} />
            <DetailRow label="Approval Status"><StatusPill status={doctor.approvalStatus} /></DetailRow>
          </div>

          <SectionTitle icon={<FaEnvelope />} title="Contact Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Email Address" value={doctor.email} />
            <DetailRow label="Phone Number" value={doctor.phone} />
          </div>

          <SectionTitle icon={<FaCertificate />} title="Submitted Verification Credentials" />
          <div style={{
            background: "var(--ad-bg-secondary)",
            borderRadius: "var(--ad-radius-md)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px dashed var(--ad-border-color)",
            marginBottom: "0.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaFileAlt style={{ color: "var(--ad-primary)", fontSize: "1.5rem" }} />
              <div>
                <strong style={{ fontSize: "0.85rem", display: "block" }}>{doctor.documents?.length || 0} Documents Submitted</strong>
                <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>MBBS Degree, MCI Registration & Identity Proofs</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onViewDocs(doctor); }}
              className="ad-btn ad-btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <FaFileAlt /> View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {doctor.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => { onApprove(doctor.id, doctor.name); onClose(); }}>
                <FaCheckCircle /> Approve Doctor
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => { onReject(doctor); onClose(); }}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HOSPITAL APPROVAL DETAILS MODAL
=================================================================== */
function HospitalApprovalDetailsModal({ hospital, onClose, onApprove, onReject, onViewDocs }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-hosp"><FaHospital /></div>
            <div>
              <h3 className="adv-drawer-title">{hospital.name}</h3>
              <span className="ad-id-badge">{hospital.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaBuilding />} title="Hospital Approval Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Hospital Name" value={hospital.name} />
            <DetailRow label="Hospital ID" value={hospital.id} />
            <DetailRow label="Email" value={hospital.email} />
            <DetailRow label="Phone" value={hospital.phone} />
            <DetailRow label="Location" value={hospital.location} />
            <DetailRow label="Registration Number">
              <code style={{ fontSize: "0.82rem" }}>{hospital.registrationNumber}</code>
            </DetailRow>
            <DetailRow label="Departments Count" value={`${hospital.departmentsCount} Departments`} />
            <DetailRow label="Beds Capacity" value={`${hospital.beds} Beds`} />
            <DetailRow label="Submitted Date" value={hospital.submittedDate} />
            <DetailRow label="Approval Status"><StatusPill status={hospital.approvalStatus} /></DetailRow>
          </div>

          <SectionTitle icon={<FaFlask />} title="Departments" />
          <div className="adv-tags-wrap">
            {hospital.departments?.map((d) => (
              <span key={d} className="adv-tag">{d}</span>
            ))}
          </div>

          <SectionTitle icon={<FaCertificate />} title="Submitted Verification Credentials" />
          <div style={{
            background: "var(--ad-bg-secondary)",
            borderRadius: "var(--ad-radius-md)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px dashed var(--ad-border-color)",
            marginBottom: "0.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaFileAlt style={{ color: "var(--ad-primary)", fontSize: "1.5rem" }} />
              <div>
                <strong style={{ fontSize: "0.85rem", display: "block" }}>{hospital.documents?.length || 0} Documents Submitted</strong>
                <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>Establishment Act License, Fire NOC, NABH Cert.</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onViewDocs(hospital); }}
              className="ad-btn ad-btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <FaFileAlt /> View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {hospital.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => { onApprove(hospital.id, hospital.name); onClose(); }}>
                <FaCheckCircle /> Approve Hospital
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => { onReject(hospital); onClose(); }}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   RETAIL PHARMACY APPROVAL DETAILS MODAL
=================================================================== */
function RetailPharmacyApprovalDetailsModal({ pharmacy, onClose, onApprove, onReject, onViewDocs }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-pharm"><FaPills /></div>
            <div>
              <h3 className="adv-drawer-title">{pharmacy.name}</h3>
              <span className="ad-id-badge">{pharmacy.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaPills />} title="Retail Pharmacy Approval Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Pharmacy Name" value={pharmacy.name} />
            <DetailRow label="Pharmacy ID" value={pharmacy.id} />
            <DetailRow label="Pharmacy Type">
              <span className="adv-type-badge">Retail Pharmacy</span>
            </DetailRow>
            <DetailRow label="Email Address" value={pharmacy.email} />
            <DetailRow label="Phone Number" value={pharmacy.phone} />
            <DetailRow label="Location" value={pharmacy.location} />
            <DetailRow label="License Number">
              <code style={{ fontSize: "0.82rem" }}>{pharmacy.licenseNumber}</code>
            </DetailRow>
            <DetailRow label="Submitted Date" value={pharmacy.submittedDate} />
            <DetailRow label="Approval Status"><StatusPill status={pharmacy.approvalStatus} /></DetailRow>
          </div>

          <SectionTitle icon={<FaCertificate />} title="Submitted Verification Credentials" />
          <div style={{
            background: "var(--ad-bg-secondary)",
            borderRadius: "var(--ad-radius-md)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px dashed var(--ad-border-color)",
            marginBottom: "0.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaFileAlt style={{ color: "var(--ad-primary)", fontSize: "1.5rem" }} />
              <div>
                <strong style={{ fontSize: "0.85rem", display: "block" }}>{pharmacy.documents?.length || 0} Documents Submitted</strong>
                <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>Form 20/21 Drug License, Pharmacist Registration</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onViewDocs(pharmacy); }}
              className="ad-btn ad-btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <FaFileAlt /> View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {pharmacy.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => { onApprove(pharmacy.id, pharmacy.name); onClose(); }}>
                <FaCheckCircle /> Approve Pharmacy
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => { onReject(pharmacy); onClose(); }}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HOSPITAL PHARMACY APPROVAL DETAILS MODAL
=================================================================== */
function HospitalPharmacyApprovalDetailsModal({ pharmacy, onClose, onApprove, onReject, onViewDocs }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-pharm"><FaPills /></div>
            <div>
              <h3 className="adv-drawer-title">{pharmacy.name}</h3>
              <span className="ad-id-badge">{pharmacy.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaPills />} title="Hospital Pharmacy Approval Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Pharmacy Name" value={pharmacy.name} />
            <DetailRow label="Pharmacy ID" value={pharmacy.id} />
            <DetailRow label="Pharmacy Type">
              <span className="adv-type-badge">Hospital Pharmacy</span>
            </DetailRow>
            <DetailRow label="Linked Hospital" value={pharmacy.linkedHospital} />
            <DetailRow label="Email Address" value={pharmacy.email} />
            <DetailRow label="Phone Number" value={pharmacy.phone} />
            <DetailRow label="Location" value={pharmacy.location} />
            <DetailRow label="License Number">
              <code style={{ fontSize: "0.82rem" }}>{pharmacy.licenseNumber}</code>
            </DetailRow>
            <DetailRow label="Submitted Date" value={pharmacy.submittedDate} />
            <DetailRow label="Approval Status"><StatusPill status={pharmacy.approvalStatus} /></DetailRow>
          </div>

          <SectionTitle icon={<FaCertificate />} title="Submitted Verification Credentials" />
          <div style={{
            background: "var(--ad-bg-secondary)",
            borderRadius: "var(--ad-radius-md)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px dashed var(--ad-border-color)",
            marginBottom: "0.5rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaFileAlt style={{ color: "var(--ad-primary)", fontSize: "1.5rem" }} />
              <div>
                <strong style={{ fontSize: "0.85rem", display: "block" }}>{pharmacy.documents?.length || 0} Documents Submitted</strong>
                <span style={{ fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>Institutional Drug License, Hospital MoU Authorization</span>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onViewDocs(pharmacy); }}
              className="ad-btn ad-btn-secondary"
              style={{ fontSize: "0.78rem", padding: "0.4rem 0.75rem" }}
            >
              <FaFileAlt /> View Documents
            </button>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {pharmacy.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => { onApprove(pharmacy.id, pharmacy.name); onClose(); }}>
                <FaCheckCircle /> Approve Pharmacy
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => { onReject(pharmacy); onClose(); }}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   MAIN COMPONENT: AdminApprovals
=================================================================== */
export default function AdminApprovals() {
  const [activeTab, setActiveTab] = useState("Pending Doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");

  // Approval datasets
  const [doctorApprovals, setDoctorApprovals] = useState(initialDoctorApprovals);
  const [hospitalApprovals, setHospitalApprovals] = useState(initialHospitalApprovals);
  const [retailPharmacyApprovals, setRetailPharmacyApprovals] = useState(initialRetailPharmacyApprovals);
  const [hospitalPharmacyApprovals, setHospitalPharmacyApprovals] = useState(initialHospitalPharmacyApprovals);

  // Modals state
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [selectedDocsItem, setSelectedDocsItem] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toast, setToast] = useState(null);

  // Activity audit log
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, text: "System initialized Approvals & Verification dashboard", time: "Just now", type: "system" },
  ]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const getActiveTabConfig = () => {
    switch (activeTab) {
      case "Pending Doctors":
        return {
          data: doctorApprovals,
          setter: setDoctorApprovals,
          typeLabel: "Doctor",
          badgeClass: "adv-avatar-doc"
        };
      case "Pending Hospitals":
        return {
          data: hospitalApprovals,
          setter: setHospitalApprovals,
          typeLabel: "Hospital",
          badgeClass: "adv-avatar-hosp"
        };
      case "Pending Retail Pharmacies":
        return {
          data: retailPharmacyApprovals,
          setter: setRetailPharmacyApprovals,
          typeLabel: "Retail Pharmacy",
          badgeClass: "adv-avatar-pharm"
        };
      case "Pending Hospital Pharmacies":
        return {
          data: hospitalPharmacyApprovals,
          setter: setHospitalPharmacyApprovals,
          typeLabel: "Hospital Pharmacy",
          badgeClass: "adv-avatar-pharm"
        };
      default:
        return { data: [], setter: null, typeLabel: "", badgeClass: "" };
    }
  };

  const { data, setter } = getActiveTabConfig();

  // Pending counts for tabs badges
  const pendingDoctorCount = doctorApprovals.filter(d => d.approvalStatus === "Pending").length;
  const pendingHospitalCount = hospitalApprovals.filter(h => h.approvalStatus === "Pending").length;
  const pendingRetailCount = retailPharmacyApprovals.filter(r => r.approvalStatus === "Pending").length;
  const pendingHospPharmCount = hospitalPharmacyApprovals.filter(p => p.approvalStatus === "Pending").length;

  // Actions
  const handleApprove = (id, name) => {
    if (!setter) return;
    setter(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, approvalStatus: "Approved" };
        }
        return item;
      })
    );

    const logMsg = `Approved registration for ${name} (${id}). Verification completed.`;
    triggerToast(logMsg);
    setActivityLogs(prev => [
      { id: Date.now(), text: logMsg, time: "Just now", type: "approved" },
      ...prev.slice(0, 9)
    ]);
  };

  const handleOpenRejectModal = (item) => {
    setRejectingItem(item);
    setRejectionReason("");
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectingItem || !setter) return;

    setter(prev =>
      prev.map(item => {
        if (item.id === rejectingItem.id) {
          return { ...item, approvalStatus: "Rejected", rejectionReason: rejectionReason.trim() };
        }
        return item;
      })
    );

    const logMsg = `Rejected registration for ${rejectingItem.name} (${rejectingItem.id}). Reason: ${rejectionReason || "Documentation non-compliant"}`;
    triggerToast(logMsg);
    setActivityLogs(prev => [
      { id: Date.now(), text: logMsg, time: "Just now", type: "rejected" },
      ...prev.slice(0, 9)
    ]);

    setRejectingItem(null);
    setRejectionReason("");
  };

  // Filter & Search Logic
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.email && item.email.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "All" || item.approvalStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Review licensing credentials, verify registration documentation, and moderate access requests</p>
      </div>

      {/* Floating Toast Alert */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#0f172a",
          color: "#fff",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          zIndex: 1100,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          animation: "adFadeIn 0.2s ease"
        }}>
          <FaShieldAlt style={{ color: "#10b981" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{toast}</span>
        </div>
      )}

      {/* 4 Central Tabs */}
      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {[
            { key: "Pending Doctors", count: pendingDoctorCount },
            { key: "Pending Hospitals", count: pendingHospitalCount },
            { key: "Pending Retail Pharmacies", count: pendingRetailCount },
            { key: "Pending Hospital Pharmacies", count: pendingHospPharmCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSearchQuery("");
              }}
              className={`ad-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            >
              {tab.key}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? "var(--ad-primary)" : "#e2e8f0",
                  color: activeTab === tab.key ? "#fff" : "#475569",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  padding: "0.1rem 0.45rem",
                  borderRadius: "10px",
                  marginLeft: "0.35rem"
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Card */}
      <div className="ad-card" style={{ padding: "1.25rem" }}>
        <div className="ad-search-filter-bar">
          <div className="ad-search-wrapper">
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by name, ID, email...`}
              className="ad-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ad-filters">
            <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FaFilter /> Status:
            </span>
            <select
              className="ad-select"
              style={{ width: "140px", padding: "0.45rem 0.75rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Pending">Pending ({data.filter(d => d.approvalStatus === "Pending").length})</option>
              <option value="Approved">Approved ({data.filter(d => d.approvalStatus === "Approved").length})</option>
              <option value="Rejected">Rejected ({data.filter(d => d.approvalStatus === "Rejected").length})</option>
              <option value="All">All Statuses ({data.length})</option>
            </select>
          </div>
        </div>

        {/* Dynamic Approvals Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type</th>
                <th>Email</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--ad-text-muted)" }}>
                    <FaShieldAlt style={{ fontSize: "2rem", color: "var(--ad-border-color)", display: "block", margin: "0 auto 0.75rem auto" }} />
                    No requests found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="adv-avatar" style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}>
                          {item.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong>{item.name}</strong>
                          {item.specialization && (
                            <span style={{ display: "block", fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>
                              {item.specialization}
                            </span>
                          )}
                          {item.linkedHospital && (
                            <span style={{ display: "block", fontSize: "0.74rem", color: "var(--ad-text-secondary)" }}>
                              {item.linkedHospital}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td><span className="ad-id-badge">{item.id}</span></td>

                    <td>
                      <span className="adv-type-badge">
                        {item.doctorType || item.pharmacyType || item.type}
                      </span>
                    </td>

                    <td>{item.email}</td>

                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "var(--ad-text-secondary)" }}>
                        <FaCalendarAlt style={{ fontSize: "0.75rem", color: "var(--ad-text-muted)" }} />
                        {item.submittedDate}
                      </span>
                    </td>

                    <td>
                      <StatusPill status={item.approvalStatus} />
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", alignItems: "center" }}>
                        {/* View Details Button */}
                        <button
                          onClick={() => setSelectedDetailsItem(item)}
                          className="ad-btn ad-btn-secondary"
                          title="View Application Details"
                          style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem" }}
                        >
                          <FaEye /> View Details
                        </button>

                        {/* View Documents Button */}
                        <button
                          onClick={() => setSelectedDocsItem(item)}
                          className="ad-btn ad-btn-outline"
                          title="View Uploaded Verification Documents"
                          style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem" }}
                        >
                          <FaFileAlt /> Documents
                        </button>

                        {/* Approve Button */}
                        {item.approvalStatus === "Pending" && (
                          <button
                            onClick={() => handleApprove(item.id, item.name)}
                            className="ad-btn adv-btn-approve"
                            title="Verify & Approve"
                            style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem" }}
                          >
                            <FaCheck /> Approve
                          </button>
                        )}

                        {/* Reject Button */}
                        {item.approvalStatus === "Pending" && (
                          <button
                            onClick={() => handleOpenRejectModal(item)}
                            className="ad-btn adv-btn-reject"
                            title="Reject Request"
                            style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem" }}
                          >
                            <FaTimes /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Verification Activity Log Section */}
      <div className="ad-card" style={{ padding: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FaHistory style={{ color: "var(--ad-primary)" }} /> Recent Verification Activity Log
          </h4>
          <span style={{ fontSize: "0.76rem", color: "var(--ad-text-muted)" }}>Live Session Audit Trail</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {activityLogs.map((log) => (
            <div
              key={log.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.6rem 0.85rem",
                background: "var(--ad-bg-secondary)",
                borderRadius: "var(--ad-radius-md)",
                fontSize: "0.82rem",
                borderLeft: `3px solid ${log.type === "approved" ? "#16a34a" : log.type === "rejected" ? "#dc2626" : "var(--ad-primary)"}`
              }}
            >
              <span style={{ color: "var(--ad-text-primary)" }}>{log.text}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--ad-text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <FaClock style={{ fontSize: "0.68rem" }} /> {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
         DETAIL MODALS PER ENTITY TYPE
      ================================================================ */}
      {selectedDetailsItem && activeTab === "Pending Doctors" && (
        <DoctorApprovalDetailsModal
          doctor={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
          onViewDocs={setSelectedDocsItem}
        />
      )}

      {selectedDetailsItem && activeTab === "Pending Hospitals" && (
        <HospitalApprovalDetailsModal
          hospital={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
          onViewDocs={setSelectedDocsItem}
        />
      )}

      {selectedDetailsItem && activeTab === "Pending Retail Pharmacies" && (
        <RetailPharmacyApprovalDetailsModal
          pharmacy={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
          onViewDocs={setSelectedDocsItem}
        />
      )}

      {selectedDetailsItem && activeTab === "Pending Hospital Pharmacies" && (
        <HospitalPharmacyApprovalDetailsModal
          pharmacy={selectedDetailsItem}
          onClose={() => setSelectedDetailsItem(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
          onViewDocs={setSelectedDocsItem}
        />
      )}

      {/* ================================================================
         VIEW DOCUMENTS MODAL
      ================================================================ */}
      {selectedDocsItem && (
        <ViewDocumentsModal
          item={selectedDocsItem}
          onClose={() => setSelectedDocsItem(null)}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
        />
      )}

      {/* ================================================================
         REJECTION REASON MODAL
      ================================================================ */}
      {rejectingItem && (
        <div className="ad-modal-backdrop" onClick={() => setRejectingItem(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h3 style={{ margin: 0 }}>Reject Verification Request</h3>
              <button className="ad-modal-close" onClick={() => setRejectingItem(null)}><FaTimes /></button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="ad-modal-body">
                <p style={{ fontSize: "0.85rem", color: "var(--ad-text-secondary)", marginBottom: "1rem" }}>
                  Please specify the reason for rejecting <strong>{rejectingItem.name}</strong> ({rejectingItem.id}). The applicant will be notified with this feedback.
                </p>
                <div className="ad-form-group">
                  <label htmlFor="rejectionReason">Rejection Reason / Required Corrections</label>
                  <textarea
                    id="rejectionReason"
                    rows="4"
                    className="ad-textarea"
                    placeholder="e.g. Uploaded state medical practitioner license is expired, establishment address proof mismatch, or document illegible."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="ad-modal-footer">
                <button type="submit" className="ad-btn ad-btn-primary" style={{ background: "#dc2626" }}>
                  Confirm Rejection
                </button>
                <button type="button" className="ad-btn ad-btn-outline" onClick={() => setRejectingItem(null)}>
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
