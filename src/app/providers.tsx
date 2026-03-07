"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { LensProvider } from "@/contexts/LensContext";
import { TRPCProvider } from "@/lib/trpc-provider";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <LensProvider>
          <EnvironmentProvider>
            <TRPCProvider>
              {children}
              <OnboardingWizard />
            </TRPCProvider>
          </EnvironmentProvider>
        </LensProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}
