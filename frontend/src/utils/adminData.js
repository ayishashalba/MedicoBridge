/**
 * MedicoBridge Unified Admin Data Store & Synchronization Service
 * 
 * Provides centralized storage and state management for Platform Supervision & Governance:
 * - Medicine Verification & Drug Safety (Batch, manufacturer, expiry, approval status, ban/block flags)
 * - Platform Coupons & Promo Codes (Full CRUD with real-time checkout sync)
 * - Appointments & Consultations Supervision (Time-based status auto-evaluation, room audits)
 * - Medical Records & EHR Compliance Registry
 * - Automated Regulatory & System Notifications
 */

import { AVAILABLE_COUPONS } from "./coupons";

// ── Pharmacy-Submitted Medicines Registry (Verification & Drug Safety) ──

export const initialMedicines = [
  {
    id: "MED-101",
    name: "Paracetamol 650mg",
    brand: "Calpol",
    genericName: "Paracetamol IP 650mg",
    category: "Tablet",
    batchNumber: "BAT-2026-881",
    manufacturer: "GSK Pharmaceuticals Ltd.",
    manufacturerLicense: "MFG-MH-102914",
    submittingPharmacy: "MedPlus Central Pharmacy",
    pharmacyType: "Retail Pharmacy",
    pharmacyCity: "Kozhikode",
    price: 28,
    mrp: 35,
    requiresPrescription: false,
    expiryDate: "2027-12-31",
    approvalStatus: "Approved", // Approved, Pending Review, Rejected, Blocked
    labVerificationStatus: "Passed (NABL Lab Verified)",
    banReason: null,
    submittedDate: "2026-08-10",
    reviewedDate: "2026-08-11",
    emoji: "💊",
  },
  {
    id: "MED-102",
    name: "Amoxicillin 500mg",
    brand: "Novamox",
    genericName: "Amoxicillin Trihydrate 500mg",
    category: "Capsule",
    batchNumber: "BAT-2026-452",
    manufacturer: "Cipla Healthcare India",
    manufacturerLicense: "MFG-KA-481902",
    submittingPharmacy: "Apollo Pharmacy, Kochi",
    pharmacyType: "Hospital Pharmacy",
    pharmacyCity: "Kochi",
    price: 145,
    mrp: 185,
    requiresPrescription: true,
    expiryDate: "2027-08-15",
    approvalStatus: "Approved",
    labVerificationStatus: "Passed (NABL Lab Verified)",
    banReason: null,
    submittedDate: "2026-08-12",
    reviewedDate: "2026-08-13",
    emoji: "💉",
  },
  {
    id: "MED-103",
    name: "Vitamin C 1000mg",
    brand: "Limcee",
    genericName: "Ascorbic Acid IP 1000mg",
    category: "Supplement",
    batchNumber: "BAT-2026-109",
    manufacturer: "Abbott India Ltd.",
    manufacturerLicense: "MFG-MH-771204",
    submittingPharmacy: "MedPlus Central Pharmacy",
    pharmacyType: "Retail Pharmacy",
    pharmacyCity: "Kozhikode",
    price: 62,
    mrp: 80,
    requiresPrescription: false,
    expiryDate: "2026-11-30",
    approvalStatus: "Approved",
    labVerificationStatus: "Passed (Standard Assay)",
    banReason: null,
    submittedDate: "2026-08-05",
    reviewedDate: "2026-08-06",
    emoji: "🍊",
  },
  {
    id: "MED-104",
    name: "Azithromycin 500mg",
    brand: "Zithromax",
    genericName: "Azithromycin Dihydrate 500mg",
    category: "Tablet",
    batchNumber: "BAT-2026-904",
    manufacturer: "Pfizer India",
    manufacturerLicense: "MFG-DL-552019",
    submittingPharmacy: "Aster Medcity Pharmacy",
    pharmacyType: "Hospital Pharmacy",
    pharmacyCity: "Kochi",
    price: 210,
    mrp: 265,
    requiresPrescription: true,
    expiryDate: "2028-01-20",
    approvalStatus: "Approved",
    labVerificationStatus: "Passed (GMP Certified)",
    banReason: null,
    submittedDate: "2026-08-18",
    reviewedDate: "2026-08-19",
    emoji: "🔬",
  },
  {
    id: "MED-105",
    name: "Omeprazole 20mg",
    brand: "Omez",
    genericName: "Omeprazole Magnesium 20mg",
    category: "Capsule",
    batchNumber: "BAT-2026-218",
    manufacturer: "Dr. Reddy's Laboratories",
    manufacturerLicense: "MFG-TG-994012",
    submittingPharmacy: "MedPlus Central Pharmacy",
    pharmacyType: "Retail Pharmacy",
    pharmacyCity: "Kozhikode",
    price: 55,
    mrp: 68,
    requiresPrescription: false,
    expiryDate: "2026-10-15",
    approvalStatus: "Approved",
    labVerificationStatus: "Passed",
    banReason: null,
    submittedDate: "2026-08-15",
    reviewedDate: "2026-08-16",
    emoji: "🌿",
  },
  {
    id: "MED-106",
    name: "Dextromethorphan Cold Syrup 100ml",
    brand: "DexaCough",
    genericName: "Dextromethorphan HBr + Chlorpheniramine",
    category: "Syrup",
    batchNumber: "BAT-DX-4401",
    manufacturer: "Unverified Local Pharma Co.",
    manufacturerLicense: "PENDING-VERIFICATION",
    submittingPharmacy: "Kozhikode Local Chemist",
    pharmacyType: "Retail Pharmacy",
    pharmacyCity: "Kozhikode",
    price: 85,
    mrp: 110,
    requiresPrescription: false,
    expiryDate: "2026-09-10",
    approvalStatus: "Pending Review",
    labVerificationStatus: "Awaiting Lab Certificate Upload",
    banReason: null,
    submittedDate: "2026-08-29",
    reviewedDate: null,
    emoji: "🧪",
  },
  {
    id: "MED-107",
    name: "Ketorolac Tromethamine 10mg",
    brand: "KetoFast",
    genericName: "Ketorolac Tromethamine 10mg",
    category: "Tablet",
    batchNumber: "BAT-KT-9012",
    manufacturer: "Apex Formulations (Suspended)",
    manufacturerLicense: "MFG-REVOKED-0812",
    submittingPharmacy: "Metro Express Chemist",
    pharmacyType: "Retail Pharmacy",
    pharmacyCity: "Malappuram",
    price: 95,
    mrp: 130,
    requiresPrescription: true,
    expiryDate: "2027-02-14",
    approvalStatus: "Blocked",
    labVerificationStatus: "Failed (Substandard Assay / State Ban Alert)",
    banReason: "Drug Controller General Alert: Batch failed potency dissolution test & state-blocked.",
    submittedDate: "2026-08-20",
    reviewedDate: "2026-08-21",
    emoji: "⚠️",
  },
  {
    id: "MED-108",
    name: "Nimesulide 100mg Dispersible",
    brand: "Nimulid Forte",
    genericName: "Nimesulide 100mg",
    category: "Tablet",
    batchNumber: "BAT-NIM-6610",
    manufacturer: "Global Health Pharma",
    manufacturerLicense: "MFG-PB-119203",
    submittingPharmacy: "Apollo Pharmacy, Kochi",
    pharmacyType: "Hospital Pharmacy",
    pharmacyCity: "Kochi",
    price: 45,
    mrp: 60,
    requiresPrescription: true,
    expiryDate: "2027-04-18",
    approvalStatus: "Rejected",
    labVerificationStatus: "Pediatric ban advisory flagged",
    banReason: "Rejected due to missing age-restriction warning label required under central guidelines.",
    submittedDate: "2026-08-22",
    reviewedDate: "2026-08-24",
    emoji: "🚫",
  }
];

export const initialAppointments = [
  {
    id: "APT-2026-01",
    patientName: "Rahul Nair",
    patientId: "PAT-106",
    patientPhone: "+91 98765 43210",
    doctorName: "Dr. Ayisha Shalba",
    doctorId: "DR-80241",
    specialization: "Cardiology",
    department: "Cardiology",
    hospital: "City Care Hospital",
    type: "Video Consultation",
    date: "2026-08-31",
    timeSlot: "11:30 AM - 12:00 PM",
    startTime: "11:30",
    endTime: "12:00",
    fee: 600,
    paymentStatus: "Paid",
    status: "Ongoing",
    roomUrl: "https://meet.medicobridge.com/room/DR-80241-PAT-106",
    symptoms: "Mild chest tightness and palpitations after morning run",
    doctorNotes: "Review ECG and BP readings. Patient joined room.",
    prescriptionIssued: true,
    prescriptionId: "RX-4521",
  },
  {
    id: "APT-2026-02",
    patientName: "Sunita Rao",
    patientId: "PAT-102",
    patientPhone: "+91 87654 32109",
    doctorName: "Dr. Rajesh K. Nair",
    doctorId: "DR-80242",
    specialization: "Neurology",
    department: "Neurology",
    hospital: "Apollo Hospital, Kochi",
    type: "Video Consultation",
    date: "2026-08-31",
    timeSlot: "03:00 PM - 03:30 PM",
    startTime: "15:00",
    endTime: "15:30",
    fee: 750,
    paymentStatus: "Paid",
    status: "Upcoming",
    roomUrl: "https://meet.medicobridge.com/room/DR-80242-PAT-102",
    symptoms: "Frequent morning migraines and photophobia",
    doctorNotes: "Review previous MRI Brain scan results.",
    prescriptionIssued: false,
    prescriptionId: null,
  },
  {
    id: "APT-2026-03",
    patientName: "Aarav Sharma",
    patientId: "PAT-101",
    patientPhone: "+91 98765 43210",
    doctorName: "Dr. Susan George",
    doctorId: "DR-80244",
    specialization: "Orthopedics",
    department: "Orthopedics",
    hospital: "City Care Hospital",
    type: "In-Clinic Visit",
    date: "2026-08-30",
    timeSlot: "10:00 AM - 10:30 AM",
    startTime: "10:00",
    endTime: "10:30",
    fee: 500,
    paymentStatus: "Paid",
    status: "Completed",
    roomUrl: "N/A (Physical OPD Cabin 4)",
    symptoms: "Right knee pain post cycling injury",
    doctorNotes: "Grade 1 MCL sprain diagnosed. Advised physiotherapy for 2 weeks.",
    prescriptionIssued: true,
    prescriptionId: "RX-4189",
  },
  {
    id: "APT-2026-04",
    patientName: "Lakshmi Nair",
    patientId: "PAT-104",
    patientPhone: "+91 65432 10987",
    doctorName: "Dr. Priya Thomas",
    doctorId: "DR-80243",
    specialization: "Pediatrics & Endocrinology",
    department: "Endocrinology",
    hospital: "AIIMS Hospital, Kochi",
    type: "Video Consultation",
    date: "2026-08-28",
    timeSlot: "02:00 PM - 02:30 PM",
    startTime: "14:00",
    endTime: "14:30",
    fee: 550,
    paymentStatus: "Paid",
    status: "Completed",
    roomUrl: "https://meet.medicobridge.com/room/DR-80243-PAT-104",
    symptoms: "Thyroid follow-up and TSH review",
    doctorNotes: "TSH improved to 3.2. Maintain current Levothyroxine 50mcg dose.",
    prescriptionIssued: true,
    prescriptionId: "RX-3912",
  }
];

export const initialMedicalRecords = [
  {
    id: "EHR-2026-101",
    patientId: "PAT-106",
    patientName: "Rahul Nair",
    age: 32,
    gender: "Male",
    bloodGroup: "B+",
    recordType: "Consultation Summary",
    doctorName: "Dr. Ayisha Shalba",
    specialization: "Cardiology & Diabetology",
    facility: "Apollo Hospital, Kochi",
    date: "28 Jun 2026",
    diagnosis: "Type 2 Diabetes Mellitus & Mild Hypertension",
    symptoms: "Mild fatigue, polyuria, occasional morning headaches",
    vitals: { bp: "138/88 mmHg", pulse: "74 bpm", spo2: "99%", temp: "98.4°F", weight: "72 kg" },
    treatmentPlan: "Metformin 500mg, dietary counseling, moderate aerobic exercise 30 mins/day",
    prescriptions: [
      { name: "Metformin 500mg", dosage: "1-0-1", duration: "90 Days", instructions: "After Food" },
      { name: "Amlodipine 5mg", dosage: "1-0-0", duration: "90 Days", instructions: "Morning after breakfast" }
    ],
    labFindings: "HbA1c at 6.8%. Fasting glucose 118 mg/dL.",
    notes: "Review with fasting lipid profile in 3 months.",
    status: "Verified & Locked"
  },
  {
    id: "EHR-2026-102",
    patientId: "PAT-102",
    patientName: "Sunita Rao",
    age: 27,
    gender: "Female",
    bloodGroup: "A+",
    recordType: "Consultation Summary",
    doctorName: "Dr. Rajesh K. Nair",
    specialization: "Neurology",
    facility: "Aster Medcity, Kochi",
    date: "12 Jun 2026",
    diagnosis: "Chronic Migraine with Visual Aura",
    symptoms: "Unilateral pulsating headache, photophobia and nausea",
    vitals: { bp: "118/76 mmHg", pulse: "70 bpm", spo2: "98%", temp: "98.6°F", weight: "58 kg" },
    treatmentPlan: "Sumatriptan for acute episodes, Propranolol prophylaxis, sleep hygiene routine",
    prescriptions: [
      { name: "Sumatriptan 50mg", dosage: "1 tab at onset", duration: "10 Days", instructions: "Take at start of migraine aura" },
      { name: "Naproxen 500mg", dosage: "1-0-1 as needed", duration: "5 Days", instructions: "After food for pain" }
    ],
    labFindings: "Brain MRI Scan Report shows normal cerebral parenchyma.",
    notes: "Maintain headache trigger journal. Avoid skipping meals.",
    status: "Verified & Locked"
  }
];

// ── Storage Keys & Initializer ──────────────────────────────────────

const STORAGE_KEYS = {
  MEDICINES: "mb_admin_verified_medicines",
  COUPONS: "adminCoupons",
  APPOINTMENTS: "mb_admin_appointments",
  MEDICAL_RECORDS: "mb_admin_medical_records",
};

export function getStoredMedicines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading medicines from storage", e);
  }
  return initialMedicines;
}

export function saveMedicines(medicines) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  } catch (e) {
    console.error("Failed saving medicines", e);
  }
}

export function getStoredCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading coupons from storage", e);
  }
  return AVAILABLE_COUPONS.map((c, i) => ({
    ...c,
    id: `CPN-${101 + i}`,
    status: "Active",
    usageCount: 18 + (i * 7),
    totalSavingsGranted: 2400 + (i * 850),
    expiryDate: "2027-12-31",
  }));
}

export function saveCoupons(coupons) {
  try {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  } catch (e) {
    console.error("Failed saving coupons", e);
  }
}

export function getStoredAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading appointments from storage", e);
  }
  return initialAppointments;
}

export function saveAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.error("Failed saving appointments", e);
  }
}

export function getStoredMedicalRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading medical records from storage", e);
  }
  return initialMedicalRecords;
}

export function saveMedicalRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error("Failed saving medical records", e);
  }
}

// ── Time-based Appointment Status Evaluator ─────────────────────────

export function computeAppointmentStatus(apt) {
  if (apt.status === "Cancelled") return "Cancelled";
  if (apt.status === "Completed") return "Completed";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const aptDate = apt.date;

  if (aptDate < todayStr) {
    return "Completed";
  } else if (aptDate > todayStr) {
    return "Upcoming";
  } else {
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    if (apt.startTime && apt.endTime) {
      const [sh, sm] = apt.startTime.split(":").map(Number);
      const [eh, em] = apt.endTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      if (currentTotalMinutes >= startMin - 15 && currentTotalMinutes <= endMin + 15) {
        return "Ongoing";
      } else if (currentTotalMinutes < startMin) {
        return "Upcoming";
      } else {
        return "Completed";
      }
    }

    return apt.status || "Upcoming";
  }
}

// ── Automated Regulatory & Platform System Alerts ───────────────────

export function generateAutomatedSystemAlerts() {
  const alerts = [];
  const medicines = getStoredMedicines();
  const appointments = getStoredAppointments();

  // 1. Check Pending Medicine Verifications
  const pendingMeds = medicines.filter((m) => m.approvalStatus === "Pending Review");
  pendingMeds.forEach((m) => {
    alerts.push({
      id: `REG-MED-${m.id}`,
      type: "Warning",
      category: "Drug Regulatory Review",
      title: `Medicine Awaiting Verification: ${m.name}`,
      message: `Submitted by ${m.submittingPharmacy} (Batch ${m.batchNumber}). Verify manufacturer license and lab assay certificate before approving for platform listing.`,
      time: "Regulatory Queue",
      actionLink: "/admin/pharmacy",
      isRead: false,
    });
  });

  // 2. Check Blocked / Banned Drugs
  const blockedMeds = medicines.filter((m) => m.approvalStatus === "Blocked");
  blockedMeds.forEach((m) => {
    alerts.push({
      id: `BAN-MED-${m.id}`,
      type: "Critical",
      category: "Drug Safety Enforcement",
      title: `Banned/Blocked Drug Alert: ${m.name}`,
      message: `${m.name} (${m.brand}) is blocked platform-wide. Reason: ${m.banReason || "Quality / Regulatory Ban"}`,
      time: "Drug Safety Alert",
      actionLink: "/admin/pharmacy",
      isRead: false,
    });
  });

  // 3. Check Active Appointments for Today
  const activeApts = appointments.filter((a) => {
    const st = computeAppointmentStatus(a);
    return st === "Ongoing" || st === "Upcoming";
  });
  if (activeApts.length > 0) {
    alerts.push({
      id: `SYS-APT-TODAY`,
      type: "Info",
      category: "Telehealth Compliance",
      title: `${activeApts.length} Digital Telehealth Consultations Scheduled Today`,
      message: `Platform telehealth gateway online. Live telemetry and audit log tracking active.`,
      time: "Telehealth Monitor",
      actionLink: "/admin/appointments",
      isRead: true,
    });
  }

  return alerts;
}
