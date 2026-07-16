import { useState, useCallback } from 'react';

/**
 * PIN code delivery verification hook.
 * Simulates checking a PIN against a serviceable area list.
 * In production, this would call Shiprocket or a similar PIN serviceability API.
 *
 * States: idle → checking → deliverable | not_deliverable
 */
const SERVICEABLE_PINS = [
    '110001', '110002', '110003', '110004', '110005', '110006', '110007',
    '400001', '400002', '400003', '400004', '400005',
    '560001', '560002', '560003',
    '700001', '700002',
    '800001', '800002', '800003', '800004', '800005', // Patna region
    '201301', '201302', // Noida
    '122001', '122002', // Gurgaon
    '411001', '411002', // Pune
    '500001', '500002', // Hyderabad
    '600001', '600002', // Chennai
    '380001', '380002', // Ahmedabad
    '302001', '302002', // Jaipur
    '226001', '226002', // Lucknow
    '440001', '440002', // Nagpur
    '452001', '452002', // Indore
    '110020', '110025', '110030', '110040', '110050', '110060', '110070', '110080', '110090',
    '400010', '400020', '400050', '400060', '400070', '400080',
    '560010', '560020', '560030', '560040', '560050', '560060', '560070', '560080',
];

const DELIVERY_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getEstimatedDelivery() {
    const now = new Date();
    // Add 3-5 business days
    let daysToAdd = 3 + Math.floor(Math.random() * 3);
    const deliveryDate = new Date(now);
    while (daysToAdd > 0) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        const day = deliveryDate.getDay();
        if (day !== 0 && day !== 6) daysToAdd--; // skip weekends
    }
    const dayName = DELIVERY_DAYS[deliveryDate.getDay() === 0 ? 6 : deliveryDate.getDay() - 1];
    const month = deliveryDate.toLocaleString('en-US', { month: 'short' });
    const date = deliveryDate.getDate();
    return `${dayName}, ${month} ${date}`;
}

export default function usePinVerification() {
    const [status, setStatus] = useState('idle'); // idle | checking | deliverable | not_deliverable
    const [pinCode, setPinCode] = useState('');
    const [deliveryEta, setDeliveryEta] = useState(null);

    const verifyPin = useCallback(async (pin) => {
        if (!pin || pin.length !== 6) return;
        setPinCode(pin);
        setStatus('checking');

        // Simulate network delay (800ms as per instructions.md)
        await new Promise((r) => setTimeout(r, 800));

        const isServiceable = SERVICEABLE_PINS.includes(pin);
        if (isServiceable) {
            const eta = getEstimatedDelivery();
            setDeliveryEta(eta);
            setStatus('deliverable');
        } else {
            setDeliveryEta(null);
            setStatus('not_deliverable');
        }
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setPinCode('');
        setDeliveryEta(null);
    }, []);

    return {
        status,
        pinCode,
        deliveryEta,
        verifyPin,
        reset,
        isIdle: status === 'idle',
        isChecking: status === 'checking',
        isDeliverable: status === 'deliverable',
        isNotDeliverable: status === 'not_deliverable',
    };
}