import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'navbar-solid' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">StayFinder</span>
        </Link>

        {/* Search bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        {/* Right side */}
        <div className="navbar-right">
          {user && (
            <Link to="/listings/create" className="btn btn-outline btn-sm navbar-host-btn">
              + List your place
            </Link>
          )}

          <div className="user-menu" ref={menuRef}>
            <button className="user-menu-trigger" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              {user ? (
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {getInitials(user.name)}
                </div>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              )}
            </button>

            {menuOpen && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="dropdown-user-info">
                      <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray)' }}>{user.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      📊 Dashboard
                    </Link>
                    <Link to="/listings/create" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      ➕ List your place
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      🚪 Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item dropdown-item-bold" onClick={() => setMenuOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
