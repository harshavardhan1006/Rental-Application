import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏠 StayFinder</Link>
          <h1>Welcome back</h1>
          <p>Log in to your account</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email" name="email" className="form-input"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange} required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="Your password" value={form.password}
              onChange={handleChange} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" />Logging in...</> : 'Log in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up for free</Link>
        </p>

        {/* Demo credentials */}
        <div className="demo-box">
          <p><strong>Demo credentials:</strong></p>
          <p>Email: demo@stayfinder.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
