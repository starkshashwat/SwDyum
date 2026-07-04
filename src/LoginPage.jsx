import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onNavigate, onLogin, redirectPath, setRedirectPath }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Phone input, 2 = OTP input
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);

    try {
      if (window.__KP_LOGIN_SDK_INSTANCE__ && window.__KP_LOGIN_SDK_INSTANCE__.kpSendOTP) {
        const response = await window.__KP_LOGIN_SDK_INSTANCE__.kpSendOTP(phone);
        setIsLoading(false);
        
        if (response && response.status === 200) {
          setStep(2); // Proceed to OTP step
        } else {
          setError(response?.message || 'Failed to send OTP. Please try again.');
        }
      } else {
        setIsLoading(false);
        setError('GoKwik SDK is not loaded properly. Please try again later.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred while sending OTP.');
      console.error(err);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }

    setIsLoading(true);

    try {
      if (window.__KP_LOGIN_SDK_INSTANCE__ && window.__KP_LOGIN_SDK_INSTANCE__.kpVerifyOTP) {
        const response = await window.__KP_LOGIN_SDK_INSTANCE__.kpVerifyOTP({ phone, otp });
        setIsLoading(false);

        if (response && response.status === 200) {
          const kpToken = response.body?.data?.kpToken;
          
          if (kpToken) {
            window.dispatchEvent(new CustomEvent('kwikpass-sso', { detail: { kpToken } }));
          }

          onLogin({
            id: 'kp_user_id',
            name: 'KwikPass User',
            phone: phone,
            token: kpToken
          });

          if (redirectPath) {
            const target = redirectPath;
            setRedirectPath(null);
            onNavigate(target);
          } else {
            onNavigate('shop');
          }
        } else {
          setError(response?.message || 'Invalid OTP. Please try again.');
        }
      } else {
        setIsLoading(false);
        setError('GoKwik SDK is not loaded properly.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred while verifying OTP.');
      console.error(err);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <span className="section-subtitle">~ Welcome Back ~</span>
            <h1 className="login-title">Sign In with Phone</h1>
            <p className="login-desc">Enter your phone number to receive a secure OTP via GoKwik.</p>
          </div>

          {error && <div className="login-error-banner">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="login-form">
              <div className="login-field-group">
                <label htmlFor="login-phone">Phone Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}>+91</span>
                  <input
                    type="tel"
                    id="login-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10 digit number"
                    style={{ flex: 1 }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="login-form">
              <div className="login-field-group">
                <label htmlFor="login-otp">Enter OTP</label>
                <input
                  type="text"
                  id="login-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter the OTP received"
                  required
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem' }}
                />
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
              
              <button 
                type="button" 
                className="gokwik-pass-btn" 
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                style={{ marginTop: '1rem', background: 'none', color: '#666', border: 'none', width: '100%' }}
              >
                Change Phone Number
              </button>
            </form>
          )}

          <div className="login-footer">
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
