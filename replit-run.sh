#!/bin/bash

# Tento skript spouští CRM server v Replit prostředí

echo "============================================="
echo "🚀 CRM Server - Replit Launcher"
echo "📅 $(date)"
echo "============================================="

# Nastavíme proměnné prostředí
export HOST="0.0.0.0"
export PORT="5000"

# Nejprve zkontrolujeme, zda je databáze dostupná
echo "🔍 Kontroluji připojení k databázi..."
node test-db.js

if [ $? -ne 0 ]; then
  echo "❌ Nelze se připojit k databázi - zkontrolujte nastavení DATABASE_URL"
  exit 1
fi

echo "✅ Databáze je dostupná"

# Spustíme hlavní server
echo "🚀 Spouštím CRM server na adrese http://0.0.0.0:5000"
HOST=0.0.0.0 NODE_ENV=development npx tsx server/index.ts