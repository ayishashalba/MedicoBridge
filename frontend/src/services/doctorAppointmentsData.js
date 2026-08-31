// import { ENABLE_BACKEND_API } from "./apiConfig";

/* ================================================================
   doctorAppointmentsData.js — Dynamic Appointments & Timing Engine
   ================================================================ */

// Helper to format 12-hour time (e.g., "10:00 AM", "02:30 PM")
export function formatTime12h(date) {
  if (!date || isNaN(date.getTime())) return "10:00 AM";
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

// Helper to format date string for display (e.g. "August 29, 2026")
export function formatDateDisplay(date) {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Helper to generate dynamic sample appointments based on current system time
export function generateDynamicAppointments(baseDate = new Date()) {
  const getOffsetDateTime = (minutesOffset = 0, daysOffset = 0) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysOffset);
    d.setMinutes(d.getMinutes() + minutesOffset);
    return {
      date: formatDateDisplay(d),
      time: formatTime12h(d),
    };
  };

  return [
    {
      id: 1,
      patient: "Rahul Nair",
      initials: "RN",
      avatarColor: "#0d9488",
      patientId: "PT-1024",
      age: 32,
      gender: "Male",
      ...getOffsetDateTime(1), // Starting in 1 minute -> "Starting Soon" (Join Consultation Enabled + Reminder)
      type: "Online Consultation",
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
      ...getOffsetDateTime(30), // Starting in 30 mins -> "Upcoming" (Join Consultation Locked)
      type: "Online Consultation",
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
      ...getOffsetDateTime(0, -2), // 2 days ago -> Completed
      status: "Completed",
      type: "Online Consultation",
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
      ...getOffsetDateTime(0, 3), // In 3 days -> "Upcoming" (Join Consultation Locked)
      type: "Online Consultation",
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
      ...getOffsetDateTime(-90), // Scheduled 90 mins ago, not attended -> Automatically "Cancelled"
      type: "Hospital Visit",
      complaint: "Post-Surgery Cardiac Review",
      symptoms: "Shortness of breath on exertion",
    },

  ];
}

export const doctorAppointmentsList = generateDynamicAppointments();

/* ─── Robust Date/Time Parser ────────────────────────────────── */
export function parseAppointmentDateTime(dateInput, timeInput, now = new Date()) {
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  if (dateInput) {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      year = dateInput.getFullYear();
      month = dateInput.getMonth();
      day = dateInput.getDate();
    } else if (typeof dateInput === "string") {
      const lower = dateInput.trim().toLowerCase();
      if (lower === "today") {
        year = now.getFullYear();
        month = now.getMonth();
        day = now.getDate();
      } else if (lower === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        year = tomorrow.getFullYear();
        month = tomorrow.getMonth();
        day = tomorrow.getDate();
      } else if (lower === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        year = yesterday.getFullYear();
        month = yesterday.getMonth();
        day = yesterday.getDate();
      } else {
        const ymdMatch = dateInput.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (ymdMatch) {
          year = parseInt(ymdMatch[1], 10);
          month = parseInt(ymdMatch[2], 10) - 1;
          day = parseInt(ymdMatch[3], 10);
        } else {
          const parsed = new Date(dateInput);
          if (!isNaN(parsed.getTime())) {
            year = parsed.getFullYear();
            month = parsed.getMonth();
            day = parsed.getDate();
          }
        }
      }
    }
  }

  let hours = 0;
  let minutes = 0;
  if (timeInput && typeof timeInput === "string") {
    const timeMatch = timeInput.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

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
  } catch (e) { }
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
      group: "Upcoming",
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

  const apptDate = parseAppointmentDateTime(appointment.date, appointment.time, now);
  const diffMs = apptDate.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.ceil(diffSeconds / 60);

  const isToday =
    apptDate.getFullYear() === now.getFullYear() &&
    apptDate.getMonth() === now.getMonth() &&
    apptDate.getDate() === now.getDate();

  const isJoined = Boolean(
    joinedMap[String(appointment.id)] || appointment.hasJoined
  );

  // Standard duration is 30 mins unless specified
  const durationMinutes = appointment.durationMinutes || 30;
  const durationMs = durationMinutes * 60 * 1000;
  const isPassed = (now.getTime() - apptDate.getTime()) > durationMs;

  // 1. COMPLETED: If explicitly completed or completed in records
  if (
    appointment.status === "Completed" ||
    appointment.isCompleted ||
    joinedMap[String(appointment.id) + "_completed"]
  ) {
    return {
      status: "Completed",
      group: "Completed",
      badgeLabel: "Completed",
      badgeClass: "status-pill--completed",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: true,
      isCancelled: false,
      diffMinutes,
      diffSeconds,
      timeNotice: "Completed",
      reminderText: "This consultation has been completed.",
      message: "This consultation has already been completed.",
      buttonText: "View Prescription",
      scheduledTime: appointment.time || "",
      apptDate,
      isToday,
    };
  }

  // 2. EXPLICITLY CANCELLED:
  if (appointment.status === "Cancelled") {
    return {
      status: "Cancelled",
      group: "Cancelled",
      badgeLabel: "Cancelled",
      badgeClass: "status-pill--cancelled",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
      diffMinutes,
      diffSeconds,
      timeNotice: "Cancelled",
      reminderText: "This appointment was cancelled.",
      message: "This appointment was cancelled.",
      buttonText: "",
      scheduledTime: appointment.time || "",
      apptDate,
      isToday,
    };
  }

  // 3. ACTUALLY STARTED & ACTIVE CONSULTATION:
  // If the doctor has actually joined/started the consultation
  if (isJoined) {
    return {
      status: "Ongoing",
      group: isToday ? "Today" : "Upcoming",
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
      timeNotice: "Ongoing",
      reminderText: `Your consultation with ${appointment.patient} is currently active.`,
      message: `Your consultation with ${appointment.patient} was started and is currently ongoing. Scheduled at ${appointment.time}.`,
      scheduledTime: appointment.time,
      buttonText: "Join Consultation",
      apptDate,
      isToday,
    };
  }

  // 4. SCHEDULED TIME HAS PASSED & DOCTOR HAS NOT STARTED/JOINED:
  // If diffSeconds < 0 and !isJoined -> Automatically change status to Cancelled, disable Join
  if (diffSeconds < 0) {
    return {
      status: "Cancelled",
      group: "Cancelled",
      badgeLabel: "Cancelled",
      badgeClass: "status-pill--cancelled",
      canJoin: false,
      isUnlocked: false,
      isReady: false,
      isOngoing: false,
      isUpcoming: false,
      isCompleted: false,
      isCancelled: true,
      diffMinutes,
      diffSeconds,
      timeNotice: "Cancelled",
      reminderText: `Consultation at ${appointment.time} was cancelled as the scheduled time passed without being started.`,
      message: `The scheduled consultation time (${appointment.time}) has passed without being started by the doctor. The appointment has been automatically cancelled.`,
      buttonText: "",
      scheduledTime: appointment.time || "",
      apptDate,
      isToday,
    };
  }

  // 5. FUTURE APPOINTMENT (> 2 minutes before scheduled time):
  // Status: Upcoming, Join Consultation: locked/disabled
  if (diffSeconds > 120) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${diffMinutes}m`;
    const timeNotice = isToday ? `Starts in ${timeFormatted}` : `Starts at ${appointment.time}`;

    return {
      status: "Upcoming",
      group: isToday ? "Today" : "Upcoming",
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
      reminderText: `Your consultation with ${appointment.patient} starts in ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"
        }.`,
      message: `Consultation starts at ${appointment.time}. Join Consultation will unlock 2 minutes before scheduled time.`,
      scheduledTime: appointment.time,
      buttonText: "", // Locked
      apptDate,
      isToday,
    };
  }

  // 6. PRE-JOIN WINDOW (Within 2 minutes before scheduled time, 0 <= diffSeconds <= 120):
  // Status: Upcoming/Starting Soon, Join Consultation: enabled + reminder
  const minsLeft = Math.max(1, diffMinutes);
  return {
    status: "Upcoming",
    group: isToday ? "Today" : "Upcoming",
    badgeLabel: "Starting Soon",
    badgeClass: "status-pill--ready",
    canJoin: true,
    isUnlocked: true,
    isReady: true,
    isOngoing: false,
    isUpcoming: true,
    isCompleted: false,
    isCancelled: false,
    diffMinutes: minsLeft,
    diffSeconds,
    timeNotice: `Starts in ${diffSeconds}s`,
    reminderText: `Your consultation with ${appointment.patient} starts in ${minsLeft} minute${minsLeft === 1 ? "" : "s"
      }! Join is now available.`,
    message: `Your consultation with ${appointment.patient} starts in ${minsLeft} minute${minsLeft === 1 ? "" : "s"
      }. Join Consultation is now available.`,
    scheduledTime: appointment.time,
    buttonText: "Join Consultation",
    apptDate,
    isToday,
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
  if (ENABLE_BACKEND_API) {
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
    } catch (e) { }
  }

  return patientMedicalRecordsDatabase[patientId] || null;
}
