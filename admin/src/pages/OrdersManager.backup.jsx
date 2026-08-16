import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiError } from '../lib/apiClient';
import {
    Package, Search, ChevronLeft, ChevronRight, Download, X, RefreshCw,
    ArrowLeft, CreditCard, MapPin, Clock, Truck, Tag, Save, AlertCircle,
    Copy, CheckCircle2, MessageCircle, FileText
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
    return phone.replace(/\D/g, '');
}

export default function OrdersManager() {
    // â”€â”€ List state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(0); 
    const [totalCount, setTotalCount] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [statusCounts, setStatusCounts] = useState({});

    // â”€â”€ Selection (synced to URL ?order=<id>) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedOrderId = searchParams.get('order') || null;

    const selectOrder = useCallback((id) => {
        setSearchParams(id ? { order: id } : {}, { replace: true });
    }, [setSearchParams]);

    const clearSelection = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    // â”€â”€ Fetch the master list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params = {
                page: page + 1, // backend pages are 1-indexed
                limit: PAGE_SIZE,
            };
            if (orderStatusFilter !== 'All') params.status = orderStatusFilter;
            if (paymentStatusFilter !== 'All') params.payment_status = paymentStatusFilter;
            if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                params.date_to = end.toISOString();
            }
            if (searchTerm.trim()) params.customer_email = searchTerm.trim();

            const res = await apiClient.get('/orders', params);
            setOrders(res?.data || []);
            setTotalCount(res?.pagination?.total || 0);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    }, [page, orderStatusFilter, paymentStatusFilter, dateFrom, dateTo, searchTerm]);

    // â”€â”€ Fetch summary card counts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fetchStatusCounts = useCallback(async () => {
        try {
            const res = await apiClient.get('/orders', { limit: 1000 });
            const data = res?.data || [];
            const counts = {};
            for (const o of data) {
                for (const card of STATUS_CARDS) {
                    const matchOrder = card.orderStatuses.includes(o.status || 'Pending');
                    if (matchOrder) {
                        if (!counts[card.key]) counts[card.key] = { count: 0, revenue: 0 };
                        counts[card.key].count++;
                        if (o.payment_status === 'Paid') counts[card.key].revenue += Number(o.total || 0);
                    }
                }
            }
            setStatusCounts(counts);
        } catch {
            // Non-fatal â€” cards just show zeros.
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { fetchStatusCounts(); }, [fetchStatusCounts]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const hasActiveFilters = orderStatusFilter !== 'All' || paymentStatusFilter !== 'All' || dateFrom || dateTo || searchTerm;

    const clearFilters = () => {
        setOrderStatusFilter('All'); setPaymentStatusFilter('All');
        setDateFrom(''); setDateTo(''); setSearchTerm(''); setPage(0);
    };

    const updateOrderStatus = async (id, newStatus, note = null) => {
        try {
            const entry = {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: note || `Status changed to ${newStatus} by admin`,
            };
            const current = await apiClient.get(`/orders/${id}`);
            const history = current?.data?.tracking_history || [];
            await apiClient.patch(`/orders/${id}`, {
                status: newStatus,
                tracking_history: [...history, entry],
            });
            fetchOrders(); fetchStatusCounts();
        } catch (err) {
            alert(`Error updating order: ${err instanceof ApiError ? err.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={() => exportOrdersCSV(orders)} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => { fetchOrders(); fetchStatusCounts(); }} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 flex-shrink-0">{error}</div>
            )}

            {/* Status summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-shrink-0">
                {STATUS_CARDS.map((card) => {
                    const info = statusCounts[card.key] || { count: 0, revenue: 0 };
                    const active = card.orderStatuses.includes(orderStatusFilter);
                    return (
                        <button
                            key={card.key}
                            onClick={() => { setOrderStatusFilter(active ? 'All' : card.orderStatuses[0]); setPage(0); }}
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
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 space-y-3 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name, Email or Phone..."
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

                {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Fulfillment Status</label>
                            <select value={orderStatusFilter} onChange={(e) => { setOrderStatusFilter(e.target.value); setPage(0); }} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                                <option value="All">All</option>
                                {/* Filter out Refunded since it's mostly a payment state conceptually now */}
                                {ORDER_STATUSES.filter(s => s !== 'Refunded').map((s) => <option key={s} value={s}>{s === 'Pending' || s === 'Paid' ? 'New (Legacy: '+s+')' : s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
                            <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(0); }} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                                <option value="All">All</option>
                                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

            {/* Master-detail split */}
            <div className="flex flex-col lg:flex-row gap-4 min-h-0 flex-1">
                {/* â”€â”€ Master list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col ${selectedOrderId ? 'hidden lg:flex lg:w-[35%]' : 'w-full lg:flex lg:w-[35%]'}`}>
                    <div className="overflow-y-auto flex-1 relative">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> Loadingâ€¦
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" /> No orders found.
                            </div>
                        ) : (
                            <div>
                                {orders.map((order) => {
                                    const customer = getCustomerInfo(order);
                                    const isSelected = order.id === selectedOrderId;
                                    const UIStatus = (order.status === 'Pending' || order.status === 'Paid') ? 'New' : order.status;
                                    
                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => selectOrder(order.id)}
                                            className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-gray-900">{shortId(order.id)}</span>
                                                    <CopyField value={order.id} minimal />
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">{timeAgo(order.created_at)}</span>
                                            </div>
                                            
                                            <div className="font-medium text-sm text-gray-900 mb-2 truncate">
                                                {customer.name}
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-900">{formatINR(order.total)}</span>
                                                <div className="flex gap-1.5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                                                        {order.payment_status || 'Pending'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getOrderStatusColor(order.status || 'Pending')}`}>
                                                        {UIStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <span className="text-xs text-gray-500 font-medium">
                                {page * PAGE_SIZE + 1}â€“{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-2 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-white transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-white transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* â”€â”€ Details panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className={`flex-1 overflow-y-auto ${selectedOrderId ? 'block' : 'hidden lg:block'}`}>
                    {selectedOrderId ? (
                        <OrderDetailsPanel
                            orderId={selectedOrderId}
                            onBack={clearSelection}
                            onStatusChange={updateOrderStatus}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                <p className="text-sm font-medium">Select an order to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// OrderDetailsPanel
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function OrderDetailsPanel({ orderId, onBack, onStatusChange }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [adminNote, setAdminNote] = useState('');

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await apiClient.get(`/orders/${orderId}`);
            setOrder(res?.data || {});
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to load order.');
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

    if (loading) return <div className="bg-white rounded-lg border h-full flex items-center justify-center text-gray-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /></div>;
    if (error) return <div className="bg-white rounded-lg border p-8 text-center text-red-600">{error}</div>;
    if (!order) return <div className="bg-white rounded-lg border p-8 text-center text-gray-500">Order not found.</div>;

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
                <a href={`https://wa.me/${formatPhone(customer.phone)}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Send Payment Reminder
                </a>
            );
        }
        if (order.status === 'Pending' || order.status === 'Paid') {
            return (
                <button onClick={() => handleAction('Processing')} disabled={saving} className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" /> Mark Processing
                </button>
            );
        }
        if (order.status === 'Processing') {
            return (
                <button onClick={() => {
                    const el = document.getElementById('shipping-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" /> Create Shipment
                </button>
            );
        }
        if (order.status === 'Shipped') {
            return (
                <button onClick={() => handleAction('Delivered')} disabled={saving} className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                </button>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4 pb-8">
            {/* 1. Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 bg-gray-50 border-b flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <button onClick={onBack} className="p-1 -ml-1 rounded-md hover:bg-gray-200 lg:hidden text-gray-500">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 font-mono tracking-tight">{order.id}</h2>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 ml-1 lg:ml-0">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                        </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                        <div className="text-2xl font-bold text-gray-900">{formatINR(order.total)}</div>
                        <div className="flex gap-2">
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                                Pay: {order.payment_status || 'Pending'}
                            </span>
                            <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getOrderStatusColor(order.status || 'Pending')}`}>
                                {UIStatus}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="text-sm text-gray-600">
                        {order.status === 'Delivered' && 'This order is fully fulfilled.'}
                        {order.status === 'Cancelled' && 'This order was cancelled.'}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && 'Next step in fulfillment workflow:'}
                    </div>
                    {renderPrimaryAction()}
                </div>
            </div>

            {isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Payment Failed</p>
                        <p className="text-xs text-red-700 mt-0.5">The customer did not complete the checkout payment.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 2. Customer */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        Customer
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-gray-500 text-xs block mb-0.5">Name</span>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                        </div>
                        {customer.email && (
                            <div>
                                <span className="text-gray-500 text-xs block mb-0.5">Email</span>
                                <div className="text-gray-900">{customer.email}</div>
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500 text-xs block mb-0.5">Phone</span>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{customer.phone || 'â€”'}</span>
                                {customer.phone && (
                                    <div className="flex items-center gap-2">
                                        <CopyField value={customer.phone} minimal />
                                        <a href={`https://wa.me/${formatPhone(customer.phone)}`} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-md">
                                            <MessageCircle className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Payment */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" /> Payment
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 text-xs block mb-0.5">Method</span>
                            <div className="font-medium">{order.payment_method || 'Online'}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block mb-0.5">Status</span>
                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getPaymentStatusColor(order.payment_status || 'Pending')}`}>
                                {order.payment_status || 'Pending'}
                            </div>
                        </div>
                        {order.payment_id && (
                            <div className="col-span-2">
                                <span className="text-gray-500 text-xs block mb-0.5">Payment ID</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border flex-1 truncate">{order.payment_id}</span>
                                    <CopyField value={order.payment_id} minimal />
                                </div>
                            </div>
                        )}
                        {order.coupon_code && (
                            <div className="col-span-2 border-t pt-3 mt-1">
                                <span className="text-gray-500 text-xs block mb-0.5">Coupon Applied</span>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.coupon_code}</span>
                                    <span className="text-green-600 font-medium">âˆ’{formatINR(order.discount_amount || 0)}</span>
                                </div>
                            </div>
                        )}
                        <div className="col-span-2 border-t pt-3 mt-1 flex justify-between items-center">
                            <span className="font-medium text-gray-900">Final Total</span>
                            <span className="font-bold text-lg text-gray-900">{formatINR(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Items */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                    <Package className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Order Items ({items.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b bg-white">
                                <th className="p-4 text-left font-medium">Product</th>
                                <th className="p-4 text-center font-medium">Variant</th>
                                <th className="p-4 text-center font-medium">Qty</th>
                                <th className="p-4 text-right font-medium">Unit Price</th>
                                <th className="p-4 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {items.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{item.product_name}</div>
                                    </td>
                                    <td className="p-4 text-center text-gray-600">
                                        {item.weight_label || 'â€”'}
                                    </td>
                                    <td className="p-4 text-center font-medium">{item.quantity}</td>
                                    <td className="p-4 text-right text-gray-600">â‚¹{item.unit_price}</td>
                                    <td className="p-4 text-right font-semibold text-gray-900">â‚¹{item.total_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 5. Shipping */}
            <div id="shipping-section" className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Shipping</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <CopyField value={
                            `${shipping.name}\n${shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}\n${[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}\nPhone: ${shipping.phone || customer.phone}`
                        } label="Copy Address" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-5 text-sm text-gray-700 leading-relaxed space-y-1">
                        <p className="font-semibold text-gray-900">{shipping.name}</p>
                        <p>{shipping.address || [shipping.house_number, shipping.street].filter(Boolean).join(', ')}</p>
                        <p>{[shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ')}</p>
                        {(shipping.phone || customer.phone) && <p className="pt-2 text-gray-500">ðŸ“ž {shipping.phone || customer.phone}</p>}
                    </div>
                    <div className="p-5 bg-gray-50/30">
                        <ShipmentPanel order={order} onUpdate={fetchDetails} />
                    </div>
                </div>
            </div>

            {/* 6. Timeline / Notes */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Timeline & Notes
                </h3>
                
                {timeline.length > 0 && (
                    <div className="relative pt-2 pb-4">
                        <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-200" />
                        <div className="space-y-5">
                            {timeline.map((entry, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className={`absolute left-0 w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center bg-white ${i === timeline.length - 1 ? 'border-indigo-500' : 'border-gray-300'}`}>
                                        <div className={`w-2 h-2 rounded-full ${i === timeline.length - 1 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {(entry.status === 'Pending' || entry.status === 'Paid') && entry.note?.includes('admin') ? 'New' : entry.status}
                                    </p>
                                    {entry.note && <p className="text-sm text-gray-600 mt-0.5">{entry.note}</p>}
                                    <p className="text-xs text-gray-400 mt-1">{entry.timestamp ? format(new Date(entry.timestamp), 'dd MMM yyyy, hh:mm a') : 'â€”'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleAddNote} className="pt-2 border-t border-gray-100 flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a private admin note to timeline..."
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="submit" disabled={!adminNote.trim() || saving} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
                        Add Note
                    </button>
                </form>
            </div>

        </div>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Small Helpers
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function CopyField({ value, label, minimal }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e) => {
        if (e) e.stopPropagation();
        const ok = await copyToClipboard(value);
        if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
    };

    if (minimal) {
        return (
            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-700 transition-colors" title="Copy">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
        );
    }

    return (
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors">
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : label || 'Copy'}
        </button>
    );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ShipmentPanel â€” Velocity Shipping Integration
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
            const { data } = await apiClient.get(`/shipments`, { order_id: order.id });
            if (data && data.length > 0) {
                const res = await apiClient.get(`/shipments/${data[0].id}`);
                setShipment(res.data);
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
            
            await apiClient.post(`/orders/${order.id}/create-shipment`, payload);
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to create shipment.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateReverseShipment = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError('');
            await apiClient.post(`/orders/${order.id}/create-reverse-shipment`, reversePayload);
            await fetchShipment();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to create return pickup.');
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        try {
            setSaving(true);
            await apiClient.post(`/shipments/${shipment.id}/sync`);
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
            await apiClient.post(`/shipments/${shipment.id}/cancel`);
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
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 text-sm">Velocity Integration</h4>
                {shipment && (
                    <button onClick={handleSync} disabled={saving} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded">
                        <RefreshCw className={`w-3 h-3 ${saving ? 'animate-spin' : ''}`} /> Sync
                    </button>
                )}
            </div>
            
            {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200 font-medium">{error}</div>}

            {!shipment ? (
                canCreate ? (
                    <div>
                        <div className="flex border-b mb-3">
                            <button className={`px-3 py-1 text-xs font-medium border-b-2 ${activeTab === 'forward' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('forward')}>Forward Shipment</button>
                            <button className={`px-3 py-1 text-xs font-medium border-b-2 ${activeTab === 'return' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('return')}>Return Pickup</button>
                        </div>
                        
                        {activeTab === 'forward' && (
                            <form onSubmit={(e) => handleCreateShipment(e, 'orchestration')} className="space-y-3">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Click below to generate an AWB. Dimensions are automatically calculated based on product presets.
                                </p>
                                
                                {showAdvanced && (
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-gray-200">
                                        <div><label className="text-gray-600 font-medium">Length (cm)</label><input type="number" step="0.1" value={overrides.length_cm} onChange={e=>setOverrides({...overrides, length_cm: e.target.value})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-600 font-medium">Breadth (cm)</label><input type="number" step="0.1" value={overrides.breadth_cm} onChange={e=>setOverrides({...overrides, breadth_cm: e.target.value})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-600 font-medium">Height (cm)</label><input type="number" step="0.1" value={overrides.height_cm} onChange={e=>setOverrides({...overrides, height_cm: e.target.value})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                        <div><label className="text-gray-600 font-medium">Weight (kg)</label><input type="number" step="0.001" value={overrides.weight_kg} onChange={e=>setOverrides({...overrides, weight_kg: e.target.value})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-1">
                                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-indigo-600 hover:underline font-medium">
                                        {showAdvanced ? 'Hide Advanced' : 'Advanced Dimensions'}
                                    </button>
                                    <div className="space-x-2">
                                        <button type="button" onClick={(e) => handleCreateShipment(e, 'order_only')} disabled={saving} className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">
                                            {saving ? 'Creating...' : 'Create Order Only'}
                                        </button>
                                        <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                                            {saving ? 'Creating...' : 'Create Shipment'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {activeTab === 'return' && (
                            <form onSubmit={handleCreateReverseShipment} className="space-y-3">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Initiate a return pickup from the customer's address back to your default warehouse.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-gray-200">
                                    <div><label className="text-gray-600 font-medium">Length (cm)</label><input type="number" step="0.1" value={reversePayload.length} onChange={e=>setReversePayload({...reversePayload, length: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-600 font-medium">Breadth (cm)</label><input type="number" step="0.1" value={reversePayload.breadth} onChange={e=>setReversePayload({...reversePayload, breadth: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-600 font-medium">Height (cm)</label><input type="number" step="0.1" value={reversePayload.height} onChange={e=>setReversePayload({...reversePayload, height: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                    <div><label className="text-gray-600 font-medium">Weight (kg)</label><input type="number" step="0.001" value={reversePayload.weight} onChange={e=>setReversePayload({...reversePayload, weight: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 outline-none" /></div>
                                </div>
                                
                                <div className="flex items-center justify-end pt-1">
                                    <button type="submit" disabled={saving} className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm">
                                        {saving ? 'Creating...' : 'Initiate Return Pickup'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 text-sm">
                        Order must be Paid or COD to create a shipment.
                    </div>
                )
            ) : (
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded border shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                        <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-xs font-medium tracking-wider">{shipment.velocity_status}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded border shadow-sm">
                        <div>
                            <span className="text-gray-500 text-xs block mb-1">AWB Code</span>
                            <div className="flex items-center gap-1.5 font-mono text-gray-900">
                                {shipment.awb_code || 'â€”'}
                                {shipment.awb_code && <CopyField value={shipment.awb_code} minimal />}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs block mb-1">Courier</span>
                            <div className="font-medium text-gray-900">{shipment.courier_name || 'â€”'}</div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pt-1">
                        {shipment.label_url && (
                            <a href={shipment.label_url} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100 transition-colors">
                                Download Label
                            </a>
                        )}
                        {shipment.internal_status !== 'cancelled' && shipment.internal_status !== 'delivered' && (
                            <button onClick={handleCancel} disabled={saving} className="flex-1 text-center py-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-xs font-semibold hover:bg-red-100 transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>

                    {shipment.shipment_events && shipment.shipment_events.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Courier Tracking Events</h4>
                            <div className="space-y-3">
                                {shipment.shipment_events.slice(0, 3).map((ev, i) => (
                                    <div key={i} className="text-xs">
                                        <p className="font-semibold text-gray-900">{ev.velocity_status}</p>
                                        {(ev.message || ev.location) && (
                                            <p className="text-gray-600 mt-0.5">{[ev.location, ev.message].filter(Boolean).join(' - ')}</p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(ev.event_time), 'dd MMM, hh:mm a')}</p>
                                    </div>
                                ))}
                                {shipment.shipment_events.length > 3 && (
                                    <p className="text-xs text-gray-500 italic pt-1">+ {shipment.shipment_events.length - 3} older events sync'd</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
