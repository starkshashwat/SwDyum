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

  if (!product) return null;

  const currentPrice = product.prices?.[selectedSize] || product.base_price;
  const variant = (product.variants || []).find((v) => v.weight_label === selectedSize);
  const mrp = variant?.mrp || Math.round(currentPrice * 1.35);
  const outOfStock = variant?.stock_quantity !== undefined && variant.stock_quantity <= 0;
  
  const displayPrice = subscription === 'subscribe'
    ? Math.round(currentPrice * 0.9)
    : currentPrice;

  const sizes = product.prices ? Object.keys(product.prices) : [selectedSize];

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
    <main className="px-6 md:px-12 pb-16 max-w-6xl mx-auto font-sans text-[#1a1a1a]" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
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
        <div className="w-full lg:w-[52%] flex gap-3">
          {/* Thumbnail strip */}
          <div className="flex flex-col gap-2.5 pt-1">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                  activeThumb === i ? 'border-[#2d5a27]' : 'border-gray-200 hover:border-gray-400'
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
              <div className="absolute top-4 right-4 bg-[#2d5a27] text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {Math.round(((mrp - currentPrice) / mrp) * 100)}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Right: product info */}
        <div className="w-full lg:w-[48%] flex flex-col gap-5 pt-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5">
            <span className="bg-[#f0f7ee] text-[#2d5a27] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
              ⭐ Best Seller
            </span>
          </div>

          {/* Title */}
          <div>
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-1 font-medium">Traditional Pickles</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>
              {product.name}
            </h1>
          </div>

          {/* Rating row */}
          {product.reviewsCount > 0 && product.rating > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} viewBox="0 0 20 20" fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1" className="w-4 h-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-[#1a1a1a]">{product.rating}</span>
              <span className="text-gray-400">·</span>
              <button onClick={() => document.getElementById('pdp-reviews')?.scrollIntoView({ behavior: 'smooth' })} className="text-gray-500 underline underline-offset-2">
                {product.reviewsCount.toLocaleString('en-IN')} Reviews
              </button>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed">
            {product.pdp_config?.short_description || product.short_description || 'A richly spiced, hand-crafted pickle made with cold-pressed Kachi Ghani mustard oil — bold, sun-cured and rooted in tradition.'}
          </p>

          {/* Trust icons */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {[
              { icon: '🌿', label: '100% Natural' },
              { icon: '☀️', label: 'Sun Cured' },
              { icon: '💧', label: 'Moisture Locked' },
              { icon: '🚚', label: 'Fast Dispatch' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5">
                <span>{b.icon}</span>
                <span className="font-medium">{b.label}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Choose Your Size</p>
              {variant?.stock_quantity > 0 && variant?.stock_quantity <= 8 && (
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Only {variant.stock_quantity} left</span>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((s) => {
                const v = (product.variants || []).find((x) => x.weight_label === s);
                const soldOut = v?.stock_quantity !== undefined && v.stock_quantity <= 0;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    disabled={soldOut}
                    className={`px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                      selectedSize === s
                        ? 'border-[#2d5a27] bg-[#2d5a27] text-white'
                        : soldOut 
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {s} {soldOut && '- Sold Out'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Purchase type */}
          <div className="flex gap-3">
            {/* Subscribe */}
            <button
              onClick={() => setSubscription('subscribe')}
              className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                subscription === 'subscribe'
                  ? 'border-[#2d5a27] bg-[#f0f7ee]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscribe</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${subscription === 'subscribe' ? 'border-[#2d5a27]' : 'border-gray-300'}`}>
                  {subscription === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#2d5a27]" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#1a1a1a]">₹{Math.round(currentPrice * 0.9)}</div>
              <div className="text-xs text-[#2d5a27] font-medium mt-0.5">Save 10% every month</div>
            </button>

            {/* One-time */}
            <button
              onClick={() => setSubscription('onetime')}
              className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                subscription !== 'subscribe'
                  ? 'border-[#2d5a27] bg-[#f0f7ee]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">One-Time</span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${subscription !== 'subscribe' ? 'border-[#2d5a27]' : 'border-gray-300'}`}>
                  {subscription !== 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#2d5a27]" />}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#1a1a1a]">₹{currentPrice}</div>
              {mrp > currentPrice && <div className="text-xs text-gray-400 mt-0.5 line-through">₹{mrp}</div>}
            </button>
          </div>

          {/* Subscribe perks */}
          {subscription === 'subscribe' && (
            <div className="text-xs text-gray-500 flex flex-col gap-1.5 -mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[#2d5a27]">✓</span>
                <span>Save 10% every month + free shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#2d5a27]">✓</span>
                <span>Cancel anytime — no fees, no hassle</span>
              </div>
            </div>
          )}

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
              className={`flex-1 font-semibold py-3.5 rounded-full text-sm transition-colors ${
                outOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                added ? 'bg-[#1f3f1b] text-white' : 'bg-[#2d5a27] hover:bg-[#1f3f1b] text-white'
              }`}
            >
              {outOfStock ? 'Out of Stock' : added ? '✓ Added to Cart!' : `Add to Cart · ₹${displayPrice * quantity}`}
            </button>
          </div>

          {/* Buy Now */}
          <button 
            onClick={() => handleBuyNow(product, selectedSize, quantity, subscription)}
            disabled={outOfStock}
            className={`w-full border-2 font-semibold py-3 rounded-full text-sm transition-colors ${
              outOfStock ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-[#2d5a27] text-[#2d5a27] hover:bg-[#f0f7ee]'
            }`}
          >
            Buy Now
          </button>

          {/* Bottom trust badges */}
          <div className="flex justify-between pt-2 border-t border-gray-100">
            {[
              { icon: '🌿', title: '100% Natural', sub: 'No preservatives' },
              { icon: '🔄', title: '7-day guarantee', sub: 'Love it or full refund' },
              { icon: '🏆', title: 'FSSAI Certified', sub: 'Quality tested' },
            ].map(b => (
              <div key={b.title} className="flex flex-col items-center text-center gap-1">
                <span className="text-2xl">{b.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{b.title}</span>
                <span className="text-xs text-gray-400">{b.sub}</span>
              </div>
            ))}
          </div>

          {/* Expandable sections (Replaces PdpTabs) */}
          {(product.pdp_config?.tabs || [
            { id: 'ingredients', label: 'Ingredients', content: product.pdp_config?.pure_ingredients?.map(i => i[1]).join(', ') || 'Authentic ingredients.' },
            { id: 'nutritional', label: 'Nutritional Info', content: 'See label for detailed nutritional information.' },
            { id: 'delivery', label: 'Check Delivery', content: 'Usually delivers in 3-5 business days across India.' }
          ]).map((tab) => (
            <details key={tab.id || tab.label} className="border-t border-gray-100 pt-3 group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 pb-2 list-none">
                {tab.label}
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform">
                  <path d="M5 7l5 5 5-5"/>
                </svg>
              </summary>
              <div className="text-sm text-gray-500 pb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: tab.content || '' }} />
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
