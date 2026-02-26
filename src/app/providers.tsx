"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "../lib/apollo-client";
import { SmartNavigation } from "../components/adaptive/SmartNavigation";
import { useSocket } from "../hooks/useSocket";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { SmartOnboarding } from "../components/onboarding/SmartOnboarding";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { useState } from "react";

function AppContent({ children }: { children: React.ReactNode }) {
  const { preferences, savePreferences } = useUserPreferences();
  const { connected } = useWallet();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we should show onboarding
  const shouldShowOnboarding = connected && 
    showOnboarding && 
    !preferences.usagePatterns.completedOnboarding &&
    !preferences.usagePatterns.onboardingSkipped;

  // Show onboarding only if explicitly requested (via settings) or first-time user
  if (shouldShowOnboarding) {
    return (
      <SmartOnboarding 
        onComplete={() => setShowOnboarding(false)} 
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      <div className="min-h-screen">
        <SmartNavigation />
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </ApolloProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUserPreferences();

  // Initialize socket connection
  useSocket();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading SportWarren...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <AppContent>{children}</AppContent>
    </WalletProvider>
  );
}
