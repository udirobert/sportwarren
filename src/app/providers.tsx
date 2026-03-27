"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { LensProvider } from "@/contexts/LensContext";
import { TRPCProvider } from "@/lib/trpc-provider";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { GuestMigrationPrompt } from "@/components/onboarding/GuestMigrationPrompt";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ActiveSquadProvider } from "@/contexts/ActiveSquadContext";
import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/common/AnalyticsTracker';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const configuredPrivyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
  const fallbackPrivyAppId = 'clov6v7p000l8m801469e38z6';

  if (!configuredPrivyAppId && typeof window !== 'undefined') {
    console.warn(
      'NEXT_PUBLIC_PRIVY_APP_ID is not set. Falling back to a demo Privy app ID, so social login methods may not match your Privy dashboard configuration.'
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PrivyProvider
          appId={configuredPrivyAppId || fallbackPrivyAppId}
          config={{
            loginMethods: ['google', 'discord', 'email', 'apple'],
            appearance: {
              theme: 'dark',
              accentColor: '#3b82f6',
              showWalletLoginFirst: false,
            },
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
              },
            },
          }}
        >
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config}>
              <WalletProvider>
                <LensProvider>
                  <EnvironmentProvider>
                    <TRPCProvider>
                      <ToastProvider>
                        <ActiveSquadProvider>
                          <Suspense fallback={null}>
                            <AnalyticsTracker />
                          </Suspense>
                          {children}
                          <GuestMigrationPrompt />
                        </ActiveSquadProvider>
                      </ToastProvider>
                    </TRPCProvider>
                  </EnvironmentProvider>
                </LensProvider>
              </WalletProvider>
            </WagmiProvider>
          </QueryClientProvider>
        </PrivyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
