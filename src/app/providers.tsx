"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";

function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { address, chain } = useWallet();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));
  
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

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <AppContent>
          {children}
        </AppContent>
      </WalletProvider>
    </ErrorBoundary>
  );
}
