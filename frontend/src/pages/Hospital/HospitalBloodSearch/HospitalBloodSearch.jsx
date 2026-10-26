import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FaTint,
  FaSearch,
  FaMapMarkerAlt,
  FaDownload,
  FaUserCheck,
  FaPhoneAlt,
  FaEnvelope,
  FaHospital,
  FaUserMd,
  FaUser,
  FaCheckCircle,
  FaBuilding,
  FaSpinner,
} from "react-icons/fa";
import { sortDonorsByProximity, getProximityLabel, getProximityScore } from "../../../utils/locationProximity";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import "./HospitalBloodSearch.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HospitalBloodSearch() {
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("B+");
  const [locationInput, setLocationInput] = useState("");
  const [activeLocation, setActiveLocation] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // Fetch hospital profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/hospital/profile`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const city = data.data.city || "Kozhikode";
          setHospitalName(data.data.name || "Hospital");
          setHospitalCity(city);
          setLocationInput(city);
          setActiveLocation(city);
        }
      } catch (err) {
        console.error("Failed to fetch hospital profile:", err);
        // Fallback
        const fallbackCity = localStorage.getItem("hospitalCity") || "Kozhikode";
        setHospitalCity(fallbackCity);
        setLocationInput(fallbackCity);
        setActiveLocation(fallbackCity);
        setHospitalName("Hospital");
      } finally {
        setProfileLoaded(true);
      }
    };
    fetchProfile();
  }, [authHeaders]);

  // Fetch donors when blood group or active location changes (and profile is loaded)
  useEffect(() => {
    if (!profileLoaded || !activeLocation) return;
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ bloodGroup: selectedBloodGroup });
        // Don't send originCity filter to backend — we want ALL donors for this blood group
        // and let the frontend sort by proximity
        const res = await fetch(`${API_BASE}/api/blood-donors/search?${params.toString()}`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDonors(data.data);
        } else {
          setDonors([]);
        }
      } catch (err) {
        console.error("Failed to fetch blood donors:", err);
        setDonors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, [selectedBloodGroup, activeLocation, profileLoaded, authHeaders]);

  const handleSearch = () => {
    const loc = locationInput.trim() || hospitalCity;
    setActiveLocation(loc);
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const filteredDonors = useMemo(() => {
    // All donors from API already have isDonorAvailable === true (filtered server-side)
    return sortDonorsByProximity(donors, activeLocation);
  }, [donors, activeLocation]);

  const handleDownload = () => {
    generateBloodGroupReport({
      title: `Hospital Emergency Blood Donor Report (${selectedBloodGroup})`,
      selectedBloodGroup: selectedBloodGroup,
      generatedBy: `${hospitalName || "Hospital"} Admin`,
      columns: [
        { header: "Donor ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "User Type", dataKey: "type" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "City", dataKey: "city" },
        { header: "Proximity Priority", dataKey: "proximityLabel" },
        { header: "Phone", dataKey: "phone" },
        { header: "Email", dataKey: "email" },
      ],
      data: filteredDonors.map((d) => ({
        ...d,
        proximityLabel: getProximityLabel(d.city, activeLocation),
      })),
      activeFilters: { "Hospital Center": `${hospitalName} (${hospitalCity})`, "Search Location": activeLocation },
    });
  };

  return (
    <div className="hospital-blood-search-page">
      {/* Banner */}
      <div className="hbs-banner">
        <div className="hbs-banner-left">
          <div className="hbs-badge">
            <FaHospital /> Hospital Emergency Network
          </div>
          <h2>Hospital Blood Donor Search</h2>
          <p>
            Find authorized available blood donors across registered patients and medical staff, prioritized by proximity to hospital center.
          </p>
        </div>

        <div className="hbs-hospital-badge">
          <FaBuilding className="h-icon" />
          <div>
            <span className="h-label">Hospital Center Location</span>
            <strong className="h-val">{hospitalName || "Hospital"} ({hospitalCity || "..." })</strong>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="hbs-controls">
        <div className="hbs-bg-selector">
          <label>Select Required Blood Group:</label>
          <div className="hbs-pills-row">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                className={`hbs-pill ${selectedBloodGroup === bg ? "active" : ""}`}
                onClick={() => setSelectedBloodGroup(bg)}
              >
                <FaTint className="hbs-drop" />
                <span>{bg}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hbs-right-actions">
          <div className="hbs-location-input-wrap">
            <label className="hbs-loc-input-label">Location:</label>
            <div className="hbs-search-field">
              <FaMapMarkerAlt style={{ color: "#818cf8" }} />
              <input
                type="text"
                placeholder="e.g. Kozhikode, Wayanad..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleLocationKeyDown}
              />
            </div>
          </div>

          <button className="hbs-search-trigger-btn" onClick={handleSearch}>
            <FaSearch />
            <span>Search</span>
          </button>

          <button className="hbs-download-btn" onClick={handleDownload}>
            <FaDownload />
            <span>Download Filtered List</span>
          </button>
        </div>
      </div>

      {/* Automated Filter Alert */}
      <div className="hbs-filter-alert">
        <FaCheckCircle />
        <span>
          Showing available <strong>{selectedBloodGroup} donors only</strong> sorted nearest to <strong>{activeLocation}</strong> first. Unavailable members are automatically excluded.
        </span>
      </div>

      {/* Results Title */}
      <div className="hbs-results-header">
        <h3>
          {filteredDonors.length} Available {selectedBloodGroup} Donor{filteredDonors.length === 1 ? "" : "s"} Found
        </h3>
        <span className="hbs-order-tag">Nearest to {activeLocation} appear first</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="hbs-empty">
          <FaSpinner className="empty-icon" style={{ animation: "spin 1s linear infinite" }} />
          <h3>Searching for {selectedBloodGroup} donors...</h3>
          <p>Loading results from the database.</p>
        </div>
      ) : filteredDonors.length === 0 ? (
        <div className="hbs-empty">
          <FaTint className="empty-icon" />
          <h3>No available {selectedBloodGroup} donors found near {activeLocation}.</h3>
          <p>Try searching another blood group or a different location.</p>
        </div>
      ) : (
        <div className="hbs-grid">
          {filteredDonors.map((donor, idx) => {
            const proxScore = getProximityScore(donor.city, activeLocation);
            const proxLabel = getProximityLabel(donor.city, activeLocation);

            return (
              <div key={donor.id} className="hbs-card">
                <div className="hbs-card-head">
                  <span className={`hbs-prox-tag score-${proxScore}`}>
                    <FaMapMarkerAlt /> {proxLabel} ({donor.city})
                  </span>
                  <span className="hbs-rank">Priority #{idx + 1}</span>
                </div>

                <div className="hbs-donor-info">
                  <div className="hbs-avatar">
                    {(donor.type || donor.role || "").includes("Doctor") ? <FaUserMd /> : <FaUser />}
                  </div>
                  <div>
                    <h4>{donor.name}</h4>
                    <span className="hbs-meta">
                      {donor.id}{donor.age ? ` • ${donor.age} Yrs` : ""}{donor.gender ? ` • ${donor.gender}` : ""}
                    </span>
                    <span className="hbs-type-pill">{donor.type || (donor.role === 'Doctor' ? 'Hospital Doctor' : 'Registered Patient')}</span>
                  </div>
                </div>

                <div className="hbs-status-row">
                  <span className="hbs-bg-badge">
                    <FaTint /> {donor.bloodGroup}
                  </span>
                  <span className="hbs-avail-badge">
                    <FaUserCheck /> Available
                  </span>
                </div>

                <div className="hbs-contacts">
                  <div>
                    <FaPhoneAlt /> {donor.phone}
                  </div>
                  <div>
                    <FaEnvelope /> {donor.email}
                  </div>
                </div>

                <div className="hbs-card-foot">
                  <a href={`tel:${donor.phone}`} className="hbs-contact-btn">
                    <FaPhoneAlt /> Contact Donor
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HospitalBloodSearch;
