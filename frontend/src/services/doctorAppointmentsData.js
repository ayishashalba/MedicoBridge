/* ================================================================
   doctorAppointmentsData.js — Shared Appointments & Timing Engine
   ================================================================ */

export const doctorAppointmentsList = [
  {
    id: 1,
    patient: "Rahul Nair",
    initials: "RN",
    avatarColor: "#0d9488",
    patientId: "PT-1024",
    age: 32,
    gender: "Male",
    date: "July 12, 2026",
    time: "10:00 AM",
    type: "Online Consultation",
    status: "Today",
    complaint: "Type 2 Diabetes Mellitus Follow-up",
    symptoms: "Fever, Headache, Body Pain",
  },
  {
    id: 2,
    patient: "Anjali Thomas",
    initials: "AT",
    avatarColor: "#7c3aed",
    patientId: "PT-1031",
    age: 27,
    gender: "Female",
    date: "July 15, 2026",
    time: "02:30 PM",
    type: "Hospital Visit",
    status: "Upcoming",
    complaint: "Chronic Migraine Review",
    symptoms: "Throbbing headache, light sensitivity, nausea",
  },
  {
    id: 3,
    patient: "Arun Kumar",
    initials: "AK",
    avatarColor: "#0284c7",
    patientId: "PT-1018",
    age: 41,
    gender: "Male",
    date: "July 10, 2026",
    time: "11:15 AM",
    type: "Online Consultation",
    status: "Completed",
    complaint: "Hypertension Check",
    symptoms: "Dizziness, chest tightness",
  },
  {
    id: 4,
    patient: "Meera Pillai",
    initials: "MP",
    avatarColor: "#d97706",
    patientId: "PT-1045",
    age: 35,
    gender: "Female",
    date: "July 18, 2026",
    time: "09:00 AM",
    type: "Online Consultation",
    status: "Upcoming",
    complaint: "Thyroid Follow-up",
    symptoms: "Fatigue, unexpected weight changes",
  },
  {
    id: 5,
    patient: "Suresh Babu",
    initials: "SB",
    avatarColor: "#dc2626",
    patientId: "PT-1052",
    age: 58,
    gender: "Male",
    date: "July 8, 2026",
    time: "04:00 PM",
    type: "Hospital Visit",
    status: "Cancelled",
    complaint: "Post-Surgery Cardiac Review",
    symptoms: "Shortness of breath on exertion",
  },
  {
    id: 6,
    patient: "Lakshmi Nair",
    initials: "LN",
    avatarColor: "#059669",
    patientId: "PT-1060",
    age: 46,
    gender: "Female",
    date: "July 12, 2026",
    time: "02:00 PM",
    type: "Online Consultation",
    status: "Today",
    complaint: "Migraine Consultation",
    symptoms: "Frequent severe headaches, dizziness",
  },
];

/* ─── Session-joined Tracking Helpers ────────────────────────── */
export function getJoinedConsultations() {
  try {
    const raw = sessionStorage.getItem("doctor_joined_consultations");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function markConsultationJoined(id) {
  try {
    const current = getJoinedConsultations();
    current[String(id)] = true;
    sessionStorage.setItem(
      "doctor_joined_consultations",
      JSON.stringify(current)
    );
  } catch (e) {}
}

/* ─── Helper: Get Live Consultation Timing & Action Status ────── */
export function getTodayConsultationStatus(
  appointment,
  now = new Date(),
  joinedMap = getJoinedConsultations()
) {
  if (!appointment) {
    return {
      status: "Unknown",
      badgeLabel: "Unknown",
      badgeClass: "status-pill--upcoming",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: false,
      timeNotice: "",
      message: "",
      buttonText: "",
    };
  }

  const isJoined = Boolean(
    joinedMap[String(appointment.id)] || appointment.hasJoined
  );

  if (appointment.status === "Completed") {
    return {
      status: "Completed",
      badgeLabel: "Completed",
      badgeClass: "status-pill--completed",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: true,
      isCancelled: false,
      timeNotice: "Completed",
      message: "This consultation has already been completed.",
      buttonText: "View Prescription",
      scheduledTime: appointment.time || "",
    };
  }

  if (appointment.status === "Cancelled") {
    return {
      status: "Cancelled",
      badgeLabel: "Cancelled",
      badgeClass: "status-pill--cancelled",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
      timeNotice: "Cancelled",
      message: "This appointment was cancelled.",
      buttonText: "View Details",
      scheduledTime: appointment.time || "",
    };
  }

  // Parse appointment date & time
  let apptDate;
  if (appointment.status === "Today") {
    apptDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    const parsed = new Date(appointment.date);
    if (!isNaN(parsed.getTime())) {
      apptDate = new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
      );
    } else {
      apptDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }

  // Parse time (e.g. "10:00 AM" or "02:00 PM")
  const timeMatch = appointment.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    apptDate.setHours(hours, minutes, 0, 0);
  }

  const diffMs = apptDate.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.ceil(diffSeconds / 60);

  const isFutureDate =
    apptDate.getFullYear() > now.getFullYear() ||
    (apptDate.getFullYear() === now.getFullYear() &&
      apptDate.getMonth() > now.getMonth()) ||
    (apptDate.getFullYear() === now.getFullYear() &&
      apptDate.getMonth() === now.getMonth() &&
      apptDate.getDate() > now.getDate());

  // 1. LOCKED / BEFORE 2 MINUTES PRE-JOIN WINDOW:
  // (More than 2 minutes before the scheduled time) -> Join button remains locked/disabled
  if (isFutureDate || diffSeconds > 120) {
    const timeNotice = `Starts at ${appointment.time}`;

    return {
      status: "Upcoming",
      badgeLabel: "Upcoming",
      badgeClass: "status-pill--upcoming",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: true,
      isCompleted: false,
      isCancelled: false,
      diffMinutes,
      diffSeconds,
      timeNotice,
      reminderText: `Your consultation with ${appointment.patient} starts in ${diffMinutes} minute${
        diffMinutes === 1 ? "" : "s"
      }.`,
      message: `Consultation starts at ${appointment.time}.`,
      scheduledTime: appointment.time,
      buttonText: "", // LOCKED: No Join button before 2 mins
      apptDate,
    };
  }

  // 2. UNLOCKED (Within 2-minute pre-join window or ongoing):
  // (diffSeconds <= 120: unlocks at exactly 2 minutes before start time)
  if (diffSeconds > 0 && diffSeconds <= 120) {
    // 2 minutes pre-join window
    return {
      status: "Ready to Join",
      badgeLabel: "Ready to Join",
      badgeClass: "status-pill--ready",
      canJoin: true,
      isUnlocked: true,
      isReady: true,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: false,
      diffMinutes: Math.max(1, diffMinutes),
      diffSeconds,
      timeNotice: `Starts in ${Math.max(1, diffMinutes)}m`,
      reminderText: `Your consultation with ${appointment.patient} starts in ${Math.max(
        1,
        diffMinutes
      )} minute${diffMinutes === 1 ? "" : "s"}.`,
      message: `Your consultation with ${appointment.patient} starts in ${Math.max(
        1,
        diffMinutes
      )} minute${diffMinutes === 1 ? "" : "s"}. Join is now available.`,
      scheduledTime: appointment.time,
      buttonText: "Join Consultation",
      apptDate,
    };
  }

  // 3. AT OR AFTER SCHEDULED TIME (Ongoing):
  return {
    status: "Ongoing",
    badgeLabel: "Ongoing",
    badgeClass: "status-pill--ongoing",
    canJoin: true,
    isUnlocked: true,
    isReady: false,
    isOngoing: true,
    isUpcoming: false,
    isCompleted: false,
    isCancelled: false,
    diffMinutes,
    diffSeconds,
    timeNotice: "In Progress",
    reminderText: `Your consultation with ${appointment.patient} is ongoing.`,
    message: `Your consultation with ${appointment.patient} is currently ongoing.`,
    scheduledTime: appointment.time,
    buttonText: "Join Consultation",
    apptDate,
  };
}

// Retain alias for backwards compatibility
export const getConsultationTimeStatus = getTodayConsultationStatus;

/* ─── Patient Medical Records Database (Patient-Specific) ─────── */
export const patientMedicalRecordsDatabase = {
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
        treatment:
          "Metformin 500mg, dietary counseling, moderate physical activity 30 mins/day",
        notes:
          "HbA1c stable at 6.8%. Fasting glucose under fair control. Advised repeat renal function test in 3 months.",
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
        notes:
          "Started on low-dose calcium channel blocker. Monitor daily home BP log.",
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
          {
            name: "Metformin 500mg",
            dosage: "1-0-1",
            duration: "90 Days",
            instructions: "After Food",
          },
          {
            name: "Amlodipine 5mg",
            dosage: "1-0-0",
            duration: "90 Days",
            instructions: "Morning after breakfast",
          },
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
          {
            name: "Amlodipine 5mg",
            dosage: "1-0-0",
            duration: "90 Days",
            instructions: "After Food",
          },
          {
            name: "Aspirin 75mg",
            dosage: "0-0-1",
            duration: "90 Days",
            instructions: "Night after dinner",
          },
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
          {
            parameter: "HbA1c (Glycated Hemoglobin)",
            value: "6.8%",
            normalRange: "4.0 - 5.6%",
            flag: "Borderline",
          },
          {
            parameter: "Fasting Blood Glucose",
            value: "118 mg/dL",
            normalRange: "70 - 100 mg/dL",
            flag: "High",
          },
          {
            parameter: "Post-Prandial Glucose",
            value: "152 mg/dL",
            normalRange: "< 140 mg/dL",
            flag: "Elevated",
          },
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
          {
            parameter: "Total Cholesterol",
            value: "185 mg/dL",
            normalRange: "< 200 mg/dL",
            flag: "Normal",
          },
          {
            parameter: "Serum Triglycerides",
            value: "142 mg/dL",
            normalRange: "< 150 mg/dL",
            flag: "Normal",
          },
          {
            parameter: "Serum Creatinine",
            value: "0.9 mg/dL",
            normalRange: "0.7 - 1.3 mg/dL",
            flag: "Normal",
          },
          {
            parameter: "eGFR",
            value: "98 mL/min",
            normalRange: "> 90 mL/min",
            flag: "Normal",
          },
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
        description:
          "Normal sinus rhythm, heart rate 74 bpm. Normal axis, no ischemic ST-T abnormalities or arrhythmia detected.",
      },
      {
        id: "DOC-4890",
        title: "Chest X-Ray (PA View)",
        date: "10 March 2026",
        hospital: "Apollo Hospital, Kochi",
        uploadedBy: "Dr. Rajesh K. Nair",
        type: "X-Ray",
        fileSize: "2.1 MB",
        description:
          "Clear lung fields bilaterally. Normal cardiothoracic ratio. No active pulmonary parenchymal lesions.",
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
        symptoms:
          "Unilateral pulsating headache, visual aura, photophobia and nausea",
        treatment:
          "Sumatriptan for acute episodes, Propranolol prophylaxis, lifestyle trigger avoidance",
        notes:
          "Advised to maintain a headache trigger journal. Avoid skipping meals and bright flickering lights.",
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
          {
            name: "Sumatriptan 50mg",
            dosage: "1 tab at onset",
            duration: "10 Days",
            instructions: "Take at start of migraine aura",
          },
          {
            name: "Naproxen 500mg",
            dosage: "1-0-1 as needed",
            duration: "5 Days",
            instructions: "After food for pain",
          },
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
          {
            parameter: "Hemoglobin",
            value: "12.8 g/dL",
            normalRange: "12.0 - 15.5 g/dL",
            flag: "Normal",
          },
          {
            parameter: "Total Leukocyte Count",
            value: "6,900 /μL",
            normalRange: "4,000 - 11,000 /μL",
            flag: "Normal",
          },
          {
            parameter: "ESR",
            value: "12 mm/hr",
            normalRange: "0 - 20 mm/hr",
            flag: "Normal",
          },
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
        description:
          "Normal MRI Brain scan. No structural lesions, mass effect, or intracranial hemorrhage. Normal ventricular system.",
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
        notes:
          "Cardiovascular examination normal. ECG showed sinus rhythm. Follow-up after 1 month.",
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
          {
            name: "Telmisartan 40mg",
            dosage: "1-0-0",
            duration: "30 Days",
            instructions: "Morning after breakfast",
          },
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
          {
            parameter: "Blood Urea",
            value: "24 mg/dL",
            normalRange: "15 - 45 mg/dL",
            flag: "Normal",
          },
          {
            parameter: "Serum Creatinine",
            value: "1.0 mg/dL",
            normalRange: "0.7 - 1.3 mg/dL",
            flag: "Normal",
          },
          {
            parameter: "Serum Potassium",
            value: "4.2 mEq/L",
            normalRange: "3.5 - 5.0 mEq/L",
            flag: "Normal",
          },
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
        treatment:
          "Levothyroxine Sodium 50mcg empty stomach early morning",
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
          {
            name: "Levothyroxine 50mcg",
            dosage: "1-0-0",
            duration: "60 Days",
            instructions: "Empty stomach with plain water",
          },
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
          {
            parameter: "TSH (Ultrasensitive)",
            value: "5.8 mIU/L",
            normalRange: "0.4 - 4.2 mIU/L",
            flag: "High",
          },
          {
            parameter: "Total T4",
            value: "7.1 μg/dL",
            normalRange: "4.8 - 11.6 μg/dL",
            flag: "Normal",
          },
          {
            parameter: "Total T3",
            value: "110 ng/dL",
            normalRange: "80 - 200 ng/dL",
            flag: "Normal",
          },
        ],
      },
    ],
    documents: [],
  },
};

/* ─── Helper: Fetch Patient Medical Records (API + Local Fallback) ─ */
export async function fetchPatientMedicalRecords(patientId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/patients/${patientId}/medical-records`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.records) {
        return data.records;
      }
    }
  } catch (e) {}

  return patientMedicalRecordsDatabase[patientId] || null;
}
