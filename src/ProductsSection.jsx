import React from 'react';
import { motion } from 'framer-motion';
import './ProductsSection.css';

const products = [
  {
    id: 1,
    slug: 'mango-pickle',
    name: 'Signature Mango Pickle',
    tagline: 'Our #1 bestseller — rich, tangy, unforgettable.',
    price: 289,
    oldPrice: 349,
    weight: '250g',
    rating: 5,
    reviews: 312,
    image: '/prod_mango.png',
    badge: 'Best Seller',
  },
  {
    id: 2,
    slug: 'green-chilli-pickle',
    name: 'Stuffed Green Chilli',
    tagline: 'Fiery, bold, and packed with masala.',
    price: 319,
    weight: '250g',
    rating: 5,
    reviews: 187,
    image: '/prod_chili.png',
    badge: 'Spicy',
  },
  {
    id: 3,
    slug: 'garlic-pickle',
    name: 'Authentic Garlic Pickle',
    tagline: 'A flavour bomb for garlic lovers.',
    price: 279,
    weight: '250g',
    rating: 4,
    reviews: 143,
    image: '/prod_garlic.png',
  },
  {
    id: 4,
    slug: 'lemon-pickle',
    name: 'Sweet & Sour Lemon',
    tagline: 'A tangy delight, perfect with dal-chawal.',
    price: 249,
    weight: '250g',
    rating: 5,
    reviews: 208,
    image: '/prod_lemon.png',
    badge: 'New',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

function ProductsSection({ onNavigate, addToCart }) {
  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (addToCart) {
      addToCart(product, product.weight, 1);
    }
  };

  return (
    <section className="best-sellers-section section-padding">
      <div className="section-container">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow">Our Best Sellers</span>
          <h2 className="section-title">The Pickles Everyone's <em>Talking</em> About</h2>
          <p className="section-subtitle-text">
            Loved by 10,000+ families across India. Try what keeps them coming back for more.
          </p>
        </motion.div>

        <div className="best-sellers-grid">
          {products.map((product, i) => (
            <motion.div
              className="bs-product-card"
              key={product.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              onClick={() => onNavigate && onNavigate(`product-${product.slug}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onNavigate && onNavigate(`product-${product.slug}`); }}
              aria-label={`View ${product.name}`}
            >
              {product.badge && (
                <span className={`bs-badge ${product.badge === 'Best Seller' ? 'badge-bestseller' : product.badge === 'Spicy' ? 'badge-spicy' : 'badge-new'}`}>
                  {product.badge}
                </span>
              )}

              <div className="bs-image-wrapper">
                <img src={product.image} alt={product.name} className="bs-product-img" loading="lazy" />
              </div>

              <div className="bs-product-info">
                <div className="bs-rating">
                  {[...Array(5)].map((_, idx) => (
                    <svg key={idx} width="14" height="14" viewBox="0 0 24 24" fill={idx < product.rating ? 'var(--color-accent)' : 'none'} stroke="var(--color-accent)" strokeWidth="2" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                  <span className="bs-review-count">({product.reviews})</span>
                </div>

                <h3 className="bs-product-name">{product.name}</h3>
                <p className="bs-product-tagline">{product.tagline}</p>

                <div className="bs-price-row">
                  <div className="bs-prices">
                    <span className="bs-current-price">₹{product.price}</span>
                    {product.oldPrice && <span className="bs-old-price">₹{product.oldPrice}</span>}
                  </div>
                  <button
                    className="bs-add-btn"
                    onClick={(e) => handleQuickAdd(e, product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bs-view-all"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="secondary-cta"
            onClick={() => onNavigate && onNavigate('shop')}
          >
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductsSection;
