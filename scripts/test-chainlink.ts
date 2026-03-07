import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.WEB3_PRIVATE_KEY) {
  process.env.WEB3_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
}

async function main() {
  const { ChainlinkService } = await import('../server/services/blockchain/chainlink');
  console.log('🧪 Testing Chainlink Service Integration...');

  try {
    const chainlinkService = new ChainlinkService();
    console.log('✅ ChainlinkService instantiated successfully');

    console.log('\n1. Testing Comprehensive Match Verification (CRE Workflow)...');
    try {
      const matchData = {
        latitude: 53.4808,
        longitude: -2.2426,
        timestamp: Math.floor(Date.now() / 1000),
        homeTeam: 'Manchester United',
        awayTeam: 'Manchester City'
      };
      const result = await chainlinkService.verifyMatch(matchData);
      console.log('Match Verification Result:', JSON.stringify(result, null, 2));

      if (result.details?.weather?.verified) {
        console.log('✅ Real-world data used via CRE workflow.');
      } else {
        console.log('⚠️ Simulation mode used (Missing API Keys).');
      }
    } catch (error) {
      console.error('Match Verification Error:', error);
    }

    console.log('\n✅ Chainlink Service Tests Completed.');

  } catch (err) {
    console.error('❌ Chainlink Service Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
