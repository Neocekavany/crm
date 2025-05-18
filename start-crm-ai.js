/**
 * Optimalizovaný spouštěcí skript pro CRM server s AI modulem
 * - Nastavuje port 3000 pro lepší kompatibilitu
 * - Podporuje OPENAI_API_KEY pro AI funkcionalitu
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// ES module fix pro __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Nastavení proměnných prostředí pro server
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

console.log('=======================================================');
console.log('🚀 CRM Server s AI Modulem - Replit Edition');
console.log(`📅 ${new Date().toLocaleString()}`);
console.log('=======================================================');

// Kontrola existence OPENAI_API_KEY
if (process.env.OPENAI_API_KEY) {
  console.log('✅ OPENAI_API_KEY detekován - AI funkce budou dostupné');
} else {
  console.log('⚠️ OPENAI_API_KEY není nastaven - AI funkce mohou být omezené');
}

// Ukončení všech běžících Node.js procesů
console.log('🛑 Ukončuji předchozí instance serveru...');

const killNodeProcesses = () => {
  return new Promise(resolve => {
    const ps = spawn('ps', ['aux']);
    let output = '';
    
    ps.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ps.on('close', () => {
      const lines = output.split('\n');
      const nodeProcesses = lines.filter(line => line.includes('node') && !line.includes('ps aux'));
      
      if (nodeProcesses.length === 0) {
        console.log('✅ Žádné běžící Node.js procesy nenalezeny');
        resolve();
        return;
      }
      
      console.log(`🔍 Nalezeno ${nodeProcesses.length} běžících Node.js procesů.`);
      
      // Pro každý proces získáme PID a ukončíme ho
      const killPromises = nodeProcesses.map(process => {
        const parts = process.trim().split(/\s+/);
        const pid = parts[1];
        
        return new Promise(resolveKill => {
          console.log(`🔄 Ukončuji proces s PID ${pid}...`);
          spawn('kill', ['-9', pid]);
          setTimeout(resolveKill, 100);
        });
      });
      
      Promise.all(killPromises).then(resolve);
    });
  });
};

// Spustí server
const startServer = async () => {
  // Nejprve ukončíme předchozí procesy
  await killNodeProcesses();
  
  console.log('🚀 Spouštím CRM server s AI modulem...');
  
  // Spustíme server jako nový proces
  const server = spawn('node', ['crm-server.js'], {
    stdio: 'inherit',
    env: process.env
  });
  
  // Při ukončení procesu
  server.on('close', (code) => {
    if (code !== 0) {
      console.log(`⚠️ Server byl ukončen s kódem ${code}`);
    }
  });
  
  // Připojíme handler pro ukončení
  process.on('SIGINT', () => {
    console.log('🛑 Ukončuji server (SIGINT)...');
    server.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('🛑 Ukončuji server (SIGTERM)...');
    server.kill('SIGTERM');
    process.exit(0);
  });
};

// Spustíme server
startServer().catch(error => {
  console.error('❌ Chyba při spouštění serveru:', error);
});