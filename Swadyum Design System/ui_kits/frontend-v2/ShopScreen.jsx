function ShopScreen({ onNavigate, addToCart }) {
  const { ProductCard, Select } = window.DS;
  const { PRODUCTS } = window;
  const [filter, setFilter] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('default');
  const [query, setQuery] = React.useState('');

  const tabs = ['All', 'Bestseller', 'Spicy'];
  let list = PRODUCTS.filter((p) => {
    if (query && !(p.name + p.en).toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'Bestseller') return p.badge === 'bestseller';
    if (filter === 'Spicy') return p.spice >= 3;
    return true;
  });
  list = [...list].sort((a, b) => {
    const ap = a.prices['250g'], bp = b.prices['250g'];
    if (sortBy === 'price-low') return ap - bp;
    if (sortBy === 'price-high') return bp - ap;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div data-screen-label="Shop">
      <section style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '56px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--color-secondary)' }}>The Shop</span>
          <h1 className="headline h2" style={{ color: '#fff' }}>Every jar, <em>every flavour</em></h1>
        </div>
      </section>

      <section style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', position: 'sticky', top: 68, zIndex: 100 }}>
        <div className="container" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '8px 18px', borderRadius: 999, border: '1px solid var(--color-border)', cursor: 'pointer',
                background: filter === t ? 'var(--color-primary)' : 'transparent',
                color: filter === t ? '#fff' : 'var(--color-ink)', fontSize: 13, fontWeight: 600,
              }}>{t === 'All' ? 'All Pickles' : t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--color-border)', borderRadius: 999, padding: '8px 14px', color: 'var(--color-muted)' }}>
              <Icon name="search" size={15} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pickles…" style={{ border: 'none', outline: 'none', background: 'none', fontSize: 13, fontFamily: 'var(--font-body)', width: 130 }} />
            </div>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={[
              { key: 'default', label: 'Recommended' },
              { key: 'price-low', label: 'Price: Low → High' },
              { key: 'price-high', label: 'Price: High → Low' },
              { key: 'rating', label: 'Top Rated' },
            ]} />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container" style={{ padding: 0 }}>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 20px' }}>Showing <strong>{list.length}</strong> pickle{list.length !== 1 ? 's' : ''}</p>
          <div className="grid-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={{ ...p, price: p.prices['250g'], oldPrice: p.mrps['250g'] }} onOpen={() => onNavigate('product-' + p.slug)} onAddToCart={() => addToCart(p, '250g')} />
            ))}
          </div>

          {/* combo strip */}
          <div style={{ marginTop: 48, background: 'var(--color-primary-dark)', color: '#fff', borderRadius: 24, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: '0 0 6px' }}>Can't pick one? Build your own box.</h3>
              <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>Any 3 jars · ₹{window.COMBO_PRICE} · save ₹{window.COMBO_MRP - window.COMBO_PRICE}</p>
            </div>
            <BigBtn light onClick={() => onNavigate('combo')}>Start Building →</BigBtn>
          </div>
        </div>
      </section>
    </div>
  );
}
window.ShopScreen = ShopScreen;
