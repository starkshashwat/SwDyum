function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', msg: '' });
  const f = { padding: '13px 16px', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: 'var(--color-bg)', width: '100%' };

  return (
    <div className="section" style={{ paddingTop: 48 }} data-screen-label="Contact">
      <div className="container split" style={{ padding: '0 24px', alignItems: 'start' }}>
        <div>
          <span className="eyebrow">Contact Us</span>
          <h1 className="headline h2">Baat karein? <em>We're listening.</em></h1>
          <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.75, margin: '16px 0 28px', maxWidth: 440 }}>
            Questions about an order, bulk gifting, or which pickle suits your spice tolerance — message us and a real person from Ara replies.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['phone', '+91 8340528122', 'Mon–Sat, 10am–7pm'], ['mail', 'swadyum@gmail.com', 'Replies within a day'], ['pin', 'Ara, Bhojpur, Bihar', 'Where every jar is made']].map(([ic, t, s]) => (
              <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-cream)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={19} /></span>
                <span><strong style={{ fontSize: 14.5 }}>{t}</strong><br /><small style={{ color: 'var(--color-muted)', fontSize: 12.5 }}>{s}</small></span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span style={{ color: 'var(--color-primary)' }}><Icon name="check" size={40} /></span>
              <h3 style={{ fontFamily: 'var(--font-heading)', margin: '14px 0 6px' }}>Message sent!</h3>
              <p style={{ fontSize: 13.5, color: 'var(--color-muted)', margin: 0 }}>We'll get back to you within a day.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input style={f} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input style={f} placeholder="Email or phone" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea style={{ ...f, minHeight: 120, resize: 'vertical' }} placeholder="Tell us what's on your mind…" value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })}></textarea>
              <button onClick={() => form.name && form.msg && setSent(true)} style={{ padding: '15px 0', borderRadius: 999, border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Send Message</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.ContactScreen = ContactScreen;
