# CRM System Deployment Guide (English)

## Table of Contents
1. Source Code Download
2. Server Environment Setup
3. Database Configuration
4. Application Configuration
5. Build and Deployment
6. Application Launch
7. Troubleshooting

## 1. Source Code Download

### Method 1: Direct Download from Replit
1. In Replit, click the "⋮" (three dots) button at the top of the screen
2. Select "Download as zip"
3. The entire project will be downloaded as a ZIP file
4. Extract the ZIP file on your computer

### Method 2: Using a Version Control System (recommended)
If you have a GitHub account or other Git service:
1. Create a new empty repository
2. In Replit, run the following commands:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```
3. Then you can clone the repository to your server:
```bash
git clone YOUR_REPOSITORY_URL
```

## 2. Server Environment Setup

The system requires the following software:
- Node.js (version 20 or higher)
- PostgreSQL (version 14 or higher)
- npm (comes with Node.js installation)

### Installing Node.js
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# For CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Installing PostgreSQL
```bash
# For Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# For CentOS/RHEL
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 3. Database Configuration

1. Log in to PostgreSQL:
```bash
sudo -u postgres psql
```

2. Create a database and user:
```sql
CREATE DATABASE crm_jnventures;
CREATE USER crm_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE crm_jnventures TO crm_user;
\c crm_jnventures
GRANT ALL ON SCHEMA public TO crm_user;
\q
```

## 4. Application Configuration

1. In the project's root directory, create a `.env` file:
```bash
# Database connection
DATABASE_URL=postgres://crm_user:strong_password@localhost:5432/crm_jnventures

# Server settings
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Security
SESSION_SECRET=replace_with_random_long_string

# Additional settings (optional)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user
# SMTP_PASS=password
```

2. Adjust the configuration according to your server and requirements

## 5. Build and Deployment

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run db:push
```

3. Create a production build:
```bash
npm run build
```

This command generates a `dist` folder containing the production version of the application.

## 6. Application Launch

### Manual Launch
```bash
npm run start
```

### Using a Process Manager (recommended for production)
Install PM2:
```bash
npm install -g pm2
```

Launch the application with PM2:
```bash
pm2 start dist/index.js --name "crm-jnventures"
```

Set up automatic restart at server startup:
```bash
pm2 save
pm2 startup
```

## 7. Troubleshooting

### Application Won't Start
- Check if you have the correct Node.js version:
  ```bash
  node --version
  ```

- Check database connection:
  ```bash
  psql -U crm_user -h localhost -d crm_jnventures
  ```

- Check logs:
  ```bash
  pm2 logs crm-jnventures
  ```

### Database Connection Issues
- Make sure PostgreSQL is running:
  ```bash
  sudo systemctl status postgresql
  ```

- Check the `.env` file and make sure `DATABASE_URL` contains the correct information

### Application Access Issues
- Check if the application is running and listening on the correct port:
  ```bash
  netstat -tulpn | grep 3000
  ```

- Check firewall settings:
  ```bash
  sudo ufw status
  ```

- If using a reverse proxy (nginx, Apache), check its configuration

---

## Additional Information

### Administrator Credentials
- Username: `Administrator`
- Password: `Admin123`

We recommend changing the administrator password immediately after first login.

### Application Updates
To update the application:
1. Download the latest version of the code
2. Stop the running application (`pm2 stop crm-jnventures`)
3. Perform compilation (`npm run build`)
4. Restart the application (`pm2 start crm-jnventures`)

### Backup
We recommend regularly backing up the database:
```bash
pg_dump -U crm_user -h localhost crm_jnventures > backup_`date +%Y%m%d`.sql
```

Setting up automatic backup using cron:
```bash
0 2 * * * pg_dump -U crm_user -h localhost crm_jnventures > /path/to/backups/backup_`date +%Y%m%d`.sql
```