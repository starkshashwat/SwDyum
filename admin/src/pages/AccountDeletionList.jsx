import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AccountDeletionList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (err) throw err;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessRequest = async (id, userId) => {
    if (!window.confirm("Are you sure you want to process this deletion? This will anonymize the user's profile and mark the request as Processed.")) {
      return;
    }

    try {
      // 1. Anonymize user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: 'Deleted User',
          email: 'deleted_' + userId + '@anonymized.local',
          phone: null,
          address: null,
          city: null,
          state: null,
          zip: null
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 2. Mark request as processed
      const { error: reqError } = await supabase
        .from('account_deletion_requests')
        .update({
          status: 'Processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (reqError) throw reqError;

      // Note: Full auth user deletion is typically done via Supabase Admin API 
      // or edge function with service role. Here we do anonymization which preserves
      // order history constraints.

      alert('User anonymized and request processed successfully.');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Error processing request: ' + err.message);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.email?.toLowerCase().includes(search.toLowerCase()) || 
    req.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Deletion Requests</h1>
          <p className="text-gray-500">Manage user account deletion requests (Meta/WhatsApp compliance).</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredRequests.length} Requests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">User Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Requested At</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No deletion requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500">ID: {req.user_id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{req.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'Pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock size={12} /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Processed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleProcessRequest(req.id, req.user_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors"
                        >
                          <Trash2 size={16} /> Process & Anonymize
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletionList;
