import React from "react";
import { FaTachometerAlt } from "react-icons/fa";
import PlaceholderPage from "../../components/PlaceholderPage/PlaceholderPage";

function DoctorDashboard() {
  return (
    <PlaceholderPage
      icon={<FaTachometerAlt />}
      title="Doctor Dashboard Home"
      description="View patient queues, medical history summaries, today's schedule at a glance, and consultation stats."
      color="#0d9488"
    />
  );
}

export default DoctorDashboard;
