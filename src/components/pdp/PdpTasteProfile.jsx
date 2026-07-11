import { motion } from 'framer-motion';
import './PdpTasteProfile.css';

/* Refined line icons for pairings (replace emoji) */
const PlateIcon = (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg>
);
const BowlIcon = (
  <svg viewBox="0 0 24 24"><path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M12 11V7M9.5 7.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5" /></svg>
);
const FlameIcon = (
  <svg viewBox="0 0 24 24"><path d="M12 2c2 3 5 5 5 9a5 5 0 0 1-10 0c0-1.5.6-2.7 1.4-3.7C9 8.6 10.5 8 10.5 6c1 .8 1.5 2 1.5 3 .8-1 0-4 0-7z" /></svg>
);
const PotIcon = (
  <svg viewBox="0 0 24 24"><path d="M5 10h14v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-4z" /><path d="M4 10h16M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
const BreadIcon = (
  <svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="7" /><path d="M8 10c1 1.5 3 1.5 4 0M14 13c-1 1.2-2.6 1.2-3.6 0" /></svg>
);

const iconFor = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('litti') || n.includes('chokha') || n.includes('roast')) return FlameIcon;
  if (n.includes('khichdi') || n.includes('curry') || n.includes('sabzi')) return PotIcon;
  if (n.includes('paratha') || n.includes('poori') || n.includes('roti') || n.includes('naan')) return BreadIcon;
  if (n.includes('dal') || n.includes('chawal') || n.includes('rice')) return BowlIcon;
  return PlateIcon;
};

const defaultFlavorMetrics = [
  { label: 'Spicy', level: 80 },
  { label: 'Tangy', level: 95 },
  { label: 'Oil Level', level: 60 },
  { label: 'Crunch', level: 70 },
];

const defaultPairings = [
  { name: 'Paratha' },
  { name: 'Dal Chawal' },
  { name: 'Litti Chokha' },
  { name: 'Khichdi' },
  { name: 'Poori' },
];

function PdpTasteProfile({ tasteProfile }) {
  const displayMetrics = tasteProfile?.metrics && tasteProfile.metrics.length > 0 ? tasteProfile.metrics : defaultFlavorMetrics;
  const displayPairings = tasteProfile?.pairings && tasteProfile.pairings.length > 0 ? tasteProfile.pairings : defaultPairings;

  return (
    <section className="pdp-taste-section">
      <div className="pdp-section-container pdp-taste-container">
        {/* Flavor Meter */}
        <motion.div
          className="flavor-meter-side"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="pdp-eyebrow">Taste Profile</span>
          <h2 className="pdp-heading">Bold &amp; Balanced</h2>
          <p className="pdp-taste-sub">A symphony of tang, heat, and crunch — crafted to make every bite memorable.</p>
          <div className="flavor-bars">
            {displayMetrics.map((metric, idx) => (
              <div className="flavor-bar-wrap" key={idx}>
                <div className="flavor-label">{metric.label}</div>
                <div className="flavor-track">
                  <motion.div
                    className="flavor-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${metric.level}%` }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 1, delay: idx * 0.15, ease: 'easeOut' }}
                  />
                </div>
                <div className="flavor-pct">{metric.level}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pairing Suggestions */}
        <motion.div
          className="pairing-side"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="pdp-eyebrow">Pairing Suggestions</span>
          <h2 className="pdp-heading">Perfect With</h2>
          <p className="pdp-taste-sub">Serve alongside these Bihari favourites for the full experience.</p>
          <div className="pairing-grid">
            {displayPairings.map((pair, idx) => (
              <motion.div
                className="pairing-item"
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <span className="pairing-icon pdp-icon" aria-hidden="true">{iconFor(pair.name)}</span>
                <div className="pairing-name">{pair.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PdpTasteProfile;
