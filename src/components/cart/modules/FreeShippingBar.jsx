import React from 'react';
import { motion } from 'framer-motion';
import './FreeShippingBar.css';

const FREE_SHIPPING_THRESHOLD = 799;

const confettiVariants = {
    hidden: { opacity: 0, y: -10, scale: 0 },
    visible: (i) => ({
        opacity: [0, 1, 0],
        y: [0, -30, -60],
        x: [0, (i % 2 === 0 ? 20 : -20), (i % 2 === 0 ? 40 : -40)],
        scale: [0, 1.2, 0.8],
        transition: {
            delay: i * 0.08,
            duration: 0.9,
            ease: 'easeOut',
        },
    }),
};

const confettiColors = ['#0a5a32', '#1a9d5a', '#e8a83a', '#d4ecd9', '#f0bc5c'];

export default function FreeShippingBar({ subtotal }) {
    const amountAway = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    const isAchieved = amountAway === 0 && subtotal > 0;

    return (
        <div className="freeship-bar">
            {isAchieved ? (
                <div className="freeship-achieved">
                    <motion.p
                        className="freeship-success-text"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        ✓ Congratulations! You unlocked <strong>FREE SHIPPING</strong>.
                    </motion.p>
                    {/* Confetti burst */}
                    <div className="freeship-confetti-container">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="freeship-confetti-particle"
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={confettiVariants}
                                style={{
                                    backgroundColor: confettiColors[i % confettiColors.length],
                                    left: `${50 + (i % 5) * 8 - 16}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="freeship-progress">
                    <p>
                        You're <strong>₹{amountAway}</strong> away from FREE Shipping
                    </p>
                    <div className="freeship-progress-bar-bg">
                        <motion.div
                            className="freeship-progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}