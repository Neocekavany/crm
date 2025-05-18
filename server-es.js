/**
 * Optimalizovaný spouštěč serveru pro ES moduly
 * - Kompatibilní s package.json (type: "module")
 * - Automaticky restartuje server při pádu
 * - Navrženo pro Replit prostředí
 */

import { spawn } from 'child_process';
import http from 'http';

// Nastavení proměnných prostředí pro server
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000'; // Používáme port 3000, který je v Replitu mapován na webview
process.env.NODE_ENV = 'development';

// Jednoduchý stavový server, který indikuje že spouštíme hlavní server
const statusServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CRM Server Status</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #3b82f6; }
        .status { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success { color: #059669; }
      </style>
    </head>
    <body>
      <h1>CRM Server Status</h1>
      <div class="status">
        <p>CRM server byl úspěšně spuštěn a nyní by měl běžet na portu 3000.</p>
        <p>Tato stránka indikuje, že spouštěč serveru běží správně.</p>
        <p>Čas: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `);
});

// Spustit a restartovat server při pádu
function startServer() {
  console.log('🚀 Spouštím CRM server pro Replit...');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 Server bude dostupný na adrese http://0.0.0.0:${process.env.PORT}`);
  console.log('=======================================================');

  // Spustíme server pomocí npx tsx
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });

  // Zachytíme události serveru
  server.on('error', (error) => {
    console.error('❌ Chyba při spouštění serveru:', error);
  });
  
  // Při ukončení serveru ho restartujeme, pokud nebyl ukončen záměrně
  server.on('close', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Server byl ukončen s kódem ${code}. Restartuje se za 5 sekund...`);
      setTimeout(startServer, 5000);
    } else {
      console.log('✅ Server byl ukončen s kódem 0 (normální ukončení)');
      process.exit(0);
    }
  });
}

// Připojíme handler pro ukončení
process.on('SIGINT', () => {
  console.log('🛑 Ukončuji server (SIGINT)...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Ukončuji server (SIGTERM)...');
  process.exit(0);
});

// Zachytáváme neošetřené výjimky, aby nezpůsobily pád aplikace
process.on('uncaughtException', (err) => {
  console.error('🔴 Neošetřená výjimka:', err);
  console.log('⚠️ Server pokračuje v běhu i přes výjimku');
});

// Spustíme status server na jiném portu, abychom neblokovali hlavní server
console.log('ℹ️ Spouštím stavový server na portu 8080...');
statusServer.listen(8080, () => {
  console.log('✅ Stavový server běží na http://0.0.0.0:8080');
  
  // Spustíme hlavní server
  startServer();
});