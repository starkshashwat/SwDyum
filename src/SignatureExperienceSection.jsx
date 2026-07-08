import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './SignatureExperienceSection.css';

// Pre-defined floating particles for smooth luxury motion
const particlesData = [
  { id: 1, type: 'mustard', size: 6, left: '8%', top: '35%', duration: 18, delay: 0 },
  { id: 2, type: 'gold', size: 10, left: '88%', top: '15%', duration: 22, delay: 3 },
  { id: 3, type: 'spice', size: 5, left: '22%', top: '65%', duration: 16, delay: 1 },
  { id: 4, type: 'leaf', size: 14, left: '78%', top: '55%', duration: 25, delay: 5 },
  { id: 5, type: 'mustard', size: 4, left: '45%', top: '80%', duration: 20, delay: 2 },
  { id: 6, type: 'gold', size: 8, left: '12%', top: '75%', duration: 24, delay: 4 },
  { id: 7, type: 'spice', size: 7, left: '82%', top: '85%', duration: 19, delay: 6 },
  { id: 8, type: 'leaf', size: 12, left: '3%', top: '15%', duration: 28, delay: 7 },
  { id: 9, type: 'gold', size: 9, left: '92%', top: '70%', duration: 21, delay: 1 },
  { id: 10, type: 'mustard', size: 5, left: '55%', top: '25%', duration: 17, delay: 8 }
];

function SignatureExperienceSection() {
  const sectionRef = useRef(null);
  
  // React state triggers to coordinate discrete text/badge animations
  const [isTextActive, setIsTextActive] = useState(false);
  const [isQuoteActive, setIsQuoteActive] = useState(false);

  // Framer Motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Apply spring physics for buttery-smooth scroll responsiveness
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 24,
    stiffness: 70,
    mass: 0.9,
    restDelta: 0.001
  });

  // Subscribe to changes to trigger text reveals exactly in their viewport ranges
  useEffect(() => {
    const handleProgress = (latest) => {
      // Content block active range
      if (latest >= 0.52 && latest <= 0.84) {
        setIsTextActive(true);
      } else {
        setIsTextActive(false);
      }
      
      // Ending quote active range
      if (latest > 0.84) {
        setIsQuoteActive(true);
      } else {
        setIsQuoteActive(false);
      }
    };

    // Robust subscription supporting multiple Framer Motion API versions
    const unsubscribe = scrollYProgress.on 
      ? scrollYProgress.on("change", handleProgress) 
      : scrollYProgress.onChange(handleProgress);

    return () => unsubscribe();
  }, [scrollYProgress]);

  // --- TRANSFORMS: LAYER 2 BACKGROUND MADHUBANI ART ---
  const sunRotate = useTransform(smoothProgress, [0, 1], [0, 60]);
  const sunScale = useTransform(smoothProgress, [0, 0.4, 0.7, 1], [0.95, 1.1, 1.15, 1.35]);
  const sunOpacity = useTransform(smoothProgress, [0, 0.12, 0.82, 1], [0.015, 0.035, 0.035, 0]);

  const peacockRotate = useTransform(smoothProgress, [0, 1], [0, -35]);
  const peacockScale = useTransform(smoothProgress, [0, 0.4, 0.7, 1], [0.95, 1.1, 1.15, 1.35]);
  const peacockOpacity = useTransform(smoothProgress, [0, 0.12, 0.82, 1], [0.015, 0.035, 0.035, 0]);

  const fishLeftX = useTransform(smoothProgress, [0, 0.5, 0.9, 1], [-80, 0, 40, 120]);
  const fishLeftRotate = useTransform(smoothProgress, [0, 1], [-15, 10]);
  const fishLeftOpacity = useTransform(smoothProgress, [0, 0.12, 0.82, 1], [0.01, 0.025, 0.025, 0]);

  const fishRightX = useTransform(smoothProgress, [0, 0.5, 0.9, 1], [80, 0, -40, -120]);
  const fishRightRotate = useTransform(smoothProgress, [0, 1], [15, -10]);
  const fishRightOpacity = useTransform(smoothProgress, [0, 0.12, 0.82, 1], [0.01, 0.025, 0.025, 0]);


  // --- TRANSFORMS: CINEMATIC COLLAGE (3D PARALLAX PERSPECTIVE) ---
  
  // Brass Backdrop Plate
  const brassScale = useTransform(smoothProgress, [0, 0.35, 0.6, 0.8], [0.65, 1.05, 1.08, 0.85]);
  const brassRotate = useTransform(smoothProgress, [0, 1], [-30, 30]);
  const brassOpacity = useTransform(smoothProgress, [0, 0.15, 0.62, 0.82], [0, 0.9, 0.9, 0]);

  // Center: Earthen Courtyard (gal_mix.webp)
  const centralZ = useTransform(smoothProgress, [0, 0.35, 0.6, 0.8], [-250, 0, 60, 220]);
  const centralY = useTransform(smoothProgress, [0, 0.35, 0.6, 0.8], [40, 0, -25, -100]);
  const centralScale = useTransform(smoothProgress, [0, 0.35, 0.6, 0.8], [0.85, 1, 1.05, 0.9]);
  const centralOpacity = useTransform(smoothProgress, [0, 0.15, 0.62, 0.82], [0, 1, 1, 0]);
  const centralBlurVal = useTransform(smoothProgress, [0, 0.22, 0.58, 0.78], [12, 0, 0, 10]);
  const centralFilter = useTransform(centralBlurVal, (v) => `blur(${v}px)`);

  // Spices & Ingredients (deal_scatter.webp) - Left Upper
  const spicesZ = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [-350, -50, 30, 180]);
  const spicesX = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [-80, -20, 15, 90]);
  const spicesY = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [-55, 0, 25, 80]);
  const spicesScale = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [0.75, 1, 1.05, 0.85]);
  const spicesRotate = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [-20, -10, 2, 14]);
  const spicesOpacity = useTransform(smoothProgress, [0.05, 0.25, 0.62, 0.8], [0, 1, 1, 0]);
  const spicesBlurVal = useTransform(smoothProgress, [0.05, 0.25, 0.58, 0.75], [16, 0, 0, 8]);
  const spicesFilter = useTransform(spicesBlurVal, (v) => `blur(${v}px)`);

  // Artisan Craftsmanship (about_us.webp) - Right Upper
  const artisanZ = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [-300, -40, 50, 200]);
  const artisanX = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [80, 20, -15, -90]);
  const artisanY = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [45, 0, -25, -80]);
  const artisanScale = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [0.75, 1, 1.05, 0.85]);
  const artisanRotate = useTransform(smoothProgress, [0.05, 0.35, 0.6, 0.8], [16, 6, -3, -15]);
  const artisanOpacity = useTransform(smoothProgress, [0.05, 0.25, 0.62, 0.8], [0, 1, 1, 0]);
  const artisanBlurVal = useTransform(smoothProgress, [0.05, 0.25, 0.58, 0.75], [16, 0, 0, 8]);
  const artisanFilter = useTransform(artisanBlurVal, (v) => `blur(${v}px)`);

  // Slicing Process (gal_cut.webp) - Left Lower
  const farmZ = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [-400, -100, 15, 220]);
  const farmX = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [-100, -30, 10, 70]);
  const farmY = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [75, 0, -25, -90]);
  const farmScale = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [0.7, 1, 1.05, 0.8]);
  const farmRotate = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [12, 3, -4, -14]);
  const farmOpacity = useTransform(smoothProgress, [0.15, 0.3, 0.62, 0.8], [0, 1, 1, 0]);
  const farmBlurVal = useTransform(smoothProgress, [0.1, 0.3, 0.58, 0.78], [18, 0, 0, 10]);
  const farmFilter = useTransform(farmBlurVal, (v) => `blur(${v}px)`);

  // Closeup Jar (prod_mango.webp) - Right Lower
  const closeupZ = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [-180, 20, 80, 250]);
  const closeupX = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [100, 30, -10, -75]);
  const closeupY = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [-85, 0, 35, 100]);
  const closeupScale = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [0.75, 1.05, 1.1, 0.9]);
  const closeupRotate = useTransform(smoothProgress, [0.15, 0.45, 0.65, 0.85], [-14, -5, 4, 11]);
  const closeupOpacity = useTransform(smoothProgress, [0.15, 0.3, 0.62, 0.8], [0, 1, 1, 0]);
  const closeupBlurVal = useTransform(smoothProgress, [0.1, 0.3, 0.58, 0.78], [12, 0, 0, 8]);
  const closeupFilter = useTransform(closeupBlurVal, (v) => `blur(${v}px)`);


  // --- TRANSFORMS: CONTENT BLOCK & ENDING QUOTE OVERLAYS ---
  const contentOpacity = useTransform(smoothProgress, [0.5, 0.62, 0.78, 0.84], [0, 1, 1, 0]);
  const contentY = useTransform(smoothProgress, [0.5, 0.62, 0.78, 0.84], [50, 0, 0, -50]);
  const contentScale = useTransform(smoothProgress, [0.5, 0.62, 0.78, 0.84], [0.97, 1, 1, 0.97]);

  const quoteOpacity = useTransform(smoothProgress, [0.8, 0.9, 0.96], [0, 1, 1]);
  const quoteY = useTransform(smoothProgress, [0.8, 0.9, 0.96], [40, 0, 0]);
  const quoteScale = useTransform(smoothProgress, [0.8, 0.9, 0.96], [0.96, 1, 1.04]);


  // --- FRAMER MOTION VARIANTS FOR TEXT ENTRANCE DETAILS ---
  
  // 1. Eyebrow Letter Spacing & Slide Up
  const eyebrowVariants = {
    hidden: { opacity: 0, y: 15, letterSpacing: '2px' },
    visible: { 
      opacity: 1, 
      y: 0, 
      letterSpacing: '5px',
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  // 2. Headline Words Slide-Up from masked overflow
  const wordMaskVariants = {
    hidden: { y: '100%', rotate: 8 },
    visible: { 
      y: 0, 
      rotate: 0, 
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  // 3. Staggered Container for Headline Lines
  const headlineContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 }
    }
  };

  // 4. Subtext Fade In
  const subtextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.9, delay: 0.25, ease: 'easeOut' } 
    }
  };

  // 5. Staggered Badges
  const badgesContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.4 }
    }
  };

  const badgeItemVariants = {
    hidden: { opacity: 0, scale: 0.82, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 140, damping: 14 } 
    }
  };

  // 6. Premium Ending Moment Elements
  const quoteTextVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const dividerVariants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1, 
      transition: { duration: 1.1, ease: 'easeInOut' } 
    }
  };

  return (
    <section 
      className="signature-experience-section" 
      ref={sectionRef}
    >
      <div className="signature-sticky-wrapper">
        
        {/* LAYER 1: Parchment Background */}
        <div className="parchment-background-layer"></div>

        {/* LAYER 2: Massive Faded Madhubani Illustrations (2% opacity & Parallax) */}
        <div className="madhubani-art-layer">
          
          {/* Madhubani Sun Motif */}
          <motion.svg 
            className="madhubani-svg sun-motif" 
            viewBox="0 0 200 200" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ rotate: sunRotate, scale: sunScale, opacity: sunOpacity }}
          >
            <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="100" cy="100" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M90 95 Q94 92 98 95 M102 95 Q106 92 110 95" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="94" cy="95" r="1.5" fill="currentColor" />
            <circle cx="106" cy="95" r="1.5" fill="currentColor" />
            <path d="M100 98 L100 106 M96 109 Q100 114 104 109" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {[...Array(16)].map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + 32 * Math.cos(rad);
              const y1 = 100 + 32 * Math.sin(rad);
              const x2 = 100 + 52 * Math.cos(rad);
              const y2 = 100 + 52 * Math.sin(rad);
              const px = 100 + 42 * Math.cos(rad + 0.1);
              const py = 100 + 42 * Math.sin(rad + 0.1);
              return (
                <g key={i}>
                  <path d={`M${x1} ${y1} Q${px} ${py} ${x2} ${y2}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx={x2} cy={y2} r="2" fill="currentColor" />
                </g>
              );
            })}
          </motion.svg>

          {/* Madhubani Peacock Motif */}
          <motion.svg 
            className="madhubani-svg peacock-motif" 
            viewBox="0 0 200 200" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ rotate: peacockRotate, scale: peacockScale, opacity: peacockOpacity }}
          >
            <path d="M60 140 Q45 100 65 70 Q75 55 70 40 Q80 50 75 70 Q70 95 85 110 Q95 120 90 140 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M66 42 L60 38 L68 46" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="70" cy="48" r="2" fill="currentColor" />
            <path d="M72 38 L74 25 M74 38 L79 26 M70 39 L68 27" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="74" cy="23" r="2.5" fill="currentColor" />
            <circle cx="79" cy="24" r="2.5" fill="currentColor" />
            <circle cx="68" cy="25" r="2.5" fill="currentColor" />
            <path d="M72 75 Q90 65 110 75 Q125 85 130 110 Q110 120 90 115" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M80 85 Q95 78 110 88 Q118 95 120 110" fill="none" stroke="currentColor" strokeWidth="1" />
            {[...Array(7)].map((_, i) => {
              const angle = -15 + i * 22;
              const rad = (angle * Math.PI) / 180;
              const cx = 85 + 75 * Math.cos(rad);
              const cy = 120 + 45 * Math.sin(rad);
              return (
                <g key={i}>
                  <path d={`M85 130 Q${85 + 40 * Math.cos(rad)} ${120 + 20 * Math.sin(rad)} ${cx} ${cy}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx={cx} cy={cy} r="4" fill="currentColor" />
                </g>
              );
            })}
          </motion.svg>

          {/* Madhubani Fish Motif Left */}
          <motion.svg 
            className="madhubani-svg fish-motif-left" 
            viewBox="0 0 200 100" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ x: fishLeftX, rotate: fishLeftRotate, opacity: fishLeftOpacity }}
          >
            <path d="M10 50 Q50 15 150 45 Q165 30 185 20 Q175 50 185 80 Q165 70 150 55 Q50 85 10 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M40 33 Q48 50 40 67" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M48 36 Q55 50 48 64" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="30" cy="45" r="3" fill="currentColor" />
            <path d="M25 40 Q30 38 35 42" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {[...Array(6)].map((_, i) => {
              const x = 60 + i * 15;
              return (
                <g key={i}>
                  <path d={`M${x} ${30 - i * 0.5} Q${x + 5} 50 ${x} ${70 + i * 0.5}`} fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d={`M${x - 5} ${40} Q${x + 10} 50 ${x - 5} ${60}`} fill="none" stroke="currentColor" strokeWidth="1" />
                </g>
              );
            })}
            <path d="M90 28 Q110 10 130 32" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M90 72 Q110 90 130 68" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>

          {/* Madhubani Fish Motif Right */}
          <motion.svg 
            className="madhubani-svg fish-motif-right" 
            viewBox="0 0 200 100" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ x: fishRightX, rotate: fishRightRotate, opacity: fishRightOpacity }}
          >
            <path d="M190 50 Q150 15 50 45 Q35 30 15 20 Q25 50 15 80 Q35 70 50 55 Q150 85 190 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M160 33 Q152 50 160 67" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="170" cy="45" r="3" fill="currentColor" />
            {[...Array(6)].map((_, i) => {
              const x = 140 - i * 15;
              return (
                <path key={i} d={`M${x} ${30 - i * 0.5} Q${x - 5} 50 ${x} ${70 + i * 0.5}`} fill="none" stroke="currentColor" strokeWidth="1" />
              );
            })}
          </motion.svg>

          <div className="madhubani-border border-left"></div>
          <div className="madhubani-border border-right"></div>
        </div>

        {/* LAYER 3: Floating Cultural Particles */}
        <div className="particles-layer">
          {particlesData.map((p) => (
            <div
              key={p.id}
              className={`particle particle-${p.type}`}
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: p.left,
                top: p.top,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`
              }}
            />
          ))}
        </div>

        {/* HERO VISUAL COMPOSITION: 3D Parallax Collage */}
        <div className="cinematic-collage-container" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Collage Item 1: Traditional Brass Frame / Plate backdrop */}
          <motion.div 
            className="collage-brass-plate-back"
            style={{ 
              scale: brassScale, 
              rotate: brassRotate, 
              opacity: brassOpacity,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="brass-rim-outer"></div>
            <div className="brass-rim-inner"></div>
            <div className="brass-texture-overlay"></div>
          </motion.div>

          {/* Collage Item 2: Central Earthen Kitchen (gal_mix.webp) */}
          <motion.div 
            className="collage-item item-central"
            style={{ 
              z: centralZ,
              y: centralY,
              scale: centralScale, 
              opacity: centralOpacity,
              filter: centralFilter,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="image-frame">
              <img src="/gal_mix.webp" alt="Bihari pickle aging in courtyard" />
              <div className="shadow-overlay"></div>
            </div>
            <span className="image-label">Earthen Courtyard Jars</span>
          </motion.div>

          {/* Collage Item 3: Ingredients & Spice Preparation (deal_scatter.webp) */}
          <motion.div 
            className="collage-item item-ingredients"
            style={{ 
              z: spicesZ,
              x: spicesX,
              y: spicesY,
              scale: spicesScale,
              rotate: spicesRotate,
              opacity: spicesOpacity,
              filter: spicesFilter,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="image-frame">
              <img src="/deal_scatter.webp" alt="Traditional spices and brass dishes" />
              <div className="shadow-overlay"></div>
            </div>
            <span className="image-label">Stone Ground Spices</span>
          </motion.div>

          {/* Collage Item 4: Artisan Craftsmanship (about_us.webp) */}
          <motion.div 
            className="collage-item item-artisan"
            style={{ 
              z: artisanZ,
              x: artisanX,
              y: artisanY,
              scale: artisanScale,
              rotate: artisanRotate,
              opacity: artisanOpacity,
              filter: artisanFilter,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="image-frame">
              <img src="/about_us.webp" alt="Women handcrafting pickles" />
              <div className="shadow-overlay"></div>
            </div>
            <span className="image-label">Generational Recipes</span>
          </motion.div>

          {/* Collage Item 5: Closeup Product (prod_mango.webp) */}
          <motion.div 
            className="collage-item item-closeup"
            style={{ 
              z: closeupZ,
              x: closeupX,
              y: closeupY,
              scale: closeupScale,
              rotate: closeupRotate,
              opacity: closeupOpacity,
              filter: closeupFilter,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="image-frame">
              <img src="/prod_mango.webp" alt="Rich mango pickle close up" />
              <div className="shadow-overlay"></div>
            </div>
            <span className="image-label">Swadyum Sun-Dried Jar</span>
          </motion.div>

          {/* Collage Item 6: Slicing (gal_cut.webp) */}
          <motion.div 
            className="collage-item item-farm"
            style={{ 
              z: farmZ,
              x: farmX,
              y: farmY,
              scale: farmScale,
              rotate: farmRotate,
              opacity: farmOpacity,
              filter: farmFilter,
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="image-frame">
              <img src="/gal_cut.webp" alt="Raw mango preparation" />
              <div className="shadow-overlay"></div>
            </div>
            <span className="image-label">Artisanal Slicing</span>
          </motion.div>
        </div>

        {/* CONTENT BLOCK: Centered Framer Motion Text Reveal */}
        <motion.div 
          className="experience-content-block"
          style={{ 
            opacity: contentOpacity,
            y: contentY,
            scale: contentScale
          }}
          initial="hidden"
          animate={isTextActive ? "visible" : "hidden"}
        >
          {/* Eyebrow Letter Spacing Entrance */}
          <motion.span 
            className="section-subtitle"
            variants={eyebrowVariants}
          >
            ~ Signature Bihar Experience ~
          </motion.span>
          
          {/* Headline Word Slide-Up from masked clip-path */}
          <motion.h2 
            className="experience-headline section-headline"
            variants={headlineContainerVariants}
          >
            <div className="headline-line-wrapper">
              <span className="word-mask">
                <motion.span className="inline-word" variants={wordMaskVariants}>Every </motion.span>
              </span>
              <span className="word-mask">
                <motion.span className="inline-word" variants={wordMaskVariants}>Jar </motion.span>
              </span>
              <span className="word-mask">
                <motion.span className="inline-word" variants={wordMaskVariants}>Carries</motion.span>
              </span>
            </div>
            <div className="headline-line-wrapper font-green">
              <span className="word-mask">
                <motion.span className="inline-word" variants={wordMaskVariants}>Bihar's </motion.span>
              </span>
              <span className="word-mask">
                <motion.span className="inline-word" variants={wordMaskVariants}>Soul</motion.span>
              </span>
            </div>
          </motion.h2>
          
          {/* Subtext Fade-in and drift */}
          <motion.p 
            className="experience-subtext"
            variants={subtextVariants}
          >
            From traditional kitchens to modern tables, we preserve the flavors, stories, and heritage that have shaped generations.
          </motion.p>

          {/* Cultural Highlight Badge Pills Stagger-Reveal */}
          <motion.div 
            className="cultural-highlights-strip"
            variants={badgesContainerVariants}
          >
            <motion.span className="cultural-badge" variants={badgeItemVariants}>Generational Recipes</motion.span>
            <motion.span className="cultural-badge" variants={badgeItemVariants}>Traditional Craftsmanship</motion.span>
            <motion.span className="cultural-badge" variants={badgeItemVariants}>Authentic Bihari Heritage</motion.span>
            <motion.span className="cultural-badge" variants={badgeItemVariants}>Handcrafted In Small Batches</motion.span>
          </motion.div>
        </motion.div>

        {/* PREMIUM ENDING MOMENT */}
        <motion.div 
          className="experience-ending-moment"
          style={{ 
            opacity: quoteOpacity,
            y: quoteY,
            scale: quoteScale
          }}
          initial="hidden"
          animate={isQuoteActive ? "visible" : "hidden"}
        >
          {/* Growing Gold Divider */}
          <div className="ending-divider">
            <motion.div className="divider-line" variants={dividerVariants}></motion.div>
            <motion.div className="divider-accent" variants={dividerVariants}></motion.div>
            <motion.div className="divider-line" variants={dividerVariants}></motion.div>
          </div>
          
          {/* Fading Quote */}
          <motion.blockquote 
            className="ending-quote"
            variants={quoteTextVariants}
          >
            “More than a pickle. A taste of home. A taste of Bihar.”
          </motion.blockquote>
        </motion.div>

      </div>
    </section>
  );
}

export default SignatureExperienceSection;
