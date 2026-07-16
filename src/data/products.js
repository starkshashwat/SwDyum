import { supabase } from '../supabaseClient';

export const standardPrices = {
  "250g": 299,
  "500g": 599,
  "1kg": 899
};

/**
 * Fetch all active products from Supabase, including their primary image and base pricing.
 */
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (url, is_primary),
      product_variants (weight_label, price)
    `)
    .eq('is_active', true)
    .eq('slug', 'mango-pickle')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Transform data to match the expected format of the frontend
  const transformed = await Promise.all(data.map(async (product) => {
    let primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.product_images?.[0]?.url || '/prod_mango.webp';
    primaryImage = primaryImage.replace(/\.png$/, '.webp');
    
    // Construct prices map from variants
    const pricesMap = {};
    if (product.product_variants) {
      product.product_variants.forEach(variant => {
        pricesMap[variant.weight_label] = variant.price;
      });
    }

    // Real review aggregate
    let rating = 0;
    let reviewsCount = 0;
    const { data: reviewRows } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', product.id)
      .eq('is_approved', true);
    if (reviewRows && reviewRows.length > 0) {
      reviewsCount = reviewRows.length;
      rating = Math.round((reviewRows.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount) * 10) / 10;
    }

    const canonicalShortDesc = 'Sharp, tangy raw Langda mango pickle, sun-cured in cold-pressed mustard oil, made in small batches in Ara, Bihar.';

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.slug === 'mango-pickle' ? canonicalShortDesc : (product.short_description || product.description),
      full_description: product.description,
      image: primaryImage,
      category: product.categories?.name || 'Uncategorized',
      base_price: product.base_price,
      prices: pricesMap,
      isBestseller: product.is_bestseller,
      rating: rating,
      reviewsCount: reviewsCount
    };
  }));

  return transformed;
};

/**
 * Fetch a single product by its slug, including all its variants and images.
 */
export const getProductBySlug = async (slug) => {
  if (slug !== 'mango-pickle') {
    return null;
  }
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (url, is_primary, display_order),
      product_variants (weight_label, price, mrp, stock_quantity)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  // Sort images by display_order
  const sortedImages = (product.product_images || []).sort((a, b) => a.display_order - b.display_order);
  let primaryImage = sortedImages.find(img => img.is_primary)?.url || sortedImages[0]?.url || '/prod_mango.webp';
  primaryImage = primaryImage.replace(/\.png$/, '.webp');

  // Construct prices map from variants
  const pricesMap = {};
  let totalStock = 0;
  if (product.product_variants) {
    product.product_variants.forEach(variant => {
      pricesMap[variant.weight_label] = variant.price;
      totalStock += variant.stock_quantity;
    });
  }

  // Real review aggregate — no fabricated numbers (honest fallback: 0 → hidden in UI)
  let rating = 0;
  let reviewsCount = 0;
  const { data: reviewRows } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', product.id)
    .eq('is_approved', true);
  if (reviewRows && reviewRows.length > 0) {
    reviewsCount = reviewRows.length;
    rating = Math.round((reviewRows.reduce((acc, r) => acc + (r.rating || 0), 0) / reviewsCount) * 10) / 10;
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    image: primaryImage,
    images: sortedImages.map(img => img.url.replace(/\.png$/, '.webp')),
    category: product.categories?.name || 'Uncategorized',
    prices: pricesMap,
    base_price: product.base_price,
    isBestseller: product.is_bestseller,
    rating,
    reviewsCount,
    stock: totalStock,
    variants: product.product_variants || [],
    pure_ingredients: product.pure_ingredients || [],
    pdp_config: product.pdp_config || {}
  };
};

/**
 * Fetch related products based on a given category or fallback to bestsellers.
 */
export const getRelatedProducts = async (currentProductId, limit = 3) => {
  return [];
};
