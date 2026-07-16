import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartCheckoutAssistant.css';

/**
 * Rule-based smart assistant that provides proactive suggestions.
 * Checks: free shipping threshold, cart contents, available coupons.
 */
function generateSuggestion(subtotal, cart, appliedCoupon) {
    const FREE_SHIPPING_THRESHOLD = 799;
    const amountAway = FREE_SHIPPING_THRESHOLD - subtotal;

    // Suggestion 1: Free shipping gap
    if (amountAway > 0 && amountAway <= 250) {
        return {
            id: 'free-shipping',
            message: `You're ₹${amountAway} away from free shipping. Add 250g Mango Pickle (₹199) to save ₹60 on delivery!`,
            action: null,
        };
    }

    // Removed garlic-duo suggestion as per user request

    // Suggestion 3: Coupon reminder
    if (!appliedCoupon && subtotal >= 500) {
        return {
            id: 'coupon-reminder',
            message: 'You have a coupon available! Try SWADYUM20 for 20% off your order.',
            action: null,
        };
    }

    // Suggestion 4: Free shipping achieved
    if (amountAway <= 0 && subtotal > 0 && !appliedCoupon) {
        return {
            id: 'free-ship-achieved',
            message: '🎉 Free shipping unlocked! Add a coupon to save even more.',
            action: null,
        };
    }

    return null;
}

export default function SmartCheckoutAssistant({ subtotal, cart, appliedCoupon }) {
    const suggestion = generateSuggestion(subtotal, cart, appliedCoupon);

    return (
        <AnimatePresence>
            {suggestion && (
                <motion.div
                    className="smart-assistant"
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="smart-assistant-content">
                        <span className="smart-assistant-icon">💡</span>
                        <p className="smart-assistant-text">{suggestion.message}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}