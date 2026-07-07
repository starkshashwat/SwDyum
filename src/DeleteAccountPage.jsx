import React, { useEffect } from 'react';
import './DeleteAccountPage.css';
import { Mail, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

const DeleteAccountPage = ({ onNavigate }) => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="delete-account-page">
      <div className="delete-account-hero">
        <h1>Delete Your Account & Personal Data</h1>
        <p>We respect your privacy. If you wish to permanently delete your account and associated personal data, please follow the instructions below.</p>
      </div>

      <section className="delete-account-section">
        <h2>How to Delete Your Data</h2>
        
        <div className="delete-account-options">
          <div className="delete-option">
            <h3>Option 1: Self-Service Deletion (Recommended)</h3>
            <p>You can instantly request data deletion directly from your account settings.</p>
            <ol>
              <li>Log in to your Swadyum account.</li>
              <li>Navigate to your <strong>Account Dashboard</strong>.</li>
              <li>Scroll down to the <strong>Danger Zone</strong> section.</li>
              <li>Click <strong>Request Account Deletion</strong> and confirm.</li>
            </ol>
            <button onClick={() => onNavigate('account')} className="delete-btn-primary">
              Go to Account Settings
            </button>
          </div>

          <div className="delete-option">
            <h3>Option 2: Email Request</h3>
            <p>If you cannot access your account, you can email us to request data deletion.</p>
            <ol>
              <li>Send an email to <strong>swadyum@gmail.com</strong> from the email address associated with your account.</li>
              <li>Use the subject line: <strong>"Data Deletion Request"</strong>.</li>
              <li>Include your full name and phone number for verification.</li>
            </ol>
            <a href="mailto:swadyum@gmail.com?subject=Data Deletion Request" className="delete-btn-primary">
              <Mail size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Email Support
            </a>
          </div>
        </div>
      </section>

      <section className="delete-account-section">
        <h2>What happens when you delete your account?</h2>
        
        <div className="delete-info-grid">
          <div className="info-card warning">
            <h3><ShieldAlert size={22} /> What is Deleted / Anonymized</h3>
            <ul>
              <li>Your personal profile information (Name, Email, Phone).</li>
              <li>Your saved delivery addresses.</li>
              <li>Your active cart and wishlist items.</li>
              <li>Your marketing and WhatsApp messaging preferences.</li>
              <li>You will no longer be able to log in.</li>
            </ul>
          </div>

          <div className="info-card safe">
            <h3><FileText size={22} /> What is Retained</h3>
            <ul>
              <li>Past order records and invoices.</li>
              <li>Payment transaction logs.</li>
              <li><em>Note: These are retained strictly for tax, legal, and accounting compliance as required by Indian law.</em></li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="delete-account-section" style={{ textAlign: 'center' }}>
        <h2><CheckCircle size={28} style={{ color: '#27ae60', verticalAlign: 'bottom', marginRight: '10px' }} /> Meta & WhatsApp Compliance</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--color-text)' }}>
          This data deletion portal satisfies Facebook and WhatsApp App Review policies. If you have interacted with our WhatsApp bot and wish to revoke access and delete your history, processing this deletion will successfully disconnect your account.
        </p>
      </section>
    </div>
  );
};

export default DeleteAccountPage;
