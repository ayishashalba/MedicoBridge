import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import PatientLogin from "../pages/Login/PatientLogin";
import DoctorLogin from "../pages/Login/DoctorLogin";
import PatientDashboard from "../pages/Patient/PatientDashboard";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import HospitalDashboard from "../pages/Hospital/HospitalDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

// Inline placeholders for pages to be built in subsequent steps
const HospitalLoginPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Hospital Login (Under Construction)</h2>
  </div>
);
const PharmacyLoginPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Pharmacy Login (Under Construction)</h2>
  </div>
);
const AdminLoginPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Admin Login (Under Construction)</h2>
  </div>
);

const PatientRegisterPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Patient Registration (Under Construction)</h2>
  </div>
);
const DoctorRegisterPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Doctor Registration (Under Construction)</h2>
  </div>
);
const HospitalRegisterPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Hospital Registration (Under Construction)</h2>
  </div>
);
const PharmacyRegisterPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Pharmacy Registration (Under Construction)</h2>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Role Login Routes */}
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />
      <Route path="/login/hospital" element={<HospitalLoginPlaceholder />} />
      <Route path="/login/pharmacy" element={<PharmacyLoginPlaceholder />} />
      <Route path="/admin/login" element={<AdminLoginPlaceholder />} />

      {/* Role Registration Routes */}
      <Route
        path="/register/patient"
        element={<PatientRegisterPlaceholder />}
      />
      <Route path="/register/doctor" element={<DoctorRegisterPlaceholder />} />
      <Route
        path="/register/hospital"
        element={<HospitalRegisterPlaceholder />}
      />
      <Route
        path="/register/pharmacy"
        element={<PharmacyRegisterPlaceholder />}
      />

      {/* Dashboards */}
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Fallback route */}
      <Route
        path="*"
        element={
          <div style={{ padding: "120px 2rem", textAlign: "center" }}>
            <h2>404 - Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
