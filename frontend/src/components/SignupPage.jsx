import React, { useState } from 'react';
import './SignupPage.css';
import { mockDb } from './mockDb';

function SignupPage({ onNavigate, onSignup, redirectPath, setRedirectPath }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await mockDb.registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setIsLoading(false);

      if (response.error) {
        setApiError(response.error);
      } else {
        onSignup(response);
        if (redirectPath) {
          const target = redirectPath;
          setRedirectPath(null);
          onNavigate(target);
        } else {
          onNavigate('account');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setApiError('An error occurred during registration.');
    }
  };

  return (
    <div className="signup-page-wrapper">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <span className="section-subtitle">~ Join Swadyum ~</span>
            <h1 className="signup-title">Create your Account</h1>
            <p className="signup-desc">Track your orders, save delivery locations, and get early access to new pickle releases.</p>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {apiError && <div className="signup-error-banner">{apiError}</div>}

            <div className="signup-field-group">
              <label htmlFor="reg-name">Full Name *</label>
              <input
                type="text"
                id="reg-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error-input' : ''}
                placeholder="e.g. Siddharth Raj"
              />
              {errors.name && <span className="reg-error-text">{errors.name}</span>}
            </div>

            <div className="signup-field-group">
              <label htmlFor="reg-email">Email Address *</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error-input' : ''}
                placeholder="e.g. siddharth@gmail.com"
              />
              {errors.email && <span className="reg-error-text">{errors.email}</span>}
            </div>

            <div className="signup-field-group">
              <label htmlFor="reg-phone">Phone Number *</label>
              <input
                type="tel"
                id="reg-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error-input' : ''}
                placeholder="10-digit mobile number"
              />
              {errors.phone && <span className="reg-error-text">{errors.phone}</span>}
            </div>

            <div className="signup-field-group">
              <label htmlFor="reg-password">Password *</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error-input' : ''}
                placeholder="Min. 6 characters"
              />
              {errors.password && <span className="reg-error-text">{errors.password}</span>}
            </div>

            <div className="signup-field-group">
              <label htmlFor="reg-confirm-password">Confirm Password *</label>
              <input
                type="password"
                id="reg-confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error-input' : ''}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="reg-error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="signup-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="signup-loader">
                  <span className="signup-spinner"></span> Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <span className="footer-navigate-link" onClick={() => onNavigate('login')}>
                Sign In Instead
              </span>
            </p>
            <button className="signup-home-btn" onClick={() => onNavigate('home')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
