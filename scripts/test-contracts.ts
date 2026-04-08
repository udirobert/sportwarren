import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.ALGORAND_PRIVATE_KEY) {
  console.log('No ALGORAND_PRIVATE_KEY provided.');
}

if (!process.env.ALGORAND_NODE_URL) {
  process.env.ALGORAND_NODE_URL = 'https://testnet-api.algonode.cloud';
}
if (!process.env.ALGORAND_INDEXER_URL) {
  process.env.ALGORAND_INDEXER_URL = 'https://testnet-idx.algonode.cloud';
}

async function main() {
  const { AlgorandService } = await import('../server/services/blockchain/algorand');
  const { yellowService } = await import('../server/services/blockchain/yellow');

  console.log('🧪 Testing Contracts Integration...');

  try {
    const algorandService = new AlgorandService();
    console.log('✅ AlgorandService instantiated successfully');

    console.log('✅ Yellow service loaded successfully');

    console.log('\n1. Testing Algorand DAO App ID retrieval...');
    const algorandDaoAppId = algorandService.getSquadDAOAppId();
    console.log('Algorand DAO App ID:', algorandDaoAppId || 'Not set (Expected if not deployed)');

    console.log('\n2. Testing Yellow rail status...');
    const railStatus = yellowService.getRailStatus();
    console.log('Yellow rail status:', railStatus);

    console.log('\n3. Testing match fee configuration...');
    console.log('Yellow match fee amount:', yellowService.getMatchFeeAmount());

    console.log('\n✅ Contracts Tests Completed.');
  } catch (err) {
    console.error('❌ Contracts Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
