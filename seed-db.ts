import { seedDatabase } from "./server/seed";

async function main() {
  console.log("Spouštím inicializaci databáze...");
  try {
    const success = await seedDatabase();
    if (success) {
      console.log("Databáze byla úspěšně inicializována!");
    } else {
      console.error("Nepodařilo se inicializovat databázi.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Chyba při inicializaci databáze:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();