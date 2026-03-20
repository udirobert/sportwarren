import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from './WalletContext';
import { LensConnectionState } from '@/types';
import { useWallets } from '@privy-io/react-auth';

interface LensContextType extends LensConnectionState {
  login: () => Promise<void>;
  logout: () => void;
  postMatchProof: (matchData: {
    venue?: string;
    homeScore: number;
    awayScore: number;
    workflowId?: string;
    opponent?: string;
    squadName?: string;
    resultLabel?: string;
    matchDate?: string | Date;
  }) => Promise<string | null>;
  postHighlight: (content: string) => Promise<string | null>;
}

const LensContext = createContext<LensContextType | undefined>(undefined);

const LENS_STORAGE = {
  accessToken: 'lens_access_token',
  profile: 'lens_profile',
};

const LENS_UNAVAILABLE_MESSAGE = 'Lens publishing is not enabled on this deployment.';

function isLensSocialEnabled() {
  return process.env.NEXT_PUBLIC_LENS_SOCIAL_ENABLED === 'true';
}

function buildInitialState(isAvailable: boolean): LensConnectionState {
  return {
    isConnected: false,
    profile: null,
    accessToken: null,
    isAvailable,
    error: isAvailable ? null : LENS_UNAVAILABLE_MESSAGE,
  };
}

async function readJsonResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data as Record<string, any>;
}

export const LensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, chain } = useWallet();
  const { wallets } = useWallets();
  const lensEnabled = isLensSocialEnabled();

  const [state, setState] = useState<LensConnectionState>(() => buildInitialState(lensEnabled));

  useEffect(() => {
    if (!lensEnabled) {
      localStorage.removeItem(LENS_STORAGE.accessToken);
      localStorage.removeItem(LENS_STORAGE.profile);
      setState(buildInitialState(false));
      return;
    }

    const savedToken = localStorage.getItem(LENS_STORAGE.accessToken);
    const savedProfile = localStorage.getItem(LENS_STORAGE.profile);

    if (!savedToken || !savedProfile) {
      setState(buildInitialState(true));
      return;
    }

    try {
      setState({
        isConnected: true,
        accessToken: savedToken,
        profile: JSON.parse(savedProfile),
        isAvailable: true,
        error: null,
      });
    } catch {
      localStorage.removeItem(LENS_STORAGE.accessToken);
      localStorage.removeItem(LENS_STORAGE.profile);
      setState(buildInitialState(true));
    }
  }, [address, lensEnabled]);

  const markUnavailable = (message = LENS_UNAVAILABLE_MESSAGE) => {
    localStorage.removeItem(LENS_STORAGE.accessToken);
    localStorage.removeItem(LENS_STORAGE.profile);
    setState((prev) => ({
      ...prev,
      isConnected: false,
      profile: null,
      accessToken: null,
      isAvailable: false,
      error: message,
    }));
  };

  const setError = (message: string | null) => {
    setState((prev) => ({
      ...prev,
      error: message,
    }));
  };

  const login = async () => {
    if (!lensEnabled) {
      markUnavailable();
      throw new Error(LENS_UNAVAILABLE_MESSAGE);
    }

    if (!address) {
      const message = 'Connect a wallet before linking Lens.';
      setError(message);
      throw new Error(message);
    }

    try {
      const challengeRes = await fetch('/api/lens/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const challengeData = await readJsonResponse(challengeRes);

      if (!challengeRes.ok) {
        const message = challengeData.error || 'Failed to generate Lens challenge.';
        if (challengeRes.status === 503) {
          markUnavailable(message);
        } else {
          setError(message);
        }
        throw new Error(message);
      }

      const text = challengeData.text;
      if (!text) {
        throw new Error('Lens challenge response was empty.');
      }

      let signature = '';
      const privyWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

      if (privyWallet && chain === 'social') {
        signature = await privyWallet.sign(text);
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;
        signature = await provider.request({
          method: 'personal_sign',
          params: [text, address],
        });
      } else {
        throw new Error('Lens login requires a connected wallet or embedded social wallet.');
      }

      const authRes = await fetch('/api/lens/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, message: text }),
      });
      const authData = await readJsonResponse(authRes);

      if (!authRes.ok) {
        const message = authData.error || 'Failed to authenticate with Lens.';
        if (authRes.status === 503) {
          markUnavailable(message);
        } else {
          setError(message);
        }
        throw new Error(message);
      }

      const newState = {
        isConnected: true,
        profile: authData.profile ?? null,
        accessToken: authData.accessToken ?? null,
        isAvailable: true,
        error: null,
      };

      setState(newState);
      localStorage.setItem(LENS_STORAGE.accessToken, newState.accessToken || '');
      localStorage.setItem(LENS_STORAGE.profile, JSON.stringify(newState.profile));
    } catch (error) {
      if (error instanceof Error && !state.error) {
        setError(error.message);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(LENS_STORAGE.accessToken);
    localStorage.removeItem(LENS_STORAGE.profile);
    setState(buildInitialState(lensEnabled));
  };

  const postMatchProof = async (matchData: any) => {
    if (!lensEnabled) {
      markUnavailable();
      return null;
    }

    if (!state.accessToken || !state.profile) {
      return null;
    }

    try {
      const content = [
        '🏆 Verified result on SportWarren',
        matchData.squadName ? `Squad: ${matchData.squadName}` : null,
        matchData.opponent ? `Opponent: ${matchData.opponent}` : null,
        `Result: ${matchData.homeScore} - ${matchData.awayScore}${matchData.resultLabel ? ` (${matchData.resultLabel})` : ''}`,
        `Venue: ${matchData.venue || 'Local ground'}`,
        matchData.matchDate ? `Date: ${new Date(matchData.matchDate).toLocaleDateString()}` : null,
        matchData.workflowId ? `Verification Reference: ${matchData.workflowId}` : null,
      ].filter(Boolean).join('\n');

      const res = await fetch('/api/lens/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify({
          profileId: state.profile.id,
          content,
        }),
      });
      const data = await readJsonResponse(res);

      if (!res.ok) {
        const message = data.error || 'Lens publishing failed.';
        if (res.status === 503) {
          markUnavailable(message);
        } else {
          setError(message);
        }
        return null;
      }

      setError(null);
      return typeof data.pubId === 'string' ? data.pubId : null;
    } catch (error) {
      console.error('Lens Post Failed:', error);
      setError(error instanceof Error ? error.message : 'Lens publishing failed.');
      return null;
    }
  };

  const postHighlight = async (content: string) => {
    if (!lensEnabled) {
      markUnavailable();
      return null;
    }

    if (!state.accessToken || !state.profile) {
      return null;
    }

    try {
      const res = await fetch('/api/lens/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.accessToken}`,
        },
        body: JSON.stringify({
          profileId: state.profile.id,
          content,
        }),
      });
      const data = await readJsonResponse(res);

      if (!res.ok) {
        const message = data.error || 'Lens publishing failed.';
        if (res.status === 503) {
          markUnavailable(message);
        } else {
          setError(message);
        }
        return null;
      }

      setError(null);
      return typeof data.pubId === 'string' ? data.pubId : null;
    } catch (error) {
      console.error('Lens Post Failed:', error);
      setError(error instanceof Error ? error.message : 'Lens publishing failed.');
      return null;
    }
  };

  return (
    <LensContext.Provider value={{ ...state, login, logout, postMatchProof, postHighlight }}>
      {children}
    </LensContext.Provider>
  );
};

export const useLens = () => {
  const context = useContext(LensContext);
  if (!context) throw new Error('useLens must be used within a LensProvider');
  return context;
};
