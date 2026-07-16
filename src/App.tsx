import { useState } from 'react'
import productImg from './imports/image.png'

const SIZES = [
  { label: '250g', price: 299, originalPrice: 399 },
  { label: '500g', price: 499, originalPrice: 699 },
  { label: '1Kg', price: 899, originalPrice: 1199 },
]

const THUMBNAILS = [productImg, productImg, productImg, productImg, productImg]


const INGREDIENTS = [
  ['आम', 'Raw Langda Mango', "Purvanchal's pride, plucked green off the tree — perfect khatta + Vitamin C"],
  ['सरसों तेल', 'Mustard Oil', 'Cold-pressed Kachi Ghani; bold pungency + natural preservation'],
  ['सरसों पाउडर', 'Mustard powder', 'The classic achaari sharpness'],
  ['सौंफ', 'Fennel seeds', 'Sweet, aromatic; aids digestion'],
  ['मेथी पाउडर', 'Fenugreek powder', 'Signature achaari depth that balances the tang'],
  ['मंगरैला (कलौंजी)', 'Nigella seeds', 'Earthy aroma — the soul of the achaar'],
  ['अजवाइन', 'Carom seeds', 'Warm & digestive; cuts through the oil'],
  ['हींग', 'Asafoetida', 'That unmistakable achaar khushboo + digestion'],
  ['धनिया पाउडर', 'Coriander powder', 'Mellow, earthy body'],
  ['लाल मिर्ची पाउडर', 'Red chilli powder', 'Deep colour + measured heat'],
  ['हल्दी पाउडर', 'Turmeric', 'Golden hue + everyday immunity'],
  ['नमक', 'Salt', 'Seasoning + natural preservation'],
  ['सिरका', 'Vinegar', 'A tangy zing that also keeps every jar fresh longer'],
] as const

const HERO_INGREDIENTS = [
  ['Langda Aam', 'आम', 'khatta + Vitamin C'],
  ['Kachi Ghani Sarson Tel', 'सरसों तेल', 'cold-pressed purity'],
  ['Saunf', 'सौंफ', 'digestion ✓'],
  ['Mangraila (Kalonji)', 'मंगरैला', 'soul of the achaar'],
  ['Methi', 'मेथी', 'achaari depth'],
  ['Hing', 'हींग', 'the achaar khushboo'],
] as const

const FAQS = [
  ['Isme kya-kya hai — preservative?', 'No artificial colours ya synthetic flavours. Namak, sarson tel, thoda sirka aur dhoop — yahi isse naturally fresh rakhte hain. Wahi jo daadi ke haath ka achaar karta tha.'],
  ['Kitna spicy hai?', 'Medium heat — tez nahi, phika bhi nahi. Lal mirch hai, lekin tang aur masala usse balance karta hai. Ghar ke sab log kha sakte hain.'],
  ['Kaise store karein?', 'Thandi, sookhi jagah rakhein. Hamesha sookha chammach use karein — paani andar gaya toh kharaab ho sakta hai. Tel ki parat upar bani rehne dein, woh natural seal hai.'],
  ['Fridge zaroori hai?', 'Nahi — room temperature bilkul theek hai. Fridge mein rakhne ki zaroorat nahi, actually isse oil thak jaata hai. Bas pantry ya kitchen shelf kaafi hai.'],
  ['Kaunsa aam use kiya hai?', 'Raw Langda aam — ped se seedha green plucked, Purvanchal ka pride. Isi se woh perfect khatta aata hai jo factory-made achaar mein nahi milta.'],
  ['Best kab lagta hai yeh achaar?', '3 din baad — jab masala poori tarah rach jaaye aur aam thoda aur naram ho jaaye. Pehle din bhi acha hai, teesre din magical hai.'],
  ['Kya isme fungus lag sakta hai?', 'Nahi — jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai. Bas ek kaam aap karein: sookha chammach use karein aur tel ki parat upar rehne dein.'],
] as const

export default function App() {
  const [selectedSize, setSelectedSize] = useState(0)
  const [purchaseType, setPurchaseType] = useState<'subscribe' | 'onetime'>('subscribe')
  const [quantity, setQuantity] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [added, setAdded] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const size = SIZES[selectedSize]
  const displayPrice = purchaseType === 'subscribe'
    ? Math.round(size.price * 0.9)
    : size.price

  function handleAddToCart() {
    setCartCount(c => c + quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a]" style={{ fontFamily: "'Satoshi', 'Segoe UI', sans-serif" }}>
      {/* Announcement bar */}
      <div className="bg-[#1A4E28] text-white text-xs text-center py-2 px-4 tracking-wide">
        Flat 20% off with code SWADYUM20 · Free shipping on orders above ₹799
      </div>

      {/* Header */}
      <header className="border-b border-gray-100 px-6 md:px-12 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <a href="#" className="text-2xl font-bold tracking-tight text-[#1a3a1a]" style={{ letterSpacing: '-0.03em' }}>
          swadyum
        </a>
        <nav className="hidden md:flex gap-8 text-sm text-gray-600 font-medium">
          <a href="#" className="hover:text-[#1A4E28] transition-colors">Shop All</a>
          <a href="#" className="hover:text-[#1A4E28] transition-colors">Bundles</a>
          <a href="#" className="hover:text-[#1A4E28] transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-5">
          <button className="text-sm text-gray-600 hover:text-[#1A4E28] hidden md:block">Login</button>
          <button className="relative" aria-label="Shopping bag">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#1A4E28] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-3 text-xs text-gray-400 flex gap-1.5 items-center">
        <a href="#" className="hover:text-gray-600">Home</a>
        <span>/</span>
        <a href="#" className="hover:text-gray-600">Pickles</a>
        <span>/</span>
        <span className="text-gray-600">Mango Pickle (Aam Ka Achar)</span>
      </div>

      {/* Product layout */}
      <main className="px-6 md:px-12 pb-16 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Left: thumbnail strip + main image */}
          <div className="w-full lg:w-[52%] flex gap-3">
            {/* Thumbnail strip */}
            <div className="flex flex-col gap-2.5 pt-1">
              {THUMBNAILS.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`w-14 h-14 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                    activeThumb === i ? 'border-[#1A4E28]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={src} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-[#f5f0e8] flex items-center justify-center" style={{ minHeight: 440 }}>
              <img
                src={productImg}
                alt="Mango Pickle (Aam Ka Achar)"
                className="w-full h-full object-cover"
                style={{ maxHeight: 520 }}
              />
            </div>
          </div>

          {/* Right: product info */}
          <div className="w-full lg:w-[48%] flex flex-col gap-5 pt-2">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5">
              <span className="bg-[#f0f7ee] text-[#1A4E28] text-xs font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
                ⭐ Best Seller
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-[#1a1a1a]" style={{ letterSpacing: '-0.02em' }}>
                Mango Pickle<br />(Aam Ka Achar)
              </h1>
            </div>

            {/* Rating row */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} viewBox="0 0 20 20" fill={s <= 4 ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1" className="w-4 h-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-[#1a1a1a]">4.8</span>
              <span className="text-gray-400">·</span>
              <a href="#reviews" className="text-gray-500 underline underline-offset-2">312 Reviews</a>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">420+ sold this week</span>
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed">
              A richly spiced, hand-crafted pickle made from raw Totapuri mangoes slow-cured in cold-pressed Kachi Ghani mustard oil — bold, sun-cured and rooted in tradition. What Ama ke.
            </p>

            {/* Trust icons */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {[
                { icon: '🌿', label: '100% Natural' },
                { icon: '☀️', label: 'Sun Cured' },
                { icon: '🧪', label: 'Lab Tested' },
                { icon: '🏺', label: 'Micro-Batch Crafted' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <span>{b.icon}</span>
                  <span className="font-medium">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Size selector */}
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase mb-3">Choose Your Size</p>
              <div className="flex gap-3 flex-wrap">
                {SIZES.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(i)}
                    className={`px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                      selectedSize === i
                        ? 'border-[#1A4E28] bg-[#1A4E28] text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchase type */}
            <div className="flex gap-3">
              {/* Subscribe */}
              <button
                onClick={() => setPurchaseType('subscribe')}
                className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                  purchaseType === 'subscribe'
                    ? 'border-[#1A4E28] bg-[#f0f7ee]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscribe</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-[#1A4E28]' : 'border-gray-300'}`}>
                    {purchaseType === 'subscribe' && <div className="w-2 h-2 rounded-full bg-[#1A4E28]" />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1a1a1a]">₹{Math.round(size.price * 0.9)}</div>
                <div className="text-xs text-[#1A4E28] font-medium mt-0.5">Save 10% every month</div>
              </button>

              {/* One-time */}
              <button
                onClick={() => setPurchaseType('onetime')}
                className={`flex-1 rounded-xl border-2 p-4 text-left transition-all ${
                  purchaseType === 'onetime'
                    ? 'border-[#1A4E28] bg-[#f0f7ee]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">One-Time</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${purchaseType === 'onetime' ? 'border-[#1A4E28]' : 'border-gray-300'}`}>
                    {purchaseType === 'onetime' && <div className="w-2 h-2 rounded-full bg-[#1A4E28]" />}
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#1a1a1a]">₹{size.price}</div>
                <div className="text-xs text-gray-400 mt-0.5 line-through">₹{size.originalPrice}</div>
              </button>
            </div>

            {/* Subscribe perks */}
            {purchaseType === 'subscribe' && (
              <div className="text-xs text-gray-500 flex flex-col gap-1.5 -mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#1A4E28]">✓</span>
                  <span>Save 10% every month + free shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1A4E28]">✓</span>
                  <span>Cancel anytime — no fees, no hassle</span>
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg font-medium"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg font-medium"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#1A4E28] hover:bg-[#1f3f1b] text-white font-semibold py-3.5 rounded-full text-sm transition-colors"
              >
                {added ? '✓ Added to Cart!' : `Add to Cart · ₹${displayPrice * quantity}`}
              </button>
            </div>

            {/* Buy Now */}
            <button className="w-full border-2 border-[#1A4E28] text-[#1A4E28] font-semibold py-3 rounded-full text-sm hover:bg-[#f0f7ee] transition-colors">
              Buy Now
            </button>

            {/* Bottom trust badges */}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              {[
                { icon: <span className="text-2xl">🌿</span>, title: '100% Natural', sub: 'No preservatives' },
                { icon: <span className="text-2xl">🔄</span>, title: '7-day guarantee', sub: 'Love it or full refund' },
                { icon: <img src="/fssai.png" alt="FSSAI" style={{ height: '24px', width: 'auto', objectFit: 'contain' }} />, title: 'FSSAI Certified', sub: 'Quality tested' },
              ].map(b => (
                <div key={b.title} className="flex flex-col items-center text-center gap-1">
                  {b.icon}
                  <span className="text-xs font-semibold text-gray-700">{b.title}</span>
                  <span className="text-xs text-gray-400">{b.sub}</span>
                </div>
              ))}
            </div>

            {/* Expandable sections */}
            {['Ingredients', 'Nutritional Info', 'Check Delivery'].map((section) => (
              <details key={section} className="border-t border-gray-100 pt-3 group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-gray-700 pb-2 list-none">
                  {section}
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform">
                    <path d="M5 7l5 5 5-5"/>
                  </svg>
                </summary>
                <p className="text-sm text-gray-500 pb-3 leading-relaxed">
                  {section === 'Ingredients' && 'आम (Raw Langda Mango), सरसों तेल (Kachi Ghani mustard oil), सरसों पाउडर, सौंफ, मेथी पाउडर, मंगरैला (कलौंजी), अजवाइन, हींग, धनिया पाउडर, लाल मिर्ची पाउडर, हल्दी पाउडर, नमक और सिरका.'}
                  {section === 'Nutritional Info' && 'Per 10g serving: Calories 35 kcal · Fat 2.5g · Carbs 2g · Protein 0.4g · Sodium 580mg'}
                  {section === 'Check Delivery' && (
                    <span>Enter your pincode to check estimated delivery date and availability in your area.</span>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </main>

      {/* Ingredients section — based only on the supplied prompt */}
      <section className="bg-[#f7f1e6] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b3a1a]">Pure Ingredients</p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-3">
            {HERO_INGREDIENTS.map(([name, hindi, note], index) => (
              <article key={name} className={`group relative min-h-48 overflow-hidden rounded-2xl bg-[#1c1208] p-4 text-white shadow-sm transition duration-200 hover:-translate-y-1.5 hover:shadow-xl ${index === 0 ? 'col-span-2 min-h-80 md:col-span-6 md:row-span-2' : index === 1 ? 'md:col-span-6' : index < 4 ? 'md:col-span-3' : 'md:col-span-4'}`}>
                <img src={productImg} alt={name} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1208] via-[#1c1208]/35 to-transparent" />
                <div className="relative flex h-full min-h-40 flex-col justify-between">
                  <p className="text-[11px] font-medium tracking-[0.08em] text-white/60">{hindi}</p>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="max-w-[11rem] text-xl font-bold leading-tight md:text-2xl">{name}</h3>
                    <span className="max-w-[9rem] rounded-full border border-white/20 bg-white/[0.18] px-2.5 py-1.5 text-right text-[10px] font-medium leading-4 text-white backdrop-blur-md transition-all duration-200 group-hover:max-w-[12rem]">{note}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 overflow-hidden border-y border-[#d8cfc0]">
            <div className="bg-[#f7f1e6] px-5 py-6 md:px-7">
              <p className="text-3xl font-semibold tracking-[-0.035em] text-[#1c1208]">सामग्री</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b3a1a]">Ingredients</p>
              <p className="mt-4 text-sm font-medium text-[#4d4437]">13 Pure Ingredients. Zero shortcuts.</p>
            </div>
            <div>
              {INGREDIENTS.map(([hindi, english, why], index) => (
                <div key={english} className={`group grid gap-2 border-l-[3px] px-5 py-4 text-sm transition-colors hover:bg-[#ede4d4] md:grid-cols-[1fr_0.9fr_1.35fr] md:items-center md:gap-5 md:px-7 ${index % 2 === 0 ? 'bg-[#fafaf7]' : 'bg-[#f5f0e8]'}`} style={{ borderLeftColor: ['#c4862b', '#8b3a1a', '#8b3a1a', '#5c7a3e', '#6b4f2a', '#6b4f2a', '#a0522d', '#6b4f2a', '#5c7a3e', '#c8860a', '#c8860a', '#7a7a6e', '#c4862b'][index] }}>
                  <p className="flex items-center gap-2 font-medium text-[#7a5123]"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e8dbc5] text-[9px]">•</span>{hindi}</p>
                  <p className="font-semibold text-[#1c1208]">{english}</p>
                  <p className="text-sm leading-5 text-[#6e665c] transition-transform group-hover:translate-x-1">{why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Taste and pairings */}
      <section className="bg-white px-4 py-12 md:px-12 md:py-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#234622] px-6 py-10 text-white md:px-12 md:py-14">
          <div className="flex items-start gap-4">
            <span className="mt-3 h-px w-16 bg-[#b7cf82]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c7dca8]">Taste<br className="sm:hidden" /> Profile</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">स्वाद का नक्शा</h2>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/65 md:text-lg">What your tongue is about to experience — on a scale of 100</p>

          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-10">
            {[
              ['Tangy', 'खट्टा', 95, '#d5b051'],
              ['Spicy', 'तीखा', 70, '#be6e47'],
              ['Oily', 'तेलयुक्त', 60, '#dab045'],
              ['Crunch', 'कुरकुरा', 65, '#92b567'],
            ].map(([name, hindi, score, color]) => (
              <div key={name as string} className="text-center">
                <div className="relative mx-auto h-20 w-40 overflow-hidden md:h-24 md:w-48">
                  <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-t-full border-[10px] border-b-0 md:h-32 md:w-32" style={{ borderColor: color as string }} />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-3xl font-bold leading-none md:text-4xl">{score}</p>
                    <p className="mt-1 text-xs text-white/50">/100</p>
                  </div>
                </div>
                <p className="mt-4 text-lg font-medium text-[#dceac9]">{name}</p>
                <p className="mt-1 text-sm text-white/45">{hindi}</p>
              </div>
            ))}
          </div>

          <div className="my-14 h-px bg-white/10" />

          <div className="flex items-start gap-4">
            <span className="mt-3 h-px w-16 bg-[#b7cf82]" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c7dca8]">Perfect</p>
              <h3 className="text-xl font-semibold">जोड़ी</h3>
            </div>
          </div>

          <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
            {[
              ['🍛', 'लिट्टी-चोखा', 'Litti-Chokha', 'Purvanchal classic', '#b8842e'],
              ['🫓', 'सत्तू परांठा', 'Sattu Paratha', 'Bihari staple', '#d1aa37'],
              ['🍚', 'दाल-भात', 'Dal-Bhaat', 'Everyday comfort', '#86aa64'],
              ['🍲', 'खिचड़ी', 'Khichdi', 'Soul food', '#d1aa37'],
              ['🫓', 'पूरी-सब्जी', 'Poori-Sabzi', 'Sunday special', '#b8842e'],
            ].map(([icon, hindi, english, note, color]) => (
              <article key={english} className="min-w-[210px] snap-start rounded-2xl border border-white/10 bg-[#1c371b] p-5 shadow-sm" style={{ borderTopColor: color as string, borderTopWidth: 3 }}>
                <span className="text-3xl">{icon}</span>
                <h4 className="mt-5 text-xl font-semibold leading-tight">{hindi}</h4>
                <p className="mt-1 text-sm text-white/55">{english}</p>
                <span className="mt-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium" style={{ color: color as string }}>{note}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ, trust strip and WhatsApp CTA */}
      <section className="bg-[#fbfaf6] pt-16 md:pt-24">
        <div className="mx-auto max-w-[680px] px-6">
          <div className="flex items-center gap-3">
            <span className="h-px w-7 bg-[#7f9d5c]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5d7a3e]">Seedha sawaal, seedha jawaab</p>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#173518]">आपके मन की बात</h2>
          <p className="mt-2 text-sm text-[#6b6d64]">Jo puchna tha, woh yahan hai.</p>

          <div className="mt-9 border-t border-[#d9ddd0]">
            {FAQS.map(([question, answer], index) => {
              const isOpen = activeFaq === index
              return (
                <article key={question} className="border-b border-[#d9ddd0]">
                  <button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} className={`flex w-full items-center gap-3 py-[18px] text-left ${isOpen ? 'text-[#1A4E28]' : 'text-[#253b25]'}`} aria-expanded={isOpen}>
                    <span className="w-[22px] shrink-0 text-[11px] font-bold tracking-[0.06em] text-[#6d8d4b]">{String(index + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-[15px] font-medium leading-5">{question}</span>
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-xl font-light text-[#78915e]" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="ml-[22px] border-l-2 border-[#d9ddd0] pl-4 text-sm leading-6 text-[#526050]">{answer}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="mt-16 grid border-y border-[#1c371b] bg-[#234622] text-white sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['certificate', 'FSSAI Licensed', 'Lic. No. 21XXX000000XXX'],
            ['flask', 'Lab-Tested', 'Small-batch kitchen'],
            ['drop', 'Moisture-Free Packed', 'Sealed at source'],
            ['users', '100+ Families', 'Bihar · Delhi · aur aage'],
          ].map(([icon, label, sublabel], index) => (
            <div key={label} className={`flex min-h-20 items-center gap-3 border-[#1c371b] px-5 py-5 ${index % 2 === 0 ? 'border-r sm:border-r lg:border-r' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c371b] text-[#b7cf82]">
                {icon === 'certificate' && <img src="/fssai-logo-white.png" alt="FSSAI" className="h-6 w-auto object-contain" />}
                {icon === 'flask' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M9 3h6M10 3v7l-5 8a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3"/><path d="M8 15h8"/></svg>}
                {icon === 'drop' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/><path d="m4 4 16 16"/></svg>}
                {icon === 'users' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              </span>
              <span><span className="block text-[11px] font-semibold tracking-[0.01em] text-[#f4f8ec]">{label}</span><span className="mt-1 block text-[10px] text-white/45">{sublabel}</span></span>
            </div>
          ))}
        </div>


        <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:py-10 bg-[#fbfbf9] border border-[#e5e1da] rounded-3xl my-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef6ed] text-[#1a5c2a]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M12.03 2.16a9.87 9.87 0 0 0-9.87 9.87c0 1.78.47 3.52 1.36 5.06L2.16 22l5.06-1.36a9.87 9.87 0 0 0 4.81 1.25 9.87 9.87 0 0 0 9.87-9.87c0-2.63-1.02-5.11-2.88-6.97A9.82 9.82 0 0 0 12.03 2.16zm5.33 12.34c-.29.82-1.46 1.5-2.02 1.6-1.12.21-2.56-.22-4.04-1.17-2.9-1.86-4.66-4.78-4.81-4.99-.15-.21-1.18-1.57-1.18-3s.75-2.13 1.02-2.4c.27-.27.59-.34.78-.34.2 0 .39.01.56.02.18.01.42-.06.66.52.24.58.82 2.01.9 2.17.08.16.14.35.03.56-.11.21-.24.34-.38.5-.14.16-.3.36-.43.49-.15.15-.31.31-.13.62.18.3.79 1.3 1.7 2.11.78.7 1.43 1.15 1.74 1.3.31.15.49.13.68-.08.19-.21.82-.96 1.04-1.29.22-.33.44-.27.75-.16.31.11 1.96.93 2.3.1.34.17.57.25.68.46s.11 1.2-.18 2.02z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a]">Aur kuch jaanna hai?</h3>
              <p className="mt-1 text-sm text-gray-500">Hum WhatsApp par hain — seedha poochho.</p>
            </div>
          </div>
          <a 
            href="https://wa.me/918340528122" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a5c2a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#134821] shadow-sm shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12.03 2.16a9.87 9.87 0 0 0-9.87 9.87c0 1.78.47 3.52 1.36 5.06L2.16 22l5.06-1.36a9.87 9.87 0 0 0 4.81 1.25 9.87 9.87 0 0 0 9.87-9.87c0-2.63-1.02-5.11-2.88-6.97A9.82 9.82 0 0 0 12.03 2.16zm5.33 12.34c-.29.82-1.46 1.5-2.02 1.6-1.12.21-2.56-.22-4.04-1.17-2.9-1.86-4.66-4.78-4.81-4.99-.15-.21-1.18-1.57-1.18-3s.75-2.13 1.02-2.4c.27-.27.59-.34.78-.34.2 0 .39.01.56.02.18.01.42-.06.66.52.24.58.82 2.01.9 2.17.08.16.14.35.03.56-.11.21-.24.34-.38.5-.14.16-.3.36-.43.49-.15.15-.31.31-.13.62.18.3.79 1.3 1.7 2.11.78.7 1.43 1.15 1.74 1.3.31.15.49.13.68-.08.19-.21.82-.96 1.04-1.29.22-.33.44-.27.75-.16.31.11 1.96.93 2.3.1.34.17.57.25.68.46s.11 1.2-.18 2.02z" />
            </svg>
            WhatsApp par poochho
          </a>
        </div>
      </section>
    </div>
  )
}
