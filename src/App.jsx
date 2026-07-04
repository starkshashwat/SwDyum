import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import { supabase } from './supabaseClient';
import Header from './Header';
import TrustBar from './TrustBar';
import ProductsSection from './ProductsSection';
import ProcessSection from './ProcessSection';
import ComboOfferSection from './ComboOfferSection';
import MadhubaniDivider from './MadhubaniDivider';
import SocialProofSection from './SocialProofSection';
import FinalCTASection from './FinalCTASection';
import ShopPage from './ShopPage';
import ProductDetailsPage from './ProductDetailsPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import BlogPage from './BlogPage';
import BlogDetailsPage from './BlogDetailsPage';
import ReviewsPage from './ReviewsPage';
import CategoryPage from './CategoryPage';
import Footer from './Footer';
import CartPage from './CartPage';
import LoginPage from './LoginPage';
import SalesPop from './SalesPop';
import ExitIntentPop from './ExitIntentPop';

function App() {
  const parsePath = (path) => {
    if (path === '/shop') return 'shop';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    if (path === '/blog') return 'blog';
    if (path.startsWith('/blog/')) {
      const slug = path.substring('/blog/'.length);
      return `blog-${slug}`;
    }
    if (path === '/reviews') return 'reviews';
    if (path === '/cart') return 'cart';
    if (path === '/login') return 'login';
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

  // Sync user state to localStorage as a cache and initialize Supabase auth listener
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('swadyum_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('swadyum_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKwikpassLogin = (event) => {
      // The kpToken is received here.
      const token = event.detail?.kpToken;
      console.log('Received KwikPass token:', token);
      
      // Usually, you'd send this token to your backend to decrypt it securely 
      // with the secret key and get the user's phone/email.
      // For now, we will set a placeholder user to show the logged-in state.
      if (token) {
        setCurrentUser({
          id: 'kp_user_id',
          name: 'KwikPass User',
          token: token
        });
      }
    };

    window.addEventListener('kwikpass-sso', handleKwikpassLogin);

    return () => {
      window.removeEventListener('kwikpass-sso', handleKwikpassLogin);
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

  const addToCart = (product, weight, qty, subscription = 'One Time') => {
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
          price: product.price || product.prices[weight],
          quantity: qty,
          image: product.image || product.images[0],
          subscription: subscription
        }];
      }
    });
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

    setCurrentPage(targetPage);
    let path = '/';
    if (targetPage === 'shop') path = '/shop';
    else if (targetPage === 'about') path = '/about';
    else if (targetPage === 'contact') path = '/contact';
    else if (targetPage === 'blog') path = '/blog';
    else if (targetPage.startsWith('blog-')) {
      const slug = targetPage.substring('blog-'.length);
      path = `/blog/${slug}`;
    }
    else if (targetPage === 'reviews') path = '/reviews';
    else if (targetPage === 'cart') path = '/cart';
    else if (targetPage === 'login') path = '/login';
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
      <Header currentPage={currentPage} onNavigate={handleNavigate} cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} />
      
      {currentPage === 'shop' ? (
        <ShopPage onNavigate={handleNavigate} addToCart={addToCart} />
      ) : currentPage === 'about' ? (
        <AboutPage onNavigate={handleNavigate} />
      ) : currentPage === 'contact' ? (
        <ContactPage onNavigate={handleNavigate} />
      ) : currentPage === 'blog' ? (
        <BlogPage onNavigate={handleNavigate} />
      ) : currentPage.startsWith('blog-') ? (
        <BlogDetailsPage blogSlug={currentPage.substring('blog-'.length)} onNavigate={handleNavigate} />
      ) : currentPage === 'reviews' ? (
        <ReviewsPage onNavigate={handleNavigate} />
      ) : currentPage === 'cart' ? (
        <CartPage cart={cart} updateCartQty={updateCartQty} removeFromCart={removeFromCart} onNavigate={handleNavigate} />
      ) : currentPage === 'login' ? (
        <LoginPage onNavigate={handleNavigate} onLogin={setCurrentUser} redirectPath={redirectPath} setRedirectPath={setRedirectPath} />
      ) : currentPage.startsWith('category-') ? (
        <CategoryPage categorySlug={currentPage.substring('category-'.length)} onNavigate={handleNavigate} addToCart={addToCart} />
      ) : currentPage.startsWith('product-') ? (
        <ProductDetailsPage slug={currentPage.substring('product-'.length)} onNavigate={handleNavigate} addToCart={addToCart} />
      ) : (
        <>
          {/* ─── Hero Section ─── */}
          <div className="hero-section">
            <div className="hero-bg-overlay"></div>
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hero-eyebrow">Sun-Cured · Small Batch · Since 2020</span>

              <h1 className="hero-headline">
                Taste the <em>Heritage</em> <br/>of Bihar in Every Bite
              </h1>

              <p className="hero-subtext">
                Handcrafted in traditional clay pots, slow-aged under the summer sun, and steeped in raw cold-pressed mustard oil. The gold standard of Bihari pickles — now at your doorstep.
              </p>

              <div className="cta-group">
                <button className="primary-cta" onClick={() => handleNavigate('shop')}>Shop Best Sellers</button>
                <button className="secondary-cta" onClick={() => handleNavigate('about')}>Our Story</button>
              </div>

              <div className="trust-indicators">
                <div className="rating-container">
                  <span className="stars">★★★★★</span>
                  <span className="rating-text">Loved by 200+ Families Across India (4.9/5 Rating)</span>
                </div>

                <div className="indicator-list">
                  <div className="indicator-item">
                    <span className="ind-bullet"></span> 100% Organic Spices
                  </div>
                  <div className="indicator-item">
                    <span className="ind-bullet"></span> Aged in Earthen Martabans
                  </div>
                  <div className="indicator-item">
                    <span className="ind-bullet"></span> No Preservatives or Chemicals
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Sales Funnel — Hero → Trust → Products → Process → Combos → Reviews → CTA ─── */}
          <TrustBar />
          <MadhubaniDivider variant="floral" />
          <ProductsSection onNavigate={handleNavigate} addToCart={addToCart} />
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
      <SalesPop />
      <ExitIntentPop onNavigate={handleNavigate} />
    </div>
  );
}


export default App;
