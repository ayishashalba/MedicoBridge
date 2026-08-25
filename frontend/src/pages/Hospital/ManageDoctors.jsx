import React, { useState, useMemo } from "react";
import {
  FaSearch,
  FaFilter,
  FaUserMd,
  FaPlus,
  FaPhoneAlt,
  FaEnvelope,
  FaTimes,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaHospital,
  FaLock,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaClock,
  FaDownload,
} from "react-icons/fa";
import { generateBloodGroupReport } from "../../utils/pdfGenerator";
import "./ManageDoctors.css";

const initialDoctors = [
  {
    id: "DR-80241",
    userId: "USR-DOC-1021",
    hospitalId: "HOSP-5021",
    name: "Dr. Ayisha Shalba",
    specialization: "Cardiology",
    department: "Cardiology & Vascular Sciences",
    qualification: "MBBS, MD (Cardiology), DM",
    experience: "12 Years",
    bloodGroup: "O+",
    doctorType: "Hospital",
    email: "ayisha.shalba@medicobridge.com",
    phone: "+91 98765 43210",
    licenseNumber: "KMC-2012-78945",
    consultationFee: "₹1,200",
    availability: "Mon - Fri, 09:00 AM - 04:00 PM",
    registrationDate: "Jan 15, 2024",
    accountStatus: "Active",
    status: "Available",
    avatarBg: "#0d9488",
  },
  {
    id: "DR-80242",
    userId: "USR-DOC-1022",
    hospitalId: "HOSP-5021",
    name: "Dr. Rajesh K. Nair",
    specialization: "Neurology",
    department: "Neurology & Neuro Surgery",
    qualification: "MBBS, MS, M.Ch (Neuro Surgery)",
    experience: "15 Years",
    bloodGroup: "A+",
    doctorType: "Hospital",
    email: "rajesh.nair@medicobridge.com",
    phone: "+91 98765 43211",
    licenseNumber: "KMC-2009-65412",
    consultationFee: "₹1,500",
    availability: "Mon - Sat, 10:00 AM - 03:00 PM",
    registrationDate: "Mar 10, 2023",
    accountStatus: "Active",
    status: "In Surgery",
    avatarBg: "#8b5cf6",
  },
  {
    id: "DR-80243",
    userId: "USR-DOC-1023",
    hospitalId: "HOSP-5021",
    name: "Dr. Priya Thomas",
    specialization: "Pediatrics",
    department: "Pediatrics & Child Care",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experience: "9 Years",
    bloodGroup: "B+",
    doctorType: "Hospital",
    email: "priya.t@medicobridge.com",
    phone: "+91 98765 43212",
    licenseNumber: "KMC-2015-89632",
    consultationFee: "₹800",
    availability: "Tue - Sun, 08:30 AM - 01:30 PM",
    registrationDate: "Jun 01, 2024",
    accountStatus: "Active",
    status: "On Leave",
    avatarBg: "#ec4899",
  },
  {
    id: "DR-80244",
    userId: "USR-DOC-1024",
    hospitalId: "HOSP-5021",
    name: "Dr. Susan George",
    specialization: "Orthopedics",
    department: "Orthopedics & Joint Replacement",
    qualification: "MBBS, MS (Orthopedics), DNB",
    experience: "11 Years",
    bloodGroup: "AB+",
    doctorType: "Hospital",
    email: "susan.g@medicobridge.com",
    phone: "+91 98765 43213",
    licenseNumber: "KMC-2013-41258",
    consultationFee: "₹1,000",
    availability: "Mon - Fri, 09:30 AM - 04:30 PM",
    registrationDate: "Feb 20, 2024",
    accountStatus: "Active",
    status: "Available",
    avatarBg: "#f59e0b",
  },
  {
    id: "DR-80245",
    userId: "USR-DOC-1025",
    hospitalId: "HOSP-5021",
    name: "Dr. Vikram Shekar",
    specialization: "Dermatology",
    department: "Dermatology & Cosmetology",
    qualification: "MBBS, MD (DVL - Dermatology)",
    experience: "8 Years",
    bloodGroup: "O-",
    doctorType: "Hospital",
    email: "vikram.s@medicobridge.com",
    phone: "+91 98765 43214",
    licenseNumber: "KMC-2016-32145",
    consultationFee: "₹900",
    availability: "Mon - Sat, 10:30 AM - 05:00 PM",
    registrationDate: "Apr 12, 2024",
    accountStatus: "Active",
    status: "Available",
    avatarBg: "#10b981",
  },
  {
    id: "DR-80246",
    userId: "USR-DOC-1026",
    hospitalId: "HOSP-5021",
    name: "Dr. Amit Varma",
    specialization: "General Medicine",
    department: "General & Internal Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experience: "14 Years",
    bloodGroup: "Not Provided",
    doctorType: "Hospital",
    email: "amit.v@medicobridge.com",
    phone: "+91 98765 43215",
    licenseNumber: "KMC-2010-98741",
    consultationFee: "₹800",
    availability: "Mon - Sun, 08:00 AM - 02:00 PM",
    registrationDate: "Nov 15, 2023",
    accountStatus: "Active",
    status: "In Surgery",
    avatarBg: "#0284c7",
  },
];

const specialties = ["All", "Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology", "General Medicine"];
const doctorDepartmentOptions = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "General Medicine",
  "Pediatrics",
  "Dermatology",
  "Other",
];

function ManageDoctors() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);

  // Add Doctor Form States (Complete 10-field Registration Form)
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSpecialization, setAddSpecialization] = useState("");
  const [addDepartment, setAddDepartment] = useState("Cardiology");
  const [addCustomDept, setAddCustomDept] = useState("");
  const [addQualification, setAddQualification] = useState("");
  const [addExperience, setAddExperience] = useState("");
  const [addLicenseNumber, setAddLicenseNumber] = useState("");
  const [addConsultationFee, setAddConsultationFee] = useState("");
  const [addAvailability, setAddAvailability] = useState("");
  const [addStatus, setAddStatus] = useState("Available");
  const [addErrors, setAddErrors] = useState({});

  // Reset Add Doctor Form
  const resetAddForm = () => {
    setAddName("");
    setAddPhone("");
    setAddSpecialization("");
    setAddDepartment("Cardiology");
    setAddCustomDept("");
    setAddQualification("");
    setAddExperience("");
    setAddLicenseNumber("");
    setAddConsultationFee("");
    setAddAvailability("");
    setAddStatus("Available");
    setAddErrors({});
  };

  // Edit Doctor Form States
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editLicenseNumber, setEditLicenseNumber] = useState("");
  const [editConsultationFee, setEditConsultationFee] = useState("");
  const [editAvailability, setEditAvailability] = useState("");
  const [editStatus, setEditStatus] = useState("Available");

  // Toast State
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = search.toLowerCase();
      const matchSearch =
        doc.name.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        (doc.qualification && doc.qualification.toLowerCase().includes(q));
      const matchDept = selectedDept === "All" || doc.specialization === selectedDept;
      const matchStatus = selectedStatus === "All" || doc.status === selectedStatus;
      
      const bg = doc.bloodGroup || "Not Provided";
      const matchBloodGroup =
        bloodGroupFilter === "All" ||
        bloodGroupFilter === "All Blood Groups" ||
        bg === bloodGroupFilter;

      return matchSearch && matchDept && matchStatus && matchBloodGroup;
    });
  }, [doctors, search, selectedDept, selectedStatus, bloodGroupFilter]);

  const handleDownloadReport = () => {
    generateBloodGroupReport({
      title: "Hospital Medical Staff Blood Group Report",
      selectedBloodGroup: bloodGroupFilter === "All" ? "All Blood Groups" : bloodGroupFilter,
      generatedBy: "City Care Hospital Admin",
      columns: [
        { header: "Doctor ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Specialization", dataKey: "specialization" },
        { header: "Department", dataKey: "department" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "Phone", dataKey: "phone" },
        { header: "Email", dataKey: "email" },
        { header: "Status", dataKey: "status" },
      ],
      data: filteredDoctors,
      activeFilters: { Department: selectedDept, Status: selectedStatus, Search: search },
    });
  };

  // Validation function for Add Doctor Form
  const validateAddDoctor = () => {
    const errs = {};
    const trimmedName = addName.trim();
    if (!trimmedName) {
      errs.name = "Full Name is required";
    } else if (trimmedName.length < 3) {
      errs.name = "Full Name must be at least 3 characters";
    }

    const trimmedPhone = addPhone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    if (!trimmedPhone) {
      errs.phone = "Phone Number is required";
    } else if (phoneDigits.length < 10) {
      errs.phone = "Enter a valid phone number (min 10 digits)";
    }

    const trimmedSpec = addSpecialization.trim();
    if (!trimmedSpec) {
      errs.specialization = "Specialization is required";
    }

    if (!addDepartment) {
      errs.department = "Department is required";
    } else if (addDepartment === "Other" && !addCustomDept.trim()) {
      errs.customDept = "Please enter the department name";
    }

    const trimmedQual = addQualification.trim();
    if (!trimmedQual) {
      errs.qualification = "Qualifications are required";
    }

    const expNum = Number(addExperience);
    if (addExperience === "" || addExperience === null || isNaN(expNum)) {
      errs.experience = "Experience (Years) is required";
    } else if (expNum < 0 || expNum > 70) {
      errs.experience = "Enter valid experience (0 to 70 years)";
    }

    const trimmedLicense = addLicenseNumber.trim();
    if (!trimmedLicense) {
      errs.licenseNumber = "Medical License Number is required";
    } else if (trimmedLicense.length < 4) {
      errs.licenseNumber = "License number must be at least 4 characters";
    } else {
      const isDuplicate = doctors.some(
        (d) => d.licenseNumber && d.licenseNumber.trim().toLowerCase() === trimmedLicense.toLowerCase()
      );
      if (isDuplicate) {
        errs.licenseNumber = "This Medical License Number is already registered";
      }
    }

    const feeNum = Number(addConsultationFee);
    if (addConsultationFee === "" || addConsultationFee === null || isNaN(feeNum)) {
      errs.consultationFee = "Consultation Fee is required";
    } else if (feeNum <= 0) {
      errs.consultationFee = "Consultation Fee must be greater than 0";
    }

    const trimmedAvail = addAvailability.trim();
    if (!trimmedAvail) {
      errs.availability = "Availability Schedule is required";
    }

    return errs;
  };

  // Handler: Add Doctor (Complete Registration)
  const handleAddDoctor = (e) => {
    e.preventDefault();
    const errs = validateAddDoctor();
    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      showToast("Please fill in all required fields accurately.");
      return;
    }

    // Generate System IDs
    const newDocId = `DR-${Math.floor(80000 + Math.random() * 9000)}`;
    const newUserId = `USR-DOC-${Math.floor(1030 + Math.random() * 900)}`;
    const loggedInHospitalId = "HOSP-5021";

    const finalDept =
      addDepartment === "Other" && addCustomDept.trim()
        ? addCustomDept.trim()
        : addDepartment;

    const formattedFee = addConsultationFee.toString().startsWith("₹")
      ? addConsultationFee.trim()
      : `₹${Number(addConsultationFee).toLocaleString("en-IN")}`;

    const formattedExp = addExperience.toString().includes("Year")
      ? addExperience.trim()
      : `${addExperience.trim()} Years`;

    const cleanDocName = addName.trim().replace(/^dr\.?\s*/i, "");
    const emailPrefix = cleanDocName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "");
    const generatedEmail = `${emailPrefix || "doctor"}@medicobridge.com`;

    const avatarColors = ["#0d9488", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#0284c7"];
    const randomAvatar = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newDoc = {
      id: newDocId,
      userId: newUserId,
      hospitalId: loggedInHospitalId,
      name: addName.trim(),
      specialization: addSpecialization.trim(),
      department: finalDept,
      qualification: addQualification.trim(),
      experience: formattedExp,
      doctorType: "Hospital",
      email: generatedEmail,
      phone: addPhone.trim(),
      licenseNumber: addLicenseNumber.trim(),
      consultationFee: formattedFee,
      availability: addAvailability.trim(),
      registrationDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      accountStatus: "Active",
      status: addStatus,
      avatarBg: randomAvatar,
    };

    setDoctors([newDoc, ...doctors]);
    setShowAddModal(false);
    resetAddForm();

    showToast(`Doctor ${newDoc.name} registered successfully with ID ${newDoc.id}.`);
  };

  // Handler: Open Edit Doctor Modal
  const handleOpenEdit = (doc) => {
    setEditDoctor(doc);
    setEditName(doc.name || "");
    setEditPhone(doc.phone || "");
    setEditSpecialization(doc.specialization || "");
    setEditDepartment(doc.department || "");
    setEditQualification(doc.qualification !== "—" ? doc.qualification : "");
    setEditExperience(doc.experience !== "—" ? doc.experience : "");
    setEditLicenseNumber(doc.licenseNumber !== "—" ? doc.licenseNumber : "");
    setEditConsultationFee(doc.consultationFee !== "—" ? doc.consultationFee : "");
    setEditAvailability(doc.availability !== "—" ? doc.availability : "");
    setEditStatus(doc.status || "Available");
  };

  // Handler: Save Edit Doctor Changes
  const handleSaveEditDoctor = (e) => {
    e.preventDefault();
    if (!editDoctor) return;

    const updated = {
      ...editDoctor,
      name: editName.trim(),
      phone: editPhone.trim(),
      specialization: editSpecialization.trim(),
      department: editDepartment.trim(),
      qualification: editQualification.trim() || "—",
      experience: editExperience.trim() || "—",
      licenseNumber: editLicenseNumber.trim() || "—",
      consultationFee: editConsultationFee.trim() || "—",
      availability: editAvailability.trim() || "—",
      status: editStatus,
    };

    setDoctors((prev) => prev.map((d) => (d.id === editDoctor.id ? updated : d)));

    if (viewDoctor && viewDoctor.id === editDoctor.id) {
      setViewDoctor(updated);
    }

    setEditDoctor(null);
    showToast(`Doctor ${updated.name} profile updated successfully.`);
  };

  // Status Badge Class Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "hosp-doc-status-badge status--available";
      case "In Surgery":
        return "hosp-doc-status-badge status--in-surgery";
      case "On Leave":
        return "hosp-doc-status-badge status--on-leave";
      default:
        return "hosp-doc-status-badge";
    }
  };

  return (
    <div className="hosp-docs-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="hosp-doc-toast" role="alert">
          <FaCheckCircle className="toast-icon-check" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="hosp-docs-controls">
        <div className="hosp-docs-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search doctors by name, ID, qualification, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search doctors"
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

        <div className="hosp-docs-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by Specialty"
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="hosp-filter-group">
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              aria-label="Filter by Blood Group"
            >
              <option value="All">All Blood Groups</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Provided"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="hosp-filter-group">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Surgery">In Surgery</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <button className="hosp-btn-download" onClick={handleDownloadReport} style={{ background: "#0d9488", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <FaDownload /> Download Report
          </button>

          <button className="hosp-btn-add" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Doctor
          </button>
        </div>
      </div>

      {/* ── DOCTORS TABLE / LIST ── */}
      <div className="hosp-card hosp-doc-table-card">
        <div className="hosp-table-header-bar">
          <div>
            <h3 className="hosp-card-title" style={{ marginBottom: "0.2rem" }}>
              Hospital Medical Staff Directory
            </h3>
            <p className="table-subtitle">
              Showing {filteredDoctors.length} of {doctors.length} registered hospital doctors
            </p>
          </div>
        </div>

        <div className="hosp-table-wrapper">
          <table className="hosp-table hosp-doc-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Doctor ID</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Department</th>
                <th>Doctor Type</th>
                <th>Status</th>
                <th style={{ textAlign: "right", paddingRight: "1.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="doc-table-row">
                    {/* Doctor Name */}
                    <td>
                      <div className="doc-name-cell">
                        <div
                          className="doc-avatar-mini"
                          style={{ backgroundColor: doc.avatarBg }}
                        >
                          {doc.name.split(" ").slice(-1)[0][0]}
                        </div>
                        <div className="doc-name-info">
                          <span className="doc-name-text">{doc.name}</span>
                          <span className="doc-email-text">{doc.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Doctor ID */}
                    <td>
                      <span className="hosp-doc-id-badge">{doc.id}</span>
                    </td>

                    {/* Specialization */}
                    <td>
                      <span className="doc-spec-pill">{doc.specialization}</span>
                    </td>

                    {/* Qualification */}
                    <td>
                      <span className="doc-qual-text">{doc.qualification}</span>
                    </td>

                    {/* Experience */}
                    <td>
                      <span className="doc-exp-badge">{doc.experience}</span>
                    </td>

                    {/* Department */}
                    <td>
                      <span className="doc-dept-text">{doc.department}</span>
                    </td>

                    {/* Doctor Type: Hospital */}
                    <td>
                      <span className="hosp-doc-type-tag">
                        <FaHospital className="mini-icon" /> {doc.doctorType || "Hospital"}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={getStatusBadge(doc.status)}>
                        {doc.status}
                      </span>
                    </td>

                    {/* Actions: View & Edit */}
                    <td>
                      <div className="hosp-doc-actions-cell">
                        <button
                          className="hosp-doc-btn btn-view-doc"
                          onClick={() => setViewDoctor(doc)}
                          title="View Doctor Details"
                        >
                          <FaEye />
                          <span>View</span>
                        </button>
                        <button
                          className="hosp-doc-btn btn-edit-doc"
                          onClick={() => handleOpenEdit(doc)}
                          title="Edit Doctor"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="hosp-table-empty">
                    <FaUserMd className="empty-icon" />
                    <h3>No users found for the selected blood group.</h3>
                    <p>Try clearing your filters or selecting a different blood group.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: VIEW DOCTOR DETAILS ── */}
      {viewDoctor && (
        <div className="hosp-modal-overlay" onClick={() => setViewDoctor(null)}>
          <div
            className="hosp-modal hosp-doc-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUserMd className="modal-header-icon" />
                <div>
                  <h2>Doctor Details</h2>
                  <span className="modal-ref-id">{viewDoctor.id}</span>
                </div>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setViewDoctor(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="doc-view-modal-body">
              {/* Doctor Header Banner Card */}
              <div className="doc-view-header-card">
                <div
                  className="doc-avatar-large"
                  style={{ backgroundColor: viewDoctor.avatarBg }}
                >
                  {viewDoctor.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="doc-view-header-details">
                  <div className="doc-title-row">
                    <h3 className="doc-fullname">{viewDoctor.name}</h3>
                    <span className={getStatusBadge(viewDoctor.status)}>
                      {viewDoctor.status}
                    </span>
                  </div>
                  <p className="doc-specialty-sub">
                    {viewDoctor.specialization} &bull; {viewDoctor.qualification}
                  </p>
                  <div className="doc-quick-chips">
                    <span className="doc-chip">
                      <FaBuilding /> {viewDoctor.department}
                    </span>
                    <span className="doc-chip">
                      <FaBriefcase /> {viewDoctor.experience} Exp
                    </span>
                    <span className="doc-chip doc-chip--hospital">
                      <FaHospital /> {viewDoctor.doctorType || "Hospital"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete Information Grid */}
              <div className="doc-details-section">
                <h4 className="section-title">Doctor Profile Information</h4>
                <div className="doc-info-grid">
                  <div className="info-item">
                    <span className="info-lbl">Full Name:</span>
                    <span className="info-val font-bold">{viewDoctor.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Doctor ID:</span>
                    <span className="info-val font-bold text-primary-color">{viewDoctor.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">User ID:</span>
                    <span className="info-val">{viewDoctor.userId || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Hospital ID:</span>
                    <span className="info-val">{viewDoctor.hospitalId || "HOSP-5021"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Phone Number:</span>
                    <span className="info-val">{viewDoctor.phone || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Specialization:</span>
                    <span className="info-val">{viewDoctor.specialization || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Department:</span>
                    <span className="info-val">{viewDoctor.department || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Qualifications:</span>
                    <span className="info-val">{viewDoctor.qualification || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Experience:</span>
                    <span className="info-val">{viewDoctor.experience || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Medical License Number:</span>
                    <span className="info-val font-bold">{viewDoctor.licenseNumber || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Consultation Fee:</span>
                    <span className="info-val font-bold">{viewDoctor.consultationFee || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Availability Schedule:</span>
                    <span className="info-val">
                      <FaClock className="mini-icon" /> {viewDoctor.availability || "—"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">On-Duty Status:</span>
                    <span className="info-val">
                      <span className={getStatusBadge(viewDoctor.status)}>{viewDoctor.status}</span>
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Registration Date:</span>
                    <span className="info-val">{viewDoctor.registrationDate || "—"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-lbl">Account Status:</span>
                    <span className="info-val text-success font-bold">{viewDoctor.accountStatus || "Active"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="hosp-modal-actions">
              <button
                type="button"
                className="hosp-btn-submit"
                onClick={() => {
                  const doc = viewDoctor;
                  setViewDoctor(null);
                  handleOpenEdit(doc);
                }}
              >
                <FaEdit />
                <span>Edit Doctor Profile</span>
              </button>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setViewDoctor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT DOCTOR PROFILE ── */}
      {editDoctor && (
        <div className="hosp-modal-overlay" onClick={() => setEditDoctor(null)}>
          <div
            className="hosp-modal hosp-doc-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaEdit className="modal-header-icon" />
                <div>
                  <h2>Edit Doctor Profile</h2>
                  <span className="modal-ref-id">{editDoctor.id}</span>
                </div>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => setEditDoctor(null)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveEditDoctor} className="hosp-modal-form">
              {/* Read-Only System Identifiers: Doctor ID, User ID, Hospital ID */}
              <div className="edit-readonly-strip">
                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" /> Doctor ID:
                  </span>
                  <span className="readonly-val font-bold">{editDoctor.id}</span>
                </div>
                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" /> User ID:
                  </span>
                  <span className="readonly-val">{editDoctor.userId || "—"}</span>
                </div>
                <div className="readonly-item">
                  <span className="readonly-lbl">
                    <FaLock className="lock-icon" /> Hospital ID:
                  </span>
                  <span className="readonly-val">{editDoctor.hospitalId || "HOSP-5021"}</span>
                </div>
              </div>

              {/* Editable: Full Name * & Phone Number * */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Editable: Specialization * & Department * */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Specialization *</label>
                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Department *</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Editable: Qualifications * & Experience (Years) * */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Qualifications *</label>
                  <input
                    type="text"
                    placeholder="e.g. MBBS, MD, DM"
                    value={editQualification}
                    onChange={(e) => setEditQualification(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Experience (Years) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Years"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Editable: Medical License Number * & Consultation Fee * */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Medical License Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. KMC-2015-89632"
                    value={editLicenseNumber}
                    onChange={(e) => setEditLicenseNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Consultation Fee *</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,200"
                    value={editConsultationFee}
                    onChange={(e) => setEditConsultationFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Editable: Availability Schedule * & On-Duty Status */}
              <div className="form-row">
                <div className="form-group half">
                  <label>Availability Schedule *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon - Fri, 09:00 AM - 04:00 PM"
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>On-Duty Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="In Surgery">In Surgery</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setEditDoctor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaCheckCircle />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW STAFF DOCTOR (COMPLETE 10-FIELD REGISTRATION FORM) ── */}
      {showAddModal && (
        <div
          className="hosp-modal-overlay"
          onClick={() => {
            setShowAddModal(false);
            resetAddForm();
          }}
        >
          <div
            className="hosp-modal hosp-doc-add-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUserMd className="modal-header-icon" />
                <div>
                  <h2>Add New Staff Doctor</h2>
                  <span className="modal-ref-id">Hospital Medical Staff Registration</span>
                </div>
              </div>
              <button
                className="hosp-modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="hosp-modal-form hosp-doc-form-scrollable" noValidate>
              {/* System-Generated Identifiers Notice Banner */}
              <div className="doc-system-gen-banner">
                <div className="sys-gen-icon-wrap">
                  <FaHospital className="sys-gen-icon" />
                </div>
                <div className="sys-gen-text">
                  <span className="sys-gen-title">System-Generated Identifiers</span>
                  <p className="sys-gen-desc">
                    <strong>Doctor ID</strong>, <strong>User ID</strong>, and hospital linkage (<strong>HOSP-5021</strong>) are assigned automatically by the system upon registration.
                  </p>
                </div>
              </div>

              {/* 1. Full Name * & 2. Phone Number * */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-name">
                    Full Name <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-name"
                    type="text"
                    placeholder="e.g. Dr. John Watson"
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value);
                      if (addErrors.name) setAddErrors((prev) => ({ ...prev, name: null }));
                    }}
                    className={addErrors.name ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.name && <span className="doc-field-error-msg">{addErrors.name}</span>}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-phone">
                    Phone Number <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-phone"
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={addPhone}
                    onChange={(e) => {
                      setAddPhone(e.target.value);
                      if (addErrors.phone) setAddErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    className={addErrors.phone ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.phone && <span className="doc-field-error-msg">{addErrors.phone}</span>}
                </div>
              </div>

              {/* 3. Specialization * & 4. Department * */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-spec">
                    Specialization <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-spec"
                    type="text"
                    placeholder="e.g. Cardiologist"
                    value={addSpecialization}
                    onChange={(e) => {
                      setAddSpecialization(e.target.value);
                      if (addErrors.specialization)
                        setAddErrors((prev) => ({ ...prev, specialization: null }));
                    }}
                    className={addErrors.specialization ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.specialization && (
                    <span className="doc-field-error-msg">{addErrors.specialization}</span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-dept">
                    Department <span className="req-star">*</span>
                  </label>
                  <select
                    id="add-doc-dept"
                    value={addDepartment}
                    onChange={(e) => {
                      setAddDepartment(e.target.value);
                      if (addErrors.department)
                        setAddErrors((prev) => ({ ...prev, department: null }));
                    }}
                    className={addErrors.department ? "input-field-error" : ""}
                    required
                  >
                    {doctorDepartmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {addErrors.department && (
                    <span className="doc-field-error-msg">{addErrors.department}</span>
                  )}
                </div>
              </div>

              {/* Custom Department input when "Other" is selected */}
              {addDepartment === "Other" && (
                <div className="form-group">
                  <label htmlFor="add-doc-custom-dept">
                    Specify Department Name <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-custom-dept"
                    type="text"
                    placeholder="e.g. Oncology & Radiation Care"
                    value={addCustomDept}
                    onChange={(e) => {
                      setAddCustomDept(e.target.value);
                      if (addErrors.customDept)
                        setAddErrors((prev) => ({ ...prev, customDept: null }));
                    }}
                    className={addErrors.customDept ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.customDept && (
                    <span className="doc-field-error-msg">{addErrors.customDept}</span>
                  )}
                </div>
              )}

              {/* 5. Qualifications * & 6. Experience (Years) * */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-qual">
                    Qualifications <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-qual"
                    type="text"
                    placeholder="e.g. MBBS, MD"
                    value={addQualification}
                    onChange={(e) => {
                      setAddQualification(e.target.value);
                      if (addErrors.qualification)
                        setAddErrors((prev) => ({ ...prev, qualification: null }));
                    }}
                    className={addErrors.qualification ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.qualification && (
                    <span className="doc-field-error-msg">{addErrors.qualification}</span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-exp">
                    Experience (Years) <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-exp"
                    type="number"
                    min="0"
                    max="70"
                    step="1"
                    placeholder="e.g. 8"
                    value={addExperience}
                    onChange={(e) => {
                      setAddExperience(e.target.value);
                      if (addErrors.experience)
                        setAddErrors((prev) => ({ ...prev, experience: null }));
                    }}
                    className={addErrors.experience ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.experience && (
                    <span className="doc-field-error-msg">{addErrors.experience}</span>
                  )}
                </div>
              </div>

              {/* 7. Medical License Number * & 8. Consultation Fee * */}
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="add-doc-license">
                    Medical License Number <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-license"
                    type="text"
                    placeholder="e.g. MED-LIC-2026-001"
                    value={addLicenseNumber}
                    onChange={(e) => {
                      setAddLicenseNumber(e.target.value);
                      if (addErrors.licenseNumber)
                        setAddErrors((prev) => ({ ...prev, licenseNumber: null }));
                    }}
                    className={addErrors.licenseNumber ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.licenseNumber && (
                    <span className="doc-field-error-msg">{addErrors.licenseNumber}</span>
                  )}
                </div>

                <div className="form-group half">
                  <label htmlFor="add-doc-fee">
                    Consultation Fee (₹) <span className="req-star">*</span>
                  </label>
                  <input
                    id="add-doc-fee"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 1200"
                    value={addConsultationFee}
                    onChange={(e) => {
                      setAddConsultationFee(e.target.value);
                      if (addErrors.consultationFee)
                        setAddErrors((prev) => ({ ...prev, consultationFee: null }));
                    }}
                    className={addErrors.consultationFee ? "input-field-error" : ""}
                    required
                  />
                  {addErrors.consultationFee && (
                    <span className="doc-field-error-msg">{addErrors.consultationFee}</span>
                  )}
                </div>
              </div>

              {/* 9. Availability Schedule * */}
              <div className="form-group">
                <div className="schedule-header-row">
                  <label htmlFor="add-doc-sched">
                    Availability Schedule <span className="req-star">*</span>
                  </label>
                  <span className="schedule-hint-text">Select a preset or enter working hours</span>
                </div>
                <input
                  id="add-doc-sched"
                  type="text"
                  placeholder="e.g. Mon - Fri, 09:00 AM - 04:00 PM"
                  value={addAvailability}
                  onChange={(e) => {
                    setAddAvailability(e.target.value);
                    if (addErrors.availability)
                      setAddErrors((prev) => ({ ...prev, availability: null }));
                  }}
                  className={addErrors.availability ? "input-field-error" : ""}
                  required
                />
                {addErrors.availability && (
                  <span className="doc-field-error-msg">{addErrors.availability}</span>
                )}
                <div className="schedule-preset-chips">
                  {[
                    "Mon - Fri, 09:00 AM - 04:00 PM",
                    "Mon - Sat, 10:00 AM - 05:00 PM",
                    "Tue - Sun, 08:30 AM - 02:00 PM",
                    "24/7 On-Call / Emergency Duty",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`schedule-preset-chip ${addAvailability === preset ? "chip-active" : ""}`}
                      onClick={() => {
                        setAddAvailability(preset);
                        if (addErrors.availability)
                          setAddErrors((prev) => ({ ...prev, availability: null }));
                      }}
                    >
                      <FaClock className="chip-icon" /> {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 10. On-Duty Status */}
              <div className="form-group">
                <label htmlFor="add-doc-status">On-Duty Status</label>
                <select
                  id="add-doc-status"
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value)}
                >
                  <option value="Available">Available</option>
                  <option value="In Surgery">In Surgery</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="hosp-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="hosp-btn-submit">
                  <FaCheckCircle />
                  <span>Register Doctor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageDoctors;
