import { asyncHandler } from '../utils/asyncHandler.js';
import { shippingService } from './shippingService.js';
import { saveVelocityCredentials } from './credentialManager.js';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { velocityClient } from './velocityClient.js';

// ══════════════════════════════════════════════════════════════════════════════
// Admin Order Actions
// ══════════════════════════════════════════════════════════════════════════════

export const createShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const adminId = req.user.id;
    const overrides = req.body;
    
    const shipment = await shippingService.createShipment(orderId, adminId, overrides);
    res.json({ data: shipment });
});

export const createReverseShipment = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const adminId = req.user.id;
    const reversePayload = req.body;

    const shipment = await shippingService.createReverseShipment(orderId, adminId, reversePayload);
    res.json({ data: shipment });
});

// ══════════════════════════════════════════════════════════════════════════════
// Admin Shipments
// ══════════════════════════════════════════════════════════════════════════════

export const listShipments = asyncHandler(async (req, res) => {
    const { order_id } = req.query;
    let query = supabaseAdmin.from('shipments').select('*');
    if (order_id) {
        query = query.eq('order_id', order_id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: data || [] });
});

export const getShipment = asyncHandler(async (req, res) => {
    const { shipmentId } = req.params;
    const { data, error } = await supabaseAdmin
        .from('shipments')
        .select('*, shipment_events(*)')
        .eq('id', shipmentId)
        .single();
        
    if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Shipment not found' });
        throw error;
    }
    
    // Sort events latest first
    if (data.shipment_events) {
        data.shipment_events.sort((a, b) => new Date(b.event_time) - new Date(a.event_time));
    }
    
    res.json({ data });
});

export const syncShipment = asyncHandler(async (req, res) => {
    const { shipmentId } = req.params;
    await shippingService.syncShipmentTracking(shipmentId);
    res.json({ success: true });
});

export const cancelShipment = asyncHandler(async (req, res) => {
    const { shipmentId } = req.params;
    const adminId = req.user.id;
    const result = await shippingService.cancelShipment(shipmentId, adminId);
    res.json(result);
});

// ══════════════════════════════════════════════════════════════════════════════
// Customer Tracking (Storefront)
// ══════════════════════════════════════════════════════════════════════════════

export const getCustomerTracking = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id; // from requireAuth
    
    // Validate order belongs to user
    const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();
        
    if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    const { data: shipment, error: shipErr } = await supabaseAdmin
        .from('shipments')
        .select('id, awb_code, courier_name, customer_visible_status, shipment_events(event_time, location, customer_visible_status, velocity_status)')
        .eq('order_id', orderId)
        .single();
        
    if (shipErr || !shipment) {
        return res.json({ data: null }); // No tracking yet
    }
    
    // Format timeline for customer
    const timeline = (shipment.shipment_events || []).map(e => ({
        timestamp: e.event_time,
        status: e.customer_visible_status || e.velocity_status,
        location: e.location
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ 
        data: {
            awb_code: shipment.awb_code,
            courier_name: shipment.courier_name,
            status: shipment.customer_visible_status,
            timeline
        }
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// Admin Settings — Credentials
// ══════════════════════════════════════════════════════════════════════════════

export const saveCredentials = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const adminId = req.user.id;
    
    await saveVelocityCredentials(username, password, adminId);
    res.json({ success: true });
});

export const getCredentialStatus = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('shipping_credentials')
        .select('key_last_four, test_status, last_tested_at, updated_by_admin_id')
        .eq('active', true)
        .single();
        
    if (error) {
        if (error.code === 'PGRST116') return res.json({ data: { status: 'not_configured' }});
        throw error;
    }

    let updatedByAdminName = null;
    if (data.updated_by_admin_id) {
        try {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('name')
                .eq('id', data.updated_by_admin_id)
                .single();
            if (profile) updatedByAdminName = profile.name;
        } catch (e) {
            // ignore if profile not found
        }
    }
    
    res.json({ data: {
        key_masked: `••••••${data.key_last_four}`,
        test_status: data.test_status,
        last_tested_at: data.last_tested_at,
        updated_by: updatedByAdminName
    }});
});

export const testApiConnection = asyncHandler(async (req, res) => {
    const result = await velocityClient.testConnection();
    res.json(result);
});

// ══════════════════════════════════════════════════════════════════════════════
// Admin Settings — Warehouses
// ══════════════════════════════════════════════════════════════════════════════

export const listWarehouses = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('warehouses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
});

export const saveWarehouse = asyncHandler(async (req, res) => {
    if (req.body.is_default) {
        await supabaseAdmin.from('warehouses').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    }
    const { data, error } = await supabaseAdmin.from('warehouses').insert([req.body]).select().single();
    if (error) throw error;
    res.json({ data });
});

export const updateWarehouse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.body.is_default) {
        await supabaseAdmin.from('warehouses').update({ is_default: false }).neq('id', id);
    }
    const { data, error } = await supabaseAdmin.from('warehouses').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ data });
});

export const syncWarehouseToVelocity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await shippingService.syncWarehouseToVelocity(id);
    res.json(result);
});

// ══════════════════════════════════════════════════════════════════════════════
// Admin Settings — Dimension Presets
// ══════════════════════════════════════════════════════════════════════════════

export const listDimensionPresets = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('package_dimension_presets').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ data });
});

export const saveDimensionPreset = asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin.from('package_dimension_presets').insert([req.body]).select().single();
    if (error) throw error;
    res.json({ data });
});

export const updateDimensionPreset = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin.from('package_dimension_presets').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ data });
});

export const deleteDimensionPreset = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('package_dimension_presets').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// Serviceability Check (Public — used by storefront checkout)
// ══════════════════════════════════════════════════════════════════════════════

export const checkServiceability = asyncHandler(async (req, res) => {
    const { pincode, payment_mode, shipment_type } = req.body;
    
    if (!pincode || pincode.length !== 6) {
        return res.status(400).json({ error: 'A valid 6-digit pincode is required.' });
    }

    const result = await shippingService.checkServiceability(
        pincode,
        payment_mode || 'prepaid',
        shipment_type || 'forward'
    );

    res.json({ data: result });
});

// ══════════════════════════════════════════════════════════════════════════════
// Shipping Reports (Admin)
// ══════════════════════════════════════════════════════════════════════════════

export const getShippingReport = asyncHandler(async (req, res) => {
    const { start_date, end_date, shipment_type } = req.body;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'start_date and end_date are required.' });
    }

    const result = await shippingService.getShippingReport(start_date, end_date, shipment_type || 'forward');
    res.json({ data: result });
});
