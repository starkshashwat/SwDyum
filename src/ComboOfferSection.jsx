import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './ComboOfferSection.css';

function ComboOfferSection() {
  const sectionRef = useRef(null);

  // Track scroll position of the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Apply spring physics for buttery-smooth unboxing movement
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 26,
    stiffness: 60,
    mass: 0.9,
    restDelta: 0.001
  });

  // --- TRANSFORMS FOR UNBOXING ANIMATIONS ---
  
  // Lid lift, angle tilt, and slight fade/scale down
  const lidY = useTransform(smoothProgress, [0.1, 0.6], [0, -180]);
  const lidRotateX = useTransform(smoothProgress, [0.1, 0.6], [0, -50]);
  const lidScale = useTransform(smoothProgress, [0.1, 0.6], [1, 0.94]);
  const lidOpacity = useTransform(smoothProgress, [0.1, 0.55, 0.65], [1, 0.95, 0.4]);

  // Golden Glow Core inside box
  const glowScale = useTransform(smoothProgress, [0.2, 0.65], [0.3, 1.25]);
  const glowOpacity = useTransform(smoothProgress, [0.2, 0.55, 0.85], [0, 0.85, 0.6]);

  // Jars sliding up and fanning outward
  // 1. Mango Jar (Center Left)
  const mangoX = useTransform(smoothProgress, [0.2, 0.7], [0, -95]);
  const mangoY = useTransform(smoothProgress, [0.2, 0.7], [30, -85]);
  const mangoZ = useTransform(smoothProgress, [0.2, 0.7], [-20, 50]);
  const mangoScale = useTransform(smoothProgress, [0.2, 0.7], [0.5, 0.95]);
  const mangoRotate = useTransform(smoothProgress, [0.2, 0.7], [0, -14]);
  const mangoOpacity = useTransform(smoothProgress, [0.15, 0.35], [0, 1]);

  // 2. Garlic Jar (Center Right)
  const garlicX = useTransform(smoothProgress, [0.2, 0.7], [0, 95]);
  const garlicY = useTransform(smoothProgress, [0.2, 0.7], [30, -95]);
  const garlicZ = useTransform(smoothProgress, [0.2, 0.7], [-20, 50]);
  const garlicScale = useTransform(smoothProgress, [0.2, 0.7], [0.5, 0.95]);
  const garlicRotate = useTransform(smoothProgress, [0.2, 0.7], [0, 14]);
  const garlicOpacity = useTransform(smoothProgress, [0.15, 0.35], [0, 1]);

  // 3. Lemon Jar (Far Left)
  const lemonX = useTransform(smoothProgress, [0.25, 0.75], [0, -180]);
  const lemonY = useTransform(smoothProgress, [0.25, 0.75], [40, -45]);
  const lemonZ = useTransform(smoothProgress, [0.25, 0.75], [-35, 15]);
  const lemonScale = useTransform(smoothProgress, [0.25, 0.75], [0.4, 0.8]);
  const lemonRotate = useTransform(smoothProgress, [0.25, 0.75], [0, -20]);
  const lemonOpacity = useTransform(smoothProgress, [0.2, 0.42], [0, 1]);

  // 4. Chili Jar (Far Right)
  const chiliX = useTransform(smoothProgress, [0.25, 0.75], [0, 180]);
  const chiliY = useTransform(smoothProgress, [0.25, 0.75], [40, -55]);
  const chiliZ = useTransform(smoothProgress, [0.25, 0.75], [-35, 15]);
  const chiliScale = useTransform(smoothProgress, [0.25, 0.75], [0.4, 0.8]);
  const chiliRotate = useTransform(smoothProgress, [0.25, 0.75], [0, 20]);
  const chiliOpacity = useTransform(smoothProgress, [0.2, 0.42], [0, 1]);

  // Background particles drift
  const particleY = useTransform(smoothProgress, [0, 1], [0, -100]);
  const particleOpacity = useTransform(smoothProgress, [0, 0.3, 0.8, 1], [0.2, 0.7, 0.7, 0]);

  return (
    <section className="combo-offer-section" ref={sectionRef}>
      
      {/* Dynamic Gold Particles Background */}
      <motion.div 
        className="combo-particles-layer"
        style={{ y: particleY, opacity: particleOpacity }}
      >
        <div className="combo-gold-flake flake-1"></div>
        <div className="combo-gold-flake flake-2"></div>
        <div className="combo-gold-flake flake-3"></div>
        <div className="combo-gold-flake flake-4"></div>
        <div className="combo-gold-flake flake-5"></div>
      </motion.div>

      <div className="combo-sticky-wrapper">
        
        {/* Dark luxury background vignette overlay */}
        <div className="combo-bg-vignette"></div>

        <div className="combo-content-container">
          
          {/* LEFT SIDE: Luxury Editorial Details */}
          <div className="combo-text-side">
            <span className="section-subtitle">~ Bestseller Combo Collection ~</span>
            <h2 className="section-headline">
              Experience Bihar<br />
              <span>In One Box</span>
            </h2>
            <p className="combo-description">
              A carefully curated collection of our most loved flavors, crafted for gifting, sharing, and celebrating authentic Bihari heritage.
            </p>
            <div className="combo-cta-group">
              <button className="combo-gold-button">
                Shop Combo Packs
                <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="combo-features">
              <div className="feat-item">
                <span className="feat-bullet">✦</span> Rigid Premium Packaging
              </div>
              <div className="feat-item">
                <span className="feat-bullet">✦</span> 4 Bestselling Varieties
              </div>
              <div className="feat-item">
                <span className="feat-bullet">✦</span> Custom Festive Gifting Sleeve
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: 3D Unboxing Presentation */}
          <div className="combo-visual-side">
            
            {/* Spotlight Glow Background */}
            <div className="spotlight-effect"></div>

            <div className="giftbox-3d-scene">
              
              {/* Product Jars Floating Outward */}
              <div className="giftbox-contents-layer">
                
                {/* 1. Mango Jar */}
                <motion.div 
                  className="giftbox-product prod-mango"
                  style={{ 
                    x: mangoX, y: mangoY, z: mangoZ,
                    scale: mangoScale, rotate: mangoRotate,
                    opacity: mangoOpacity
                  }}
                >
                  <img src="/prod_mango.png" alt="Swadyum Mango Pickle" />
                  <span className="product-tag">Mango</span>
                </motion.div>

                {/* 2. Garlic Jar */}
                <motion.div 
                  className="giftbox-product prod-garlic"
                  style={{ 
                    x: garlicX, y: garlicY, z: garlicZ,
                    scale: garlicScale, rotate: garlicRotate,
                    opacity: garlicOpacity
                  }}
                >
                  <img src="/prod_garlic.png" alt="Swadyum Garlic Pickle" />
                  <span className="product-tag">Garlic</span>
                </motion.div>

                {/* 3. Lemon Jar */}
                <motion.div 
                  className="giftbox-product prod-lemon"
                  style={{ 
                    x: lemonX, y: lemonY, z: lemonZ,
                    scale: lemonScale, rotate: lemonRotate,
                    opacity: lemonOpacity
                  }}
                >
                  <img src="/prod_lemon.png" alt="Swadyum Lemon Pickle" />
                  <span className="product-tag">Lemon</span>
                </motion.div>

                {/* 4. Chili Jar */}
                <motion.div 
                  className="giftbox-product prod-chili"
                  style={{ 
                    x: chiliX, y: chiliY, z: chiliZ,
                    scale: chiliScale, rotate: chiliRotate,
                    opacity: chiliOpacity
                  }}
                >
                  <img src="/prod_chili.png" alt="Swadyum Green Chili Pickle" />
                  <span className="product-tag">Chili</span>
                </motion.div>

              </div>

              {/* 3D Box Base (Behind contents) */}
              <div className="giftbox-base">
                <div className="box-base-inner"></div>
                <div className="box-inner-shadow"></div>
                
                {/* Golden Glow Core emerging from inside the box base */}
                <motion.div 
                  className="box-glow-core"
                  style={{ scale: glowScale, opacity: glowOpacity }}
                ></motion.div>
              </div>

              {/* 3D Box Lid (Sits on top of the base in front of contents initially) */}
              <motion.div 
                className="giftbox-lid"
                style={{ 
                  y: lidY,
                  rotateX: lidRotateX,
                  scale: lidScale,
                  opacity: lidOpacity
                }}
              >
                <div className="lid-top">
                  <div className="gold-foil-border-outer"></div>
                  <div className="gold-foil-border-inner"></div>
                  
                  {/* Embossed Gold Swadyum Logo SVG */}
                  <div className="lid-embossed-logo">
                    <svg className="gold-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#C79A3B" strokeWidth="2" strokeDasharray="3 2" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="#C79A3B" strokeWidth="1" />
                      {/* Stylized monogram "S" in Bihar Madhubani fish motif details */}
                      <path d="M42 35 C42 35 48 30 54 35 C60 40 40 46 50 60 C58 72 64 62 64 62" fill="none" stroke="#C79A3B" strokeWidth="2" />
                      <circle cx="53" cy="46" r="2" fill="#C79A3B" />
                    </svg>
                    <span className="gold-brand-name">SWADYUM</span>
                    <span className="gold-sub-brand">ARTISANAL HERITAGE</span>
                  </div>
                </div>
                {/* 3D box lid sides */}
                <div className="lid-side side-front"></div>
                <div className="lid-side side-left"></div>
                <div className="lid-side side-right"></div>
              </motion.div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ComboOfferSection;
