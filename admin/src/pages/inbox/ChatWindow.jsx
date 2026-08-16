import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, User, Phone, Loader2, Image as ImageIcon, FileText, Paperclip, Megaphone, X, MessageSquare } from 'lucide-react';

function WhatsAppMedia({ path }) {
  const [url, setUrl] = useState(null);
  
  useEffect(() => {
    async function loadUrl() {
      const { data, error } = await supabase.storage.from('whatsapp_media').createSignedUrl(path, 3600);
      if (data?.signedUrl) {
        setUrl(data.signedUrl);
      }
    }
    if (path) loadUrl();
  }, [path]);

  if (!url) return (
    <div className="flex items-center justify-center bg-black/10 rounded-lg w-full h-32">
      <Loader2 className="w-5 h-5 animate-spin text-black/50" />
    </div>
  );
  
  if (path.endsWith('.pdf')) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded-md hover:bg-black/10 transition">
        <FileText className="w-4 h-4" />
        <span className="text-sm underline">View Document</span>
      </a>
    );
  }
  
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="Media attachment" className="max-w-full rounded-lg max-h-64 object-contain cursor-pointer" />
    </a>
  );
}

// Default Swadyum Quick Replies
const QUICK_REPLIES = [
  { label: 'Greeting', text: 'Hi! Thank you for contacting Swadyum. How can we help you today?' },
  { label: 'Damaged Item Protocol', text: 'We are so sorry to hear your pickle jar arrived damaged! Please share a photo of the damaged jar and the packaging, and we will arrange a replacement immediately.' },
  { label: 'Delivery Delay', text: 'We sincerely apologize for the delay in your delivery. Let me check the exact status with our courier partner and get back to you.' },
  { label: 'Order Update', text: 'Your order has been freshly packed and dispatched. You will receive a tracking link via SMS shortly!' }
];

export default function ChatWindow({
  activeChat,
  messages,
  onSendMessage,
  onSendMedia,
  onSendTemplate,
  templates,
  loadingTemplates,
  sending
}) {
  const [newMessage, setNewMessage] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  if (!activeChat) {
    return (
      <div className="w-1/3 border-r border-gray-200 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-white">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-lg text-gray-800">No Chat Selected</h3>
        <p className="text-sm max-w-sm mt-1">
          Select a customer from the list to view history and send messages.
        </p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendMedia(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeSendTemplate = () => {
    onSendTemplate(selectedTemplate, templateVariables);
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setTemplateVariables({});
  };

  return (
    <div className="w-1/3 flex flex-col bg-white border-r border-gray-200 h-full relative">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{activeChat.display_name || 'Customer'}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {activeChat.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#e5ddd5] space-y-4" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', opacity: 0.9 }}>
        {messages.map((msg) => {
          const isInbound = msg.direction === 'inbound';
          const isUnsupported = msg.message_type && !['text', 'image', 'document', 'template'].includes(msg.message_type);

          return (
            <div
              key={msg.id}
              className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 pt-2 pb-1 shadow-sm text-sm relative ${
                  isInbound
                    ? 'bg-white text-gray-800 rounded-tl-none'
                    : 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                }`}
              >
                {msg.media_path && (
                  <div className="mb-2">
                    <WhatsAppMedia path={msg.media_path} />
                  </div>
                )}
                
                {isUnsupported ? (
                  <div className="italic text-gray-500 bg-gray-100 p-2 rounded border border-gray-200">
                    [Unsupported message type: {msg.message_type}]
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap mb-2">{msg.message || msg.message_body}</p>
                )}
                
                <div
                  className="text-[10px] text-gray-500 text-right mt-1 ml-4"
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-gray-100 p-3 relative">
        {showQuickReplies && (
          <div className="absolute bottom-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
            <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              Quick Replies
            </div>
            {QUICK_REPLIES.map((qr, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setNewMessage(qr.text);
                  setShowQuickReplies(false);
                }}
                className="w-full text-left p-3 hover:bg-gray-50 text-sm border-b border-gray-100 transition"
              >
                <div className="font-medium text-green-700">{qr.label}</div>
                <div className="text-gray-500 truncate">{qr.text}</div>
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-center bg-white rounded-full px-2 py-1 shadow-sm">
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="p-2 text-gray-400 hover:text-green-600 rounded-full transition-colors"
            title="Send Template"
          >
            <Megaphone className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-green-600 rounded-full transition-colors"
            title="Attach Media"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept="image/*,application/pdf" 
          />
          <button
            type="button"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`text-xs font-bold px-2 py-1 rounded-full border transition-colors ${showQuickReplies ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`}
          >
            QR
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setShowQuickReplies(false)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none disabled:opacity-50"
          />
          
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !fileInputRef.current?.files?.length)}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full transition-colors flex items-center justify-center shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-1" />
            )}
          </button>
        </form>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Send WhatsApp Template</h2>
              <button onClick={() => { setShowTemplateModal(false); setSelectedTemplate(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {!selectedTemplate ? (
                loadingTemplates ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
                ) : templates.length === 0 ? (
                  <p className="text-center text-gray-500">No approved templates found.</p>
                ) : (
                  <div className="space-y-3">
                    {templates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplate(t);
                          setTemplateVariables({});
                        }}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                      >
                        <h4 className="font-semibold text-gray-900">{t.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {t.components?.find(c => c.type === 'BODY')?.text}
                        </p>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Selected Template: {selectedTemplate.name}</h4>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedTemplate.components?.find(c => c.type === 'BODY')?.text}
                    </div>
                  </div>
                  
                  {(() => {
                    const bodyText = selectedTemplate.components?.find(c => c.type === 'BODY')?.text || '';
                    const matches = bodyText.match(/\{\{\d+\}\}/g) || [];
                    const uniqueVars = [...new Set(matches)].map(v => v.replace(/[{}]/g, ''));
                    
                    if (uniqueVars.length === 0) return <p className="text-sm text-gray-500">No variables required for this template.</p>;
                    
                    return (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-gray-700">Template Variables</h4>
                        {uniqueVars.map(v => (
                          <div key={v}>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Variable {`{{${v}}}`}</label>
                            <input
                              type="text"
                              value={templateVariables[v] || ''}
                              onChange={e => setTemplateVariables(prev => ({ ...prev, [v]: e.target.value }))}
                              placeholder={`Value for {{${v}}}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => setTemplateVariables(prev => ({ ...prev, [v]: activeChat.display_name || 'Customer' }))} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Fill Name</button>
                              <button onClick={() => setTemplateVariables(prev => ({ ...prev, [v]: 'Swadyum' }))} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Fill 'Swadyum'</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => {
                  if (selectedTemplate) setSelectedTemplate(null);
                  else setShowTemplateModal(false);
                }} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                {selectedTemplate ? 'Back' : 'Cancel'}
              </button>
              {selectedTemplate && (
                <button
                  onClick={executeSendTemplate}
                  disabled={sending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
