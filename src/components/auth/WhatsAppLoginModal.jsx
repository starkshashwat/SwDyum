import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WhatsAppLoginModal.css';
import { supabase } from '../../supabaseClient';

export default function WhatsAppLoginModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [optIn, setOptIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (val) => {
    // Basic formatter for India by default, or let user type full with +
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

      if (funcError) throw funcError;
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
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);

    try {
      const formattedPhone = formatPhone(phone);
      const { data, error: funcError } = await supabase.functions.invoke('whatsapp-auth', {
        body: { action: 'verify', phone: formattedPhone, otp: otpString, optIn }
      });

      if (funcError) throw funcError;
      if (data?.error) throw new Error(data.error);

      // Successfully verified. Set the local user cache.
      if (data.profile) {
        localStorage.setItem('swadyum_current_user', JSON.stringify(data.profile));
        // Trigger success callback to proceed with checkout or state update
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
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="wa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="wa-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: "-40%", x: "0" }}
            animate={{ opacity: 1, scale: 1, y: "0", x: "0" }}
            exit={{ opacity: 0, scale: 0.95, y: "-40%", x: "0" }}
          >
            <button className="wa-modal-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="wa-modal-header">
              <div className="wa-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.884c-.001 2.086.551 4.128 1.604 5.925L.031 23.94l6.322-1.647c1.728.954 3.681 1.458 5.688 1.459h.005c6.58 0 11.942-5.334 11.945-11.887 0-3.172-1.245-6.155-3.471-8.416zm-8.472 20.301h-.004c-1.768-.001-3.504-.469-5.027-1.362l-.36-.21-3.738.974.994-3.626-.231-.365A11.783 11.783 0 011.996 11.88c.002-5.46 4.475-9.91 9.97-9.91 2.66 0 5.161 1.031 7.042 2.905 1.88 1.875 2.915 4.363 2.914 7.009-.003 5.461-4.477 9.916-9.874 9.916zm5.421-7.37c-.297-.148-1.758-.863-2.03-.96-.271-.098-.47-.148-.669.148-.198.296-.767.96-.94 1.157-.174.197-.347.221-.645.074-.297-.148-1.254-.459-2.39-1.472-.884-.788-1.48-1.76-1.654-2.056-.174-.296-.019-.456.13-.603.134-.132.297-.344.446-.517.149-.173.198-.295.297-.492.099-.197.05-.37-.025-.517-.074-.148-.669-1.599-.916-2.19-.241-.577-.487-.499-.669-.508-.174-.008-.372-.01-.57-.01-.198 0-.521.074-.793.37-.272.295-1.04 1.008-1.04 2.458 0 1.45.1065 2.853 1.213 3.985 1.107 1.132 2.502 3.86 6.066 5.38.847.362 1.508.577 2.023.739.851.27 1.626.231 2.235.14.683-.103 2.053-.836 2.343-1.644.29-.808.29-1.5.203-1.644-.087-.148-.322-.246-.62-.394z" fill="#25D366"/>
                </svg>
              </div>
              <h2 className="wa-modal-title">Welcome to Swadyum</h2>
              <p className="wa-modal-subtitle">
                {step === 1 ? 'Enter your WhatsApp number to securely access your account and track your handcrafted pickles.' : 'We\'ve sent a 6-digit secure code to your WhatsApp.'}
              </p>
            </div>

            {error && <div className="wa-error-banner">{error}</div>}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="wa-modal-form">
                <div className="wa-input-group">
                  <span className="wa-input-prefix">🇮🇳 +91</span>
                  <input
                    type="tel"
                    className="wa-input-phone"
                    placeholder="Enter mobile number"
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
                  {isLoading ? 'Sending OTP...' : 'Send OTP via WhatsApp'}
                </button>
              </form>
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
        </>
      )}
    </AnimatePresence>
  );
}
