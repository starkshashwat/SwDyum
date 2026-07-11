function AboutScreen({ onNavigate }) {
  const { PROCESS_STEPS } = window;
  return (
    <div data-screen-label="About">
      {/* hero */}
      <section style={{ position: 'relative', minHeight: 380, display: 'flex', alignItems: 'center', backgroundImage: 'url(../../assets/imagery/about-us.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,32,24,0.55), rgba(17,32,24,0.75))' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, color: '#fff', textAlign: 'center', padding: '72px 24px' }}>
          <span className="eyebrow" style={{ color: 'var(--color-secondary)' }}>Our Story</span>
          <h1 className="headline h1" style={{ color: '#fff' }}>The Taste of <em style={{ color: 'var(--color-secondary)' }}>Ara, Bhojpur</em></h1>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.7 }}>
            Bold, authentic, and uncompromising traditional food from the heart of Bihar.
          </p>
        </div>
      </section>

      {/* story */}
      <section className="section">
        <div className="container split" style={{ padding: '0 24px' }}>
          <div>
            <span className="eyebrow">Our Roots</span>
            <h2 className="headline h2">Pure heritage.<br /><em>No shortcuts.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 15.5, lineHeight: 1.8, color: 'var(--color-muted)' }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--color-ink)' }}>
              Swadyum was born in Ara, Bhojpur with a single mission: to deliver the absolute best of traditional Bihari cuisine to the world.
            </p>
            <p style={{ margin: 0 }}>
              We don't do mass production. We don't use chemical vinegars or artificial preservatives. We buy fruit straight from the tree, wash and cut it fresh, dry it in the open sun, hand-mix it with stone-ground spices — and let it rest for days before finishing it with mustard oil and whole spices.
            </p>
            <p style={{ margin: 0 }}>
              Every jar is then sealed in a moisture-proof container and shipped to your door. This isn't just food; it's a promise that what reaches your table tastes exactly like a Bihari home.
            </p>
            <div style={{ marginTop: 8 }}>
              <strong style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-heading)' }}>Swadyum Foods</strong><br />
              <span style={{ fontSize: 13.5 }}>Ara, Bhojpur, Bihar</span>
            </div>
          </div>
        </div>
      </section>

      {/* process detail */}
      <section className="section section-cream">
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="eyebrow">From Tree To Jar</span>
            <h2 className="headline h2">How every jar <em>is made</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, margin: '0 auto' }}>
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 16, flexWrap: 'wrap' }}>
                <img src={s.image} alt={s.title} style={{ width: 120, height: 90, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary)', fontSize: 15 }}>0{i + 1}</span>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, margin: 0 }}>{s.title}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
                <span style={{ color: 'var(--color-primary)', display: 'flex', paddingRight: 8 }} className="desktop-only"><Icon name={s.icon} size={26} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <h2 className="headline h2" style={{ color: '#fff' }}>Taste the best of <em>Bhojpur</em></h2>
        <div style={{ marginTop: 26 }}>
          <BigBtn light onClick={() => onNavigate('shop')}>Shop Now</BigBtn>
        </div>
      </section>
    </div>
  );
}
window.AboutScreen = AboutScreen;
