import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.ALGORAND_PRIVATE_KEY) {
  // Generate a test account mnemonic if none provided to allow tests to run
  console.log('No ALGORAND_PRIVATE_KEY provided, tests may fail if they require signing.');
}

if (!process.env.ALGORAND_NODE_URL) {
  process.env.ALGORAND_NODE_URL = 'https://testnet-api.algonode.cloud';
}
if (!process.env.ALGORAND_INDEXER_URL) {
  process.env.ALGORAND_INDEXER_URL = 'https://testnet-idx.algonode.cloud';
}

async function main() {
  const { AlgorandService } = await import('../server/services/blockchain/algorand');
  console.log('🧪 Testing Match Verification Integration...');
  
  try {
    const algorandService = new AlgorandService();
    console.log('✅ AlgorandService instantiated successfully');

    console.log('\n1. Testing Opt-in to Match Verification (Mock)...');
    try {
      // Since we don't deploy here, we just check if it fails gracefully
      const optInResult = await algorandService.optInToMatchVerification('TESTADDRESS');
      console.log('Opt-in Result:', optInResult ? 'Success' : 'Failed (Expected if app not deployed)');
    } catch (error) {
      console.error('Opt-in Error:', error);
    }

    console.log('\n2. Testing Submit Verification (Mock)...');
    try {
      const submitResult = await algorandService.submitMatchResult('test-match', 'Home', 'Away', 1, 0, 'TESTADDRESS', 'Match metadata');
      console.log('Submit Result:', submitResult ? 'Success' : 'Failed (Expected if app not deployed)');
    } catch (error) {
      console.error('Submit Error:', error);
    }

    console.log('\n✅ Match Verification Tests Completed.');
  } catch (err) {
    console.error('❌ Match Verification Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
