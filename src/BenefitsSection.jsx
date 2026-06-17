import React from 'react';
import './BenefitsSection.css';

function BenefitsSection() {
  return (
    <section className="benefits-section" id="benefits">
      
      {/* Subtle Background Decorative Sketches (2% - 4% opacity) */}
      <div className="benefits-bg-decoration">
        {/* Background Chili Sketch - Left */}
        <svg className="bg-sketch sketch-left" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 20 C25 35 22 55 35 75 C45 88 65 92 75 80 C85 70 80 50 70 35 C60 20 40 10 30 20" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M30 20 C32 15 35 12 33 8" fill="none" stroke="currentColor" strokeWidth="1" /> {/* Stem */}
        </svg>

        {/* Background Mustard Seeds Trail - Right */}
        <svg className="bg-sketch sketch-right" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="3" fill="currentColor" />
          <circle cx="35" cy="45" r="2.5" fill="currentColor" />
          <circle cx="15" cy="70" r="3" fill="currentColor" />
          <circle cx="45" cy="95" r="2" fill="currentColor" />
          <circle cx="25" cy="120" r="3.5" fill="currentColor" />
          <circle cx="55" cy="145" r="2.5" fill="currentColor" />
          <circle cx="30" cy="175" r="3" fill="currentColor" />
          <path d="M20 20 Q35 45 15 70 T25 120 T30 175" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>

        {/* Madhubani Corner Flower - Top Right */}
        <svg className="bg-sketch sketch-top-right" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="85" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const rad = (angle * Math.PI) / 180;
            const cx = 85 + 18 * Math.cos(rad);
            const cy = 15 + 18 * Math.sin(rad);
            return (
              <circle key={i} cx={cx} cy={cy} r="6" fill="none" stroke="currentColor" strokeWidth="1" />
            );
          })}
        </svg>
      </div>

      <div className="benefits-container">
        
        {/* SECTION INTRO */}
        <div className="benefits-intro">
          <span className="section-subtitle">~ Why Swadyum ~</span>
          <h2 className="section-headline">
            Crafted With Tradition.<br />
            Defined By Quality.
          </h2>
          <p className="benefits-subtext">
            Every jar reflects generations of knowledge, carefully selected ingredients, and a process that values authenticity over shortcuts.
          </p>
        </div>

        {/* ASYMMETRICAL BENEFITS GRID */}
        <div className="benefits-grid">

          {/* BENEFIT 01: Sun-Cured (Wide - 7 columns) */}
          <div className="benefit-card card-wide card-suncured">
            <div className="paper-texture-overlay"></div>
            <div className="card-inner">
              <div className="card-visual-wrapper">
                <svg className="benefit-svg sun-cured-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Sun with shimmering rays */}
                  <g className="sun-group">
                    <circle cx="100" cy="45" r="18" fill="none" stroke="#C79A3B" strokeWidth="2" />
                    <circle cx="100" cy="45" r="12" fill="#D87A1D" opacity="0.15" />
                    {/* Sun Rays */}
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 360) / 12;
                      const rad = (angle * Math.PI) / 180;
                      const x1 = 100 + 24 * Math.cos(rad);
                      const y1 = 45 + 24 * Math.sin(rad);
                      const x2 = 100 + 38 * Math.cos(rad);
                      const y2 = 45 + 38 * Math.sin(rad);
                      return (
                        <line 
                          key={i} 
                          x1={x1} y1={y1} x2={x2} y2={y2} 
                          stroke="#C79A3B" 
                          strokeWidth="1.5" 
                          className="sun-ray-line"
                        />
                      );
                    })}
                  </g>
                  {/* Traditional Earthen Martban Jars */}
                  <g className="jar-group">
                    {/* Shadow base */}
                    <ellipse cx="100" cy="132" rx="30" ry="5" fill="#EAE5DB" />
                    <ellipse cx="65" cy="135" rx="22" ry="4" fill="#EAE5DB" />

                    {/* Left Jar (Smaller, offset) */}
                    <path d="M50 115 C50 100 55 95 65 95 C75 95 80 100 80 115 C80 128 75 136 65 136 C55 136 50 128 50 115 Z" fill="none" stroke="#A55A2A" strokeWidth="2" />
                    <path d="M57 95 L73 95 M55 91 L75 91 L71 95 L59 95 Z" fill="none" stroke="#A55A2A" strokeWidth="2" /> {/* Neck / lid */}
                    <path d="M53 108 Q65 115 77 108" fill="none" stroke="#C79A3B" strokeWidth="1" strokeDasharray="2 2" /> {/* Decorative jar band */}

                    {/* Central Jar (Larger, detailed) */}
                    <path d="M80 110 C80 88 88 82 100 82 C112 82 120 88 120 110 C120 128 112 134 100 134 C88 134 80 128 80 110 Z" fill="none" stroke="#2F5E3B" strokeWidth="2" />
                    <path d="M89 82 L111 82 M87 77 L113 77 L108 82 L92 82 Z" fill="none" stroke="#2F5E3B" strokeWidth="2" /> {/* Lid */}
                    <path d="M83 100 Q100 108 117 100" fill="none" stroke="#C79A3B" strokeWidth="1.5" /> {/* Gold divider line on jar */}
                    
                    {/* Traditional cloth jar tying lid detail */}
                    <path d="M90 77 Q100 85 110 77 Q104 88 100 88 Q96 88 90 77" fill="none" stroke="#C79A3B" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>
              <div className="card-text-wrapper">
                <h3 className="benefit-title">Sun-Cured</h3>
                <p className="benefit-description">
                  Naturally matured under sunlight to develop deeper flavors and authentic character.
                </p>
              </div>
            </div>
          </div>

          {/* BENEFIT 02: Rich In Flavor (Vertical - 5 columns) */}
          <div className="benefit-card card-vertical card-flavor">
            <div className="paper-texture-overlay"></div>
            <div className="card-inner">
              <div className="card-visual-wrapper">
                <svg className="benefit-svg flavor-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Swirling aroma trail */}
                  <path className="flavor-swirl" d="M30 130 C40 100 50 70 80 60 C110 50 130 80 110 100 C90 120 60 90 80 40 C90 20 110 10 130 20" fill="none" stroke="#C79A3B" strokeWidth="2" strokeDasharray="3 3" />
                  
                  {/* Floating spices */}
                  <g className="spice-elements">
                    {/* Chili sketch */}
                    <path className="spice-chili" d="M65 95 C62 85 58 70 72 58 C78 52 88 50 92 62 C96 74 85 88 78 98 C74 103 72 108 71 112" fill="none" stroke="#A55A2A" strokeWidth="2" />
                    <path d="M65 95 C64 97 62 99 58 100" fill="none" stroke="#A55A2A" strokeWidth="1.5" /> {/* Stem */}

                    {/* Garlic cloves outline */}
                    <path className="spice-garlic" d="M110 115 C110 110 115 106 122 108 C126 109 128 114 125 119 C121 123 114 122 110 115 Z" fill="none" stroke="#666666" strokeWidth="1.5" />
                    
                    {/* Mustard Seeds */}
                    <circle cx="45" cy="85" r="3" fill="#1F1F1F" className="seed seed-1" />
                    <circle cx="55" cy="115" r="2.5" fill="#1F1F1F" className="seed seed-2" />
                    <circle cx="95" cy="110" r="3.5" fill="#C79A3B" className="seed seed-3" />
                    <circle cx="115" cy="55" r="2" fill="#C79A3B" className="seed seed-4" />
                    <circle cx="35" cy="55" r="2.5" fill="#A55A2A" className="seed seed-5" />
                  </g>
                </svg>
              </div>
              <div className="card-text-wrapper">
                <h3 className="benefit-title">Rich In Flavor</h3>
                <p className="benefit-description">
                  Layered spice profiles create a bold taste that lingers long after every bite.
                </p>
              </div>
            </div>
          </div>

          {/* BENEFIT 03: No Artificial Preservatives (Vertical - 5 columns) */}
          <div className="benefit-card card-vertical card-preservatives">
            <div className="paper-texture-overlay"></div>
            <div className="card-inner">
              <div className="card-visual-wrapper">
                <svg className="benefit-svg leaf-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Organic circular badge outline */}
                  <circle cx="80" cy="80" r="50" fill="none" stroke="#2F5E3B" strokeWidth="1.5" />
                  <circle cx="80" cy="80" r="44" fill="none" stroke="#C79A3B" strokeWidth="1" strokeDasharray="3 2" />
                  
                  {/* Organic Leaf sprig */}
                  <g className="leaf-branch">
                    {/* Stem */}
                    <path d="M60 105 Q80 90 100 55" fill="none" stroke="#2F5E3B" strokeWidth="2.5" />
                    
                    {/* Center Leaf */}
                    <path d="M100 55 C95 65 92 75 97 80 C102 85 108 72 100 55 Z" fill="none" stroke="#2F5E3B" strokeWidth="2" />
                    <path d="M100 55 Q97 68 98 80" fill="none" stroke="#2F5E3B" strokeWidth="1" />
                    
                    {/* Left Leaf */}
                    <path d="M78 88 C70 92 65 100 70 104 C75 108 82 98 78 88 Z" fill="none" stroke="#2F5E3B" strokeWidth="2" />
                    
                    {/* Right Leaf */}
                    <path d="M88 72 C88 78 95 85 100 80 C105 75 92 72 88 72 Z" fill="none" stroke="#2F5E3B" strokeWidth="2" />
                  </g>
                  
                  {/* Decorative stars */}
                  <path d="M45 50 L47 45 L52 47 L48 50 L50 55 L46 52 L42 54 L45 50" fill="#C79A3B" />
                  <path d="M115 110 L116 106 L120 108 L117 110 L118 114 L115 112 L112 113 L115 110" fill="#C79A3B" />
                </svg>
              </div>
              <div className="card-text-wrapper">
                <h3 className="benefit-title">No Preservatives</h3>
                <p className="benefit-description">
                  Made using traditional methods without relying on artificial preservation techniques.
                </p>
              </div>
            </div>
          </div>

          {/* BENEFIT 04: Handmade In Small Batches (Wide - 7 columns) */}
          <div className="benefit-card card-wide card-handmade">
            <div className="paper-texture-overlay"></div>
            <div className="card-inner">
              <div className="card-visual-wrapper">
                <svg className="benefit-svg handmade-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Sketch-style Artisan mixing ingredients in a pot */}
                  <g className="pot-group">
                    {/* Clay pot profile */}
                    <path d="M60 120 C60 135 75 142 100 142 C125 142 140 135 140 120 C140 105 130 100 125 100 L75 100 C70 100 60 105 60 120 Z" fill="none" stroke="#A55A2A" strokeWidth="2" />
                    <path d="M72 100 L128 100 L124 94 L76 94 Z" fill="none" stroke="#A55A2A" strokeWidth="2" /> {/* Rim */}
                  </g>
                  
                  {/* Mixing Spoon/Ladle & Hand Gesture Line Sketch */}
                  <g className="spoon-hand-group">
                    {/* Wooden Ladle */}
                    <path className="wood-spoon" d="M110 50 L88 95 M85 91 L78 104 C74 110 82 114 86 108 L93 95" fill="none" stroke="#C79A3B" strokeWidth="2" />
                    
                    {/* Hand outline holding ladle */}
                    <path className="artisan-hand" d="M135 30 C128 35 120 40 114 45 C110 48 106 45 104 43 C101 40 104 36 108 34 C115 30 125 22 130 18" fill="none" stroke="#1F1F1F" strokeWidth="1.5" />
                    <path className="hand-fingers" d="M114 45 C113 48 111 50 109 49 C107 48 108 45 110 43 M112 41 C110 43 108 45 106 43" fill="none" stroke="#1F1F1F" strokeWidth="1" />
                  </g>

                  {/* Ground spices being sprinkled */}
                  <g className="spicedust-group">
                    <path d="M85 85 Q90 90 95 85" fill="none" stroke="#D87A1D" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="108" cy="85" r="1.5" fill="#D87A1D" />
                    <circle cx="120" cy="92" r="2" fill="#D87A1D" />
                    <circle cx="125" cy="82" r="1" fill="#A55A2A" />
                    <circle cx="78" cy="88" r="1.5" fill="#A55A2A" />
                  </g>
                </svg>
              </div>
              <div className="card-text-wrapper">
                <h3 className="benefit-title">Handmade In Small Batches</h3>
                <p className="benefit-description">
                  Prepared carefully in limited quantities to ensure consistency and craftsmanship.
                </p>
              </div>
            </div>
          </div>

          {/* BENEFIT 05: Authentic Bihar Recipe (Full Width Featured - 12 columns) */}
          <div className="benefit-card card-full card-recipe">
            <div className="paper-texture-overlay"></div>
            <div className="card-inner">
              <div className="card-visual-wrapper">
                <svg className="benefit-svg recipe-scroll-svg" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
                  {/* Scrolled Recipe Document */}
                  <g className="scroll-group">
                    {/* Scroll backing outline */}
                    <path d="M50 30 L190 30 C200 30 205 38 190 44 L50 44 C35 38 40 30 50 30 Z" fill="#F4F0E6" stroke="#C79A3B" strokeWidth="1.5" /> {/* Rolled top */}
                    <path d="M48 40 L48 135 C48 145 55 145 60 145 L180 145 C185 145 192 145 192 135 L192 40 Z" fill="#F8F5F0" stroke="#C79A3B" strokeWidth="1.5" />
                    <path d="M46 135 L186 135 C196 135 200 142 186 148 L46 148 C32 142 36 135 46 135 Z" fill="#F4F0E6" stroke="#C79A3B" strokeWidth="1.5" /> {/* Rolled bottom */}
                    
                    {/* Madhubani traditional leaf border on scroll sides */}
                    <path d="M54 45 L54 125 M186 45 L186 125" fill="none" stroke="#2F5E3B" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Madhubani fish motif sketch inside the scroll header */}
                    <path className="scroll-fish" d="M95 55 Q120 42 145 55 Q135 62 145 68 Q120 81 95 68 L95 55" fill="none" stroke="#C79A3B" strokeWidth="1.2" />
                    <circle cx="103" cy="61" r="1.5" fill="#2F5E3B" />
                    <path d="M141 57 L137 61 L141 65" fill="none" stroke="#C79A3B" strokeWidth="1" />
                    
                    {/* Decorative text lines */}
                    <line x1="65" y1="80" x2="175" y2="80" stroke="#666666" strokeWidth="1.5" strokeDasharray="80 5 10 5" />
                    <line x1="65" y1="92" x2="175" y2="92" stroke="#666666" strokeWidth="1.5" strokeDasharray="40 5 45" />
                    <line x1="65" y1="104" x2="175" y2="104" stroke="#666666" strokeWidth="1.5" strokeDasharray="60 5 30 5" />
                    <line x1="65" y1="116" x2="140" y2="116" stroke="#666666" strokeWidth="1.5" strokeDasharray="50 5" />
                  </g>
                </svg>
              </div>
              <div className="card-text-wrapper">
                <h3 className="benefit-title">Authentic Bihar Recipe</h3>
                <p className="benefit-description">
                  Inspired by generations of traditional Bihari kitchens and family recipes, preserving the exact local preparation methods.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION FOOTER STATEMENT */}
        <div className="benefits-footer">
          <div className="gold-divider">
            <div className="divider-line"></div>
            <div className="divider-diamond"></div>
            <div className="divider-line"></div>
          </div>
          <p className="footer-statement">
            Not mass-produced. Patiently crafted the way it has been for generations.
          </p>
        </div>

      </div>
    </section>
  );
}

export default BenefitsSection;
