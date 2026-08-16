import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, BellRing, Save, Search, Filter } from 'lucide-react';
import EventTable from './notifications/EventTable';
import PreviewDrawer from './notifications/PreviewDrawer';
import VariableMappingModal from './notifications/VariableMappingModal';
import TestSendModal from './notifications/TestSendModal';
import LogsDrawer from './notifications/LogsDrawer';

export default function NotificationSettings() {
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals/Drawers
  const [activeEvent, setActiveEvent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [showTestSend, setShowTestSend] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: eventsData, error: dbError } = await supabase
        .from('notification_settings')
        .select('*')
        .order('category')
        .order('event_type');
        
      if (dbError) throw dbError;
      setEvents(eventsData || []);

      const { data: templateData, error: apiError } = await supabase.functions.invoke('whatsapp-templates', {
        method: 'GET'
      });
      
      if (!apiError && templateData?.data) {
        setTemplates(templateData.data.filter(t => t.status === 'APPROVED'));
      }
    } catch (err) {
      console.error('Error fetching notification data:', err);
      setError(err.message || 'Failed to load settings. Ensure migration 015 has been run.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Safety checks before enabling
    if (!event.is_enabled) { // user wants to turn it ON
      if (!event.template_name) {
        alert("Cannot enable: No template selected.");
        return;
      }
      // Check mappings
      const template = templates.find(t => t.name === event.template_name);
      if (template) {
        let missing = false;
        template.components?.forEach(comp => {
          const text = comp.text || '';
          const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)];
          matches.forEach(match => {
             if (!event.variable_mappings?.[comp.type.toLowerCase()]?.[match[1]]) {
               missing = true;
             }
          });
        });
        if (missing) {
          alert("Cannot enable: Please map all template variables first.");
          return;
        }
      }
    }

    const newStatus = !event.is_enabled;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_enabled: newStatus } : e));
    
    // Auto-save toggle
    try {
      await supabase.from('notification_settings').update({ is_enabled: newStatus, updated_at: new Date().toISOString() }).eq('id', eventId);
    } catch(err) {
      console.error(err);
      alert('Failed to update toggle status.');
      // Revert on fail
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_enabled: !newStatus } : e));
    }
  };

  const handleSaveMapping = async (updatedEventData) => {
    try {
      const { id, ...updates } = updatedEventData;
      updates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      setSuccessMsg('Configuration saved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save configuration: ' + err.message);
    }
  };

  const openModal = (event, type) => {
    setActiveEvent(event);
    if (type === 'preview') setShowPreview(true);
    if (type === 'mapping') setShowMapping(true);
    if (type === 'test') setShowTestSend(true);
    if (type === 'logs') setShowLogs(true);
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(events.map(e => e.category || 'Uncategorized'))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellRing className="w-6 h-6 text-green-600" />
            WhatsApp Automation
          </h1>
          <p className="text-gray-500 mt-1">
            Manage automated event-triggered notifications for customers and admins.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 shadow-sm animate-fade-in-up">
          {successMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        <div className="sm:w-64 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm appearance-none bg-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <EventTable 
        events={filteredEvents}
        templates={templates}
        onToggleEvent={handleToggleEvent}
        onPreview={(e) => openModal(e, 'preview')}
        onMapVariables={(e) => openModal(e, 'mapping')}
        onTestSend={(e) => openModal(e, 'test')}
        onViewLogs={(e) => openModal(e, 'logs')}
      />

      {/* Modals & Drawers */}
      <PreviewDrawer 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        event={activeEvent}
        templates={templates}
      />
      
      <VariableMappingModal 
        isOpen={showMapping} 
        onClose={() => setShowMapping(false)} 
        event={activeEvent}
        templates={templates}
        onSave={handleSaveMapping}
      />

      <TestSendModal 
        isOpen={showTestSend} 
        onClose={() => setShowTestSend(false)} 
        event={activeEvent}
        templates={templates}
      />

      <LogsDrawer 
        isOpen={showLogs} 
        onClose={() => setShowLogs(false)} 
        event={activeEvent}
      />

    </div>
  );
}
