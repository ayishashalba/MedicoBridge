import React, { useState, useMemo, useCallback } from "react";
import {
  FaFileInvoiceDollar, FaSearch, FaFilter, FaPlus, FaTimes,
  FaCheckCircle, FaCheck, FaEye, FaPrint, FaHospital,
  FaMoneyBillWave, FaReceipt, FaCalendarAlt, FaExclamationCircle,
  FaBan, FaUndo, FaEdit, FaDownload, FaPaperPlane, FaShieldAlt,
  FaChartBar, FaCreditCard, FaMobileAlt, FaUniversity, FaMoneyBill,
  FaUserMd, FaBed, FaFlask, FaXRay, FaPills, FaSyringe, FaHeartbeat,
  FaUserNurse, FaStethoscope, FaLaptopMedical, FaPercent, FaListAlt,
  FaArrowRight, FaChevronDown, FaChevronUp, FaInfoCircle, FaHourglassHalf,
  FaTachometerAlt,
} from "react-icons/fa";
import "./BillingManagement.css";

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { value: "OP Consultation", label: "OP Consultation", icon: <FaStethoscope /> },
  { value: "Online Consultation", label: "Online Consultation", icon: <FaLaptopMedical /> },
  { value: "Hospital Admission", label: "Hospital Admission", icon: <FaHospital /> },
  { value: "Room & Bed Charges", label: "Room & Bed Charges", icon: <FaBed /> },
  { value: "ICU Charges", label: "ICU Charges", icon: <FaHeartbeat /> },
  { value: "Doctor Visit Charges", label: "Doctor Visit Charges", icon: <FaUserMd /> },
  { value: "Nursing Charges", label: "Nursing Charges", icon: <FaUserNurse /> },
  { value: "Procedures & Surgeries", label: "Procedures & Surgeries", icon: <FaSyringe /> },
  { value: "Laboratory Tests", label: "Laboratory Tests", icon: <FaFlask /> },
  { value: "X-Ray / Imaging", label: "X-Ray / CT / MRI Imaging", icon: <FaXRay /> },
  { value: "Pharmacy / Medicines", label: "Pharmacy / Medicines", icon: <FaPills /> },
  { value: "Other Services", label: "Other Hospital Services", icon: <FaListAlt /> },
];

const PAYMENT_METHODS = ["Cash", "UPI", "Credit/Debit Card", "Net Banking", "Insurance / TPA", "Cheque"];
const STATUS_TABS = ["All", "Pending", "Partially Paid", "Paid", "Overdue", "Cancelled", "Refunded"];

const INSURANCE_PROVIDERS = [
  "Star Health Insurance", "HDFC ERGO Health", "New India Assurance",
  "United India Insurance", "National Insurance", "Oriental Insurance",
  "Bajaj Allianz Health", "Niva Bupa Health", "Aditya Birla Health",
  "Reliance Health Insurance", "ICICI Lombard Health", "SBI Health Insurance",
];

// ── SAMPLE DATA ──────────────────────────────────────────────────────────────
const initialInvoices = [
  {
    id: "INV-2026-0901",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    patientAge: 52,
    patientGender: "Male",
    patientPhone: "+91 94471 23456",
    patientEmail: "ramesh.kumar@example.com",
    patientAddress: "42, Palm Grove, Ernakulam, Kerala - 682011",
    encounterId: "ENC-2026-A4501",
    encounterType: "Inpatient Admission",
    department: "Cardiology",
    attendingDoctor: "Dr. Suresh Menon",
    billingOfficer: "Priya Rajan",
    invoiceDate: "2026-08-22",
    dueDate: "2026-08-29",
    paymentMethod: "Insurance / TPA",
    status: "Overdue",
    insuranceProvider: "Star Health Insurance",
    policyNumber: "SHI-2024-904321",
    items: [
      { id: 1, description: "ICU Bed Stay (5 Days)", category: "ICU Charges", quantity: 5, unitPrice: 8500, discount: 0, tax: 0, amount: 42500 },
      { id: 2, description: "Cardiac Monitoring & Critical Care", category: "ICU Charges", quantity: 1, unitPrice: 15000, discount: 0, tax: 0, amount: 15000 },
      { id: 3, description: "Senior Cardiologist Consultation", category: "Doctor Visit Charges", quantity: 5, unitPrice: 2000, discount: 0, tax: 0, amount: 10000 },
      { id: 4, description: "Nursing Charges (5 Days)", category: "Nursing Charges", quantity: 5, unitPrice: 1800, discount: 0, tax: 0, amount: 9000 },
      { id: 5, description: "Angioplasty Procedure", category: "Procedures & Surgeries", quantity: 1, unitPrice: 85000, discount: 5000, tax: 0, amount: 80000 },
      { id: 6, description: "Post-op Medications & IV Fluids", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 6500, discount: 0, tax: 0, amount: 6500 },
      { id: 7, description: "ECG & Cardiac Enzyme Panel", category: "Laboratory Tests", quantity: 1, unitPrice: 2800, discount: 0, tax: 0, amount: 2800 },
    ],
    globalDiscount: 5000,
    globalTax: 0,
    paidAmount: 0,
    paymentHistory: [],
    notes: "Patient under Star Health TPA. Pre-authorization obtained. Claim submitted.",
  },
  {
    id: "INV-2026-0902",
    patientName: "Sonia Sebastian",
    patientId: "PAT-4092",
    patientAge: 29,
    patientGender: "Female",
    patientPhone: "+91 94471 23457",
    patientEmail: "sonia.s@example.com",
    patientAddress: "15, Rose Garden Apt, Thrissur, Kerala - 680001",
    encounterId: "ENC-2026-A4502",
    encounterType: "Inpatient Admission",
    department: "General Surgery",
    attendingDoctor: "Dr. Anita Varghese",
    billingOfficer: "Rajan Thomas",
    invoiceDate: "2026-08-20",
    dueDate: "2026-08-27",
    paymentMethod: "Credit/Debit Card",
    status: "Paid",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "General Ward Bed Charges (3 Days)", category: "Room & Bed Charges", quantity: 3, unitPrice: 3500, discount: 0, tax: 0, amount: 10500 },
      { id: 2, description: "Laparoscopic Appendectomy", category: "Procedures & Surgeries", quantity: 1, unitPrice: 28000, discount: 2000, tax: 0, amount: 26000 },
      { id: 3, description: "Nursing Charges (3 Days)", category: "Nursing Charges", quantity: 3, unitPrice: 1200, discount: 0, tax: 0, amount: 3600 },
      { id: 4, description: "Pre-op Blood Workup & CBC", category: "Laboratory Tests", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
      { id: 5, description: "Anaesthesia Charges", category: "Doctor Visit Charges", quantity: 1, unitPrice: 8000, discount: 0, tax: 0, amount: 8000 },
      { id: 6, description: "Post-op Medicines", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 2200, discount: 0, tax: 0, amount: 2200 },
    ],
    globalDiscount: 1500,
    globalTax: 0,
    paidAmount: 50600,
    paymentHistory: [
      { date: "2026-08-20", amount: 50600, method: "Credit/Debit Card", ref: "HDFC-TXN-449821", note: "Full payment at discharge" },
    ],
    notes: "Patient discharged. Full payment collected.",
  },
  {
    id: "INV-2026-0903",
    patientName: "Mohan Lal",
    patientId: "PAT-4093",
    patientAge: 64,
    patientGender: "Male",
    patientPhone: "+91 94471 23458",
    patientEmail: "mohan.lal@example.com",
    patientAddress: "8, MG Road, Kottayam, Kerala - 686001",
    encounterId: "ENC-2026-A4503",
    encounterType: "Inpatient Admission",
    department: "Cardiology",
    attendingDoctor: "Dr. Suresh Menon",
    billingOfficer: "Priya Rajan",
    invoiceDate: "2026-08-19",
    dueDate: "2026-09-05",
    paymentMethod: "Net Banking",
    status: "Partially Paid",
    insuranceProvider: "HDFC ERGO Health",
    policyNumber: "HEH-2025-772100",
    items: [
      { id: 1, description: "Private Deluxe Room (6 Days)", category: "Room & Bed Charges", quantity: 6, unitPrice: 6500, discount: 0, tax: 0, amount: 39000 },
      { id: 2, description: "Cardiologist Rounds", category: "Doctor Visit Charges", quantity: 6, unitPrice: 2000, discount: 0, tax: 0, amount: 12000 },
      { id: 3, description: "Nursing Charges (6 Days)", category: "Nursing Charges", quantity: 6, unitPrice: 1500, discount: 0, tax: 0, amount: 9000 },
      { id: 4, description: "Cardiac Rehabilitation Sessions", category: "Other Services", quantity: 8, unitPrice: 1200, discount: 0, tax: 0, amount: 9600 },
      { id: 5, description: "Medications & IV Drips", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 8400, discount: 0, tax: 0, amount: 8400 },
      { id: 6, description: "ECG, Stress Test, Echo", category: "Laboratory Tests", quantity: 1, unitPrice: 4500, discount: 0, tax: 0, amount: 4500 },
    ],
    globalDiscount: 3000,
    globalTax: 0,
    paidAmount: 40000,
    paymentHistory: [
      { date: "2026-08-19", amount: 20000, method: "Net Banking", ref: "SBI-NEFT-20240819", note: "Advance payment on admission" },
      { date: "2026-08-22", amount: 20000, method: "Net Banking", ref: "SBI-NEFT-20240822", note: "Second instalment" },
    ],
    notes: "Patient has HDFC ERGO insurance. Partial co-pay paid. Balance pending on discharge.",
  },
  {
    id: "INV-2026-0904",
    patientName: "Leela Mathews",
    patientId: "PAT-4094",
    patientAge: 72,
    patientGender: "Female",
    patientPhone: "+91 94471 23461",
    patientEmail: "leela.m@example.com",
    patientAddress: "21, Church Road, Alappuzha, Kerala - 688001",
    encounterId: "ENC-2026-O1204",
    encounterType: "OP Visit",
    department: "Pulmonology",
    attendingDoctor: "Dr. George Abraham",
    billingOfficer: "Rajan Thomas",
    invoiceDate: "2026-08-24",
    dueDate: "2026-08-31",
    paymentMethod: "Pending Selection",
    status: "Pending",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "Senior Pulmonologist Consultation", category: "OP Consultation", quantity: 1, unitPrice: 1500, discount: 0, tax: 0, amount: 1500 },
      { id: 2, description: "High-Resolution Chest CT Scan", category: "X-Ray / Imaging", quantity: 1, unitPrice: 4200, discount: 0, tax: 0, amount: 4200 },
      { id: 3, description: "Complete Blood Count & ESR", category: "Laboratory Tests", quantity: 1, unitPrice: 800, discount: 0, tax: 0, amount: 800 },
      { id: 4, description: "Pulmonary Function Test", category: "Laboratory Tests", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
      { id: 5, description: "Prescribed Medications (7 Days)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 950, discount: 0, tax: 0, amount: 950 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 0,
    paymentHistory: [],
    notes: "Follow-up appointment in 2 weeks.",
  },
  {
    id: "INV-2026-0905",
    patientName: "Aparna Nair",
    patientId: "PAT-4095",
    patientAge: 41,
    patientGender: "Female",
    patientPhone: "+91 94471 23459",
    patientEmail: "aparna.nair@example.com",
    patientAddress: "7, Lotus Lane, Kozhikode, Kerala - 673001",
    encounterId: "ENC-2026-PHR-201",
    encounterType: "Pharmacy Visit",
    department: "Pharmacy",
    attendingDoctor: "Dr. Priya Krishnan",
    billingOfficer: "Anitha S",
    invoiceDate: "2026-08-25",
    dueDate: "2026-08-25",
    paymentMethod: "Cash",
    status: "Paid",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "Amoxicillin 500mg (30 Caps)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 280, discount: 0, tax: 0, amount: 280 },
      { id: 2, description: "Pantoprazole 40mg (14 Tabs)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 120, discount: 0, tax: 0, amount: 120 },
      { id: 3, description: "Vitamin D3 Supplement (60 Caps)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 450, discount: 50, tax: 0, amount: 400 },
      { id: 4, description: "Cetirizine 10mg (10 Tabs)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 65, discount: 0, tax: 0, amount: 65 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 865,
    paymentHistory: [
      { date: "2026-08-25", amount: 865, method: "Cash", ref: "CASH-250826-001", note: "Counter payment" },
    ],
    notes: "",
  },
  {
    id: "INV-2026-0906",
    patientName: "Thomas Kurian",
    patientId: "PAT-4096",
    patientAge: 35,
    patientGender: "Male",
    patientPhone: "+91 94471 23460",
    patientEmail: "thomas.k@example.com",
    patientAddress: "33, Hill View, Munnar, Kerala - 685612",
    encounterId: "ENC-2026-OC-501",
    encounterType: "Online Consultation",
    department: "Dermatology",
    attendingDoctor: "Dr. Meera Pillai",
    billingOfficer: "Anitha S",
    invoiceDate: "2026-08-26",
    dueDate: "2026-08-26",
    paymentMethod: "UPI",
    status: "Paid",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "Online Dermatology Consultation (MedicoBridge)", category: "Online Consultation", quantity: 1, unitPrice: 799, discount: 0, tax: 0, amount: 799 },
      { id: 2, description: "E-Prescription Fee", category: "Other Services", quantity: 1, unitPrice: 50, discount: 0, tax: 0, amount: 50 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 849,
    paymentHistory: [
      { date: "2026-08-26", amount: 849, method: "UPI", ref: "GPAY-TXN-992231", note: "Paid via Google Pay before consultation" },
    ],
    notes: "Online consultation completed successfully.",
  },
  {
    id: "INV-2026-0907",
    patientName: "Deepak Menon",
    patientId: "PAT-4097",
    patientAge: 55,
    patientGender: "Male",
    patientPhone: "+91 94471 23470",
    patientEmail: "deepak.m@example.com",
    patientAddress: "12, Beach Road, Calicut, Kerala - 673020",
    encounterId: "ENC-2026-A4507",
    encounterType: "Inpatient Admission",
    department: "Orthopedics",
    attendingDoctor: "Dr. Rajesh Nambiar",
    billingOfficer: "Rajan Thomas",
    invoiceDate: "2026-08-18",
    dueDate: "2026-08-25",
    paymentMethod: "Insurance / TPA",
    status: "Overdue",
    insuranceProvider: "National Insurance",
    policyNumber: "NIC-2024-551892",
    items: [
      { id: 1, description: "Private Room (4 Days)", category: "Room & Bed Charges", quantity: 4, unitPrice: 5500, discount: 0, tax: 0, amount: 22000 },
      { id: 2, description: "Total Knee Replacement Surgery", category: "Procedures & Surgeries", quantity: 1, unitPrice: 120000, discount: 10000, tax: 0, amount: 110000 },
      { id: 3, description: "Orthopaedic Surgeon Charges", category: "Doctor Visit Charges", quantity: 1, unitPrice: 25000, discount: 0, tax: 0, amount: 25000 },
      { id: 4, description: "Physiotherapy Sessions (8)", category: "Other Services", quantity: 8, unitPrice: 1200, discount: 0, tax: 0, amount: 9600 },
      { id: 5, description: "Nursing (4 Days)", category: "Nursing Charges", quantity: 4, unitPrice: 1500, discount: 0, tax: 0, amount: 6000 },
      { id: 6, description: "Implants & Prosthetics", category: "Procedures & Surgeries", quantity: 1, unitPrice: 45000, discount: 0, tax: 0, amount: 45000 },
      { id: 7, description: "Pre & Post-op Lab Tests", category: "Laboratory Tests", quantity: 1, unitPrice: 3500, discount: 0, tax: 0, amount: 3500 },
      { id: 8, description: "Post-op Medications", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 4200, discount: 0, tax: 0, amount: 4200 },
    ],
    globalDiscount: 5000,
    globalTax: 0,
    paidAmount: 50000,
    paymentHistory: [
      { date: "2026-08-18", amount: 50000, method: "Net Banking", ref: "INS-PRE-AUTH-2026", note: "Insurance pre-authorization advance" },
    ],
    notes: "TPA claim submitted. Pending final settlement. Patient discharged.",
  },
  {
    id: "INV-2026-0908",
    patientName: "Kavya Suresh",
    patientId: "PAT-4098",
    patientAge: 27,
    patientGender: "Female",
    patientPhone: "+91 94471 23480",
    patientEmail: "kavya.s@example.com",
    patientAddress: "5, Lake View, Vyttila, Kochi - 682019",
    encounterId: "ENC-2026-O1208",
    encounterType: "OP Visit",
    department: "Gynaecology",
    attendingDoctor: "Dr. Sunitha Krishnakumar",
    billingOfficer: "Priya Rajan",
    invoiceDate: "2026-08-27",
    dueDate: "2026-09-03",
    paymentMethod: "UPI",
    status: "Paid",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "Gynaecologist Consultation", category: "OP Consultation", quantity: 1, unitPrice: 1200, discount: 0, tax: 0, amount: 1200 },
      { id: 2, description: "Pelvic Ultrasound", category: "X-Ray / Imaging", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
      { id: 3, description: "Hormonal Blood Panel", category: "Laboratory Tests", quantity: 1, unitPrice: 2200, discount: 0, tax: 0, amount: 2200 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 5200,
    paymentHistory: [
      { date: "2026-08-27", amount: 5200, method: "UPI", ref: "PHONEPE-881234", note: "Full payment at counter" },
    ],
    notes: "",
  },
  {
    id: "INV-2026-0909",
    patientName: "John Wesley",
    patientId: "PAT-4099",
    patientAge: 46,
    patientGender: "Male",
    patientPhone: "+91 94471 23465",
    patientEmail: "john.w@example.com",
    patientAddress: "27, SP Road, Kannur, Kerala - 670001",
    encounterId: "ENC-2026-O1209",
    encounterType: "OP Visit",
    department: "Endocrinology",
    attendingDoctor: "Dr. Sanjeev Iyer",
    billingOfficer: "Anitha S",
    invoiceDate: "2026-08-20",
    dueDate: "2026-08-27",
    paymentMethod: "Cancelled",
    status: "Cancelled",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "HbA1c & Fasting Glucose Screening", category: "Laboratory Tests", quantity: 1, unitPrice: 850, discount: 0, tax: 0, amount: 850 },
      { id: 2, description: "Lipid Profile Panel", category: "Laboratory Tests", quantity: 1, unitPrice: 950, discount: 0, tax: 0, amount: 950 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 0,
    paymentHistory: [],
    notes: "Patient cancelled appointment. Invoice voided.",
  },
  {
    id: "INV-2026-0910",
    patientName: "Ananya Pillai",
    patientId: "PAT-4100",
    patientAge: 33,
    patientGender: "Female",
    patientPhone: "+91 94471 23490",
    patientEmail: "ananya.p@example.com",
    patientAddress: "9, Sunset Avenue, Trivandrum, Kerala - 695001",
    encounterId: "ENC-2026-A4510",
    encounterType: "Inpatient Admission",
    department: "Obstetrics",
    attendingDoctor: "Dr. Sunitha Krishnakumar",
    billingOfficer: "Priya Rajan",
    invoiceDate: "2026-08-25",
    dueDate: "2026-09-01",
    paymentMethod: "Net Banking",
    status: "Paid",
    insuranceProvider: "Bajaj Allianz Health",
    policyNumber: "BAJ-2025-112345",
    items: [
      { id: 1, description: "Semi-Private Room (3 Days)", category: "Room & Bed Charges", quantity: 3, unitPrice: 4500, discount: 0, tax: 0, amount: 13500 },
      { id: 2, description: "Normal Delivery Charges", category: "Procedures & Surgeries", quantity: 1, unitPrice: 18000, discount: 2000, tax: 0, amount: 16000 },
      { id: 3, description: "Obstetrician Charges", category: "Doctor Visit Charges", quantity: 1, unitPrice: 8000, discount: 0, tax: 0, amount: 8000 },
      { id: 4, description: "Nursing (3 Days)", category: "Nursing Charges", quantity: 3, unitPrice: 1200, discount: 0, tax: 0, amount: 3600 },
      { id: 5, description: "Newborn Care Package", category: "Other Services", quantity: 1, unitPrice: 4500, discount: 0, tax: 0, amount: 4500 },
      { id: 6, description: "Paediatrician Visit", category: "Doctor Visit Charges", quantity: 2, unitPrice: 1500, discount: 0, tax: 0, amount: 3000 },
      { id: 7, description: "Post-Delivery Lab Tests", category: "Laboratory Tests", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
      { id: 8, description: "Mother & Baby Medications", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 2100, discount: 0, tax: 0, amount: 2100 },
    ],
    globalDiscount: 2000,
    globalTax: 0,
    paidAmount: 50500,
    paymentHistory: [
      { date: "2026-08-25", amount: 25000, method: "Net Banking", ref: "INS-BAJ-CLAIM-001", note: "Insurance partial payment" },
      { date: "2026-08-27", amount: 25500, method: "Net Banking", ref: "AXISBANK-NEFT-8831", note: "Patient co-pay settlement" },
    ],
    notes: "Mother and baby both healthy. Full payment cleared.",
  },
  {
    id: "INV-2026-0911",
    patientName: "Suresh Varma",
    patientId: "PAT-4101",
    patientAge: 58,
    patientGender: "Male",
    patientPhone: "+91 94471 23499",
    patientEmail: "suresh.v@example.com",
    patientAddress: "16, Gandhi Nagar, Palakkad, Kerala - 678001",
    encounterId: "ENC-2026-O1211",
    encounterType: "OP Visit",
    department: "Radiology",
    attendingDoctor: "Dr. Meena Raj",
    billingOfficer: "Anitha S",
    invoiceDate: "2026-08-28",
    dueDate: "2026-09-04",
    paymentMethod: "Cash",
    status: "Paid",
    insuranceProvider: null,
    policyNumber: null,
    items: [
      { id: 1, description: "Brain MRI with Contrast", category: "X-Ray / Imaging", quantity: 1, unitPrice: 6500, discount: 500, tax: 0, amount: 6000 },
      { id: 2, description: "Neurologist Consultation", category: "OP Consultation", quantity: 1, unitPrice: 1500, discount: 0, tax: 0, amount: 1500 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 7500,
    paymentHistory: [
      { date: "2026-08-28", amount: 7500, method: "Cash", ref: "CASH-280826-002", note: "Cash payment at radiology counter" },
    ],
    notes: "",
  },
  {
    id: "INV-2026-0912",
    patientName: "Rekha Chandran",
    patientId: "PAT-4102",
    patientAge: 45,
    patientGender: "Female",
    patientPhone: "+91 94471 23501",
    patientEmail: "rekha.c@example.com",
    patientAddress: "3, Manali Street, Kochi, Kerala - 682005",
    encounterId: "ENC-2026-A4512",
    encounterType: "Inpatient Admission",
    department: "Nephrology",
    attendingDoctor: "Dr. Prakash Nair",
    billingOfficer: "Rajan Thomas",
    invoiceDate: "2026-08-15",
    dueDate: "2026-08-22",
    paymentMethod: "Insurance / TPA",
    status: "Refunded",
    insuranceProvider: "New India Assurance",
    policyNumber: "NIA-2023-881100",
    items: [
      { id: 1, description: "ICU Stay (2 Days)", category: "ICU Charges", quantity: 2, unitPrice: 9000, discount: 0, tax: 0, amount: 18000 },
      { id: 2, description: "Nephrology Consultation", category: "Doctor Visit Charges", quantity: 2, unitPrice: 2000, discount: 0, tax: 0, amount: 4000 },
      { id: 3, description: "Dialysis Session", category: "Procedures & Surgeries", quantity: 1, unitPrice: 8000, discount: 0, tax: 0, amount: 8000 },
      { id: 4, description: "Lab - Renal Function Tests", category: "Laboratory Tests", quantity: 1, unitPrice: 2200, discount: 0, tax: 0, amount: 2200 },
    ],
    globalDiscount: 0,
    globalTax: 0,
    paidAmount: 32200,
    refundAmount: 32200,
    paymentHistory: [
      { date: "2026-08-15", amount: 32200, method: "Insurance / TPA", ref: "NIA-CLAIM-2026-08", note: "Full payment by insurance" },
      { date: "2026-08-22", amount: -32200, method: "Insurance / TPA", ref: "NIA-REFUND-2026-08", note: "Refund issued — duplicate billing resolved" },
    ],
    notes: "Duplicate entry identified. Refund processed.",
  },
];

const initialInsuranceClaims = [
  {
    id: "CLM-2026-001",
    invoiceId: "INV-2026-0901",
    patientName: "Ramesh Kumar",
    patientId: "PAT-4091",
    provider: "Star Health Insurance",
    policyNo: "SHI-2024-904321",
    claimAmount: 166300,
    approvedAmount: 150000,
    insurancePaid: 0,
    patientPayable: 166300,
    claimStatus: "Submitted",
    submittedDate: "2026-08-22",
    settledDate: null,
    tpaRef: "SHI-TPA-2026-4421",
  },
  {
    id: "CLM-2026-002",
    invoiceId: "INV-2026-0907",
    patientName: "Deepak Menon",
    patientId: "PAT-4097",
    provider: "National Insurance",
    policyNo: "NIC-2024-551892",
    claimAmount: 220300,
    approvedAmount: 180000,
    insurancePaid: 50000,
    patientPayable: 170300,
    claimStatus: "Partially Approved",
    submittedDate: "2026-08-18",
    settledDate: null,
    tpaRef: "NIC-TPA-2026-7712",
  },
  {
    id: "CLM-2026-003",
    invoiceId: "INV-2026-0910",
    patientName: "Ananya Pillai",
    patientId: "PAT-4100",
    provider: "Bajaj Allianz Health",
    policyNo: "BAJ-2025-112345",
    claimAmount: 52500,
    approvedAmount: 25000,
    insurancePaid: 25000,
    patientPayable: 25500,
    claimStatus: "Approved",
    submittedDate: "2026-08-25",
    settledDate: "2026-08-27",
    tpaRef: "BAJ-TPA-2026-1190",
  },
  {
    id: "CLM-2026-004",
    invoiceId: "INV-2026-0912",
    patientName: "Rekha Chandran",
    patientId: "PAT-4102",
    provider: "New India Assurance",
    policyNo: "NIA-2023-881100",
    claimAmount: 32200,
    approvedAmount: 32200,
    insurancePaid: 32200,
    patientPayable: 0,
    claimStatus: "Settled",
    submittedDate: "2026-08-15",
    settledDate: "2026-08-22",
    tpaRef: "NIA-TPA-2026-3301",
  },
];

// ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────
const calcInvoiceSubtotal = (inv) =>
  inv.items.reduce((sum, item) => sum + item.amount, 0);

const calcInvoiceTotal = (inv) => {
  const subtotal = calcInvoiceSubtotal(inv);
  return Math.max(0, subtotal - (inv.globalDiscount || 0) + (inv.globalTax || 0));
};

const calcBalance = (inv) =>
  Math.max(0, calcInvoiceTotal(inv) - (inv.paidAmount || 0));

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const today = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isOverdue = (inv) => {
  if (inv.status === "Paid" || inv.status === "Cancelled" || inv.status === "Refunded") return false;
  return new Date(inv.dueDate) < new Date() && inv.status !== "Overdue";
};

const SERVICE_BADGE_COLORS = {
  "OP Consultation": { bg: "#e0f2fe", color: "#0369a1" },
  "Online Consultation": { bg: "#ede9fe", color: "#7c3aed" },
  "Hospital Admission": { bg: "#fdf2f8", color: "#be185d" },
  "Room & Bed Charges": { bg: "#fef3c7", color: "#92400e" },
  "ICU Charges": { bg: "#fee2e2", color: "#b91c1c" },
  "Doctor Visit Charges": { bg: "#dbeafe", color: "#1e40af" },
  "Nursing Charges": { bg: "#ccfbf1", color: "#0f766e" },
  "Procedures & Surgeries": { bg: "#fce7f3", color: "#9d174d" },
  "Laboratory Tests": { bg: "#d1fae5", color: "#065f46" },
  "X-Ray / Imaging": { bg: "#f1f5f9", color: "#334155" },
  "Pharmacy / Medicines": { bg: "#f3e8ff", color: "#7e22ce" },
  "Other Services": { bg: "#f8fafc", color: "#475569" },
};

const STATUS_COLORS = {
  Paid: { bg: "#dcfce7", color: "#15803d" },
  Pending: { bg: "#fef3c7", color: "#b45309" },
  "Partially Paid": { bg: "#dbeafe", color: "#1d4ed8" },
  Overdue: { bg: "#fee2e2", color: "#b91c1c" },
  Cancelled: { bg: "#f1f5f9", color: "#64748b" },
  Refunded: { bg: "#faf5ff", color: "#7c3aed" },
};

const CLAIM_STATUS_COLORS = {
  Submitted: { bg: "#fef3c7", color: "#b45309" },
  Approved: { bg: "#dcfce7", color: "#15803d" },
  "Partially Approved": { bg: "#dbeafe", color: "#1d4ed8" },
  Pending: { bg: "#fef3c7", color: "#b45309" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c" },
  Settled: { bg: "#d1fae5", color: "#065f46" },
};

// ── EMPTY FORM STATES ────────────────────────────────────────────────────────
const emptyInvoiceForm = () => ({
  patientName: "",
  patientId: "",
  patientAge: "",
  patientGender: "Male",
  patientPhone: "",
  patientEmail: "",
  patientAddress: "",
  encounterId: "",
  encounterType: "OP Visit",
  department: "",
  attendingDoctor: "",
  billingOfficer: "Priya Rajan",
  invoiceDate: today(),
  dueDate: "",
  paymentMethod: "Cash",
  insuranceProvider: "",
  policyNumber: "",
  items: [
    { id: Date.now(), description: "", category: "OP Consultation", quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 },
  ],
  globalDiscount: 0,
  globalTax: 0,
  paidAmount: 0,
  notes: "",
});

const emptyPaymentForm = (inv) => ({
  invoiceId: inv?.id || "",
  amount: inv ? calcBalance(inv) : 0,
  method: "Cash",
  date: today(),
  ref: "",
  note: "",
});

// ════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function BillingManagement() {
  const [activeSection, setActiveSection] = useState("invoices");
  const [invoices, setInvoices] = useState(initialInvoices);
  const [insuranceClaims, setInsuranceClaims] = useState(initialInsuranceClaims);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null); // invoice to record payment for
  const [refundTarget, setRefundTarget] = useState(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm());
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm(null));

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── COMPUTED METRICS ───────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const todayStr = today();
    let totalRevenue = 0, todayRevenue = 0, pendingAmt = 0, overdueAmt = 0, partialAmt = 0, refundAmt = 0;
    invoices.forEach((inv) => {
      const total = calcInvoiceTotal(inv);
      const paid = inv.paidAmount || 0;
      const bal = calcBalance(inv);
      if (inv.status === "Paid") { totalRevenue += total; }
      if (inv.status === "Paid" && inv.invoiceDate === todayStr) todayRevenue += total;
      if (inv.status === "Pending" || inv.status === "Partially Paid" || inv.status === "Overdue") pendingAmt += bal;
      if (inv.status === "Overdue") overdueAmt += bal;
      if (inv.status === "Partially Paid") partialAmt += bal;
      if (inv.status === "Refunded") refundAmt += (inv.refundAmount || 0);
      // count today paid
      if (inv.paymentHistory) {
        inv.paymentHistory.forEach((p) => {
          if (p.date === todayStr && p.amount > 0) todayRevenue += p.amount;
        });
      }
    });
    // Deduplicate today (Paid invoices already counted in paymentHistory)
    return { totalRevenue, todayRevenue, pendingAmt, overdueAmt, partialAmt, refundAmt };
  }, [invoices]);

  // ── FILTERED INVOICES ──────────────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientId.toLowerCase().includes(q) ||
        (inv.encounterId || "").toLowerCase().includes(q) ||
        (inv.department || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  // ── ALL PAYMENT TRANSACTIONS ───────────────────────────────────────────────
  const allPayments = useMemo(() => {
    const result = [];
    invoices.forEach((inv) => {
      (inv.paymentHistory || []).forEach((p, idx) => {
        result.push({
          paymentId: `PAY-${inv.id}-${idx + 1}`,
          invoiceId: inv.id,
          patientName: inv.patientName,
          patientId: inv.patientId,
          amount: p.amount,
          method: p.method,
          date: p.date,
          ref: p.ref,
          note: p.note,
          status: p.amount < 0 ? "Refund" : "Received",
        });
      });
    });
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [invoices]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────

  // Record Payment
  const handleOpenPayment = (inv) => {
    setPaymentTarget(inv);
    setPaymentForm(emptyPaymentForm(inv));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount <= 0) { showToast("Enter a valid payment amount.", "error"); return; }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentTarget.id) return inv;
        const newPaid = (inv.paidAmount || 0) + amount;
        const total = calcInvoiceTotal(inv);
        const newStatus = newPaid >= total ? "Paid" : "Partially Paid";
        return {
          ...inv,
          paidAmount: newPaid,
          paymentMethod: paymentForm.method,
          status: newStatus,
          paymentHistory: [
            ...(inv.paymentHistory || []),
            { date: paymentForm.date, amount, method: paymentForm.method, ref: paymentForm.ref, note: paymentForm.note },
          ],
        };
      })
    );

    if (viewInvoice?.id === paymentTarget.id) {
      setViewInvoice((prev) => {
        const newPaid = (prev.paidAmount || 0) + amount;
        const total = calcInvoiceTotal(prev);
        return {
          ...prev,
          paidAmount: newPaid,
          paymentMethod: paymentForm.method,
          status: newPaid >= total ? "Paid" : "Partially Paid",
          paymentHistory: [
            ...(prev.paymentHistory || []),
            { date: paymentForm.date, amount, method: paymentForm.method, ref: paymentForm.ref, note: paymentForm.note },
          ],
        };
      });
    }

    setPaymentTarget(null);
    showToast(`Payment of ${fmt(amount)} recorded for ${paymentTarget.patientName}.`);
  };

  // Refund
  const handleRefund = (inv) => {
    setInvoices((prev) =>
      prev.map((i) => i.id === inv.id ? {
        ...i,
        status: "Refunded",
        refundAmount: i.paidAmount || 0,
        paymentHistory: [
          ...(i.paymentHistory || []),
          { date: today(), amount: -(i.paidAmount || 0), method: i.paymentMethod, ref: `REFUND-${i.id}`, note: "Refund issued" },
        ],
      } : i)
    );
    if (viewInvoice?.id === inv.id) {
      setViewInvoice((prev) => ({
        ...prev,
        status: "Refunded",
        refundAmount: prev.paidAmount || 0,
        paymentHistory: [
          ...(prev.paymentHistory || []),
          { date: today(), amount: -(prev.paidAmount || 0), method: prev.paymentMethod, ref: `REFUND-${prev.id}`, note: "Refund issued" },
        ],
      }));
    }
    setRefundTarget(null);
    showToast(`Refund processed for invoice ${inv.id}.`);
  };

  // Create Invoice
  const handleInvoiceFormChange = (field, value) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice" || field === "discount") {
        const qty = parseFloat(field === "quantity" ? value : items[idx].quantity) || 0;
        const price = parseFloat(field === "unitPrice" ? value : items[idx].unitPrice) || 0;
        const disc = parseFloat(field === "discount" ? value : items[idx].discount) || 0;
        items[idx].amount = Math.max(0, qty * price - disc);
      }
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), description: "", category: "OP Consultation", quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 }],
    }));
  };

  const removeItem = (idx) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!invoiceForm.patientName.trim()) { showToast("Patient name is required.", "error"); return; }
    if (invoiceForm.items.some((it) => !it.description.trim())) { showToast("All line items need a description.", "error"); return; }

    const subtotal = invoiceForm.items.reduce((s, it) => s + it.amount, 0);
    const total = Math.max(0, subtotal - (parseFloat(invoiceForm.globalDiscount) || 0) + (parseFloat(invoiceForm.globalTax) || 0));
    const paid = parseFloat(invoiceForm.paidAmount) || 0;
    const status = paid >= total && total > 0 ? "Paid" : paid > 0 ? "Partially Paid" : "Pending";

    const id = `INV-2026-${String(Math.floor(9000 + Math.random() * 900)).padStart(4, "0")}`;
    const newInv = {
      ...invoiceForm,
      id,
      patientId: invoiceForm.patientId.trim() || `PAT-${Math.floor(5000 + Math.random() * 1000)}`,
      encounterId: invoiceForm.encounterId.trim() || `ENC-2026-${Math.floor(9000 + Math.random() * 900)}`,
      globalDiscount: parseFloat(invoiceForm.globalDiscount) || 0,
      globalTax: parseFloat(invoiceForm.globalTax) || 0,
      paidAmount: paid,
      status,
      paymentHistory: paid > 0 ? [{ date: invoiceForm.invoiceDate, amount: paid, method: invoiceForm.paymentMethod, ref: "INITIAL-PMT", note: "Initial payment on invoice creation" }] : [],
      items: invoiceForm.items,
    };

    setInvoices((prev) => [newInv, ...prev]);
    setShowCreateModal(false);
    setInvoiceForm(emptyInvoiceForm());
    showToast(`Invoice ${id} created successfully for ${newInv.patientName}.`);
  };

  // Print
  const handlePrint = () => window.print();

  // Send Invoice Toast
  const handleSend = (inv) => showToast(`Invoice ${inv.id} sent to ${inv.patientEmail || inv.patientName}.`);

  // ── STATUS BADGE ──────────────────────────────────────────────────────────
  const StatusBadge = ({ status, size = "sm" }) => {
    const style = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#64748b" };
    return (
      <span className={`bill-badge bill-badge--${size}`} style={{ backgroundColor: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  const ServiceBadge = ({ category }) => {
    const style = SERVICE_BADGE_COLORS[category] || { bg: "#f1f5f9", color: "#475569" };
    return (
      <span className="svc-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {category}
      </span>
    );
  };

  const PayMethodIcon = ({ method }) => {
    const icons = {
      "Cash": <FaMoneyBill />,
      "UPI": <FaMobileAlt />,
      "Credit/Debit Card": <FaCreditCard />,
      "Net Banking": <FaUniversity />,
      "Insurance / TPA": <FaShieldAlt />,
      "Cheque": <FaFileInvoiceDollar />,
    };
    return <span className="pay-method-icon">{icons[method] || <FaMoneyBillWave />}</span>;
  };

  // ── REPORTS DATA ──────────────────────────────────────────────────────────
  const reportData = useMemo(() => {
    const methodTotals = {};
    const deptTotals = {};
    const doctorTotals = {};
    let totalCollected = 0;
    let refundTotal = 0;
    let overdueTotal = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      const paid = inv.paidAmount || 0;
      const total = calcInvoiceTotal(inv);
      if (paid > 0) {
        totalCollected += paid;
        const m = inv.paymentMethod || "Other";
        methodTotals[m] = (methodTotals[m] || 0) + paid;
      }
      if (inv.status === "Refunded") refundTotal += (inv.refundAmount || 0);
      if (inv.status === "Overdue") { overdueTotal += calcBalance(inv); overdueCount++; }
      const dept = inv.department || "General";
      deptTotals[dept] = (deptTotals[dept] || 0) + (inv.status === "Paid" || inv.status === "Partially Paid" ? paid : 0);
      const doc = inv.attendingDoctor || "Unknown";
      if (inv.items.some(it => it.category === "OP Consultation" || it.category === "Doctor Visit Charges" || it.category === "Online Consultation")) {
        doctorTotals[doc] = (doctorTotals[doc] || 0) + inv.items.filter(it => it.category === "OP Consultation" || it.category === "Doctor Visit Charges" || it.category === "Online Consultation").reduce((s, it) => s + it.amount, 0);
      }
    });

    return { methodTotals, deptTotals, doctorTotals, totalCollected, refundTotal, overdueTotal, overdueCount };
  }, [invoices]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="bill-page">
      {/* Toast */}
      {toast && (
        <div className={`bill-toast bill-toast--${toast.type}`}>
          {toast.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="bill-banner">
        <div className="bill-banner__info">
          <div className="bill-banner__icon"><FaFileInvoiceDollar /></div>
          <div>
            <h2 className="bill-banner__title">Billing &amp; Invoices</h2>
            <p className="bill-banner__sub">
              Complete hospital billing — OP · Inpatient · Pharmacy · Lab · Surgery · Insurance &amp; TPA
            </p>
          </div>
        </div>
        <button className="bill-btn-create" onClick={() => setShowCreateModal(true)} id="btn-create-invoice">
          <FaPlus /> Create Invoice
        </button>
      </div>

      {/* ── 6 METRIC CARDS ── */}
      <section className="bill-metrics">
        {[
          { label: "Total Revenue", value: fmt(metrics.totalRevenue), icon: <FaMoneyBillWave />, cls: "metric--revenue", sub: "All collected payments" },
          { label: "Today's Revenue", value: fmt(metrics.todayRevenue), icon: <FaTachometerAlt />, cls: "metric--today", sub: "Collected today" },
          { label: "Pending Amount", value: fmt(metrics.pendingAmt), icon: <FaHourglassHalf />, cls: "metric--pending", sub: "Outstanding balance" },
          { label: "Overdue Amount", value: fmt(metrics.overdueAmt), icon: <FaExclamationCircle />, cls: "metric--overdue", sub: "Past due date" },
          { label: "Partially Paid", value: fmt(metrics.partialAmt), icon: <FaChartBar />, cls: "metric--partial", sub: "Balance remaining" },
          { label: "Refunds", value: fmt(metrics.refundAmt), icon: <FaUndo />, cls: "metric--refund", sub: "Total refunded" },
        ].map((m) => (
          <div key={m.label} className={`bill-metric-card ${m.cls}`}>
            <div className="bill-metric-card__header">
              <span className="bill-metric-card__label">{m.label}</span>
              <div className="bill-metric-card__icon">{m.icon}</div>
            </div>
            <div className="bill-metric-card__value">{m.value}</div>
            <div className="bill-metric-card__sub">{m.sub}</div>
          </div>
        ))}
      </section>

      {/* ── SECTION TABS ── */}
      <div className="bill-section-tabs hosp-card">
        {[
          { key: "invoices", label: "Invoices", icon: <FaFileInvoiceDollar /> },
          { key: "payments", label: "Payments", icon: <FaMoneyBillWave /> },
          { key: "insurance", label: "Insurance / TPA", icon: <FaShieldAlt /> },
          { key: "reports", label: "Reports", icon: <FaChartBar /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`bill-section-tab ${activeSection === tab.key ? "bill-section-tab--active" : ""}`}
            onClick={() => setActiveSection(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ INVOICES SECTION ══════════════════ */}
      {activeSection === "invoices" && (
        <>
          {/* Controls */}
          <div className="bill-controls hosp-card">
            {/* Status Tabs */}
            <div className="bill-status-tabs">
              {STATUS_TABS.map((s) => {
                const count = s === "All" ? invoices.length : invoices.filter((i) => i.status === s).length;
                return (
                  <button
                    key={s}
                    className={`bill-stab ${statusFilter === s ? "bill-stab--active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "All" ? "All Invoices" : s}
                    <span className="bill-stab__count">{count}</span>
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="bill-search-row">
              <div className="bill-search-box">
                <FaSearch className="bill-search-icon" />
                <input
                  type="text"
                  placeholder="Search Invoice ID, Patient, Encounter ID, Department…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className="bill-search-clear" onClick={() => setSearch("")}><FaTimes /></button>}
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="hosp-card bill-table-card">
            <div className="bill-table-header">
              <div>
                <h3 className="hosp-card-title" style={{ marginBottom: "0.1rem" }}>Hospital Billing Register</h3>
                <p className="bill-table-sub">Showing {filteredInvoices.length} of {invoices.length} invoices</p>
              </div>
            </div>
            <div className="hosp-table-wrapper">
              <table className="hosp-table bill-main-table">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient</th>
                    <th>Encounter / Dept.</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: "right" }}>Total</th>
                    <th style={{ textAlign: "right" }}>Paid</th>
                    <th style={{ textAlign: "right" }}>Balance</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                    const total = calcInvoiceTotal(inv);
                    const paid = inv.paidAmount || 0;
                    const bal = calcBalance(inv);
                    return (
                      <tr key={inv.id} className="bill-tr">
                        <td>
                          <div className="bill-id-cell">
                            <FaReceipt className="bill-id-icon" />
                            <span className="bill-id-text">{inv.id}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-patient-cell">
                            <span className="hosp-pat-name">{inv.patientName}</span>
                            <span className="hosp-pat-id">{inv.patientId}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-enc-cell">
                            <span className="bill-enc-id">{inv.encounterId}</span>
                            <span className="bill-dept-lbl">{inv.department}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-date-cell">
                            <FaCalendarAlt className="mini-icon" />
                            {formatDate(inv.invoiceDate)}
                          </div>
                        </td>
                        <td>
                          <div className={`bill-date-cell ${inv.status === "Overdue" ? "text-overdue" : ""}`}>
                            <FaCalendarAlt className="mini-icon" />
                            {formatDate(inv.dueDate)}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="bill-amount">{fmt(total)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="bill-amount bill-amount--paid">{fmt(paid)}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={`bill-amount ${bal > 0 ? "bill-amount--balance" : "bill-amount--zero"}`}>{fmt(bal)}</span>
                        </td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td>
                          <div className="bill-method-cell">
                            <PayMethodIcon method={inv.paymentMethod} />
                            <span className="bill-method-txt">{inv.paymentMethod}</span>
                          </div>
                        </td>
                        <td>
                          <div className="bill-actions-cell">
                            <button className="bill-act-btn bill-act-btn--view" title="View Invoice" onClick={() => setViewInvoice(inv)}>
                              <FaEye />
                            </button>
                            {(inv.status === "Pending" || inv.status === "Partially Paid" || inv.status === "Overdue") && (
                              <button className="bill-act-btn bill-act-btn--pay" title="Record Payment" onClick={() => handleOpenPayment(inv)}>
                                <FaMoneyBillWave />
                              </button>
                            )}
                            <button className="bill-act-btn bill-act-btn--print" title="Print / Download" onClick={() => { setViewInvoice(inv); setTimeout(handlePrint, 300); }}>
                              <FaPrint />
                            </button>
                            <button className="bill-act-btn bill-act-btn--send" title="Send Invoice" onClick={() => handleSend(inv)}>
                              <FaPaperPlane />
                            </button>
                            {inv.status === "Paid" && (
                              <button className="bill-act-btn bill-act-btn--refund" title="Issue Refund" onClick={() => setRefundTarget(inv)}>
                                <FaUndo />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="11" className="hosp-table-empty">
                        <FaFileInvoiceDollar className="empty-icon" />
                        <h3>No invoices found</h3>
                        <p>Adjust filters or create a new invoice.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════ PAYMENTS SECTION ══════════════════ */}
      {activeSection === "payments" && (
        <div className="hosp-card bill-table-card">
          <h3 className="hosp-card-title">Payment Transactions</h3>
          <div className="hosp-table-wrapper">
            <table className="hosp-table bill-pay-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Reference / Txn ID</th>
                  <th>Note</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.length > 0 ? allPayments.map((p) => (
                  <tr key={p.paymentId} className="bill-tr">
                    <td><span className="bill-id-text">{p.paymentId}</span></td>
                    <td><span className="bill-enc-id">{p.invoiceId}</span></td>
                    <td>
                      <div className="bill-patient-cell">
                        <span className="hosp-pat-name">{p.patientName}</span>
                        <span className="hosp-pat-id">{p.patientId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`bill-amount ${p.amount < 0 ? "bill-amount--balance" : "bill-amount--paid"}`}>
                        {p.amount < 0 ? `-${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="bill-method-cell">
                        <PayMethodIcon method={p.method} />
                        <span className="bill-method-txt">{p.method}</span>
                      </div>
                    </td>
                    <td>
                      <div className="bill-date-cell"><FaCalendarAlt className="mini-icon" />{formatDate(p.date)}</div>
                    </td>
                    <td><span className="bill-ref-txt">{p.ref || "—"}</span></td>
                    <td><span className="bill-note-txt">{p.note || "—"}</span></td>
                    <td>
                      <span
                        className="bill-badge"
                        style={p.status === "Refund"
                          ? { backgroundColor: "#faf5ff", color: "#7c3aed" }
                          : { backgroundColor: "#dcfce7", color: "#15803d" }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="hosp-table-empty">
                      <FaMoneyBillWave className="empty-icon" />
                      <h3>No payment records</h3>
                      <p>Payments will appear here once recorded.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ INSURANCE / TPA SECTION ══════════════════ */}
      {activeSection === "insurance" && (
        <div className="hosp-card bill-table-card">
          <h3 className="hosp-card-title">Insurance &amp; TPA Claims</h3>
          <div className="hosp-table-wrapper">
            <table className="hosp-table bill-ins-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Insurance Provider</th>
                  <th>Policy No.</th>
                  <th style={{ textAlign: "right" }}>Claim Amount</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th style={{ textAlign: "right" }}>Insurance Paid</th>
                  <th style={{ textAlign: "right" }}>Patient Payable</th>
                  <th style={{ textAlign: "right" }}>Pending</th>
                  <th>Claim Status</th>
                  <th>Submitted</th>
                  <th>Settled</th>
                </tr>
              </thead>
              <tbody>
                {insuranceClaims.map((c) => {
                  const pending = Math.max(0, c.approvedAmount - c.insurancePaid);
                  const claimStyle = CLAIM_STATUS_COLORS[c.claimStatus] || { bg: "#f1f5f9", color: "#475569" };
                  return (
                    <tr key={c.id} className="bill-tr">
                      <td><span className="bill-id-text">{c.id}</span></td>
                      <td><span className="bill-enc-id">{c.invoiceId}</span></td>
                      <td>
                        <div className="bill-patient-cell">
                          <span className="hosp-pat-name">{c.patientName}</span>
                          <span className="hosp-pat-id">{c.patientId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="bill-ins-provider">
                          <FaShieldAlt className="ins-shield-icon" />
                          <span>{c.provider}</span>
                        </div>
                      </td>
                      <td><span className="bill-ref-txt">{c.policyNo}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount">{fmt(c.claimAmount)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--paid">{fmt(c.approvedAmount)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--paid">{fmt(c.insurancePaid)}</span></td>
                      <td style={{ textAlign: "right" }}><span className="bill-amount bill-amount--balance">{fmt(c.patientPayable)}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <span className={`bill-amount ${pending > 0 ? "bill-amount--balance" : "bill-amount--zero"}`}>{fmt(pending)}</span>
                      </td>
                      <td>
                        <span className="bill-badge" style={{ backgroundColor: claimStyle.bg, color: claimStyle.color }}>
                          {c.claimStatus}
                        </span>
                      </td>
                      <td>
                        <div className="bill-date-cell"><FaCalendarAlt className="mini-icon" />{formatDate(c.submittedDate)}</div>
                      </td>
                      <td>
                        <div className="bill-date-cell">
                          {c.settledDate ? <><FaCalendarAlt className="mini-icon" />{formatDate(c.settledDate)}</> : "—"}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ REPORTS SECTION ══════════════════ */}
      {activeSection === "reports" && (
        <div className="bill-reports">
          {/* Summary Cards */}
          <div className="bill-report-grid-2">
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaMoneyBillWave /> Total Collections</h4>
              <div className="bill-report-big-val">{fmt(reportData.totalCollected)}</div>
              <p className="bill-report-sub">All payments received (excl. refunds)</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaExclamationCircle /> Overdue Outstanding</h4>
              <div className="bill-report-big-val bill-report-big-val--danger">{fmt(reportData.overdueTotal)}</div>
              <p className="bill-report-sub">{reportData.overdueCount} overdue invoice(s) pending clearance</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaUndo /> Total Refunds</h4>
              <div className="bill-report-big-val bill-report-big-val--purple">{fmt(reportData.refundTotal)}</div>
              <p className="bill-report-sub">Refunds processed this period</p>
            </div>
            <div className="hosp-card bill-report-card">
              <h4 className="bill-report-card__title"><FaShieldAlt /> Insurance Claims</h4>
              <div className="bill-report-big-val bill-report-big-val--blue">{insuranceClaims.length}</div>
              <p className="bill-report-sub">Total TPA claims ({insuranceClaims.filter(c => c.claimStatus === "Settled").length} settled)</p>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className="hosp-card">
            <h4 className="hosp-card-title"><FaCreditCard style={{ marginRight: "0.4rem" }} />Payment Method Breakdown</h4>
            <div className="bill-method-breakdown">
              {Object.entries(reportData.methodTotals).map(([method, amt]) => {
                const total = Object.values(reportData.methodTotals).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
                const colors = {
                  "Cash": "#10b981", "UPI": "#8b5cf6", "Credit/Debit Card": "#0284c7",
                  "Net Banking": "#f59e0b", "Insurance / TPA": "#ef4444", "Cheque": "#64748b",
                };
                return (
                  <div key={method} className="bill-method-row">
                    <div className="bill-method-row__label">
                      <PayMethodIcon method={method} />
                      <span>{method}</span>
                    </div>
                    <div className="bill-method-row__bar-wrap">
                      <div className="bill-method-row__bar">
                        <div className="bill-method-row__fill" style={{ width: `${pct}%`, backgroundColor: colors[method] || "#64748b" }} />
                      </div>
                      <span className="bill-method-row__pct">{pct}%</span>
                    </div>
                    <span className="bill-method-row__amt">{fmt(amt)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Revenue & Doctor Revenue */}
          <div className="bill-report-grid-2">
            <div className="hosp-card">
              <h4 className="hosp-card-title">Department-wise Revenue</h4>
              <table className="bill-report-table">
                <thead><tr><th>Department</th><th style={{ textAlign: "right" }}>Collected</th></tr></thead>
                <tbody>
                  {Object.entries(reportData.deptTotals).sort((a, b) => b[1] - a[1]).map(([dept, amt]) => (
                    <tr key={dept}>
                      <td>{dept}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hosp-card">
              <h4 className="hosp-card-title">Doctor-wise Consultation Revenue</h4>
              <table className="bill-report-table">
                <thead><tr><th>Doctor</th><th style={{ textAlign: "right" }}>Revenue</th></tr></thead>
                <tbody>
                  {Object.entries(reportData.doctorTotals).sort((a, b) => b[1] - a[1]).map(([doc, amt]) => (
                    <tr key={doc}>
                      <td>{doc}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insurance Summary */}
          <div className="hosp-card">
            <h4 className="hosp-card-title">Insurance Claims Summary</h4>
            <table className="bill-report-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Claim ID</th>
                  <th style={{ textAlign: "right" }}>Claim Amt</th>
                  <th style={{ textAlign: "right" }}>Approved</th>
                  <th style={{ textAlign: "right" }}>Ins. Paid</th>
                  <th style={{ textAlign: "right" }}>Patient Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insuranceClaims.map((c) => {
                  const st = CLAIM_STATUS_COLORS[c.claimStatus] || {};
                  return (
                    <tr key={c.id}>
                      <td>{c.provider}</td>
                      <td>{c.id}</td>
                      <td style={{ textAlign: "right" }}>{fmt(c.claimAmount)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(c.approvedAmount)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(c.insurancePaid)}</td>
                      <td style={{ textAlign: "right" }}>{fmt(c.patientPayable)}</td>
                      <td>
                        <span className="bill-badge" style={{ backgroundColor: st.bg, color: st.color }}>{c.claimStatus}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════ VIEW INVOICE MODAL ══════════════════ */}
      {viewInvoice && (
        <div className="hosp-modal-overlay" onClick={() => setViewInvoice(null)}>
          <div className="hosp-modal bill-view-modal printable-invoice-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="hosp-modal-header no-print">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <div>
                  <h2>Tax Invoice</h2>
                  <span className="modal-ref-id">{viewInvoice.id}</span>
                </div>
              </div>
              <div className="bill-modal-header-actions">
                <button className="bill-btn-print-action" onClick={handlePrint}><FaPrint /> Print / PDF</button>
                {(viewInvoice.status === "Pending" || viewInvoice.status === "Partially Paid" || viewInvoice.status === "Overdue") && (
                  <button className="bill-btn-pay-action" onClick={() => { handleOpenPayment(viewInvoice); }}>
                    <FaMoneyBillWave /> Record Payment
                  </button>
                )}
                <button className="hosp-modal-close" onClick={() => setViewInvoice(null)}><FaTimes /></button>
              </div>
            </div>

            {/* Invoice Sheet */}
            <div className="invoice-sheet" id="printable-invoice-sheet">
              {/* Hospital Header */}
              <div className="inv-hosp-header">
                <div className="inv-hosp-brand">
                  <div className="inv-hosp-logo"><FaHospital /></div>
                  <div>
                    <h3 className="inv-hosp-name">City General Hospital</h3>
                    <p className="inv-hosp-sub">NABH Accredited Tertiary Healthcare Centre</p>
                    <span className="inv-hosp-reg">Reg: #HOSP-5021 · GSTIN: 32AABCC8901D1ZF · Ph: +91 484 288 0000</span>
                  </div>
                </div>
                <div className="inv-id-block">
                  <span className="inv-label-sm">OFFICIAL TAX INVOICE</span>
                  <p className="inv-num">{viewInvoice.id}</p>
                  <StatusBadge status={viewInvoice.status} size="md" />
                </div>
              </div>

              <div className="inv-divider" />

              {/* Patient & Invoice Meta */}
              <div className="inv-meta-grid">
                <div>
                  <span className="inv-meta-label">Billed To (Patient)</span>
                  <h4 className="inv-pat-name">{viewInvoice.patientName}</h4>
                  <p className="inv-meta-row-detail"><strong>Patient ID:</strong> <span className="hosp-pat-id">{viewInvoice.patientId}</span></p>
                  <p className="inv-meta-row-detail"><strong>Age / Gender:</strong> {viewInvoice.patientAge} yrs, {viewInvoice.patientGender}</p>
                  <p className="inv-meta-row-detail"><strong>Phone:</strong> {viewInvoice.patientPhone}</p>
                  <p className="inv-meta-row-detail"><strong>Email:</strong> {viewInvoice.patientEmail}</p>
                  <p className="inv-meta-row-detail"><strong>Address:</strong> {viewInvoice.patientAddress}</p>
                </div>
                <div>
                  <span className="inv-meta-label">Encounter / Admission</span>
                  <p className="inv-meta-row-detail"><strong>Encounter ID:</strong> {viewInvoice.encounterId}</p>
                  <p className="inv-meta-row-detail"><strong>Type:</strong> {viewInvoice.encounterType}</p>
                  <p className="inv-meta-row-detail"><strong>Department:</strong> {viewInvoice.department}</p>
                  <p className="inv-meta-row-detail"><strong>Attending Doctor:</strong> {viewInvoice.attendingDoctor}</p>
                  <p className="inv-meta-row-detail"><strong>Invoice Date:</strong> {formatDate(viewInvoice.invoiceDate)}</p>
                  <p className="inv-meta-row-detail"><strong>Due Date:</strong> {formatDate(viewInvoice.dueDate)}</p>
                  <p className="inv-meta-row-detail"><strong>Payment Mode:</strong> {viewInvoice.paymentMethod}</p>
                  {viewInvoice.insuranceProvider && (
                    <p className="inv-meta-row-detail"><strong>Insurance:</strong> {viewInvoice.insuranceProvider} · {viewInvoice.policyNumber}</p>
                  )}
                  <p className="inv-meta-row-detail"><strong>Billing Officer:</strong> {viewInvoice.billingOfficer}</p>
                </div>
              </div>

              {/* Itemized Charges */}
              <div className="inv-items-wrap">
                <table className="inv-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Service / Item Description</th>
                      <th>Category</th>
                      <th style={{ textAlign: "center" }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Unit Price</th>
                      <th style={{ textAlign: "right" }}>Discount</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="inv-item-desc">{item.description}</td>
                        <td><ServiceBadge category={item.category} /></td>
                        <td style={{ textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ textAlign: "right" }}>{fmt(item.unitPrice)}</td>
                        <td style={{ textAlign: "right", color: "#16a34a" }}>
                          {item.discount > 0 ? `-${fmt(item.discount)}` : "—"}
                        </td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Notes */}
              <div className="inv-summary-grid">
                {/* Notes & Payment History */}
                <div>
                  {viewInvoice.notes && (
                    <div className="inv-notes-block">
                      <span className="inv-notes-label">Notes</span>
                      <p className="inv-notes-text">{viewInvoice.notes}</p>
                    </div>
                  )}

                  {/* Payment History */}
                  {viewInvoice.paymentHistory?.length > 0 && (
                    <div className="inv-pay-history">
                      <span className="inv-notes-label">Payment History</span>
                      <table className="inv-hist-table">
                        <thead>
                          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr>
                        </thead>
                        <tbody>
                          {viewInvoice.paymentHistory.map((p, i) => (
                            <tr key={i}>
                              <td>{formatDate(p.date)}</td>
                              <td className={p.amount < 0 ? "text-refund" : "text-paid"}>
                                {p.amount < 0 ? `-${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                              </td>
                              <td>{p.method}</td>
                              <td>{p.ref}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="inv-calc-card">
                  {(() => {
                    const subtotal = calcInvoiceSubtotal(viewInvoice);
                    const disc = viewInvoice.globalDiscount || 0;
                    const tax = viewInvoice.globalTax || 0;
                    const total = calcInvoiceTotal(viewInvoice);
                    const paid = viewInvoice.paidAmount || 0;
                    const bal = calcBalance(viewInvoice);
                    return (
                      <>
                        <div className="inv-calc-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                        {disc > 0 && <div className="inv-calc-row text-green"><span>Discount</span><span>-{fmt(disc)}</span></div>}
                        <div className="inv-calc-row"><span>GST / Tax</span><span>{tax > 0 ? fmt(tax) : "₹0 (Exempt)"}</span></div>
                        <div className="inv-calc-row inv-calc-row--total"><span>Total Amount</span><span>{fmt(total)}</span></div>
                        <div className="inv-calc-row inv-calc-row--paid"><span>Amount Paid</span><span className="text-paid">{fmt(paid)}</span></div>
                        <div className="inv-calc-row inv-calc-row--balance">
                          <span>Balance Due</span>
                          <span className={bal > 0 ? "text-balance" : "text-paid"}>{fmt(bal)}</span>
                        </div>
                        <div className="inv-calc-status-row">
                          <StatusBadge status={viewInvoice.status} size="md" />
                          {bal === 0 && viewInvoice.status === "Paid" && (
                            <span className="inv-paid-stamp"><FaCheckCircle /> Fully Settled</span>
                          )}
                        </div>
                        {viewInvoice.status === "Partially Paid" && (
                          <div className="inv-partial-bar">
                            <div className="inv-partial-bar__track">
                              <div className="inv-partial-bar__fill" style={{ width: `${Math.min(100, (paid / total) * 100).toFixed(1)}%` }} />
                            </div>
                            <span>{Math.round((paid / total) * 100)}% paid</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="inv-footer">
                <div>
                  <p className="inv-footer-addr">Medical Center Road, City General Campus, Kochi, Kerala – 682 011</p>
                  <p className="inv-footer-contact">billing@citygeneralhospital.com · www.citygeneralhospital.com</p>
                </div>
                <div className="inv-sign-block">
                  <div className="inv-sign-line" />
                  <span className="inv-sign-label">Authorized Billing Officer — {viewInvoice.billingOfficer}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="hosp-modal-actions no-print">
              {(viewInvoice.status === "Pending" || viewInvoice.status === "Partially Paid" || viewInvoice.status === "Overdue") && (
                <button className="hosp-btn-submit" onClick={() => { handleOpenPayment(viewInvoice); }}>
                  <FaMoneyBillWave />
                  {viewInvoice.status === "Partially Paid"
                    ? `Pay Balance — ${fmt(calcBalance(viewInvoice))}`
                    : "Record Full Payment"}
                </button>
              )}
              <button className="btn-modal-cancel" onClick={() => setViewInvoice(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ RECORD PAYMENT MODAL ══════════════════ */}
      {paymentTarget && (
        <div className="hosp-modal-overlay" onClick={() => setPaymentTarget(null)}>
          <div className="hosp-modal bill-pay-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaMoneyBillWave className="modal-header-icon" />
                <div>
                  <h2>Record Payment</h2>
                  <span className="modal-ref-id">{paymentTarget.id} · {paymentTarget.patientName}</span>
                </div>
              </div>
              <button className="hosp-modal-close" onClick={() => setPaymentTarget(null)}><FaTimes /></button>
            </div>

            <div className="bill-pay-modal__summary">
              <div className="bill-pay-modal__summary-item">
                <span>Total Invoice</span>
                <strong>{fmt(calcInvoiceTotal(paymentTarget))}</strong>
              </div>
              <div className="bill-pay-modal__summary-item">
                <span>Already Paid</span>
                <strong className="text-paid">{fmt(paymentTarget.paidAmount || 0)}</strong>
              </div>
              <div className="bill-pay-modal__summary-item bill-pay-modal__summary-item--highlight">
                <span>Balance Due</span>
                <strong className="text-balance">{fmt(calcBalance(paymentTarget))}</strong>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="hosp-modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Payment Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    max={calcBalance(paymentTarget)}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Payment Method *</label>
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Payment Date *</label>
                  <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm((p) => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="form-group half">
                  <label>Reference / Txn ID</label>
                  <input type="text" placeholder="e.g. GPAY-1234 / UTR / Receipt No." value={paymentForm.ref} onChange={(e) => setPaymentForm((p) => ({ ...p, ref: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Note</label>
                <input type="text" placeholder="Optional payment note" value={paymentForm.note} onChange={(e) => setPaymentForm((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <div className="hosp-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setPaymentTarget(null)}>Cancel</button>
                <button type="submit" className="hosp-btn-submit"><FaCheck /> Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ REFUND CONFIRMATION MODAL ══════════════════ */}
      {refundTarget && (
        <div className="hosp-modal-overlay" onClick={() => setRefundTarget(null)}>
          <div className="hosp-modal bill-refund-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaUndo className="modal-header-icon" style={{ color: "#7c3aed" }} />
                <h2>Confirm Refund</h2>
              </div>
              <button className="hosp-modal-close" onClick={() => setRefundTarget(null)}><FaTimes /></button>
            </div>
            <div className="bill-refund-modal__body">
              <p>Issue a full refund for invoice <strong>{refundTarget.id}</strong>?</p>
              <div className="bill-refund-modal__amount">
                Refund Amount: <strong>{fmt(refundTarget.paidAmount || 0)}</strong>
              </div>
              <p className="bill-refund-modal__warn">This action will mark the invoice as <em>Refunded</em> and cannot be undone.</p>
            </div>
            <div className="hosp-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setRefundTarget(null)}>Cancel</button>
              <button className="hosp-btn-submit bill-btn-refund-confirm" onClick={() => handleRefund(refundTarget)}>
                <FaUndo /> Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CREATE INVOICE MODAL ══════════════════ */}
      {showCreateModal && (
        <div className="hosp-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="hosp-modal bill-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hosp-modal-header">
              <div className="modal-title-wrap">
                <FaFileInvoiceDollar className="modal-header-icon" />
                <h2>Create New Invoice</h2>
              </div>
              <button className="hosp-modal-close" onClick={() => setShowCreateModal(false)}><FaTimes /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="hosp-modal-form bill-create-form">
              {/* Section: Patient */}
              <div className="bill-form-section">
                <div className="bill-form-section-title"><FaUserMd /> Patient &amp; Encounter Details</div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Patient Full Name *</label>
                    <input type="text" placeholder="e.g. Ramesh Kumar" value={invoiceForm.patientName} onChange={(e) => handleInvoiceFormChange("patientName", e.target.value)} required />
                  </div>
                  <div className="form-group half">
                    <label>Patient ID</label>
                    <input type="text" placeholder="e.g. PAT-4091 (auto if blank)" value={invoiceForm.patientId} onChange={(e) => handleInvoiceFormChange("patientId", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Age</label>
                    <input type="number" min="0" placeholder="Age" value={invoiceForm.patientAge} onChange={(e) => handleInvoiceFormChange("patientAge", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Gender</label>
                    <select value={invoiceForm.patientGender} onChange={(e) => handleInvoiceFormChange("patientGender", e.target.value)}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Phone</label>
                    <input type="text" placeholder="+91 XXXXX XXXXX" value={invoiceForm.patientPhone} onChange={(e) => handleInvoiceFormChange("patientPhone", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Email</label>
                    <input type="email" placeholder="patient@email.com" value={invoiceForm.patientEmail} onChange={(e) => handleInvoiceFormChange("patientEmail", e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" placeholder="Patient address" value={invoiceForm.patientAddress} onChange={(e) => handleInvoiceFormChange("patientAddress", e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Encounter / Admission ID</label>
                    <input type="text" placeholder="e.g. ENC-2026-A4501 (auto if blank)" value={invoiceForm.encounterId} onChange={(e) => handleInvoiceFormChange("encounterId", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Encounter Type</label>
                    <select value={invoiceForm.encounterType} onChange={(e) => handleInvoiceFormChange("encounterType", e.target.value)}>
                      {["OP Visit", "Online Consultation", "Inpatient Admission", "Emergency", "ICU Admission", "Pharmacy Visit", "Radiology Visit", "Lab Visit"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Department</label>
                    <input type="text" placeholder="e.g. Cardiology" value={invoiceForm.department} onChange={(e) => handleInvoiceFormChange("department", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Attending Doctor</label>
                    <input type="text" placeholder="e.g. Dr. Suresh Menon" value={invoiceForm.attendingDoctor} onChange={(e) => handleInvoiceFormChange("attendingDoctor", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Section: Billable Items */}
              <div className="bill-form-section">
                <div className="bill-form-section-title" style={{ justifyContent: "space-between" }}>
                  <span><FaListAlt /> Billable Services &amp; Items</span>
                  <button type="button" className="bill-btn-add-item" onClick={addItem}><FaPlus /> Add Item</button>
                </div>
                <div className="bill-items-builder">
                  <div className="bill-items-builder__header">
                    <span style={{ flex: 3 }}>Description</span>
                    <span style={{ flex: 2 }}>Category</span>
                    <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
                    <span style={{ flex: 1.2, textAlign: "right" }}>Unit Price</span>
                    <span style={{ flex: 1, textAlign: "right" }}>Discount</span>
                    <span style={{ flex: 1.2, textAlign: "right" }}>Amount</span>
                    <span style={{ width: "32px" }}></span>
                  </div>
                  {invoiceForm.items.map((item, idx) => (
                    <div key={item.id} className="bill-items-builder__row">
                      <input
                        style={{ flex: 3 }}
                        type="text"
                        placeholder="Service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        required
                      />
                      <select
                        style={{ flex: 2 }}
                        value={item.category}
                        onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                      >
                        {SERVICE_CATEGORIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <input
                        style={{ flex: 1, textAlign: "center" }}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      />
                      <input
                        style={{ flex: 1.2, textAlign: "right" }}
                        type="number"
                        min="0"
                        placeholder="₹"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                      />
                      <input
                        style={{ flex: 1, textAlign: "right" }}
                        type="number"
                        min="0"
                        placeholder="₹"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                      <span style={{ flex: 1.2, textAlign: "right", fontWeight: 700, fontSize: "0.84rem", paddingTop: "0.1rem" }}>
                        {fmt(item.amount)}
                      </span>
                      <button
                        type="button"
                        className="bill-items-builder__remove"
                        onClick={() => removeItem(idx)}
                        disabled={invoiceForm.items.length === 1}
                        title="Remove item"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Billing Summary */}
              <div className="bill-form-section">
                <div className="bill-form-section-title"><FaReceipt /> Billing Summary &amp; Payment</div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Overall Discount (₹)</label>
                    <input type="number" min="0" value={invoiceForm.globalDiscount} onChange={(e) => handleInvoiceFormChange("globalDiscount", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Tax / GST (₹)</label>
                    <input type="number" min="0" value={invoiceForm.globalTax} onChange={(e) => handleInvoiceFormChange("globalTax", e.target.value)} />
                  </div>
                </div>

                {/* Live Total Calculator */}
                {(() => {
                  const subtotal = invoiceForm.items.reduce((s, it) => s + (it.amount || 0), 0);
                  const disc = parseFloat(invoiceForm.globalDiscount) || 0;
                  const tax = parseFloat(invoiceForm.globalTax) || 0;
                  const total = Math.max(0, subtotal - disc + tax);
                  const paid = parseFloat(invoiceForm.paidAmount) || 0;
                  const bal = Math.max(0, total - paid);
                  return (
                    <div className="bill-create-calc-strip">
                      <div className="bill-create-calc-item"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></div>
                      <div className="bill-create-calc-item text-green"><span>Discount</span><strong>-{fmt(disc)}</strong></div>
                      <div className="bill-create-calc-item"><span>Tax</span><strong>{fmt(tax)}</strong></div>
                      <div className="bill-create-calc-item bill-create-calc-item--total"><span>Invoice Total</span><strong>{fmt(total)}</strong></div>
                      <div className="bill-create-calc-item text-green"><span>Paid Now</span><strong>{fmt(paid)}</strong></div>
                      <div className="bill-create-calc-item bill-create-calc-item--balance"><span>Balance Due</span><strong>{fmt(bal)}</strong></div>
                    </div>
                  );
                })()}

                <div className="form-row">
                  <div className="form-group half">
                    <label>Amount Paid Now (₹)</label>
                    <input type="number" min="0" value={invoiceForm.paidAmount} onChange={(e) => handleInvoiceFormChange("paidAmount", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Payment Method</label>
                    <select value={invoiceForm.paymentMethod} onChange={(e) => handleInvoiceFormChange("paymentMethod", e.target.value)}>
                      {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                      <option value="Pending Selection">Pending Selection</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Invoice Date *</label>
                    <input type="date" value={invoiceForm.invoiceDate} onChange={(e) => handleInvoiceFormChange("invoiceDate", e.target.value)} required />
                  </div>
                  <div className="form-group half">
                    <label>Due Date</label>
                    <input type="date" value={invoiceForm.dueDate} onChange={(e) => handleInvoiceFormChange("dueDate", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Insurance Provider</label>
                    <input type="text" placeholder="e.g. Star Health Insurance (if applicable)" value={invoiceForm.insuranceProvider} onChange={(e) => handleInvoiceFormChange("insuranceProvider", e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Policy Number</label>
                    <input type="text" placeholder="Insurance policy number" value={invoiceForm.policyNumber} onChange={(e) => handleInvoiceFormChange("policyNumber", e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Billing Officer</label>
                    <select value={invoiceForm.billingOfficer} onChange={(e) => handleInvoiceFormChange("billingOfficer", e.target.value)}>
                      {["Priya Rajan", "Rajan Thomas", "Anitha S", "Sreedev Kumar", "Meera V"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>Notes</label>
                    <input type="text" placeholder="Any additional billing notes" value={invoiceForm.notes} onChange={(e) => handleInvoiceFormChange("notes", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="hosp-modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="hosp-btn-submit"><FaCheckCircle /> Generate &amp; Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
