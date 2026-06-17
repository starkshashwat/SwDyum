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
    <footer className="global-footer">
      <div className="footer-container">
        
        {/* Column 1: Brand & Social */}
        <div className="footer-column brand-column">
          <div className="footer-logo">
            <img src="/logo-01.png" alt="Swadyum Logo" className="footer-logo-img" />
          </div>
          <p className="footer-tagline">
            Bringing the authentic taste, sun-cured heritage, and traditional spice secrets of Bihar straight to your modern dining table.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <span>📸</span>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
              <span>💬</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <span>👤</span>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column links-column">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links-list">
            <li><a href="/" onClick={(e) => handleLinkClick('home', e)}>Home</a></li>
            <li><a href="/shop" onClick={(e) => handleLinkClick('shop', e)}>Shop Pickles</a></li>
            <li><a href="/about" onClick={(e) => handleLinkClick('about', e)}>Our Story</a></li>
            <li><a href="/reviews" onClick={(e) => handleLinkClick('reviews', e)}>Reviews</a></li>
            <li><a href="/blog" onClick={(e) => handleLinkClick('blog', e)}>Culinary Blog</a></li>
            <li><a href="/contact" onClick={(e) => handleLinkClick('contact', e)}>Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div className="footer-column links-column">
          <h4 className="footer-title">Our Categories</h4>
          <ul className="footer-links-list">
            <li><a href="/pickles" onClick={(e) => handleLinkClick('category-pickles', e)}>All Pickles</a></li>
            <li><a href="/mango-pickle" onClick={(e) => handleLinkClick('category-mango-pickle', e)}>Mango Pickles</a></li>
            <li><a href="/garlic-pickle" onClick={(e) => handleLinkClick('category-garlic-pickle', e)}>Garlic Pickles</a></li>
            <li><a href="/lemon-pickle" onClick={(e) => handleLinkClick('category-lemon-pickle', e)}>Lemon Pickles</a></li>
            <li><a href="/green-chilli-pickle" onClick={(e) => handleLinkClick('category-green-chilli-pickle', e)}>Green Chilli</a></li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div className="footer-column newsletter-column">
          <h4 className="footer-title">Newsletter</h4>
          <p className="newsletter-text">
            Subscribe to get heritage Bihari cooking tips, traditional recipes, and announcements of seasonal small batches.
          </p>
          
          {subscribed ? (
            <div className="footer-subscribe-success">
              <span>✓</span> Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="footer-email-input"
                required
              />
              <button type="submit" className="footer-subscribe-btn">
                Subscribe
              </button>
            </form>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} Swadyum Foods Private Limited. All Rights Reserved.
          </p>
          <div className="footer-policies">
            <a href="/privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span className="policy-divider">|</span>
            <a href="/terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
