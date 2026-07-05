import { supabase } from '../supabaseClient';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Fetch all approved reviews for a specific product
 */
export const fetchReviewsByProduct = async (productId) => {
  if (!productId) return [];

  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data;
};

/**
 * Upload a media file to the review-media bucket
 */
const uploadMedia = async (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds the 10MB limit.`);
  }

  // Generate a unique file name to prevent collisions
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('review-media')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
  }

  // Get the public URL
  const { data } = supabase.storage
    .from('review-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

/**
 * Submit a new review
 */
export const submitReview = async ({ productId, name, rating, comment, files = [] }) => {
  try {
    const mediaUrls = [];

    // Upload all files first
    for (const file of files) {
      const url = await uploadMedia(file);
      mediaUrls.push(url);
    }

    // Insert the review into the database
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([
        {
          product_id: productId,
          author_name: name,
          rating: rating,
          comment: comment,
          media_urls: mediaUrls,
          is_approved: true // Set to true by default based on the SQL setup
        }
      ]);

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: error.message };
  }
};
