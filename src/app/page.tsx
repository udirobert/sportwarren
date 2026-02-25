"use client";

import { useState, useEffect } from "react";
import { AdaptiveDashboard } from "../components/adaptive/AdaptiveDashboard";
import { HeroSection } from "../components/common/HeroSection";
import { BrandStory } from "../components/common/BrandStory";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in (check wallet connection, auth token, etc.)
    const checkAuth = () => {
      // For now, check localStorage or wallet connection
      const hasWallet = typeof window !== 'undefined' && 
        (localStorage.getItem('walletConnected') === 'true' || 
         localStorage.getItem('userAddress'));
      setIsLoggedIn(!!hasWallet);
    };
    
    checkAuth();
  }, []);

  // Show hero for logged-out users
  if (!isLoggedIn) {
    return (
      <>
        <HeroSection onGetStarted={() => setIsLoggedIn(true)} />
        <BrandStory />
      </>
    );
  }

  // Show dashboard for logged-in users
  return <AdaptiveDashboard />;
}
