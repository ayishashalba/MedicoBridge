import React from "react";
import { FaFolderOpen } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorMedicalRecords() {
  return (
    <PlaceholderPage
      icon={<FaFolderOpen />}
      title="Medical Records Portal"
      description="Access diagnostic lab results, imaging scans, immunization histories, and clinical notes secure database."
      color="#0d9488"
    />
  );
}

export default DoctorMedicalRecords;
