/**
 * Spouštěcí skript pro jednoduchý CRM server
 */

import { spawn } from 'child_process';

// Nastavení proměnných prostředí
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

console.log('🚀 Spouštím jednoduchý CRM server...');
console.log(`📅 ${new Date().toLocaleString()}`);
console.log(`🌐 Server bude dostupný na adrese http://${process.env.HOST}:${process.env.PORT}`);
console.log('=======================================================');

// Spustíme server
const server = spawn('node', ['simple-server.js'], {
  stdio: 'inherit',
  env: process.env
});

// Zachytíme události serveru
server.on('error', (error) => {
  console.error('❌ Chyba při spouštění serveru:', error);
});

// Při ukončení serveru
server.on('close', (code) => {
  console.log(`⚠️ Server byl ukončen s kódem ${code}`);
  process.exit(code || 0);
});

// Připojíme handler pro ukončení
process.on('SIGINT', () => {
  console.log('🛑 Ukončuji server (SIGINT)...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Ukončuji server (SIGTERM)...');
  server.kill();
  process.exit(0);
});