import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Login from "./Login";
import Register from "./Register";
import { getAuth, signOut } from "firebase/auth";
import AssetsCalculator from "./AssetsCalculator";
import FavouriteList from "./FavouriteList";

const Menu = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFavourites, setShowFavourites] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const calculatorRef = useRef(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const closeDropdown = () => setShowDropdown(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const openSignUpModal = () => {
    setShowSignUpModal(true);
    closeDropdown();
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    closeDropdown();
  };

  const closeSignUpModal = () => setShowSignUpModal(false);

  const closeLoginModal = () => setShowLoginModal(false);

  const handleRegisterSuccess = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (username) => {
    setUser(username);
    closeLoginModal();
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        closeDropdown();
        alert("You have successfully logged out!");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        alert("Logout failed. Please try again.");
      });
  };

  useEffect(() => {
    const calculator = calculatorRef.current;
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const handleMouseDown = (e) => {
      isDragging = true;
      offsetX = e.clientX - calculator.getBoundingClientRect().left;
      offsetY = e.clientY - calculator.getBoundingClientRect().top;
      calculator.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      calculator.style.left = `${e.clientX - offsetX}px`;
      calculator.style.top = `${e.clientY - offsetY}px`;
      calculator.style.position = "absolute";
    };

    const handleMouseUp = () => {
      isDragging = false;
      calculator.style.cursor = "grab";
    };

    if (calculator) {
      calculator.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (calculator) {
        calculator.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [showCalculator]);

  return (
    <div className="menu-container" ref={menuRef}>
      {user ? (
        <div className="user-menu">
          <button className="dropdown-button" onClick={toggleDropdown}>
            Menu
          </button>
          &nbsp;&nbsp;&nbsp;
          <span>Welcome, {user}!</span>
          {showDropdown && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  setShowFavourites(true);
                  setShowDropdown(false);
                }}
              >
                Favourite
              </button>
              <button
                onClick={() => {
                  setShowCalculator(true);
                  setShowDropdown(false);
                }}
              >
                Assets Calculator
              </button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-buttons">
          <button className="dropdown-button" onClick={openLoginModal}>
            Log In
          </button>
          &nbsp;
          <button className="dropdown-button" onClick={openSignUpModal}>
            Sign Up
          </button>
        </div>
      )}

      <Modal isOpen={showLoginModal} onClose={closeLoginModal}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </Modal>

      <Modal isOpen={showSignUpModal} onClose={closeSignUpModal}>
        <Register onRegisterSuccess={handleRegisterSuccess} />
      </Modal>

      {showCalculator &&
        ReactDOM.createPortal(
          <div className="assets-calculator-overlay">
            <div className="assets-calculator-container" ref={calculatorRef}>
              <AssetsCalculator />
              <button
                className="close-button"
                onClick={() => setShowCalculator(false)}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {showFavourites &&
        ReactDOM.createPortal(
          <FavouriteList
            userId={user}
            onClose={() => setShowFavourites(false)}
          />,
          document.body
        )}
    </div>
  );
};

export default Menu;
