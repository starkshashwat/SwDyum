import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { StarRating } from './StarRating.jsx';
import { PriceBlock } from './PriceBlock.jsx';

/**
 * Product tile used across Home "bestsellers" and Shop grid — image well,
 * rating, name, price row and an add-to-cart action.
 */
export function ProductCard({ product, onOpen, onAddToCart, featured = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: `1px solid ${hover ? 'transparent' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transform: hover ? 'translateY(-6px)' : 'none',
        boxShadow: hover ? 'var(--shadow-card-hover)' : 'none',
        transition: 'all var(--duration-normal) var(--ease-out)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {product.badge && (
        <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', zIndex: 3 }}>
          <Badge tone={product.badge}>{product.badge === 'bestseller' ? 'Best Seller' : product.badge === 'spicy' ? 'Spicy' : 'New'}</Badge>
        </div>
      )}
      <div style={{ height: featured ? 320 : 240, background: 'var(--color-cream)', overflow: 'hidden' }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hover ? 'scale(1.05)' : 'scale(1)', transition: 'transform var(--duration-slow) var(--ease-out)' }} />
      </div>
      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        <StarRating rating={product.rating} count={product.reviewsCount} size={14} />
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>{product.name}</h3>
        {product.tagline && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', margin: 0 }}>{product.tagline}</p>}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-light)' }}>
          <PriceBlock price={product.price} oldPrice={product.oldPrice} />
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 700, background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
