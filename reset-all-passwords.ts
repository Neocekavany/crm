import { pool } from "./server/db";
import { hashPassword } from "./server/auth";

async function resetAllPasswords() {
  try {
    console.log("Resetuji všechna hesla v systému...");
    
    // Ověření připojení k databázi
    console.log("Připojuji se k databázi...");
    await pool.query("SELECT 1");
    console.log("Připojení k databázi úspěšné.");

    // Změna hesla administrátora
    const adminPassword = "Admin123";
    const hashedAdminPassword = await hashPassword(adminPassword);
    
    const { rowCount: adminResult } = await pool.query(
      "UPDATE admin_users SET password = $1 WHERE username = $2",
      [hashedAdminPassword, "Administrator"]
    );
    
    console.log(`Změněno heslo pro ${adminResult} administrátorských účtů.`);

    // Změna hesla pro firmu BigBuild
    const companyPassword = "bigbuild123";
    const hashedCompanyPassword = await hashPassword(companyPassword);
    
    const { rowCount: companyResult } = await pool.query(
      "UPDATE users SET password = $1 WHERE username = $2",
      [hashedCompanyPassword, "bigbuild"]
    );
    
    console.log(`Změněno heslo pro ${companyResult} firemních účtů (bigbuild).`);

    // Změna hesla pro manažera BigBuild
    const managerPassword = "manager123";
    const hashedManagerPassword = await hashPassword(managerPassword);
    
    const { rowCount: managerResult } = await pool.query(
      "UPDATE users SET password = $1 WHERE username = $2",
      [hashedManagerPassword, "bigbuild_manager"]
    );
    
    console.log(`Změněno heslo pro ${managerResult} manažerských účtů (bigbuild_manager).`);

    // Změna hesla pro operátory BigBuild
    const operatorPassword = "operator123";
    const hashedOperatorPassword = await hashPassword(operatorPassword);
    
    // Nastavení hesla pro všechny operátory začínající s 'bigbuild_'
    const { rowCount: operatorResult } = await pool.query(
      "UPDATE users SET password = $1 WHERE username LIKE 'bigbuild\_caller%' OR username LIKE 'bigbuild\_sales%' ESCAPE '\\'",
      [hashedOperatorPassword]
    );
    
    console.log(`Změněno heslo pro ${operatorResult} operátorských účtů.`);

    console.log("\nVšechna hesla byla úspěšně resetována.");
    console.log("\nPřihlašovací údaje:");
    console.log("====================");
    console.log("Administrator - Admin123 (administrátorský panel)");
    console.log("bigbuild - bigbuild123 (firemní panel)");
    console.log("bigbuild_manager - manager123 (manažerský panel)");
    console.log("bigbuild_caller1, bigbuild_sales1 - operator123 (operátorský panel)");
  } catch (error) {
    console.error("Chyba při resetování hesel:", error);
  } finally {
    // Ukončení připojení k databázi
    await pool.end();
  }
}

// Spuštění funkce
resetAllPasswords();