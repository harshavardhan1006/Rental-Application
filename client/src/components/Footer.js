import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🏠 StayFinder</span>
          <p>Find unique places to stay around the world.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/search">Browse listings</Link>
            <Link to="/search?propertyType=Villa">Villas</Link>
            <Link to="/search?propertyType=Cabin">Cabins</Link>
            <Link to="/search?propertyType=Apartment">Apartments</Link>
          </div>
          <div className="footer-col">
            <h4>Host</h4>
            <Link to="/listings/create">List your place</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
            <Link to="/dashboard">My bookings</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} StayFinder · Built with the MERN Stack</span>
      </div>
    </footer>
  );
}
