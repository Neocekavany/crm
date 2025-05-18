/**
 * Debug script pro CRM server 
 * Zobrazuje podrobné chybové hlášení
 */

import { spawn } from 'child_process';
import * as fs from 'fs';

// Nastavení proměnných prostředí
process.env.HOST = '0.0.0.0';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';
process.env.DEBUG = 'express:*';

console.log('🔍 Spouštím server v debug módu...');
console.log(`📅 ${new Date().toLocaleString()}`);
console.log(`🌐 Server by měl být dostupný na http://${process.env.HOST}:${process.env.PORT}`);
console.log('=======================================================');

// Kontrola, zda existuje soubor server/index.ts
if (!fs.existsSync('server/index.ts')) {
  console.error('❌ Soubor server/index.ts nenalezen!');
  
  // Kontrola struktury adresáře server
  console.log('📁 Obsah adresáře server:');
  try {
    const files = fs.readdirSync('server');
    files.forEach(file => console.log(`- ${file}`));
  } catch (err) {
    console.error('❌ Chyba při čtení adresáře server:', err);
  }
  
  process.exit(1);
}

// Spustíme server pomocí npx tsx s výpisem chyb
const server = spawn('npx', ['--trace-warnings', 'tsx', '--inspect', 'server/index.ts'], {
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
    console.log(`⚠️ Server byl ukončen s kódem ${code}`);
    console.log('📋 Kontroluji poslední záznamy v log souboru:');
    try {
      // Přečteme posledních 20 řádků log souboru (pokud existuje)
      if (fs.existsSync('server.log')) {
        const log = fs.readFileSync('server.log', 'utf8');
        const lines = log.split('\n').slice(-20);
        console.log(lines.join('\n'));
      } else {
        console.log('⚠️ Soubor server.log nenalezen');
      }
    } catch (err) {
      console.error('❌ Chyba při čtení log souboru:', err);
    }
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