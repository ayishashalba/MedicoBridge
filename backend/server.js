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
    { id: "PAT-101", name: "Aarav Sharma", age: 32, gender: "Male", bloodGroup: "O+", phone: "+91 98765 43210", email: "aarav.sharma@example.com", city: "Kozhikode", isDonorAvailable: true, doctorIds: ["DR-80241", "DOC-201"], hospitalId: "HOSP-5021", status: "Active", ward: "ICU - Bed A4" },
    { id: "PAT-102", name: "Sunita Rao", age: 27, gender: "Female", bloodGroup: "A+", phone: "+91 87654 32109", email: "sunita.rao@example.com", city: "Malappuram", isDonorAvailable: true, doctorIds: ["DR-80242", "DOC-202"], hospitalId: "HOSP-5021", status: "Active", ward: "General Ward B - Bed 12" },
    { id: "PAT-103", name: "Rohan Verma", age: 41, gender: "Male", bloodGroup: "B-", phone: "+91 76543 21098", email: "rohan.verma@example.com", city: "Delhi", isDonorAvailable: false, doctorIds: ["DOC-203"], hospitalId: "HOSP-5022", status: "Blocked", ward: "Special Cabin C2" },
    { id: "PAT-104", name: "Lakshmi Nair", age: 46, gender: "Female", bloodGroup: "AB+", phone: "+91 65432 10987", email: "lakshmi.nair@example.com", city: "Kozhikode", isDonorAvailable: true, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Active", ward: "Maternity Ward - Bed 3" },
    { id: "PAT-105", name: "Karan Malhotra", age: 31, gender: "Male", bloodGroup: "O-", phone: "+91 54321 09876", email: "karan.m@example.com", city: "Kannur", isDonorAvailable: true, doctorIds: ["DR-80244"], hospitalId: "HOSP-5021", status: "Active", ward: "None (Outpatient)" },
    { id: "PAT-106", name: "Rahul Nair", age: 32, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43210", email: "rahul@gmail.com", city: "Kozhikode", isDonorAvailable: true, doctorIds: ["DR-80241", "DOC-201"], hospitalId: "HOSP-5021", status: "Admitted", ward: "ICU - Bed A1" },
    { id: "PAT-107", name: "Anjali Thomas", age: 27, gender: "Female", bloodGroup: "B+", phone: "+91 98765 43211", email: "anjali@gmail.com", city: "Malappuram", isDonorAvailable: true, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Admitted", ward: "General Ward A" },
    { id: "PAT-108", name: "Arun Kumar", age: 41, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43212", email: "arun@gmail.com", city: "Kannur", isDonorAvailable: true, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Discharged", ward: "None" },
    { id: "PAT-109", name: "Firoz Khan", age: 36, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43219", email: "firoz.khan@example.com", city: "Ernakulam", isDonorAvailable: true, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Active", ward: "None" },
    { id: "PAT-110", name: "Deepak Sharma", age: 29, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43220", email: "deepak.sharma@example.com", city: "Delhi", isDonorAvailable: true, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Active", ward: "None" },
    { id: "PAT-111", name: "Vikas Patel", age: 34, gender: "Male", bloodGroup: "B+", phone: "+91 98765 43221", email: "vikas.patel@example.com", city: "Goa", isDonorAvailable: false, doctorIds: ["DR-80241"], hospitalId: "HOSP-5021", status: "Active", ward: "None" },
  ],
  doctors: [
    { id: "DR-80241", userId: "USR-DOC-1021", hospitalId: "HOSP-5021", name: "Dr. Ayisha Shalba", specialization: "Cardiology", department: "Cardiology", qualification: "MBBS, MD", experience: "12 Years", doctorType: "Hospital", email: "ayisha.shalba@medicobridge.com", phone: "+91 98765 43210", bloodGroup: "O+", city: "Kozhikode", isDonorAvailable: true, status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80242", userId: "USR-DOC-1022", hospitalId: "HOSP-5021", name: "Dr. Rajesh K. Nair", specialization: "Neurology", department: "Neurology", qualification: "MBBS, MS", experience: "15 Years", doctorType: "Hospital", email: "rajesh.nair@medicobridge.com", phone: "+91 98765 43211", bloodGroup: "B+", city: "Kozhikode", isDonorAvailable: true, status: "In Surgery", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80243", userId: "USR-DOC-1023", hospitalId: "HOSP-5021", name: "Dr. Priya Thomas", specialization: "Pediatrics", department: "Pediatrics", qualification: "MBBS, DCH", experience: "9 Years", doctorType: "Hospital", email: "priya.t@medicobridge.com", phone: "+91 98765 43212", bloodGroup: "B+", city: "Wayanad", isDonorAvailable: true, status: "On Leave", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80244", userId: "USR-DOC-1024", hospitalId: "HOSP-5021", name: "Dr. Susan George", specialization: "Orthopedics", department: "Orthopedics", qualification: "MBBS, MS", experience: "11 Years", doctorType: "Hospital", email: "susan.g@medicobridge.com", phone: "+91 98765 43213", bloodGroup: "AB+", city: "Ernakulam", isDonorAvailable: true, status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80245", userId: "USR-DOC-1025", hospitalId: "HOSP-5021", name: "Dr. Vikram Shekar", specialization: "Dermatology", department: "Dermatology", qualification: "MBBS, MD", experience: "8 Years", doctorType: "Hospital", email: "vikram.s@medicobridge.com", phone: "+91 98765 43214", bloodGroup: "O-", city: "Chennai", isDonorAvailable: false, status: "Available", accountStatus: "Active", verified: "Yes" },
    { id: "DR-80246", userId: "USR-DOC-1026", hospitalId: "HOSP-5021", name: "Dr. Amit Varma", specialization: "General Medicine", department: "General Medicine", qualification: "MBBS, MD", experience: "14 Years", doctorType: "Hospital", email: "amit.v@medicobridge.com", phone: "+91 98765 43215", bloodGroup: "Not Provided", city: "Kolkata", isDonorAvailable: false, status: "In Surgery", accountStatus: "Active", verified: "Yes" },
  ],
  pharmacyProducts: [
    { id: 1, name: "Paracetamol 650mg", brand: "Calpol", price: 28, mrp: 35, emoji: "💊", stock: "in-stock", requiresPrescription: false, isRx: false, category: "Tablet" },
    { id: 2, name: "Amoxicillin 500mg", brand: "Novamox", price: 145, mrp: 185, emoji: "💉", stock: "in-stock", requiresPrescription: true, isRx: true, category: "Capsule" },
    { id: 3, name: "Vitamin C 1000mg", brand: "Limcee", price: 62, mrp: 80, emoji: "🍊", stock: "low-stock", requiresPrescription: false, isRx: false, category: "Supplement" },
    { id: 4, name: "Azithromycin 500mg", brand: "Zithromax", price: 210, mrp: 265, emoji: "🔬", stock: "in-stock", requiresPrescription: true, isRx: true, category: "Tablet" },
    { id: 5, name: "Omeprazole 20mg", brand: "Omez", price: 55, mrp: 68, emoji: "🌿", stock: "low-stock", requiresPrescription: false, isRx: false, category: "Capsule" },
    { id: 6, name: "Cetirizine 10mg", brand: "Zyrtec", price: 38, mrp: 50, emoji: "🌸", stock: "out-of-stock", requiresPrescription: false, isRx: false, category: "Tablet" },
    { id: 7, name: "Metformin 500mg", brand: "Glycomet", price: 35, mrp: 45, emoji: "⚡", stock: "in-stock", requiresPrescription: true, isRx: true, category: "Tablet" },
    { id: 8, name: "D3 Vitamin 60K", brand: "Calcirol", price: 90, mrp: 120, emoji: "☀️", stock: "in-stock", requiresPrescription: false, isRx: false, category: "Supplement" },
  ],
  feedbacks: [
    { appointmentId: "MC-CON-104", rating: 5, comment: "Great consultation!", submittedAt: "2026-08-28" }
  ],
  prescriptions: [
    {
      id: "MC-CON-101",
      patientName: "John Doe",
      patientId: "#PT-20041",
      doctorName: "Dr. Ayisha Shalba",
      specialization: "Cardiology",
      hospital: "City Care Hospital",
      date: "18 Jul 2026",
      diagnosis: "Mild Hypertension & Stress",
      medicines: [
        { name: "Amoxicillin 500mg", dosage: "1-0-1", duration: "5 Days", instruction: "After Food" },
        { name: "Paracetamol 650mg", dosage: "1-0-0", duration: "As needed", instruction: "For fever/headache" }
      ]
    }
  ]
};

/* ── 8. PRESCRIPTION OCR & EXTRACTION ENDPOINT ─────────────── */
app.post("/api/pharmacy/process-prescription", (req, res) => {
  const { fileName, fileType } = req.body || {};

  const prescriptionId = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Extracted prescribed medicines list
  const extractedList = [
    { rawName: "Amoxicillin 500mg", dosage: "500mg", quantity: 10, instruction: "Take 1 capsule twice daily after food" },
    { rawName: "Paracetamol 650mg", dosage: "650mg", quantity: 10, instruction: "Take 1 tablet as needed for fever" },
    { rawName: "Azithromycin 500mg", dosage: "500mg", quantity: 5, instruction: "Take 1 tablet daily for 5 days" },
    { rawName: "Ciprofloxacin 500mg", dosage: "500mg", quantity: 10, instruction: "Take 1 tablet every 12 hours" }, // Unmatched sample
  ];

  // Match extracted medicines against DB catalog
  const matchedMedicines = extractedList.map((item) => {
    const matchedProduct = db.pharmacyProducts.find(
      (p) => p.name.toLowerCase().includes(item.rawName.split(" ")[0].toLowerCase())
    );

    if (matchedProduct) {
      return {
        name: matchedProduct.name,
        dosage: item.dosage,
        quantity: item.quantity,
        instruction: item.instruction,
        requiresPrescription: matchedProduct.requiresPrescription,
        matched: true,
        product: matchedProduct,
      };
    }

    return {
      name: item.rawName,
      dosage: item.dosage,
      quantity: item.quantity,
      instruction: item.instruction,
      requiresPrescription: true,
      matched: false,
      product: null,
      statusMessage: "Not available in our pharmacy",
    };
  });

  res.json({
    success: true,
    prescriptionId,
    fileName: fileName || "Prescription_Document.pdf",
    prescriptionDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    doctorName: "Dr. Suresh Nair",
    clinicName: "MedicoBridge Digital Clinic",
    medicines: matchedMedicines,
    message: "Prescription processed successfully. Extracted medicines matched with pharmacy catalog.",
  });
});

/* ── 9. APPOINTMENT FEEDBACK ENDPOINTS ─────────────────────── */
app.post("/api/feedback", (req, res) => {
  const { appointmentId, rating, comment } = req.body;
  if (!appointmentId) {
    return res.status(400).json({ error: "Appointment ID is required" });
  }

  const existing = db.feedbacks.find((f) => f.appointmentId === appointmentId);
  if (existing) {
    return res.json({ success: true, message: "Feedback already submitted for this appointment", feedback: existing });
  }

  const newFeedback = {
    appointmentId,
    rating: rating || 5,
    comment: comment || "",
    submittedAt: new Date().toISOString(),
  };

  db.feedbacks.push(newFeedback);
  res.json({ success: true, message: "Feedback submitted successfully", feedback: newFeedback });
});

app.get("/api/patient/feedback", (req, res) => {
  res.json({ success: true, count: db.feedbacks.length, data: db.feedbacks });
});

/* ── 10. PRESCRIPTIONS ENDPOINT ────────────────────────────── */
app.get("/api/prescriptions/:id", (req, res) => {
  const prescription = db.prescriptions.find((p) => p.id === req.params.id) || db.prescriptions[0];
  res.json({ success: true, data: prescription });
});

/* ── 7. LOCATION-AWARE BLOOD DONOR SEARCH ENDPOINT ─────────── */
app.get("/api/blood-donors/search", authorize(["Doctor", "Hospital", "Admin"]), (req, res) => {
  const { bloodGroup, originCity, location, search, userType } = req.query;

  // Resolve search location: prefer `location` param, fall back to `originCity`, default to Kozhikode
  const searchLocation = (location || originCity || "Kozhikode").trim();

  if (!bloodGroup || bloodGroup === "All" || bloodGroup === "All Blood Groups") {
    return res.json({ success: true, count: 0, data: [], searchLocation, message: "Please select a specific blood group for donor search." });
  }

  // Combine patients and doctors based on userType filter
  let pool = [];
  if (!userType || userType === "All" || userType === "Patients") {
    pool.push(...db.patients.map((p) => ({ ...p, role: "Patient" })));
  }
  if (!userType || userType === "All" || userType === "Doctors") {
    pool.push(...db.doctors.map((d) => ({ ...d, role: "Doctor" })));
  }

  // For Hospital role: restrict pool to this hospital's patients + doctors
  if (req.userRole === "Hospital") {
    const hospitalId = req.hospitalId;
    pool = pool.filter((u) => u.hospitalId === hospitalId);
  }

  // For Doctor role: restrict pool to patients belonging to this doctor + all doctors
  if (req.userRole === "Doctor") {
    const doctorId = req.userId;
    pool = pool.filter(
      (u) => u.role === "Doctor" || (u.doctorIds && u.doctorIds.includes(doctorId))
    );
  }

  // Mandatory Filter 1: Matching Blood Group
  let filtered = pool.filter((u) => u.bloodGroup === bloodGroup);

  // Mandatory Filter 2: Available Donors ONLY — unavailable donors are NEVER shown
  filtered = filtered.filter((u) => u.isDonorAvailable === true);

  // Optional name/ID search filter
  if (search) {
    const s = search.toLowerCase().trim();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.id.toLowerCase().includes(s) ||
        (u.city && u.city.toLowerCase().includes(s))
    );
  }

  // Return searchLocation so the frontend knows which origin city to use for sorting
  res.json({ success: true, count: filtered.length, searchLocation, bloodGroup, data: filtered });
});

app.listen(PORT, () => {
  console.log(`MedicoBridge Backend API running on port ${PORT}`);
});

module.exports = app;

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
  return res.status(404).json({
    error: "Doctor record not found"
  });
});

/* ── 7. LOCATION-AWARE BLOOD DONOR SEARCH ENDPOINT ─────────── */
app.get("/api/blood-donors/search", authorize(["Doctor", "Hospital", "Admin"]), (req, res) => {
  const { bloodGroup, originCity, location, search, userType } = req.query;

  // Resolve search location: prefer `location` param, fall back to `originCity`, default to Kozhikode
  const searchLocation = (location || originCity || "Kozhikode").trim();

  if (!bloodGroup || bloodGroup === "All" || bloodGroup === "All Blood Groups") {
    return res.json({ success: true, count: 0, data: [], searchLocation, message: "Please select a specific blood group for donor search." });
  }

  // Combine patients and doctors based on userType filter
  let pool = [];
  if (!userType || userType === "All" || userType === "Patients") {
    pool.push(...db.patients.map((p) => ({ ...p, role: "Patient" })));
  }
  if (!userType || userType === "All" || userType === "Doctors") {
    pool.push(...db.doctors.map((d) => ({ ...d, role: "Doctor" })));
  }

  // For Hospital role: restrict pool to this hospital's patients + doctors
  if (req.userRole === "Hospital") {
    const hospitalId = req.hospitalId;
    pool = pool.filter((u) => u.hospitalId === hospitalId);
  }

  // For Doctor role: restrict pool to patients belonging to this doctor + all doctors
  if (req.userRole === "Doctor") {
    const doctorId = req.userId;
    pool = pool.filter(
      (u) => u.role === "Doctor" || (u.doctorIds && u.doctorIds.includes(doctorId))
    );
  }

  // Mandatory Filter 1: Matching Blood Group
  let filtered = pool.filter((u) => u.bloodGroup === bloodGroup);

  // Mandatory Filter 2: Available Donors ONLY — unavailable donors are NEVER shown
  filtered = filtered.filter((u) => u.isDonorAvailable === true);

  // Optional name/ID search filter
  if (search) {
    const s = search.toLowerCase().trim();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.id.toLowerCase().includes(s) ||
        (u.city && u.city.toLowerCase().includes(s))
    );
  }

  // Note: proximity sorting is done on the frontend using locationProximity.js
  // Return searchLocation so the frontend knows which origin city to use for sorting
  res.json({ success: true, count: filtered.length, searchLocation, bloodGroup, data: filtered });
});

/* ── 11. PATIENT MEDICAL RECORDS ENDPOINT ─────────────────── */
const patientMedicalRecordsMap = {
  "PT-1024": {
    patientId: "PT-1024",
    patientName: "Rahul Nair",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    medicalConditions: ["Type 2 Diabetes Mellitus", "Mild Hypertension"],
    allergies: ["Penicillin", "Dust"],
    consultations: [
      {
        id: "CON-7821",
        date: "28 June 2026",
        doctor: "Dr. Ayisha Shalba",
        specialization: "General Medicine / Diabetology",
        hospital: "Apollo Hospital, Kochi",
        diagnosis: "Type 2 Diabetes Mellitus (Routine Review)",
        symptoms: "Mild fatigue, polyuria",
        treatment: "Metformin 500mg, dietary counseling, moderate physical activity 30 mins/day",
        notes: "HbA1c stable at 6.8%. Fasting glucose under fair control. Advised repeat renal function test in 3 months.",
      },
      {
        id: "CON-7104",
        date: "10 March 2026",
        doctor: "Dr. Rajesh K. Nair",
        specialization: "Cardiology",
        hospital: "Apollo Hospital, Kochi",
        diagnosis: "Mild Essential Hypertension",
        symptoms: "Occasional morning headaches, recorded BP 142/90 mmHg",
        treatment: "Amlodipine 5mg once daily after breakfast",
        notes: "Started on low-dose calcium channel blocker. Monitor daily home BP log.",
      },
    ],
    prescriptions: [
      {
        id: "RX-4521",
        date: "28 June 2026",
        doctor: "Dr. Ayisha Shalba",
        hospital: "Apollo Hospital, Kochi",
        diagnosis: "Type 2 Diabetes & Mild Hypertension",
        medicines: [
          { name: "Metformin 500mg", dosage: "1-0-1", duration: "90 Days", instructions: "After Food" },
          { name: "Amlodipine 5mg", dosage: "1-0-0", duration: "90 Days", instructions: "Morning after breakfast" },
        ],
        notes: "Review with fasting blood glucose after 3 months.",
      },
      {
        id: "RX-4189",
        date: "10 March 2026",
        doctor: "Dr. Rajesh K. Nair",
        hospital: "Apollo Hospital, Kochi",
        diagnosis: "Hypertension Management",
        medicines: [
          { name: "Amlodipine 5mg", dosage: "1-0-0", duration: "90 Days", instructions: "After Food" },
          { name: "Aspirin 75mg", dosage: "0-0-1", duration: "90 Days", instructions: "Night after dinner" },
        ],
        notes: "Reduce sodium intake (< 2g/day).",
      },
    ],
    labReports: [
      {
        id: "LAB-8021",
        test: "HbA1c & Fasting Blood Sugar Profile",
        date: "25 June 2026",
        hospital: "Apollo Diagnostic Labs, Kochi",
        orderedBy: "Dr. Ayisha Shalba",
        referenceId: "LAB-APL-2026-0812",
        results: [
          { parameter: "HbA1c (Glycated Hemoglobin)", value: "6.8%", normalRange: "4.0 - 5.6%", flag: "Borderline" },
          { parameter: "Fasting Blood Glucose", value: "118 mg/dL", normalRange: "70 - 100 mg/dL", flag: "High" },
          { parameter: "Post-Prandial Glucose", value: "152 mg/dL", normalRange: "< 140 mg/dL", flag: "Elevated" },
        ],
      },
      {
        id: "LAB-7419",
        test: "Lipid Profile & Renal Function Test",
        date: "08 March 2026",
        hospital: "Apollo Diagnostic Labs, Kochi",
        orderedBy: "Dr. Rajesh K. Nair",
        referenceId: "LAB-APL-2026-0391",
        results: [
          { parameter: "Total Cholesterol", value: "185 mg/dL", normalRange: "< 200 mg/dL", flag: "Normal" },
          { parameter: "Serum Triglycerides", value: "142 mg/dL", normalRange: "< 150 mg/dL", flag: "Normal" },
          { parameter: "Serum Creatinine", value: "0.9 mg/dL", normalRange: "0.7 - 1.3 mg/dL", flag: "Normal" },
          { parameter: "eGFR", value: "98 mL/min", normalRange: "> 90 mL/min", flag: "Normal" },
        ],
      },
    ],
    documents: [
      {
        id: "DOC-5102",
        title: "ECG 12-Lead Examination Report",
        date: "15 June 2026",
        hospital: "Apollo Hospital, Kochi",
        uploadedBy: "Dr. Rajesh K. Nair",
        type: "ECG",
        fileSize: "1.4 MB",
        description: "Normal sinus rhythm, heart rate 74 bpm. Normal axis, no ischemic ST-T abnormalities or arrhythmia detected.",
      },
      {
        id: "DOC-4890",
        title: "Chest X-Ray (PA View)",
        date: "10 March 2026",
        hospital: "Apollo Hospital, Kochi",
        uploadedBy: "Dr. Rajesh K. Nair",
        type: "X-Ray",
        fileSize: "2.1 MB",
        description: "Clear lung fields bilaterally. Normal cardiothoracic ratio. No active pulmonary parenchymal lesions.",
      },
    ],
  },
  "PT-1031": {
    patientId: "PT-1031",
    patientName: "Anjali Thomas",
    age: 27,
    gender: "Female",
    bloodGroup: "B+",
    medicalConditions: ["Chronic Migraine"],
    allergies: ["Sulfa drugs"],
    consultations: [
      {
        id: "CON-6612",
        date: "12 June 2026",
        doctor: "Dr. Rajesh K. Nair",
        specialization: "Neurology",
        hospital: "Aster Clinic, Kochi",
        diagnosis: "Chronic Migraine with Aura",
        symptoms: "Unilateral pulsating headache, visual aura, photophobia and nausea",
        treatment: "Sumatriptan for acute episodes, Propranolol prophylaxis, lifestyle trigger avoidance",
        notes: "Advised to maintain a headache trigger journal. Avoid skipping meals and bright flickering lights.",
      },
    ],
    prescriptions: [
      {
        id: "RX-4482",
        date: "12 June 2026",
        doctor: "Dr. Rajesh K. Nair",
        hospital: "Aster Clinic, Kochi",
        diagnosis: "Chronic Migraine Episodes",
        medicines: [
          { name: "Sumatriptan 50mg", dosage: "1 tab at onset", duration: "10 Days", instructions: "Take at start of migraine aura" },
          { name: "Naproxen 500mg", dosage: "1-0-1 as needed", duration: "5 Days", instructions: "After food for pain" },
        ],
        notes: "Do not exceed 2 Sumatriptan tablets within 24 hours.",
      },
    ],
    labReports: [
      {
        id: "LAB-6190",
        test: "Complete Blood Count & ESR",
        date: "10 June 2026",
        hospital: "Aster Diagnostic Lab, Kochi",
        orderedBy: "Dr. Rajesh K. Nair",
        referenceId: "LAB-AST-2026-0419",
        results: [
          { parameter: "Hemoglobin", value: "12.8 g/dL", normalRange: "12.0 - 15.5 g/dL", flag: "Normal" },
          { parameter: "Total Leukocyte Count", value: "6,900 /μL", normalRange: "4,000 - 11,000 /μL", flag: "Normal" },
          { parameter: "ESR", value: "12 mm/hr", normalRange: "0 - 20 mm/hr", flag: "Normal" },
        ],
      },
    ],
    documents: [
      {
        id: "DOC-4109",
        title: "Brain MRI Scan Report with Contrast",
        date: "05 June 2026",
        hospital: "Aster Clinic, Kochi",
        uploadedBy: "Dr. Rajesh K. Nair",
        type: "MRI",
        fileSize: "16.8 MB",
        description: "Normal MRI Brain scan. No structural lesions, mass effect, or intracranial hemorrhage. Normal ventricular system.",
      },
    ],
  },
  "PT-1018": {
    patientId: "PT-1018",
    patientName: "Arun Kumar",
    age: 41,
    gender: "Male",
    bloodGroup: "B+",
    medicalConditions: ["Stage 1 Hypertension"],
    allergies: [],
    consultations: [
      {
        id: "CON-5501",
        date: "10 July 2026",
        doctor: "Dr. Ayisha Shalba",
        specialization: "Cardiology",
        hospital: "City Care Hospital, Kozhikode",
        diagnosis: "Stage 1 Essential Hypertension",
        symptoms: "Dizziness, occasional chest tightness during stress",
        treatment: "Telmisartan 40mg once daily, brisk walking 45 mins",
        notes: "Cardiovascular examination normal. ECG showed sinus rhythm. Follow-up after 1 month.",
      },
    ],
    prescriptions: [
      {
        id: "RX-4690",
        date: "10 July 2026",
        doctor: "Dr. Ayisha Shalba",
        hospital: "City Care Hospital, Kozhikode",
        diagnosis: "Essential Hypertension",
        medicines: [
          { name: "Telmisartan 40mg", dosage: "1-0-0", duration: "30 Days", instructions: "Morning after breakfast" },
        ],
        notes: "Record BP twice weekly in the morning.",
      },
    ],
    labReports: [
      {
        id: "LAB-5100",
        test: "Renal Function & Serum Electrolytes",
        date: "08 July 2026",
        hospital: "City Care Diagnostic Center",
        orderedBy: "Dr. Ayisha Shalba",
        referenceId: "LAB-CCD-2026-0922",
        results: [
          { parameter: "Blood Urea", value: "24 mg/dL", normalRange: "15 - 45 mg/dL", flag: "Normal" },
          { parameter: "Serum Creatinine", value: "1.0 mg/dL", normalRange: "0.7 - 1.3 mg/dL", flag: "Normal" },
          { parameter: "Serum Potassium", value: "4.2 mEq/L", normalRange: "3.5 - 5.0 mEq/L", flag: "Normal" },
        ],
      },
    ],
    documents: [],
  },
  "PT-1045": {
    patientId: "PT-1045",
    patientName: "Meera Pillai",
    age: 35,
    gender: "Female",
    bloodGroup: "O+",
    medicalConditions: ["Hypothyroidism"],
    allergies: [],
    consultations: [
      {
        id: "CON-4209",
        date: "15 June 2026",
        doctor: "Dr. Priya Thomas",
        specialization: "Endocrinology",
        hospital: "AIIMS Hospital, Kochi",
        diagnosis: "Primary Hypothyroidism",
        symptoms: "Fatigue, mild unexplained weight gain, dry skin",
        treatment: "Levothyroxine Sodium 50mcg empty stomach early morning",
        notes: "TSH elevated at 5.8 mIU/L. Repeat thyroid profile in 8 weeks.",
      },
    ],
    prescriptions: [
      {
        id: "RX-3912",
        date: "15 June 2026",
        doctor: "Dr. Priya Thomas",
        hospital: "AIIMS Hospital, Kochi",
        diagnosis: "Primary Hypothyroidism",
        medicines: [
          { name: "Levothyroxine 50mcg", dosage: "1-0-0", duration: "60 Days", instructions: "Empty stomach with plain water" },
        ],
        notes: "Wait 30-45 minutes before having breakfast or tea.",
      },
    ],
    labReports: [
      {
        id: "LAB-4019",
        test: "Thyroid Function Test (Total T3, Total T4, TSH)",
        date: "12 June 2026",
        hospital: "AIIMS Central Diagnostic Lab",
        orderedBy: "Dr. Priya Thomas",
        referenceId: "LAB-AIM-2026-0744",
        results: [
          { parameter: "TSH (Ultrasensitive)", value: "5.8 mIU/L", normalRange: "0.4 - 4.2 mIU/L", flag: "High" },
          { parameter: "Total T4", value: "7.1 μg/dL", normalRange: "4.8 - 11.6 μg/dL", flag: "Normal" },
          { parameter: "Total T3", value: "110 ng/dL", normalRange: "80 - 200 ng/dL", flag: "Normal" },
        ],
      },
    ],
    documents: [],
  },
};

app.get("/api/patients/:id/medical-records", (req, res) => {
  const patientId = req.params.id;
  const records = patientMedicalRecordsMap[patientId];
  if (!records) {
    return res.json({
      success: true,
      patientId,
      records: null,
      message: "No previous medical history available.",
    });
  }
  res.json({
    success: true,
    patientId,
    records,
  });
});

app.listen(PORT, () => {
  console.log(`MedicoBridge Backend API running on port ${PORT}`);
});

module.exports = app;

