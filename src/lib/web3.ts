import { createConfig, http } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id';

export const config = createConfig({
  chains: [polygon, polygonMumbai],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
});

export class Web3Client {
  async connectWallet(): Promise<string | null> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        return accounts[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async signMessage(message: string): Promise<string | null> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        
        if (accounts.length === 0) {
          throw new Error('No accounts connected');
        }

        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, accounts[0]],
        });

        return signature;
      }
      return null;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }

  async getPlayerAchievements(address: string): Promise<any[]> {
    try {
      const response = await fetch('/api/web3/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.achievements || [];
      }

      return [];
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return [];
    }
  }
}

export const web3Client = new Web3Client();