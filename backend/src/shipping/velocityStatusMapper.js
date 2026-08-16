/**
 * Maps Velocity status strings to Swadyum internal statuses and customer-visible statuses.
 */

export function mapVelocityStatus(velocityStatus) {
    const statusLower = (velocityStatus || '').toLowerCase().trim();
    
    // Internal status matches the tracking_history status conventions where possible, 
    // and is used for logic. Customer visible is safe for storefront.
    
    switch (statusLower) {
        case 'order created':
        case 'manifested':
            return { internal: 'shipment_created', customer: 'Preparing shipment' };
            
        case 'awb assigned':
        case 'label generated':
            return { internal: 'ready_to_ship', customer: 'Ready for pickup' };
            
        case 'picked up':
        case 'dispatched':
            return { internal: 'picked_up', customer: 'Picked up' };
            
        case 'in transit':
        case 'shipped':
            return { internal: 'in_transit', customer: 'In transit' };
            
        case 'out for delivery':
            return { internal: 'out_for_delivery', customer: 'Out for delivery' };
            
        case 'delivered':
            return { internal: 'delivered', customer: 'Delivered' };
            
        case 'undelivered':
        case 'ndr':
        case 'delivery failed':
            return { internal: 'delivery_failed', customer: 'Delivery issue' };
            
        case 'rto initiated':
            return { internal: 'rto_initiated', customer: 'Returning to seller' };
            
        case 'rto delivered':
        case 'returned':
            return { internal: 'returned', customer: 'Returned' };
            
        case 'cancelled':
            return { internal: 'cancelled', customer: 'Cancelled' };
            
        case 'lost':
        case 'damaged':
            return { internal: 'lost', customer: 'Delivery issue' };
            
        default:
            // Fallback for unknown status
            return { internal: 'in_transit', customer: 'In transit' };
    }
}
