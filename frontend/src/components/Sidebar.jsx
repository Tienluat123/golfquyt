// src/components/Sidebar.js
import React from 'react';
import logo_closed from '../assets/logo_no.png';
import logo from '../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaGraduationCap, FaRobot, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { MdGolfCourse } from 'react-icons/md';
import { GiGolfFlag } from "react-icons/gi";
import { logoutUser } from '../services/auth.service';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-top">
          {/* Logo Section - Click to toggle */}
          <div className="sidebar-logo-section" onClick={onToggle}>
            <div className="logo-wrapper">
              <div className="logo-icon">
                <img src={isOpen ? logo : logo_closed} alt="Logo" />
              </div>

            </div>
          </div>
          
          {/* Main Navigation */}
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon-wrapper">
                <FaHome className="nav-icon" size={28} />
              </div>
              <span className="nav-label">Home</span>
            </NavLink>

            <NavLink to="/sessions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon-wrapper">
                <MdGolfCourse className="nav-icon" size={28} />
              </div>
              <span className="nav-label">Golf Session</span>
            </NavLink>

            <NavLink to="/courses" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon-wrapper">
                <FaGraduationCap className="nav-icon" size={28} />
              </div>
              <span className="nav-label">Courses</span>
            </NavLink>

            <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon-wrapper">
                <FaRobot className="nav-icon" size={28} />
              </div>
              <span className="nav-label">AI Trainer</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Navigation */}
        <div className="sidebar-bottom">
          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <div className="nav-icon-wrapper">
              <FaUser className="nav-icon" size={28} />
            </div>
            <span className="nav-label">User</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <div className="nav-icon-wrapper">
              <FaCog className="nav-icon" size={28} />
            </div>
            <span className="nav-label">Setting</span>
          </NavLink>
          
          <button onClick={handleLogout} className="nav-item logout-btn">
            <div className="nav-icon-wrapper">
              <FaSignOutAlt className="nav-icon" size={28} />
            </div>
            <span className="nav-label">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
