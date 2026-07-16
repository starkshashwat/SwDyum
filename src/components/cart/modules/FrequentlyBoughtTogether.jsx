import React from 'react';
import { motion } from 'framer-motion';
import './FrequentlyBoughtTogether.css';

const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function FrequentlyBoughtTogether({ products, loading, onAddToCart }) {
    if (loading) {
        return (
            <div className="fbt-section">
                <h3 className="fbt-title">Frequently Bought Together</h3>
                <div className="fbt-loading">
                    <div className="fbt-shimmer-card" />
                    <div className="fbt-shimmer-card" />
                </div>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div className="fbt-section">
            <h3 className="fbt-title">Frequently Bought Together</h3>
            <div className="fbt-carousel">
                {products.map((product, i) => {
                    const savings = product.mrp - product.price;
                    return (
                        <motion.div
                            key={product.slug}
                            className="fbt-card"
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="fbt-card-img"
                                loading="lazy"
                            />
                            <div className="fbt-card-info">
                                <h4 className="fbt-card-name">{product.name}</h4>
                                <p className="fbt-card-weight">{product.weight}</p>
                                <div className="fbt-card-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill={star <= Math.round(product.rating) ? 'var(--color-accent)' : 'var(--color-border)'}
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <div className="fbt-card-pricing">
                                    <span className="fbt-price">₹{product.price}</span>
                                    <span className="fbt-mrp">₹{product.mrp}</span>
                                    {savings > 0 && (
                                        <span className="fbt-savings">Save ₹{savings}</span>
                                    )}
                                </div>
                                <button
                                    className="fbt-add-btn"
                                    onClick={() => onAddToCart(product, product.weight, 1, 'One Time')}
                                    type="button"
                                >
                                    + Add
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}