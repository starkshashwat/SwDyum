import { useMemo } from 'react';

export default function PdpIngredients({ product }) {
  // Hero ingredient cards with unique generated images
  const HERO_INGREDIENTS = product?.pdp_config?.hero_ingredients_v2 || [
    { name: 'Langda Aam', note: 'Raw green mango', img: '/ing_mango.png' },
    { name: 'Kachi Ghani Sarson Tel', note: 'Cold-pressed mustard oil', img: '/ing_mustard_oil.png' },
    { name: 'Saunf', note: 'Fennel seeds', img: '/ing_fennel.png' },
    { name: 'Mangraila (Kalonji)', note: 'Nigella seeds', img: '/ing_nigella.png' },
    { name: 'Methi', note: 'Fenugreek seeds', img: '/ing_fenugreek.png' },
    { name: 'Hing', note: 'Asafoetida', img: '/ing_asafoetida.png' },
  ];

  // Resolve and clean the ingredient list from product config (removing Hindi prefixes if any)
  const INGREDIENTS = useMemo(() => {
    const rawList = product?.pdp_config?.tabs?.ingredients_table || product?.pdp_config?.detailed_ingredients;
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map(item => {
        if (typeof item === 'object' && item !== null) {
          const name = item.name || item.english || '';
          const why = item.reason || item.why || '';
          // Remove Hindi part if any (split by — or - or :)
          const parts = name.split(/[—\-:]/);
          const englishName = parts.length > 1 ? parts[parts.length - 1].trim() : name.trim();
          return { english: englishName, why };
        }
        return { english: String(item), why: '' };
      });
    }

    // Default detailed fallback
    return [
      { english: 'Raw Langda Mango', why: 'Sourced from Purvanchal — sharp, tangy base' },
      { english: 'Mustard Oil', why: 'Cold-pressed Kachi Ghani — bold pungency & natural preservation' },
      { english: 'Mustard Powder', why: 'Classic achaari sharpness' },
      { english: 'Fennel Seeds', why: 'Sweet, aromatic warmth' },
      { english: 'Fenugreek Powder', why: 'Signature achaari depth that balances tang' },
      { english: 'Nigella Seeds', why: 'Earthy aroma — the soul of the achaar' },
      { english: 'Carom Seeds', why: 'Warm, peppery bite' },
      { english: 'Asafoetida', why: 'That unmistakable achaar khushboo' },
      { english: 'Coriander Powder', why: 'Mellow, earthy body' },
      { english: 'Red Chilli Powder', why: 'Deep colour + measured heat' },
      { english: 'Turmeric', why: 'Golden hue & earthiness' },
      { english: 'Salt', why: 'Seasoning & natural preservation' },
      { english: 'Vinegar', why: 'Tangy zing, extends freshness' },
    ];
  }, [product]);

  const gridSpanClass = (index) => {
    if (index === 0) return 'col-span-2 min-h-80 md:col-span-6 md:row-span-2';
    if (index === 1) return 'md:col-span-6';
    if (index < 4) return 'md:col-span-3';
    return 'md:col-span-4';
  };

  const BORDER_COLORS = [
    '#c4862b', '#8b3a1a', '#5c7a3e', '#6b4f2a', '#a0522d',
    '#c8860a', '#5c7a3e', '#6b4f2a', '#8b3a1a', '#c4862b',
    '#c8860a', '#7a7a6e', '#5c7a3e',
  ];

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 font-sans text-[#1a1a1a]" style={{ fontFamily: "'Satoshi', 'Segoe UI', sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b3a1a]">Pure Ingredients</p>

        {/* Hero ingredient grid — unique images */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-3">
          {HERO_INGREDIENTS.map((item, index) => {
            const name = typeof item === 'object' ? item.name : (Array.isArray(item) ? item[0] : item);
            const note = typeof item === 'object' ? item.note : (Array.isArray(item) ? item[2] : '');
            const img = typeof item === 'object' ? item.img : '/ing_mango.png';

            return (
              <article
                key={`${name}-${index}`}
                className={`group relative min-h-48 overflow-hidden rounded-2xl bg-[#faf5ed] shadow-sm transition duration-200 hover:-translate-y-1.5 hover:shadow-xl ${gridSpanClass(index)}`}
              >
                <img
                  src={img}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                />
                <div className="relative flex h-full min-h-40 flex-col justify-between p-4">
                  <span />
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="max-w-[11rem] text-xl font-bold leading-tight text-white md:text-2xl drop-shadow-md">
                      {name}
                    </h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Full ingredient table — clean, factual */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="flex w-full items-center justify-between bg-[var(--color-bg-warm)] px-5 py-6 text-left md:px-7">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.035em] text-[#1c1208]">Ingredients</p>
              <p className="mt-2 text-sm font-medium text-[#4d4437]">{INGREDIENTS.length} Pure Ingredients. Zero shortcuts.</p>
            </div>
          </div>
          {INGREDIENTS.map((item, index) => {
            const english = typeof item === 'object' && !Array.isArray(item) ? item.english : (Array.isArray(item) ? item[1] || item[0] : String(item));
            const why = typeof item === 'object' && !Array.isArray(item) ? item.why : (Array.isArray(item) ? item[2] || '' : '');

            return (
              <details
                key={`${english}-${index}`}
                className={`group border-l-[3px] px-5 py-4 text-sm transition-colors hover:bg-[var(--cream-200)] md:px-7 ${index % 2 === 0 ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-bg)]'}`}
                style={{ borderLeftColor: BORDER_COLORS[index % BORDER_COLORS.length] }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 md:gap-5">
                  <p className="font-semibold text-[#1c1208]">{english}</p>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 flex-shrink-0 text-[#4d4437] transition-transform group-open:rotate-180">
                    <path d="M5 7l5 5 5-5" />
                  </svg>
                </summary>
                <p className="mt-2 text-sm leading-5 text-[#6e665c] transition-transform group-hover:translate-x-1">{why}</p>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
