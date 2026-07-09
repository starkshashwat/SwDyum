import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PdpStickyBar.css';

function PdpStickyBar({ product, selectedSize, quantity, setQuantity, addToCart, handleBuyNow }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 560);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) return null;

  const currentPrice = product.prices[selectedSize] || product.base_price;
  const variant = (product.variants || []).find((v) => v.weight_label === selectedSize);
  const mrp = variant?.mrp || Math.round(currentPrice * 1.35);
  const savings = Math.max(0, mrp - currentPrice);
  const outOfStock = variant?.stock_quantity !== undefined && variant.stock_quantity <= 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pdp-sticky-bar"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="pdp-sticky-inner">
            <div className="pdp-sticky-product">
              <img src={product.image} alt={product.name} loading="lazy" />
              <div className="pdp-sticky-info">
                <h4>{product.name}</h4>
                <div className="pdp-sticky-price-row">
                  <span className="pdp-sticky-price">₹{currentPrice}</span>
                  {savings > 0 && <span className="pdp-sticky-save">Save ₹{savings}</span>}
                  <span className="pdp-sticky-variant">{selectedSize}</span>
                </div>
              </div>
            </div>

            <div className="pdp-sticky-actions">
              <div className="pdp-sticky-qty" role="group" aria-label="Quantity">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
                <span aria-live="polite">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                className="pdp-sticky-add"
                onClick={() => addToCart(product, selectedSize, quantity, 'One Time')}
                disabled={outOfStock}
              >
                Add
              </button>
              <button
                className="pdp-sticky-buy"
                onClick={() => handleBuyNow(product, selectedSize, quantity, 'One Time')}
                disabled={outOfStock}
              >
                Buy Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PdpStickyBar;
