/* @ds-bundle: {"format":4,"namespace":"SwadyumDesignSystem_f6d83b","components":[{"name":"CategoryCard","sourcePath":"components/commerce/CategoryCard.jsx"},{"name":"PriceBlock","sourcePath":"components/commerce/PriceBlock.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"StarRating","sourcePath":"components/commerce/StarRating.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Accordion","sourcePath":"components/feedback/Accordion.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"OtpInput","sourcePath":"components/forms/OtpInput.jsx"},{"name":"QuantitySelector","sourcePath":"components/forms/QuantitySelector.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Divider","sourcePath":"components/layout/Divider.jsx"},{"name":"SectionHeading","sourcePath":"components/layout/SectionHeading.jsx"}],"sourceHashes":{"components/commerce/CategoryCard.jsx":"d32c81607080","components/commerce/PriceBlock.jsx":"dbd82031dc59","components/commerce/ProductCard.jsx":"a3b72956ba33","components/commerce/StarRating.jsx":"52de2357a906","components/core/Badge.jsx":"c033260400e9","components/core/Button.jsx":"43f57b114cca","components/core/Chip.jsx":"f27606dfc261","components/core/IconButton.jsx":"b5fdc12d9064","components/feedback/Accordion.jsx":"b8479f92d67f","components/feedback/Modal.jsx":"f456c0f7f5fb","components/feedback/Toast.jsx":"3ecb83ac58ff","components/forms/Checkbox.jsx":"ce1235a63bde","components/forms/Input.jsx":"74bba3724a94","components/forms/OtpInput.jsx":"8981e63162ad","components/forms/QuantitySelector.jsx":"c8e3a5c6a436","components/forms/Select.jsx":"025e2e86df1f","components/layout/Divider.jsx":"de7a3e799e70","components/layout/SectionHeading.jsx":"82d05dea2b72","ui_kits/frontend-v2/AboutScreen.jsx":"8cca58465cfb","ui_kits/frontend-v2/AccountScreen.jsx":"8576a5164636","ui_kits/frontend-v2/CartDrawer.jsx":"5c73fa7ef33d","ui_kits/frontend-v2/CheckoutScreen.jsx":"3c09028fefb5","ui_kits/frontend-v2/ComboBuilder.jsx":"f0fefa5c0838","ui_kits/frontend-v2/ContactScreen.jsx":"3f2f4190cda4","ui_kits/frontend-v2/Footer.jsx":"96eb7d55f60f","ui_kits/frontend-v2/Header.jsx":"13fb333e5a4f","ui_kits/frontend-v2/HomeScreen.jsx":"be8ed09a760d","ui_kits/frontend-v2/Icons.jsx":"b227533e1429","ui_kits/frontend-v2/PdpScreen.jsx":"9493f520226e","ui_kits/frontend-v2/RecipesScreen.jsx":"3ec0d397032b","ui_kits/frontend-v2/ShopScreen.jsx":"342a6cbe83dc","ui_kits/frontend-v2/app.jsx":"12195b46a80a","ui_kits/frontend-v2/data.jsx":"6f1a6be14734","ui_kits/storefront/CartDrawer.jsx":"2d36c99ceb10","ui_kits/storefront/Footer.jsx":"df9d02531869","ui_kits/storefront/Header.jsx":"e9458ea1ce21","ui_kits/storefront/HomeScreen.jsx":"cd7c21fd64f7","ui_kits/storefront/Icons.jsx":"cc56540e6c22","ui_kits/storefront/LoginModal.jsx":"6f7740158126","ui_kits/storefront/PdpScreen.jsx":"7f1fab12fc5d","ui_kits/storefront/ShopScreen.jsx":"486c5bed3b76","ui_kits/storefront/app.jsx":"eaaf989a0aa7","ui_kits/storefront/data.jsx":"9c9da6e2232e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SwadyumDesignSystem_f6d83b = window.SwadyumDesignSystem_f6d83b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/CategoryCard.jsx
try { (() => {
/**
 * Category tile — image over a title/subtitle/arrow row, used on "Find Your
 * Favourite" grid.
 */
function CategoryCard({
  category,
  onOpen
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onOpen,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      cursor: 'pointer',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      transform: hover ? 'translateY(-4px)' : 'none',
      boxShadow: hover ? 'var(--shadow-lg)' : 'none',
      transition: 'all var(--duration-normal) var(--ease-out)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 180,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: category.image,
    alt: category.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(1.06)' : 'scale(1)',
      transition: 'transform var(--duration-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-4) var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-lg)',
      color: 'var(--color-ink)'
    }
  }, category.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)'
    }
  }, category.subtitle)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      transform: hover ? 'translateX(3px)' : 'none',
      transition: 'transform var(--duration-fast)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14M12 5l7 7-7 7"
  })))));
}
Object.assign(__ds_scope, { CategoryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/CategoryCard.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PriceBlock.jsx
try { (() => {
/**
 * Current price + struck-through MRP, used in product cards and PDP.
 */
function PriceBlock({
  price,
  oldPrice,
  unit
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-2)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--color-ink)'
    }
  }, "\u20B9", price), oldPrice && oldPrice > price && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted-light)',
      textDecoration: 'line-through'
    }
  }, "\u20B9", oldPrice), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)'
    }
  }, "/ ", unit));
}
Object.assign(__ds_scope, { PriceBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PriceBlock.jsx", error: String((e && e.message) || e) }); }

// components/commerce/StarRating.jsx
try { (() => {
/**
 * Row of star glyphs (filled/outline) with an optional review count.
 */
function StarRating({
  rating,
  count,
  size = 14
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }
  }, [...Array(5)].map((_, i) => /*#__PURE__*/React.createElement("svg", {
    key: i,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: i < Math.round(rating) ? 'var(--color-secondary)' : 'none',
    stroke: "var(--color-secondary)",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  }))), typeof count === 'number' && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'var(--space-2)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-muted)',
      fontFamily: 'var(--font-body)'
    }
  }, "(", count, ")"));
}
Object.assign(__ds_scope, { StarRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/StarRating.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
/**
 * Small pill label overlaid on product imagery — bestseller / spicy / new.
 */
function Badge({
  tone = 'bestseller',
  children
}) {
  const bg = {
    bestseller: 'var(--color-primary)',
    spicy: 'var(--color-accent)',
    new: 'var(--color-secondary)'
  }[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      padding: '6px 14px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      background: bg,
      color: '#fff',
      fontFamily: 'var(--font-body)'
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
/**
 * Product tile used across Home "bestsellers" and Shop grid — image well,
 * rating, name, price row and an add-to-cart action.
 */
function ProductCard({
  product,
  onOpen,
  onAddToCart,
  featured = false
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onOpen,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
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
      fontFamily: 'var(--font-body)'
    }
  }, product.badge && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'var(--space-4)',
      left: 'var(--space-4)',
      zIndex: 3
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: product.badge
  }, product.badge === 'bestseller' ? 'Best Seller' : product.badge === 'spicy' ? 'Spicy' : 'New')), /*#__PURE__*/React.createElement("div", {
    style: {
      height: featured ? 320 : 240,
      background: 'var(--color-cream)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transform: hover ? 'scale(1.05)' : 'scale(1)',
      transition: 'transform var(--duration-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StarRating, {
    rating: product.rating,
    count: product.reviewsCount,
    size: 14
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--color-ink)',
      margin: 0
    }
  }, product.name), product.tagline && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)',
      margin: 0
    }
  }, product.tagline), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 'auto',
      paddingTop: 'var(--space-3)',
      borderTop: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.PriceBlock, {
    price: product.price,
    oldPrice: product.oldPrice
  }), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onAddToCart && onAddToCart(product);
    },
    style: {
      padding: '10px 20px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      cursor: 'pointer'
    }
  }, "Add to Cart"))));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
/**
 * Pill-shaped CTA button in three treatments: solid primary, outlined
 * secondary, and underlined text link. Matches the site's global
 * `.btn-primary` / `.btn-secondary` / `.btn-text` system.
 */
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  type = 'button'
}) {
  const pad = size === 'sm' ? '10px 24px' : size === 'lg' ? '18px 44px' : '16px 40px';
  const fontSize = size === 'sm' ? 'var(--text-sm)' : 'var(--text-base)';
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize,
    borderRadius: 'var(--radius-full)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all var(--duration-normal) var(--ease-out)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    lineHeight: 1,
    border: 'none',
    opacity: disabled ? 0.5 : 1
  };
  const variants = {
    primary: {
      ...base,
      padding: pad,
      background: 'var(--color-primary)',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(10,90,50,0.2)'
    },
    secondary: {
      ...base,
      padding: pad,
      background: 'transparent',
      color: 'var(--color-ink)',
      border: '2px solid var(--color-border)'
    },
    text: {
      ...base,
      padding: 0,
      background: 'none',
      color: 'var(--color-primary)',
      fontSize: 'var(--text-sm)',
      textDecoration: 'underline',
      textUnderlineOffset: '3px'
    }
  };
  const hover = {
    primary: {
      background: 'var(--color-primary-dark)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(10,90,50,0.3)'
    },
    secondary: {
      background: 'var(--color-ink)',
      color: '#fff',
      borderColor: 'var(--color-ink)',
      transform: 'translateY(-2px)'
    },
    text: {
      color: 'var(--color-primary-dark)'
    }
  };
  const [isHover, setHover] = React.useState(false);
  const style = {
    ...variants[variant],
    ...(isHover && !disabled ? hover[variant] : {})
  };
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    style: style,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
/**
 * Small inline icon+label chip — trust bar items, PDP benefit callouts.
 */
function Chip({
  icon,
  title,
  subtitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontFamily: 'var(--font-body)'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex',
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.3
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-ink)',
      fontWeight: 700
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--color-muted)'
    }
  }, subtitle)));
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
/**
 * Circular 44x44 icon button — header actions, footer socials, cart trigger.
 */
function IconButton({
  children,
  label,
  active = false,
  onClick,
  filled = false
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: filled ? '1px solid var(--color-border)' : 'none',
      background: filled ? hover ? 'var(--color-primary)' : 'var(--color-cream)' : hover ? 'rgba(10,90,50,0.08)' : 'none',
      color: active ? 'var(--color-primary)' : filled && hover ? '#fff' : 'var(--color-ink)',
      borderRadius: filled ? '50%' : 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all var(--duration-fast)'
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Accordion.jsx
try { (() => {
const {
  useState
} = React;
/**
 * Single expand/collapse row — coupon field toggle, PDP FAQ.
 */
function Accordion({
  title,
  children,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--color-border-light)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-4) 0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 'var(--text-base)',
      fontWeight: 700,
      color: 'var(--color-ink)'
    }
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement("span", {
    style: {
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--duration-normal) var(--ease-out)',
      color: 'var(--color-primary)'
    }
  }, "\u25BC")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 'var(--space-4)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)',
      lineHeight: 1.7
    }
  }, children));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/**
 * Centered overlay dialog shell — WhatsApp login, delivery-message confirm.
 */
function Modal({
  open,
  onClose,
  children,
  width = 420
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'var(--overlay-ink-40)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'relative',
      width,
      maxWidth: '90vw',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-8)',
      boxShadow: 'var(--shadow-xl)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))), children));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/**
 * Fixed-position success/info toast, auto-dismiss expected to be handled by
 * the caller.
 */
function Toast({
  message,
  icon,
  visible
}) {
  if (!visible) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--color-primary-dark)',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'var(--shadow-lg)',
      zIndex: 9999,
      fontWeight: 500,
      fontFamily: 'var(--font-body)'
    }
  }, icon, message);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/**
 * Custom checkbox with a rounded box — WhatsApp opt-in, review form.
 */
function Checkbox({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-2)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      marginTop: 1,
      borderRadius: 6,
      border: `2px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: checked ? 'var(--color-primary)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all var(--duration-fast)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
/**
 * Text input on a soft cream fill, used standalone or inside an InputGroup
 * (e.g. newsletter signup, pincode checker, coupon code).
 */
function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  prefix,
  rightSlot
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      background: 'var(--color-cream)',
      border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-full)',
      padding: '4px 4px 4px 18px',
      gap: 'var(--space-2)',
      transition: 'border-color var(--duration-fast)'
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--color-muted)'
    }
  }, prefix), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '10px 6px',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-ink)'
    }
  }), rightSlot);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/OtpInput.jsx
try { (() => {
const {
  useRef
} = React;
/**
 * 6-box OTP entry — WhatsApp login modal, step 2.
 */
function OtpInput({
  length = 6,
  value,
  onChange
}) {
  const refs = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);
  const setDigit = (i, d) => {
    if (d && isNaN(d)) return;
    const next = digits.slice();
    next[i] = d;
    onChange(next.join(''));
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      justifyContent: 'center'
    }
  }, digits.map((d, i) => /*#__PURE__*/React.createElement("input", {
    key: i,
    ref: el => refs.current[i] = el,
    value: d,
    maxLength: 1,
    onChange: e => setDigit(i, e.target.value),
    onKeyDown: e => {
      if (e.key === 'Backspace' && !digits[i] && refs.current[i - 1]) refs.current[i - 1].focus();
    },
    style: {
      width: 44,
      height: 52,
      textAlign: 'center',
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--color-ink)',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)'
    }
  })));
}
Object.assign(__ds_scope, { OtpInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/OtpInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuantitySelector.jsx
try { (() => {
/**
 * Minus/count/plus stepper — PDP and cart line-item quantity control.
 */
function QuantitySelector({
  value,
  onChange,
  min = 1
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Quantity",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-full)',
      padding: '6px 6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Decrease quantity",
    onClick: () => onChange(Math.max(min, value - 1)),
    style: btnStyle
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    "aria-live": "polite",
    style: {
      minWidth: 20,
      textAlign: 'center',
      fontWeight: 700,
      color: 'var(--color-ink)'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Increase quantity",
    onClick: () => onChange(value + 1),
    style: btnStyle
  }, "+"));
}
const btnStyle = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  border: 'none',
  background: 'var(--color-cream)',
  color: 'var(--color-ink)',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
Object.assign(__ds_scope, { QuantitySelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuantitySelector.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/**
 * Native-feeling dropdown for sort/filter controls (shop toolbar).
 */
function Select({
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--color-ink)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      cursor: 'pointer'
    }
  }, options.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt.key,
    value: opt.key
  }, opt.label)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/layout/Divider.jsx
try { (() => {
const motifs = {
  lotus: color => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "20",
    x2: "320",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "480",
    y1: "20",
    x2: "800",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "400",
    cy: "20",
    rx: "8",
    ry: "6",
    stroke: color,
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M392 20 C392 12, 400 6, 400 6 C400 6, 408 12, 408 20",
    stroke: color,
    strokeWidth: "1",
    fill: "none"
  })),
  fish: color => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "20",
    x2: "310",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "490",
    y1: "20",
    x2: "800",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M340 20 C340 12, 360 8, 375 20 C360 32, 340 28, 340 20Z",
    stroke: color,
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M460 20 C460 12, 440 8, 425 20 C440 32, 460 28, 460 20Z",
    stroke: color,
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "400",
    cy: "20",
    r: "2.5",
    fill: color,
    opacity: "0.5"
  })),
  sun: color => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "20",
    x2: "360",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "440",
    y1: "20",
    x2: "800",
    y2: "20",
    stroke: color,
    strokeWidth: "1",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "400",
    cy: "20",
    r: "8",
    stroke: color,
    strokeWidth: "1.2",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "400",
    cy: "20",
    r: "4",
    stroke: color,
    strokeWidth: "0.8",
    fill: "none"
  })),
  floral: color => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "20",
    x2: "800",
    y2: "20",
    stroke: color,
    strokeWidth: "0.5",
    opacity: "0.2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "400",
    cy: "20",
    r: "5",
    stroke: color,
    strokeWidth: "1",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "400",
    cy: "20",
    r: "2",
    fill: color,
    opacity: "0.4"
  }))
};

/**
 * Thin-line Madhubani (Mithila folk-art) motif — the brand's one section
 * divider flourish, ported from the site's own MadhubaniDivider component.
 */
function Divider({
  variant = 'floral',
  color = 'var(--color-primary)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: 'var(--space-2) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 800 40",
    style: {
      width: '100%',
      maxWidth: 600,
      height: 32
    },
    fill: "none"
  }, (motifs[variant] || motifs.floral)(color)));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Divider.jsx", error: String((e && e.message) || e) }); }

// components/layout/SectionHeading.jsx
try { (() => {
/**
 * Centered eyebrow + title + optional subtitle — the standard section
 * header used before any product/category/story grid.
 */
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      fontFamily: 'var(--font-body)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      letterSpacing: '3px',
      textTransform: 'uppercase',
      color: 'var(--color-primary)',
      marginBottom: 'var(--space-3)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--text-4xl)',
      fontWeight: 700,
      color: 'var(--color-ink)',
      lineHeight: 1.15,
      margin: '0 0 var(--space-4)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-lg)',
      color: 'var(--color-muted)',
      maxWidth: 600,
      margin: align === 'center' ? '0 auto' : 0,
      lineHeight: 1.7
    }
  }, subtitle));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/AboutScreen.jsx
try { (() => {
function AboutScreen({
  onNavigate
}) {
  const {
    PROCESS_STEPS
  } = window;
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "About"
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: 380,
      display: 'flex',
      alignItems: 'center',
      backgroundImage: 'url(../../assets/imagery/about-us.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(17,32,24,0.55), rgba(17,32,24,0.75))'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      position: 'relative',
      zIndex: 2,
      color: '#fff',
      textAlign: 'center',
      padding: '72px 24px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--color-secondary)'
    }
  }, "Our Story"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h1",
    style: {
      color: '#fff'
    }
  }, "The Taste of ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: 'var(--color-secondary)'
    }
  }, "Ara, Bhojpur")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      opacity: 0.9,
      maxWidth: 520,
      margin: '16px auto 0',
      lineHeight: 1.7
    }
  }, "Bold, authentic, and uncompromising traditional food from the heart of Bihar."))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container split",
    style: {
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Our Roots"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "Pure heritage.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "No shortcuts."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      fontSize: 15.5,
      lineHeight: 1.8,
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
      color: 'var(--color-ink)'
    }
  }, "Swadyum was born in Ara, Bhojpur with a single mission: to deliver the absolute best of traditional Bihari cuisine to the world."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "We don't do mass production. We don't use chemical vinegars or artificial preservatives. We buy fruit straight from the tree, wash and cut it fresh, dry it in the open sun, hand-mix it with stone-ground spices \u2014 and let it rest for days before finishing it with mustard oil and whole spices."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "Every jar is then sealed in a moisture-proof container and shipped to your door. This isn't just food; it's a promise that what reaches your table tastes exactly like a Bihari home."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--color-ink)',
      fontFamily: 'var(--font-heading)'
    }
  }, "Swadyum Foods"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5
    }
  }, "Ara, Bhojpur, Bihar"))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "From Tree To Jar"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "How every jar ", /*#__PURE__*/React.createElement("em", null, "is made"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 820,
      margin: '0 auto'
    }
  }, PROCESS_STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.title,
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: s.image,
    alt: s.title,
    style: {
      width: 120,
      height: 90,
      borderRadius: 14,
      objectFit: 'cover',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      color: 'var(--color-primary)',
      fontSize: 15
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 17,
      margin: 0
    }
  }, s.title)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      lineHeight: 1.6,
      margin: 0
    }
  }, s.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex',
      paddingRight: 8
    },
    className: "desktop-only"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 26
  }))))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-dark",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Taste the best of ", /*#__PURE__*/React.createElement("em", null, "Bhojpur")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('shop')
  }, "Shop Now"))));
}
window.AboutScreen = AboutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/AboutScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/AccountScreen.jsx
try { (() => {
function AccountScreen({
  orders,
  subscription,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      paddingTop: 48
    },
    "data-screen-label": "Account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "My Account"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h2",
    style: {
      marginBottom: 32
    }
  }, "Namaste! \uD83D\uDE4F"), /*#__PURE__*/React.createElement("div", {
    className: "split",
    style: {
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 19,
      margin: '0 0 16px'
    }
  }, "My Orders"), orders.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 36,
      textAlign: 'center',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 36
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 0 18px',
      fontSize: 14
    }
  }, "No orders yet \u2014 your first jar is waiting."), /*#__PURE__*/React.createElement(BigBtn, {
    onClick: () => onNavigate('shop')
  }, "Shop Pickles")) : orders.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 20,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 15
    }
  }, "#", o.id), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--color-primary)',
      background: 'rgba(10,90,50,0.08)',
      padding: '5px 12px',
      borderRadius: 999
    }
  }, "Packing in Ara \xB7 ", o.date)), o.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      padding: '8px 0',
      borderTop: i === 0 ? 'none' : '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: it.image,
    alt: "",
    style: {
      width: 40,
      height: 40,
      borderRadius: 8,
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600
    }
  }, it.name, " \xB7 ", it.weight, " \xD7 ", it.qty), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700
    }
  }, "\u20B9", it.price * it.qty))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 10,
      fontSize: 14,
      fontWeight: 800
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total (", o.payment.toUpperCase(), ")"), /*#__PURE__*/React.createElement("span", null, "\u20B9", o.total))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary-dark)',
      color: '#fff',
      borderRadius: 20,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 17,
      margin: '0 0 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 18
  }), " Achaar of the Month"), subscription ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      opacity: 0.85,
      lineHeight: 1.6,
      margin: '0 0 12px'
    }
  }, "Active \xB7 next jar ships on the 1st. July flavour: ", /*#__PURE__*/React.createElement("strong", null, "Kathal Ka Achar"), "."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--color-secondary)'
    }
  }, "\u20B9", window.SUB_PRICE, "/month \xB7 cancel anytime")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      opacity: 0.85,
      lineHeight: 1.6,
      margin: '0 0 14px'
    }
  }, "You're not subscribed yet. A new seasonal jar, delivered monthly."), /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('combo')
  }, "Subscribe \u2014 \u20B9", window.SUB_PRICE, "/mo"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 16,
      margin: '0 0 12px'
    }
  }, "Profile"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--color-muted)',
      margin: 0,
      lineHeight: 1.9
    }
  }, "Signed in with WhatsApp", /*#__PURE__*/React.createElement("br", null), "+91 \u2022\u2022\u2022\u2022\u2022 \u2022\u2022\u202222", /*#__PURE__*/React.createElement("br", null), "Default address: not set"))))));
}
window.AccountScreen = AccountScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/AccountScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/CartDrawer.jsx
try { (() => {
function CartDrawer({
  open,
  onClose,
  cart,
  updateQty,
  onCheckout
}) {
  const {
    Accordion
  } = window.DS;
  const [coupon, setCoupon] = React.useState('');
  const [applied, setApplied] = React.useState(null);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const threshold = 799;
  const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 50;
  const total = subtotal - discount + shipping;
  const away = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, subtotal / threshold * 100);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 500
    },
    "data-screen-label": "Cart drawer"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--overlay-ink-40)',
      backdropFilter: 'blur(3px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 420,
      maxWidth: '92vw',
      height: '100%',
      background: 'var(--color-bg)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 22px',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 19,
      margin: 0
    }
  }, "Your Cart (", cart.reduce((s, i) => s + i.qty, 0), ")"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px'
    }
  }, away > 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      margin: '0 0 8px'
    }
  }, "You're ", /*#__PURE__*/React.createElement("strong", null, "\u20B9", away), " away from FREE shipping") : /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-primary)',
      fontWeight: 700,
      margin: '0 0 8px'
    }
  }, "\u2713 You unlocked FREE shipping"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--color-border)',
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: pct + '%',
      background: 'var(--color-primary)',
      borderRadius: 999,
      transition: 'width 300ms var(--ease-out)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 22px'
    }
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '56px 0',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart",
    size: 44
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--color-ink)',
      margin: '14px 0 4px',
      fontFamily: 'var(--font-heading)'
    }
  }, "Your cart is empty"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      margin: 0
    }
  }, "Let's find something delicious.")) : cart.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      padding: '14px 0',
      borderBottom: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: item.image,
    alt: item.name,
    style: {
      width: 60,
      height: 60,
      borderRadius: 12,
      objectFit: 'cover',
      background: 'var(--color-cream)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 700
    }
  }, item.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 8px',
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, item.weight, item.isCombo ? ' · Combo Box' : '', item.isSub ? ' · Monthly' : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 14
    }
  }, "\u20B9", item.price), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      border: '1px solid var(--color-border)',
      borderRadius: 999,
      padding: '3px 10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQty(i, item.qty - 1),
    style: qtyBtn
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, item.qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQty(i, item.qty + 1),
    style: qtyBtn
  }, "+")))))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 0'
    }
  }, /*#__PURE__*/React.createElement(Accordion, {
    title: "Have a coupon?"
  }, applied ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--color-primary)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " ", applied, " applied \u2014 10% off") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: coupon,
    onChange: e => setCoupon(e.target.value),
    placeholder: "Try SWADYUM20",
    style: {
      flex: 1,
      minWidth: 0,
      padding: '9px 12px',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      fontSize: 13,
      fontFamily: 'var(--font-body)',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ['SWADYUM20', 'WELCOME10'].includes(coupon.toUpperCase()) && setApplied(coupon.toUpperCase()),
    style: {
      padding: '9px 16px',
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Apply"))))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 22,
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface)'
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Subtotal",
    value: '₹' + subtotal
  }), discount > 0 && /*#__PURE__*/React.createElement(Row, {
    label: "Discount",
    value: '-₹' + discount,
    green: true
  }), shipping > 0 && /*#__PURE__*/React.createElement(Row, {
    label: "Shipping",
    value: '₹' + shipping
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 17,
      fontWeight: 800,
      margin: '10px 0 16px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "\u20B9", total)), /*#__PURE__*/React.createElement("button", {
    onClick: () => onCheckout(total),
    style: {
      width: '100%',
      padding: '16px 0',
      borderRadius: 999,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, "Proceed to Checkout \xB7 \u20B9", total), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 11.5,
      color: 'var(--color-muted)',
      margin: '10px 0 0'
    }
  }, "\uD83D\uDD12 Secure checkout \xB7 COD available \xB7 7-day returns"))));
}
function Row({
  label,
  value,
  green
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: green ? 'var(--color-primary)' : 'var(--color-muted)',
      marginBottom: 4,
      fontWeight: green ? 700 : 400
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, value));
}
const qtyBtn = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--color-ink)',
  padding: 0,
  width: 16
};
window.CartDrawer = CartDrawer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/CartDrawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/CheckoutScreen.jsx
try { (() => {
function CheckoutScreen({
  cart,
  onPlaceOrder,
  onNavigate
}) {
  const [form, setForm] = React.useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pin: ''
  });
  const [payment, setPayment] = React.useState('upi');
  const [placed, setPlaced] = React.useState(null);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 799 ? 0 : 50;
  const total = subtotal + shipping;
  const valid = form.name && form.phone.length >= 10 && form.address && form.pin.length === 6;
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  const place = () => {
    if (!valid) return;
    const id = 'SWD' + Math.floor(1000 + Math.random() * 9000);
    onPlaceOrder({
      id,
      items: cart,
      total,
      payment,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      })
    });
    setPlaced(id);
    window.scrollTo({
      top: 0
    });
  };
  if (placed) {
    return /*#__PURE__*/React.createElement("div", {
      className: "section",
      style: {
        textAlign: 'center'
      },
      "data-screen-label": "Order placed"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 480,
        margin: '40px auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "checkSimple",
      size: 38
    })), /*#__PURE__*/React.createElement("h1", {
      className: "headline h2"
    }, "Order placed!"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        color: 'var(--color-muted)',
        lineHeight: 1.7,
        margin: '14px 0 6px'
      }
    }, "Order ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: 'var(--color-ink)'
      }
    }, "#", placed), " is being packed in Ara. Your jars will reach you in 4\u20137 days."), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13,
        color: 'var(--color-muted)',
        margin: '0 0 28px'
      }
    }, "We'll send updates on WhatsApp."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(BigBtn, {
      onClick: () => onNavigate('account')
    }, "Track in My Orders"), /*#__PURE__*/React.createElement(GhostBtn, {
      onClick: () => onNavigate('shop')
    }, "Keep Shopping"))));
  }
  if (cart.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "section",
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      className: "headline h2"
    }, "Nothing to check out"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: 'var(--color-muted)',
        margin: '12px 0 24px'
      }
    }, "Your cart is empty \u2014 go grab a jar first."), /*#__PURE__*/React.createElement(BigBtn, {
      onClick: () => onNavigate('shop')
    }, "Shop Pickles"));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      paddingTop: 48
    },
    "data-screen-label": "Checkout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "headline h2",
    style: {
      marginBottom: 32
    }
  }, "Checkout"), /*#__PURE__*/React.createElement("div", {
    className: "split",
    style: {
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("h2", {
    style: cardHead
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 18
  }), " Delivery Address"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: field,
    placeholder: "Full name",
    value: form.name,
    onChange: set('name')
  }), /*#__PURE__*/React.createElement("input", {
    style: field,
    placeholder: "Phone number",
    value: form.phone,
    onChange: e => setForm({
      ...form,
      phone: e.target.value.replace(/\D/g, '').slice(0, 10)
    })
  }), /*#__PURE__*/React.createElement("input", {
    style: field,
    placeholder: "Address (house, street, landmark)",
    value: form.address,
    onChange: set('address')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: {
      ...field,
      flex: 1.4
    },
    placeholder: "City",
    value: form.city,
    onChange: set('city')
  }), /*#__PURE__*/React.createElement("input", {
    style: {
      ...field,
      flex: 1
    },
    placeholder: "PIN code",
    value: form.pin,
    onChange: e => setForm({
      ...form,
      pin: e.target.value.replace(/\D/g, '').slice(0, 6)
    })
  })))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("h2", {
    style: cardHead
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 18
  }), " Payment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [['upi', 'UPI', 'GPay, PhonePe, Paytm'], ['card', 'Card', 'Credit / debit card'], ['cod', 'Cash on Delivery', 'Pay when your jars arrive']].map(([k, label, sub]) => /*#__PURE__*/React.createElement("label", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 14,
      cursor: 'pointer',
      border: `2px solid ${payment === k ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: payment === k ? 'rgba(10,90,50,0.04)' : 'var(--color-surface)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: `2px solid ${payment === k ? 'var(--color-primary)' : 'var(--color-border)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, payment === k && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--color-primary)'
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    checked: payment === k,
    onChange: () => setPayment(k),
    style: {
      display: 'none'
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 14
    }
  }, label), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", {
    style: {
      color: 'var(--color-muted)',
      fontSize: 12
    }
  }, sub))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      position: 'sticky',
      top: 100
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: cardHead
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart",
    size: 18
  }), " Order Summary"), cart.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: item.image,
    alt: "",
    style: {
      width: 46,
      height: 46,
      borderRadius: 10,
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700
    }
  }, item.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, item.weight, " \xD7 ", item.qty)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700
    }
  }, "\u20B9", item.price * item.qty))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement(SummaryRow, {
    label: "Subtotal",
    value: '₹' + subtotal
  }), /*#__PURE__*/React.createElement(SummaryRow, {
    label: "Shipping",
    value: shipping === 0 ? 'FREE' : '₹' + shipping,
    green: shipping === 0
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 18,
      fontWeight: 800,
      margin: '12px 0 18px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "\u20B9", total)), /*#__PURE__*/React.createElement("button", {
    onClick: place,
    disabled: !valid,
    style: {
      width: '100%',
      padding: '16px 0',
      borderRadius: 999,
      border: 'none',
      cursor: valid ? 'pointer' : 'not-allowed',
      background: valid ? 'var(--color-primary)' : 'var(--color-border)',
      color: valid ? '#fff' : 'var(--color-muted)',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-body)'
    }
  }, valid ? `Place Order · ₹${total}` : 'Fill address to continue'), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 11.5,
      color: 'var(--color-muted)',
      margin: '10px 0 0'
    }
  }, "\uD83D\uDD12 This is a design mock \u2014 no payment is processed."))))));
}
function SummaryRow({
  label,
  value,
  green
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      color: green ? 'var(--color-primary)' : 'var(--color-muted)',
      marginBottom: 5,
      fontWeight: green ? 700 : 500
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, value));
}
const card = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 20,
  padding: 24
};
const cardHead = {
  fontFamily: 'var(--font-heading)',
  fontSize: 17,
  margin: '0 0 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--color-ink)'
};
const field = {
  padding: '13px 16px',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  outline: 'none',
  background: 'var(--color-bg)',
  width: '100%',
  minWidth: 0
};
window.CheckoutScreen = CheckoutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/CheckoutScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/ComboBuilder.jsx
try { (() => {
function ComboBuilder({
  onNavigate,
  addComboToCart,
  subscribe
}) {
  const {
    PRODUCTS,
    COMBO_PRICE,
    COMBO_MRP,
    SUB_PRICE
  } = window;
  const [slots, setSlots] = React.useState([]); // array of product ids (max 3, repeats allowed)
  const [subscribed, setSubscribed] = React.useState(false);
  const full = slots.length === 3;
  const addSlot = p => {
    if (!full) setSlots([...slots, p.id]);
  };
  const removeSlot = i => setSlots(slots.filter((_, idx) => idx !== i));
  const slotProducts = slots.map(id => PRODUCTS.find(p => p.id === id));
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Combo Builder"
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-primary-dark)',
      color: '#fff',
      padding: '56px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--color-secondary)'
    }
  }, "Only at Swadyum"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Build Your Own ", /*#__PURE__*/React.createElement("em", null, "Achaar Box")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      opacity: 0.85,
      maxWidth: 520,
      margin: '14px auto 0',
      lineHeight: 1.7
    }
  }, "Pick any 3 \xD7 250g jars \u2014 mix flavours or repeat your favourite. Flat \u20B9", COMBO_PRICE, " (worth \u20B9", COMBO_MRP, ").")), /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 48
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container split",
    style: {
      padding: '0 24px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "headline h3",
    style: {
      marginBottom: 20
    }
  }, "1 \xB7 Pick your flavours"), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, PRODUCTS.map(p => {
    const count = slots.filter(id => id === p.id).length;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        background: 'var(--color-surface)',
        border: `2px solid ${count ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative'
      }
    }, count > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'var(--color-primary)',
        color: '#fff',
        fontWeight: 800,
        fontSize: 13,
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }
    }, count), /*#__PURE__*/React.createElement("img", {
      src: p.image,
      alt: p.name,
      style: {
        height: 130,
        width: '100%',
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-heading)',
        fontSize: 15,
        margin: '0 0 2px'
      }
    }, p.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: 'var(--color-muted)',
        margin: '0 0 10px'
      }
    }, p.en, " \xB7 250g"), /*#__PURE__*/React.createElement("button", {
      onClick: () => addSlot(p),
      disabled: full,
      style: {
        width: '100%',
        padding: '10px 0',
        borderRadius: 999,
        border: 'none',
        cursor: full ? 'not-allowed' : 'pointer',
        background: full ? 'var(--color-border)' : 'var(--color-primary)',
        color: full ? 'var(--color-muted)' : '#fff',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'var(--font-body)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14
    }), " Add to box")));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 100
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "headline h3",
    style: {
      marginBottom: 20
    }
  }, "2 \xB7 Watch it fill up"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 24,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 18
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      aspectRatio: '1',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      border: slotProducts[i] ? 'none' : '2px dashed var(--color-border)',
      background: slotProducts[i] ? 'none' : 'var(--color-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, slotProducts[i] ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: slotProducts[i].image,
    alt: slotProducts[i].name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeSlot(i),
    "aria-label": "Remove",
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(17,32,24,0.75)',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 12
  }))) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-muted-light)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "jar",
    size: 26
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, slots.length, " of 3 jars"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)'
    }
  }, full ? `You save ₹${COMBO_MRP - COMBO_PRICE}` : 'Add ' + (3 - slots.length) + ' more')), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'var(--color-border)',
      borderRadius: 999,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: slots.length / 3 * 100 + '%',
      height: '100%',
      background: 'var(--color-primary)',
      borderRadius: 999,
      transition: 'width 300ms var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)'
    }
  }, "Box total"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 26
    }
  }, "\u20B9", COMBO_PRICE), " ", /*#__PURE__*/React.createElement("s", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted-light)'
    }
  }, "\u20B9", COMBO_MRP))), /*#__PURE__*/React.createElement("button", {
    onClick: () => full && addComboToCart(slotProducts),
    disabled: !full,
    style: {
      width: '100%',
      padding: '16px 0',
      borderRadius: 999,
      border: 'none',
      cursor: full ? 'pointer' : 'not-allowed',
      background: full ? 'var(--color-primary)' : 'var(--color-border)',
      color: full ? '#fff' : 'var(--color-muted)',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-body)'
    }
  }, full ? `Add Box to Cart · ₹${COMBO_PRICE}` : 'Pick 3 jars to continue')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      background: 'var(--color-cream)',
      border: '1px solid var(--color-border)',
      borderRadius: 24,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 17,
      margin: 0
    }
  }, "Achaar of the Month")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--color-muted)',
      lineHeight: 1.65,
      margin: '0 0 14px'
    }
  }, "A seasonal small-batch jar delivered monthly \u2014 kathal in monsoon, gobhi in winter, aam at peak season. Free delivery. Cancel anytime."), subscribed ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--color-primary)',
      fontWeight: 700,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16
  }), " Subscribed! First jar ships on the 1st.") : /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSubscribed(true);
      subscribe && subscribe();
    },
    style: {
      width: '100%',
      padding: '14px 0',
      borderRadius: 999,
      border: '2px solid var(--color-primary)',
      background: 'transparent',
      color: 'var(--color-primary)',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, "Subscribe \u2014 \u20B9", SUB_PRICE, "/month"))))));
}
window.ComboBuilder = ComboBuilder;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/ComboBuilder.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/ContactScreen.jsx
try { (() => {
function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    msg: ''
  });
  const f = {
    padding: '13px 16px',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    background: 'var(--color-bg)',
    width: '100%'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "section",
    style: {
      paddingTop: 48
    },
    "data-screen-label": "Contact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container split",
    style: {
      padding: '0 24px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Contact Us"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h2"
  }, "Baat karein? ", /*#__PURE__*/React.createElement("em", null, "We're listening.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-muted)',
      lineHeight: 1.75,
      margin: '16px 0 28px',
      maxWidth: 440
    }
  }, "Questions about an order, bulk gifting, or which pickle suits your spice tolerance \u2014 message us and a real person from Ara replies."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, [['phone', '+91 8340528122', 'Mon–Sat, 10am–7pm'], ['mail', 'swadyum@gmail.com', 'Replies within a day'], ['pin', 'Ara, Bhojpur, Bihar', 'Where every jar is made']].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: 'var(--color-cream)',
      color: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 19
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 14.5
    }
  }, t), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", {
    style: {
      color: 'var(--color-muted)',
      fontSize: 12.5
    }
  }, s)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 24,
      padding: 28
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 40
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      margin: '14px 0 6px'
    }
  }, "Message sent!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--color-muted)',
      margin: 0
    }
  }, "We'll get back to you within a day.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: f,
    placeholder: "Your name",
    value: form.name,
    onChange: e => setForm({
      ...form,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    style: f,
    placeholder: "Email or phone",
    value: form.email,
    onChange: e => setForm({
      ...form,
      email: e.target.value
    })
  }), /*#__PURE__*/React.createElement("textarea", {
    style: {
      ...f,
      minHeight: 120,
      resize: 'vertical'
    },
    placeholder: "Tell us what's on your mind\u2026",
    value: form.msg,
    onChange: e => setForm({
      ...form,
      msg: e.target.value
    })
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => form.name && form.msg && setSent(true),
    style: {
      padding: '15px 0',
      borderRadius: 999,
      border: 'none',
      background: 'var(--color-primary)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)'
    }
  }, "Send Message")))));
}
window.ContactScreen = ContactScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/Footer.jsx
try { (() => {
function Footer({
  onNavigate
}) {
  const [email, setEmail] = React.useState('');
  const [ok, setOk] = React.useState(false);
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-primary-dark)',
      color: '#fff',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: '64px 24px 40px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-4",
    style: {
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/logo-mark.png",
    alt: "Swadyum",
    style: {
      height: 52,
      width: 52
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 20
    }
  }, "Swadyum")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.7,
      opacity: 0.8,
      margin: 0
    }
  }, "Bold, authentic pickles from Ara, Bihar \u2014 picked from the tree, dried in the open sun, sealed fresh for your table."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, ['instagram', 'facebook'].map(s => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s,
    size: 18
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: footHead
  }, "Shop"), /*#__PURE__*/React.createElement("div", {
    style: footList
  }, /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('shop')
  }, "All Pickles"), /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('combo')
  }, "Build Your Box"), /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('combo')
  }, "Achaar of the Month"), /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('recipes')
  }, "Recipes"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: footHead
  }, "Company"), /*#__PURE__*/React.createElement("div", {
    style: footList
  }, /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('about')
  }, "Our Story"), /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('contact')
  }, "Contact Us"), /*#__PURE__*/React.createElement("a", {
    style: footLink,
    onClick: () => onNavigate('account')
  }, "My Orders"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: footHead
  }, "Join the Family"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      opacity: 0.8,
      lineHeight: 1.6,
      margin: '0 0 14px'
    }
  }, "Heritage recipes, new batch alerts, and subscriber-only flavours."), ok ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16
  }), " Welcome to the Swadyum family!") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 999,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "Your email",
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: '10px 14px',
      fontSize: 13,
      color: '#fff',
      fontFamily: 'var(--font-body)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => email && setOk(true),
    style: {
      background: 'var(--color-secondary)',
      color: 'var(--color-primary-dark)',
      border: 'none',
      width: 38,
      height: 38,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 16
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid rgba(255,255,255,0.15)',
      marginTop: 48,
      paddingTop: 20,
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
      fontSize: 12,
      opacity: 0.7
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Swadyum Foods Pvt. Ltd. All Rights Reserved."), /*#__PURE__*/React.createElement("span", null, "Privacy Policy \xB7 Terms \xB7 Shipping \xB7 Returns"))));
}
const footHead = {
  fontFamily: 'var(--font-heading)',
  fontSize: 16,
  fontWeight: 700,
  margin: '0 0 16px'
};
const footList = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};
const footLink = {
  fontSize: 14,
  color: 'rgba(255,255,255,0.75)'
};
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/Header.jsx
try { (() => {
function Header({
  page,
  onNavigate,
  cartCount,
  onOpenCart
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navLinks = [{
    key: 'home',
    label: 'Home'
  }, {
    key: 'shop',
    label: 'Shop'
  }, {
    key: 'combo',
    label: 'Build a Box'
  }, {
    key: 'recipes',
    label: 'Recipes'
  }, {
    key: 'about',
    label: 'Our Story'
  }, {
    key: 'contact',
    label: 'Contact'
  }];
  const go = k => {
    setMenuOpen(false);
    onNavigate(k);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-ink)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      textAlign: 'center',
      padding: '9px 16px'
    }
  }, "\uD83C\uDF89 Flat 20% off \u2014 code SWADYUM20 \xB7 Free shipping above \u20B9799"), /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'rgba(244,248,245,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => go('home'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/logo-mark.png",
    alt: "Swadyum",
    style: {
      height: 42,
      width: 42
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 20,
      color: 'var(--color-ink)'
    }
  }, "Swadyum")), /*#__PURE__*/React.createElement("nav", {
    className: "desktop-only",
    style: {
      gap: 2
    }
  }, navLinks.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.key,
    onClick: () => go(l.key),
    style: {
      padding: '8px 14px',
      fontSize: 14,
      fontWeight: 600,
      borderRadius: 10,
      color: page === l.key ? 'var(--color-primary)' : 'var(--color-ink)',
      borderBottom: page === l.key ? '2px solid var(--color-primary)' : '2px solid transparent'
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go('account'),
    "aria-label": "Account",
    style: iconBtn(page === 'account')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "account"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCart,
    "aria-label": "Cart",
    style: {
      ...iconBtn(false),
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart"
  }), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      right: 3,
      minWidth: 18,
      height: 18,
      background: 'var(--color-primary)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px'
    }
  }, cartCount)), /*#__PURE__*/React.createElement("button", {
    className: "mobile-only",
    onClick: () => setMenuOpen(!menuOpen),
    "aria-label": "Menu",
    style: iconBtn(false)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: menuOpen ? 'close' : 'menu'
  })))), menuOpen && /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 16px 16px',
      background: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)'
    }
  }, navLinks.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.key,
    onClick: () => go(l.key),
    style: {
      padding: '14px 12px',
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 10,
      color: page === l.key ? 'var(--color-primary)' : 'var(--color-ink)',
      background: page === l.key ? 'rgba(10,90,50,0.06)' : 'none'
    }
  }, l.label)))));
}
function iconBtn(active) {
  return {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderRadius: 10,
    color: active ? 'var(--color-primary)' : 'var(--color-ink)'
  };
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/HomeScreen.jsx
try { (() => {
function HomeScreen({
  onNavigate,
  addToCart
}) {
  const {
    ProductCard,
    StarRating
  } = window.DS;
  const {
    PRODUCTS,
    TRUST_ITEMS,
    PROCESS_STEPS,
    REVIEWS,
    COMBO_PRICE,
    COMBO_MRP,
    SUB_PRICE
  } = window;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: '82vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundImage: 'url(../../assets/imagery/hero_banner.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(100deg, var(--overlay-cream-97) 0%, var(--overlay-cream-92) 32%, var(--overlay-cream-65) 58%, var(--overlay-cream-0) 78%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      position: 'relative',
      zIndex: 2,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 620,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      padding: '64px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      marginBottom: 0
    }
  }, "Ara \xB7 Bhojpur \xB7 Bihar"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h1"
  }, "Bold. Sun-Dried.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("em", null, "Unapologetically Bihari.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
      color: 'var(--color-muted)',
      lineHeight: 1.75,
      maxWidth: 500,
      fontWeight: 500,
      margin: 0
    }
  }, "Fruit picked straight from the tree, cut fresh, dried in the open sun, and hand-mixed with ground spices \u2014 then sealed in moisture-proof jars for your table. No preservatives. No shortcuts."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(BigBtn, {
    onClick: () => onNavigate('shop')
  }, "Shop Pickles"), /*#__PURE__*/React.createElement(GhostBtn, {
    onClick: () => onNavigate('combo')
  }, "Build Your Box \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    rating: 4.8,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, "4.8/5 \u2014 loved by 200+ families across India"))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-ink)',
      color: '#fff',
      padding: '14px 0',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 48,
      justifyContent: 'center',
      flexWrap: 'wrap',
      padding: '0 16px'
    }
  }, TRUST_ITEMS.map(t => /*#__PURE__*/React.createElement("span", {
    key: t.text,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-secondary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 16
  })), t.text)))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Our Flavours"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "Meet the ", /*#__PURE__*/React.createElement("em", null, "4 Flavours"))), /*#__PURE__*/React.createElement("div", {
    className: "grid-4"
  }, PRODUCTS.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.id,
    product: {
      ...p,
      price: p.prices['250g'],
      oldPrice: p.mrps['250g']
    },
    onOpen: () => onNavigate('product-' + p.slug),
    onAddToCart: () => addToCart(p, '250g')
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container split",
    style: {
      padding: '0 24px'
    },
    "data-screen-label": "Combo teaser"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Only at Swadyum"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Build Your Own ", /*#__PURE__*/React.createElement("em", null, "Achaar Box")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.75,
      opacity: 0.85,
      maxWidth: 460,
      margin: '16px 0 24px'
    }
  }, "Pick any 3 jars, watch your box fill up, and save \u20B9", COMBO_MRP - COMBO_PRICE, ". Mix flavours, repeat your favourite \u2014 it's your box."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('combo')
  }, "Start Building \u2014 \u20B9", COMBO_PRICE), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      textDecoration: 'line-through',
      opacity: 0.6
    }
  }, "\u20B9", COMBO_MRP))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 24,
      padding: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 16
    }
  }, PRODUCTS.slice(0, 3).map(p => /*#__PURE__*/React.createElement("img", {
    key: p.id,
    src: p.image,
    alt: p.name,
    style: {
      width: '33.3%',
      aspectRatio: '1',
      objectFit: 'cover',
      borderRadius: 14
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, "Your box \xB7 3 of 3 jars"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-secondary)',
      fontWeight: 700
    }
  }, "You save \u20B9", COMBO_MRP - COMBO_PRICE)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 999,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      background: 'var(--color-secondary)',
      borderRadius: 999
    }
  }))))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    "data-screen-label": "Process"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "From Tree To Jar"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "Five honest steps. ", /*#__PURE__*/React.createElement("em", null, "Zero shortcuts."))), /*#__PURE__*/React.createElement("div", {
    className: "grid-5"
  }, PROCESS_STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.title,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 110,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: s.image,
    alt: s.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--color-primary)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 13
    }
  }, "0", i + 1), /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 16
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 15,
      margin: '0 0 6px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: 'var(--color-muted)',
      lineHeight: 1.55,
      margin: 0
    }
  }, s.desc))))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-cream",
    "data-screen-label": "Subscription"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container split",
    style: {
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      overflow: 'hidden',
      minHeight: 280
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/imagery/deal-scatter.webp",
    alt: "Achaar of the month",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Achaar of the Month"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "A new seasonal jar, ", /*#__PURE__*/React.createElement("em", null, "every month")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--color-muted)',
      lineHeight: 1.75,
      maxWidth: 460,
      margin: '16px 0 20px'
    }
  }, "Kathal in monsoon. Gobhi in winter. Aam when the season peaks. Subscribers get the seasonal small-batch jar before anyone else \u2014 \u20B9", SUB_PRICE, "/month, cancel anytime."), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, ['Seasonal flavour, never in the regular shop', 'Free delivery, always', 'Pause or cancel in one tap'].map(t => /*#__PURE__*/React.createElement("li", {
    key: t,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      fontSize: 14,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "checkSimple",
    size: 16
  })), t))), /*#__PURE__*/React.createElement(BigBtn, {
    onClick: () => onNavigate('combo')
  }, "Subscribe \u2014 \u20B9", SUB_PRICE, "/mo")))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    "data-screen-label": "Reviews"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "200+ Families"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h2"
  }, "Tastes like ", /*#__PURE__*/React.createElement("em", null, "home"))), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, REVIEWS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.name,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 20,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    rating: r.rating,
    size: 14
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14.5,
      lineHeight: 1.7,
      color: 'var(--color-ink)',
      margin: 0
    }
  }, "\"", r.text, "\""), r.image && /*#__PURE__*/React.createElement("img", {
    src: r.image,
    alt: "",
    style: {
      borderRadius: 12,
      height: 120,
      objectFit: 'cover',
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-muted)'
    }
  }, r.name, " \xB7 ", r.city)))))), /*#__PURE__*/React.createElement("section", {
    className: "section section-dark",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Your dal is waiting for its ", /*#__PURE__*/React.createElement("em", null, "achar.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'flex',
      gap: 14,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('shop')
  }, "Shop All Pickles"), /*#__PURE__*/React.createElement(GhostBtn, {
    light: true,
    onClick: () => onNavigate('about')
  }, "Read Our Story")))));
}
function BigBtn({
  children,
  onClick,
  light
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      padding: '16px 36px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-body)',
      background: light ? 'var(--color-secondary)' : 'var(--color-primary)',
      color: light ? 'var(--color-primary-dark)' : '#fff',
      boxShadow: '0 4px 14px rgba(10,90,50,0.2)'
    }
  }, children);
}
function GhostBtn({
  children,
  onClick,
  light
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      padding: '15px 32px',
      borderRadius: 999,
      cursor: 'pointer',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-body)',
      background: 'transparent',
      border: `2px solid ${light ? 'rgba(255,255,255,0.4)' : 'var(--color-border)'}`,
      color: light ? '#fff' : 'var(--color-ink)'
    }
  }, children);
}
window.HomeScreen = HomeScreen;
window.BigBtn = BigBtn;
window.GhostBtn = GhostBtn;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/Icons.jsx
try { (() => {
/* Feather-style stroke icons, matching the brand's icon rules */
function Icon({
  name,
  size = 20
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const paths = {
    account: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })),
    cart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 10a4 4 0 01-8 0"
    })),
    menu: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "18",
      x2: "21",
      y2: "18"
    })),
    close: /*#__PURE__*/React.createElement("path", {
      d: "M18 6L6 18M6 6l12 12"
    }),
    arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    })),
    back: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 19 5 12 12 5"
    })),
    leaf: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.8 11-10 11z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"
    })),
    sun: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "1",
      x2: "12",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "21",
      x2: "12",
      y2: "23"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "4.22",
      x2: "5.64",
      y2: "5.64"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "18.36",
      x2: "19.78",
      y2: "19.78"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "12",
      x2: "3",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "23",
      y2: "12"
    })),
    shield: /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }),
    truck: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "3",
      width: "15",
      height: "13"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "16 8 20 8 23 11 23 16 16 16 16 8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5.5",
      cy: "18.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18.5",
      cy: "18.5",
      r: "2.5"
    })),
    heart: /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
    }),
    check: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 11.08V12a10 10 0 11-5.93-9.14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22 4 12 14.01 9 11.01"
    })),
    checkSimple: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 17 4 12"
    }),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    instagram: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5",
      ry: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17.5",
      y1: "6.5",
      x2: "17.51",
      y2: "6.5"
    })),
    facebook: /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
    }),
    phone: /*#__PURE__*/React.createElement("path", {
      d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
    }),
    mail: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22,6 12,13 2,6"
    })),
    pin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "10",
      r: "3"
    })),
    star: /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
    }),
    box: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "3.27 6.96 12 12.01 20.73 6.96"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "22.08",
      x2: "12",
      y2: "12"
    })),
    calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })),
    plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })),
    minus: /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }),
    chili: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9 11c-3 0-6 2.5-6 7 0 2 1 4 3 4 6 0 12-6 13-13"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 9a4 4 0 00-6-5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19 9c1.5-.5 2.5-2 2-4"
    })),
    scissors: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "6",
      r: "3"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "6",
      cy: "18",
      r: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "20",
      y1: "4",
      x2: "8.12",
      y2: "15.88"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "14.47",
      y1: "14.48",
      x2: "20",
      y2: "20"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8.12",
      y1: "8.12",
      x2: "12",
      y2: "12"
    })),
    droplet: /*#__PURE__*/React.createElement("path", {
      d: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
    }),
    jar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M8 2h8l2 6H6l2-6z"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "6",
      y: "8",
      width: "12",
      height: "12",
      rx: "2"
    })),
    refresh: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 12a9 9 0 109-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 4v5h5"
    })),
    tree: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 22v-7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 15l4-4a5 5 0 10-8 0z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 9V2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "6",
      r: "4"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", common, paths[name] || null);
}
window.Icon = Icon;
window.DS = window.SwadyumDesignSystem_f6d83b;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/PdpScreen.jsx
try { (() => {
function PdpScreen({
  product,
  onNavigate,
  addToCart
}) {
  const {
    StarRating,
    QuantitySelector,
    Accordion
  } = window.DS;
  const {
    RECIPES,
    REVIEWS,
    PRODUCTS
  } = window;
  const [size, setSize] = React.useState(Object.keys(product.prices)[0]);
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);
  const [pin, setPin] = React.useState('');
  const [pinMsg, setPinMsg] = React.useState(null);
  const [added, setAdded] = React.useState(false);
  const [showSticky, setShowSticky] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const price = product.prices[size];
  const mrp = product.mrps[size];
  const off = Math.round((mrp - price) / mrp * 100);
  const pairRecipes = RECIPES.filter(r => product.pairs.includes(r.slug));
  const checkPin = () => {
    if (pin.length === 6) {
      const d1 = new Date();
      d1.setDate(d1.getDate() + 4);
      const d2 = new Date();
      d2.setDate(d2.getDate() + 7);
      const f = d => d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
      setPinMsg({
        ok: true,
        text: `Get it by ${f(d1)} – ${f(d2)} · COD available`
      });
    } else setPinMsg({
      ok: false,
      text: 'Please enter a valid 6-digit PIN code.'
    });
  };
  const handleAdd = () => {
    addToCart(product, size, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": 'PDP ' + product.name,
    style: {
      paddingBottom: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      paddingTop: 24
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 13,
      color: 'var(--color-muted)',
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('home')
  }, "Home"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('shop')
  }, "Shop"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-ink)'
    }
  }, product.name)), /*#__PURE__*/React.createElement("div", {
    className: "split",
    style: {
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 24,
      overflow: 'hidden',
      background: 'var(--color-cream)',
      aspectRatio: '1',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.gallery[imgIdx],
    alt: product.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), off > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 16,
      left: 16,
      background: 'var(--color-accent)',
      color: '#fff',
      fontWeight: 800,
      fontSize: 13,
      padding: '8px 14px',
      borderRadius: 999
    }
  }, off, "% OFF")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, product.gallery.map((g, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setImgIdx(i),
    style: {
      width: 72,
      height: 72,
      borderRadius: 14,
      overflow: 'hidden',
      padding: 0,
      cursor: 'pointer',
      border: `2px solid ${imgIdx === i ? 'var(--color-primary)' : 'var(--color-border)'}`
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: g,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Traditional Pickles"), /*#__PURE__*/React.createElement("h1", {
    className: "headline",
    style: {
      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)'
    }
  }, product.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-muted)',
      fontWeight: 600,
      margin: '4px 0 0'
    }
  }, product.en)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(StarRating, {
    rating: product.rating,
    count: product.reviewsCount,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "checkSimple",
    size: 14
  }), " Verified small batch")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-muted)',
      lineHeight: 1.75,
      margin: 0
    }
  }, product.tagline, " Hand-mixed with stone-ground spices, finished in mustard oil, and sealed in moisture-proof jars."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "Spice level:"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, [1, 2, 3].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      color: n <= product.spice ? 'var(--color-accent)' : 'var(--color-border)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chili",
    size: 18
  })))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--color-muted)',
      fontWeight: 600
    }
  }, ['Mild', 'Medium', 'Hot'][product.spice - 1])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 34
    }
  }, "\u20B9", price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      color: 'var(--color-muted-light)',
      textDecoration: 'line-through'
    }
  }, "\u20B9", mrp), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-primary)'
    }
  }, "Save \u20B9", mrp - price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)'
    }
  }, "/ ", size)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700
    }
  }, "Choose Size"), Object.keys(product.prices).length > 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, "Best value: ", Object.keys(product.prices).slice(-1)[0])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, Object.keys(product.prices).map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSize(s),
    style: {
      padding: '10px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      minWidth: 84,
      border: `2px solid ${size === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: size === s ? 'rgba(10,90,50,0.06)' : 'var(--color-surface)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 800
    }
  }, s), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--color-muted)'
    }
  }, "\u20B9", product.prices[s]))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(QuantitySelector, {
    value: qty,
    onChange: setQty
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleAdd,
    style: {
      flex: 1,
      minWidth: 180,
      padding: '16px 24px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: added ? 'var(--color-primary-dark)' : 'var(--color-primary)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'var(--font-body)'
    }
  }, added ? '✓ Added to Cart' : `Add to Cart · ₹${price * qty}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-cream)',
      borderRadius: 16,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pin",
    size: 15
  }), " Check Delivery"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: pin,
    onChange: e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6)),
    placeholder: "Enter PIN code",
    style: {
      flex: 1,
      minWidth: 0,
      padding: '10px 14px',
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      fontSize: 14,
      fontFamily: 'var(--font-body)',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: checkPin,
    style: {
      padding: '10px 20px',
      borderRadius: 10,
      border: 'none',
      background: 'var(--color-ink)',
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer'
    }
  }, "Check")), pinMsg && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 13,
      fontWeight: 600,
      color: pinMsg.ok ? 'var(--color-primary)' : 'var(--color-destructive)'
    }
  }, pinMsg.ok ? '🚚 ' : '', pinMsg.text)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap',
      paddingTop: 4
    }
  }, [['shield', 'Secure checkout'], ['truck', 'Free shipping ₹799+'], ['refresh', '7-day returns'], ['leaf', 'No preservatives']].map(([ic, t]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 15
  })), t))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement(Accordion, {
    title: "Ingredients",
    defaultOpen: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, product.ingredients.map(ing => /*#__PURE__*/React.createElement("span", {
    key: ing,
    style: {
      padding: '6px 14px',
      borderRadius: 999,
      background: 'var(--color-cream)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--color-ink)'
    }
  }, ing)))), /*#__PURE__*/React.createElement(Accordion, {
    title: "Nutrition (per 100g)"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      fontSize: 13,
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("tbody", null, product.nutrition.map(([k, v]) => /*#__PURE__*/React.createElement("tr", {
    key: k,
    style: {
      borderBottom: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '7px 0',
      color: 'var(--color-muted)'
    }
  }, k), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '7px 0',
      textAlign: 'right',
      fontWeight: 700
    }
  }, v)))))), /*#__PURE__*/React.createElement(Accordion, {
    title: "How it's made"
  }, "Picked straight from the tree \u2192 washed & cut fresh \u2192 dried in the open sun \u2192 hand-mixed with ground spices and rested for days \u2192 finished with mustard oil & whole spices \u2192 sealed in a moisture-proof jar and delivered to you.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56,
      background: 'var(--color-primary-dark)',
      color: '#fff',
      borderRadius: 24,
      padding: '28px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-secondary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "box",
    size: 30
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 18,
      margin: '0 0 2px'
    }
  }, "Add ", product.name, " to a 3-jar box & save \u20B9", window.COMBO_MRP - window.COMBO_PRICE), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      opacity: 0.8,
      margin: 0
    }
  }, "Pick any 3 flavours \xB7 \u20B9", window.COMBO_PRICE, " total"))), /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('combo')
  }, "Build My Box \u2192")), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Pairs Well With"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h3",
    style: {
      marginBottom: 24
    }
  }, "Put it on the table tonight"), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, pairRecipes.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.slug,
    onClick: () => onNavigate('recipes'),
    style: {
      display: 'flex',
      gap: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 18,
      overflow: 'hidden',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: r.image,
    alt: r.title,
    style: {
      width: 130,
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 15,
      margin: '0 0 4px'
    }
  }, r.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-muted)',
      margin: '0 0 6px',
      lineHeight: 1.5
    }
  }, r.desc), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--color-primary)'
    }
  }, r.time, " \xB7 View recipe \u2192")))))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Customer Reviews"), /*#__PURE__*/React.createElement("h2", {
    className: "headline h3",
    style: {
      marginBottom: 24
    }
  }, product.rating, " \u2605 from ", product.reviewsCount, " reviews"), /*#__PURE__*/React.createElement("div", {
    className: "grid-3"
  }, REVIEWS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.name,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 18,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(window.DS.StarRating, {
    rating: r.rating,
    size: 13
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.65,
      margin: 0
    }
  }, "\"", r.text, "\""), r.image && /*#__PURE__*/React.createElement("img", {
    src: r.image,
    alt: "",
    style: {
      borderRadius: 10,
      height: 100,
      objectFit: 'cover',
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: 'var(--color-muted)'
    }
  }, r.name, " \xB7 ", r.city)))))), showSticky && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 300,
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      boxShadow: '0 -8px 24px rgba(36,26,20,0.08)',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: "",
    style: {
      width: 44,
      height: 44,
      borderRadius: 10,
      objectFit: 'cover'
    },
    className: "desktop-only"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, product.name, " \xB7 ", size), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-muted)'
    }
  }, "\u20B9", price, " ", /*#__PURE__*/React.createElement("s", {
    style: {
      color: 'var(--color-muted-light)'
    }
  }, "\u20B9", mrp)))), /*#__PURE__*/React.createElement("button", {
    onClick: handleAdd,
    style: {
      padding: '13px 28px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--color-primary)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'var(--font-body)',
      whiteSpace: 'nowrap'
    }
  }, added ? '✓ Added' : 'Add to Cart'))));
}
window.PdpScreen = PdpScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/PdpScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/RecipesScreen.jsx
try { (() => {
function RecipesScreen({
  onNavigate
}) {
  const {
    RECIPES
  } = window;
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Recipes"
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-primary-dark)',
      color: '#fff',
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--color-secondary)'
    }
  }, "From Our Kitchen"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Recipes that ", /*#__PURE__*/React.createElement("em", null, "demand achar")))), /*#__PURE__*/React.createElement("section", {
    className: "section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container grid-2",
    style: {
      padding: '0 24px'
    }
  }, RECIPES.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.slug,
    style: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 24,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 220,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: r.image,
    alt: r.title,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--color-primary)',
      letterSpacing: 1,
      textTransform: 'uppercase'
    }
  }, r.time), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 20,
      margin: 0
    }
  }, r.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      lineHeight: 1.65,
      margin: 0,
      flex: 1
    }
  }, r.desc), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('shop'),
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      marginTop: 6
    }
  }, "Shop the pickle \u2192")))))));
}
window.RecipesScreen = RecipesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/RecipesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/ShopScreen.jsx
try { (() => {
function ShopScreen({
  onNavigate,
  addToCart
}) {
  const {
    ProductCard,
    Select
  } = window.DS;
  const {
    PRODUCTS
  } = window;
  const [filter, setFilter] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('default');
  const [query, setQuery] = React.useState('');
  const tabs = ['All', 'Bestseller', 'Spicy'];
  let list = PRODUCTS.filter(p => {
    if (query && !(p.name + p.en).toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'Bestseller') return p.badge === 'bestseller';
    if (filter === 'Spicy') return p.spice >= 3;
    return true;
  });
  list = [...list].sort((a, b) => {
    const ap = a.prices['250g'],
      bp = b.prices['250g'];
    if (sortBy === 'price-low') return ap - bp;
    if (sortBy === 'price-high') return bp - ap;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Shop"
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-primary-dark)',
      color: '#fff',
      padding: '56px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--color-secondary)'
    }
  }, "The Shop"), /*#__PURE__*/React.createElement("h1", {
    className: "headline h2",
    style: {
      color: '#fff'
    }
  }, "Every jar, ", /*#__PURE__*/React.createElement("em", null, "every flavour")))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      position: 'sticky',
      top: 68,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: '14px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setFilter(t),
    style: {
      padding: '8px 18px',
      borderRadius: 999,
      border: '1px solid var(--color-border)',
      cursor: 'pointer',
      background: filter === t ? 'var(--color-primary)' : 'transparent',
      color: filter === t ? '#fff' : 'var(--color-ink)',
      fontSize: 13,
      fontWeight: 600
    }
  }, t === 'All' ? 'All Pickles' : t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: '1px solid var(--color-border)',
      borderRadius: 999,
      padding: '8px 14px',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search pickles\u2026",
    style: {
      border: 'none',
      outline: 'none',
      background: 'none',
      fontSize: 13,
      fontFamily: 'var(--font-body)',
      width: 130
    }
  })), /*#__PURE__*/React.createElement(Select, {
    value: sortBy,
    onChange: e => setSortBy(e.target.value),
    options: [{
      key: 'default',
      label: 'Recommended'
    }, {
      key: 'price-low',
      label: 'Price: Low → High'
    }, {
      key: 'price-high',
      label: 'Price: High → Low'
    }, {
      key: 'rating',
      label: 'Top Rated'
    }]
  })))), /*#__PURE__*/React.createElement("section", {
    className: "section",
    style: {
      paddingTop: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "container",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      margin: '0 0 20px'
    }
  }, "Showing ", /*#__PURE__*/React.createElement("strong", null, list.length), " pickle", list.length !== 1 ? 's' : ''), /*#__PURE__*/React.createElement("div", {
    className: "grid-4"
  }, list.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.id,
    product: {
      ...p,
      price: p.prices['250g'],
      oldPrice: p.mrps['250g']
    },
    onOpen: () => onNavigate('product-' + p.slug),
    onAddToCart: () => addToCart(p, '250g')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      background: 'var(--color-primary-dark)',
      color: '#fff',
      borderRadius: 24,
      padding: '32px 36px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 22,
      margin: '0 0 6px'
    }
  }, "Can't pick one? Build your own box."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      opacity: 0.8,
      margin: 0
    }
  }, "Any 3 jars \xB7 \u20B9", window.COMBO_PRICE, " \xB7 save \u20B9", window.COMBO_MRP - window.COMBO_PRICE)), /*#__PURE__*/React.createElement(BigBtn, {
    light: true,
    onClick: () => onNavigate('combo')
  }, "Start Building \u2192")))));
}
window.ShopScreen = ShopScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/ShopScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/app.jsx
try { (() => {
function App() {
  const [page, setPage] = React.useState('home');
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [subscription, setSubscription] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const navigate = p => {
    setPage(p);
    window.scrollTo({
      top: 0
    });
  };
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };
  const addToCart = (product, weight = '250g', qty = 1) => {
    setCart(prev => {
      const key = product.slug + weight;
      const ex = prev.find(i => i.slug + i.weight === key && !i.isCombo);
      if (ex) return prev.map(i => i.slug + i.weight === key && !i.isCombo ? {
        ...i,
        qty: i.qty + qty
      } : i);
      return [...prev, {
        slug: product.slug,
        name: product.name,
        image: product.image,
        weight,
        price: product.prices[weight],
        qty
      }];
    });
    showToast('✓ Added to cart');
    setCartOpen(true);
  };
  const addComboToCart = slotProducts => {
    setCart(prev => [...prev, {
      slug: 'combo-' + Date.now(),
      isCombo: true,
      name: 'Your Achaar Box (' + slotProducts.map(p => p.name.split(' ')[0]).join(' + ') + ')',
      image: slotProducts[0].image,
      weight: '3 × 250g',
      price: window.COMBO_PRICE,
      qty: 1
    }]);
    showToast('✓ Box added to cart');
    setCartOpen(true);
  };
  const subscribe = () => {
    setSubscription(true);
    showToast('✓ Subscribed to Achaar of the Month');
  };
  const updateQty = (idx, qty) => {
    setCart(prev => qty <= 0 ? prev.filter((_, i) => i !== idx) : prev.map((it, i) => i === idx ? {
      ...it,
      qty
    } : it));
  };
  const placeOrder = order => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
  };
  let screen;
  if (page === 'shop') screen = /*#__PURE__*/React.createElement(ShopScreen, {
    onNavigate: navigate,
    addToCart: addToCart
  });else if (page === 'combo') screen = /*#__PURE__*/React.createElement(ComboBuilder, {
    onNavigate: navigate,
    addComboToCart: addComboToCart,
    subscribe: subscribe
  });else if (page === 'checkout') screen = /*#__PURE__*/React.createElement(CheckoutScreen, {
    cart: cart,
    onPlaceOrder: placeOrder,
    onNavigate: navigate
  });else if (page === 'account') screen = /*#__PURE__*/React.createElement(AccountScreen, {
    orders: orders,
    subscription: subscription,
    onNavigate: navigate
  });else if (page === 'recipes') screen = /*#__PURE__*/React.createElement(RecipesScreen, {
    onNavigate: navigate
  });else if (page === 'contact') screen = /*#__PURE__*/React.createElement(ContactScreen, null);else if (page === 'about') screen = /*#__PURE__*/React.createElement(AboutScreen, {
    onNavigate: navigate
  });else if (page.startsWith('product-')) {
    const slug = page.replace('product-', '');
    const product = window.PRODUCTS.find(p => p.slug === slug) || window.PRODUCTS[0];
    screen = /*#__PURE__*/React.createElement(PdpScreen, {
      key: slug,
      product: product,
      onNavigate: navigate,
      addToCart: addToCart
    });
  } else screen = /*#__PURE__*/React.createElement(HomeScreen, {
    onNavigate: navigate,
    addToCart: addToCart
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    page: page,
    onNavigate: navigate,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    onOpenCart: () => setCartOpen(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, screen), /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(CartDrawer, {
    open: cartOpen,
    onClose: () => setCartOpen(false),
    cart: cart,
    updateQty: updateQty,
    onCheckout: () => {
      setCartOpen(false);
      navigate('checkout');
    }
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--color-primary-dark)',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 12,
      fontWeight: 600,
      fontSize: 14,
      zIndex: 999,
      boxShadow: 'var(--shadow-lg)',
      whiteSpace: 'nowrap'
    }
  }, toast));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/frontend-v2/data.jsx
try { (() => {
const IMG = '../../assets/imagery/';
const PRODUCTS = [{
  id: 1,
  slug: 'mango-pickle',
  name: 'Aam Ka Achar',
  en: 'Traditional Mango Pickle',
  tagline: 'Raw mangoes picked straight from the tree, sun-dried & spice-rested.',
  image: IMG + 'prod-mango.webp',
  gallery: [IMG + 'prod-mango.webp', IMG + 'making_mango.webp', IMG + 'process_suncured.webp'],
  rating: 4.8,
  reviewsCount: 132,
  badge: 'bestseller',
  spice: 2,
  prices: {
    '250g': 299,
    '500g': 549,
    '1kg': 899
  },
  mrps: {
    '250g': 399,
    '500g': 749,
    '1kg': 1199
  },
  ingredients: ['Raw mango', 'Mustard oil', 'Fennel', 'Fenugreek', 'Nigella seeds', 'Turmeric', 'Red chilli', 'Rock salt'],
  nutrition: [['Energy', '112 kcal'], ['Fat', '9 g'], ['Carbs', '6 g'], ['Protein', '1 g'], ['Sodium', '620 mg']],
  pairs: ['dal-tadka', 'stuffed-paratha']
}, {
  id: 2,
  slug: 'garlic-pickle',
  name: 'Lehsun Ka Achar',
  en: 'Bold Garlic Pickle',
  tagline: 'Whole garlic cloves, slow-rested in ground spices & mustard oil.',
  image: IMG + 'prod_garlic.webp',
  gallery: [IMG + 'prod_garlic.webp', IMG + 'making_garlic.webp', IMG + 'process_mixing.webp'],
  rating: 4.7,
  reviewsCount: 88,
  badge: 'spicy',
  spice: 3,
  prices: {
    '250g': 249,
    '500g': 459
  },
  mrps: {
    '250g': 329,
    '500g': 599
  },
  ingredients: ['Garlic', 'Mustard oil', 'Cumin', 'Carom seeds', 'Turmeric', 'Red chilli', 'Rock salt'],
  nutrition: [['Energy', '128 kcal'], ['Fat', '11 g'], ['Carbs', '5 g'], ['Protein', '2 g'], ['Sodium', '580 mg']],
  pairs: ['dal-tadka', 'paneer-masala']
}, {
  id: 3,
  slug: 'lemon-pickle',
  name: 'Nimbu Ka Achar',
  en: 'Tangy Lemon Pickle',
  tagline: 'Sun-ripened lemons, cut fresh and cured in the open sun.',
  image: IMG + 'prod_lemon.webp',
  gallery: [IMG + 'prod_lemon.webp', IMG + 'making_lemon.webp', IMG + 'process_aging.webp'],
  rating: 4.9,
  reviewsCount: 64,
  spice: 1,
  prices: {
    '250g': 279,
    '500g': 499
  },
  mrps: {
    '250g': 359,
    '500g': 649
  },
  ingredients: ['Lemon', 'Mustard oil', 'Black salt', 'Fennel', 'Turmeric', 'Red chilli'],
  nutrition: [['Energy', '96 kcal'], ['Fat', '7 g'], ['Carbs', '8 g'], ['Protein', '1 g'], ['Sodium', '710 mg']],
  pairs: ['lemon-rice', 'dal-tadka']
}, {
  id: 4,
  slug: 'chilli-pickle',
  name: 'Hari Mirch Ka Achar',
  en: 'Green Chilli Pickle',
  tagline: 'Fresh green chillies for people who like it seriously hot.',
  image: IMG + 'prod_chili.webp',
  gallery: [IMG + 'prod_chili.webp', IMG + 'making_chilli.webp', IMG + 'process_grinding.webp'],
  rating: 4.6,
  reviewsCount: 45,
  badge: 'new',
  spice: 3,
  prices: {
    '250g': 259
  },
  mrps: {
    '250g': 339
  },
  ingredients: ['Green chilli', 'Mustard oil', 'Mustard seeds', 'Fennel', 'Turmeric', 'Rock salt'],
  nutrition: [['Energy', '104 kcal'], ['Fat', '9 g'], ['Carbs', '4 g'], ['Protein', '1 g'], ['Sodium', '540 mg']],
  pairs: ['stuffed-paratha', 'paneer-masala']
}];
const RECIPES = [{
  slug: 'dal-tadka',
  title: 'Dal Tadka + Aam Ka Achar',
  time: '30 min',
  image: IMG + 'recipe_dal.webp',
  desc: 'Comfort dal with a spoon of mango pickle stirred through the tadka.'
}, {
  slug: 'paneer-masala',
  title: 'Paneer Masala with Lehsun Achar',
  time: '40 min',
  image: IMG + 'recipe_paneer.webp',
  desc: 'Garlic pickle oil doubles as the base masala for this rich paneer.'
}, {
  slug: 'lemon-rice',
  title: 'Nimbu Achar Lemon Rice',
  time: '20 min',
  image: IMG + 'recipe_lemon.webp',
  desc: 'Day-old rice, curry leaves, and chopped lemon pickle. Done.'
}, {
  slug: 'stuffed-paratha',
  title: 'Stuffed Paratha + Hari Mirch',
  time: '35 min',
  image: IMG + 'recipe_paratha.webp',
  desc: 'Aloo paratha with a fiery bite of green chilli pickle on the side.'
}];
const PROCESS_STEPS = [{
  icon: 'tree',
  title: 'Picked from the tree',
  desc: 'We buy raw fruit straight off the tree — never from cold storage.',
  image: IMG + 'process_sourcing.webp'
}, {
  icon: 'droplet',
  title: 'Washed & cut fresh',
  desc: 'Washed, hand-cut the same day so nothing loses its bite.',
  image: IMG + 'process_grinding.webp'
}, {
  icon: 'sun',
  title: 'Dried in the open sun',
  desc: 'Pieces are sun-dried in open air — the old way, no machines.',
  image: IMG + 'process_suncured.webp'
}, {
  icon: 'jar',
  title: 'Spiced & rested',
  desc: 'Hand-mixed with ground spices and rested for days to deepen flavour.',
  image: IMG + 'process_mixing.webp'
}, {
  icon: 'shield',
  title: 'Finished & sealed',
  desc: 'Finished with mustard oil & whole spices, sealed in moisture-proof jars.',
  image: IMG + 'process_aging.webp'
}];
const REVIEWS = [{
  name: 'Priya Sharma',
  city: 'Delhi',
  rating: 5,
  text: 'Exactly like my nani used to make in Patna. The mango pieces still have crunch — you can taste the sun in it.',
  image: IMG + 'gal_cut.webp'
}, {
  name: 'Rohit Verma',
  city: 'Bengaluru',
  rating: 5,
  text: 'Ordered the combo box for my flat. Three jars, three moods. The garlic one is dangerously good.',
  image: IMG + 'gal_mix.webp'
}, {
  name: 'Anita Kumari',
  city: 'Mumbai',
  rating: 4,
  text: 'Subscribed for the monthly jar. Every month feels like a parcel from home.',
  image: null
}];
const TRUST_ITEMS = [{
  icon: 'tree',
  text: 'Picked From The Tree'
}, {
  icon: 'sun',
  text: 'Open-Sun Dried'
}, {
  icon: 'shield',
  text: 'No Preservatives'
}, {
  icon: 'truck',
  text: 'Pan-India Delivery'
}, {
  icon: 'check',
  text: 'FSSAI Approved'
}, {
  icon: 'heart',
  text: 'Handcrafted in Ara, Bihar'
}];
const COMBO_PRICE = 749; // any 3 × 250g jars
const COMBO_MRP = 837;
const SUB_PRICE = 349; // monthly seasonal jar

window.PRODUCTS = PRODUCTS;
window.RECIPES = RECIPES;
window.PROCESS_STEPS = PROCESS_STEPS;
window.REVIEWS = REVIEWS;
window.TRUST_ITEMS = TRUST_ITEMS;
window.COMBO_PRICE = COMBO_PRICE;
window.COMBO_MRP = COMBO_MRP;
window.SUB_PRICE = SUB_PRICE;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/frontend-v2/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/CartDrawer.jsx
try { (() => {
function CartDrawer({
  open,
  onClose,
  cart,
  updateQty,
  onCheckout
}) {
  const {
    Accordion,
    Button
  } = window.SwadyumDesignSystem_f6d83b;
  const [coupon, setCoupon] = React.useState('');
  const [applied, setApplied] = React.useState(null);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = applied === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;
  const threshold = 799;
  const shipping = subtotal >= threshold || subtotal === 0 ? 0 : 50;
  const total = subtotal - discount + shipping;
  const away = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, subtotal / threshold * 100);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 500
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--overlay-ink-40)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 420,
      maxWidth: '90vw',
      height: '100%',
      background: 'var(--color-bg)',
      boxShadow: 'var(--shadow-xl)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 20,
      margin: 0,
      color: 'var(--color-ink)'
    }
  }, "Your Cart (", cart.reduce((s, i) => s + i.qty, 0), ")"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px'
    }
  }, away > 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-ink)',
      margin: '0 0 8px'
    }
  }, "You're ", /*#__PURE__*/React.createElement("strong", null, "\u20B9", away), " away from FREE Shipping") : /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-primary)',
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, "\u2713 Congratulations! You unlocked FREE SHIPPING."), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--color-border)',
      borderRadius: 999
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: pct + '%',
      background: 'var(--color-primary)',
      borderRadius: 999
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 24px'
    }
  }, cart.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '60px 0',
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart",
    size: 48
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      color: 'var(--color-ink)',
      margin: '16px 0 4px'
    }
  }, "Your Cart is Empty"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      margin: 0
    }
  }, "Let's find something delicious.")) : cart.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      padding: '16px 0',
      borderBottom: '1px solid var(--color-border-light)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: item.image,
    alt: item.name,
    style: {
      width: 64,
      height: 64,
      borderRadius: 10,
      objectFit: 'cover',
      background: 'var(--color-cream)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 14,
      color: 'var(--color-ink)'
    }
  }, item.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 8px',
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, item.weight), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--color-ink)'
    }
  }, "\u20B9", item.price), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      border: '1px solid var(--color-border)',
      borderRadius: 999,
      padding: '2px 8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQty(i, item.qty - 1),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, item.qty), /*#__PURE__*/React.createElement("button", {
    onClick: () => updateQty(i, item.qty + 1),
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer'
    }
  }, "+")))))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 0'
    }
  }, /*#__PURE__*/React.createElement(Accordion, {
    title: "Have a Coupon?"
  }, applied ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--color-primary)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " ", applied, " Applied") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: coupon,
    onChange: e => setCoupon(e.target.value),
    placeholder: "Try WELCOME10",
    style: {
      flex: 1,
      padding: '8px 12px',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      fontSize: 13
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => coupon.toUpperCase() === 'WELCOME10' && setApplied('WELCOME10'),
    style: {
      padding: '8px 14px',
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 13,
      cursor: 'pointer'
    }
  }, "Apply"))))), cart.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: 'var(--color-muted)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Subtotal"), /*#__PURE__*/React.createElement("span", null, "\u20B9", subtotal)), discount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: 'var(--color-primary)',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "Discount"), /*#__PURE__*/React.createElement("span", null, "-\u20B9", discount)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--color-ink)',
      margin: '8px 0 16px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", null, "\u20B9", total)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onCheckout
  }, "Proceed to Checkout \xB7 \u20B9", total))));
}
window.CartDrawer = CartDrawer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/CartDrawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Footer.jsx
try { (() => {
function Footer({
  onNavigate
}) {
  const {
    IconButton
  } = window.SwadyumDesignSystem_f6d83b;
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-bg)',
      paddingTop: 64,
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '0 32px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1.5fr',
      gap: 48,
      marginBottom: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/logo-mark.png",
    alt: "Swadyum",
    style: {
      height: 60,
      width: 60
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      lineHeight: 1.7,
      margin: 0
    }
  }, "Bringing the authentic taste, sun-cured heritage, and traditional spice secrets of Bihar straight to your dining table."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Instagram",
    filled: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "instagram"
  })), /*#__PURE__*/React.createElement(IconButton, {
    label: "Facebook",
    filled: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "facebook"
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 18,
      color: 'var(--color-ink)',
      marginBottom: 20
    }
  }, "Quick Links"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, ['Home', 'Shop Best Sellers', 'Our Story', 'Contact Us'].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      cursor: 'pointer'
    }
  }, l)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 18,
      color: 'var(--color-ink)',
      marginBottom: 20
    }
  }, "Join the Family"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      lineHeight: 1.6,
      marginBottom: 20
    }
  }, "Subscribe for heritage recipes, exclusive offers, and updates on new batches."), subscribed ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--color-primary)',
      fontSize: 14,
      fontWeight: 600,
      background: 'rgba(10,90,50,0.08)',
      padding: 12,
      borderRadius: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16
  }), " Welcome to the Swadyum family!") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--color-cream)',
      border: '1px solid var(--color-border)',
      borderRadius: 999,
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "Your email address",
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      padding: '10px 16px',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'var(--font-body)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => email && setSubscribed(true),
    style: {
      background: 'var(--color-primary)',
      color: '#fff',
      border: 'none',
      width: 40,
      height: 40,
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow",
    size: 18
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '24px 32px 32px',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Swadyum Foods Pvt. Ltd. All Rights Reserved."), /*#__PURE__*/React.createElement("span", null, "Privacy Policy \u2022 Terms of Service \u2022 Shipping Policy")));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Header.jsx
try { (() => {
function Header({
  page,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenLogin
}) {
  const {
    IconButton
  } = window.SwadyumDesignSystem_f6d83b;
  const navLinks = [{
    key: 'home',
    label: 'Home'
  }, {
    key: 'shop',
    label: 'Shop'
  }, {
    key: 'about',
    label: 'About'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-ink)',
      color: '#fff',
      height: 36,
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '0 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.85
    }
  }, "+91 8340528122"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.9
    }
  }, "\uD83C\uDF89 Flat 20% off on all Pickles! Free Shipping on orders above \u20B9799!"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 12,
      opacity: 0.85
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "instagram",
    size: 14
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "facebook",
    size: 14
  })))), /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(251,245,234,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '0 32px',
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('home'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/logo-mark.png",
    alt: "Swadyum",
    style: {
      height: 44,
      width: 44
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 20,
      color: 'var(--color-ink)'
    }
  }, "Swadyum")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, navLinks.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.key,
    onClick: () => onNavigate(l.key),
    style: {
      padding: '8px 16px',
      fontSize: 14,
      fontWeight: 600,
      borderRadius: 10,
      cursor: 'pointer',
      color: page === l.key ? 'var(--color-primary)' : 'var(--color-ink)'
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "My account",
    onClick: onOpenLogin
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "account"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Cart",
    onClick: onOpenCart
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cart"
  })), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      background: 'var(--color-primary)',
      color: '#fff',
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px'
    }
  }, cartCount))))));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/HomeScreen.jsx
try { (() => {
function HomeScreen({
  onNavigate,
  addToCart
}) {
  const {
    SectionHeading,
    Divider,
    ProductCard,
    CategoryCard,
    Button
  } = window.SwadyumDesignSystem_f6d83b;
  const {
    PRODUCTS,
    CATEGORIES,
    TRUST_ITEMS
  } = window;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: '78vh',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundImage: 'url(../../assets/imagery/hero_banner.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(100deg, var(--overlay-cream-97) 0%, var(--overlay-cream-92) 30%, var(--overlay-cream-65) 55%, var(--overlay-cream-0) 75%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      width: '55%',
      maxWidth: 640,
      paddingLeft: '8%',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--color-primary)'
    }
  }, "Taste of Bihar"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      lineHeight: 1.1,
      color: 'var(--color-ink)',
      margin: 0,
      letterSpacing: '-1.5px'
    }
  }, "Taste the ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'var(--color-primary)'
    }
  }, "Heritage."), " Feel the ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'var(--color-primary)'
    }
  }, "Tradition.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      color: 'var(--color-muted)',
      lineHeight: 1.75,
      maxWidth: 480,
      fontWeight: 500,
      margin: 0
    }
  }, "Swadyum pickles are slow-crafted in clay martabans using the traditional Bihari method \u2014 sun-cured spices, cold-pressed mustard oil, and authentic homemade taste."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => onNavigate('shop')
  }, "Shop Now"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: () => onNavigate('about')
  }, "Our Story")))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--color-cream)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      padding: '16px 0',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 40,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, TRUST_ITEMS.map(item => /*#__PURE__*/React.createElement("div", {
    key: item.text,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--color-primary-dark)'
    }
  }, item.text))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Explore by Flavour",
    title: "Find Your Favourite"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      marginTop: 48
    }
  }, CATEGORIES.map(c => /*#__PURE__*/React.createElement(CategoryCard, {
    key: c.slug,
    category: c,
    onOpen: () => onNavigate('shop')
  }))))), /*#__PURE__*/React.createElement(Divider, {
    variant: "fish"
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px',
      background: 'var(--color-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    eyebrow: "Our Flavours",
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Meet the ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        fontWeight: 400,
        color: 'var(--color-primary)'
      }
    }, "4 Flavours")),
    subtitle: "Loved by 200+ families across India. Sun-cured, small-batch, made with heritage recipes."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      marginTop: 48
    }
  }, PRODUCTS.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.id,
    product: p,
    onOpen: () => onNavigate('product-' + p.slug),
    onAddToCart: () => addToCart(p)
  }))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px',
      background: 'var(--color-primary-dark)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      display: 'flex',
      gap: 40,
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      textAlign: 'center'
    }
  }, [['10,000+', 'Happy Customers'], ['50+', 'Artisan Makers'], ['15+', 'Authentic Varieties'], ['5+', 'Awards Winning']].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 40
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      opacity: 0.85
    }
  }, l))))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/Icons.jsx
try { (() => {
/* Shared icon glyphs — Feather-style stroke SVGs, matching the source exactly */
function Icon({
  name,
  size = 20
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  const paths = {
    account: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })),
    cart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 10a4 4 0 01-8 0"
    })),
    menu: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "6",
      x2: "21",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "12",
      x2: "21",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "18",
      x2: "21",
      y2: "18"
    })),
    close: /*#__PURE__*/React.createElement("path", {
      d: "M18 6L6 18M6 6l12 12"
    }),
    arrow: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    })),
    leaf: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.8 11-10 11z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"
    })),
    sun: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "1",
      x2: "12",
      y2: "3"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "21",
      x2: "12",
      y2: "23"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4.22",
      y1: "4.22",
      x2: "5.64",
      y2: "5.64"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "18.36",
      y1: "18.36",
      x2: "19.78",
      y2: "19.78"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: "12",
      x2: "3",
      y2: "12"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "12",
      x2: "23",
      y2: "12"
    })),
    shield: /*#__PURE__*/React.createElement("path", {
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }),
    truck: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "3",
      width: "15",
      height: "13"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: "16 8 20 8 23 11 23 16 16 16 16 8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5.5",
      cy: "18.5",
      r: "2.5"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "18.5",
      cy: "18.5",
      r: "2.5"
    })),
    heart: /*#__PURE__*/React.createElement("path", {
      d: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
    }),
    check: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M22 11.08V12a10 10 0 11-5.93-9.14"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "22 4 12 14.01 9 11.01"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    instagram: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "2",
      width: "20",
      height: "20",
      rx: "5",
      ry: "5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "17.5",
      y1: "6.5",
      x2: "17.51",
      y2: "6.5"
    })),
    facebook: /*#__PURE__*/React.createElement("path", {
      d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
    }),
    back: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "19",
      y1: "12",
      x2: "5",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 19 5 12 12 5"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", common, paths[name] || null);
}
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/Icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/LoginModal.jsx
try { (() => {
function LoginModal({
  open,
  onClose
}) {
  const {
    Modal,
    Input,
    Checkbox,
    Button,
    OtpInput
  } = window.SwadyumDesignSystem_f6d83b;
  const [step, setStep] = React.useState(1);
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [optIn, setOptIn] = React.useState(true);
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: () => {
      setStep(1);
      setPhone('');
      setOtp('');
      onClose();
    },
    width: 420
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
    fill: "#25D366"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.884c-.001 2.086.551 4.128 1.604 5.925L.031 23.94l6.322-1.647c1.728.954 3.681 1.458 5.688 1.459h.005c6.58 0 11.942-5.334 11.945-11.887 0-3.172-1.245-6.155-3.471-8.416z"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      margin: 0,
      fontSize: 20,
      color: 'var(--color-ink)'
    }
  }, "Welcome to Swadyum"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--color-muted)',
      margin: 0,
      lineHeight: 1.6
    }
  }, step === 1 ? 'Enter your WhatsApp number to securely access your account and track your handcrafted pickles.' : "We've sent a 6-digit secure code to your WhatsApp.")), step === 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    prefix: "\uD83C\uDDEE\uD83C\uDDF3 +91",
    placeholder: "Enter mobile number",
    value: phone,
    onChange: e => setPhone(e.target.value)
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: optIn,
    onChange: e => setOptIn(e.target.checked),
    label: "Get delivery updates & exclusive offers on WhatsApp"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => phone.length >= 10 && setStep(2)
  }, "Send OTP via WhatsApp")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(OtpInput, {
    value: otp,
    onChange: setOtp
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: onClose
  }, "Verify & Proceed")), /*#__PURE__*/React.createElement(Button, {
    variant: "text",
    onClick: () => setStep(1)
  }, "Change Phone Number")));
}
window.LoginModal = LoginModal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/LoginModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/PdpScreen.jsx
try { (() => {
function PdpScreen({
  product,
  onNavigate,
  addToCart
}) {
  const {
    StarRating,
    PriceBlock,
    QuantitySelector,
    Button,
    Chip,
    Divider
  } = window.SwadyumDesignSystem_f6d83b;
  const [size, setSize] = React.useState(Object.keys(product.prices)[0]);
  const [qty, setQty] = React.useState(1);
  const [spice, setSpice] = React.useState('medium');
  const [added, setAdded] = React.useState(false);
  const price = product.prices[size];
  const mrp = Math.round(price * 1.35);
  const benefits = [{
    icon: 'leaf',
    title: '100% Natural',
    sub: 'No preservatives'
  }, {
    icon: 'heart',
    title: 'Grandma Recipe',
    sub: 'Small-batch craft'
  }, {
    icon: 'sun',
    title: 'Sun-Cured',
    sub: 'Authentic taste'
  }, {
    icon: 'truck',
    title: 'Fast Dispatch',
    sub: 'Ships in 24 hrs'
  }];
  const handleAdd = () => {
    addToCart({
      ...product,
      price,
      weight: size
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 32px 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 13,
      color: 'var(--color-muted)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('home'),
    style: {
      cursor: 'pointer'
    }
  }, "Home"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNavigate('shop'),
    style: {
      cursor: 'pointer'
    }
  }, "Shop"), /*#__PURE__*/React.createElement("span", null, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-ink)'
    }
  }, product.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 56
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 420,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      background: 'var(--color-cream)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: product.image,
    alt: product.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--color-primary)'
    }
  }, "Traditional Pickles"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontSize: 34,
      color: 'var(--color-ink)',
      margin: '6px 0 0'
    }
  }, product.name)), /*#__PURE__*/React.createElement(StarRating, {
    rating: product.rating,
    count: product.reviewsCount,
    size: 16
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'var(--color-muted)',
      lineHeight: 1.7,
      margin: 0
    }
  }, "Prepared using sun-ripened ingredients, cold-pressed mustard oil, and traditional Bihari spices. Every jar is handcrafted in small batches to preserve authentic taste."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, benefits.map(b => /*#__PURE__*/React.createElement(Chip, {
    key: b.title,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: b.icon,
      size: 18
    }),
    title: b.title,
    subtitle: b.sub
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PriceBlock, {
    price: price,
    oldPrice: mrp,
    unit: size
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-ink)',
      display: 'block',
      marginBottom: 8
    }
  }, "Choose Size"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, Object.keys(product.prices).map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSize(s),
    style: {
      padding: '10px 16px',
      borderRadius: 'var(--radius-md)',
      border: `1.5px solid ${size === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: size === s ? 'rgba(10,90,50,0.06)' : 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-ink)'
    }
  }, s), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, "\u20B9", product.prices[s]))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--color-ink)',
      display: 'block',
      marginBottom: 8
    }
  }, "Spice Level"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, ['mild', 'medium', 'hot'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSpice(s),
    style: {
      padding: '8px 16px',
      borderRadius: 999,
      border: `1.5px solid ${spice === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: spice === s ? 'var(--color-primary)' : 'transparent',
      color: spice === s ? '#fff' : 'var(--color-ink)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      textTransform: 'capitalize'
    }
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(QuantitySelector, {
    value: qty,
    onChange: setQty
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: handleAdd
  }, added ? '✓ Added' : 'Add to Cart'))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    onClick: handleAdd
  }, "Buy Now \xB7 \u20B9", price * qty), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      paddingTop: 12,
      borderTop: '1px solid var(--color-border-light)',
      flexWrap: 'wrap'
    }
  }, [['shield', 'Secure Checkout'], ['truck', 'Free Shipping ₹799+'], ['check', '7-Day Returns']].map(([icon, label]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      color: 'var(--color-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-primary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16
  })), label)))))));
}
window.PdpScreen = PdpScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/PdpScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/ShopScreen.jsx
try { (() => {
function ShopScreen({
  onNavigate,
  addToCart
}) {
  const {
    SectionHeading,
    ProductCard,
    Select,
    Button
  } = window.SwadyumDesignSystem_f6d83b;
  const {
    PRODUCTS
  } = window;
  const [filter, setFilter] = React.useState('All');
  const [sortBy, setSortBy] = React.useState('default');
  const tabs = ['All', 'Bestseller'];
  let list = PRODUCTS.filter(p => filter === 'All' || filter === 'Bestseller' && p.badge === 'bestseller');
  list = [...list].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      height: 280,
      display: 'flex',
      alignItems: 'center',
      backgroundImage: 'url(../../assets/imagery/hero-banner.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, var(--overlay-cream-92) 0%, var(--overlay-cream-65) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 2,
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '0 32px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 40,
      color: 'var(--color-ink)',
      margin: 0
    }
  }, "Our ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      fontWeight: 400,
      color: 'var(--color-primary)'
    }
  }, "Collection")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: 'var(--color-muted)',
      maxWidth: 480,
      marginTop: 8
    }
  }, "Crafted with traditional recipes, premium ingredients, and generations of Bihari culinary heritage."))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setFilter(t),
    style: {
      padding: '8px 18px',
      borderRadius: 999,
      border: '1px solid var(--color-border)',
      background: filter === t ? 'var(--color-primary)' : 'transparent',
      color: filter === t ? '#fff' : 'var(--color-ink)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, t === 'All' ? 'All Products' : t))), /*#__PURE__*/React.createElement(Select, {
    value: sortBy,
    onChange: e => setSortBy(e.target.value),
    options: [{
      key: 'default',
      label: 'Recommended'
    }, {
      key: 'price-low',
      label: 'Price: Low → High'
    }, {
      key: 'price-high',
      label: 'Price: High → Low'
    }]
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--max-width)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--color-muted)',
      marginBottom: 24
    }
  }, "Showing ", /*#__PURE__*/React.createElement("strong", null, list.length), " products"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24
    }
  }, list.map(p => /*#__PURE__*/React.createElement(ProductCard, {
    key: p.id,
    product: p,
    onOpen: () => onNavigate('product-' + p.slug),
    onAddToCart: () => addToCart(p)
  }))))));
}
window.ShopScreen = ShopScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/ShopScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/app.jsx
try { (() => {
function App() {
  const [page, setPage] = React.useState('home');
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const navigate = p => {
    setPage(p);
    window.scrollTo({
      top: 0
    });
  };
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const key = product.slug + (product.weight || '');
      const existing = prev.find(i => i.slug + i.weight === key);
      if (existing) {
        return prev.map(i => i.slug + i.weight === key ? {
          ...i,
          qty: i.qty + qty
        } : i);
      }
      return [...prev, {
        ...product,
        weight: product.weight || Object.keys(product.prices)[0],
        price: product.price || product.prices[Object.keys(product.prices)[0]],
        qty
      }];
    });
  };
  const updateQty = (idx, qty) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter((_, i) => i !== idx);
      return prev.map((item, i) => i === idx ? {
        ...item,
        qty
      } : item);
    });
  };
  let screen;
  if (page === 'shop') {
    screen = /*#__PURE__*/React.createElement(ShopScreen, {
      onNavigate: navigate,
      addToCart: addToCart
    });
  } else if (page.startsWith('product-')) {
    const slug = page.replace('product-', '');
    const product = window.PRODUCTS.find(p => p.slug === slug) || window.PRODUCTS[0];
    screen = /*#__PURE__*/React.createElement(PdpScreen, {
      product: product,
      onNavigate: navigate,
      addToCart: addToCart
    });
  } else {
    screen = /*#__PURE__*/React.createElement(HomeScreen, {
      onNavigate: navigate,
      addToCart: addToCart
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-bg)',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement(Header, {
    page: page,
    onNavigate: navigate,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    onOpenCart: () => setCartOpen(true),
    onOpenLogin: () => setLoginOpen(true)
  }), screen, /*#__PURE__*/React.createElement(Footer, {
    onNavigate: navigate
  }), /*#__PURE__*/React.createElement(CartDrawer, {
    open: cartOpen,
    onClose: () => setCartOpen(false),
    cart: cart,
    updateQty: updateQty,
    onCheckout: () => setCartOpen(false)
  }), /*#__PURE__*/React.createElement(LoginModal, {
    open: loginOpen,
    onClose: () => setLoginOpen(false)
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/storefront/data.jsx
try { (() => {
const PRODUCTS = [{
  id: 1,
  slug: 'mango-pickle',
  name: 'Aam Ka Achar',
  tagline: 'Sun-cured raw mango, mustard oil',
  image: '../../assets/imagery/prod-mango.webp',
  price: 299,
  oldPrice: 399,
  rating: 4.8,
  reviewsCount: 132,
  badge: 'bestseller',
  prices: {
    '250g': 299,
    '500g': 549,
    '1kg': 899
  }
}, {
  id: 2,
  slug: 'garlic-pickle',
  name: 'Lehsun Ka Achar',
  tagline: 'Bold, aromatic garlic pickle',
  image: '../../assets/imagery/prod_garlic.webp',
  price: 249,
  oldPrice: 320,
  rating: 4.7,
  reviewsCount: 88,
  badge: 'spicy',
  prices: {
    '250g': 249,
    '500g': 459
  }
}, {
  id: 3,
  slug: 'lemon-pickle',
  name: 'Nimbu Ka Achar',
  tagline: 'Tangy sun-ripened lemon',
  image: '../../assets/imagery/prod_lemon.webp',
  price: 279,
  rating: 4.9,
  reviewsCount: 64,
  prices: {
    '250g': 279,
    '500g': 499
  }
}, {
  id: 4,
  slug: 'chilli-pickle',
  name: 'Hari Mirch Ka Achar',
  tagline: 'For serious spice lovers',
  image: '../../assets/imagery/prod_chili.webp',
  price: 259,
  rating: 4.6,
  reviewsCount: 45,
  badge: 'new',
  prices: {
    '250g': 259
  }
}];
const CATEGORIES = [{
  slug: 'mango-pickle',
  title: 'Mango Pickle',
  subtitle: 'The timeless favorite',
  image: '../../assets/imagery/cat-mango.webp'
}, {
  slug: 'garlic-pickle',
  title: 'Garlic Pickle',
  subtitle: 'Bold & aromatic',
  image: '../../assets/imagery/cat_garlic.webp'
}, {
  slug: 'lemon-pickle',
  title: 'Lemon Pickle',
  subtitle: 'Tangy & refreshing',
  image: '../../assets/imagery/prod_lemon.webp'
}, {
  slug: 'chilli-pickle',
  title: 'Green Chilli',
  subtitle: 'For spice lovers',
  image: '../../assets/imagery/prod_chili.webp'
}];
const TRUST_ITEMS = [{
  icon: 'leaf',
  text: '100% Organic'
}, {
  icon: 'sun',
  text: 'Sun-Cured Process'
}, {
  icon: 'shield',
  text: 'No Preservatives'
}, {
  icon: 'truck',
  text: 'Pan-India Delivery'
}, {
  icon: 'heart',
  text: 'Handcrafted with Love'
}, {
  icon: 'check',
  text: 'FSSAI Approved'
}];
window.PRODUCTS = PRODUCTS;
window.CATEGORIES = CATEGORIES;
window.TRUST_ITEMS = TRUST_ITEMS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/storefront/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CategoryCard = __ds_scope.CategoryCard;

__ds_ns.PriceBlock = __ds_scope.PriceBlock;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.StarRating = __ds_scope.StarRating;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.OtpInput = __ds_scope.OtpInput;

__ds_ns.QuantitySelector = __ds_scope.QuantitySelector;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

})();
