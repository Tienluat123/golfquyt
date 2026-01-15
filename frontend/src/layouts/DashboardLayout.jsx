// src/components/layouts/DashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Sidebar bạn vừa tạo
import './DashboardLayout.css'; // CSS chia cột

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      {/* 1. Sidebar cố định bên trái */}
      <Sidebar />

      {/* 2. Nội dung thay đổi bên phải */}
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
