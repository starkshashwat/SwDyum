import { motion } from 'framer-motion';
import './PdpProcessTimeline.css';

const steps = [
  {
    img: '/process_sourcing_1783263006944.webp',
    title: 'Harvest',
    desc: 'Hand-picked raw Langda mangoes sourced direct from Purvanchal farms',
  },
  {
    img: '/making_mango.webp',
    title: 'Cut by Hand',
    desc: 'Washed, sliced, and prepped — no machines, just skilled hands',
  },
  {
    img: '/process_grinding_1783263018468.webp',
    title: 'Traditional Blend',
    desc: 'Aromatic spice masala ground and mixed in small batches',
  },
  {
    img: '/process_mixing_1783263028798.webp',
    title: 'Oil-Dressed',
    desc: 'Coated in cold-pressed Kachi Ghani mustard oil for bold flavour',
  },
  {
    img: '/process_suncured_1783263051169.webp',
    title: 'Sun Cured',
    desc: "Slow-matured under open sun — the way it's been done for generations",
  },
  {
    img: '/process_aging_1783263039730.webp',
    title: 'Sealed & Shipped',
    desc: 'Packed moisture-free in glass jars, delivered straight to your door',
  },
];

function PdpProcessTimeline() {
  return (
    <section className="pdp-process-section">
      <div className="pdp-section-header center">
        <span className="pdp-eyebrow">The Making Process</span>
        <h2 className="pdp-heading">Crafted With Patience</h2>
        <p className="pdp-subtext">Six unhurried steps, the way it has been made in Bihar for generations.</p>
      </div>

      <div className="process-grid">
        {steps.map((step, idx) => (
          <motion.article
            className="process-card"
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: idx * 0.08 }}
          >
            <div className="process-card-img">
              <img src={step.img} alt={step.title} loading="lazy" />
              <span className="process-step-badge">{idx + 1}</span>
            </div>
            <div className="process-card-body">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default PdpProcessTimeline;
