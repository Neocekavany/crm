/**
 * Tento skript vypisuje informace o administrátorském účtu
 * Pomůže nám zjistit, jaké je správné uživatelské jméno
 */

import { pool } from "./server/db";

async function debugAdminAccount() {
  console.log("Zjišťuji informace o administrátorském účtu...");
  
  try {
    // Získáme administrátorský účet podle emailu
    const result = await pool.query(
      `SELECT id, username, email, is_active, last_login FROM admin_users WHERE email = $1`,
      ['admin@crm.jnventures.cz']
    );
    
    if (result.rowCount === 0) {
      console.error("Administrátorský účet s emailem admin@crm.jnventures.cz nebyl nalezen!");
      
      // Zkusíme najít jakýkoliv administrátorský účet
      console.log("Hledám jakékoliv administrátorské účty...");
      const allAdmins = await pool.query(`SELECT id, username, email, is_active FROM admin_users LIMIT 5`);
      
      if (allAdmins.rowCount === 0) {
        console.log("V databázi nejsou žádné administrátorské účty!");
      } else {
        console.log("Nalezené administrátorské účty:");
        allAdmins.rows.forEach(admin => {
          console.log(`ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Aktivní: ${admin.is_active}`);
        });
      }
      
      return false;
    }
    
    const admin = result.rows[0];
    console.log("Nalezen administrátorský účet:");
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Aktivní: ${admin.is_active}`);
    console.log(`Poslední přihlášení: ${admin.last_login}`);
    
    // Zjistíme, jaká strategie přihlášení se používá
    console.log("\nKontroluji kód autentizace v auth.ts:");
    console.log("Pro Admin přihlášení se používá strategie 'admin-local', která přijímá 'username', nikoliv 'email'");
    console.log(`Pro přihlášení použijte:\nUživatelské jméno: ${admin.username}\nHeslo: Admin123`);
    
    return true;
  } catch (error) {
    console.error("Chyba při zjišťování informací o administrátorovi:", error);
    return false;
  } finally {
    // Ukončíme pool spojení
    await pool.end();
  }
}

// Spustíme funkci
debugAdminAccount()
  .then(() => {
    console.log("Operace dokončena");
    process.exit(0);
  })
  .catch(err => {
    console.error("Neošetřená chyba:", err);
    process.exit(1);
  });