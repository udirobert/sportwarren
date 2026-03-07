"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState, UserPreferences } from '@/types';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// Storage keys - centralized for consistency
const STORAGE_KEYS = {
  ALGORAND_ADDRESS: 'sw_algorand_address',
  AVALANCHE_ADDRESS: 'sw_avalanche_address',
  LENS_ADDRESS: 'sw_lens_address',
  PREFERRED_CHAIN: 'sw_preferred_chain',
  USER_PREFERENCES: 'sw_user_preferences',
} as const;

interface WalletContextType {
  address: string | null;
  connected: boolean;
  isGuest: boolean;
  loginMethod: 'wallet' | 'social' | 'guest' | null;
  chain: 'algorand' | 'avalanche' | 'lens' | 'social' | null;
  balance: number;
  connect: (method: 'algorand' | 'avalanche' | 'lens' | 'google' | 'discord') => Promise<void>;
  loginAsGuest: () => void;
  disconnect: () => void;
  preferences: UserPreferences | null;
  setPreferredChain: (chain: 'algorand' | 'avalanche' | 'lens' | 'social') => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<'algorand' | 'avalanche' | 'lens' | 'social' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'social' | 'guest' | null>(null);

  const { login, logout: privyLogout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  const loadPreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Migrate old keys to new keys
      migrateStorageKeys();

      const saved = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (saved) {
        try {
          const prefs = JSON.parse(saved);
          setPreferences(prefs);
          return prefs;
        } catch (e) {
          console.error('Failed to parse preferences:', e);
        }
      }
    }
    return null;
  }, []);

  // Migrate old localStorage keys to new standardized keys
  const migrateStorageKeys = () => {
    const migrations = [
      { old: 'algorand_address', new: STORAGE_KEYS.ALGORAND_ADDRESS },
      { old: 'avalanche_address', new: STORAGE_KEYS.AVALANCHE_ADDRESS },
      { old: 'lens_address', new: STORAGE_KEYS.LENS_ADDRESS },
      { old: 'preferred_chain', new: STORAGE_KEYS.PREFERRED_CHAIN },
      { old: 'userPreferences', new: STORAGE_KEYS.USER_PREFERENCES },
    ];

    migrations.forEach(({ old: oldKey, new: newKey }) => {
      const value = localStorage.getItem(oldKey);
      if (value && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, value);
        localStorage.removeItem(oldKey);
      }
    });
  };

  useEffect(() => {
    if (ready && authenticated && user) {
      if (user.wallet) {
        setAddress(user.wallet.address);
        setChain('social'); // Or detect if it's lens/base
        setLoginMethod('social');
        setIsGuest(false);
      }
    } else if (ready && !authenticated) {
      const savedPrefs = loadPreferences();

      const savedAlgorand = localStorage.getItem(STORAGE_KEYS.ALGORAND_ADDRESS);
      const savedAvalanche = localStorage.getItem(STORAGE_KEYS.AVALANCHE_ADDRESS);
      const savedLens = localStorage.getItem(STORAGE_KEYS.LENS_ADDRESS);
      const savedChain = localStorage.getItem(STORAGE_KEYS.PREFERRED_CHAIN) as 'algorand' | 'avalanche' | 'lens' | null;

      if (savedAlgorand) {
        setAddress(savedAlgorand);
        setChain('algorand');
        fetchAlgorandBalance(savedAlgorand);
      } else if (savedAvalanche) {
        setAddress(savedAvalanche);
        setChain('avalanche');
        fetchAvalancheBalance(savedAvalanche);
      } else if (savedLens) {
        setAddress(savedLens);
        setChain('lens');
        fetchLensBalance(savedLens);
      } else if (localStorage.getItem('sw_is_guest') === 'true') {
        setIsGuest(true);
        setAddress('0xGUEST_ADDRESS_HACKNEY_MARSHES');
        setChain('lens');
        setBalance(1000);
      } else if (savedPrefs?.preferredChain) {
        setChain(savedPrefs.preferredChain);
      }
    }
  }, [loadPreferences, ready, authenticated, user]);

  const fetchAlgorandBalance = async (addr: string) => {
    try {
      const response = await fetch(`/api/algorand/account-info?address=${addr}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Algorand balance:', error);
    }
  };

  const fetchAvalancheBalance = async (addr: string) => {
    try {
      const response = await fetch(`/api/avalanche/balance?address=${addr}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Avalanche balance:', error);
    }
  };

  const fetchLensBalance = async (addr: string) => {
    try {
      const response = await fetch(`/api/lens/balance?address=${addr}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Lens balance:', error);
    }
  };

  const connect = async (method: 'algorand' | 'avalanche' | 'lens' | 'google' | 'discord') => {
    try {
      if (method === 'google' || method === 'discord') {
        // ── Social Onboarding Flow (Progressive Identity) via Privy ──
        login();
        return;
      }

      if (method === 'algorand') {
        // ── Step 1: Get address from browser wallet ──
        let walletAddress = '';
        const peraWallet = (window as any).peraWallet;
        const deflyWallet = (window as any).deflyWallet;
        const algoSigner = (window as any).AlgoSigner;

        if (peraWallet?.connect) {
          const accounts = await peraWallet.connect();
          walletAddress = accounts?.[0] || '';
        } else if (deflyWallet?.connect) {
          const accounts = await deflyWallet.connect();
          walletAddress = accounts?.[0] || '';
        } else if (algoSigner) {
          await algoSigner.connect({ ledger: 'TestNet' });
          const accounts = await algoSigner.accounts({ ledger: 'TestNet' });
          walletAddress = accounts?.[0]?.address || '';
        } else {
          // Dev fallback — mnemonic from env
          const testMnemonic = process.env.NEXT_PUBLIC_ALGORAND_TEST_MNEMONIC;
          if (testMnemonic) {
            const algosdk = (await import('algosdk')).default;
            const account = algosdk.mnemonicToSecretKey(testMnemonic);
            walletAddress = account.addr.toString();
          }
        }

        if (!walletAddress) throw new Error('No Algorand wallet found. Please install Pera or Defly wallet.');

        // ── Step 2: Fetch challenge from server ──
        const challengeRes = await fetch('/api/auth/challenge');
        const { message, timestamp } = await challengeRes.json();

        // ── Step 3: Sign client-side ──
        let signature = '';
        if (algoSigner) {
          const encoded = (window as any).AlgoSigner.encoding.msgpackToBase64(new TextEncoder().encode(message));
          signature = await algoSigner.signBytes({ data: encoded, from: walletAddress });
        }
        // Note: Pera/Defly signing would go here with their SDK — skipped for brevity
        // In production: await peraWallet.signData([{ data: msgBytes, message }], walletAddress)

        // ── Step 4: Persist auth state ──
        setAddress(walletAddress);
        setChain('algorand');
        localStorage.setItem(STORAGE_KEYS.ALGORAND_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'algorand');
        if (signature) {
          localStorage.setItem('sw_auth_signature', signature);
          localStorage.setItem('sw_auth_message', message);
          localStorage.setItem('sw_auth_timestamp', String(timestamp));
        }
        fetchAlgorandBalance(walletAddress);

      } else if (method === 'avalanche') {
        // ── EIP-1193: MetaMask / any EVM wallet ──
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error('No EVM wallet found. Please install MetaMask.');
        }
        const provider = (window as any).ethereum;
        const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        if (!walletAddress) throw new Error('No accounts returned from wallet.');

        // ── Fetch challenge & sign ──
        const challengeRes = await fetch('/api/auth/challenge');
        const { message, timestamp } = await challengeRes.json();
        const signature: string = await provider.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });

        setAddress(walletAddress);
        setChain('avalanche');
        localStorage.setItem(STORAGE_KEYS.AVALANCHE_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'avalanche');
        localStorage.setItem('sw_auth_signature', signature);
        localStorage.setItem('sw_auth_message', message);
        localStorage.setItem('sw_auth_timestamp', String(timestamp));
        fetchAvalancheBalance(walletAddress);

      } else if (method === 'lens') {
        // ── Lens Chain: also EVM via MetaMask ──
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error('No EVM wallet found. Please install MetaMask.');
        }
        const provider = (window as any).ethereum;

        // Request Lens Network (Lens Chain - chain ID 232)
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xe8' }], // 232 in hex
          });
        } catch (switchErr: any) {
          // Chain not added yet — add it
          if (switchErr.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xe8',
                chainName: 'Lens Network Sepolia Testnet',
                rpcUrls: ['https://rpc.testnet.lens.dev'],
                nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
                blockExplorerUrls: ['https://block-explorer.testnet.lens.dev'],
              }],
            });
          } else {
            throw switchErr;
          }
        }

        const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];

        const challengeRes = await fetch('/api/auth/challenge');
        const { message, timestamp } = await challengeRes.json();
        const signature: string = await provider.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });

        setAddress(walletAddress);
        setChain('lens');
        localStorage.setItem(STORAGE_KEYS.LENS_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'lens');
        localStorage.setItem('sw_auth_signature', signature);
        localStorage.setItem('sw_auth_message', message);
        localStorage.setItem('sw_auth_timestamp', String(timestamp));
        fetchLensBalance(walletAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setAddress('0xGUEST_ADDRESS_HACKNEY_MARSHES');
    setChain('lens');
    setBalance(1000);
    localStorage.setItem('sw_is_guest', 'true');
  };

  const disconnect = () => {
    if (authenticated) {
      privyLogout();
    }
    setAddress(null);
    setChain(null);
    setBalance(0);
    setIsGuest(false);
    setLoginMethod(null);
    localStorage.removeItem(STORAGE_KEYS.ALGORAND_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.AVALANCHE_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.LENS_ADDRESS);
    localStorage.removeItem('sw_social_address');
    localStorage.removeItem('sw_login_method');
    localStorage.removeItem('sw_is_guest');
    // Clear auth tokens — prevent signature reuse after logout
    localStorage.removeItem('sw_auth_signature');
    localStorage.removeItem('sw_auth_message');
    localStorage.removeItem('sw_auth_timestamp');
  };

  const setPreferredChain = (newChain: 'algorand' | 'avalanche' | 'lens' | 'social') => {
    setPreferences(prev => {
      const updated: UserPreferences = {
        ...prev,
        preferredChain: newChain,
        theme: prev?.theme || 'system',
        notifications: prev?.notifications ?? true,
        compactMode: prev?.compactMode ?? false,
        onboardingCompleted: prev?.onboardingCompleted ?? false,
        preferredFeatures: prev?.preferredFeatures || {
          statistics: 'basic',
          social: 'moderate',
          gamification: 'light',
          notifications: 'moderate',
        },
        uiComplexity: prev?.uiComplexity || 'simple',
        dashboardLayout: prev?.dashboardLayout || 'minimal',
        usagePatterns: prev?.usagePatterns || {
          mostUsedFeatures: [],
          timeSpentInSections: {},
          lastActiveFeatures: [],
          completedOnboarding: false,
        },
        unlockedFeatures: prev?.unlockedFeatures || ['dashboard', 'match-tracker', 'basic-stats'],
        dismissedTutorials: prev?.dismissedTutorials || [],
        featureDiscoveryLevel: prev?.featureDiscoveryLevel || 0,
      };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        connected: !!address,
        isGuest,
        loginMethod,
        chain,
        balance,
        connect,
        loginAsGuest,
        disconnect,
        preferences,
        setPreferredChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Export storage keys for use in other components
export { STORAGE_KEYS };
