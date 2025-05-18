#!/bin/bash

# Tento skript slouží pro spuštění aplikace v Replit prostředí
# Je navržen tak, aby fungoval s existujícími WorkFlow nastaveními Replitu

echo "============================================="
echo "🚀 CRM Server - Replit Setup"
echo "📅 $(date)"
echo "============================================="

# Nejprve ukončíme všechny běžící instance
echo "🛑 Ukončuji existující procesy..."
pkill -f "tsx server/index.ts" || true
pkill -f "node server/index.js" || true
pkill -f "node dev.js" || true
sleep 1

# Nastavíme proměnné prostředí
export HOST="0.0.0.0"
export NODE_ENV="development"
export PORT="5000"

# Spustíme náš vlastní starter skript
echo "🔄 Spouštím dev.js pro inicializaci serveru..."
exec node dev.js