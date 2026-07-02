import React from "react";
import { FaCog } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";
import "../../../components/PlaceholderPage/PlaceholderPage.css";
function PatientSettings() {
  return (
    <PlaceholderPage
      icon={<FaCog />}
      title="Settings"
      description="Configure your account, notification preferences, privacy, and security settings."
      color="#475569"
    />
  );
}

export default PatientSettings;
