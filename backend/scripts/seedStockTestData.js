const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');

/**
 * Development-only Seed Script for Medicine Stock Scenarios:
 * 1. Stock above threshold (> 10): "In Stock"
 * 2. Stock between 1 and threshold (<= 10): "Low Stock"
 * 3. Stock = 0: "Out of Stock"
 * 4. Explicitly unavailable (isAvailable: false): "Out of Stock"
 * 5. Missing / undefined stock: "Stock unavailable"
 */
async function seedStockTestData() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicobridge';
  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);

  // Find or create a default partner pharmacy for reference
  let pharmacy = await Pharmacy.findOne();
  let pharmacyId = pharmacy ? pharmacy._id : null;

  const testCases = [
    {
      name: 'Paracetamol 650mg',
      category: 'Tablet',
      genericName: 'Acetaminophen',
      manufacturer: 'GlaxoSmithKline',
      dosageForm: 'Tablet',
      price: 35,
      stock: 120, // In stock (> 10)
      isAvailable: true,
      description: 'Used for mild-to-moderate pain and reduction of fever.',
      requiresPrescription: false,
      pharmacyId,
    },
    {
      name: 'Amoxicillin 500mg',
      category: 'Capsule',
      genericName: 'Amoxicillin Trihydrate',
      manufacturer: 'Cipla Ltd.',
      dosageForm: 'Capsule',
      price: 145,
      stock: 65, // In stock (> 10)
      isAvailable: true,
      description: 'Broad-spectrum antibiotic used to treat bacterial infections.',
      requiresPrescription: true,
      pharmacyId,
    },
    {
      name: 'Omeprazole 20mg',
      category: 'Capsule',
      genericName: 'Omeprazole',
      manufacturer: "Dr. Reddy's Laboratories",
      dosageForm: 'Capsule',
      price: 55,
      stock: 6, // Low stock (between 1 and 10)
      isAvailable: true,
      description: 'Proton pump inhibitor used to treat heartburn and acid reflux.',
      requiresPrescription: false,
      pharmacyId,
    },
    {
      name: 'D3 Vitamin 60K',
      category: 'Supplement',
      genericName: 'Cholecalciferol',
      manufacturer: 'Cadila Healthcare Ltd.',
      dosageForm: 'Granules',
      price: 90,
      stock: 3, // Low stock (between 1 and 10)
      isAvailable: true,
      description: 'Vitamin D3 supplement for bone health and immunity.',
      requiresPrescription: false,
      pharmacyId,
    },
    {
      name: 'Cetirizine 10mg',
      category: 'Tablet',
      genericName: 'Cetirizine Hydrochloride',
      manufacturer: 'Strides Pharma',
      dosageForm: 'Tablet',
      price: 38,
      stock: 0, // Out of Stock (= 0)
      isAvailable: true,
      description: 'Antihistamine used to relieve allergy symptoms.',
      requiresPrescription: false,
      pharmacyId,
    },
    {
      name: 'Ibuprofen 400mg',
      category: 'Tablet',
      genericName: 'Ibuprofen',
      manufacturer: 'Abbott Healthcare',
      dosageForm: 'Tablet',
      price: 42,
      stock: 0,
      isAvailable: false, // Out of Stock (explicitly unavailable)
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain relief.',
      requiresPrescription: false,
      pharmacyId,
    },
  ];

  console.log(`Seeding/updating ${testCases.length} medicine stock test cases...`);

  for (const item of testCases) {
    const existing = await Medicine.findOne({ name: item.name });
    if (existing) {
      existing.stock = item.stock;
      existing.isAvailable = item.isAvailable;
      existing.price = item.price;
      existing.category = item.category;
      existing.genericName = item.genericName;
      existing.manufacturer = item.manufacturer;
      existing.dosageForm = item.dosageForm;
      existing.description = item.description;
      existing.requiresPrescription = item.requiresPrescription;
      if (pharmacyId && !existing.pharmacyId) existing.pharmacyId = pharmacyId;
      await existing.save();
      console.log(`✓ Updated "${item.name}" -> Stock: ${item.stock}, Available: ${item.isAvailable}`);
    } else {
      await Medicine.create({
        ...item,
        isHospital: false,
        approvalStatus: 'Approved',
      });
      console.log(`+ Created "${item.name}" -> Stock: ${item.stock}, Available: ${item.isAvailable}`);
    }
  }

  // Create an explicit missing stock test medicine if not exists
  const missingStockName = 'B-Complex Forte';
  const existingMissing = await Medicine.findOne({ name: missingStockName });
  if (!existingMissing) {
    await mongoose.connection.collection('medicines').insertOne({
      name: missingStockName,
      category: 'Supplement',
      genericName: 'Vitamin B Complex',
      manufacturer: 'Pfizer Ltd.',
      dosageForm: 'Tablet',
      price: 48,
      isAvailable: true,
      isHospital: false,
      approvalStatus: 'Approved',
      pharmacyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`+ Created "${missingStockName}" with missing/undefined stock via raw collection.`);
  } else {
    console.log(`✓ "${missingStockName}" exists for missing stock test.`);
  }

  console.log('\n=== Stock Test Data Seeding Complete ===');
  await mongoose.disconnect();
}

seedStockTestData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding stock test data:', err);
    process.exit(1);
  });
