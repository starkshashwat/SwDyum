import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CouponSection.css';

const glowVariants = {
    inactive: { boxShadow: '0 0 0px rgba(10, 90, 50, 0)' },
    active: {
        boxShadow: [
            '0 0 0px rgba(10, 90, 50, 0)',
            '0 0 20px rgba(10, 90, 50, 0.25)',
            '0 0 12px rgba(10, 90, 50, 0.15)',
        ],
        transition: { duration: 0.8, ease: 'easeOut' },
    },
};

const checkmarkDraw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut', delay: 0.2 },
    },
};

export default function CouponSection({
    appliedCoupon,
    isApplying,
    error,
    onApply,
    onRemove,
    discount,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim() || isApplying) return;
        onApply(code);
    };

    const handleRemove = () => {
        onRemove();
        setCode('');
    };

    return (
        <div className="coupon-section">
            <button
                className="coupon-toggle"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span>{appliedCoupon ? '🏷️ Coupon Applied' : 'Have a Coupon?'}</span>
                <span className={`coupon-chevron ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="coupon-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {appliedCoupon ? (
                            <motion.div
                                className="coupon-applied"
                                variants={glowVariants}
                                initial="inactive"
                                animate="active"
                            >
                                <div className="coupon-applied-left">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--color-primary)"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <motion.path
                                            d="M20 6L9 17l-5-5"
                                            variants={checkmarkDraw}
                                            initial="hidden"
                                            animate="visible"
                                        />
                                    </svg>
                                    <div className="coupon-applied-info">
                                        <span className="coupon-code-name">{appliedCoupon.code}</span>
                                        {discount > 0 && (
                                            <span className="coupon-saved">You saved ₹{discount}</span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="coupon-remove-btn"
                                    onClick={handleRemove}
                                    type="button"
                                >
                                    Remove
                                </button>
                            </motion.div>
                        ) : (
                            <form className="coupon-form" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    disabled={isApplying}
                                    className={error ? 'coupon-input-error' : ''}
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={!code.trim() || isApplying}
                                    className="coupon-apply-btn"
                                >
                                    {isApplying ? '...' : 'Apply'}
                                </button>
                            </form>
                        )}
                        {error && !appliedCoupon && (
                            <motion.p
                                className="coupon-error"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}