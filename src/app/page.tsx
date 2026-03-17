"use client";

import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { connected, isGuest } = useWallet();
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const isLoggedIn = connected || isGuest || authenticated;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === '1') {
      setShowWalletModal(true);
      setPendingRedirect(true);
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    if (pendingRedirect && isLoggedIn) {
      setShowWalletModal(false);
      setPendingRedirect(false);
      router.push('/dashboard');
    }
  }, [pendingRedirect, isLoggedIn, router]);

  const handleEnterApp = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      setPendingRedirect(true);
      setShowWalletModal(true);
    }
  };

  return (
    <>
      <HeroSection
        onGetStarted={handleEnterApp}
        onGuestStart={() => router.push('/dashboard')}
      />
      <WalletConnectModal 
        isOpen={showWalletModal} 
        onClose={() => {
          setShowWalletModal(false);
          setPendingRedirect(false);
        }} 
        onConnected={() => setPendingRedirect(true)}
      />
    </>
  );
}
