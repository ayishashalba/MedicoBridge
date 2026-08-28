// Utility for managing Patient's Saved Doctors in localStorage

const DEFAULT_SAVED = [
  {
    id: 1,
    name: "Dr. Aisha Khan",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology), DM",
    experience: 14,
    hospital: "Apollo Hospitals",
    city: "Mumbai",
    type: "hospital",
    fee: 800,
    rating: 4.9,
    reviews: 312,
    available: true,
    initials: "AK",
    color: "#7c3aed",
  },
];

export const getSavedDoctors = () => {
  try {
    const data = localStorage.getItem("savedDoctors");
    if (data === null) {
      localStorage.setItem("savedDoctors", JSON.stringify(DEFAULT_SAVED));
      return DEFAULT_SAVED;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SAVED;
  }
};

export const isDoctorSaved = (doctorId) => {
  const list = getSavedDoctors();
  return list.some((d) => String(d.id) === String(doctorId));
};

export const saveDoctorToStorage = (doctor) => {
  const list = getSavedDoctors();
  if (!list.some((d) => String(d.id) === String(doctor.id))) {
    const updated = [doctor, ...list];
    localStorage.setItem("savedDoctors", JSON.stringify(updated));
    window.dispatchEvent(new Event("savedDoctorsUpdated"));
    return true;
  }
  return false;
};

export const removeDoctorFromStorage = (doctorId) => {
  const list = getSavedDoctors();
  const updated = list.filter((d) => String(d.id) !== String(doctorId));
  localStorage.setItem("savedDoctors", JSON.stringify(updated));
  window.dispatchEvent(new Event("savedDoctorsUpdated"));
};

export const toggleSaveDoctorInStorage = (doctor) => {
  if (isDoctorSaved(doctor.id)) {
    removeDoctorFromStorage(doctor.id);
    return false;
  } else {
    saveDoctorToStorage(doctor);
    return true;
  }
};
