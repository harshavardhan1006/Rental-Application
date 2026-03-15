import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl, getInitials, AMENITY_ICONS, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ListingDetailPage.css';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lRes, rRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/reviews/listing/${id}`)
        ]);
        setListing(lRes.data.listing);
        setReviews(rRes.data.reviews);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
      setDeleting(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;
  if (!listing) return null;

  const isOwner = user && listing.host._id === user._id;
  const images = listing.images?.length > 0 ? listing.images : [{ url: 'https://placehold.co/800x500?text=No+Image' }];

  const StarRating = ({ rating }) => (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={`star ${n <= Math.round(rating) ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );

  return (
    <div className="detail-page container">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h1 className="detail-title">{listing.title}</h1>
          <div className="detail-meta">
            {listing.averageRating > 0 && (
              <span className="meta-item">
                <span className="star">★</span> <strong>{listing.averageRating.toFixed(1)}</strong>
                <span style={{ color: 'var(--gray)' }}> ({listing.reviewCount} reviews)</span>
              </span>
            )}
            <span className="meta-separator">·</span>
            <span className="meta-item">📍 {listing.location.city}, {listing.location.country}</span>
          </div>
        </div>
        {isOwner && (
          <div className="detail-actions">
            <Link to={`/listings/${id}/edit`} className="btn btn-outline btn-sm">✏️ Edit</Link>
            <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? '...' : '🗑️ Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Image gallery */}
      <div className="gallery">
        <div className="gallery-main">
          <img src={getImageUrl(images[activeImg]?.url)} alt={listing.title} />
        </div>
        {images.length > 1 && (
          <div className="gallery-thumbs">
            {images.slice(0, 5).map((img, i) => (
              <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                <img src={getImageUrl(img.url)} alt={`View ${i+1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="detail-layout">
        {/* Left: info */}
        <div className="detail-info">
          {/* Quick facts */}
          <div className="quick-facts">
            <div className="fact-chip">🏠 {listing.propertyType}</div>
            <div className="fact-chip">👥 {listing.maxGuests} guests</div>
            <div className="fact-chip">🛏️ {listing.bedrooms} bedrooms</div>
            <div className="fact-chip">🛁 {listing.bathrooms} bathrooms</div>
          </div>
          <div className="divider" />

          {/* Host */}
          <div className="host-section">
            <div className="host-avatar avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
              {getInitials(listing.host.name)}
            </div>
            <div>
              <div className="host-label">Hosted by</div>
              <div className="host-name">{listing.host.name}</div>
              {listing.host.bio && <p className="host-bio">{listing.host.bio}</p>}
              <div className="host-since">Member since {new Date(listing.host.createdAt).getFullYear()}</div>
            </div>
          </div>
          <div className="divider" />

          {/* Description */}
          <div>
            <h2 className="section-title">About this place</h2>
            <p className="detail-description">{listing.description}</p>
          </div>
          <div className="divider" />

          {/* Location */}
          <div>
            <h2 className="section-title">📍 Location</h2>
            <p style={{ color: 'var(--gray)', marginBottom: 16 }}>
              {listing.location.address && `${listing.location.address}, `}
              {listing.location.city}{listing.location.state ? `, ${listing.location.state}` : ''}, {listing.location.country}
            </p>
            {listing.location.coordinates?.lat && (
              <div className="map-embed">
                <iframe
                  title="Location map"
                  width="100%" height="300" style={{ border: 0, borderRadius: 'var(--radius)' }}
                  loading="lazy" allowFullScreen
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.location.coordinates.lng - 0.01}%2C${listing.location.coordinates.lat - 0.01}%2C${listing.location.coordinates.lng + 0.01}%2C${listing.location.coordinates.lat + 0.01}&layer=mapnik&marker=${listing.location.coordinates.lat}%2C${listing.location.coordinates.lng}`}
                />
              </div>
            )}
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <>
              <div className="divider" />
              <div>
                <h2 className="section-title">What this place offers</h2>
                <div className="amenities-grid">
                  {listing.amenities.map(a => (
                    <div key={a} className="amenity-item">
                      <span className="amenity-icon">{AMENITY_ICONS[a] || '✓'}</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <div className="divider" />
              <div>
                <h2 className="section-title">
                  ★ {listing.averageRating.toFixed(1)} · {listing.reviewCount} review{listing.reviewCount !== 1 ? 's' : ''}
                </h2>
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                          {getInitials(r.author.name)}
                        </div>
                        <div>
                          <div className="review-author">{r.author.name}</div>
                          <div className="review-date">{formatDate(r.createdAt)}</div>
                        </div>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: booking widget */}
        <div className="booking-widget-wrap">
          <div className="booking-widget">
            <div className="booking-widget-price">
              <span className="price-amount">{formatPrice(listing.price)}</span>
              <span className="price-unit"> / night</span>
            </div>
            {listing.averageRating > 0 && (
              <div className="booking-widget-rating">
                ★ {listing.averageRating.toFixed(1)} · {listing.reviewCount} reviews
              </div>
            )}
            <div className="divider" />
            {isOwner ? (
              <div className="owner-notice">
                <span>🏠</span>
                <div>
                  <strong>This is your listing</strong>
                  <p>Manage it from your dashboard</p>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={() => user ? navigate(`/listings/${id}/book`) : navigate('/login')}
              >
                {user ? '🗓️ Reserve now' : '🔒 Log in to book'}
              </button>
            )}
            <p className="booking-note">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
