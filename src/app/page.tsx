"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useState, useEffect } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";

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

const HAS_VISITED_KEY = 'sw_has_visited_dashboard';

export default function Home() {
  const { connected, address, isGuest } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const hasVisited = localStorage.getItem(HAS_VISITED_KEY);
    if (hasVisited === 'true' && connected) {
      setShowDashboard(true);
    }
  }, [connected]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === '1') {
      setShowWalletModal(true);
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    if (showDashboard) {
      localStorage.setItem(HAS_VISITED_KEY, 'true');
    }
  }, [showDashboard]);

  const handleEnterApp = () => {
    if (connected || isGuest) {
      setShowDashboard(true);
    } else {
      setShowWalletModal(true);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (connected && showDashboard) {
    return <AdaptiveDashboard />;
  }

  return (
    <>
      <HeroSection onGetStarted={handleEnterApp} />
      <WalletConnectModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
        onConnected={() => setShowDashboard(true)}
      />
    </>
  );
}
