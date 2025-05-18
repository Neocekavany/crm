import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function createLiveCallSessionsTable() {
  try {
    console.log('Creating live_call_sessions table...');
    
    // Kontrola, zda tabulka již existuje
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'live_call_sessions'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Table live_call_sessions already exists.');
      return;
    }
    
    // Vytvoření tabulky
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS live_call_sessions (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        call_id INTEGER,
        session_id TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active',
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        recording_status TEXT DEFAULT 'not_started',
        recording_url TEXT,
        monitored_by INTEGER,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (call_id) REFERENCES calls(id),
        FOREIGN KEY (monitored_by) REFERENCES users(id)
      );
    `);
    
    console.log('Table live_call_sessions created successfully!');
    
    // Vložení ukázkových dat
    await db.execute(sql`
      -- Vložení aktivních hovorů
      INSERT INTO live_call_sessions (company_id, user_id, client_id, session_id, status, recording_status, start_time)
      VALUES
      (1, 3, 1, 'session-111', 'active', 'recording', NOW() - INTERVAL '5 minutes'),
      (1, 3, 2, 'session-222', 'active', 'recording', NOW() - INTERVAL '15 minutes');

      -- Vložení dokončených hovorů
      INSERT INTO live_call_sessions (company_id, user_id, client_id, session_id, status, recording_status, recording_url, start_time, end_time)
      VALUES
      (1, 3, 3, 'session-333', 'completed', 'completed', 'https://example.com/recordings/call-333.mp3', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 45 minutes'),
      (1, 2, 1, 'session-444', 'completed', 'completed', 'https://example.com/recordings/call-444.mp3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours'),
      (1, 2, 2, 'session-555', 'completed', 'failed', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 23 hours');
    `);
    
    console.log('Demo data inserted successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

createLiveCallSessionsTable();