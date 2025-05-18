import { db } from './server/db';
import { users, companies } from './shared/schema';
import { comparePasswords } from './server/auth';

async function testLogins() {
  console.log('Testování přihlašovacích údajů...');
  
  // 1. Testování admin účtu
  const admin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, 'Administrator')
  });
  
  if (admin) {
    const adminLoginValid = await comparePasswords('Admin123', admin.password);
    console.log(`Administrator: ${adminLoginValid ? 'Platné' : 'Neplatné'} přihlašovací údaje`);
  } else {
    console.log('Administrator účet nenalezen!');
  }
  
  // 2. Testování BigBuild admin účtu
  const bigbuildAdmin = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, 'bigbuild')
  });
  
  if (bigbuildAdmin) {
    const bigbuildCompany = await db.query.companies.findFirst({
      where: (companies, { eq }) => eq(companies.id, bigbuildAdmin.companyId)
    });
    
    const bigbuildLoginValid = await comparePasswords('bigbuild123', bigbuildAdmin.password);
    console.log(`BigBuild admin (${bigbuildCompany?.name}): ${bigbuildLoginValid ? 'Platné' : 'Neplatné'} přihlašovací údaje`);
  } else {
    console.log('BigBuild admin účet nenalezen!');
  }
  
  // 3. Testování manažera
  const manager = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.username, 'bigbuild_manager')
  });
  
  if (manager) {
    const managerLoginValid = await comparePasswords('manager123', manager.password);
    console.log(`Manažer (${manager.firstName} ${manager.lastName}): ${managerLoginValid ? 'Platné' : 'Neplatné'} přihlašovací údaje`);
  } else {
    console.log('Manažer účet nenalezen!');
  }
  
  // 4. Testování operátorů
  const operators = [
    { username: 'bigbuild_caller1', password: 'operator123', type: 'Navolávač' },
    { username: 'bigbuild_caller2', password: 'operator123', type: 'Navolávač' },
    { username: 'bigbuild_sales1', password: 'operator123', type: 'Obchodník' },
    { username: 'bigbuild_sales2', password: 'operator123', type: 'Obchodník' }
  ];
  
  for (const operatorData of operators) {
    const operator = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, operatorData.username)
    });
    
    if (operator) {
      const operatorLoginValid = await comparePasswords(operatorData.password, operator.password);
      console.log(`${operatorData.type} (${operator.firstName} ${operator.lastName}): ${operatorLoginValid ? 'Platné' : 'Neplatné'} přihlašovací údaje`);
    } else {
      console.log(`${operatorData.type} účet (${operatorData.username}) nenalezen!`);
    }
  }
  
  console.log('\nPro testování webového rozhraní použijte následující přihlašovací údaje:');
  console.log('- Administrator: username=Administrator, password=Admin123');
  console.log('- BigBuild admin: username=bigbuild, password=bigbuild123');
  console.log('- Manažer: username=bigbuild_manager, password=manager123');
  console.log('- Navolávači: username=bigbuild_caller1/bigbuild_caller2, password=operator123');
  console.log('- Obchodníci: username=bigbuild_sales1/bigbuild_sales2, password=operator123');
}

testLogins();