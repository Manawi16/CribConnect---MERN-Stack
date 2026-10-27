// src/header.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SlMenu } from "react-icons/sl";
import { TbLogout } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { LuUserPen } from "react-icons/lu";
import { FiBookmark } from "react-icons/fi";
import { CiGrid41, CiSquarePlus } from "react-icons/ci";
import './Header.css';

function Header({ isHidden }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef();

  const isLandlord = user?.role === 'landlord';
  const isTenant = user?.role === 'tenant';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowDesktopMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDesktopMenu(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeAllMenus = () => {
    setShowDesktopMenu(false);
    setIsMobileMenuOpen(false);
  };

  const renderTenantMenu = () => (
    <>
      <Link to="/dashboard" className="dropdown-item" onClick={closeAllMenus}><CgProfile /> Dashboard</Link>
      <Link to="/tenantprofile" className="dropdown-item" onClick={closeAllMenus}><LuUserPen /> My Profile</Link>
      <Link to="/saves" className="dropdown-item" onClick={closeAllMenus}><FiBookmark /> Saves</Link>
    </>
  );

  const renderLandlordMenu = () => (
    <>
      <Link to="/dashboard" className="dropdown-item" onClick={closeAllMenus}><CgProfile /> Dashboard</Link>
      <Link to="/mylistings" className="dropdown-item" onClick={closeAllMenus}><CiGrid41 /> My Listings</Link>
      <Link to="/createlisting" className="dropdown-item" onClick={closeAllMenus}><CiSquarePlus /> Add New Listing</Link>
    </>
  );

  const headerStyle = {
    zIndex: isHidden ? 0 : 1000
  };

  return (
    <header className={`site-header ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`} style={headerStyle}>
      <div className="header-content">
        <div className="header-left">
          <Link to="/home">
            <img src="logo_header.png" alt="Crib Connect Logo" className="logo-img" />
          </Link>
        </div>

        {user ? (
          <>
            <nav className="header-right-desktop">
              <Link to="/listings" className="nav-link">Listings</Link>
              {isTenant && <Link to="/community" className="nav-link">Community</Link>}
              <Link to="/messages" className="nav-link">Messages</Link>
              <div className="menu-container" ref={menuRef}>
                <button className="menu-button" onClick={() => setShowDesktopMenu(!showDesktopMenu)}>
                  <SlMenu />
                </button>
                {showDesktopMenu && (
                  <div className="dropdown-menu">
                    {isTenant && renderTenantMenu()}
                    {isLandlord && renderLandlordMenu()}
                    <button onClick={handleLogout} className="dropdown-item"><TbLogout /> Logout</button>
                  </div>
                )}
              </div>
            </nav>
            <div className="header-right-mobile">
              <button className="menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <IoClose /> : <SlMenu />}
              </button>
            </div>
          </>
        ) : (
          <>
            <nav className="header-right-desktop">
              <Link to="/listings" className="nav-link">Listings</Link>
              <Link to="/community" className="nav-link">Community</Link>
              <Link to="/login" className="nav-button">Sign in</Link>
              <Link to="/register" className="nav-button primary">Register</Link>
            </nav>
             <div className="header-right-mobile">
              <button className="menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <IoClose /> : <SlMenu />}
              </button>
            </div>
          </>
        )}
      </div>
      
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <Link to="/listings" className="nav-link" onClick={closeAllMenus}>Listings</Link>
          {isTenant && <Link to="/community" className="nav-link" onClick={closeAllMenus}>Community</Link>}
          
          {user ? (
            <>
              <Link to="/messages" className="nav-link" onClick={closeAllMenus}>Messages</Link>
              <div className="mobile-menu-divider"></div>
              {isTenant && renderTenantMenu()}
              {isLandlord && renderLandlordMenu()}
              <button onClick={handleLogout} className="dropdown-item"><TbLogout /> Logout</button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider"></div>
              <Link to="/login" className="nav-button" onClick={closeAllMenus}>Sign in</Link>
              <Link to="/register" className="nav-button primary" onClick={closeAllMenus}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;