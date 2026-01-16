import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    // Check for landing-snap-container first (used in LandingPage), then snap-container, then fallback
    const container = document.querySelector('.landing-snap-container') || document.querySelector('.snap-container');

    // Fallback to window if container doesn't exist (though it should in PublicLayout)
    const target = container || window;

    const handleScroll = () => {
      const scrollTop = container ? container.scrollTop : window.scrollY;
      if (scrollTop > window.innerHeight - 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    target.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo Quả Quýt" />
          </Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <HashLink smooth to="/#about">About Us</HashLink>
            </li>
            <li>
              <HashLink smooth to="/#technology">Technology</HashLink>
            </li>
            <li>
              <HashLink smooth to="/#upcoming">Upcoming</HashLink>
            </li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </nav>
        <button className="btn">Start Now</button>
      </div>
    </header>
  );
};

export default Header;
