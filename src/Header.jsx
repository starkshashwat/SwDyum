import React, { useState, useEffect } from 'react';
import './Header.css';

function Header({ currentPage = 'home', onNavigate, cartCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener to change header background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`ecommerce-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        
        {/* Left: Logo */}
        <div className="header-logo">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('home');
            }}
          >
            <img src="/logo-01.png" alt="Swadyum Logo" className="logo-img" />
          </a>
        </div>

        {/* Center: Navigation */}
        <nav className="header-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a 
                href="/" 
                className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('home');
                }}
              >
                Home
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/shop" 
                className={`nav-link ${currentPage === 'shop' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('shop');
                }}
              >
                Shop
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/about" 
                className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('about');
                }}
              >
                About Us
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/blog" 
                className={`nav-link ${currentPage === 'blog' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('blog');
                }}
              >
                Recipes & Blog
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="/contact" 
                className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('contact');
                }}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Right: Icons (Search, Account, Cart) */}
        <div className="header-actions">
          <button className="action-btn" aria-label="Search">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
          
          <button 
            className={`action-btn account-btn ${currentPage === 'account' ? 'active' : ''}`} 
            aria-label="Account"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('account');
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </button>
          
          <button 
            className="action-btn cart-btn" 
            aria-label="Cart"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('cart');
            }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span className="cart-badge">{cartCount}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" aria-label="Menu">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
