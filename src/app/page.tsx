"use client";

import { AdaptiveDashboard } from "../components/adaptive/AdaptiveDashboard";
import { HeroSection } from "../components/common/HeroSection";
import { BrandStory } from "../components/common/BrandStory";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <>
        <HeroSection />
        <BrandStory />
      </>
    );
  }

  return <AdaptiveDashboard />;
}
