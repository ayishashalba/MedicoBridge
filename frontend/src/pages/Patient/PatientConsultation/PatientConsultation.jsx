import React from "react";
import { FaVideo } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";
import "../../components/PlaceholderPage/PlaceholderPage.css";

function PatientConsultation() {
  return (
    <PlaceholderPage
      icon={<FaVideo />}
      title="Online Consultation"
      description="Start a secure video consultation with your doctor from the comfort of your home."
      color="#059669"
    />
  );
}

export default PatientConsultation;
