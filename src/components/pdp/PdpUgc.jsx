import { motion } from 'framer-motion';
import './PdpUgc.css';

const InstaIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

function PdpUgc() {
  return (
    <section className="pdp-ugc-section">
      <motion.div
        className="ugc-strip"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
      >
        <span className="ugc-strip-icon pdp-icon" aria-hidden="true">{InstaIcon}</span>
        <div className="ugc-strip-text">
          <p className="ugc-strip-heading">
            Tag <strong>@swadyum</strong> with <strong>#TasteOfBihar</strong>
          </p>
          <p className="ugc-strip-sub">
            We feature our favourite plates from the community
          </p>
        </div>
        <a
          className="ugc-strip-btn"
          href="https://instagram.com/swadyum"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow @swadyum →
        </a>
      </motion.div>
    </section>
  );
}

export default PdpUgc;
