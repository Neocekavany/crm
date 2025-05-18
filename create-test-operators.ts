import { db } from './server/db';
import { companies, users, userRoles } from './shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './server/auth';

async function createTestOperators() {
  console.log('Vytvářím testovací operátory...');
  
  // Získání ID společnosti
  const [company] = await db.select().from(companies).limit(1);
  if (!company) {
    console.error('Nebyla nalezena žádná společnost!');
    process.exit(1);
  }
  
  // Získání role operátora
  const [operatorRole] = await db.select().from(userRoles)
    .where(eq(userRoles.name, 'Operátor'));
  
  if (!operatorRole) {
    console.error('Nebyla nalezena role operátora!');
    process.exit(1);
  }
  
  // Získání role manažera
  const [managerRole] = await db.select().from(userRoles)
    .where(eq(userRoles.name, 'Manažer'));
  
  if (!managerRole) {
    console.error('Nebyla nalezena role manažera!');
    process.exit(1);
  }
  
  // Získání ID manažera
  const [manager] = await db.select().from(users)
    .where(eq(users.roleId, managerRole.id));
  
  if (!manager) {
    console.error('Nebyl nalezen žádný manažer!');
    process.exit(1);
  }
  
  // Seznam operátorů k vytvoření
  const operatorsToCreate = [
    {
      username: 'operator2',
      password: await hashPassword('operator123'),
      email: 'operator2@example.com',
      firstName: 'Jana',
      lastName: 'Nováková',
      companyId: company.id,
      roleId: operatorRole.id,
      managerId: manager.id,
      position: 'Telefonní operátor',
      isActive: true
    },
    {
      username: 'operator3',
      password: await hashPassword('operator123'),
      email: 'operator3@example.com',
      firstName: 'Lukáš',
      lastName: 'Svoboda',
      companyId: company.id,
      roleId: operatorRole.id,
      managerId: manager.id,
      position: 'Telefonní operátor',
      isActive: true
    },
    {
      username: 'operator4',
      password: await hashPassword('operator123'),
      email: 'operator4@example.com',
      firstName: 'Markéta',
      lastName: 'Veselá',
      companyId: company.id,
      roleId: operatorRole.id,
      managerId: manager.id,
      position: 'Telefonní operátor',
      isActive: true
    },
    {
      username: 'operator5',
      password: await hashPassword('operator123'),
      email: 'operator5@example.com',
      firstName: 'Tomáš',
      lastName: 'Dvořák',
      companyId: company.id,
      roleId: operatorRole.id,
      managerId: manager.id,
      position: 'Telefonní operátor',
      isActive: true
    }
  ];
  
  // Vytvoření operátorů
  let createdCount = 0;
  for (const operator of operatorsToCreate) {
    try {
      // Kontrola, zda již existuje
      const existingUser = await db.select().from(users)
        .where(eq(users.username, operator.username));
      
      if (existingUser.length === 0) {
        await db.insert(users).values(operator);
        console.log(`Operátor ${operator.firstName} ${operator.lastName} vytvořen.`);
        createdCount++;
      } else {
        console.log(`Operátor ${operator.username} již existuje, přeskakuji.`);
      }
    } catch (error) {
      console.error(`Chyba při vytváření operátora ${operator.username}:`, error);
    }
  }
  
  console.log(`Vytvořeno ${createdCount} nových operátorů.`);
  process.exit(0);
}

createTestOperators();