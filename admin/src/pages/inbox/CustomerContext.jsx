import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Phone, Mail, ShoppingBag, Truck, Calendar, Tag, Plus, MessageSquare, Loader2, Save } from 'lucide-react';

export default function CustomerContext({ activeChat, onUpdateChat }) {
  const [profile, setProfile] = useState(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingContext, setLoadingContext] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [updatingChat, setUpdatingChat] = useState(false);

  // Form states for Chat Controls
  const [status, setStatus] = useState('New');
  const [priority, setPriority] = useState('Normal');
  const [tagsInput, setTagsInput] = useState('');

  // Key on activeChat.id (not the object): the realtime handler replaces the
  // activeChat object on every incoming message, which used to wipe the
  // admin's in-progress status/priority/tags edits mid-typing.
  const activeChatId = activeChat?.id;
  useEffect(() => {
    if (activeChatId && activeChat) {
      setStatus(activeChat.status || 'New');
      setPriority(activeChat.priority || 'Normal');
      setTagsInput((activeChat.tags || []).join(', '));

      fetchContext();
      fetchNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  const fetchContext = async () => {
    setLoadingContext(true);
    try {
      let custId = activeChat.customer_id;
      let fetchedProfile = null;

      // If no customer_id on chat, try to find by phone
      if (!custId && activeChat.phone) {
        const cleanPhone = activeChat.phone.replace(/\D/g, '');
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .ilike('phone', `%${cleanPhone}%`)
          .limit(1)
          .single();
        if (data) {
          fetchedProfile = data;
          custId = data.id;
        }
      } else if (custId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', custId)
          .single();
        fetchedProfile = data;
      }

      setProfile(fetchedProfile);

      // Fetch Latest Order
      if (custId) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, total, status, created_at, tracking_number')
          .eq('customer_id', custId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        setLatestOrder(orderData);
      } else {
        setLatestOrder(null);
      }

    } catch (error) {
      console.error('Error fetching customer context:', error);
    } finally {
      setLoadingContext(false);
    }
  };

  const fetchNotes = async () => {
    if (!activeChat.id) return;
    try {
      const { data } = await supabase
        .from('whatsapp_notes')
        .select('*, created_by(name)')
        .eq('chat_id', activeChat.id)
        .order('created_at', { ascending: false });
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('whatsapp_notes')
        .insert({
          chat_id: activeChat.id,
          body: newNote.trim(),
          created_by: userId
        })
        .select('*, created_by(name)')
        .single();
        
      if (error) throw error;
      setNotes([data, ...notes]);
      setNewNote('');
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleUpdateChat = async () => {
    setUpdatingChat(true);
    try {
      const tagArray = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const updates = {
        status,
        priority,
        tags: tagArray
      };

      const { error } = await supabase
        .from('whatsapp_chats')
        .update(updates)
        .eq('id', activeChat.id);

      if (error) throw error;
      
      // Update local state in parent
      onUpdateChat(activeChat.id, updates);
      alert('Chat details updated.');
    } catch (err) {
      alert('Failed to update chat: ' + err.message);
    } finally {
      setUpdatingChat(false);
    }
  };

  if (!activeChat) return <div className="w-1/3 bg-gray-50 border-l border-gray-200"></div>;

  return (
    <div className="w-1/3 bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900">CRM Context</h2>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Customer Profile Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-green-600" /> Customer Details
          </h3>
          {loadingContext ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : profile ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{profile.name}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400"/> {profile.phone}</p>
                </div>
                {profile.email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400"/> {profile.email}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
              <p className="font-medium text-gray-700">Guest User</p>
              <p className="text-xs mt-1">No profile found for {activeChat.phone}</p>
            </div>
          )}
        </div>

        {/* Latest Order Card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-green-600" /> Latest Order
          </h3>
          {loadingContext ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : latestOrder ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium font-mono text-gray-900">{latestOrder.id.split('-')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-bold text-gray-900">₹{latestOrder.total}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded mt-1">
                  {latestOrder.status}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(latestOrder.created_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No recent orders found.</p>
          )}
        </div>

        {/* Chat Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" /> Chat Properties
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="Waiting Customer">Waiting Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Spam">Spam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select value={priority} onChange={(e)=>setPriority(e.target.value)} className="w-full text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500">
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Complaint, Bulk Order"
                className="w-full text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button 
              onClick={handleUpdateChat}
              disabled={updatingChat}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 rounded-md transition flex justify-center items-center gap-2"
            >
              {updatingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Properties
            </button>
          </div>
        </div>

        {/* Internal Notes */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" /> Internal Notes
          </h3>
          
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a private note..."
              className="w-full text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 min-h-[80px] p-2"
            />
            <div className="flex justify-end mt-2">
              <button 
                type="submit"
                disabled={savingNote || !newNote.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-xs font-medium py-1.5 px-3 rounded flex items-center gap-1 transition"
              >
                {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Add Note
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center italic">No internal notes yet.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.body}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500">
                    <span className="font-medium text-amber-700">{note.created_by?.name || 'Admin'}</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
