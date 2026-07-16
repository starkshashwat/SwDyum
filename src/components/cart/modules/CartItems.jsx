import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CartItems.css';

const staggerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    }),
    exit: { opacity: 0, height: 0, overflow: 'hidden', x: -20, transition: { duration: 0.2 } },
};

const qtyPopVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.05, 1], transition: { duration: 0.2 } },
};

export default function CartItems({ cart, updateCartQty, removeFromCart }) {
    if (cart.length === 0) {
        return (
            <div className="cart-items-empty">
                <div className="cart-items-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>
                <h3>Your Cart is Empty</h3>
                <p>Let's find something delicious.</p>
            </div>
        );
    }

    return (
        <div className="cart-items-list">
            <AnimatePresence>
                {cart.map((item, idx) => {
                    const oldPrice = item.mrp || Math.round(item.price * 1.25);
                    const savings = oldPrice - item.price;
                    const itemKey = `${item.slug}-${item.weight}-${item.subscription}`;

                    return (
                        <motion.div
                            key={itemKey}
                            className="cart-item-card"
                            custom={idx}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={staggerVariants}
                            layout
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="cart-item-image"
                                loading="lazy"
                            />

                            <div className="cart-item-body">
                                <div className="cart-item-top">
                                    <h4 className="cart-item-name">{item.name}</h4>
                                    <div className="cart-item-meta">
                                        <span className="cart-item-weight">{item.weight}</span>
                                        <span className="cart-item-dot">•</span>
                                        <span className="cart-item-sub">{item.subscription}</span>
                                    </div>
                                    {/* Star rating */}
                                    <div className="cart-item-stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill={star <= 4 ? 'var(--color-accent)' : 'var(--color-border)'}
                                            >
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                            </svg>
                                        ))}
                                        <span className="cart-item-rating-text">4.8</span>
                                    </div>
                                </div>

                                <div className="cart-item-pricing">
                                    <span className="cart-item-price">₹{item.price}</span>
                                    {savings > 0 && (
                                        <>
                                            <span className="cart-item-old-price">₹{oldPrice}</span>
                                            <span className="cart-item-savings">Save ₹{savings}</span>
                                        </>
                                    )}
                                </div>

                                <div className="cart-item-actions">
                                    <div className="cart-item-qty">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity - 1)}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <motion.span
                                            className="qty-value"
                                            key={item.quantity}
                                            variants={qtyPopVariants}
                                            initial="initial"
                                            animate="animate"
                                        >
                                            {item.quantity}
                                        </motion.span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateCartQty(item.slug, item.weight, item.subscription, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => removeFromCart(item.slug, item.weight, item.subscription)}
                                        aria-label="Remove item"
                                        title="Remove item"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}