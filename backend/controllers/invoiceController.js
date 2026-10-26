const Invoice = require('../models/Invoice');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const { createNotification } = require('../services/notificationService');
const mongoose = require('mongoose');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

// ── NORMALIZER ─────────────────────────────────────────────────────────────
const normalizeInvoice = (raw) => {
  const inv = raw.toObject ? raw.toObject() : raw;
  const id = inv.invoiceId || `INV-${String(inv._id).slice(-6).toUpperCase()}`;

  // Normalize items
  let items = [];
  if (Array.isArray(inv.items) && inv.items.length > 0) {
    items = inv.items.map((it, idx) => ({
      id: it.id || idx + 1,
      description: it.description || 'Hospital Service',
      category: it.category || 'Other Services',
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      discount: Number(it.discount) || 0,
      tax: Number(it.tax) || 0,
      amount: Number(it.amount) || Math.max(0, (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0) - (Number(it.discount) || 0)),
    }));
  } else if (Array.isArray(inv.services) && inv.services.length > 0) {
    items = inv.services.map((s, idx) => ({
      id: idx + 1,
      description: s.serviceName || 'Hospital Service',
      category: 'Other Services',
      quantity: 1,
      unitPrice: Number(s.cost) || 0,
      discount: 0,
      tax: 0,
      amount: Number(s.cost) || 0,
    }));
  } else {
    items = [
      {
        id: 1,
        description: 'General Hospital Consultation',
        category: 'OP Consultation',
        quantity: 1,
        unitPrice: Number(inv.totalAmount) || 500,
        discount: 0,
        tax: 0,
        amount: Number(inv.totalAmount) || 500,
      },
    ];
  }

  const patientName =
    inv.patientName ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.name) ||
    'Patient';

  const patientId =
    inv.patientCustomId ||
    (inv.patientId && typeof inv.patientId === 'object' && (inv.patientId.patientId || String(inv.patientId._id))) ||
    (typeof inv.patientId === 'string' ? inv.patientId : 'PAT-4091');

  const patientPhone =
    inv.patientPhone ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.phone) ||
    '';

  const patientEmail =
    inv.patientEmail ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.email) ||
    '';

  const patientAddress =
    inv.patientAddress ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.address) ||
    '';

  const patientAge =
    inv.patientAge ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.age) ||
    35;

  const patientGender =
    inv.patientGender ||
    (inv.patientId && typeof inv.patientId === 'object' && inv.patientId.gender) ||
    'Male';

  const invoiceDate = inv.invoiceDate
    ? new Date(inv.invoiceDate).toISOString().split('T')[0]
    : inv.createdAt
      ? new Date(inv.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

  const dueDate = inv.dueDate
    ? new Date(inv.dueDate).toISOString().split('T')[0]
    : '';

  return {
    _id: inv._id,
    id,
    invoiceId: id,
    hospitalId: inv.hospitalId,
    patientMongoId: inv.patientId && typeof inv.patientId === 'object' ? inv.patientId._id : inv.patientId,
    patientName,
    patientId,
    patientAge,
    patientGender,
    patientPhone,
    patientEmail,
    patientAddress,
    encounterId: inv.encounterId || 'ENC-2026-OP01',
    encounterType: inv.encounterType || 'OP Visit',
    department: inv.department || 'General Medicine',
    attendingDoctor: inv.attendingDoctor || 'Dr. Suresh Menon',
    billingOfficer: inv.billingOfficer || 'Priya Rajan',
    invoiceDate,
    dueDate,
    paymentMethod: inv.paymentMethod || 'Cash',
    status: inv.paymentStatus || 'Pending',
    paymentStatus: inv.paymentStatus || 'Pending',
    insuranceProvider: inv.insuranceProvider || null,
    policyNumber: inv.policyNumber || null,
    items,
    globalDiscount: Number(inv.discount) || 0,
    globalTax: Number(inv.tax) || 0,
    subtotal: Number(inv.subtotal) || items.reduce((s, it) => s + it.amount, 0),
    totalAmount: Number(inv.totalAmount) || items.reduce((s, it) => s + it.amount, 0),
    paidAmount: Number(inv.paidAmount) || 0,
    refundAmount: Number(inv.refundAmount) || 0,
    paymentHistory: inv.paymentHistory || [],
    insuranceClaim: inv.insuranceClaim && inv.insuranceClaim.claimId ? inv.insuranceClaim : null,
    notes: inv.notes || '',
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
  };
};

// ── SEED INITIAL INVOICES IF HOSPITAL HAS NONE ──────────────────────────────
const seedHospitalInvoicesIfEmpty = async (hospitalId) => {
  const count = await Invoice.countDocuments({ hospitalId });
  if (count > 0) return;

  const sampleInvoices = [
    {
      invoiceId: "INV-2026-0901",
      hospitalId,
      patientName: "Ramesh Kumar",
      patientCustomId: "PAT-4091",
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
      invoiceDate: new Date("2026-08-22"),
      dueDate: new Date("2026-08-29"),
      paymentMethod: "Insurance / TPA",
      paymentStatus: "Overdue",
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
      subtotal: 165800,
      discount: 5000,
      tax: 0,
      totalAmount: 160800,
      paidAmount: 0,
      paymentHistory: [],
      notes: "Patient under Star Health TPA. Pre-authorization obtained. Claim submitted.",
      insuranceClaim: {
        claimId: "CLM-2026-001",
        invoiceId: "INV-2026-0901",
        patientName: "Ramesh Kumar",
        patientId: "PAT-4091",
        provider: "Star Health Insurance",
        policyNo: "SHI-2024-904321",
        claimAmount: 160800,
        approvedAmount: 150000,
        insurancePaid: 0,
        patientPayable: 160800,
        claimStatus: "Submitted",
        submittedDate: "2026-08-22",
        settledDate: null,
        tpaRef: "SHI-TPA-2026-4421",
      },
    },
    {
      invoiceId: "INV-2026-0902",
      hospitalId,
      patientName: "Sonia Sebastian",
      patientCustomId: "PAT-4092",
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
      invoiceDate: new Date("2026-08-20"),
      dueDate: new Date("2026-08-27"),
      paymentMethod: "Credit/Debit Card",
      paymentStatus: "Paid",
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
      subtotal: 52100,
      discount: 1500,
      tax: 0,
      totalAmount: 50600,
      paidAmount: 50600,
      paymentHistory: [
        { date: "2026-08-20", amount: 50600, method: "Credit/Debit Card", ref: "HDFC-TXN-449821", note: "Full payment at discharge" },
      ],
      notes: "Patient discharged. Full payment collected.",
    },
    {
      invoiceId: "INV-2026-0903",
      hospitalId,
      patientName: "Mohan Lal",
      patientCustomId: "PAT-4093",
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
      invoiceDate: new Date("2026-08-19"),
      dueDate: new Date("2026-09-05"),
      paymentMethod: "Net Banking",
      paymentStatus: "Partially Paid",
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
      subtotal: 82500,
      discount: 3000,
      tax: 0,
      totalAmount: 79500,
      paidAmount: 40000,
      paymentHistory: [
        { date: "2026-08-19", amount: 20000, method: "Net Banking", ref: "SBI-NEFT-20240819", note: "Advance payment on admission" },
        { date: "2026-08-22", amount: 20000, method: "Net Banking", ref: "SBI-NEFT-20240822", note: "Second instalment" },
      ],
      notes: "Patient has HDFC ERGO insurance. Partial co-pay paid. Balance pending on discharge.",
    },
    {
      invoiceId: "INV-2026-0904",
      hospitalId,
      patientName: "Leela Mathews",
      patientCustomId: "PAT-4094",
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
      invoiceDate: new Date("2026-08-24"),
      dueDate: new Date("2026-08-31"),
      paymentMethod: "Pending Selection",
      paymentStatus: "Pending",
      insuranceProvider: null,
      policyNumber: null,
      items: [
        { id: 1, description: "Senior Pulmonologist Consultation", category: "OP Consultation", quantity: 1, unitPrice: 1500, discount: 0, tax: 0, amount: 1500 },
        { id: 2, description: "High-Resolution Chest CT Scan", category: "X-Ray / Imaging", quantity: 1, unitPrice: 4200, discount: 0, tax: 0, amount: 4200 },
        { id: 3, description: "Complete Blood Count & ESR", category: "Laboratory Tests", quantity: 1, unitPrice: 800, discount: 0, tax: 0, amount: 800 },
        { id: 4, description: "Pulmonary Function Test", category: "Laboratory Tests", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
        { id: 5, description: "Prescribed Medications (7 Days)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 950, discount: 0, tax: 0, amount: 950 },
      ],
      subtotal: 9250,
      discount: 0,
      tax: 0,
      totalAmount: 9250,
      paidAmount: 0,
      paymentHistory: [],
      notes: "Follow-up appointment in 2 weeks.",
    },
    {
      invoiceId: "INV-2026-0905",
      hospitalId,
      patientName: "Aparna Nair",
      patientCustomId: "PAT-4095",
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
      invoiceDate: new Date("2026-08-25"),
      dueDate: new Date("2026-08-25"),
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      insuranceProvider: null,
      policyNumber: null,
      items: [
        { id: 1, description: "Amoxicillin 500mg (30 Caps)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 280, discount: 0, tax: 0, amount: 280 },
        { id: 2, description: "Pantoprazole 40mg (14 Tabs)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 120, discount: 0, tax: 0, amount: 120 },
        { id: 3, description: "Vitamin D3 Supplement (60 Caps)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 450, discount: 50, tax: 0, amount: 400 },
        { id: 4, description: "Cetirizine 10mg (10 Tabs)", category: "Pharmacy / Medicines", quantity: 1, unitPrice: 65, discount: 0, tax: 0, amount: 65 },
      ],
      subtotal: 865,
      discount: 0,
      tax: 0,
      totalAmount: 865,
      paidAmount: 865,
      paymentHistory: [
        { date: "2026-08-25", amount: 865, method: "Cash", ref: "CASH-250826-001", note: "Counter payment" },
      ],
      notes: "",
    },
    {
      invoiceId: "INV-2026-0906",
      hospitalId,
      patientName: "Thomas Kurian",
      patientCustomId: "PAT-4096",
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
      invoiceDate: new Date("2026-08-26"),
      dueDate: new Date("2026-08-26"),
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      insuranceProvider: null,
      policyNumber: null,
      items: [
        { id: 1, description: "Online Dermatology Consultation (MedicoBridge)", category: "Online Consultation", quantity: 1, unitPrice: 799, discount: 0, tax: 0, amount: 799 },
        { id: 2, description: "E-Prescription Fee", category: "Other Services", quantity: 1, unitPrice: 50, discount: 0, tax: 0, amount: 50 },
      ],
      subtotal: 849,
      discount: 0,
      tax: 0,
      totalAmount: 849,
      paidAmount: 849,
      paymentHistory: [
        { date: "2026-08-26", amount: 849, method: "UPI", ref: "GPAY-TXN-992231", note: "Paid via Google Pay before consultation" },
      ],
      notes: "Online consultation completed successfully.",
    },
    {
      invoiceId: "INV-2026-0907",
      hospitalId,
      patientName: "Deepak Menon",
      patientCustomId: "PAT-4097",
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
      invoiceDate: new Date("2026-08-18"),
      dueDate: new Date("2026-08-25"),
      paymentMethod: "Insurance / TPA",
      paymentStatus: "Overdue",
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
      subtotal: 231300,
      discount: 5000,
      tax: 0,
      totalAmount: 226300,
      paidAmount: 50000,
      paymentHistory: [
        { date: "2026-08-18", amount: 50000, method: "Net Banking", ref: "INS-PRE-AUTH-2026", note: "Insurance pre-authorization advance" },
      ],
      notes: "TPA claim submitted. Pending final settlement. Patient discharged.",
      insuranceClaim: {
        claimId: "CLM-2026-002",
        invoiceId: "INV-2026-0907",
        patientName: "Deepak Menon",
        patientId: "PAT-4097",
        provider: "National Insurance",
        policyNo: "NIC-2024-551892",
        claimAmount: 226300,
        approvedAmount: 180000,
        insurancePaid: 50000,
        patientPayable: 176300,
        claimStatus: "Partially Approved",
        submittedDate: "2026-08-18",
        settledDate: null,
        tpaRef: "NIC-TPA-2026-7712",
      },
    },
    {
      invoiceId: "INV-2026-0908",
      hospitalId,
      patientName: "Kavya Suresh",
      patientCustomId: "PAT-4098",
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
      invoiceDate: new Date("2026-08-27"),
      dueDate: new Date("2026-09-03"),
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      insuranceProvider: null,
      policyNumber: null,
      items: [
        { id: 1, description: "Gynaecologist Consultation", category: "OP Consultation", quantity: 1, unitPrice: 1200, discount: 0, tax: 0, amount: 1200 },
        { id: 2, description: "Pelvic Ultrasound", category: "X-Ray / Imaging", quantity: 1, unitPrice: 1800, discount: 0, tax: 0, amount: 1800 },
        { id: 3, description: "Hormonal Blood Panel", category: "Laboratory Tests", quantity: 1, unitPrice: 2200, discount: 0, tax: 0, amount: 2200 },
      ],
      subtotal: 5200,
      discount: 0,
      tax: 0,
      totalAmount: 5200,
      paidAmount: 5200,
      paymentHistory: [
        { date: "2026-08-27", amount: 5200, method: "UPI", ref: "PHONEPE-881234", note: "Full payment at counter" },
      ],
      notes: "",
    },
    {
      invoiceId: "INV-2026-0910",
      hospitalId,
      patientName: "Ananya Pillai",
      patientCustomId: "PAT-4100",
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
      invoiceDate: new Date("2026-08-25"),
      dueDate: new Date("2026-09-01"),
      paymentMethod: "Net Banking",
      paymentStatus: "Paid",
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
      subtotal: 52500,
      discount: 2000,
      tax: 0,
      totalAmount: 50500,
      paidAmount: 50500,
      paymentHistory: [
        { date: "2026-08-25", amount: 25000, method: "Net Banking", ref: "INS-BAJ-CLAIM-001", note: "Insurance partial payment" },
        { date: "2026-08-27", amount: 25500, method: "Net Banking", ref: "AXISBANK-NEFT-8831", note: "Patient co-pay settlement" },
      ],
      notes: "Mother and baby both healthy. Full payment cleared.",
      insuranceClaim: {
        claimId: "CLM-2026-003",
        invoiceId: "INV-2026-0910",
        patientName: "Ananya Pillai",
        patientId: "PAT-4100",
        provider: "Bajaj Allianz Health",
        policyNo: "BAJ-2025-112345",
        claimAmount: 50500,
        approvedAmount: 25000,
        insurancePaid: 25000,
        patientPayable: 25500,
        claimStatus: "Approved",
        submittedDate: "2026-08-25",
        settledDate: "2026-08-27",
        tpaRef: "BAJ-TPA-2026-1190",
      },
    },
    {
      invoiceId: "INV-2026-0912",
      hospitalId,
      patientName: "Rekha Chandran",
      patientCustomId: "PAT-4102",
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
      invoiceDate: new Date("2026-08-15"),
      dueDate: new Date("2026-08-22"),
      paymentMethod: "Insurance / TPA",
      paymentStatus: "Refunded",
      insuranceProvider: "New India Assurance",
      policyNumber: "NIA-2023-881100",
      items: [
        { id: 1, description: "ICU Stay (2 Days)", category: "ICU Charges", quantity: 2, unitPrice: 9000, discount: 0, tax: 0, amount: 18000 },
        { id: 2, description: "Nephrology Consultation", category: "Doctor Visit Charges", quantity: 2, unitPrice: 2000, discount: 0, tax: 0, amount: 4000 },
        { id: 3, description: "Dialysis Session", category: "Procedures & Surgeries", quantity: 1, unitPrice: 8000, discount: 0, tax: 0, amount: 8000 },
        { id: 4, description: "Lab - Renal Function Tests", category: "Laboratory Tests", quantity: 1, unitPrice: 2200, discount: 0, tax: 0, amount: 2200 },
      ],
      subtotal: 32200,
      discount: 0,
      tax: 0,
      totalAmount: 32200,
      paidAmount: 32200,
      refundAmount: 32200,
      paymentHistory: [
        { date: "2026-08-15", amount: 32200, method: "Insurance / TPA", ref: "NIA-CLAIM-2026-08", note: "Full payment by insurance" },
        { date: "2026-08-22", amount: -32200, method: "Insurance / TPA", ref: "NIA-REFUND-2026-08", note: "Refund issued — duplicate billing resolved" },
      ],
      notes: "Duplicate entry identified. Refund processed.",
      insuranceClaim: {
        claimId: "CLM-2026-004",
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
    },
  ];

  await Invoice.insertMany(sampleInvoices);
};

// ── GET HOSPITAL INVOICES ───────────────────────────────────────────────────
// @route   GET /api/hospital/invoices or /api/invoices/hospital
const getHospitalInvoices = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    await seedHospitalInvoicesIfEmpty(hospital._id);

    const { paymentStatus, search } = req.query;
    const query = { hospitalId: hospital._id };
    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Invoice.find(query)
      .populate('patientId', 'name phone email age gender address patientId')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    const normalized = invoices.map(normalizeInvoice);

    let filtered = normalized;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = normalized.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.patientName.toLowerCase().includes(q) ||
          inv.patientId.toLowerCase().includes(q) ||
          (inv.encounterId || '').toLowerCase().includes(q) ||
          (inv.department || '').toLowerCase().includes(q)
      );
    }

    return sendSuccess(res, 'Hospital invoices fetched successfully.', filtered);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital invoices.', error);
  }
};

// ── CREATE NEW INVOICE ──────────────────────────────────────────────────────
// @route   POST /api/hospital/invoices or /api/invoices
const createInvoice = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const {
      patientName,
      patientId,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      patientAddress,
      encounterId,
      encounterType,
      department,
      attendingDoctor,
      billingOfficer,
      items,
      globalDiscount = 0,
      globalTax = 0,
      paidAmount = 0,
      paymentMethod = 'Cash',
      invoiceDate,
      dueDate,
      insuranceProvider,
      policyNumber,
      notes,
    } = req.body;

    if (!patientName || !items || !Array.isArray(items) || items.length === 0) {
      return sendValidationError(res, 'Validation failed', [
        'Patient name and at least one billable item are required.',
      ]);
    }

    // Try linking with real Patient document if matching
    let linkedPatient = null;
    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      linkedPatient = await Patient.findById(patientId);
    }
    if (!linkedPatient && (patientPhone || patientEmail || patientName)) {
      linkedPatient = await Patient.findOne({
        $or: [
          ...(patientPhone ? [{ phone: patientPhone.trim() }] : []),
          ...(patientEmail ? [{ email: patientEmail.trim().toLowerCase() }] : []),
          ...(patientName ? [{ name: patientName.trim() }] : []),
        ],
      });
    }

    // Calculate line items
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const quantity = Number(it.quantity) || 1;
      const unitPrice = Number(it.unitPrice) || 0;
      const discount = Number(it.discount) || 0;
      const tax = Number(it.tax) || 0;
      const amount = Math.max(0, quantity * unitPrice - discount);
      subtotal += amount;
      return {
        id: it.id || idx + 1,
        description: it.description || 'Hospital Service',
        category: it.category || 'Other Services',
        quantity,
        unitPrice,
        discount,
        tax,
        amount,
      };
    });

    const disc = Number(globalDiscount) || 0;
    const tx = Number(globalTax) || 0;
    const totalAmount = Math.max(0, subtotal - disc + tx);
    const paid = Number(paidAmount) || 0;

    let paymentStatus = 'Pending';
    if (paid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'Paid';
    } else if (paid > 0) {
      paymentStatus = 'Partially Paid';
    }

    const newInvoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEncounterId = encounterId && encounterId.trim() ? encounterId.trim() : `ENC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatientId = patientId && patientId.trim() ? patientId.trim() : linkedPatient?.patientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentHistory = [];
    if (paid > 0) {
      paymentHistory.push({
        date: invoiceDate || new Date().toISOString().split('T')[0],
        amount: paid,
        method: paymentMethod || 'Cash',
        ref: `INIT-PMT-${Date.now().toString().slice(-4)}`,
        note: 'Initial payment on invoice creation',
      });
    }

    // Insurance claim if provided
    let insuranceClaim = null;
    if (insuranceProvider && insuranceProvider.trim()) {
      insuranceClaim = {
        claimId: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
        invoiceId: newInvoiceId,
        patientName: patientName.trim(),
        patientId: newPatientId,
        provider: insuranceProvider.trim(),
        policyNo: policyNumber ? policyNumber.trim() : 'POL-PENDING',
        claimAmount: totalAmount,
        approvedAmount: totalAmount,
        insurancePaid: paymentMethod === 'Insurance / TPA' ? paid : 0,
        patientPayable: paymentMethod === 'Insurance / TPA' ? Math.max(0, totalAmount - paid) : totalAmount,
        claimStatus: paid >= totalAmount ? 'Settled' : 'Submitted',
        submittedDate: invoiceDate || new Date().toISOString().split('T')[0],
        settledDate: paid >= totalAmount ? (invoiceDate || new Date().toISOString().split('T')[0]) : null,
        tpaRef: `TPA-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }

    const invoice = await Invoice.create({
      invoiceId: newInvoiceId,
      hospitalId: hospital._id,
      patientId: linkedPatient ? linkedPatient._id : null,
      patientName: patientName.trim(),
      patientCustomId: newPatientId,
      patientAge: Number(patientAge) || 30,
      patientGender: patientGender || 'Male',
      patientPhone: patientPhone || '',
      patientEmail: patientEmail || '',
      patientAddress: patientAddress || '',
      encounterId: newEncounterId,
      encounterType: encounterType || 'OP Visit',
      department: department || 'General Medicine',
      attendingDoctor: attendingDoctor || 'Dr. Suresh Menon',
      billingOfficer: billingOfficer || 'Priya Rajan',
      items: computedItems,
      subtotal,
      discount: disc,
      tax: tx,
      totalAmount,
      paidAmount: paid,
      paymentStatus,
      paymentMethod,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: notes || '',
      insuranceProvider: insuranceProvider || null,
      policyNumber: policyNumber || null,
      paymentHistory,
      insuranceClaim,
    });

    // If paid, also log a Payment record
    if (paid > 0) {
      await Payment.create({
        hospitalId: hospital._id,
        invoiceId: invoice._id,
        patientId: linkedPatient ? linkedPatient._id : null,
        patientName: patientName.trim(),
        amount: paid,
        paymentMethod: paymentMethod || 'Cash',
        reference: `INIT-PMT-${Date.now().toString().slice(-4)}`,
        note: 'Initial payment on invoice creation',
        paymentStatus: 'Completed',
        paymentDate: invoiceDate || new Date().toISOString().split('T')[0],
      });
    }

    // Notify patient if user linked
    if (linkedPatient?.userId) {
      await createNotification({
        userId: linkedPatient.userId,
        recipientRole: 'Patient',
        title: 'New Hospital Invoice Generated',
        message: `${hospital.name} has generated an invoice ${newInvoiceId} for ₹${totalAmount}.`,
        category: 'Billing & Invoices',
        type: 'Info',
        metadata: { invoiceId: invoice._id },
      }).catch((e) => console.warn('Notification non-fatal error:', e.message));
    }

    return sendSuccess(res, 'Invoice created successfully.', normalizeInvoice(invoice), 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create invoice.', error);
  }
};

// ── RECORD PAYMENT ──────────────────────────────────────────────────────────
// @route   POST /api/hospital/invoices/:id/payment or /api/invoices/:id/payment
const recordInvoicePayment = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, hospitalId: hospital._id }
      : { invoiceId: id, hospitalId: hospital._id };

    const invoice = await Invoice.findOne(query);
    if (!invoice) return sendNotFound(res, 'Invoice not found.');

    const { amount, method = 'Cash', date, ref = '', note = '' } = req.body;
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      return sendValidationError(res, 'Validation failed', ['A valid payment amount greater than 0 is required.']);
    }

    const currentPaid = Number(invoice.paidAmount) || 0;
    const newPaid = currentPaid + payAmt;
    const total = Number(invoice.totalAmount) || 0;
    const newStatus = newPaid >= total ? 'Paid' : 'Partially Paid';

    invoice.paidAmount = newPaid;
    invoice.paymentStatus = newStatus;
    invoice.paymentMethod = method;
    if (newStatus === 'Paid' && !invoice.paidAt) {
      invoice.paidAt = new Date();
    }

    const paymentDate = date || new Date().toISOString().split('T')[0];
    const txnRef = ref.trim() || `TXN-${Date.now().toString().slice(-6)}`;

    invoice.paymentHistory.push({
      date: paymentDate,
      amount: payAmt,
      method,
      ref: txnRef,
      note: note.trim(),
    });

    // If invoice has an insurance claim and method is Insurance, update it
    if (invoice.insuranceClaim && (method === 'Insurance / TPA' || invoice.insuranceClaim.provider)) {
      const insPaid = (Number(invoice.insuranceClaim.insurancePaid) || 0) + payAmt;
      invoice.insuranceClaim.insurancePaid = insPaid;
      if (insPaid >= (Number(invoice.insuranceClaim.approvedAmount) || total)) {
        invoice.insuranceClaim.claimStatus = 'Settled';
        invoice.insuranceClaim.settledDate = paymentDate;
      }
    }

    await invoice.save();

    // Create Payment log document
    await Payment.create({
      hospitalId: hospital._id,
      invoiceId: invoice._id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: payAmt,
      paymentMethod: method,
      reference: txnRef,
      note: note.trim(),
      paymentStatus: 'Completed',
      paymentDate,
    });

    return sendSuccess(res, `Payment of ₹${payAmt} recorded successfully.`, normalizeInvoice(invoice));
  } catch (error) {
    return sendServerError(res, 'Failed to record payment.', error);
  }
};

// ── ISSUE REFUND ────────────────────────────────────────────────────────────
// @route   POST /api/hospital/invoices/:id/refund or /api/invoices/:id/refund
const refundInvoice = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, hospitalId: hospital._id }
      : { invoiceId: id, hospitalId: hospital._id };

    const invoice = await Invoice.findOne(query);
    if (!invoice) return sendNotFound(res, 'Invoice not found.');

    const refundAmt = Number(invoice.paidAmount) || 0;
    invoice.paymentStatus = 'Refunded';
    invoice.refundAmount = refundAmt;

    const todayStr = new Date().toISOString().split('T')[0];
    const refundRef = `REFUND-${invoice.invoiceId || invoice._id}`;

    invoice.paymentHistory.push({
      date: todayStr,
      amount: -refundAmt,
      method: invoice.paymentMethod || 'Cash',
      ref: refundRef,
      note: 'Refund issued',
    });

    await invoice.save();

    await Payment.create({
      hospitalId: hospital._id,
      invoiceId: invoice._id,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
      amount: -refundAmt,
      paymentMethod: invoice.paymentMethod || 'Cash',
      reference: refundRef,
      note: 'Full refund issued',
      paymentStatus: 'Refunded',
      paymentDate: todayStr,
    });

    return sendSuccess(res, `Refund processed for invoice ${invoice.invoiceId}.`, normalizeInvoice(invoice));
  } catch (error) {
    return sendServerError(res, 'Failed to issue refund.', error);
  }
};

// ── SEND INVOICE NOTIFICATION ───────────────────────────────────────────────
// @route   POST /api/hospital/invoices/:id/send or /api/invoices/:id/send
const sendInvoiceNotification = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, hospitalId: hospital._id }
      : { invoiceId: id, hospitalId: hospital._id };

    const invoice = await Invoice.findOne(query).populate('patientId');
    if (!invoice) return sendNotFound(res, 'Invoice not found.');

    const recipientUserId = invoice.patientId?.userId || req.user._id;

    await createNotification({
      userId: recipientUserId,
      recipientRole: 'Patient',
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoiceId} for ₹${invoice.totalAmount} has been sent to ${invoice.patientEmail || invoice.patientName}.`,
      category: 'Billing & Invoices',
      type: 'Info',
      metadata: { invoiceId: invoice._id },
    }).catch((e) => console.warn('Notification log warning:', e.message));

    return sendSuccess(res, `Invoice ${invoice.invoiceId} sent to ${invoice.patientEmail || invoice.patientName}.`, {
      sentTo: invoice.patientEmail || invoice.patientName,
      invoiceId: invoice.invoiceId,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to send invoice.', error);
  }
};

// ── GET HOSPITAL PAYMENTS / TRANSACTIONS ────────────────────────────────────
// @route   GET /api/hospital/payments
const getHospitalPayments = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const invoices = await Invoice.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });

    const result = [];
    invoices.forEach((inv) => {
      (inv.paymentHistory || []).forEach((p, idx) => {
        result.push({
          paymentId: `PAY-${inv.invoiceId || inv._id}-${idx + 1}`,
          invoiceId: inv.invoiceId || String(inv._id),
          patientName: inv.patientName || 'Patient',
          patientId: inv.patientCustomId || 'PAT-0000',
          amount: p.amount,
          method: p.method,
          date: p.date,
          ref: p.ref,
          note: p.note,
          status: p.amount < 0 ? 'Refund' : 'Received',
        });
      });
    });

    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sendSuccess(res, 'Payments fetched successfully.', result);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch payments.', error);
  }
};

// ── GET HOSPITAL INSURANCE CLAIMS ───────────────────────────────────────────
// @route   GET /api/hospital/insurance-claims
const getHospitalInsuranceClaims = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const invoices = await Invoice.find({
      hospitalId: hospital._id,
      $or: [
        { 'insuranceClaim.claimId': { $ne: null } },
        { insuranceProvider: { $ne: null } },
      ],
    }).sort({ createdAt: -1 });

    const claims = [];
    invoices.forEach((inv) => {
      if (inv.insuranceClaim && inv.insuranceClaim.claimId) {
        claims.push({
          id: inv.insuranceClaim.claimId,
          invoiceId: inv.invoiceId,
          patientName: inv.patientName,
          patientId: inv.patientCustomId || 'PAT-0000',
          provider: inv.insuranceClaim.provider || inv.insuranceProvider,
          policyNo: inv.insuranceClaim.policyNo || inv.policyNumber,
          claimAmount: inv.insuranceClaim.claimAmount || inv.totalAmount,
          approvedAmount: inv.insuranceClaim.approvedAmount || inv.totalAmount,
          insurancePaid: inv.insuranceClaim.insurancePaid || 0,
          patientPayable: inv.insuranceClaim.patientPayable || 0,
          claimStatus: inv.insuranceClaim.claimStatus || 'Submitted',
          submittedDate: inv.insuranceClaim.submittedDate || inv.invoiceDate,
          settledDate: inv.insuranceClaim.settledDate || null,
          tpaRef: inv.insuranceClaim.tpaRef || '',
        });
      }
    });

    return sendSuccess(res, 'Insurance claims fetched successfully.', claims);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch insurance claims.', error);
  }
};

// ── GET PATIENT INVOICES ────────────────────────────────────────────────────
// @route   GET /api/patient/invoices
const getPatientInvoices = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const invoices = await Invoice.find({ patientId: patient._id })
      .populate('hospitalId', 'name address phone city')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Invoices fetched successfully.', invoices.map(normalizeInvoice));
  } catch (error) {
    return sendServerError(res, 'Failed to fetch invoices.', error);
  }
};

// ── UPDATE INVOICE STATUS ───────────────────────────────────────────────────
// @route   PUT /api/invoices/:id or /api/hospital/invoices/:id
const updateInvoiceStatus = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, hospitalId: hospital._id }
      : { invoiceId: id, hospitalId: hospital._id };

    const invoice = await Invoice.findOne(query);
    if (!invoice) return sendNotFound(res, 'Invoice not found.');

    const { paymentStatus, paymentMethod, notes } = req.body;
    const allowedStatuses = ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Refunded'];
    if (paymentStatus && !allowedStatuses.includes(paymentStatus)) {
      return sendValidationError(res, 'Validation failed', [
        `Payment status must be one of: ${allowedStatuses.join(', ')}`,
      ]);
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid' && !invoice.paidAt) {
        invoice.paidAt = new Date();
      }
    }
    if (paymentMethod !== undefined) invoice.paymentMethod = paymentMethod;
    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();
    return sendSuccess(res, `Invoice marked as ${invoice.paymentStatus}.`, normalizeInvoice(invoice));
  } catch (error) {
    return sendServerError(res, 'Failed to update invoice.', error);
  }
};

module.exports = {
  createInvoice,
  getPatientInvoices,
  getHospitalInvoices,
  updateInvoiceStatus,
  recordInvoicePayment,
  refundInvoice,
  sendInvoiceNotification,
  getHospitalPayments,
  getHospitalInsuranceClaims,
};
