import React, { useState, useEffect } from 'react';
import './ExitIntentPop.css';

function ExitIntentPop({ onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        setVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!visible) return null;

  return (
    <div className="exit-pop-overlay">
      <div className="exit-pop-modal">
        <button className="exit-pop-close" onClick={() => setVisible(false)}>&times;</button>
        <div className="exit-pop-content">
          <span className="exit-pop-emoji">🎁</span>
          <h2>Wait! Don't leave empty-handed!</h2>
          <p>Get an exclusive <strong>10% OFF</strong> your entire order if you complete your purchase now.</p>
          <div className="exit-pop-code-box">
            Use code: <strong>SWADYUM10</strong>
          </div>
          <button className="exit-pop-btn" onClick={() => { setVisible(false); onNavigate('shop'); }}>
            Shop Now & Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExitIntentPop;
