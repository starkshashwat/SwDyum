import React from 'react';
import './OrderConfidenceCard.css';

const TRUST_ITEMS = [
    { icon: 'leaf', label: '100% Natural Ingredients' },
    { icon: 'shield', label: 'No Preservatives' },
    { icon: 'certificate', label: 'FSSAI Certified' },
    { icon: 'lock', label: 'Secure Razorpay Checkout' },
    { icon: 'truck', label: 'Free Shipping above ₹799' },
];

const IconSVG = ({ type }) => {
    const common = {
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'var(--color-primary)',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    };

    switch (type) {
        case 'leaf':
            return (
                <svg {...common}>
                    <path d="M17 8C8 10 5.4 16.7 3 22c0 0 8-2 14-8 3.5-3.5 4-9 4-9s-5.5.5-9 4" />
                </svg>
            );
        case 'shield':
            return (
                <svg {...common}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            );
        case 'certificate':
            return (
                <img src="/fssai.png" alt="FSSAI" style={{ height: '16px', width: 'auto', objectFit: 'contain' }} />
            );
        case 'lock':
            return (
                <svg {...common}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            );
        case 'truck':
            return (
                <svg {...common}>
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
            );
        default:
            return null;
    }
};

export default function OrderConfidenceCard() {
    return (
        <div className="confidence-card">
            <h4 className="confidence-title">Order with Confidence</h4>
            <ul className="confidence-list">
                {TRUST_ITEMS.map((item) => (
                    <li key={item.label} className="confidence-item">
                        <IconSVG type={item.icon} />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}