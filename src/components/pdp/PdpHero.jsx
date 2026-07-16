import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PdpHero({
  product,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  subscription,
  setSubscription,
  addToCart,
  onNavigate,
  handleBuyNow,
}) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  // Gallery: real product images first, then lifestyle/process fallbacks
  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = (product.images && product.images.length > 0)
      ? product.images
      : [product.image];
    const extras = [
      '/process_aging_1783263039730.webp',
      '/process_mixing_1783263028798.webp',
      '/process_suncured_1783263051169.webp',
    ];
    const merged = [...imgs];
    extras.forEach((e) => { if (!merged.includes(e)) merged.push(e); });
    return merged.slice(0, 5);
  }, [product]);

  const tabsList = useMemo(() => {
    if (Array.isArray(product.pdp_config?.tabs)) {
      return product.pdp_config.tabs.filter(
        (t) => t.id !== 'ingredients_table' && t.id !== 'ingredients'
      );
    }
    if (product.pdp_config?.tabs && typeof product.pdp_config.tabs === 'object') {
      return Object.entries(product.pdp_config.tabs)
        .filter(([key]) => key !== 'ingredients_table' && key !== 'ingredients')
        .map(([key, val]) => {
          let label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
          let content = val;
          if (Array.isArray(val)) {
            content = val.map(i => `<strong>${i.name}</strong>: ${i.reason}`).join('<br/>');
          }
          return { id: key, label, content };
        });
    }

    // Default fallback
    return [
      { id: 'nutritional', label: 'Nutritional Info', content: 'See label for detailed nutritional information.' },
      { id: 'delivery', label: 'Check Delivery', content: 'Usually delivers in 3-5 business days across India.' }
    ];
  }, [product]);

  if (!product) return null;

  const currentPrice = product.prices?.[selectedSize] || product.base_price;
  const variant = (product.variants || []).find((v) => v.weight_label === selectedSize);
  const mrp = variant?.mrp || Math.round(currentPrice * 1.35);
  const outOfStock = variant?.stock_quantity !== undefined && variant.stock_quantity <= 0;

  const displayPrice = currentPrice;

  const sizes = product.prices ? Object.keys(product.prices) : [selectedSize];

  const weightInGrams = useMemo(() => {
    const clean = selectedSize.toLowerCase().replace(/\s+/g, '');
    const num = parseInt(clean, 10) || 250;
    if (clean.includes('kg') || clean.includes('1kg')) {
      return num * 1000;
    }
    return num; // assuming grams
  }, [selectedSize]);

  const pricePer100g = useMemo(() => {
    return Math.round((displayPrice / weightInGrams) * 100);
  }, [displayPrice, weightInGrams]);

  const servings = useMemo(() => {
    // A standard pickle serving is 15g.
    return Math.round(weightInGrams / 15);
  }, [weightInGrams]);

  function handleAddToCart() {
    if (added || adding) return;
    setAdding(true);
    setTimeout(() => {
      addToCart(product, selectedSize, quantity, subscription);
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }, 350);
  }

  return (
    <main className="px-6 md:px-12 pb-16 max-w-6xl mx-auto font-sans text-[#1a1a1a]" style={{ fontFamily: "'Satoshi', 'Segoe UI', sans-serif" }}>
      {/* Breadcrumb */}
      <div className="py-3 text-xs text-gray-400 flex gap-1.5 items-center mb-4">
        <button onClick={() => onNavigate('home')} className="hover:text-gray-600">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-gray-600">Shop</button>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        {/* Left: thumbnail strip + main image */}
        <div className="w-full lg:w-[52%] flex gap-3 lg:sticky lg:top-[128px] z-10">
          {/* Thumbnail strip */}
          <div className="flex flex-col gap-2.5 pt-1">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${activeThumb === i ? 'border-[#1A4E28]' : 'border-gray-200 hover:border-gray-400'
                  }`}
              >
                <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 rounded-2xl overflow-hidden bg-[#f5f0e8] flex items-center justify-center relative" style={{ minHeight: 440 }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeThumb}
                src={gallery[activeThumb]}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ maxHeight: 520 }}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>
            {mrp > currentPrice && (
              <div className="absolute top-4 right-4 bg-[#1A4E28] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {Math.round(((mrp - currentPrice) / mrp) * 100)}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Right: product info */}
        <div className="w-full lg:w-[48%] flex flex-col gap-5 pt-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5">
            <span className="bg-[#f0f7ee] text-[#1A4E28] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
              ⭐ Best Seller
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
          </div>

          {/* Rating row, shown only when real approved reviews exist */}
          {product.rating > 0 && product.reviewsCount > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} viewBox="0 0 20 20" fill={s <= Math.round(product.rating) ? '#f59e0b' : '#e5e7eb'} stroke={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="1" className="w-4 h-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-[#1a1a1a]">{product.rating}</span>
              <span className="text-gray-400">·</span>
              <button onClick={() => document.getElementById('pdp-reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors">
                {product.reviewsCount.toLocaleString('en-IN')} Reviews
              </button>
            </div>
          )}

          {/* Price display block */}
          <div className="flex flex-col gap-2 bg-[#f9faf7] border border-gray-100 rounded-2xl p-4">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold text-gray-900">₹{displayPrice}</span>
              {mrp > displayPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through font-medium">₹{mrp}</span>
                  <span className="text-xs font-bold text-[#1A4E28] bg-[#e1efe0] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {Math.round(((mrp - displayPrice) / mrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Value metrics: Price per 100g */}
            <div className="flex items-center gap-2.5 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">⚖️ <strong className="text-gray-700">₹{pricePer100g}</strong> / 100g ({selectedSize})</span>
            </div>
          </div>
          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed">
            Sharp, tangy raw Langda mango pickle, sun-cured in cold-pressed mustard oil, made in small batches in Ara, Bihar.
          </p>

          <div className="h-px bg-gray-100" />

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Choose Your Size</p>
              {variant?.stock_quantity > 0 && variant?.stock_quantity <= 8 && (
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Only {variant.stock_quantity} left</span>
              )}
            </div>
            <div className="flex gap-4 flex-wrap">
              {sizes.map((s) => {
                const v = (product.variants || []).find((x) => x.weight_label === s);
                const soldOut = v?.stock_quantity !== undefined && v.stock_quantity <= 0;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    disabled={soldOut}
                    className={`relative flex-1 min-w-[80px] px-3 py-3 rounded-xl border-2 text-center transition-all flex items-center justify-center ${selectedSize === s
                        ? 'border-[#1A4E28] bg-[#f0f7ee] text-[#1A4E28] shadow-sm'
                        : soldOut
                          ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <span className="font-bold text-sm md:text-base">{s}</span>
                    {s.toLowerCase().includes('1kg') && (
                      <span className="absolute -top-2.5 right-1/2 translate-x-1/2 bg-[#1A4E28] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Best Value
                      </span>
                    )}
                    {s.toLowerCase().includes('500') && (
                      <span className="absolute -top-2.5 right-1/2 translate-x-1/2 bg-amber-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Popular
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>



          {/* Free shipping note */}
          <div className="text-xs text-[#1A4E28] font-medium bg-[#f0f7ee] px-3 py-2 rounded-lg text-center">
            🚛 Free shipping on orders above ₹799
          </div>

          {/* Quantity + CTA */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg font-medium"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg font-medium"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className={`flex-1 font-semibold py-3.5 rounded-full text-sm transition-colors ${outOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                  added ? 'bg-[#1f3f1b] text-white' : 'bg-[#1A4E28] hover:bg-[#1f3f1b] text-white'
                }`}
            >
              {outOfStock ? 'Out of Stock' : added ? '✓ Added to Cart!' : `Add to Cart · ₹${displayPrice * quantity}`}
            </button>
          </div>

          {/* Buy Now */}
          <button
            onClick={() => handleBuyNow(product, selectedSize, quantity, subscription)}
            disabled={outOfStock}
            className={`w-full border-2 font-semibold py-3 rounded-full text-sm transition-colors ${outOfStock ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-[#1A4E28] text-[#1A4E28] hover:bg-[#f0f7ee]'
              }`}
          >
            Buy Now
          </button>

          {/* Benefit icons moved below Buy Now button */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500 py-3 border-t border-b border-gray-100">
            {[
              { icon: '🌿', label: '100% Natural' },
              { icon: '☀️', label: 'Sun Cured' },
              { icon: '🧪', label: 'Lab Tested' },
              { icon: '🏺', label: 'Micro-Batch Crafted' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5">
                <span>{b.icon}</span>
                <span className="font-medium text-gray-600">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Expandable sections */}
          {tabsList.map((tab, idx) => (
            <details key={tab.id || tab.label} className="border-t border-gray-100 pt-3 group" open={idx === 0}>
              <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 pb-2 list-none">
                {tab.label}
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform">
                  <path d="M5 7l5 5 5-5" />
                </svg>
              </summary>
              <div className="text-sm text-gray-500 pb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: tab.content || '' }} />
            </details>
          ))}

          {/* Additional product info accordions */}
          <details className="border-t border-gray-100 pt-3 group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 pb-2 list-none">
              Product Details
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform">
                <path d="M5 7l5 5 5-5" />
              </svg>
            </summary>
            <div className="text-sm text-gray-500 pb-3 leading-relaxed space-y-2">
              <p><strong>Shelf Life:</strong> Best before 48 months from date of manufacture</p>
              <p><strong>Available Sizes:</strong> 250g · 500g · 1kg</p>
              <p><strong>Storage:</strong> Store in a cool, dry place. Use a dry spoon always.</p>
              <p><strong>Type:</strong> 100% Vegetarian · No preservatives · No artificial colours</p>
              <p><strong>Manufactured at:</strong> Bahiro, Arrah, Bhojpur, Bihar — 802301</p>
            </div>
          </details>

          <details className="border-t border-gray-100 pt-3 group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 pb-2 list-none">
              Shipping & Support
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform">
                <path d="M5 7l5 5 5-5" />
              </svg>
            </summary>
            <div className="text-sm text-gray-500 pb-3 leading-relaxed space-y-2">
              <p><strong>Dispatch:</strong> Ships within 24 hours of order</p>
              <p><strong>Delivery:</strong> 3–5 business days pan-India</p>
              <p><strong>Free Shipping:</strong> On orders above ₹799</p>
              <p><strong>Support:</strong> Food products are non-returnable. If your jar arrives damaged, leaked, or wrong, contact us within 24 hours with photos for help.</p>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
