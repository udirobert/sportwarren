import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Wallet, Link, Copy, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { connectAlgorandWallet, getAccountInfo, getAccountTransactions } from '../../lib/algorand';

interface WalletInfo {
  address: string;
  balance: number;
  network: {
    network: string;
    lastRound: number;
    timeSinceLastRound: number;
    catchupTime: number;
    health: string; // Added health from getAccountInfo
  };
  assets: any[]; // Added assets from getAccountInfo
}

interface Transaction {
  id: string;
  type: string; // Changed to string to accommodate Algorand transaction types
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
  status: 'confirmed'; // Indexer only returns confirmed transactions
  description: string;
}

export const AlgorandWallet: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchWalletInfo = useCallback(async (address: string) => {
    try {
      const accountData = await getAccountInfo(address);
      setWalletInfo(accountData as WalletInfo);
      
      const txns = await getAccountTransactions(address);
      setTransactions(txns as Transaction[]);
    } catch (err) {
      console.error('Failed to fetch wallet info:', err);
      setError('Failed to fetch wallet information. Please ensure your Algorand node and indexer are running and accessible.');
      throw err;
    }
  }, []);

  useEffect(() => {
    const checkAndConnect = async () => {
      const savedAddress = localStorage.getItem('algorand_connected_address');
      if (savedAddress) {
        setIsConnected(true);
        setLoading(true);
        try {
          await fetchWalletInfo(savedAddress);
        } catch (err) {
          setIsConnected(false); // Disconnect if fetching fails
          localStorage.removeItem('algorand_connected_address');
        } finally {
          setLoading(false);
        }
      }
    };
    checkAndConnect();
  }, [fetchWalletInfo]);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const address = await connectAlgorandWallet();
      if (address) {
        await fetchWalletInfo(address);
        setIsConnected(true);
        localStorage.setItem('algorand_connected_address', address);
      } else {
        setError('Failed to connect wallet. No address returned.');
      }
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setTransactions([]);
    setIsConnected(false);
    localStorage.removeItem('algorand_connected_address');
  };

  const copyAddress = async () => {
    if (walletInfo?.address) {
      try {
        await navigator.clipboard.writeText(walletInfo.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const refreshWallet = async () => {
    if (isConnected && walletInfo?.address) {
      setLoading(true);
      try {
        await fetchWalletInfo(walletInfo.address);
      } catch (err) {
        // Error handled in fetchWalletInfo
      } finally {
        setLoading(false);
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'pay': return '💰';
      case 'acfg': return '⚙️';
      case 'axfer': return '➡️';
      case 'afrz': return '❄️';
      case 'appl': return '📄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    // For now, all transactions from indexer are confirmed
    return 'text-green-600 bg-green-100';
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Algorand Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your Algorand wallet to access blockchain features like squad governance, 
            match verification, and global challenges.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            <AlertCircle className="inline-block w-4 h-4 mr-1 text-yellow-500" />
            Note: This integration currently uses a simulated connection or a test mnemonic from your .env file.
            For a production environment, you would integrate with a wallet connector library like Pera Wallet Connect, MyAlgo Connect, or AlgoSigner.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>

            <div className="text-sm text-gray-500">
              <p className="mb-2">Supported wallets:</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full">Pera Wallet</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">MyAlgo Wallet</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">AlgoSigner</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Wallet Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Algorand Wallet</h1>
              <p className="text-gray-600">Manage your blockchain assets and transactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshWallet}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={disconnectWallet}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {walletInfo && (
          <>
            {/* Wallet Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Wallet Address</h3>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <code className="flex-1 text-sm text-gray-700 font-mono">
                    {walletInfo.address}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://testnet.algoexplorer.io/address/${walletInfo.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Balance</h3>
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {walletInfo.balance.toFixed(4)} ALGO
                  </div>
                  <div className="text-sm text-green-600">
                    ≈ ${(walletInfo.balance * 0.25).toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Network Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-600 font-medium">Network</div>
                  <div className="text-blue-800">{walletInfo.network.network}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Last Round</div>
                  <div className="text-blue-800">{walletInfo.network.lastRound.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Time Since Last Round</div>
                  <div className="text-blue-800">{walletInfo.network.timeSinceLastRound}s</div>
                </div>
                <div>
                  <div className="text-blue-600 font-medium">Catchup Time</div>
                  <div className="text-blue-800">{walletInfo.network.catchupTime}ms</div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Transaction History */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <button
            onClick={refreshWallet}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions found</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.type === 'pay' ? (transaction.from === walletInfo?.address ? 'To: ' : 'From: ') : 'Sender: '}
                      <code className="text-xs">
                        {transaction.type === 'pay' ? (transaction.from === walletInfo?.address ? transaction.to : transaction.from) : transaction.from}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {transaction.amount > 0 && (
                    <div className={`font-bold ${
                      transaction.type === 'pay' && transaction.from !== walletInfo?.address ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'pay' && transaction.from !== walletInfo?.address ? '+' : '-'}{transaction.amount} ALGO
                    </div>
                  )}
                  <a
                    href={`https://testnet.algoexplorer.io/tx/${transaction.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center" hover>
          <Link className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Join Squad DAO</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect to your squad's governance system
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Connect to DAO
          </button>
        </Card>

        <Card className="text-center" hover>
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Verify Match</h3>
          <p className="text-sm text-gray-600 mb-4">
            Verify recent match results on-chain
          </p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            Verify Matches
          </button>
        </Card>

        <Card className="text-center" hover>
          <ExternalLink className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Global Challenges</h3>
          <p className="text-sm text-gray-600 mb-4">
            Join worldwide competitions for rewards
          </p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
            View Challenges
          </button>
        </Card>
      </div>
    </div>
  );
};