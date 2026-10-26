const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Doctor = require('../models/Doctor');

async function seedAvailability() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicobridge';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    // Fetch existing doctors
    const doctors = await Doctor.find({}).limit(5);
    if (!doctors || doctors.length < 2) {
      console.error('Not enough doctors found in database.');
      process.exit(1);
    }

    console.log(`Found ${doctors.length} doctors.`);

    // Doctor 1
    // Available days: Monday, Wednesday, Friday
    // Time slots: 10:00 AM, 11:00 AM, 2:00 PM, 3:00 PM
    const doc1 = doctors[0];
    const doc1Days = ['Monday', 'Wednesday', 'Friday'];
    const doc1Times = ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'];
    const doc1Slots = doc1Days.flatMap((day) =>
      doc1Times.map((time) => ({
        day,
        startTime: time,
        endTime: time,
        isAvailable: true,
      }))
    );

    // Doctor 2
    // Available days: Tuesday, Thursday, Saturday
    // Time slots: 9:00 AM, 10:00 AM, 1:00 PM, 4:00 PM
    const doc2 = doctors[1];
    const doc2Days = ['Tuesday', 'Thursday', 'Saturday'];
    const doc2Times = ['9:00 AM', '10:00 AM', '1:00 PM', '4:00 PM'];
    const doc2Slots = doc2Days.flatMap((day) =>
      doc2Times.map((time) => ({
        day,
        startTime: time,
        endTime: time,
        isAvailable: true,
      }))
    );

    // Update Doctor 1
    doc1.availableDays = doc1Days;
    doc1.availableSlots = doc1Slots;
    await doc1.save();
    console.log(`Updated Doctor 1 (${doc1.name}, ID: ${doc1._id}, Practice: ${doc1.practiceType}):`);
    console.log(`  Days:`, doc1.availableDays);
    console.log(`  Slots count:`, doc1.availableSlots.length);

    // Update Doctor 2
    doc2.availableDays = doc2Days;
    doc2.availableSlots = doc2Slots;
    await doc2.save();
    console.log(`Updated Doctor 2 (${doc2.name}, ID: ${doc2._id}, Practice: ${doc2.practiceType}):`);
    console.log(`  Days:`, doc2.availableDays);
    console.log(`  Slots count:`, doc2.availableSlots.length);

    console.log('Sample availability successfully seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding availability:', error);
    process.exit(1);
  }
}

seedAvailability();
