import { supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Calculates total weight in kg from order items.
 * If an item lacks weight, uses default 500g.
 */
async function calculateOrderWeight(items) {
    const defaultWeight = 500;
    const multiplier = 1.0;

    let totalWeightGrams = 0;

    for (const item of items) {
        let itemWeightGrams = 0;
        
        // Extract weight from weight_label if available (e.g. "500g", "1kg")
        if (item.weight_label) {
            const label = item.weight_label.toLowerCase();
            if (label.includes('kg')) {
                itemWeightGrams = parseFloat(label.replace('kg', '')) * 1000;
            } else if (label.includes('g')) {
                itemWeightGrams = parseFloat(label.replace('g', ''));
            }
        }
        
        if (isNaN(itemWeightGrams) || itemWeightGrams <= 0) {
            itemWeightGrams = defaultWeight;
        }

        totalWeightGrams += (itemWeightGrams * item.quantity);
    }

    return (totalWeightGrams * multiplier) / 1000.0;
}

/**
 * Auto-selects package dimension preset based on weight.
 */
async function selectPackageDimensions(totalWeightKg) {
    const { data: presets } = await supabaseAdmin
        .from('package_dimension_presets')
        .select('*')
        .order('sort_order', { ascending: true });

    if (!presets || presets.length === 0) {
        return {
            length_cm: 15,
            breadth_cm: 10,
            height_cm: 8
        };
    }

    // Find the first preset that fits the weight
    for (const preset of presets) {
        if (totalWeightKg >= preset.min_weight_kg && totalWeightKg <= preset.max_weight_kg) {
            return preset;
        }
    }

    // If heavier than all, use the largest one
    return presets[presets.length - 1];
}

/**
 * Maps Swadyum order to Velocity payload.
 */
export async function buildVelocityPayload(order, items, warehouse, overrides = {}) {
    const calculatedWeightKg = await calculateOrderWeight(items);
    const preset = await selectPackageDimensions(calculatedWeightKg);

    const length = overrides.length_cm || preset.length_cm;
    const breadth = overrides.breadth_cm || preset.breadth_cm;
    const height = overrides.height_cm || preset.height_cm;
    const weight = overrides.weight_kg || calculatedWeightKg;

    const shippingAddress = order.shipping_address || order.shipping_details || {};
    const billingAddress = order.billing_address || shippingAddress;
    
    // Determine payment method
    let paymentMethod = 'Prepaid';
    const omethod = (order.payment_method || '').toLowerCase();
    if (omethod === 'cod' || omethod === 'cash on delivery') {
        paymentMethod = 'COD';
    }

    // Build items
    const orderItems = items.map(item => ({
        name: item.product_name,
        sku: item.sku || `SKU-${item.product_id}`,
        units: item.quantity,
        selling_price: item.unit_price,
        discount: 0,
        tax: 0,
        hsn: ''
    }));

    const payload = {
        order_id: order.id,
        order_date: new Date(order.created_at).toISOString().split('T')[0],
        billing_customer_name: order.customer_name || shippingAddress.name || 'Customer',
        billing_address: billingAddress.address || billingAddress.house_number || '',
        billing_city: billingAddress.city || '',
        billing_pincode: billingAddress.pin_code || billingAddress.zip || '',
        billing_state: billingAddress.state || '',
        billing_country: billingAddress.country || 'India',
        billing_phone: order.customer_phone || shippingAddress.phone || '9999999999',
        
        shipping_is_billing: true, 
        
        print_label: true,
        order_items: orderItems,
        payment_method: paymentMethod,
        sub_total: order.total,
        cod_collectible: paymentMethod === 'COD' ? order.total : 0,
        
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
        weight: parseFloat(weight),
        
        pickup_location: warehouse.pickup_location,
        warehouse_id: warehouse.velocity_warehouse_id,
        
        request_pickup: overrides.creation_type === 'order_only' ? false : true
    };

    return {
        payload,
        finalDimensions: {
            length_cm: parseFloat(length),
            breadth_cm: parseFloat(breadth),
            height_cm: parseFloat(height),
            weight_kg: parseFloat(weight)
        }
    };
}
