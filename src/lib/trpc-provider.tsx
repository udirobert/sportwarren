'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, useEffect, useCallback } from 'react';
import { trpc } from './trpc-client';
import { useWallet } from '@/contexts/WalletContext';

interface AuthState {
  signature?: string;
  message?: string;
  timestamp?: number;
}

// Generate auth message on client
const generateAuthMessage = (): { message: string; timestamp: number } => {
  const timestamp = Date.now();
  const message = `Sign this message to authenticate with SportWarren. Timestamp: ${timestamp}`;
  return { message, timestamp };
};

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { address, chain, connected } = useWallet();
  const [authState, setAuthState] = useState<AuthState>({});
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  // Function to sign authentication message
  const signAuthMessage = useCallback(async () => {
    if (!connected || !address || !chain) {
      setAuthState({});
      return;
    }

    // In development, skip signing
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Skipping wallet signature');
      setAuthState({});
      return;
    }

    try {
      // Generate auth message
      const { message, timestamp } = generateAuthMessage();
      
      // TODO: Implement actual wallet signing
      // const signature = await wallet.signMessage(message);
      
      setAuthState({
        message,
        timestamp,
        // signature, // Would be set after actual signing
      });
    } catch (error) {
      console.error('Failed to sign auth message:', error);
      setAuthState({});
    }
  }, [connected, address, chain]);

  // Sign when wallet connects
  useEffect(() => {
    signAuthMessage();
  }, [signAuthMessage]);

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers: () => {
            const headers: Record<string, string> = {};
            
            if (address) {
              headers['x-wallet-address'] = address;
            }
            if (chain) {
              headers['x-chain'] = chain;
            }
            
            // Add auth headers if available
            if (authState.signature) {
              headers['x-wallet-signature'] = authState.signature;
            }
            if (authState.message) {
              headers['x-auth-message'] = authState.message;
            }
            if (authState.timestamp) {
              headers['x-auth-timestamp'] = authState.timestamp.toString();
            }
            
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
