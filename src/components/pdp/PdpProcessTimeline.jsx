import { motion } from 'framer-motion';
import './PdpProcessTimeline.css';

const Icon = {
  harvest: (<svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 15-9 0 8-3 15-9 15z" /><path d="M4 21c1.5-5 5-8 9-9" /></svg>),
  cut: (<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.1 8.1 20 20M8.1 15.9 20 4" /></svg>),
  blend: (<svg viewBox="0 0 24 24"><path d="M5 11h14a7 7 0 0 1-14 0z" /><path d="M12 11V4M9 6.5 12 4l3 2.5" /></svg>),
  sun: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>),
  pack: (<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>),
  deliver: (<svg viewBox="0 0 24 24"><path d="M14 17V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v13" /><path d="M14 8h4l3 3v6h-7" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>),
};

const steps = [
  { icon: Icon.harvest, title: 'Harvest', desc: 'Sourced from local farms' },
  { icon: Icon.cut, title: 'Cut by Hand', desc: 'Meticulously prepped' },
  { icon: Icon.sun, title: 'Sun Cured', desc: 'Slow matured naturally' },
  { icon: Icon.blend, title: 'Traditional Blend', desc: 'Aromatic spice mixing' },
  { icon: Icon.pack, title: 'Sealed Moisture-Free', desc: 'Sealed for goodness' },
  { icon: Icon.deliver, title: 'Delivered', desc: 'Straight to your door' },
];

function PdpProcessTimeline() {
  return (
    <section className="pdp-process-section">
      <div className="pdp-section-header center">
        <span className="pdp-eyebrow">The Making Process</span>
        <h2 className="pdp-heading">Crafted With Patience</h2>
        <p className="pdp-subtext">Six unhurried steps, the way it has been made in Bihar for generations.</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-line"></div>
        {steps.map((step, idx) => (
          <motion.div
            className="timeline-item"
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
          >
            <div className="timeline-icon">
              <span className="pdp-icon" aria-hidden="true">{step.icon}</span>
              <span className="timeline-step-num">{idx + 1}</span>
            </div>
            <div className="timeline-content">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default PdpProcessTimeline;
