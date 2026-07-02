import React from "react";
import { FaFolderOpen } from "react-icons/fa";
import PlaceholderPage from "../../../components/PlaceholderPage/PlaceholderPage";
import "../../../components/PlaceholderPage/PlaceholderPage.css";

function PatientMedicalRecords() {
  return (
    <PlaceholderPage
      icon={<FaFolderOpen />}
      title="Medical Records"
      description="Access, download, and share your complete medical history, lab results, and reports."
      color="#f59e0b"
    />
  );
}

export default PatientMedicalRecords;
