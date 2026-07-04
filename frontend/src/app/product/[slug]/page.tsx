export const dynamic = 'force-dynamic';

import { getProductBySlug } from '@/actions/content';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.product_images.find(img => img.is_primary)?.url || '/placeholder.png';
  const price = product.product_variants[0]?.price?.toString() || '0';

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200">
            {product.product_images.length > 0 ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400">No Image</div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.product_images.map(img => (
              <div key={img.id} className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200 cursor-pointer">
                <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <nav className="text-sm text-stone-500 mb-6">
            <Link href="/" className="hover:text-amber-700">Home</Link> &gt;{' '}
            <Link href="/shop" className="hover:text-amber-700">Shop</Link> &gt;{' '}
            <span className="text-stone-800">{product.name}</span>
          </nav>

          <h1 className="text-4xl font-serif text-amber-900">{product.name}</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">₹{price}</span>
            {product.is_bestseller && (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">Bestseller</span>
            )}
          </div>

          <p className="text-stone-600 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="pt-6 border-t border-stone-200">
            <h3 className="font-semibold mb-3">Select Size</h3>
            <div className="flex space-x-3">
              {product.product_variants.map(variant => (
                <button 
                  key={variant.id} 
                  className="border-2 border-stone-200 rounded-lg px-4 py-2 hover:border-amber-600 focus:border-amber-600 focus:outline-none transition-colors"
                >
                  <div className="font-medium">{variant.weight_label}</div>
                  <div className="text-sm text-stone-500">₹{variant.price?.toString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button className="w-full bg-amber-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-amber-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
              Add to Cart
            </button>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="flex items-center space-x-3 text-stone-700">
              <span className="text-amber-600 text-xl">✓</span>
              <span>100% Organic</span>
            </div>
            <div className="flex items-center space-x-3 text-stone-700">
              <span className="text-amber-600 text-xl">✓</span>
              <span>Sun-Cured</span>
            </div>
            <div className="flex items-center space-x-3 text-stone-700">
              <span className="text-amber-600 text-xl">✓</span>
              <span>No Preservatives</span>
            </div>
            <div className="flex items-center space-x-3 text-stone-700">
              <span className="text-amber-600 text-xl">✓</span>
              <span>Cold-Pressed Oil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-24">
          <h2 className="text-3xl font-serif text-amber-900 mb-8 text-center">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <div className="flex text-amber-500 mb-3">
                  {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                </div>
                <p className="text-stone-700 mb-4">"{review.review_text}"</p>
                <div className="text-sm text-stone-500 font-medium">- Customer</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
