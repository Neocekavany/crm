/**
 * Upravený startovací skript pro CRM server v Replit
 * - Spouští server na portu 3000 pro kompatibilitu s Replit webview
 * - Používá fixní IP adresu 0.0.0.0
 */

// Spustí minimální verzi serveru
import { spawn } from 'child_process';

// Nastavení proměnných prostředí
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

console.log('🚀 Spouštím CRM server pro Replit...');
console.log(`📅 ${new Date().toLocaleString()}`);
console.log(`🌐 Server bude dostupný na adrese http://${process.env.HOST}:${process.env.PORT}`);
console.log('=======================================================');

// Spustíme server pomocí minimální verze
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
  if (code !== 0) {
    console.log(`⚠️ Server byl ukončen s kódem ${code}. Restartuje se za 5 sekund...`);
    
    // Automatický restart po 5 sekundách
    setTimeout(() => {
      console.log('🔄 Restartuji server...');
      const restartedServer = spawn('node', ['start-crm.js'], {
        stdio: 'inherit',
        env: process.env,
        detached: true
      });
      restartedServer.unref();
      process.exit(0);
    }, 5000);
  } else {
    console.log('✅ Server byl ukončen s kódem 0 (normální ukončení)');
  }
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