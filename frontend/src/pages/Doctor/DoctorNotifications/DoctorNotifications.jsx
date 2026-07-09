import React from "react";
import { FaBell } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";

function DoctorNotifications() {
  return (
    <PlaceholderPage
      icon={<FaBell />}
      title="Notifications Center"
      description="Keep track of patient request alerts, upcoming consultation reminders, lab report updates, and platform news."
      color="#f59e0b"
    />
  );
}

export default DoctorNotifications;
