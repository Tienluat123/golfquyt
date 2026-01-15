import React from 'react';
import './KeyFeatures.css';

const features = [
  { title: 'Session Management', description: 'Efficiently track and manage your training sessions.' },
  { title: 'Golf Swing Analysis', description: 'Get detailed AI analysis of your swing technique.' },
  { title: 'Tailored Professional Courses', description: 'Customized courses designed by pros for you.' },
  { title: 'Advanced Vision Technology', description: 'Cutting-edge computer vision for precise feedback.' },
];

const KeyFeatures = () => {
  return (
    <section className="key-features" id="technology">
      <div className="container">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
