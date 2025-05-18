# CRM System - Replit Průvodce

## Spuštění aplikace v Replit prostředí

Aplikace vyžaduje běh na portu 3000, aby byla přístupná z webview. Pokud máte problémy se spuštěním nebo dostupností aplikace, postupujte podle těchto kroků:

### 1. Kontrola volných portů

Nejprve ověřte, že potřebné porty jsou volné:

```bash
node port-checker.js
```

Všechny porty (3000, 5000, 8080) by měly být hlášeny jako volné.

### 2. Test přístupnosti portu 3000

Pro ověření, že port 3000 je přístupný z webview, spusťte testovací server:

```bash
node simple-server.js
```

Pokud se v Replit webview zobrazí testovací stránka, port 3000 je správně nastaven a přístupný.

### 3. Spuštění CRM serveru

Pro správné spuštění CRM serveru na portu 3000 použijte:

```bash
node crm-start.js
```

Toto spustí nejprve dočasný server a poté hlavní CRM aplikaci na portu 3000.

### 4. Rychlý start

Pro automatizované ověření a spuštění můžete použít připravený skript:

```bash
./replit-launch.sh
```

Tento skript ukončí všechny běžící procesy, zkontroluje porty a spustí testovací server.

## Řešení problémů

### 1. Port je již používán

Pokud vidíte chybu "EADDRINUSE", znamená to, že port je již používán jiným procesem. Ukončete všechny běžící Node.js procesy:

```bash
pkill -f node
```

### 2. Webview nelze připojit k serveru

Ověřte, že:
- Server běží na portu 3000 (ne 5000)
- Server naslouchá na adrese 0.0.0.0 (ne localhost nebo 127.0.0.1)
- V konfiguračním souboru .replit je správně namapován port 3000

### 3. Replit zablokoval port

Zkuste restartovat Replit prostředí (pomocí tlačítka v menu).

## Konfigurace .replit souboru

Optimální konfigurace .replit souboru by měla obsahovat:

```
[[ports]]
localPort = 3000
externalPort = 3000
```

Toto zajistí, že port 3000 bude správně mapován a přístupný z webview.