"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";

// Dynamically import AdaptiveDashboard to avoid loading on landing page
const AdaptiveDashboard = dynamic(
  () => import("@/components/adaptive/AdaptiveDashboard").then(mod => ({ default: mod.AdaptiveDashboard })),
  { 
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }
);

export default function Home() {
  const { connected } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // If the user is connected AND they've clicked to enter the app, show the dashboard
  if (connected && showDashboard) {
    return <AdaptiveDashboard />;
  }

  return (
    <>
      <HeroSection 
        onGetStarted={() => {
          if (connected) {
            setShowDashboard(true);
          } else {
            setShowWalletModal(true);
          }
        }} 
      />
      <WalletConnectModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
    </>
  );
}
