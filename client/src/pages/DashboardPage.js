import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getImageUrl, getInitials, getBookingStatusColor, calcNights } from '../utils/helpers';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const TABS = ['Overview', 'My Bookings', 'My Listings', 'Hosting', 'Reviews'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [myBookings, setMyBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [hostBookings, setHostBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ bookingId: null, rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bRes, lRes, hRes] = await Promise.all([
          api.get('/bookings/my-bookings'),
          api.get('/listings/my-listings'),
          api.get('/bookings/host-bookings'),
        ]);
        setMyBookings(bRes.data.bookings);
        setMyListings(lRes.data.listings);
        setHostBookings(hRes.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setMyBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      setHostBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const { data } = await api.post('/reviews', reviewForm);
      toast.success('Review submitted! ⭐');
      setMyReviews(prev => [...prev, data.review]);
      setReviewForm({ bookingId: null, rating: 5, comment: '' });
      // mark booking as reviewed
      setMyBookings(prev => prev.map(b => b._id === reviewForm.bookingId ? { ...b, reviewed: true } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setMyListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const totalRevenue = hostBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((sum, b) => sum + b.totalPrice, 0);
  const upcomingBookings = myBookings.filter(b => b.status === 'confirmed' && new Date(b.checkIn) > new Date());

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;

  return (
    <div className="dashboard container">
      {/* Profile header */}
      <div className="dash-header">
        <div className="dash-profile">
          <div className="avatar dash-avatar" style={{ fontSize: 28 }}>
            {getInitials(user.name)}
          </div>
          <div>
            <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
            <p>{user.email}</p>
            {user.isHost && <span className="badge badge-primary" style={{ marginTop: 4 }}>⭐ Host</span>}
          </div>
        </div>
        <div className="dash-header-stats">
          <div className="dash-stat"><strong>{myBookings.length}</strong><span>Trips</span></div>
          <div className="dash-stat"><strong>{myListings.length}</strong><span>Listings</span></div>
          <div className="dash-stat"><strong>{hostBookings.filter(b => b.status === 'confirmed').length}</strong><span>Active guests</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        {TABS.map(t => (
          <button key={t} className={`dash-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
            {t === 'My Bookings' && upcomingBookings.length > 0 && (
              <span className="tab-badge">{upcomingBookings.length}</span>
            )}
            {t === 'Hosting' && hostBookings.filter(b => b.status === 'confirmed').length > 0 && (
              <span className="tab-badge">{hostBookings.filter(b => b.status === 'confirmed').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'Overview' && (
        <div className="dash-overview">
          <div className="overview-cards">
            <div className="overview-card">
              <div className="ov-icon">🗓️</div>
              <div className="ov-value">{upcomingBookings.length}</div>
              <div className="ov-label">Upcoming trips</div>
              {upcomingBookings[0] && (
                <Link to={`/listings/${upcomingBookings[0].listing._id}`} className="ov-link">
                  Next: {upcomingBookings[0].listing.title} →
                </Link>
              )}
            </div>
            <div className="overview-card">
              <div className="ov-icon">🏠</div>
              <div className="ov-value">{myListings.length}</div>
              <div className="ov-label">Active listings</div>
              <Link to="/listings/create" className="ov-link">+ Add new listing</Link>
            </div>
            <div className="overview-card">
              <div className="ov-icon">💰</div>
              <div className="ov-value">{formatPrice(totalRevenue)}</div>
              <div className="ov-label">Total revenue earned</div>
              <span className="ov-link">{hostBookings.length} total bookings</span>
            </div>
            <div className="overview-card">
              <div className="ov-icon">👥</div>
              <div className="ov-value">{hostBookings.filter(b => b.status === 'confirmed').length}</div>
              <div className="ov-label">Active guests</div>
            </div>
          </div>

          {upcomingBookings.length > 0 && (
            <div className="upcoming-section">
              <h3>Your upcoming trips</h3>
              {upcomingBookings.slice(0, 3).map(b => (
                <div key={b._id} className="upcoming-item">
                  <img src={b.listing.images?.[0]?.url ? getImageUrl(b.listing.images[0].url) : 'https://placehold.co/80x60?text=No+Image'} alt="" className="upcoming-img" />
                  <div className="upcoming-info">
                    <div className="upcoming-title">{b.listing.title}</div>
                    <div className="upcoming-dates">📅 {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</div>
                    <div className="upcoming-location">📍 {b.listing.location.city}, {b.listing.location.country}</div>
                  </div>
                  <div className="upcoming-total">{formatPrice(b.totalPrice)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings */}
      {activeTab === 'My Bookings' && (
        <div>
          <div className="section-top">
            <h2>My trips</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/search')}>Browse more →</button>
          </div>
          {myBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧳</div>
              <h3>No trips yet</h3>
              <p>Time to book your first adventure!</p>
              <button className="btn btn-primary" onClick={() => navigate('/search')}>Explore listings</button>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.map(b => (
                <div key={b._id} className="booking-card">
                  <img src={b.listing.images?.[0]?.url ? getImageUrl(b.listing.images[0].url) : 'https://placehold.co/120x90?text=No+Image'} alt="" className="booking-card-img" />
                  <div className="booking-card-body">
                    <div className="booking-card-top">
                      <div>
                        <h3 className="booking-card-title">
                          <Link to={`/listings/${b.listing._id}`}>{b.listing.title}</Link>
                        </h3>
                        <div className="booking-card-location">📍 {b.listing.location.city}, {b.listing.location.country}</div>
                      </div>
                      <span className={`badge ${getBookingStatusColor(b.status)}`}>{b.status}</span>
                    </div>
                    <div className="booking-card-details">
                      <span>📅 {formatDate(b.checkIn)} – {formatDate(b.checkOut)}</span>
                      <span>🌙 {b.nights} night{b.nights > 1 ? 's' : ''}</span>
                      <span>👥 {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                      <span className="booking-total"><strong>{formatPrice(b.totalPrice)}</strong></span>
                    </div>
                    <div className="booking-card-actions">
                      {(b.status === 'confirmed' || b.status === 'pending') && new Date(b.checkIn) > new Date() && (
                        <button className="btn btn-outline btn-sm" onClick={() => cancelBooking(b._id)}>Cancel</button>
                      )}
                      {b.status === 'confirmed' && new Date(b.checkOut) < new Date() && !b.reviewed && (
                        <button className="btn btn-primary btn-sm" onClick={() => setReviewForm({ bookingId: b._id, rating: 5, comment: '' })}>
                          ⭐ Write review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline review form */}
          {reviewForm.bookingId && (
            <div className="review-form-overlay" onClick={() => setReviewForm({ bookingId: null, rating: 5, comment: '' })}>
              <div className="review-form-modal" onClick={e => e.stopPropagation()}>
                <h3>Write a review</h3>
                <form onSubmit={submitReview}>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <div className="rating-picker">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" className={`rating-star ${n <= reviewForm.rating ? 'active' : ''}`}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: n }))}>★</button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your review</label>
                    <textarea className="form-input" rows={4} placeholder="Share your experience..."
                      value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} required minLength={10} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setReviewForm({ bookingId: null, rating: 5, comment: '' })}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Submit review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Listings */}
      {activeTab === 'My Listings' && (
        <div>
          <div className="section-top">
            <h2>My listings</h2>
            <Link to="/listings/create" className="btn btn-primary btn-sm">+ New listing</Link>
          </div>
          {myListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏡</div>
              <h3>No listings yet</h3>
              <p>Start earning by listing your place</p>
              <Link to="/listings/create" className="btn btn-primary">Create listing</Link>
            </div>
          ) : (
            <div className="listings-manage-grid">
              {myListings.map(l => (
                <div key={l._id} className="manage-card">
                  <Link to={`/listings/${l._id}`}>
                    <img src={l.images?.[0]?.url ? getImageUrl(l.images[0].url) : 'https://placehold.co/320x200?text=No+Image'} alt="" className="manage-card-img" />
                  </Link>
                  <div className="manage-card-body">
                    <div className="manage-card-status">
                      <span className={`badge ${l.isAvailable ? 'badge-success' : 'badge-gray'}`}>
                        {l.isAvailable ? '● Active' : '○ Inactive'}
                      </span>
                      {l.averageRating > 0 && <span>★ {l.averageRating.toFixed(1)}</span>}
                    </div>
                    <Link to={`/listings/${l._id}`} className="manage-card-title">{l.title}</Link>
                    <div className="manage-card-price">{formatPrice(l.price)} / night</div>
                    <div className="manage-card-actions">
                      <Link to={`/listings/${l._id}`} className="btn btn-ghost btn-sm">View</Link>
                      <Link to={`/listings/${l._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hosting */}
      {activeTab === 'Hosting' && (
        <div>
          <div className="section-top">
            <h2>Guest bookings</h2>
            <div className="revenue-badge">Total revenue: <strong>{formatPrice(totalRevenue)}</strong></div>
          </div>
          {hostBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏨</div>
              <h3>No bookings yet</h3>
              <p>Guests will appear here once they book your listings</p>
            </div>
          ) : (
            <div className="bookings-list">
              {hostBookings.map(b => (
                <div key={b._id} className="booking-card">
                  <div className="booking-card-guest">
                    <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{getInitials(b.guest.name)}</div>
                  </div>
                  <div className="booking-card-body">
                    <div className="booking-card-top">
                      <div>
                        <h3 className="booking-card-title">{b.guest.name}</h3>
                        <div className="booking-card-location">
                          <Link to={`/listings/${b.listing._id}`} style={{ color: 'var(--primary)' }}>{b.listing.title}</Link>
                        </div>
                      </div>
                      <span className={`badge ${getBookingStatusColor(b.status)}`}>{b.status}</span>
                    </div>
                    <div className="booking-card-details">
                      <span>📅 {formatDate(b.checkIn)} – {formatDate(b.checkOut)}</span>
                      <span>🌙 {b.nights} nights</span>
                      <span>👥 {b.guests} guests</span>
                      <span className="booking-total"><strong>{formatPrice(b.totalPrice)}</strong></span>
                    </div>
                    {b.specialRequests && (
                      <div className="special-requests">💬 "{b.specialRequests}"</div>
                    )}
                    <div className="booking-card-actions">
                      {(b.status === 'confirmed' || b.status === 'pending') && new Date(b.checkIn) > new Date() && (
                        <button className="btn btn-outline btn-sm" onClick={() => cancelBooking(b._id)}>Cancel booking</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {activeTab === 'Reviews' && (
        <div>
          <div className="section-top"><h2>Reviews you can write</h2></div>
          {myBookings.filter(b => b.status === 'confirmed' && new Date(b.checkOut) < new Date()).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <h3>No completed trips to review</h3>
              <p>Reviews become available after your stay</p>
            </div>
          ) : (
            <div className="bookings-list">
              {myBookings.filter(b => b.status === 'confirmed' && new Date(b.checkOut) < new Date()).map(b => (
                <div key={b._id} className="booking-card">
                  <img src={b.listing.images?.[0]?.url ? getImageUrl(b.listing.images[0].url) : 'https://placehold.co/120x90?text=No+Image'} alt="" className="booking-card-img" />
                  <div className="booking-card-body">
                    <h3 className="booking-card-title"><Link to={`/listings/${b.listing._id}`}>{b.listing.title}</Link></h3>
                    <div className="booking-card-details"><span>📅 {formatDate(b.checkIn)} – {formatDate(b.checkOut)}</span></div>
                    <div className="booking-card-actions">
                      {!b.reviewed ? (
                        <button className="btn btn-primary btn-sm" onClick={() => setReviewForm({ bookingId: b._id, rating: 5, comment: '' })}>
                          ⭐ Write review
                        </button>
                      ) : (
                        <span className="badge badge-success">✓ Reviewed</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
