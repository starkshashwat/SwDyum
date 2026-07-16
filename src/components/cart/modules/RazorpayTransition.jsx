import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RazorpayTransition.css';

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.2 },
    },
};

const dotVariants = {
    animate: (i) => ({
        opacity: [0.3, 1, 0.3],
        transition: {
            delay: i * 0.2,
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    }),
};

export default function RazorpayTransition({ isActive }) {
    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="razorpay-transition-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="razorpay-transition-card"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="razorpay-transition-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3 className="razorpay-transition-title">Preparing Secure Payment</h3>
                        <div className="razorpay-transition-dots">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="razorpay-dot"
                                    custom={i}
                                    variants={dotVariants}
                                    animate="animate"
                                />
                            ))}
                        </div>
                        <p className="razorpay-transition-sub">
                            Please don't close this window
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}