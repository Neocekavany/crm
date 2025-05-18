#!/bin/bash

# Optimalizovaný skript pro spuštění CRM aplikace v Replit prostředí
# Upraveno pro stabilní běh a prevenci předčasného ukončení

# Nastavení výchozích proměnných
export HOST="0.0.0.0"  # Pro dostupnost z venku
export PORT="3000"     # Port pro Replit webview
export NODE_ENV="development"
LOG_FILE="server.log"

# Funkce pro výpis zpráv
log() {
  echo -e "$1"
  echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

# Zabití předchozích instancí
kill_previous_instances() {
  log "🛑 Ukončuji předchozí instance serveru..."
  
  # Najdi a ukonči všechny procesy node
  for PID in $(ps aux | grep -E 'node' | grep -v grep | awk '{print $2}'); do
    log "🔄 Ukončuji proces PID: $PID"
    kill -9 $PID 2>/dev/null
  done
  
  # Počkej chvíli, aby se procesy mohly ukončit
  sleep 2
  
  # Kontrola, zda byly všechny procesy skutečně ukončeny
  if ps aux | grep -E 'node' | grep -v grep > /dev/null; then
    log "⚠️ Některé procesy Node.js stále běží..."
  else
    log "✅ Všechny předchozí instance ukončeny"
  fi
}

# Spuštění optimalizovaného serveru
start_server() {
  log "======================================================="
  log "🚀 CRM Server - Replit Edition"
  log "📅 $(date)"
  log "======================================================="
  
  log "🚀 Spouštím CRM server na http://$HOST:$PORT..."
  
  # Použití jednoduchého přímého spuštění
  node start-simple.js
  
  # Alternativní způsoby spuštění, pokud hlavní způsob nefunguje:
  # Varianta 2: Přímé spuštění pomocí tsx
  # npx tsx server/index.ts
  
  # Varianta 3: ES Moduly skript
  # node server-es.js
  
  # Pokud příkaz selže, zobrazit chybovou zprávu
  if [ $? -ne 0 ]; then
    log "❌ Spuštění serveru selhalo! Zkuste alternativy v run.sh"
  fi
}

# Hlavní spouštěcí procedura
main() {
  log "🏁 Spouštím CRM Systém..."
  
  # Ukončení předchozích instancí
  kill_previous_instances
  
  # Pokus o spuštění serveru
  start_server
}

# Zavoláme hlavní funkci
main