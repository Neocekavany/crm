// Test připojení k databázi
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Konfigurace pro neondb
neonConfig.webSocketConstructor = ws;

// Připojení k databázi
async function testDatabaseConnection() {
  console.log('Testování připojení k databázi...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Nastaveno (hodnota skryta)' : 'Nenastaveno');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL není nastaveno');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test připojení
    const result = await pool.query('SELECT NOW() as time');
    console.log('Připojení úspěšné!');
    console.log('Aktuální čas v databázi:', result.rows[0].time);
    
    // Zkusíme vytvořit sessions tabulku (pro případ, že chybí)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        )
      `);
      console.log('Tabulka session existuje nebo byla vytvořena');
    } catch (sessionErr) {
      console.error('Chyba při vytváření tabulky session:', sessionErr.message);
    }
    
    // Zavřeme připojení
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Chyba při připojení k databázi:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return false;
  }
}

// Spustíme test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Test dokončen úspěšně');
    } else {
      console.log('Test selhal');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Neočekávaná chyba:', err);
    process.exit(1);
  });