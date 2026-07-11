const IMG = '../../assets/imagery/';

const PRODUCTS = [
  {
    id: 1, slug: 'mango-pickle', name: 'Aam Ka Achar', en: 'Traditional Mango Pickle',
    tagline: 'Raw mangoes picked straight from the tree, sun-dried & spice-rested.',
    image: IMG + 'prod-mango.webp', gallery: [IMG + 'prod-mango.webp', IMG + 'making_mango.webp', IMG + 'process_suncured.webp'],
    rating: 4.8, reviewsCount: 132, badge: 'bestseller', spice: 2,
    prices: { '250g': 299, '500g': 549, '1kg': 899 }, mrps: { '250g': 399, '500g': 749, '1kg': 1199 },
    ingredients: ['Raw mango', 'Mustard oil', 'Fennel', 'Fenugreek', 'Nigella seeds', 'Turmeric', 'Red chilli', 'Rock salt'],
    nutrition: [['Energy', '112 kcal'], ['Fat', '9 g'], ['Carbs', '6 g'], ['Protein', '1 g'], ['Sodium', '620 mg']],
    pairs: ['dal-tadka', 'stuffed-paratha'],
  },
  {
    id: 2, slug: 'garlic-pickle', name: 'Lehsun Ka Achar', en: 'Bold Garlic Pickle',
    tagline: 'Whole garlic cloves, slow-rested in ground spices & mustard oil.',
    image: IMG + 'prod_garlic.webp', gallery: [IMG + 'prod_garlic.webp', IMG + 'making_garlic.webp', IMG + 'process_mixing.webp'],
    rating: 4.7, reviewsCount: 88, badge: 'spicy', spice: 3,
    prices: { '250g': 249, '500g': 459 }, mrps: { '250g': 329, '500g': 599 },
    ingredients: ['Garlic', 'Mustard oil', 'Cumin', 'Carom seeds', 'Turmeric', 'Red chilli', 'Rock salt'],
    nutrition: [['Energy', '128 kcal'], ['Fat', '11 g'], ['Carbs', '5 g'], ['Protein', '2 g'], ['Sodium', '580 mg']],
    pairs: ['dal-tadka', 'paneer-masala'],
  },
  {
    id: 3, slug: 'lemon-pickle', name: 'Nimbu Ka Achar', en: 'Tangy Lemon Pickle',
    tagline: 'Sun-ripened lemons, cut fresh and cured in the open sun.',
    image: IMG + 'prod_lemon.webp', gallery: [IMG + 'prod_lemon.webp', IMG + 'making_lemon.webp', IMG + 'process_aging.webp'],
    rating: 4.9, reviewsCount: 64, spice: 1,
    prices: { '250g': 279, '500g': 499 }, mrps: { '250g': 359, '500g': 649 },
    ingredients: ['Lemon', 'Mustard oil', 'Black salt', 'Fennel', 'Turmeric', 'Red chilli'],
    nutrition: [['Energy', '96 kcal'], ['Fat', '7 g'], ['Carbs', '8 g'], ['Protein', '1 g'], ['Sodium', '710 mg']],
    pairs: ['lemon-rice', 'dal-tadka'],
  },
  {
    id: 4, slug: 'chilli-pickle', name: 'Hari Mirch Ka Achar', en: 'Green Chilli Pickle',
    tagline: 'Fresh green chillies for people who like it seriously hot.',
    image: IMG + 'prod_chili.webp', gallery: [IMG + 'prod_chili.webp', IMG + 'making_chilli.webp', IMG + 'process_grinding.webp'],
    rating: 4.6, reviewsCount: 45, badge: 'new', spice: 3,
    prices: { '250g': 259 }, mrps: { '250g': 339 },
    ingredients: ['Green chilli', 'Mustard oil', 'Mustard seeds', 'Fennel', 'Turmeric', 'Rock salt'],
    nutrition: [['Energy', '104 kcal'], ['Fat', '9 g'], ['Carbs', '4 g'], ['Protein', '1 g'], ['Sodium', '540 mg']],
    pairs: ['stuffed-paratha', 'paneer-masala'],
  },
];

const RECIPES = [
  { slug: 'dal-tadka', title: 'Dal Tadka + Aam Ka Achar', time: '30 min', image: IMG + 'recipe_dal.webp', desc: 'Comfort dal with a spoon of mango pickle stirred through the tadka.' },
  { slug: 'paneer-masala', title: 'Paneer Masala with Lehsun Achar', time: '40 min', image: IMG + 'recipe_paneer.webp', desc: 'Garlic pickle oil doubles as the base masala for this rich paneer.' },
  { slug: 'lemon-rice', title: 'Nimbu Achar Lemon Rice', time: '20 min', image: IMG + 'recipe_lemon.webp', desc: 'Day-old rice, curry leaves, and chopped lemon pickle. Done.' },
  { slug: 'stuffed-paratha', title: 'Stuffed Paratha + Hari Mirch', time: '35 min', image: IMG + 'recipe_paratha.webp', desc: 'Aloo paratha with a fiery bite of green chilli pickle on the side.' },
];

const PROCESS_STEPS = [
  { icon: 'tree', title: 'Picked from the tree', desc: 'We buy raw fruit straight off the tree — never from cold storage.', image: IMG + 'process_sourcing.webp' },
  { icon: 'droplet', title: 'Washed & cut fresh', desc: 'Washed, hand-cut the same day so nothing loses its bite.', image: IMG + 'process_grinding.webp' },
  { icon: 'sun', title: 'Dried in the open sun', desc: 'Pieces are sun-dried in open air — the old way, no machines.', image: IMG + 'process_suncured.webp' },
  { icon: 'jar', title: 'Spiced & rested', desc: 'Hand-mixed with ground spices and rested for days to deepen flavour.', image: IMG + 'process_mixing.webp' },
  { icon: 'shield', title: 'Finished & sealed', desc: 'Finished with mustard oil & whole spices, sealed in moisture-proof jars.', image: IMG + 'process_aging.webp' },
];

const REVIEWS = [
  { name: 'Priya Sharma', city: 'Delhi', rating: 5, text: 'Exactly like my nani used to make in Patna. The mango pieces still have crunch — you can taste the sun in it.', image: IMG + 'gal_cut.webp' },
  { name: 'Rohit Verma', city: 'Bengaluru', rating: 5, text: 'Ordered the combo box for my flat. Three jars, three moods. The garlic one is dangerously good.', image: IMG + 'gal_mix.webp' },
  { name: 'Anita Kumari', city: 'Mumbai', rating: 4, text: 'Subscribed for the monthly jar. Every month feels like a parcel from home.', image: null },
];

const TRUST_ITEMS = [
  { icon: 'tree', text: 'Picked From The Tree' },
  { icon: 'sun', text: 'Open-Sun Dried' },
  { icon: 'shield', text: 'No Preservatives' },
  { icon: 'truck', text: 'Pan-India Delivery' },
  { icon: 'check', text: 'FSSAI Approved' },
  { icon: 'heart', text: 'Handcrafted in Ara, Bihar' },
];

const COMBO_PRICE = 749;   // any 3 × 250g jars
const COMBO_MRP = 837;
const SUB_PRICE = 349;     // monthly seasonal jar

window.PRODUCTS = PRODUCTS;
window.RECIPES = RECIPES;
window.PROCESS_STEPS = PROCESS_STEPS;
window.REVIEWS = REVIEWS;
window.TRUST_ITEMS = TRUST_ITEMS;
window.COMBO_PRICE = COMBO_PRICE;
window.COMBO_MRP = COMBO_MRP;
window.SUB_PRICE = SUB_PRICE;
