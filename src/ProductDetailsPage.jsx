import { useState, useEffect } from 'react';
import './ProductDetailsPage.css';
import { getProductBySlug, getRelatedProducts } from './data/products';
import { pdpContentMap } from './data/pdpContentMap';

import PdpHero from './components/pdp/PdpHero';
import PdpStickyBar from './components/pdp/PdpStickyBar';
import PdpIngredients from './components/pdp/PdpIngredients';
import PdpProcessTimeline from './components/pdp/PdpProcessTimeline';
// import PdpTabs from './components/pdp/PdpTabs';
import ReviewSection from './ReviewSection';
import PdpUgc from './components/pdp/PdpUgc';
import PdpRelated from './components/pdp/PdpRelated';
import PdpFaq from './components/pdp/PdpFaq';

function ProductDetailsPage({ slug, onNavigate, addToCart, handleBuyNow }) {
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
        // Inject custom PDP content if it exists in the map
        if (pdpContentMap[slug]) {
          data.pdp_config = {
            ...data.pdp_config,
            ...pdpContentMap[slug]
          };
        }

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
      />

      {/* 2. STICKY PURCHASE BAR */}
      <PdpStickyBar
        product={p}
        selectedSize={selectedSize}
        quantity={quantity}
        setQuantity={setQuantity}
        addToCart={addToCart}
        handleBuyNow={handleBuyNow}
      />

      {/* 3. INGREDIENTS SHOWCASE — "what's inside" */}
      <PdpIngredients product={p} />

      {/* 4. THE MAKING PROCESS (TIMELINE) — "how it's made" */}
      <PdpProcessTimeline />

      {/* Mid-page CTA — for users convinced after reading ingredients/process */}
      <div className="pdp-midpage-cta">
        <div className="pdp-midpage-cta-inner">
          <div className="pdp-midpage-cta-content">
            <span className="pdp-midpage-cta-badge">Small Batch</span>
            <h4 className="pdp-midpage-cta-text">Traditional Langda Aam ka Achaar, ready to ship.</h4>
            <p className="pdp-midpage-cta-subtext">Sun-cured in mustard oil, made the old Bihari way.</p>
          </div>
          <button
            className="pdp-midpage-cta-btn"
            onClick={() => handleBuyNow(p, selectedSize, quantity, subscription)}
          >
            Buy Now · ₹{(p.prices?.[selectedSize] || p.base_price) * quantity}
          </button>
        </div>
      </div>

      {/* 6. TABS (INFO) — full specs */}
      {/* <PdpTabs product={p} tabsData={p.pdp_config?.tabs} /> */}

      {/* 7. REVIEWS — social proof */}
      <div id="pdp-reviews">
        <ReviewSection productId={p.id} />
      </div>

      {/* 8. UGC (COMMUNITY) */}
      <PdpUgc />

      {/* 9. FAQ — objection handling before upsell */}
      <PdpFaq faqData={p.pdp_config?.faq} />

      {/* 11. RELATED PRODUCTS — broader cross-sell */}
      <PdpRelated products={p.related} onNavigate={onNavigate} />

    </div>
  );
}

export default ProductDetailsPage;
