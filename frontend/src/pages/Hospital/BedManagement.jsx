import React, { useEffect, useMemo, useState } from "react";

import {
  FaBed,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimes,
  FaEye,
  FaUserPlus,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaHospital,
  FaProcedures,
  FaHeartbeat,
  FaUserInjured,
  FaCalendarAlt,
  FaInfoCircle,
  FaPlus,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./BedManagement.css";

const CATEGORIES = [
  "All Categories",
  "General Ward",
  "ICU",
  "Private / Cabin",
];

const STATUSES = [
  "All Statuses",
  "Available",
  "Occupied",
  "Reserved",
];

const BED_TYPES = [
  "General",
  "ICU",
  "Semi-Private",
  "Private",
  "Emergency",
  "Pediatric",
  "Maternity",
];

function BedManagement() {
  const token = localStorage.getItem("token");

  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");
  const [selectedStatus, setSelectedStatus] =
    useState("All Statuses");

  const [detailsBed, setDetailsBed] = useState(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [addBedModalOpen, setAddBedModalOpen] = useState(false);

  const [targetBed, setTargetBed] = useState(null);

  // Assign state
  const [assignBedId, setAssignBedId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [attendingDoctorId, setAttendingDoctorId] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  // Add bed state
  const [newBedNumber, setNewBedNumber] = useState("");
  const [newWard, setNewWard] = useState("");
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newBedType, setNewBedType] = useState("General");
  const [newBedStatus, setNewBedStatus] = useState("Available");
  const [newDailyRate, setNewDailyRate] = useState("");
  const [newBedNotes, setNewBedNotes] = useState("");

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getPatientName = (patient) => {
    return (
      patient?.name ||
      patient?.fullName ||
      patient?.user?.name ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (doctor) => {
    return (
      doctor?.name ||
      doctor?.fullName ||
      doctor?.user?.name ||
      "Doctor"
    );
  };

  const getPatientId = (patient) => {
    return patient?._id || patient?.id || "";
  };

  const getDoctorId = (doctor) => {
    return doctor?._id || doctor?.id || "";
  };

  const getBedCategory = (type) => {
    if (type === "ICU") {
      return "ICU";
    }

    if (type === "Private" || type === "Semi-Private") {
      return "Private / Cabin";
    }

    return "General Ward";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  /*
   * ---------------------------------------------------------
   * FETCH BEDS
   * ---------------------------------------------------------
   */

  const fetchBeds = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/hospital/beds",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch hospital beds."
        );
      }

      /*
       * bedController returns:
       *
       * data: {
       *   beds: [],
       *   stats: {},
       *   wardSummary: []
       * }
       */

      const backendBeds = Array.isArray(result?.data?.beds)
        ? result.data.beds
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

      const normalizedBeds = backendBeds.map((bed) => ({
        id: bed?._id || bed?.id || "",

        bedNumber: bed?.bedNumber || "",

        ward: bed?.ward || "",

        type: bed?.type || "General",

        wardType: getBedCategory(bed?.type || "General"),

        departmentName:
          bed?.departmentId?.name ||
          bed?.departmentName ||
          "",

        departmentId:
          bed?.departmentId?._id ||
          bed?.departmentId ||
          "",

        status: bed?.status || "Available",

        patientId:
          bed?.patientId?._id ||
          bed?.patientId ||
          "",

        patientName:
          bed?.patientName ||
          bed?.patientId?.name ||
          "",

        patientPhone:
          bed?.patientId?.phone ||
          "",

        patientEmail:
          bed?.patientId?.email ||
          "",

        dailyRate:
          typeof bed?.dailyRate === "number"
            ? bed.dailyRate
            : Number(bed?.dailyRate || 0),

        admissionDate:
          bed?.admittedAt || null,

        notes:
          bed?.notes || "",
      }));

      setBeds(normalizedBeds);
    } catch (error) {
      console.error("Failed to fetch beds:", error);

      toast.error(
        error.message || "Failed to load beds."
      );

      setBeds([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * FETCH PATIENTS
   * ---------------------------------------------------------
   */

  const fetchPatients = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/hospital/patients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch patients."
        );
      }

      const backendPatients = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.patients)
          ? result.data.patients
          : Array.isArray(result)
            ? result
            : [];

      setPatients(backendPatients);
    } catch (error) {
      console.error(
        "Failed to fetch hospital patients:",
        error
      );

      setPatients([]);
    }
  };

  /*
   * ---------------------------------------------------------
   * FETCH DOCTORS
   * ---------------------------------------------------------
   */

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/hospital/doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch doctors."
        );
      }

      const backendDoctors = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.doctors)
          ? result.data.doctors
          : Array.isArray(result)
            ? result
            : [];

      setDoctors(backendDoctors);
    } catch (error) {
      console.error(
        "Failed to fetch hospital doctors:",
        error
      );

      setDoctors([]);
    }
  };

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    fetchBeds();
    fetchPatients();
    fetchDoctors();
  }, [token]);

  /*
   * ---------------------------------------------------------
   * SUMMARY
   * ---------------------------------------------------------
   */

  const totalBedsCount = beds.length;

  const availableBedsCount = beds.filter(
    (bed) => bed.status === "Available"
  ).length;

  const occupiedBedsCount = beds.filter(
    (bed) => bed.status === "Occupied"
  ).length;

  const reservedBedsCount = beds.filter(
    (bed) => bed.status === "Reserved"
  ).length;

  const icuBedsCount = beds.filter(
    (bed) => bed.type === "ICU"
  ).length;

  const icuOccupiedCount = beds.filter(
    (bed) =>
      bed.type === "ICU" &&
      bed.status === "Occupied"
  ).length;

  const icuAvailableCount = beds.filter(
    (bed) =>
      bed.type === "ICU" &&
      bed.status === "Available"
  ).length;

  const occupancyRate = totalBedsCount
    ? Math.round(
      (occupiedBedsCount / totalBedsCount) * 100
    )
    : 0;

  const wardCount = new Set(
    beds
      .map((bed) => bed.ward)
      .filter(Boolean)
  ).size;

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        String(bed.bedNumber || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.id || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.ward || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.type || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.wardType || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.patientName || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.patientId || "")
          .toLowerCase()
          .includes(q) ||
        String(bed.departmentName || "")
          .toLowerCase()
          .includes(q);

      const matchCategory =
        selectedCategory === "All Categories" ||
        bed.wardType === selectedCategory;

      const matchStatus =
        selectedStatus === "All Statuses" ||
        bed.status === selectedStatus;

      return (
        matchSearch &&
        matchCategory &&
        matchStatus
      );
    });
  }, [
    beds,
    search,
    selectedCategory,
    selectedStatus,
  ]);

  /*
   * ---------------------------------------------------------
   * OPEN ADD BED
   * ---------------------------------------------------------
   */

  const handleOpenAddBedModal = () => {
    setNewBedNumber("");
    setNewWard("");
    setNewDepartmentId("");
    setNewDepartmentName("");
    setNewBedType("General");
    setNewBedStatus("Available");
    setNewDailyRate("");
    setNewBedNotes("");

    setAddBedModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * ADD BED
   * ---------------------------------------------------------
   */

  const handleAddBed = async (e) => {
    e.preventDefault();

    if (!newBedNumber.trim()) {
      toast.warning("Please enter bed number.");
      return;
    }

    if (!newWard.trim()) {
      toast.warning("Please enter ward.");
      return;
    }

    try {
      setSaving(true);

      /*
       * Bed model:
       * departmentId -> MongoDB ObjectId or null
       *
       * Since the current Add Bed UI accepts Department ID as
       * a text field, only send it if it is a valid MongoDB ObjectId.
       * Values like ID-012 must NOT be sent as departmentId.
       */

      const validDepartmentId =
        /^[0-9a-fA-F]{24}$/.test(
          newDepartmentId.trim()
        )
          ? newDepartmentId.trim()
          : null;

      const response = await fetch(
        "http://localhost:5000/api/hospital/beds",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bedNumber: newBedNumber.trim(),

            ward: newWard.trim(),

            departmentId: validDepartmentId,

            departmentName:
              newDepartmentName.trim(),

            type: newBedType,

            status: newBedStatus,

            dailyRate:
              Number(newDailyRate) || 1000,

            notes:
              newBedNotes.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to add bed."
        );
      }

      toast.success(
        result?.message ||
        "Bed added successfully."
      );

      setAddBedModalOpen(false);

      setNewBedNumber("");
      setNewWard("");
      setNewDepartmentId("");
      setNewDepartmentName("");
      setNewBedType("General");
      setNewBedStatus("Available");
      setNewDailyRate("");
      setNewBedNotes("");

      await fetchBeds();

    } catch (error) {
      console.error(
        "Add bed failed:",
        error
      );

      toast.error(
        error.message ||
        "Failed to add bed."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * OPEN ASSIGN MODAL
   * ---------------------------------------------------------
   */

  const handleOpenAssignModal = (
    preselectedBedId = ""
  ) => {
    const availableBeds = beds.filter(
      (bed) =>
        bed.status === "Available" ||
        bed.status === "Reserved"
    );

    const selectedBed =
      preselectedBedId
        ? beds.find(
          (bed) =>
            bed.id === preselectedBedId
        )
        : null;

    const defaultBedId =
      preselectedBedId &&
        selectedBed &&
        (
          selectedBed.status === "Available" ||
          selectedBed.status === "Reserved"
        )
        ? preselectedBedId
        : availableBeds[0]?.id || "";

    setAssignBedId(defaultBedId);

    setSelectedPatientId(
      patients.length > 0
        ? getPatientId(patients[0])
        : ""
    );

    setAttendingDoctorId(
      doctors.length > 0
        ? getDoctorId(doctors[0])
        : ""
    );

    setAdmissionDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setAssignNotes(
      selectedBed?.notes || ""
    );

    setAssignModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * ASSIGN BED
   * ---------------------------------------------------------
   */

  const handleConfirmAssign = async (e) => {
    e.preventDefault();

    if (!assignBedId) {
      toast.warning("Please select a bed.");
      return;
    }

    if (!selectedPatientId) {
      toast.warning("Please select a patient.");
      return;
    }

    const selectedBed = beds.find(
      (bed) => bed.id === assignBedId
    );

    if (!selectedBed) {
      toast.warning("Selected bed not found.");
      return;
    }

    if (
      selectedBed.status !== "Available" &&
      selectedBed.status !== "Reserved"
    ) {
      toast.warning(
        "Selected bed is no longer available."
      );

      await fetchBeds();
      return;
    }

    const selectedPatient = patients.find(
      (patient) =>
        getPatientId(patient) ===
        selectedPatientId
    );

    if (!selectedPatient) {
      toast.warning(
        "Selected patient not found."
      );
      return;
    }

    try {
      setSaving(true);

      const patientName =
        getPatientName(selectedPatient);

      /*
       * Bed controller supports:
       *
       * status
       * patientId
       * patientName
       * notes
       *
       * It does NOT support doctorId or admissionDate.
       *
       * admittedAt is automatically created by backend
       * when status becomes Occupied.
       */

      const selectedDoctor = doctors.find(
        (doctor) =>
          getDoctorId(doctor) ===
          attendingDoctorId
      );

      const doctorNote = selectedDoctor
        ? `Attending Doctor: ${getDoctorName(
          selectedDoctor
        )}`
        : "";

      const combinedNotes = [
        assignNotes.trim(),
        doctorNote,
      ]
        .filter(Boolean)
        .join("\n");

      const response = await fetch(
        `http://localhost:5000/api/hospital/beds/${assignBedId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Occupied",
            patientId: selectedPatientId,
            patientName,
            notes: combinedNotes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to assign bed."
        );
      }

      toast.success(
        result?.message ||
        "Bed assigned successfully."
      );

      setAssignModalOpen(false);

      setAssignBedId("");
      setSelectedPatientId("");
      setAttendingDoctorId("");
      setAdmissionDate("");
      setAssignNotes("");

      await fetchBeds();
    } catch (error) {
      console.error(
        "Bed assignment failed:",
        error
      );

      toast.error(
        error.message ||
        "Failed to assign bed."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * OPEN RELEASE MODAL
   * ---------------------------------------------------------
   */

  const handleOpenReleaseModal = (bed) => {
    setTargetBed(bed);
    setReleaseModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * RELEASE BED
   * ---------------------------------------------------------
   */

  const handleConfirmRelease = async () => {
    if (!targetBed) return;

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000/api/hospital/beds/${targetBed.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Available",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to release bed."
        );
      }

      toast.success(
        result?.message ||
        "Bed released successfully."
      );

      setReleaseModalOpen(false);
      setTargetBed(null);

      if (
        detailsBed &&
        detailsBed.id === targetBed.id
      ) {
        setDetailsBed(null);
      }

      await fetchBeds();
    } catch (error) {
      console.error(
        "Bed release failed:",
        error
      );

      toast.error(
        error.message ||
        "Failed to release bed."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * STATUS BADGE
   * ---------------------------------------------------------
   */

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Available":
        return "hosp-bed-status-pill hosp-bed-status--available";

      case "Occupied":
        return "hosp-bed-status-pill hosp-bed-status--occupied";

      case "Reserved":
        return "hosp-bed-status-pill hosp-bed-status--reserved";

      default:
        return "hosp-bed-status-pill";
    }
  };

  /*
   * ---------------------------------------------------------
   * CATEGORY BADGE
   * ---------------------------------------------------------
   */

  const getCategoryBadgeClass = (wardType) => {
    switch (wardType) {
      case "ICU":
        return "hosp-bed-category-pill category-icu";

      case "Private / Cabin":
        return "hosp-bed-category-pill category-private";

      case "General Ward":
      default:
        return "hosp-bed-category-pill category-general";
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="hosp-beds-page">

      {/* =====================================================
          TOP BANNER
      ====================================================== */}

      <div className="hosp-bed-header-banner">

        <div className="banner-info">

          <div className="banner-icon-box">
            <FaBed />
          </div>

          <div>
            <h2 className="banner-title">
              Hospital Bed Management
            </h2>

            <p className="banner-subtitle">
              Monitor real-time ward capacities,
              allocate inpatient beds, and track
              patient admissions.
            </p>
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="hosp-btn-assign-top"
            onClick={handleOpenAddBedModal}
          >
            <FaPlus />
            <span>Add Bed</span>
          </button>

          <button
            type="button"
            className="hosp-btn-assign-top"
            onClick={() =>
              handleOpenAssignModal()
            }
          >
            <FaUserPlus />
            <span>Assign Bed</span>
          </button>
        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <section
        className="hosp-beds-summary-cards"
        aria-label="Bed summary metrics"
      >

        {/* Total */}

        <div className="hosp-stat-card card-total">

          <div className="stat-card-header">

            <span className="stat-title">
              Total Beds
            </span>

            <div className="stat-icon stat-icon--total">
              <FaHospital />
            </div>

          </div>

          <div className="stat-value">
            {totalBedsCount}
          </div>

          <div className="stat-meta">

            <span className="meta-highlight">
              {wardCount}
            </span>{" "}
            active hospital wards

          </div>

        </div>

        {/* Available */}

        <div className="hosp-stat-card card-available">

          <div className="stat-card-header">

            <span className="stat-title">
              Available Beds
            </span>

            <div className="stat-icon stat-icon--available">
              <FaCheckCircle />
            </div>

          </div>

          <div className="stat-value text-success">
            {availableBedsCount}
          </div>

          <div className="stat-meta">

            <span className="meta-badge meta-badge--success">
              {totalBedsCount
                ? Math.round(
                  (availableBedsCount /
                    totalBedsCount) *
                  100
                )
                : 0}
              % Available
            </span>{" "}
            Ready for check-in

          </div>

        </div>

        {/* Occupied */}

        <div className="hosp-stat-card card-occupied">

          <div className="stat-card-header">

            <span className="stat-title">
              Occupied Beds
            </span>

            <div className="stat-icon stat-icon--occupied">
              <FaUserInjured />
            </div>

          </div>

          <div className="stat-value text-danger">
            {occupiedBedsCount}
          </div>

          <div className="stat-meta">

            <span className="meta-badge meta-badge--danger">
              {occupancyRate}% Occupancy
            </span>{" "}
            Currently admitted

          </div>

        </div>

        {/* ICU */}

        <div className="hosp-stat-card card-icu">

          <div className="stat-card-header">

            <span className="stat-title">
              ICU Beds
            </span>

            <div className="stat-icon stat-icon--icu">
              <FaHeartbeat />
            </div>

          </div>

          <div className="stat-value text-primary-color">
            {icuBedsCount}
          </div>

          <div className="stat-meta">

            <span className="meta-substat">

              <strong>
                {icuOccupiedCount}
              </strong>{" "}
              In Use &bull;{" "}

              <strong>
                {icuAvailableCount}
              </strong>{" "}
              Free

            </span>

          </div>

        </div>

      </section>

      {/* =====================================================
          FILTER PANEL
      ====================================================== */}

      <div className="hosp-beds-control-panel hosp-card">

        <div
          className="hosp-bed-category-tabs"
          role="tablist"
        >

          {CATEGORIES.map((cat) => {

            const count =
              cat === "All Categories"
                ? beds.length
                : beds.filter(
                  (bed) =>
                    bed.wardType === cat
                ).length;

            const isActive =
              selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`category-tab-btn ${isActive
                  ? "category-tab-btn--active"
                  : ""
                  }`}
                onClick={() =>
                  setSelectedCategory(cat)
                }
              >

                <span>{cat}</span>

                <span className="category-count-badge">
                  {count}
                </span>

              </button>
            );
          })}

        </div>

        <div className="hosp-bed-filters-row">

          <div className="hosp-bed-search-box">

            <FaSearch className="hosp-search-icon" />

            <input
              type="text"
              placeholder="Search by Bed #, Patient Name, Patient ID, Ward..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              aria-label="Search beds"
            />

            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}

          </div>

          <div className="hosp-bed-filter-select">

            <FaFilter className="hosp-filter-icon" />

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value
                )
              }
              aria-label="Filter by Status"
            >

              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          BED TABLE
      ====================================================== */}

      <div className="hosp-card hosp-bed-table-card">

        <div className="hosp-table-header-bar">

          <div>

            <h3
              className="hosp-card-title"
              style={{
                marginBottom: "0.2rem",
              }}
            >
              Hospital Bed Directory
            </h3>

            <p className="table-subtitle">
              Showing {filteredBeds.length} of{" "}
              {beds.length} registered hospital
              beds
            </p>

          </div>

        </div>

        <div className="hosp-table-wrapper">

          <table className="hosp-table hosp-bed-table">

            <thead>

              <tr>
                <th>Bed Number</th>
                <th>Ward / Type</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Status</th>
                <th>Admission Date</th>

                <th
                  style={{
                    textAlign: "right",
                    paddingRight: "1.5rem",
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
                    className="hosp-table-empty"
                  >

                    <FaBed className="empty-icon" />

                    <h3>
                      Loading beds...
                    </h3>

                    <p>
                      Fetching hospital bed
                      information.
                    </p>

                  </td>

                </tr>

              ) : filteredBeds.length > 0 ? (

                filteredBeds.map((bed) => (

                  <tr
                    key={bed.id}
                    className={`bed-row status-row--${String(
                      bed.status
                    ).toLowerCase()}`}
                  >

                    {/* BED NUMBER */}

                    <td>

                      <div className="bed-number-cell">

                        <div className="bed-cell-icon">
                          <FaProcedures />
                        </div>

                        <div>

                          <span className="bed-id-text">
                            {bed.bedNumber}
                          </span>

                          <span className="bed-room-text">
                            {bed.ward}
                          </span>

                        </div>

                      </div>

                    </td>

                    {/* WARD / TYPE */}

                    <td>

                      <span
                        className={getCategoryBadgeClass(
                          bed.wardType
                        )}
                      >
                        {bed.wardType}
                      </span>

                      <div
                        style={{
                          marginTop: "0.3rem",
                          fontSize: "0.78rem",
                        }}
                      >
                        {bed.type}
                      </div>

                    </td>

                    {/* PATIENT */}

                    <td>

                      {bed.patientName ? (

                        <div className="bed-patient-cell">

                          <span className="hosp-pat-name">
                            {bed.patientName}
                          </span>

                        </div>

                      ) : (

                        <span className="text-muted-dash">
                          —
                        </span>

                      )}

                    </td>

                    {/* PATIENT ID */}

                    <td>

                      {bed.patientId ? (

                        <span className="hosp-pat-id">
                          {bed.patientId}
                        </span>

                      ) : (

                        <span className="text-muted-dash">
                          —
                        </span>

                      )}

                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={getStatusBadgeClass(
                          bed.status
                        )}
                      >
                        {bed.status}
                      </span>

                    </td>

                    {/* ADMISSION DATE */}

                    <td>

                      <div className="bed-date-cell">

                        {bed.admissionDate ? (
                          <>
                            <FaCalendarAlt className="mini-icon text-muted" />

                            <span>
                              {formatDate(
                                bed.admissionDate
                              )}
                            </span>
                          </>
                        ) : (

                          <span className="text-muted-dash">
                            —
                          </span>

                        )}

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="hosp-bed-actions-cell">

                        <button
                          type="button"
                          className="hosp-bed-action-btn btn-view-details"
                          onClick={() =>
                            setDetailsBed(bed)
                          }
                          title="View Details"
                        >

                          <FaEye />

                          <span>
                            View Details
                          </span>

                        </button>

                        {(
                          bed.status === "Available" ||
                          bed.status === "Reserved"
                        ) && (

                            <button
                              type="button"
                              className="hosp-bed-action-btn btn-assign-bed"
                              onClick={() =>
                                handleOpenAssignModal(
                                  bed.id
                                )
                              }
                              title={
                                bed.status ===
                                  "Reserved"
                                  ? "Admit Patient"
                                  : "Assign Bed"
                              }
                            >

                              <FaUserPlus />

                              <span>
                                {bed.status ===
                                  "Reserved"
                                  ? "Admit"
                                  : "Assign Bed"}
                              </span>

                            </button>

                          )}

                        {(
                          bed.status === "Occupied" ||
                          bed.status === "Reserved"
                        ) && (

                            <button
                              type="button"
                              className="hosp-bed-action-btn btn-release-bed"
                              onClick={() =>
                                handleOpenReleaseModal(
                                  bed
                                )
                              }
                              title="Release Bed"
                            >

                              <FaSignOutAlt />

                              <span>
                                Release Bed
                              </span>

                            </button>

                          )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="hosp-table-empty"
                  >

                    <FaBed className="empty-icon" />

                    <h3>
                      No matching beds found
                    </h3>

                    <p>
                      Try adjusting your search
                      query, category selection,
                      or status filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          ADD BED MODAL
      ====================================================== */}

      {addBedModalOpen && (

        <div
          className="hosp-modal-overlay"
          onClick={() =>
            setAddBedModalOpen(false)
          }
        >

          <div
            className="hosp-modal hosp-bed-assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="hosp-modal-header">

              <div className="modal-title-wrap">

                <FaBed className="modal-header-icon" />

                <h2>
                  Add Hospital Bed
                </h2>

              </div>

              <button
                type="button"
                className="hosp-modal-close"
                onClick={() =>
                  setAddBedModalOpen(false)
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleAddBed}
              className="hosp-modal-form"
            >

              {/* BED NUMBER */}

              <div className="form-group">

                <label>
                  Bed Number *
                </label>

                <input
                  type="text"
                  value={newBedNumber}
                  onChange={(e) =>
                    setNewBedNumber(
                      e.target.value
                    )
                  }
                  placeholder="Example: B-01"
                  required
                />

              </div>

              {/* WARD */}

              <div className="form-group">

                <label>
                  Ward *
                </label>

                <input
                  type="text"
                  value={newWard}
                  onChange={(e) =>
                    setNewWard(
                      e.target.value
                    )
                  }
                  placeholder="Example: General Ward"
                  required
                />

              </div>

              {/* TYPE + RATE */}

              <div className="form-row">

                <div className="form-group half">

                  <label>
                    Bed Type *
                  </label>

                  <select
                    value={newBedType}
                    onChange={(e) =>
                      setNewBedType(
                        e.target.value
                      )
                    }
                    required
                  >

                    {BED_TYPES.map((type) => (

                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="form-group half">

                  <label>
                    Daily Rate
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newDailyRate}
                    onChange={(e) =>
                      setNewDailyRate(
                        e.target.value
                      )
                    }
                    placeholder="1000"
                  />

                </div>

              </div>

              {/* DEPARTMENT */}

              <div className="form-row">

                <div className="form-group half">

                  <label>
                    Department ID
                  </label>

                  <input
                    type="text"
                    value={newDepartmentId}
                    onChange={(e) =>
                      setNewDepartmentId(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />

                </div>

                <div className="form-group half">

                  <label>
                    Department Name
                  </label>

                  <input
                    type="text"
                    value={newDepartmentName}
                    onChange={(e) =>
                      setNewDepartmentName(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />

                </div>

              </div>

              {/* STATUS */}

              <div className="form-group">

                <label>
                  Initial Status
                </label>

                <select
                  value={newBedStatus}
                  onChange={(e) =>
                    setNewBedStatus(
                      e.target.value
                    )
                  }
                >

                  <option value="Available">
                    Available
                  </option>

                  <option value="Reserved">
                    Reserved
                  </option>

                </select>

              </div>

              {/* NOTES */}

              <div className="form-group">

                <label>
                  Notes
                </label>

                <textarea
                  className="hosp-modal-textarea"
                  rows="2"
                  value={newBedNotes}
                  onChange={(e) =>
                    setNewBedNotes(
                      e.target.value
                    )
                  }
                  placeholder="Optional bed notes..."
                />

              </div>

              <div className="hosp-modal-actions">

                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() =>
                    setAddBedModalOpen(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hosp-btn-submit"
                  disabled={saving}
                >

                  <FaCheckCircle />

                  <span>
                    {saving
                      ? "Saving..."
                      : "Add Bed"}
                  </span>

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          ASSIGN BED MODAL
      ====================================================== */}

      {assignModalOpen && (

        <div
          className="hosp-modal-overlay"
          onClick={() =>
            setAssignModalOpen(false)
          }
        >

          <div
            className="hosp-modal hosp-bed-assign-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="hosp-modal-header">

              <div className="modal-title-wrap">

                <FaUserPlus className="modal-header-icon" />

                <h2>
                  Assign Hospital Bed
                </h2>

              </div>

              <button
                type="button"
                className="hosp-modal-close"
                onClick={() =>
                  setAssignModalOpen(false)
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleConfirmAssign}
              className="hosp-modal-form"
            >

              {/* BED */}

              <div className="form-group">

                <label>
                  Select Available Bed *
                </label>

                <select
                  value={assignBedId}
                  onChange={(e) =>
                    setAssignBedId(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    -- Choose a Bed --
                  </option>

                  {beds
                    .filter(
                      (bed) =>
                        bed.status ===
                        "Available" ||
                        bed.status ===
                        "Reserved"
                    )
                    .map((bed) => (

                      <option
                        key={bed.id}
                        value={bed.id}
                      >
                        {bed.bedNumber} —{" "}
                        {bed.ward} (
                        {bed.type})
                      </option>

                    ))}

                </select>

                {beds.filter(
                  (bed) =>
                    bed.status ===
                    "Available" ||
                    bed.status ===
                    "Reserved"
                ).length === 0 && (

                    <small
                      style={{
                        display: "block",
                        marginTop: "0.5rem",
                      }}
                    >
                      No available beds. Use{" "}
                      <strong>
                        Add Bed
                      </strong>{" "}
                      to create a bed on this page.
                    </small>

                  )}

              </div>

              {/* PATIENT */}

              <div className="form-group">

                <label>
                  Choose Registered Patient *
                </label>

                <select
                  value={selectedPatientId}
                  onChange={(e) =>
                    setSelectedPatientId(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    -- Choose Patient --
                  </option>

                  {patients.map((patient) => {

                    const patientId =
                      getPatientId(patient);

                    return (

                      <option
                        key={patientId}
                        value={patientId}
                      >
                        {getPatientName(
                          patient
                        )}
                      </option>

                    );
                  })}

                </select>

                {patients.length === 0 && (

                  <small
                    style={{
                      display: "block",
                      marginTop: "0.5rem",
                    }}
                  >
                    No registered patients
                    available from the hospital
                    patient endpoint.
                  </small>

                )}

              </div>

              {/* DOCTOR */}

              <div className="form-row">

                <div className="form-group half">

                  <label>
                    Attending Doctor
                  </label>

                  <select
                    value={attendingDoctorId}
                    onChange={(e) =>
                      setAttendingDoctorId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      -- Select Doctor --
                    </option>

                    {doctors.map((doctor) => {

                      const doctorId =
                        getDoctorId(doctor);

                      return (

                        <option
                          key={doctorId}
                          value={doctorId}
                        >
                          {getDoctorName(
                            doctor
                          )}

                          {doctor.specialization
                            ? ` — ${doctor.specialization}`
                            : ""}
                        </option>

                      );
                    })}

                  </select>

                </div>

                {/* ADMISSION DATE */}

                <div className="form-group half">

                  <label>
                    Admission Date *
                  </label>

                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) =>
                      setAdmissionDate(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              {/* NOTES */}

              <div className="form-group">

                <label>
                  Admission Notes / Reason for Admission
                </label>

                <textarea
                  className="hosp-modal-textarea"
                  rows="2"
                  placeholder="Enter admission notes..."
                  value={assignNotes}
                  onChange={(e) =>
                    setAssignNotes(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="hosp-modal-actions">

                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() =>
                    setAssignModalOpen(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hosp-btn-submit"
                  disabled={
                    saving ||
                    !assignBedId ||
                    !selectedPatientId
                  }
                >

                  <FaCheckCircle />

                  <span>
                    {saving
                      ? "Assigning..."
                      : "Confirm Assignment"}
                  </span>

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          RELEASE MODAL
      ====================================================== */}

      {releaseModalOpen &&
        targetBed && (

          <div
            className="hosp-modal-overlay"
            onClick={() =>
              setReleaseModalOpen(false)
            }
          >

            <div
              className="hosp-modal hosp-bed-release-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="hosp-modal-header modal-header--warning">

                <div className="modal-title-wrap">

                  <FaExclamationTriangle className="modal-header-icon text-warning" />

                  <h2>
                    Release Bed Confirmation
                  </h2>

                </div>

                <button
                  type="button"
                  className="hosp-modal-close"
                  onClick={() =>
                    setReleaseModalOpen(false)
                  }
                  aria-label="Close"
                >
                  <FaTimes />
                </button>

              </div>

              <div className="release-modal-body">

                <p className="release-warning-text">

                  Are you sure you want to release{" "}

                  <strong>
                    Bed {targetBed.bedNumber}
                  </strong>
                  ?

                </p>

                <div className="release-patient-summary">

                  <div className="summary-line">

                    <span className="summary-label">
                      Bed Number:
                    </span>

                    <span className="summary-val-text font-bold">
                      {targetBed.bedNumber}
                    </span>

                  </div>

                  <div className="summary-line">

                    <span className="summary-label">
                      Ward:
                    </span>

                    <span className="summary-val-text">
                      {targetBed.ward}
                    </span>

                  </div>

                  <div className="summary-line">

                    <span className="summary-label">
                      Bed Type:
                    </span>

                    <span
                      className={getCategoryBadgeClass(
                        targetBed.wardType
                      )}
                    >
                      {targetBed.type}
                    </span>

                  </div>

                  <div className="summary-line">

                    <span className="summary-label">
                      Patient Name:
                    </span>

                    <span className="summary-val-text font-bold text-primary-color">
                      {targetBed.patientName ||
                        "Unassigned"}
                    </span>

                  </div>

                  {targetBed.patientId && (

                    <div className="summary-line">

                      <span className="summary-label">
                        Patient ID:
                      </span>

                      <span className="hosp-pat-id">
                        {targetBed.patientId}
                      </span>

                    </div>

                  )}

                  <div className="summary-line">

                    <span className="summary-label">
                      Admission Date:
                    </span>

                    <span className="summary-val-text">
                      {formatDate(
                        targetBed.admissionDate
                      )}
                    </span>

                  </div>

                </div>

                <div className="release-notice-box">

                  <FaInfoCircle className="notice-icon" />

                  <span>

                    Confirming release will reset
                    this bed to{" "}

                    <strong>
                      Available
                    </strong>
                    .

                  </span>

                </div>

              </div>

              <div className="hosp-modal-actions">

                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() =>
                    setReleaseModalOpen(false)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-modal-danger"
                  onClick={
                    handleConfirmRelease
                  }
                  disabled={saving}
                >

                  <FaSignOutAlt />

                  <span>
                    {saving
                      ? "Releasing..."
                      : "Confirm Release & Set Available"}
                  </span>

                </button>

              </div>

            </div>

          </div>

        )}

      {/* =====================================================
          DETAILS MODAL
      ====================================================== */}

      {detailsBed && (

        <div
          className="hosp-modal-overlay"
          onClick={() =>
            setDetailsBed(null)
          }
        >

          <div
            className="hosp-modal hosp-bed-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="hosp-modal-header">

              <div className="modal-title-wrap">

                <FaProcedures className="modal-header-icon" />

                <h2>
                  Bed Details —{" "}
                  {detailsBed.bedNumber}
                </h2>

              </div>

              <button
                type="button"
                className="hosp-modal-close"
                onClick={() =>
                  setDetailsBed(null)
                }
                aria-label="Close"
              >
                <FaTimes />
              </button>

            </div>

            <div className="details-modal-body">

              {/* TOP */}

              <div className="details-top-strip">

                <div>

                  <span className="details-bed-id">
                    {detailsBed.bedNumber}
                  </span>

                  <span className="details-room-id">
                    {detailsBed.ward}
                  </span>

                </div>

                <div className="details-badges">

                  <span
                    className={getCategoryBadgeClass(
                      detailsBed.wardType
                    )}
                  >
                    {detailsBed.wardType}
                  </span>

                  <span
                    className={getStatusBadgeClass(
                      detailsBed.status
                    )}
                  >
                    {detailsBed.status}
                  </span>

                </div>

              </div>

              {/* LOCATION */}

              <div className="details-section">

                <h4 className="details-section-title">
                  Location &amp; Infrastructure
                </h4>

                <div className="details-grid">

                  <div className="details-item">

                    <span className="item-label">
                      Ward:
                    </span>

                    <span className="item-value">
                      {detailsBed.ward ||
                        "—"}
                    </span>

                  </div>

                  <div className="details-item">

                    <span className="item-label">
                      Bed Type:
                    </span>

                    <span className="item-value">
                      {detailsBed.type ||
                        "—"}
                    </span>

                  </div>

                  <div className="details-item">

                    <span className="item-label">
                      Department:
                    </span>

                    <span className="item-value">
                      {detailsBed.departmentName ||
                        "—"}
                    </span>

                  </div>

                  <div className="details-item">

                    <span className="item-label">
                      Daily Rate:
                    </span>

                    <span className="item-value">

                      ₹
                      {Number(
                        detailsBed.dailyRate ||
                        0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </span>

                  </div>

                  <div className="details-item full-width">

                    <span className="item-label">
                      Bed Number:
                    </span>

                    <span className="item-value text-secondary-info">
                      {detailsBed.bedNumber}
                    </span>

                  </div>

                </div>

              </div>

              {/* OCCUPANT */}

              <div className="details-section">

                <h4 className="details-section-title">
                  Occupant Information
                </h4>

                {detailsBed.patientName ? (

                  <div className="details-patient-box">

                    <div className="patient-box-header">

                      <div>

                        <p className="patient-box-name">
                          {detailsBed.patientName}
                        </p>

                        <span className="hosp-pat-id">
                          {detailsBed.patientId}
                        </span>

                      </div>

                    </div>

                    <div
                      className="details-grid"
                      style={{
                        marginTop:
                          "0.85rem",
                      }}
                    >

                      <div className="details-item">

                        <span className="item-label">
                          Admission Date:
                        </span>

                        <span className="item-value font-bold">
                          {formatDate(
                            detailsBed.admissionDate
                          )}
                        </span>

                      </div>

                      <div className="details-item">

                        <span className="item-label">
                          Patient Phone:
                        </span>

                        <span className="item-value font-bold">

                          {detailsBed.patientPhone ||
                            "—"}

                        </span>

                      </div>

                      <div className="details-item">

                        <span className="item-label">
                          Patient Email:
                        </span>

                        <span className="item-value">

                          {detailsBed.patientEmail ||
                            "—"}

                        </span>

                      </div>

                      <div className="details-item full-width">

                        <span className="item-label">
                          Clinical Notes:
                        </span>

                        <span className="item-value">

                          {detailsBed.notes ||
                            "No notes available."}

                        </span>

                      </div>

                    </div>

                  </div>

                ) : (

                  <div className="details-empty-patient">

                    <FaBed className="empty-bed-icon" />

                    <div>

                      <p className="font-bold">
                        Bed is currently{" "}
                        {String(
                          detailsBed.status
                        ).toLowerCase()}
                      </p>

                      <p className="text-muted text-sm">

                        {detailsBed.notes ||
                          "No additional information."}

                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="hosp-modal-actions">

              {detailsBed.status ===
                "Available" && (

                  <button
                    type="button"
                    className="hosp-btn-submit"
                    onClick={() => {

                      const bedId =
                        detailsBed.id;

                      setDetailsBed(null);

                      handleOpenAssignModal(
                        bedId
                      );

                    }}
                  >

                    <FaUserPlus />

                    <span>
                      Assign This Bed
                    </span>

                  </button>

                )}

              {(
                detailsBed.status ===
                "Occupied" ||
                detailsBed.status ===
                "Reserved"
              ) && (

                  <button
                    type="button"
                    className="btn-modal-danger"
                    onClick={() => {

                      const bedObj =
                        detailsBed;

                      setDetailsBed(null);

                      handleOpenReleaseModal(
                        bedObj
                      );

                    }}
                  >

                    <FaSignOutAlt />

                    <span>
                      Release Bed
                    </span>

                  </button>

                )}

              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() =>
                  setDetailsBed(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default BedManagement;