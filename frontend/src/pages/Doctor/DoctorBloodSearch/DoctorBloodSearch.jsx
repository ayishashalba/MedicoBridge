import React, { useState, useMemo } from "react";
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
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { sortDonorsByProximity, getProximityLabel, getProximityScore } from "../../../utils/locationProximity";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import "./DoctorBloodSearch.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Comprehensive mock dataset representing patients & doctors with location & donor status
const initialDonorPool = [
  {
    id: "PAT-106",
    name: "Rahul Nair",
    type: "Patient",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "rahul.nair@example.com",
    lastDonated: "6 months ago",
  },
  {
    id: "PAT-107",
    name: "Anjali Thomas",
    type: "Patient",
    age: 27,
    gender: "Female",
    bloodGroup: "B+",
    city: "Malappuram",
    isDonorAvailable: true,
    phone: "+91 98765 43211",
    email: "anjali.thomas@example.com",
    lastDonated: "4 months ago",
  },
  {
    id: "PAT-108",
    name: "Arun Kumar",
    type: "Patient",
    age: 41,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kannur",
    isDonorAvailable: true,
    phone: "+91 98765 43212",
    email: "arun.kumar@example.com",
    lastDonated: "1 year ago",
  },
  {
    id: "DR-80243",
    name: "Dr. Priya Thomas",
    type: "Doctor",
    age: 36,
    gender: "Female",
    bloodGroup: "B+",
    city: "Wayanad",
    isDonorAvailable: true,
    phone: "+91 98765 43213",
    email: "priya.t@medicobridge.com",
    lastDonated: "3 months ago",
  },
  {
    id: "PAT-109",
    name: "Firoz Khan",
    type: "Patient",
    age: 36,
    gender: "Male",
    bloodGroup: "B+",
    city: "Ernakulam",
    isDonorAvailable: true,
    phone: "+91 98765 43219",
    email: "firoz.khan@example.com",
    lastDonated: "8 months ago",
  },
  {
    id: "PAT-110",
    name: "Deepak Sharma",
    type: "Patient",
    age: 29,
    gender: "Male",
    bloodGroup: "B+",
    city: "Delhi",
    isDonorAvailable: true,
    phone: "+91 98765 43220",
    email: "deepak.sharma@example.com",
    lastDonated: "5 months ago",
  },
  {
    id: "PAT-111",
    name: "Vikas Patel",
    type: "Patient",
    age: 34,
    gender: "Male",
    bloodGroup: "B+",
    city: "Goa",
    isDonorAvailable: false, // EXCLUDED AUTOMATICALLY
    phone: "+91 98765 43221",
    email: "vikas.patel@example.com",
    lastDonated: "1 month ago",
  },
  {
    id: "PAT-101",
    name: "Aarav Sharma",
    type: "Patient",
    age: 32,
    gender: "Male",
    bloodGroup: "O+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    lastDonated: "5 months ago",
  },
  {
    id: "PAT-102",
    name: "Sunita Rao",
    type: "Patient",
    age: 27,
    gender: "Female",
    bloodGroup: "A+",
    city: "Malappuram",
    isDonorAvailable: true,
    phone: "+91 87654 32109",
    email: "sunita.rao@example.com",
    lastDonated: "2 months ago",
  },
  {
    id: "DR-80241",
    name: "Dr. Ayisha Shalba",
    type: "Doctor",
    age: 38,
    gender: "Female",
    bloodGroup: "O+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "ayisha.shalba@medicobridge.com",
    lastDonated: "7 months ago",
  },
];

function DoctorBloodSearch() {
  const doctorCity = localStorage.getItem("doctorCity") || "Kozhikode";
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("B+");
  const [searchQuery, setSearchQuery] = useState("");

  // Rule: Automatically show ONLY users who are currently available for donation
  // Sort by nearest location first
  const filteredDonors = useMemo(() => {
    let result = initialDonorPool.filter(
      (donor) => donor.bloodGroup === selectedBloodGroup && donor.isDonorAvailable === true
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }

    return sortDonorsByProximity(result, doctorCity);
  }, [selectedBloodGroup, searchQuery, doctorCity]);

  const handleDownload = () => {
    generateBloodGroupReport({
      title: `Emergency Blood Donor Report (${selectedBloodGroup})`,
      selectedBloodGroup: selectedBloodGroup,
      generatedBy: "Dr. Ayisha Shalba (Doctor)",
      columns: [
        { header: "Donor ID", dataKey: "id" },
        { header: "Name", dataKey: "name" },
        { header: "Role", dataKey: "type" },
        { header: "Blood Group", dataKey: "bloodGroup" },
        { header: "City", dataKey: "city" },
        { header: "Proximity Rank", dataKey: "proximityLabel" },
        { header: "Phone", dataKey: "phone" },
        { header: "Email", dataKey: "email" },
      ],
      data: filteredDonors.map((d) => ({
        ...d,
        proximityLabel: getProximityLabel(d.city, doctorCity),
      })),
      activeFilters: { "Doctor Location": doctorCity, "Availability Filter": "Active Donors Only (Automatic)" },
    });
  };

  return (
    <div className="doctor-blood-search-page">
      {/* Top Banner */}
      <div className="dbs-header-banner">
        <div className="dbs-header-content">
          <div className="dbs-badge">
            <FaTint className="dbs-drop-icon" /> Urgent Blood Search
          </div>
          <h2>Location-Aware Donor Finder</h2>
          <p>
            Locate available blood donors prioritized by geographical proximity to your practice location.
          </p>
        </div>

        <div className="dbs-location-card">
          <FaMapMarkerAlt className="dbs-loc-pin" />
          <div>
            <span className="dbs-loc-label">Doctor Location</span>
            <strong className="dbs-loc-val">{doctorCity}</strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Select Blood Group & Search & Download */}
      <div className="dbs-controls-bar">
        {/* Blood Group Selector Buttons */}
        <div className="dbs-bg-selector-wrap">
          <label className="dbs-select-label">Select Blood Group:</label>
          <div className="dbs-bg-pills">
            {BLOOD_GROUPS.map((bg) => (
              <button
                key={bg}
                type="button"
                className={`dbs-bg-pill ${selectedBloodGroup === bg ? "active" : ""}`}
                onClick={() => setSelectedBloodGroup(bg)}
              >
                <FaTint className="pill-drop" />
                <span>{bg}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side Search + Download */}
        <div className="dbs-actions-wrap">
          <div className="dbs-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Filter by donor name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className="dbs-download-btn" onClick={handleDownload}>
            <FaDownload />
            <span>Download Results</span>
          </button>
        </div>
      </div>

      {/* Automated Filter Indicator */}
      <div className="dbs-notice-bar">
        <FaCheckCircle className="notice-icon" />
        <span>
          Showing <strong>Available {selectedBloodGroup} Donors Only</strong> ranked by proximity to <strong>{doctorCity}</strong>. Unavailable donors are automatically excluded.
        </span>
      </div>

      {/* Results Header */}
      <div className="dbs-results-meta">
        <h3>
          Found {filteredDonors.length} Available Donor{filteredDonors.length === 1 ? "" : "s"} for {selectedBloodGroup}
        </h3>
        <span className="dbs-proximity-hint">
          Nearest location donors appear first
        </span>
      </div>

      {/* Donor Results Grid */}
      {filteredDonors.length === 0 ? (
        <div className="dbs-empty-state">
          <FaTint className="dbs-empty-icon" />
          <h3>No available {selectedBloodGroup} donors found near {doctorCity}.</h3>
          <p>Try searching for a different blood group or expanding search query.</p>
        </div>
      ) : (
        <div className="dbs-donor-grid">
          {filteredDonors.map((donor, idx) => {
            const proxScore = getProximityScore(donor.city, doctorCity);
            const proxLabel = getProximityLabel(donor.city, doctorCity);
            const isHighestPriority = proxScore <= 1;

            return (
              <div
                key={donor.id}
                className={`dbs-donor-card ${isHighestPriority ? "highest-priority" : ""}`}
              >
                {/* Proximity Priority Badge */}
                <div className="dbs-card-top-bar">
                  <span className={`dbs-prox-badge prox-tier-${proxScore}`}>
                    <FaMapMarkerAlt /> {proxLabel} ({donor.city})
                  </span>
                  <span className="dbs-rank-num">Rank #{idx + 1}</span>
                </div>

                <div className="dbs-donor-main-info">
                  <div className="dbs-avatar-circle">
                    {donor.type === "Doctor" ? <FaUserMd /> : <FaUser />}
                  </div>
                  <div>
                    <h4 className="dbs-donor-name">{donor.name}</h4>
                    <p className="dbs-donor-sub">
                      {donor.id} • {donor.age} Yrs • {donor.gender} • <span className="dbs-role-tag">{donor.type}</span>
                    </p>
                  </div>
                </div>

                <div className="dbs-card-body-details">
                  <div className="dbs-detail-pill">
                    <FaTint className="red-drop" />
                    <span>Group: <strong>{donor.bloodGroup}</strong></span>
                  </div>

                  <div className="dbs-detail-pill availability-pill">
                    <FaUserCheck className="green-check" />
                    <span>Status: <strong>Available</strong></span>
                  </div>
                </div>

                {/* Authorized Contact Info */}
                <div className="dbs-contact-box">
                  <div className="dbs-contact-row">
                    <FaPhoneAlt className="c-icon" />
                    <span>{donor.phone}</span>
                  </div>
                  <div className="dbs-contact-row">
                    <FaEnvelope className="c-icon" />
                    <span>{donor.email}</span>
                  </div>
                </div>

                <div className="dbs-card-footer">
                  <span className="dbs-last-donated">Last Donated: {donor.lastDonated}</span>
                  <a href={`tel:${donor.phone}`} className="dbs-call-btn">
                    <FaPhoneAlt /> Call Donor
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

export default DoctorBloodSearch;
