import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Megaphone, Plus, Search, Send } from 'lucide-react';

export default function WhatsAppTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase.functions.invoke('whatsapp-templates', {
        method: 'GET'
      });
      
      if (fetchError) throw fetchError;
      if (data?.status === 'error') {
        if (data.code === 'MISSING_CREDENTIALS') {
          throw new Error('MISSING_CREDENTIALS');
        }
        throw new Error(data.error);
      }

      // Meta returns templates in data.data
      setTemplates(data?.data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.message === 'MISSING_CREDENTIALS' ? 'MISSING_CREDENTIALS' : (err.message || 'Failed to load templates from Meta API'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (template) => {
    if (!testPhone) {
      alert('Please enter a test phone number first.');
      return;
    }
    
    // Simplistic send - in reality you might need variables
    const components = [];
    const bodyText = template.components?.find(c => c.type === 'BODY')?.text || '';
    const matches = bodyText.match(/\{\{\d+\}\}/g) || [];
    if (matches.length > 0) {
      components.push({
        type: 'body',
        parameters: matches.map(() => ({ type: 'text', text: '123456' }))
      });
    }

    const templatePayload = {
      name: template.name,
      language: {
        code: template.language
      },
      components: components.length > 0 ? components : undefined
    };
    
    try {
      setSending(true);
      setActiveTemplate(template.id);
      const { data, error: sendError } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phone: testPhone,
          type: 'template',
          template: templatePayload
        }
      });
      
      if (sendError) throw sendError;
      if (data?.status === 'error' || data?.error) {
        throw new Error(data.error || 'Failed to send template message');
      }
      
      alert('Template test message sent successfully!');
      setActiveTemplate(null);
    } catch (err) {
      alert('Failed to send template: ' + (err.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-green-600" />
            WhatsApp Templates
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your Meta-approved message templates for notifications and campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchTemplates}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            Refresh
          </button>
          <a 
            href="https://business.facebook.com/wa/manage/message-templates/" 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Template
          </a>
        </div>
      </div>
      
      {/* Test Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Phone Number</label>
          <input
            type="text"
            value={testPhone}
            onChange={e => setTestPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <p className="text-xs text-gray-500 max-w-sm mb-2">
          Enter a phone number to send test messages from the template list below.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Fetching templates from Meta API...</p>
        </div>
      ) : error === 'MISSING_CREDENTIALS' ? (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200">
          <h3 className="font-semibold mb-2">WhatsApp Credentials Missing</h3>
          <p className="mb-2">We couldn't load your templates because the WhatsApp Business Account ID or Access Token is missing.</p>
          <p className="text-sm">Please set the <strong>WHATSAPP_BUSINESS_ACCOUNT_ID</strong> in your Supabase project secrets and try again.</p>
          <button onClick={fetchTemplates} className="mt-4 px-4 py-2 bg-white text-yellow-800 border border-yellow-200 rounded-md text-sm font-medium hover:bg-yellow-50">
            Check Again
          </button>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200">
          <h3 className="font-semibold mb-2">Failed to load templates</h3>
          <p>{error}</p>
          <button onClick={fetchTemplates} className="mt-4 px-4 py-2 bg-white text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-50">
            Try Again
          </button>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-gray-500 text-center">
          <Megaphone className="w-12 h-12 mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No templates found</h3>
          <p className="max-w-md mx-auto">
            You don't have any approved WhatsApp templates yet. Create one in the Meta Business Manager.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 truncate max-w-[200px]" title={template.name}>
                    {template.name}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                      {template.category}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                      {template.language}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  template.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  template.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {template.status}
                </span>
              </div>
              
              <div className="p-4 flex-1 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap font-mono relative">
                {template.components?.find(c => c.type === 'BODY')?.text || 'No body content'}
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => handleSendTest(template)}
                  disabled={sending || template.status !== 'APPROVED'}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending && activeTemplate === template.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Test Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
