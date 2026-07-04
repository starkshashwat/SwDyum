const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Mohinozuku%401@db.dligrptvajjsbzlcpjsk.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT id, name, description, base_price, updated_at FROM products WHERE id = 'a0000000-0000-0000-0000-000000000001';`);
    console.log('Classic Mango Pickle details:', res.rows[0]);
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
