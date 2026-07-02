import React from "react";
import { Navigate } from "react-router-dom";

/**
 * /patient/dashboard redirects index to the dashboard home page.
 * This file is kept as the index redirect for the nested route.
 */
function PatientDashboard() {
  return <Navigate to="/patient/dashboard" replace />;
}

export default PatientDashboard;
