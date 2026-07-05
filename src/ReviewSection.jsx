import React, { useState, useEffect } from 'react';
import { fetchReviewsByProduct, submitReview } from './data/reviews';
import './ReviewSection.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const data = await fetchReviewsByProduct(productId);
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormError('');
    
    // Validate sizes
    const invalidFile = selectedFiles.find(f => f.size > MAX_FILE_SIZE);
    if (invalidFile) {
      setFormError(`File ${invalidFile.name} exceeds the 10MB limit.`);
      setFiles([]);
      e.target.value = ''; // Reset input
      return;
    }
    
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setFormError('Please fill out your name and comment.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const result = await submitReview({
      productId,
      name,
      rating,
      comment,
      files
    });

    if (result.success) {
      // Reset form
      setShowForm(false);
      setRating(5);
      setName('');
      setComment('');
      setFiles([]);
      
      // Refresh reviews list
      loadReviews();
    } else {
      setFormError(result.error || 'Failed to submit review. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  // Calculate Average
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (ratingValue) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < ratingValue ? 'star filled' : 'star'}>★</span>
    ));
  };

  return (
    <section className="pdp-reviews-section pdp-section-container narrow">
      <div className="pdp-section-header center">
        <h2 className="pdp-heading">Customer Reviews</h2>
      </div>

      <div className="reviews-summary">
        <div className="rating-big">
          <span className="avg-num">{averageRating}</span>
          <div className="stars-wrap">{renderStars(Math.round(averageRating))}</div>
          <span className="review-count">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="write-review-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Write your review</h3>
          
          {formError && <div className="form-error">{formError}</div>}
          
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  className={`star-select ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Your name"
              required 
            />
          </div>

          <div className="form-group">
            <label>Review</label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="Tell us about your experience..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Attach Media (Images / Videos, Max 10MB)</label>
            <input 
              type="file" 
              accept="image/*,video/*" 
              multiple 
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <span className="file-count">{files.length} file(s) selected</span>
            )}
          </div>

          <button type="submit" className="submit-review-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="reviews-list">
        {loading ? (
          <p className="loading-text">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="empty-text">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="reviewer-name">{review.author_name}</span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="review-stars">
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
              
              {review.media_urls && review.media_urls.length > 0 && (
                <div className="review-media-grid">
                  {review.media_urls.map((url, i) => {
                    // Simple check if it's a video based on extension (might need better logic depending on upload)
                    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
                    return isVideo ? (
                      <video key={i} src={url} controls className="review-media-item" />
                    ) : (
                      <img key={i} src={url} alt="Review attachment" className="review-media-item" />
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
