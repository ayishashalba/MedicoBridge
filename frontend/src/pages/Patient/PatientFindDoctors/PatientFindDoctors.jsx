import React, { useEffect, useMemo, useState } from "react";

import { NavLink } from "react-router-dom";

import {
  FaSearch,
  FaStethoscope,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaHospital,
  FaClinicMedical,
  FaMoneyBillWave,
  FaBriefcase,
  FaTimes,
  FaUserMd,
  FaCheckCircle,
  FaClock,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

import {
  isDoctorSaved,
  toggleSaveDoctorInStorage,
} from "../../../utils/savedDoctorsStorage";
import { API_BASE_URL } from "../../../services/apiConfig";

import "./PatientFindDoctors.css";

const IMAGE_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

const FILTERS = ["All Doctors", "Hospital Doctors", "Clinic Doctors"];

function StarRating({ rating }) {
  const stars = [];
  const numericRating = Number(rating) || 0;

  const full = Math.floor(numericRating);
  const half = numericRating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) {
      stars.push(<FaStar key={i} />);
    } else if (i === full + 1 && half) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }

  return <span className="fd-stars">{stars}</span>;
}

function getInitials(name = "Doctor") {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getDoctorType(doctor) {
  const practiceType = String(doctor.practiceType || "").toLowerCase();

  if (practiceType === "clinic") return "clinic";

  if (practiceType === "both") {
    return doctor.hospitalName ? "hospital" : "clinic";
  }

  return "hospital";
}

function getDoctorLocation(doctor) {
  if (doctor.city) return doctor.city;

  if (doctor.clinicCity) return doctor.clinicCity;

  if (doctor.hospitalId?.city) return doctor.hospitalId.city;

  return "Location not provided";
}

function getDoctorHospital(doctor) {
  const type = getDoctorType(doctor);

  if (type === "clinic") {
    return doctor.clinicName || "Clinic";
  }

  return (
    doctor.hospitalName ||
    doctor.hospitalId?.name ||
    "Hospital not provided"
  );
}

function DoctorCard({ doctor }) {
  const doctorId = doctor._id;

  const [saved, setSaved] = useState(() =>
    isDoctorSaved(doctorId)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setSaved(isDoctorSaved(doctorId));
    };

    window.addEventListener("savedDoctorsUpdated", handleUpdate);

    return () => {
      window.removeEventListener(
        "savedDoctorsUpdated",
        handleUpdate
      );
    };
  }, [doctorId]);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nowSaved = toggleSaveDoctorInStorage({
      ...doctor,
      id: doctorId,
    });

    setSaved(nowSaved);
  };

  const doctorType = getDoctorType(doctor);
  const doctorName = doctor.name || "Doctor";
  const initials = getInitials(doctorName);
  const rating = Number(doctor.rating) || 0;

  const experience = doctor.experience
    ? `${doctor.experience} years experience`
    : "Experience not provided";

  const consultationFee =
    doctor.consultationFee ?? 500;

  const hospitalOrClinic = getDoctorHospital(doctor);
  const location = getDoctorLocation(doctor);

  return (
    <article
      className="fd-card"
      aria-label={`Doctor card for ${doctorName}`}
    >
      {/* Availability */}
      <div
        className={`fd-card-ribbon fd-ribbon--available`}
      >
        <span>
          <FaCheckCircle /> Available Today
        </span>

        <button
          className="fd-card-save-btn"
          onClick={handleToggleSave}
          title={
            saved
              ? "Remove from saved doctors"
              : "Save doctor"
          }
          aria-label={
            saved
              ? "Remove from saved doctors"
              : "Save doctor"
          }
        >
          {saved ? (
            <FaHeart style={{ color: "#ef4444" }} />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>

      {/* Doctor Identity */}
      <div className="fd-card-top">
        <div
          className="fd-avatar"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
            border:
              "2.5px solid rgba(13, 148, 136, 0.25)",
          }}
          aria-label={`Photo of ${doctorName}`}
        >
          {doctor.profileImage ? (
            <img
              src={
                doctor.profileImage.startsWith("http")
                  ? doctor.profileImage
                  : `${IMAGE_BASE}${doctor.profileImage}`
              }
              alt={doctorName}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span className="fd-avatar-initials">
              {initials}
            </span>
          )}

          <span className="fd-avatar-status fd-status--online" />
        </div>

        <div className="fd-card-identity">
          <h3 className="fd-doctor-name">
            {doctorName}
          </h3>

          <p className="fd-specialization">
            <FaStethoscope className="fd-meta-icon" />
            {doctor.specialization || "Specialist"}
          </p>

          <div className="fd-rating-row">
            <StarRating rating={rating} />

            <span className="fd-rating-value">
              {rating > 0 ? rating.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="fd-card-details">
        <div className="fd-detail-item">
          {doctorType === "hospital" ? (
            <FaHospital className="fd-detail-icon fd-icon--hospital" />
          ) : (
            <FaClinicMedical className="fd-detail-icon fd-icon--clinic" />
          )}

          <span className="fd-detail-text">
            {hospitalOrClinic}
          </span>

          <span
            className={`fd-type-badge fd-type-badge--${doctorType}`}
          >
            {doctorType}
          </span>
        </div>

        <div className="fd-detail-item">
          <FaMapMarkerAlt className="fd-detail-icon fd-icon--location" />

          <span className="fd-detail-text">
            {location}
          </span>
        </div>

        <div className="fd-detail-item">
          <FaBriefcase className="fd-detail-icon fd-icon--exp" />

          <span className="fd-detail-text">
            {experience}
          </span>
        </div>
      </div>

      {/* Fee + Profile */}
      <div className="fd-card-footer">
        <div className="fd-fee">
          <FaMoneyBillWave className="fd-fee-icon" />

          <div>
            <span className="fd-fee-label">
              Consultation Fee
            </span>

            <span className="fd-fee-value">
              ₹{consultationFee}
            </span>
          </div>
        </div>

        <NavLink
          to={`/patient/doctor-profile/${doctorId}`}
          className="fd-view-btn"
          aria-label={`View profile of ${doctorName}`}
        >
          <FaUserMd />
          View Profile
        </NavLink>
      </div>
    </article>
  );
}

function PatientFindDoctors() {
  const [doctors, setDoctors] = useState([]);

  const [searchName, setSearchName] = useState("");
  const [searchSpec, setSearchSpec] = useState("");
  const [searchHospital, setSearchHospital] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const [activeFilter, setActiveFilter] =
    useState("All Doctors");

  const [selectedCity, setSelectedCity] =
    useState("All");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (searchName.trim()) {
        params.append("search", searchName.trim());
      }

      if (searchSpec.trim()) {
        params.append(
          "specialization",
          searchSpec.trim()
        );
      }

      if (searchCity.trim()) {
        params.append("city", searchCity.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/patient/doctors?${params.toString()}`,
        {
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch doctors."
        );
      }

      setDoctors(data.data || []);
    } catch (error) {
      console.error("Find doctors error:", error);
      setDoctors([]);
      setErrorMessage(
        error.message || "Unable to load doctors."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchName, searchSpec, searchCity]);

  const uniqueCities = useMemo(() => {
    const cities = doctors
      .map((doctor) => getDoctorLocation(doctor))
      .filter(
        (city) =>
          city && city !== "Location not provided"
      );

    return Array.from(new Set(cities)).sort();
  }, [doctors]);

  const handleCityChange = (city) => {
    setSelectedCity(city);

    if (city === "All") {
      setSearchCity("");
    } else {
      setSearchCity(city);
    }
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchSpec("");
    setSearchHospital("");
    setSearchCity("");
    setSelectedCity("All");
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const doctorType = getDoctorType(doctor);

      const matchType =
        activeFilter === "All Doctors" ||
        (activeFilter === "Hospital Doctors" &&
          doctorType === "hospital") ||
        (activeFilter === "Clinic Doctors" &&
          doctorType === "clinic");

      const hospitalName =
        getDoctorHospital(doctor).toLowerCase();

      const matchHospital =
        !searchHospital.trim() ||
        hospitalName.includes(
          searchHospital.trim().toLowerCase()
        );

      return matchType && matchHospital;
    });
  }, [
    doctors,
    activeFilter,
    searchHospital,
  ]);

  const hasSearch =
    searchName ||
    searchSpec ||
    searchHospital ||
    searchCity ||
    selectedCity !== "All";

  return (
    <div className="fd-page">
      {/* Header */}
      <header className="fd-page-header">
        <div className="fd-header-text">
          <h1 className="fd-page-title">
            Find Doctors
          </h1>

          <p className="fd-page-subtitle">
            Search verified specialists across hospitals
            and clinics near you.
          </p>
        </div>

        <div className="fd-header-count">
          <span className="fd-count-badge">
            <FaUserMd />

            Showing {filteredDoctors.length} of{" "}
            {doctors.length} doctors
          </span>
        </div>
      </header>

      {/* Search */}
      <section
        className="fd-search-panel"
        aria-label="Doctor search and filters"
      >
        {/* Location */}
        <div className="fd-location-row">
          <div className="fd-city-dropdown-container">
            <span className="fd-dropdown-label">
              City:
            </span>

            <select
              id="fd-city-select"
              className="fd-city-select"
              value={selectedCity}
              onChange={(e) =>
                handleCityChange(e.target.value)
              }
              aria-label="Filter doctors by city"
            >
              <option value="All">
                All Locations
              </option>

              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Fields */}
        <div className="fd-search-row">
          <div className="fd-search-grid">
            {/* Name */}
            <div className="fd-search-field">
              <FaUserMd className="fd-search-field-icon" />

              <input
                id="fd-search-name"
                type="text"
                className="fd-search-input"
                placeholder="Doctor name…"
                value={searchName}
                onChange={(e) =>
                  setSearchName(e.target.value)
                }
              />

              {searchName && (
                <button
                  className="fd-input-clear"
                  onClick={() =>
                    setSearchName("")
                  }
                  aria-label="Clear doctor name"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Specialization */}
            <div className="fd-search-field">
              <FaStethoscope className="fd-search-field-icon" />

              <input
                id="fd-search-spec"
                type="text"
                className="fd-search-input"
                placeholder="Specialization…"
                value={searchSpec}
                onChange={(e) =>
                  setSearchSpec(e.target.value)
                }
              />

              {searchSpec && (
                <button
                  className="fd-input-clear"
                  onClick={() =>
                    setSearchSpec("")
                  }
                  aria-label="Clear specialization"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Hospital / Clinic */}
            <div className="fd-search-field">
              <FaHospital className="fd-search-field-icon" />

              <input
                id="fd-search-hospital"
                type="text"
                className="fd-search-input"
                placeholder="Hospital / Clinic name…"
                value={searchHospital}
                onChange={(e) =>
                  setSearchHospital(e.target.value)
                }
              />

              {searchHospital && (
                <button
                  className="fd-input-clear"
                  onClick={() =>
                    setSearchHospital("")
                  }
                  aria-label="Clear hospital name"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="fd-search-field">
              <FaMapMarkerAlt className="fd-search-field-icon" />

              <input
                id="fd-search-city"
                type="text"
                className="fd-search-input"
                placeholder="City / Location…"
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  setSelectedCity("All");
                }}
              />

              {searchCity && (
                <button
                  className="fd-input-clear"
                  onClick={() => {
                    setSearchCity("");
                    setSelectedCity("All");
                  }}
                  aria-label="Clear city"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <button
            className="fd-search-btn"
            onClick={fetchDoctors}
            aria-label="Search doctors"
          >
            <FaSearch />
            <span>Search</span>
          </button>
        </div>

        {/* Clear */}
        {hasSearch && (
          <div className="fd-search-meta">
            <span className="fd-search-meta-text">
              Showing results for your filters
            </span>

            <button
              className="fd-clear-all-btn"
              onClick={handleClearSearch}
              aria-label="Clear all search filters"
            >
              <FaTimes />
              Clear all
            </button>
          </div>
        )}

        {/* Type Filters */}
        <div
          className="fd-filter-tabs"
          role="tablist"
          aria-label="Doctor type filter"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter}
              role="tab"
              aria-selected={
                activeFilter === filter
              }
              className={`fd-filter-tab ${activeFilter === filter
                  ? "fd-filter-tab--active"
                  : ""
                }`}
              onClick={() =>
                setActiveFilter(filter)
              }
            >
              {filter === "Hospital Doctors" && (
                <FaHospital />
              )}

              {filter === "Clinic Doctors" && (
                <FaClinicMedical />
              )}

              {filter === "All Doctors" && (
                <FaUserMd />
              )}

              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="fd-empty-state">
          <div className="fd-empty-icon">
            <FaStethoscope />
          </div>

          <h3 className="fd-empty-title">
            Loading doctors...
          </h3>

          <p className="fd-empty-desc">
            Please wait while we fetch verified doctors.
          </p>
        </div>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <div className="fd-empty-state">
          <div className="fd-empty-icon">
            <FaTimes />
          </div>

          <h3 className="fd-empty-title">
            Unable to load doctors
          </h3>

          <p className="fd-empty-desc">
            {errorMessage}
          </p>

          <button
            className="fd-empty-clear-btn"
            onClick={fetchDoctors}
          >
            <FaSearch />
            Try Again
          </button>
        </div>
      )}

      {/* Doctors */}
      {!isLoading &&
        !errorMessage &&
        filteredDoctors.length > 0 && (
          <section
            className="fd-cards-grid"
            aria-label="Doctor listings"
          >
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
              />
            ))}
          </section>
        )}

      {/* Empty */}
      {!isLoading &&
        !errorMessage &&
        filteredDoctors.length === 0 && (
          <div className="fd-empty-state">
            <div className="fd-empty-icon">
              <FaStethoscope />
            </div>

            <h3 className="fd-empty-title">
              No doctors found
            </h3>

            <p className="fd-empty-desc">
              Try adjusting your search terms or
              removing filters.
            </p>

            <button
              className="fd-empty-clear-btn"
              onClick={handleClearSearch}
            >
              <FaTimes />
              Clear Search
            </button>
          </div>
        )}
    </div>
  );
}

export default PatientFindDoctors;