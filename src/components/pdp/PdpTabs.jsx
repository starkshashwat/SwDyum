import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpTabs.css';

const AssuranceBadges = [
  { icon: '🛡️', title: 'FSSAI Certified', sub: 'Safe & tested' },
  { icon: '♻️', title: 'Glass Jar', sub: 'Eco packaging' },
  { icon: '🌱', title: 'Vegan', sub: 'Plant-based' },
  { icon: '🚫', title: 'No Preservatives', sub: 'Natural only' },
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
              <span className="pdp-assurance-icon" aria-hidden="true">{b.icon}</span>
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
            <span className="pdp-return-icon" aria-hidden="true">↩️</span>
            <div>
              <strong>7-Day Easy Returns</strong>
              <small>Unopened jars, hassle-free refund</small>
            </div>
          </div>
          <div className="pdp-return-item">
            <span className="pdp-return-icon" aria-hidden="true">🔒</span>
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
