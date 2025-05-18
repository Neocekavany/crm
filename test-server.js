// Jednoduchý testovací server
import express from 'express';
import { pool } from './server/db.js';

// Správná cesta k pool by mohla být problematická, upravíme to později, pokud to bude nutné

// Vytvoření express aplikace
const app = express();

// Základní route pro ověření funkčnosti serveru
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server funguje!' });
});

// Test připojení do databáze
app.get('/api/db-test', async (req, res) => {
  try {
    // Jednoduchý SQL dotaz pro ověření
    const result = await pool.query('SELECT NOW() as time');
    
    res.json({
      success: true,
      message: 'Připojení k databázi je funkční',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Chyba při přístupu do databáze:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při přístupu do databáze',
      error: error.message
    });
  }
});

// Spustíme server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server běží na portu ${PORT}`);
});