import { db } from './server/db';
import { companies, users, teams, teamMembers } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkBigBuildCompany() {
  console.log('Zjišťuji podrobnosti o společnosti BigBuild s.r.o...');
  
  // Najít společnost
  const company = await db.query.companies.findFirst({
    where: (companies, { eq }) => eq(companies.name, 'BigBuild s.r.o.')
  });
  
  if (!company) {
    console.log('Společnost BigBuild s.r.o. nebyla nalezena!');
    return;
  }
  
  console.log('\n===== SPOLEČNOST =====');
  console.log(`Název: ${company.name}`);
  console.log(`ID: ${company.id}`);
  console.log(`Kontaktní osoba: ${company.contactPerson}`);
  console.log(`Email: ${company.contactEmail}`);
  console.log(`Telefon: ${company.contactPhone}`);
  console.log(`Adresa: ${company.address}, ${company.city}, ${company.postalCode}, ${company.country}`);
  console.log(`Aktivní: ${company.isActive ? 'Ano' : 'Ne'}`);
  
  if (company.settings) {
    console.log('\n===== NASTAVENÍ =====');
    console.log(`Aktivní operátoři: ${company.settings.activeOperators || 'Neuvedeno'}`);
    console.log(`Nahrávání hovorů: ${company.settings.useCallRecording ? 'Aktivní' : 'Neaktivní'}`);
    console.log(`Pokročilé statistiky: ${company.settings.useAdvancedStats ? 'Aktivní' : 'Neaktivní'}`);
    console.log(`API přístup: ${company.settings.useApi ? 'Aktivní' : 'Neaktivní'}`);
  }
  
  // Najít uživatele společnosti
  const companyUsers = await db.query.users.findMany({
    where: (users, { eq }) => eq(users.companyId, company.id)
  });
  
  if (companyUsers.length === 0) {
    console.log('\nŽádní uživatelé této společnosti nebyli nalezeni!');
    return;
  }
  
  console.log('\n===== UŽIVATELÉ SPOLEČNOSTI =====');
  
  for (const user of companyUsers) {
    const role = await db.query.userRoles.findFirst({
      where: (roles, { eq }) => eq(roles.id, user.roleId)
    });
    
    console.log(`\n--- ${user.firstName} ${user.lastName} (${user.username}) ---`);
    console.log(`Role: ${role?.name || 'Neurčena'}`);
    console.log(`Pozice: ${user.position || 'Neuvedena'}`);
    console.log(`Email: ${user.email}`);
    console.log(`Aktivní: ${user.isActive ? 'Ano' : 'Ne'}`);
    
    if (role?.name === 'Manažer') {
      // Najít týmy, které manažer spravuje
      const managedTeams = await db.query.teams.findMany({
        where: (teams, { eq }) => eq(teams.managerId, user.id)
      });
      
      if (managedTeams.length > 0) {
        console.log(`\nSpravované týmy:`);
        for (const team of managedTeams) {
          console.log(`- ${team.name}`);
          
          // Najít členy týmu
          const members = await db.query.teamMembers.findMany({
            where: (teamMembers, { eq }) => eq(teamMembers.teamId, team.id)
          });
          
          if (members.length > 0) {
            console.log(`  Počet členů: ${members.length}`);
            for (const member of members) {
              const memberUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.id, member.userId)
              });
              
              if (memberUser) {
                const memberRole = await db.query.userRoles.findFirst({
                  where: (roles, { eq }) => eq(roles.id, memberUser.roleId)
                });
                
                console.log(`  - ${memberUser.firstName} ${memberUser.lastName} (${memberRole?.name || 'Neurčena role'})`);
              }
            }
          } else {
            console.log(`  Tým nemá žádné členy!`);
          }
        }
      }
    }
  }
  
  console.log('\n===== PŘIHLAŠOVACÍ ÚDAJE =====');
  console.log('- BigBuild admin: username=bigbuild, password=bigbuild123');
  console.log('- Manažer: username=bigbuild_manager, password=manager123');
  console.log('- Navolávači: username=bigbuild_caller1/bigbuild_caller2, password=operator123');
  console.log('- Obchodníci: username=bigbuild_sales1/bigbuild_sales2, password=operator123');
}

checkBigBuildCompany();