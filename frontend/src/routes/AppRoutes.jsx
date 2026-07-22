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


// ── Admin Dashboard Layout & Pages ─────────────────────────────
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminApprovals from "../pages/Admin/AdminApprovals";
import AdminAppointments from "../pages/Admin/AdminAppointments";
import AdminReports from "../pages/Admin/AdminReports";
import AdminSettings from "../pages/Admin/AdminSettings";
import AdminNotifications from "../pages/Admin/AdminNotifications";
import AdminFeedback from "../pages/Admin/AdminFeedback";
import AdminLogs from "../pages/Admin/AdminLogs";
import AdminProfile from "../pages/Admin/AdminProfile";

// ── Hospital Dashboard Layout & Pages ──────────────────────────
import HospitalLayout from "../layouts/HospitalLayout/HospitalLayout";
import HospitalDashboard from "../pages/Hospital/HospitalDashboard";
import ManageDoctors from "../pages/Hospital/ManageDoctors";
import ManagePatients from "../pages/Hospital/ManagePatients";
import HospitalAppointments from "../pages/Hospital/HospitalAppointments";
import BedManagement from "../pages/Hospital/BedManagement";
import LabReports from "../pages/Hospital/LabReports";
import PharmacyRequests from "../pages/Hospital/PharmacyRequests";
import BillingManagement from "../pages/Hospital/BillingManagement";
import HospitalNotifications from "../pages/Hospital/HospitalNotifications";
import HospitalSettings from "../pages/Hospital/HospitalSettings";
import HospitalProfile from "./pages/hospital/HospitalProfile";

// ── Doctor Dashboard Layout & Pages ────────────────────────────
import DoctorLayout from "../layouts/DoctorLayout/DoctorLayout";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard/DoctorDashboard";
import DoctorProfile from "../pages/Doctor/DoctorProfile/DoctorProfile";
import DoctorEditProfile from "../pages/Doctor/DoctorEditProfile/DoctorEditProfile";
import DoctorAppointments from "../pages/Doctor/DoctorAppointments/DoctorAppointments";
import DoctorAppointmentDetails from "../pages/Doctor/DoctorAppointmentDetails/DoctorAppointmentDetails";
import DoctorConsultation from "../pages/Doctor/DoctorConsultation/DoctorConsultation";
import DoctorConsultationRoom from "../pages/Doctor/DoctorConsultationRoom/DoctorConsultationRoom";
import DoctorEditPrescription from "../pages/Doctor/DoctorEditPrescription/DoctorEditPrescription";
import DoctorPrescriptionPreview from "../pages/Doctor/DoctorPrescriptionPreview/DoctorPrescriptionPreview";
import DoctorPrescriptionSuccess from "../pages/Doctor/DoctorPrescriptionSuccess/DoctorPrescriptionSuccess";
import DoctorPatients from "../pages/Doctor/DoctorPatients/DoctorPatients";
import DoctorPatientDetails from "../pages/Doctor/DoctorPatients/DoctorPatientDetails";
import DoctorPrescriptions from "../pages/Doctor/DoctorPrescriptions/DoctorPrescriptions";
import DoctorPrescriptionDetails from "../pages/Doctor/DoctorPrescriptionDetails/DoctorPrescriptionDetails";
import DoctorMedicalRecords from "../pages/Doctor/DoctorMedicalRecords/DoctorMedicalRecords";
import DoctorNotifications from "../pages/Doctor/DoctorNotifications/DoctorNotifications";
import DoctorSettings from "../pages/Doctor/DoctorSettings/DoctorSettings";
import DoctorReviews from "../pages/Doctor/DoctorReviews/DoctorReviews";

// ── Patient Dashboard Layout & Pages ──────────────────────────
import PatientLayout from "../layouts/PatientLayout/PatientLayout";
import PatientDashboardHome from "../pages/Patient/PatientDashboardHome/PatientDashboardHome";
import PatientProfile from "../pages/Patient/PatientProfile/PatientProfile";
import PatientFindDoctors from "../pages/Patient/PatientFindDoctors/PatientFindDoctors";
import PatientDoctorProfile from "../pages/Patient/PatientDoctorProfile/PatientDoctorProfile";
import PatientBookAppointment from "../pages/Patient/PatientBookAppointment/PatientBookAppointment";
import PatientBookingSuccess from "../pages/Patient/PatientBookingSuccess/PatientBookingSuccess";
import PatientAppointments from "../pages/Patient/PatientAppointments/PatientAppointments";
import PatientConsultation from "../pages/Patient/PatientConsultation/PatientConsultation";
import PatientConsultationDetails from "../pages/Patient/PatientConsultationDetails/PatientConsultationDetails";
import PatientConsultationRoom from "../pages/Patient/PatientConsultationRoom/PatientConsultationRoom";
import PatientPharmacy from "../pages/Patient/PatientPharmacy/PatientPharmacy";
import PatientMedicalRecords from "../pages/Patient/PatientMedicalRecords/PatientMedicalRecords";
import PatientNotifications from "../pages/Patient/PatientNotifications/PatientNotifications";
import PatientSettings from "../pages/Patient/PatientSettings/PatientSettings";
import PatientMedicineDetails from "../pages/Patient/PatientMedicineDetails/PatientMedicineDetails";
import PatientCart from "../pages/Patient/PatientCart/PatientCart";
import PatientCheckout from "../pages/Patient/PatientCheckout/PatientCheckout";
import PatientOrderSuccess from "../pages/Patient/PatientOrderSuccess/PatientOrderSuccess";
import PatientOrders from "../pages/Patient/PatientOrders/PatientOrders";
import PatientOrderDetails from "../pages/Patient/PatientOrderDetails/PatientOrderDetails";
import ConsultationDetails from "../pages/Patient/PatientRecordDetails/ConsultationDetails";
import PrescriptionDetails from "../pages/Patient/PatientRecordDetails/PrescriptionDetails";
import LabReportDetails from "../pages/Patient/PatientRecordDetails/LabReportDetails";
import DocumentDetails from "../pages/Patient/PatientRecordDetails/DocumentDetails";
import PatientAddresses from "../pages/Patient/PatientAddresses/PatientAddresses";
import PatientChangePassword from "../pages/Patient/PatientChangePassword/PatientChangePassword";

// ── Pharmacy Dashboard Layout & Pages ─────────────────────────
import PharmacyLayout from "../layouts/PharmacyLayout/PharmacyLayout";
import PharmacyDashboard from "../pages/Pharmacy/PharmacyDashboard";
import PrescriptionRequests from "../pages/Pharmacy/PrescriptionRequests";
import MedicineInventory from "../pages/Pharmacy/MedicineInventory";
import PharmacyOrders from "../pages/Pharmacy/PharmacyOrders";
import PharmacyBilling from "../pages/Pharmacy/PharmacyBilling";
import DeliveryTracking from "../pages/Pharmacy/DeliveryTracking";
import PharmacyNotifications from "../pages/Pharmacy/PharmacyNotifications";
import PharmacyProfile from "../pages/Pharmacy/PharmacyProfile";
import PharmacySettings from "../pages/Pharmacy/PharmacySettings";

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
      <Route path="/admin/login" element={<AdminLogin />} />

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
        <Route path="book-appointment/:id" element={<PatientBookAppointment />} />
        <Route path="booking-success" element={<PatientBookingSuccess />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="consultation" element={<PatientConsultation />} />
        <Route path="consultation/:id" element={<PatientConsultationDetails />} />
        <Route path="consultation/:id/room" element={<PatientConsultationRoom />} />
        <Route path="pharmacy" element={<PatientPharmacy />} />
        <Route path="medicine/:id" element={<PatientMedicineDetails />} />
        <Route path="cart" element={<PatientCart />} />
        <Route path="checkout" element={<PatientCheckout />} />
        <Route path="order-success" element={<PatientOrderSuccess />} />
        <Route path="orders" element={<PatientOrders />} />
        <Route path="order-details/:id" element={<PatientOrderDetails />} />
        <Route path="medical-records" element={<PatientMedicalRecords />} />
        <Route path="medical-records/consultation/:id" element={<ConsultationDetails />} />
        <Route path="medical-records/prescription/:id" element={<PrescriptionDetails />} />
        <Route path="medical-records/lab-report/:id" element={<LabReportDetails />} />
        <Route path="medical-records/document/:id" element={<DocumentDetails />} />
        <Route path="notifications" element={<PatientNotifications />} />
        <Route path="settings" element={<PatientSettings />} />
        <Route path="addresses" element={<PatientAddresses />} />
        <Route path="change-password" element={<PatientChangePassword />} />
      </Route>

      {/* ── Doctor Dashboard (nested layout) ─────────────── */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="/doctor/edit-profile" element={<DoctorEditProfile />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="appointments/:id" element={<DoctorAppointmentDetails />} />
        <Route path="consultation" element={<DoctorConsultation />} />
        <Route path="consultation-room/:id" element={<DoctorConsultationRoom />} />
        <Route
          path="edit-prescription/:id"
          element={<DoctorEditPrescription />}
        />
        <Route path="prescription-preview/:id" element={<DoctorPrescriptionPreview />} />
        <Route
          path="prescription-success"
          element={<DoctorPrescriptionSuccess />}
        />
        <Route
          path="patients/:id"
          element={<DoctorPatientDetails />}
        />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="prescriptions/:id" element={<DoctorPrescriptionDetails />} />
        <Route path="medical-records" element={<DoctorMedicalRecords />} />
        <Route path="notifications" element={<DoctorNotifications />} />
        <Route path="reviews" element={<DoctorReviews />} />
        <Route path="settings" element={<DoctorSettings />} />
      </Route>

      {/* ── Hospital Dashboard (nested layout) ─────────────── */}
      <Route path="/hospital" element={<HospitalLayout />}>
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="patients" element={<ManagePatients />} />
        <Route path="appointments" element={<HospitalAppointments />} />
        <Route path="beds" element={<BedManagement />} />
        <Route path="labs" element={<LabReports />} />
        <Route path="pharmacy" element={<PharmacyRequests />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="notifications" element={<HospitalNotifications />} />
        <Route path="settings" element={<HospitalSettings />} />
        <Route
          path="/hospital/profile"
          element={<HospitalProfile />}
        />
      </Route>

      {/* ── Pharmacy Dashboard (nested layout) ─────────────── */}
      <Route path="/pharmacy" element={<PharmacyLayout />}>
        <Route path="dashboard" element={<PharmacyDashboard />} />
        <Route path="prescriptions" element={<PrescriptionRequests />} />
        <Route path="inventory" element={<MedicineInventory />} />
        <Route path="orders" element={<PharmacyOrders />} />
        <Route path="billing" element={<PharmacyBilling />} />
        <Route path="delivery" element={<DeliveryTracking />} />
        <Route path="notifications" element={<PharmacyNotifications />} />
        <Route path="profile" element={<PharmacyProfile />} />
        <Route path="settings" element={<PharmacySettings />} />
      </Route>

      {/* ── Admin Dashboard (nested layout) ───────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

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
