'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useMemo } from 'react';
import { trpc } from './trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import { AUTH_STORAGE_KEYS } from '@/lib/auth/constants';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { address, chain, walletAddress, hasWallet, authStatus } = useWallet();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry auth errors
          if (error?.data?.code === 'UNAUTHORIZED') return false;
          return failureCount < 2;
        },
      },
    },
  }));

  // Re-create the TRPC client whenever the connected wallet changes.
  // This ensures all queries are re-issued under the new auth identity.
  const trpcClient = useMemo(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // headers() is called fresh on every request — reads from localStorage
          // so newly-signed credentials are always sent without stale closures.
          headers: () => {
            const headers: Record<string, string> = {};

            // Use address & chain from closure (they are reactive via useMemo dep)
            if (hasWallet && address) headers['x-wallet-address'] = address;
            if (hasWallet && chain) headers['x-chain'] = chain;

            // Auth tokens written by WalletContext.connect() after local signing
            if (typeof window !== 'undefined') {
              const sig = localStorage.getItem(AUTH_STORAGE_KEYS.SIGNATURE);
              const msg = localStorage.getItem(AUTH_STORAGE_KEYS.MESSAGE);
              const ts = localStorage.getItem(AUTH_STORAGE_KEYS.TIMESTAMP);
              if (sig) headers['x-wallet-signature'] = sig;
              if (msg) headers['x-auth-message'] = msg;
              if (ts) headers['x-auth-timestamp'] = ts;
            }

            return headers;
          },
        }),
      ],
    }),
     
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, chain, hasWallet, walletAddress, authStatus.state, authStatus.signedAt]); // re-create when wallet identity or auth state changes

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
