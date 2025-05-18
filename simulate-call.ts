import { db } from './server/db';
import { clients, users, liveCallSessions, callEmotionAnalysis } from './shared/schema';
import { eq } from 'drizzle-orm';

async function simulateCall() {
  console.log('Zahajuji simulaci hovoru...');
  
  try {
    // 1. Získání operátorů a klientů pro simulaci hovoru
    const operators = await db.select().from(users).limit(5);
    if (operators.length === 0) {
      throw new Error('Nebyli nalezeni žádní operátoři!');
    }
    
    const allClients = await db.select().from(clients).limit(10);
    if (allClients.length === 0) {
      throw new Error('Nebyli nalezeni žádní klienti!');
    }
    
    // 2. Vybrat operátora a klienta pro hovor
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const client = allClients[Math.floor(Math.random() * allClients.length)];
    
    // 3. Vytvoření aktivního hovoru
    console.log(`Vytváření hovoru: operátor ${operator.firstName} ${operator.lastName} volá klientovi ${client.firstName} ${client.lastName}`);
    
    const sessionId = `sim-${Date.now()}`;
    const startTime = new Date();
    
    // Vložení záznamu o hovoru pomocí SQL
    const result = await db.execute(
      `INSERT INTO live_call_sessions 
      (session_id, company_id, user_id, client_id, status, start_time, recording_status) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        sessionId,
        operator.companyId || 0,
        operator.id,
        client.id,
        'active',
        startTime,
        'recording'
      ]
    );
    
    const callSession = { id: result.rows[0].id, sessionId };
    
    console.log(`Hovor vytvořen s ID: ${callSession.id}, sessionId: ${sessionId}`);
    
    // 4. Simulace analýzy emocí
    console.log('Simulace analýzy emocí klienta...');
    const emotions = [
      { time: 0, emotion: 'neutral', confidence: 0.85 },
      { time: 10, emotion: 'interest', confidence: 0.75 },
      { time: 20, emotion: 'confusion', confidence: 0.65 },
      { time: 30, emotion: 'interest', confidence: 0.80 },
      { time: 40, emotion: 'positive', confidence: 0.90 }
    ];
    
    // Vložit emoce do databáze
    for (const emotion of emotions) {
      await db.execute(
        `INSERT INTO call_emotion_analysis 
        (session_id, timestamp, emotion, confidence, notes, processed) 
        VALUES 
        ($1, $2, $3, $4, $5, $6)`,
        [
          callSession.id,
          new Date(startTime.getTime() + emotion.time * 1000),
          emotion.emotion,
          emotion.confidence,
          `Detekovaná emoce: ${emotion.emotion} (${emotion.confidence * 100}%)`,
          true
        ]
      );
    }
    
    console.log('Emoce analyzovány a uloženy.');
    
    // 5. Počkejme chvíli, než hovor ukončíme (simulujeme trvání hovoru)
    const callDuration = 45; // v sekundách
    console.log(`Hovor probíhá, bude trvat ${callDuration} sekund...`);
    
    // Simulace čekání
    await new Promise(resolve => setTimeout(resolve, 5000)); // Počkáme 5 sekund v reálném čase
    
    // 6. Ukončení hovoru
    const endTime = new Date(startTime.getTime() + callDuration * 1000);
    await db.execute(
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
        callSession.id
      ]
    );
    
    console.log(`Hovor byl úspěšně ukončen po ${callDuration} sekundách.`);
    console.log('Simulace hovoru dokončena!');
    
  } catch (error) {
    console.error('Chyba při simulaci hovoru:', error);
  }
  
  process.exit(0);
}

simulateCall();