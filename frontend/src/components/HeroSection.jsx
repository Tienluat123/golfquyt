import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <p style={{ opacity: 0.8, marginBottom: '10px' }}>Welcome to the future of golf</p>
          <h1>AI GOLF TRAINER</h1>
          <p>
            Experience personalized coaching with our advanced AI technology. 
            Improve your swing, analyze your performance, and master the course like never before.
          </p>
          <Link to="/login" className="btn">Start Now</Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
