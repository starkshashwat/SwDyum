function App() {
  const [page, setPage] = React.useState('home');
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [orders, setOrders] = React.useState([]);
  const [subscription, setSubscription] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const navigate = (p) => { setPage(p); window.scrollTo({ top: 0 }); };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (product, weight = '250g', qty = 1) => {
    setCart((prev) => {
      const key = product.slug + weight;
      const ex = prev.find((i) => i.slug + i.weight === key && !i.isCombo);
      if (ex) return prev.map((i) => (i.slug + i.weight === key && !i.isCombo ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { slug: product.slug, name: product.name, image: product.image, weight, price: product.prices[weight], qty }];
    });
    showToast('✓ Added to cart');
    setCartOpen(true);
  };

  const addComboToCart = (slotProducts) => {
    setCart((prev) => [...prev, {
      slug: 'combo-' + Date.now(), isCombo: true,
      name: 'Your Achaar Box (' + slotProducts.map((p) => p.name.split(' ')[0]).join(' + ') + ')',
      image: slotProducts[0].image, weight: '3 × 250g', price: window.COMBO_PRICE, qty: 1,
    }]);
    showToast('✓ Box added to cart');
    setCartOpen(true);
  };

  const subscribe = () => { setSubscription(true); showToast('✓ Subscribed to Achaar of the Month'); };

  const updateQty = (idx, qty) => {
    setCart((prev) => qty <= 0 ? prev.filter((_, i) => i !== idx) : prev.map((it, i) => (i === idx ? { ...it, qty } : it)));
  };

  const placeOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  let screen;
  if (page === 'shop') screen = <ShopScreen onNavigate={navigate} addToCart={addToCart} />;
  else if (page === 'combo') screen = <ComboBuilder onNavigate={navigate} addComboToCart={addComboToCart} subscribe={subscribe} />;
  else if (page === 'checkout') screen = <CheckoutScreen cart={cart} onPlaceOrder={placeOrder} onNavigate={navigate} />;
  else if (page === 'account') screen = <AccountScreen orders={orders} subscription={subscription} onNavigate={navigate} />;
  else if (page === 'recipes') screen = <RecipesScreen onNavigate={navigate} />;
  else if (page === 'contact') screen = <ContactScreen />;
  else if (page === 'about') screen = <AboutScreen onNavigate={navigate} />;
  else if (page.startsWith('product-')) {
    const slug = page.replace('product-', '');
    const product = window.PRODUCTS.find((p) => p.slug === slug) || window.PRODUCTS[0];
    screen = <PdpScreen key={slug} product={product} onNavigate={navigate} addToCart={addToCart} />;
  } else screen = <HomeScreen onNavigate={navigate} addToCart={addToCart} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header page={page} onNavigate={navigate} cartCount={cart.reduce((s, i) => s + i.qty, 0)} onOpenCart={() => setCartOpen(true)} />
      <div style={{ flex: 1 }}>{screen}</div>
      <Footer onNavigate={navigate} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} onCheckout={() => { setCartOpen(false); navigate('checkout'); }} />
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary-dark)', color: '#fff', padding: '12px 24px', borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 999, boxShadow: 'var(--shadow-lg)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
