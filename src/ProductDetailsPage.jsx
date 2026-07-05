import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductDetailsPage.css';
import { getProductBySlug, getRelatedProducts } from './data/products';
import ReviewSection from './ReviewSection';

function ProductDetailsPage({ slug, onNavigate, addToCart }) {
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [openDetail, setOpenDetail] = useState('Ingredients'); // Default open section

  const gallery = p ? [p.image, '/gal_mix.png', '/gal_cut.png', '/editorial_spoon.png'] : [];

  const flavorColumns = [
    { title: "Tangy", desc: "Bright citrus burst from the finest regional produce.", texture: "/prod_lemon.png" },
    { title: "Bold", desc: "A robust blend of traditional spices hits the palate with warmth.", texture: "/prod_chili.png" },
    { title: "Balanced", desc: "Cold-pressed mustard oil rounds out the heat with deep, earthy notes.", texture: "/prod_garlic.png" }
  ];

  const processSteps = [
    { step: "01", title: "Hand-Picking", img: "/prod_mango.png", desc: "Selecting the finest raw ingredients from local farms in Bihar." },
    { step: "02", title: "Preparation", img: "/making_garlic.png", desc: "Traditional cutting, peeling, and marination using heritage techniques." },
    { step: "03", title: "Sun-Curing", img: "/making_lemon.png", desc: "Slow-matured on earthen terraces strictly by the heat of the summer sun." },
    { step: "04", title: "Seasoning", img: "/making_chilli.png", desc: "Generously tempered with cold-pressed mustard oil and aromatic spices." }
  ];

  const mealPairings = [
    { name: "Hot Paratha", image: "/making_chilli.png", desc: "The ultimate comfort breakfast pairing." },
    { name: "Dal-Chawal", image: "/gal_mix.png", desc: "A nostalgic, soulful combination." },
    { name: "Poori Sabzi", image: "/about_us.png", desc: "Elevates simple festive meals instantly." },
  ];

  const accordionData = [
    { 
      title: 'Ingredients', 
      content: 'Locally sourced raw ingredients, pure cold-pressed mustard oil, turmeric, fenugreek, fennel, red chilli powder, and natural rock salt. 100% free from synthetic colors or chemical preservatives.'
    },
    { 
      title: 'Storage & Shelf Life', 
      content: 'Store in a cool, dry place. Best consumed within 12 to 18 months of opening. Always use a clean, dry spoon to prevent contamination and retain flavor purity.'
    },
    { 
      title: 'Nutritional Info', 
      content: 'Rich in probiotics and antioxidants due to the natural fermentation and sun-curing process. Contains healthy fats from pure mustard oil.'
    },
    { 
      title: 'Shipping Details', 
      content: 'We ship PAN-India in heavy-duty, leak-proof glass jars to ensure chemical-free transit. Deliveries typically arrive within 3-5 business days.'
    }
  ];

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        const related = await getRelatedProducts(data.id, 4);
        setP({ ...data, related });
        setSelectedSize(Object.keys(data.prices)[0] || '250g');
        setQuantity(1);
        setActiveImageIndex(0);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    loadProduct();
  }, [slug]);

  if (loading) return <div className="pdp-loader">Preparing your experience...</div>;
  if (!p) return <div className="pdp-loader">Product not found.</div>;

  return (
    <div className="pdp-wrapper">
      
      {/* ════════════════════════════════════════════
          1. HERO (PURCHASE AREA)
      ════════════════════════════════════════════ */}
      <section className="pdp-hero-section">
        <div className="pdp-hero-container">
          
          {/* Left: Sticky Gallery */}
          <div className="pdp-gallery-col">
            <div className="pdp-gallery-sticky">
              <motion.div 
                className="pdp-main-image-container"
                layoutId={`main-image-${p.id}`}
              >
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  src={gallery[activeImageIndex] || p.image} 
                  alt={p.name} 
                  className="pdp-main-image"
                />
              </motion.div>
              
              <div className="pdp-thumbnails">
                {gallery.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`pdp-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`View ${idx+1}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="pdp-info-col">
            <div className="pdp-breadcrumb">
              <button onClick={() => onNavigate('home')}>Home</button>
              <span className="sep">/</span>
              <button onClick={() => onNavigate('shop')}>Shop</button>
              <span className="sep">/</span>
              <span className="current">{p.name}</span>
            </div>

            <motion.h1 
              className="pdp-title"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            >
              {p.name}
            </motion.h1>
            
            <motion.div 
              className="pdp-price"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            >
              ₹{p.prices[selectedSize]}
            </motion.div>
            
            <p className="pdp-short-story">
              The jar opened before every meal begins. Bright regional produce, bold spices, and slow preparation come together to create the authentic flavor every table waits for.
            </p>

            <div className="pdp-options">
              <div className="pdp-option-group">
                <span className="pdp-option-label">Select Weight</span>
                <div className="pdp-size-selector">
                  {Object.keys(p.prices).map(size => (
                    <button 
                      key={size}
                      className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pdp-option-group">
                <span className="pdp-option-label">Quantity</span>
                <div className="pdp-qty-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
            </div>

            <div className="pdp-actions">
              <button 
                className="pdp-add-btn"
                onClick={() => addToCart({ slug, name: p.name, prices: p.prices, image: p.image }, selectedSize, quantity, 'One Time')}
              >
                Add to Cart
              </button>
              <button 
                className="pdp-buy-btn"
                onClick={() => {
                  addToCart({ slug, name: p.name, prices: p.prices, image: p.image }, selectedSize, quantity, 'One Time');
                  onNavigate('checkout');
                }}
              >
                Buy Now
              </button>
            </div>

            <div className="pdp-trust-badges">
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure Checkout
              </div>
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Fast PAN-India Delivery
              </div>
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                Zero Chemicals
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. FLAVOUR BENTO
      ════════════════════════════════════════════ */}
      <section className="pdp-flavour-section">
        <div className="pdp-section-container">
          <div className="pdp-section-header">
            <span className="pdp-eyebrow">The Profile</span>
            <h2 className="pdp-heading">Taste The Authenticity</h2>
          </div>
          
          <div className="pdp-flavour-bento">
            {flavorColumns.map((col, idx) => (
              <motion.div 
                key={idx} 
                className="flavour-bento-card"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flavour-texture" style={{ backgroundImage: `url(${col.texture})` }}></div>
                <div className="flavour-content">
                  <h3>{col.title}</h3>
                  <p>{col.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. THE MAKING PROCESS (TIMELINE)
      ════════════════════════════════════════════ */}
      <section className="pdp-process-section">
        <div className="pdp-section-container">
          <div className="pdp-section-header center">
            <span className="pdp-eyebrow">From Farm To Jar</span>
            <h2 className="pdp-heading">How It's Formed</h2>
          </div>
          
          <div className="pdp-process-grid">
            {processSteps.map((step, idx) => (
              <motion.div 
                key={idx} 
                className="pdp-process-step"
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="process-img-wrap">
                  <img src={step.img} alt={step.title} />
                  <div className="process-num">{step.step}</div>
                </div>
                <div className="process-info">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          4. PERFECT PAIRINGS
      ════════════════════════════════════════════ */}
      <section className="pdp-pairings-section">
        <div className="pdp-section-container">
          <div className="pdp-section-header">
            <span className="pdp-eyebrow">Complementary Flavours</span>
            <h2 className="pdp-heading">Perfect Pairings</h2>
          </div>
          
          <div className="pdp-pairings-grid">
            {mealPairings.map((meal, idx) => (
              <motion.div 
                key={idx} 
                className="pairing-card"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="pairing-bg" style={{ backgroundImage: `url(${meal.image})` }} />
                <div className="pairing-overlay">
                  <h4>{meal.name}</h4>
                  <p>{meal.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. PRODUCT INFORMATION (ACCORDION)
      ════════════════════════════════════════════ */}
      <section className="pdp-info-accordion-section">
        <div className="pdp-section-container narrow">
          <div className="pdp-section-header center">
            <h2 className="pdp-heading">Product Information</h2>
          </div>
          
          <div className="pdp-accordion-wrapper">
            {accordionData.map((item, idx) => (
              <div key={idx} className="pdp-accordion-item">
                <button 
                  className={`pdp-accordion-trigger ${openDetail === item.title ? 'active' : ''}`}
                  onClick={() => setOpenDetail(openDetail === item.title ? null : item.title)}
                >
                  {item.title}
                  <span className="accordion-icon">
                    {openDetail === item.title ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {openDetail === item.title && (
                    <motion.div 
                      className="pdp-accordion-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="pdp-accordion-inner">
                        {item.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. REVIEWS
      ════════════════════════════════════════════ */}
      <ReviewSection productId={p.id} />

      {/* ════════════════════════════════════════════
          7. RELATED PRODUCTS
      ════════════════════════════════════════════ */}
      <section className="pdp-related-section">
        <div className="pdp-section-container">
          <div className="pdp-section-header">
            <h2 className="pdp-heading">You May Also Like</h2>
          </div>
          
          <div className="pdp-related-grid">
            {p.related.map((rel, idx) => (
              <motion.div 
                key={idx} 
                className="pdp-related-card" 
                onClick={() => onNavigate('product-' + rel.slug)}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="rel-img-wrap">
                  <img src={rel.image} alt={rel.name} />
                </div>
                <div className="rel-info">
                  <h4 className="rel-name">{rel.name}</h4>
                  <div className="rel-price">₹{rel.base_price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default ProductDetailsPage;
