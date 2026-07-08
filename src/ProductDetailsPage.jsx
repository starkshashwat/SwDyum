import React, { useState, useEffect } from 'react';
import './ProductDetailsPage.css';
import { getProductBySlug, getRelatedProducts } from './data/products';

import PdpHero from './components/pdp/PdpHero';
import PdpStickyBar from './components/pdp/PdpStickyBar';
import PdpIngredients from './components/pdp/PdpIngredients';
import PdpProcessTimeline from './components/pdp/PdpProcessTimeline';
import PdpTasteProfile from './components/pdp/PdpTasteProfile';
import PdpTabs from './components/pdp/PdpTabs';
import ReviewSection from './ReviewSection';
import PdpUgc from './components/pdp/PdpUgc';
import PdpComboSection from './components/pdp/PdpComboSection';
import PdpFaq from './components/pdp/PdpFaq';

function ProductDetailsPage({ slug, onNavigate, addToCart, handleBuyNow, cart }) {
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [subscription, setSubscription] = useState('One Time');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        setP({ ...data, related: [] }); // Set product immediately
        setSelectedSize(Object.keys(data.prices)[0] || '250g');
        setQuantity(1);
        setSubscription('One Time');
        setLoading(false); // Stop loader immediately
        
        // Fetch related asynchronously so it doesn't block
        getRelatedProducts(data.id, 4).then(related => {
          setP(prev => ({ ...prev, related }));
        });
      } else {
        setLoading(false);
      }
      window.scrollTo(0, 0);
    };
    loadProduct();
  }, [slug]);

  if (loading) return null; // Remove huge blocking text to fix delay perception
  if (!p) return <div className="pdp-loader">Product not found.</div>;

  return (
    <div className="pdp-wrapper">
      
      {/* 1. HERO */}
      <PdpHero 
        product={p}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        quantity={quantity}
        setQuantity={setQuantity}
        subscription={subscription}
        setSubscription={setSubscription}
        addToCart={addToCart}
        onNavigate={onNavigate}
        handleBuyNow={handleBuyNow}
        cart={cart}
      />

      {/* 2. STICKY PURCHASE BAR */}
      <PdpStickyBar 
        product={p}
        selectedSize={selectedSize}
        addToCart={addToCart}
      />

      {/* 3. INGREDIENTS SHOWCASE */}
      <PdpIngredients ingredients={p.pure_ingredients} />

      {/* 4. THE MAKING PROCESS (TIMELINE) */}
      <PdpProcessTimeline />

      {/* 5. TASTE PROFILE */}
      <PdpTasteProfile tasteProfile={p.pdp_config?.taste_profile} />

      {/* 6. TABS (INFO) */}
      <PdpTabs product={p} tabsData={p.pdp_config?.tabs} />

      {/* 7. REVIEWS */}
      <ReviewSection productId={p.id} />

      {/* 8. UGC (INSTAGRAM) */}
      <PdpUgc />

      {/* 9. COMBO SECTION */}
      <PdpComboSection onNavigate={onNavigate} />

      {/* 10. FAQ */}
      <PdpFaq />

    </div>
  );
}

export default ProductDetailsPage;
