const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Mohinozuku%401@db.dligrptvajjsbzlcpjsk.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    const sql = fs.readFileSync('create_account_deletion_table.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
