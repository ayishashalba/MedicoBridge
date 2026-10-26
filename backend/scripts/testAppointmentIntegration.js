const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const API_BASE = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('MEDICOBRIDGE APPOINTMENT & AVAILABILITY TEST SUITE');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicobridge');
  console.log('Connected to MongoDB.\n');

  // 1. Find or generate token for test patient
  const patientUser = await User.findOne({ email: 'medicobridgedemo@gmail.com' });
  if (!patientUser) {
    throw new Error('Test patient user medicobridgedemo@gmail.com not found');
  }
  const patientProfile = await Patient.findOne({ userId: patientUser._id });
  if (!patientProfile) {
    throw new Error('Test patient profile not found');
  }

  const token = jwt.sign(
    { id: patientUser._id, role: patientUser.role },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '1d' }
  );
  console.log(`[AUTH] Authenticated test patient: ${patientProfile.name} (${patientUser.email})`);

  // Find doctors
  const shibili = await Doctor.findOne({ name: /shibili/i });
  const shamsu = await Doctor.findOne({ name: /shamsu/i });
  const rejectedDoctor = await Doctor.findOne({ status: 'rejected' });

  console.log(`[DOCTORS] Found Dr. Shibili (${shibili?._id}), Dr. Shamsu (${shamsu?._id}), Rejected Doc (${rejectedDoctor?._id})\n`);

  let createdApptIds = [];

  try {
    // ------------------------------------------------------------------
    // TEST 1: Doctor availability for doctor with configured slots
    // ------------------------------------------------------------------
    console.log('--- TEST 1: Doctor with availability (Dr. Shibili) ---');
    const res1 = await fetch(`${API_BASE}/api/patient/doctors/${shibili._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data1 = await res1.json();
    console.log('Status:', res1.status);
    console.log('Available Days:', data1.data?.availableDays);
    console.log('Available Slots Count:', data1.data?.availableSlots?.length);
    if (!data1.data?.availableDays?.includes('Tuesday')) {
      throw new Error('TEST 1 FAILED: Expected Tuesday in availableDays');
    }
    console.log('✓ TEST 1 PASSED: Returned real saved availability\n');

    // ------------------------------------------------------------------
    // TEST 2: Doctor with NO configured availability (Dr. Shamsu)
    // ------------------------------------------------------------------
    console.log('--- TEST 2: Doctor with NO availability (Dr. Shamsu) ---');
    const res2 = await fetch(`${API_BASE}/api/patient/doctors/${shamsu._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data2 = await res2.json();
    console.log('Status:', res2.status);
    console.log('Available Days:', data2.data?.availableDays);
    console.log('Available Slots:', data2.data?.availableSlots);
    if (data2.data?.availableDays?.length !== 0 || data2.data?.availableSlots?.length !== 0) {
      throw new Error('TEST 2 FAILED: Expected empty days & slots for doctor without availability');
    }
    console.log('✓ TEST 2 PASSED: Real empty availability preserved without fake slots\n');

    // ------------------------------------------------------------------
    // TEST 3: Respect isAvailable: false
    // ------------------------------------------------------------------
    console.log('--- TEST 3: Respect isAvailable: false ---');
    // Temporarily add a disabled slot to Dr. Shibili
    const originalSlots = [...shibili.availableSlots];
    shibili.availableSlots.push({
      day: 'Tuesday',
      startTime: '08:00 AM',
      endTime: '08:00 AM',
      isAvailable: false,
    });
    await shibili.save();

    const res3 = await fetch(`${API_BASE}/api/patient/doctors/${shibili._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data3 = await res3.json();
    const hasDisabledSlot = data3.data?.availableSlots?.some(s => s.startTime === '08:00 AM');
    if (hasDisabledSlot) {
      throw new Error('TEST 3 FAILED: Disabled slot (isAvailable: false) was returned to patient!');
    }
    // Restore
    shibili.availableSlots = originalSlots;
    await shibili.save();
    console.log('✓ TEST 3 PASSED: Disabled slot (isAvailable: false) was correctly hidden from patient\n');

    // Helper: calculate a future date on a specific day of week
    function getFutureDateForDay(targetDayName) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetIndex = dayNames.indexOf(targetDayName);
      const now = new Date();
      let addedDays = (targetIndex - now.getDay() + 7) % 7;
      if (addedDays === 0) addedDays = 7; // next week
      const target = new Date();
      target.setDate(now.getDate() + addedDays);
      const yyyy = target.getFullYear();
      const mm = String(target.getMonth() + 1).padStart(2, '0');
      const dd = String(target.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    const validTuesday = getFutureDateForDay('Tuesday');
    const validThursday = getFutureDateForDay('Thursday');
    const invalidWednesday = getFutureDateForDay('Wednesday');

    // ------------------------------------------------------------------
    // TEST 4: Booking validation - Rejected/Unverified doctor
    // ------------------------------------------------------------------
    console.log('--- TEST 4: Reject unverified/rejected doctor booking ---');
    if (rejectedDoctor) {
      const res4 = await fetch(`${API_BASE}/api/appointments/book`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: rejectedDoctor._id,
          date: validTuesday,
          timeSlot: '10:00 AM',
        }),
      });
      const data4 = await res4.json();
      console.log('Response:', data4);
      if (res4.status !== 400 || data4.success !== false) {
        throw new Error('TEST 4 FAILED: Expected 400 rejection for unverified doctor');
      }
      console.log('✓ TEST 4 PASSED: Unverified doctor rejected\n');
    }

    // ------------------------------------------------------------------
    // TEST 5: Booking validation - Past date
    // ------------------------------------------------------------------
    console.log('--- TEST 5: Reject past date booking ---');
    const res5 = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: '2020-01-01',
        timeSlot: '9:00 AM',
      }),
    });
    const data5 = await res5.json();
    console.log('Response:', data5);
    if (res5.status !== 400 || !data5.errors?.some(e => e.includes('past'))) {
      throw new Error('TEST 5 FAILED: Expected past date error');
    }
    console.log('✓ TEST 5 PASSED: Past date rejected\n');

    // ------------------------------------------------------------------
    // TEST 6: Booking validation - Unavailable day (Wednesday for Dr. Shibili)
    // ------------------------------------------------------------------
    console.log('--- TEST 6: Reject unavailable day booking ---');
    const res6 = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: invalidWednesday,
        timeSlot: '9:00 AM',
      }),
    });
    const data6 = await res6.json();
    console.log('Response:', data6);
    if (res6.status !== 400 || !data6.errors?.some(e => e.includes('Wednesday'))) {
      throw new Error('TEST 6 FAILED: Expected unavailable day error');
    }
    console.log('✓ TEST 6 PASSED: Unavailable day rejected\n');

    // ------------------------------------------------------------------
    // TEST 7: Booking validation - Unavailable slot
    // ------------------------------------------------------------------
    console.log('--- TEST 7: Reject unavailable slot booking ---');
    const res7 = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: validTuesday,
        timeSlot: '11:45 PM',
      }),
    });
    const data7 = await res7.json();
    console.log('Response:', data7);
    if (res7.status !== 400 || !data7.errors?.some(e => e.includes('not available'))) {
      throw new Error('TEST 7 FAILED: Expected unavailable slot error');
    }
    console.log('✓ TEST 7 PASSED: Unavailable slot rejected\n');

    // ------------------------------------------------------------------
    // TEST 8: Valid Booking and Doctor Fee calculation
    // ------------------------------------------------------------------
    console.log('--- TEST 8: Successful booking with doctor fee calculation ---');
    // Ensure clean state for validTuesday 9:00 AM
    await Appointment.deleteMany({
      doctorId: shibili._id,
      timeSlot: '9:00 AM',
      date: {
        $gte: new Date(`${validTuesday}T00:00:00.000Z`),
        $lte: new Date(`${validTuesday}T23:59:59.999Z`),
      },
    });

    const res8 = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: validTuesday,
        timeSlot: '9:00 AM',
        fee: 99999, // Attempt to forge fee
        reason: 'Regular Checkup',
      }),
    });
    const data8 = await res8.json();
    console.log('Response status:', res8.status);
    console.log('Created appointment ID:', data8.data?._id);
    console.log('Fee assigned:', data8.data?.fee);
    if (res8.status !== 201 || !data8.data?._id) {
      throw new Error(`TEST 8 FAILED: Booking failed: ${JSON.stringify(data8)}`);
    }
    if (data8.data?.fee === 99999 || data8.data?.fee !== shibili.consultationFee) {
      throw new Error(`TEST 8 FAILED: Fee was not computed from doctor consultationFee (${shibili.consultationFee})! Got: ${data8.data?.fee}`);
    }
    createdApptIds.push(data8.data._id);
    console.log('✓ TEST 8 PASSED: Successfully booked with doctor fee\n');

    // ------------------------------------------------------------------
    // TEST 9: Duplicate Booking Prevention
    // ------------------------------------------------------------------
    console.log('--- TEST 9: Prevent duplicate booking for same doctor, date & slot ---');
    const res9 = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: validTuesday,
        timeSlot: '9:00 AM',
        reason: 'Another patient trying to book same slot',
      }),
    });
    const data9 = await res9.json();
    console.log('Duplicate booking response:', data9);
    if (res9.status !== 400 || !data9.errors?.some(e => e.includes('already booked'))) {
      throw new Error('TEST 9 FAILED: Duplicate booking was NOT prevented!');
    }
    console.log('✓ TEST 9 PASSED: Duplicate booking rejected\n');

    // ------------------------------------------------------------------
    // TEST 10: Booked slots endpoint
    // ------------------------------------------------------------------
    console.log('--- TEST 10: Booked slots query ---');
    const res10 = await fetch(`${API_BASE}/api/patient/doctors/${shibili._id}/booked-slots?date=${validTuesday}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data10 = await res10.json();
    console.log('Booked slots on', validTuesday, ':', data10.data?.bookedSlots);
    if (!data10.data?.bookedSlots?.includes('9:00 AM')) {
      throw new Error('TEST 10 FAILED: 9:00 AM not in booked slots');
    }
    console.log('✓ TEST 10 PASSED: Booked slot correctly returned in booked-slots API\n');

    // ------------------------------------------------------------------
    // TEST 11: Patient appointments listing
    // ------------------------------------------------------------------
    console.log('--- TEST 11: Patient appointments listing with populated doctor ---');
    const res11 = await fetch(`${API_BASE}/api/patient/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data11 = await res11.json();
    console.log('Appointments fetched count:', data11.data?.length);
    const myAppt = data11.data?.find(a => a._id === String(data8.data._id));
    if (!myAppt) {
      throw new Error('TEST 11 FAILED: Booked appointment not found in patient list');
    }
    if (!myAppt.doctorId?.name || !myAppt.doctorId?.specialization) {
      throw new Error('TEST 11 FAILED: Doctor details not properly populated');
    }
    console.log('Doctor name in listing:', myAppt.doctorId.name);
    console.log('Specialization in listing:', myAppt.doctorId.specialization);
    console.log('✓ TEST 11 PASSED: Patient listing populated correctly\n');

    // ------------------------------------------------------------------
    // TEST 12: Rescheduling with conflict prevention and valid update
    // ------------------------------------------------------------------
    console.log('--- TEST 12: Rescheduling ---');
    // First, try rescheduling to past date -> should fail
    const res12a = await fetch(`${API_BASE}/api/patient/appointments/${data8.data._id}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2020-01-01', timeSlot: '10:00 AM' }),
    });
    const data12a = await res12a.json();
    if (res12a.status !== 400) throw new Error('TEST 12a FAILED: Reschedule to past date was not rejected');
    console.log('✓ Reschedule past date rejected properly');

    // Try rescheduling to unavailable day (Wednesday) -> should fail
    const res12b = await fetch(`${API_BASE}/api/patient/appointments/${data8.data._id}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: invalidWednesday, timeSlot: '10:00 AM' }),
    });
    const data12b = await res12b.json();
    if (res12b.status !== 400) throw new Error('TEST 12b FAILED: Reschedule to unavailable day was not rejected');
    console.log('✓ Reschedule unavailable day rejected properly');

    // Valid reschedule to Thursday 10:00 AM
    await Appointment.deleteMany({
      doctorId: shibili._id,
      timeSlot: '10:00 AM',
      date: {
        $gte: new Date(`${validThursday}T00:00:00.000Z`),
        $lte: new Date(`${validThursday}T23:59:59.999Z`),
      },
    });

    const res12c = await fetch(`${API_BASE}/api/patient/appointments/${data8.data._id}/reschedule`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: validThursday, timeSlot: '10:00 AM' }),
    });
    const data12c = await res12c.json();
    console.log('Reschedule success response:', data12c.data?.timeSlot, data12c.data?.date);
    if (res12c.status !== 200 || data12c.data?.timeSlot !== '10:00 AM') {
      throw new Error('TEST 12c FAILED: Valid reschedule failed');
    }
    console.log('✓ TEST 12 PASSED: Rescheduled successfully\n');

    // ------------------------------------------------------------------
    // TEST 13: Cancellation & Slot Release
    // ------------------------------------------------------------------
    console.log('--- TEST 13: Cancellation and Slot Release ---');
    const res13 = await fetch(`${API_BASE}/api/patient/appointments/${data8.data._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancellationReason: 'Test cancellation' }),
    });
    const data13 = await res13.json();
    console.log('Cancel response status:', res13.status, 'Appointment status:', data13.data?.status);
    if (res13.status !== 200 || data13.data?.status !== 'Cancelled') {
      throw new Error('TEST 13 FAILED: Cancellation failed');
    }

    // Verify slot is released in booked-slots query
    const res13b = await fetch(`${API_BASE}/api/patient/doctors/${shibili._id}/booked-slots?date=${validThursday}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data13b = await res13b.json();
    console.log('Booked slots on Thursday after cancellation:', data13b.data?.bookedSlots);
    if (data13b.data?.bookedSlots?.includes('10:00 AM')) {
      throw new Error('TEST 13 FAILED: Cancelled slot was NOT released in booked-slots query!');
    }

    // Try booking the same slot again -> MUST succeed now that slot was released!
    const res13c = await fetch(`${API_BASE}/api/appointments/book`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: shibili._id,
        date: validThursday,
        timeSlot: '10:00 AM',
        reason: 'Re-booking released slot',
      }),
    });
    const data13c = await res13c.json();
    console.log('Re-booking released slot response status:', res13c.status);
    if (res13c.status !== 201) {
      throw new Error('TEST 13 FAILED: Released slot could not be re-booked!');
    }
    createdApptIds.push(data13c.data._id);
    console.log('✓ TEST 13 PASSED: Cancelled appointment successfully released slot and slot was re-booked!\n');

    console.log('====================================================');
    console.log('ALL 13 TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    // Cleanup test appointments created
    if (createdApptIds.length > 0) {
      console.log(`\nCleaning up ${createdApptIds.length} test appointment(s)...`);
      await Appointment.deleteMany({ _id: { $in: createdApptIds } });
      console.log('Cleanup complete.');
    }
    await mongoose.disconnect();
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST SUITE ERROR:', err);
  process.exit(1);
});
