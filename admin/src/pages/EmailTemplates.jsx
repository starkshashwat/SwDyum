import { useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';
import { toast } from 'react-hot-toast';
import { Mail, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({ name: '', subject: '', body_html: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/automations/config/templates', { channel: 'email' });
      setTemplates(res?.data || []);
    } catch (error) {
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (template = null) => {
    if (template) {
      setCurrentTemplate({ ...template });
    } else {
      setCurrentTemplate({ name: '', subject: '', body_html: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTemplate({ name: '', subject: '', body_html: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body_html) {
      toast.error('All fields are required');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/automations/config/templates?channel=email', currentTemplate);
      toast.success('Template saved successfully');
      fetchTemplates();
      closeModal();
    } catch (error) {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Email Templates
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage HTML templates used in automations.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-black hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Email Templates</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">Create your first HTML email template to use in customer automations.</p>
          <button
            onClick={() => openModal()}
            className="mt-6 text-black border border-black hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 truncate pr-4">{tmpl.name}</h3>
                <button
                  onClick={() => openModal(tmpl)}
                  className="text-gray-400 hover:text-blue-600 shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-500 line-clamp-2 mb-4">
                <strong>Subject:</strong> {tmpl.subject}
              </div>
              <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100 flex justify-between">
                <span>Updated: {new Date(tmpl.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {currentTemplate.id ? 'Edit Template' : 'Create Template'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name</label>
                <input
                  type="text"
                  required
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Abandoned Cart Reminder 1"
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  required
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Did you forget something, {{customer_name}}?"
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Available variables: {'{{customer_name}}'}, {'{{cart_value}}'}, {'{{cart_url}}'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body</label>
                <textarea
                  required
                  rows={10}
                  value={currentTemplate.body_html}
                  onChange={(e) => setCurrentTemplate(prev => ({ ...prev, body_html: e.target.value }))}
                  placeholder="<h1>Hi {{customer_name}},</h1><p>Your cart is waiting!</p>"
                  className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-black focus:border-black sm:text-sm font-mono"
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Template</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
