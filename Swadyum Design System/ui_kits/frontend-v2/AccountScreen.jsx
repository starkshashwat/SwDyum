function AccountScreen({ orders, subscription, onNavigate }) {
  return (
    <div className="section" style={{ paddingTop: 48 }} data-screen-label="Account">
      <div className="container" style={{ padding: 0 }}>
        <span className="eyebrow">My Account</span>
        <h1 className="headline h2" style={{ marginBottom: 32 }}>Namaste! 🙏</h1>

        <div className="split" style={{ alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, margin: '0 0 16px' }}>My Orders</h2>
            {orders.length === 0 ? (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 36, textAlign: 'center', color: 'var(--color-muted)' }}>
                <Icon name="box" size={36} />
                <p style={{ margin: '12px 0 18px', fontSize: 14 }}>No orders yet — your first jar is waiting.</p>
                <BigBtn onClick={() => onNavigate('shop')}>Shop Pickles</BigBtn>
              </div>
            ) : orders.map((o) => (
              <div key={o.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>#{o.id}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', background: 'rgba(10,90,50,0.08)', padding: '5px 12px', borderRadius: 999 }}>Packing in Ara · {o.date}</span>
                </div>
                {o.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--color-border-light)' }}>
                    <img src={it.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{it.name} · {it.weight} × {it.qty}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700 }}>₹{it.price * it.qty}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontSize: 14, fontWeight: 800 }}>
                  <span>Total ({o.payment.toUpperCase()})</span><span>₹{o.total}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--color-primary-dark)', color: '#fff', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="calendar" size={18} /> Achaar of the Month</h3>
              {subscription ? (
                <>
                  <p style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.6, margin: '0 0 12px' }}>Active · next jar ships on the 1st. July flavour: <strong>Kathal Ka Achar</strong>.</p>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-secondary)' }}>₹{window.SUB_PRICE}/month · cancel anytime</span>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13.5, opacity: 0.85, lineHeight: 1.6, margin: '0 0 14px' }}>You're not subscribed yet. A new seasonal jar, delivered monthly.</p>
                  <BigBtn light onClick={() => onNavigate('combo')}>Subscribe — ₹{window.SUB_PRICE}/mo</BigBtn>
                </>
              )}
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, margin: '0 0 12px' }}>Profile</h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', margin: 0, lineHeight: 1.9 }}>
                Signed in with WhatsApp<br />+91 ••••• •••22<br />Default address: not set
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.AccountScreen = AccountScreen;
