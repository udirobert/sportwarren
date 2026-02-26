"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { WalletProvider } from "@/contexts/WalletContext";
import { TRPCProvider } from "@/lib/trpc-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}
