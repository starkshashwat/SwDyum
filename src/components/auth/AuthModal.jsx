import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthModal.css';
import { supabase } from '../../supabaseClient';

async function readFnErrorMessage(funcError, fallback) {
  try {
    const ctx = funcError?.context;
    if (ctx && typeof ctx.json === 'function') {
      const body = await ctx.json();
      if (body?.error) return body.error;
    }
  } catch {
    /* ignore */
  }
  return funcError?.message || fallback;
}

export default function AuthModal({ isOpen, onClose, onSuccess, isLinking = false, userId = null }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [optIn, setOptIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError('Failed to initialize Google login.');
      setIsLoading(false);
    }
  };

  const formatPhone = (val) => {
    if (val && !val.startsWith('+')) {
      return '+91' + val.replace(/\D/g, '');
    }
    return val;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const formattedPhone = formatPhone(phone);
    if (formattedPhone.length < 12) {
      setError('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('whatsapp-auth', {
        body: { action: 'send', phone: formattedPhone }
      });

      if (funcError) throw new Error(await readFnErrorMessage(funcError, 'Failed to send OTP. Please try again.'));
      if (data?.error) throw new Error(data.error);

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      
      const payload = { action: 'verify', phone: formattedPhone, otp: otpString, optIn };
      if (isLinking && userId) {
        payload.userId = userId;
      }

      const { data, error: funcError } = await supabase.functions.invoke('whatsapp-auth', {
        body: payload
      });

      if (funcError) throw new Error(await readFnErrorMessage(funcError, 'Invalid or expired OTP.'));
      if (data?.error) throw new Error(data.error);

      if (data.profile) {
        if (!isLinking) {
           localStorage.setItem('swadyum_current_user', JSON.stringify(data.profile));
           if (data.token) localStorage.setItem('swadyum_session_token', data.token);
        }
        onSuccess(data.profile);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  useEffect(() => {
    if (step === 2 && otp.length === 6 && otp.every(d => d !== '')) {
      handleVerifyOtp();
    }
  }, [otp, step]);

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="wa-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="wa-modal-container auth-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
          >
            {!isLinking && (
              <button className="wa-modal-close" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}

            <div className="wa-modal-header">
              <div className="wa-icon-wrapper">
                <img src="/logo-01.webp" alt="Swadyum" className="wa-logo-img" />
              </div>
              <h2 className="wa-modal-title">
                {isLinking ? 'Link Your Phone' : 'Welcome to Swadyum'}
              </h2>
              <p className="wa-modal-subtitle">
                {step === 1 
                  ? (isLinking ? 'Please verify your phone number to complete account setup.' : 'Sign in or create an account to track your orders.') 
                  : 'We\'ve sent a 6-digit secure code to your WhatsApp.'}
              </p>
            </div>

            {error && <div className="wa-error-banner">{error}</div>}

            {step === 1 ? (
              <div className="auth-modal-content">
                {!isLinking && (
                  <>
                    <button 
                      className="google-auth-btn" 
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="google-icon" />
                      Sign in with Google
                    </button>

                    <div className="auth-divider">
                      <span>OR</span>
                    </div>
                  </>
                )}

                <form onSubmit={handleSendOtp} className="wa-modal-form">
                  <div className="wa-input-group">
                    <span className="wa-input-prefix">🇮🇳 +91</span>
                    <input
                      type="tel"
                      className="wa-input-phone"
                      placeholder="WhatsApp / Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <label className="wa-optin-checkbox">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                    />
                    <span className="wa-checkbox-custom"></span>
                    <span className="wa-checkbox-label">
                      Get delivery updates & exclusive offers on WhatsApp
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="wa-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Continue with Phone'}
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="wa-modal-form">
                <div className="wa-otp-container">
                  {otp.map((data, index) => (
                    <input
                      className="wa-otp-input"
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onKeyDown={e => handleOtpKeyDown(e, index)}
                      onFocus={e => e.target.select()}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="wa-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                </button>

                <button
                  type="button"
                  className="wa-resend-btn"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
