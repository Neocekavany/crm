/**
 * Hlavní vstupní bod pro CRM aplikaci v Replit prostředí
 * 
 * Tento soubor spouští server pomocí child_process
 */

import { spawn } from 'child_process';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Vytvoříme express server
const app = express();

// Získáme aktuální adresář
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Základní status stránka
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRM System - Status stránka</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { color: #2563eb; }
        .box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .success { color: #047857; }
        .error { color: #dc2626; }
        .info { color: #4f46e5; }
        .btn {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 10px;
        }
        .btn:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <h1>CRM System - Diagnostická stránka</h1>
      
      <div class="box">
        <h2 class="info">Stav serveru</h2>
        <p>Tato diagnostická stránka běží na portu 3000. Hlavní CRM server by měl běžet na portu 5000.</p>
        <p>Čas: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="box">
        <h2>Kontrola systému</h2>
        <ul>
          <li>Node.js: <span class="success">✅ OK</span></li>
          <li>Express: <span class="success">✅ OK</span></li>
          <li>Diagnostický server: <span class="success">✅ Běží na portu 3000</span></li>
          <li>Hlavní server: <span class="info">⏳ Pokus o spuštění na portu 5000...</span></li>
        </ul>
      </div>
      
      <div class="box">
        <h2>Další kroky</h2>
        <p>Tato stránka se automaticky obnoví za 10 sekund a zkontroluje stav hlavního serveru.</p>
        <p>Pokud problémy přetrvávají, zkuste:</p>
        <ol>
          <li>Upravit soubor .replit pro správné mapování portů</li>
          <li>Restartovat Replit prostředí</li>
          <li>Spustit server pomocí "./run.sh" v terminálu</li>
        </ol>
        <a href="/" class="btn">Obnovit stránku</a>
      </div>
      
      <script>
        // Automatické obnovení stránky
        setTimeout(() => {
          window.location.reload();
        }, 10000);
      </script>
    </body>
  </html>
  `);
});

// Nastavení proměnných prostředí
process.env.NODE_ENV = 'development';
process.env.HOST = '0.0.0.0';
process.env.PORT = '5000';

console.log('🚀 Spouštím diagnostický server na portu 3000...');

// Spustíme dočasný server
app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Diagnostický server běží na http://0.0.0.0:3000');
  
  // Spustíme hlavní server jako oddělený proces
  console.log('🔄 Spouštím hlavní CRM server na portu 5000...');
  
  const tsx = spawn('npx', ['tsx', 'server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'development', HOST: '0.0.0.0', PORT: '5000' },
    stdio: 'inherit' // Přímo propojíme stdin/stdout/stderr
  });
  
  // Zachytíme události procesu
  tsx.on('error', (err) => {
    console.error('❌ Chyba při spouštění TSX procesu:', err);
  });
  
  tsx.on('close', (code) => {
    console.log(`📋 TSX proces ukončen s kódem: ${code}`);
  });
});