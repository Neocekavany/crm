/**
 * Jednoduchý spouštěcí server pro CRM systém
 * - Nastavený na port 8080
 * - Vhodný pro prostředí Replit
 */

console.log('🚀 Spouštím CRM server na portu 8080...');

// Nastavení proměnných prostředí
process.env.PORT = '8080';
process.env.HOST = '0.0.0.0';

// Spuštění serveru
require('./crm-server.js');