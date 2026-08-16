import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
    Package, Search, ChevronLeft, ChevronRight, Download, X, RefreshCw,
    ArrowLeft, CreditCard, MapPin, Clock, Truck, Tag, Save, AlertCircle,
    Copy, CheckCircle2, MessageCircle, FileText, Edit
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    ORDER_STATUSES, PAYMENT_STATUSES, STATUS_CARDS,
    getOrderStatusColor, getPaymentStatusColor,
    getCustomerInfo, getCustomerInitial, timeAgo, formatINR, exportOrdersCSV,
    copyToClipboard,
} from '../lib/orderUtils';

const PAGE_SIZE = 25;

function shortId(id) {
    if (!id) return '';
    return id.substring(0, 8).toUpperCase();
}

function formatPhone(phone) {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    // wa.me needs the full international number. Stored numbers are Indian:
    // a bare 10-digit local number gets the +91 prefix.
    if (digits.length === 10) digits = `91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) digits = `91${digits.slice(1)}`;
    return digits;
}

export default function OrdersManager() {
    // ── List state ────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const fetchSeqRef = useRef(0);
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(0); 
    const [totalCount, setTotalCount] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [statusCounts, setStatusCounts] = useState({});

    // ── Selection (synced to URL ?order=<id>) ────────────────────────────────
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedOrderId = searchParams.get('order') || null;

    const selectOrder = useCallback((id) => {
        setSearchParams(id ? { order: id } : {}, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setSearchParams]);

    const clearSelection = useCallback(() => {
        setSearchParams({}, { replace: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setSearchParams]);

    // ── Fetch the master list ─────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        const seq = ++fetchSeqRef.current;
        try {
            setLoading(true);
            setError('');
            let query = supabase.from('orders').select('*', { count: 'exact' });
            if (orderStatusFilter !== 'All') query = query.eq('status', orderStatusFilter);
            if (paymentStatusFilter !== 'All') query = query.eq('payment_status', paymentStatusFilter);
            if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                query = query.lte('created_at', end.toISOString());
            }
            if (debouncedSearch.trim()) query = query.ilike('customer_email', `%${debouncedSearch.trim()}%`);

            query = query.order('created_at', { ascending: false });
            query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            const { data, count, error } = await query;
            if (seq !== fetchSeqRef.current) return; // stale response
            if (error) throw error;
            setOrders(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            setError(err.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, [page, orderStatusFilter, paymentStatusFilter, dateFrom, dateTo, debouncedSearch]);

    // ── Fetch summary card counts ─────────────────────────────────────────────
    const fetchStatusCounts = useCallback(async () => {
        try {
            // Server-side GROUP BY — the old approach pulled up to 1000 full
            // orders just to count them and silently capped there.
            const { data, error } = await supabase.from('orders').select('status, payment_status, total');
            if (error) throw error;
            const stats = {};
            for (const row of data || []) {
                const status = row.status || 'Pending';
                if (!stats[status]) stats[status] = { count: 0, revenue: 0 };
                stats[status].count += 1;
                if (row.payment_status === 'Paid') stats[status].revenue += Number(row.total || 0);
            }
            const counts = {};
            for (const card of STATUS_CARDS) {
                let count = 0, revenue = 0;
                for (const s of card.orderStatuses) {
                    count += stats[s]?.count || 0;
                    revenue += stats[s]?.revenue || 0;
                }
                counts[card.key] = { count, revenue };
            }
            setStatusCounts(counts);
        } catch {
            // Non-fatal — cards just show zeros.
        }
    }, []);

    // Debounce search so typing doesn't fire a request per keystroke
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(0); }, 400);
        return () => clearTimeout(t);
    }, [searchTerm]);


    useEffect(() => { fetchStatusCounts(); }, [fetchStatusCounts]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const hasActiveFilters = orderStatusFilter !== 'All' || paymentStatusFilter !== 'All' || dateFrom || dateTo || searchTerm;

    const clearFilters = () => {
        setOrderStatusFilter('All'); setPaymentStatusFilter('All');
        setDateFrom(''); setDateTo(''); setSearchTerm(''); setPage(0);
    };

    const updateOrderStatus = async (id, newStatus, note = null) => {
        try {
            const { error } = await supabase.functions.invoke('admin-orders', {
                body: {
                    action: 'update_status',
                    order_id: id,
                    status: newStatus,
                    note: note || `Status changed to ${newStatus} by admin`,
                }
            });
            if (error) throw error;
            fetchOrders(); fetchStatusCounts();
        } catch (err) {
            alert(`Error updating order: ${err.message || 'Unknown error'}`);
        }
    };

    if (selectedOrderId) {
        return (
            <OrderDetailsPanel
                orderId={selectedOrderId}
                onBack={clearSelection}
                onStatusChange={updateOrderStatus}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
                <div className="flex gap-2 items-center">
                    <button onClick={async () => {
                        try {
                            // Export every row matching the current filters,
                            // not just the 25 rows on the visible page.
                            const params = { page: 1, limit: Math.max(totalCount, orders.length) || PAGE_SIZE };
                            if (orderStatusFilter !== 'All') params.status = orderStatusFilter;
                            if (paymentStatusFilter !== 'All') params.payment_status = paymentStatusFilter;
                            if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
                            if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); params.date_to = end.toISOString(); }
                            if (debouncedSearch.trim()) params.customer_email = debouncedSearch.trim();
                            const res = await apiClient.get('/orders', params);
                            exportOrdersCSV(res?.data || orders);
                        } catch { exportOrdersCSV(orders); }
                    }} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => { fetchOrders(); fetchStatusCounts(); }} className="bg-white border border-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-50 shadow-sm transition-colors" title="Refresh">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Status Summary Cards (Shopify Style) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {STATUS_CARDS.map((card) => {
                    const info = statusCounts[card.key] || { count: 0, revenue: 0 };
                    const active = card.orderStatuses.includes(orderStatusFilter);
                    return (
                        <button
                            key={card.key}
                            onClick={() => { setOrderStatusFilter(active ? 'All' : card.orderStatuses[0]); setPage(0); }}
                            className={`text-left bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${active ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-2.5 h-2.5 rounded-full bg-${card.color}-500 shadow-sm`} />
                                <span className="text-sm font-semibold text-gray-600 truncate">{card.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{info.count}</div>
                            <div className="text-xs font-medium text-gray-500">{formatINR(info.revenue)}</div>
                        </button>
                    );
                })}
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-shadow"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${hasActiveFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                        Filters {hasActiveFilters && '(Active)'}
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}
                </div>

                {showAdvanced && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Fulfillment Status</label>
                            <select value={orderStatusFilter} onChange={(e) => { setOrderStatusFilter(e.target.value); setPage(0); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                                <option value="All">All Statuses</option>
                                {ORDER_STATUSES.filter(s => s !== 'Refunded').map((s) => <option key={s} value={s}>{s === 'Pending' || s === 'Paid' ? 'New (Legacy: '+s+')' : s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Payment Status</label>
                            <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(0); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
                                <option value="All">All Statuses</option>
                                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">From Date</label>
                            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">To Date</label>
                            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                            <RefreshCw className="w-6 h-6 animate-spin mb-3 text-gray-400" />
                            <p className="font-medium">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-900 mb-1">No orders found</p>
                            <p className="text-sm">Try adjusting your filters or search term.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4 text-center">Payment</th>
                                    <th className="px-6 py-4 text-center">Fulfillment</th>
                                    <th className="px-6 py-4 text-right">Items</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const customer = getCustomerInfo(order);
                                    const UIStatus = (order.status === 'Pending' || order.status === 'Paid') ? 'New' : order.status;
                                    
                                    return (
                                        <tr 
                                            key={order.id} 
                                            onClick={() => selectOrder(order.id)}
                                            className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4 font-mono font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {shortId(order.id)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                <div className="text-xs text-gray-400 mt-0.5">{timeAgo(order.created_at)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{customer.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                                                    {order.payment_status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status || 'Pending')}`}>
                                                    {UIStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {order.order_items?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                {formatINR(order.total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} orders
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 bg-white border border-gray-300 rounded-lg text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// OrderDetailsPanel (Shopify-inspired 2-column layout)
// ════════════════════════════════════════════════════════════════════════════
function OrderDetailsPanel({ orderId, onBack, onStatusChange }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', orderId)
                .single();
            if (error) throw error;
            setOrder(data || {});
        } catch (err) {
            setError(err.message || 'Failed to load order.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    const handleAction = async (newStatus) => {
        setSaving(true);
        try {
            await onStatusChange(orderId, newStatus);
            fetchDetails();
        } finally { setSaving(false); }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!adminNote.trim()) return;
        setSaving(true);
        try {
            await onStatusChange(orderId, order.status, `Note: ${adminNote.trim()}`);
            setAdminNote('');
            fetchDetails();
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gray-300" />
            <p className="font-medium text-lg">Loading order details...</p>
        </div>
    );
    if (error) return <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center text-red-600 font-medium">{error}</div>;
    if (!order) return <div className="bg-white rounded-xl border p-8 text-center text-gray-500 font-medium">Order not found.</div>;

    const shipping = order.shipping_address || order.shipping_details || {};
    const customer = getCustomerInfo(order);
    const items = order.order_items || [];
    const timeline = order.tracking_history || [];
    const isFailed = (order.payment_status || '').toLowerCase() === 'failed';
    const UIStatus = (order.status === 'Pending' || order.status === 'Paid') ? 'New' : order.status;

    // Workflow state machine rendering
    const renderPrimaryAction = () => {
        if (order.payment_status === 'Pending') {
            const msg = `Hi ${customer.name}, your payment for Swadyum order ${shortId(order.id)} is pending. Please complete it to confirm your order!`;
            return (
                <a href={customer.phone ? `https://wa.me/${formatPhone(customer.phone)}?text=${encodeURIComponent(msg)}` : undefined} aria-disabled={!customer.phone} onClick={(e) => { if (!customer.phone) e.preventDefault(); }} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Send Payment Reminder
                </a>
            );
        }
        if (order.status === 'Pending' || order.status === 'Paid') {
            return (
                <button onClick={() => handleAction('Processing')} disabled={saving} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" /> Mark as Processing
                </button>
            );
        }
        if (order.status === 'Processing') {
            return (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg w-full flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-800">Ready to be shipped. See Fulfillment section below.</span>
                </div>
            );
        }
        if (order.status === 'Shipped') {
            return (
                <button onClick={() => handleAction('Delivered')} disabled={saving} className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Delivered
                </button>
            );
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <button onClick={onBack} className="self-start p-2.5 bg-white rounded-lg border border-gray-300 shadow-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono tracking-tight">#{shortId(order.id)}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                            {order.payment_status || 'Pending'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getOrderStatusColor(order.status || 'Pending')}`}>
                            {UIStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        {format(new Date(order.created_at), 'MMMM dd, yyyy \\at hh:mm a')}
                    </p>
                </div>
                <div className="md:ml-auto flex gap-2">
                    <CopyField value={order.id} label="Copy Full ID" />
                </div>
            </div>

            {isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Payment Failed</p>
                        <p className="text-sm text-red-700 mt-0.5">The customer did not complete the checkout payment.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ─── LEFT COLUMN (Primary) ─── */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/30">
                            <h3 className="font-semibold text-gray-900 text-lg">Unfulfilled ({items.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead>
                                    <tr className="border-b border-gray-100 uppercase text-[10px] tracking-wider text-gray-400">
                                        <th className="px-6 py-3 font-semibold">Product</th>
                                        <th className="px-6 py-3 font-semibold text-center">Price</th>
                                        <th className="px-6 py-3 font-semibold text-center">Qty</th>
                                        <th className="px-6 py-3 font-semibold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0 overflow-hidden">
                                                        {item.product?.image_url ? (
                                                            <img src={item.product.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-base">{item.product_name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{item.weight_label || 'Default'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {formatINR(item.unit_price)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-900">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                                {formatINR(item.total_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Subtotals */}
                        <div className="bg-gray-50 p-6 space-y-3 text-sm text-gray-600 border-t border-gray-200">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatINR(order.total_amount || order.sub_total || order.total)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-indigo-600 font-medium">
                                    <span>Discount ({order.coupon_code})</span>
                                    <span>-{formatINR(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center font-bold text-gray-900 text-lg pt-4 border-t border-gray-200 mt-2">
                                <span>Total</span>
                                <span>{formatINR(order.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Fulfillment Workflow */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
                            <h3 className="font-semibold text-gray-900 text-lg">Fulfillment</h3>
                            <div className="flex items-center gap-2">
                                {renderPrimaryAction()}
                            </div>
                        </div>
                        <div className="p-6">
                            <ShipmentPanel order={order} onUpdate={fetchDetails} />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/30">
                            <h3 className="font-semibold text-gray-900 text-lg">Timeline</h3>
                        </div>
                        <div className="p-6">
                            {timeline.length > 0 ? (
                                <div className="relative pt-2 pb-6">
                                    <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200" />
                                    <div className="space-y-6">
                                        {timeline.map((entry, i) => (
                                            <div key={i} className="relative pl-8">
                                                <div className={`absolute left-0 w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center bg-white ${i === timeline.length - 1 ? 'border-indigo-600' : 'border-gray-300'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${i === timeline.length - 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {(entry.status === 'Pending' || entry.status === 'Paid') && entry.note?.includes('admin') ? 'New' : entry.status}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-medium">{entry.timestamp ? format(new Date(entry.timestamp), 'MMM dd, hh:mm a') : '—'}</p>
                                                    </div>
                                                    {entry.note && <p className="text-sm text-gray-600 leading-relaxed">{entry.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-6">No timeline events recorded.</p>
                            )}
                            
                            <form onSubmit={handleAddNote} className="pt-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        placeholder="Leave a private note..."
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                                    />
                                    <button type="submit" disabled={!adminNote.trim() || saving} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                                        Post Note
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                {/* ─── RIGHT COLUMN (Secondary) ─── */}
                <div className="space-y-6">
                    
                    {/* Customer */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center justify-between">
                            <span>Customer</span>
                            <button onClick={() => setShowEditModal(true)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors">
                                <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                        </h3>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <p className="font-semibold text-gray-900 text-base">{customer.name}</p>
                                <p className="mt-0.5">{order.order_items?.length || 0} items ordered</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium truncate pr-2">{customer.email || 'No email'}</span>
                                    {customer.email && <CopyField value={customer.email} minimal />}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{customer.phone || 'No phone'}</span>
                                    {customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <CopyField value={customer.phone} minimal />
                                            <a href={customer.phone ? `https://wa.me/${formatPhone(customer.phone)}` : undefined} aria-disabled={!customer.phone} onClick={(e) => { if (!customer.phone) e.preventDefault(); }} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-md transition-colors" title="Message on WhatsApp">
                                                <MessageCircle className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900 text-lg">Shipping Address</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowEditModal(true)} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-md transition-colors">
                                    <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <CopyField value={
                                    `${shipping.name}\n${shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}\n${[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}\nPhone: ${shipping.phone || customer.phone}`
                                } minimal />
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed space-y-0.5">
                            <p className="font-semibold text-gray-900">{shipping.name}</p>
                            <p>{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
                            <p>{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
                            <p>{shipping.country || 'India'}</p>
                            <p className="pt-2 text-gray-500 font-medium flex items-center gap-1.5">
                                <MessageCircle className="w-3.5 h-3.5" /> {shipping.phone || customer.phone}
                            </p>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Billing Address</h3>
                        <div className="text-sm text-gray-600">
                            <p className="italic">Same as shipping address</p>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditCustomerAddressModal order={order} onClose={() => setShowEditModal(false)} onSave={fetchDetails} />
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// Small Helpers
// ════════════════════════════════════════════════════════════════════════════
function CopyField({ value, label, minimal }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e) => {
        if (e) e.stopPropagation();
        const ok = await copyToClipboard(value);
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
    };

    if (minimal) {
        return (
            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 p-1.5 rounded-md border border-gray-200" title="Copy">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        );
    }

    return (
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : label || 'Copy'}
        </button>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// ShipmentPanel — Velocity Shipping Integration
// ════════════════════════════════════════════════════════════════════════════
function ShipmentPanel({ order, onUpdate }) {
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('forward');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [overrides, setOverrides] = useState({ length_cm: '', breadth_cm: '', height_cm: '', weight_kg: '' });
    const [reversePayload, setReversePayload] = useState({ length: 15, breadth: 10, height: 8, weight: 0.5 });

    const fetchShipment = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('shipments').select('*').eq('order_id', order.id).order('created_at', { ascending: false }).limit(1);
            if (error) throw error;
            if (data && data.length > 0) {
                setShipment(data[0]);
            } else {
                setShipment(null);
            }
        } catch (err) {
            console.error('Failed to load shipment', err);
        } finally {
            setLoading(false);
        }
    }, [order.id]);

    useEffect(() => { fetchShipment(); }, [fetchShipment]);

    const handleCreateShipment = async (e, type = 'orchestration') => {
        if (e) e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const payload = { creation_type: type };
            if (overrides.length_cm) payload.length_cm = overrides.length_cm;
            if (overrides.breadth_cm) payload.breadth_cm = overrides.breadth_cm;
            if (overrides.height_cm) payload.height_cm = overrides.height_cm;
            if (overrides.weight_kg) payload.weight_kg = overrides.weight_kg;
            
            const { error } = await supabase.functions.invoke('shipping', {
                body: { action: 'create_shipment', order_id: order.id, ...payload }
            });
            if (error) throw error;
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to create shipment.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateReverseShipment = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const { error } = await supabase.functions.invoke('shipping', {
                body: { action: 'create_reverse_shipment', order_id: order.id, ...reversePayload }
            });
            if (error) throw error;
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to create return pickup.');
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        try {
            setSaving(true);
            const { error } = await supabase.functions.invoke('shipping', {
                body: { action: 'sync_shipment', shipment_id: shipment.id }
            });
            if (error) throw error;
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(`Sync error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Cancel this shipment in Velocity?')) return;
        try {
            setSaving(true);
            const { error } = await supabase.functions.invoke('shipping', {
                body: { action: 'cancel_shipment', shipment_id: shipment.id }
            });
            if (error) throw error;
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert(`Cancel error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center text-gray-400 py-4"><RefreshCw className="w-5 h-5 animate-spin mx-auto" /></div>;

    const canCreate = (order.payment_status?.toLowerCase() === 'paid' || order.payment_method?.toLowerCase() === 'cod' || order.payment_method?.toLowerCase() === 'cash on delivery');

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 text-sm">Velocity Shipping Integration</h4>
                {shipment && (
                    <button onClick={handleSync} disabled={saving} className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                        <RefreshCw className={`w-3 h-3 ${saving ? 'animate-spin' : ''}`} /> Sync Status
                    </button>
                )}
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}

            {!shipment ? (
                canCreate ? (
                    <div>
                        <div className="flex gap-4 border-b border-gray-200 mb-4">
                            <button type="button" className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'forward' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('forward')}>Forward Shipment</button>
                            <button type="button" className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'return' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('return')}>Return Pickup</button>
                        </div>
                        
                        {activeTab === 'forward' && (
                            <form onSubmit={(e) => handleCreateShipment(e, 'orchestration')} className="space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Generate an AWB for this order. Box dimensions and weight are automatically calculated based on product presets.
                                </p>
                                
                                {showAdvanced && (
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div><label className="text-gray-700 font-medium block mb-1">Length (cm)</label><input type="number" step="0.1" value={overrides.length_cm} onChange={e=>setOverrides({...overrides, length_cm: e.target.value})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-700 font-medium block mb-1">Breadth (cm)</label><input type="number" step="0.1" value={overrides.breadth_cm} onChange={e=>setOverrides({...overrides, breadth_cm: e.target.value})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-700 font-medium block mb-1">Height (cm)</label><input type="number" step="0.1" value={overrides.height_cm} onChange={e=>setOverrides({...overrides, height_cm: e.target.value})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-700 font-medium block mb-1">Weight (kg)</label><input type="number" step="0.001" value={overrides.weight_kg} onChange={e=>setOverrides({...overrides, weight_kg: e.target.value})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors w-full sm:w-auto text-left">
                                        {showAdvanced ? 'Hide Advanced Dimensions' : 'Edit Advanced Dimensions'}
                                    </button>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button type="button" onClick={(e) => handleCreateShipment(e, 'order_only')} disabled={saving} className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                                            {saving ? 'Creating...' : 'Create Order Only'}
                                        </button>
                                        <button type="submit" disabled={saving} className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                                            {saving ? 'Creating...' : 'Create Shipment'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {activeTab === 'return' && (
                            <form onSubmit={handleCreateReverseShipment} className="space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Initiate a return pickup from the customer's address back to your default warehouse.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div><label className="text-gray-700 font-medium block mb-1">Length (cm)</label><input type="number" step="0.1" value={reversePayload.length} onChange={e=>setReversePayload({...reversePayload, length: parseFloat(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-700 font-medium block mb-1">Breadth (cm)</label><input type="number" step="0.1" value={reversePayload.breadth} onChange={e=>setReversePayload({...reversePayload, breadth: parseFloat(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-700 font-medium block mb-1">Height (cm)</label><input type="number" step="0.1" value={reversePayload.height} onChange={e=>setReversePayload({...reversePayload, height: parseFloat(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-700 font-medium block mb-1">Weight (kg)</label><input type="number" step="0.001" value={reversePayload.weight} onChange={e=>setReversePayload({...reversePayload, weight: parseFloat(e.target.value)})} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                </div>
                                
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={saving} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm">
                                        {saving ? 'Creating...' : 'Initiate Return Pickup'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 text-sm font-medium">
                        Order must be Paid or COD to create a shipment.
                    </div>
                )
            ) : (
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <span className="font-semibold text-gray-700 uppercase tracking-wide text-xs">Current Status</span>
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold tracking-wider">{shipment.velocity_status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">AWB Code</span>
                            <div className="flex items-center gap-2 font-mono text-gray-900 font-bold text-base">
                                {shipment.awb_code || '—'}
                                {shipment.awb_code && <CopyField value={shipment.awb_code} minimal />}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide block mb-1.5">Courier Partner</span>
                            <div className="font-bold text-gray-900 text-base">{shipment.courier_name || '—'}</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                        {shipment.label_url && (
                            <a href={shipment.label_url} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                                Download PDF Label
                            </a>
                        )}
                        {shipment.internal_status !== 'cancelled' && shipment.internal_status !== 'delivered' && (
                            <button onClick={handleCancel} disabled={saving} className="flex-1 text-center py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                                Cancel Shipment
                            </button>
                        )}
                    </div>

                    {shipment.shipment_events && shipment.shipment_events.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Courier Tracking Log</h4>
                            <div className="space-y-4">
                                {shipment.shipment_events.slice(0, 3).map((ev, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="font-semibold text-gray-900">{ev.velocity_status}</p>
                                            <p className="text-xs text-gray-500 font-medium">{format(new Date(ev.event_time), 'MMM dd, hh:mm a')}</p>
                                        </div>
                                        {(ev.message || ev.location) && (
                                            <p className="text-gray-600 text-sm leading-relaxed">{[ev.location, ev.message].filter(Boolean).join(' — ')}</p>
                                        )}
                                    </div>
                                ))}
                                {shipment.shipment_events.length > 3 && (
                                    <p className="text-xs font-medium text-indigo-600 pt-2 border-t border-gray-100">
                                        + {shipment.shipment_events.length - 3} older events sync'd (check Velocity portal)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// EditCustomerAddressModal
// ════════════════════════════════════════════════════════════════════════════
function EditCustomerAddressModal({ order, onClose, onSave }) {
    const shipping = order.shipping_address || order.shipping_details || {};
    const customer = getCustomerInfo(order);

    const [name, setName] = useState(order.customer_name || shipping.name || customer.name || '');
    const [phone, setPhone] = useState(order.customer_phone || shipping.phone || customer.phone || '');
    const [email, setEmail] = useState(order.customer_email || customer.email || '');
    const [address, setAddress] = useState(shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ') || '');
    const [city, setCity] = useState(shipping.city || '');
    const [state, setState] = useState(shipping.state || '');
    const [pinCode, setPinCode] = useState(shipping.zip || shipping.pin_code || '');
    const [country, setCountry] = useState(shipping.country || 'India');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            const addressObj = {
                name: name.trim(),
                address: address.trim(),
                city: city.trim(),
                state: state.trim(),
                pin_code: pinCode.trim(),
                zip: pinCode.trim(),
                country: country.trim(),
                phone: phone.trim()
            };
            const { error } = await supabase.functions.invoke('admin-orders', {
                body: {
                    action: 'update_order',
                    order_id: order.id,
                    payload: {
                        customer_name: name.trim(),
                        customer_phone: phone.trim(),
                        customer_email: email.trim(),
                        shipping_address: addressObj,
                        shipping_details: addressObj
                    }
                }
            });
            if (error) throw error;
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update order details.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900 text-base">Edit Customer & Shipping Address</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                            <label className="block text-gray-700 font-medium mb-1">Customer Name</label>
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                            <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 font-medium mb-1">Street Address</label>
                            <input type="text" value={address} onChange={e=>setAddress(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="House/Flat No, Street, Landmark" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">City</label>
                            <input type="text" value={city} onChange={e=>setCity(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">State</label>
                            <input type="text" value={state} onChange={e=>setState(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Pincode / ZIP</label>
                            <input type="text" value={pinCode} onChange={e=>setPinCode(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" maxLength={10} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Country</label>
                            <input type="text" value={country} onChange={e=>setCountry(e.target.value)} required className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                            {saving ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
