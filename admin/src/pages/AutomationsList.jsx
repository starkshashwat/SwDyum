import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Copy, 
  Edit2, 
  Zap, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  RefreshCw,
  Mail,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function AutomationsList() {
  const [activeTab, setActiveTab] = useState('workflows'); // 'workflows' | 'runs' | 'logs' | 'templates'
  const [automations, setAutomations] = useState([]);
  const [runs, setRuns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [waTemplates, setWaTemplates] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingSamples, setIsCreatingSamples] = useState(false);
  const navigate = useNavigate();

  const fetchAutomations = async () => {
    try {
      const res = await axios.get('/api/automations', { withCredentials: true });
      setAutomations(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to load automations');
      setAutomations([]);
    }
  };

  const fetchRuns = async () => {
    try {
      const res = await axios.get('/api/automations/data/runs', { withCredentials: true });
      setRuns(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load runs', error);
      setRuns([]);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/automations/data/logs', { withCredentials: true });
      setLogs(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load communication logs', error);
      setLogs([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const [emailRes, waRes] = await Promise.all([
        axios.get('/api/automations/config/templates?channel=email', { withCredentials: true }),
        axios.get('/api/automations/config/templates?channel=whatsapp', { withCredentials: true })
      ]);
      setEmailTemplates(emailRes.data?.data || []);
      setWaTemplates(waRes.data?.data || []);
    } catch (error) {
      console.error('Failed to load templates', error);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchAutomations(), fetchRuns(), fetchLogs(), fetchTemplates()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDuplicate = async (id) => {
    try {
      const toastId = toast.loading('Duplicating automation...');
      await axios.post(`/api/automations/${id}/duplicate`, {}, { withCredentials: true });
      toast.success('Automation duplicated!', { id: toastId });
      fetchAutomations();
    } catch (error) {
      toast.error('Failed to duplicate automation');
    }
  };

  const createSampleWorkflows = async () => {
    setIsCreatingSamples(true);
    const toastId = toast.loading('Creating starter automation workflows...');
    try {
      // Create Abandoned Cart Recovery sample
      await axios.post('/api/automations', {
        name: 'Abandoned Cart 24h Recovery',
        trigger_event: 'cart_abandoned',
        status: 'Active',
        steps: [
          { step_type: 'Wait', config: { value: '2', unit: 'hours' } },
          { step_type: 'Send Email', config: { template_id: emailTemplates[0]?.id || '' } },
          { step_type: 'Wait', config: { value: '24', unit: 'hours' } },
          { step_type: 'Condition', config: { condition_type: 'order_completed', expected_value: 'No' } },
          { step_type: 'Send WhatsApp', config: { template_id: waTemplates[0]?.id || '' } }
        ]
      }, { withCredentials: true });

      // Create Order Delivery Followup sample
      await axios.post('/api/automations', {
        name: 'Order Delivered Review & Thank You',
        trigger_event: 'order_delivered',
        status: 'Active',
        steps: [
          { step_type: 'Wait', config: { value: '1', unit: 'days' } },
          { step_type: 'Send WhatsApp', config: { template_id: waTemplates[0]?.id || '' } }
        ]
      }, { withCredentials: true });

      toast.success('Sample automation workflows created!', { id: toastId });
      fetchAutomations();
    } catch (error) {
      toast.error('Failed to create sample automations', { id: toastId });
    } finally {
      setIsCreatingSamples(false);
    }
  };

  const filteredAutomations = (automations || []).filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.trigger_event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRuns = (runs || []).filter(r => 
    r.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = (logs || []).filter(l => 
    l.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-gray-500 font-medium">Loading automation center...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-black" />
            Customer Automation Engine
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Design automated triggers, abandoned cart recoveries, and multi-channel customer workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/automations/new')}
            className="bg-black hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Automation
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex justify-between items-center">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'workflows'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            Workflows ({automations.length})
          </button>
          <button
            onClick={() => setActiveTab('runs')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'runs'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Execution Runs ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Communication Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            Templates ({emailTemplates.length + waTemplates.length})
          </button>
        </nav>

        {/* Search Bar */}
        <div className="relative w-64 mb-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Tab 1: Workflows */}
      {activeTab === 'workflows' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Workflow & Trigger</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Enrolled</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Currently Running</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAutomations.map((auto) => (
                <tr key={auto.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{auto.name}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {auto.trigger_event}
                      </span>
                      <span>v{auto.version}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      auto.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {auto.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {auto.total_enrolled || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {auto.currently_running || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/automations/${auto.id}`)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit Automation"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(auto.id)}
                        className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAutomations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Zap className="w-10 h-10 text-gray-300" />
                      <p className="text-base font-medium text-gray-700">No automation workflows found</p>
                      <p className="text-sm text-gray-500 max-w-sm">
                        Create custom automated triggers or load pre-packaged e-commerce workflows to get started.
                      </p>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => navigate('/automations/new')}
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create Automation
                        </button>
                        <button
                          onClick={createSampleWorkflows}
                          disabled={isCreatingSamples}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          {isCreatingSamples ? 'Generating...' : 'Load Sample Workflows'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Execution Runs */}
      {activeTab === 'runs' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Current Step</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Started At</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Details / Error</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRuns.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{run.customer?.name || run.customer?.email || 'Customer'}</div>
                    <div className="text-xs text-gray-400 font-mono">{run.customer_id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">
                    Step {run.current_step_order || 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      run.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      run.status === 'running' || run.status === 'waiting' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {run.started_at ? new Date(run.started_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {run.error_message ? (
                      <span className="text-red-600 flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {run.error_message}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                    No active or historical automation runs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Communication Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Template</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sent At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-800">
                      {log.channel === 'WhatsApp' ? <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-blue-600" />}
                      {log.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {log.customer?.email || log.customer?.name || 'Customer'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.template_name || 'Standard Template'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'Sent' || log.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                      log.status === 'Queued' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                    No communication logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Templates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Email Templates ({emailTemplates.length})
              </h3>
              <button
                onClick={() => navigate('/email-templates')}
                className="text-xs text-black font-semibold hover:underline"
              >
                Manage Email Templates &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {emailTemplates.map((tmpl) => (
                <div key={tmpl.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="text-sm font-semibold text-gray-900">{tmpl.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{tmpl.subject}</div>
                </div>
              ))}
              {emailTemplates.length === 0 && (
                <p className="text-sm text-gray-500 italic py-4 text-center">No email templates configured.</p>
              )}
            </div>
          </div>

          {/* WhatsApp Templates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                WhatsApp Templates ({waTemplates.length})
              </h3>
              <button
                onClick={() => navigate('/whatsapp-templates')}
                className="text-xs text-black font-semibold hover:underline"
              >
                Manage Meta Templates &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {waTemplates.map((tmpl) => (
                <div key={tmpl.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="text-sm font-semibold text-gray-900">{tmpl.name}</div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">{tmpl.body_text}</div>
                </div>
              ))}
              {waTemplates.length === 0 && (
                <p className="text-sm text-gray-500 italic py-4 text-center">No WhatsApp templates configured.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

