"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState, UserPreferences } from '@/types';

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
  chain: 'algorand' | 'avalanche' | 'lens' | null;
  balance: number;
  connect: (chain: 'algorand' | 'avalanche' | 'lens') => Promise<void>;
  loginAsGuest: () => void;
  disconnect: () => void;
  preferences: UserPreferences | null;
  setPreferredChain: (chain: 'algorand' | 'avalanche' | 'lens') => void;
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
  const [chain, setChain] = useState<'algorand' | 'avalanche' | 'lens' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

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
      setBalance(1000); // Guest gets some local currency to play with
    } else if (savedPrefs?.preferredChain) {
      setChain(savedPrefs.preferredChain);
    }
  }, [loadPreferences]);

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

  const connect = async (selectedChain: 'algorand' | 'avalanche' | 'lens') => {
    try {
      if (selectedChain === 'algorand') {
        const response = await fetch('/api/algorand/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('algorand');
            localStorage.setItem(STORAGE_KEYS.ALGORAND_ADDRESS, data.address);
            localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'algorand');
            fetchAlgorandBalance(data.address);
          }
        }
      } else if (selectedChain === 'avalanche') {
        const response = await fetch('/api/avalanche/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('avalanche');
            localStorage.setItem(STORAGE_KEYS.AVALANCHE_ADDRESS, data.address);
            localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'avalanche');
            fetchAvalancheBalance(data.address);
          }
        }
      } else if (selectedChain === 'lens') {
        // Handle Lens connection (via Lens Chain RPC)
        // In a real app we'd trigger wallet to switch to Lens Chain
        const response = await fetch('/api/lens/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('lens');
            localStorage.setItem(STORAGE_KEYS.LENS_ADDRESS, data.address);
            localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'lens');
            fetchLensBalance(data.address);
          }
        }
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
    setAddress(null);
    setChain(null);
    setBalance(0);
    setIsGuest(false);
    localStorage.removeItem(STORAGE_KEYS.ALGORAND_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.AVALANCHE_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.LENS_ADDRESS);
    localStorage.removeItem('sw_is_guest');
  };

  const setPreferredChain = (newChain: 'algorand' | 'avalanche' | 'lens') => {
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
