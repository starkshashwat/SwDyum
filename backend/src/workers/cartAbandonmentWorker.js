import { supabaseAdmin } from '../config/supabaseClient.js';
import { AutomationService } from '../services/automation.service.js';

let isProcessing = false;

// Default abandonment threshold: 1 hour
const ABANDONMENT_THRESHOLD_MINUTES = 60;

/**
 * Cart Abandonment Detection Worker
 * 
 * Scans the abandoned_carts table for carts that:
 * 1. Have status 'active'
 * 2. Were last updated more than ABANDONMENT_THRESHOLD_MINUTES ago
 * 3. Have not yet triggered an automation
 * 4. Have no corresponding completed order for the customer
 * 
 * When found, marks the cart as 'abandoned' and fires the cart_abandoned event.
 */
export async function processCartAbandonment() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const thresholdTime = new Date();
        thresholdTime.setMinutes(thresholdTime.getMinutes() - ABANDONMENT_THRESHOLD_MINUTES);

        // Find active carts that haven't been updated in over the threshold
        const { data: staleCarts, error } = await supabaseAdmin
            .from('abandoned_carts')
            .select('*, customer:profiles(id, name, email, phone)')
            .eq('status', 'active')
            .eq('automation_triggered', false)
            .lte('updated_at', thresholdTime.toISOString())
            .gt('cart_value', 0); // Ignore empty carts

        if (error) {
            console.error('Error fetching stale carts:', error);
            return;
        }

        if (!staleCarts || staleCarts.length === 0) return;

        console.log(`Cart Abandonment Worker: Found ${staleCarts.length} potentially abandoned carts.`);

        for (const cart of staleCarts) {
            try {
                // Verify customer hasn't placed an order since the cart was last updated
                const { data: recentOrder } = await supabaseAdmin
                    .from('orders')
                    .select('id')
                    .eq('customer_id', cart.customer_id)
                    .in('payment_status', ['Paid', 'Captured', 'Pending'])
                    .gte('created_at', cart.updated_at)
                    .limit(1)
                    .single();

                if (recentOrder) {
                    // Customer placed an order — mark cart as recovered, not abandoned
                    await supabaseAdmin
                        .from('abandoned_carts')
                        .update({ status: 'recovered', automation_triggered: false })
                        .eq('id', cart.id);
                    continue;
                }

                // Mark as abandoned
                await supabaseAdmin
                    .from('abandoned_carts')
                    .update({
                        status: 'abandoned',
                        abandoned_at: new Date().toISOString(),
                        automation_triggered: true
                    })
                    .eq('id', cart.id);

                // Build payload for automation
                const payload = {
                    trigger_type: 'cart_abandoned',
                    customer_name: cart.customer?.name || '',
                    customer_email: cart.customer?.email || cart.customer_email || '',
                    customer_phone: cart.customer?.phone || cart.customer_phone || '',
                    customer_id: cart.customer_id,
                    cart_id: cart.id,
                    cart_value: cart.cart_value,
                    cart_items: cart.cart_items,
                    cart_url: cart.cart_url || 'https://swadyum.store',
                    // Extract first product details for template variables
                    product_name: Array.isArray(cart.cart_items) && cart.cart_items.length > 0
                        ? cart.cart_items[0].name || cart.cart_items[0].product_name || ''
                        : '',
                    product_image: Array.isArray(cart.cart_items) && cart.cart_items.length > 0
                        ? cart.cart_items[0].image || ''
                        : '',
                    product_price: Array.isArray(cart.cart_items) && cart.cart_items.length > 0
                        ? cart.cart_items[0].price || ''
                        : '',
                    quantity: Array.isArray(cart.cart_items)
                        ? cart.cart_items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                        : 0
                };

                // Fire the automation event
                const eventId = `cart_abandoned_${cart.id}_${Date.now()}`;
                await AutomationService.trackEvent(eventId, 'cart_abandoned', cart.customer_id, payload);

                console.log(`Cart ${cart.id} for customer ${cart.customer_id} marked as abandoned. Automation triggered.`);

            } catch (cartError) {
                console.error(`Error processing cart ${cart.id}:`, cartError);
            }
        }

    } catch (error) {
        console.error('processCartAbandonment Error:', error);
    } finally {
        isProcessing = false;
    }
}

/**
 * Starts the cart abandonment detection polling interval.
 * Polls every 5 minutes.
 */
export function startCartAbandonmentWorker() {
    console.log('Started Cart Abandonment Worker (every 5 minutes)...');
    setInterval(processCartAbandonment, 5 * 60 * 1000);
    // Also run once at startup after a short delay
    setTimeout(processCartAbandonment, 10000);
}
