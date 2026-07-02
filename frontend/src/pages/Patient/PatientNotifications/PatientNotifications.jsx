import React from "react";
import { FaBell } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";
import "../../../components/PlaceholderPage/PlaceholderPage.css";

function PatientNotifications() {
  return (
    <PlaceholderPage
      icon={<FaBell />}
      title="Notifications"
      description="Stay updated with appointment reminders, prescription alerts, and health tips."
      color="#0d9488"
    />
  );
}

export default PatientNotifications;
