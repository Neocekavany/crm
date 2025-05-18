/**
 * Jednoduchy startovací skript pro Replit
 */

import { spawn } from 'child_process';

console.log('🚀 Spouštím CRM server...');
console.log('📅 Čas:', new Date().toLocaleString());

// Nastavení proměnných prostředí
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';  // Změnili jsme port na 3000, aby nedocházelo ke konfliktům
process.env.NODE_ENV = 'development';

// Spustíme server jako child process
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '0.0.0.0',
    PORT: '3000',
    NODE_ENV: 'development'
  }
});

// Zachytíme události serveru
server.on('error', (err) => {
  console.error('❌ Chyba při spouštění serveru:', err);
});

// Příklad, jak zachytit ukončení procesu
process.on('SIGINT', () => {
  console.log('Ukončuji server...');
  server.kill();
  process.exit(0);
});