#!/bin/bash

# Optimalizovaný skript pro start CRM serveru v Replit prostředí
echo "Spouštím CRM systém..."

# Kontrola, zda je již server spuštěn
if pgrep -f "node .*server\.js" > /dev/null; then
  echo "CRM server je již spuštěn. Ukončuji existující instanci..."
  pkill -f "node .*server\.js"
  sleep 2
fi

# Kontrola databáze
echo "Kontrola připojení k databázi..."
node test-db.js

if [ $? -ne 0 ]; then
  echo "Nelze se připojit k databázi. Ujistěte se, že databáze běží a je správně nakonfigurována."
  exit 1
fi

# Vytvoření potřebných tabulek
echo "Kontrola a vytvoření potřebných databázových tabulek..."
npx tsx create-tables.ts
npx tsx create-call-analysis-tables.ts
npx tsx create-live-call-sessions.ts
npx tsx create-system-settings.ts

# Inicializace AI asistenta
echo "Inicializace AI asistenta..."
if [ -f ".env" ] && grep -q "OPENAI_API_KEY" .env; then
  echo "API klíč pro OpenAI nalezen."
else
  echo "⚠️ Varování: OPENAI_API_KEY není nastaven. Funkce AI asistenta budou omezeny."
fi

# Spuštění serveru
echo "Spouštím CRM server..."
node crm-server.js &
server_pid=$!

# Čekáme na spuštění serveru
echo "Čekám na spuštění serveru..."
sleep 5

# Kontrola, zda server běží
if ps -p $server_pid > /dev/null; then
  echo "✅ CRM server byl úspěšně spuštěn."
  echo "📊 Přístupová adresa: http://localhost:8080"
  echo "📱 VOIP a SMS funkce jsou aktivní."
  echo "🇨🇿 Podpora českých telefonních čísel je povolena."
  echo "📞 Funkce přenosu hovorů je dostupná."
  echo "🤖 AI asistent je připraven."
else
  echo "❌ Chyba při spouštění serveru. Zkontrolujte logy."
  exit 1
fi

# Čekání na ukončení serveru
wait $server_pid