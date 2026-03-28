"use client";

import { HeroSection } from "@/components/common/HeroSection";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import { WalletConnectModal } from "@/components/common/WalletConnectModal";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { MessageSquare } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

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
      
      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://t.me/sportwarren_support"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('feedback_clicked', { source: 'floating_button' })}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-110 active:scale-95 group relative"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 border border-white/10 shadow-xl pointer-events-none">
            Send Feedback
          </span>
        </a>
      </div>

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
