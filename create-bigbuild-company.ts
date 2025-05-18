import { db } from './server/db';
import { companies, users, userRoles, teams, teamMembers } from './shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './server/auth';

async function createBigBuildCompany() {
  console.log('Vytvářím společnost BigBuild s.r.o. s operátory a manažery...');
  
  // 1. Vytvoření rolí, pokud neexistují
  let managerRole = await db.query.userRoles.findFirst({
    where: (userRoles, { eq }) => eq(userRoles.name, 'Manažer')
  });
  
  if (!managerRole) {
    [managerRole] = await db.insert(userRoles).values({
      name: 'Manažer',
      description: 'Manažer společnosti s plným přístupem',
      permissions: ['manage_company', 'manage_users', 'manage_teams', 'manage_clients', 'manage_calls', 'view_statistics'],
      isDefault: false
    }).returning();
    console.log('Role manažera vytvořena.');
  }
  
  let operatorRole = await db.query.userRoles.findFirst({
    where: (userRoles, { eq }) => eq(userRoles.name, 'Operátor')
  });
  
  if (!operatorRole) {
    [operatorRole] = await db.insert(userRoles).values({
      name: 'Operátor',
      description: 'Operátor s přístupem k voláním',
      permissions: ['make_calls', 'view_clients', 'edit_client_data'],
      isDefault: true
    }).returning();
    console.log('Role operátora vytvořena.');
  }
  
  let callerRole = await db.query.userRoles.findFirst({
    where: (userRoles, { eq }) => eq(userRoles.name, 'Navolávač')
  });
  
  if (!callerRole) {
    [callerRole] = await db.insert(userRoles).values({
      name: 'Navolávač',
      description: 'Navolávač s přístupem k prvotním hovorům',
      permissions: ['make_calls', 'view_clients'],
      isDefault: false
    }).returning();
    console.log('Role navolávače vytvořena.');
  }
  
  let salespersonRole = await db.query.userRoles.findFirst({
    where: (userRoles, { eq }) => eq(userRoles.name, 'Obchodník')
  });
  
  if (!salespersonRole) {
    [salespersonRole] = await db.insert(userRoles).values({
      name: 'Obchodník',
      description: 'Obchodník zpracovávající zájemce',
      permissions: ['make_calls', 'view_clients', 'edit_client_data', 'close_deals'],
      isDefault: false
    }).returning();
    console.log('Role obchodníka vytvořena.');
  }
  
  // 2. Vytvoření společnosti BigBuild s.r.o.
  let bigbuild = await db.query.companies.findFirst({
    where: (companies, { eq }) => eq(companies.name, 'BigBuild s.r.o.')
  });
  
  if (!bigbuild) {
    console.log('Vytvářím společnost BigBuild s.r.o...');
    [bigbuild] = await db.insert(companies).values({
      name: 'BigBuild s.r.o.',
      contactPerson: 'Pavel Novák',
      contactEmail: 'info@bigbuild.cz',
      contactPhone: '+420 777 888 999',
      address: 'Stavební 123',
      city: 'Praha',
      postalCode: '14000',
      country: 'Česká republika',
      isActive: true,
      settings: {
        activeOperators: 5,
        useCallRecording: true,
        useAdvancedStats: true,
        useApi: false
      },
      billingInfo: {
        paymentMethod: 'bank_transfer',
        taxId: 'CZ12345678',
        vatId: 'CZ12345678',
        bankAccount: '1234567890/0800'
      }
    }).returning();
    console.log('Společnost BigBuild s.r.o. vytvořena.');
  } else {
    console.log('Společnost BigBuild s.r.o. již existuje.');
  }
  
  // 3. Vytvoření firemního administrátora
  let bigbuildAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, 'bigbuild')
  });
  
  if (!bigbuildAdmin) {
    console.log('Vytvářím firemního administrátora...');
    const adminPassword = await hashPassword('bigbuild123');
    [bigbuildAdmin] = await db.insert(users).values({
      username: 'bigbuild',
      password: adminPassword,
      email: 'admin@bigbuild.cz',
      firstName: 'Admin',
      lastName: 'BigBuild',
      companyId: bigbuild.id,
      roleId: managerRole.id,
      position: 'Vedoucí společnosti',
      isActive: true
    }).returning();
    console.log('Firemní administrátor vytvořen.');
  } else {
    console.log('Firemní administrátor již existuje.');
  }
  
  // 4. Vytvoření manažera
  let bigbuildManager = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, 'bigbuild_manager')
  });
  
  if (!bigbuildManager) {
    console.log('Vytvářím manažera...');
    const managerPassword = await hashPassword('manager123');
    [bigbuildManager] = await db.insert(users).values({
      username: 'bigbuild_manager',
      password: managerPassword,
      email: 'manager@bigbuild.cz',
      firstName: 'Jan',
      lastName: 'Manažer',
      companyId: bigbuild.id,
      roleId: managerRole.id,
      position: 'Projektový manažer',
      isActive: true
    }).returning();
    console.log('Manažer vytvořen.');
  } else {
    console.log('Manažer již existuje.');
  }
  
  // 5. Vytvoření týmu
  let salesTeam = await db.query.teams.findFirst({
    where: (teams, { eq, and }) => 
      and(
        eq(teams.name, 'Obchodní tým BigBuild'),
        eq(teams.companyId, bigbuild.id)
      )
  });
  
  if (!salesTeam) {
    console.log('Vytvářím obchodní tým...');
    [salesTeam] = await db.insert(teams).values({
      name: 'Obchodní tým BigBuild',
      description: 'Hlavní obchodní tým společnosti BigBuild',
      companyId: bigbuild.id,
      managerId: bigbuildManager.id,
      isActive: true
    }).returning();
    console.log('Obchodní tým vytvořen.');
  } else {
    console.log('Obchodní tým již existuje.');
  }
  
  // 6. Vytvoření operátorů - navolávači a obchodníci
  const operatorsToCreate = [
    {
      username: 'bigbuild_caller1',
      password: await hashPassword('operator123'),
      email: 'caller1@bigbuild.cz',
      firstName: 'Petr',
      lastName: 'Volávač',
      companyId: bigbuild.id,
      roleId: callerRole.id,
      managerId: bigbuildManager.id,
      position: 'Navolávač',
      isActive: true
    },
    {
      username: 'bigbuild_caller2',
      password: await hashPassword('operator123'),
      email: 'caller2@bigbuild.cz',
      firstName: 'Lucie',
      lastName: 'Volávačová',
      companyId: bigbuild.id,
      roleId: callerRole.id,
      managerId: bigbuildManager.id,
      position: 'Navolávač',
      isActive: true
    },
    {
      username: 'bigbuild_sales1',
      password: await hashPassword('operator123'),
      email: 'sales1@bigbuild.cz',
      firstName: 'Tomáš',
      lastName: 'Prodejní',
      companyId: bigbuild.id,
      roleId: salespersonRole.id,
      managerId: bigbuildManager.id,
      position: 'Obchodník',
      isActive: true
    },
    {
      username: 'bigbuild_sales2',
      password: await hashPassword('operator123'),
      email: 'sales2@bigbuild.cz',
      firstName: 'Eva',
      lastName: 'Prodejní',
      companyId: bigbuild.id,
      roleId: salespersonRole.id,
      managerId: bigbuildManager.id,
      position: 'Obchodník',
      isActive: true
    }
  ];
  
  // Vytvoření operátorů
  let createdCount = 0;
  const createdOperators = [];
  
  for (const operator of operatorsToCreate) {
    try {
      // Kontrola, zda již existuje
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, operator.username)
      });
      
      if (!existingUser) {
        const [newOperator] = await db.insert(users).values(operator).returning();
        console.log(`Operátor ${operator.firstName} ${operator.lastName} vytvořen.`);
        createdCount++;
        createdOperators.push(newOperator);
        
        // Přidání operátora do týmu
        await db.insert(teamMembers).values({
          teamId: salesTeam.id,
          userId: newOperator.id,
          role: operator.position
        });
        console.log(`Operátor ${operator.firstName} ${operator.lastName} přidán do týmu.`);
      } else {
        console.log(`Operátor ${operator.username} již existuje, přeskakuji.`);
        
        // Kontrola, zda je v týmu
        const teamMember = await db.query.teamMembers.findFirst({
          where: (teamMembers, { eq, and }) => 
            and(
              eq(teamMembers.teamId, salesTeam.id),
              eq(teamMembers.userId, existingUser.id)
            )
        });
        
        if (!teamMember) {
          await db.insert(teamMembers).values({
            teamId: salesTeam.id,
            userId: existingUser.id,
            role: operator.position
          });
          console.log(`Operátor ${operator.firstName} ${operator.lastName} přidán do týmu.`);
        }
      }
    } catch (error) {
      console.error(`Chyba při vytváření operátora ${operator.username}:`, error);
    }
  }
  
  console.log(`\n===== INFORMACE O VYTVOŘENÍ =====`);
  console.log(`Společnost: BigBuild s.r.o.`);
  console.log(`Firemní admin: uživatelské jméno: bigbuild, heslo: bigbuild123`);
  console.log(`Manažer: uživatelské jméno: bigbuild_manager, heslo: manager123`);
  console.log(`Navolávači: uživatelské jméno: bigbuild_caller1, bigbuild_caller2, heslo: operator123`);
  console.log(`Obchodníci: uživatelské jméno: bigbuild_sales1, bigbuild_sales2, heslo: operator123`);
  console.log(`\nVytvořeno ${createdCount} nových operátorů.`);
  console.log(`\nPřihlaste se jako admin (Administrator/Admin123) a aktivujte předplatné pro BigBuild s.r.o.`);
  console.log(`Pak se můžete přihlásit jako firemní admin (bigbuild/bigbuild123).`);
  
  process.exit(0);
}

createBigBuildCompany();