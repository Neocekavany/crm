#!/bin/bash

# Jednoduchý skript pro spuštění CRM serveru v Replit prostředí
# Tento skript by měl být spuštěn přímo z terminálu v Replitu
# Zaručuje, že server bude běžet na správném portu

# Nejprve ukončíme všechny node.js procesy
echo "🛑 Ukončuji všechny běžící Node.js procesy..."
pkill -f node || true
pkill -f server.js || true
pkill -f simple-server.js || true
sleep 2

# Zkontrolujeme, zda jsou porty volné
echo "🔍 Kontroluji dostupnost portů..."
node port-checker.js

# Spustíme testovací server pro ověření, že port 3000 je přístupný z webview
echo "🧪 Spouštím testovací server na portu 3000..."
echo "📢 Zkuste otevřít Replit webview pro ověření, že port 3000 je přístupný"
echo "🌐 Po úspěšném ověření stiskněte Ctrl+C a pak spusťte 'node crm-start.js'"

# Spustíme jednoduchý server a čekáme na uživatelský vstup
node simple-server.js