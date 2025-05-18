/**
 * Jednoduchý HTTP server pro testování Replit webview
 * Naslouchá na portu 3000, který by měl být přístupný z webview
 */

import http from 'http';

// Vytvoříme jednoduchý HTTP server
const server = http.createServer((req, res) => {
  console.log(`📝 Požadavek na: ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Replit Webview</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #3b82f6; }
        .status { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success { color: #059669; }
        button { background: #3b82f6; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <h1>Test Replit Webview</h1>
      <div class="status">
        <p class="success">✅ Testovací server běží!</p>
        <p>Tento jednoduchý server naslouchá na portu 3000 a je dostupný z Replit webview.</p>
        <p>Čas: ${new Date().toLocaleString()}</p>
        <p>URL: ${req.url}</p>
      </div>
      
      <h2>Test API</h2>
      <button id="testApi">Otestovat API</button>
      <pre id="apiResult" style="background: #f1f5f9; padding: 10px; border-radius: 5px; margin-top: 10px;"></pre>
      
      <script>
        document.getElementById('testApi').addEventListener('click', async () => {
          const resultElement = document.getElementById('apiResult');
          resultElement.textContent = 'Načítám...';
          
          try {
            const response = await fetch('/api/test');
            const data = await response.json();
            resultElement.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultElement.textContent = 'Chyba: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// API endpointy
server.on('request', (req, res) => {
  if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'API test úspěšný!',
      time: new Date().toLocaleString(),
      serverInfo: {
        node: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage()
      }
    }));
  }
});

// Nastavíme port a IP adresu pro Replit
const PORT = 3000;
const HOST = '0.0.0.0';

// Spustíme server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Testovací server běží na http://${HOST}:${PORT}`);
  console.log(`📋 Tento server by měl být viditelný v Replit webview`);
});

// Zachytíme ukončení
process.on('SIGINT', () => {
  console.log('Server ukončen.');
  server.close();
  process.exit(0);
});