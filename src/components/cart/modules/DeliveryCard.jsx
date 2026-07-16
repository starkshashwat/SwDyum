import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DeliveryCard.css';

const spinnerVariants = {
    animate: {
        rotate: 360,
        transition: { repeat: Infinity, duration: 0.8, ease: 'linear' },
    },
};

const resultVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function DeliveryCard({ pinStatus, deliveryEta, onVerifyPin }) {
    const [pinInput, setPinInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pinInput.length === 6 && pinStatus.isIdle) {
            onVerifyPin(pinInput);
        }
    };

    const handlePinChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPinInput(val);
        // Auto-submit when 6 digits entered
        if (val.length === 6 && pinStatus.isIdle) {
            onVerifyPin(val);
        }
    };

    return (
        <div className="delivery-card">
            <h3 className="delivery-card-title">🚚 Delivery</h3>

            <AnimatePresence mode="wait">
                {pinStatus.isIdle && (
                    <motion.div
                        key="idle"
                        className="delivery-idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="delivery-prompt">Enter your PIN code to check delivery availability</p>
                        <form onSubmit={handleSubmit} className="delivery-pin-form">
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="6-digit PIN"
                                value={pinInput}
                                onChange={handlePinChange}
                                className="delivery-pin-input"
                                autoComplete="postal-code"
                            />
                            <button
                                type="submit"
                                disabled={pinInput.length !== 6}
                                className="delivery-pin-btn"
                            >
                                Check
                            </button>
                        </form>
                    </motion.div>
                )}

                {pinStatus.isChecking && (
                    <motion.div
                        key="checking"
                        className="delivery-checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="delivery-spinner"
                            variants={spinnerVariants}
                            animate="animate"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" />
                            </svg>
                        </motion.div>
                        <p className="delivery-checking-text">Checking delivery to {pinStatus.pinCode}...</p>
                    </motion.div>
                )}

                {pinStatus.isDeliverable && (
                    <motion.div
                        key="deliverable"
                        className="delivery-success"
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="delivery-success-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <motion.path
                                    d="M20 6L9 17l-5-5"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                />
                            </svg>
                        </div>
                        <div className="delivery-success-text">
                            <p className="delivery-confirmed">✓ We deliver to your area</p>
                            <p className="delivery-eta">
                                Estimated delivery: <strong>{deliveryEta}</strong>
                            </p>
                        </div>
                    </motion.div>
                )}

                {pinStatus.isNotDeliverable && (
                    <motion.div
                        key="not-deliverable"
                        className="delivery-fail"
                        variants={resultVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="delivery-fail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <p className="delivery-fail-text">
                            Sorry, we don't deliver to {pinStatus.pinCode} yet.
                        </p>
                        <button
                            className="delivery-retry-btn"
                            onClick={() => {
                                setPinInput('');
                                pinStatus.reset();
                            }}
                            type="button"
                        >
                            Try another PIN
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}