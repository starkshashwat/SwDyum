import { useState, useCallback } from 'react';

/**
 * Central state machine for the Purchase Drawer flow.
 * States:
 *   idle              → drawer open, user browsing
 *   checking_pin      → PIN being verified
 *   pin_valid         → delivery confirmed
 *   pin_invalid       → not deliverable
 *   selecting_address → address sheet expanded
 *   address_selected  → address chosen
 *   applying_coupon   → coupon being validated
 *   coupon_applied    → coupon applied
 *   processing        → "Preparing Secure Payment..." (700ms)
 *   razorpay_open     → Razorpay popup active
 *   payment_success   → redirect to thank-you
 *   payment_failed    → show error, allow retry
 *   error             → generic error
 */
export default function usePurchaseState() {
    const [state, setState] = useState('idle');
    const [error, setError] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');

    const transition = useCallback((newState, meta = {}) => {
        setState(newState);
        setError(meta.error || null);
        setProcessingMessage(meta.message || '');
    }, []);

    const reset = useCallback(() => {
        setState('idle');
        setError(null);
        setProcessingMessage('');
    }, []);

    return {
        state,
        error,
        processingMessage,
        transition,
        reset,
        isIdle: state === 'idle',
        isCheckingPin: state === 'checking_pin',
        isPinValid: state === 'pin_valid',
        isPinInvalid: state === 'pin_invalid',
        isSelectingAddress: state === 'selecting_address',
        isAddressSelected: state === 'address_selected',
        isApplyingCoupon: state === 'applying_coupon',
        isCouponApplied: state === 'coupon_applied',
        isProcessing: state === 'processing',
        isRazorpayOpen: state === 'razorpay_open',
        isPaymentSuccess: state === 'payment_success',
        isPaymentFailed: state === 'payment_failed',
        isError: state === 'error',
    };
}