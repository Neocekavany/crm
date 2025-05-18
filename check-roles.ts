import { db } from "./server/db";
import { userRoles } from "./shared/schema";

async function checkRoles() {
  console.log("Kontrola dostupných rolí v systému...");
  
  const allRoles = await db.select().from(userRoles);
  
  console.log("Nalezeno celkem rolí:", allRoles.length);
  console.log("Seznam všech rolí:");
  
  allRoles.forEach(role => {
    console.log(`ID: ${role.id}, Název: ${role.name}, Výchozí: ${role.isDefault ? 'Ano' : 'Ne'}`);
    console.log(`  Popis: ${role.description || 'Bez popisu'}`);
    console.log(`  Oprávnění: ${JSON.stringify(role.permissions)}`);
    console.log("-----------------------------------");
  });
}

async function main() {
  try {
    await checkRoles();
    process.exit(0);
  } catch (error) {
    console.error("Chyba při kontrole rolí:", error);
    process.exit(1);
  }
}

main();