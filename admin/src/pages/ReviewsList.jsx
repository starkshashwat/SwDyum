import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Star, MessageSquare, Check, X, Shield, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // All, Pending, Approved, Featured
  
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          products:product_id(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, is_approved: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_featured: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, is_featured: !currentStatus } : r
      ));
    } catch (error) {
      console.error('Failed to feature review:', error);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (r.comment && r.comment.toLowerCase().includes(term)) ||
      (r.products?.name && r.products.name.toLowerCase().includes(term)) ||
      (r.author_name && r.author_name.toLowerCase().includes(term));
      
    let matchesFilter = true;
    if (filter === 'Pending') matchesFilter = !r.is_approved;
    if (filter === 'Approved') matchesFilter = r.is_approved;
    if (filter === 'Featured') matchesFilter = r.is_featured;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
          <p className="text-sm text-gray-500">Moderate product reviews and feature your best testimonials.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Featured Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.filter(r => r.is_featured).length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews by content, product, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All">All Reviews</option>
            <option value="Pending">Pending Moderation</option>
            <option value="Approved">Approved</option>
            <option value="Featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200 shadow-sm">No reviews found matching your criteria.</div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">
              
              {/* Review Content */}
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{review.author_name || 'Guest User'}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      on <span className="font-medium text-gray-700">{review.products?.name || 'Unknown Product'}</span>
                    </p>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {review.comment || <span className="italic text-gray-400">No written text provided</span>}
                </p>

                {/* Date and Badges */}
                <div className="flex items-center gap-3 pt-2 text-xs">
                  <span className="text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {!review.is_approved && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Needs Review
                    </span>
                  )}
                  {review.is_featured && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium">
                      Featured ✨
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="md:w-48 flex flex-col gap-2 pt-4 border-t border-gray-100 md:pt-0 md:border-t-0 md:border-l md:pl-6 justify-center">
                <button 
                  onClick={() => toggleApproval(review.id, review.is_approved)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    review.is_approved 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {review.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {review.is_approved ? 'Hide Review' : 'Approve'}
                </button>

                <button 
                  onClick={() => toggleFeatured(review.id, review.is_featured)}
                  disabled={!review.is_approved}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                    review.is_featured 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${review.is_featured ? 'fill-current' : ''}`} />
                  {review.is_featured ? 'Unfeature' : 'Feature'}
                </button>

                <button 
                  onClick={() => deleteReview(review.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
