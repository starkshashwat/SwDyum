import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

function Header({ currentPage = 'home', onNavigate, cartCount = 0, onOpenCart }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on navigation
  const navigate = (page) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) onNavigate(page);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { page: 'home', label: 'Home', path: '/' },
    { page: 'shop', label: 'Shop', path: '/shop' },
    { page: 'about', label: 'About', path: '/about' },
    { page: 'recipes', label: 'Recipes', path: '/recipes' },
  ];

  return (
    <>
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="top-bar-contact">
            <a href="tel:+918340528122" aria-label="Call us">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path></svg>
              +91 8340528122
            </a>
            <a href="mailto:swadyum@gmail.com" aria-label="Email us">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              swadyum@gmail.com
            </a>
          </div>
          
          <div className="top-bar-announcement">
            <div className="marquee-container">
              <div className="marquee-content">
                <span>🎉 Flat 20% off on all Pickles! Use code SWADYUM20 🎉 Free Shipping on orders above ₹799! 🎉</span>
                <span>🎉 Flat 20% off on all Pickles! Use code SWADYUM20 🎉 Free Shipping on orders above ₹799! 🎉</span>
              </div>
            </div>
          </div>

          <div className="top-bar-socials">
            <a href="#" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg></a>
            <a href="#" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
            <a href="#" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg></a>
          </div>
        </div>
      </div>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <a
            href="/"
            className="header-logo"
            onClick={(e) => { e.preventDefault(); navigate('home'); }}
            aria-label="Swadyum Home"
          >
            <img src="/logo-01.png" alt="Swadyum" className="logo-img" />
          </a>

          {/* Desktop Nav */}
          <nav className="header-nav" aria-label="Main navigation">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.page}>
                  <a
                    href={link.path}
                    className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate(link.page); }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button
              className={`action-btn ${currentPage === 'account' ? 'active' : ''}`}
              aria-label="My account"
              onClick={() => navigate('account')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            <button
              className="action-btn cart-btn"
              aria-label={`Cart with ${cartCount} items`}
              onClick={onOpenCart}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <motion.span
                  className="cart-badge"
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.nav
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile navigation"
            >
              <ul className="mobile-nav-list">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.page}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <a
                      href={link.path}
                      className={`mobile-nav-link ${currentPage === link.page ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); navigate(link.page); }}
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <a
                    href="/account"
                    className={`mobile-nav-link ${currentPage === 'account' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('account'); }}
                  >
                    My Account
                  </a>
                </motion.li>
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
