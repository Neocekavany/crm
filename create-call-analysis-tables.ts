/**
 * Vytvoření databázových tabulek pro AI asistenta, analýzu hovorů a učení z dat
 */

import { pool } from './server/db';

async function createCallAnalysisTables() {
  console.log('Vytvářím tabulky pro analýzu hovorů a AI asistenta...');

  try {
    // Tabulka pro kontexty probíhajících hovorů
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_call_contexts (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL,
        company_id INTEGER,
        context JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Tabulka live_call_contexts vytvořena');

    // Tabulka pro ukládání zpětné vazby k návrhům AI asistenta
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_assistant_feedback (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL,
        suggestion_id TEXT NOT NULL,
        was_helpful BOOLEAN NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Tabulka ai_assistant_feedback vytvořena');

    // Tabulka pro ukládání úspěšných případů podpory
    await pool.query(`
      CREATE TABLE IF NOT EXISTS successful_support_cases (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        client_id INTEGER,
        operator_id INTEGER,
        summary TEXT NOT NULL,
        resolution TEXT NOT NULL,
        client_feedback TEXT,
        client_satisfaction INTEGER,
        solved_at TIMESTAMP NOT NULL DEFAULT NOW(),
        duration_seconds INTEGER,
        tags TEXT[]
      )
    `);
    console.log('✅ Tabulka successful_support_cases vytvořena');

    // Tabulka pro ukládání úspěšných obchodních případů
    await pool.query(`
      CREATE TABLE IF NOT EXISTS successful_sales_cases (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        client_id INTEGER,
        salesperson_id INTEGER,
        summary TEXT NOT NULL,
        closing_strategy TEXT,
        value_proposition TEXT,
        deal_value NUMERIC(10, 2),
        closed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        duration_days INTEGER,
        tags TEXT[]
      )
    `);
    console.log('✅ Tabulka successful_sales_cases vytvořena');

    // Rozšíření tabulky call_emotion_analysis
    try {
      await pool.query(`
        ALTER TABLE call_emotion_analysis 
        ADD COLUMN IF NOT EXISTS transcript_segment TEXT,
        ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT false
      `);
      console.log('✅ Tabulka call_emotion_analysis rozšířena');
    } catch (error) {
      // Tabulka pravděpodobně ještě neexistuje, vytvoříme ji
      await pool.query(`
        CREATE TABLE IF NOT EXISTS call_emotion_analysis (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL,
          call_id INTEGER,
          company_id INTEGER,
          user_id INTEGER,
          client_id INTEGER,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          emotion VARCHAR(50) NOT NULL,
          confidence FLOAT NOT NULL,
          notes TEXT,
          transcript_segment TEXT,
          processed BOOLEAN DEFAULT false
        )
      `);
      console.log('✅ Tabulka call_emotion_analysis vytvořena');
    }

    console.log('✅ Všechny tabulky pro analýzu hovorů byly úspěšně vytvořeny.');
  } catch (error) {
    console.error('❌ Chyba při vytváření tabulek:', error);
  } finally {
    // Uzavření databázového spojení
    pool.end();
  }
}

// Spuštění vytváření tabulek
createCallAnalysisTables();