import { seedDatabase } from './server/seed';
import { db } from './server/db';
import { liveCallSessions, companies, users, calls, clients, callOutcomes, systemSettings } from './shared/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Define default pricing structure
const defaultPricing = {
  baseMonthlyFee: 5000,
  operatorFee: 1000,
  additionalFees: {
    callRecording: 500,
    advancedStats: 1000,
    api: 2000,
    emotionAnalysis: 3000
  }
};

// Define default operator limits
const defaultOperatorLimits = {
  basic: {
    maxOperators: 5,
    maxCalls: 1000,
    maxRecordingStorage: 5 // GB
  },
  standard: {
    maxOperators: 15,
    maxCalls: 5000,
    maxRecordingStorage: 20 // GB
  },
  premium: {
    maxOperators: 50,
    maxCalls: 20000,
    maxRecordingStorage: 100 // GB
  },
  enterprise: {
    maxOperators: -1, // unlimited
    maxCalls: -1, // unlimited
    maxRecordingStorage: -1 // unlimited
  }
};

async function createSystemSettings() {
  console.log('Checking system settings...');
  
  try {
    // Check if pricing exists
    const existingPricing = await db.select().from(systemSettings).where(eq(systemSettings.key, 'pricing'));
    
    if (existingPricing.length === 0) {
      console.log('Creating default pricing...');
      await db.insert(systemSettings).values({
        key: 'pricing',
        value: defaultPricing
      });
      console.log('Default pricing created.');
    } else {
      console.log('Pricing already exists.');
    }
    
    // Check if operator limits exist
    const existingLimits = await db.select().from(systemSettings).where(eq(systemSettings.key, 'operatorLimits'));
    
    if (existingLimits.length === 0) {
      console.log('Creating default operator limits...');
      await db.insert(systemSettings).values({
        key: 'operatorLimits',
        value: defaultOperatorLimits
      });
      console.log('Default operator limits created.');
    } else {
      console.log('Operator limits already exist.');
    }
  } catch (error) {
    console.error('Error creating system settings:', error);
  }
}

async function createTestCalls() {
  console.log('Creating test call data...');
  
  // Check for existing data
  const existingCompanies = await db.select().from(companies);
  if (existingCompanies.length === 0) {
    console.error('No companies found in database. Please run seedDatabase first.');
    return;
  }
  
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.error('No users found in database. Please run seedDatabase first.');
    return;
  }
  
  const existingClients = await db.select().from(clients);
  if (existingClients.length === 0) {
    console.error('No clients found in database. Please run seedDatabase first.');
    return;
  }

  const company = existingCompanies[0];
  
  // Find users belonging to the selected company
  const companyUsers = existingUsers.filter(user => user.companyId === company.id);
  if (companyUsers.length === 0) {
    console.error(`No users found for company ID ${company.id}`);
    return;
  }
  
  // Find clients belonging to the selected company
  const companyClients = existingClients.filter(client => client.companyId === company.id);
  if (companyClients.length === 0) {
    console.error(`No clients found for company ID ${company.id}`);
    return;
  }

  // Get call outcomes
  const outcomes = await db.select().from(callOutcomes).where(eq(callOutcomes.companyId, company.id));
  if (outcomes.length === 0) {
    console.error(`No call outcomes found for company ID ${company.id}`);
    return;
  }

  try {
    // Create active live call sessions
    console.log('Creating active call sessions...');
    const activeCalls = [
      {
        companyId: company.id,
        userId: companyUsers[0].id,
        clientId: companyClients[0].id,
        sessionId: `session-${Date.now()}-1`,
        status: 'active',
        startTime: new Date(),
        recordingStatus: 'recording',
      },
      {
        companyId: company.id,
        userId: companyUsers.length > 1 ? companyUsers[1].id : companyUsers[0].id,
        clientId: companyClients.length > 1 ? companyClients[1].id : companyClients[0].id,
        sessionId: `session-${Date.now()}-2`,
        status: 'active',
        startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        recordingStatus: 'recording',
      }
    ];
    
    // Clear existing test call sessions
    await db.delete(liveCallSessions)
      .where(sql`${liveCallSessions.sessionId} LIKE 'session-%'`);
      
    // Insert new active sessions
    for (const call of activeCalls) {
      await db.insert(liveCallSessions).values(call);
    }
    
    // Create completed call sessions
    console.log('Creating completed call sessions...');
    const completedCallSessions = [
      {
        companyId: company.id,
        userId: companyUsers[0].id,
        clientId: companyClients[0].id,
        sessionId: `session-${Date.now()}-3`,
        status: 'completed',
        startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        endTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        recordingStatus: 'completed',
        recordingUrl: 'https://example.com/recordings/call1.mp3',
      },
      {
        companyId: company.id,
        userId: companyUsers.length > 1 ? companyUsers[1].id : companyUsers[0].id,
        clientId: companyClients.length > 1 ? companyClients[1].id : companyClients[0].id,
        sessionId: `session-${Date.now()}-4`,
        status: 'completed',
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        endTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        recordingStatus: 'completed',
        recordingUrl: 'https://example.com/recordings/call2.mp3',
      }
    ];
    
    // Insert completed sessions
    for (const call of completedCallSessions) {
      await db.insert(liveCallSessions).values(call);
    }
    
    // Create historical calls for statistics
    console.log('Creating historical calls...');
    
    // Generate calls for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Clear existing test calls
    await db.delete(calls)
      .where(sql`${calls.notes} LIKE 'Test%'`);
      
    // Generate some historical calls
    for (let i = 0; i < 50; i++) {
      const user = companyUsers[Math.floor(Math.random() * companyUsers.length)];
      const client = companyClients[Math.floor(Math.random() * companyClients.length)];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      // Random date in the last 30 days
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const callDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
      
      // Random duration between 2 and 15 minutes
      const durationMinutes = Math.floor(Math.random() * 13) + 2;
      const durationSeconds = durationMinutes * 60;
      
      await db.insert(calls).values({
        userId: user.id,
        clientId: client.id,
        outcomeId: outcome.id,
        startTime: callDate,
        endTime: new Date(callDate.getTime() + durationSeconds * 1000),
        duration: durationSeconds,
        notes: `Test call ${i + 1}`,
        callStatus: 'completed',
        callType: Math.random() > 0.7 ? 'inbound' : 'outbound',
        recordingUrl: Math.random() > 0.3 ? `https://example.com/recordings/historical-${i}.mp3` : null,
      });
    }
    
    console.log('Test call data created successfully!');
  } catch (error) {
    console.error('Error creating test call data:', error);
  }
}

async function main() {
  try {
    // First run the seed database function
    console.log('Step 1: Seeding the database...');
    await seedDatabase();
    
    // Then create system settings
    console.log('\nStep 2: Creating system settings...');
    await createSystemSettings();
    
    // Finally create test call data
    console.log('\nStep 3: Creating test call data...');
    await createTestCalls();
    
    console.log('\nAll test data setup completed successfully!');
  } catch (error) {
    console.error('Error in setup process:', error);
  }
  
  process.exit(0);
}

main();