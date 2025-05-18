/**
 * Jednoduchý spouštěč pro CRM aplikaci v Replit
 */

import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vytvoření Express aplikace
const app = express();
const PORT = 3000;

// Nastavení middleware
app.use(express.json());
app.use(express.static('public'));

// Základní endpoint
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CRM Systém | J&N Ventures s.r.o.</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { color: #2563eb; }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <h1>CRM Systém | J&N Ventures s.r.o.</h1>
      
      <div class="card">
        <h2>Přístup do systému</h2>
        <p>Pro přístup do CRM systému vyberte jednu z následujících možností:</p>
        <p>
          <a href="/test-login" class="button">Testovací přihlášení</a>
          <a href="/ai-assistant" class="button">Ukázka AI asistenta</a>
        </p>
      </div>
      
      <div class="card">
        <h2>Nová funkce: AI asistent</h2>
        <p>
          Implementovali jsme nový AI asistent, který pomáhá operátorům během hovorů s klienty:
        </p>
        <ul>
          <li>Analýza emocí klienta v reálném čase</li>
          <li>Proaktivní návrhy odpovědí a řešení</li>
          <li>Automatické přepisy hovorů a doporučení</li>
          <li>Učení z úspěšných hovorů a předávání zkušeností</li>
        </ul>
        <p>Pro ukázku funkčnosti přejděte na stránku AI asistenta.</p>
      </div>
    </body>
    </html>
  `);
});

// Spuštění serveru
const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CRM aplikace běží na adrese http://0.0.0.0:${PORT}`);
});