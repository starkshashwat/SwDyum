import { supabaseAdmin } from '../config/supabaseClient.js';
import { velocityClient } from './velocityClient.js';
import { buildVelocityPayload } from './velocityMapper.js';
import { mapVelocityStatus } from './velocityStatusMapper.js';
import { logger } from '../utils/logger.js';

export const shippingService = {

    async createShipment(orderId, adminId, overrides = {}) {
        // 1. Load order
        const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderErr || !order) {
            throw new Error('Order not found.');
        }

        // 2. Validate
        const pStatus = (order.payment_status || '').toLowerCase();
        const pMethod = (order.payment_method || '').toLowerCase();
        if (pStatus !== 'paid' && pMethod !== 'cod' && pMethod !== 'cash on delivery') {
            throw new Error('Order must be Paid or COD to create a shipment.');
        }

        // 3. Idempotency Check
        const { data: velocityProvider } = await supabaseAdmin
            .from('shipping_providers')
            .select('id')
            .eq('code', 'velocity')
            .single();

        if (!velocityProvider) {
            throw new Error('Velocity provider not found in database.');
        }

        const { data: existingShipment } = await supabaseAdmin
            .from('shipments')
            .select('*')
            .eq('order_id', orderId)
            .eq('provider_id', velocityProvider.id)
            .single();

        if (existingShipment) {
            return existingShipment;
        }

        // 4. Load Warehouse
        let warehouse;
        if (overrides.warehouse_id) {
            const { data } = await supabaseAdmin.from('warehouses').select('*').eq('id', overrides.warehouse_id).single();
            warehouse = data;
        }
        if (!warehouse) {
            const { data } = await supabaseAdmin.from('warehouses').select('*').eq('is_default', true).single();
            warehouse = data;
        }
        if (!warehouse) {
            const { data } = await supabaseAdmin.from('warehouses').select('*').limit(1).single();
            warehouse = data;
        }
        if (!warehouse) {
             throw new Error('No warehouse configured. Please configure a warehouse in Shipping Settings.');
        }

        // 5. Build Payload
        const { payload, finalDimensions } = await buildVelocityPayload(order, order.order_items, warehouse, overrides);

        // 6. Call Velocity API
        const velocityRes = await velocityClient.createForwardOrder(payload, orderId);

        // 7. Extract from response — Velocity wraps data under `payload`
        const vPayload = velocityRes.payload || velocityRes;

        // 8. Insert Shipment
        const shipmentData = {
            order_id: orderId,
            provider_id: velocityProvider.id,
            warehouse_id: warehouse.id,
            velocity_order_id: vPayload.order_id,
            velocity_shipment_id: vPayload.shipment_id,
            awb_code: vPayload.awb_code,
            courier_company_id: vPayload.courier_company_id?.toString(),
            courier_name: vPayload.courier_name,
            payment_method: payload.payment_method,
            cod_collectible: payload.cod_collectible,
            sub_total: payload.sub_total,
            length_cm: finalDimensions.length_cm,
            breadth_cm: finalDimensions.breadth_cm,
            height_cm: finalDimensions.height_cm,
            weight_kg: finalDimensions.weight_kg,
            label_url: vPayload.label_url,
            manifest_url: vPayload.manifest_url,
            velocity_status: 'Order Created',
            internal_status: 'shipment_created',
            customer_visible_status: 'Preparing shipment',
            charges_json: vPayload.charges || {},
            last_synced_at: new Date().toISOString(),
            created_by_admin_id: adminId
        };

        const { data: newShipment, error: insertErr } = await supabaseAdmin
            .from('shipments')
            .insert([shipmentData])
            .select()
            .single();

        if (insertErr) {
            logger.error('Error inserting shipment', { error: insertErr.message });
            throw new Error('Shipment created in Velocity but failed to save in database. AWB: ' + vPayload.awb_code);
        }
        
        // Add initial event
        await supabaseAdmin.from('shipment_events').insert([{
            shipment_id: newShipment.id,
            velocity_status: 'Order Created',
            internal_status: 'shipment_created',
            message: 'Shipment created successfully.'
        }]);

        // 9. Update Order Status
        const historyEntry = {
            status: 'Processing',
            timestamp: new Date().toISOString(),
            note: `Shipment created via Velocity. AWB: ${vPayload.awb_code}`
        };
        const orderHistory = order.tracking_history || [];
        
        await supabaseAdmin
            .from('orders')
            .update({
                status: 'Processing',
                tracking_number: vPayload.awb_code,
                tracking_history: [...orderHistory, historyEntry],
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        return newShipment;
    },

    async processWebhook(rawPayload) {
        // 1. Insert into webhook_events
        const { data: velocityProvider } = await supabaseAdmin.from('shipping_providers').select('id').eq('code', 'velocity').single();
        const { data: webhookEvent } = await supabaseAdmin.from('webhook_events').insert([{
            provider_id: velocityProvider?.id,
            event_type: rawPayload.status || 'unknown',
            awb_code: rawPayload.awb,
            velocity_shipment_id: rawPayload.shipment_id,
            raw_payload_json: rawPayload
        }]).select().single();

        try {
            // 2. Find shipment
            const awbCode = rawPayload.awb;
            if (!awbCode) throw new Error('No AWB code in payload');

            const { data: shipment } = await supabaseAdmin
                .from('shipments')
                .select('*')
                .eq('awb_code', awbCode)
                .single();

            if (!shipment) throw new Error('Shipment not found for AWB ' + awbCode);

            // 3. Map Status
            const velocityStatus = rawPayload.status || 'unknown';
            const mapped = mapVelocityStatus(velocityStatus);

            // 4. Insert shipment_events
            await supabaseAdmin.from('shipment_events').insert([{
                shipment_id: shipment.id,
                velocity_status: velocityStatus,
                internal_status: mapped.internal,
                location: rawPayload.location || rawPayload.city || null,
                message: rawPayload.message || rawPayload.remark || null,
                event_time: rawPayload.timestamp || new Date().toISOString(),
                raw_payload_json: rawPayload
            }]);

            // 5. Update shipments
            await supabaseAdmin.from('shipments').update({
                velocity_status: velocityStatus,
                internal_status: mapped.internal,
                customer_visible_status: mapped.customer,
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }).eq('id', shipment.id);

            // 6. Update orders status based on mapping
            const newOrderStatus = this._mapInternalToOrderStatus(mapped.internal);
            if (newOrderStatus) {
                const { data: order } = await supabaseAdmin.from('orders').select('tracking_history, status').eq('id', shipment.order_id).single();
                if (order && order.status !== newOrderStatus) {
                     const history = order.tracking_history || [];
                     history.push({
                         status: newOrderStatus,
                         timestamp: new Date().toISOString(),
                         note: rawPayload.message || `Velocity status: ${velocityStatus}`
                     });
                     await supabaseAdmin.from('orders').update({
                         status: newOrderStatus,
                         tracking_history: history,
                         updated_at: new Date().toISOString()
                     }).eq('id', shipment.order_id);
                }
            }

            // 7. Mark webhook processed
            await supabaseAdmin.from('webhook_events').update({
                processed: true,
                processed_at: new Date().toISOString()
            }).eq('id', webhookEvent.id);

        } catch (err) {
            logger.error('Error processing Velocity webhook', { error: err.message, payload: rawPayload });
            await supabaseAdmin.from('webhook_events').update({
                processing_error: err.message
            }).eq('id', webhookEvent.id);
        }
    },

    async syncShipmentTracking(shipmentId) {
         const { data: shipment } = await supabaseAdmin
            .from('shipments')
            .select('*')
            .eq('id', shipmentId)
            .single();

         if (!shipment || !shipment.awb_code) return;

         try {
             // Use the correct Velocity tracking API: POST /custom/api/v1/order-tracking
             const res = await velocityClient.getTracking([shipment.awb_code]);

             // Response format: { result: { "<awb>": { tracking_data: { ... } } } }
             const awbResult = res?.result?.[shipment.awb_code];
             if (!awbResult?.tracking_data) {
                 logger.info(`No tracking data returned for AWB ${shipment.awb_code}`);
                 return;
             }

             const trackingData = awbResult.tracking_data;

             // Extract current status from the shipment track info
             const shipmentTrack = trackingData.shipment_track?.[0];
             const velocityStatus = shipmentTrack?.current_status || trackingData.shipment_status;
             
             if (!velocityStatus) return;

             const mapped = mapVelocityStatus(velocityStatus);

             // Process tracking activities into shipment events
             const activities = trackingData.shipment_track_activities || [];
             for (const activity of activities) {
                 // Check if this event already exists (avoid duplicates)
                 const eventKey = `${activity.date}_${activity.activity}_${activity.location || ''}`;
                 const { data: existing } = await supabaseAdmin
                     .from('shipment_events')
                     .select('id')
                     .eq('shipment_id', shipment.id)
                     .eq('velocity_status', activity.activity)
                     .eq('event_time', activity.date)
                     .limit(1);

                 if (!existing || existing.length === 0) {
                     const activityMapped = mapVelocityStatus(activity.activity);
                     await supabaseAdmin.from('shipment_events').insert([{
                         shipment_id: shipment.id,
                         velocity_status: activity.activity,
                         internal_status: activityMapped.internal,
                         location: activity.location || null,
                         message: activity.activity,
                         event_time: activity.date,
                         raw_payload_json: activity
                     }]);
                 }
             }

             // Update shipment with latest status
             await supabaseAdmin.from('shipments').update({
                velocity_status: velocityStatus,
                internal_status: mapped.internal,
                customer_visible_status: mapped.customer,
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
             }).eq('id', shipment.id);
             
             // Update order if needed
             const newOrderStatus = this._mapInternalToOrderStatus(mapped.internal);
             if (newOrderStatus) {
                const { data: order } = await supabaseAdmin.from('orders').select('tracking_history, status').eq('id', shipment.order_id).single();
                if (order && order.status !== newOrderStatus) {
                     const history = order.tracking_history || [];
                     history.push({
                         status: newOrderStatus,
                         timestamp: new Date().toISOString(),
                         note: `Velocity status: ${velocityStatus} (Synced)`
                     });
                     await supabaseAdmin.from('orders').update({
                         status: newOrderStatus,
                         tracking_history: history,
                         updated_at: new Date().toISOString()
                     }).eq('id', shipment.order_id);
                }
             }

         } catch (err) {
             logger.error(`Error syncing shipment tracking ${shipmentId}`, { error: err.message });
         }
    },

    async cancelShipment(shipmentId, adminId) {
        const { data: shipment } = await supabaseAdmin
            .from('shipments')
            .select('*')
            .eq('id', shipmentId)
            .single();

        if (!shipment) throw new Error('Shipment not found.');
        if (!shipment.awb_code) throw new Error('Shipment has no AWB code — cannot cancel.');
        
        if (shipment.internal_status === 'delivered') {
            throw new Error('Cannot cancel a delivered shipment.');
        }
        if (shipment.internal_status === 'cancelled') {
            throw new Error('Shipment is already cancelled.');
        }

        // Call Velocity Cancel API
        await velocityClient.cancelOrder([shipment.awb_code]);

        // Note: Velocity returns "Bulk Shipment cancellation is in progress."
        // The actual cancellation is async. We mark as cancelled locally;
        // the webhook/polling will confirm when Velocity processes it.
        
        await supabaseAdmin.from('shipments').update({
            internal_status: 'cancelled',
            velocity_status: 'Cancellation Requested',
            customer_visible_status: 'Cancelled',
            updated_at: new Date().toISOString()
        }).eq('id', shipmentId);

        // Add event
        await supabaseAdmin.from('shipment_events').insert([{
            shipment_id: shipmentId,
            velocity_status: 'Cancellation Requested',
            internal_status: 'cancelled',
            message: `Cancellation requested by admin.`
        }]);

        // Log
        await supabaseAdmin.from('shipping_action_logs').insert([{
            shipment_id: shipmentId,
            order_id: shipment.order_id,
            action: 'cancelShipment',
            success: true,
            created_by_admin_id: adminId
        }]);
        
        return { success: true, message: 'Cancellation requested. Velocity will process it shortly.' };
    },

    /**
     * Checks serviceability between two pincodes.
     */
    async checkServiceability(toPincode, paymentMode = 'prepaid', shipmentType = 'forward') {
        // Get the default warehouse pincode
        const { data: warehouse } = await supabaseAdmin
            .from('warehouses')
            .select('pincode')
            .eq('is_default', true)
            .single();

        if (!warehouse || !warehouse.pincode) {
            throw new Error('No default warehouse configured with a pincode. Please set up a default warehouse in Shipping Settings.');
        }

        const res = await velocityClient.checkServiceability({
            from: warehouse.pincode,
            to: toPincode,
            payment_mode: paymentMode,
            shipment_type: shipmentType
        });

        // Response: { status: "SUCCESS", result: { serviceability_results: [...], zone: "..." } }
        if (res?.status === 'SUCCESS' && res?.result?.serviceability_results) {
            return {
                serviceable: res.result.serviceability_results.length > 0,
                carriers: res.result.serviceability_results,
                zone: res.result.zone
            };
        }

        return { serviceable: false, carriers: [], zone: null };
    },

    /**
     * Creates a warehouse in Velocity and updates local record.
     */
    async syncWarehouseToVelocity(warehouseId) {
        const { data: warehouse, error } = await supabaseAdmin
            .from('warehouses')
            .select('*')
            .eq('id', warehouseId)
            .single();

        if (error || !warehouse) throw new Error('Warehouse not found.');

        const velocityPayload = {
            name: warehouse.name,
            phone_number: warehouse.phone || '',
            email: warehouse.email || '',
            contact_person: warehouse.name,
            address_attributes: {
                street_address: warehouse.address || '',
                zip: warehouse.pincode || '',
                city: warehouse.city || '',
                state: warehouse.state || '',
                country: warehouse.country || 'India'
            }
        };

        const res = await velocityClient.createWarehouse(velocityPayload);
        const velocityWarehouseId = res?.payload?.warehouse_id;

        if (velocityWarehouseId) {
            await supabaseAdmin.from('warehouses').update({
                velocity_warehouse_id: velocityWarehouseId,
                updated_at: new Date().toISOString()
            }).eq('id', warehouseId);

            return { success: true, velocity_warehouse_id: velocityWarehouseId };
        }

        throw new Error('Velocity did not return a warehouse ID.');
    },

    /**
     * Creates a reverse pickup shipment.
     */
    async createReverseShipment(orderId, adminId, reversePayload) {
        // 1. Load order
        const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .single();

        if (orderErr || !order) throw new Error('Order not found.');

        // 2. Get velocity provider
        const { data: velocityProvider } = await supabaseAdmin
            .from('shipping_providers')
            .select('id')
            .eq('code', 'velocity')
            .single();

        if (!velocityProvider) throw new Error('Velocity provider not found.');

        // 3. Load warehouse (destination for returns)
        let warehouse;
        if (reversePayload.warehouse_id) {
            const { data } = await supabaseAdmin.from('warehouses').select('*').eq('id', reversePayload.warehouse_id).single();
            warehouse = data;
        }
        if (!warehouse) {
            const { data } = await supabaseAdmin.from('warehouses').select('*').eq('is_default', true).single();
            warehouse = data;
        }
        if (!warehouse) throw new Error('No warehouse configured for return delivery.');

        // 4. Build reverse payload per Velocity docs
        const shipping = order.shipping_address || order.shipping_details || {};

        const velocityReversePayload = {
            order_id: `RET-${orderId}`,
            order_date: new Date(order.created_at).toISOString().split('T')[0],
            carrier_id: reversePayload.carrier_id || '',
            
            // Pickup = customer address
            pickup_customer_name: shipping.name || order.customer_name || 'Customer',
            pickup_address: shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', '),
            pickup_city: shipping.city || '',
            pickup_state: shipping.state || '',
            pickup_country: shipping.country || 'India',
            pickup_pincode: shipping.pin_code || shipping.zip || '',
            pickup_phone: shipping.phone || order.customer_phone || '',
            pickup_email: shipping.email || order.customer_email || '',
            
            // Shipping = warehouse (return destination)
            shipping_customer_name: warehouse.name || 'Swadyum Warehouse',
            shipping_address: warehouse.address || '',
            shipping_city: warehouse.city || '',
            shipping_state: warehouse.state || '',
            shipping_country: warehouse.country || 'India',
            shipping_pincode: warehouse.pincode || '',
            shipping_phone: warehouse.phone || '',
            shipping_email: warehouse.email || '',
            
            warehouse_id: warehouse.velocity_warehouse_id || '',
            
            order_items: (order.order_items || []).map(item => ({
                name: item.product_name,
                sku: item.sku || `SKU-${item.product_id}`,
                units: item.quantity,
                selling_price: item.unit_price,
                discount: 0
            })),
            
            payment_method: 'PREPAID',
            sub_total: order.total,
            length: reversePayload.length || 15,
            breadth: reversePayload.breadth || 10,
            height: reversePayload.height || 8,
            weight: reversePayload.weight || 0.5,
            request_pickup: true
        };

        // 5. Call Velocity
        const res = await velocityClient.createReverseOrder(velocityReversePayload, orderId);
        const vPayload = res.payload || res;

        // 6. Save reverse shipment
        const shipmentData = {
            order_id: orderId,
            provider_id: velocityProvider.id,
            warehouse_id: warehouse.id,
            velocity_order_id: vPayload.order_id,
            velocity_shipment_id: vPayload.shipment_id,
            awb_code: vPayload.awb_code,
            courier_company_id: vPayload.courier_company_id?.toString(),
            courier_name: vPayload.courier_name,
            payment_method: 'PREPAID',
            sub_total: order.total,
            length_cm: reversePayload.length || 15,
            breadth_cm: reversePayload.breadth || 10,
            height_cm: reversePayload.height || 8,
            weight_kg: reversePayload.weight || 0.5,
            velocity_status: 'Return Order Created',
            internal_status: 'return_created',
            customer_visible_status: 'Return initiated',
            charges_json: vPayload.charges || {},
            last_synced_at: new Date().toISOString(),
            created_by_admin_id: adminId
        };

        const { data: newShipment, error: insertErr } = await supabaseAdmin
            .from('shipments')
            .insert([shipmentData])
            .select()
            .single();

        if (insertErr) {
            logger.error('Error inserting reverse shipment', { error: insertErr.message });
            throw new Error('Reverse shipment created in Velocity but failed to save locally.');
        }

        // Add event
        await supabaseAdmin.from('shipment_events').insert([{
            shipment_id: newShipment.id,
            velocity_status: 'Return Order Created',
            internal_status: 'return_created',
            message: 'Reverse pickup shipment created.'
        }]);

        return newShipment;
    },

    /**
     * Fetches shipping summary report from Velocity.
     */
    async getShippingReport(startDate, endDate, shipmentType = 'forward') {
        return velocityClient.getReports({
            start_date_time: startDate,
            end_date_time: endDate,
            shipment_type: shipmentType
        });
    },
    
    _mapInternalToOrderStatus(internalStatus) {
        // Map shipping internal status to the orders table status enum
        const map = {
            'shipment_created': 'Processing',
            'ready_to_ship': 'Processing',
            'picked_up': 'Shipped',
            'in_transit': 'Shipped',
            'out_for_delivery': 'Shipped',
            'delivered': 'Delivered',
            'delivery_failed': null, // Don't auto fail order, maybe retry?
            'rto_initiated': null,
            'returned': 'Refunded', // or custom status
            'cancelled': null, // Order might still be valid, just shipment cancelled
            'lost': null,
            'return_created': null
        };
        return map[internalStatus] || null;
    }
};
