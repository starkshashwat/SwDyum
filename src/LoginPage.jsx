import React, { useState } from 'react';
import './LoginPage.css';
import { mockDb } from './mockDb';

function LoginPage({ onNavigate, onLogin, redirectPath, setRedirectPath }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockDb.loginCustomer(email, password);
      setIsLoading(false);

      if (response && !response.error) {
        onLogin(response);
        if (redirectPath) {
          const target = redirectPath;
          setRedirectPath(null);
          onNavigate(target);
        } else {
          onNavigate('account');
        }
      } else {
        setError(response?.error || 'Invalid email or password. Try siddharth@gmail.com / password123.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during authentication.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <span className="section-subtitle">~ Welcome Back ~</span>
            <h1 className="login-title">Sign In to Swadyum</h1>
            <p className="login-desc">Access your orders, address records, and premium account features.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error-banner">{error}</div>}

            <div className="login-field-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. siddharth@gmail.com"
                required
              />
            </div>

            <div className="login-field-group">
              <div className="label-row">
                <label htmlFor="login-password">Password</label>
                <span className="forgot-password-link" onClick={() => onNavigate('forgot-password')}>
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="login-loader">
                  <span className="login-spinner"></span> Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              New to Swadyum?{' '}
              <span className="footer-navigate-link" onClick={() => onNavigate('signup')}>
                Create an Account
              </span>
            </p>
            <button className="login-home-btn" onClick={() => onNavigate('home')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
