import { useMemo } from 'react';

export default function PdpTasteProfile({ tasteProfile, pairings }) {
  const profileData = useMemo(() => {
    if (Array.isArray(tasteProfile)) return tasteProfile;
    if (tasteProfile?.metrics && Array.isArray(tasteProfile.metrics)) {
      const hindis = {
        'Tangy': 'खट्टा',
        'Spicy': 'तीखा',
        'Oil Level': 'तेलयुक्त',
        'Oily': 'तेलयुक्त',
        'Crunch': 'कुरकुरा'
      };
      return tasteProfile.metrics.map(m => [
        m.label,
        hindis[m.label] || '',
        m.level
      ]);
    }
    return [
      ['Tangy', 'खट्टा', 95],
      ['Spicy', 'तीखा', 70],
      ['Oily', 'तेलयुक्त', 60],
      ['Crunch', 'कुरकुरा', 65],
    ];
  }, [tasteProfile]);

  const pairingsData = useMemo(() => {
    if (Array.isArray(pairings)) return pairings;
    if (tasteProfile?.pairings && Array.isArray(tasteProfile.pairings)) {
      const trans = {
        'Litti-Chokha': ['🍛', 'लिट्टी-चोखा', 'Litti-Chokha', 'Purvanchal classic'],
        'Sattu Paratha': ['🫓', 'सत्तू परांठा', 'Sattu Paratha', 'Bihari staple'],
        'Dal-Bhaat': ['🍚', 'दाल-भात', 'Dal-Bhaat', 'Everyday comfort'],
        'Khichdi': ['🍲', 'खिचड़ी', 'Khichdi', 'Soul food'],
        'Poori-Sabzi': ['🫓', 'पूरी-सब्जी', 'Poori-Sabzi', 'Sunday special'],
      };
      return tasteProfile.pairings.map(p => {
        const name = typeof p === 'string' ? p : p.name;
        if (trans[name]) {
          return trans[name];
        }
        return ['🍽️', name, name, 'Perfect pairing'];
      });
    }
    return [
      ['🍛', 'लिट्टी-चोखा', 'Litti-Chokha', 'Purvanchal classic'],
      ['🫓', 'सत्तू परांठा', 'Sattu Paratha', 'Bihari staple'],
      ['🍚', 'दाल-भात', 'Dal-Bhaat', 'Everyday comfort'],
      ['🍲', 'खिचड़ी', 'Khichdi', 'Soul food'],
      ['🫓', 'पूरी-सब्जी', 'Poori-Sabzi', 'Sunday special'],
    ];
  }, [pairings, tasteProfile]);

  return (
    <section className="bg-white px-6 py-16 md:px-12 md:py-24 font-sans text-[#1a1a1a]" style={{ fontFamily: "'Satoshi', 'Segoe UI', sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          
          {/* Left: Taste Profile */}
          <div className="bg-[#fcfbf9] border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <span className="mt-3 h-px w-12 bg-[#1A4E28]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A4E28]">Taste Profile</p>
                <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-[-0.035em] text-[#1a1a1a]">स्वाद का नक्शा</h2>
                <p className="mt-2 text-sm text-gray-500">What your tongue is about to experience</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {profileData.map(([name, hindi, score]) => {
                const label = score >= 90 ? `Very ${name}` : score >= 70 ? `Medium-High` : score >= 50 ? `Medium` : `Mild`;
                return (
                  <div key={name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-gray-900">{name} <span className="text-gray-400 font-normal text-xs ml-1">({hindi})</span></span>
                      <span className="text-xs font-bold text-gray-400">{label}</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1A4E28] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Perfect Pairings */}
          <div>
            <div className="flex items-start gap-4 mb-8">
              <span className="mt-3 h-px w-12 bg-[#c4862b]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c4862b]">Perfect Pairings</p>
                <h3 className="mt-1 text-2xl md:text-3xl font-semibold text-[#1a1a1a]">परफेक्ट जोड़ी</h3>
                <p className="mt-2 text-sm text-gray-500">The best ways to enjoy our achar</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {pairingsData.map(([icon, hindi, english, note], idx) => (
                <div key={english} className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#f9faf7] flex items-center justify-center text-2xl flex-shrink-0">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{english} <span className="text-gray-400 font-normal ml-1">({hindi})</span></h4>
                    <p className="text-sm text-gray-500 mt-0.5">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
