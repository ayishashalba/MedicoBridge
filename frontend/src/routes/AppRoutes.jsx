import React from "react";
import { Routes, Route } from "react-router-dom";

// Public / Landing
import Landing from "../pages/Landing/Landing";

// Auth pages
import Login from "../pages/Login/Login";
import PatientLogin from "../pages/Login/PatientLogin";
import DoctorLogin from "../pages/Login/DoctorLogin";
import HospitalLogin from "../pages/Login/HospitalLogin";
import PharmacyLogin from "../pages/Login/PharmacyLogin";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";

// Registration
import PatientRegister from "../pages/Register/PatientRegister";
import DoctorRegister from "../pages/Register/DoctorRegister";
import HospitalRegister from "../pages/Register/HospitalRegister";
import PharmacyRegister from "../pages/Register/PharmacyRegister";

// Other dashboards (placeholders)
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import HospitalDashboard from "../pages/Hospital/HospitalDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";

// ── Patient Dashboard Layout & Pages ──────────────────────────
import PatientLayout from "../layouts/PatientLayout/PatientLayout";
import PatientDashboardHome from "../pages/Patient/PatientDashboardHome/PatientDashboardHome";
import PatientProfile from "../pages/Patient/PatientProfile/PatientProfile";
import PatientFindDoctors from "../pages/Patient/PatientFindDoctors/PatientFindDoctors";
import PatientDoctorProfile from "../pages/Patient/PatientDoctorProfile/PatientDoctorProfile";
import PatientAppointments from "../pages/Patient/PatientAppointments/PatientAppointments";
import PatientConsultation from "../pages/Patient/PatientConsultation/PatientConsultation";
import PatientPharmacy from "../pages/Patient/PatientPharmacy/PatientPharmacy";
import PatientMedicalRecords from "../pages/Patient/PatientMedicalRecords/PatientMedicalRecords";
import PatientNotifications from "../pages/Patient/PatientNotifications/PatientNotifications";
import PatientSettings from "../pages/Patient/PatientSettings/PatientSettings";

// ── Inline placeholders ────────────────────────────────────────
const AdminLoginPlaceholder = () => (
  <div style={{ padding: "120px 2rem", textAlign: "center" }}>
    <h2>Admin Login (Under Construction)</h2>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ── Role Login ────────────────────────────────────── */}
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />
      <Route path="/login/hospital" element={<HospitalLogin />} />
      <Route path="/login/pharmacy" element={<PharmacyLogin />} />
      <Route path="/admin/login" element={<AdminLoginPlaceholder />} />

      {/* ── Auth flows ────────────────────────────────────── */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* ── Registration ──────────────────────────────────── */}
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/register/doctor" element={<DoctorRegister />} />
      <Route path="/register/hospital" element={<HospitalRegister />} />
      <Route path="/register/pharmacy" element={<PharmacyRegister />} />

      {/* ── Patient Dashboard (nested layout) ─────────────── */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route path="dashboard" element={<PatientDashboardHome />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="find-doctors" element={<PatientFindDoctors />} />
        <Route path="doctor-profile/:id" element={<PatientDoctorProfile />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="consultation" element={<PatientConsultation />} />
        <Route path="pharmacy" element={<PatientPharmacy />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="notifications" element={<PatientNotifications />} />
        <Route path="settings" element={<PatientSettings />} />
      </Route>

      {/* ── Other Dashboards ──────────────────────────────── */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* ── 404 Fallback ──────────────────────────────────── */}
      <Route
        path="*"
        element={
          <div style={{ padding: "120px 2rem", textAlign: "center" }}>
            <h2>404 — Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
