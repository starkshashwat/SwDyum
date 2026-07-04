'use server';

import { prisma } from '@/lib/prisma';

export async function getHomepageSections() {
  try {
    return await prisma.homepage_sections.findMany({
      where: { is_active: true },
      orderBy: { display_order: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return [];
  }
}

export async function getActiveBanners() {
  try {
    const now = new Date();
    return await prisma.banners.findMany({
      where: {
        is_active: true,
        OR: [
          { start_date: null, end_date: null },
          { start_date: { lte: now }, end_date: { gte: now } },
        ],
      },
      orderBy: { display_order: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}

export async function getActiveAnnouncements() {
  try {
    const now = new Date();
    return await prisma.announcements.findMany({
      where: {
        is_active: true,
        OR: [
          { start_date: null, end_date: null },
          { start_date: { lte: now }, end_date: { gte: now } },
        ],
      },
      orderBy: { priority: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await prisma.categories.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    return await prisma.products.findMany({
      where: { is_active: true, is_bestseller: true },
      include: {
        product_images: {
          where: { is_primary: true },
        },
        product_variants: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      take: 8,
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.products.findUnique({
      where: { slug },
      include: {
        product_images: {
          orderBy: { display_order: 'asc' },
        },
        product_variants: {
          orderBy: { price: 'asc' },
        },
        reviews: {
          where: { is_approved: true },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}
