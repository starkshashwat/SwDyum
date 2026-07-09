// ════════════════════════════════════════════════════════════════════════════
// orderUtils.js — shared helpers for the admin Orders UI
// Used by OrdersManager.jsx (and any future order views) to avoid duplicating
// status colors, customer-info extraction, and CSV export logic.
// ═════════════════════════════════════════════════════════════════════════════

import { format } from 'date-fns';

// Canonical status lists used across the admin orders UI.
export const ORDER_STATUSES = [
    'Pending', 'Confirmed', 'Packed', 'Ready to Ship', 'Shipped',
    'Out for Delivery', 'Delivered', 'Cancelled', 'Returned', 'Refunded',
];

export const PAYMENT_STATUSES = [
    'Paid', 'Pending', 'Authorized', 'Failed', 'Refunded', 'Partially Refunded',
];

// Summary-card status groups (each card maps to one or more order statuses).
export const STATUS_CARDS = [
    { key: 'Pending', label: 'Pending', orderStatuses: ['Pending'], color: 'yellow' },
    { key: 'Confirmed', label: 'Confirmed', orderStatuses: ['Confirmed', 'Packed', 'Ready to Ship'], color: 'blue' },
    { key: 'Shipped', label: 'Shipped', orderStatuses: ['Shipped', 'Out for Delivery'], color: 'purple' },
    { key: 'Delivered', label: 'Delivered', orderStatuses: ['Delivered'], color: 'green' },
    { key: 'Failed', label: 'Failed / Abandoned', orderStatuses: ['Cancelled'], paymentStatuses: ['Failed'], color: 'red' },
    { key: 'Refunded', label: 'Refunded', orderStatuses: ['Returned', 'Refunded'], color: 'gray' },
];

// Tailwind classes for order status pills.
export function getOrderStatusColor(status) {
    const colors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Confirmed': 'bg-blue-100 text-blue-800',
        'Packed': 'bg-indigo-100 text-indigo-800',
        'Ready to Ship': 'bg-cyan-100 text-cyan-800',
        'Shipped': 'bg-purple-100 text-purple-800',
        'Out for Delivery': 'bg-orange-100 text-orange-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Returned': 'bg-pink-100 text-pink-800',
        'Refunded': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Tailwind classes for payment status pills + a dot color for compact list rows.
export function getPaymentStatusColor(status) {
    const colors = {
        'Paid': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Authorized': 'bg-blue-100 text-blue-800',
        'Failed': 'bg-red-100 text-red-800',
        'Refunded': 'bg-gray-100 text-gray-800',
        'Partially Refunded': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentDotColor(status) {
    const dots = {
        'Paid': 'bg-green-500',
        'Pending': 'bg-yellow-500',
        'Authorized': 'bg-blue-500',
        'Failed': 'bg-red-500',
        'Refunded': 'bg-gray-400',
        'Partially Refunded': 'bg-orange-500',
    };
    return dots[status] || 'bg-gray-400';
}

// Extract a normalized customer info object from an order row.
export function getCustomerInfo(order) {
    const shipping = order.shipping_details || {};
    return {
        name: order.customer_name || shipping.name || 'Guest',
        email: order.customer_email || shipping.email || '',
        phone: order.customer_phone || shipping.phone || '',
    };
}

// Avatar initial for the customer (first letter of the name).
export function getCustomerInitial(order) {
    const name = getCustomerInfo(order).name || '?';
    return name.charAt(0).toUpperCase();
}

// Relative-time formatter ("2m ago", "3h ago", "2d ago").
export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return format(new Date(dateStr), 'dd MMM yyyy');
}

// Format an INR amount with grouping.
export function formatINR(amount) {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

// Export an array of orders to a CSV file (browser download).
export function exportOrdersCSV(orders) {
    if (!orders || orders.length === 0) return;
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment Status', 'Order Status', 'Coupon'];
    const rows = orders.map((o) => {
        const c = getCustomerInfo(o);
        return [
            o.id,
            format(new Date(o.created_at), 'dd-MMM-yyyy'),
            c.name, c.email, c.phone,
            o.total, o.payment_status || 'Pending', o.order_status || 'Pending',
            o.coupon_code || '',
        ];
    });
    const csv = [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Copy text to the clipboard (returns true on success).
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
