import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpFaq.css';

const faqs = [
  { q: 'How long does it last?', a: 'Our pickles have a shelf life of 12-18 months. Please check the label on your jar for the exact best before date.' },
  { q: 'Does it contain preservatives?', a: 'No, we do not use any chemical preservatives. We rely on traditional sun-curing, mustard oil, and salt for natural preservation.' },
  { q: 'Is it vegan?', a: 'Yes, all our pickles are 100% vegan and plant-based.' },
  { q: 'How should I store it?', a: 'Store in a cool, dry place away from direct sunlight. Always use a clean, dry spoon to prevent moisture from entering the jar.' },
  { q: 'Kya isme fungus lag sakta hai?', a: 'Nahi, jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai — bas aap sookha chammach use karein aur tel ki parat upar rehne dein.' },
  { q: 'Can I refrigerate it?', a: 'Refrigeration is not necessary but can be done if you live in an extremely hot and humid climate. Otherwise, room temperature is perfect.' },
  { q: 'What is your return policy?', a: 'Due to the nature of food products, we do not accept returns. However, if your jar arrives damaged, please contact us within 48 hours for a free replacement or refund.' },
];

function PdpFaq({ faqData }) {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => setOpenIdx(openIdx === idx ? null : idx);
  
  const displayFaqs = faqData && faqData.length > 0 ? faqData : faqs;

  return (
    <section className="pdp-faq-section">
      <div className="pdp-faq-container">
        <div className="pdp-section-header center">
          <span className="pdp-eyebrow">Still Curious?</span>
          <h2 className="pdp-heading">Frequently Asked Questions</h2>
        </div>

        <div className="faq-list">
          {displayFaqs.map((faq, idx) => (
            <motion.div
              className={`faq-item ${openIdx === idx ? 'open' : ''}`}
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
            >
              <button
                className="faq-question"
                onClick={() => toggle(idx)}
                aria-expanded={openIdx === idx}
              >
                <span>{faq.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <span className="faq-icon-line" />
                  <span className={`faq-icon-line vertical ${openIdx === idx ? 'open' : ''}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIdx === idx && (
                  <motion.div
                    className="faq-answer-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="faq-answer">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PdpFaq;
