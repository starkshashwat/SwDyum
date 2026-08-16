import { useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Validate and apply coupon codes against the Supabase coupons table.
 *
 * The coupon shown here is a PREVIEW only — the razorpay edge function
 * re-validates the coupon server-side at create_order (active, expiry,
 * min_cart_value, usage_limit) and recomputes the final discount, so a
 * tampered client cannot obtain a discount that isn't in the database.
 * The hardcoded WELCOME10 fallback was removed for exactly that reason.
 */
export default function useCouponValidation() {
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [error, setError] = useState('');

    const applyCoupon = useCallback(async (code, subtotal) => {
        if (!code || !code.trim()) return false;
        setIsApplying(true);
        setError('');

        try {
            const normalized = code.trim().toUpperCase();
            const { data, error: dbError } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', normalized)
                .eq('is_active', true)
                .maybeSingle();

            if (dbError) {
                throw new Error(dbError.message || 'Could not validate this coupon right now.');
            }
            if (!data) {
                throw new Error('Invalid or inactive coupon code');
            }
            if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
                throw new Error('This coupon has expired');
            }
            // Live schema column is min_cart_value
            if (data.min_cart_value && (subtotal ?? 0) < data.min_cart_value) {
                throw new Error(`This coupon requires a minimum order of ₹${data.min_cart_value}`);
            }
            if (data.usage_limit && (data.times_used || 0) >= data.usage_limit) {
                throw new Error('This coupon has reached its usage limit');
            }

            setAppliedCoupon(data);
            return true;
        } catch (e) {
            setError(e.message || 'Could not apply this coupon.');
            setAppliedCoupon(null);
            return false;
        } finally {
            setIsApplying(false);
        }
    }, []);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setError('');
    }, []);

    const calculateDiscount = useCallback((subtotalAmount) => {
        if (!appliedCoupon) return 0;
        let discount = 0;
        if (appliedCoupon.discount_type === 'percentage') {
            discount = (subtotalAmount * appliedCoupon.discount_value) / 100;
            if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
                discount = appliedCoupon.max_discount;
            }
        } else if (appliedCoupon.discount_type === 'fixed') {
            discount = appliedCoupon.discount_value;
        }
        return Math.max(0, Math.floor(discount));
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
