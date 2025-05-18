import { db } from "./server/db";
import { InsertUserRole, userRoles } from "./shared/schema";
import { eq } from "drizzle-orm";

async function createDefaultRolesIfNotExist() {
  console.log("Kontrola a vytvoření výchozích rolí...");

  const defaultRoles: InsertUserRole[] = [
    {
      name: "Administrátor",
      description: "Administrátor společnosti s plným přístupem k systému",
      permissions: [
        "manage_company",
        "manage_users",
        "manage_teams",
        "manage_clients", 
        "manage_calls",
        "view_reports",
        "manage_billing",
        "manage_settings",
        "manage_client_statuses",
        "manage_call_outcomes",
        "manage_email_templates",
        "manage_api_keys"
      ],
      isDefault: false
    },
    {
      name: "Manažer",
      description: "Manažer týmu s přístupem ke správě týmu a omezeným funkcím",
      permissions: [
        "manage_team",
        "view_team_reports",
        "manage_team_clients",
        "view_team_calls",
        "manage_team_settings"
      ],
      isDefault: false
    },
    {
      name: "Operátor",
      description: "Operátor s přístupem pouze k základním funkcím pro volání",
      permissions: [
        "make_calls",
        "view_assigned_clients",
        "update_client_status"
      ],
      isDefault: true
    },
    {
      name: "Prodejce",
      description: "Prodejce s přístupem k funkcím pro prodej a správu klientů",
      permissions: [
        "view_assigned_clients",
        "update_client_status",
        "create_quotes",
        "view_sales_reports"
      ],
      isDefault: false
    }
  ];

  for (const role of defaultRoles) {
    // Kontrola, zda role již existuje
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.name, role.name));

    if (existingRole.length === 0) {
      console.log(`Vytvářím roli "${role.name}"...`);
      await db.insert(userRoles).values(role);
      console.log(`Role "${role.name}" byla úspěšně vytvořena.`);
    } else {
      console.log(`Role "${role.name}" již existuje.`);
    }
  }

  console.log("Kontrola rolí dokončena.");
}

async function main() {
  try {
    await createDefaultRolesIfNotExist();
    console.log("Výchozí role byly úspěšně vytvořeny nebo zkontrolovány.");
    process.exit(0);
  } catch (error) {
    console.error("Došlo k chybě při vytváření výchozích rolí:", error);
    process.exit(1);
  }
}

main();