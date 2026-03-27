"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserPreferences } from '@/types';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AUTH_STORAGE_KEYS, SIGNATURE_EXPIRY_MS } from '@/lib/auth/constants';
import { getPrivyEmbeddedWallet, signWithPrivyEmbeddedWallet } from '@/lib/auth/embedded-wallet';
import { trackWalletConnection, trackGuestMode, trackFeatureUsed } from '@/lib/analytics';

// Storage keys - centralized for consistency
const STORAGE_KEYS = {
  ALGORAND_ADDRESS: 'sw_algorand_address',
  AVALANCHE_ADDRESS: 'sw_avalanche_address',
  LENS_ADDRESS: 'sw_lens_address',
  PREFERRED_CHAIN: 'sw_preferred_chain',
  USER_PREFERENCES: 'sw_user_preferences',
  GUEST_PENDING_MIGRATION: 'sw_guest_pending_migration',
} as const;

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const normalizeAlgorandSignature = (signed: unknown): string => {
  if (!signed) return '';
  if (typeof signed === 'string') return signed;
  if (signed instanceof Uint8Array) return toBase64(signed);
  if (Array.isArray(signed)) {
    if (!signed.length) return '';
    if (typeof signed[0] === 'number') {
      return toBase64(Uint8Array.from(signed));
    }
    return normalizeAlgorandSignature(signed[0]);
  }
  if (typeof signed === 'object') {
    const sig = (signed as { signature?: unknown; sig?: unknown; signed?: unknown }).signature
      ?? (signed as { sig?: unknown }).sig
      ?? (signed as { signed?: unknown }).signed;
    if (sig) return normalizeAlgorandSignature(sig);
  }
  return '';
};

const signWithAlgorandProvider = async (
  provider: any,
  walletAddress: string,
  messageBytes: Uint8Array,
  message: string
): Promise<string> => {
  if (!provider?.signData) return '';
  const payload = [{ data: toBase64(messageBytes), message }];
  try {
    const signed = await provider.signData(payload, walletAddress);
    return normalizeAlgorandSignature(signed);
  } catch {
    try {
      const fallbackPayload = [{ data: messageBytes, message }];
      const signed = await provider.signData(fallbackPayload, walletAddress);
      return normalizeAlgorandSignature(signed);
    } catch (fallbackError) {
      console.warn('Algorand signData failed:', fallbackError);
      return '';
    }
  }
};

const signWithAlgoSigner = async (
  algoSigner: any,
  walletAddress: string,
  messageBytes: Uint8Array
): Promise<string> => {
  if (!algoSigner?.signBytes) return '';
  const encoded = algoSigner?.encoding?.msgpackToBase64
    ? algoSigner.encoding.msgpackToBase64(messageBytes)
    : toBase64(messageBytes);
  const signed = await algoSigner.signBytes({ data: encoded, from: walletAddress });
  return normalizeAlgorandSignature(signed);
};

const signWithMnemonic = async (mnemonic: string, messageBytes: Uint8Array): Promise<string> => {
  const algosdk = (await import('algosdk')).default;
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  const signatureBytes = algosdk.signBytes(messageBytes, account.sk);
  return toBase64(signatureBytes);
};

const signWithEvmProvider = async (walletAddress: string, message: string): Promise<string> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No EVM wallet found. Please install MetaMask.');
  }
  const provider = (window as any).ethereum;
  const signature: string = await provider.request({
    method: 'personal_sign',
    params: [message, walletAddress],
  });
  return signature;
};

type AuthState = 'none' | 'missing' | 'expired' | 'valid' | 'guest';

interface AuthStatus {
  state: AuthState;
  signedAt?: number;
  expiresAt?: number;
  isRefreshing: boolean;
}

const isWalletChain = (value: string | null): value is 'algorand' | 'avalanche' | 'lens' =>
  value === 'algorand' || value === 'avalanche' || value === 'lens';

const isAuthCapableChain = (value: string | null): value is 'algorand' | 'avalanche' | 'lens' | 'social' =>
  value === 'social' || isWalletChain(value);

const getStoredAuth = (): { signature?: string; message?: string; timestamp?: number; address?: string; chain?: string } => {
  if (typeof window === 'undefined') return {};
  const signature = localStorage.getItem(AUTH_STORAGE_KEYS.SIGNATURE) || undefined;
  const message = localStorage.getItem(AUTH_STORAGE_KEYS.MESSAGE) || undefined;
  const timestampRaw = localStorage.getItem(AUTH_STORAGE_KEYS.TIMESTAMP);
  const timestamp = timestampRaw ? Number(timestampRaw) : undefined;
  const address = localStorage.getItem(AUTH_STORAGE_KEYS.ADDRESS) || undefined;
  const chain = localStorage.getItem(AUTH_STORAGE_KEYS.CHAIN) || undefined;
  if (!signature || !message || !timestamp || Number.isNaN(timestamp)) {
    return {};
  }
  return { signature, message, timestamp, address, chain };
};

const persistAuth = (signature: string, message: string, timestamp: number, address: string, chain: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEYS.SIGNATURE, signature);
  localStorage.setItem(AUTH_STORAGE_KEYS.MESSAGE, message);
  localStorage.setItem(AUTH_STORAGE_KEYS.TIMESTAMP, String(timestamp));
  localStorage.setItem(AUTH_STORAGE_KEYS.ADDRESS, address);
  localStorage.setItem(AUTH_STORAGE_KEYS.CHAIN, chain);
};

const hasGuestProgress = () => {
  if (typeof window === 'undefined') return false;
  const drafts = localStorage.getItem('sw_guest_drafts');
  const xp = localStorage.getItem('sw_guest_xp');
  return Boolean(drafts || xp);
};

const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.SIGNATURE);
  localStorage.removeItem(AUTH_STORAGE_KEYS.MESSAGE);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TIMESTAMP);
  localStorage.removeItem(AUTH_STORAGE_KEYS.ADDRESS);
  localStorage.removeItem(AUTH_STORAGE_KEYS.CHAIN);
};

const computeAuthStatus = (
  hasWallet: boolean,
  isGuest: boolean,
  chain: string | null,
  walletAddress: string | null
): AuthStatus => {
  if (isGuest) {
    return { state: 'guest', isRefreshing: false };
  }
  if (!hasWallet || !isAuthCapableChain(chain) || !walletAddress) {
    return { state: 'none', isRefreshing: false };
  }
  const stored = getStoredAuth();
  if (!stored.signature || !stored.message || !stored.timestamp) {
    return { state: 'missing', isRefreshing: false };
  }
  if (!stored.address || !stored.chain) {
    return { state: 'missing', isRefreshing: false };
  }
  if (stored.address.toLowerCase() !== walletAddress.toLowerCase() || stored.chain !== chain) {
    return { state: 'missing', isRefreshing: false };
  }
  const expiresAt = stored.timestamp + SIGNATURE_EXPIRY_MS;
  const isExpired = Date.now() > expiresAt;
  return {
    state: isExpired ? 'expired' : 'valid',
    signedAt: stored.timestamp,
    expiresAt,
    isRefreshing: false,
  };
};

interface WalletContextType {
  address: string | null;
  connected: boolean;
  hasAccount: boolean;
  hasWallet: boolean;
  isGuest: boolean;
  loginMethod: 'wallet' | 'social' | 'guest' | null;
  chain: 'algorand' | 'avalanche' | 'lens' | 'social' | null;
  balance: number;
  connect: (method: 'algorand' | 'avalanche' | 'lens' | 'google' | 'discord') => Promise<void>;
  loginAsGuest: () => void;
  refreshAuthSignature: () => Promise<boolean>;
  disconnect: () => void;
  authStatus: AuthStatus;
  isVerified: boolean;
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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<'algorand' | 'avalanche' | 'lens' | 'social' | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'social' | 'guest' | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => ({
    state: 'none',
    isRefreshing: false,
  }));
  const [embeddedWalletReady, setEmbeddedWalletReady] = useState(false);

  const { login, logout: privyLogout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  const updateAuthStatus = useCallback((refreshingOverride?: boolean) => {
    setAuthStatus(prev => {
      const next = computeAuthStatus(!!walletAddress, isGuest, chain, walletAddress);
      return { ...next, isRefreshing: refreshingOverride ?? prev.isRefreshing };
    });
  }, [walletAddress, isGuest, chain]);

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
      setIsGuest(false);
      localStorage.removeItem('sw_is_guest');
      setLoginMethod('social');

      // Mark that we're provisioning auth so updateAuthStatus doesn't race
      setEmbeddedWalletReady(false);

      const setupEmbeddedWallet = async () => {
        if (user.wallet) {
          const embeddedWalletAddress = user.wallet.address;
          setAddress(embeddedWalletAddress);
          setWalletAddress(embeddedWalletAddress);
          setChain('social');
          localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'social');

          const existingStatus = computeAuthStatus(true, false, 'social', embeddedWalletAddress);
          if (existingStatus.state === 'valid') {
            setAuthStatus(existingStatus);
            setEmbeddedWalletReady(true);
            return;
          }

          // Set provisioning state while we sign
          setAuthStatus({ state: 'missing', isRefreshing: true });

          // Wait for wallets array to populate (it may be empty initially)
          let embeddedWallet = getPrivyEmbeddedWallet(wallets, embeddedWalletAddress);
          let attempts = 0;
          while (!embeddedWallet && attempts < 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            embeddedWallet = getPrivyEmbeddedWallet(wallets, embeddedWalletAddress);
            attempts++;
          }

          if (!embeddedWallet) {
            console.warn('Embedded wallet not found after waiting');
            setAuthStatus({ state: 'missing', isRefreshing: false });
            setEmbeddedWalletReady(true);
            return;
          }

          try {
            const challengeRes = await fetch('/api/auth/challenge', { cache: 'no-store' });
            const { message, timestamp } = await challengeRes.json();
            const { signature, address: signerAddress } = await signWithPrivyEmbeddedWallet(wallets, message, embeddedWalletAddress);
            persistAuth(signature, message, timestamp, signerAddress, 'social');
            setAuthStatus({
              state: 'valid',
              signedAt: timestamp,
              expiresAt: timestamp + SIGNATURE_EXPIRY_MS,
              isRefreshing: false,
            });
          } catch (signError) {
            console.warn('Failed to sign auth challenge with embedded wallet:', signError);
            setAuthStatus({ state: 'missing', isRefreshing: false });
          }
        } else {
          // Social-only login (Google/email) — Privy authenticated but no wallet yet
          const socialId = user.email?.address || user.google?.email || user.id;
          setAddress(socialId || `privy:${user.id}`);
          setWalletAddress(null);
          setChain('social');
        }
        setEmbeddedWalletReady(true);
      };

      setupEmbeddedWallet();
    } else if (ready && !authenticated) {
      const savedPrefs = loadPreferences();

      const savedAlgorand = localStorage.getItem(STORAGE_KEYS.ALGORAND_ADDRESS);
      const savedAvalanche = localStorage.getItem(STORAGE_KEYS.AVALANCHE_ADDRESS);
      const savedLens = localStorage.getItem(STORAGE_KEYS.LENS_ADDRESS);
      const _savedChain = localStorage.getItem(STORAGE_KEYS.PREFERRED_CHAIN) as 'algorand' | 'avalanche' | 'lens' | null;

      if (savedAlgorand) {
        setAddress(savedAlgorand);
        setWalletAddress(savedAlgorand);
        setChain('algorand');
        fetchAlgorandBalance(savedAlgorand);
      } else if (savedAvalanche) {
        setAddress(savedAvalanche);
        setWalletAddress(savedAvalanche);
        setChain('avalanche');
        fetchAvalancheBalance(savedAvalanche);
      } else if (savedLens) {
        setAddress(savedLens);
        setWalletAddress(savedLens);
        setChain('lens');
        fetchLensBalance(savedLens);
      } else if (localStorage.getItem('sw_is_guest') === 'true') {
        setIsGuest(true);
        setAddress('0xGUEST_DEMO_MODE');
        setWalletAddress(null);
        setChain('lens');
        setBalance(1000);
        trackGuestMode('started');
      } else if (savedPrefs?.preferredChain) {
        setWalletAddress(null);
        setChain(savedPrefs.preferredChain);
      }
    }
  }, [loadPreferences, ready, authenticated, user, wallets]);

  useEffect(() => {
    // Skip if we're still provisioning the embedded wallet
    if (chain === 'social' && !embeddedWalletReady) {
      return;
    }
    updateAuthStatus(false);
  }, [walletAddress, chain, isGuest, embeddedWalletReady, updateAuthStatus]);

  useEffect(() => {
    if (authStatus.state !== 'valid' || !authStatus.expiresAt) return;
    const remainingMs = authStatus.expiresAt - Date.now();
    if (remainingMs <= 0) {
      updateAuthStatus(false);
      return;
    }
    // Proactive refresh: refresh signature when 90% of validity period has passed
    // This prevents unexpected expiration during active usage
    const validityPeriod = authStatus.expiresAt - authStatus.signedAt!;
    const proactiveRefreshTime = authStatus.signedAt! + validityPeriod * 0.9; // 90% through validity period
    const timeUntilProactiveRefresh = proactiveRefreshTime - Date.now();
    
    if (timeUntilProactiveRefresh > 0) {
      // Schedule proactive refresh before expiry
      const proactiveTimer = window.setTimeout(() => {
        refreshAuthSignature();
      }, timeUntilProactiveRefresh);
      return () => window.clearTimeout(proactiveTimer);
    }
    
    // Fallback: just update status when expired
    const timeout = window.setTimeout(() => {
      updateAuthStatus(false);
    }, remainingMs + 25);
    return () => window.clearTimeout(timeout);
  }, [authStatus.expiresAt, authStatus.state, authStatus.signedAt, updateAuthStatus, refreshAuthSignature]);

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

  const refreshAuthSignature = useCallback(async (): Promise<boolean> => {
    if (isGuest || !walletAddress || !isAuthCapableChain(chain)) {
      updateAuthStatus(false);
      return false;
    }

    setAuthStatus(prev => ({ ...prev, isRefreshing: true }));

    try {
      const challengeRes = await fetch('/api/auth/challenge', { cache: 'no-store' });
      const { message, timestamp } = await challengeRes.json();

      let signature = '';
      if (chain === 'algorand') {
        const messageBytes = new TextEncoder().encode(message);
        const peraWallet = (window as any).peraWallet;
        const deflyWallet = (window as any).deflyWallet;
        const algoSigner = (window as any).AlgoSigner;
        signature =
          (await signWithAlgorandProvider(peraWallet, walletAddress, messageBytes, message)) ||
          (await signWithAlgorandProvider(deflyWallet, walletAddress, messageBytes, message)) ||
          (await signWithAlgoSigner(algoSigner, walletAddress, messageBytes));
      } else if (chain === 'social') {
        const signed = await signWithPrivyEmbeddedWallet(wallets, message, walletAddress);
        signature = signed.signature;
      } else {
        signature = await signWithEvmProvider(walletAddress, message);
      }

      if (!signature) {
        throw new Error('Failed to sign authentication message.');
      }

      persistAuth(signature, message, timestamp, walletAddress, chain);
      updateAuthStatus(false);
      return true;
    } catch (error) {
      console.error('Failed to refresh wallet authentication:', error);
      updateAuthStatus(false);
      return false;
    } finally {
      setAuthStatus(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [walletAddress, chain, isGuest, updateAuthStatus, wallets]);

  const connect = async (method: 'algorand' | 'avalanche' | 'lens' | 'google' | 'discord') => {
    try {
      const pendingGuestMigration = hasGuestProgress();
      if (pendingGuestMigration) {
        localStorage.setItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION, 'true');
      }
      if (method === 'google' || method === 'discord') {
        // ── Social Onboarding Flow (Progressive Identity) via Privy ──
        clearAuth();
        setIsGuest(false);
        localStorage.removeItem('sw_is_guest');
        login();
        return;
      }

      clearAuth();
      setIsGuest(false);
      localStorage.removeItem('sw_is_guest');

      if (method === 'algorand') {
        // ── Step 1: Get address from browser wallet ──
        let walletAddress = '';
        let walletProvider: 'pera' | 'defly' | 'algosigner' | 'mnemonic' | null = null;
        const peraWallet = (window as any).peraWallet;
        const deflyWallet = (window as any).deflyWallet;
        const algoSigner = (window as any).AlgoSigner;

        if (peraWallet?.connect) {
          const accounts = await peraWallet.connect();
          walletAddress = accounts?.[0] || '';
          walletProvider = 'pera';
        } else if (deflyWallet?.connect) {
          const accounts = await deflyWallet.connect();
          walletAddress = accounts?.[0] || '';
          walletProvider = 'defly';
        } else if (algoSigner) {
          await algoSigner.connect({ ledger: 'TestNet' });
          const accounts = await algoSigner.accounts({ ledger: 'TestNet' });
          walletAddress = accounts?.[0]?.address || '';
          walletProvider = 'algosigner';
        } else {
          // Dev fallback — mnemonic from env
          const testMnemonic = process.env.NEXT_PUBLIC_ALGORAND_TEST_MNEMONIC;
          if (testMnemonic) {
            const algosdk = (await import('algosdk')).default;
            const account = algosdk.mnemonicToSecretKey(testMnemonic);
            walletAddress = account.addr.toString();
            walletProvider = 'mnemonic';
          }
        }

        if (!walletAddress) throw new Error('No Algorand wallet found. Please install Pera or Defly wallet.');

        // ── Step 2: Fetch challenge from server ──
        const challengeRes = await fetch('/api/auth/challenge', { cache: 'no-store' });
        const { message, timestamp } = await challengeRes.json();

        // ── Step 3: Sign client-side ──
        const messageBytes = new TextEncoder().encode(message);
        let signature = '';

        if (walletProvider === 'pera') {
          signature = await signWithAlgorandProvider(peraWallet, walletAddress, messageBytes, message);
        } else if (walletProvider === 'defly') {
          signature = await signWithAlgorandProvider(deflyWallet, walletAddress, messageBytes, message);
        } else if (walletProvider === 'algosigner') {
          signature = await signWithAlgoSigner(algoSigner, walletAddress, messageBytes);
        } else if (walletProvider === 'mnemonic') {
          const testMnemonic = process.env.NEXT_PUBLIC_ALGORAND_TEST_MNEMONIC;
          if (testMnemonic) {
            signature = await signWithMnemonic(testMnemonic, messageBytes);
          }
        }

        if (!signature) {
          signature =
            (await signWithAlgorandProvider(peraWallet, walletAddress, messageBytes, message)) ||
            (await signWithAlgorandProvider(deflyWallet, walletAddress, messageBytes, message)) ||
            (await signWithAlgoSigner(algoSigner, walletAddress, messageBytes));

          if (!signature) {
            throw new Error('Failed to sign authentication message with Algorand wallet.');
          }
        }

        // ── Step 4: Persist auth state ──
        setAddress(walletAddress);
        setWalletAddress(walletAddress);
        setChain('algorand');
        localStorage.setItem(STORAGE_KEYS.ALGORAND_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'algorand');
        persistAuth(signature, message, timestamp, walletAddress, 'algorand');
        setLoginMethod('wallet');
        fetchAlgorandBalance(walletAddress);
        trackWalletConnection('algorand', true);
        trackFeatureUsed('wallet_connect');

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
        const challengeRes = await fetch('/api/auth/challenge', { cache: 'no-store' });
        const { message, timestamp } = await challengeRes.json();
        const signature = await signWithEvmProvider(walletAddress, message);

        setAddress(walletAddress);
        setWalletAddress(walletAddress);
        setChain('avalanche');
        localStorage.setItem(STORAGE_KEYS.AVALANCHE_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'avalanche');
        persistAuth(signature, message, timestamp, walletAddress, 'avalanche');
        setLoginMethod('wallet');
        fetchAvalancheBalance(walletAddress);
        trackWalletConnection('avalanche', true);
        trackFeatureUsed('wallet_connect');

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

        const challengeRes = await fetch('/api/auth/challenge', { cache: 'no-store' });
        const { message, timestamp } = await challengeRes.json();
        const signature = await signWithEvmProvider(walletAddress, message);

        setAddress(walletAddress);
        setWalletAddress(walletAddress);
        setChain('lens');
        localStorage.setItem(STORAGE_KEYS.LENS_ADDRESS, walletAddress);
        localStorage.setItem(STORAGE_KEYS.PREFERRED_CHAIN, 'lens');
        persistAuth(signature, message, timestamp, walletAddress, 'lens');
        setLoginMethod('wallet');
        fetchLensBalance(walletAddress);
        trackWalletConnection('lens', true);
        trackFeatureUsed('wallet_connect');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      trackWalletConnection(method, false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const loginAsGuest = () => {
    clearAuth();
    setIsGuest(true);
    setAddress('0xGUEST_DEMO_MODE');
    setWalletAddress(null);
    setChain('lens');
    setBalance(1000);
    setLoginMethod('guest');
    localStorage.setItem('sw_is_guest', 'true');
    localStorage.removeItem(STORAGE_KEYS.GUEST_PENDING_MIGRATION);
    trackGuestMode('started');
    trackFeatureUsed('guest_login');
  };

  const disconnect = () => {
    if (authenticated) {
      privyLogout();
    }
    setAddress(null);
    setWalletAddress(null);
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
    clearAuth();
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
        hasAccount: !!address && !isGuest,
        hasWallet: !!walletAddress && !isGuest,
        isGuest,
        loginMethod,
        chain,
        balance,
        connect,
        loginAsGuest,
        refreshAuthSignature,
        disconnect,
        authStatus,
        isVerified: authStatus.state === 'valid',
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
