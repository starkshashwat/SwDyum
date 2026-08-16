import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, XCircle, Clock, SkipForward } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LogsDrawer({ isOpen, onClose, event }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchLogs();
    }
  }, [isOpen, event]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          profiles(name)
        `)
        .eq('setting_id', event.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Sent': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Skipped': return <SkipForward className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Event Logs</h2>
            <p className="text-sm text-gray-500">{event.event_type.replace(/_/g, ' ')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLogs} className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No logs found for this event yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`font-semibold text-sm ${
                        log.status === 'Sent' ? 'text-green-700' :
                        log.status === 'Failed' ? 'text-red-700' :
                        log.status === 'Pending' ? 'text-yellow-700' :
                        'text-gray-600'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                    <div>
                      <span className="text-gray-500 text-xs block">Recipient</span>
                      <span className="font-medium text-gray-900">{log.profiles?.name || log.phone || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Order ID</span>
                      <span className="font-medium text-gray-900">{log.order_id || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Template Used</span>
                      <span className="font-medium text-gray-900">{log.template_name || '-'}</span>
                    </div>
                  </div>

                  {log.error_reason && (
                    <div className="mt-3 bg-red-50 text-red-700 p-2.5 rounded-md text-xs border border-red-100">
                      <strong>Error:</strong> {log.error_reason}
                    </div>
                  )}

                  {log.status === 'Failed' && (
                    <div className="mt-3 flex justify-end">
                      <button className="text-xs font-medium text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded border border-green-200 transition-colors">
                        Retry Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
