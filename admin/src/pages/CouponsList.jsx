// ============================================================================
// pages/CouponsList.jsx
// ----------------------------------------------------------------------------
// Coupon manager screen. Wired to the backend API:
//   GET    /api/coupons?search=&limit=       (list, searchable by code)
//   POST   /api/coupons                        (create coupon)
//   PUT    /api/coupons/:id                    (update coupon)
//   PATCH  /api/coupons/:id                    (toggle is_active)
//   DELETE /api/coupons/:id                     (delete coupon)
//
// Coupon fields (backend/src/validators/coupon.schema.js):
//   { code (uppercased, [A-Za-z0-9_-]), description?, discount_type
//     ('percentage'|'fixed'), discount_value (>0), min_order_value (>=0),
//     max_uses? (positive int, nullable), expiry_date? (ISO datetime, nullable),
//     is_active }
//   `used_count` is system-managed (incremented by checkout logic) and is
//   read-only here — it's returned by GET but never accepted on create/update.
//
// NOTE: The legacy version of this page queried a `coupon_usage` table directly
// via Supabase to show per-coupon usage stats. That table is NOT exposed
// through the backend API, so the usage-stats feature has been removed to
// comply with the "never call Supabase directly" constraint. If usage stats
// are needed later, a dedicated backend route must be added first.
// ============================================================================

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, X, Loader2, Save, Search } from 'lucide-react';
import { apiClient, ApiError } from '../lib/apiClient';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '0',
  max_uses: '',
  expiry_date: '',
  is_active: true,
};

// Convert an ISO string to the value expected by <input type="datetime-local">.
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromLocalInput = (val) => (val ? new Date(val).toISOString() : null);

export default function CouponsList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      const res = await apiClient.get('/coupons', params);
      setCoupons(res?.data || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value ?? '',
      min_order_value: coupon.min_order_value ?? '0',
      max_uses: coupon.max_uses ?? '',
      expiry_date: toLocalInput(coupon.expiry_date),
      is_active: coupon.is_active ?? true,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // The backend uppercases the code; we mirror that in the UI.
      ...(name === 'code' && { code: value.toUpperCase() }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload = {
      code: form.code,
      description: form.description || undefined,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order_value: Number(form.min_order_value) || 0,
      max_uses: form.max_uses === '' ? null : Number(form.max_uses),
      expiry_date: fromLocalInput(form.expiry_date),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const res = await apiClient.put(`/coupons/${editingId}`, payload);
        setCoupons((prev) => prev.map((c) => (c.id === editingId ? res?.data : c)));
      } else {
        const res = await apiClient.post('/coupons', payload);
        setCoupons((prev) => [res?.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details?.fieldErrors) setFieldErrors(err.details.fieldErrors);
      } else {
        setError('Failed to save coupon.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(`Error deleting coupon: ${err instanceof ApiError ? err.message : 'Unknown error'}`);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/coupons/${id}`, { is_active: !currentStatus });
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c)));
    } catch (err) {
      alert(`Error updating coupon: ${err instanceof ApiError ? err.message : 'Unknown error'}`);
    }
  };

  const fmtExpiry = (iso) => (iso ? new Date(iso).toLocaleString() : 'No expiry');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Discount codes customers can apply at checkout.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCoupons()}
            placeholder="Search by code..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
        <button onClick={fetchCoupons}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm">
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading coupons...</td></tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No coupons yet. Click "Create Coupon" to add one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                      {coupon.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{coupon.description}</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 capitalize">{coupon.discount_type}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {coupon.discount_type === 'percentage'
                        ? `${Number(coupon.discount_value)}%`
                        : `₹${Number(coupon.discount_value).toFixed(2)}`}
                    </td>
                    <td className="p-4 text-gray-600">₹{Number(coupon.min_order_value || 0).toFixed(2)}</td>
                    <td className="p-4 text-gray-600">
                      {coupon.used_count || 0}
                      {coupon.max_uses != null ? ` / ${coupon.max_uses}` : ' / ∞'}
                    </td>
                    <td className="p-4 text-xs text-gray-600">{fmtExpiry(coupon.expiry_date)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${coupon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(coupon)}
                        className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors inline-flex">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors inline-flex">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Code *</label>
                <input type="text" name="code" required value={form.code} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm font-mono uppercase"
                  placeholder="e.g. SUMMER15" />
                <p className="text-xs text-gray-500">Letters, numbers, hyphens and underscores only. Auto-uppercased.</p>
                {fieldErrors.code && <p className="text-xs text-red-600">{fieldErrors.code.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={2} value={form.description} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Discount Type *</label>
                  <select name="discount_type" value={form.discount_type} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input type="number" step="0.01" min="0" name="discount_value" required value={form.discount_value} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
                  {fieldErrors.discount_value && <p className="text-xs text-red-600">{fieldErrors.discount_value.join(', ')}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Min Order Value (₹)</label>
                  <input type="number" step="0.01" min="0" name="min_order_value" value={form.min_order_value} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Max Uses</label>
                  <input type="number" min="1" name="max_uses" value={form.max_uses} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Leave blank for unlimited" />
                  {fieldErrors.max_uses && <p className="text-xs text-red-600">{fieldErrors.max_uses.join(', ')}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input type="datetime-local" name="expiry_date" value={form.expiry_date} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm" />
                <p className="text-xs text-gray-500">Leave blank for no expiry.</p>
                {fieldErrors.expiry_date && <p className="text-xs text-red-600">{fieldErrors.expiry_date.join(', ')}</p>}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center px-5 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
