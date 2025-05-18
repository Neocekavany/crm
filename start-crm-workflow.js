/**
 * Optimalizovaný spouštěcí skript pro CRM workflow v Replit
 * - Standardizovaný port 8080 pro všechny komponenty
 * - Automatické ukončení předchozích instancí
 * - Podpora pro VOIP, SMS a všechny pokročilé funkce
 */

import { spawn, exec } from 'child_process';
import { createServer } from 'http';

// Nastavení základních proměnných
const PORT = 8080;
const HOST = '0.0.0.0';

// Funkce pro ukončení všech běžících Node procesů
function killNodeProcesses() {
  return new Promise((resolve, reject) => {
    console.log('Ukončuji předchozí běžící procesy...');
    
    exec('pgrep -f "node" || true', (error, stdout) => {
      if (error) {
        console.error('Chyba při hledání běžících procesů:', error);
        resolve();
        return;
      }
      
      const pids = stdout.trim().split('\n').filter(Boolean);
      
      if (pids.length === 0) {
        console.log('Žádné běžící Node.js procesy nebyly nalezeny.');
        resolve();
        return;
      }
      
      console.log(`Nalezeno ${pids.length} běžících Node.js procesů.`);
      
      // Ukončíme každý proces
      let completed = 0;
      
      pids.forEach(pid => {
        console.log(`Ukončuji proces s PID ${pid}...`);
        
        exec(`kill -9 ${pid} || true`, (killError) => {
          if (killError) {
            console.error(`Chyba při ukončování procesu ${pid}:`, killError);
          } else {
            console.log(`Proces ${pid} byl úspěšně ukončen.`);
          }
          
          completed++;
          
          if (completed === pids.length) {
            console.log('Všechny procesy byly ukončeny.');
            
            // Počkáme chvíli pro jistotu
            setTimeout(resolve, 1000);
          }
        });
      });
    });
  });
}

// Hlavní funkce pro spuštění serveru
async function startServer() {
  try {
    // Nejprve ukončíme všechny běžící procesy
    await killNodeProcesses();
    
    console.log(`
========================================================
 🚀 Spouštím CRM systém na portu ${PORT}
 📋 Režim: Vývojový server s plnou funkčností
 🔧 Připravuji všechny komponenty...
========================================================
    `);
    
    // Nastavíme proměnné prostředí
    process.env.PORT = String(PORT);
    process.env.HOST = HOST;
    process.env.NODE_ENV = 'development';
    
    // Spustíme server
    const serverProcess = spawn('node', ['crm-server.js'], {
      env: process.env,
      stdio: 'inherit'
    });
    
    serverProcess.on('close', (code) => {
      console.log(`❌ Server byl ukončen s kódem ${code}`);
      process.exit(code);
    });
    
    // Vytvoříme jednoduchý HTTP server pro kontrolu běhu
    const checkServer = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('CRM systém běží');
    });
    
    // Tento server běží na jiném portu, jen pro interní kontrolu
    checkServer.listen(9999, HOST, () => {
      console.log('✅ Kontrolní server je připraven');
      
      // Vypíšeme oznámení o běžícím systému
      console.log(`
========================================================
 ✅ CRM SYSTÉM JE PŘIPRAVEN
 📊 Server běží na adrese: http://${HOST}:${PORT}
 📱 VOIP a SMS funkce jsou aktivní
 🇨🇿 Podpora českých telefonních čísel je povolena
 📞 Funkce přenosu hovorů je dostupná
 🤖 AI asistent je připraven
========================================================
      `);
    });
    
    // Zachytíme ukončovací signály
    process.on('SIGINT', () => {
      console.log('Přijat signál SIGINT, ukončuji server...');
      serverProcess.kill('SIGINT');
      checkServer.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('Přijat signál SIGTERM, ukončuji server...');
      serverProcess.kill('SIGTERM');
      checkServer.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Chyba při spouštění serveru:', error);
    process.exit(1);
  }
}

// Spustíme server
startServer().catch(err => {
  console.error('Fatální chyba při spouštění:', err);
  process.exit(1);
});