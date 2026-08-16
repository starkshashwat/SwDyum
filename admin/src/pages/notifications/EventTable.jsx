import React from 'react';
import { ToggleLeft, ToggleRight, Settings, Eye, Play, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function EventTable({ 
  events, 
  templates, 
  onToggleEvent, 
  onPreview, 
  onMapVariables, 
  onTestSend, 
  onViewLogs 
}) {

  const formatEventName = (eventName) => {
    return eventName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMappingStatus = (event) => {
    if (!event.template_name) return 'No Template';
    
    // Check if mappings exist
    const mappings = event.variable_mappings || {};
    const hasMappings = Object.keys(mappings).length > 0;
    
    // A more thorough check would compare required template variables vs mapped variables
    // For now, if we have a template and some mappings (or it requires 0), we assume 'Mapped'
    if (hasMappings) {
      return 'Mapped';
    }
    return 'Missing';
  };

  // Group events by category
  const categories = [...new Set(events.map(e => e.category || 'Uncategorized'))];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Event Name</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Audience</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Template</th>
            <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Success Rate</th>
            <th className="px-6 py-4 text-right font-medium text-gray-500 uppercase tracking-wider text-xs">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map(category => (
            <React.Fragment key={category}>
              {/* Category Header Row */}
              <tr className="bg-gray-50/80 border-t border-gray-200">
                <td colSpan="6" className="px-6 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {category} Events
                </td>
              </tr>
              
              {/* Category Events */}
              {events.filter(e => (e.category || 'Uncategorized') === category).map((event) => {
                const mappingStatus = getMappingStatus(event);
                
                return (
                  <tr key={event.id} className={`hover:bg-gray-50/50 ${event.is_enabled ? '' : 'opacity-75 bg-gray-50/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{formatEventName(event.event_type)}</div>
                      {event.last_triggered_at && (
                        <div className="text-xs text-gray-500 mt-1">Last fired: {new Date(event.last_triggered_at).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        event.audience === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        event.audience === 'Both' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {event.audience}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => onToggleEvent(event.id)}
                        className="flex items-center gap-2 focus:outline-none"
                      >
                        {event.is_enabled ? (
                          <ToggleRight className="w-8 h-8 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-400" />
                        )}
                        <span className={`text-xs font-medium ${event.is_enabled ? 'text-green-700' : 'text-gray-500'}`}>
                          {event.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{event.template_name || <span className="text-gray-400 italic">None selected</span>}</div>
                      {event.template_name && (
                        <div className={`text-xs mt-1 flex items-center gap-1 ${mappingStatus === 'Missing' ? 'text-red-500' : 'text-green-600'}`}>
                          {mappingStatus === 'Missing' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {mappingStatus === 'Missing' ? 'Variables not mapped' : 'Ready'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {event.success_rate !== null && event.success_rate !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${event.success_rate > 90 ? 'text-green-600' : event.success_rate > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {event.success_rate}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onMapVariables(event)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Configure & Map Variables"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onPreview(event)}
                          disabled={!event.template_name}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Preview Template"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onTestSend(event)}
                          disabled={!event.template_name}
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send Test Message"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onViewLogs(event)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View Logs"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
