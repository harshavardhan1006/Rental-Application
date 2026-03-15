import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ListingCard from '../components/ListingCard';
import './HomePage.css';

const PROPERTY_TYPES = ['All', 'Apartment', 'House', 'Villa', 'Cabin', 'Condo', 'Studio'];

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [activeType]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { limit: 12 };
      if (activeType !== 'All') params.propertyType = activeType;
      const { data } = await api.get('/listings', { params });
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?search=${encodeURIComponent(search.trim())}`);
    else navigate('/search');
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <h1 className="hero-title">Find your perfect stay</h1>
          <p className="hero-subtitle">Discover unique homes, cabins, villas and more</p>
          <form className="hero-search" onSubmit={handleHeroSearch}>
            <div className="hero-search-input">
              <span>🔍</span>
              <input
                type="text" placeholder="Where are you going?"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>
          <div className="hero-stats">
            <div className="hero-stat"><strong>10,000+</strong><span>Properties</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>150+</strong><span>Countries</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>2M+</strong><span>Happy guests</span></div>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="filter-bar container">
        <div className="filter-tabs">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-tab ${activeType === type ? 'active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/search')}>
          All filters ⚙️
        </button>
      </div>

      {/* Listings */}
      <section className="container home-listings">
        <div className="section-header">
          <h2>Featured stays</h2>
          <button className="btn btn-ghost" onClick={() => navigate('/search')}>
            View all →
          </button>
        </div>

        {loading ? (
          <div className="page-loader">
            <div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} />
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏡</div>
            <h3>No listings yet</h3>
            <p>Be the first to list your property!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Start earning by hosting</h2>
            <p>List your space and earn extra income hosting guests from around the world.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/listings/create')}>
              Become a host →
            </button>
          </div>
          <div className="cta-illustration">🏡</div>
        </div>
      </section>
    </div>
  );
}
