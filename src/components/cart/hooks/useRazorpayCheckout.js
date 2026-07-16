import { useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

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
 * Used by CheckoutFooter to initiate payment after the 700ms transition.
 */
export default function useRazorpayCheckout({
    currentUser,
    clearCart,
    onClose,
    onNavigate,
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [error, setError] = useState(null);

    const createPendingOrder = useCallback(async (razorpayOrderId, orderParams) => {
        const {
            formData, subtotal, shipping, discountAmount, total, appliedCoupon, cart,
        } = orderParams;

        const customerId = currentUser ? currentUser.id : null;
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const shippingDetails = {
            name: formData.name, email: formData.email, phone: formData.phone,
            address: formData.address, city: formData.city, state: formData.state, zip: formData.zip,
        };

        const orderData = {
            id: orderId, customer_id: customerId,
            customer_name: formData.name, customer_email: formData.email, customer_phone: formData.phone,
            subtotal, shipping_fee: shipping, cod_fee: 0, discount_amount: discountAmount,
            total, payment_method: 'Online / Razorpay',
            payment_id: razorpayOrderId, razorpay_order_id: razorpayOrderId,
            shipping_details: shippingDetails, billing_details: shippingDetails, shipping,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            items: cart, status: 'Pending', payment_status: 'Pending', order_status: 'Pending',
            checkout_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
        };

        let { error: orderError } = await supabase.from('orders').insert([orderData]);
        if (orderError && orderError.message && orderError.message.includes('orders_customer_id_fkey')) {
            orderData.customer_id = null;
            const retry = await supabase.from('orders').insert([orderData]);
            orderError = retry.error;
        }
        if (orderError) throw orderError;

        const orderItems = cart.map((item) => ({
            order_id: orderId, product_name: item.name, weight_label: item.weight,
            sku: item.sku || '', subscription_type: item.subscription,
            quantity: item.quantity, unit_price: item.price,
            total_price: item.price * item.quantity, final_price: item.price * item.quantity,
        }));
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Save address for future orders
        if (currentUser && currentUser.id) {
            try {
                const { data: existingAddrs } = await supabase
                    .from('addresses').select('id').eq('customer_id', currentUser.id);
                if (!existingAddrs || existingAddrs.length === 0) {
                    await supabase.from('addresses').insert([{
                        customer_id: currentUser.id, label: 'Home',
                        full_name: formData.name, phone: formData.phone, email: formData.email,
                        street: formData.address, city: formData.city, state: formData.state,
                        pin_code: formData.zip, country: 'India', is_default: true,
                    }]);
                }
            } catch (e) { /* non-critical */ }
        }

        return orderId;
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
                body: { action: 'create_order', amount: orderParams.total, receipt: receiptId },
            });

            if (invokeError) throw new Error(invokeError.message || 'Payment service unavailable.');
            if (data?.error) throw new Error(data.error);
            if (!data?.order?.id) throw new Error('Payment order could not be created.');

            const rzpOrderId = data.order.id;
            const backendKeyId = data.order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!backendKeyId) throw new Error('Payment key not configured.');

            setProcessingStep('Creating order...');
            const internalOrderId = await createPendingOrder(rzpOrderId, orderParams);

            const options = {
                key: backendKeyId,
                amount: Math.round(orderParams.total * 100),
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
                        if (!verifyData.success) throw new Error('Payment verification failed');

                        setProcessingStep('Finalizing order...');
                        await supabase.from('orders')
                            .update({ status: 'Paid', payment_id: response.razorpay_payment_id })
                            .eq('id', internalOrderId);

                        clearCart();
                        sessionStorage.setItem('lastCompletedOrder', internalOrderId);
                        onClose();
                        onNavigate('thank-you');
                    } catch (err) {
                        setError(`Payment verification failed: ${err.message}`);
                        setIsProcessing(false);
                    }
                },
                modal: { ondismiss: () => setIsProcessing(false) },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', (response) => {
                setError(`Payment failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp1.open();
        } catch (err) {
            setError(err.message || 'Failed to initialize checkout.');
            setIsProcessing(false);
        }
    }, [createPendingOrder, clearCart, onClose, onNavigate]);

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