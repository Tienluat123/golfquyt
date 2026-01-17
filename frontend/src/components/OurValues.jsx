import React from 'react';
import './OurValues.css';

const OurValues = () => {
  return (
    <section className="our-values" id="upcoming">
      <div className="container">
        <h2>Our Values</h2>
        <div className="values-content">
          <div className="value-item">
            <h3>For golfers</h3>
            <p>
              Democratizing Mastery We believe elite coaching shouldn't be a luxury. We replace "blind practice" with accessible, data-driven feedback, ensuring every swing counts regardless of budget.
            </p>
          </div>
          <div className="value-item">
            <h3>For coaches</h3>
            <p>
              Scaling Expertise We bridge the "black hole" between lessons. We empower coaches to move beyond the "time-for-money" trap by providing objective student data and remote monitoring tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurValues;
