import React, { useState } from 'react';
import { X, Play, Loader2, Smartphone, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TestSendModal({ isOpen, onClose, event, templates }) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !event) return null;

  const template = templates?.find(t => t.name === event.template_name);

  const handleTestSend = async () => {
    if (!phone) {
      setResult({ type: 'error', message: 'Please enter a valid WhatsApp number.' });
      return;
    }
    if (!template) {
      setResult({ type: 'error', message: 'No template selected for this event.' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      // Create mock parameters based on the template's required variables
      const components = [];
      const mappings = event.variable_mappings || {};
      
      const mockData = {
        customer_name: 'Test Customer',
        phone: phone,
        order_id: 'TEST-12345',
        order_total: '₹999',
        payment_status: 'Paid',
        shipping_status: 'Shipped',
        tracking_link: 'https://track.swadyum.com/test',
        estimated_delivery: new Date(Date.now() + 86400000*3).toLocaleDateString(),
        product_names: 'Test Product Box',
        support_phone: '+91 99999 99999'
      };

      if (template.components) {
        template.components.forEach(comp => {
          const compType = comp.type.toLowerCase();
          const text = comp.text || '';
          const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
          
          if (matches.length > 0) {
            const parameters = matches.map(match => {
              const index = match[1];
              const mappedField = mappings[compType]?.[index];
              return {
                type: 'text',
                text: (mappedField && mockData[mappedField]) ? mockData[mappedField] : `[Missing: ${index}]`
              };
            });
            
            components.push({ type: comp.type.toLowerCase(), parameters });
          }
        });
      }

      const templatePayload = {
        name: template.name,
        language: { code: template.language },
        components: components.length > 0 ? components : undefined
      };

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phone, type: 'template', template: templatePayload }
      });

      if (error) throw error;

      if (data?.error) {
        setResult({ type: 'error', message: data.error });
      } else {
        setResult({ type: 'success', message: 'Test message sent successfully! Check your WhatsApp.' });
      }

    } catch (err) {
      console.error('Test send error:', err);
      setResult({ type: 'error', message: err.message || 'Failed to send test message.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-600" />
            Test Notification
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Send a mock notification for <strong>{event.event_type.replace(/_/g, ' ')}</strong> to verify the template formatting on a real device.
          </p>

          {!template ? (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>You must assign and map a template before testing.</span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Test Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +91).</p>
            </div>
          )}

          {result && (
            <div className={`p-3 rounded-lg text-sm border ${result.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              {result.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTestSend}
            disabled={!template || sending || !phone}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Send Test Message
          </button>
        </div>
      </div>
    </div>
  );
}
