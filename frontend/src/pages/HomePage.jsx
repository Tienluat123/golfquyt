import GolfAnalyzer from '../components/GolfAnalyzer/GolfAnalyzer';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🍊</span>
          <span className="logo-text">Quả Quýt Team</span>
        </div>
        <p className="tagline">Golf AI Analyzer</p>
      </header>
      <main>
        <GolfAnalyzer />
      </main>
    </div>
  );
}
