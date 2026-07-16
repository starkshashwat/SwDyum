import { useState } from 'react';

export default function PdpFaq({ faqData }) {
  const [activeFaq, setActiveFaq] = useState(0);

  const FAQS = faqData || [
    ['Isme kya-kya hai — preservative?', 'No artificial colours ya synthetic flavours. Namak, sarson tel, thoda sirka aur dhoop — yahi isse naturally fresh rakhte hain. Wahi jo daadi ke haath ka achaar karta tha.'],
    ['Kitna spicy hai?', 'Medium heat — tez nahi, phika bhi nahi. Lal mirch hai, lekin tang aur masala usse balance karta hai. Ghar ke sab log kha sakte hain.'],
    ['Kaise store karein?', 'Thandi, sookhi jagah rakhein. Hamesha sookha chammach use karein — paani andar gaya toh kharaab ho sakta hai. Tel ki parat upar bani rehne dein, woh natural seal hai.'],
    ['Fridge zaroori hai?', 'Nahi — room temperature bilkul theek hai. Fridge mein rakhne ki zaroorat nahi, actually isse oil thak jaata hai. Bas pantry ya kitchen shelf kaafi hai.'],
    ['Kaunsa aam use kiya hai?', 'Raw Langda aam — ped se seedha green plucked, Purvanchal ka pride. Isi se woh perfect khatta aata hai jo factory-made achaar mein nahi milta.'],
    ['Best kab lagta hai yeh achaar?', '3 din baad — jab masala poori tarah rach jaaye aur aam thoda aur naram ho jaaye. Pehle din bhi acha hai, teesre din magical hai.'],
    ['Kya isme fungus lag sakta hai?', 'Nahi — jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai. Bas ek kaam aap karein: sookha chammach use karein aur tel ki parat upar rehne dein.'],
  ];

  return (
    <section className="bg-[#fbfaf6] pt-16 md:pt-24 font-sans" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      <div className="mx-auto max-w-[680px] px-6">
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-[#7f9d5c]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5d7a3e]">Seedha sawaal, seedha jawaab</p>
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#173518]">आपके मन की बात</h2>
        <p className="mt-2 text-sm text-[#6b6d64]">Jo puchna tha, woh yahan hai.</p>

        <div className="mt-9 border-t border-[#d9ddd0]">
          {FAQS.map((faqItem, index) => {
            const question = Array.isArray(faqItem) ? faqItem[0] : (faqItem.q || faqItem.question);
            const answer = Array.isArray(faqItem) ? faqItem[1] : (faqItem.a || faqItem.answer);
            const isOpen = activeFaq === index;

            return (
              <article key={question} className="border-b border-[#d9ddd0]">
                <button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} className={`flex w-full items-center gap-3 py-[18px] text-left ${isOpen ? 'text-[#2d5a27]' : 'text-[#253b25]'}`} aria-expanded={isOpen}>
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
            );
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

      <div className="mx-auto flex max-w-[680px] flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between md:py-16">
        <div><h3 className="text-xl font-semibold text-[#173518]">Aur kuch jaanna hai?</h3><p className="mt-1 text-sm text-[#6b6d64]">Hum WhatsApp par hain — seedha poochho.</p></div>
        <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2d5a27] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f3f1b]"><span aria-hidden="true">💬</span> WhatsApp par poochho</a>
      </div>
    </section>
  );
}
