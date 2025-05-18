#!/bin/bash

# Jednoduchý spouštěcí skript pro CRM v Replit
# - Používá port 8080
# - Zajišťuje spuštění databázových tabulek
# - Spouští CRM server s příslušným nastavením

echo "=========================================="
echo "🚀 Spouštění CRM serveru - port 8080"
echo "=========================================="

# Nastavení proměnných prostředí
export PORT=8080
export HOST="0.0.0.0"
export NODE_ENV="development"

# Příprava databáze
echo "📊 Připravuji databázi..."
npx tsx create-tables.ts
npx tsx create-call-analysis-tables.ts
npx tsx create-live-call-sessions.ts
npx tsx create-system-settings.ts

# Spuštění serveru
echo "🌐 Spouštím server..."
node crm-server.js