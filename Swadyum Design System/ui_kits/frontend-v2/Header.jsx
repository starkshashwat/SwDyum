function Header({ page, onNavigate, cartCount, onOpenCart }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navLinks = [
    { key: 'home', label: 'Home' },
    { key: 'shop', label: 'Shop' },
    { key: 'combo', label: 'Build a Box' },
    { key: 'recipes', label: 'Recipes' },
    { key: 'about', label: 'Our Story' },
    { key: 'contact', label: 'Contact' },
  ];
  const go = (k) => { setMenuOpen(false); onNavigate(k); };

  return (
    <div>
      {/* announcement bar */}
      <div style={{ background: 'var(--color-ink)', color: '#fff', fontSize: 12, fontWeight: 600, textAlign: 'center', padding: '9px 16px' }}>
        🎉 Flat 20% off — code SWADYUM20 · Free shipping above ₹799
      </div>

      <header style={{ position: 'sticky', top: 0, zIndex: 200, background: 'rgba(244,248,245,0.92)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <a onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src="../../assets/logo/logo-mark.png" alt="Swadyum" style={{ height: 42, width: 42 }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'var(--color-ink)' }}>Swadyum</span>
          </a>

          <nav className="desktop-only" style={{ gap: 2 }}>
            {navLinks.map((l) => (
              <a key={l.key} onClick={() => go(l.key)} style={{
                padding: '8px 14px', fontSize: 14, fontWeight: 600, borderRadius: 10,
                color: page === l.key ? 'var(--color-primary)' : 'var(--color-ink)',
                borderBottom: page === l.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}>{l.label}</a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => go('account')} aria-label="Account" style={iconBtn(page === 'account')}><Icon name="account" /></button>
            <button onClick={onOpenCart} aria-label="Cart" style={{ ...iconBtn(false), position: 'relative' }}>
              <Icon name="cart" />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: 3, right: 3, minWidth: 18, height: 18, background: 'var(--color-primary)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{cartCount}</span>
              )}
            </button>
            <button className="mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" style={iconBtn(false)}>
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav style={{ display: 'flex', flexDirection: 'column', padding: '8px 16px 16px', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            {navLinks.map((l) => (
              <a key={l.key} onClick={() => go(l.key)} style={{
                padding: '14px 12px', fontSize: 16, fontWeight: 600, borderRadius: 10,
                color: page === l.key ? 'var(--color-primary)' : 'var(--color-ink)',
                background: page === l.key ? 'rgba(10,90,50,0.06)' : 'none',
              }}>{l.label}</a>
            ))}
          </nav>
        )}
      </header>
    </div>
  );
}

function iconBtn(active) {
  return {
    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'none', cursor: 'pointer', borderRadius: 10,
    color: active ? 'var(--color-primary)' : 'var(--color-ink)',
  };
}
window.Header = Header;
