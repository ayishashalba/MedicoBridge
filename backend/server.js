const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Standard Blood Group list
const VALID_BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Provided"
];

/* ── MOCK DATABASE FOR BACKEND ────────────────────────────── */
const db = {
  patients: [
    { id: "PAT-101", name: "Aarav Sharma", age: 32, gender: "Male", bloodGroup: "O+", phone: "+91 98765 43210", email: "aarav.sharma@example.com", doctorIds: ["DR-80241", "DOC-201"], hospitalId: "HOSP-5021", status: "Active", ward: "ICU - Bed A4" },
    { id: "PAT-102", name: "Sunita Rao", age: 27, gender: "Female", bloodGroup: "A+", phone: "+91 87654 32109", email: "sunita.rao@example.com", doctorIds: ["DR-80242", "DOC-202"], hospitalId: "HOSP-5021", status: "Active", ward: "General Ward B - Bed 12" },
    { id: "PAT-103", name: "Rohan Verma", age: 41, gender: "Male", bloodGroup: "B-", phone: "+91 76543 21098", email: "rohan.verma@example.com", doctorIds: ["DOC-203"], hospitalId: "HOSP-5022", status: "Blocked", ward: "Special Cabin C2" },
    { id: "PAT-104", name: "Lakshmi Nair", age: 46, gender: "Female", bloodGroup: "AB+", phone: "+91 65432 10987", email: "lakshmi.nair@example.com", doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Active", ward: "Maternity Ward - Bed 3" },
    { id: "PAT-105", name: "Karan Malhotra", age: 31, gender: "Male", bloodGroup: "O-", phone: "+91 54321 09876", email: "karan.m@example.com", doctorIds: ["DR-80244"], hospitalId: "HOSP-5021", status: "Active", ward: "None (Outpatient)" },
    { id: "PAT-106", name: "Rahul Nair", age: 32, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43210", email: "rahul@gmail.com", doctorIds: ["DR-80241", "DOC-201"], hospitalId: "HOSP-5021", status: "Admitted", ward: "ICU - Bed A1" },
    { id: "PAT-107", name: "Anjali Thomas", age: 27, gender: "Female", bloodGroup: "O+", phone: "+91 98765 43211", email: "anjali@gmail.com", doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Admitted", ward: "General Ward A" },
    { id: "PAT-108", name: "Arun Kumar", age: 41, gender: "Male", bloodGroup: "A-", phone: "+91 98765 43212", email: "arun@gmail.com", doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Discharged", ward: "None" },
  ],
  doctors: [
    { id: "DR-80241", userId: "USR-DOC-1021", hospitalId: "HOSP-5021", name: "Dr. Ayisha Shalba", specialization: "Cardiology", department: "Cardiology", qualification: "MBBS, MD", experience: "12 Years", doctorType: "Hospital", email: "ayisha.shalba@medicobridge.com", phone: "+91 98765 43210", bloodGroup: "O+", status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80242", userId: "USR-DOC-1022", hospitalId: "HOSP-5021", name: "Dr. Rajesh K. Nair", specialization: "Neurology", department: "Neurology", qualification: "MBBS, MS", experience: "15 Years", doctorType: "Hospital", email: "rajesh.nair@medicobridge.com", phone: "+91 98765 43211", bloodGroup: "A+", status: "In Surgery", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80243", userId: "USR-DOC-1023", hospitalId: "HOSP-5021", name: "Dr. Priya Thomas", specialization: "Pediatrics", department: "Pediatrics", qualification: "MBBS, DCH", experience: "9 Years", doctorType: "Hospital", email: "priya.t@medicobridge.com", phone: "+91 98765 43212", bloodGroup: "B+", status: "On Leave", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80244", userId: "USR-DOC-1024", hospitalId: "HOSP-5021", name: "Dr. Susan George", specialization: "Orthopedics", department: "Orthopedics", qualification: "MBBS, MS", experience: "11 Years", doctorType: "Hospital", email: "susan.g@medicobridge.com", phone: "+91 98765 43213", bloodGroup: "AB+", status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80245", userId: "USR-DOC-1025", hospitalId: "HOSP-5021", name: "Dr. Vikram Shekar", specialization: "Dermatology", department: "Dermatology", qualification: "MBBS, MD", experience: "8 Years", doctorType: "Hospital", email: "vikram.s@medicobridge.com", phone: "+91 98765 43214", bloodGroup: "O-", status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80246", userId: "USR-DOC-1026", hospitalId: "HOSP-5021", name: "Dr. Amit Varma", specialization: "General Medicine", department: "General Medicine", qualification: "MBBS, MD", experience: "14 Years", doctorType: "Hospital", email: "amit.v@medicobridge.com", phone: "+91 98765 43215", bloodGroup: "Not Provided", status: "In Surgery", accountStatus: "Active", verified: "Yes" },
  ],
  hospitals: [
    { id: "HOSP-5021", name: "City Care Hospital", email: "contact@citycare.org", phone: "+91 44 2234 5678", city: "Chennai", status: "Active" },
  ],
};

/* ── AUTHORIZATION MIDDLEWARE ─────────────────────────────── */
function authorize(roles = []) {
  return (req, res, next) => {
    // Check Authorization header or X-User-Role header
    const roleHeader = req.headers["x-user-role"] || req.headers["authorization"];
    const userRole = roleHeader ? roleHeader.replace("Bearer ", "").trim() : "Guest";

    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).json({ error: "Access Denied: Role unauthorized for this blood group resource" });
    }

    req.userRole = userRole;
    req.userId = req.headers["x-user-id"] || "DR-80241";
    req.hospitalId = req.headers["x-hospital-id"] || "HOSP-5021";
    next();
  };
}

/* ── 1. DOCTOR PATIENTS ENDPOINT ──────────────────────────── */
app.get("/api/doctor/patients", authorize(["Doctor", "Admin"]), (req, res) => {
  const { bloodGroup, search } = req.query;
  const doctorId = req.userId;

  // Filter: Accessible patients only (belonging to this doctor)
  let result = db.patients.filter((p) => p.doctorIds && p.doctorIds.includes(doctorId));

  // Blood Group Filter
  if (bloodGroup && bloodGroup !== "All" && bloodGroup !== "All Blood Groups") {
    result = result.filter((p) => p.bloodGroup === bloodGroup);
  }

  // Search Filter
  if (search) {
    const s = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
  }

  res.json({ success: true, count: result.length, data: result });
});

/* ── 2. HOSPITAL PATIENTS ENDPOINT ────────────────────────── */
app.get("/api/hospital/patients", authorize(["Hospital", "Admin"]), (req, res) => {
  const { bloodGroup, search, status, ward } = req.query;
  const hospitalId = req.hospitalId;

  // Filter: Hospital patients only
  let result = db.patients.filter((p) => p.hospitalId === hospitalId);

  // Blood Group Filter
  if (bloodGroup && bloodGroup !== "All" && bloodGroup !== "All Blood Groups") {
    result = result.filter((p) => p.bloodGroup === bloodGroup);
  }

  // Status Filter
  if (status && status !== "All" && status !== "All Statuses") {
    result = result.filter((p) => p.status === status);
  }

  // Search Filter
  if (search) {
    const s = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(s) || p.id.toLowerCase().includes(s));
  }

  res.json({ success: true, count: result.length, data: result });
});

/* ── 3. HOSPITAL DOCTORS / STAFF ENDPOINT ─────────────────── */
app.get("/api/hospital/staff", authorize(["Hospital", "Admin"]), (req, res) => {
  const { bloodGroup, search, status } = req.query;
  const hospitalId = req.hospitalId;

  // Filter: Doctors working in this hospital
  let result = db.doctors.filter((d) => d.hospitalId === hospitalId);

  // Blood Group Filter
  if (bloodGroup && bloodGroup !== "All" && bloodGroup !== "All Blood Groups") {
    result = result.filter((d) => d.bloodGroup === bloodGroup);
  }

  // Status Filter
  if (status && status !== "All" && status !== "All Statuses") {
    result = result.filter((d) => d.status === status || d.accountStatus === status);
  }

  // Search Filter
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.id.toLowerCase().includes(s) ||
        d.specialization.toLowerCase().includes(s)
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

/* ── 4. ADMIN USER MANAGEMENT ENDPOINT ───────────────────── */
app.get("/api/admin/users", authorize(["Admin"]), (req, res) => {
  const { tab = "Patients", bloodGroup, status, search } = req.query;

  let dataset = [];
  if (tab === "Patients") dataset = db.patients;
  else if (tab === "Doctors") dataset = db.doctors;

  let result = dataset;

  // Blood Group Filter (only applicable for Patients & Doctors)
  if (bloodGroup && bloodGroup !== "All" && bloodGroup !== "All Blood Groups") {
    result = result.filter((u) => u.bloodGroup === bloodGroup);
  }

  // Status Filter
  if (status && status !== "All" && status !== "All Statuses") {
    result = result.filter((u) => u.status === status || u.accountStatus === status);
  }

  // Search Filter
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (u) => u.name.toLowerCase().includes(s) || u.id.toLowerCase().includes(s) || (u.email && u.email.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

/* ── 5. PATIENT PROFILE BLOOD GROUP UPDATE ────────────────── */
app.put("/api/patient/profile/blood-group", authorize(["Patient"]), (req, res) => {
  const { patientId, bloodGroup } = req.body;
  const targetId = patientId || req.userId;

  const bg = bloodGroup && bloodGroup.trim() !== "" ? bloodGroup.trim() : "Not Provided";
  if (!VALID_BLOOD_GROUPS.includes(bg)) {
    return res.status(400).json({ error: "Invalid blood group option provided" });
  }

  const patient = db.patients.find((p) => p.id === targetId);
  if (patient) {
    patient.bloodGroup = bg;
    return res.json({ success: true, message: "Blood group updated successfully", patient });
  }

  res.status(404).json({ error: "Patient record not found" });
});

/* ── 6. DOCTOR PROFILE BLOOD GROUP UPDATE ─────────────────── */
app.put("/api/doctor/profile/blood-group", authorize(["Doctor"]), (req, res) => {
  const { doctorId, bloodGroup } = req.body;
  const targetId = doctorId || req.userId;

  const bg = bloodGroup && bloodGroup.trim() !== "" ? bloodGroup.trim() : "Not Provided";
  if (!VALID_BLOOD_GROUPS.includes(bg)) {
    return res.status(400).json({ error: "Invalid blood group option provided" });
  }

  const doctor = db.doctors.find((d) => d.id === targetId);
  if (doctor) {
    doctor.bloodGroup = bg;
    return res.json({ success: true, message: "Blood group updated successfully", doctor });
  }

  res.status(404).json({ error: "Doctor record not found" });
});

app.listen(PORT, () => {
  console.log(`MedicoBridge Backend API running on port ${PORT}`);
});

module.exports = app;
