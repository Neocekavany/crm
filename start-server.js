/**
 * Optimalizovaný spouštěč serveru pro CRM
 * - Používá ES moduly pro kompatibilitu s package.json (type: "module")
 * - Automaticky restartuje server při pádu
 * - Správná konfigurace pro Replit
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module fix pro __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nastavení proměnných prostředí pro server
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

console.log('=======================================================');
console.log('🚀 CRM Server - Replit Edition');
console.log(`📅 ${new Date().toLocaleString()}`);
console.log('=======================================================');

// Zjištění, zda server bude používat TypeScript nebo JavaScript
let serverCommand = 'node';
let serverScript = 'server/index.js';

if (fs.existsSync(path.join(process.cwd(), 'server/index.ts'))) {
  console.log('✅ Detekován TypeScript server, použijeme npx tsx');
  serverCommand = 'npx';
  serverScript = ['tsx', 'server/index.ts'];
} else {
  console.log('✅ Detekován JavaScript server, použijeme Node.js');
  serverCommand = 'node';
  serverScript = 'server/index.js';
}

// Funkce pro ukončení všech Node.js procesů
function killAllNodeProcesses() {
  return new Promise((resolve) => {
    console.log('🛑 Ukončuji všechny Node.js procesy...');

    // Na Windows použijeme jiný příkaz
    const command = process.platform === 'win32' 
      ? spawn('taskkill', ['/F', '/IM', 'node.exe']) 
      : spawn('pkill', ['-f', 'node']);

    command.on('close', () => {
      console.log('✅ Všechny Node.js procesy ukončeny');
      setTimeout(resolve, 1000); // Počkáme 1 sekundu
    });
  });
}

// Funkce pro spuštění serveru
function startServer() {
  console.log(`🚀 Spouštím server na http://${process.env.HOST}:${process.env.PORT}...`);

  let serverProcess;
  if (Array.isArray(serverScript)) {
    // Pro npx tsx
    serverProcess = spawn(serverCommand, serverScript, {
      stdio: 'inherit',
      env: process.env
    });
  } else {
    // Pro node
    serverProcess = spawn(serverCommand, [serverScript], {
      stdio: 'inherit',
      env: process.env
    });
  }

  // Zachytíme události serveru
  serverProcess.on('error', (error) => {
    console.error('❌ Chyba při spouštění serveru:', error);
    setTimeout(startServer, 5000);
  });
  
  // Při ukončení serveru ho restartujeme
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Server byl ukončen s kódem ${code}. Restartuje se za 5 sekund...`);
      setTimeout(startServer, 5000);
    } else {
      console.log('✅ Server byl úspěšně ukončen');
      process.exit(0);
    }
  });

  return serverProcess;
}

// Zachytáváme signály pro ukončení
process.on('SIGINT', () => {
  console.log('🛑 Ukončuji server (SIGINT)...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Ukončuji server (SIGTERM)...');
  process.exit(0);
});

// Zachytíme neošetřené výjimky
process.on('uncaughtException', (err) => {
  console.error('🔴 Neošetřená výjimka:', err);
  console.log('⚠️ Server pokračuje v běhu i přes výjimku');
});

// Nejprve ukončíme všechny Node.js procesy a pak spustíme server
killAllNodeProcesses().then(() => {
  startServer();
});