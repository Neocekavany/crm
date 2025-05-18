/**
 * Skript pro kontrolu, zda CRM server běží
 */

import http from 'http';

console.log('🔍 Kontroluji běh CRM serveru...');

// Zkontrolujeme port 5000
const checkPort = (port) => {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      host: '127.0.0.1',
      port,
      path: '/',
      timeout: 3000
    }, (res) => {
      console.log(`✅ Server běží na portu ${port} (Status: ${res.statusCode})`);
      resolve(true);
    });

    req.on('error', () => {
      console.log(`❌ Server neběží na portu ${port}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏱️ Timeout při kontrole portu ${port}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// Kontrola portů
const [port5000, port3000] = await Promise.all([
  checkPort(5000),
  checkPort(3000)
]);

if (port5000 || port3000) {
  console.log('🚀 CRM server je aktivní a běží!');
  console.log('📌 Přístup:');
  if (port5000) console.log('   - http://127.0.0.1:5000');
  if (port3000) console.log('   - http://127.0.0.1:3000');
} else {
  console.log('❌ CRM server neběží na očekávaných portech.');
  console.log('   Pro spuštění serveru použijte příkaz: npm run dev');
}

// Zkontrolujeme API
if (port5000 || port3000) {
  const port = port5000 ? 5000 : 3000;
  const apiReq = http.request({
    method: 'GET',
    host: '127.0.0.1',
    port,
    path: '/api/health',
    timeout: 3000
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          console.log('✅ API Health check: OK');
          console.log('   Odpověď:', data);
        } catch (e) {
          console.log('⚠️ API vrátila neplatný JSON:', data);
        }
      } else {
        console.log(`⚠️ API Health check vrátil status ${res.statusCode}`);
      }
    });
  });

  apiReq.on('error', (err) => {
    console.log('❌ Nelze se připojit k API endpointu:', err.message);
  });

  apiReq.on('timeout', () => {
    console.log('⏱️ Timeout při API kontrole');
    apiReq.destroy();
  });

  apiReq.end();
}