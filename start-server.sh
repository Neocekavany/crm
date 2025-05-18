#!/bin/bash

# Ukončíme všechny existující instance serveru
pkill -f "tsx server/index.ts" || true

# Nastavení prostředí
export NODE_ENV=development

echo "============================================="
echo "🚀 Spouštím CRM aplikaci v režimu vývoje"
echo "📅 Čas: $(date)"
echo "💻 Node.js verze: $(node -v)"
echo "📦 NPM verze: $(npm -v)"
echo "============================================="

# Spustíme aplikaci s explicitním nastavením hosta
HOST=0.0.0.0 exec npx tsx server/index.ts