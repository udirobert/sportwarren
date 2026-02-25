"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WalletState, UserPreferences } from '@/types';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  chain: 'algorand' | 'avalanche' | null;
  balance: number;
  connect: (chain: 'algorand' | 'avalanche') => Promise<void>;
  disconnect: () => void;
  preferences: UserPreferences | null;
  setPreferredChain: (chain: 'algorand' | 'avalanche') => void;
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
  const [chain, setChain] = useState<'algorand' | 'avalanche' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const loadPreferences = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setPreferences(prefs);
        return prefs;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const savedPrefs = loadPreferences();
    
    const savedAlgorand = localStorage.getItem('algorand_address');
    const savedAvalanche = localStorage.getItem('avalanche_address');
    const savedChain = localStorage.getItem('preferred_chain') as 'algorand' | 'avalanche' | null;

    if (savedAlgorand) {
      setAddress(savedAlgorand);
      setChain('algorand');
      fetchAlgorandBalance(savedAlgorand);
    } else if (savedAvalanche) {
      setAddress(savedAvalanche);
      setChain('avalanche');
      fetchAvalancheBalance(savedAvalanche);
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

  const connect = async (selectedChain: 'algorand' | 'avalanche') => {
    try {
      if (selectedChain === 'algorand') {
        const response = await fetch('/api/algorand/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('algorand');
            localStorage.setItem('algorand_address', data.address);
            localStorage.setItem('preferred_chain', 'algorand');
            fetchAlgorandBalance(data.address);
          }
        }
      } else {
        const response = await fetch('/api/avalanche/connect-wallet', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            setAddress(data.address);
            setChain('avalanche');
            localStorage.setItem('avalanche_address', data.address);
            localStorage.setItem('preferred_chain', 'avalanche');
            fetchAvalancheBalance(data.address);
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
    localStorage.removeItem('algorand_address');
    localStorage.removeItem('avalanche_address');
  };

  const setPreferredChain = (newChain: 'algorand' | 'avalanche') => {
    setPreferences(prev => {
      const updated: UserPreferences = {
        preferredChain: newChain,
        theme: prev?.theme || 'system',
        notifications: prev?.notifications ?? true,
        compactMode: prev?.compactMode ?? false,
        onboardingCompleted: prev?.onboardingCompleted ?? false,
      };
      localStorage.setItem('userPreferences', JSON.stringify(updated));
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
