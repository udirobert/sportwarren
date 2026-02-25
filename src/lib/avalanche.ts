import { ethers } from 'ethers';

const AVALANCHE_RPC = process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';

export const connectAvalancheWallet = async (): Promise<{ address: string; error?: string }> => {
  try {
    if (typeof window === 'undefined') {
      return { address: '', error: 'Window is undefined' };
    }

    if (!(window as any).ethereum) {
      return { address: '', error: 'No wallet found. Please install MetaMask or another Avalanche-compatible wallet.' };
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts && accounts.length > 0) {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(43113) && network.chainId !== BigInt(43114)) {
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: '0xa869' }]);
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.send('wallet_addEthereumChain', [{
              chainId: '0xa869',
              chainName: 'Avalanche C-Chain',
              nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io'],
            }]);
          }
        }
      }
      
      return { address: accounts[0] };
    }

    return { address: '', error: 'No accounts found' };

  } catch (error: any) {
    console.error('Error connecting to Avalanche wallet:', error);
    return { address: '', error: error.message || 'Failed to connect wallet' };
  }
};

export const getAvalancheBalance = async (address: string): Promise<number> => {
  try {
    const provider = new ethers.JsonRpcProvider(AVALANCHE_RPC);
    const balance = await provider.getBalance(address);
    return Number(ethers.formatEther(balance));
  } catch (error) {
    console.error('Error fetching Avalanche balance:', error);
    return 0;
  }
};

export const disconnectAvalancheWallet = async (): Promise<void> => {
  // For Avalanche/MetaMask, disconnection is handled by the wallet itself
  // We just clear local storage
};
