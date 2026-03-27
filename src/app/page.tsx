"use client";

import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { hasAccount } = useWallet();
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  const [focusWaitlist, setFocusWaitlist] = useState(false);

  const hasRealSession = hasAccount || authenticated;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === '1') {
      setShowWalletModal(true);
      setPendingRedirect(true);
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
    if (params.get('wl') === '1') {
      setFocusWaitlist(true);
      const nextUrl = window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    if (pendingRedirect && hasRealSession) {
      setShowWalletModal(false);
      setPendingRedirect(false);
      router.push('/dashboard');
    }
  }, [hasRealSession, pendingRedirect, router]);

  const handleEnterApp = () => {
    if (hasRealSession) {
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
        autoFocusWaitlist={focusWaitlist}
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
