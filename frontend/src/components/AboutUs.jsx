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
            <h3>Welcome!!!</h3>
            <p>
              We are Quả Quýt, a determined student team from the University of Science, HCM City – VietNam National University.
            </p>
            <br />
            <p>
              Our name, Quả Quýt - is a homophone for Quả Quyết, signifying determination and resolve. This reflects our approach: we are passionate students with a clear, focused mindset for learning and tackling challenges.
            </p>
            <br />
            <p>
              Majoring in Computer Science, Computer Vision and Software Engineering, our team is dedicated to pooling our academic knowledge and developing practical, innovative solutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
