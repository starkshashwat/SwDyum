export const dynamic = 'force-dynamic';

import { getHomepageSections, getActiveBanners, getFeaturedProducts } from '@/actions/content';
import Link from 'next/link';
import TrustBar from '@/components/TrustBar';

export default async function Home() {
  const sections = await getHomepageSections();
  const banners = await getActiveBanners();
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="app-container">
      {/* ─── Hero Section ─── */}
      <div className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <span className="hero-eyebrow">Sun-Cured & Small Batch</span>

          <h1 className="hero-headline">
            Taste the <em>Heritage</em> <br/>of Bihar in Every Bite
          </h1>

          <p className="hero-subtext">
            Handcrafted in traditional clay pots, slow-aged under the summer sun, and steeped in raw cold-pressed mustard oil. The gold standard of Bihari pickles — now at your doorstep.
          </p>

          <div className="cta-group">
            <Link href="/shop" className="primary-cta">Shop Best Sellers</Link>
            <Link href="/about" className="secondary-cta">Our Story</Link>
          </div>

          <div className="trust-indicators">
            <div className="rating-container">
              <span className="stars">★★★★★</span>
              <span className="rating-text">Loved by 10,000+ Families (4.9/5 Rating)</span>
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
        </div>
      </div>

      <TrustBar />
      
      {/* Dynamic Products Rendered from PostgreSQL! */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-amber-900 mb-4">Our Masterpieces</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Sourced directly from farmers, aged to perfection. Data fetched via Server Actions and Prisma!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-100 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-stone-100 relative">
                  {/* Dynamic image would go here */}
                  <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                    Product Image
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl text-amber-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-stone-500 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">
                      ₹{product.product_variants[0]?.price?.toString() || '0'}
                    </span>
                    <Link href={`/product/${product.slug}`} className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors">
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-stone-500">
                No products found in the database.
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/shop" className="inline-block border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-full font-medium hover:bg-amber-50 transition-colors">
              View Entire Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
