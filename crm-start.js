/**
 * Upravený startovací skript pro CRM server v Replit
 * - Spouští server na portu 8080 pro kompatibilitu s Replit webview
 * - Používá fixní IP adresu 0.0.0.0
 */

import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Vytvoříme dočasný Express server
const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

// Získáme aktuální adresář
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zobrazíme stránku "Server se spouští..."
app.get('*', (req, res) => {
  console.log(`Přijat požadavek: ${req.method} ${req.url}`);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRM Server se spouští...</title>
      <style>
        body {
          font-family: -apple-system, system-ui, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        h1 { color: #3b82f6; margin-top: 40px; }
        .loader {
          margin: 40px auto;
          border: 5px solid #f3f3f3;
          border-radius: 50%;
          border-top: 5px solid #3b82f6;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: left;
        }
        .refresh-info {
          margin-top: 30px;
          padding: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <h1>CRM Server se spouští...</h1>
      <div class="loader"></div>
      
      <div class="status">
        <p><strong>Stav:</strong> Server se připravuje a bude za okamžik dostupný.</p>
        <p><strong>Čas:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Adresa:</strong> http://${HOST}:${PORT}</p>
      </div>
      
      <div class="refresh-info">
        Stránka se automaticky obnoví za 5 sekund...
      </div>
      
      <script>
        // Automatické obnovení stránky
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      </script>
    </body>
    </html>
  `);
});

// Spustíme dočasný server
console.log(`🚀 Spouštím dočasný server na portu ${PORT}...`);

// Nastavení proměnných prostředí, aby server věděl, že má naslouchat na portu 8080
process.env.PORT = '8080';
process.env.HOST = '0.0.0.0';
process.env.NODE_ENV = 'development';

// Spustíme dočasný server
const temporaryServer = app.listen(PORT, HOST, () => {
  console.log(`✅ Dočasný server běží na http://${HOST}:${PORT}`);
  
  // Spustíme hlavní CRM server s upravenými parametry
  console.log(`🔄 Spouštím CRM server na portu ${PORT}...`);
  
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    env: {
      ...process.env,
      PORT: '8080',
      HOST: '0.0.0.0',
      NODE_ENV: 'development'
    }
  });
  
  // Zachytíme výstup ze serveru
  serverProcess.stdout.on('data', (data) => {
    console.log(`📤 Server stdout: ${data}`);
    
    // Když server hlásí, že běží, zavřeme dočasný server
    if (data.toString().includes('Server běží')) {
      console.log('✅ Hlavní server je připraven, zavírám dočasný server...');
      temporaryServer.close();
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`📥 Server stderr: ${data}`);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`⚠️ Server proces skončil s kódem ${code}`);
  });
});