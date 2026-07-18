import React, { useState, useMemo } from "react";
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
  FaFilter,
  FaTimes,
  FaUserMd,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import "./PatientFindDoctors.css";

/* ─── Dummy Doctor Data ──────────────────────────────────────────── */
const doctorsData = [
  {
    id: 1,
    name: "Dr. Aisha Khan",
    specialization: "Cardiologist",
    experience: 14,
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    type: "hospital",
    fee: 800,
    rating: 4.9,
    reviews: 312,
    available: true,
    gender: "female",
    initials: "AK",
    color: "#7c3aed",
  },
  {
    id: 2,
    name: "Dr. Rahul Verma",
    specialization: "Orthopedic Surgeon",
    experience: 10,
    hospital: "Fortis Healthcare",
    city: "Delhi",
    type: "hospital",
    fee: 700,
    rating: 4.7,
    reviews: 245,
    available: true,
    gender: "male",
    initials: "RV",
    color: "#0284c7",
  },
  {
    id: 3,
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    experience: 8,
    hospital: "Skin Care Clinic",
    city: "Bangalore",
    type: "clinic",
    fee: 500,
    rating: 4.8,
    reviews: 198,
    available: false,
    gender: "female",
    initials: "PS",
    color: "#0d9488",
  },
  {
    id: 4,
    name: "Dr. Suresh Nair",
    specialization: "Neurologist",
    experience: 18,
    hospital: "AIIMS",
    city: "Chennai",
    type: "hospital",
    fee: 1200,
    rating: 4.9,
    reviews: 512,
    available: true,
    gender: "male",
    initials: "SN",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "Dr. Meera Patel",
    specialization: "Gynecologist",
    experience: 12,
    hospital: "Wockhardt Hospital",
    city: "Pune",
    type: "hospital",
    fee: 600,
    rating: 4.6,
    reviews: 178,
    available: true,
    gender: "female",
    initials: "MP",
    color: "#ec4899",
  },
  {
    id: 6,
    name: "Dr. Arjun Mehta",
    specialization: "Pediatrician",
    experience: 7,
    hospital: "Child Care Clinic",
    city: "Hyderabad",
    type: "clinic",
    fee: 450,
    rating: 4.5,
    reviews: 133,
    available: false,
    gender: "male",
    initials: "AM",
    color: "#10b981",
  },
  {
    id: 7,
    name: "Dr. Kavitha Reddy",
    specialization: "Ophthalmologist",
    experience: 9,
    hospital: "Vision Eye Hospital",
    city: "Kochi",
    type: "hospital",
    fee: 550,
    rating: 4.7,
    reviews: 162,
    available: true,
    gender: "female",
    initials: "KR",
    color: "#6366f1",
  },
  {
    id: 8,
    name: "Dr. Vikram Singh",
    specialization: "Psychiatrist",
    experience: 11,
    hospital: "MindCare Clinic",
    city: "Jaipur",
    type: "clinic",
    fee: 700,
    rating: 4.8,
    reviews: 89,
    available: true,
    gender: "male",
    initials: "VS",
    color: "#8b5cf6",
  },
  {
    id: 9,
    name: "Dr. Ananya Das",
    specialization: "Endocrinologist",
    experience: 13,
    hospital: "Max Healthcare",
    city: "Kolkata",
    type: "hospital",
    fee: 900,
    rating: 4.6,
    reviews: 204,
    available: false,
    gender: "female",
    initials: "AD",
    color: "#ef4444",
  },
  {
    id: 10,
    name: "Dr. Rohit Gupta",
    specialization: "General Physician",
    experience: 5,
    hospital: "HealthFirst Clinic",
    city: "Lucknow",
    type: "clinic",
    fee: 300,
    rating: 4.4,
    reviews: 76,
    available: true,
    gender: "male",
    initials: "RG",
    color: "#f97316",
  },
  {
    id: 11,
    name: "Dr. Sunita Joshi",
    specialization: "Rheumatologist",
    experience: 16,
    hospital: "Medanta Hospital",
    city: "Gurugram",
    type: "hospital",
    fee: 1000,
    rating: 4.9,
    reviews: 298,
    available: true,
    gender: "female",
    initials: "SJ",
    color: "#14b8a6",
  },
  {
    id: 12,
    name: "Dr. Kiran Kumar",
    specialization: "Urologist",
    experience: 15,
    hospital: "Urology Specialty Clinic",
    city: "Ahmedabad",
    type: "clinic",
    fee: 750,
    rating: 4.5,
    reviews: 141,
    available: false,
    gender: "male",
    initials: "KK",
    color: "#64748b",
  },
];

const FILTERS = ["All Doctors", "Hospital Doctors", "Clinic Doctors"];

/* ─── Star Rating Component ──────────────────────────────────────── */
function StarRating({ rating }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} />);
    else if (i === full + 1 && half) stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return <span className="fd-stars">{stars}</span>;
}

/* ─── Doctor Card ────────────────────────────────────────────────── */
function DoctorCard({ doctor }) {
  return (
    <article className="fd-card" aria-label={`Doctor card for ${doctor.name}`}>
      {/* Availability ribbon */}
      <div
        className={`fd-card-ribbon ${doctor.available ? "fd-ribbon--available" : "fd-ribbon--busy"}`}
      >
        {doctor.available ? (
          <>
            <FaCheckCircle /> Available Today
          </>
        ) : (
          <>
            <FaClock /> Unavailable
          </>
        )}
      </div>

      {/* Photo / Avatar */}
      <div className="fd-card-top">
        <div
          className="fd-avatar"
          style={{ background: `linear-gradient(135deg, ${doctor.color}cc, ${doctor.color}66)`, border: `2.5px solid ${doctor.color}55` }}
          aria-label={`Photo of ${doctor.name}`}
        >
          <span className="fd-avatar-initials">{doctor.initials}</span>
          <span className={`fd-avatar-status ${doctor.available ? "fd-status--online" : "fd-status--offline"}`} />
        </div>

        <div className="fd-card-identity">
          <h3 className="fd-doctor-name">{doctor.name}</h3>
          <p className="fd-specialization">
            <FaStethoscope className="fd-meta-icon" />
            {doctor.specialization}
          </p>
          <div className="fd-rating-row">
            <StarRating rating={doctor.rating} />
            <span className="fd-rating-value">{doctor.rating}</span>
            <span className="fd-reviews">({doctor.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="fd-card-details">
        <div className="fd-detail-item">
          {doctor.type === "hospital" ? (
            <FaHospital className="fd-detail-icon fd-icon--hospital" />
          ) : (
            <FaClinicMedical className="fd-detail-icon fd-icon--clinic" />
          )}
          <span className="fd-detail-text">{doctor.hospital}</span>
          <span className={`fd-type-badge fd-type-badge--${doctor.type}`}>
            {doctor.type}
          </span>
        </div>

        <div className="fd-detail-item">
          <FaMapMarkerAlt className="fd-detail-icon fd-icon--location" />
          <span className="fd-detail-text">{doctor.city}</span>
        </div>

        <div className="fd-detail-item">
          <FaBriefcase className="fd-detail-icon fd-icon--exp" />
          <span className="fd-detail-text">{doctor.experience} years experience</span>
        </div>
      </div>

      {/* Fee + CTA */}
      <div className="fd-card-footer">
        <div className="fd-fee">
          <FaMoneyBillWave className="fd-fee-icon" />
          <div>
            <span className="fd-fee-label">Consultation Fee</span>
            <span className="fd-fee-value">₹{doctor.fee}</span>
          </div>
        </div>
        <NavLink
          to={`/patient/doctor-profile/${doctor.id}`}
          className="fd-view-btn"
          aria-label={`View profile of ${doctor.name}`}
        >
          <FaUserMd />
          View Profile
        </NavLink>
      </div>
    </article>
  );
}

/* ─── Main Page Component ────────────────────────────────────────── */
function PatientFindDoctors() {
  const [searchName, setSearchName] = useState("");
  const [searchSpec, setSearchSpec] = useState("");
  const [searchHospital, setSearchHospital] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Doctors");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // New location feature states
  const [selectedCity, setSelectedCity] = useState("All");
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocationError, setIsLocationError] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamically compute list of unique cities from doctors data
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(doctorsData.map((doc) => doc.city))).sort();
  }, []);

  // Offline mock mapping from lat/lng to one of the cities
  const getMockCityFromCoords = (lat, lng) => {
    const sum = Math.abs(lat + lng);
    const index = Math.floor(sum) % uniqueCities.length;
    return uniqueCities[index];
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location access denied. Please select your city manually.");
      setIsLocationError(true);
      return;
    }

    setIsLocating(true);
    setLocationMessage("");
    setIsLocationError(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detectedCity = getMockCityFromCoords(latitude, longitude);
        setSelectedCity(detectedCity);
        setLocationMessage(`📍 Showing doctors near ${detectedCity}`);
        setIsLocationError(false);
        setIsLocating(false);
      },
      (error) => {
        setLocationMessage("Location access denied. Please select your city manually.");
        setIsLocationError(true);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setLocationMessage(""); // Clear status message on manual select
    setIsLocationError(false);
  };

  /* Clear all search inputs */
  const handleClearSearch = () => {
    setSearchName("");
    setSearchSpec("");
    setSearchHospital("");
    setSearchCity("");
    setSelectedCity("All");
    setLocationMessage("");
    setIsLocationError(false);
  };

  const hasSearch =
    searchName || searchSpec || searchHospital || searchCity || selectedCity !== "All";

  /* Filtered list */
  const filteredDoctors = useMemo(() => {
    return doctorsData.filter((doc) => {
      const matchType =
        activeFilter === "All Doctors" ||
        (activeFilter === "Hospital Doctors" && doc.type === "hospital") ||
        (activeFilter === "Clinic Doctors" && doc.type === "clinic");

      const q = (str) => str.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q(searchName));
      const matchSpec = doc.specialization
        .toLowerCase()
        .includes(q(searchSpec));
      const matchHosp = doc.hospital
        .toLowerCase()
        .includes(q(searchHospital));
      const matchCity = doc.city.toLowerCase().includes(q(searchCity));
      const matchSelectedCity =
        selectedCity === "All" || doc.city.toLowerCase() === selectedCity.toLowerCase();

      return matchType && matchName && matchSpec && matchHosp && matchCity && matchSelectedCity;
    });
  }, [activeFilter, searchName, searchSpec, searchHospital, searchCity, selectedCity]);

  return (
    <div className="fd-page">
      {/* ── Page Header ─────────────────────────────────────── */}
      <header className="fd-page-header">
        <div className="fd-header-text">
          <h1 className="fd-page-title">Find Doctors</h1>
          <p className="fd-page-subtitle">
            Search verified specialists across hospitals and clinics near you.
          </p>
        </div>
        <div className="fd-header-count">
          <span className="fd-count-badge">
            <FaUserMd />
            Showing {filteredDoctors.length} of {doctorsData.length} doctors
          </span>
        </div>
      </header>

      {/* ── Search & Filter Panel ────────────────────────────── */}
      <section className="fd-search-panel" aria-label="Doctor search and filters">
        {/* Location Row */}
        <div className="fd-location-row">
          <button
            type="button"
            className={`fd-location-btn ${isLocating ? "fd-location-btn--locating" : ""}`}
            onClick={handleUseMyLocation}
            disabled={isLocating}
          >
            <span>{isLocating ? "Locating..." : "📍 Use My Location"}</span>
          </button>

          <div className="fd-city-dropdown-container">
            <span className="fd-dropdown-label">City:</span>
            <select
              id="fd-city-select"
              className="fd-city-select"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              aria-label="Filter doctors by city dropdown"
            >
              <option value="All">All Locations</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {locationMessage && (
            <span
              className={`fd-location-message ${isLocationError ? "fd-location-message--error" : "fd-location-message--success"}`}
            >
              {locationMessage}
            </span>
          )}
        </div>

        {/* Search bar row */}
        <div className="fd-search-row">
          <div className="fd-search-grid">
            {/* Doctor Name */}
            <div className="fd-search-field">
              <FaUserMd className="fd-search-field-icon" />
              <input
                id="fd-search-name"
                type="text"
                className="fd-search-input"
                placeholder="Doctor name…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                aria-label="Search by doctor name"
              />
              {searchName && (
                <button
                  className="fd-input-clear"
                  onClick={() => setSearchName("")}
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
                onChange={(e) => setSearchSpec(e.target.value)}
                aria-label="Search by specialization"
              />
              {searchSpec && (
                <button
                  className="fd-input-clear"
                  onClick={() => setSearchSpec("")}
                  aria-label="Clear specialization"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Hospital */}
            <div className="fd-search-field">
              <FaHospital className="fd-search-field-icon" />
              <input
                id="fd-search-hospital"
                type="text"
                className="fd-search-input"
                placeholder="Hospital / Clinic name…"
                value={searchHospital}
                onChange={(e) => setSearchHospital(e.target.value)}
                aria-label="Search by hospital or clinic name"
              />
              {searchHospital && (
                <button
                  className="fd-input-clear"
                  onClick={() => setSearchHospital("")}
                  aria-label="Clear hospital name"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* City */}
            <div className="fd-search-field">
              <FaMapMarkerAlt className="fd-search-field-icon" />
              <input
                id="fd-search-city"
                type="text"
                className="fd-search-input"
                placeholder="City / Location…"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                aria-label="Search by city or location"
              />
              {searchCity && (
                <button
                  className="fd-input-clear"
                  onClick={() => setSearchCity("")}
                  aria-label="Clear city"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Search button */}
          <button className="fd-search-btn" aria-label="Search doctors">
            <FaSearch />
            <span>Search</span>
          </button>
        </div>

        {/* Clear all & count row */}
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
              <FaTimes /> Clear all
            </button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="fd-filter-tabs" role="tablist" aria-label="Doctor type filter">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={`fd-filter-tab ${activeFilter === f ? "fd-filter-tab--active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === "Hospital Doctors" && <FaHospital />}
              {f === "Clinic Doctors" && <FaClinicMedical />}
              {f === "All Doctors" && <FaUserMd />}
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* ── Doctor Cards Grid ─────────────────────────────────── */}
      {filteredDoctors.length > 0 ? (
        <section className="fd-cards-grid" aria-label="Doctor listings">
          {filteredDoctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </section>
      ) : (
        <div className="fd-empty-state">
          <div className="fd-empty-icon">
            <FaStethoscope />
          </div>
          <h3 className="fd-empty-title">No doctors found</h3>
          <p className="fd-empty-desc">
            Try adjusting your search terms or removing filters.
          </p>
          <button className="fd-empty-clear-btn" onClick={handleClearSearch}>
            <FaTimes /> Clear Search
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientFindDoctors;
