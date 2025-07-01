import algosdk from 'algosdk';
import { get
 } from '@algorandfoundation/algokit-utils';

// Configuration for Algorand TestNet
const algodClient = new algosdk.Algodv2(
  import.meta.env.VITE_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud',
  '',
  443
);

const indexerClient = new algosdk.Indexer(
  import.meta.env.VITE_ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud',
  '',
  443
);

export const connectAlgorandWallet = async (): Promise<string | null> => {
  try {
    // This is a placeholder. In a real application, you would integrate with a wallet connector library
    // like Pera Wallet Connect, MyAlgo Connect, or AlgoSigner.
    // For demonstration, we'll simulate a connection and return a dummy address.
    // You would typically prompt the user to connect their wallet here.
    console.warn("Wallet connection is simulated. Integrate with a real Algorand wallet connector (e.g., Pera, MyAlgo, AlgoSigner) for production.");
    
    // Simulate a delay for connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real scenario, you'd get the connected account address from the wallet.
    // For now, we'll use a placeholder or a test account if available.
    // If you have a test account private key in your .env, you can use it for testing.
    const testAccountMnemonic = import.meta.env.VITE_ALGORAND_TEST_MNEMONIC;
    if (testAccountMnemonic) {
      const account = algosdk.mnemonicToSecretKey(testAccountMnemonic);
      return account.addr;
    }

    // Fallback to a dummy address if no test mnemonic is provided
    return 'ALGOWALLET_PLACEHOLDER_ADDRESS'; 

  } catch (error) {
    console.error('Error connecting to Algorand wallet:', error);
    return null;
  }
};

export const getAccountInfo = async (address: string) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const status = await algodClient.status().do();
    const health = await algodClient.health().do();

    return {
      address: accountInfo.address,
      balance: algosdk.microAlgosToAlgos(accountInfo.amount),
      network: {
        network: 'TestNet', // Or dynamically determine from status
        lastRound: status['last-round'],
        timeSinceLastRound: status['time-since-last-round'],
        catchupTime: status['catchup-time'],
        health: health.message,
      },
      assets: accountInfo.assets, // Include ASA information
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

export const getAccountTransactions = async (address: string, limit: number = 10) => {
  try {
    const response = await indexerClient.lookupAccountTransactions(address).limit(limit).do();
    return response.transactions.map((txn: any) => ({
      id: txn.id,
      type: txn['tx-type'], // 'pay', 'acfg', 'axfer', 'afrz', 'appl'
      amount: txn['payment-transaction'] ? algosdk.microAlgosToAlgos(txn['payment-transaction'].amount) : 0,
      from: txn.sender,
      to: txn['payment-transaction'] ? txn['payment-transaction'].receiver : txn.sender, // Adjust 'to' for non-payment txns
      timestamp: new Date(txn['round-time'] * 1000), // Convert Unix timestamp to Date
      status: 'confirmed', // Indexer only returns confirmed transactions
      description: getTransactionDescription(txn),
    }));
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return [];
  }
};

const getTransactionDescription = (txn: any): string => {
  switch (txn['tx-type']) {
    case 'pay':
      return txn['payment-transaction'].receiver === txn.sender ? 'Self-transfer' : 'Payment';
    case 'acfg':
      return 'Asset Configuration';
    case 'axfer':
      return 'Asset Transfer';
    case 'afrz':
      return 'Asset Freeze';
    case 'appl':
      return 'Application Call';
    default:
      return 'Unknown Transaction Type';
  }
};

// You might also want functions for:
// - Sending transactions
// - Opting into assets
// - Calling smart contracts
// - Signing messages
