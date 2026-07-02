import React from "react";
import { FaCalendarCheck } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";
import "../../components/PlaceholderPage/PlaceholderPage.css";

function PatientAppointments() {
  return (
    <PlaceholderPage
      icon={<FaCalendarCheck />}
      title="My Appointments"
      description="View, schedule, and manage your upcoming and past medical appointments."
      color="#0284c7"
    />
  );
}

export default PatientAppointments;
