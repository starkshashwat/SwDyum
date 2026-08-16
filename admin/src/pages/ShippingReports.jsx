import { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { BarChart3, TrendingUp, Package, AlertCircle } from 'lucide-react';

export default function ShippingReports() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState(null);
    
    // Default to last 30 days
    const [dateRange, setDateRange] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        shipment_type: 'forward'
    });

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const { data } = await apiClient.post('/admin/shipping/reports', dateRange);
            setReport(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch reports from Velocity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    Shipping Reports
                </h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleGenerateReport} className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input 
                            type="date" 
                            required 
                            value={dateRange.start_date}
                            onChange={e => setDateRange({...dateRange, start_date: e.target.value})}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input 
                            type="date" 
                            required 
                            value={dateRange.end_date}
                            onChange={e => setDateRange({...dateRange, end_date: e.target.value})}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select 
                            value={dateRange.shipment_type}
                            onChange={e => setDateRange({...dateRange, shipment_type: e.target.value})}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="forward">Forward</option>
                            <option value="reverse">Reverse (Returns)</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                        {error}
                    </div>
                )}
            </div>

            {report && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-indigo-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{report.total_shipments || 0}</p>
                                </div>
                                <Package className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-green-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{report.delivered_shipments || 0}</p>
                                </div>
                                <TrendingUp className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-yellow-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">In Transit</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{report.in_transit_shipments || 0}</p>
                                </div>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="bg-white p-5 shadow rounded-lg border-l-4 border-red-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">RTO / Failed</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{report.rto_shipments || 0}</p>
                                </div>
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Status Breakdown Table */}
                    {report.status_breakdown && report.status_breakdown.length > 0 && (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Status Breakdown</h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.status_breakdown.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.status}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {report.total_shipments > 0 ? Math.round((item.count / report.total_shipments) * 100) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Activity(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}
