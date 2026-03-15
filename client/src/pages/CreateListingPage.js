import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AMENITIES_LIST, AMENITY_ICONS, PROPERTY_TYPES } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ListingFormPage.css';

const STEPS = ['Basics', 'Location', 'Details', 'Amenities', 'Photos'];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', price: '', propertyType: 'Apartment',
    maxGuests: 1, bedrooms: 1, beds: 1, bathrooms: 1,
    address: '', city: '', state: '', country: '',
    lat: '', lng: '', amenities: []
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a]
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    if (step === 0) {
      if (!form.title.trim() || form.title.length < 5) return 'Title must be at least 5 characters';
      if (!form.description.trim() || form.description.length < 20) return 'Description must be at least 20 characters';
      if (!form.price || Number(form.price) < 1) return 'Price must be at least $1';
    }
    if (step === 1) {
      if (!form.city.trim()) return 'City is required';
      if (!form.country.trim()) return 'Country is required';
      if (!form.address.trim()) return 'Address is required';
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      imageFiles.forEach(f => fd.append('images', f));
      const { data } = await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created! 🎉');
      navigate(`/listings/${data.listing._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
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

  return (
    <div className="listing-form-page container">
      <div className="form-page-header">
        <h1>List your place</h1>
        <p>Share your space with travellers from around the world</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <div className="step-dot">{i < step ? '✓' : i + 1}</div>
            <span className="step-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="form-card">
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="form-step">
            <h2>Tell us about your place</h2>
            <div className="form-group">
              <label className="form-label">Property type</label>
              <div className="type-grid">
                {PROPERTY_TYPES.map(t => (
                  <button key={t} type="button" className={`type-btn ${form.propertyType === t ? 'active' : ''}`} onClick={() => update('propertyType', t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Listing title</label>
              <input className="form-input" placeholder="e.g. Cozy studio near the beach" value={form.title} onChange={e => update('title', e.target.value)} maxLength={100} />
              <span className="form-hint">{form.title.length}/100 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={5} placeholder="Describe your space, what makes it special, nearby attractions..." value={form.description} onChange={e => update('description', e.target.value)} maxLength={2000} />
              <span className="form-hint">{form.description.length}/2000 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label">Price per night (USD)</label>
              <div className="price-input-wrap">
                <span className="price-symbol">$</span>
                <input type="number" className="form-input price-input" placeholder="0" value={form.price} onChange={e => update('price', e.target.value)} min={1} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="form-step">
            <h2>Where is your place located?</h2>
            <div className="form-group">
              <label className="form-label">Street address</label>
              <input className="form-input" placeholder="123 Main Street" value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="New York" value={form.city} onChange={e => update('city', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">State / Region</label>
                <input className="form-input" placeholder="NY" value={form.state} onChange={e => update('state', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <input className="form-input" placeholder="United States" value={form.country} onChange={e => update('country', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude (optional)</label>
                <input type="number" className="form-input" placeholder="40.7128" value={form.lat} onChange={e => update('lat', e.target.value)} step="any" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (optional)</label>
                <input type="number" className="form-input" placeholder="-74.0060" value={form.lng} onChange={e => update('lng', e.target.value)} step="any" />
              </div>
            </div>
            <p className="form-hint">💡 Add coordinates to show your listing on a map. Find them at maps.google.com</p>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="form-step">
            <h2>Property details</h2>
            <div className="num-inputs-list">
              <NumInput label="Maximum guests" field="maxGuests" min={1} max={30} />
              <NumInput label="Bedrooms" field="bedrooms" min={0} max={20} />
              <NumInput label="Beds" field="beds" min={1} max={30} />
              <NumInput label="Bathrooms" field="bathrooms" min={1} max={20} />
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div className="form-step">
            <h2>What does your place offer?</h2>
            <p className="form-hint" style={{ marginBottom: 20 }}>Select all amenities that apply</p>
            <div className="amenities-selector">
              {AMENITIES_LIST.map(a => (
                <button key={a} type="button" className={`amenity-btn ${form.amenities.includes(a) ? 'active' : ''}`} onClick={() => toggleAmenity(a)}>
                  <span>{AMENITY_ICONS[a]}</span>
                  <span>{a}</span>
                  {form.amenities.includes(a) && <span className="amenity-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 4 && (
          <div className="form-step">
            <h2>Add photos of your place</h2>
            <p className="form-hint" style={{ marginBottom: 20 }}>Upload up to 10 photos. The first photo will be your cover image.</p>
            <label className="upload-zone">
              <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
              <div className="upload-zone-inner">
                <span className="upload-icon">📸</span>
                <span className="upload-text">Click to upload photos</span>
                <span className="upload-hint">JPEG, PNG, WebP up to 5MB each</span>
              </div>
            </label>
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="preview-item">
                    <img src={src} alt={`Preview ${i+1}`} />
                    {i === 0 && <span className="cover-badge">Cover</span>}
                    <button type="button" className="remove-img" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="form-nav">
          {step > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => { setError(''); setStep(s => s - 1); }}>
              ← Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={next}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spinner" /> Publishing...</> : '🚀 Publish listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
