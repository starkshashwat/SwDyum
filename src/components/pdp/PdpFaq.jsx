import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpFaq.css';

const faqs = [
  { q: 'How long does it last?', a: 'Our pickles have a shelf life of 12-18 months. Please check the label on your jar for the exact best before date.' },
  { q: 'Does it contain preservatives?', a: 'No, we do not use any chemical preservatives. We rely on traditional sun-curing, mustard oil, and salt for natural preservation.' },
  { q: 'Is it vegan?', a: 'Yes, all our pickles are 100% vegan and plant-based.' },
  { q: 'How should I store it?', a: 'Store in a cool, dry place away from direct sunlight. Always use a clean, dry spoon to prevent moisture from entering the jar.' },
  { q: 'Can I refrigerate it?', a: 'Refrigeration is not necessary but can be done if you live in an extremely hot and humid climate. Otherwise, room temperature is perfect.' },
];

function PdpFaq() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    if (openIdx === idx) setOpenIdx(null);
    else setOpenIdx(idx);
  };

  return (
    <section className="pdp-faq-section">
      <div className="pdp-faq-container">
        <div className="pdp-section-header center">
          <h2 className="pdp-heading">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div className="faq-item" key={idx}>
              <button className="faq-question" onClick={() => toggle(idx)}>
                {faq.q}
                <span className="faq-icon">{openIdx === idx ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div 
                    className="faq-answer-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PdpFaq;
