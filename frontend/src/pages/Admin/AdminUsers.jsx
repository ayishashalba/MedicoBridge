import React, { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaEye,
  FaBan,
  FaCheck,
  FaFilter,
  FaTimes,
  FaUserMd,
  FaHospital,
  FaPills,
  FaUser,
  FaCalendarAlt,
  FaFileMedical,
  FaStethoscope,
  FaClipboardList,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaFlask,
  FaShieldAlt,
  FaDownload,
} from "react-icons/fa";

import { toast } from "react-toastify";

import { generateBloodGroupReport } from "../../utils/pdfGenerator";

import "./AdminPages.css";

const API_BASE = "http://localhost:5000/api";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const TABS = [
  "Patients",
  "Doctors",
  "Hospitals",
  "Pharmacies",
];

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
  const normalized =
    status === "active"
      ? "Active"
      : status === "blocked"
        ? "Blocked"
        : status === "pending"
          ? "Pending"
          : status === "verified"
            ? "Approved"
            : status === "rejected"
              ? "Rejected"
              : status || "Unknown";

  const s =
    statusColors[normalized] || {
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
      {normalized}
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

/* ============================================================
   HELPERS
============================================================ */

function getUserId(item) {
  if (!item) return "";

  return (
    item.userId?._id ||
    item.userId ||
    item._id ||
    ""
  );
}

function getUserEmail(item) {
  if (!item) return "";

  return (
    item.email ||
    item.userId?.email ||
    ""
  );
}

function getUserPhone(item) {
  if (!item) return "";

  return (
    item.phone ||
    item.userId?.phone ||
    ""
  );
}

function getUserCity(item) {
  if (!item) return "";

  return (
    item.city ||
    item.userId?.city ||
    ""
  );
}

/*
  Patient:
  status is directly stored in Patient.status.
*/
function getPatientAccountStatus(item) {
  return (
    item.status ||
    item.userId?.status ||
    "active"
  );
}

/*
  Doctor:
  IMPORTANT:
  Doctor.status = pending / verified / rejected
  Doctor.accountStatus = active / blocked

  Admin User Management status must use accountStatus.
*/
function getDoctorAccountStatus(item) {
  return (
    item.accountStatus ||
    "active"
  );
}

/*
  Hospital / Pharmacy:
  Their accountStatus is used by blockUser / activateUser.
*/
function getProviderAccountStatus(item) {
  return (
    item.accountStatus ||
    item.userId?.status ||
    "active"
  );
}

function normalizePatient(item) {
  return {
    ...item,

    id:
      item.patientId ||
      item._id ||
      "",

    name:
      item.name ||
      "Unnamed Patient",

    email: getUserEmail(item),

    phone: getUserPhone(item),

    city: getUserCity(item),

    address:
      item.address ||
      "",

    bloodGroup:
      item.bloodGroup ||
      "",

    gender:
      item.gender ||
      "",

    dob:
      item.dob ||
      "",

    status:
      getPatientAccountStatus(item),

    userId:
      getUserId(item),

    isDonorAvailable:
      item.isDonorAvailable === true,

    joined:
      item.createdAt ||
      item.userId?.createdAt ||
      "",
  };
}

function normalizeDoctor(item) {
  return {
    ...item,

    id:
      item.doctorId ||
      item._id ||
      "",

    name:
      item.name ||
      "Unnamed Doctor",

    email:
      getUserEmail(item),

    phone:
      getUserPhone(item),

    city:
      getUserCity(item),

    address:
      item.address ||
      item.clinicAddress ||
      "",

    bloodGroup:
      item.bloodGroup ||
      "",

    gender:
      item.gender ||
      "",

    specialization:
      item.specialization ||
      "General Physician",

    qualification:
      item.qualification ||
      "",

    experience:
      item.experience ||
      "",

    practiceType:
      item.practiceType ||
      "",

    hospitalName:
      item.hospitalName ||
      "",

    branchLocation:
      item.branchLocation ||
      "",

    department:
      item.department ||
      "",

    clinicName:
      item.clinicName ||
      "",

    clinicAddress:
      item.clinicAddress ||
      "",

    clinicCity:
      item.clinicCity ||
      "",

    medRegNumber:
      item.medRegNumber ||
      "",

    /*
      Account status:
      active / blocked
    */
    accountStatus:
      getDoctorAccountStatus(item),

    /*
      Approval status:
      pending / verified / rejected
    */
    approvalStatus:
      item.status === "pending"
        ? "pending"
        : item.status === "verified"
          ? "verified"
          : item.status === "rejected"
            ? "rejected"
            : "",

    /*
      For table/status actions we use accountStatus.
    */
    status:
      getDoctorAccountStatus(item),

    userId:
      getUserId(item),

    isDonorAvailable:
      item.isDonorAvailable === true,

    joined:
      item.createdAt ||
      item.userId?.createdAt ||
      "",
  };
}

function normalizeHospital(item) {
  return {
    ...item,

    id:
      item.hospitalId ||
      item._id ||
      "",

    name:
      item.name ||
      "Unnamed Hospital",

    email:
      getUserEmail(item),

    phone:
      getUserPhone(item),

    address:
      item.address ||
      "",

    city:
      getUserCity(item),

    state:
      item.state ||
      "",

    regNumber:
      item.regNumber ||
      "",

    hospitalType:
      item.hospitalType ||
      "",

    departments:
      Array.isArray(item.departments)
        ? item.departments
        : [],

    /*
      Account status is used for
      Active / Blocked.
    */
    status:
      getProviderAccountStatus(item),

    /*
      Hospital approval status remains
      separate from account status.
    */
    approvalStatus:
      item.status === "pending"
        ? "pending"
        : item.status === "verified"
          ? "verified"
          : item.status === "rejected"
            ? "rejected"
            : "",

    userId:
      getUserId(item),

    joined:
      item.createdAt ||
      item.userId?.createdAt ||
      "",
  };
}

function normalizePharmacy(item) {
  return {
    ...item,

    id:
      item.pharmacyId ||
      item._id ||
      "",

    name:
      item.name ||
      "Unnamed Pharmacy",

    email:
      getUserEmail(item),

    phone:
      getUserPhone(item),

    address:
      item.address ||
      "",

    city:
      getUserCity(item),

    state:
      item.state ||
      "",

    licenseNumber:
      item.licenseNumber ||
      "",

    pharmacyType:
      item.type ||
      item.pharmacyType ||
      "Retail",

    status:
      getProviderAccountStatus(item),

    approvalStatus:
      item.status === "pending"
        ? "pending"
        : item.status === "verified"
          ? "verified"
          : item.status === "rejected"
            ? "rejected"
            : "",

    userId:
      getUserId(item),

    joined:
      item.createdAt ||
      item.userId?.createdAt ||
      "",
  };
}

/* ============================================================
   PATIENT DETAIL MODAL
============================================================ */

function PatientDetailModal({
  patient,
  onClose,
  onToggleStatus,
}) {
  const isActive =
    patient.status === "active";

  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="adv-drawer-header">
          <div className="adv-drawer-header-inner">
            <div className="adv-avatar">
              {(patient.name || "Patient")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h3 className="adv-drawer-title">
                {patient.name}
              </h3>

              <span className="ad-id-badge">
                {patient.id}
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
            icon={<FaUser />}
            title="Basic Information"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Full Name"
              value={patient.name}
            />

            <DetailRow
              label="Patient ID"
              value={patient.id}
            />

            <DetailRow
              label="Email"
              value={patient.email}
            />

            <DetailRow
              label="Phone"
              value={patient.phone}
            />

            <DetailRow
              label="City"
              value={patient.city}
            />

            <DetailRow
              label="Address"
              value={patient.address}
            />

            <DetailRow
              label="Date of Birth"
              value={
                patient.dob
                  ? new Date(
                    patient.dob
                  ).toLocaleDateString()
                  : ""
              }
            />

            <DetailRow
              label="Gender"
              value={patient.gender}
            />

            <DetailRow label="Blood Group">
              {patient.bloodGroup ? (
                <span className="adv-blood-badge">
                  {patient.bloodGroup}
                </span>
              ) : (
                "Not provided"
              )}
            </DetailRow>

            <DetailRow label="Donor Availability">
              {patient.isDonorAvailable
                ? "Available"
                : "Not Available"}
            </DetailRow>

            <DetailRow label="Account Status">
              <StatusPill
                status={patient.status}
              />
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaShieldAlt />}
            title="Account"
          />

          <div className="adv-detail-grid">
            <DetailRow label="User Account">
              {patient.userId
                ? "Registered User"
                : "—"}
            </DetailRow>

            <DetailRow label="Joined Date">
              {patient.joined
                ? new Date(
                  patient.joined
                ).toLocaleDateString()
                : "—"}
            </DetailRow>
          </div>
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${isActive
              ? "ad-btn-danger"
              : "ad-btn-primary"
              }`}
            onClick={() =>
              onToggleStatus(patient)
            }
          >
            {isActive ? (
              <>
                <FaBan />
                Block Patient
              </>
            ) : (
              <>
                <FaCheck />
                Activate Patient
              </>
            )}
          </button>

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

/* ============================================================
   DOCTOR DETAIL MODAL
============================================================ */

function DoctorDetailModal({
  doctor,
  onClose,
  onToggleStatus,
}) {
  const isActive =
    doctor.status === "active";

  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) =>
          e.stopPropagation()
        }
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
                {doctor.id}
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
            title="Professional Details"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Doctor Name"
              value={doctor.name}
            />

            <DetailRow
              label="Doctor ID"
              value={doctor.id}
            />

            <DetailRow
              label="Specialization"
              value={doctor.specialization}
            />

            <DetailRow label="Blood Group">
              {doctor.bloodGroup ? (
                <span className="adv-blood-badge">
                  {doctor.bloodGroup}
                </span>
              ) : (
                "Not provided"
              )}
            </DetailRow>

            <DetailRow
              label="Qualification"
              value={doctor.qualification}
            />

            <DetailRow
              label="Experience"
              value={doctor.experience}
            />

            <DetailRow
              label="Practice Type"
              value={doctor.practiceType}
            />

            <DetailRow
              label="Hospital"
              value={doctor.hospitalName}
            />

            <DetailRow
              label="Branch Location"
              value={doctor.branchLocation}
            />

            <DetailRow
              label="Clinic"
              value={doctor.clinicName}
            />

            <DetailRow
              label="Department"
              value={doctor.department}
            />

            <DetailRow
              label="Registration Number"
              value={doctor.medRegNumber}
            />

            <DetailRow
              label="City"
              value={doctor.city}
            />
          </div>

          <SectionTitle
            icon={<FaShieldAlt />}
            title="Status"
          />

          <div className="adv-detail-grid">
            <DetailRow label="Account Status">
              <StatusPill
                status={doctor.status}
              />
            </DetailRow>

            <DetailRow label="Approval Status">
              <StatusPill
                status={doctor.approvalStatus}
              />
            </DetailRow>

            <DetailRow label="Donor Availability">
              {doctor.isDonorAvailable
                ? "Available"
                : "Not Available"}
            </DetailRow>
          </div>

          <SectionTitle
            icon={<FaEnvelope />}
            title="Contact"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Email"
              value={doctor.email}
            />

            <DetailRow
              label="Phone"
              value={doctor.phone}
            />
          </div>
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${isActive
              ? "ad-btn-danger"
              : "ad-btn-primary"
              }`}
            onClick={() =>
              onToggleStatus(doctor)
            }
          >
            {isActive ? (
              <>
                <FaBan />
                Block Doctor
              </>
            ) : (
              <>
                <FaCheck />
                Activate Doctor
              </>
            )}
          </button>

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

/* ============================================================
   HOSPITAL DETAIL MODAL
============================================================ */

function HospitalDetailModal({
  hospital,
  onClose,
  onToggleStatus,
}) {
  const isActive =
    hospital.status === "active";

  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) =>
          e.stopPropagation()
        }
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
                {hospital.id}
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
            title="Hospital Information"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Hospital Name"
              value={hospital.name}
            />

            <DetailRow
              label="Hospital ID"
              value={hospital.id}
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
              label="Address"
              value={hospital.address}
            />

            <DetailRow
              label="City"
              value={hospital.city}
            />

            <DetailRow
              label="State"
              value={hospital.state}
            />

            <DetailRow
              label="Registration Number"
              value={hospital.regNumber}
            />

            <DetailRow
              label="Hospital Type"
              value={hospital.hospitalType}
            />
          </div>

          <SectionTitle
            icon={<FaShieldAlt />}
            title="Status & Approvals"
          />

          <div className="adv-detail-grid">
            <DetailRow label="Account Status">
              <StatusPill
                status={hospital.status}
              />
            </DetailRow>

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
            {hospital.departments.length ===
              0 ? (
              <p className="adv-empty-msg">
                No departments provided.
              </p>
            ) : (
              hospital.departments.map(
                (department, index) => (
                  <span
                    key={`${department}-${index}`}
                    className="adv-tag"
                  >
                    {department}
                  </span>
                )
              )
            )}
          </div>
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${isActive
              ? "ad-btn-danger"
              : "ad-btn-primary"
              }`}
            onClick={() =>
              onToggleStatus(hospital)
            }
          >
            {isActive ? (
              <>
                <FaBan />
                Block Hospital
              </>
            ) : (
              <>
                <FaCheck />
                Activate Hospital
              </>
            )}
          </button>

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

/* ============================================================
   PHARMACY DETAIL MODAL
============================================================ */

function PharmacyDetailModal({
  pharmacy,
  onClose,
  onToggleStatus,
}) {
  const isActive =
    pharmacy.status === "active";

  return (
    <div
      className="adv-drawer-backdrop"
      onClick={onClose}
    >
      <div
        className="adv-drawer adv-drawer-wide"
        onClick={(e) =>
          e.stopPropagation()
        }
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
                {pharmacy.id}
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
            title="Pharmacy Information"
          />

          <div className="adv-detail-grid">
            <DetailRow
              label="Pharmacy Name"
              value={pharmacy.name}
            />

            <DetailRow
              label="Pharmacy ID"
              value={pharmacy.id}
            />

            <DetailRow
              label="Pharmacy Type"
              value={pharmacy.pharmacyType}
            />

            <DetailRow
              label="License Number"
              value={pharmacy.licenseNumber}
            />

            <DetailRow
              label="Email"
              value={pharmacy.email}
            />

            <DetailRow
              label="Phone"
              value={pharmacy.phone}
            />

            <DetailRow
              label="Address"
              value={pharmacy.address}
            />

            <DetailRow
              label="City"
              value={pharmacy.city}
            />

            <DetailRow
              label="State"
              value={pharmacy.state}
            />
          </div>

          <SectionTitle
            icon={<FaShieldAlt />}
            title="Status & Approvals"
          />

          <div className="adv-detail-grid">
            <DetailRow label="Account Status">
              <StatusPill
                status={pharmacy.status}
              />
            </DetailRow>

            <DetailRow label="Approval Status">
              <StatusPill
                status={pharmacy.approvalStatus}
              />
            </DetailRow>
          </div>
        </div>

        <div className="adv-drawer-footer">
          <button
            className={`ad-btn ${isActive
              ? "ad-btn-danger"
              : "ad-btn-primary"
              }`}
            onClick={() =>
              onToggleStatus(pharmacy)
            }
          >
            {isActive ? (
              <>
                <FaBan />
                Block Pharmacy
              </>
            ) : (
              <>
                <FaCheck />
                Activate Pharmacy
              </>
            )}
          </button>

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

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AdminUsers() {
  const [activeTab, setActiveTab] =
    useState("Patients");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [bloodGroupFilter, setBloodGroupFilter] =
    useState("All Blood Groups");

  const [locationInput, setLocationInput] =
    useState("");

  const [activeLocation, setActiveLocation] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ============================================================
     FETCH USERS
  ============================================================ */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      const params =
        new URLSearchParams();

      params.append(
        "tab",
        activeTab
      );

      /*
        Blood group only for
        Patients and Doctors.
      */
      if (
        (activeTab === "Patients" ||
          activeTab === "Doctors") &&
        bloodGroupFilter !==
        "All Blood Groups" &&
        bloodGroupFilter !== "All"
      ) {
        params.append(
          "bloodGroup",
          bloodGroupFilter
        );
      }

      /*
        Existing search.
      */
      if (searchQuery.trim()) {
        params.append(
          "search",
          searchQuery.trim()
        );
      }

      /*
        Location is now sent to backend.
      */
      if (
        (activeTab === "Patients" ||
          activeTab === "Doctors") &&
        activeLocation.trim()
      ) {
        params.append(
          "location",
          activeLocation.trim()
        );
      }

      /*
        Account status:
        Active / Blocked.
      */
      if (statusFilter !== "All") {
        params.append(
          "status",
          statusFilter.toLowerCase()
        );
      }

      const response =
        await fetch(
          `${API_BASE}/admin/users?${params.toString()}`,
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
          "Failed to fetch users."
        );
      }

      const rawData =
        Array.isArray(result.data)
          ? result.data
          : result.data?.users || [];

      let normalized = [];

      if (activeTab === "Patients") {
        normalized =
          rawData.map(
            normalizePatient
          );
      }

      if (activeTab === "Doctors") {
        normalized =
          rawData.map(
            normalizeDoctor
          );
      }

      if (activeTab === "Hospitals") {
        normalized =
          rawData.map(
            normalizeHospital
          );
      }

      if (activeTab === "Pharmacies") {
        normalized =
          rawData.map(
            normalizePharmacy
          );
      }

      setUsers(normalized);
    } catch (err) {
      console.error(
        "Admin users fetch error:",
        err
      );

      setError(
        err.message ||
        "Failed to fetch users."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FETCH WHEN FILTERS CHANGE
  ============================================================ */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchUsers();
      }, 300);

    return () =>
      clearTimeout(timer);

    /*
      activeLocation included here.
    */
  }, [
    activeTab,
    searchQuery,
    statusFilter,
    bloodGroupFilter,
    activeLocation,
  ]);

  /* ============================================================
     LOCATION SEARCH
  ============================================================ */

  const handleLocationSearch =
    () => {
      setActiveLocation(
        locationInput.trim()
      );
    };

  /* ============================================================
     FILTERED DATA
     
     IMPORTANT:
     Blood group filtering does NOT mean
     donor-only anymore.

     Admin User Management should show
     all matching Patients/Doctors.
  ============================================================ */

  const filteredData = useMemo(() => {
    let result = [...users];

    /*
      Defensive blood-group filter.
      Backend already filters this, but keeping
      this makes frontend robust.
    */
    const isBloodSearch =
      (activeTab === "Patients" ||
        activeTab === "Doctors") &&
      bloodGroupFilter !==
      "All Blood Groups" &&
      bloodGroupFilter !== "All";

    if (isBloodSearch) {
      result =
        result.filter(
          (item) =>
            item.bloodGroup ===
            bloodGroupFilter
        );
    }

    /*
      Defensive location filtering.
      Backend already performs city matching.
    */
    if (activeLocation.trim()) {
      const location =
        activeLocation
          .trim()
          .toLowerCase();

      result =
        result.filter((item) => {
          const city =
            (item.city || "")
              .toLowerCase();

          const address =
            (item.address || "")
              .toLowerCase();

          return (
            city.includes(location) ||
            address.includes(location)
          );
        });
    }

    /*
      Exact city first.
      Then city starting with search.
      Then other partial matches.
    */
    if (activeLocation.trim()) {
      const location =
        activeLocation
          .trim()
          .toLowerCase();

      result.sort((a, b) => {
        const aCity =
          (a.city || "")
            .toLowerCase();

        const bCity =
          (b.city || "")
            .toLowerCase();

        const aExact =
          aCity === location
            ? 0
            : 1;

        const bExact =
          bCity === location
            ? 0
            : 1;

        if (aExact !== bExact) {
          return (
            aExact - bExact
          );
        }

        const aStarts =
          aCity.startsWith(location)
            ? 0
            : 1;

        const bStarts =
          bCity.startsWith(location)
            ? 0
            : 1;

        if (
          aStarts !== bStarts
        ) {
          return (
            aStarts - bStarts
          );
        }

        return 0;
      });
    }

    return result;
  }, [
    users,
    activeTab,
    bloodGroupFilter,
    activeLocation,
  ]);

  /* ============================================================
     TAB CHANGE
  ============================================================ */

  const handleTabChange =
    (tab) => {
      setActiveTab(tab);

      setSearchQuery("");

      setStatusFilter("All");

      setBloodGroupFilter(
        "All Blood Groups"
      );

      setLocationInput("");

      setActiveLocation("");

      setSelectedUser(null);

      setError("");
    };

  /* ============================================================
     STATUS ACTION
  ============================================================ */

  const handleToggleStatus =
    async (user) => {
      try {
        if (!user?.userId) {
          toast.error(
            "Unable to update this user's account."
          );
          return;
        }

        setActionLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        if (!token) {
          toast.error(
            "Admin session expired. Please login again."
          );
          return;
        }

        const isActive =
          user.status === "active";

        const endpoint = isActive
          ? `${API_BASE}/admin/users/block/${user.userId}`
          : `${API_BASE}/admin/users/activate/${user.userId}`;

        const response =
          await fetch(endpoint, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
          });

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            `Failed to ${isActive
              ? "block"
              : "activate"
            } user.`
          );
        }

        toast.success(
          result.message ||
          `User ${isActive
            ? "blocked"
            : "activated"
          } successfully.`
        );

        setSelectedUser(null);

        await fetchUsers();
      } catch (err) {
        console.error(
          "Status update error:",
          err
        );

        toast.error(
          err.message ||
          "Failed to update user status."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* ============================================================
     DOWNLOAD FILTERED REPORT
  ============================================================ */

  const handleDownloadReport =
    () => {
      try {
        if (
          !filteredData ||
          filteredData.length === 0
        ) {
          toast.warning(
            "There are no filtered results to download."
          );
          return;
        }

        let columns = [];

        if (activeTab === "Patients") {
          columns = [
            {
              header: "Patient ID",
              dataKey: "id",
            },
            {
              header: "Name",
              dataKey: "name",
            },
            {
              header: "Email",
              dataKey: "email",
            },
            {
              header: "Phone",
              dataKey: "phone",
            },
            {
              header: "Blood Group",
              dataKey: "bloodGroup",
            },
            {
              header: "City",
              dataKey: "city",
            },
            {
              header: "Status",
              dataKey: "status",
            },
          ];
        }

        if (activeTab === "Doctors") {
          columns = [
            {
              header: "Doctor ID",
              dataKey: "id",
            },
            {
              header: "Name",
              dataKey: "name",
            },
            {
              header: "Email",
              dataKey: "email",
            },
            {
              header: "Specialization",
              dataKey:
                "specialization",
            },
            {
              header: "Blood Group",
              dataKey: "bloodGroup",
            },
            {
              header: "City",
              dataKey: "city",
            },
            {
              header: "Status",
              dataKey: "status",
            },
          ];
        }

        if (
          activeTab === "Hospitals"
        ) {
          columns = [
            {
              header: "Hospital ID",
              dataKey: "id",
            },
            {
              header: "Hospital Name",
              dataKey: "name",
            },
            {
              header: "Email",
              dataKey: "email",
            },
            {
              header: "City",
              dataKey: "city",
            },
            {
              header: "Hospital Type",
              dataKey:
                "hospitalType",
            },
            {
              header: "Status",
              dataKey: "status",
            },
          ];
        }

        if (
          activeTab === "Pharmacies"
        ) {
          columns = [
            {
              header: "Pharmacy ID",
              dataKey: "id",
            },
            {
              header: "Pharmacy Name",
              dataKey: "name",
            },
            {
              header: "Type",
              dataKey:
                "pharmacyType",
            },
            {
              header: "License",
              dataKey:
                "licenseNumber",
            },
            {
              header: "Email",
              dataKey: "email",
            },
            {
              header: "City",
              dataKey: "city",
            },
            {
              header: "Status",
              dataKey: "status",
            },
          ];
        }

        generateBloodGroupReport({
          title: `Admin ${activeTab} Report`,

          selectedBloodGroup:
            activeTab === "Patients" ||
              activeTab === "Doctors"
              ? bloodGroupFilter
              : "N/A",

          generatedBy:
            "System Administrator (Admin)",

          columns,

          data: filteredData,

          activeFilters: {
            Tab: activeTab,

            Search:
              searchQuery || "All",

            Status:
              statusFilter,

            BloodGroup:
              activeTab === "Patients" ||
                activeTab === "Doctors"
                ? bloodGroupFilter
                : "N/A",

            Location:
              activeLocation || "All",
          },
        });

        toast.success(
          "Filtered report generated successfully."
        );
      } catch (err) {
        console.error(
          "Report generation error:",
          err
        );

        toast.error(
          "Failed to generate the report."
        );
      }
    };

  /* ============================================================
     TABLE HEADERS
  ============================================================ */

  const renderTableHeader =
    () => {
      if (activeTab === "Patients") {
        return (
          <tr>
            <th>Patient ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Blood Group</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        );
      }

      if (activeTab === "Doctors") {
        return (
          <tr>
            <th>Doctor ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>City</th>
            <th>Blood Group</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        );
      }

      if (activeTab === "Hospitals") {
        return (
          <tr>
            <th>Hospital ID</th>
            <th>Hospital Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Type</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        );
      }

      return (
        <tr>
          <th>Pharmacy ID</th>
          <th>Pharmacy Name</th>
          <th>Type</th>
          <th>License Number</th>
          <th>Email</th>
          <th>City</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      );
    };

  /* ============================================================
     TABLE ROW
  ============================================================ */

  const renderTableRow =
    (user) => {
      const isActive =
        user.status === "active";

      return (
        <tr key={user.id}>
          <td>
            <span className="ad-id-badge">
              {user.id || "—"}
            </span>
          </td>

          <td>
            <strong>
              {user.name}
            </strong>
          </td>

          <td>
            {user.email || "—"}
          </td>

          {activeTab ===
            "Patients" && (
              <>
                <td>
                  {user.phone || "—"}
                </td>

                <td>
                  {user.city || "—"}
                </td>

                <td>
                  <span
                    className="adv-blood-badge"
                    style={{
                      background:
                        "#fef2f2",
                      color:
                        "#dc2626",
                      fontWeight:
                        "600",
                      padding:
                        "2px 8px",
                      borderRadius:
                        "12px",
                      fontSize:
                        "0.8rem",
                      border:
                        "1px solid #fecaca",
                    }}
                  >
                    {user.bloodGroup ||
                      "Not Provided"}
                  </span>
                </td>
              </>
            )}

          {activeTab ===
            "Doctors" && (
              <>
                <td>
                  {user.specialization ||
                    "General Physician"}
                </td>

                <td>
                  {user.city || "—"}
                </td>

                <td>
                  <span
                    className="adv-blood-badge"
                    style={{
                      background:
                        "#fef2f2",
                      color:
                        "#dc2626",
                      fontWeight:
                        "600",
                      padding:
                        "2px 8px",
                      borderRadius:
                        "12px",
                      fontSize:
                        "0.8rem",
                      border:
                        "1px solid #fecaca",
                    }}
                  >
                    {user.bloodGroup ||
                      "Not Provided"}
                  </span>
                </td>
              </>
            )}

          {activeTab ===
            "Hospitals" && (
              <>
                <td>
                  {user.city || "—"}
                </td>

                <td>
                  {user.hospitalType ||
                    "—"}
                </td>
              </>
            )}

          {activeTab ===
            "Pharmacies" && (
              <>
                <td>
                  {user.pharmacyType ||
                    "—"}
                </td>

                <td>
                  <code>
                    {user.licenseNumber ||
                      "—"}
                  </code>
                </td>

                <td>
                  {user.city || "—"}
                </td>
              </>
            )}

          <td>
            <StatusPill
              status={user.status}
            />
          </td>

          <td>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() =>
                  setSelectedUser(user)
                }
                className="ad-btn ad-btn-secondary"
                title="Inspect Details"
                style={{
                  padding:
                    "0.35rem",
                  borderRadius:
                    "6px",
                }}
                disabled={
                  actionLoading
                }
              >
                <FaEye />
              </button>

              <button
                onClick={() =>
                  handleToggleStatus(
                    user
                  )
                }
                className={`ad-btn ${isActive
                  ? "ad-btn-danger"
                  : "ad-btn-primary"
                  }`}
                title={
                  isActive
                    ? "Block User"
                    : "Activate User"
                }
                style={{
                  padding:
                    "0.35rem",
                  borderRadius:
                    "6px",
                }}
                disabled={
                  actionLoading
                }
              >
                {isActive ? (
                  <FaBan />
                ) : (
                  <FaCheck />
                )}
              </button>
            </div>
          </td>
        </tr>
      );
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="ad-page">
      <div className="ad-page-header">
        <p>
          Register, inspect, and
          moderate all platform
          participants
        </p>
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <div className="ad-tabs-container">
        <div className="ad-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() =>
                handleTabChange(tab)
              }
              className={`ad-tab-btn ${activeTab === tab
                ? "active"
                : ""
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================
          ACTION BAR
      ====================================================== */}

      <div
        className="ad-card"
        style={{
          padding: "1.25rem",
        }}
      >
        <div
          className="ad-search-filter-bar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: "1rem",
          }}
        >
          {/* SEARCH */}

          <div
            className="ad-search-wrapper"
            style={{
              flex: 1,
              minWidth: "240px",
            }}
          >
            <FaSearch className="ad-search-icon" />

            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} by ID, name, email...`}
              className="ad-input"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />
          </div>

          {/* BLOOD GROUP */}

          {(activeTab ===
            "Patients" ||
            activeTab ===
            "Doctors") && (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize:
                      "0.85rem",
                    fontWeight:
                      "600",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaFilter />
                  Blood Group:
                </span>

                <select
                  className="ad-select"
                  style={{
                    width: "160px",
                    padding:
                      "0.45rem 0.75rem",
                  }}
                  value={
                    bloodGroupFilter
                  }
                  onChange={(e) =>
                    setBloodGroupFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="All Blood Groups">
                    All Blood Groups
                  </option>

                  {BLOOD_GROUPS.map(
                    (bg) => (
                      <option
                        key={bg}
                        value={bg}
                      >
                        {bg}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

          {/* LOCATION */}

          {(activeTab ===
            "Patients" ||
            activeTab ===
            "Doctors") && (
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: "0.25rem",
                }}
              >
                <span
                  style={{
                    fontSize:
                      "0.85rem",
                    fontWeight:
                      "600",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    gap: "0.3rem",
                  }}
                >
                  <FaMapMarkerAlt
                    style={{
                      color:
                        "#0d9488",
                    }}
                  />

                  Location:
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "0.4rem",
                  }}
                >
                  <div
                    className="ad-search-wrapper"
                    style={{
                      minWidth:
                        "180px",
                    }}
                  >
                    <FaMapMarkerAlt
                      className="ad-search-icon"
                      style={{
                        color:
                          "#0d9488",
                      }}
                    />

                    <input
                      type="text"
                      placeholder="e.g. Kozhikode..."
                      className="ad-input"
                      value={
                        locationInput
                      }
                      onChange={(e) =>
                        setLocationInput(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          handleLocationSearch();
                        }
                      }}
                    />
                  </div>

                  <button
                    className="ad-btn ad-btn-primary"
                    onClick={
                      handleLocationSearch
                    }
                    title="Search by Location"
                    style={{
                      background:
                        "#1e293b",
                      color:
                        "#fff",
                      border:
                        "none",
                      borderRadius:
                        "6px",
                      padding:
                        "0.45rem 0.75rem",
                      fontSize:
                        "0.85rem",
                      fontWeight:
                        "600",
                      cursor:
                        "pointer",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap:
                        "0.35rem",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    <FaSearch />
                    Search
                  </button>
                </div>

                {activeLocation && (
                  <span
                    style={{
                      fontSize:
                        "0.75rem",
                      color:
                        "#0d9488",
                      fontWeight:
                        "500",
                      marginTop:
                        "0.1rem",
                    }}
                  >
                    Showing results
                    for:{" "}
                    <strong>
                      {
                        activeLocation
                      }
                    </strong>
                  </span>
                )}
              </div>
            )}

          {/* STATUS */}

          <div className="ad-filters">
            <span
              style={{
                fontSize:
                  "0.85rem",
                fontWeight:
                  "600",
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
                width: "130px",
                padding:
                  "0.45rem 0.75rem",
              }}
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Blocked">
                Blocked
              </option>
            </select>
          </div>

          {/* DOWNLOAD */}

          <button
            className="ad-btn ad-btn-primary"
            onClick={
              handleDownloadReport
            }
            title="Download Filtered Report"
            style={{
              background:
                "#0d9488",
              color:
                "#fff",
              border:
                "none",
              borderRadius:
                "6px",
              padding:
                "0.45rem 0.85rem",
              fontSize:
                "0.85rem",
              fontWeight:
                "600",
              cursor:
                "pointer",
              display:
                "inline-flex",
              alignItems:
                "center",
              gap:
                "0.4rem",
            }}
            disabled={
              loading ||
              filteredData.length ===
              0
            }
          >
            <FaDownload />
            Download Report
          </button>
        </div>

        {/* ====================================================
            RESULT INFO
        ==================================================== */}

        {(bloodGroupFilter !==
          "All Blood Groups" ||
          activeLocation ||
          searchQuery ||
          statusFilter !==
          "All") && (
            <div
              style={{
                marginTop:
                  "0.9rem",
                fontSize:
                  "0.8rem",
                color:
                  "var(--ad-text-muted)",
              }}
            >
              Showing{" "}
              <strong>
                {
                  filteredData.length
                }
              </strong>{" "}
              matching result
              {filteredData.length !==
                1
                ? "s"
                : ""}

              {bloodGroupFilter !==
                "All Blood Groups" && (
                  <>
                    {" "}
                    • Blood Group:{" "}
                    <strong>
                      {
                        bloodGroupFilter
                      }
                    </strong>
                  </>
                )}

              {activeLocation && (
                <>
                  {" "}
                  • Location:{" "}
                  <strong>
                    {
                      activeLocation
                    }
                  </strong>
                </>
              )}

              {statusFilter !==
                "All" && (
                  <>
                    {" "}
                    • Status:{" "}
                    <strong>
                      {
                        statusFilter
                      }
                    </strong>
                  </>
                )}
            </div>
          )}

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              {renderTableHeader()}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "2.5rem",
                      color:
                        "#dc2626",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredData.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "2.5rem",
                      color:
                        "var(--ad-text-muted)",
                    }}
                  >
                    {bloodGroupFilter !==
                      "All Blood Groups" &&
                      activeLocation
                      ? `No ${bloodGroupFilter} users found near ${activeLocation}.`
                      : bloodGroupFilter !==
                        "All Blood Groups"
                        ? `No ${bloodGroupFilter} users found.`
                        : activeLocation
                          ? `No users found in or near ${activeLocation}.`
                          : "No users found for the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredData.map(
                  renderTableRow
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          DETAIL DRAWERS
      ====================================================== */}

      {selectedUser &&
        activeTab ===
        "Patients" && (
          <PatientDetailModal
            patient={
              selectedUser
            }
            onClose={() =>
              setSelectedUser(
                null
              )
            }
            onToggleStatus={
              handleToggleStatus
            }
          />
        )}

      {selectedUser &&
        activeTab ===
        "Doctors" && (
          <DoctorDetailModal
            doctor={
              selectedUser
            }
            onClose={() =>
              setSelectedUser(
                null
              )
            }
            onToggleStatus={
              handleToggleStatus
            }
          />
        )}

      {selectedUser &&
        activeTab ===
        "Hospitals" && (
          <HospitalDetailModal
            hospital={
              selectedUser
            }
            onClose={() =>
              setSelectedUser(
                null
              )
            }
            onToggleStatus={
              handleToggleStatus
            }
          />
        )}

      {selectedUser &&
        activeTab ===
        "Pharmacies" && (
          <PharmacyDetailModal
            pharmacy={
              selectedUser
            }
            onClose={() =>
              setSelectedUser(
                null
              )
            }
            onToggleStatus={
              handleToggleStatus
            }
          />
        )}
    </div>
  );
}