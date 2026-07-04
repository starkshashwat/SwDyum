const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Mohinozuku%401@db.dligrptvajjsbzlcpjsk.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    const categories = [
      { name: 'Pickle', slug: 'pickle' },
      { name: 'Murabba', slug: 'murabba' },
      { name: 'Snacks', slug: 'snacks' }
    ];

    // Ensure categories exist
    for (const cat of categories) {
      const res = await client.query(`
        INSERT INTO categories (name, slug) 
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE SET name = $1
        RETURNING id
      `, [cat.name, cat.slug]);
      cat.id = res.rows[0].id;
    }

    const items = [
      { name: 'Mango Pickle', catSlug: 'pickle' },
      { name: 'Amla Pickle', catSlug: 'pickle' },
      { name: 'Kathal Pickle', catSlug: 'pickle' },
      { name: 'Oal Pickle', catSlug: 'pickle' },
      { name: 'Garlic Pickle', catSlug: 'pickle' },
      
      { name: 'Amla Murabba', catSlug: 'murabba' },
      { name: 'Mango Murabba', catSlug: 'murabba' },
      
      { name: 'Tisauri', catSlug: 'snacks' },
      { name: 'Chaurauri', catSlug: 'snacks' }
    ];

    for (const item of items) {
      const slug = item.name.toLowerCase().replace(/ /g, '-');
      const catId = categories.find(c => c.slug === item.catSlug).id;

      // Insert product
      const res = await client.query(`
        INSERT INTO products (name, slug, category_id, base_price, is_active, is_bestseller)
        VALUES ($1, $2, $3, $4, true, false)
        ON CONFLICT (slug) DO UPDATE SET category_id = $3, base_price = $4
        RETURNING id
      `, [item.name, slug, catId, 299]);

      const productId = res.rows[0].id;

      // Insert Variants
      const variants = [
        { weight: '250g', price: 299 },
        { weight: '500g', price: 599 },
        { weight: '1kg', price: 899 }
      ];

      for (const v of variants) {
        // We can use a unique sku to prevent duplicates, or just delete existing variants and re-insert
        await client.query(`DELETE FROM product_variants WHERE product_id = $1`, [productId]);
        
        for (const v of variants) {
          const sku = `${slug}-${v.weight}`;
          await client.query(`
            INSERT INTO product_variants (product_id, weight_label, price, sku, stock_quantity)
            VALUES ($1, $2, $3, $4, 100)
            ON CONFLICT (sku) DO UPDATE SET price = $3
          `, [productId, v.weight, v.price, sku]);
        }
      }
      console.log(`Added ${item.name} with variants!`);
    }

    console.log('Finished inserting products.');
  } catch (err) {
    console.error('Error inserting:', err);
  } finally {
    await client.end();
  }
}

run();
