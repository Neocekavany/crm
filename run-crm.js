/**
 * Optimalizovaný spouštěcí skript pro CRM server
 * - Spouští server na portu 3000 pro kompatibilitu s Replit webview
 * - Zajišťuje, že server běží na IP adrese 0.0.0.0
 * - Přesměrovává všechny požadavky na správné endpointy
 */

import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vytvoříme Express aplikaci
const app = express();
const PORT = 3000;

// Nastavení základních middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Základní serverová stránka s vysvětlením
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRM-System | J&N VENTURES S.R.O.</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
          background-color: #f5f7f9;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #1e40af;
          margin-top: 30px;
        }
        ul {
          background: white;
          border-radius: 8px;
          padding: 20px 20px 20px 40px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        li {
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 10px 20px;
          margin-top: 20px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>CRM-System | J&N VENTURES S.R.O.</h1>
        
        <p>
          Vítejte v CRM systému společnosti J&N VENTURES S.R.O. 
          Tento systém poskytuje komplexní řešení pro správu kontaktů, hovorů a komunikace.
        </p>
        
        <h2>Přístup do aplikace</h2>
        <p>
          Pro přístup do aplikace použijte tlačítko níže, které vás přesměruje na testovací přihlašovací stránku.
          Zde si můžete vybrat, do které části systému chcete přistupovat.
        </p>
        
        <ul>
          <li><strong>Admin Panel</strong> - Správa celého systému, firem a nastavení</li>
          <li><strong>Firma Panel</strong> - Správa firemního účtu, týmů a operátorů</li>
          <li><strong>Manager Panel</strong> - Správa týmu a přidělování hovorů</li>
          <li><strong>Operátor Panel</strong> - Práce s hovory a klienty</li>
        </ul>
        
        <p>
          <a href="/test-login" class="button">Přejít na testovací přihlášení</a>
        </p>
        
        <h2>Podpora</h2>
        <p>
          V případě jakýchkoliv dotazů nebo problémů kontaktujte technickou podporu J&N VENTURES S.R.O.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Proxy pro API požadavky
app.all('/api/*', (req, res) => {
  res.redirect(`http://localhost:5000${req.originalUrl}`);
});

// Pro všechny ostatní cesty servírujeme HTML soubor s aplikací
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Vytvoříme HTTP server
const server = createServer(app);

// Spustíme server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CRM systém běží na adrese http://0.0.0.0:${PORT}`);
  
  // Spustíme API server v separátním procesu (pokud ještě neběží)
  exec('pgrep -f "node.*crm-server.js"', (error, stdout) => {
    if (!stdout) {
      console.log('Spouštím API server...');
      const apiServer = exec('node crm-server.js');
      
      apiServer.stdout.on('data', (data) => {
        console.log(`API server: ${data}`);
      });
      
      apiServer.stderr.on('data', (data) => {
        console.error(`API server chyba: ${data}`);
      });
    } else {
      console.log('API server již běží');
    }
  });
});