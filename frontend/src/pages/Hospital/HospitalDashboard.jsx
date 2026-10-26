import React, { useEffect, useState } from "react";
import {
  FaUserMd,
  FaUsers,
  FaBed,
  FaFlask,
  FaCalendarCheck,
  FaSpinner,
} from "react-icons/fa";
import "./HospitalDashboard.css";

function HospitalDashboard() {
  const [metrics, setMetrics] = useState({
    totalDoctors: 0,
    totalDepartments: 0,
    totalAppointments: 0,
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    reservedBeds: 0,
    totalPharmacyMedicines: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/hospital/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Failed to load hospital dashboard."
          );
        }

        const data = result?.data || {};

        setMetrics({
          totalDoctors: data?.metrics?.totalDoctors || 0,
          totalDepartments: data?.metrics?.totalDepartments || 0,
          totalAppointments: data?.metrics?.totalAppointments || 0,
          totalBeds: data?.metrics?.totalBeds || 0,
          availableBeds: data?.metrics?.availableBeds || 0,
          occupiedBeds: data?.metrics?.occupiedBeds || 0,
          reservedBeds: data?.metrics?.reservedBeds || 0,
          totalPharmacyMedicines: data?.metrics?.totalPharmacyMedicines || 0,
        });

        setRecentAppointments(data?.recentAppointments || []);
      } catch (err) {
        console.error("Failed to load hospital dashboard:", err);
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const occupancyPercentage =
    metrics.totalBeds > 0
      ? Math.round((metrics.occupiedBeds / metrics.totalBeds) * 100)
      : 0;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPatientName = (appointment) => {
    return appointment?.patientId?.name || "Unknown Patient";
  };

  const getPatientAge = (dob) => {
    if (!dob) return "—";

    const birthDate = new Date(dob);

    if (Number.isNaN(birthDate.getTime())) {
      return "—";
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "—";
  };

  const getAppointmentStatus = (status) => {
    if (!status) return "Pending";

    return status;
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "Pending").toLowerCase();

    if (normalized.includes("cancel")) return "cancelled";
    if (normalized.includes("complete")) return "completed";
    if (normalized.includes("confirm")) return "confirmed";
    if (normalized.includes("progress")) return "processing";

    return normalized.replace(/\s+/g, "-");
  };

  const wardBreakdown = [
    {
      name: "Occupied Beds",
      value: metrics.occupiedBeds,
      total: metrics.totalBeds,
      pct: occupancyPercentage,
      color: "red",
    },
    {
      name: "Available Beds",
      value: metrics.availableBeds,
      total: metrics.totalBeds,
      pct:
        metrics.totalBeds > 0
          ? Math.round((metrics.availableBeds / metrics.totalBeds) * 100)
          : 0,
      color: "blue",
    },
    {
      name: "Reserved Beds",
      value: metrics.reservedBeds,
      total: metrics.totalBeds,
      pct:
        metrics.totalBeds > 0
          ? Math.round((metrics.reservedBeds / metrics.totalBeds) * 100)
          : 0,
      color: "teal",
    },
  ];

  if (loading) {
    return (
      <div className="hosp-dash-page">
        <div className="hosp-card" style={{ padding: "30px", textAlign: "center" }}>
          <FaSpinner className="hosp-spin" />
          <p>Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hosp-dash-page">
        <div className="hosp-card" style={{ padding: "30px", textAlign: "center" }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hosp-dash-page">
      {/* ── KPI Grid ── */}
      <section className="hosp-kpi-grid">
        <div className="hosp-kpi-card hosp-kpi-card--blue">
          <div className="hosp-kpi-left">
            <span className="hosp-kpi-title">Total Staff Doctors</span>
            <span className="hosp-kpi-val">{metrics.totalDoctors}</span>
            <span className="hosp-kpi-sub">
              Registered doctors
            </span>
          </div>

          <div className="hosp-kpi-icon-wrapper">
            <FaUserMd />
          </div>
        </div>

        <div className="hosp-kpi-card hosp-kpi-card--teal">
          <div className="hosp-kpi-left">
            <span className="hosp-kpi-title">Hospital Appointments</span>
            <span className="hosp-kpi-val">
              {metrics.totalAppointments}
            </span>
            <span className="hosp-kpi-sub">
              Total appointments
            </span>
          </div>

          <div className="hosp-kpi-icon-wrapper">
            <FaUsers />
          </div>
        </div>

        <div className="hosp-kpi-card hosp-kpi-card--purple">
          <div className="hosp-kpi-left">
            <span className="hosp-kpi-title">
              Bed Occupancy Status
            </span>
            <span className="hosp-kpi-val">
              {occupancyPercentage}%
            </span>
            <span className="hosp-kpi-sub">
              {metrics.occupiedBeds} / {metrics.totalBeds} beds occupied
            </span>
          </div>

          <div className="hosp-kpi-icon-wrapper">
            <FaBed />
          </div>
        </div>

        <div className="hosp-kpi-card hosp-kpi-card--amber">
          <div className="hosp-kpi-left">
            <span className="hosp-kpi-title">Pharmacy Medicines</span>
            <span className="hosp-kpi-val">
              {metrics.totalPharmacyMedicines}
            </span>
            <span className="hosp-kpi-sub">
              Hospital pharmacy inventory
            </span>
          </div>

          <div className="hosp-kpi-icon-wrapper">
            <FaFlask />
          </div>
        </div>
      </section>

      {/* ── Mid Section ── */}
      <section className="hosp-mid-section">
        {/* Bed Breakdown */}
        <div className="hosp-card hosp-ward-breakdown">
          <h2 className="hosp-card-title">
            Bed Occupancy Breakdown
          </h2>

          <div className="hosp-ward-list">
            {wardBreakdown.map((bed, index) => (
              <div key={index} className="hosp-ward-row">
                <div className="hosp-ward-info">
                  <span className="hosp-ward-name">
                    {bed.name}
                  </span>

                  <span className="hosp-ward-numbers">
                    {bed.value}/{bed.total} Beds
                  </span>
                </div>

                <div className="hosp-progress-track">
                  <div
                    className={`hosp-progress-fill hosp-progress-fill--${bed.color}`}
                    style={{ width: `${bed.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations */}
        <div className="hosp-card hosp-quick-ops">
          <h2 className="hosp-card-title">
            Current Operations Summary
          </h2>

          <div className="hosp-ops-grid">
            <div className="hosp-op-badge">
              <span className="hosp-op-number">
                {metrics.totalDoctors}
              </span>

              <span className="hosp-op-label">
                Staff Doctors
              </span>
            </div>

            <div className="hosp-op-badge">
              <span className="hosp-op-number">
                {metrics.totalDepartments}
              </span>

              <span className="hosp-op-label">
                Departments
              </span>
            </div>

            <div className="hosp-op-badge">
              <span className="hosp-op-number">
                {metrics.totalAppointments}
              </span>

              <span className="hosp-op-label">
                Total Appointments
              </span>
            </div>

            <div className="hosp-op-badge hosp-op-badge--warning">
              <span className="hosp-op-number">
                {metrics.availableBeds}
              </span>

              <span className="hosp-op-label">
                Available Beds
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <section className="hosp-bottom-section">
        {/* Recent Appointments */}
        <div className="hosp-card hosp-recent-admissions">
          <h2 className="hosp-card-title">
            Recent Hospital Appointments
          </h2>

          <div className="hosp-table-wrapper">
            <table className="hosp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient Name</th>
                  <th>Doctor / Department</th>
                  <th>Status</th>
                  <th>Appointment Time</th>
                </tr>
              </thead>

              <tbody>
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment) => {
                    const status = getAppointmentStatus(
                      appointment?.status
                    );

                    return (
                      <tr key={appointment?._id}>
                        <td>
                          <span className="hosp-pat-id">
                            {appointment?._id
                              ? `APT-${appointment._id
                                .toString()
                                .slice(-6)
                                .toUpperCase()}`
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <div className="hosp-pat-name-col">
                            <span className="hosp-pat-name">
                              {getPatientName(appointment)}
                            </span>

                            <span className="hosp-pat-meta">
                              {getPatientAge(
                                appointment?.patientId?.dob
                              )}{" "}
                              yrs ·{" "}
                              {appointment?.patientId?.gender ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="hosp-pat-name-col">
                            <span className="hosp-pat-name">
                              {appointment?.doctorId?.name ||
                                "—"}
                            </span>

                            <span className="hosp-pat-meta">
                              {appointment?.doctorId
                                ?.specialization || "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`hosp-status-pill hosp-status-pill--${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td>
                          {formatDate(appointment?.date)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No recent appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lab Queue */}
        <div className="hosp-card hosp-lab-queue">
          <h2 className="hosp-card-title">
            Pending Lab Tests Queue
          </h2>

          <div className="hosp-lab-list">
            <div className="hosp-lab-item">
              <div className="hosp-lab-item-header">
                <span className="hosp-lab-patient">
                  Lab queue data
                </span>

                <span className="hosp-urgency-badge hosp-urgency-badge--routine">
                  Info
                </span>
              </div>

              <div className="hosp-lab-item-body">
                <span className="hosp-lab-test">
                  Pending lab report API is not available
                </span>

                <span className="hosp-lab-dept">
                  No LabReport data in current dashboard endpoint
                </span>
              </div>

              <div className="hosp-lab-item-footer">
                <span className="hosp-lab-status">
                  <FaSpinner className="hosp-spin" /> No live lab
                  queue data
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HospitalDashboard;