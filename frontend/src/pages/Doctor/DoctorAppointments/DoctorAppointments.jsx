import React from "react";
import { FaCalendarCheck } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorAppointments() {
  return (
    <PlaceholderPage
      icon={<FaCalendarCheck />}
      title="Appointments Manager"
      description="View your upcoming and past appointments, manage booking requests, and schedule clinic visits."
      color="#0284c7"
    />
  );
}

export default DoctorAppointments;
