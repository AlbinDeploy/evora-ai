import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum diisi');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  const database = drizzle(pool);
  await migrate(database, { migrationsFolder: './drizzle' });
  await pool.end();
  console.log('Database migration selesai.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
