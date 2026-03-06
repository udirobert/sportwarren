"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { LensProvider } from "@/contexts/LensContext";
import { TRPCProvider } from "@/lib/trpc-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <LensProvider>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </LensProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}
