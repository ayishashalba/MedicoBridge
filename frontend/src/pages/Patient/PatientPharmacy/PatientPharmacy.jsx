import React from "react";
import { FaPills } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";
import "../../components/PlaceholderPage/PlaceholderPage.css";

function PatientPharmacy() {
  return (
    <PlaceholderPage
      icon={<FaPills />}
      title="Pharmacy"
      description="Order medications, track deliveries, and manage your prescriptions all in one place."
      color="#7c3aed"
    />
  );
}

export default PatientPharmacy;
