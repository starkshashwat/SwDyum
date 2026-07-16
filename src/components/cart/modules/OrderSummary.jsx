import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OrderSummary.css';

export default function OrderSummary({ cart, subtotal, shipping, discount, total, appliedCoupon }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="order-summary-section">
            <button
                className="order-summary-toggle"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span>Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} item{cart.length !== 1 ? 's' : ''})</span>
                <span className={`os-chevron ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="order-summary-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Mini item list */}
                        <div className="os-items">
                            {cart.map((item, idx) => (
                                <div key={idx} className="os-item">
                                    <img src={item.image} alt={item.name} className="os-item-img" />
                                    <div className="os-item-info">
                                        <span className="os-item-name">{item.name}</span>
                                        <span className="os-item-meta">{item.weight} × {item.quantity}</span>
                                    </div>
                                    <span className="os-item-price">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="os-totals">
                            <div className="os-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="os-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            {discount > 0 && (
                                <div className="os-row os-discount-row">
                                    <span>Discount {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                                    <span>-₹{discount}</span>
                                </div>
                            )}
                            <div className="os-divider" />
                            <div className="os-row os-total-row">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}