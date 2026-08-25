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
  FaCheckCircle,
  FaBuilding,
} from "react-icons/fa";
import { sortDonorsByProximity, getProximityLabel, getProximityScore } from "../../../utils/locationProximity";
import { generateBloodGroupReport } from "../../../utils/pdfGenerator";
import "./HospitalBloodSearch.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const hospitalDonorPool = [
  {
    id: "PAT-106",
    name: "Rahul Nair",
    type: "Registered Patient",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "rahul.nair@example.com",
    facility: "City Care Hospital",
  },
  {
    id: "DR-80242",
    name: "Dr. Rajesh K. Nair",
    type: "Hospital Doctor",
    age: 42,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43211",
    email: "rajesh.nair@medicobridge.com",
    facility: "City Care Hospital",
  },
  {
    id: "PAT-107",
    name: "Anjali Thomas",
    type: "Registered Patient",
    age: 27,
    gender: "Female",
    bloodGroup: "B+",
    city: "Malappuram",
    isDonorAvailable: true,
    phone: "+91 98765 43211",
    email: "anjali.thomas@example.com",
    facility: "City Care Hospital",
  },
  {
    id: "PAT-108",
    name: "Arun Kumar",
    type: "Registered Patient",
    age: 41,
    gender: "Male",
    bloodGroup: "B+",
    city: "Kannur",
    isDonorAvailable: true,
    phone: "+91 98765 43212",
    email: "arun.kumar@example.com",
    facility: "City Care Hospital",
  },
  {
    id: "DR-80243",
    name: "Dr. Priya Thomas",
    type: "Hospital Doctor",
    age: 36,
    gender: "Female",
    bloodGroup: "B+",
    city: "Wayanad",
    isDonorAvailable: true,
    phone: "+91 98765 43213",
    email: "priya.t@medicobridge.com",
    facility: "City Care Hospital",
  },
  {
    id: "PAT-109",
    name: "Firoz Khan",
    type: "Registered Patient",
    age: 36,
    gender: "Male",
    bloodGroup: "B+",
    city: "Ernakulam",
    isDonorAvailable: true,
    phone: "+91 98765 43219",
    email: "firoz.khan@example.com",
    facility: "City Care Hospital",
  },
  {
    id: "PAT-110",
    name: "Deepak Sharma",
    type: "Registered Patient",
    age: 29,
    gender: "Male",
    bloodGroup: "B+",
    city: "Delhi",
    isDonorAvailable: true,
    phone: "+91 98765 43220",
    email: "deepak.sharma@example.com",
    facility: "External Registered",
  },
  {
    id: "PAT-111",
    name: "Vikas Patel",
    type: "Registered Patient",
    age: 34,
    gender: "Male",
    bloodGroup: "B+",
    city: "Goa",
    isDonorAvailable: false, // EXCLUDED AUTOMATICALLY
    phone: "+91 98765 43221",
    email: "vikas.patel@example.com",
    facility: "External Registered",
  },
  {
    id: "PAT-101",
    name: "Aarav Sharma",
    type: "Registered Patient",
    age: 32,
    gender: "Male",
    bloodGroup: "O+",
    city: "Kozhikode",
    isDonorAvailable: true,
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    facility: "City Care Hospital",
  },
];

function HospitalBloodSearch() {
  const hospitalCity = localStorage.getItem("hospitalCity") || "Kozhikode";
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("B+");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDonors = useMemo(() => {
    let result = hospitalDonorPool.filter(
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

    return sortDonorsByProximity(result, hospitalCity);
  }, [selectedBloodGroup, searchQuery, hospitalCity]);

  const handleDownload = () => {
    generateBloodGroupReport({
      title: `Hospital Emergency Blood Donor Report (${selectedBloodGroup})`,
      selectedBloodGroup: selectedBloodGroup,
      generatedBy: "City Care Hospital Admin",
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
        proximityLabel: getProximityLabel(d.city, hospitalCity),
      })),
      activeFilters: { "Hospital Center": "City Care Hospital (Kozhikode)" },
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
            <strong className="h-val">City Care Hospital ({hospitalCity})</strong>
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
          <div className="hbs-search-field">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name, ID or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
          Showing available <strong>{selectedBloodGroup} donors only</strong> sorted nearest to <strong>{hospitalCity}</strong> first. Unavailable members are automatically excluded.
        </span>
      </div>

      {/* Results Title */}
      <div className="hbs-results-header">
        <h3>
          {filteredDonors.length} Available {selectedBloodGroup} Donor{filteredDonors.length === 1 ? "" : "s"} Found
        </h3>
        <span className="hbs-order-tag">Proximity Order: {hospitalCity} → Malappuram → Kannur → ...</span>
      </div>

      {/* Grid */}
      {filteredDonors.length === 0 ? (
        <div className="hbs-empty">
          <FaTint className="empty-icon" />
          <h3>No available {selectedBloodGroup} donors found.</h3>
          <p>Try searching another blood group or clearing query filters.</p>
        </div>
      ) : (
        <div className="hbs-grid">
          {filteredDonors.map((donor, idx) => {
            const proxScore = getProximityScore(donor.city, hospitalCity);
            const proxLabel = getProximityLabel(donor.city, hospitalCity);

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
                    {donor.type.includes("Doctor") ? <FaUserMd /> : <FaUser />}
                  </div>
                  <div>
                    <h4>{donor.name}</h4>
                    <span className="hbs-meta">
                      {donor.id} • {donor.age} Yrs • {donor.gender}
                    </span>
                    <span className="hbs-type-pill">{donor.type}</span>
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
