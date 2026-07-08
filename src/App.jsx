import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { supabase } from './supabaseClient';
import Header from './Header';
import FeaturedProducts from './FeaturedProducts';
import ProcessSection from './ProcessSection';
import ComboOfferSection from './ComboOfferSection';
import MadhubaniDivider from './MadhubaniDivider';
import HeroSection from './HeroSection';
import SocialProofSection from './SocialProofSection';
import FinalCTASection from './FinalCTASection';
import ShopPage from './ShopPage';
import ProductDetailsPage from './ProductDetailsPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import RecipePage from './RecipePage';
import ReviewsPage from './ReviewsPage';
import CategoryPage from './CategoryPage';
import Footer from './Footer';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AccountPage from './AccountPage';
import OrderDetailsPage from './OrderDetailsPage';

import CartDrawer from './components/cart/CartDrawer';
import WhatsAppLoginModal from './components/auth/WhatsAppLoginModal';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import DeleteAccountPage from './DeleteAccountPage';
import ShippingPolicyPage from './ShippingPolicyPage';
import ReturnPolicyPage from './ReturnPolicyPage';
import TermsPage from './TermsPage';

function App() {
  const parsePath = (path) => {
    if (path === '/shop') return 'shop';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/recipes') return 'recipes';
    if (path === '/reviews') return 'reviews';
    if (path === '/privacy-policy') return 'privacy-policy';
    if (path === '/delete-account') return 'delete-account';
    if (path === '/shipping-policy') return 'shipping-policy';
    if (path === '/return-policy') return 'return-policy';
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
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(() => {
    return parsePath(window.location.pathname);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('swadyum_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [redirectPath, setRedirectPath] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
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
          } else {
            setCurrentUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Valued Customer',
              email: session.user.email,
              phone: session.user.user_metadata?.phone || '',
              address: '',
              city: '',
              state: '',
              zip: ''
            });
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
          } else {
            setCurrentUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'Valued Customer',
              email: session.user.email,
              phone: session.user.user_metadata?.phone || '',
              address: '',
              city: '',
              state: '',
              zip: ''
            });
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
    return saved ? JSON.parse(saved) : [];
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('swadyum_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, weight, qty, subscription = 'One Time', openCart = true) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.slug === product.slug && item.weight === weight && item.subscription === subscription);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += qty;
        return updated;
      } else {
        return [...prev, {
          slug: product.slug,
          name: product.name,
          weight: weight,
          price: product.price || product.prices?.[weight] || product.base_price,
          quantity: qty,
          image: product.image || product.images?.[0] || '/prod_mango.webp',
          subscription: subscription
        }];
      }
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = (product, selectedSize, quantity, subscription) => {
    addToCart(product, selectedSize, quantity, subscription, false);
    if (!currentUser) {
      setIsWaModalOpen(true);
      setPendingCheckout({ type: 'checkout' });
    } else {
      setIsCartOpen(true);
    }
  };

  const updateCartQty = (slug, weight, subscription, newQty) => {
    setCart(prev => {
      if (newQty <= 0) {
        return prev.filter(item => !(item.slug === slug && item.weight === weight && item.subscription === subscription));
      }
      return prev.map(item => {
        if (item.slug === slug && item.weight === weight && item.subscription === subscription) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (slug, weight, subscription) => {
    setCart(prev => prev.filter(item => !(item.slug === slug && item.weight === weight && item.subscription === subscription)));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Sync state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = (page) => {
    let targetPage = page;

    if (page === 'account' && !currentUser) {
      setIsWaModalOpen(true);
      setPendingCheckout({ type: 'account' });
      if (isCartOpen) setIsCartOpen(false);
      return;
    }

    if (page.startsWith('order-details-') && !currentUser) {
      setRedirectPath(page);
      targetPage = 'login';
    }

    if (page === 'checkout' && !currentUser) {
      setIsWaModalOpen(true);
      setPendingCheckout({ type: 'checkout' });
      if (isCartOpen) setIsCartOpen(false);
      return;
    }

    setCurrentPage(targetPage);
    let path = '/';
    if (targetPage === 'shop') path = '/shop';
    else if (targetPage === 'about') path = '/about';
    else if (targetPage === 'contact') path = '/contact';
    else if (targetPage === 'recipes') path = '/recipes';
    else if (targetPage === 'reviews') path = '/reviews';
    else if (targetPage === 'privacy-policy') path = '/privacy-policy';
    else if (targetPage === 'delete-account') path = '/delete-account';
    else if (targetPage === 'shipping-policy') path = '/shipping-policy';
    else if (targetPage === 'return-policy') path = '/return-policy';
    else if (targetPage === 'terms') path = '/terms';
    else if (targetPage === 'cart') path = '/cart';
    else if (targetPage === 'checkout') path = '/checkout';
    else if (targetPage === 'login') path = '/login';
    else if (targetPage === 'signup') path = '/signup';
    else if (targetPage === 'forgot-password') path = '/forgot-password';
    else if (targetPage === 'account') path = '/account';
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
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        onNavigate={handleNavigate}
      />
      {currentPage === 'shop' ? (
        <ShopPage onNavigate={handleNavigate} addToCart={addToCart} />
      ) : currentPage === 'about' ? (
        <AboutPage onNavigate={handleNavigate} />
      ) : currentPage === 'contact' ? (
        <ContactPage onNavigate={handleNavigate} />
      ) : currentPage === 'recipes' ? (
        <RecipePage onNavigate={handleNavigate} />
      ) : currentPage === 'reviews' ? (
        <ReviewsPage onNavigate={handleNavigate} />
      ) : currentPage === 'privacy-policy' ? (
        <PrivacyPolicyPage onNavigate={handleNavigate} />
      ) : currentPage === 'delete-account' ? (
        <DeleteAccountPage onNavigate={handleNavigate} />
      ) : currentPage === 'shipping-policy' ? (
        <ShippingPolicyPage onNavigate={handleNavigate} />
      ) : currentPage === 'return-policy' ? (
        <ReturnPolicyPage onNavigate={handleNavigate} />
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
      ) : currentPage === 'account' ? (
        <AccountPage onNavigate={handleNavigate} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      ) : currentPage.startsWith('order-details-') ? (
        <OrderDetailsPage onNavigate={handleNavigate} orderId={currentPage.substring('order-details-'.length)} currentUser={currentUser} />
      ) : currentPage.startsWith('category-') ? (
        <CategoryPage categorySlug={currentPage.substring('category-'.length)} onNavigate={handleNavigate} addToCart={addToCart} />
      ) : currentPage.startsWith('product-') ? (
        <ProductDetailsPage slug={currentPage.substring('product-'.length)} onNavigate={handleNavigate} addToCart={addToCart} handleBuyNow={handleBuyNow} cart={cart} />
      ) : (
        <>
          {/* ─── Hero Section ─── */}
          <HeroSection onNavigate={handleNavigate} />
          <FeaturedProducts onNavigate={handleNavigate} addToCart={addToCart} />
          <MadhubaniDivider variant="sun" />
          <ProcessSection />
          <MadhubaniDivider variant="fish" />
          <ComboOfferSection onNavigate={handleNavigate} addToCart={addToCart} />
          <MadhubaniDivider variant="lotus" />
          <SocialProofSection />
          <FinalCTASection onNavigate={handleNavigate} />
        </>
      )}

      <Footer onNavigate={handleNavigate} />

      <WhatsAppLoginModal 
        isOpen={isWaModalOpen} 
        onClose={() => {
          setIsWaModalOpen(false);
          setPendingCheckout(null);
        }}
        onSuccess={(profile) => {
          setCurrentUser(profile);
          setIsWaModalOpen(false);
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
