import React from "react";
import { FaPills } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorPrescriptions() {
  return (
    <PlaceholderPage
      icon={<FaPills />}
      title="Prescriptions Builder"
      description="Write, view, and issue digital prescriptions directly to patients and participating pharmacies."
      color="#0284c7"
    />
  );
}

export default DoctorPrescriptions;
