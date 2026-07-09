import React from 'react';
import { motion } from 'framer-motion';
import './PdpRelated.css';

function PdpRelated({ products = [], onNavigate }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="pdp-related-section">
            <div className="pdp-related-container">
                <div className="pdp-section-header center">
                    <span className="pdp-eyebrow">You May Also Love</span>
                    <h2 className="pdp-heading">Complete Your Pickle Collection</h2>
                </div>

                <div className="pdp-related-grid">
                    {products.map((p, idx) => {
                        const price = p.base_price || (p.prices ? Object.values(p.prices)[0] : 299);
                        const mrp = Math.round(price * 1.35);
                        const pct = Math.round((1 - price / mrp) * 100);
                        return (
                            <motion.button
                                type="button"
                                className="pdp-related-card"
                                key={p.id || idx}
                                onClick={() => onNavigate(`product-${p.slug}`)}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                whileHover={{ y: -6 }}
                            >
                                <div className="pdp-related-img-wrap">
                                    <img src={p.image || '/prod_mango.webp'} alt={p.name} loading="lazy" />
                                    {pct > 0 && <span className="pdp-related-badge">{pct}% OFF</span>}
                                </div>
                                <div className="pdp-related-info">
                                    <h4>{p.name}</h4>
                                    <div className="pdp-related-price-row">
                                        <span className="pdp-related-price">₹{price}</span>
                                        <span className="pdp-related-mrp">₹{mrp}</span>
                                    </div>
                                    <div className="pdp-related-stars">★★★★★ <span>(4.9)</span></div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default PdpRelated;
