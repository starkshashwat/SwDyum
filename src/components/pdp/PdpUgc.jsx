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
        className="ugc-invite"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <span className="ugc-invite-icon pdp-icon" aria-hidden="true">{InstaIcon}</span>
        <span className="pdp-eyebrow">Community</span>
        <h2 className="pdp-heading">Share Your Swadyum Moment</h2>
        <p className="pdp-subtext">
          Loving your jar? Tag <strong>@swadyum</strong> and use <strong>#TasteOfBihar</strong> —
          we feature our favourite plates from the community right here.
        </p>
        <a
          className="ugc-invite-btn"
          href="https://instagram.com/swadyum"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="pdp-icon" aria-hidden="true">{InstaIcon}</span>
          Follow @swadyum
        </a>
        <div className="ugc-tags">
          <span>#TasteOfBihar</span>
          <span>#Swadyum</span>
          <span>#HandmadePickle</span>
          <span>#GharKaAchaar</span>
        </div>
      </motion.div>
    </section>
  );
}

export default PdpUgc;
