function RecipesScreen({ onNavigate }) {
  const { RECIPES } = window;
  return (
    <div data-screen-label="Recipes">
      <section style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '56px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <span className="eyebrow" style={{ color: 'var(--color-secondary)' }}>From Our Kitchen</span>
          <h1 className="headline h2" style={{ color: '#fff' }}>Recipes that <em>demand achar</em></h1>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2" style={{ padding: '0 24px' }}>
          {RECIPES.map((r) => (
            <div key={r.slug} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 220, overflow: 'hidden' }}><img src={r.image} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: 1, textTransform: 'uppercase' }}>{r.time}</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, margin: 0 }}>{r.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.65, margin: 0, flex: 1 }}>{r.desc}</p>
                <a onClick={() => onNavigate('shop')} style={{ fontSize: 13.5, fontWeight: 700, marginTop: 6 }}>Shop the pickle →</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
window.RecipesScreen = RecipesScreen;
