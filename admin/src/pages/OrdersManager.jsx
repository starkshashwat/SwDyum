// ════════════════════════════════════════════════════════════════════════════
// OrdersManager.jsx — Unified master-detail Orders view for the admin panel.
//
// Layout:
//   • Top bar: status summary cards (clickable filters) + search/filter bar.
//   • Desktop (lg+): split view — master list (left ~40%) + details panel (right ~60%).
//   • Mobile: single pane — list by default, full-screen details when an order
//     is selected (with a back button). Selection is synced to ?order=<id>.
//
// Real-time: subscribes to Supabase Realtime on the `orders` table so the list,
// summary cards, and the open details panel all update live when Razorpay
// webhooks (or the cleanup cron) write to the database — no manual refresh.
// ═════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
    Package, Search, ChevronLeft, ChevronRight, Download, X, RefreshCw,
    ArrowLeft, CreditCard, MapPin, Clock, Truck, Tag, FileText, Save,
    CheckCircle2, AlertCircle, Radio, Copy,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    ORDER_STATUSES, PAYMENT_STATUSES, STATUS_CARDS,
    getOrderStatusColor, getPaymentStatusColor, getPaymentDotColor,
    getCustomerInfo, getCustomerInitial, timeAgo, formatINR, exportOrdersCSV,
    copyToClipboard,
} from '../lib/orderUtils';

const PAGE_SIZE = 25;

export default function OrdersManager() {
    // ── List state ────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [statusCounts, setStatusCounts] = useState({});
    const [live, setLive] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // ── Selection (synced to URL ?order=<id>) ────────────────────────────────
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedOrderId = searchParams.get('order') || null;

    const selectOrder = useCallback((id) => {
        setSearchParams(id ? { order: id } : {}, { replace: true });
    }, [setSearchParams]);

    const clearSelection = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    // ── Fetch the master list ─────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('orders')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (orderStatusFilter !== 'All') query = query.eq('order_status', orderStatusFilter);
            if (paymentStatusFilter !== 'All') query = query.eq('payment_status', paymentStatusFilter);
            if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
            if (dateTo) {
                const end = new Date(dateTo); end.setHours(23, 59, 59, 999);
                query = query.lte('created_at', end.toISOString());
            }
            if (searchTerm.trim()) {
                const t = searchTerm.trim();
                query = query.or(
                    `id.ilike.%${t}%,customer_name.ilike.%${t}%,customer_email.ilike.%${t}%,customer_phone.ilike.%${t}%,coupon_code.ilike.%${t}%`
                );
            }
            const from = page * PAGE_SIZE;
            query = query.range(from, from + PAGE_SIZE - 1);

            const { data, error, count } = await query;
            if (error) throw error;
            setOrders(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, [page, orderStatusFilter, paymentStatusFilter, dateFrom, dateTo, searchTerm]);

    // ── Fetch summary card counts (single grouped query) ─────────────────────
    const fetchStatusCounts = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('order_status, payment_status, total');
            if (error) throw error;
            const counts = {};
            for (const o of data || []) {
                for (const card of STATUS_CARDS) {
                    const matchOrder = card.orderStatuses.includes(o.order_status || 'Pending');
                    const matchPayment = !card.paymentStatuses || card.paymentStatuses.includes(o.payment_status || 'Pending');
                    if (matchOrder && matchPayment) {
                        if (!counts[card.key]) counts[card.key] = { count: 0, revenue: 0 };
                        counts[card.key].count++;
                        if (o.payment_status === 'Paid') counts[card.key].revenue += Number(o.total || 0);
                    }
                }
            }
            setStatusCounts(counts);
        } catch (err) {
            console.error('Error fetching status counts:', err);
        }
    }, []);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchStatusCounts(); }, [fetchStatusCounts]);

    // ── Realtime: refresh list + counts + open details on any orders change ──
    useEffect(() => {
        const channel = supabase
            .channel('orders-manager-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
                fetchStatusCounts();
            })
            .subscribe((status) => setLive(status === 'SUBSCRIBED'));
        return () => { supabase.removeChannel(channel); };
    }, [fetchOrders, fetchStatusCounts]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const hasActiveFilters = orderStatusFilter !== 'All' || paymentStatusFilter !== 'All' || dateFrom || dateTo || searchTerm;

    const clearFilters = () => {
        setOrderStatusFilter('All'); setPaymentStatusFilter('All');
        setDateFrom(''); setDateTo(''); setSearchTerm(''); setPage(0);
    };

    // ── Bulk selection helpers ───────────────────────────────────────────────
    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
    const toggleSelectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelected) orders.forEach((o) => next.delete(o.id));
            else orders.forEach((o) => next.add(o.id));
            return next;
        });
    };

    // ── Inline status update (list row + details) ────────────────────────────
    const updateOrderStatus = async (id, newStatus) => {
        try {
            await supabase.from('orders').update({
                order_status: newStatus, status: newStatus, updated_at: new Date().toISOString(),
            }).eq('id', id);
            await supabase.from('order_timeline').insert([{
                order_id: id, event: newStatus, note: `Status changed to ${newStatus} by admin`, created_by: 'admin',
            }]);
            fetchOrders(); fetchStatusCounts();
        } catch (err) { console.error('Status update error:', err); }
    };

    const bulkUpdateStatus = async (newStatus) => {
        for (const id of selectedIds) await updateOrderStatus(id, newStatus);
        setSelectedIds(new Set());
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500">
                        {totalCount} total • Page {page + 1} of {totalPages}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${live ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                        <Radio className={`w-3 h-3 ${live ? 'animate-pulse' : ''}`} /> {live ? 'Live' : 'Offline'}
                    </span>
                    <button onClick={() => exportOrdersCSV(orders)} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => { fetchOrders(); fetchStatusCounts(); }} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Status summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {STATUS_CARDS.map((card) => {
                    const info = statusCounts[card.key] || { count: 0, revenue: 0 };
                    const active = orderStatusFilter === card.key || (card.key === 'Failed' && orderStatusFilter === 'Cancelled');
                    return (
                        <button
                            key={card.key}
                            onClick={() => { setOrderStatusFilter(active ? 'All' : (card.key === 'Failed' ? 'Cancelled' : card.orderStatuses[0])); setPage(0); }}
                            className={`text-left bg-white p-3 rounded-lg border shadow-sm transition-all hover:shadow-md ${active ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`w-2.5 h-2.5 rounded-full bg-${card.color}-500`} />
                                <span className="text-2xl font-bold text-gray-900">{info.count}</span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 mt-1 truncate">{card.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatINR(info.revenue)}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search + filter bar */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search order ID, customer, email, phone, coupon…"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${hasActiveFilters ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        Filters {hasActiveFilters && '(active)'}
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}
                </div>

                {/* Quick status chips */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['All', ...ORDER_STATUSES].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setOrderStatusFilter(s); setPage(0); }}
                            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border ${orderStatusFilter === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
                            <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(0); }} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                <option value="All">All</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm">
                    <span className="font-medium">{selectedIds.size} selected</span>
                    <button onClick={() => bulkUpdateStatus('Confirmed')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Mark Confirmed</button>
                    <button onClick={() => bulkUpdateStatus('Shipped')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Mark Shipped</button>
                    <button onClick={() => bulkUpdateStatus('Cancelled')} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Cancel</button>
                    <button onClick={() => exportOrdersCSV(orders.filter((o) => selectedIds.has(o.id)))} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Export Selected</button>
                    <button onClick={() => setSelectedIds(new Set())} className="ml-auto px-2 py-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Master-detail split (desktop) / single pane (mobile) */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* ── Master list ─────────────────────────────────────────────────── */}
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${selectedOrderId ? 'hidden lg:block lg:w-2/5' : 'w-full lg:w-2/5'}`}>
                    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" /> No orders found.
                            </div>
                        ) : (
                            <div>
                                {/* Select-all header */}
                                <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
                                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded" />
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{orders.length} on this page</span>
                                </div>
                                {orders.map((order) => {
                                    const customer = getCustomerInfo(order);
                                    const isSelected = order.id === selectedOrderId;
                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => selectOrder(order.id)}
                                            className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-black/5 border-l-4 border-l-black' : 'hover:bg-gray-50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(order.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => toggleSelect(order.id)}
                                                className="mt-1 rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-mono font-medium text-gray-900 truncate">{order.id}</span>
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(order.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{getCustomerInitial(order)}</span>
                                                    <span className="text-sm font-medium text-gray-900 truncate">{customer.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2 mt-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${getPaymentDotColor(order.payment_status || 'Pending')}`} />
                                                        <span className="text-xs text-gray-500">{order.payment_status || 'Pending'}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">{formatINR(order.total)}</span>
                                                </div>
                                                {/* Inline status dropdown */}
                                                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.order_status || 'Pending'}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black ${getOrderStatusColor(order.order_status || 'Pending')}`}
                                                    >
                                                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Load more / pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                                        <span className="text-xs text-gray-500">
                                            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                                        </span>
                                        <div className="flex gap-1">
                                            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-white">
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-white">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Details panel ───────────────────────────────────────────────── */}
                <div className={`flex-1 ${selectedOrderId ? 'block' : 'hidden lg:block'}`}>
                    {selectedOrderId ? (
                        <OrderDetailsPanel
                            orderId={selectedOrderId}
                            onBack={clearSelection}
                            onStatusChange={updateOrderStatus}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center" style={{ minHeight: '60vh' }}>
                            <div className="text-center text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p className="text-sm">Select an order to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// OrderDetailsPanel — renders the full details for a single order with a
// Realtime subscription filtered to that order id.
// ════════════════════════════════════════════════════════════════════════════
function OrderDetailsPanel({ orderId, onBack, onStatusChange }) {
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [payment, setPayment] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courierName, setCourierName] = useState('');
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(null);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const { data: orderData, error: orderError } = await supabase.from('orders').select('*').eq('id', orderId).single();
            if (orderError) throw orderError;
            setOrder(orderData);
            setNewStatus(orderData.order_status || orderData.status || 'Pending');

            const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderId);
            setItems(itemsData || []);

            const { data: timelineData } = await supabase.from('order_timeline').select('*').eq('order_id', orderId).order('created_at', { ascending: true });
            setTimeline(timelineData || []);

            const { data: paymentData } = await supabase.from('payments').select('*').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).single();
            setPayment(paymentData);

            const { data: invoiceData } = await supabase.from('invoices').select('*').eq('order_id', orderId).single();
            setInvoice(invoiceData);

            const { data: shipmentData } = await supabase.from('shipments').select('*').eq('order_id', orderId).single();
            if (shipmentData) { setTrackingNumber(shipmentData.awb_code || ''); setCourierName(shipmentData.courier_name || ''); }
        } catch (err) {
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Initial fetch whenever the selected order changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    // Realtime: refresh this order's details when it changes (e.g. webhook fires).
    // Debounced so a burst of updates only triggers one refetch.
    useEffect(() => {
        let timer;
        const channel = supabase
            .channel(`order-detail-${orderId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, () => {
                clearTimeout(timer);
                timer = setTimeout(() => fetchDetails(), 600);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_timeline', filter: `order_id=eq.${orderId}` }, () => {
                clearTimeout(timer);
                timer = setTimeout(() => fetchDetails(), 600);
            })
            .subscribe();
        return () => { clearTimeout(timer); supabase.removeChannel(channel); };
    }, [orderId, fetchDetails]);

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === (order.order_status || order.status)) return;
        setSaving(true);
        try {
            await onStatusChange(orderId, newStatus);
            fetchDetails();
        } finally { setSaving(false); }
    };

    const handleTrackingUpdate = async () => {
        setSaving(true);
        try {
            const { data: existing } = await supabase.from('shipments').select('id').eq('order_id', orderId).single();
            if (existing) {
                await supabase.from('shipments').update({ awb_code: trackingNumber, courier_name: courierName, updated_at: new Date().toISOString() }).eq('order_id', orderId);
            } else {
                await supabase.from('shipments').insert([{ order_id: orderId, awb_code: trackingNumber, courier_name: courierName, status: 'Shipped' }]);
            }
            await supabase.from('order_timeline').insert([{ order_id: orderId, event: 'Tracking Updated', note: `${courierName} - AWB: ${trackingNumber}`, created_by: 'admin' }]);
            fetchDetails();
        } catch (err) { console.error('Tracking update error:', err); }
        finally { setSaving(false); }
    };

    const handleCopy = async (text, key) => {
        const ok = await copyToClipboard(text);
        if (ok) { setCopied(key); setTimeout(() => setCopied(null), 1500); }
    };

    if (loading) return <div className="p-8 text-center text-gray-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading order…</div>;
    if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>;

    const shipping = order.shipping_details || {};
    const customer = getCustomerInfo(order);
    const isFailed = (order.payment_status || '').toLowerCase() === 'failed';

    return (
        <div className="space-y-4">
            {/* Sticky status header */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 font-mono">{order.id}</h2>
                        <p className="text-xs text-gray-500">{format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>{order.payment_status || 'Pending'}</span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.order_status || 'Pending')}`}>{order.order_status || 'Pending'}</span>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-black">
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={handleStatusUpdate} disabled={saving || newStatus === (order.order_status || order.status)} className="bg-black text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" /> Update
                    </button>
                </div>
            </div>

            {/* Payment failure banner */}
            {isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Payment Failed</p>
                        <p className="text-xs text-red-700 mt-0.5">{order.failure_reason || 'The customer did not complete the Razorpay checkout.'}</p>
                        {order.failed_at && <p className="text-xs text-red-500 mt-1">Marked failed at {format(new Date(order.failed_at), 'dd MMM yyyy, hh:mm a')}</p>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left — main details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Products */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">Products ({items.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase border-b">
                                        <th className="p-3 text-left">Product</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Price</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, i) => (
                                        <tr key={i}>
                                            <td className="p-3">
                                                <div className="font-medium text-gray-900">{item.product_name}</div>
                                                <div className="text-xs text-gray-500">{item.weight_label}</div>
                                            </td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">₹{item.unit_price}</td>
                                            <td className="p-3 text-right font-semibold">₹{item.total_price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t bg-gray-50">
                                    <tr><td colSpan="3" className="p-3 text-right text-gray-500">Total</td><td className="p-3 text-right font-bold">₹{order.total}</td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment details */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">Payment Details</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-gray-500 text-xs">Gateway</span><p className="font-medium mt-0.5">Razorpay</p></div>
                            <div><span className="text-gray-500 text-xs">Method</span><p className="font-medium mt-0.5">{order.payment_method || 'Online'}</p></div>
                            <CopyField label="Razorpay Payment ID" value={payment?.razorpay_payment_id || order.payment_id || ''} copied={copied === 'pid'} onCopy={() => handleCopy(payment?.razorpay_payment_id || order.payment_id || '', 'pid')} />
                            <CopyField label="Razorpay Order ID" value={payment?.razorpay_order_id || order.razorpay_order_id || ''} copied={copied === 'oid'} onCopy={() => handleCopy(payment?.razorpay_order_id || order.razorpay_order_id || '', 'oid')} />
                            <div><span className="text-gray-500 text-xs">Payment Date</span><p className="font-medium mt-0.5">{payment?.payment_date ? format(new Date(payment.payment_date), 'dd MMM, hh:mm a') : '—'}</p></div>
                            <div><span className="text-gray-500 text-xs">Status</span><p className="mt-0.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment?.status || order.payment_status || 'Pending')}`}>{payment?.status || order.payment_status || 'Pending'}</span></p></div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">Timeline</h3>
                        </div>
                        <div className="p-4">
                            {timeline.length === 0 ? (
                                <p className="text-sm text-gray-400">No timeline events yet.</p>
                            ) : (
                                <div className="relative">
                                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                                    <div className="space-y-4">
                                        {timeline.map((entry, i) => (
                                            <div key={i} className="relative pl-8">
                                                <div className={`absolute left-2 w-3 h-3 rounded-full border-2 ${i === timeline.length - 1 ? 'bg-black border-black' : 'bg-white border-gray-300'}`} />
                                                <p className="text-sm font-medium text-gray-900">{entry.event}</p>
                                                {entry.note && <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>}
                                                <p className="text-xs text-gray-400 mt-1">{format(new Date(entry.created_at), 'dd MMM, hh:mm a')} • {entry.created_by || 'system'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right — sidebar */}
                <div className="space-y-4">
                    {/* Customer */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-900 text-sm">Customer</h3></div>
                        <div className="p-4 space-y-2 text-sm">
                            <div><span className="text-gray-500 text-xs">Name</span><p className="font-medium">{customer.name}</p></div>
                            <div><span className="text-gray-500 text-xs">Email</span><p className="font-medium">{customer.email || '—'}</p></div>
                            <div><span className="text-gray-500 text-xs">Phone</span><p className="font-medium">{customer.phone || '—'}</p></div>
                        </div>
                    </div>

                    {/* Shipping address */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">Shipping Address</h3>
                        </div>
                        <div className="p-4 text-sm text-gray-700 leading-relaxed">
                            <p className="font-medium">{shipping.name}</p>
                            <p>{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
                            <p>{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
                            {shipping.phone && <p className="mt-2 text-gray-500">📞 {shipping.phone}</p>}
                        </div>
                    </div>

                    {/* Tracking */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 text-sm">Tracking</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            <input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Courier" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                            <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="AWB" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                            <button onClick={handleTrackingUpdate} disabled={saving || (!trackingNumber && !courierName)} className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-1">
                                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Tracking'}
                            </button>
                        </div>
                    </div>

                    {/* Invoice */}
                    {invoice && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <h3 className="font-semibold text-gray-900 text-sm">Invoice</h3>
                            </div>
                            <div className="p-4 text-sm space-y-1">
                                <p><span className="text-gray-500 text-xs">#</span> <span className="font-mono font-medium">{invoice.invoice_number}</span></p>
                                <p><span className="text-gray-500 text-xs">Date:</span> {format(new Date(invoice.invoice_date), 'dd MMM yyyy')}</p>
                                <p><span className="text-gray-500 text-xs">Status:</span> <span className="text-green-600 font-medium">{invoice.status}</span></p>
                            </div>
                        </div>
                    )}

                    {/* Coupon */}
                    {order.coupon_code && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-gray-400" />
                                <h3 className="font-semibold text-gray-900 text-sm">Coupon</h3>
                            </div>
                            <div className="p-4 text-sm">
                                <p className="font-mono font-bold text-purple-700">{order.coupon_code}</p>
                                <p className="text-green-600 mt-1">−₹{order.discount_amount || 0}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Small copy-to-clipboard field used in the payment details card.
function CopyField({ label, value, copied, onCopy }) {
    return (
        <div>
            <span className="text-gray-500 text-xs">{label}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
                <p className="font-mono text-xs truncate flex-1">{value || '—'}</p>
                {value && (
                    <button onClick={onCopy} className="text-gray-400 hover:text-gray-700 flex-shrink-0" title="Copy">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>
        </div>
    );
}
