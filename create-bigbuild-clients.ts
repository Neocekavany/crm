import { db } from './server/db';
import { clients, companies, clientStatusCategories, clientStatuses } from './shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Skript pro vytvoření testovacích klientů pro BigBuild společnost
 */

// Testovací klienti pro BigBuild
const TEST_CLIENTS = [
  {
    firstName: 'Petr',
    lastName: 'Horák',
    email: 'petr.horak@example.com',
    phone: '+420 777 111 222',
    address: 'Lipová 456',
    city: 'Praha',
    postalCode: '15000',
    country: 'Česká republika',
    notes: 'Zajímá se o rekonstrukci kuchyně',
    source: 'web',
    category: 'Zájemce',
    status: 'Aktivní',
    isActive: true
  },
  {
    firstName: 'Anna',
    lastName: 'Dvořáková',
    email: 'anna.dvorakova@example.com',
    phone: '+420 777 222 333',
    address: 'Dubová 789',
    city: 'Brno',
    postalCode: '60200',
    country: 'Česká republika',
    notes: 'Potenciální zájem o renovaci koupelny, cenově citlivá',
    source: 'doporučení',
    category: 'Zájemce',
    status: 'První kontakt',
    isActive: true
  },
  {
    firstName: 'Martin',
    lastName: 'Němec',
    email: 'martin.nemec@example.com',
    phone: '+420 777 333 444',
    address: 'Javorová 123',
    city: 'Ostrava',
    postalCode: '70200',
    country: 'Česká republika',
    notes: 'Nerozhodný, zajímá se o přístavbu garáže',
    source: 'telemarketing',
    category: 'Zájemce',
    status: 'Probíhá jednání',
    isActive: true
  },
  {
    firstName: 'Lucie',
    lastName: 'Nováková',
    email: 'lucie.novakova@example.com',
    phone: '+420 777 444 555',
    address: 'Březová 321',
    city: 'Plzeň',
    postalCode: '30100',
    country: 'Česká republika',
    notes: 'Zájem o stavbu rodinného domu na klíč',
    source: 'doporučení',
    category: 'Zájemce',
    status: 'Příprava nabídky',
    isActive: true
  },
  {
    firstName: 'Jan',
    lastName: 'Veselý',
    email: 'jan.vesely@example.com',
    phone: '+420 777 555 666',
    address: 'Smrková 654',
    city: 'České Budějovice',
    postalCode: '37001',
    country: 'Česká republika',
    notes: 'Potenciální obchodní partner, zájem o spolupráci na větších projektech',
    source: 'networking',
    category: 'Business',
    status: 'Aktivní',
    isActive: true
  },
  {
    firstName: 'Petra',
    lastName: 'Marková',
    email: 'petra.markova@example.com',
    phone: '+420 777 666 777',
    address: 'Kaštanová 987',
    city: 'Olomouc',
    postalCode: '77900',
    country: 'Česká republika',
    notes: 'Má rozpočet 500 000 Kč na renovaci kuchyně a obývacího pokoje',
    source: 'web',
    category: 'VIP',
    status: 'Vyjednávání',
    isActive: true
  },
  {
    firstName: 'Tomáš',
    lastName: 'Procházka',
    email: 'tomas.prochazka@example.com',
    phone: '+420 777 777 888',
    address: 'Borovicová 159',
    city: 'Hradec Králové',
    postalCode: '50002',
    country: 'Česká republika',
    notes: 'Dříve odmítl nabídku, nyní znovu kontaktován',
    source: 'telemarketing',
    category: 'Zájemce',
    status: 'Reaktivace',
    isActive: true
  },
  {
    firstName: 'Kateřina',
    lastName: 'Šimková',
    email: 'katerina.simkova@example.com',
    phone: '+420 777 888 999',
    address: 'Jedlová 753',
    city: 'Liberec',
    postalCode: '46001',
    country: 'Česká republika',
    notes: 'Spolumajitelka realitní kanceláře, zájem o dlouhodobou spolupráci',
    source: 'networking',
    category: 'Business',
    status: 'Uzavřeno',
    isActive: true
  },
  {
    firstName: 'David',
    lastName: 'Kučera',
    email: 'david.kucera@example.com',
    phone: '+420 777 999 000',
    address: 'Modřínová 852',
    city: 'Zlín',
    postalCode: '76001',
    country: 'Česká republika',
    notes: 'Investor, zájem o rekonstrukci činžovního domu',
    source: 'doporučení',
    category: 'VIP',
    status: 'Příprava nabídky',
    isActive: true
  },
  {
    firstName: 'Tereza',
    lastName: 'Králová',
    email: 'tereza.kralova@example.com',
    phone: '+420 777 000 111',
    address: 'Ořechová 951',
    city: 'Pardubice',
    postalCode: '53002',
    country: 'Česká republika',
    notes: 'Stavební inženýrka, konzultant, potenciální spolupráce',
    source: 'konference',
    category: 'Business',
    status: 'První kontakt',
    isActive: true
  }
];

async function createBigBuildClients() {
  console.log('Vytvářím testovací klienty pro BigBuild společnost...');
  
  try {
    // 1. Najdeme BigBuild společnost
    const bigBuild = await db.query.companies.findFirst({
      where: eq(companies.name, 'BigBuild s.r.o.')
    });
    
    if (!bigBuild) {
      throw new Error('BigBuild společnost nebyla nalezena! Nejprve spusťte create-bigbuild-company.ts');
    }
    
    console.log(`Nalezena společnost BigBuild s ID: ${bigBuild.id}`);
    
    // 2. Kontrola, zda existují potřebné kategorie a statusy klientů
    // Kategorie
    const requiredCategories = ['Zájemce', 'VIP', 'Business'];
    for (const categoryName of requiredCategories) {
      const existingCategory = await db.query.clientStatusCategories.findFirst({
        where: eq(clientStatusCategories.name, categoryName)
      });
      
      if (!existingCategory) {
        await db.insert(clientStatusCategories).values({
          name: categoryName,
          color: categoryName === 'Zájemce' ? '#3498db' : (categoryName === 'VIP' ? '#e74c3c' : '#2ecc71'),
          companyId: bigBuild.id
        });
        console.log(`Vytvořena kategorie klientů: ${categoryName}`);
      }
    }
    
    // Statusy
    const requiredStatuses = ['Aktivní', 'První kontakt', 'Probíhá jednání', 'Příprava nabídky', 'Vyjednávání', 'Reaktivace', 'Uzavřeno'];
    for (const statusName of requiredStatuses) {
      const existingStatus = await db.query.clientStatuses.findFirst({
        where: eq(clientStatuses.name, statusName)
      });
      
      if (!existingStatus) {
        await db.insert(clientStatuses).values({
          name: statusName,
          color: getStatusColor(statusName),
          companyId: bigBuild.id
        });
        console.log(`Vytvořen status klientů: ${statusName}`);
      }
    }
    
    // 3. Vložení klientů
    let createdCount = 0;
    
    for (const clientData of TEST_CLIENTS) {
      // Kontrola, zda klient již existuje
      const existingClient = await db.query.clients.findFirst({
        where: eq(clients.email, clientData.email)
      });
      
      if (!existingClient) {
        // Získání ID pro kategorii a status
        const category = await db.query.clientStatusCategories.findFirst({
          where: eq(clientStatusCategories.name, clientData.category)
        });
        
        const status = await db.query.clientStatuses.findFirst({
          where: eq(clientStatuses.name, clientData.status)
        });
        
        // Vložení klienta
        await db.insert(clients).values({
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          city: clientData.city,
          postalCode: clientData.postalCode,
          country: clientData.country,
          notes: clientData.notes,
          source: clientData.source,
          isActive: clientData.isActive,
          companyId: bigBuild.id,
          statusId: status?.id,
          categoryId: category?.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        createdCount++;
        console.log(`Vytvořen klient: ${clientData.firstName} ${clientData.lastName}`);
      } else {
        console.log(`Klient ${clientData.firstName} ${clientData.lastName} již existuje, přeskakuji.`);
      }
    }
    
    console.log(`\n===== HOTOVO =====`);
    console.log(`Vytvořeno ${createdCount} nových klientů pro BigBuild s.r.o.`);
    console.log(`Celkem by mělo být k dispozici ${TEST_CLIENTS.length} testovacích klientů.`);
    
  } catch (error) {
    console.error('Chyba při vytváření klientů:', error);
  }
  
  process.exit(0);
}

// Pomocná funkce pro přiřazení barvy statusu
function getStatusColor(status: string): string {
  switch (status) {
    case 'Aktivní': return '#3498db'; // modrá
    case 'První kontakt': return '#9b59b6'; // fialová
    case 'Probíhá jednání': return '#f1c40f'; // žlutá
    case 'Příprava nabídky': return '#e67e22'; // oranžová
    case 'Vyjednávání': return '#d35400'; // tmavě oranžová
    case 'Reaktivace': return '#27ae60'; // zelená
    case 'Uzavřeno': return '#2c3e50'; // tmavě modrá
    default: return '#95a5a6'; // šedá
  }
}

createBigBuildClients();