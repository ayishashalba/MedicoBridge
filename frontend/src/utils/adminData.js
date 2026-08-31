/**
 * MedicoBridge Unified Admin Data Store & Synchronization Service
 * 
 * Provides centralized storage and state management for:
 * - Pharmacy & Medicines (Stock management, reorder thresholds, pricing, batches)
 * - Orders & Delivery Tracking (Statuses, delivery partners, timelines, milestones)
 * - Coupons & Promo Codes (Full CRUD with real-time checkout sync)
 * - Billing, Invoices & Payments (Balances, taxes, transactions, payment receipts)
 * - Appointments & Consultations (Time-based status auto-evaluation, rooms, audits)
 * - Medical Records (EHR records, diagnoses, prescriptions, lab results)
 * - Automatic Notifications & System Alerts
 */

import { AVAILABLE_COUPONS } from "./coupons";

// ── Initial Mock Datasets ──────────────────────────────────────────

export const initialMedicines = [
  {
    id: "MED-101",
    name: "Paracetamol 650mg",
    brand: "Calpol",
    category: "Tablet",
    batchNumber: "BAT-2026-881",
    stock: 140,
    minThreshold: 30,
    price: 28,
    mrp: 35,
    requiresPrescription: false,
    expiryDate: "2027-12-31",
    manufacturer: "GSK Pharmaceuticals",
    pharmacyName: "MedPlus Central Pharmacy",
    emoji: "💊",
    status: "in-stock", // computed helper: in-stock, low-stock, out-of-stock
  },
  {
    id: "MED-102",
    name: "Amoxicillin 500mg",
    brand: "Novamox",
    category: "Capsule",
    batchNumber: "BAT-2026-452",
    stock: 85,
    minThreshold: 25,
    price: 145,
    mrp: 185,
    requiresPrescription: true,
    expiryDate: "2027-08-15",
    manufacturer: "Cipla Healthcare",
    pharmacyName: "Apollo Pharmacy, Kochi",
    emoji: "💉",
    status: "in-stock",
  },
  {
    id: "MED-103",
    name: "Vitamin C 1000mg",
    brand: "Limcee",
    category: "Supplement",
    batchNumber: "BAT-2026-109",
    stock: 9,
    minThreshold: 20,
    price: 62,
    mrp: 80,
    requiresPrescription: false,
    expiryDate: "2026-11-30",
    manufacturer: "Abbott India",
    pharmacyName: "MedPlus Central Pharmacy",
    emoji: "🍊",
    status: "low-stock",
  },
  {
    id: "MED-104",
    name: "Azithromycin 500mg",
    brand: "Zithromax",
    category: "Tablet",
    batchNumber: "BAT-2026-904",
    stock: 64,
    minThreshold: 15,
    price: 210,
    mrp: 265,
    requiresPrescription: true,
    expiryDate: "2028-01-20",
    manufacturer: "Pfizer India",
    pharmacyName: "Aster Medcity Pharmacy",
    emoji: "🔬",
    status: "in-stock",
  },
  {
    id: "MED-105",
    name: "Omeprazole 20mg",
    brand: "Omez",
    category: "Capsule",
    batchNumber: "BAT-2026-218",
    stock: 6,
    minThreshold: 25,
    price: 55,
    mrp: 68,
    requiresPrescription: false,
    expiryDate: "2026-10-15",
    manufacturer: "Dr. Reddy's Laboratories",
    pharmacyName: "MedPlus Central Pharmacy",
    emoji: "🌿",
    status: "low-stock",
  },
  {
    id: "MED-106",
    name: "Cetirizine 10mg",
    brand: "Zyrtec",
    category: "Tablet",
    batchNumber: "BAT-2026-031",
    stock: 0,
    minThreshold: 20,
    price: 38,
    mrp: 50,
    requiresPrescription: false,
    expiryDate: "2027-05-10",
    manufacturer: "Sun Pharma",
    pharmacyName: "Apollo Pharmacy, Kochi",
    emoji: "🌸",
    status: "out-of-stock",
  },
  {
    id: "MED-107",
    name: "Metformin 500mg",
    brand: "Glycomet",
    category: "Tablet",
    batchNumber: "BAT-2026-772",
    stock: 120,
    minThreshold: 30,
    price: 35,
    mrp: 45,
    requiresPrescription: true,
    expiryDate: "2027-09-25",
    manufacturer: "USV Private Limited",
    pharmacyName: "MedPlus Central Pharmacy",
    emoji: "⚡",
    status: "in-stock",
  },
  {
    id: "MED-108",
    name: "D3 Vitamin 60K",
    brand: "Calcirol",
    category: "Supplement",
    batchNumber: "BAT-2026-339",
    stock: 45,
    minThreshold: 15,
    price: 90,
    mrp: 120,
    requiresPrescription: false,
    expiryDate: "2027-04-18",
    manufacturer: "Cadila Healthcare",
    pharmacyName: "Aster Medcity Pharmacy",
    emoji: "☀️",
    status: "in-stock",
  },
  {
    id: "MED-109",
    name: "Insulin Glargine 100IU/ml",
    brand: "Lantus",
    category: "Injection",
    batchNumber: "BAT-2026-614",
    stock: 4,
    minThreshold: 10,
    price: 680,
    mrp: 750,
    requiresPrescription: true,
    expiryDate: "2026-12-05",
    manufacturer: "Sanofi India",
    pharmacyName: "Apollo Pharmacy, Kochi",
    emoji: "💉",
    status: "low-stock",
  }
];

export const initialOrders = [
  {
    id: "MB20260001",
    customerName: "Rahul Nair",
    phone: "+91 98765 43210",
    email: "rahul@gmail.com",
    address: "Flat 4B, Silver Oak Heights, MG Road, Kozhikode - 673001",
    date: "2026-08-30",
    time: "14:30",
    orderType: "Home Delivery",
    items: [
      { name: "Paracetamol 650mg", quantity: 2, price: 28 },
      { name: "Amoxicillin 500mg", quantity: 1, price: 145 },
    ],
    subtotal: 201,
    discount: 20,
    deliveryFee: 40,
    total: 221,
    paymentMethod: "UPI (Google Pay)",
    paymentStatus: "Paid",
    status: "Out for Delivery",
    courierName: "MedicoExpress Courier",
    trackingId: "MEX-98120441",
    deliveryAgent: "Suresh Pillai",
    agentPhone: "+91 94471 28910",
    estimatedDelivery: "Today, by 4:00 PM",
    timeline: [
      { status: "Placed", time: "30 Aug 2026, 02:30 PM", completed: true, note: "Order placed by customer via MedicoBridge App" },
      { status: "Confirmed", time: "30 Aug 2026, 02:45 PM", completed: true, note: "Prescription verified & order confirmed by pharmacist" },
      { status: "Processing", time: "30 Aug 2026, 03:15 PM", completed: true, note: "Medicines packed in tamper-proof container" },
      { status: "Out for Delivery", time: "31 Aug 2026, 10:00 AM", completed: true, note: "Handed over to Suresh Pillai (MedicoExpress)" },
      { status: "Delivered", time: "Pending", completed: false, note: "Awaiting customer OTP confirmation" },
    ]
  },
  {
    id: "MB20260002",
    customerName: "Sunita Rao",
    phone: "+91 87654 32109",
    email: "sunita.rao@example.com",
    address: "Plot 12, Rose Villa, Malappuram - 676505",
    date: "2026-08-31",
    time: "09:15",
    orderType: "Home Delivery",
    items: [
      { name: "Vitamin C 1000mg", quantity: 1, price: 62 },
      { name: "D3 Vitamin 60K", quantity: 2, price: 90 },
    ],
    subtotal: 242,
    discount: 50,
    deliveryFee: 0,
    total: 192,
    paymentMethod: "Credit Card (HDFC)",
    paymentStatus: "Paid",
    status: "Processing",
    courierName: "BlueDart Express",
    trackingId: "BLD-7740192",
    deliveryAgent: "Arun Kumar",
    agentPhone: "+91 98460 11223",
    estimatedDelivery: "Tomorrow, 1 Sep 2026",
    timeline: [
      { status: "Placed", time: "31 Aug 2026, 09:15 AM", completed: true, note: "Order received online" },
      { status: "Confirmed", time: "31 Aug 2026, 09:30 AM", completed: true, note: "Inventory allocated from Apollo Pharmacy" },
      { status: "Processing", time: "31 Aug 2026, 10:45 AM", completed: true, note: "Packaging in progress at dispensary" },
      { status: "Out for Delivery", time: "Pending", completed: false, note: "Awaiting pickup" },
      { status: "Delivered", time: "Pending", completed: false, note: "Pending" },
    ]
  },
  {
    id: "MB20260003",
    customerName: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    address: "MedPlus Counter Pickup - Kozhikode Branch",
    date: "2026-08-29",
    time: "11:20",
    orderType: "Store Pickup",
    items: [
      { name: "Metformin 500mg", quantity: 3, price: 35 },
      { name: "Paracetamol 650mg", quantity: 2, price: 28 },
    ],
    subtotal: 161,
    discount: 0,
    deliveryFee: 0,
    total: 161,
    paymentMethod: "Cash on Pickup",
    paymentStatus: "Paid",
    status: "Delivered",
    courierName: "Store Pickup",
    trackingId: "PKP-KOZ-104",
    deliveryAgent: "Store Cashier",
    agentPhone: "+91 495 2728900",
    estimatedDelivery: "Collected on 29 Aug 2026",
    timeline: [
      { status: "Placed", time: "29 Aug 2026, 11:20 AM", completed: true, note: "Order placed for store pickup" },
      { status: "Confirmed", time: "29 Aug 2026, 11:25 AM", completed: true, note: "Confirmed by MedPlus staff" },
      { status: "Processing", time: "29 Aug 2026, 11:40 AM", completed: true, note: "Ready for pickup at counter" },
      { status: "Delivered", time: "29 Aug 2026, 01:15 PM", completed: true, note: "Collected by customer in person" },
    ]
  },
  {
    id: "MB20260004",
    customerName: "Lakshmi Nair",
    phone: "+91 65432 10987",
    email: "lakshmi.nair@example.com",
    address: "Skyline Oasis Apt 7C, Wayanad Road, Kozhikode - 673004",
    date: "2026-08-31",
    time: "10:50",
    orderType: "Home Delivery",
    items: [
      { name: "Azithromycin 500mg", quantity: 1, price: 210 },
      { name: "Omeprazole 20mg", quantity: 1, price: 55 },
    ],
    subtotal: 265,
    discount: 26,
    deliveryFee: 40,
    total: 279,
    paymentMethod: "NetBanking (SBI)",
    paymentStatus: "Paid",
    status: "Placed",
    courierName: "MedicoExpress Courier",
    trackingId: "MEX-99014112",
    deliveryAgent: "Pending Assignment",
    agentPhone: "N/A",
    estimatedDelivery: "1 Sep 2026, by 2:00 PM",
    timeline: [
      { status: "Placed", time: "31 Aug 2026, 10:50 AM", completed: true, note: "Order placed by patient. Prescription uploaded." },
      { status: "Confirmed", time: "Pending", completed: false, note: "Pending pharmacist review" },
      { status: "Processing", time: "Pending", completed: false, note: "Pending" },
      { status: "Out for Delivery", time: "Pending", completed: false, note: "Pending" },
      { status: "Delivered", time: "Pending", completed: false, note: "Pending" },
    ]
  },
  {
    id: "HORD-501",
    customerName: "City Care Hospital - ICU Dept",
    phone: "+91 495 2400100",
    email: "icu.procurement@citycare.org",
    address: "City Care Hospital, Ward 4 ICU Station, Kozhikode",
    date: "2026-08-30",
    time: "16:00",
    orderType: "Hospital Internal",
    items: [
      { name: "Insulin Glargine 100IU/ml", quantity: 15, price: 680 },
      { name: "Amoxicillin 500mg", quantity: 20, price: 145 },
    ],
    subtotal: 13100,
    discount: 650,
    deliveryFee: 0,
    total: 12450,
    paymentMethod: "Hospital Corporate Credit",
    paymentStatus: "Paid",
    status: "Delivered",
    courierName: "Internal Hospital Logistics",
    trackingId: "INT-HOSP-882",
    deliveryAgent: "Ramesh K. (Staff Runner)",
    agentPhone: "Ext 402",
    estimatedDelivery: "Delivered on 30 Aug 2026",
    timeline: [
      { status: "Placed", time: "30 Aug 2026, 04:00 PM", completed: true, note: "ICU requisition raised" },
      { status: "Confirmed", time: "30 Aug 2026, 04:10 PM", completed: true, note: "Approved by Pharmacy In-charge" },
      { status: "Processing", time: "30 Aug 2026, 04:25 PM", completed: true, note: "Dispatched from Central Pharmacy" },
      { status: "Delivered", time: "30 Aug 2026, 04:45 PM", completed: true, note: "Received and signed by ICU Head Nurse" },
    ]
  }
];

export const initialInvoices = [
  {
    id: "INV-2026-0901",
    clientName: "Dr. Ayisha Shalba",
    clientType: "Doctor",
    clientEmail: "ayisha.shalba@medicobridge.com",
    serviceDescription: "Monthly Platform SaaS Subscription (Cardiology Tier)",
    issueDate: "2026-08-01",
    dueDate: "2026-08-15",
    paidDate: "2026-08-05",
    subtotal: 2500,
    tax: 450,
    discount: 0,
    total: 2950,
    status: "Paid",
    paymentMethod: "Direct Bank Transfer (NEFT)",
    transactionRef: "NEFT-AXIS-9920141",
  },
  {
    id: "INV-2026-0902",
    clientName: "City Care Hospital",
    clientType: "Hospital",
    clientEmail: "accounts@citycare.org",
    serviceDescription: "Hospital Enterprise API & Department Integration Fee",
    issueDate: "2026-08-01",
    dueDate: "2026-08-25",
    paidDate: "2026-08-20",
    subtotal: 18000,
    tax: 3240,
    discount: 1000,
    total: 20240,
    status: "Paid",
    paymentMethod: "Corporate NetBanking",
    transactionRef: "HDFC-CORP-481902",
  },
  {
    id: "INV-2026-0903",
    clientName: "MedPlus Central Pharmacy",
    clientType: "Pharmacy",
    clientEmail: "finance@medplus.com",
    serviceDescription: "Monthly E-Pharmacy Marketplace Platform Commission (1.5%)",
    issueDate: "2026-08-15",
    dueDate: "2026-08-30",
    paidDate: null,
    subtotal: 4200,
    tax: 756,
    discount: 0,
    total: 4956,
    status: "Overdue",
    paymentMethod: "Awaiting Payment",
    transactionRef: "PENDING-OVERDUE",
  },
  {
    id: "INV-2026-0904",
    clientName: "Dr. Rajesh K. Nair",
    clientType: "Doctor",
    clientEmail: "rajesh.nair@medicobridge.com",
    serviceDescription: "Monthly Telehealth Video Gateway Usage & Platform Fee",
    issueDate: "2026-08-20",
    dueDate: "2026-09-05",
    paidDate: null,
    subtotal: 2500,
    tax: 450,
    discount: 250,
    total: 2700,
    status: "Pending",
    paymentMethod: "Payment Link Dispatched",
    transactionRef: "PLINK-RAZOR-7719",
  },
  {
    id: "INV-2026-0905",
    clientName: "Rahul Nair",
    clientType: "Patient",
    clientEmail: "rahul@gmail.com",
    serviceDescription: "Pharmacy Medicine Order Fulfillment #MB20260001",
    issueDate: "2026-08-30",
    dueDate: "2026-08-30",
    paidDate: "2026-08-30",
    subtotal: 201,
    tax: 0,
    discount: 20,
    total: 221,
    status: "Paid",
    paymentMethod: "UPI (Google Pay)",
    transactionRef: "UPI-GPAY-4410982",
  },
  {
    id: "INV-2026-0906",
    clientName: "Sunita Rao",
    clientType: "Patient",
    clientEmail: "sunita.rao@example.com",
    serviceDescription: "Tele-Consultation Fee (Dr. Priya Mehta)",
    issueDate: "2026-08-31",
    dueDate: "2026-08-31",
    paidDate: "2026-08-31",
    subtotal: 500,
    tax: 0,
    discount: 50,
    total: 450,
    status: "Paid",
    paymentMethod: "Credit Card (HDFC)",
    transactionRef: "CC-HDFC-991204",
  },
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
    date: "2026-08-31", // Today
    timeSlot: "11:30 AM - 12:00 PM",
    startTime: "11:30",
    endTime: "12:00",
    fee: 600,
    paymentStatus: "Paid",
    status: "Ongoing", // Can be auto-computed
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
    date: "2026-08-31", // Today
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
  },
  {
    id: "APT-2026-05",
    patientName: "Rohan Verma",
    patientId: "PAT-103",
    patientPhone: "+91 76543 21098",
    doctorName: "Dr. Amit Varma",
    doctorId: "DR-80246",
    specialization: "General Medicine",
    department: "General Medicine",
    hospital: "City Care Hospital",
    type: "In-Clinic Visit",
    date: "2026-08-27",
    timeSlot: "04:30 PM - 05:00 PM",
    startTime: "16:30",
    endTime: "17:00",
    fee: 400,
    paymentStatus: "Refunded",
    status: "Cancelled",
    roomUrl: "Cancelled",
    symptoms: "Routine health checkup",
    doctorNotes: "Patient cancelled due to urgent travel. Refund processed.",
    prescriptionIssued: false,
    prescriptionId: null,
  },
  {
    id: "APT-2026-06",
    patientName: "Karan Malhotra",
    patientId: "PAT-105",
    patientPhone: "+91 54321 09876",
    doctorName: "Dr. Vikram Shekar",
    doctorId: "DR-80245",
    specialization: "Dermatology",
    department: "Dermatology",
    hospital: "Metro Skin Clinic",
    type: "Video Consultation",
    date: "2026-09-02",
    timeSlot: "11:00 AM - 11:30 AM",
    startTime: "11:00",
    endTime: "11:30",
    fee: 650,
    paymentStatus: "Paid",
    status: "Upcoming",
    roomUrl: "https://meet.medicobridge.com/room/DR-80245-PAT-105",
    symptoms: "Moderate acne review and skin allergy evaluation",
    doctorNotes: "Upcoming session.",
    prescriptionIssued: false,
    prescriptionId: null,
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
  },
  {
    id: "EHR-2026-103",
    patientId: "PAT-101",
    patientName: "Aarav Sharma",
    age: 32,
    gender: "Male",
    bloodGroup: "O+",
    recordType: "Lab Report",
    doctorName: "Dr. Susan George",
    specialization: "Orthopedics",
    facility: "City Care Diagnostic Center",
    date: "15 Jul 2026",
    diagnosis: "Knee Ligament Strain & Routine Serum Panel",
    symptoms: "Right knee tenderness post exercise",
    vitals: { bp: "122/80 mmHg", pulse: "68 bpm", spo2: "99%", temp: "98.2°F", weight: "76 kg" },
    treatmentPlan: "Cryotherapy, knee brace support, oral anti-inflammatory",
    prescriptions: [
      { name: "Paracetamol 650mg", dosage: "1-0-1", duration: "5 Days", instructions: "After Food" }
    ],
    labFindings: "X-Ray Right Knee: No fracture. Joint space preserved.",
    notes: "Follow up after 2 weeks of physiotherapy.",
    status: "Verified & Locked"
  },
  {
    id: "EHR-2026-104",
    patientId: "PAT-104",
    patientName: "Lakshmi Nair",
    age: 46,
    gender: "Female",
    bloodGroup: "AB+",
    recordType: "Prescription Record",
    doctorName: "Dr. Priya Thomas",
    specialization: "Endocrinology",
    facility: "AIIMS Hospital, Kochi",
    date: "15 Jun 2026",
    diagnosis: "Primary Hypothyroidism",
    symptoms: "Mild fatigue, dry skin, cold sensitivity",
    vitals: { bp: "126/82 mmHg", pulse: "72 bpm", spo2: "99%", temp: "98.1°F", weight: "64 kg" },
    treatmentPlan: "Levothyroxine replacement therapy on empty stomach",
    prescriptions: [
      { name: "Levothyroxine 50mcg", dosage: "1-0-0", duration: "60 Days", instructions: "Empty stomach with plain water" }
    ],
    labFindings: "TSH 5.8 mIU/L (High), Free T4 1.1 ng/dL (Normal).",
    notes: "Repeat TSH after 8 weeks.",
    status: "Verified & Locked"
  }
];

// ── Storage Keys & Initializer ──────────────────────────────────────

const STORAGE_KEYS = {
  MEDICINES: "mb_admin_medicines",
  ORDERS: "mb_admin_orders",
  COUPONS: "adminCoupons",
  INVOICES: "mb_admin_invoices",
  APPOINTMENTS: "mb_admin_appointments",
  MEDICAL_RECORDS: "mb_admin_medical_records",
  NOTIFICATIONS: "mb_admin_notifications",
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

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading orders from storage", e);
  }
  return initialOrders;
}

export function saveOrders(orders) {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed saving orders", e);
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
  // Fall back to default coupons with extra metadata
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

export function getStoredInvoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading invoices from storage", e);
  }
  return initialInvoices;
}

export function saveInvoices(invoices) {
  try {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed saving invoices", e);
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
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Parse time slot if available
  const aptDate = apt.date;

  if (aptDate < todayStr) {
    return "Completed"; // Past date auto-completes if not cancelled
  } else if (aptDate > todayStr) {
    return "Upcoming";
  } else {
    // It's today! Check start and end time
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

// ── Automated System Notifications Generator ────────────────────────

export function generateAutomatedSystemAlerts() {
  const alerts = [];
  const medicines = getStoredMedicines();
  const invoices = getStoredInvoices();
  const appointments = getStoredAppointments();
  const orders = getStoredOrders();

  // 1. Check Low & Out of stock medicines
  const outOfStock = medicines.filter((m) => m.stock === 0);
  const lowStock = medicines.filter((m) => m.stock > 0 && m.stock <= (m.minThreshold || 15));

  outOfStock.forEach((m) => {
    alerts.push({
      id: `SYS-STK-${m.id}`,
      type: "Critical",
      category: "Stock Alert",
      title: `Critical Out-of-Stock: ${m.name}`,
      message: `${m.name} (${m.brand}) has reached 0 units. Customer orders are currently blocked. Immediate restock requisition required.`,
      time: "Live System Trigger",
      actionLink: "/admin/pharmacy",
      isRead: false,
    });
  });

  lowStock.forEach((m) => {
    alerts.push({
      id: `SYS-LOW-${m.id}`,
      type: "Warning",
      category: "Stock Alert",
      title: `Low Stock Warning: ${m.name}`,
      message: `${m.name} has only ${m.stock} units remaining (Threshold: ${m.minThreshold || 15} units).`,
      time: "Live System Trigger",
      actionLink: "/admin/pharmacy",
      isRead: false,
    });
  });

  // 2. Check Overdue Invoices
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue");
  overdueInvoices.forEach((inv) => {
    alerts.push({
      id: `SYS-INV-${inv.id}`,
      type: "Warning",
      category: "Billing & Invoices",
      title: `Overdue Invoice: ${inv.id}`,
      message: `Invoice for ${inv.clientName} (₹${inv.total.toLocaleString("en-IN")}) passed due date on ${inv.dueDate}. Payment reminder queued.`,
      time: "Payment Gateway Check",
      actionLink: "/admin/billing",
      isRead: false,
    });
  });

  // 3. Check Pending Deliveries & Orders
  const pendingOrders = orders.filter((o) => o.status === "Placed" || o.status === "Processing");
  if (pendingOrders.length > 0) {
    alerts.push({
      id: `SYS-ORD-PEND`,
      type: "Info",
      category: "Order Fulfillment",
      title: `${pendingOrders.length} Pharmacy Order(s) Awaiting Dispatch`,
      message: `Orders including ${pendingOrders.map(p => p.id).slice(0, 3).join(", ")} are ready for packaging & courier pickup.`,
      time: "Real-time Order Feed",
      actionLink: "/admin/orders",
      isRead: false,
    });
  }

  // 4. Check Active Appointments for Today
  const activeApts = appointments.filter((a) => {
    const st = computeAppointmentStatus(a);
    return st === "Ongoing" || st === "Upcoming";
  });
  if (activeApts.length > 0) {
    alerts.push({
      id: `SYS-APT-TODAY`,
      type: "Info",
      category: "Appointments",
      title: `${activeApts.length} Active Consultations Scheduled Today`,
      message: `Digital consultation rooms active. Live telemetry and meeting status available in appointment manager.`,
      time: "Scheduler Heartbeat",
      actionLink: "/admin/appointments",
      isRead: true,
    });
  }

  return alerts;
}
