import { useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * supabase.functions.invoke returns a generic FunctionsHttpError message
 * ("Edge Function returned a non-2xx status code") on 4xx/5xx. The real
 * message lives in error.context (the raw Response). Parse it so users and
 * logs see the actual failure reason.
 */
const extractEdgeFunctionError = async (invokeError, fallback) => {
    try {
        if (invokeError?.context?.json) {
            const body = await invokeError.context.json();
            if (body?.error) return body.error;
        }
    } catch { /* context already consumed or not JSON */ }
    return invokeError?.message || fallback;
};


const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(!!window.Razorpay));
            existing.addEventListener('error', () => resolve(false));
            return;
        }
        const script = document.createElement('script');
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve(!!window.Razorpay);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const ensureRazorpayScript = async (retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const ok = await loadRazorpayScript();
        if (ok && window.Razorpay) return true;
        if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
    }
    return false;
};

/**
 * Extracted Razorpay checkout logic — script loading, order creation,
 * payment verification, and order finalization.
 *
 * Security model: the cart (slug + weight + quantity) is sent to the
 * `razorpay` edge function, which recomputes every amount from the
 * database and creates the order row itself. The client never sends a
 * total and never writes order/payment status — `verify_payment`
 * verifies the signature + charged amount server-side.
 *
 * Used by CheckoutFooter to initiate payment after the 700ms transition.
 */
export default function useRazorpayCheckout({
    currentUser,
    clearCart,
    onClose,
    onNavigate,
    onModalOpened,
    onAborted,
    onPaymentFailed,
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [error, setError] = useState(null);

    const saveAddressForFuture = useCallback(async (formData) => {
        if (!currentUser || !currentUser.id) return;
        try {
            const { data: existingAddrs, error: fetchError } = await supabase
                .from('addresses').select('id').eq('customer_id', currentUser.id);
            if (fetchError) return;
            if (!existingAddrs || existingAddrs.length === 0) {
                await supabase.from('addresses').insert([{
                    customer_id: currentUser.id, label: 'Home',
                    full_name: formData.name, phone: formData.phone, email: formData.email,
                    street: formData.address, city: formData.city, state: formData.state,
                    pin_code: formData.zip, country: 'India', is_default: true,
                }]);
            }
        } catch (e) { /* non-critical */ }
    }, [currentUser]);

    const initiateCheckout = useCallback(async (orderParams) => {
        setIsProcessing(true);
        setError(null);
        setProcessingStep('Loading payment gateway...');

        try {
            const res = await ensureRazorpayScript();
            if (!res || !window.Razorpay) throw new Error('Could not load payment gateway.');

            setProcessingStep('Creating payment order...');
            const receiptId = `rcpt_${Date.now()}`;
            const { data, error: invokeError } = await supabase.functions.invoke('razorpay', {
                body: {
                    action: 'create_order',
                    // Items only — the server recomputes all amounts from DB prices
                    items: orderParams.cart.map((item) => ({
                        slug: item.slug,
                        weight: item.weight,
                        quantity: item.quantity,
                    })),
                    coupon_code: orderParams.appliedCoupon ? orderParams.appliedCoupon.code : null,
                    customer: orderParams.formData,
                    receipt: receiptId,
                },
            });

            if (invokeError) throw new Error(await extractEdgeFunctionError(invokeError, 'Payment service unavailable.'));
            if (data?.error) throw new Error(data.error);
            if (!data?.order?.id || !data?.order_id) throw new Error('Payment order could not be created.');

            // If the server's authoritative total differs from what the drawer
            // displayed (price change, coupon state, stock), stop and let the
            // customer review instead of silently charging a different amount.
            const serverTotal = data.totals?.total;
            if (typeof serverTotal === 'number' && Math.abs(serverTotal - orderParams.total) > 0.5) {
                throw new Error('The order total has changed (prices or coupon updated). Please review your cart and try again.');
            }

            const rzpOrderId = data.order.id;
            const internalOrderId = data.order_id;
            const backendKeyId = data.order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!backendKeyId) throw new Error('Payment key not configured.');

            setProcessingStep('Preparing checkout...');
            saveAddressForFuture(orderParams.formData);

            const options = {
                key: backendKeyId,
                amount: Math.round((typeof serverTotal === 'number' ? serverTotal : orderParams.total) * 100),
                currency: 'INR',
                name: 'Swadyum',
                description: 'Authentic Pickles',
                image: '/logo-01.webp',
                order_id: rzpOrderId,
                prefill: {
                    name: orderParams.formData.name,
                    email: orderParams.formData.email,
                    contact: orderParams.formData.phone,
                },
                theme: { color: '#0a5a32' },
                handler: async function (response) {
                    setProcessingStep('Verifying payment...');
                    try {
                        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
                            body: {
                                action: 'verify_payment',
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                        });
                        if (verifyError) throw verifyError;
                        if (verifyData?.error) throw new Error(verifyData.error);
                        if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed');

                        // Order status is finalized server-side (payments row, invoice,
                        // inventory, notifications) before this point.
                        clearCart();
                        sessionStorage.setItem('lastCompletedOrder', internalOrderId);
                        onClose();
                        onNavigate('thank-you');
                    } catch (err) {
                        const msg = `Payment verification failed: ${err.message}`;
                        setError(msg);
                        setIsProcessing(false);
                        onPaymentFailed?.(msg);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        onAborted?.();
                    },
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', (response) => {
                const msg = `Payment failed: ${response.error.description}`;
                setError(msg);
                setIsProcessing(false);
                onPaymentFailed?.(msg);
            });
            rzp1.open();
            onModalOpened?.();
        } catch (err) {
            const msg = err.message || 'Failed to initialize checkout.';
            setError(msg);
            setIsProcessing(false);
            onPaymentFailed?.(msg);
        }
    }, [saveAddressForFuture, clearCart, onClose, onNavigate, onModalOpened, onAborted, onPaymentFailed]);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProcessingStep('');
        setError(null);
    }, []);

    return {
        isProcessing,
        processingStep,
        error,
        initiateCheckout,
        reset,
    };
}
