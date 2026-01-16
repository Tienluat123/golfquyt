import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutUs from '../components/AboutUs';
import KeyFeatures from '../components/KeyFeatures';
import OurValues from '../components/OurValues';

export default function HomePage() {
  return (
    <div className="landing-snap-container">
      <HeroSection />
      <KeyFeatures />
      <AboutUs />
      <OurValues />
      {/* other sections */}
    </div>
  );
}
