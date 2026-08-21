import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import "./Navbar.css";
import { toast } from "react-toastify";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'login', 'register', or null
  const [cartModal, setCartModal] = useState(null); // null | 'not-logged-in' | 'wrong-role'
  const navigate = useNavigate();

  const handlePharmacyClick = () => {
    closeAllMenus();

    toast.info(
      "🔒 Pharmacy services are available only for registered patients. Please login to continue."
    );
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    closeAllMenus();

    const userRole = (
      localStorage.getItem("userRole") ||
      localStorage.getItem("role") ||
      ""
    ).toLowerCase();

    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true" ||
      !!localStorage.getItem("token") ||
      !!localStorage.getItem("patient_token") ||
      !!localStorage.getItem("admin_token") ||
      !!localStorage.getItem("doctorType") ||
      !!localStorage.getItem("pharmacyType") ||
      !!userRole;

    if (!isLoggedIn || !userRole) {
      // Not logged in -> show modal
      setCartModal("not-logged-in");
      document.body.style.overflow = "hidden";
      return;
    }

    if (userRole === "patient") {
      // Logged in as Patient -> go directly to cart
      navigate("/patient/cart");
      return;
    }

    // Logged in with another role -> show modal
    setCartModal("wrong-role");
    document.body.style.overflow = "hidden";
  };

  const closeCartModal = () => {
    setCartModal(null);
    document.body.style.overflow = "";
  };

  const handleCartModalLogin = () => {
    closeCartModal();
    navigate("/login/patient", { state: { redirectTo: "/patient/cart" } });
  };

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
              <a
                href="/#hospitals"
                className="nav-links"
                onClick={closeAllMenus}
              >
                Hospitals
              </a>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className="nav-links pharmacy-btn"
                onClick={handlePharmacyClick}
              >
                Pharmacy
              </button>
            </li>
            <li className="nav-item">
              <a
                href="/#departments"
                className="nav-links"
                onClick={closeAllMenus}
              >
                Departments
              </a>
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
              <a href="/#contact" className="nav-links" onClick={closeAllMenus}
              >Contact</a>
            </li>
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              className="cart-icon-btn"
              aria-label="View shopping cart"
              onClick={handleCartClick}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            >
              <FaShoppingCart />
              <span className="cart-badge">0</span>
            </button>

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
                    💊 Retail Pharmacy Login
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
                    💊 Join as Retail Pharmacy
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

      {/* ── Cart Auth Modal ─────────────────────────────── */}
      {cartModal && (
        <div
          className="cart-modal-backdrop"
          onClick={closeCartModal}
          role="dialog"
          aria-modal="true"
          aria-label="Cart access"
        >
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="cart-modal-header">
              <div className="cart-modal-icon-wrap">
                <FaShoppingCart className="cart-modal-icon" />
              </div>
              <button
                className="cart-modal-close"
                onClick={closeCartModal}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="cart-modal-body">
              {cartModal === "not-logged-in" ? (
                <>
                  <h3 className="cart-modal-title">Login to View Your Cart</h3>
                  <p className="cart-modal-msg">
                    Please login as a patient to view your cart and buy medicines.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="cart-modal-title">Patient Account Required</h3>
                  <p className="cart-modal-msg">
                    Cart and medicine purchases are available for Patient accounts only.
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="cart-modal-actions">
              <button
                className="cart-modal-btn-login"
                onClick={handleCartModalLogin}
              >
                {cartModal === "not-logged-in" ? "Login" : "Patient Login"}
              </button>
              <button
                className="cart-modal-btn-cancel"
                onClick={closeCartModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}

export default Navbar;
