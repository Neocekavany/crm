import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Setup WebSocket for Neon
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Running migrations...');

  // This will create all tables defined in the schema
  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('Migrations completed successfully!');
  
  await pool.end();
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});