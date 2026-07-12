import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpTabs.css';

const I = {
  shield: (<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>),
  flask: (<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 8a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3" /><path d="M7 15h10" /></svg>),
  drop: (<svg viewBox="0 0 24 24"><path d="M12 3s6 5.686 6 11a6 6 0 0 1-12 0c0-5.314 6-11 6-11z" /><path d="M5 4l14 15" /></svg>),
  recycle: (<svg viewBox="0 0 24 24"><path d="M7 19H4l2.5-4.3M17 19h3l-2-3.4M12 4 9.5 8.3M12 4l2.6 4.3M4.6 14.7 7 10.5M19.5 15.3 17 10.5" /></svg>),
  leaf: (<svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 15-9 0 8-3 15-9 15z" /><path d="M4 21c1.5-5 5-8 9-9" /></svg>),
  noChem: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></svg>),
  return: (<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 4v5h5" /></svg>),
  lock: (<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>),
};

const AssuranceBadges = [
  { icon: I.shield, title: 'FSSAI Licensed', sub: 'Food-safe' },
  { icon: I.flask, title: 'Lab-Tested', sub: 'Every batch' },
  { icon: I.drop, title: 'Moisture-Free', sub: 'Humidity-controlled' },
  { icon: I.recycle, title: 'Glass Jar', sub: 'Eco packaging' },
  { icon: I.leaf, title: 'Vegan', sub: 'Plant-based' },
  { icon: I.noChem, title: 'No Added Colour', sub: 'No synthetic flavours' },
];

function PdpTabs({ product, tabsData }) {
  const [activeTab, setActiveTab] = useState('Description');

  const tabs = [
    {
      name: 'Description',
      content: product?.full_description || product?.description || 'Authentic traditional pickle handcrafted with care.',
    },
    {
      name: 'Ingredients',
      content: tabsData?.ingredients || 'Locally sourced raw ingredients, pure cold-pressed mustard oil, turmeric, fenugreek, fennel, red chilli powder, and natural rock salt. 100% free from synthetic colors or chemical preservatives.',
    },
    {
      name: 'Nutrition',
      content: tabsData?.nutrition || 'Rich in probiotics and antioxidants due to the natural fermentation and sun-curing process. Contains healthy fats from pure mustard oil.',
    },
    {
      name: 'Storage',
      content: tabsData?.storage || 'Keep in a cool dry place.\n\nUse dry spoon only.\n\nBest consumed within 12 to 18 months of opening.',
    },
    {
      name: 'Shipping',
      content: tabsData?.shipping || 'We ship PAN-India in heavy-duty, leak-proof glass jars to ensure chemical-free transit. Deliveries typically arrive within 5-7 business days.',
    },
  ];

  const quickFacts = [
    { label: 'Shelf Life', value: tabsData?.shelf_life || '12–18 months' },
    { label: 'Best After', value: tabsData?.best_after || 'Sun-cured 21 days' },
    { label: 'Net Weight', value: product ? Object.keys(product.prices || {}).join(' / ') : '250g / 500g / 1kg' },
    { label: 'Storage', value: 'Cool, dry place' },
  ];

  return (
    <section className="pdp-tabs-section">
      <div className="pdp-tabs-container">
        {/* Assurance badges */}
        <motion.div
          className="pdp-assurance-badges"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          {AssuranceBadges.map((b) => (
            <div className="pdp-assurance-badge" key={b.title}>
              <span className="pdp-assurance-icon pdp-icon" aria-hidden="true">{b.icon}</span>
              <span className="pdp-assurance-text">
                <strong>{b.title}</strong>
                <small>{b.sub}</small>
              </span>
            </div>
          ))}
        </motion.div>

        {/* Quick facts */}
        <div className="pdp-quick-facts">
          {quickFacts.map((f) => (
            <div className="pdp-quick-fact" key={f.label}>
              <span className="pdp-quick-fact-label">{f.label}</span>
              <span className="pdp-quick-fact-value">{f.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="pdp-tab-headers">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`pdp-tab-btn ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
              {activeTab === tab.name && (
                <motion.div className="pdp-tab-indicator" layoutId="pdp-tab-indicator" />
              )}
            </button>
          ))}
        </div>

        <div className="pdp-tab-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="pdp-tab-content"
            >
              {tabs.find((t) => t.name === activeTab).content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Return / refund strip */}
        <motion.div
          className="pdp-return-strip"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="pdp-return-item">
            <span className="pdp-return-icon pdp-icon-chip" aria-hidden="true">{I.return}</span>
            <div>
              <strong>7-Day Easy Returns</strong>
              <small>Unopened jars, hassle-free refund</small>
            </div>
          </div>
          <div className="pdp-return-item">
            <span className="pdp-return-icon pdp-icon-chip" aria-hidden="true">{I.lock}</span>
            <div>
              <strong>Secure Payments</strong>
              <small>Razorpay · UPI · Cards · COD</small>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PdpTabs;
