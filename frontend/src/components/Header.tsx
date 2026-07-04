'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Header.css';

export default function Header({ categories = [], cartCount = 0 }: { categories: any[], cartCount?: number }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { page: 'home', label: 'Home', path: '/' },
    { page: 'shop', label: 'Shop', path: '/shop' },
    ...categories.map(c => ({ page: c.slug, label: c.name, path: `/category/${c.slug}` })),
    { page: 'about', label: 'About', path: '/about' },
  ];

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <Link href="/" className="header-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo-01.png" alt="Swadyum" className="logo-img" />
          </Link>

          <nav className="header-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.page}>
                  <Link href={link.path} className={`nav-link ${pathname === link.path ? 'active' : ''}`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <Link href="/account" className={`action-btn ${pathname === '/account' ? 'active' : ''}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>

            <Link href="/cart" className="action-btn cart-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {cartCount > 0 && (
                <motion.span className="cart-badge" key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>{cartCount}</motion.span>
              )}
            </Link>

            <button className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="hamburger-line"></span><span className="hamburger-line"></span><span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="mobile-menu-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)}>
            <motion.nav className="mobile-menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} onClick={(e) => e.stopPropagation()}>
              <ul className="mobile-nav-list">
                {navLinks.map((link, i) => (
                  <motion.li key={link.page} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link href={link.path} className={`mobile-nav-link ${pathname === link.path ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
