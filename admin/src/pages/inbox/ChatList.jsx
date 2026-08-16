import React, { useState } from 'react';
import { Search, Filter, MessageSquare, User } from 'lucide-react';

export default function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  loading
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Open, Unread, Resolved

  const filteredChats = chats.filter(chat => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (chat.display_name || '').toLowerCase().includes(searchLower) ||
      (chat.phone || '').includes(searchLower) ||
      (chat.last_message || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Filter
    if (statusFilter === 'Unread') return chat.unread_count > 0;
    if (statusFilter === 'Open') return chat.status === 'New' || chat.status === 'Open';
    if (statusFilter === 'Resolved') return chat.status === 'Resolved';
    return true; // All
  });

  return (
    <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Inbox
          </h2>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 py-1 pl-2 pr-8"
          >
            <option value="All">All Chats</option>
            <option value="Open">Open</option>
            <option value="Unread">Unread</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && chats.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">No chats found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full text-left p-4 border-b border-gray-100 flex items-start gap-3 transition-colors relative ${
                activeChatId === chat.id
                  ? 'bg-green-50/70 border-l-4 border-l-green-600'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                {chat.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {chat.unread_count > 99 ? '99+' : chat.unread_count}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`font-semibold text-sm truncate ${chat.unread_count > 0 ? 'text-black' : 'text-gray-900'}`}>
                    {chat.display_name || chat.phone}
                  </span>
                  <span className={`text-[10px] whitespace-nowrap ${chat.unread_count > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                
                {/* Tags preview */}
                {chat.tags && chat.tags.length > 0 && (
                  <div className="flex gap-1 mb-1 overflow-hidden">
                    {chat.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded truncate max-w-[60px]">
                        {tag}
                      </span>
                    ))}
                    {chat.tags.length > 2 && <span className="text-[9px] text-gray-400">+{chat.tags.length - 2}</span>}
                  </div>
                )}
                
                <p className={`text-xs truncate ${chat.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                  {chat.last_message}
                </p>
                
                {/* Priority Indicator */}
                {chat.priority && chat.priority !== 'Normal' && (
                  <div className="absolute bottom-2 right-2 text-[10px] text-orange-500 font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                    {chat.priority}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
