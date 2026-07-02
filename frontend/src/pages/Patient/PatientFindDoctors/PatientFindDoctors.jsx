import React from "react";
import { FaStethoscope } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";
import "../../components/PlaceholderPage/PlaceholderPage.css";

function PatientFindDoctors() {
  return (
    <PlaceholderPage
      icon={<FaStethoscope />}
      title="Find Doctors"
      description="Search and connect with verified doctors and specialists across multiple medical fields."
      color="#7c3aed"
    />
  );
}

export default PatientFindDoctors;
