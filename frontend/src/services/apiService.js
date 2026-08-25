import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Provided"
];

export const BLOOD_GROUP_FILTER_OPTIONS = [
  "All Blood Groups",
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
  "Not Provided"
];

/**
 * Filter data by blood group and search query according to role boundaries.
 */
export function filterRecords(records = [], { search = "", bloodGroup = "All Blood Groups", status = "All" } = {}) {
  return records.filter((item) => {
    // 1. Search Query
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.specialization && item.specialization.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q));

    // 2. Blood Group Filter
    let matchBloodGroup = true;
    if (bloodGroup && bloodGroup !== "All Blood Groups" && bloodGroup !== "All") {
      const itemBg = item.bloodGroup || "Not Provided";
      matchBloodGroup = itemBg === bloodGroup;
    }

    // 3. Status Filter
    let matchStatus = true;
    if (status && status !== "All Statuses" && status !== "All") {
      const itemStatus = item.status || item.accountStatus;
      matchStatus = itemStatus === status;
    }

    return matchSearch && matchBloodGroup && matchStatus;
  });
}

/**
 * Doctor GET patients with blood group filter
 */
export async function getDoctorPatients({ bloodGroup, search, doctorId = "DR-80241" } = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}/doctor/patients`, {
      params: { bloodGroup, search },
      headers: { "x-user-role": "Doctor", "x-user-id": doctorId },
    });
    return res.data;
  } catch (err) {
    console.warn("Backend server offline, using client-side service filtering fallback", err);
    return null;
  }
}

/**
 * Hospital GET patients with blood group filter
 */
export async function getHospitalPatients({ bloodGroup, search, status, hospitalId = "HOSP-5021" } = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}/hospital/patients`, {
      params: { bloodGroup, search, status },
      headers: { "x-user-role": "Hospital", "x-hospital-id": hospitalId },
    });
    return res.data;
  } catch (err) {
    console.warn("Backend server offline, using client-side service filtering fallback", err);
    return null;
  }
}

/**
 * Hospital GET staff/doctors with blood group filter
 */
export async function getHospitalStaff({ bloodGroup, search, status, hospitalId = "HOSP-5021" } = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}/hospital/staff`, {
      params: { bloodGroup, search, status },
      headers: { "x-user-role": "Hospital", "x-hospital-id": hospitalId },
    });
    return res.data;
  } catch (err) {
    console.warn("Backend server offline, using client-side service filtering fallback", err);
    return null;
  }
}

/**
 * Admin GET users with blood group filter
 */
export async function getAdminUsers({ tab, bloodGroup, search, status } = {}) {
  try {
    const res = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: { tab, bloodGroup, search, status },
      headers: { "x-user-role": "Admin" },
    });
    return res.data;
  } catch (err) {
    console.warn("Backend server offline, using client-side service filtering fallback", err);
    return null;
  }
}
