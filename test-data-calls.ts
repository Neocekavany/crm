import { db } from './server/db';
import { liveCallSessions, companies, users, clients } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function createTestData() {
  console.log('Creating test data for call monitoring...');
  
  // Kontrola existujících dat
  const existingCompanies = await db.select().from(companies);
  if (existingCompanies.length === 0) {
    console.error('No companies found in database. Please create at least one company first.');
    process.exit(1);
  }
  
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.error('No users found in database. Please create at least one user first.');
    process.exit(1);
  }
  
  const existingClients = await db.select().from(clients);
  if (existingClients.length === 0) {
    console.error('No clients found in database. Please create at least one client first.');
    process.exit(1);
  }

  const exampleCompany = existingCompanies[0];
  
  // Najdeme uživatele, kteří patří do vybrané společnosti
  const companyUsers = existingUsers.filter(user => user.companyId === exampleCompany.id);
  if (companyUsers.length === 0) {
    console.error(`No users found for company ID ${exampleCompany.id}`);
    process.exit(1);
  }
  
  // Najdeme klienty, kteří patří do vybrané společnosti
  const companyClients = existingClients.filter(client => client.companyId === exampleCompany.id);
  if (companyClients.length === 0) {
    console.error(`No clients found for company ID ${exampleCompany.id}`);
    process.exit(1);
  }
  
  // Vytvoříme několik aktivních hovorů
  const activeCallsData = [
    {
      companyId: exampleCompany.id,
      userId: companyUsers[0].id,
      clientId: companyClients[0].id,
      sessionId: `session-${Date.now()}-1`,
      status: 'active',
      startTime: new Date(),
      recordingStatus: 'recording',
    },
    {
      companyId: exampleCompany.id,
      userId: companyUsers.length > 1 ? companyUsers[1].id : companyUsers[0].id,
      clientId: companyClients.length > 1 ? companyClients[1].id : companyClients[0].id,
      sessionId: `session-${Date.now()}-2`,
      status: 'active',
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minut zpět
      recordingStatus: 'recording',
    }
  ];
  
  // Vytvoříme několik dokončených hovorů
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const completedCallsData = [
    {
      companyId: exampleCompany.id,
      userId: companyUsers[0].id,
      clientId: companyClients[0].id,
      sessionId: `session-${Date.now()}-3`,
      status: 'completed',
      startTime: tenMinutesAgo,
      endTime: new Date(tenMinutesAgo.getTime() + 5 * 60 * 1000), // 5 minut trvání
      recordingStatus: 'completed',
      recordingUrl: 'https://example.com/recordings/call1.mp3',
    },
    {
      companyId: exampleCompany.id,
      userId: companyUsers.length > 1 ? companyUsers[1].id : companyUsers[0].id,
      clientId: companyClients.length > 1 ? companyClients[1].id : companyClients[0].id,
      sessionId: `session-${Date.now()}-4`,
      status: 'completed',
      startTime: oneHourAgo,
      endTime: new Date(oneHourAgo.getTime() + 15 * 60 * 1000), // 15 minut trvání
      recordingStatus: 'completed',
      recordingUrl: 'https://example.com/recordings/call2.mp3',
    },
    {
      companyId: exampleCompany.id,
      userId: companyUsers[0].id,
      clientId: companyClients.length > 2 ? companyClients[2].id : companyClients[0].id,
      sessionId: `session-${Date.now()}-5`,
      status: 'completed',
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 8 * 60 * 1000), // 8 minut trvání
      recordingStatus: 'failed',
      recordingUrl: null,
    }
  ];
  
  // Vložíme data do databáze
  try {
    // Nejprve vymazání existujících testovacích hovorů
    await db.delete(liveCallSessions)
      .where(sql`${liveCallSessions.sessionId} LIKE 'session-%'`);
    
    console.log('Inserting active calls...');
    for (const callData of activeCallsData) {
      await db.insert(liveCallSessions).values(callData);
    }
    
    console.log('Inserting completed calls...');
    for (const callData of completedCallsData) {
      await db.insert(liveCallSessions).values(callData);
    }
    
    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  }
  
  process.exit(0);
}

createTestData();