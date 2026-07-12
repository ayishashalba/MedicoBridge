import React from "react";
import {
  FaUserMd,
  FaUsers,
  FaBed,
  FaFlask,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaCheckCircle,
  FaSpinner,
  FaClock,
} from "react-icons/fa";
import "./HospitalDashboard.css";

const kpis = [
  {
    title: "Total Staff Doctors",
    value: "28",
    subtitle: "4 specialists on-duty",
    icon: <FaUserMd />,
    color: "blue",
  },
  {
    title: "Admitted Patients",
    value: "118",
    subtitle: "+12 admissions today",
    icon: <FaUsers />,
    color: "teal",
  },
  {
    title: "Bed Occupancy Status",
    value: "84%",
    subtitle: "109 / 130 beds occupied",
    icon: <FaBed />,
    color: "purple",
  },
  {
    title: "Pending Lab Reports",
    value: "14",
    subtitle: "8 critical test panels",
    icon: <FaFlask />,
    color: "amber",
  },
];

const recentAdmissions = [
  {
    id: "PAT-4091",
    name: "Ramesh Kumar",
    age: "52",
    gender: "Male",
    ward: "ICU - Bed A4",
    status: "Critical",
    date: "July 12, 10:15 AM",
  },
  {
    id: "PAT-4092",
    name: "Sonia Sebastian",
    age: "29",
    gender: "Female",
    ward: "General Ward B - Bed 12",
    status: "Stable",
    date: "July 12, 11:30 AM",
  },
  {
    id: "PAT-4093",
    name: "Mohan Lal",
    age: "64",
    gender: "Male",
    ward: "Special Cabin C2",
    status: "Stable",
    date: "July 12, 01:05 PM",
  },
  {
    id: "PAT-4094",
    name: "Aparna Nair",
    age: "41",
    gender: "Female",
    ward: "Maternity Ward - Bed 3",
    status: "Observation",
    date: "July 12, 02:40 PM",
  },
];

const pendingLabTests = [
  {
    patient: "Devanand S.",
    testName: "Cardiac Troponin Panel",
    dept: "Pathology",
    urgency: "High",
    status: "Processing",
  },
  {
    patient: "Leela Mathews",
    testName: "Chest X-Ray / CT scan",
    dept: "Radiology",
    urgency: "Medium",
    status: "Awaiting Scan",
  },
  {
    patient: "John Wesley",
    testName: "HbA1c & Fasting Glucose",
    dept: "Biochemistry",
    urgency: "Routine",
    status: "Sample Collected",
  },
];

function HospitalDashboard() {
  return (
    <div className="hosp-dash-page">
      {/* ── KPI Grid ── */}
      <section className="hosp-kpi-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className={`hosp-kpi-card hosp-kpi-card--${kpi.color}`}>
            <div className="hosp-kpi-left">
              <span className="hosp-kpi-title">{kpi.title}</span>
              <span className="hosp-kpi-val">{kpi.value}</span>
              <span className="hosp-kpi-sub">{kpi.subtitle}</span>
            </div>
            <div className="hosp-kpi-icon-wrapper">{kpi.icon}</div>
          </div>
        ))}
      </section>

      {/* ── Mid Section: Occupancy Chart + Fast Stats ── */}
      <section className="hosp-mid-section">
        {/* Ward Breakdown */}
        <div className="hosp-card hosp-ward-breakdown">
          <h2 className="hosp-card-title">Ward Occupancy Breakdown</h2>
          <div className="hosp-ward-list">
            {[
              { name: "Intensive Care Unit (ICU)", occupied: 18, total: 20, pct: 90, color: "red" },
              { name: "General Wards", occupied: 68, total: 80, pct: 85, color: "blue" },
              { name: "Special Wards & Cabins", occupied: 15, total: 20, pct: 75, color: "teal" },
              { name: "Emergency Observation", occupied: 8, total: 10, pct: 80, color: "amber" },
            ].map((ward, index) => (
              <div key={index} className="hosp-ward-row">
                <div className="hosp-ward-info">
                  <span className="hosp-ward-name">{ward.name}</span>
                  <span className="hosp-ward-numbers">{ward.occupied}/{ward.total} Beds occupied</span>
                </div>
                <div className="hosp-progress-track">
                  <div
                    className={`hosp-progress-fill hosp-progress-fill--${ward.color}`}
                    style={{ width: `${ward.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="hosp-card hosp-quick-ops">
          <h2 className="hosp-card-title">Current Operations Summary</h2>
          <div className="hosp-ops-grid">
            <div className="hosp-op-badge">
              <span className="hosp-op-number">8</span>
              <span className="hosp-op-label">Doctors Active Now</span>
            </div>
            <div className="hosp-op-badge">
              <span className="hosp-op-number">5</span>
              <span className="hosp-op-label">Scheduled Surgeries</span>
            </div>
            <div className="hosp-op-badge">
              <span className="hosp-op-number">3</span>
              <span className="hosp-op-label">Ambulances Standby</span>
            </div>
            <div className="hosp-op-badge hosp-op-badge--warning">
              <span className="hosp-op-number">21</span>
              <span className="hosp-op-label">Vacant General Beds</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Section: Active Admissions + Pending Lab Requests ── */}
      <section className="hosp-bottom-section">
        {/* Table: Recent Admissions */}
        <div className="hosp-card hosp-recent-admissions">
          <h2 className="hosp-card-title">Recent Patient Admissions</h2>
          <div className="hosp-table-wrapper">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Ward / Room</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAdmissions.map((pat) => (
                  <tr key={pat.id}>
                    <td>
                      <span className="hosp-pat-id">{pat.id}</span>
                    </td>
                    <td>
                      <div className="hosp-pat-name-col">
                        <span className="hosp-pat-name">{pat.name}</span>
                        <span className="hosp-pat-meta">{pat.age} yrs · {pat.gender}</span>
                      </div>
                    </td>
                    <td>{pat.ward}</td>
                    <td>
                      <span className={`hosp-status-pill hosp-status-pill--${pat.status.toLowerCase()}`}>
                        {pat.status}
                      </span>
                    </td>
                    <td>{pat.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel: Pending Lab Tests */}
        <div className="hosp-card hosp-lab-queue">
          <h2 className="hosp-card-title">Pending Lab Tests Queue</h2>
          <div className="hosp-lab-list">
            {pendingLabTests.map((test, index) => (
              <div key={index} className="hosp-lab-item">
                <div className="hosp-lab-item-header">
                  <span className="hosp-lab-patient">{test.patient}</span>
                  <span className={`hosp-urgency-badge hosp-urgency-badge--${test.urgency.toLowerCase()}`}>
                    {test.urgency}
                  </span>
                </div>
                <div className="hosp-lab-item-body">
                  <span className="hosp-lab-test">{test.testName}</span>
                  <span className="hosp-lab-dept">{test.dept}</span>
                </div>
                <div className="hosp-lab-item-footer">
                  <span className="hosp-lab-status">
                    <FaSpinner className="hosp-spin" /> {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HospitalDashboard;
