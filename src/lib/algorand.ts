import algosdk from 'algosdk';

const ALGOD_URL = process.env.NEXT_PUBLIC_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
const INDEXER_URL = process.env.NEXT_PUBLIC_ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud';

const algodClient = new algosdk.Algodv2('', ALGOD_URL, 443);
const indexerClient = new algosdk.Indexer('', INDEXER_URL, 443);

interface PeraWallet {
  connect: () => Promise<string[]>;
  disconnect?: () => Promise<void>;
}

interface DeflyWallet {
  connect: () => Promise<string[]>;
  disconnect?: () => Promise<void>;
}

interface AlgoSigner {
  connect: (args: { ledger: string }) => Promise<void>;
  accounts: (args: { ledger: string }) => Promise<Array<{ address: string }>>;
}

declare global {
  interface Window {
    peraWallet?: PeraWallet;
    deflyWallet?: DeflyWallet;
    AlgoSigner?: AlgoSigner;
  }
}

export const connectAlgorandWallet = async (): Promise<{ address: string; error?: string }> => {
  try {
    if (typeof window === 'undefined') {
      return { address: '', error: 'Window is undefined' };
    }

    const peraWallet = window.peraWallet;
    if (peraWallet && typeof peraWallet.connect === 'function') {
      const accounts = await peraWallet.connect();
      if (accounts && accounts.length > 0) {
        return { address: accounts[0] };
      }
    }

    const deflyWallet = window.deflyWallet;
    if (deflyWallet && typeof deflyWallet.connect === 'function') {
      const accounts = await deflyWallet.connect();
      if (accounts && accounts.length > 0) {
        return { address: accounts[0] };
      }
    }

    const algoSigner = window.AlgoSigner;
    if (algoSigner) {
      await algoSigner.connect({ ledger: 'TestNet' });
      const accounts = await algoSigner.accounts({ ledger: 'TestNet' });
      if (accounts && accounts.length > 0) {
        return { address: accounts[0].address };
      }
    }

    const testMnemonic = process.env.NEXT_PUBLIC_ALGORAND_TEST_MNEMONIC;
    if (testMnemonic) {
      const account = algosdk.mnemonicToSecretKey(testMnemonic);
      return { address: account.addr.toString() };
    }

    return { address: '', error: 'No wallet found. Please install Pera Wallet, Defly Wallet, or AlgoSigner.' };

  } catch (error) {
    const err = error as Error;
    console.error('Error connecting to Algorand wallet:', error);
    return { address: '', error: err.message || 'Failed to connect wallet' };
  }
};

export const disconnectAlgorandWallet = async (): Promise<void> => {
  try {
    const peraWallet = window.peraWallet;
    if (peraWallet && typeof peraWallet.disconnect === 'function') {
      await peraWallet.disconnect();
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};

export const getAccountInfo = async (address: string) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const status = await algodClient.status().do();

    return {
      address: accountInfo.address,
      balance: algosdk.microalgosToAlgos(Number(accountInfo.amount)),
      network: {
        network: 'TestNet',
        lastRound: status.lastRound,
        timeSinceLastRound: status.timeSinceLastRound,
        catchupTime: status.catchupTime,
        health: 'healthy',
      },
      assets: accountInfo.assets || [],
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw error;
  }
};

export const getAccountTransactions = async (address: string, limit: number = 10) => {
  try {
    const response = await indexerClient.lookupAccountTransactions(address).limit(limit).do();
    return response.transactions.map((txn) => {
      const rawTxn = txn as unknown as AlgorandTransaction;
      const paymentTxn = rawTxn['payment-transaction'];
      return {
        id: rawTxn.id,
        type: rawTxn['tx-type'],
        amount: paymentTxn ? algosdk.microalgosToAlgos(paymentTxn.amount) : 0,
        from: rawTxn.sender,
        to: paymentTxn ? paymentTxn.receiver : rawTxn.sender,
        timestamp: new Date(rawTxn['round-time'] * 1000),
        status: 'confirmed' as const,
        description: getTransactionDescription(rawTxn),
      };
    });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return [];
  }
};

interface AlgorandTransaction {
  id: string;
  'tx-type': string;
  sender: string;
  'round-time': number;
  'payment-transaction': {
    amount: number;
    receiver: string;
  } | undefined;
}

const getTransactionDescription = (txn: AlgorandTransaction): string => {
  switch (txn['tx-type']) {
    case 'pay': {
      const paymentTxn = txn['payment-transaction'];
      return paymentTxn && paymentTxn.receiver === txn.sender ? 'Self-transfer' : 'Payment';
    }
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

export { algodClient, indexerClient };
