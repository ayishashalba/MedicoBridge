import React from "react";
import "./PlaceholderPage.css";

/**
 * Reusable placeholder for dashboard sub-pages not yet built.
 * Props: icon (ReactNode), title (string), description (string), color (string, optional)
 */
function PlaceholderPage({ icon, title, description, color = "#0d9488" }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="placeholder-icon" style={{ "--ph-color": color }}>
          {icon}
        </div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-desc">{description}</p>
        <div className="placeholder-badge">
          <span className="placeholder-badge-dot" />
          Coming in the next phase
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;
