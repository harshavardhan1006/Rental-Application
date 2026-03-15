import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, calcNights, formatDateShort, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import './BookingPage.css';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    checkIn: '', checkOut: '', guests: 1, specialRequests: ''
  });

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data.listing))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // auto-clear checkout if it's before new checkin
      if (name === 'checkIn' && updated.checkOut && updated.checkOut <= value) {
        updated.checkOut = '';
      }
      return updated;
    });
    setError('');
  };

  const nights = calcNights(form.checkIn, form.checkOut);
  const subtotal = nights * (listing?.price || 0);
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.checkIn || !form.checkOut) return setError('Please select check-in and check-out dates');
    if (nights < 1) return setError('Check-out must be after check-in');
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        listingId: id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        specialRequests: form.specialRequests
      });
      toast.success('Booking confirmed! 🎉');
      navigate('/dashboard', { state: { newBooking: data.booking._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;
  if (!listing) return null;

  const imgUrl = listing.images?.[0]?.url ? getImageUrl(listing.images[0].url) : 'https://placehold.co/400x260?text=No+Image';

  return (
    <div className="booking-page container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
        ← Back to listing
      </button>
      <h1 className="booking-page-title">Confirm your booking</h1>

      <div className="booking-layout">
        {/* Form */}
        <div className="booking-form-section">
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-section-title">Your trip</div>
            <div className="date-fields">
              <div className="form-group">
                <label className="form-label">Check-in</label>
                <input type="date" name="checkIn" className="form-input" value={form.checkIn} onChange={handleChange} min={today} required />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out</label>
                <input type="date" name="checkOut" className="form-input" value={form.checkOut} onChange={handleChange}
                  min={form.checkIn || today} disabled={!form.checkIn} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Guests</label>
              <select name="guests" className="form-input" value={form.guests} onChange={handleChange}>
                {[...Array(listing.maxGuests)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
              <span className="form-hint">Max {listing.maxGuests} guests</span>
            </div>
            <div className="form-group">
              <label className="form-label">Special requests <span style={{ color: 'var(--gray)', fontWeight: 400 }}>(optional)</span></label>
              <textarea name="specialRequests" className="form-input" rows={3}
                placeholder="Any special requests or notes for the host..."
                value={form.specialRequests} onChange={handleChange} />
            </div>

            <div className="divider" />
            <div className="form-section-title">Cancellation policy</div>
            <p style={{ fontSize: 14, color: 'var(--gray)', lineHeight: 1.6, marginBottom: 24 }}>
              Free cancellation before check-in. Review the full policy before booking.
            </p>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || !form.checkIn || !form.checkOut}>
              {submitting ? <><span className="spinner" /> Confirming...</> : `Confirm booking — ${total > 0 ? formatPrice(total) : 'Select dates'}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray)', marginTop: 10 }}>
              You'll be charged {total > 0 ? formatPrice(total) : ''} total including taxes
            </p>
          </form>
        </div>

        {/* Summary card */}
        <div className="booking-summary">
          <div className="summary-listing">
            <img src={imgUrl} alt={listing.title} className="summary-img" />
            <div className="summary-listing-info">
              <div className="summary-type">{listing.propertyType}</div>
              <div className="summary-title">{listing.title}</div>
              <div className="summary-location">📍 {listing.location.city}, {listing.location.country}</div>
              {listing.averageRating > 0 && (
                <div className="summary-rating">★ {listing.averageRating.toFixed(1)} ({listing.reviewCount})</div>
              )}
            </div>
          </div>

          <div className="divider" />
          <div className="form-section-title">Price details</div>

          {nights > 0 ? (
            <div className="price-breakdown">
              <div className="price-row">
                <span>{formatPrice(listing.price)} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="price-row">
                <span>Service fee (12%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              {form.checkIn && form.checkOut && (
                <div className="price-row price-dates">
                  <span>📅 {formatDateShort(form.checkIn)} → {formatDateShort(form.checkOut)}</span>
                  <span>{nights} nights</span>
                </div>
              )}
              <div className="divider" />
              <div className="price-row price-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--gray)', fontSize: 14 }}>Select dates to see price breakdown</p>
          )}
        </div>
      </div>
    </div>
  );
}
