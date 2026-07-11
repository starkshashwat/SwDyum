function ComboBuilder({ onNavigate, addComboToCart, subscribe }) {
  const { PRODUCTS, COMBO_PRICE, COMBO_MRP, SUB_PRICE } = window;
  const [slots, setSlots] = React.useState([]); // array of product ids (max 3, repeats allowed)
  const [subscribed, setSubscribed] = React.useState(false);
  const full = slots.length === 3;

  const addSlot = (p) => { if (!full) setSlots([...slots, p.id]); };
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));
  const slotProducts = slots.map((id) => PRODUCTS.find((p) => p.id === id));

  return (
    <div data-screen-label="Combo Builder">
      <section style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '56px 24px', textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'var(--color-secondary)' }}>Only at Swadyum</span>
        <h1 className="headline h2" style={{ color: '#fff' }}>Build Your Own <em>Achaar Box</em></h1>
        <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 520, margin: '14px auto 0', lineHeight: 1.7 }}>
          Pick any 3 × 250g jars — mix flavours or repeat your favourite. Flat ₹{COMBO_PRICE} (worth ₹{COMBO_MRP}).
        </p>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container split" style={{ padding: '0 24px', alignItems: 'start' }}>
          {/* pick flavours */}
          <div>
            <h2 className="headline h3" style={{ marginBottom: 20 }}>1 · Pick your flavours</h2>
            <div className="grid-2">
              {PRODUCTS.map((p) => {
                const count = slots.filter((id) => id === p.id).length;
                return (
                  <div key={p.id} style={{ background: 'var(--color-surface)', border: `2px solid ${count ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                    {count > 0 && <span style={{ position: 'absolute', top: 12, right: 12, background: 'var(--color-primary)', color: '#fff', fontWeight: 800, fontSize: 13, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>{count}</span>}
                    <img src={p.image} alt={p.name} style={{ height: 130, width: '100%', objectFit: 'cover' }} />
                    <div style={{ padding: 14 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, margin: '0 0 2px' }}>{p.name}</h3>
                      <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '0 0 10px' }}>{p.en} · 250g</p>
                      <button onClick={() => addSlot(p)} disabled={full} style={{
                        width: '100%', padding: '10px 0', borderRadius: 999, border: 'none', cursor: full ? 'not-allowed' : 'pointer',
                        background: full ? 'var(--color-border)' : 'var(--color-primary)', color: full ? 'var(--color-muted)' : '#fff',
                        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}><Icon name="plus" size={14} /> Add to box</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* the box */}
          <div style={{ position: 'sticky', top: 100 }}>
            <h2 className="headline h3" style={{ marginBottom: 20 }}>2 · Watch it fill up</h2>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 16, overflow: 'hidden', position: 'relative', border: slotProducts[i] ? 'none' : '2px dashed var(--color-border)', background: slotProducts[i] ? 'none' : 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {slotProducts[i] ? (
                      <>
                        <img src={slotProducts[i].image} alt={slotProducts[i].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => removeSlot(i)} aria-label="Remove" style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(17,32,24,0.75)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="close" size={12} />
                        </button>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-muted-light)' }}><Icon name="jar" size={26} /></span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                <span>{slots.length} of 3 jars</span>
                <span style={{ color: 'var(--color-primary)' }}>{full ? `You save ₹${COMBO_MRP - COMBO_PRICE}` : 'Add ' + (3 - slots.length) + ' more'}</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, marginBottom: 18 }}>
                <div style={{ width: (slots.length / 3) * 100 + '%', height: '100%', background: 'var(--color-primary)', borderRadius: 999, transition: 'width 300ms var(--ease-out)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>Box total</span>
                <span><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26 }}>₹{COMBO_PRICE}</span> <s style={{ fontSize: 14, color: 'var(--color-muted-light)' }}>₹{COMBO_MRP}</s></span>
              </div>

              <button onClick={() => full && addComboToCart(slotProducts)} disabled={!full} style={{
                width: '100%', padding: '16px 0', borderRadius: 999, border: 'none', cursor: full ? 'pointer' : 'not-allowed',
                background: full ? 'var(--color-primary)' : 'var(--color-border)', color: full ? '#fff' : 'var(--color-muted)',
                fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
              }}>{full ? `Add Box to Cart · ₹${COMBO_PRICE}` : 'Pick 3 jars to continue'}</button>
            </div>

            {/* subscription card */}
            <div style={{ marginTop: 20, background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Icon name="calendar" size={20} /></span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, margin: 0 }}>Achaar of the Month</h3>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', lineHeight: 1.65, margin: '0 0 14px' }}>
                A seasonal small-batch jar delivered monthly — kathal in monsoon, gobhi in winter, aam at peak season. Free delivery. Cancel anytime.
              </p>
              {subscribed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', fontWeight: 700, fontSize: 14 }}>
                  <Icon name="check" size={16} /> Subscribed! First jar ships on the 1st.
                </div>
              ) : (
                <button onClick={() => { setSubscribed(true); subscribe && subscribe(); }} style={{ width: '100%', padding: '14px 0', borderRadius: 999, border: '2px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Subscribe — ₹{SUB_PRICE}/month
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
window.ComboBuilder = ComboBuilder;
