import React, { useState } from 'react';
import './Footer.css';

function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  const handleLinkClick = (page, e) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Brand & Accountability Info */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <img src="/logo-01.webp" alt="Swadyum" className="footer-logo-img" />
          </div>

          <p className="footer-mission">
            Bringing the authentic taste, sun-cured heritage, and traditional spice secrets of Bihar straight to your dining table.
          </p>

          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://wa.me/918340528122" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list">
            <li><a href="/" onClick={(e) => handleLinkClick('home', e)}>Home</a></li>
            <li><a href="/shop" onClick={(e) => handleLinkClick('shop', e)}>Shop Bestsellers</a></li>
            <li><a href="/about" onClick={(e) => handleLinkClick('about', e)}>Our Story</a></li>
            <li><a href="/contact" onClick={(e) => handleLinkClick('contact', e)}>Contact Us</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-links-col">
          <h4 className="footer-heading">Shop By Flavour</h4>
          <ul className="footer-list">
            <li><a href="/product/mango-pickle" onClick={(e) => handleLinkClick('product-mango-pickle', e)}>Mango Pickle</a></li>
            <li><a href="/shop" onClick={(e) => handleLinkClick('shop', e)}>All Products</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter-col">
          <h4 className="footer-heading">Join the Family</h4>
          <p className="footer-newsletter-text">
            Get new-batch updates, recipes, and subscriber-only offers.
          </p>
          
          {subscribed ? (
            <div className="footer-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Welcome to the Swadyum family!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-form">
              <div className="footer-input-group">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="footer-input"
                  required
                />
                <button type="submit" className="footer-submit-btn" aria-label="Join the Family">
                  Join the Family
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Swadyum Foods Pvt. Ltd. All Rights Reserved.
          </p>
          <div className="footer-legal">
            <a href="/privacy-policy" onClick={(e) => handleLinkClick('privacy-policy', e)}>Privacy Policy</a>
            <span className="footer-dot">•</span>
            <a href="/terms" onClick={(e) => handleLinkClick('terms', e)}>Terms of Service</a>
            <span className="footer-dot">•</span>
            <a href="/shipping-policy" onClick={(e) => handleLinkClick('shipping-policy', e)}>Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
