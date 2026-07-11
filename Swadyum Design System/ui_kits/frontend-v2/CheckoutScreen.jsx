function CheckoutScreen({ cart, onPlaceOrder, onNavigate }) {
  const [form, setForm] = React.useState({ name: '', phone: '', address: '', city: '', pin: '' });
  const [payment, setPayment] = React.useState('upi');
  const [placed, setPlaced] = React.useState(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 799 ? 0 : 50;
  const total = subtotal + shipping;
  const valid = form.name && form.phone.length >= 10 && form.address && form.pin.length === 6;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const place = () => {
    if (!valid) return;
    const id = 'SWD' + Math.floor(1000 + Math.random() * 9000);
    onPlaceOrder({ id, items: cart, total, payment, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
    setPlaced(id);
    window.scrollTo({ top: 0 });
  };

  if (placed) {
    return (
      <div className="section" style={{ textAlign: 'center' }} data-screen-label="Order placed">
        <div style={{ maxWidth: 480, margin: '40px auto' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon name="checkSimple" size={38} />
          </div>
          <h1 className="headline h2">Order placed!</h1>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.7, margin: '14px 0 6px' }}>
            Order <strong style={{ color: 'var(--color-ink)' }}>#{placed}</strong> is being packed in Ara. Your jars will reach you in 4–7 days.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 28px' }}>We'll send updates on WhatsApp.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <BigBtn onClick={() => onNavigate('account')}>Track in My Orders</BigBtn>
            <GhostBtn onClick={() => onNavigate('shop')}>Keep Shopping</GhostBtn>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <h1 className="headline h2">Nothing to check out</h1>
        <p style={{ color: 'var(--color-muted)', margin: '12px 0 24px' }}>Your cart is empty — go grab a jar first.</p>
        <BigBtn onClick={() => onNavigate('shop')}>Shop Pickles</BigBtn>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: 48 }} data-screen-label="Checkout">
      <div className="container" style={{ padding: 0 }}>
        <h1 className="headline h2" style={{ marginBottom: 32 }}>Checkout</h1>
        <div className="split" style={{ alignItems: 'start' }}>
          {/* address + payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={card}>
              <h2 style={cardHead}><Icon name="pin" size={18} /> Delivery Address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input style={field} placeholder="Full name" value={form.name} onChange={set('name')} />
                <input style={field} placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                <input style={field} placeholder="Address (house, street, landmark)" value={form.address} onChange={set('address')} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <input style={{ ...field, flex: 1.4 }} placeholder="City" value={form.city} onChange={set('city')} />
                  <input style={{ ...field, flex: 1 }} placeholder="PIN code" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
                </div>
              </div>
            </div>

            <div style={card}>
              <h2 style={cardHead}><Icon name="shield" size={18} /> Payment</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['upi', 'UPI', 'GPay, PhonePe, Paytm'], ['card', 'Card', 'Credit / debit card'], ['cod', 'Cash on Delivery', 'Pay when your jars arrive']].map(([k, label, sub]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${payment === k ? 'var(--color-primary)' : 'var(--color-border)'}`, background: payment === k ? 'rgba(10,90,50,0.04)' : 'var(--color-surface)' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payment === k ? 'var(--color-primary)' : 'var(--color-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {payment === k && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                    </span>
                    <input type="radio" checked={payment === k} onChange={() => setPayment(k)} style={{ display: 'none' }} />
                    <span><strong style={{ fontSize: 14 }}>{label}</strong><br /><small style={{ color: 'var(--color-muted)', fontSize: 12 }}>{sub}</small></span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* order summary */}
          <div style={{ ...card, position: 'sticky', top: 100 }}>
            <h2 style={cardHead}><Icon name="cart" size={18} /> Order Summary</h2>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <img src={item.image} alt="" style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{item.weight} × {item.qty}</div>
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>₹{item.price * item.qty}</span>
              </div>
            ))}
            <div style={{ paddingTop: 14 }}>
              <SummaryRow label="Subtotal" value={'₹' + subtotal} />
              <SummaryRow label="Shipping" value={shipping === 0 ? 'FREE' : '₹' + shipping} green={shipping === 0} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, margin: '12px 0 18px' }}><span>Total</span><span>₹{total}</span></div>
              <button onClick={place} disabled={!valid} style={{ width: '100%', padding: '16px 0', borderRadius: 999, border: 'none', cursor: valid ? 'pointer' : 'not-allowed', background: valid ? 'var(--color-primary)' : 'var(--color-border)', color: valid ? '#fff' : 'var(--color-muted)', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {valid ? `Place Order · ₹${total}` : 'Fill address to continue'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--color-muted)', margin: '10px 0 0' }}>🔒 This is a design mock — no payment is processed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, green }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: green ? 'var(--color-primary)' : 'var(--color-muted)', marginBottom: 5, fontWeight: green ? 700 : 500 }}><span>{label}</span><span>{value}</span></div>;
}
const card = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24 };
const cardHead = { fontFamily: 'var(--font-heading)', fontSize: 17, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink)' };
const field = { padding: '13px 16px', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--color-bg)', width: '100%', minWidth: 0 };
window.CheckoutScreen = CheckoutScreen;
