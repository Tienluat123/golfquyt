// src/components/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaLayerGroup, FaGraduationCap, FaRobot, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa'; // Import icon xịn
import { GiGolfFlag } from "react-icons/gi"; // Icon logo quả quýt/golf giả lập
import { logoutUser } from '../services/auth.service';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Logo */}
        <div className="sidebar-logo">
          <GiGolfFlag size={30} />
        </div>
        
        {/* Menu Navigation */}
        <nav className="sidebar-nav">
          {/* NavLink tự động thêm class "active" khi URL trùng khớp */}
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaHome size={20} />
          </NavLink>

          <NavLink to="/sessions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaLayerGroup size={20} />
          </NavLink>

          <NavLink to="/courses" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaGraduationCap size={20} />
          </NavLink>

          <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FaRobot size={20} />
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaUser size={20} />
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaCog size={20} />
        </NavLink>
        
        <button onClick={handleLogout} className="nav-item logout-btn">
          <FaSignOutAlt size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
