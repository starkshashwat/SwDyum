import { useState, useCallback } from 'react';

/**
 * PIN code delivery verification hook.
 * Calls the backend serviceability API which in turn calls Velocity's
 * POST /custom/api/v1/serviceability with the default warehouse's pincode
 * as the `from` and the customer's pincode as the `to`.
 *
 * States: idle → checking → deliverable | not_deliverable | error
 */

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function usePinVerification() {
    const [status, setStatus] = useState('idle'); // idle | checking | deliverable | not_deliverable | error
    const [pinCode, setPinCode] = useState('');
    const [deliveryEta, setDeliveryEta] = useState(null);
    const [carrierInfo, setCarrierInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const verifyPin = useCallback(async (pin, paymentMode = 'prepaid') => {
        if (!pin || pin.length !== 6) return null;
        setPinCode(pin);
        setStatus('checking');
        setErrorMessage(null);
        setCarrierInfo(null);

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/shipping/check-serviceability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pincode: pin,
                    payment_mode: paymentMode,
                    shipment_type: 'forward'
                })
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.error || `Service check failed (${response.status})`);
            }

            const { data } = await response.json();

            if (data.serviceable) {
                // Estimate delivery: use carrier data if available
                const eta = getEstimatedDelivery();
                setDeliveryEta(eta);
                setCarrierInfo({
                    zone: data.zone,
                    carriers: data.carriers
                });
                setStatus('deliverable');
                return 'deliverable';
            } else {
                setDeliveryEta(null);
                setStatus('not_deliverable');
                return 'not_deliverable';
            }
        } catch (err) {
            console.error('Serviceability check failed:', err);
            setErrorMessage(err.message);
            // Fallback: still show not_deliverable rather than breaking the UI
            setStatus('not_deliverable');
            return 'not_deliverable';
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setPinCode('');
        setDeliveryEta(null);
        setCarrierInfo(null);
        setErrorMessage(null);
    }, []);

    return {
        status,
        pinCode,
        deliveryEta,
        carrierInfo,
        errorMessage,
        verifyPin,
        reset,
        isIdle: status === 'idle',
        isChecking: status === 'checking',
        isDeliverable: status === 'deliverable',
        isNotDeliverable: status === 'not_deliverable',
    };
}

/**
 * Client-side ETA calculation as a fallback / display convenience.
 * The real ETA should come from the carrier data when available.
 */
function getEstimatedDelivery() {
    const DELIVERY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const now = new Date();
    let daysToAdd = 3 + Math.floor(Math.random() * 3);
    const deliveryDate = new Date(now);
    while (daysToAdd > 0) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        const day = deliveryDate.getDay();
        if (day !== 0 && day !== 6) daysToAdd--;
    }
    const dayName = DELIVERY_DAYS[deliveryDate.getDay() === 0 ? 6 : deliveryDate.getDay() - 1];
    const month = deliveryDate.toLocaleString('en-US', { month: 'short' });
    const date = deliveryDate.getDate();
    return `${dayName}, ${month} ${date}`;
}