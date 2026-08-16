import React, { useState, useEffect } from 'react';
import { X, Save, Settings, AlertTriangle } from 'lucide-react';

const AVAILABLE_FIELDS = [
  { id: 'customer_name', label: 'Customer Name' },
  { id: 'phone', label: 'Customer Phone' },
  { id: 'order_id', label: 'Order Number (ID)' },
  { id: 'order_total', label: 'Total Amount' },
  { id: 'payment_status', label: 'Payment Status' },
  { id: 'shipping_status', label: 'Shipping Status' },
  { id: 'tracking_link', label: 'Tracking URL' },
  { id: 'estimated_delivery', label: 'Estimated Delivery Date' },
  { id: 'product_names', label: 'Product Names' },
  { id: 'support_phone', label: 'Support Phone' }
];

export default function VariableMappingModal({ isOpen, onClose, event, templates, onSave }) {
  const [templateName, setTemplateName] = useState('');
  const [mappings, setMappings] = useState({});
  const [conditions, setConditions] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (event && isOpen) {
      setTemplateName(event.template_name || '');
      setMappings(event.variable_mappings || {});
      setConditions(event.conditions || {});
      setError(null);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const getTemplateVariables = (tName) => {
    const template = templates.find(t => t.name === tName);
    if (!template || !template.components) return [];

    const variables = [];
    template.components.forEach(comp => {
      const text = comp.text || '';
      const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
      matches.forEach(match => {
        const index = match[1];
        if (!variables.find(v => v.type === comp.type.toLowerCase() && v.index === index)) {
          variables.push({ type: comp.type.toLowerCase(), index });
        }
      });
    });
    return variables.sort((a, b) => parseInt(a.index) - parseInt(b.index));
  };

  const handleMappingChange = (compType, varIndex, fieldId) => {
    setMappings(prev => ({
      ...prev,
      [compType]: {
        ...(prev[compType] || {}),
        [varIndex]: fieldId
      }
    }));
  };

  const handleSave = () => {
    if (!templateName && event.is_enabled) {
      setError("You must select a template if the event is enabled.");
      return;
    }

    const requiredVars = getTemplateVariables(templateName);
    let missing = false;
    requiredVars.forEach(v => {
      if (!mappings[v.type]?.[v.index]) {
        missing = true;
      }
    });

    if (missing) {
      setError("Please map all required template variables.");
      return;
    }

    // Find the template language
    const templateLanguage = templates.find(t => t.name === templateName)?.language;

    onSave({
      id: event.id,
      template_name: templateName,
      template_language: templateLanguage,
      variable_mappings: mappings,
      conditions: conditions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">Configure Event: {event.event_type.replace(/_/g, ' ')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm flex gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {event.event_type === 'damaged_wrong_order_support' && (
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg border border-orange-200 text-sm flex gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span><strong>Swadyum Policy:</strong> Do not use generic return/refund language here. Use "damaged/wrong-order support" wording appropriate for food products.</span>
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Template</label>
            <p className="text-xs text-gray-500 mb-2">Select the approved Meta template to use for this event.</p>
            <select
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                setMappings({});
              }}
              className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md"
            >
              <option value="">-- None Selected --</option>
              {templates.map(t => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.language}) - {t.category}
                </option>
              ))}
            </select>
          </div>

          {/* Variable Mappings */}
          {templateName && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Variable Mapping</h3>
              <p className="text-xs text-gray-500 mb-4">Map the dynamic fields in your template (e.g. {'{{1}}'}) to Swadyum system data.</p>
              
              {getTemplateVariables(templateName).length > 0 ? (
                <div className="space-y-3">
                  {getTemplateVariables(templateName).map(v => (
                    <div key={`${v.type}-${v.index}`} className="flex items-center gap-3">
                      <span className="w-16 text-gray-600 font-mono text-xs bg-white px-2 py-1.5 rounded border border-gray-200 text-center shadow-sm">
                        {v.type === 'header' ? 'HDR' : 'BDY'} {'{{'}{v.index}{'}}'}
                      </span>
                      <span className="text-gray-400 text-sm">→</span>
                      <select
                        value={mappings[v.type]?.[v.index] || ''}
                        onChange={(e) => handleMappingChange(v.type, v.index, e.target.value)}
                        className="flex-1 block w-full pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md border bg-white"
                      >
                        <option value="" className="text-gray-400">Select system field...</option>
                        {AVAILABLE_FIELDS.map(f => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic py-2">This template has no dynamic variables.</p>
              )}
            </div>
          )}

          {/* Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Conditions</label>
            <p className="text-xs text-gray-500 mb-2">Optional rules for when this notification should be sent.</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={conditions.requires_consent || false}
                  onChange={(e) => setConditions(c => ({...c, requires_consent: e.target.checked}))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Only send if customer has opted-in to WhatsApp updates</span>
              </label>

              {event.event_type === 'out_for_delivery' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conditions.requires_tracking || false}
                    onChange={(e) => setConditions(c => ({...c, requires_tracking: e.target.checked}))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Only send if a tracking link exists</span>
                </label>
              )}

              {event.event_type === 'review_request' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-700">Send</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={conditions.delay_days || 3}
                    onChange={(e) => setConditions(c => ({...c, delay_days: parseInt(e.target.value)}))}
                    className="w-16 border-gray-300 rounded text-sm px-2 py-1"
                  />
                  <span className="text-sm text-gray-700">days after delivery</span>
                </div>
              )}
            </div>
          </div>

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
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
