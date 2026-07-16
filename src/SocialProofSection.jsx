import React from 'react';
import { motion } from 'framer-motion';
import './SocialProofSection.css';

const TRUST_PROOFS = [
  {
    title: 'Real reviews only',
    text: 'Ratings appear only after approved customer reviews, so first-time buyers are not shown inflated placeholders.',
  },
  {
    title: 'FSSAI registered',
    text: 'Clear food-safety reassurance for first-time buyers.',
  },
  {
    title: 'Freshly packed batches',
    text: 'Small-batch packing keeps the promise tied to the actual product.',
  },
  {
    title: 'Secure checkout',
    text: 'Payment trust stays visible before the buying decision.',
  },
];

function SocialProofSection() {
  return (
    <section className="social-proof-section section-padding" id="reviews">
      <div className="section-container">
        <div className="sp-trust-badges">
          <div className="sp-trust-badge">
            <img src="/fssai.png" alt="FSSAI" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />
            <span>FSSAI Registered</span>
          </div>

          <div className="sp-trust-badge">
            <span style={{ fontSize: '1.2em' }}>🌿</span>
            <span>No Artificial Preservatives</span>
          </div>

          <div className="sp-trust-badge">
            <span style={{ fontSize: '1.2em' }}>🔒</span>
            <span>Secure Payments</span>
          </div>

          <div className="sp-trust-badge">
            <span style={{ fontSize: '1.2em' }}>📦</span>
            <span>Freshly Packed</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SocialProofSection;
