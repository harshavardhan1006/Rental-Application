import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to StayFinder 🎉');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏠 StayFinder</Link>
          <h1>Create account</h1>
          <p>Join millions of travellers worldwide</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              type="text" name="name" className="form-input"
              placeholder="John Doe" value={form.name}
              onChange={handleChange} required autoFocus minLength={2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email" name="email" className="form-input"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="Min 6 characters" value={form.password}
              onChange={handleChange} required minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              type="password" name="confirm" className="form-input"
              placeholder="Repeat your password" value={form.confirm}
              onChange={handleChange} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" />Creating account...</> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
