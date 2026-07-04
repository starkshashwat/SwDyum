import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchProducts } from './data/products';
import './ProductsSection.css';

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProducts();
      // Get top 4 bestsellers
      const bestsellers = data.filter(p => p.isBestseller).slice(0, 4);
      setProducts(bestsellers);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (addToCart) {
      addToCart(product, '250g', 1);
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
          <span className="section-eyebrow">Our Flavours</span>
          <h2 className="section-title">Meet the <em>4 Flavours</em></h2>
          <p className="section-subtitle-text">
            Loved by 200+ families across India. Sun-cured, small-batch, made with heritage recipes.
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
                    <svg key={idx} width="14" height="14" viewBox="0 0 24 24" fill={idx < product.rating ? 'var(--color-mustard)' : 'none'} stroke="var(--color-mustard)" strokeWidth="2" aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                  <span className="bs-review-count">({product.reviewsCount})</span>
                </div>

                <h3 className="bs-product-name">{product.name}</h3>
                <p className="bs-product-tagline">{product.tagline}</p>

                <div className="bs-price-row">
                  <div className="bs-prices">
                    <span className="bs-current-price">₹{product.base_price}</span>
                    {product.oldPrice && <span className="bs-old-price">₹{product.oldPrice}</span>}
                  </div>
                    <button
                    className="btn-primary bs-add-btn"
                    onClick={(e) => handleQuickAdd(e, product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
}

export default ProductsSection;
