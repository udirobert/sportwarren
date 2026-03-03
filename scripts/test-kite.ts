import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set mock env vars before importing services
if (!process.env.WEB3_PRIVATE_KEY) {
  process.env.WEB3_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
}

async function main() {
  const { KiteAIService } = await import('../server/services/ai/kite');
  console.log('🧪 Testing Kite AI Service Integration...');
  
  try {
    const kiteService = new KiteAIService();
    console.log('✅ KiteAIService instantiated successfully');

    console.log('\n1. Testing Agent Registration (Mock)...');
    try {
      const mockAgent = await kiteService.registerAgent({
        name: 'Test Scout',
        description: 'Test Scout Agent',
        type: 'scout',
        capabilities: ['analyze_performance'],
        walletAddress: '0x1234567890123456789012345678901234567890'
      });
      console.log('Register Agent Result:', mockAgent ? 'Success' : 'Failed (Expected if no real API key)');
    } catch (error) {
      console.error('Register Agent Error:', error);
    }

    console.log('\n2. Testing Get Agent Passport (Mock)...');
    try {
      const passport = await kiteService.getAgentPassport('agent-123');
      console.log('Get Passport Result:', passport ? 'Success' : 'Failed (Expected if no real API key)');
    } catch (error) {
      console.error('Get Passport Error:', error);
    }

    console.log('\n✅ Kite AI Service Tests Completed.');
  } catch (err) {
    console.error('❌ Kite AI Service Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
