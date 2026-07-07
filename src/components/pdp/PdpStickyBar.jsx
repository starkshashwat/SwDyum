import React, { useEffect, useState } from 'react';
import './PdpStickyBar.css';

function PdpStickyBar({ product, selectedSize, addToCart }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 600px (approx hero section)
      if (window.scrollY > 600) {
        setShow(true);
      } else {
        setShow(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product || !show) return null;

  const currentPrice = product.prices[selectedSize] || product.base_price;

  return (
    <div className={`pdp-sticky-bar ${show ? 'visible' : ''}`}>
      <div className="pdp-sticky-inner">
        <div className="pdp-sticky-product">
          <img src={product.image} alt={product.name} />
          <div className="pdp-sticky-info">
            <h4>{product.name}</h4>
            <span className="pdp-sticky-variant">{selectedSize} - ₹{currentPrice}</span>
          </div>
        </div>
        <div className="pdp-sticky-action">
          <button 
            className="pdp-sticky-add"
            onClick={() => addToCart(product, selectedSize, 1, 'One Time')}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdpStickyBar;
