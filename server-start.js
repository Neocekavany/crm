/**
 * Jednoduchý startovací skript pro server v Replit prostředí
 * Spouští server na portu 5000
 */
import { exec } from 'child_process';

console.log('🚀 Spouštím CRM aplikaci na portu 5000...');
console.log('📢 Čas spuštění:', new Date().toLocaleString());

// Zkontrolujeme připojení k databázi
const checkDbConnection = exec('node test-db.js');

checkDbConnection.stdout.on('data', (data) => {
  console.log('🔍 Test databáze:', data.toString());
});

checkDbConnection.stderr.on('data', (data) => {
  console.error('❌ Chyba databáze:', data.toString());
});

checkDbConnection.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Připojení k databázi OK, spouštím server...');
    
    // Spustíme server s explicitním nastavením hosta na 0.0.0.0
    const server = exec('NODE_ENV=development HOST=0.0.0.0 npx tsx server/index.ts');
    
    server.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    server.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    server.on('close', (code) => {
      console.log(`⚠️ Server ukončen s kódem: ${code}`);
    });
  } else {
    console.error('❌ Test databáze selhal. Server nebude spuštěn.');
  }
});