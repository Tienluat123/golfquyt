import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <section className="about-us" id="about">
      <div className="container">
        <h2>About us</h2>
        <div className="about-content">
          <div className="about-image-placeholder"></div>
          <div className="about-text">
            <h3>Welcome bla bla</h3>
            <p>
              We are dedicated to revolutionizing golf training through innovative technology. 
              Our mission is to make professional-grade coaching accessible to everyone, 
              helping golfers of all levels achieve their full potential.
            </p>
            <br />
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
