// Single source of truth for shipping rules. The razorpay edge function
// recomputes shipping server-side with these same values — if the client
// shows a different fee, checkout aborts rather than charging a mismatched
// total, so keep this file in sync with supabase/functions/razorpay.
export const FREE_SHIPPING_THRESHOLD = 799;
export const FLAT_SHIPPING_FEE = 50;
export const getShippingFee = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_FEE;
