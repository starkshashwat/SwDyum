function Footer({ onNavigate }) {
  const [email, setEmail] = React.useState('');
  const [ok, setOk] = React.useState(false);
  return (
    <footer style={{ background: 'var(--color-primary-dark)', color: '#fff', fontFamily: 'var(--font-body)' }}>
      <div className="container" style={{ padding: '64px 24px 40px' }}>
        <div className="grid-4" style={{ gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="../../assets/logo/logo-mark.png" alt="Swadyum" style={{ height: 52, width: 52 }} />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>Swadyum</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.8, margin: 0 }}>
              Bold, authentic pickles from Ara, Bihar — picked from the tree, dried in the open sun, sealed fresh for your table.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['instagram', 'facebook'].map((s) => (
                <span key={s} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Icon name={s} size={18} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={footHead}>Shop</h4>
            <div style={footList}>
              <a style={footLink} onClick={() => onNavigate('shop')}>All Pickles</a>
              <a style={footLink} onClick={() => onNavigate('combo')}>Build Your Box</a>
              <a style={footLink} onClick={() => onNavigate('combo')}>Achaar of the Month</a>
              <a style={footLink} onClick={() => onNavigate('recipes')}>Recipes</a>
            </div>
          </div>

          <div>
            <h4 style={footHead}>Company</h4>
            <div style={footList}>
              <a style={footLink} onClick={() => onNavigate('about')}>Our Story</a>
              <a style={footLink} onClick={() => onNavigate('contact')}>Contact Us</a>
              <a style={footLink} onClick={() => onNavigate('account')}>My Orders</a>
            </div>
          </div>

          <div>
            <h4 style={footHead}>Join the Family</h4>
            <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.6, margin: '0 0 14px' }}>Heritage recipes, new batch alerts, and subscriber-only flavours.</p>
            {ok ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-secondary)' }}>
                <Icon name="check" size={16} /> Welcome to the Swadyum family!
              </div>
            ) : (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: 4 }}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 13, color: '#fff', fontFamily: 'var(--font-body)' }} />
                <button onClick={() => email && setOk(true)} style={{ background: 'var(--color-secondary)', color: 'var(--color-primary-dark)', border: 'none', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 48, paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, opacity: 0.7 }}>
          <span>© 2026 Swadyum Foods Pvt. Ltd. All Rights Reserved.</span>
          <span>Privacy Policy · Terms · Shipping · Returns</span>
        </div>
      </div>
    </footer>
  );
}

const footHead = { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, margin: '0 0 16px' };
const footList = { display: 'flex', flexDirection: 'column', gap: 10 };
const footLink = { fontSize: 14, color: 'rgba(255,255,255,0.75)' };
window.Footer = Footer;
