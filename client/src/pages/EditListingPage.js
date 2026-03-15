import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { AMENITIES_LIST, AMENITY_ICONS, PROPERTY_TYPES, getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ListingFormPage.css';

export default function EditListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: 'Apartment',
    maxGuests: 1, bedrooms: 1, beds: 1, bathrooms: 1,
    address: '', city: '', state: '', country: '', lat: '', lng: '',
    amenities: [], isAvailable: true
  });

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => {
      const l = data.listing;
      if (l.host._id !== user._id) { navigate('/'); return; }
      setForm({
        title: l.title, description: l.description, price: l.price,
        propertyType: l.propertyType, maxGuests: l.maxGuests,
        bedrooms: l.bedrooms, beds: l.beds, bathrooms: l.bathrooms,
        address: l.location.address, city: l.location.city,
        state: l.location.state || '', country: l.location.country,
        lat: l.location.coordinates?.lat || '', lng: l.location.coordinates?.lng || '',
        amenities: l.amenities || [], isAvailable: l.isAvailable
      });
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a]
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      newImageFiles.forEach(f => fd.append('images', f));
      await api.put(`/listings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing updated!');
      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const NumInput = ({ label, field, min = 0, max = 50 }) => (
    <div className="num-input">
      <span className="num-label">{label}</span>
      <div className="num-controls">
        <button type="button" className="num-btn" onClick={() => update(field, Math.max(min, form[field] - 1))}>−</button>
        <span className="num-value">{form[field]}</span>
        <button type="button" className="num-btn" onClick={() => update(field, Math.min(max, form[field] + 1))}>+</button>
      </div>
    </div>
  );

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 40, height: 40, borderWidth: 3 }} /></div>;

  return (
    <div className="listing-form-page container">
      <div className="form-page-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 8, paddingLeft: 0 }}>← Back</button>
        <h1>Edit listing</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Basic info</h2>
        <div className="form-group">
          <label className="form-label">Property type</label>
          <div className="type-grid">
            {PROPERTY_TYPES.map(t => (
              <button key={t} type="button" className={`type-btn ${form.propertyType === t ? 'active' : ''}`} onClick={() => update('propertyType', t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={form.title} onChange={e => update('title', e.target.value)} maxLength={100} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={5} value={form.description} onChange={e => update('description', e.target.value)} maxLength={2000} required />
        </div>
        <div className="form-group">
          <label className="form-label">Price per night ($)</label>
          <div className="price-input-wrap">
            <span className="price-symbol">$</span>
            <input type="number" className="form-input price-input" value={form.price} onChange={e => update('price', e.target.value)} min={1} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={form.isAvailable} onChange={e => update('isAvailable', e.target.checked)} style={{ width: 16, height: 16 }} />
            Listing is available for booking
          </label>
        </div>

        <div className="divider" />
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Location</h2>
        <div className="form-group">
          <label className="form-label">Street address</label>
          <input className="form-input" value={form.address} onChange={e => update('address', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City *</label>
            <input className="form-input" value={form.city} onChange={e => update('city', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input className="form-input" value={form.state} onChange={e => update('state', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Country *</label>
          <input className="form-input" value={form.country} onChange={e => update('country', e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Latitude</label><input type="number" className="form-input" value={form.lat} onChange={e => update('lat', e.target.value)} step="any" /></div>
          <div className="form-group"><label className="form-label">Longitude</label><input type="number" className="form-input" value={form.lng} onChange={e => update('lng', e.target.value)} step="any" /></div>
        </div>

        <div className="divider" />
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Details</h2>
        <div className="num-inputs-list">
          <NumInput label="Max guests" field="maxGuests" min={1} max={30} />
          <NumInput label="Bedrooms" field="bedrooms" min={0} max={20} />
          <NumInput label="Beds" field="beds" min={1} max={30} />
          <NumInput label="Bathrooms" field="bathrooms" min={1} max={20} />
        </div>

        <div className="divider" />
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Amenities</h2>
        <div className="amenities-selector">
          {AMENITIES_LIST.map(a => (
            <button key={a} type="button" className={`amenity-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)}>
              <span>{AMENITY_ICONS[a]}</span><span>{a}</span>
              {form.amenities.includes(a) && <span className="amenity-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="divider" />
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Add more photos</h2>
        <label className="upload-zone" style={{ marginBottom: 16 }}>
          <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
          <div className="upload-zone-inner">
            <span className="upload-icon">📸</span>
            <span className="upload-text">Click to add more photos</span>
          </div>
        </label>
        {newImagePreviews.length > 0 && (
          <div className="image-previews">
            {newImagePreviews.map((src, i) => (
              <div key={i} className="preview-item"><img src={src} alt={`New ${i}`} /></div>
            ))}
          </div>
        )}

        <div className="form-nav">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : '💾 Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
