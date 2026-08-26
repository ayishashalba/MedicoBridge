import React, { useState } from "react";
import {
  FaSearch, FaEye, FaBan, FaCheck, FaFilter, FaTimes,
  FaUserMd, FaHospital, FaPills, FaUser,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaFileMedical,
  FaStethoscope, FaClipboardList, FaPhoneAlt, FaEnvelope,
  FaMapMarkerAlt, FaIdCard, FaBuilding, FaFlask, FaShieldAlt,
  FaDownload,
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import { sortDonorsByProximity, getProximityLabel } from "../../utils/locationProximity";
import "./AdminPages.css";

/* ===================================================================
   PATIENTS DATA
=================================================================== */
const initialPatients = [
  {
    id: "PAT-101", name: "Aarav Sharma", email: "aarav.sharma@example.com",
    phone: "+91 98765 43210", city: "Mumbai", status: "Active", joined: "10 Mar 2026",
    dob: "14 Jun 1994", gender: "Male", bloodGroup: "O+",
    emergencyContact: "+91 91234 56789",
    assignedDoctor: "Dr. Priya Mehta", assignedDoctorType: "Hospital Doctor", assignedFacility: "City Care Hospital",
    appointmentHistory: [
      { date: "12 Mar 2026", doctor: "Dr. Priya Mehta", reason: "Fever & Cold", status: "Completed" },
      { date: "28 Apr 2026", doctor: "Dr. Priya Mehta", reason: "Follow-up", status: "Completed" },
      { date: "15 Jun 2026", doctor: "Dr. Priya Mehta", reason: "Routine Check", status: "Upcoming" },
    ],
    medicalRecords: [
      { date: "12 Mar 2026", type: "Diagnosis", notes: "Viral Fever — prescribed antivirals" },
      { date: "28 Apr 2026", type: "Lab Report", notes: "CBC normal, no anomalies" },
    ],
    prescriptionHistory: [
      { date: "12 Mar 2026", medicine: "Paracetamol 500mg", doctor: "Dr. Priya Mehta", duration: "5 days" },
      { date: "28 Apr 2026", medicine: "Vitamin C 1000mg", doctor: "Dr. Priya Mehta", duration: "30 days" },
    ],
  },
  {
    id: "PAT-102", name: "Sunita Rao", email: "sunita.rao@example.com",
    phone: "+91 87654 32109", city: "Bangalore", status: "Active", joined: "12 Mar 2026",
    dob: "02 Sep 1988", gender: "Female", bloodGroup: "A+",
    emergencyContact: "+91 80123 45678",
    assignedDoctor: "Dr. Anil Kumar", assignedDoctorType: "Clinic Doctor", assignedFacility: "Wellness Clinic",
    appointmentHistory: [
      { date: "15 Mar 2026", doctor: "Dr. Anil Kumar", reason: "Skin Rash", status: "Completed" },
    ],
    medicalRecords: [
      { date: "15 Mar 2026", type: "Diagnosis", notes: "Eczema — prescribed topical cream" },
    ],
    prescriptionHistory: [
      { date: "15 Mar 2026", medicine: "Hydrocortisone 1% Cream", doctor: "Dr. Anil Kumar", duration: "2 weeks" },
    ],
  },
  {
    id: "PAT-103", name: "Rohan Verma", email: "rohan.verma@example.com",
    phone: "+91 76543 21098", city: "Delhi", status: "Blocked", joined: "15 Apr 2026",
    dob: "30 Jan 2000", gender: "Male", bloodGroup: "B-",
    emergencyContact: "+91 70123 45678",
    assignedDoctor: "N/A", assignedDoctorType: "None", assignedFacility: "None",
    appointmentHistory: [], medicalRecords: [], prescriptionHistory: [],
  },
  {
    id: "PAT-104", name: "Lakshmi Nair", email: "lakshmi.nair@example.com",
    phone: "+91 65432 10987", city: "Kochi", status: "Active", joined: "22 May 2026",
    dob: "17 Nov 1979", gender: "Female", bloodGroup: "AB+",
    emergencyContact: "+91 60123 45678",
    assignedDoctor: "Dr. Sara Thomas", assignedDoctorType: "Hospital Doctor", assignedFacility: "Metro General Hospital",
    appointmentHistory: [
      { date: "25 May 2026", doctor: "Dr. Sara Thomas", reason: "Hypertension Review", status: "Completed" },
      { date: "10 Jul 2026", doctor: "Dr. Sara Thomas", reason: "Monthly Check", status: "Upcoming" },
    ],
    medicalRecords: [
      { date: "25 May 2026", type: "Diagnosis", notes: "Stage 1 Hypertension — lifestyle changes advised" },
    ],
    prescriptionHistory: [
      { date: "25 May 2026", medicine: "Amlodipine 5mg", doctor: "Dr. Sara Thomas", duration: "Ongoing" },
    ],
  },
  {
    id: "PAT-105", name: "Karan Malhotra", email: "karan.m@example.com",
    phone: "+91 54321 09876", city: "Pune", status: "Active", joined: "01 Jun 2026",
    dob: "08 Mar 1995", gender: "Male", bloodGroup: "O-",
    emergencyContact: "+91 50123 45678",
    assignedDoctor: "Dr. Anil Kumar", assignedDoctorType: "Clinic Doctor", assignedFacility: "Pune Care Clinic",
    appointmentHistory: [
      { date: "05 Jun 2026", doctor: "Dr. Anil Kumar", reason: "Acne Treatment", status: "Completed" },
    ],
    medicalRecords: [
      { date: "05 Jun 2026", type: "Diagnosis", notes: "Moderate acne vulgaris — topical retinoid prescribed" },
    ],
    prescriptionHistory: [
      { date: "05 Jun 2026", medicine: "Tretinoin 0.025% Gel", doctor: "Dr. Anil Kumar", duration: "8 weeks" },
    ],
  },
];

/* ===================================================================
   DOCTORS DATA
=================================================================== */
const initialDoctors = [
  {
    id: "DOC-201", name: "Dr. Priya Mehta", email: "priya.mehta@example.com",
    phone: "+91 99112 23344", specialty: "Pediatrics", bloodGroup: "O+",
    qualification: "MBBS, MD (Pediatrics)", experience: "12 Years",
    doctorType: "Hospital Doctor", facility: "City Care Hospital",
    department: "Pediatrics", licenseNumber: "MCI-PED-20145",
    consultationFee: "₹800", availability: "Mon–Fri, 9 AM–5 PM",
    approvalStatus: "Approved", status: "Active", verified: "Yes",
    appointmentCount: 148, patientCount: 62,
  },
  {
    id: "DOC-202", name: "Dr. Anil Kumar", email: "anil.kumar@example.com",
    phone: "+91 88223 34455", specialty: "Dermatology", bloodGroup: "A+",
    qualification: "MBBS, DVD", experience: "8 Years",
    doctorType: "Clinic Doctor", facility: "Wellness Clinic",
    department: "Dermatology OPD", licenseNumber: "MCI-DRM-30291",
    consultationFee: "₹600", availability: "Mon–Sat, 10 AM–6 PM",
    approvalStatus: "Approved", status: "Active", verified: "Yes",
    appointmentCount: 210, patientCount: 95,
  },
  {
    id: "DOC-203", name: "Dr. Sara Thomas", email: "sara.thomas@example.com",
    phone: "+91 77334 45566", specialty: "General Medicine", bloodGroup: "B+",
    qualification: "MBBS, DNB (Gen Medicine)", experience: "5 Years",
    doctorType: "Hospital Doctor", facility: "Metro General Hospital",
    department: "General Medicine", licenseNumber: "MCI-GM-41882",
    consultationFee: "₹500", availability: "Tue, Thu, Sat — 8 AM–2 PM",
    approvalStatus: "Pending", status: "Pending", verified: "No",
    appointmentCount: 0, patientCount: 0,
  },
  {
    id: "DOC-204", name: "Dr. Rajiv Kapoor", email: "rajiv.kapoor@example.com",
    phone: "+91 66445 56677", specialty: "Orthopedics", bloodGroup: "",
    qualification: "MBBS, MS (Ortho)", experience: "15 Years",
    doctorType: "Clinic Doctor", facility: "Pune Care Clinic",
    department: "Orthopedics OPD", licenseNumber: "MCI-ORT-55930",
    consultationFee: "₹1200", availability: "Mon–Fri, 11 AM–7 PM",
    approvalStatus: "Approved", status: "Blocked", verified: "Yes",
    appointmentCount: 320, patientCount: 140,
  },
];

/* ===================================================================
   HOSPITALS DATA
=================================================================== */
const initialHospitals = [
  {
    id: "HSP-301", name: "City Care Hospital", email: "contact@citycare.org",
    phone: "+91 44 2234 5678", address: "12, Park Road, Adyar", city: "Chennai",
    registrationNumber: "TN-HOSP-20210012", beds: "120",
    approvalStatus: "Approved", status: "Active", verified: "Yes", joined: "14 Jan 2021",
    linkedDoctors: 15, linkedPharmacies: 2,
    departments: ["Pediatrics", "Orthopedics", "Cardiology", "General Medicine"],
    totalPatients: 1240, hasPharmacy: true,
    appointmentStats: { monthly: 340, completed: 290, cancelled: 50 },
  },
  {
    id: "HSP-302", name: "St. Stephens Clinic", email: "info@ststephens.com",
    phone: "+91 11 3344 5566", address: "45, Church Road, Connaught Place", city: "Delhi",
    registrationNumber: "DL-HOSP-20220305", beds: "45",
    approvalStatus: "Pending", status: "Pending", verified: "No", joined: "08 Feb 2022",
    linkedDoctors: 5, linkedPharmacies: 0,
    departments: ["General Medicine", "ENT"],
    totalPatients: 0, hasPharmacy: false,
    appointmentStats: { monthly: 0, completed: 0, cancelled: 0 },
  },
  {
    id: "HSP-303", name: "Metro General Hospital", email: "metro.hosp@metro.in",
    phone: "+91 40 6677 8899", address: "78, Banjara Hills, Road 5", city: "Hyderabad",
    registrationNumber: "TS-HOSP-20190087", beds: "350",
    approvalStatus: "Approved", status: "Active", verified: "Yes", joined: "22 Jul 2019",
    linkedDoctors: 42, linkedPharmacies: 4,
    departments: ["Oncology", "Neurology", "Cardiology", "Orthopedics", "General Medicine", "Gynecology"],
    totalPatients: 8740, hasPharmacy: true,
    appointmentStats: { monthly: 1280, completed: 1100, cancelled: 180 },
  },
  {
    id: "HSP-304", name: "Fortis Health Clinic", email: "reachus@fortis.com",
    phone: "+91 22 5566 7788", address: "9, Linking Road, Bandra West", city: "Mumbai",
    registrationNumber: "MH-HOSP-20200198", beds: "80",
    approvalStatus: "Approved", status: "Blocked", verified: "Yes", joined: "30 Apr 2020",
    linkedDoctors: 12, linkedPharmacies: 1,
    departments: ["Dermatology", "General Medicine", "Physiotherapy"],
    totalPatients: 2300, hasPharmacy: true,
    appointmentStats: { monthly: 210, completed: 180, cancelled: 30 },
  },
];

/* ===================================================================
   PHARMACIES DATA (Retail & Hospital only)
=================================================================== */
const initialPharmacies = [
  {
    id: "PHR-401", name: "MediCare Pharmacy", email: "medicare.rx@gmail.com",
    phone: "+91 33 2212 3344", address: "22, Park Street, Park Circus", city: "Kolkata",
    license: "LIC-PH-99411", approvalStatus: "Approved", status: "Active", verified: "Yes",
    pharmacyType: "Retail Pharmacy", linkedHospital: null,
    medicinesCount: 1240, ordersCount: 3850, inventoryCount: null, prescriptionRequests: null,
  },
  {
    id: "PHR-402", name: "Apollo Pharmacy Store", email: "apollo.store5@apollo.in",
    phone: "+91 80 4455 6677", address: "HSP-303 Campus, Road 5", city: "Hyderabad",
    license: "LIC-PH-82410", approvalStatus: "Approved", status: "Active", verified: "Yes",
    pharmacyType: "Hospital Pharmacy", linkedHospital: "Metro General Hospital",
    medicinesCount: null, ordersCount: 2100, inventoryCount: 580, prescriptionRequests: 410,
  },
];

/* ===================================================================
   SHARED HELPERS
=================================================================== */
const statusColors = {
  Active:   { bg: "#dcfce7", color: "#16a34a" },
  Blocked:  { bg: "#fee2e2", color: "#dc2626" },
  Pending:  { bg: "#fef3c7", color: "#d97706" },
  Approved: { bg: "#dbeafe", color: "#1d4ed8" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
  Completed:{ bg: "#dcfce7", color: "#16a34a" },
  Upcoming: { bg: "#fef3c7", color: "#d97706" },
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
   PATIENT DETAIL MODAL
=================================================================== */
function PatientDetailModal({ patient, onClose, onToggleStatus }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar">
              {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="adv-drawer-title">{patient.name}</h3>
              <span className="ad-id-badge">{patient.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaUser />} title="Basic Information" />
          <div className="adv-detail-grid">
            <DetailRow label="Full Name" value={patient.name} />
            <DetailRow label="Patient ID" value={patient.id} />
            <DetailRow label="Email" value={patient.email} />
            <DetailRow label="Phone" value={patient.phone} />
            <DetailRow label="City" value={patient.city} />
            <DetailRow label="Date of Birth" value={patient.dob} />
            <DetailRow label="Gender" value={patient.gender} />
            <DetailRow label="Blood Group">
              <span className="adv-blood-badge">{patient.bloodGroup}</span>
            </DetailRow>
            <DetailRow label="Emergency Contact" value={patient.emergencyContact} />
            <DetailRow label="Account Status"><StatusPill status={patient.status} /></DetailRow>
            <DetailRow label="Joined Date" value={patient.joined} />
          </div>

          <SectionTitle icon={<FaUserMd />} title="Assigned Doctor &amp; Facility" />
          <div className="adv-detail-grid">
            <DetailRow label="Assigned Doctor" value={patient.assignedDoctor} />
            <DetailRow label="Doctor Type" value={patient.assignedDoctorType} />
            <DetailRow label="Hospital / Clinic" value={patient.assignedFacility} />
          </div>

          <SectionTitle icon={<FaCalendarAlt />} title="Appointment History" />
          {patient.appointmentHistory.length === 0 ? (
            <p className="adv-empty-msg">No appointments on record.</p>
          ) : (
            <div className="adv-history-table-wrap">
              <table className="adv-mini-table">
                <thead><tr><th>Date</th><th>Doctor</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {patient.appointmentHistory.map((a, i) => (
                    <tr key={i}>
                      <td>{a.date}</td><td>{a.doctor}</td><td>{a.reason}</td>
                      <td><StatusPill status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <SectionTitle icon={<FaFileMedical />} title="Medical Records" />
          {patient.medicalRecords.length === 0 ? (
            <p className="adv-empty-msg">No medical records available.</p>
          ) : (
            <div className="adv-records-list">
              {patient.medicalRecords.map((r, i) => (
                <div key={i} className="adv-record-card">
                  <div className="adv-record-meta">
                    <span className="adv-record-type">{r.type}</span>
                    <span className="adv-record-date">{r.date}</span>
                  </div>
                  <p className="adv-record-notes">{r.notes}</p>
                </div>
              ))}
            </div>
          )}

          <SectionTitle icon={<FaPills />} title="Prescription History" />
          {patient.prescriptionHistory.length === 0 ? (
            <p className="adv-empty-msg">No prescriptions on record.</p>
          ) : (
            <div className="adv-history-table-wrap">
              <table className="adv-mini-table">
                <thead><tr><th>Date</th><th>Medicine</th><th>Prescribed By</th><th>Duration</th></tr></thead>
                <tbody>
                  {patient.prescriptionHistory.map((p, i) => (
                    <tr key={i}>
                      <td>{p.date}</td><td>{p.medicine}</td><td>{p.doctor}</td><td>{p.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${patient.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
            onClick={() => onToggleStatus(patient.id)}
          >
            {patient.status === "Active" ? <><FaBan /> Block Patient</> : <><FaCheck /> Activate Patient</>}
          </button>
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   DOCTOR DETAIL MODAL
=================================================================== */
function DoctorDetailModal({ doctor, onClose, onToggleStatus, onApprove, onReject }) {
  return (
    <div className="adv-drawer-backdrop" onClick={onClose}>
      <div className="adv-drawer adv-drawer-wide" onClick={(e) => e.stopPropagation()}>
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar adv-avatar-doc">
              {doctor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="adv-drawer-title">{doctor.name}</h3>
              <span className="ad-id-badge">{doctor.id}</span>
            </div>
          </div>
          <button className="ad-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="adv-drawer-body">
          <SectionTitle icon={<FaStethoscope />} title="Professional Details" />
          <div className="adv-detail-grid">
            <DetailRow label="Doctor Name" value={doctor.name} />
            <DetailRow label="Doctor ID" value={doctor.id} />
            <DetailRow label="Doctor Type" value={doctor.doctorType} />
            <DetailRow label="Specialization" value={doctor.specialty} />
            <DetailRow label="Blood Group">
              {doctor.bloodGroup ? <span className="adv-blood-badge">{doctor.bloodGroup}</span> : "Not provided"}
            </DetailRow>
            <DetailRow label="Qualification" value={doctor.qualification} />
            <DetailRow label="Experience" value={doctor.experience} />
            <DetailRow label="Hospital / Clinic" value={doctor.facility} />
            <DetailRow label="Department" value={doctor.department} />
            <DetailRow label="License Number">
              <code style={{ fontSize: "0.82rem" }}>{doctor.licenseNumber}</code>
            </DetailRow>
            <DetailRow label="Consultation Fee" value={doctor.consultationFee} />
            <DetailRow label="Availability" value={doctor.availability} />
          </div>

          <SectionTitle icon={<FaShieldAlt />} title="Status &amp; Approvals" />
          <div className="adv-detail-grid">
            <DetailRow label="Approval Status"><StatusPill status={doctor.approvalStatus} /></DetailRow>
            <DetailRow label="Account Status"><StatusPill status={doctor.status} /></DetailRow>
          </div>

          <SectionTitle icon={<FaClipboardList />} title="Activity" />
          <div className="adv-stat-cards">
            <div className="adv-stat-card">
              <span className="adv-stat-value">{doctor.appointmentCount}</span>
              <span className="adv-stat-label">Total Appointments</span>
            </div>
            <div className="adv-stat-card">
              <span className="adv-stat-value">{doctor.patientCount}</span>
              <span className="adv-stat-label">Total Patients</span>
            </div>
          </div>

          <SectionTitle icon={<FaEnvelope />} title="Contact" />
          <div className="adv-detail-grid">
            <DetailRow label="Email" value={doctor.email} />
            <DetailRow label="Phone" value={doctor.phone} />
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {doctor.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => onApprove(doctor.id)}>
                <FaCheckCircle /> Approve
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => onReject(doctor.id)}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          {doctor.approvalStatus === "Approved" && (
            <button
              className={`ad-btn ${doctor.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
              onClick={() => onToggleStatus(doctor.id)}
            >
              {doctor.status === "Active" ? <><FaBan /> Deactivate</> : <><FaCheck /> Activate</>}
            </button>
          )}
          {doctor.approvalStatus === "Rejected" && (
            <button className="ad-btn adv-btn-approve" onClick={() => onApprove(doctor.id)}>
              <FaCheckCircle /> Re-Approve
            </button>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   HOSPITAL DETAIL MODAL
=================================================================== */
function HospitalDetailModal({ hospital, onClose, onToggleStatus, onApprove, onReject }) {
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
          <SectionTitle icon={<FaBuilding />} title="Hospital Information" />
          <div className="adv-detail-grid">
            <DetailRow label="Hospital Name" value={hospital.name} />
            <DetailRow label="Hospital ID" value={hospital.id} />
            <DetailRow label="Email" value={hospital.email} />
            <DetailRow label="Phone" value={hospital.phone} />
            <DetailRow label="Address" value={hospital.address} />
            <DetailRow label="City" value={hospital.city} />
            <DetailRow label="Registration No.">
              <code style={{ fontSize: "0.82rem" }}>{hospital.registrationNumber}</code>
            </DetailRow>
            <DetailRow label="Joined Date" value={hospital.joined} />
          </div>

          <SectionTitle icon={<FaShieldAlt />} title="Status &amp; Approvals" />
          <div className="adv-detail-grid">
            <DetailRow label="Approval Status"><StatusPill status={hospital.approvalStatus} /></DetailRow>
            <DetailRow label="Account Status"><StatusPill status={hospital.status} /></DetailRow>
          </div>

          <SectionTitle icon={<FaFlask />} title="Departments" />
          <div className="adv-tags-wrap">
            {hospital.departments.map((d) => (
              <span key={d} className="adv-tag">{d}</span>
            ))}
          </div>

          <SectionTitle icon={<FaClipboardList />} title="Hospital Statistics" />
          <div className="adv-stat-cards">
            <div className="adv-stat-card">
              <span className="adv-stat-value">{hospital.linkedDoctors}</span>
              <span className="adv-stat-label">Total Doctors</span>
            </div>
            <div className="adv-stat-card">
              <span className="adv-stat-value">{hospital.totalPatients.toLocaleString()}</span>
              <span className="adv-stat-label">Total Patients</span>
            </div>
            <div className="adv-stat-card">
              <span className="adv-stat-value">{hospital.linkedPharmacies}</span>
              <span className="adv-stat-label">Linked Pharmacies</span>
            </div>
          </div>

          <SectionTitle icon={<FaPills />} title="Hospital Pharmacy" />
          <div className="adv-detail-grid">
            <DetailRow label="Has On-Site Pharmacy">{hospital.hasPharmacy ? "Yes" : "No"}</DetailRow>
          </div>

          <SectionTitle icon={<FaCalendarAlt />} title="Appointment Statistics" />
          <div className="adv-stat-cards">
            <div className="adv-stat-card">
              <span className="adv-stat-value">{hospital.appointmentStats.monthly}</span>
              <span className="adv-stat-label">Monthly Appointments</span>
            </div>
            <div className="adv-stat-card adv-stat-success">
              <span className="adv-stat-value">{hospital.appointmentStats.completed}</span>
              <span className="adv-stat-label">Completed</span>
            </div>
            <div className="adv-stat-card adv-stat-danger">
              <span className="adv-stat-value">{hospital.appointmentStats.cancelled}</span>
              <span className="adv-stat-label">Cancelled</span>
            </div>
          </div>
        </div>

        <div className="adv-drawer-footer adv-drawer-footer-wrap">
          {hospital.approvalStatus === "Pending" && (
            <>
              <button className="ad-btn adv-btn-approve" onClick={() => onApprove(hospital.id)}>
                <FaCheckCircle /> Approve
              </button>
              <button className="ad-btn adv-btn-reject" onClick={() => onReject(hospital.id)}>
                <FaTimesCircle /> Reject
              </button>
            </>
          )}
          {hospital.approvalStatus === "Approved" && (
            <button
              className={`ad-btn ${hospital.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
              onClick={() => onToggleStatus(hospital.id)}
            >
              {hospital.status === "Active" ? <><FaBan /> Deactivate</> : <><FaCheck /> Activate</>}
            </button>
          )}
          {hospital.approvalStatus === "Rejected" && (
            <button className="ad-btn adv-btn-approve" onClick={() => onApprove(hospital.id)}>
              <FaCheckCircle /> Re-Approve
            </button>
          )}
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   PHARMACY DETAIL MODAL
=================================================================== */
function PharmacyDetailModal({ pharmacy, onClose, onToggleStatus }) {
  const isRetail = pharmacy.pharmacyType === "Retail Pharmacy";
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
          <SectionTitle icon={<FaPills />} title="Pharmacy Information" />
          <div className="adv-detail-grid">
            <DetailRow label="Pharmacy Name" value={pharmacy.name} />
            <DetailRow label="Pharmacy ID" value={pharmacy.id} />
            <DetailRow label="Pharmacy Type">
              <span className="adv-type-badge">{pharmacy.pharmacyType}</span>
            </DetailRow>
            {!isRetail && (
              <DetailRow label="Linked Hospital" value={pharmacy.linkedHospital} />
            )}
            <DetailRow label="Email" value={pharmacy.email} />
            <DetailRow label="Phone" value={pharmacy.phone} />
            <DetailRow label="Address" value={pharmacy.address} />
            {isRetail && <DetailRow label="City" value={pharmacy.city} />}
            <DetailRow label="License Number">
              <code style={{ fontSize: "0.82rem" }}>{pharmacy.license}</code>
            </DetailRow>
          </div>

          <SectionTitle icon={<FaShieldAlt />} title="Status &amp; Approvals" />
          <div className="adv-detail-grid">
            <DetailRow label="Approval Status"><StatusPill status={pharmacy.approvalStatus} /></DetailRow>
            <DetailRow label="Account Status"><StatusPill status={pharmacy.status} /></DetailRow>
          </div>

          <SectionTitle icon={<FaClipboardList />} title="Activity Statistics" />
          <div className="adv-stat-cards">
            {isRetail ? (
              <>
                <div className="adv-stat-card">
                  <span className="adv-stat-value">{pharmacy.medicinesCount?.toLocaleString()}</span>
                  <span className="adv-stat-label">Medicines Count</span>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-value">{pharmacy.ordersCount?.toLocaleString()}</span>
                  <span className="adv-stat-label">Orders Count</span>
                </div>
              </>
            ) : (
              <>
                <div className="adv-stat-card">
                  <span className="adv-stat-value">{pharmacy.inventoryCount?.toLocaleString()}</span>
                  <span className="adv-stat-label">Inventory Count</span>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-value">{pharmacy.prescriptionRequests?.toLocaleString()}</span>
                  <span className="adv-stat-label">Prescription Requests</span>
                </div>
                <div className="adv-stat-card">
                  <span className="adv-stat-value">{pharmacy.ordersCount?.toLocaleString()}</span>
                  <span className="adv-stat-label">Orders Count</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${pharmacy.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
            onClick={() => onToggleStatus(pharmacy.id)}
          >
            {pharmacy.status === "Active"
              ? <><FaBan /> Block Pharmacy</>
              : <><FaCheck /> Activate Pharmacy</>}
          </button>
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   MAIN COMPONENT
=================================================================== */
export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("Patients");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All Blood Groups");
  const [locationInput, setLocationInput] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [patients, setPatients] = useState(initialPatients);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [pharmacies, setPharmacies] = useState(initialPharmacies);

  const getActiveData = () => {
    switch (activeTab) {
      case "Patients":   return { data: patients,   setter: setPatients };
      case "Doctors":    return { data: doctors,    setter: setDoctors };
      case "Hospitals":  return { data: hospitals,  setter: setHospitals };
      case "Pharmacies": return { data: pharmacies, setter: setPharmacies };
      default:           return { data: [],          setter: null };
    }
  };

  const { data, setter } = getActiveData();

  const handleToggleStatus = (id) => {
    if (!setter) return;
    setter((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "Active" ? "Blocked" : "Active";
          if (selectedUser && selectedUser.id === id) {
            setSelectedUser({ ...selectedUser, status: nextStatus });
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleApprove = (id) => {
    setter((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, approvalStatus: "Approved", status: "Active" };
          if (selectedUser && selectedUser.id === id) setSelectedUser(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const handleReject = (id) => {
    setter((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, approvalStatus: "Rejected", status: "Blocked" };
          if (selectedUser && selectedUser.id === id) setSelectedUser(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const filteredData = React.useMemo(() => {
    let result = data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      let matchesBloodGroup = true;
      let matchesDonorAvailability = true;
      if (
        (activeTab === "Patients" || activeTab === "Doctors") &&
        bloodGroupFilter &&
        bloodGroupFilter !== "All Blood Groups" &&
        bloodGroupFilter !== "All"
      ) {
        const bg = item.bloodGroup || "Not Provided";
        matchesBloodGroup = bg === bloodGroupFilter;
        // Automatic rule: exclude unavailable donors when searching by blood group
        matchesDonorAvailability = item.isDonorAvailable !== false;
      }

      return matchesSearch && matchesStatus && matchesBloodGroup && matchesDonorAvailability;
    });

    // When a blood group is selected, sort by proximity to the active location (if provided)
    if (
      (activeTab === "Patients" || activeTab === "Doctors") &&
      bloodGroupFilter &&
      bloodGroupFilter !== "All Blood Groups" &&
      bloodGroupFilter !== "All"
    ) {
      const origin = activeLocation.trim() || "Kozhikode";
      result = sortDonorsByProximity(result, origin);
    }

    return result;
  }, [data, searchQuery, statusFilter, bloodGroupFilter, activeLocation, activeTab]);

  const handleDownloadReport = () => {
    let cols = [];
    if (activeTab === "Patients") {
      cols = [
        { header: "Patient ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Phone", dataKey: "phone" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "City", dataKey: "city" },
        { header: "Status", dataKey: "status" },
      ];
    } else if (activeTab === "Doctors") {
      cols = [
        { header: "Doctor ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Doctor Type", dataKey: "doctorType" },
        { header: "Specialty", dataKey: "specialty" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "Status", dataKey: "status" },
      ];
    } else if (activeTab === "Hospitals") {
      cols = [
        { header: "Hospital ID", dataKey: "id" },
        { header: "Hospital Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "City", dataKey: "city" },
        { header: "Beds", dataKey: "beds" },
        { header: "Status", dataKey: "status" },
      ];
    } else {
      cols = [
        { header: "Pharmacy ID", dataKey: "id" },
        { header: "Pharmacy Name", dataKey: "name" },
        { header: "Type", dataKey: "pharmacyType" },
        { header: "License", dataKey: "license" },
        { header: "Email", dataKey: "email" },
        { header: "Status", dataKey: "status" },
      ];
    }

    generateBloodGroupReport({
      title: `Admin ${activeTab} Report`,
      selectedBloodGroup: (activeTab === "Patients" || activeTab === "Doctors") ? bloodGroupFilter : "N/A",
      generatedBy: "System Administrator (Admin)",
      columns: cols,
      data: filteredData,
      activeFilters: { Tab: activeTab, Status: statusFilter, Search: searchQuery },
    });
  };

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>Register, inspect, and moderate all platform participants</p>
      </div>

      {/* Tabs */}
      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {["Patients", "Doctors", "Hospitals", "Pharmacies"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery("");
                setStatusFilter("All");
                setBloodGroupFilter("All Blood Groups");
                setLocationInput("");
                setActiveLocation("");
              }}
              className={`ad-tab-btn ${activeTab === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="ad-card" style={{ padding: "1.25rem" }}>
        <div className="ad-search-filter-bar" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
          <div className="ad-search-wrapper" style={{ flex: 1, minWidth: "240px" }}>
            <FaSearch className="ad-search-icon" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by ID, name, email...`}
              className="ad-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {(activeTab === "Patients" || activeTab === "Doctors") && (
            <div className="ad-filters" style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <FaFilter /> Blood Group:
                </span>
                <select
                  className="ad-select"
                  style={{ width: "160px", padding: "0.45rem 0.75rem" }}
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                >
                  <option value="All Blood Groups">All Blood Groups</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Provided"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              {bloodGroupFilter !== "All Blood Groups" && bloodGroupFilter !== "All" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <FaMapMarkerAlt style={{ color: "#0d9488" }} /> Location:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <div className="ad-search-wrapper" style={{ flex: "none", minWidth: "180px" }}>
                      <FaMapMarkerAlt className="ad-search-icon" style={{ color: "#0d9488" }} />
                      <input
                        type="text"
                        placeholder="e.g. Kozhikode..."
                        className="ad-input"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") setActiveLocation(locationInput.trim()); }}
                      />
                    </div>
                    <button
                      className="ad-btn ad-btn-primary"
                      onClick={() => setActiveLocation(locationInput.trim())}
                      title="Search by Location"
                      style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: "6px", padding: "0.45rem 0.75rem", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap" }}
                    >
                      <FaSearch /> Search
                    </button>
                  </div>
                  {activeLocation && (
                    <span style={{ fontSize: "0.75rem", color: "#0d9488", fontWeight: "500", marginTop: "0.1rem" }}>
                      Sorted nearest to: <strong>{activeLocation}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="ad-filters">
            <span style={{ fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <FaFilter /> Status:
            </span>
            <select
              className="ad-select"
              style={{ width: "130px", padding: "0.45rem 0.75rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <button
            className="ad-btn ad-btn-primary"
            onClick={handleDownloadReport}
            title="Download Filtered Report"
            style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: "6px", padding: "0.45rem 0.85rem", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <FaDownload /> Download Report
          </button>
        </div>

        {/* Dynamic Table */}
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              {activeTab === "Patients" && (
                <tr>
                  <th>Patient ID</th><th>Name</th><th>Email</th>
                  <th>Phone</th><th>City</th><th>Blood Group</th><th>Status</th><th>Actions</th>
                </tr>
              )}
              {activeTab === "Doctors" && (
                <tr>
                  <th>Doctor ID</th><th>Name</th><th>Email</th>
                  <th>Type</th><th>Specialty</th><th>Blood Group</th><th>Status</th><th>Actions</th>
                </tr>
              )}
              {activeTab === "Hospitals" && (
                <tr>
                  <th>Hospital ID</th><th>Hospital Name</th><th>Email</th>
                  <th>City</th><th>Beds</th><th>Status</th><th>Actions</th>
                </tr>
              )}
              {activeTab === "Pharmacies" && (
                <tr>
                  <th>Pharmacy ID</th><th>Pharmacy Name</th><th>Type</th>
                  <th>License Number</th><th>Email</th><th>City</th><th>Status</th><th>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2.5rem", color: "var(--ad-text-muted)" }}>
                    No users found for the selected blood group.
                  </td>
                </tr>
              ) : (
                filteredData.map((user) => (
                  <tr key={user.id}>
                    <td><span className="ad-id-badge">{user.id}</span></td>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>

                    {activeTab === "Patients" && (
                      <>
                        <td>{user.phone}</td>
                        <td>{user.city}</td>
                        <td>
                          <span className="adv-blood-badge" style={{ background: "#fef2f2", color: "#dc2626", fontWeight: "600", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", border: "1px solid #fecaca" }}>
                            {user.bloodGroup || "Not Provided"}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === "Doctors" && (
                      <>
                        <td>{user.doctorType}</td>
                        <td>{user.specialty}</td>
                        <td>
                          <span className="adv-blood-badge" style={{ background: "#fef2f2", color: "#dc2626", fontWeight: "600", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", border: "1px solid #fecaca" }}>
                            {user.bloodGroup || "Not Provided"}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === "Hospitals" && (
                      <>
                        <td>{user.city}</td>
                        <td>{user.beds} Beds</td>
                      </>
                    )}
                    {activeTab === "Pharmacies" && (
                      <>
                        <td>{user.pharmacyType}</td>
                        <td><code>{user.license}</code></td>
                        <td>{user.city}</td>
                      </>
                    )}

                    <td>
                      <span className="ad-pill" style={{
                        background: user.status === "Active" ? "#dcfce7" : user.status === "Pending" ? "#fef3c7" : "#fee2e2",
                        color: user.status === "Active" ? "#16a34a" : user.status === "Pending" ? "#d97706" : "#dc2626"
                      }}>{user.status}</span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="ad-btn ad-btn-secondary"
                          title="Inspect Details"
                          style={{ padding: "0.35rem", borderRadius: "6px" }}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`ad-btn ${user.status === "Active" ? "ad-btn-danger" : "ad-btn-primary"}`}
                          title={user.status === "Active" ? "Block User" : "Activate User"}
                          style={{ padding: "0.35rem", borderRadius: "6px" }}
                        >
                          {user.status === "Active" ? <FaBan /> : <FaCheck />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawers */}
      {selectedUser && activeTab === "Patients" && (
        <PatientDetailModal
          patient={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
      {selectedUser && activeTab === "Doctors" && (
        <DoctorDetailModal
          doctor={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      {selectedUser && activeTab === "Hospitals" && (
        <HospitalDetailModal
          hospital={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      {selectedUser && activeTab === "Pharmacies" && (
        <PharmacyDetailModal
          pharmacy={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
