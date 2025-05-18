import { db } from './server/db';
import { Pool } from '@neondatabase/serverless';

async function simulateCallSimple() {
  console.log('Zahajuji jednoduchou simulaci hovoru...');

  try {
    // Připojení k databázi přímo (abychom mohli použít pool.query)
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 1. Načtení operátorů a klientů z databáze
    const { rows: operators } = await pool.query('SELECT * FROM users LIMIT 5');
    if (operators.length === 0) {
      throw new Error('Nebyli nalezeni žádní operátoři!');
    }
    
    const { rows: clients } = await pool.query('SELECT * FROM clients LIMIT 10');
    if (clients.length === 0) {
      throw new Error('Nebyli nalezeni žádní klienti!');
    }
    
    // 2. Vybrat operátora a klienta pro hovor
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    
    // 3. Vytvoření aktivního hovoru
    console.log(`Vytváření hovoru: operátor ${operator.first_name} ${operator.last_name} volá klientovi ${client.first_name} ${client.last_name}`);
    
    const sessionId = `simple-${Date.now()}`;
    const startTime = new Date();
    
    // Vložení hovoru do databáze
    const callResult = await pool.query(
      `INSERT INTO live_call_sessions 
       (session_id, company_id, user_id, client_id, status, start_time, recording_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [
        sessionId,
        operator.company_id,
        operator.id,
        client.id,
        'active',
        startTime,
        'recording'
      ]
    );
    
    const callId = callResult.rows[0].id;
    console.log(`Hovor vytvořen s ID: ${callId}, sessionId: ${sessionId}`);
    
    // 4. Simulace analýzy emocí
    console.log('Simulace analýzy emocí klienta...');
    
    // Vytvoření záznamu o emocích během hovoru
    const emotions = [
      { time: 0, emotion: 'neutral', confidence: 0.85 },
      { time: 10, emotion: 'interest', confidence: 0.75 },
      { time: 20, emotion: 'confusion', confidence: 0.65 },
      { time: 30, emotion: 'interest', confidence: 0.80 },
      { time: 40, emotion: 'positive', confidence: 0.90 }
    ];
    
    for (const emotion of emotions) {
      await pool.query(
        `INSERT INTO call_emotion_analysis 
         (session_id, timestamp, emotion, confidence, notes, processed) 
         VALUES 
         ($1, $2, $3, $4, $5, $6)`,
        [
          callId,
          new Date(startTime.getTime() + emotion.time * 1000),
          emotion.emotion,
          emotion.confidence,
          `Detekovaná emoce: ${emotion.emotion} (${Math.round(emotion.confidence * 100)}%)`,
          true
        ]
      );
    }
    
    console.log('Emoce analyzovány a uloženy.');
    
    // 5. Simulace trvání hovoru a následné ukončení
    const callDuration = 45; // sekund
    console.log(`Hovor probíhá, bude trvat ${callDuration} sekund...`);
    
    // Simulace čekání (5 sekund reálného času)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 6. Ukončení hovoru
    const endTime = new Date(startTime.getTime() + callDuration * 1000);
    
    await pool.query(
      `UPDATE live_call_sessions 
       SET 
        status = $1, 
        end_time = $2, 
        duration = $3, 
        recording_status = $4,
        recording_url = $5,
        notes = $6
       WHERE id = $7`,
      [
        'completed',
        endTime,
        callDuration,
        'completed',
        `https://example.com/recordings/simulated-${sessionId}.mp3`,
        'Simulovaný testovací hovor byl úspěšně dokončen.',
        callId
      ]
    );
    
    console.log(`Hovor byl úspěšně ukončen po ${callDuration} sekundách.`);
    
    // Přidání záznamu do tabulky calls (historické hovory)
    await pool.query(
      `INSERT INTO calls 
       (user_id, client_id, start_time, end_time, duration, notes, call_type, call_status, recording_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        operator.id,
        client.id,
        startTime,
        endTime,
        callDuration,
        'Simulovaný testovací hovor',
        'outbound',
        'completed',
        `https://example.com/recordings/simulated-${sessionId}.mp3`
      ]
    );
    
    console.log('Záznam o hovoru byl přidán do historie hovorů.');
    console.log('Simulace hovoru dokončena!');
    
    // Ukončení spojení s databází
    await pool.end();
    
  } catch (error) {
    console.error('Chyba při simulaci hovoru:', error);
  }
  
  process.exit(0);
}

simulateCallSimple();