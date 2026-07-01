import React, { useState } from "react";
import { FaSearch, FaUserMd, FaHospital, FaStethoscope } from "react-icons/fa";
import "./SearchSection.css";

function SearchSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [activeTab, setActiveTab] = useState("doctors"); // doctors, hospitals, specialties

  const filterTabs = [
    { id: "doctors", label: "Doctors", icon: <FaUserMd /> },
    { id: "hospitals", label: "Hospitals", icon: <FaHospital /> },
    { id: "specialties", label: "Specialties", icon: <FaStethoscope /> },
  ];

  const suggestions = [
    { text: "Cardiologist", tab: "specialties" },
    { text: "Neurologist", tab: "specialties" },
    { text: "General Physician", tab: "doctors" },
    { text: "Apollo Hospital", tab: "hospitals" },
  ];

  const handleSuggestionClick = (text, tab) => {
    setSearchTerm(text);
    setActiveTab(tab);
  };
  const normalizeSearch = (text) => {
    if (!text) return "";

    const map = {
      "skin doctor": "Dermatologist",
      "heart doctor": "Cardiologist",
      "brain doctor": "Neurologist",
    };

    return map[text.toLowerCase()] || text;
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const normalized = normalizeSearch(searchTerm);

    console.log({
      type: activeTab,
      query: normalized,
      location: location
    });
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "doctors":
        return "Search doctors, specialties, clinical roles...";
      case "hospitals":
        return "Search hospitals, medical centers, clinics...";
      case "specialties":
        return "Search medical specialties, treatments...";
      default:
        return "Search doctors, hospitals, specialties...";
    }
  };
  const showLocation = activeTab !== "specialties";

  return (
    <div className="search-section">
      <div className="search-card">
        {/* Filter Pills/Tabs */}
        <div className="search-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={`search-tab-pill ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-bar-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Location Input */}
          {showLocation && (
            <div className="location-wrapper">
              <input
                type="text"
                className="location-input"
                placeholder="Enter location (e.g., Kochi, Calicut)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
          <button type="submit" className="btn-primary search-submit-btn">
            Search
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="search-suggestions">
          <span className="suggestions-title">Common Searches:</span>
          <div className="suggestions-chips-group">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="suggestion-chip"
                onClick={() =>
                  handleSuggestionClick(suggestion.text, suggestion.tab)
                }
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchSection;
