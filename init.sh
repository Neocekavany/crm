#!/bin/bash

echo "Inicializace CRM aplikace..."

# Nastavení prostředí
export NODE_ENV=development

# Kontrola, zda je databáze připojena
echo "Kontrola připojení k databázi..."
npx tsx -e "
const { pool } = require('./server/db');
pool.query('SELECT 1').then(() => {
  console.log('Databáze je připojena!');
  process.exit(0);
}).catch(err => {
  console.error('Chyba při připojení k databázi:', err);
  process.exit(1);
});"

if [ $? -ne 0 ]; then
  echo "Chyba: Databáze není dostupná!"
  exit 1
fi

# Naplnění databáze testovacími daty (pokud je třeba)
echo "Naplňování databáze testovacími daty..."
npx tsx seed-db.ts

if [ $? -ne 0 ]; then
  echo "Varování: Naplnění databáze selhalo, pokračuji dále..."
fi

# Spuštění serveru
echo "Spouštění serveru..."
exec npm run dev