import React from 'react';
import { X, Smartphone, AlertTriangle } from 'lucide-react';

export default function PreviewDrawer({ isOpen, onClose, event, templates }) {
  if (!isOpen || !event) return null;

  const template = templates?.find(t => t.name === event.template_name);
  const mappings = event.variable_mappings || {};

  // Mock data for preview rendering
  const mockData = {
    customer_name: 'Aditi Sharma',
    order_number: 'ORD-54321',
    order_date: new Date().toLocaleDateString(),
    total_amount: '₹1,250',
    payment_status: 'Paid',
    payment_method: 'UPI',
    product_names: 'Assorted Sweets Box',
    variant_names: '500g',
    delivery_address: '123 Main Street, Bangalore',
    tracking_number: 'DEL123456789',
    tracking_url: 'https://track.swadyum.com/DEL123456789',
    courier_name: 'Delhivery',
    support_phone: '+91 98765 43210',
    brand_name: 'Swadyum'
  };

  const renderTemplateText = (component) => {
    if (!component || !component.text) return '';
    let text = component.text;
    
    // Replace {{1}}, {{2}} with mapped mock data or highlight missing
    const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
    matches.forEach(match => {
      const index = match[1];
      const compType = component.type.toLowerCase();
      const mappedField = mappings[compType]?.[index];
      
      if (mappedField && mockData[mappedField]) {
        text = text.replace(`{{${index}}}`, `**${mockData[mappedField]}**`);
      } else {
        text = text.replace(`{{${index}}}`, `<span class="bg-red-100 text-red-700 px-1 rounded">{{${index}: Missing}}</span>`);
      }
    });

    // Simple markdown to HTML for bold ( WhatsApp uses *bold* but Meta API returns it differently sometimes, handle both )
    text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\n/g, '<br/>');

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const hasMissingVariables = () => {
    if (!template || !template.components) return false;
    let missing = false;
    template.components.forEach(comp => {
      const text = comp.text || '';
      const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
      matches.forEach(match => {
        const index = match[1];
        const compType = comp.type.toLowerCase();
        if (!mappings[compType]?.[index]) {
          missing = true;
        }
      });
    });
    return missing;
  };

  const formatEventName = (eventName) => {
    if(!eventName) return '';
    return eventName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Template Preview</h2>
            <p className="text-sm text-gray-500">{formatEventName(event.event_type)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          
          {hasMissingVariables() && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Missing Variables</h4>
                <p className="text-xs mt-1">This template requires variables that haven't been mapped. It will fail to send until all variables are mapped.</p>
              </div>
            </div>
          )}

          {!template ? (
            <div className="text-center text-gray-500 py-10">
              <p>No template selected for this event.</p>
            </div>
          ) : (
            <div className="bg-[#EFEAE2] rounded-xl p-4 shadow-inner relative max-w-[320px] mx-auto border-[8px] border-gray-800 h-[600px] flex flex-col">
              {/* Phone Mockup Header */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-xl flex justify-center">
                <div className="w-16 h-1.5 bg-gray-600 rounded-full mt-2"></div>
              </div>

              <div className="mt-6 flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Swadyum</p>
                  <p className="text-xs text-gray-500">Business Account</p>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm text-sm text-gray-800 relative w-full mb-2">
                {/* Header Component */}
                {template.components.find(c => c.type === 'HEADER') && (
                  <div className="font-bold mb-2 text-[15px]">
                    {renderTemplateText(template.components.find(c => c.type === 'HEADER'))}
                  </div>
                )}
                
                {/* Body Component */}
                {template.components.find(c => c.type === 'BODY') && (
                  <div className="whitespace-pre-wrap text-[14.2px] leading-relaxed">
                    {renderTemplateText(template.components.find(c => c.type === 'BODY'))}
                  </div>
                )}

                {/* Footer Component */}
                {template.components.find(c => c.type === 'FOOTER') && (
                  <div className="text-xs text-gray-500 mt-2">
                    {template.components.find(c => c.type === 'FOOTER').text}
                  </div>
                )}
              </div>

              {/* Buttons */}
              {template.components.find(c => c.type === 'BUTTONS') && (
                <div className="flex flex-col gap-1 w-full">
                  {template.components.find(c => c.type === 'BUTTONS').buttons?.map((btn, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-2.5 text-center text-[#00A884] font-medium text-[15px] shadow-sm cursor-pointer hover:bg-gray-50">
                      {btn.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {template && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Template Info</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="text-gray-900 font-medium text-right">{template.name}</span>
                <span className="text-gray-500">Language:</span>
                <span className="text-gray-900 font-medium text-right">{template.language}</span>
                <span className="text-gray-500">Status:</span>
                <span className="text-green-600 font-medium text-right">{template.status}</span>
                <span className="text-gray-500">Category:</span>
                <span className="text-gray-900 font-medium text-right">{template.category}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
