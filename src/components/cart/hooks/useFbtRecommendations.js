import { useState, useEffect } from 'react';

/**
 * Frequently Bought Together recommendations.
 * Currently uses a static curated list. In future, could fetch from Supabase
 * based on cart contents and purchase history.
 */
const FBT_PRODUCTS = [
    {
        slug: 'mango-pickle',
        name: 'Aam Ka Achar',
        price: 199,
        mrp: 250,
        image: '/prod_mango.webp',
        weight: '250g',
        rating: 4.8,
    },
];

export default function useFbtRecommendations(cart) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Filter out products already in cart
        const cartSlugs = new Set(cart.map((item) => item.slug));
        const filtered = FBT_PRODUCTS.filter((p) => !cartSlugs.has(p.slug));
        // Simulate brief loading for smooth UX
        const timer = setTimeout(() => {
            setProducts(filtered);
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [cart]);

    return { products, loading };
}