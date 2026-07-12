const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load DATABASE_URL from .env.local (zero-dependency loader). Never hardcode
// database credentials in committed files.
function loadEnv() {
  for (const p of [path.resolve(__dirname, '.env.local'), path.resolve(__dirname, '.env')]) {
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
    console.log('Connected to database.');
    const sql = fs.readFileSync('migrations/seed_products.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
