#!/bin/bash

# Skript pro spuštění CRM serveru na portu 3000 (pro Replit webview)
echo "====================================================="
echo "🚀 CRM Server - Spouštím na portu 3000 pro Replit"
echo "📅 $(date)"
echo "====================================================="

# Nastavíme proměnné prostředí
export NODE_ENV="development"
export HOST="0.0.0.0"
export PORT="3000"

# Spustíme server přímo s explicitním nastavením portu 3000
NODE_ENV=development HOST=0.0.0.0 PORT=3000 npx tsx server/index.ts