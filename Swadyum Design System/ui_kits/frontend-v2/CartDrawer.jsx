function CartDrawer({ open, onClose, cart, updateQty, onCheckout }) {
  const { Accordion } = window.DS;
  const [coupon, setCoupon] = React.useState('');
  const [applied, setApplied] = React.useState(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const threshold = 799;
  const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 50;
  const total = subtotal - discount + shipping;
  const away = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500 }} data-screen-label="Cart drawer">
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay-ink-40)', backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: 420, maxWidth: '92vw', height: '100%', background: 'var(--color-bg)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, margin: 0 }}>Your Cart ({cart.reduce((s, i) => s + i.qty, 0)})</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '14px 22px' }}>
          {away > 0 ? (
            <p style={{ fontSize: 13, margin: '0 0 8px' }}>You're <strong>₹{away}</strong> away from FREE shipping</p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 700, margin: '0 0 8px' }}>✓ You unlocked FREE shipping</p>
          )}
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 999 }}>
            <div style={{ height: '100%', width: pct + '%', background: 'var(--color-primary)', borderRadius: 999, transition: 'width 300ms var(--ease-out)' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--color-muted)' }}>
              <Icon name="cart" size={44} />
              <h3 style={{ color: 'var(--color-ink)', margin: '14px 0 4px', fontFamily: 'var(--font-heading)' }}>Your cart is empty</h3>
              <p style={{ fontSize: 13, margin: 0 }}>Let's find something delicious.</p>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--color-border-light)' }}>
              <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', background: 'var(--color-cream)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{item.name}</h4>
                <p style={{ margin: '2px 0 8px', fontSize: 12, color: 'var(--color-muted)' }}>{item.weight}{item.isCombo ? ' · Combo Box' : ''}{item.isSub ? ' · Monthly' : ''}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>₹{item.price}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--color-border)', borderRadius: 999, padding: '3px 10px' }}>
                    <button onClick={() => updateQty(i, item.qty - 1)} style={qtyBtn}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(i, item.qty + 1)} style={qtyBtn}>+</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <div style={{ padding: '10px 0' }}>
              <Accordion title="Have a coupon?">
                {applied ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-primary)', fontWeight: 700 }}><Icon name="check" size={14} /> {applied} applied — 10% off</span>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Try SWADYUM20" style={{ flex: 1, minWidth: 0, padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none' }} />
                    <button onClick={() => ['SWADYUM20', 'WELCOME10'].includes(coupon.toUpperCase()) && setApplied(coupon.toUpperCase())} style={{ padding: '9px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                  </div>
                )}
              </Accordion>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 22, borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <Row label="Subtotal" value={'₹' + subtotal} />
            {discount > 0 && <Row label="Discount" value={'-₹' + discount} green />}
            {shipping > 0 && <Row label="Shipping" value={'₹' + shipping} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, margin: '10px 0 16px' }}><span>Total</span><span>₹{total}</span></div>
            <button onClick={() => onCheckout(total)} style={{ width: '100%', padding: '16px 0', borderRadius: 999, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Proceed to Checkout · ₹{total}
            </button>
            <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--color-muted)', margin: '10px 0 0' }}>🔒 Secure checkout · COD available · 7-day returns</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, green }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: green ? 'var(--color-primary)' : 'var(--color-muted)', marginBottom: 4, fontWeight: green ? 700 : 400 }}><span>{label}</span><span>{value}</span></div>;
}
const qtyBtn = { border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: 'var(--color-ink)', padding: 0, width: 16 };
window.CartDrawer = CartDrawer;
