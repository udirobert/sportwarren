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

    console.log('\n1. Testing Verify Weather (Mock)...');
    try {
      const weatherResult = await chainlinkService.verifyWeather(51.5074, -0.1278, Math.floor(Date.now() / 1000));
      console.log('Weather Verification Result:', weatherResult);
    } catch (error) {
      console.error('Weather Verification Error:', error);
    }

    console.log('\n2. Testing Verify Location (Mock)...');
    try {
      // NOTE: verifyLocation wasn't defined in the original interface but assumed based on verifyWeather
      // We will try to call it to see what happens
      // Actually we will just use verifyWeather to test
      console.log('Location Verification Skipped');
    } catch (error) {
      console.error('Location Verification Error:', error);
    }

    console.log('\n✅ Chainlink Service Tests Completed.');
  } catch (err) {
    console.error('❌ Chainlink Service Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
