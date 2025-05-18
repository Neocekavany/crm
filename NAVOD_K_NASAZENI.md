# Návod k nasazení CRM systému J&N VENTURES S.R.O.

## Obsah
1. Stažení zdrojového kódu
2. Příprava prostředí na serveru
3. Nastavení databáze
4. Konfigurace aplikace
5. Kompilace a nasazení
6. Spuštění aplikace
7. Řešení problémů

## 1. Stažení zdrojového kódu

### Způsob 1: Přímé stažení z Replitu
1. V Replitu klikněte na tlačítko "⋮" (tři tečky) v horní části obrazovky
2. Vyberte "Download as zip"
3. Stáhne se celý projekt jako ZIP soubor
4. Rozbalte ZIP soubor na svém počítači

### Způsob 2: Použití verzovacího systému (doporučeno)
Pokud máte účet na GitHubu nebo jiné Git službě:
1. Vytvořte nový prázdný repozitář
2. V Replitu spusťte následující příkazy:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin URL_VASEHO_REPOZITARE
git push -u origin main
```
3. Poté můžete klonovat repozitář na váš server:
```bash
git clone URL_VASEHO_REPOZITARE
```

## 2. Příprava prostředí na serveru

Systém vyžaduje následující software:
- Node.js (verze 20 nebo vyšší)
- PostgreSQL (verze 14 nebo vyšší)
- npm (získáte s instalací Node.js)

### Instalace Node.js
```bash
# Pro Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Pro CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Instalace PostgreSQL
```bash
# Pro Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Pro CentOS/RHEL
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 3. Nastavení databáze

1. Přihlaste se do PostgreSQL:
```bash
sudo -u postgres psql
```

2. Vytvořte databázi a uživatele:
```sql
CREATE DATABASE crm_jnventures;
CREATE USER crm_user WITH ENCRYPTED PASSWORD 'silne_heslo';
GRANT ALL PRIVILEGES ON DATABASE crm_jnventures TO crm_user;
\c crm_jnventures
GRANT ALL ON SCHEMA public TO crm_user;
\q
```

## 4. Konfigurace aplikace

1. V kořenovém adresáři projektu vytvořte soubor `.env`:
```bash
# Databázové připojení
DATABASE_URL=postgres://crm_user:silne_heslo@localhost:5432/crm_jnventures

# Nastavení serveru
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Zabezpečení
SESSION_SECRET=nahradte_nahodnym_dlouhym_retezcem

# Další nastavení (volitelné)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user
# SMTP_PASS=password
```

2. Upravte konfiguraci podle vašeho serveru a požadavků

## 5. Kompilace a nasazení

1. Nainstalujte závislosti:
```bash
npm install
```

2. Inicializujte databázi:
```bash
npm run db:push
```

3. Vytvořte produkční build:
```bash
npm run build
```

Tento příkaz vygeneruje složku `dist` obsahující produkční verzi aplikace.

## 6. Spuštění aplikace

### Manuální spuštění
```bash
npm run start
```

### Použití správce procesů (doporučeno pro produkční prostředí)
Nainstalujte PM2:
```bash
npm install -g pm2
```

Spusťte aplikaci s PM2:
```bash
pm2 start dist/index.js --name "crm-jnventures"
```

Nastavení automatického restartu při startu serveru:
```bash
pm2 save
pm2 startup
```

## 7. Řešení problémů

### Aplikace se nespustí
- Zkontrolujte, zda máte správnou verzi Node.js:
  ```bash
  node --version
  ```

- Zkontrolujte připojení k databázi:
  ```bash
  psql -U crm_user -h localhost -d crm_jnventures
  ```

- Zkontrolujte logy:
  ```bash
  pm2 logs crm-jnventures
  ```

### Problémy s připojením k databázi
- Ujistěte se, že PostgreSQL běží:
  ```bash
  sudo systemctl status postgresql
  ```

- Zkontrolujte soubor `.env` a ujistěte se, že `DATABASE_URL` obsahuje správné údaje

### Problémy s přístupem k aplikaci
- Zkontrolujte, zda aplikace běží a naslouchá na správném portu:
  ```bash
  netstat -tulpn | grep 3000
  ```

- Zkontrolujte nastavení firewallu:
  ```bash
  sudo ufw status
  ```

- V případě použití reverzního proxy (nginx, Apache) zkontrolujte jeho konfiguraci

---

## Dodatečné informace

### Přihlašovací údaje administrátora
- Uživatelské jméno: `Administrator`
- Heslo: `Admin123`

Doporučujeme ihned po prvním přihlášení změnit heslo administrátora.

### Aktualizace aplikace
Pro aktualizaci aplikace:
1. Stáhněte nejnovější verzi kódu
2. Zastavte běžící aplikaci (`pm2 stop crm-jnventures`)
3. Proveďte kompilaci (`npm run build`)
4. Restartujte aplikaci (`pm2 start crm-jnventures`)

### Zálohování
Doporučujeme pravidelně zálohovat databázi:
```bash
pg_dump -U crm_user -h localhost crm_jnventures > backup_`date +%Y%m%d`.sql
```

Nastavení automatického zálohování pomocí cron:
```bash
0 2 * * * pg_dump -U crm_user -h localhost crm_jnventures > /path/to/backups/backup_`date +%Y%m%d`.sql
```