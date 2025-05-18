/**
 * Tento skript resetuje heslo administrátora na defaultní hodnotu
 */

import { pool } from "./server/db";
import { hashPassword } from "./server/auth";

async function resetAdminPassword() {
  console.log("Resetuji heslo administrátora...");
  
  try {
    // Vygenerujeme hash pro heslo 'Admin123'
    const newPasswordHash = await hashPassword('Admin123');
    
    // Aktualizujeme heslo pro adminův účet (ID 1 nebo email admin@crm.jnventures.cz)
    const result = await pool.query(
      `UPDATE admin_users SET password = $1 WHERE email = $2 RETURNING id, username, email`,
      [newPasswordHash, 'admin@crm.jnventures.cz']
    );
    
    if (result.rowCount === 0) {
      console.error("Administrátorský účet s emailem admin@crm.jnventures.cz nebyl nalezen!");
      return false;
    }
    
    console.log(`Heslo pro administrátora ${result.rows[0].username} (${result.rows[0].email}) bylo úspěšně resetováno na 'Admin123'`);
    return true;
  } catch (error) {
    console.error("Chyba při resetování hesla:", error);
    return false;
  } finally {
    // Ukončíme pool spojení
    await pool.end();
  }
}

// Spustíme funkci
resetAdminPassword()
  .then(() => {
    console.log("Operace dokončena");
    process.exit(0);
  })
  .catch(err => {
    console.error("Neošetřená chyba:", err);
    process.exit(1);
  });