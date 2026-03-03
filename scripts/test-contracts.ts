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

if (!process.env.WEB3_PRIVATE_KEY) {
  process.env.WEB3_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123';
}

async function main() {
  const { AlgorandService } = await import('../server/services/blockchain/algorand');
  const { Web3Service } = await import('../server/services/blockchain/web3');

  console.log('🧪 Testing Contracts Integration...');

  try {
    const algorandService = new AlgorandService();
    console.log('✅ AlgorandService instantiated successfully');

    const web3Service = new Web3Service();
    console.log('✅ Web3Service instantiated successfully');

    console.log('\n1. Testing Algorand DAO App ID retrieval...');
    const algorandDaoAppId = algorandService.getSquadDAOAppId();
    console.log('Algorand DAO App ID:', algorandDaoAppId || 'Not set (Expected if not deployed)');

    console.log('\n2. Testing Web3 connection check...');
    try {
      const balance = await web3Service.getBalance();
      console.log('Web3 getBalance (Service Wallet):', balance);
    } catch (e: any) {
      console.log('Web3 getBalance failed (Expected if no real RPC):', e.message);
    }

    console.log('\n✅ Contracts Tests Completed.');
  } catch (err) {
    console.error('❌ Contracts Test Failed:', err);
    process.exit(1);
  }
}

main().catch(console.error);
