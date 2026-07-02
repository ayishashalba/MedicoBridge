import React from "react";
import { FaUserCircle } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";
import "../../../components/PlaceholderPage/PlaceholderPage.css";

function PatientProfile() {
  return (
    <PlaceholderPage
      icon={<FaUserCircle />}
      title="My Profile"
      description="View and manage your personal details, health information, and account preferences."
      color="#0d9488"
    />
  );
}

export default PatientProfile;
