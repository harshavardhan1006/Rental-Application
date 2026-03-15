import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ListingCard from '../components/ListingCard';
import { PROPERTY_TYPES } from '../utils/helpers';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    country: searchParams.get('country') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    propertyType: searchParams.get('propertyType') || '',
    guests: searchParams.get('guests') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== 0) params[k] = v; });
      const { data } = await api.get('/listings', { params });
      setListings(data.listings);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v !== '') params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', city: '', country: '', minPrice: '', maxPrice: '', propertyType: '', guests: '', checkIn: '', checkOut: '', page: 1 });
    setSearchParams({});
  };

  const changePage = (p) => {
    setFilters(prev => ({ ...prev, page: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = [filters.city, filters.country, filters.minPrice, filters.maxPrice, filters.propertyType, filters.guests, filters.checkIn].filter(Boolean).length;

  return (
    <div className="search-page container">
      <div className="search-layout">
        {/* Sidebar filters */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filters {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(false)}>✕</button>
          </div>
          <form onSubmit={handleSearch}>
            <div className="filter-section">
              <label className="form-label">Search</label>
              <input name="search" className="form-input" placeholder="Keywords..." value={filters.search} onChange={handleFilterChange} />
            </div>
            <div className="filter-section">
              <label className="form-label">Destination</label>
              <input name="city" className="form-input" placeholder="City" value={filters.city} onChange={handleFilterChange} style={{ marginBottom: 8 }} />
              <input name="country" className="form-input" placeholder="Country" value={filters.country} onChange={handleFilterChange} />
            </div>
            <div className="filter-section">
              <label className="form-label">Property type</label>
              <select name="propertyType" className="form-input" value={filters.propertyType} onChange={handleFilterChange}>
                <option value="">All types</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-section">
              <label className="form-label">Price per night</label>
              <div className="price-range">
                <input name="minPrice" type="number" className="form-input" placeholder="Min $" value={filters.minPrice} onChange={handleFilterChange} min={0} />
                <span>–</span>
                <input name="maxPrice" type="number" className="form-input" placeholder="Max $" value={filters.maxPrice} onChange={handleFilterChange} min={0} />
              </div>
            </div>
            <div className="filter-section">
              <label className="form-label">Guests</label>
              <input name="guests" type="number" className="form-input" placeholder="Number of guests" value={filters.guests} onChange={handleFilterChange} min={1} />
            </div>
            <div className="filter-section">
              <label className="form-label">Check-in</label>
              <input name="checkIn" type="date" className="form-input" value={filters.checkIn} onChange={handleFilterChange} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="filter-section">
              <label className="form-label">Check-out</label>
              <input name="checkOut" type="date" className="form-input" value={filters.checkOut} onChange={handleFilterChange} min={filters.checkIn || new Date().toISOString().split('T')[0]} />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Apply filters</button>
            {activeFilterCount > 0 && (
              <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 8 }} onClick={clearFilters}>Clear all</button>
            )}
          </form>
        </aside>

        {/* Main content */}
        <div className="search-results">
          <div className="search-results-header">
            <div>
              <h2>
                {filters.search || filters.city || filters.country
                  ? `Results for "${filters.search || filters.city || filters.country}"`
                  : 'All listings'}
              </h2>
              {!loading && <p className="results-count">{pagination.total || 0} properties found</p>}
            </div>
            <button className="btn btn-outline btn-sm filter-toggle-btn" onClick={() => setShowFilters(true)}>
              ⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {loading ? (
            <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search in a different location.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="listings-grid">
                {listings.map(l => <ListingCard key={l._id} listing={l} />)}
              </div>
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm" onClick={() => changePage(filters.page - 1)} disabled={filters.page === 1}>← Prev</button>
                  <span className="pagination-info">Page {filters.page} of {pagination.pages}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => changePage(filters.page + 1)} disabled={filters.page === pagination.pages}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
