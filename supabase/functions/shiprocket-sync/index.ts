import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";

const SHIPROCKET_WH_PRODUCT = 'https://checkout-api.shiprocket.com/wh/v1/custom/product';
const SHIPROCKET_WH_COLLECTION = 'https://checkout-api.shiprocket.com/wh/v1/custom/collection';

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Fetch and format a product
async function syncProduct(productId: string, supabase: any, apiKey: string, secretKey: string) {
  const { data: p, error } = await supabase
    .from('products')
    .select('*, product_images(url, is_primary, display_order), product_variants(*)')
    .eq('id', productId)
    .single();

  if (error || !p) {
    console.error('Failed to fetch product for sync:', error);
    return;
  }

  const productPayload = {
    id: p.id,
    title: p.name,
    body_html: p.description,
    status: p.is_active ? 'active' : 'draft',
    created_at: p.created_at,
    updated_at: p.updated_at,
    vendor: 'Swadyum',
    product_type: 'Pickles',
    handle: p.slug,
    images: p.product_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any, i: number) => ({
      id: `img_${i}_${p.id}`,
      product_id: p.id,
      position: i + 1,
      src: img.url
    })) || [],
    variants: p.product_variants?.map((v: any, i: number) => ({
      id: v.id,
      product_id: p.id,
      title: v.weight_label,
      price: v.price,
      sku: v.sku || `SWD-${p.slug.substring(0, 5).toUpperCase()}-${v.weight_label}`,
      position: i + 1,
      inventory_policy: 'deny',
      compare_at_price: v.mrp,
      inventory_quantity: v.stock_quantity,
      weight: parseFloat(v.weight_label) || 0,
      weight_unit: (v.weight_label || '').toLowerCase().includes('kg') ? 'kg' : 'g',
      requires_shipping: true
    })) || []
  };

  const payloadStr = JSON.stringify(productPayload);
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadStr));
  const hmac = arrayBufferToBase64(signature);

  const res = await fetch(SHIPROCKET_WH_PRODUCT, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-HMAC-SHA256': hmac
    },
    body: payloadStr
  });
  
  if (res.ok) console.log(`✅ Product ${productId} synced to Shiprocket successfully.`);
  else console.error(`❌ Shiprocket product sync failed:`, await res.text());
}

// Fetch and format a collection
async function syncCollection(categoryId: string, supabase: any, apiKey: string, secretKey: string) {
  const { data: c, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();
    
  if (error || !c) {
    console.error('Failed to fetch category for sync:', error);
    return;
  }

  const collectionPayload = {
    id: c.id,
    handle: c.slug,
    title: c.name,
    updated_at: c.updated_at,
    body_html: c.description,
    published_at: c.created_at,
    sort_order: 'manual',
    image: { src: c.banner_url }
  };

  const payloadStr = JSON.stringify(collectionPayload);
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadStr));
  const hmac = arrayBufferToBase64(signature);

  const res = await fetch(SHIPROCKET_WH_COLLECTION, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-HMAC-SHA256': hmac
    },
    body: payloadStr
  });
  
  if (res.ok) console.log(`✅ Collection ${categoryId} synced to Shiprocket successfully.`);
  else console.error(`❌ Shiprocket collection sync failed:`, await res.text());
}

serve(async (req) => {
  try {
    const payload = await req.json();

    const apiKey = Deno.env.get('FASTRR_API_KEY');
    const secretKey = Deno.env.get('FASTRR_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!apiKey || !secretKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response('Missing required environment variables', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Identify what was changed based on the Database Webhook payload
    const table = payload.table;
    const record = payload.type === 'DELETE' ? payload.old_record : payload.record;

    if (!record) {
      return new Response('No record found in payload', { status: 400 });
    }

    if (table === 'products') {
      await syncProduct(record.id, supabase, apiKey, secretKey);
    } else if (table === 'product_variants' || table === 'product_images') {
      await syncProduct(record.product_id, supabase, apiKey, secretKey);
    } else if (table === 'categories') {
      await syncCollection(record.id, supabase, apiKey, secretKey);
    } else {
      console.warn(`Unrecognized table sync: ${table}`);
    }

    return new Response('Sync processed successfully', { status: 200 });
  } catch (err: any) {
    console.error('❌ Sync Webhook Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
