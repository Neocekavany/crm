/**
 * Hlavní server pro CRM aplikaci v Replit prostředí
 * Tento soubor je spuštěn přímo při startu Replitu
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import openAiRouter from './crm-openai-api.js';

// Cesty k souborům
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializace Express aplikace
const app = express();

// Základní bezpečnostní middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

// Body parsery
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Základní API endpoint pro testování
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CRM API je funkční',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    system: 'CRM pro J&N Ventures'
  });
});

// Přidání API routeru pro vývojářský AI modul
app.use('/api/dev', openAiRouter);

// Statické soubory
app.use(express.static(join(__dirname, 'client', 'dist')));

// Základní HTML stránka pro testování
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>CRM System - Test</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #45a049; }
    pre { background: #f6f8fa; padding: 10px; border-radius: 4px; }
    #response { height: 200px; overflow: auto; }
    .header { display: flex; align-items: center; }
    .header h1 { margin-right: 20px; }
    .status { display: inline-block; padding: 5px 10px; border-radius: 4px; background: #4CAF50; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CRM System</h1>
    <span class="status">✅ Provozní testovací server</span>
  </div>
  <div class="card">
    <h2>Status serveru</h2>
    <p>✅ Server je spuštěn a běží</p>
    <p>⏱️ Čas spuštění: ${new Date().toLocaleString()}</p>
    <p>🌐 URL: http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 8080}</p>
  </div>
  <div class="card">
    <h2>Test API</h2>
    <button id="testApi">Otestovat API</button>
    <div id="response"></div>
  </div>
  <script>
    document.getElementById('testApi').addEventListener('click', async () => {
      const responseElement = document.getElementById('response');
      responseElement.innerHTML = "Odesílám požadavek...";
      
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        responseElement.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      } catch (error) {
        responseElement.innerHTML = '<pre style="color: red">Chyba: ' + error.message + '</pre>';
      }
    });
  </script>
</body>
</html>
`;

// Základní endpoint pro testování
app.get('/', (req, res) => {
  res.send(htmlTemplate);
});

// Směrování pro SPA - všechny cesty které nejsou API vrací hlavní stránku
app.get('*', (req, res) => {
  // Ignoruj API požadavky
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Pro všechny ostatní požadavky vrať index.html
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

// Zpracování chyb
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Nastavení portu a spuštění serveru
const port = process.env.PORT || 3000; // Změněno na port 3000
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 CRM server s AI modulem běží na adrese http://0.0.0.0:${port}`);
  console.log(`📊 Prostředí: ${process.env.NODE_ENV || 'development'}`);
  console.log('=======================================================');
});