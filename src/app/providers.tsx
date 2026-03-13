"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { LensProvider } from "@/contexts/LensContext";
import { TRPCProvider } from "@/lib/trpc-provider";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { GuestMigrationPrompt } from "@/components/onboarding/GuestMigrationPrompt";
import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clov6v7p000l8m801469e38z6'} // Fallback for dev/demo if not set
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
          <WalletProvider>
            <LensProvider>
              <EnvironmentProvider>
                <TRPCProvider>
                  <ToastProvider>
                    {children}
                    <OnboardingWizard />
                    <GuestMigrationPrompt />
                  </ToastProvider>
                </TRPCProvider>
              </EnvironmentProvider>
            </LensProvider>
          </WalletProvider>
        </PrivyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
