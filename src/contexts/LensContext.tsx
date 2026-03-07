
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { LensProfile, LensConnectionState } from '@/types';
import { useWallets } from '@privy-io/react-auth';

interface LensContextType extends LensConnectionState {
  login: () => Promise<void>;
  logout: () => void;
  postMatchProof: (matchData: any) => Promise<string | null>;
}

const LensContext = createContext<LensContextType | undefined>(undefined);

export const LensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, chain } = useWallet();
  const { wallets } = useWallets();

  const [state, setState] = useState<LensConnectionState>({
    isConnected: false,
    profile: null,
    accessToken: null,
  });

  // Auto-login or check session
  useEffect(() => {
    const savedToken = localStorage.getItem('lens_access_token');
    const savedProfile = localStorage.getItem('lens_profile');
    if (savedToken && savedProfile) {
      setState({
        isConnected: true,
        accessToken: savedToken,
        profile: JSON.parse(savedProfile),
      });
    }
  }, [address]);

  const login = async () => {
    if (!address) return;

    try {
      // 1. Get Challenge from API
      const challengeRes = await fetch('/api/lens/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const { text } = await challengeRes.json();

      // 2. Sign Challenge
      // If we have a Privy wallet (social user), use it. Otherwise fallback to window.ethereum
      let signature = "";
      const privyWallet = wallets.find(w => w.walletClientType === 'privy');

      if (privyWallet && chain === 'social') {
        console.log("Signing Lens Challenge with Privy...");
        signature = await privyWallet.sign(text);
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        console.log("Signing Lens Challenge with Browser Wallet...");
        const provider = (window as any).ethereum;
        signature = await provider.request({
          method: 'personal_sign',
          params: [text, address],
        });
      } else {
        // Fallback for demo if no wallet detected
        signature = "0x_simulated_lens_signature";
      }

      // 3. Authenticate
      const authRes = await fetch('/api/lens/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message: text }),
      });
      const { profile, accessToken } = await authRes.json();

      const newState = { isConnected: true, profile, accessToken };
      setState(newState);
      localStorage.setItem('lens_access_token', accessToken);
      localStorage.setItem('lens_profile', JSON.stringify(profile));
    } catch (error) {
      console.error("Lens Login Failed:", error);
    }
  };

  const logout = () => {
    setState({ isConnected: false, profile: null, accessToken: null });
    localStorage.removeItem('lens_access_token');
    localStorage.removeItem('lens_profile');
  };

  const postMatchProof = async (matchData: any) => {
    if (!state.accessToken || !state.profile) return null;

    try {
      const content = `🏆 Phygital Match Verified! 
            Venue: ${matchData.venue}
            Result: ${matchData.homeScore} - ${matchData.awayScore}
            Verification Proof: ✅ Chainlink CRE #${matchData.workflowId.slice(0, 8)}`;

      const res = await fetch('/api/lens/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.accessToken}`
        },
        body: JSON.stringify({
          profileId: state.profile.id,
          content
        }),
      });
      const { pubId } = await res.json();
      return pubId;
    } catch (error) {
      console.error("Lens Post Failed:", error);
      return null;
    }
  };

  return (
    <LensContext.Provider value={{ ...state, login, logout, postMatchProof }}>
      {children}
    </LensContext.Provider>
  );
};

export const useLens = () => {
  const context = useContext(LensContext);
  if (!context) throw new Error('useLens must be used within a LensProvider');
  return context;
};
