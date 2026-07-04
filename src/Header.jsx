import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

function Header({ currentPage = 'home', onNavigate, cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [kpLoaded, setKpLoaded] = useState(false);

  useEffect(() => {
    const initKpButton = () => {
      if (window.__KP_LOGIN_SDK_INSTANCE__ && window.__KP_LOGIN_SDK_INSTANCE__.handleKpSSOButton) {
        window.__KP_LOGIN_SDK_INSTANCE__.handleKpSSOButton();
      }
    };

    const handleScriptLoad = () => {
      setKpLoaded(true);
      initKpButton();
    };

    window.addEventListener('kp-script-loaded', handleScriptLoad);
    
    // Check if already loaded
    if (window.__KP_LOGIN_SDK_INSTANCE__) {
      initKpButton();
    }

    return () => {
      window.removeEventListener('kp-script-loaded', handleScriptLoad);
    };
  }, []);

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
    { page: 'blog', label: 'Blog', path: '/blog' },
    { page: 'contact', label: 'Contact', path: '/contact' },
  ];

  return (
    <>
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
            <div 
              id="kwikpass-sso-container" 
              logo="https://pdp.gokwik.co/kwikpass/assets/icons/kwik_pass_logo.svg"
              style={{ minWidth: '150px' }}
            >
            </div>

            <button
              className={`action-btn ${currentPage === 'login' ? 'active' : ''}`}
              aria-label="Login / Account"
              onClick={() => navigate('login')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>

            <button
              className="action-btn cart-btn"
              aria-label={`Cart with ${cartCount} items`}
              onClick={() => navigate('cart')}
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
                  <div 
                    id="kwikpass-sso-container-mobile" 
                    logo="https://pdp.gokwik.co/kwikpass/assets/icons/kwik_pass_logo.svg"
                    style={{ margin: '1rem 0' }}
                  >
                  </div>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <a
                    href="/login"
                    className={`mobile-nav-link ${currentPage === 'login' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); navigate('login'); }}
                  >
                    Login / Account
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
