import React from "react";
import { FaCog } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorSettings() {
  return (
    <PlaceholderPage
      icon={<FaCog />}
      title="Settings & Preferences"
      description="Update security details, configure consultation rates, notifications rules, and dashboard layouts."
      color="#475569"
    />
  );
}

export default DoctorSettings;
