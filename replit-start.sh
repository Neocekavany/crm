#!/bin/bash

# Optimalizovaný spouštěcí skript pro CRM v Replit prostředí
# - Nastavuje správný port 8080
# - Automaticky zkontroluje a vytvoří databázové tabulky
# - Spustí VOIP, SMS a AI funkce

echo "============================================================"
echo "🚀 Spouštění CRM systému v Replit prostředí"
echo "============================================================"

# Ukončení běžících Node procesů
echo "🔄 Kontrola a ukončení předchozích běžících procesů..."
pkill -f "node" || true
sleep 2

# Nastavení proměnných prostředí
export PORT=8080
export HOST="0.0.0.0"
export NODE_ENV="development"

# Kontrola připojení k databázi
echo "📊 Kontrola připojení k databázi..."
node test-db.js

if [ $? -ne 0 ]; then
  echo "❌ Problém s připojením k databázi. Zkontrolujte nastavení DATABASE_URL."
  exit 1
fi

# Vytvoření potřebných tabulek
echo "🗄️ Kontrola a vytvoření databázových tabulek..."
npx tsx create-tables.ts
npx tsx create-call-analysis-tables.ts
npx tsx create-live-call-sessions.ts
npx tsx create-system-settings.ts

# Kontrola API klíčů
echo "🔑 Kontrola API klíčů..."
if [ -n "$OPENAI_API_KEY" ]; then
  echo "✅ OpenAI API klíč nalezen"
else
  echo "⚠️ OpenAI API klíč není nastaven - některé AI funkce budou omezené"
fi

# Spuštění serveru s optimálním nastavením pro Replit
echo "🚀 Spouštění CRM serveru na portu $PORT..."
node crm-server.js

# Pokud server skončí, zobrazit informaci
echo "⚠️ Server byl ukončen"
echo "Pro opětovné spuštění použijte: node crm-server.js"