"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { LensProvider } from "@/contexts/LensContext";
import { TRPCProvider } from "@/lib/trpc-provider";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { GuestMigrationPrompt } from "@/components/onboarding/GuestMigrationPrompt";
import { PrivyProvider, type PrivyClientConfig } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/web3';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ActiveSquadProvider } from "@/contexts/ActiveSquadContext";
import { Suspense } from 'react';
import { AnalyticsTracker } from '@/components/common/AnalyticsTracker';
import { ExitIntentWaitlist } from '@/components/common/ExitIntentWaitlist';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const configuredPrivyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();

  if (!configuredPrivyAppId && typeof window !== 'undefined') {
    console.error(
      '[SportWarren] NEXT_PUBLIC_PRIVY_APP_ID is not set. ' +
      'Authentication will not work correctly. ' +
      'Set this variable in .env.local to your Privy dashboard app ID.'
    );
  }

  // Privy app IDs are public client-side identifiers (like Firebase project
  // IDs). The placeholder below is format-valid so prerendering and builds
  // succeed even when the env var is missing; the console.error above
  // ensures the misconfiguration is visible to developers at runtime.
  const privyAppId = configuredPrivyAppId || 'clplaceholder000000000000';

  const privyConfig: PrivyClientConfig = {
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
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PrivyProvider
          appId={privyAppId}
          config={privyConfig}
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
                          <ExitIntentWaitlist />
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
