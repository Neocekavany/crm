import { db } from './server/db';
import { systemSettings } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createSystemSettings() {
  console.log('Creating default system settings...');
  
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
  
  try {
    // Check if pricing exists
    const existingPricing = await db.select().from(systemSettings).where(eq(systemSettings.key, 'pricing'));
    
    if (existingPricing.length === 0) {
      console.log('Creating default pricing settings...');
      await db.insert(systemSettings).values({
        key: 'pricing',
        value: defaultPricing
      });
      console.log('Default pricing created successfully.');
    } else {
      console.log('Pricing settings already exist.');
    }
    
    // Check if operator limits exist
    const existingLimits = await db.select().from(systemSettings).where(eq(systemSettings.key, 'operatorLimits'));
    
    if (existingLimits.length === 0) {
      console.log('Creating default operator limits...');
      await db.insert(systemSettings).values({
        key: 'operatorLimits',
        value: defaultOperatorLimits
      });
      console.log('Default operator limits created successfully.');
    } else {
      console.log('Operator limits already exist.');
    }
    
    console.log('System settings setup completed!');
  } catch (error) {
    console.error('Error creating system settings:', error);
  }
  
  process.exit(0);
}

createSystemSettings();