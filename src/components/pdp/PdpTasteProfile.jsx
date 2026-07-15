export default function PdpTasteProfile({ tasteProfile, pairings }) {
  const profileData = tasteProfile || [
    ['Tangy', 'खट्टा', 95, '#d5b051'],
    ['Spicy', 'तीखा', 70, '#be6e47'],
    ['Oily', 'तेलयुक्त', 60, '#dab045'],
    ['Crunch', 'कुरकुरा', 65, '#92b567'],
  ];

  const pairingsData = pairings || [
    ['🍛', 'लिट्टी-चोखा', 'Litti-Chokha', 'Purvanchal classic', '#b8842e'],
    ['🫓', 'सत्तू परांठा', 'Sattu Paratha', 'Bihari staple', '#d1aa37'],
    ['🍚', 'दाल-भात', 'Dal-Bhaat', 'Everyday comfort', '#86aa64'],
    ['🍲', 'खिचड़ी', 'Khichdi', 'Soul food', '#d1aa37'],
    ['🫓', 'पूरी-सब्जी', 'Poori-Sabzi', 'Sunday special', '#b8842e'],
  ];

  return (
    <section className="bg-white px-4 py-12 md:px-12 md:py-20 font-sans" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
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
          {profileData.map(([name, hindi, score, color]) => (
            <div key={name} className="text-center">
              <div className="relative mx-auto h-20 w-40 overflow-hidden md:h-24 md:w-48">
                <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-t-full border-[10px] border-b-0 md:h-32 md:w-32" style={{ borderColor: color }} />
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
          {pairingsData.map(([icon, hindi, english, note, color]) => (
            <article key={english} className="min-w-[210px] snap-start rounded-2xl border border-white/10 bg-[#1c371b] p-5 shadow-sm" style={{ borderTopColor: color, borderTopWidth: 3 }}>
              <span className="text-3xl">{icon}</span>
              <h4 className="mt-5 text-xl font-semibold leading-tight">{hindi}</h4>
              <p className="mt-1 text-sm text-white/55">{english}</p>
              <span className="mt-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium" style={{ color: color }}>{note}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
