"use client";

import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";

export default function Home() {
  const { connected } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  if (!connected) {
    return (
      <>
        <HeroSection onGetStarted={() => setShowWalletModal(true)} />
        <WalletConnectModal 
          isOpen={showWalletModal} 
          onClose={() => setShowWalletModal(false)} 
        />
      </>
    );
  }

  // Import dynamically to avoid loading on landing page
  const { AdaptiveDashboard } = require("@/components/adaptive/AdaptiveDashboard");
  return <AdaptiveDashboard />;
}
