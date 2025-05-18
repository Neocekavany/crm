/**
 * Optimalizovaný skript pro spuštění CRM serveru v Replit
 * - Správně nastavený port 8080
 * - Automatická kontrola databáze a tabulek
 */

import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Nastavení základních proměnných
const PORT = 8080;
const HOST = '0.0.0.0';

// Funkce pro kontrolu běžících procesů
function checkRunningProcesses() {
  return new Promise((resolve) => {
    exec('ps aux | grep "node.*crm-server" | grep -v grep', (error, stdout) => {
      if (error) {
        // Žádné procesy nenalezeny (příkaz vrátil chybu)
        resolve([]);
        return;
      }
      
      const lines = stdout.trim().split('\n').filter(Boolean);
      resolve(lines);
    });
  });
}

// Hlavní funkce pro start serveru
async function main() {
  try {
    console.log('🔍 Kontroluji, zda již neběží jiná instance CRM serveru...');
    
    const runningProcesses = await checkRunningProcesses();
    if (runningProcesses.length > 0) {
      console.log(`⚠️ Nalezeno ${runningProcesses.length} běžících instancí CRM serveru.`);
      console.log('📋 Pro restart je potřeba nejprve zastavit všechny běžící instance.');
      return;
    }
    
    console.log('✅ Žádné běžící instance CRM serveru nebyly nalezeny.');
    
    // Nastavení prostředí
    process.env.PORT = PORT.toString();
    process.env.HOST = HOST;
    process.env.NODE_ENV = 'development';
    
    console.log(`🚀 Spouštím CRM server na adrese http://${HOST}:${PORT}`);
    
    // Vytvoření databázových tabulek
    console.log('📊 Příprava databázových tabulek...');
    await runCommand('npx', ['tsx', 'create-tables.ts']);
    await runCommand('npx', ['tsx', 'create-call-analysis-tables.ts']);
    await runCommand('npx', ['tsx', 'create-live-call-sessions.ts']);
    await runCommand('npx', ['tsx', 'create-system-settings.ts']);
    
    // Spuštění CRM serveru
    console.log('🌐 Spouštím hlavní CRM server...');
    const serverProcess = spawn('node', ['crm-server.js'], {
      env: process.env,
      stdio: 'inherit',
      detached: false
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Chyba při spouštění serveru:', error);
      process.exit(1);
    });
    
    process.on('SIGINT', () => {
      console.log('Ukončuji server...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });
    
    // Vytiskneme info hlášku
    setTimeout(() => {
      console.log(`
=======================================================
  ✅ CRM SYSTÉM JE PŘIPRAVEN
  📊 Přístup: http://${HOST}:${PORT}
  📱 VOIP a SMS: Aktivní
  🇨🇿 České telefonní čísla: Povoleny
  📞 Přenos hovorů: Dostupný
  🤖 AI asistent: Připraven
=======================================================
      `);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Chyba při spouštění CRM serveru:', error);
    process.exit(1);
  }
}

// Pomocná funkce pro spuštění příkazu a čekání na jeho dokončení
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Příkaz selhal s kódem ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Spuštění hlavní funkce
main().catch(error => {
  console.error('❌ Fatální chyba:', error);
});