import { supabase } from '../supabaseClient';

export const standardPrices = {
  "250g": 299,
  "500g": 599,
  "1kg": 899
};

const safeWebpConvert = (url) => {
  if (!url) return url;
  if (url.startsWith('http') || url.includes('supabase.co')) return url;
  return url.replace(/\.(png|jpg|jpeg)$/i, '.webp');
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
      product_variants (weight_label, price, stock_quantity, reserved_quantity)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Transform data to match the expected format of the frontend
  const transformed = await Promise.all(data.map(async (product) => {
    let primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.product_images?.[0]?.url || '/prod_mango.webp';
    primaryImage = safeWebpConvert(primaryImage);
    
    // Construct prices map from variants
    const pricesMap = {};
    const stockMap = {};
    if (product.product_variants) {
      product.product_variants.forEach(variant => {
        pricesMap[variant.weight_label] = variant.price;
        const available = Math.max(0, (variant.stock_quantity || 0) - (variant.reserved_quantity || 0));
        variant.available_stock = available;
        stockMap[variant.weight_label] = available;
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

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.short_description || product.description,
      full_description: product.description,
      image: primaryImage,
      category: product.categories?.name || 'Uncategorized',
      base_price: product.base_price || (product.product_variants?.[0]?.price ?? 0),
      prices: pricesMap,
      stockMap: stockMap,
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
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name, slug),
      product_images (url, is_primary, display_order),
      product_variants (weight_label, price, mrp, stock_quantity, reserved_quantity)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  // Extract auxiliary resources directly from the JSON pdp_config
  // This bypasses the need for relational tables which do not exist
  const pdpConfig = product.pdp_config || {};
  const sortedIngredients = (pdpConfig.ingredients_table || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const sortedTrustBadges = (pdpConfig.trust_badges || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const sortedFaqs = (pdpConfig.faq || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const sortedProcessSteps = (pdpConfig.process_steps || []).sort((a, b) => (a.step_number || 0) - (b.step_number || 0));

  // Sort images by display_order
  const sortedImages = (product.product_images || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  let primaryImage = sortedImages.find(img => img.is_primary)?.url || sortedImages[0]?.url || '/prod_mango.webp';
  primaryImage = safeWebpConvert(primaryImage);

  // Construct prices map from variants
  const pricesMap = {};
  let totalStock = 0;
  if (product.product_variants) {
    product.product_variants.forEach(variant => {
      pricesMap[variant.weight_label] = variant.price;
      const available = Math.max(0, (variant.stock_quantity || 0) - (variant.reserved_quantity || 0));
      variant.available_stock = available;
      totalStock += available;
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

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    image: primaryImage,
    images: sortedImages.map(img => safeWebpConvert(img.url)),
    category: product.categories?.name || 'Uncategorized',
    prices: pricesMap,
    base_price: product.base_price || (product.product_variants?.[0]?.price ?? 0),
    isBestseller: product.is_bestseller,
    rating,
    reviewsCount,
    stock: totalStock,
    variants: product.product_variants || [],
    product_ingredients: sortedIngredients,
    product_trust_badges: sortedTrustBadges,
    product_faqs: sortedFaqs,
    product_process_steps: sortedProcessSteps,
    pure_ingredients: sortedIngredients.map(i => ({ name: i.ingredient, percentage: i.percentage, why: i.reason })),
    pdp_config: product.pdp_config || {}
  };
};

/**
 * Fetch related products based on a given category or fallback to bestsellers.
 */
export const getRelatedProducts = async (currentProductId, limit = 3) => {
  const all = await fetchProducts();
  return all.filter(p => p.id !== currentProductId).slice(0, limit);
};
