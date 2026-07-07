import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User, Phone, Loader2, MessageSquare } from 'lucide-react';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activePhone, setActivePhone] = useState(null);
  const [activeName, setActiveName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch all messages initially
  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime database changes
    const channel = supabase
      .channel('whatsapp_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages'
        },
        (payload) => {
          console.log('New realtime message:', payload.new);
          setMessages(prev => {
            // Avoid duplicate messages
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Recalculate unique contacts when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    // Group by sender_phone and find the latest message for each
    const contactsMap = {};
    
    // Process messages in chronological order so the latest one overrides
    const sortedMessages = [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    sortedMessages.forEach(msg => {
      // For inbound, sender is the customer. For outbound, sender_phone is the recipient.
      const phone = msg.sender_phone;
      
      contactsMap[phone] = {
        phone,
        name: msg.direction === 'inbound' ? msg.sender_name : (contactsMap[phone]?.name || 'Customer'),
        lastMessage: msg.message_body,
        lastMessageTime: msg.created_at,
        direction: msg.direction
      };
    });

    // Convert map to array and sort by latest message time descending
    const contactsList = Object.values(contactsMap).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    setContacts(contactsList);
  }, [messages]);

  // Scroll to bottom when active chat or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePhone, messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePhone) return;

    setSending(true);
    const textToSend = newMessage;
    setNewMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phone: activePhone, message: textToSend }
      });

      if (error) throw error;
      
      // If mock/success, immediately append it locally (if not caught by realtime yet)
      if (data && data.message) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
      alert(`Failed to send message: ${err.message}`);
      setNewMessage(textToSend); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  // Filter messages for the active conversation
  const activeChatMessages = messages.filter(
    msg => msg.sender_phone === activePhone
  );

  return (
    <div className="flex h-[calc(100vh-10rem)] border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/* Left Pane - Contact List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            WhatsApp Chats
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real-time customer inbox</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && contacts.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-medium">No chats found</p>
              <p className="text-xs mt-1">Incoming WhatsApp messages will appear here.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.phone}
                onClick={() => {
                  setActivePhone(contact.phone);
                  setActiveName(contact.name);
                }}
                className={`w-full text-left p-4 border-b border-gray-100 flex items-start gap-3 transition-colors ${
                  activePhone === contact.phone
                    ? 'bg-green-50/70 border-l-4 border-l-green-600'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {contact.name || 'WhatsApp User'}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.phone}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-1">
                    {contact.direction === 'outbound' ? 'You: ' : ''}
                    {contact.lastMessage}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div className="w-2/3 flex flex-col bg-white">
        {activePhone ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">{activeName || 'Customer'}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {activePhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
              {activeChatMessages.map((msg) => {
                const isInbound = msg.direction === 'inbound';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        isInbound
                          ? 'bg-white text-gray-800 rounded-tl-none'
                          : 'bg-green-600 text-white rounded-tr-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message_body}</p>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isInbound ? 'text-gray-400' : 'text-green-100'
                        }`}
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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">No Chat Selected</h3>
            <p className="text-sm max-w-sm mt-1">
              Select a customer from the left sidebar to view history and send messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
