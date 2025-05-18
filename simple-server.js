/**
 * Minimální server pro CRM systém - pro testování správného spuštění
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';

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
    message: 'API je funkční',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Základní API endpoint pro testování
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CRM System - Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        pre { background: #f6f8fa; padding: 10px; border-radius: 4px; }
        #response { height: 200px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>CRM System - Testovací stránka</h1>
      <div class="card">
        <h2>Status serveru</h2>
        <p>✅ Server je spuštěn a běží</p>
        <p>⏱️ Čas spuštění: ${new Date().toLocaleString()}</p>
        <p>🌐 URL: http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}</p>
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
  `);
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
const port = process.env.PORT || 3000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Minimální CRM server běží na adrese http://0.0.0.0:${port}`);
  console.log('📊 Tento server obsahuje pouze minimální funkcionalitu pro testování');
});