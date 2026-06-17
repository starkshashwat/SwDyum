import React, { useState } from 'react';
import './ForgotPasswordPage.css';
import { supabase } from './supabaseClient';

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });
      setIsLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during password recovery.');
    }
  };

  return (
    <div className="forgot-page-wrapper">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-header">
            <span className="section-subtitle">~ Recovery ~</span>
            <h1 className="forgot-title">Reset Password</h1>
            <p className="forgot-desc">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {success ? (
            <div className="forgot-success-state">
              <span className="forgot-success-icon">✉️</span>
              <h3>Reset Link Sent</h3>
              <p>
                We've sent a simulated password recovery email to <strong>{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button className="forgot-back-login-btn" onClick={() => onNavigate('login')}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-form">
              {error && <div className="forgot-error-banner">{error}</div>}

              <div className="forgot-field-group">
                <label htmlFor="forgot-email">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. siddharth@gmail.com"
                  required
                />
              </div>

              <button type="submit" className="forgot-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="forgot-loader">
                    <span className="forgot-spinner"></span> Sending Link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <div className="forgot-footer">
            <span className="back-login-link" onClick={() => onNavigate('login')}>
              ← Return to Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
