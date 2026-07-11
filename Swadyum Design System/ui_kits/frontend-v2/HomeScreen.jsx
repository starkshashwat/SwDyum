function HomeScreen({ onNavigate, addToCart }) {
  const { ProductCard, StarRating } = window.DS;
  const { PRODUCTS, TRUST_ITEMS, PROCESS_STEPS, REVIEWS, COMBO_PRICE, COMBO_MRP, SUB_PRICE } = window;

  return (
    <div>
      {/* ── HERO: photo with warm overlay ── */}
      <section style={{ position: 'relative', minHeight: '82vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundImage: 'url(../../assets/imagery/hero_banner.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, var(--overlay-cream-97) 0%, var(--overlay-cream-92) 32%, var(--overlay-cream-65) 58%, var(--overlay-cream-0) 78%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 22, padding: '64px 0' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>Ara · Bhojpur · Bihar</span>
            <h1 className="headline h1">
              Bold. Sun-Dried.<br />
              <em>Unapologetically Bihari.</em>
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 1.4vw, 1.125rem)', color: 'var(--color-muted)', lineHeight: 1.75, maxWidth: 500, fontWeight: 500, margin: 0 }}>
              Fruit picked straight from the tree, cut fresh, dried in the open sun, and hand-mixed with ground spices — then sealed in moisture-proof jars for your table. No preservatives. No shortcuts.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <BigBtn onClick={() => onNavigate('shop')}>Shop Pickles</BigBtn>
              <GhostBtn onClick={() => onNavigate('combo')}>Build Your Box →</GhostBtn>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <StarRating rating={4.8} size={16} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>4.8/5 — loved by 200+ families across India</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── trust marquee ── */}
      <section style={{ background: 'var(--color-ink)', color: '#fff', padding: '14px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', padding: '0 16px' }}>
          {TRUST_ITEMS.map((t) => (
            <span key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--color-secondary)', display: 'flex' }}><Icon name={t.icon} size={16} /></span>{t.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── bestsellers ── */}
      <section className="section">
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="eyebrow">Our Flavours</span>
            <h2 className="headline h2">Meet the <em>4 Flavours</em></h2>
          </div>
          <div className="grid-4">
            {PRODUCTS.map((p) => (
              <ProductCard key={p.id} product={{ ...p, price: p.prices['250g'], oldPrice: p.mrps['250g'] }} onOpen={() => onNavigate('product-' + p.slug)} onAddToCart={() => addToCart(p, '250g')} />
            ))}
          </div>
        </div>
      </section>

      {/* ── USP #1: Build your box ── */}
      <section className="section section-dark">
        <div className="container split" style={{ padding: '0 24px' }} data-screen-label="Combo teaser">
          <div>
            <span className="eyebrow">Only at Swadyum</span>
            <h2 className="headline h2" style={{ color: '#fff' }}>Build Your Own <em>Achaar Box</em></h2>
            <p style={{ fontSize: 16, lineHeight: 1.75, opacity: 0.85, maxWidth: 460, margin: '16px 0 24px' }}>
              Pick any 3 jars, watch your box fill up, and save ₹{COMBO_MRP - COMBO_PRICE}. Mix flavours, repeat your favourite — it's your box.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <BigBtn light onClick={() => onNavigate('combo')}>Start Building — ₹{COMBO_PRICE}</BigBtn>
              <span style={{ fontSize: 14, textDecoration: 'line-through', opacity: 0.6 }}>₹{COMBO_MRP}</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, padding: 28 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {PRODUCTS.slice(0, 3).map((p) => (
                <img key={p.id} src={p.image} alt={p.name} style={{ width: '33.3%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Your box · 3 of 3 jars</span>
              <span style={{ fontSize: 13, color: 'var(--color-secondary)', fontWeight: 700 }}>You save ₹{COMBO_MRP - COMBO_PRICE}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, marginTop: 10 }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--color-secondary)', borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── process ── */}
      <section className="section" data-screen-label="Process">
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="eyebrow">From Tree To Jar</span>
            <h2 className="headline h2">Five honest steps. <em>Zero shortcuts.</em></h2>
          </div>
          <div className="grid-5">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.title} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: 110, overflow: 'hidden' }}><img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>0{i + 1}</span>
                    <Icon name={s.icon} size={16} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USP #2: subscription ── */}
      <section className="section section-cream" data-screen-label="Subscription">
        <div className="container split" style={{ padding: '0 24px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', minHeight: 280 }}>
            <img src="../../assets/imagery/deal-scatter.webp" alt="Achaar of the month" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <span className="eyebrow">Achaar of the Month</span>
            <h2 className="headline h2">A new seasonal jar, <em>every month</em></h2>
            <p style={{ fontSize: 16, color: 'var(--color-muted)', lineHeight: 1.75, maxWidth: 460, margin: '16px 0 20px' }}>
              Kathal in monsoon. Gobhi in winter. Aam when the season peaks. Subscribers get the seasonal small-batch jar before anyone else — ₹{SUB_PRICE}/month, cancel anytime.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Seasonal flavour, never in the regular shop', 'Free delivery, always', 'Pause or cancel in one tap'].map((t) => (
                <li key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Icon name="checkSimple" size={16} /></span>{t}
                </li>
              ))}
            </ul>
            <BigBtn onClick={() => onNavigate('combo')}>Subscribe — ₹{SUB_PRICE}/mo</BigBtn>
          </div>
        </div>
      </section>

      {/* ── reviews ── */}
      <section className="section" data-screen-label="Reviews">
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="eyebrow">200+ Families</span>
            <h2 className="headline h2">Tastes like <em>home</em></h2>
          </div>
          <div className="grid-3">
            {REVIEWS.map((r) => (
              <div key={r.name} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <StarRating rating={r.rating} size={14} />
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--color-ink)', margin: 0 }}>"{r.text}"</p>
                {r.image && <img src={r.image} alt="" style={{ borderRadius: 12, height: 120, objectFit: 'cover', width: '100%' }} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-muted)' }}>{r.name} · {r.city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container" style={{ padding: 0 }}>
          <h2 className="headline h2" style={{ color: '#fff' }}>Your dal is waiting for its <em>achar.</em></h2>
          <div style={{ marginTop: 28, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <BigBtn light onClick={() => onNavigate('shop')}>Shop All Pickles</BigBtn>
            <GhostBtn light onClick={() => onNavigate('about')}>Read Our Story</GhostBtn>
          </div>
        </div>
      </section>
    </div>
  );
}

function BigBtn({ children, onClick, light }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px 36px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
      background: light ? 'var(--color-secondary)' : 'var(--color-primary)',
      color: light ? 'var(--color-primary-dark)' : '#fff',
      boxShadow: '0 4px 14px rgba(10,90,50,0.2)',
    }}>{children}</button>
  );
}
function GhostBtn({ children, onClick, light }) {
  return (
    <button onClick={onClick} style={{
      padding: '15px 32px', borderRadius: 999, cursor: 'pointer',
      fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
      background: 'transparent',
      border: `2px solid ${light ? 'rgba(255,255,255,0.4)' : 'var(--color-border)'}`,
      color: light ? '#fff' : 'var(--color-ink)',
    }}>{children}</button>
  );
}
window.HomeScreen = HomeScreen;
window.BigBtn = BigBtn;
window.GhostBtn = GhostBtn;
