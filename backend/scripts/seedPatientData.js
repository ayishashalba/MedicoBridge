/**
 * MedicoBridge - Patient-Side MongoDB Development Seed Script
 * 
 * Creates valid, linked test data for testing all patient functionality.
 * Safe & Idempotent: Can be run multiple times without duplicating records.
 *
 * Usage:
 *   cd backend
 *   node scripts/seedPatientData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const LabReport = require('../models/LabReport');
const MedicalReport = require('../models/MedicalReport');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicobridge';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected successfully.\n');

  console.log('--- Seeding MedicoBridge Patient Test Data ---');

  // 1. Seed Hospital
  let hospital = await Hospital.findOne({ email: 'info@apollo-kochi.demo' });
  if (!hospital) {
    let hospUser = await User.findOne({ email: 'hospital@apollo-kochi.demo' });
    if (!hospUser) {
      hospUser = await User.create({
        name: 'Apollo Hospital Kochi Admin',
        email: 'hospital@apollo-kochi.demo',
        password: 'Password@123',
        role: 'Hospital',
        isVerified: true,
        status: 'active',
        city: 'Kochi',
      });
    }
    hospital = await Hospital.create({
      userId: hospUser._id,
      hospitalId: 'HOSP-1001',
      name: 'Apollo Hospital Kochi',
      email: 'info@apollo-kochi.demo',
      phone: '+91 484 2826 3000',
      regNumber: 'HOSP-REG-KL-8821',
      address: 'Plot 14, MG Road, Ernakulam',
      city: 'Kochi',
      state: 'Kerala',
      hospitalType: 'Super Specialty',
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
      status: 'verified',
    });
    console.log('Created Hospital: Apollo Hospital Kochi');
  } else {
    console.log('Reusing Hospital: Apollo Hospital Kochi');
  }

  // 2. Seed Pharmacy
  let pharmacy = await Pharmacy.findOne({ email: 'contact@apollo-pharmacy.demo' });
  if (!pharmacy) {
    let pharmUser = await User.findOne({ email: 'pharmacy@apollo-pharmacy.demo' });
    if (!pharmUser) {
      pharmUser = await User.create({
        name: 'Apollo Pharmacy Manager',
        email: 'pharmacy@apollo-pharmacy.demo',
        password: 'Password@123',
        role: 'Pharmacy',
        isVerified: true,
        status: 'active',
        city: 'Kochi',
      });
    }
    pharmacy = await Pharmacy.create({
      userId: pharmUser._id,
      pharmacyId: 'PHARM-2001',
      name: 'Apollo Pharmacy MG Road',
      email: 'contact@apollo-pharmacy.demo',
      phone: '+91 484 239 8812',
      licenseNumber: 'KL-PH-2024-991',
      address: 'Shop 4, City Centre, MG Road',
      city: 'Kochi',
      state: 'Kerala',
      type: 'Retail',
      status: 'verified',
    });
    console.log('Created Pharmacy: Apollo Pharmacy MG Road');
  } else {
    console.log('Reusing Pharmacy: Apollo Pharmacy MG Road');
  }

  // 3. Seed Doctors
  const doctorConfigs = [
    {
      name: 'Dr. Aisha Khan',
      email: 'dr.aisha@medicobridge.demo',
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD (Cardiology), DM',
      experience: '12 years',
      practiceType: 'Hospital',
      consultationFee: 800,
      city: 'Kochi',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    },
    {
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh@medicobridge.demo',
      specialization: 'Neurologist',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: '15 years',
      practiceType: 'Hospital',
      consultationFee: 900,
      city: 'Kochi',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'dr.sarah@medicobridge.demo',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: '9 years',
      practiceType: 'Clinic',
      clinicName: 'Skin & Glow Clinic',
      clinicAddress: '15 Marine Drive, Kochi',
      clinicCity: 'Kochi',
      consultationFee: 600,
      city: 'Kochi',
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      timeSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
    },
  ];

  const doctors = [];
  for (const cfg of doctorConfigs) {
    let doc = await Doctor.findOne({ email: cfg.email });
    if (!doc) {
      let docUser = await User.findOne({ email: cfg.email });
      if (!docUser) {
        docUser = await User.create({
          name: cfg.name,
          email: cfg.email,
          password: 'Password@123',
          role: 'Doctor',
          isVerified: true,
          status: 'active',
          city: cfg.city,
        });
      }

      const structuredSlots = [];
      cfg.availableDays.forEach((day) => {
        cfg.timeSlots.forEach((t) => {
          structuredSlots.push({ day, startTime: t, isAvailable: true });
        });
      });

      doc = await Doctor.create({
        userId: docUser._id,
        doctorId: `DR-${Math.floor(10000 + Math.random() * 90000)}`,
        name: cfg.name,
        email: cfg.email,
        phone: '+91 98451 22334',
        specialization: cfg.specialization,
        qualification: cfg.qualification,
        experience: cfg.experience,
        practiceType: cfg.practiceType,
        hospitalId: cfg.practiceType === 'Hospital' ? hospital._id : null,
        hospitalName: cfg.practiceType === 'Hospital' ? hospital.name : '',
        clinicName: cfg.clinicName || '',
        clinicAddress: cfg.clinicAddress || '',
        clinicCity: cfg.clinicCity || '',
        consultationFee: cfg.consultationFee,
        city: cfg.city,
        availableDays: cfg.availableDays,
        availableSlots: structuredSlots,
        status: 'verified',
        accountStatus: 'active',
        rating: 4.9,
      });
      console.log(`Created Doctor: ${cfg.name}`);
    } else {
      console.log(`Reusing Doctor: ${cfg.name}`);
    }
    doctors.push(doc);
  }

  // 4. Seed Patient User & Profile
  const patientEmail = 'patient@medicobridge.demo';
  let patientUser = await User.findOne({ email: patientEmail });
  if (!patientUser) {
    patientUser = await User.create({
      name: 'Rahul Sharma',
      email: patientEmail,
      password: 'Patient@123',
      role: 'Patient',
      phone: '+91 98765 43210',
      dob: new Date('1994-06-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      city: 'Kochi',
      address: 'Flat 4B, Palm Grove Apts, Marine Drive, Kochi, Kerala – 682031',
      isDonorAvailable: true,
      isVerified: true,
      status: 'active',
    });
    console.log(`Created Patient User: ${patientEmail}`);
  } else {
    console.log(`Reusing Patient User: ${patientEmail}`);
  }

  let patient = await Patient.findOne({ userId: patientUser._id });
  if (!patient) {
    patient = await Patient.create({
      userId: patientUser._id,
      patientId: 'PT-10021',
      name: 'Rahul Sharma',
      email: patientEmail,
      phone: '+91 98765 43210',
      dob: new Date('1994-06-15'),
      gender: 'Male',
      bloodGroup: 'O+',
      city: 'Kochi',
      address: 'Flat 4B, Palm Grove Apts, Marine Drive, Kochi, Kerala – 682031',
      isDonorAvailable: true,
      emergencyContact: {
        name: 'Priya Sharma',
        phone: '+91 98765 11223',
        relation: 'Spouse',
      },
      allergies: ['Penicillin', 'Dust'],
      chronicConditions: ['Mild Asthma'],
    });
    console.log('Created Patient Profile for Rahul Sharma');
  } else {
    // Ensure address is present
    if (!patient.address) {
      patient.address = 'Flat 4B, Palm Grove Apts, Marine Drive, Kochi, Kerala – 682031';
      patient.city = 'Kochi';
      await patient.save();
    }
    console.log('Reusing Patient Profile for Rahul Sharma');
  }

  // Helper date generators
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const pastWeek = new Date();
  pastWeek.setDate(today.getDate() - 7);

  // 5. Seed Appointments
  const appt1 = await Appointment.findOneAndUpdate(
    { appointmentId: 'APT-ONL-2026-101' },
    {
      appointmentId: 'APT-ONL-2026-101',
      patientId: patient._id,
      doctorId: doctors[0]._id,
      hospitalId: hospital._id,
      department: 'Cardiology',
      date: today,
      timeSlot: '11:00 AM',
      type: 'Online Consultation',
      status: 'In-Progress',
      reason: 'Routine Cardiology Follow-up',
      fee: 800,
      paymentStatus: 'Paid',
      notes: 'Please keep blood pressure readings ready.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Linked Consultation for online appointment
  await Consultation.findOneAndUpdate(
    { appointmentId: appt1._id },
    {
      consultationId: 'CON-2026-101',
      appointmentId: appt1._id,
      patientId: patient._id,
      doctorId: doctors[0]._id,
      hospitalId: hospital._id,
      status: 'In-Progress',
      meetingLink: 'https://meet.jit.si/MedicoBridge-Consultation-101',
      diagnosis: 'Stable Blood Pressure Under Management',
      advice: 'Continue medication as advised, monitor daily.',
      startedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const appt2 = await Appointment.findOneAndUpdate(
    { appointmentId: 'APT-CFM-2026-102' },
    {
      appointmentId: 'APT-CFM-2026-102',
      patientId: patient._id,
      doctorId: doctors[1]._id,
      hospitalId: hospital._id,
      department: 'Neurology',
      date: tomorrow,
      timeSlot: '02:30 PM',
      type: 'In-Person',
      status: 'Confirmed',
      reason: 'Mild Tension Headache Assessment',
      fee: 900,
      paymentStatus: 'Paid',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const appt3 = await Appointment.findOneAndUpdate(
    { appointmentId: 'APT-CMP-2026-103' },
    {
      appointmentId: 'APT-CMP-2026-103',
      patientId: patient._id,
      doctorId: doctors[2]._id,
      department: 'Dermatology',
      date: pastWeek,
      timeSlot: '11:00 AM',
      type: 'Online Consultation',
      status: 'Completed',
      reason: 'Seasonal Skin Rash & Itching',
      fee: 600,
      paymentStatus: 'Paid',
      prescription: true,
      rating: 5,
      feedback: 'Very thorough and helpful consultation!',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Cancelled appointment
  await Appointment.findOneAndUpdate(
    { appointmentId: 'APT-CNC-2026-104' },
    {
      appointmentId: 'APT-CNC-2026-104',
      patientId: patient._id,
      doctorId: doctors[0]._id,
      hospitalId: hospital._id,
      date: pastWeek,
      timeSlot: '04:00 PM',
      type: 'In-Person',
      status: 'Cancelled',
      reason: 'Checkup',
      fee: 800,
      paymentStatus: 'Pending',
      cancellationReason: 'Cancelled by patient due to schedule conflict',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Seeded Appointments across statuses (In-Progress, Confirmed, Completed, Cancelled)');

  // 6. Seed Prescription linked to Completed Appointment
  const prescription = await Prescription.findOneAndUpdate(
    { prescriptionId: 'RX-2026-8801' },
    {
      prescriptionId: 'RX-2026-8801',
      patientId: patient._id,
      doctorId: doctors[2]._id,
      medicines: [
        {
          name: 'Cetirizine 10mg',
          dosage: '1 tablet',
          frequency: 'Once daily at night',
          duration: '10 days',
          timing: 'After meals',
          instructions: 'Take with water before bedtime',
        },
        {
          name: 'Calamine Lotion 100ml',
          dosage: 'Apply topically',
          frequency: 'Twice daily',
          duration: '7 days',
          timing: 'Morning and evening',
          instructions: 'Apply gently over affected skin areas',
        },
      ],
      diagnosis: 'Acute Contact Dermatitis',
      advice: 'Avoid direct heat exposure. Use mild fragrance-free soap. Stay hydrated.',
      notes: 'Follow up in 2 weeks if rashes persist.',
      status: 'Active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Seeded Prescription: RX-2026-8801');

  // 7. Seed Medical Records
  await MedicalRecord.findOneAndUpdate(
    { title: 'Clinical Dermatology Consultation & Treatment Plan' },
    {
      patientId: patient._id,
      doctorId: doctors[2]._id,
      title: 'Clinical Dermatology Consultation & Treatment Plan',
      recordType: 'General',
      date: pastWeek,
      doctorName: doctors[2].name,
      hospitalName: 'Skin & Glow Clinic, Kochi',
      description: 'Patient presented with allergic rash on forearm. Responded well to oral antihistamines and topical soothing lotion.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await MedicalRecord.findOneAndUpdate(
    { title: 'Cardiology Health Check-up Summary' },
    {
      patientId: patient._id,
      doctorId: doctors[0]._id,
      hospitalId: hospital._id,
      title: 'Cardiology Health Check-up Summary',
      recordType: 'Discharge Summary',
      date: pastWeek,
      doctorName: doctors[0].name,
      hospitalName: hospital.name,
      description: 'Comprehensive cardiac assessment. Resting ECG within normal limits. Advised regular aerobic exercise and low sodium diet.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Seeded Medical Records');

  // 8. Seed Lab Reports
  await LabReport.findOneAndUpdate(
    { reportId: 'LAB-CBC-2026-001' },
    {
      reportId: 'LAB-CBC-2026-001',
      patientId: patient._id,
      hospitalId: hospital._id,
      doctorId: doctors[0]._id,
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      sampleType: 'Venous Blood',
      reportDate: pastWeek,
      results: [
        { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Normal' },
        { parameter: 'Total WBC Count', value: '7,200', unit: '/mcL', referenceRange: '4,500 - 11,000', status: 'Normal' },
        { parameter: 'Platelet Count', value: '250,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
        { parameter: 'RBC Count', value: '5.1', unit: 'million/mcL', referenceRange: '4.5 - 5.9', status: 'Normal' },
        { parameter: 'Packed Cell Volume (PCV)', value: '43.2', unit: '%', referenceRange: '40.0 - 50.0', status: 'Normal' },
      ],
      notes: 'All hematological parameters are within normal physiological range.',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 9. Seed Medical Reports (Imaging / Diagnostics)
  await MedicalReport.findOneAndUpdate(
    { reportId: 'REP-IMG-2026-001' },
    {
      reportId: 'REP-IMG-2026-001',
      patientId: patient._id,
      doctorId: doctors[0]._id,
      hospitalId: hospital._id,
      title: 'Chest X-Ray (PA View)',
      summary: 'Chest Radiograph — Normal cardiothoracic ratio, clear bilateral lung fields.',
      findings: 'Lungs are clear with no focal infiltrates, effusion, or pneumothorax. Heart size and mediastinum are normal.',
      recommendations: 'No active acute cardiopulmonary process.',
      reportDate: pastWeek,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Seeded Lab Report & Diagnostic Imaging Report');

  // 10. Seed Catalog Medicines
  const medicinesData = [
    {
      name: 'Paracetamol 650mg',
      genericName: 'Acetaminophen',
      category: 'Tablet',
      manufacturer: 'GlaxoSmithKline',
      description: 'Used for mild-to-moderate pain and reduction of fever.',
      dosageForm: 'Tablet',
      price: 35,
      stock: 120,
      requiresPrescription: false,
    },
    {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Capsule',
      manufacturer: 'Cipla Ltd.',
      description: 'Broad-spectrum penicillin antibiotic for bacterial infections.',
      dosageForm: 'Capsule',
      price: 145,
      stock: 65,
      requiresPrescription: true,
    },
    {
      name: 'Vitamin C 1000mg',
      genericName: 'Ascorbic Acid',
      category: 'Supplement',
      manufacturer: 'Abbott Healthcare',
      description: 'Antioxidant and immunity booster for daily wellness.',
      dosageForm: 'Tablet',
      price: 65,
      stock: 45,
      requiresPrescription: false,
    },
    {
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine Dihydrochloride',
      category: 'Tablet',
      manufacturer: 'Dr. Reddy Labs',
      description: 'Antihistamine used for relief of allergy symptoms and hay fever.',
      dosageForm: 'Tablet',
      price: 40,
      stock: 80,
      requiresPrescription: false,
    },
    {
      name: 'Azithromycin 500mg',
      genericName: 'Azithromycin',
      category: 'Tablet',
      manufacturer: 'Pfizer',
      description: 'Macrolide antibiotic for respiratory tract and skin infections.',
      dosageForm: 'Tablet',
      price: 210,
      stock: 30,
      requiresPrescription: true,
    },
  ];

  const seededMedicines = [];
  for (const m of medicinesData) {
    const med = await Medicine.findOneAndUpdate(
      { name: m.name },
      {
        ...m,
        pharmacyId: pharmacy._id,
        isAvailable: true,
        isHospital: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededMedicines.push(med);
  }
  console.log(`Seeded ${seededMedicines.length} Medicines in pharmacy catalog`);

  // 11. Seed Active Cart for Patient
  const cart = await Cart.findOneAndUpdate(
    { patientId: patient._id },
    {
      patientId: patient._id,
      items: [
        {
          medicineId: seededMedicines[0]._id,
          quantity: 2,
          unitPrice: seededMedicines[0].price,
          offerDiscount: 0,
          finalUnitPrice: seededMedicines[0].price,
          itemTotal: seededMedicines[0].price * 2,
        },
        {
          medicineId: seededMedicines[2]._id,
          quantity: 1,
          unitPrice: seededMedicines[2].price,
          offerDiscount: 0,
          finalUnitPrice: seededMedicines[2].price,
          itemTotal: seededMedicines[2].price,
        },
      ],
      subtotal: seededMedicines[0].price * 2 + seededMedicines[2].price,
      totalOfferDiscount: 0,
      couponCode: '',
      couponDiscount: 0,
      totalAmount: seededMedicines[0].price * 2 + seededMedicines[2].price,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Seeded Cart for Patient with ${cart.items.length} items`);

  // 12. Seed Patient Orders
  const order1 = await Order.findOneAndUpdate(
    { orderId: 'MB-ORD-2026-901' },
    {
      orderId: 'MB-ORD-2026-901',
      patientId: patient._id,
      pharmacyId: pharmacy._id,
      items: [
        {
          medicineId: seededMedicines[0]._id,
          name: seededMedicines[0].name,
          quantity: 2,
          unitPrice: seededMedicines[0].price,
          finalPrice: seededMedicines[0].price,
          itemTotal: 70,
        },
        {
          medicineId: seededMedicines[2]._id,
          name: seededMedicines[2].name,
          quantity: 1,
          unitPrice: seededMedicines[2].price,
          finalPrice: seededMedicines[2].price,
          itemTotal: 65,
        },
      ],
      subtotal: 135,
      deliveryFee: 40,
      totalAmount: 175,
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      deliveryAddress: {
        fullName: patient.name,
        phone: patient.phone,
        street: patient.address,
        city: patient.city,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const order2 = await Order.findOneAndUpdate(
    { orderId: 'MB-ORD-2026-902' },
    {
      orderId: 'MB-ORD-2026-902',
      patientId: patient._id,
      pharmacyId: pharmacy._id,
      items: [
        {
          medicineId: seededMedicines[3]._id,
          name: seededMedicines[3].name,
          quantity: 1,
          unitPrice: seededMedicines[3].price,
          finalPrice: seededMedicines[3].price,
          itemTotal: 40,
        },
      ],
      subtotal: 40,
      deliveryFee: 40,
      totalAmount: 80,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      trackingNumber: 'TRK-IN-9921',
      deliveryAddress: {
        fullName: patient.name,
        phone: patient.phone,
        street: patient.address,
        city: patient.city,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Seeded Patient Orders (Delivered, Shipped)');

  // 13. Seed Notifications for Patient
  const notifData = [
    {
      title: 'Online Video Consultation Ready',
      message: 'Your teleconsultation session with Dr. Aisha Khan is scheduled for today at 11:00 AM. Click to join room.',
      type: 'Appointment',
      isRead: false,
    },
    {
      title: 'Appointment Confirmed',
      message: 'Your in-person appointment with Dr. Rajesh Kumar has been confirmed for tomorrow at 02:30 PM.',
      type: 'Appointment',
      isRead: false,
    },
    {
      title: 'Digital Prescription Available',
      message: 'Dr. Sarah Johnson has generated your digital prescription (RX-2026-8801). You can view and download it now.',
      type: 'Prescription',
      isRead: true,
    },
    {
      title: 'Pharmacy Order Shipped',
      message: 'Your medicine order MB-ORD-2026-902 has been shipped and is expected to arrive within 1–2 days.',
      type: 'Order',
      isRead: true,
    },
  ];

  for (const n of notifData) {
    await Notification.findOneAndUpdate(
      { userId: patientUser._id, title: n.title },
      {
        userId: patientUser._id,
        recipientRole: 'Patient',
        ...n,
        isDismissed: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('Seeded 4 Real Notifications for Patient');

  // 14. Coupon
  await Coupon.findOneAndUpdate(
    { code: 'MEDICO20' },
    {
      code: 'MEDICO20',
      description: '20% off on all medicines',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 100,
      maxDiscount: 150,
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('\n======================================================');
  console.log('   SEED COMPLETE: ALL PATIENT DATA READY IN MONGODB   ');
  console.log('======================================================');
  console.log('Test Patient Credentials:');
  console.log('  Email:    patient@medicobridge.demo');
  console.log('  Password: Patient@123');
  console.log('  Patient ID:', patient.patientId);
  console.log('  MongoDB Patient _id:', patient._id.toString());
  console.log('\nAvailable Test Records:');
  console.log('  Online Consultation ID:', appt1._id.toString(), '(APT-ONL-2026-101)');
  console.log('  Confirmed Appt ID:     ', appt2._id.toString(), '(APT-CFM-2026-102)');
  console.log('  Completed Appt ID:     ', appt3._id.toString(), '(APT-CMP-2026-103)');
  console.log('  Prescription ID:       ', prescription._id.toString(), '(RX-2026-8801)');
  console.log('  Order 1 (Delivered):   ', order1._id.toString(), '(MB-ORD-2026-901)');
  console.log('  Order 2 (Shipped):     ', order2._id.toString(), '(MB-ORD-2026-902)');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
