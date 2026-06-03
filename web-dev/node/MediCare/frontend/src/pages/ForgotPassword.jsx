import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import backendUrl from '../utils/BackendURL';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset instructions have been sent.');
        if (data.resetUrl) {
          setMessage(`${data.message} Dev reset link: ${data.resetUrl}`);
        }
      } else {
        setError(data.message || 'Unable to request password reset');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shape shape-1"></div>
        <div className="auth-shape shape-2"></div>
        <div className="auth-shape shape-3"></div>
      </div>

      <aside className="auth-showcase">
        <div className="auth-showcase-badge">
          <i className="fas fa-key"></i>
          Account recovery
        </div>
        <h1>Recover access without losing your care history.</h1>
        <p>We will send a secure, time-limited reset link to the email connected to your MediCare account.</p>
        <div className="auth-showcase-grid">
          <div>
            <strong>30m</strong>
            <span>Valid link</span>
          </div>
          <div>
            <strong>Safe</strong>
            <span>Reset</span>
          </div>
          <div>
            <strong>Back</strong>
            <span>Online</span>
          </div>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-lock-open"></i>
          </div>
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <span>{message}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your account email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Sending Link...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remembered your password?</p>
          <Link to="/login" className="auth-link">
            Sign In
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
