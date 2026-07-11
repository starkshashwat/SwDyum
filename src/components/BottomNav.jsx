import React from 'react';
import './BottomNav.css';

/* ─── Custom SVG icons — theme-matched, stroke-based, elegant ─── */
const NavIcon = {
  home: (active) => (
    <svg viewBox="0 0 24 24" className={`bnav-icon ${active ? 'active' : ''}`}>
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V10.5z" />
    </svg>
  ),
  shop: (active) => (
    <svg viewBox="0 0 24 24" className={`bnav-icon ${active ? 'active' : ''}`}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  story: (active) => (
    <svg viewBox="0 0 24 24" className={`bnav-icon ${active ? 'active' : ''}`}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  recipes: (active) => (
    <svg viewBox="0 0 24 24" className={`bnav-icon ${active ? 'active' : ''}`}>
      <path d="M12 3c-1.5 0-2.5 1-2.5 2.5 0 1 .5 1.5 1 2L9 11h6l-1.5-3.5c.5-.5 1-1 1-2C14.5 4 13.5 3 12 3z" />
      <rect x="6" y="11" width="12" height="2" rx="1" />
      <path d="M7 13v2a5 5 0 0 0 10 0v-2" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  ),
  cart: (active) => (
    <svg viewBox="0 0 24 24" className={`bnav-icon ${active ? 'active' : ''}`}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
};

const tabs = [
  { key: 'home', label: 'Home', icon: NavIcon.home },
  { key: 'shop', label: 'Shop', icon: NavIcon.shop },
  { key: 'about', label: 'Our Story', icon: NavIcon.story },
  { key: 'recipes', label: 'Recipes', icon: NavIcon.recipes },
  { key: 'cart', label: 'Cart', icon: NavIcon.cart },
];

export default function BottomNav({ currentPage, onNavigate, cartCount = 0, onOpenCart }) {
  const handleTap = (key) => {
    if (key === 'cart') {
      onOpenCart();
    } else {
      onNavigate(key);
    }
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const isActive = tab.key === currentPage;
        return (
          <button
            key={tab.key}
            className={`bnav-tab ${isActive ? 'active' : ''}`}
            onClick={() => handleTap(tab.key)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bnav-icon-wrap">
              {tab.icon(isActive)}
              {tab.key === 'cart' && cartCount > 0 && (
                <span className="bnav-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </span>
            <span className="bnav-label">{tab.label}</span>
            {isActive && <span className="bnav-dot" />}
          </button>
        );
      })}
    </nav>
  );
}
