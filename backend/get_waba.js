const token = 'ba837c9425e1ecdbb03fcc1e8de9a33204b7c97552c3d779071727fab97791a1';
const phoneId = '3c81a4f48a524834747b95836a4ab79cde25750628011af854a16ea6bf090459';

async function check() {
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=name,whatsapp_business_account`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(await res.json());
}
check();
