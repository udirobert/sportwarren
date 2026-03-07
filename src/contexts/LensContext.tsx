"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LensProfile, LensConnectionState } from '@/types';
import { useWallet } from './WalletContext';

interface LensContextType extends LensConnectionState {
  login: () => Promise<void>;
  logout: () => void;
  postHighlight: (content: string, imageUrl?: string) => Promise<string | null>;
}

const LensContext = createContext<LensContextType | undefined>(undefined);

export const useLens = () => {
  const context = useContext(LensContext);
  if (!context) {
    throw new Error('useLens must be used within a LensProvider');
  }
  return context;
};

export const LensProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, chain } = useWallet();
  const [state, setState] = useState<LensConnectionState>({
    isConnected: false,
    profile: null,
    accessToken: null,
  });

  // Load saved Lens session
  useEffect(() => {
    const saved = localStorage.getItem('sw_lens_session');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse Lens session:', e);
      }
    }
  }, []);

  const login = async () => {
    if (!address || chain !== 'lens') {
      throw new Error('Please connect your Lens wallet first to use Lens.');
    }

    try {
      // 1. Request challenge from backend
      const challengeRes = await fetch('/api/lens/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const { text } = await challengeRes.json();

      // 2. Real signature via ethereum provider
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('No ethereum wallet found for Lens signature.');
      }
      const provider = (window as any).ethereum;
      const signature = await provider.request({
        method: 'personal_sign',
        params: [text, address],
      });

      // 3. Verify signature and get profile/token
      const authRes = await fetch('/api/lens/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message: text }),
      });

      if (authRes.ok) {
        const data = await authRes.json();
        const newState = {
          isConnected: true,
          profile: data.profile,
          accessToken: data.accessToken,
        };
        setState(newState);
        localStorage.setItem('sw_lens_session', JSON.stringify(newState));
      }
    } catch (error) {
      console.error('Lens login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setState({ isConnected: false, profile: null, accessToken: null });
    localStorage.removeItem('sw_lens_session');
  };

  const postHighlight = async (content: string, imageUrl?: string) => {
    if (!state.isConnected || !state.accessToken) return null;

    try {
      const response = await fetch('/api/lens/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify({
          profileId: state.profile?.id,
          content,
          imageUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.pubId;
      }
      return null;
    } catch (error) {
      console.error('Failed to post to Lens:', error);
      return null;
    }
  };

  return (
    <LensContext.Provider value={{ ...state, login, logout, postHighlight }}>
      {children}
    </LensContext.Provider>
  );
};
