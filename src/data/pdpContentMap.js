export const pdpContentMap = {
  'mango-pickle': {
    short_description: 'आम का अचार, ghar jaisa. Raw Langda mangoes plucked green straight from the tree, sun-cured and rested in cold-pressed Kachi Ghani mustard oil — small-batch, seedha Ara, Bihar se.',
    
    tabs: {
      description: 'Har Bihari ghar mein ek martaban hota hai jiski khushboo poore aangan mein bas jaati hai — that jar is what we bottled. Made the way our family has always made it in Ara, Bhojpur: raw Langda aam, ped se seedha plucked green, hand-cut and dhoop mein pakaya (sun-cured), then rested in cold-pressed Kachi Ghani mustard oil with a slow-ground masala of saunf, methi, mangraila aur hing. No artificial colours, no synthetic flavours — bas dhoop, tel aur purani reet. Tangy, bold, and just-oily-enough, it turns a plain dal-bhaat into a proper meal. Chhote batches mein banaya, taaki har jar mein wahi ghar wala swaad rahe.',
      ingredients_table: [
        { name: 'आम — Raw Langda Mango', reason: "Purvanchal's pride, plucked green off the tree — perfect khatta + Vitamin C" },
        { name: 'सरसों तेल — Mustard Oil', reason: 'Cold-pressed Kachi Ghani; bold pungency + natural preservation' },
        { name: 'सरसों पाउडर — Mustard powder', reason: 'The classic achaari sharpness' },
        { name: 'सौंफ — Fennel seeds', reason: 'Sweet, aromatic; aids digestion' },
        { name: 'मेथी पाउडर — Fenugreek powder', reason: 'Signature achaari depth that balances the tang' },
        { name: 'मंगरैला (कलौंजी) — Nigella seeds', reason: 'Earthy aroma — the soul of the achaar' },
        { name: 'अजवाइन — Carom seeds', reason: 'Warm & digestive; cuts through the oil' },
        { name: 'हींग — Asafoetida', reason: 'That unmistakable achaar khushboo + digestion' },
        { name: 'धनिया पाउडर — Coriander powder', reason: 'Mellow, earthy body' },
        { name: 'लाल मिर्ची पाउडर — Red chilli powder', reason: 'Deep colour + measured heat' },
        { name: 'हल्दी पाउडर — Turmeric', reason: 'Golden hue + everyday immunity' },
        { name: 'नमक — Salt', reason: 'Seasoning + natural preservation' },
        { name: 'सिरका — Vinegar', reason: 'A tangy zing that also keeps every jar fresh longer' },
      ],
      storage: 'Thandi sookhi jagah, hamesha sookha chammach. Tel ki parat upar bani rehne dein. Room temp theek hai, fridge zaroori nahi.',
    },
    
    pure_ingredients: [
      { name: 'Langda Aam', img: '/cat_mango.webp' },
      { name: 'Kachi Ghani Sarson Tel', img: '/cat_garlic.webp' }, // using existing images for now
      { name: 'Saunf', img: '/cat_lemon.webp' },
      { name: 'Mangraila (Kalonji)', img: '/cat_chilli.webp' },
      { name: 'Methi', img: '/cat_mango.webp' },
    ],

    taste_profile: {
      metrics: [
        { label: 'Tangy', level: 95 },
        { label: 'Spicy', level: 70 },
        { label: 'Oil Level', level: 60 },
        { label: 'Crunch', level: 65 },
      ],
      pairings: [
        { name: 'Litti-Chokha' },
        { name: 'Sattu Paratha' },
        { name: 'Dal-Bhaat' },
        { name: 'Khichdi' },
        { name: 'Poori-Sabzi' }
      ]
    },

    faq: [
      { q: 'Isme kya-kya hai — preservative?', a: 'No artificial colours ya synthetic flavours. Namak, sarson tel, thoda sirka aur dhoop — yahi isse naturally fresh rakhte hain.' },
      { q: 'Kitna spicy hai?', a: 'Medium' },
      { q: 'Kaise store karein?', a: 'Thandi sookhi jagah, hamesha sookha chammach. Tel ki parat upar bani rehne dein.' },
      { q: 'Fridge zaroori?', a: 'Nahi, room temp theek hai.' },
      { q: 'Kaunsa aam?', a: 'Raw Langda aam, ped se seedha green plucked — for that perfect khatta.' },
      { q: 'Best kab lagta hai?', a: '3 din baad, jab masala poori tarah rach jaaye.' },
      { q: 'Kya isme fungus lag sakta hai?', a: 'Nahi, jab tak nami na jaaye. Jar humidity-controlled kitchen mein moisture-free seal hota hai — bas aap sookha chammach use karein aur tel ki parat upar rehne dein.' },
    ]
  }
};
