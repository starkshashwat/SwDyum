import React from 'react';
import { motion } from 'framer-motion';
import './CheckoutFooter.css';

const rippleEffect = {
    whileTap: {
        scale: 0.98,
        transition: { duration: 0.1 },
    },
};

export default function CheckoutFooter({
    subtotal,
    shipping,
    discount,
    total,
    appliedCoupon,
    isProcessing,
    processingMessage,
    onCheckout,
}) {
    const shippingLabel = shipping === 0 ? 'FREE' : `₹${shipping}`;

    return (
        <div className="checkout-footer">

            {/* Checkout button */}
            <motion.button
                className="footer-checkout-btn"
                onClick={onCheckout}
                disabled={isProcessing}
                {...rippleEffect}
                whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(10, 90, 50, 0.25)' }}
                type="button"
            >
                {isProcessing ? (
                    <span className="footer-btn-loading">
                        <span className="footer-spinner" />
                        {processingMessage || 'Processing...'}
                    </span>
                ) : (
                    <>
                        <span className="footer-btn-text">Secure Checkout →</span>
                        <span className="footer-btn-total">₹{total}</span>
                    </>
                )}
            </motion.button>

            <p className="footer-security-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Secure Checkout with Razorpay
            </p>
        </div>
    );
}