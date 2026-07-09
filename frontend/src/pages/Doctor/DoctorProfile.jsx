import React from "react";
import { FaUserMd } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorProfile() {
  return (
    <PlaceholderPage
      icon={<FaUserMd />}
      title="Doctor Profile"
      description="Manage your professional bio, specialties, contact details, clinic locations, and working hours."
      color="#0d9488"
    />
  );
}

export default DoctorProfile;
