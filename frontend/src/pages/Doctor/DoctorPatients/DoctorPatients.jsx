import React from "react";
import { FaUsers } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorPatients() {
  return (
    <PlaceholderPage
      icon={<FaUsers />}
      title="My Patients"
      description="Access your patient registry, view patient profile summaries, histories, and ongoing treatment plans."
      color="#0f766e"
    />
  );
}

export default DoctorPatients;
