"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState, UserPreferences } from '@/types';

// Storage keys - centralized for consistency
const STORAGE_KEYS = {
  ALGORAND_ADDRESS: 'sw_algorand_address',
  AVALANCHE_ADDRESS: 'sw_avalanche_address',
  BASE_ADDRESS: 'sw_base_address',
  PREFERRED_CHAIN: 'sw_preferred_chain',
  USER_PREFERENCES: 'sw_user_preferences',
} as const;

interface WalletContextType {
  address: string | null;
  connected: boolean;
  chain: 'algorand' | 'avalanche' | 'base' | null;
  balance: number;
  connect: (chain: 'algorand' | 'avalanche' | 'base') => Promise<void>;
  disconnect: () => void;
  preferences: UserPreferences | null;
  setPreferredChain: (chain: 'algorand' | 'avalanche' | 'base') => void;
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
  const [chain, setChain] = useState<'algorand' | 'avalanche' | 'base' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

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
      { old: 'base_address', new: STORAGE_KEYS.BASE_ADDRESS },
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
    const savedBase = localStorage.getItem(STORAGE_KEYS.BASE_ADDRESS);
    const savedChain = localStorage.getItem(STORAGE_KEYS.PREFERRED_CHAIN) as 'algorand' | 'avalanche' | 'base' | null;

    if (savedAlgorand) {
      setAddress(savedAlgorand);
      setChain('algorand');
      fetchAlgorandBalance(savedAlgorand);
    } else if (savedAvalanche) {
      setAddress(savedAvalanche);
      setChain('avalanche');
      fetchAvalancheBalance(savedAvalanche);
    } else if (savedBase) {
      setAddress(savedBase);
      setChain('base');
      fetchBaseBalance(savedBase);
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

  const fetchBaseBalance = async (addr: string) => {
    try {
      const response = await fetch(`/api/base/balance?address=${addr}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch Base balance:', error);
    }
  };

  const connect = async (selectedChain: 'algorand' | 'avalanche' | 'base') => {
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
      } else if (selectedChain === 'base') {
        // Handle Base connection (e.g. via RainbowKit/Wagmi)
        const response = await fetch('/api/base/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('base');
            localStorage.setItem(STORAGE_KEYS.BASE_ADDRESS, data.address);
            localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'base');
            fetchBaseBalance(data.address);
          }
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChain(null);
    setBalance(0);
    localStorage.removeItem(STORAGE_KEYS.ALGORAND_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.AVALANCHE_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.BASE_ADDRESS);
  };

  const setPreferredChain = (newChain: 'algorand' | 'avalanche' | 'base') => {
    setPreferences(prev => {
      const updated: UserPreferences = {
        preferredChain: newChain,
        theme: prev?.theme || 'system',
        notifications: prev?.notifications ?? true,
        compactMode: prev?.compactMode ?? false,
        onboardingCompleted: prev?.onboardingCompleted ?? false,
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
        chain,
        balance,
        connect,
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
