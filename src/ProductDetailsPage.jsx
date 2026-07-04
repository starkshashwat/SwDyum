import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductDetailsPage.css';
import { getProductBySlug, getRelatedProducts } from './data/products';

// Helper variants for framer-motion
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

function ProductDetailsPage({ slug, onNavigate, addToCart }) {
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState(null);
  const [openDetail, setOpenDetail] = useState(null);

  const gallery = p ? [p.image, '/editorial_spoon.png', '/gal_mix.png', '/gal_cut.png'] : [];
  
  const flavorColumns = [
    { title: "Tangy", desc: "Sun-dried raw mangoes provide a sharp, bright citrus burst.", texture: "/prod_lemon.png" },
    { title: "Bold", desc: "A robust blend of regional spices hits the palate with warmth.", texture: "/prod_chili.png" },
    { title: "Balanced", desc: "Cold-pressed mustard oil rounds out the heat with earthy depth.", texture: "/prod_garlic.png" }
  ];

  const mealPairings = [
    { name: "Hot Paratha", image: "/deal_scatter.png", desc: "The ultimate comfort breakfast." },
    { name: "Dal-Chawal", image: "/gal_mix.png", desc: "A nostalgic, soulful combination." },
    { name: "Khichdi", image: "/gal_cut.png", desc: "Elevates simple meals instantly." },
    { name: "Poori Sabzi", image: "/about_us.png", desc: "A festive pairing full of joy." },
  ];

  const ingredients = [
    { name: "Raw Mango", img: "/prod_mango.png" },
    { name: "Mustard Oil", img: "/editorial_spoon.png" },
    { name: "Fenugreek", img: "/prod_lemon.png" },
    { name: "Fennel", img: "/prod_garlic.png" }
  ];

  const timeline = [
    { step: "01. Selection", img: "/prod_mango.png", text: "Hand-picking the finest regional produce." },
    { step: "02. Preparation", img: "/gal_cut.png", text: "Traditional cutting and marination." },
    { step: "03. Resting", img: "/gal_mix.png", text: "Sun-cured on earthen terraces." },
    { step: "04. Seasoning", img: "/editorial_spoon.png", text: "Tempering with cold-pressed oil." },
    { step: "05. Packing", img: "/about_us.png", text: "Sealed in glass to preserve heritage." }
  ];

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        const related = await getRelatedProducts(data.id, 4);
        setP({ ...data, related });
        setSelectedSize(Object.keys(data.prices)[0] || '250g');
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
      
      {/* SECTION 1: PRODUCT HERO */}
      <section className="pdp-hero">
        <div className="pdp-sticky-breadcrumb">
          <span onClick={() => onNavigate('home')}>Home</span>
          <span className="sep">/</span>
          <span onClick={() => onNavigate('shop')}>Collection</span>
          <span className="sep">/</span>
          <span className="current">{p.name}</span>
        </div>

        <div className="pdp-hero-grid">
          {/* Left: Gallery */}
          <div className="pdp-gallery-col">
            <div className="pdp-main-image-container">
              <motion.img 
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={gallery[activeImageIndex] || p.image} 
                alt={p.name} 
                className="pdp-main-image"
              />
            </div>
            <div className="pdp-thumbnails">
              {gallery.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`pdp-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`View ${idx+1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="pdp-info-col">
            <div className="pdp-info-sticky">
              <span className="pdp-eyebrow">Swadyum Collection</span>
              <h1 className="pdp-title">{p.name}</h1>
              <div className="pdp-price">₹{p.prices[selectedSize]}</div>
              
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

              <div className="pdp-availability">Ready to ship</div>

              <div className="pdp-actions">
                <div className="pdp-qty">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button 
                  className="pdp-btn-primary"
                  onClick={() => addToCart({ slug, name: p.name, prices: p.prices, image: p.image }, selectedSize, quantity, 'One Time')}
                >
                  Add to Cart
                </button>
                <button 
                  className="pdp-btn-secondary"
                  onClick={() => {
                    addToCart({ slug, name: p.name, prices: p.prices, image: p.image }, selectedSize, quantity, 'One Time');
                    onNavigate('checkout');
                  }}
                >
                  Buy Now
                </button>
              </div>

              <div className="pdp-assurances">
                <span>Secure Checkout</span>
                <span className="dot">•</span>
                <span>Fast Delivery</span>
                <span className="dot">•</span>
                <span>Easy Returns</span>
              </div>

              <hr className="pdp-divider" />
              
              <p className="pdp-short-story">
                "The jar opened before every meal begins. Bright regional produce, bold spices and slow preparation come together to create the flavour every table waits for."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FLAVOUR EXPERIENCE */}
      <section className="pdp-flavor-exp">
        <motion.div 
          className="pdp-container"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="pdp-section-title text-center">The moment every bite changes.</motion.h2>
          <div className="pdp-flavor-grid">
            {flavorColumns.map((col, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flavor-col">
                <div className="flavor-texture">
                  <img src={col.texture} alt={col.title} />
                </div>
                <h3 className="flavor-title">{col.title}</h3>
                <p className="flavor-desc">{col.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: BEST WITH */}
      <section className="pdp-best-with">
        <div className="pdp-container">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="pdp-section-title"
          >
            Perfect Pairings
          </motion.h2>
          <div className="pdp-pairing-container">
            {mealPairings.map((meal, idx) => (
              <div key={idx} className="pairing-card">
                <img src={meal.image} alt={meal.name} className="pairing-bg" />
                <div className="pairing-overlay">
                  <h3 className="pairing-name">{meal.name}</h3>
                  <p className="pairing-desc">{meal.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: INSIDE THE JAR */}
      <section className="pdp-inside-jar">
        <motion.div 
          className="pdp-container"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="pdp-section-title">Inside the Jar</motion.h2>
          <div className="pdp-ingredients-grid">
            {ingredients.map((ing, idx) => (
              <motion.div key={idx} variants={fadeUp} className="ing-card">
                <div className="ing-img-wrap">
                  <img src={ing.img} alt={ing.name} />
                </div>
                <h4 className="ing-name">{ing.name}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 5: MADE WITH TIME */}
      <section className="pdp-timeline-section">
        <div className="pdp-container">
          <h2 className="pdp-section-title">Made With Time</h2>
        </div>
        <div className="pdp-timeline-scroll">
          {timeline.map((step, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-img-wrap">
                <img src={step.img} alt={step.step} />
              </div>
              <h4 className="timeline-step">{step.step}</h4>
              <p className="timeline-text">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: PRODUCT DETAILS ACCORDION */}
      <section className="pdp-details-accordion">
        <div className="pdp-container-narrow">
          <h2 className="pdp-section-title text-center">Product Information</h2>
          <div className="accordion-wrapper">
            {['Storage', 'Weight', 'Shelf Life', 'Nutrition'].map((detail, idx) => (
              <div key={idx} className="accordion-item">
                <button 
                  className="accordion-trigger" 
                  onClick={() => setOpenDetail(openDetail === idx ? null : idx)}
                >
                  {detail}
                  <span className="accordion-icon">{openDetail === idx ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openDetail === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="accordion-content"
                    >
                      <div className="accordion-inner">
                        For {detail.toLowerCase()}, please store in a cool, dry place. Best consumed within 12 months of opening. Use a clean, dry spoon.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CUSTOMER MOMENTS */}
      <section className="pdp-customer-moments">
        <div className="pdp-container">
          <h2 className="pdp-section-title text-center">Customer Moments</h2>
          <div className="masonry-grid">
            <div className="masonry-col">
              <img src="/banner.png" alt="Customer dining" className="masonry-item" />
              <div className="masonry-review masonry-item">
                <div className="stars">★★★★★</div>
                <p>"Absolutely stunning packaging and the flavor took me straight back to my childhood."</p>
                <span className="author">— Nisha M.</span>
              </div>
            </div>
            <div className="masonry-col">
              <div className="masonry-review masonry-item dark">
                <div className="stars">★★★★★</div>
                <p>"I buy this every month. The mustard oil balance is perfection."</p>
                <span className="author">— Rahul T.</span>
              </div>
              <img src="/deal_scatter.png" alt="Customer food" className="masonry-item" />
            </div>
            <div className="masonry-col">
              <img src="/gal_mix.png" alt="Customer kitchen" className="masonry-item" />
              <div className="masonry-review masonry-item">
                <div className="stars">★★★★☆</div>
                <p>"Great taste, premium feel. Highly recommended."</p>
                <span className="author">— Sneha K.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: YOU MAY ALSO LIKE */}
      <section className="pdp-related">
        <div className="pdp-container">
          <h2 className="pdp-section-title">You May Also Like</h2>
          <div className="pdp-carousel">
            {p.related.map((rel, idx) => (
              <div key={idx} className="pdp-carousel-card" onClick={() => onNavigate('product-' + rel.slug)}>
                <div className="rel-img-wrap">
                  <img src={rel.image} alt={rel.name} />
                </div>
                <h4 className="rel-name">{rel.name}</h4>
                <div className="rel-price">₹{rel.base_price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: RECENTLY VIEWED (Simplified Row) */}
      <section className="pdp-recently-viewed">
        <div className="pdp-container">
          <h3 className="pdp-small-title">Recently Viewed</h3>
          <div className="recent-row">
            {p.related.slice(0, 2).map((rel, idx) => (
              <div key={idx} className="recent-item" onClick={() => onNavigate('product-' + rel.slug)}>
                <img src={rel.image} alt={rel.name} />
                <span className="recent-name">{rel.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="pdp-faq">
        <div className="pdp-container-narrow">
          <h2 className="pdp-section-title text-center">Frequently Asked Questions</h2>
          <div className="accordion-wrapper">
            {['Are preservatives used?', 'Is the packaging eco-friendly?', 'How long does shipping take?'].map((q, idx) => (
              <div key={idx} className="accordion-item">
                <button 
                  className="accordion-trigger" 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  {q}
                  <span className="accordion-icon">{openFaq === idx ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="accordion-content"
                    >
                      <div className="accordion-inner">
                        We pride ourselves on using 100% natural ingredients with no artificial preservatives. Our glass jars are fully recyclable. Shipping typically takes 3-5 business days across India.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: FINAL CTA */}
      <section className="pdp-final-cta">
        <div className="pdp-final-bg">
          <img src="/banner.png" alt="Dining Table" />
          <div className="pdp-final-overlay"></div>
        </div>
        <div className="pdp-final-content">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true }}
            className="pdp-final-headline"
          >
            One more reason to gather around the table.
          </motion.h2>
          <motion.button 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} viewport={{ once: true }}
            className="pdp-btn-primary large"
            onClick={() => onNavigate('shop')}
          >
            Explore Collection
          </motion.button>
        </div>
      </section>

    </div>
  );
}

export default ProductDetailsPage;
