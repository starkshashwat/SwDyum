const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load DATABASE_URL from .env.local (checks this dir and the repo root).
function loadEnv() {
  for (const p of [
    path.resolve(__dirname, '.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '../.env'),
  ]) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL. Add it to .env.local (see .env.example).');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
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
