/**
 * Tento skript spouští vývojový server CRM aplikace.
 * Je speciálně navržen pro spuštění v prostředí Replit.
 */

import { exec } from 'child_process';
import http from 'http';

// Nastavení proměnných prostředí
process.env.NODE_ENV = 'development';
process.env.HOST = '0.0.0.0';
process.env.PORT = '5000';

console.log('🚀 Spouštím CRM vývojový server (Replit)');
console.log('📅 Čas:', new Date().toLocaleString());
console.log('🌐 Adresa:', 'http://0.0.0.0:5000');
console.log('==========================================');

// Vytvoříme dočasný server pro lepší uživatelskou zkušenost
const tempServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CRM Server se spouští...</title>
        <style>
          body { font-family: Arial; text-align: center; padding-top: 50px; }
          .loader { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
        <meta http-equiv="refresh" content="5">
      </head>
      <body>
        <h2>CRM Server se spouští...</h2>
        <div class="loader"></div>
        <p>Tato stránka se automaticky obnoví za 5 sekund.</p>
      </body>
    </html>
  `);
});

// Spustíme dočasný server
tempServer.listen(5000, '0.0.0.0', () => {
  console.log('🔄 Spouštím vývojový server...');
  
  // Spustíme hlavní server jako podproces
  const server = exec('npx tsx server/index.ts');
  
  // Zachytíme výstup z hlavního serveru
  server.stdout.on('data', (data) => {
    console.log(data.trim());
    
    // Když server hlásí, že běží, ukončíme dočasný server
    if (data.includes('serving on port 5000')) {
      console.log('✅ Server úspěšně spuštěn! Ukončuji dočasný server...');
      tempServer.close();
    }
  });
  
  server.stderr.on('data', (data) => {
    console.error('❌ Chyba:', data.trim());
  });
  
  server.on('close', (code) => {
    console.log(`⚠️ Server ukončen s kódem ${code}`);
  });
});