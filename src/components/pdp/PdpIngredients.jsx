export default function PdpIngredients({ product }) {
  // Use product-specific config if available, otherwise fallback to the Mango Pickle design data
  const HERO_INGREDIENTS = product?.pdp_config?.hero_ingredients || [
    ['Langda Aam', 'आम', 'khatta + Vitamin C'],
    ['Kachi Ghani Sarson Tel', 'सरसों तेल', 'cold-pressed purity'],
    ['Saunf', 'सौंफ', 'digestion ✓'],
    ['Mangraila (Kalonji)', 'मंगरैला', 'soul of the achaar'],
    ['Methi', 'मेथी', 'achaari depth'],
    ['Hing', 'हींग', 'the achaar khushboo'],
  ];

  const INGREDIENTS = product?.pdp_config?.detailed_ingredients || product?.pdp_config?.pure_ingredients || [
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
  ];

  const productImg = product?.image || '/product_image.png';

  return (
    <section className="bg-[#f7f1e6] px-6 py-16 md:px-12 md:py-24 font-sans text-[#1a1a1a]" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b3a1a]">Pure Ingredients</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-3">
          {HERO_INGREDIENTS.map(([name, hindi, note], index) => (
            <article key={name} className={`group relative min-h-48 overflow-hidden rounded-2xl bg-[#1c1208] p-4 text-white shadow-sm transition duration-200 hover:-translate-y-1.5 hover:shadow-xl ${index === 0 ? 'col-span-2 min-h-80 md:col-span-6 md:row-span-2' : index === 1 ? 'md:col-span-6' : index < 4 ? 'md:col-span-3' : 'md:col-span-4'}`}>
              <img src={product?.images?.[index] || productImg} alt={name} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105" />
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
            <p className="mt-4 text-sm font-medium text-[#4d4437]">{INGREDIENTS.length} Pure Ingredients. Zero shortcuts.</p>
          </div>
          <div>
            {INGREDIENTS.map((item, index) => {
              const hindi = Array.isArray(item) ? item[0] : '';
              const english = Array.isArray(item) ? item[1] : (item.name || item);
              const why = Array.isArray(item) ? item[2] : (item.description || '');

              return (
                <div key={english} className={`group grid gap-2 border-l-[3px] px-5 py-4 text-sm transition-colors hover:bg-[#ede4d4] md:grid-cols-[1fr_0.9fr_1.35fr] md:items-center md:gap-5 md:px-7 ${index % 2 === 0 ? 'bg-[#fafaf7]' : 'bg-[#f5f0e8]'}`} style={{ borderLeftColor: ['#c4862b', '#8b3a1a', '#8b3a1a', '#5c7a3e', '#6b4f2a', '#6b4f2a', '#a0522d', '#6b4f2a', '#5c7a3e', '#c8860a', '#c8860a', '#7a7a6e', '#c4862b'][index % 13] }}>
                  <p className="flex items-center gap-2 font-medium text-[#7a5123]"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#e8dbc5] text-[9px]">•</span>{hindi}</p>
                  <p className="font-semibold text-[#1c1208]">{english}</p>
                  <p className="text-sm leading-5 text-[#6e665c] transition-transform group-hover:translate-x-1">{why}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
