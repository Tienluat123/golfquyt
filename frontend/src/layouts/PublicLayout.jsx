// src/layouts/PublicLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css'; // Đảm bảo import CSS chung nếu cần

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="snap-container">
        <Outlet /> 
        <Footer /> {/* Footer nằm trong luồng cuộn của main luôn */}
      </main>
    </>
  );
};

export default PublicLayout;
