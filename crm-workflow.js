/**
 * Workflow pro spuštění CRM serveru s ES moduly
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Získání cesty ke skriptu
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Definice příkazové řádky pro spuštění serveru
const command = 'node';
const args = ['crm-server.js'];
const options = {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
};

console.log(`Spouštím CRM server: ${command} ${args.join(' ')}`);

// Spuštění serveru
const serverProcess = spawn(command, args, options);

// Zpracování ukončení procesu
serverProcess.on('close', (code) => {
  console.log(`CRM server ukončen s kódem: ${code}`);
});

// Zachycení signálů pro čisté ukončení
process.on('SIGINT', () => {
  console.log('Ukončení serveru...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Nucené ukončení serveru...');
  serverProcess.kill('SIGTERM');
});