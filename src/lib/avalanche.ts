import { ethers } from 'ethers';
import {
  getAvalancheChain,
  getAvalancheExplorerBaseUrl,
  getAvalancheNetworkLabel,
  getAvalancheRpcUrl,
} from '@/lib/blockchain/evm-config';

const AVALANCHE_RPC = getAvalancheRpcUrl();

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const connectAvalancheWallet = async (): Promise<{ address: string; error?: string }> => {
  try {
    if (typeof window === 'undefined') {
      return { address: '', error: 'Window is undefined' };
    }

    if (!window.ethereum) {
      return { address: '', error: 'No wallet found. Please install MetaMask or another Avalanche-compatible wallet.' };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const targetChain = getAvalancheChain();
    
    if (accounts && accounts.length > 0) {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(targetChain.id)) {
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId: ethers.toBeHex(targetChain.id) }]);
        } catch (switchError) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await provider.send('wallet_addEthereumChain', [{
              chainId: ethers.toBeHex(targetChain.id),
              chainName: getAvalancheNetworkLabel(),
              nativeCurrency: targetChain.nativeCurrency,
              rpcUrls: [getAvalancheRpcUrl()],
              blockExplorerUrls: [getAvalancheExplorerBaseUrl()],
            }]);
          }
        }
      }
      
      return { address: accounts[0] };
    }

    return { address: '', error: 'No accounts found' };

  } catch (error) {
    const err = error as Error;
    console.error('Error connecting to Avalanche wallet:', error);
    return { address: '', error: err.message || 'Failed to connect wallet' };
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
