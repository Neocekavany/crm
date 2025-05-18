import { pool } from "./server/db";
import { hashPassword } from "./server/auth";

async function changeAdminPassword(newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 8) {
      console.error("Heslo musí mít alespoň 8 znaků!");
      process.exit(1);
    }

    // Ověření připojení k databázi
    console.log("Připojuji se k databázi...");
    await pool.query("SELECT 1");
    console.log("Připojení k databázi úspěšné.");

    // Zjištění, zda existuje admin účet
    const { rows: admins } = await pool.query("SELECT id, username FROM admin_users");
    
    if (admins.length === 0) {
      console.error("V databázi neexistuje žádný admin účet!");
      process.exit(1);
    }

    console.log("Nalezené admin účty:");
    admins.forEach((admin) => {
      console.log(`ID: ${admin.id}, Username: ${admin.username}`);
    });

    // Použijeme první admin účet (hlavní administrátor)
    const adminId = 1;

    // Hashování hesla a uložení
    const hashedPassword = await hashPassword(newPassword);
    await pool.query(
      "UPDATE admin_users SET password = $1 WHERE id = $2", 
      [hashedPassword, adminId]
    );

    console.log("\nHeslo bylo úspěšně změněno.");
    console.log("Nyní se můžete přihlásit do admin panelu s novým heslem.");
  } catch (error) {
    console.error("Chyba při změně hesla:", error);
    process.exit(1);
  } finally {
    // Ukončení připojení k databázi
    await pool.end();
  }
}

// Získání hesla z argumentů příkazové řádky
const newPassword = process.argv[2];

if (!newPassword) {
  console.error("Použití: npx tsx admin-password.ts VASE_NOVE_HESLO");
  process.exit(1);
}

// Spuštění funkce
changeAdminPassword(newPassword);