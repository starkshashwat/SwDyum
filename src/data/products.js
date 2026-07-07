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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Transform data to match the expected format of the frontend
  return data.map(product => {
    const primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.product_images?.[0]?.url || '/prod_mango.png';
    
    // Construct prices map from variants
    const pricesMap = {};
    if (product.product_variants) {
      product.product_variants.forEach(variant => {
        pricesMap[variant.weight_label] = variant.price;
      });
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.short_description || product.description,
      full_description: product.description,
      image: primaryImage,
      category: product.categories?.name || 'Uncategorized',
      base_price: product.base_price,
      prices: pricesMap,
      isBestseller: product.is_bestseller,
      rating: 4.8, // Mocked rating for now, later fetch from reviews table
      reviewsCount: Math.floor(Math.random() * 100) + 20
    };
  });
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
  const primaryImage = sortedImages.find(img => img.is_primary)?.url || sortedImages[0]?.url || '/prod_mango.png';

  // Construct prices map from variants
  const pricesMap = {};
  let totalStock = 0;
  if (product.product_variants) {
    product.product_variants.forEach(variant => {
      pricesMap[variant.weight_label] = variant.price;
      totalStock += variant.stock_quantity;
    });
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    image: primaryImage,
    images: sortedImages.map(img => img.url),
    category: product.categories?.name || 'Uncategorized',
    prices: pricesMap,
    base_price: product.base_price,
    isBestseller: product.is_bestseller,
    rating: 4.9,
    reviewsCount: Math.floor(Math.random() * 50) + 10,
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
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (url, is_primary)
    `)
    .eq('is_active', true)
    .neq('id', currentProductId)
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data.map(product => {
    const primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.product_images?.[0]?.url || '/prod_mango.png';
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      base_price: product.base_price
    };
  });
};
