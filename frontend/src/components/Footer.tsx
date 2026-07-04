'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        <div className="footer-brand-col">
          <div className="footer-logo">
            <img src="/logo-01.png" alt="Swadyum" className="footer-logo-img" />
          </div>
          <p className="footer-mission">
            Bringing the authentic taste, sun-cured heritage, and traditional spice secrets of Bihar straight to your dining table.
          </p>
          <div className="footer-social">
            {/* Social links */}
          </div>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop Best Sellers</Link></li>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/blog">Recipes & Blog</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Shop By Flavour</h4>
          <ul className="footer-list">
            <li><Link href="/category/mango-pickle">Mango Pickles</Link></li>
            <li><Link href="/category/garlic-pickle">Garlic Pickles</Link></li>
            <li><Link href="/category/lemon-pickle">Lemon Pickles</Link></li>
            <li><Link href="/shop">All Products</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter-col">
          <h4 className="footer-heading">Join the Family</h4>
          <p className="footer-newsletter-text">
            Subscribe for heritage recipes, exclusive offers, and updates on new batches.
          </p>
          
          {subscribed ? (
            <div className="footer-success">
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
                <button type="submit" className="footer-submit" aria-label="Subscribe">
                  Subscribe
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
            <Link href="/privacy">Privacy Policy</Link>
            <span className="footer-dot">•</span>
            <Link href="/terms">Terms of Service</Link>
            <span className="footer-dot">•</span>
            <Link href="/shipping">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
