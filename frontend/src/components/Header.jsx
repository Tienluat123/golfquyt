import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
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
