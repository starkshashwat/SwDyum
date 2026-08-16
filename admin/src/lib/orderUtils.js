// ════════════════════════════════════════════════════════════════════════════
// orderUtils.js — shared helpers for the admin Orders UI
// Used by OrdersManager.jsx to avoid duplicating status colors, customer-info
// extraction, and CSV export logic.
//
// Status enums here mirror the backend zod enums in
// backend/src/validators/order.schema.js (which in turn mirror the CHECK
// constraints on the `orders` table in
// migrations/v2_normalized_schema/003_commerce.sql):
//   order status:   Pending, Paid, Processing, Shipped, Delivered, Cancelled,
//                   Failed, Refunded
//   payment status: Pending, Paid, Failed, Refunded
// ═════════════════════════════════════════════════════════════════════════════

import { format } from 'date-fns';

// Canonical status lists — must match backend/src/validators/order.schema.js.
export const ORDER_STATUSES = [
    'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered',
    'Cancelled', 'Failed', 'Refunded',
];

export const PAYMENT_STATUSES = [
    'Pending', 'Paid', 'Failed', 'Refunded',
];

export const STATUS_CARDS = [
    { key: 'Pending', label: 'Pending Payment', orderStatuses: ['Pending'], color: 'yellow' },
    { key: 'Paid', label: 'Paid / New', orderStatuses: ['Paid'], color: 'blue' },
    { key: 'Processing', label: 'Processing', orderStatuses: ['Processing'], color: 'indigo' },
    { key: 'Shipped', label: 'Shipped', orderStatuses: ['Shipped'], color: 'purple' },
    { key: 'Delivered', label: 'Delivered', orderStatuses: ['Delivered'], color: 'green' },
    { key: 'Cancelled', label: 'Cancelled / Failed', orderStatuses: ['Cancelled', 'Failed'], color: 'red' },
];

// Tailwind classes for order status pills.
export function getOrderStatusColor(status) {
    const colors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Paid': 'bg-blue-100 text-blue-800',
        'Processing': 'bg-indigo-100 text-indigo-800',
        'Shipped': 'bg-purple-100 text-purple-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Failed': 'bg-red-100 text-red-800',
        'Refunded': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Tailwind classes for payment status pills + a dot color for compact list rows.
export function getPaymentStatusColor(status) {
    const colors = {
        'Paid': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Failed': 'bg-red-100 text-red-800',
        'Refunded': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentDotColor(status) {
    const dots = {
        'Paid': 'bg-green-500',
        'Pending': 'bg-yellow-500',
        'Failed': 'bg-red-500',
        'Refunded': 'bg-gray-400',
    };
    return dots[status] || 'bg-gray-400';
}

// Extract a normalized customer info object from an order row.
// The new `orders` table stores customer fields directly (customer_name,
// customer_email, customer_phone) plus a shipping_address JSONB blob.
export function getCustomerInfo(order) {
    const shipping = order.shipping_address || order.shipping_details || {};
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
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    try {
        return format(d, 'dd MMM yyyy');
    } catch {
        return '—';
    }
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
            o.total, o.payment_status || 'Pending', o.status || 'Pending',
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
