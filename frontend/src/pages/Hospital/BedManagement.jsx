import React, { useState, useMemo } from "react";
import {
  FaBed,
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaTrashAlt,
  FaFilter,
  FaWrench,
} from "react-icons/fa";
import "./BedManagement.css";

const initialBeds = [
  // ICU Wards
  { id: "ICU-A1", wardType: "ICU Wards", patientName: "Ramesh Kumar", patientId: "PAT-4091", status: "Occupied" },
  { id: "ICU-A2", wardType: "ICU Wards", patientName: "", patientId: "", status: "Available" },
  { id: "ICU-A3", wardType: "ICU Wards", patientName: "", patientId: "", status: "Maintenance" },
  { id: "ICU-A4", wardType: "ICU Wards", patientName: "Aravind Swamy", patientId: "PAT-4098", status: "Occupied" },
  // General Wards
  { id: "GW-101", wardType: "General Wards", patientName: "Sonia Sebastian", patientId: "PAT-4092", status: "Occupied" },
  { id: "GW-102", wardType: "General Wards", patientName: "", patientId: "", status: "Available" },
  { id: "GW-103", wardType: "General Wards", patientName: "", patientId: "", status: "Available" },
  { id: "GW-104", wardType: "General Wards", patientName: "", patientId: "", status: "Available" },
  { id: "GW-105", wardType: "General Wards", patientName: "Mathew V.", patientId: "PAT-4102", status: "Occupied" },
  // Special Cabins
  { id: "SC-201", wardType: "Special Wards", patientName: "Mohan Lal", patientId: "PAT-4093", status: "Occupied" },
  { id: "SC-202", wardType: "Special Wards", patientName: "", patientId: "", status: "Available" },
  { id: "SC-203", wardType: "Special Wards", patientName: "", patientId: "", status: "Maintenance" },
];

function BedManagement() {
  const [beds, setBeds] = useState(initialBeds);
  const [search, setSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState("All Wards");

  // Allocation state
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [patName, setPatName] = useState("");
  const [patId, setPatId] = useState("");

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const matchSearch =
        bed.id.toLowerCase().includes(search.toLowerCase()) ||
        bed.patientName.toLowerCase().includes(search.toLowerCase()) ||
        bed.patientId.toLowerCase().includes(search.toLowerCase());
      const matchWard = selectedWard === "All Wards" || bed.wardType === selectedWard;
      return matchSearch && matchWard;
    });
  }, [beds, search, selectedWard]);

  // Quick stats
  const totalBeds = beds.length;
  const occupied = beds.filter(b => b.status === "Occupied").length;
  const available = beds.filter(b => b.status === "Available").length;
  const maintenance = beds.filter(b => b.status === "Maintenance").length;

  const handleOpenAllocate = (bedId) => {
    setSelectedBedId(bedId);
    setShowAllocateModal(true);
  };

  const handleAllocateBed = (e) => {
    e.preventDefault();
    if (!patName || !patId) return;

    setBeds(
      beds.map((bed) =>
        bed.id === selectedBedId
          ? { ...bed, patientName: patName, patientId: patId, status: "Occupied" }
          : bed
      )
    );
    setShowAllocateModal(false);
    setPatName("");
    setPatId("");
  };

  const handleVacantBed = (bedId) => {
    setBeds(
      beds.map((bed) =>
        bed.id === bedId
          ? { ...bed, patientName: "", patientId: "", status: "Available" }
          : bed
      )
    );
  };

  const handleMaintenanceToggle = (bedId) => {
    setBeds(
      beds.map((bed) => {
        if (bed.id === bedId) {
          const nextStatus = bed.status === "Maintenance" ? "Available" : "Maintenance";
          return { ...bed, patientName: "", patientId: "", status: nextStatus };
        }
        return bed;
      })
    );
  };

  return (
    <div className="hosp-beds-page">
      {/* Bed Stats Row */}
      <section className="hosp-beds-summary">
        <div className="hosp-beds-summary-card">
          <span className="summary-val">{totalBeds}</span>
          <span className="summary-lbl">Total Capacity</span>
        </div>
        <div className="hosp-beds-summary-card summary-card--occupied">
          <span className="summary-val">{occupied}</span>
          <span className="summary-lbl">Occupied Beds</span>
        </div>
        <div className="hosp-beds-summary-card summary-card--available">
          <span className="summary-val">{available}</span>
          <span className="summary-lbl">Available Beds</span>
        </div>
        <div className="hosp-beds-summary-card summary-card--maintenance">
          <span className="summary-val">{maintenance}</span>
          <span className="summary-lbl">Maintenance</span>
        </div>
      </section>

      {/* Control bar */}
      <div className="hosp-beds-controls">
        <div className="hosp-beds-search">
          <FaSearch className="hosp-search-icon" />
          <input
            type="text"
            placeholder="Search by Bed ID or Occupant Patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hosp-beds-filters">
          <div className="hosp-filter-group">
            <FaFilter className="hosp-filter-icon" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="All Wards">All Departments</option>
              <option value="ICU Wards">ICU Wards</option>
              <option value="General Wards">General Wards</option>
              <option value="Special Wards">Special Wards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bed Layout Grid */}
      <div className="hosp-beds-grid">
        {filteredBeds.map((bed) => (
          <div
            key={bed.id}
            className={`hosp-bed-card hosp-bed-card--${bed.status.toLowerCase()}`}
          >
            <div className="hosp-bed-card-header">
              <span className="hosp-bed-number">{bed.id}</span>
              <span className="hosp-bed-ward-type">{bed.wardType}</span>
            </div>

            <div className="hosp-bed-card-body">
              <FaBed className="hosp-bed-visual-icon" />
              {bed.status === "Occupied" ? (
                <div className="hosp-bed-occupant-info">
                  <span className="occupant-name">{bed.patientName}</span>
                  <span className="occupant-id">{bed.patientId}</span>
                </div>
              ) : bed.status === "Maintenance" ? (
                <div className="hosp-bed-occupant-info">
                  <span className="occupant-name text-muted">Out of Order</span>
                  <span className="occupant-id">Cleaning/Repairs</span>
                </div>
              ) : (
                <div className="hosp-bed-occupant-info">
                  <span className="occupant-name text-success">Vacant &amp; Ready</span>
                  <span className="occupant-id">Ready for check-in</span>
                </div>
              )}
            </div>

            <div className="hosp-bed-card-actions">
              {bed.status === "Available" && (
                <>
                  <button
                    className="hosp-bed-btn hosp-bed-btn--allocate"
                    onClick={() => handleOpenAllocate(bed.id)}
                  >
                    Allocate Bed
                  </button>
                  <button
                    className="hosp-bed-btn-icon"
                    onClick={() => handleMaintenanceToggle(bed.id)}
                    title="Send to Maintenance"
                  >
                    <FaWrench />
                  </button>
                </>
              )}
              {bed.status === "Occupied" && (
                <button
                  className="hosp-bed-btn hosp-bed-btn--discharge"
                  onClick={() => handleVacantBed(bed.id)}
                >
                  Mark Vacant
                </button>
              )}
              {bed.status === "Maintenance" && (
                <button
                  className="hosp-bed-btn hosp-bed-btn--ready"
                  onClick={() => handleMaintenanceToggle(bed.id)}
                >
                  <FaCheckCircle /> Set Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Modal */}
      {showAllocateModal && (
        <div className="hosp-modal-overlay">
          <div className="hosp-modal">
            <div className="hosp-modal-header">
              <h2>Allocate Bed {selectedBedId}</h2>
              <button className="hosp-modal-close" onClick={() => setShowAllocateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAllocateBed} className="hosp-modal-form">
              <div className="form-group">
                <label>Patient ID</label>
                <input
                  type="text"
                  placeholder="e.g. PAT-4091"
                  value={patId}
                  onChange={(e) => setPatId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={patName}
                  onChange={(e) => setPatName(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="hosp-btn-submit">
                <FaCheckCircle /> Confirm Bed Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BedManagement;
