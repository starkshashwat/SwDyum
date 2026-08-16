import React from 'react';
import './PdpSkeleton.css';

function PdpSkeleton() {
  return (
    <div className="pdp-skeleton-wrapper">
      <div className="pdp-skeleton-hero">
        <div className="skeleton-image skeleton-pulse"></div>
        <div className="skeleton-info">
          <div className="skeleton-title skeleton-pulse"></div>
          <div className="skeleton-price skeleton-pulse"></div>
          
          <div className="skeleton-desc-line skeleton-pulse"></div>
          <div className="skeleton-desc-line skeleton-pulse"></div>
          <div className="skeleton-desc-line short skeleton-pulse"></div>
          
          <div className="skeleton-variants">
            <div className="skeleton-variant-btn skeleton-pulse"></div>
            <div className="skeleton-variant-btn skeleton-pulse"></div>
            <div className="skeleton-variant-btn skeleton-pulse"></div>
          </div>
          
          <div className="skeleton-action skeleton-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default PdpSkeleton;
