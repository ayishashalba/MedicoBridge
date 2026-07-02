import React from "react";
import { FaUserCircle } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";
import "../../../components/PlaceholderPage/PlaceholderPage.css";

function PatientProfile() {
  return (
    <PlaceholderPage
      icon={<FaUserCircle />}
      title="Patient Profile"
      description="This page will be implemented in the next step."
      color="#0d9488"
    />
  );
}

export default PatientProfile;
