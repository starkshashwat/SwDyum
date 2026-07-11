function PdpScreen({ product, onNavigate, addToCart }) {
  const { StarRating, QuantitySelector, Accordion } = window.DS;
  const { RECIPES, REVIEWS, PRODUCTS } = window;
  const [size, setSize] = React.useState(Object.keys(product.prices)[0]);
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);
  const [pin, setPin] = React.useState('');
  const [pinMsg, setPinMsg] = React.useState(null);
  const [added, setAdded] = React.useState(false);
  const [showSticky, setShowSticky] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const price = product.prices[size];
  const mrp = product.mrps[size];
  const off = Math.round(((mrp - price) / mrp) * 100);
  const pairRecipes = RECIPES.filter((r) => product.pairs.includes(r.slug));

  const checkPin = () => {
    if (pin.length === 6) {
      const d1 = new Date(); d1.setDate(d1.getDate() + 4);
      const d2 = new Date(); d2.setDate(d2.getDate() + 7);
      const f = (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      setPinMsg({ ok: true, text: `Get it by ${f(d1)} – ${f(d2)} · COD available` });
    } else setPinMsg({ ok: false, text: 'Please enter a valid 6-digit PIN code.' });
  };

  const handleAdd = () => {
    addToCart(product, size, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div data-screen-label={'PDP ' + product.name} style={{ paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <nav style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-muted)', marginBottom: 20, flexWrap: 'wrap' }}>
          <a onClick={() => onNavigate('home')}>Home</a><span>/</span>
          <a onClick={() => onNavigate('shop')}>Shop</a><span>/</span>
          <span style={{ color: 'var(--color-ink)' }}>{product.name}</span>
        </nav>

        <div className="split" style={{ alignItems: 'start' }}>
          {/* gallery */}
          <div>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: 'var(--color-cream)', aspectRatio: '1', position: 'relative' }}>
              <img src={product.gallery[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {off > 0 && (
                <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--color-accent)', color: '#fff', fontWeight: 800, fontSize: 13, padding: '8px 14px', borderRadius: 999 }}>{off}% OFF</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {product.gallery.map((g, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', padding: 0, cursor: 'pointer', border: `2px solid ${imgIdx === i ? 'var(--color-primary)' : 'var(--color-border)'}` }}>
                  <img src={g} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <span className="eyebrow" style={{ marginBottom: 6 }}>Traditional Pickles</span>
              <h1 className="headline" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}>{product.name}</h1>
              <p style={{ fontSize: 15, color: 'var(--color-muted)', fontWeight: 600, margin: '4px 0 0' }}>{product.en}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <StarRating rating={product.rating} count={product.reviewsCount} size={16} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}><Icon name="checkSimple" size={14} /> Verified small batch</span>
            </div>

            <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.75, margin: 0 }}>{product.tagline} Hand-mixed with stone-ground spices, finished in mustard oil, and sealed in moisture-proof jars.</p>

            {/* spice level */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Spice level:</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3].map((n) => (
                  <span key={n} style={{ color: n <= product.spice ? 'var(--color-accent)' : 'var(--color-border)', display: 'flex' }}><Icon name="chili" size={18} /></span>
                ))}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}>{['Mild', 'Medium', 'Hot'][product.spice - 1]}</span>
            </div>

            {/* price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 34 }}>₹{price}</span>
              <span style={{ fontSize: 16, color: 'var(--color-muted-light)', textDecoration: 'line-through' }}>₹{mrp}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Save ₹{mrp - price}</span>
              <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>/ {size}</span>
            </div>

            {/* size selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Choose Size</span>
                {Object.keys(product.prices).length > 1 && <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Best value: {Object.keys(product.prices).slice(-1)[0]}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.keys(product.prices).map((s) => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    padding: '10px 18px', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 84,
                    border: `2px solid ${size === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: size === s ? 'rgba(10,90,50,0.06)' : 'var(--color-surface)',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{s}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--color-muted)' }}>₹{product.prices[s]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* qty + add */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <QuantitySelector value={qty} onChange={setQty} />
              <button onClick={handleAdd} style={{ flex: 1, minWidth: 180, padding: '16px 24px', borderRadius: 999, border: 'none', cursor: 'pointer', background: added ? 'var(--color-primary-dark)' : 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {added ? '✓ Added to Cart' : `Add to Cart · ₹${price * qty}`}
              </button>
            </div>

            {/* pin checker */}
            <div style={{ background: 'var(--color-cream)', borderRadius: 16, padding: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}><Icon name="pin" size={15} /> Check Delivery</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN code" style={{ flex: 1, minWidth: 0, padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }} />
                <button onClick={checkPin} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--color-ink)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Check</button>
              </div>
              {pinMsg && <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 600, color: pinMsg.ok ? 'var(--color-primary)' : 'var(--color-destructive)' }}>{pinMsg.ok ? '🚚 ' : ''}{pinMsg.text}</p>}
            </div>

            {/* trust row */}
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', paddingTop: 4 }}>
              {[['shield', 'Secure checkout'], ['truck', 'Free shipping ₹799+'], ['refresh', '7-day returns'], ['leaf', 'No preservatives']].map(([ic, t]) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-muted)' }}>
                  <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Icon name={ic} size={15} /></span>{t}
                </span>
              ))}
            </div>

            {/* accordions */}
            <div style={{ borderBottom: '1px solid var(--color-border-light)' }}>
              <Accordion title="Ingredients" defaultOpen>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.ingredients.map((ing) => (
                    <span key={ing} style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--color-cream)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>{ing}</span>
                  ))}
                </div>
              </Accordion>
              <Accordion title="Nutrition (per 100g)">
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {product.nutrition.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        <td style={{ padding: '7px 0', color: 'var(--color-muted)' }}>{k}</td>
                        <td style={{ padding: '7px 0', textAlign: 'right', fontWeight: 700 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
              <Accordion title="How it's made">
                Picked straight from the tree → washed & cut fresh → dried in the open sun → hand-mixed with ground spices and rested for days → finished with mustard oil & whole spices → sealed in a moisture-proof jar and delivered to you.
              </Accordion>
            </div>
          </div>
        </div>

        {/* combo upsell */}
        <div style={{ marginTop: 56, background: 'var(--color-primary-dark)', color: '#fff', borderRadius: 24, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--color-secondary)', display: 'flex' }}><Icon name="box" size={30} /></span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, margin: '0 0 2px' }}>Add {product.name} to a 3-jar box & save ₹{window.COMBO_MRP - window.COMBO_PRICE}</h3>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Pick any 3 flavours · ₹{window.COMBO_PRICE} total</p>
            </div>
          </div>
          <BigBtn light onClick={() => onNavigate('combo')}>Build My Box →</BigBtn>
        </div>

        {/* pairs well with */}
        <section style={{ marginTop: 64 }}>
          <span className="eyebrow">Pairs Well With</span>
          <h2 className="headline h3" style={{ marginBottom: 24 }}>Put it on the table tonight</h2>
          <div className="grid-2">
            {pairRecipes.map((r) => (
              <div key={r.slug} onClick={() => onNavigate('recipes')} style={{ display: 'flex', gap: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer' }}>
                <img src={r.image} alt={r.title} style={{ width: 130, objectFit: 'cover' }} />
                <div style={{ padding: '16px 16px 16px 0' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, margin: '0 0 4px' }}>{r.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 6px', lineHeight: 1.5 }}>{r.desc}</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{r.time} · View recipe →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* reviews */}
        <section style={{ marginTop: 64 }}>
          <span className="eyebrow">Customer Reviews</span>
          <h2 className="headline h3" style={{ marginBottom: 24 }}>{product.rating} ★ from {product.reviewsCount} reviews</h2>
          <div className="grid-3">
            {REVIEWS.map((r) => (
              <div key={r.name} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 18, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <window.DS.StarRating rating={r.rating} size={13} />
                <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0 }}>"{r.text}"</p>
                {r.image && <img src={r.image} alt="" style={{ borderRadius: 10, height: 100, objectFit: 'cover', width: '100%' }} />}
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--color-muted)' }}>{r.name} · {r.city}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* sticky add-to-cart bar */}
      {showSticky && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', boxShadow: '0 -8px 24px rgba(36,26,20,0.08)', padding: '12px 16px' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <img src={product.image} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} className="desktop-only" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name} · {size}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>₹{price} <s style={{ color: 'var(--color-muted-light)' }}>₹{mrp}</s></div>
              </div>
            </div>
            <button onClick={handleAdd} style={{ padding: '13px 28px', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
              {added ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
window.PdpScreen = PdpScreen;
