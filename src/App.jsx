import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { supabase } from './supabaseClient';
import Header from './Header';
import FeaturedProducts from './FeaturedProducts';
import ProcessSection from './ProcessSection';

import MadhubaniDivider from './MadhubaniDivider';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';
import FinalCTASection from './FinalCTASection';
const ShopPage = lazy(() => import('./ShopPage'));
const ProductDetailsPage = lazy(() => import('./ProductDetailsPage'));
const AboutPage = lazy(() => import('./AboutPage'));
const ContactPage = lazy(() => import('./ContactPage'));
const ReviewsPage = lazy(() => import('./ReviewsPage'));
const ThankYouPage = lazy(() => import('./ThankYouPage'));
const CategoryPage = lazy(() => import('./CategoryPage'));
const Footer = lazy(() => import('./Footer'));
const CartPage = lazy(() => import('./CartPage'));
const CheckoutPage = lazy(() => import('./CheckoutPage'));
const LoginPage = lazy(() => import('./LoginPage'));
const SignupPage = lazy(() => import('./SignupPage'));
const ForgotPasswordPage = lazy(() => import('./ForgotPasswordPage'));
const AccountPage = lazy(() => import('./AccountPage'));
const OrderDetailsPage = lazy(() => import('./OrderDetailsPage'));
import ChoosePickleSection from './components/ChoosePickleSection';

import PurchaseDrawer from './components/cart/PurchaseDrawer';
import BottomNav from './components/BottomNav';
import AuthModal from './components/auth/AuthModal';
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage'));
const DeleteAccountPage = lazy(() => import('./DeleteAccountPage'));
const ShippingPolicyPage = lazy(() => import('./ShippingPolicyPage'));
const TermsPage = lazy(() => import('./TermsPage'));

function App() {
  const parsePath = (path) => {
    if (path === '/shop') return 'shop';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/thank-you') return 'thank-you';
    if (path === '/reviews') return 'reviews';
    if (path === '/privacy-policy') return 'privacy-policy';
    if (path === '/delete-account') return 'delete-account';
    if (path === '/shipping-policy') return 'shipping-policy';
    if (path === '/return-policy') return 'terms';
    if (path === '/terms') return 'terms';
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    if (path === '/login') return 'login';
    if (path === '/signup') return 'signup';
    if (path === '/forgot-password') return 'forgot-password';
    if (path === '/account') return 'account';
    if (path.startsWith('/account/orders/')) {
      const orderId = path.substring('/account/orders/'.length);
      return `order-details-${orderId}`;
    }
    if (path === '/pickles') return 'category-pickles';
    if (path === '/mango-pickle') return 'category-mango-pickle';
    if (path === '/lemon-pickle') return 'category-lemon-pickle';
    if (path === '/green-chilli-pickle') return 'category-green-chilli-pickle';
    if (path === '/garlic-pickle') return 'category-garlic-pickle';
    if (path.startsWith('/product/')) {
      const slug = path.substring('/product/'.length);
      return `product-${slug}`;
    }
    return 'not-found';
  };

  const [currentPage, setCurrentPage] = useState(() => {
    return parsePath(window.location.pathname);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('swadyum_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('swadyum_current_user');
      return null;
    }
  });

  const [redirectPath, setRedirectPath] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Sync user state to localStorage as a cache and initialize Supabase auth listener
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('swadyum_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('swadyum_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile);
            if (!profile.phone_verified && !profile.phone) {
              setIsAuthModalOpen(true);
            }
          } else {
            const tempUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Valued Customer',
              email: session.user.email,
              phone: session.user.user_metadata?.phone || '',
              address: '',
              city: '',
              state: '',
              zip: ''
            };
            setCurrentUser(tempUser);
            if (!tempUser.phone) {
              setIsAuthModalOpen(true);
            }
          }
        } catch (e) {
          // Keep cached local profile if any
        }
      }
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser(profile);
            if (!profile.phone_verified && !profile.phone) {
              setIsAuthModalOpen(true);
            }
          } else {
            const tempUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Valued Customer',
              email: session.user.email,
              phone: session.user.user_metadata?.phone || '',
              address: '',
              city: '',
              state: '',
              zip: ''
            };
            setCurrentUser(tempUser);
            if (!tempUser.phone) {
              setIsAuthModalOpen(true);
            }
          }
        } catch (e) {
          // fallback
        }
      } else {
        // If there is no standard Supabase session, check if a custom WhatsApp session exists
        const saved = localStorage.getItem('swadyum_current_user');
        if (!saved) {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('swadyum_cart');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        return parsed.map(item => ({
          ...item,
          image: item.image ? item.image.replace(/\.(png|jpg|jpeg)$/i, '.webp') : item.image
        }));
      } catch (e) { }
    }
    return [];
  });

  // Sync cart to localStorage and backend
  useEffect(() => {
    localStorage.setItem('swadyum_cart', JSON.stringify(cart));

    // Automation Engine: Cart Abandonment Sync
    if (currentUser?.id) {
      const syncCartToBackend = async () => {
        try {
          const cartValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const cartId = localStorage.getItem('swadyum_automation_cart_id');
          
          const payload = {
            customer_id: currentUser.id,
            customer_email: currentUser.email,
            customer_phone: currentUser.phone,
            cart_items: cart,
            cart_value: cartValue,
            cart_url: window.location.origin + '/cart',
            status: cart.length > 0 ? 'active' : 'recovered',
            updated_at: new Date().toISOString(),
            automation_triggered: false
          };

          if (cartId) {
            // Only update a cart row that actually belongs to this user —
            // otherwise a shared browser could hijack another account's row.
            const { data: existing } = await supabase
              .from('abandoned_carts')
              .select('id, customer_id')
              .eq('id', cartId)
              .maybeSingle();
            if (existing && existing.customer_id === currentUser.id) {
              await supabase.from('abandoned_carts').update(payload).eq('id', cartId);
            } else {
              localStorage.removeItem('swadyum_automation_cart_id');
              if (cart.length > 0) {
                const { data: fresh, error: freshError } = await supabase
                  .from('abandoned_carts').insert(payload).select('id').single();
                if (!freshError && fresh?.id) localStorage.setItem('swadyum_automation_cart_id', fresh.id);
              }
            }
          } else if (cart.length > 0) {
            const { data, error } = await supabase.from('abandoned_carts').insert(payload).select('id').single();
            if (data?.id) {
              localStorage.setItem('swadyum_automation_cart_id', data.id);
            }
          }
        } catch (err) {
          console.error('Failed to sync cart for automation:', err);
        }
      };
      
      const timeoutId = setTimeout(syncCartToBackend, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [cart, currentUser]);

  const addToCart = (product, weight, qty, openCart = true) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.slug === product.slug && item.weight === weight);
      if (idx > -1) {
        // Immutable update — mutating the shared object double-increments
        // under React StrictMode's double-invoked updaters.
        return prev.map((item, i) => {
          if (i !== idx) return item;
          const cap = item.maxStock ?? null;
          const next = item.quantity + qty;
          return { ...item, quantity: cap ? Math.min(next, cap) : next };
        });
      } else {
        const maxStock = product.stockMap?.[weight] ?? product.variants?.find(v => v.weight_label === weight)?.available_stock ?? null;
        return [...prev, {
          slug: product.slug,
          name: product.name,
          weight: weight,
          price: product.price || product.prices?.[weight] || product.base_price,
          mrp: product.variants?.find(v => v.weight_label === weight)?.mrp || product.mrp || null,
          quantity: maxStock ? Math.min(qty, maxStock) : qty,
          maxStock: maxStock,
          image: product.image || product.images?.[0] || '/prod_mango.webp'
        }];
      }
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = (product, selectedSize, quantity) => {
    addToCart(product, selectedSize, quantity, false);
    if (!currentUser) {
      setIsAuthModalOpen(true);
      setPendingCheckout({ type: 'checkout' });
    } else {
      setIsCartOpen(true);
    }
  };

  const updateCartQty = (slug, weight, newQty) => {
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter(item => !(item.slug === slug && item.weight === weight));
      }
      return prev.map(item => {
        if (item.slug === slug && item.weight === weight) {
          const cap = item.maxStock ?? null;
          const clamped = cap ? Math.min(newQty, cap) : newQty;
          return { ...item, quantity: clamped };
        }
        return item;
      });
    });
  };

  const removeFromCart = (slug, weight) => {
    setCart(prev => prev.filter(item => !(item.slug === slug && item.weight === weight)));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Sync state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/return-policy') {
        window.history.replaceState({}, '', '/terms');
        setCurrentPage('terms');
        return;
      }
      setCurrentPage(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/return-policy') {
      window.history.replaceState({}, '', '/terms');
      setCurrentPage('terms');
    }
  }, []);

  const handleNavigate = (page) => {
    let targetPage = page;

    if (page === 'account' && !currentUser) {
      setIsAuthModalOpen(true);
      setPendingCheckout({ type: 'account' });
      if (isCartOpen) setIsCartOpen(false);
      return;
    }

    if (page.startsWith('order-details-') && !currentUser) {
      setRedirectPath(page);
      targetPage = 'login';
    }

    if (page === 'checkout' && !currentUser) {
      setIsAuthModalOpen(true);
      setPendingCheckout({ type: 'checkout' });
      if (isCartOpen) setIsCartOpen(false);
      return;
    }

    setCurrentPage(targetPage);
    let path = '/';
    if (targetPage === 'shop') path = '/shop';
    else if (targetPage === 'about') path = '/about';
    else if (targetPage === 'contact') path = '/contact';
    else if (targetPage === 'reviews') path = '/reviews';
    else if (targetPage === 'privacy-policy') path = '/privacy-policy';
    else if (targetPage === 'delete-account') path = '/delete-account';
    else if (targetPage === 'shipping-policy') path = '/shipping-policy';
    else if (targetPage === 'terms') path = '/terms';
    else if (targetPage === 'cart') path = '/cart';
    else if (targetPage === 'checkout') path = '/checkout';
    else if (targetPage === 'login') path = '/login';
    else if (targetPage === 'signup') path = '/signup';
    else if (targetPage === 'forgot-password') path = '/forgot-password';
    else if (targetPage === 'account') path = '/account';
    else if (targetPage === 'thank-you') path = '/thank-you';
    else if (targetPage.startsWith('order-details-')) {
      const orderId = targetPage.substring('order-details-'.length);
      path = `/account/orders/${orderId}`;
    }
    else if (targetPage === 'category-pickles') path = '/pickles';
    else if (targetPage === 'category-mango-pickle') path = '/mango-pickle';
    else if (targetPage === 'category-lemon-pickle') path = '/lemon-pickle';
    else if (targetPage === 'category-green-chilli-pickle') path = '/green-chilli-pickle';
    else if (targetPage === 'category-garlic-pickle') path = '/garlic-pickle';
    else if (targetPage.startsWith('product-')) {
      const slug = targetPage.substring('product-'.length);
      path = `/product/${slug}`;
    }
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-container">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
      />

      <PurchaseDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        clearCart={clearCart}
        onOpenLogin={() => {
          setIsAuthModalOpen(true);
          setPendingCheckout({ type: 'checkout' });
        }}
      />
      <Suspense fallback={<div className="pdp-loader">Loading...</div>}>
        {currentPage === 'shop' ? (
          <ShopPage onNavigate={handleNavigate} addToCart={addToCart} />
        ) : currentPage === 'about' ? (
          <AboutPage onNavigate={handleNavigate} />
        ) : currentPage === 'contact' ? (
          <ContactPage onNavigate={handleNavigate} />
        ) : currentPage === 'reviews' ? (
          <ReviewsPage onNavigate={handleNavigate} />
        ) : currentPage === 'privacy-policy' ? (
          <PrivacyPolicyPage onNavigate={handleNavigate} />
        ) : currentPage === 'delete-account' ? (
          <DeleteAccountPage onNavigate={handleNavigate} />
        ) : currentPage === 'shipping-policy' ? (
          <ShippingPolicyPage onNavigate={handleNavigate} />
        ) : currentPage === 'terms' ? (
          <TermsPage onNavigate={handleNavigate} />
        ) : currentPage === 'cart' ? (
          <CartPage cart={cart} updateCartQty={updateCartQty} removeFromCart={removeFromCart} onNavigate={handleNavigate} />
        ) : currentPage === 'checkout' ? (
          <CheckoutPage cart={cart} clearCart={clearCart} onNavigate={handleNavigate} currentUser={currentUser} />
        ) : currentPage === 'login' ? (
          <LoginPage onNavigate={handleNavigate} onLogin={setCurrentUser} redirectPath={redirectPath} setRedirectPath={setRedirectPath} />
        ) : currentPage === 'signup' ? (
          <SignupPage onNavigate={handleNavigate} onSignup={setCurrentUser} redirectPath={redirectPath} setRedirectPath={setRedirectPath} />
        ) : currentPage === 'forgot-password' ? (
          <ForgotPasswordPage onNavigate={handleNavigate} />
        ) : currentPage === 'thank-you' ? (
          <ThankYouPage onNavigate={handleNavigate} />
        ) : currentPage === 'account' ? (
          <AccountPage onNavigate={handleNavigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />
        ) : currentPage.startsWith('order-details-') ? (
          <OrderDetailsPage onNavigate={handleNavigate} orderId={currentPage.substring('order-details-'.length)} currentUser={currentUser} />
        ) : currentPage.startsWith('category-') ? (
          <CategoryPage categorySlug={currentPage.substring('category-'.length)} onNavigate={handleNavigate} addToCart={addToCart} />
        ) : currentPage.startsWith('product-') ? (
          <ProductDetailsPage slug={currentPage.substring('product-'.length)} onNavigate={handleNavigate} addToCart={addToCart} handleBuyNow={handleBuyNow} />
        ) : currentPage === 'not-found' ? (
          <div className="not-found-page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '48px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 72, margin: 0, color: 'var(--brand-green, #1A4E28)' }}>404</h1>
            <p style={{ fontSize: 18, margin: 0 }}>This page could not be found.</p>
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              style={{ background: 'var(--brand-green, #1A4E28)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* ─── Hero Section ─── */}
            <HeroSection onNavigate={handleNavigate} />
            <FeaturedProducts onNavigate={handleNavigate} addToCart={addToCart} />
            <ChoosePickleSection onNavigate={handleNavigate} />
            <MadhubaniDivider variant="sun" />
            <ProcessSection />
            <MadhubaniDivider variant="fish" />
            <SocialProofSection />
            <FinalCTASection onNavigate={handleNavigate} />
          </>
        )}
      </Suspense>

      <Footer onNavigate={handleNavigate} />

      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCheckout(null);
        }}
        isLinking={currentUser && (!currentUser.phone || !currentUser.phone_verified)}
        userId={currentUser?.id}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          setIsAuthModalOpen(false);
          setToastMessage("Login successfully!");
          setTimeout(() => setToastMessage(''), 3000);

          // Resume pending action
          if (pendingCheckout) {
            if (pendingCheckout.type === 'checkout') {
              setCurrentPage('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (pendingCheckout.type === 'account') {
              setCurrentPage('account');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            setPendingCheckout(null);
          }
        }}
      />
      {/* Removed ExitIntentPop */}

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast-notification"
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
