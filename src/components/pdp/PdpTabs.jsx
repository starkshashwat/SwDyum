import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpTabs.css';

function PdpTabs({ product, tabsData }) {
  const [activeTab, setActiveTab] = useState('Description');

  const tabs = [
    { 
      name: 'Description', 
      content: product?.full_description || product?.description || 'Authentic traditional pickle handcrafted with care.' 
    },
    { 
      name: 'Ingredients', 
      content: 'Locally sourced raw ingredients, pure cold-pressed mustard oil, turmeric, fenugreek, fennel, red chilli powder, and natural rock salt. 100% free from synthetic colors or chemical preservatives.'
    },
    { 
      name: 'Nutrition', 
      content: tabsData?.nutrition || 'Rich in probiotics and antioxidants due to the natural fermentation and sun-curing process. Contains healthy fats from pure mustard oil.'
    },
    { 
      name: 'Storage', 
      content: tabsData?.storage || 'Keep in a cool dry place.\n\nUse dry spoon only.\n\nBest consumed within 12 to 18 months of opening.'
    },
    { 
      name: 'Shipping', 
      content: tabsData?.shipping || 'We ship PAN-India in heavy-duty, leak-proof glass jars to ensure chemical-free transit. Deliveries typically arrive within 5-7 business days.'
    },
  ];

  return (
    <section className="pdp-tabs-section">
      <div className="pdp-tabs-container">
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
              {tabs.find(t => t.name === activeTab).content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default PdpTabs;
