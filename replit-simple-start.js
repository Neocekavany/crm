/**
 * Zjednodušený skript pro spouštění CRM v Replit
 * - Jednoúčelový, maximálně zjednodušený
 * - Zaměřený na port 8080
 */

// Použití ES modulů
import { spawn } from 'child_process';

// Nastavení proměnných prostředí
process.env.PORT = '8080';
process.env.HOST = '0.0.0.0';
process.env.NODE_ENV = 'development';

console.log('🚀 Spouštím zjednodušený CRM server na portu 8080...');

// Spuštění serveru přímo
const serverProcess = spawn('node', ['crm-server.js'], {
  env: process.env,
  stdio: 'inherit'
});

serverProcess.on('error', (error) => {
  console.error('Chyba při spouštění serveru:', error);
  process.exit(1);
});

// Zachytávání signálů
process.on('SIGINT', () => {
  console.log('Ukončuji server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Ukončuji server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

console.log(`
=====================================================
  ✅ CRM SYSTÉM SE SPOUŠTÍ
  📊 Server bude dostupný na: http://0.0.0.0:8080
  📱 Všechny funkce jsou aktivovány
=====================================================
`);