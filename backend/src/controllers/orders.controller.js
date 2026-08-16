// ============================================================================
// controllers/orders.controller.js
// ----------------------------------------------------------------------------
// Read + status/tracking-update controller for `orders`. Per the task's
// explicit rule: NO POST /orders (orders originate from checkout/webhooks
// elsewhere, not from this admin API) and NO DELETE /orders (orders are a
// permanent business record). Only GET (list, single-with-nested-items) and
// PATCH (status/tracking/payment_status) are implemented.
// ============================================================================

import { supabaseAdmin } from '../config/supabaseClient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resilientQuery } from '../utils/resilientQuery.js';
import { AutomationService } from '../services/automation.service.js';

/**
 * GET /orders
 * Paginated list, filterable by status, payment_status, customer_email,
 * and a created_at date range (date_from/date_to).
 */
export const listOrders = asyncHandler(async (req, res) => {
    const { page, limit, status, payment_status, customer_email, date_from, date_to } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await resilientQuery(supabaseAdmin, {
        table: 'orders',
        select: '*',
        order: 'created_at',
        ascending: false,
        range: [from, to],
        count: true,
        filters: (q) => {
            if (status) q = q.eq('status', status);
            if (payment_status) q = q.eq('payment_status', payment_status);
            if (customer_email) q = q.ilike('customer_email', `%${customer_email}%`);
            if (date_from) q = q.gte('created_at', date_from);
            if (date_to) q = q.lte('created_at', date_to);
            return q;
        },
    });

    if (error) throw error;
    res.json({ data: data || [], pagination: { page, limit, total: count || 0 } });
});

/**
 * GET /orders/:id
 * Single order with nested order_items (read-only join — order_items have
 * no independent CRUD routes per the task's instructions; they are always
 * read as part of their parent order).
 */
export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await resilientQuery(supabaseAdmin, {
        table: 'orders',
        select: '*, order_items(*)',
        single: true,
        filters: (q) => q.eq('id', id),
    });

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Order not found.' });
        throw error;
    }
    res.json({ data });
});

/**
 * PATCH /orders/:id
 * Updates ONLY status, payment_status, tracking_number, tracking_history
 * (enforced by updateOrderSchema — no other order fields, e.g. total or
 * shipping_address, are writable via this endpoint).
 */
export const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Fetch original order to check for status changes
    const { data: originalOrder } = await resilientQuery(supabaseAdmin, {
        table: 'orders',
        select: 'status, customer_email, customer_phone, shipping_details',
        single: true,
        filters: (q) => q.eq('id', id),
    });

    const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, order_items(*)')
        .single();

    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Order not found.' });
        throw error;
    }

    // Trigger Automation Engine if status changed
    if (originalOrder?.data && req.body.status && originalOrder.data.status !== req.body.status) {
        const newStatus = req.body.status;
        let eventType = null;
        
        if (newStatus === 'Shipped') eventType = 'order_shipped';
        else if (newStatus === 'Out for Delivery' || newStatus === 'Out For Delivery') eventType = 'out_for_delivery';
        else if (newStatus === 'Delivered') eventType = 'order_delivered';
        else if (newStatus === 'Cancelled') eventType = 'order_cancelled';
        else if (newStatus === 'Refund Initiated') eventType = 'refund_initiated';
        else if (newStatus === 'Refunded') eventType = 'refund_completed';
        
        if (eventType && data.customer_id) {
            const eventId = `${data.id}_${eventType}`;
            AutomationService.trackEvent(eventId, eventType, data.customer_id, data).catch(err => 
                console.error(`Failed to trigger ${eventType} automation:`, err)
            );
        }

        // Keep legacy trigger if necessary, or remove it in favor of automation engine
        // Keeping it for backwards compatibility if they configured old `notification_settings`
        if (eventType === 'order_shipped' || eventType === 'order_delivered') {
            triggerNotification(supabaseAdmin, eventType, data).catch(err => 
                console.error(`Failed to trigger legacy ${eventType} notification:`, err)
            );
        }
    }

    res.json({ data });
});

async function triggerNotification(supabaseAdmin, eventType, orderData) {
    const { data: setting } = await supabaseAdmin
        .from('notification_settings')
        .select('*')
        .eq('event_type', eventType)
        .eq('is_enabled', true)
        .single();

    if (!setting || !setting.template_name) return;

    let phone = orderData.shipping_details?.phone || orderData.customer_phone || orderData.shipping_address?.phone;
    if (!phone) return;

    phone = phone.startsWith('+') ? phone : `+91${phone}`;

    // Resolve dynamic variables based on mappings
    const mappings = setting.variable_mappings || {};
    const components = [];

    const resolveVariable = (field) => {
      if (!field) return '';
      const addr = orderData.shipping_details || orderData.shipping_address || {};
      switch (field) {
        case 'customer_name': return addr.name || orderData.customer_name || 'Customer';
        case 'order_number': return orderData.id ? orderData.id.split('-')[0].toUpperCase() : 'Order';
        case 'order_date': return orderData.created_at ? new Date(orderData.created_at).toLocaleDateString() : new Date().toLocaleDateString();
        case 'total_amount': return orderData.total ? `₹${orderData.total}` : '';
        case 'payment_status': return orderData.payment_status || 'Pending';
        case 'payment_method': return orderData.payment_method || 'Online';
        case 'delivery_address': return [addr.address_line1, addr.address_line2, addr.city].filter(Boolean).join(', ') || '';
        case 'tracking_number': return orderData.tracking_number || '';
        case 'tracking_url': return orderData.tracking_url || '';
        case 'courier_name': return orderData.courier_name || '';
        case 'support_phone': return '+91 9999999999'; // Replace with actual support phone
        case 'brand_name': return 'Swadyum';
        default: return '';
      }
    };

    // Format components for Meta API
    for (const [compType, vars] of Object.entries(mappings)) {
      if (Object.keys(vars).length === 0) continue;
      
      const parameters = [];
      const sortedIndexes = Object.keys(vars).sort((a, b) => parseInt(a) - parseInt(b));
      
      for (const index of sortedIndexes) {
        const field = vars[index];
        const value = resolveVariable(field) || ' ';
        parameters.push({ type: 'text', text: String(value).substring(0, 1024) });
      }

      if (parameters.length > 0) {
        components.push({
          type: compType.toLowerCase(),
          parameters
        });
      }
    }

    await supabaseAdmin.functions.invoke('send-whatsapp-message', {
        body: {
            phone: phone,
            type: 'template',
            template: {
                name: setting.template_name,
                language: { code: setting.template_language },
                components: components.length > 0 ? components : undefined
            }
        }
    });
}
