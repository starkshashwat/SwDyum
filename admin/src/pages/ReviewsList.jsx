// ============================================================================
// pages/ReviewsList.jsx
// ----------------------------------------------------------------------------
// Review moderation screen. Wired to the backend API:
//   GET    /api/reviews?product_id=&is_approved=&is_featured=&limit=
//          (admin sees ALL reviews incl. unapproved; joins products)
//   PATCH  /api/reviews/:id    (moderation only — toggle is_approved and/or
//                                is_featured; no other fields accepted by the
//                                backend moderateReviewSchema)
//   DELETE /api/reviews/:id     (delete a review)
//
// There is NO admin POST /reviews — reviews are created by customers via the
// public storefront (see backend/src/controllers/reviews.controller.js header
// comment for rationale). Admins only moderate or delete here.
//
// Review fields returned by GET: { id, product_id, customer_id?, rating (1-5),
//   comment?, is_approved, is_featured, created_at, updated_at,
//   products: { id, name, slug } }
// ============================================================================

import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Search, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'featured', label: 'Featured' },
];

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase.from('reviews').select('*, products(id, name, slug)').order('created_at', { ascending: false }).limit(100);
      if (filter === 'pending') query = query.eq('is_approved', false);
      if (filter === 'approved') query = query.eq('is_approved', true);
      if (filter === 'featured') query = query.eq('is_featured', true);
      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: !currentStatus } : r)));
    } catch (err) {
      alert(`Error updating review: ${err.message || 'Unknown error'}`);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_featured: !currentStatus }).eq('id', id);
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_featured: !currentStatus } : r)));
    } catch (err) {
      alert(`Error updating review: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this review? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(`Error deleting review: ${err.message || 'Unknown error'}`);
    }
  };

  // Client-side search over the loaded page (server search isn't supported
  // for reviews — only product_id/is_approved/is_featured filters).
  const filteredReviews = reviews.filter((r) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const inComment = r.comment?.toLowerCase().includes(term);
    const inProduct = r.products?.name?.toLowerCase().includes(term);
    return inComment || inProduct;
  });

  const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate customer reviews — approve, feature, or delete.</p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${filter === f.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comment or product..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No reviews match the current filter.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${n <= (review.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.products?.name || 'Unknown product'}
                    </span>
                    <span className="text-xs text-gray-400">· {fmtDate(review.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {review.comment || <span className="italic text-gray-400">No comment provided.</span>}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                      title={review.is_approved ? 'Approved — click to unapprove' : 'Pending — click to approve'}
                    >
                      {review.is_approved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </button>
                    <button
                      onClick={() => toggleFeatured(review.id, review.is_featured)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${review.is_featured
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600'
                        }`}
                      title={review.is_featured ? 'Featured — click to unfeature' : 'Click to feature on storefront'}
                    >
                      <Star className={`w-3 h-3 ${review.is_featured ? 'fill-purple-500' : ''}`} />
                      Featured
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
