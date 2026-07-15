import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaHeartbeat, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'login', 'register', or null

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".dropdown-wrapper")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toggleMobileMenu = () => {
    const nextState = !mobileMenuOpen;
    setMobileMenuOpen(nextState);
    setActiveDropdown(null);
    // Prevent scrolling on the page when mobile menu is open
    if (nextState) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    document.body.style.overflow = "";
  };

  const toggleDropdown = (type) => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(type);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="navbar-logo" onClick={closeAllMenus}>
          <div className="logo-icon-wrapper">
            <FaHeartbeat className="logo-icon" />
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-title">MedicoBridge</span>
            <span className="logo-tagline">Connecting Healthcare</span>
          </div>
        </Link>

        {/* Navigation Links and Actions Wrapper */}
        <div className={`nav-menu-wrapper ${mobileMenuOpen ? "active" : ""}`}>
          <ul className="nav-menu">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-links ${isActive ? "active-link" : ""}`
                }
                onClick={closeAllMenus}
                end
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <a
                href="/#find-doctors"
                className="nav-links"
                onClick={closeAllMenus}
              >
                Find Doctors
              </a>
            </li>
            <li className="nav-item">
              <NavLink
                to="/hospitals"
                className={({ isActive }) =>
                  `nav-links ${isActive ? "active-link" : ""}`
                }
                onClick={closeAllMenus}
              >
                Hospitals
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/pharmacy"
                className={({ isActive }) =>
                  `nav-links ${isActive ? "active-link" : ""}`
                }
                onClick={closeAllMenus}
              >
                Pharmacy
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/departments"
                className={({ isActive }) =>
                  `nav-links ${isActive ? "active-link" : ""}`
                }
                onClick={closeAllMenus}
              >
                Departments
              </NavLink>
            </li>
            <li className="nav-item">
              <a
                href="/#about"
                className="nav-links"
                onClick={closeAllMenus}
              >
                About Us
              </a>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-links ${isActive ? "active-link" : ""}`
                }
                onClick={closeAllMenus}
              >
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="nav-actions">
            <Link
              to="/cart"
              className="cart-icon-btn"
              aria-label="View shopping cart"
              onClick={closeAllMenus}
            >
              <FaShoppingCart />
              <span className="cart-badge">0</span>
            </Link>

            {/* Login Dropdown Wrapper */}
            <div className="dropdown-wrapper">
              <button
                type="button"
                className={`btn-outline dropdown-trigger ${activeDropdown === "login" ? "active" : ""
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown("login");
                }}
              >
                Login
              </button>
              {activeDropdown === "login" && (
                <div className="nav-dropdown">
                  <Link
                    to="/login/patient"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    👤 Patient Login
                  </Link>
                  <Link
                    to="/login/doctor"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    🩺 Doctor Login
                  </Link>
                  <Link
                    to="/login/hospital"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    🏥 Hospital Login
                  </Link>
                  <Link
                    to="/login/pharmacy"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    💊 Pharmacy Login
                  </Link>
                </div>
              )}
            </div>

            {/* Register Dropdown Wrapper */}
            <div className="dropdown-wrapper">
              <button
                type="button"
                className={`btn-primary dropdown-trigger ${activeDropdown === "register" ? "active" : ""
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown("register");
                }}
              >
                Register
              </button>
              {activeDropdown === "register" && (
                <div className="nav-dropdown">
                  <Link
                    to="/register/patient"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    👤 Join as Patient
                  </Link>
                  <Link
                    to="/register/doctor"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    🩺 Join as Doctor
                  </Link>
                  <Link
                    to="/register/hospital"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    🏥 Join as Hospital
                  </Link>
                  <Link
                    to="/register/pharmacy"
                    className="dropdown-item"
                    onClick={closeAllMenus}
                  >
                    💊 Join as Pharmacy
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
