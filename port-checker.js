/**
 * Nástroj pro kontrolu, zda jsou porty volné nebo obsazené
 */

import http from 'http';

// Porty, které chceme zkontrolovat
const portsToCheck = [3000, 5000, 8080];

// Funkce pro kontrolu jednoho portu
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} je obsazen jiným procesem`);
        resolve(false);
      } else {
        console.log(`❓ Chyba při kontrole portu ${port}: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      console.log(`✅ Port ${port} je volný`);
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
};

// Hlavní funkce
async function main() {
  console.log('🔍 Kontroluji dostupnost portů...');
  
  for (const port of portsToCheck) {
    await checkPort(port);
  }
  
  console.log('✨ Kontrola dokončena');
}

// Spustíme hlavní funkci
main().catch(err => {
  console.error('❌ Neočekávaná chyba:', err);
});