/**
 * catalogService.js
 *
 * The single entry point pages/components should use to read catalog
 * data (products). This module is a drop-in
 * replacement for importing `src/data/products.js` / `src/data/pdpContentMap.js`
 * directly.
 *
 * Behavior:
 *   - When `USE_NEW_BACKEND` is false (default), every function here
 *     delegates straight to the existing mock/Supabase-backed data
 *     sources (`src/data/products.js`, local mock arrays), producing
 *     IDENTICAL output to current production behavior.
 *   - When `USE_NEW_BACKEND` is true, functions first attempt to call
 *     the new Phase 2 backend (via `backendClient.js`), transform the
 *     response into the exact same shape the mock functions return,
 *     and only use that. If the backend call throws for ANY reason
 *     (network error, non-2xx, unexpected shape, parse failure), the
 *     error is caught, logged with `console.warn`, and we fall back to
 *     the mock data path — the UI never sees the error.
 *
 * This file intentionally never throws to its callers.
 */

import {
    fetchProducts as mockFetchProducts,
    getProductBySlug as mockGetProductBySlug,
    getRelatedProducts as mockGetRelatedProducts,
} from '../../data/products';
import { pdpContentMap } from '../../data/pdpContentMap';
import { USE_NEW_BACKEND } from './config';
import * as backendClient from './backendClient';

/* ═══════════════════════════ Helpers ═══════════════════════════════ */

/** Merge any local PDP content overrides (tabs, faq, taste profile, etc.)
 * onto a product's pdp_config — mirrors the merge that ProductDetailsPage
 * used to perform inline. */
function withPdpContent(product, slug) {
    if (!product) return product;
    const overrides = pdpContentMap[slug];
    if (!overrides) return product;
    return {
        ...product,
        pdp_config: {
            ...product.pdp_config,
            ...overrides,
        },
    };
}

function sortByDisplayOrder(images = []) {
    return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

/** Transform a raw backend product (list shape) into the shape
 * `fetchProducts()` in data/products.js returns. */
function transformBackendProductToCard(product) {
    const images = sortByDisplayOrder(product.product_images);
    const primaryImage = images[0]?.url || '/prod_mango.webp';
    const variants = product.product_variants || [];
    const pricesMap = {};
    variants.forEach((v) => {
        pricesMap[v.weight_label] = v.price;
    });

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        full_description: product.description,
        image: primaryImage,
        category: product.categories?.name || product.category?.name || 'Uncategorized',
        base_price: variants[0]?.price ?? product.base_price ?? 0,
        prices: pricesMap,
        isBestseller: Boolean(product.is_bestseller),
        rating: 0,
        reviewsCount: 0,
    };
}

/** Transform a raw backend product (single/detail shape) into the shape
 * `getProductBySlug()` in data/products.js returns. */
function transformBackendProductDetail(product) {
    const images = sortByDisplayOrder(product.product_images);
    const primaryImage = images[0]?.url || '/prod_mango.webp';
    const variants = product.product_variants || [];
    const pricesMap = {};
    let totalStock = 0;
    variants.forEach((v) => {
        const available = Math.max(0, (v.stock_quantity || 0) - (v.reserved_quantity || 0));
        pricesMap[v.weight_label] = v.price;
        totalStock += available;
        v.available_stock = available;
    });

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description || product.description,
        image: primaryImage,
        images: images.map((i) => i.url),
        category: product.categories?.name || product.category?.name || 'Uncategorized',
        prices: pricesMap,
        base_price: variants[0]?.price ?? product.base_price ?? 0,
        isBestseller: Boolean(product.is_bestseller),
        rating: 0,
        reviewsCount: 0,
        stock: totalStock,
        variants,
        pure_ingredients: (product.product_ingredients || []).map((pi) => ({
            name: pi.ingredient,
            percentage: pi.percentage,
        })),
        pdp_config: product.pdp_config || {},
    };
}



/* ═══════════════════════════ Products ═══════════════════════════════ */

export async function getProducts() {
    if (!USE_NEW_BACKEND) {
        return mockFetchProducts();
    }
    try {
        const { data } = await backendClient.getProducts({ is_active: true });
        if (!Array.isArray(data)) throw new Error('Unexpected /products response shape');
        return data.map(transformBackendProductToCard);
    } catch (error) {
        console.warn('[catalogService] falling back to mock data for getProducts:', error);
        return mockFetchProducts();
    }
}

export async function getProductBySlug(slug) {
    if (!USE_NEW_BACKEND) {
        const data = await mockGetProductBySlug(slug);
        return withPdpContent(data, slug);
    }
    try {
        const { data: full } = await backendClient.getProductById(slug);
        if (!full) throw new Error('Unexpected /products/:id response shape');

        return withPdpContent(transformBackendProductDetail(full), slug);
    } catch (error) {
        console.warn('[catalogService] falling back to mock data for getProductBySlug:', error);
        const data = await mockGetProductBySlug(slug);
        return withPdpContent(data, slug);
    }
}

export async function getRelatedProducts(currentProductId, limit = 3) {
    if (!USE_NEW_BACKEND) {
        return mockGetRelatedProducts(currentProductId, limit);
    }
    try {
        const { data } = await backendClient.getProducts({ limit });
        if (!Array.isArray(data)) throw new Error('Unexpected /products response shape');
        return data
            .filter((p) => p.id !== currentProductId)
            .slice(0, limit)
            .map(transformBackendProductToCard);
    } catch (error) {
        console.warn('[catalogService] falling back to mock data for getRelatedProducts:', error);
        return mockGetRelatedProducts(currentProductId, limit);
    }
}


