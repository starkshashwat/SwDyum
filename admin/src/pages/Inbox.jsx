import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ChatList from './inbox/ChatList';
import ChatWindow from './inbox/ChatWindow';
import CustomerContext from './inbox/CustomerContext';

export default function Inbox() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Templates
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Initialize and subscribe
  useEffect(() => {
    fetchChats();
    fetchTemplates();

    // Subscribe to Chats (New, Updates)
    const chatsChannel = supabase
      .channel('whatsapp_chats_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_chats' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setChats(prev => [payload.new, ...prev].sort((a,b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
          } else if (payload.eventType === 'UPDATE') {
            setChats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c).sort((a,b) => new Date(b.last_message_at) - new Date(a.last_message_at)));
            setActiveChat(prev => prev?.id === payload.new.id ? payload.new : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
    };
  }, []);

  // Subscribe to messages for active chat
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    fetchMessages(activeChat.id);

    const messagesChannel = supabase
      .channel(`whatsapp_messages_${activeChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `chat_id=eq.${activeChat.id}` },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          // If we receive a message in the active chat and it's inbound, we can optionally clear unread_count here
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [activeChat?.id]); // Note: using activeChat?.id so we only resubscribe if ID changes

  // Clear unread count when a chat becomes active
  useEffect(() => {
    if (activeChat && activeChat.unread_count > 0) {
      clearUnreadCount(activeChat.id);
    }
  }, [activeChat]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_chats')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      setChats(data || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-templates', { method: 'GET' });
      if (!error && data?.status === 'success') {
        setTemplates(data.data.filter(t => t.status === 'APPROVED'));
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const clearUnreadCount = async (chatId) => {
    try {
      // Optimistic update
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c));
      await supabase.from('whatsapp_chats').update({ unread_count: 0 }).eq('id', chatId);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for sending messages
  const handleSendMessage = async (text) => {
    if (!activeChat) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phone: activeChat.phone, message: text }
      });
      if (error) throw error;
      if (data && data.message) {
        // Optimistic update (trigger will also fire)
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendMedia = async (file) => {
    if (!activeChat) return;
    setSending(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `inbox/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('whatsapp_media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('whatsapp_media').getPublicUrl(filePath);
      const type = file.type.startsWith('image/') ? 'image' : 'document';
      
      const { error: sendError, data } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { phone: activeChat.phone, type, mediaUrl: publicUrl, message: file.name }
      });
      if (sendError) throw sendError;
      
      if (data && data.message) {
        setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send file: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async (selectedTemplate, templateVariables) => {
    if (!activeChat) return;
    setSending(true);
    try {
       const components = [];
       if (Object.keys(templateVariables).length > 0) {
         const parameters = Object.keys(templateVariables).sort((a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b)).map(k => ({
           type: 'text',
           text: templateVariables[k]
         }));
         components.push({ type: 'body', parameters });
       }
       
       const templatePayload = {
         name: selectedTemplate.name,
         language: { code: selectedTemplate.language },
         components: components.length > 0 ? components : undefined
       };

       const { error, data } = await supabase.functions.invoke('send-whatsapp-message', {
         body: { phone: activeChat.phone, type: 'template', template: templatePayload }
       });
       if (error) throw error;
       
       if (data && data.message) {
         setMessages(prev => prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]);
       }
    } catch (err) {
      console.error(err);
      alert('Failed to send template: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateChat = (chatId, updates) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, ...updates } : c));
    if (activeChat?.id === chatId) {
      setActiveChat(prev => ({ ...prev, ...updates }));
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <ChatList 
        chats={chats}
        activeChatId={activeChat?.id}
        onSelectChat={setActiveChat}
        loading={loadingChats}
      />
      <ChatWindow
        activeChat={activeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        onSendTemplate={handleSendTemplate}
        templates={templates}
        loadingTemplates={loadingTemplates}
        sending={sending}
      />
      <CustomerContext
        activeChat={activeChat}
        onUpdateChat={handleUpdateChat}
      />
    </div>
  );
}
