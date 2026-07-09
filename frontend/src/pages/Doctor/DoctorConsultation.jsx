import React from "react";
import { FaVideo } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorConsultation() {
  return (
    <PlaceholderPage
      icon={<FaVideo />}
      title="Online Consultations"
      description="Start and join virtual teleconsultations, chat with patients, and review digital symptoms surveys."
      color="#0d9488"
    />
  );
}

export default DoctorConsultation;
