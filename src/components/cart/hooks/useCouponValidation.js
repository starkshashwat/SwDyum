import { useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Validate and apply coupon codes against the Supabase coupons table.
 * Also supports the hardcoded WELCOME10 fallback for demo purposes.
 */
export default function useCouponValidation() {
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState('');

    const applyCoupon = useCallback(async (code) => {
        if (!code || !code.trim()) return;
        setIsApplying(true);
        setError('');

        try {
            // Try Supabase first
            const { data, err } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', code.trim().toUpperCase())
                .eq('is_active', true)
                .single();

            if (err || !data) {
                // Fallback: hardcoded WELCOME10
                if (code.trim().toUpperCase() === 'WELCOME10') {
                    setAppliedCoupon({
                        code: 'WELCOME10',
                        discount_type: 'percentage',
                        discount_value: 10,
                        max_discount: 100,
                    });
                    return;
                }
                throw new Error('Invalid or expired coupon code');
            }

            if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
                throw new Error('This coupon has expired');
            }

            if (data.min_order_value) {
                // min_order_value check will be done by the caller
                data._min_order = data.min_order_value;
            }

            setAppliedCoupon(data);
        } catch (e) {
            setError(e.message);
            setAppliedCoupon(null);
        } finally {
            setIsApplying(false);
        }
    }, []);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setError('');
    }, []);

    const calculateDiscount = useCallback((subtotal) => {
        if (!appliedCoupon) return 0;
        let discount = 0;
        if (appliedCoupon.discount_type === 'percentage') {
            discount = (subtotal * appliedCoupon.discount_value) / 100;
            if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
                discount = appliedCoupon.max_discount;
            }
        } else if (appliedCoupon.discount_type === 'fixed') {
            discount = appliedCoupon.discount_value;
        }
        return Math.floor(discount);
    }, [appliedCoupon]);

    return {
        appliedCoupon,
        isApplying,
        error,
        applyCoupon,
        removeCoupon,
        calculateDiscount,
    };
}