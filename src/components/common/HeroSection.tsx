"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Users, Target, Sparkles, ArrowRight, CheckCircle2, Timer } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { getJourneyContent } from '@/lib/journey/content';
import { getJourneyStage } from '@/lib/journey/stage';
import { AccountStatusControl } from '@/components/common/AccountStatusControl';
import { WaitlistForm } from '@/components/common/WaitlistForm';
import { InteractiveMatchPreview } from '@/components/landing/InteractiveMatchPreview';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { InlineWaitlistSection } from '@/components/landing/InlineWaitlistSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onGuestStart?: () => void;
  autoFocusWaitlist?: boolean;
}

interface PlatformStats {
  totalPlayers: number;
  totalMatches: number;
  totalAgents: number;
  waitlistTotal?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onGuestStart, autoFocusWaitlist }) => {
  const [stats, setStats] = useState<PlatformStats>({ totalPlayers: 0, totalMatches: 0, totalAgents: 0, waitlistTotal: 0 });
  const { address, chain, loginAsGuest, hasAccount, hasWallet, isGuest, authStatus } = useWallet();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallaxRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats({ totalPlayers: 0, totalMatches: 0, totalAgents: 0 });
      });

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
        if (parallaxRef2.current) {
          parallaxRef2.current.style.transform = `translateY(${scrollY * 0.4}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const journeyStage = getJourneyStage({
    isGuest,
    hasAccount,
    hasWallet,
    authState: authStatus.state,
  });
  const journeyContent = getJourneyContent(journeyStage);
  const hasEmbeddedWalletAddress = Boolean(address && /^0x[a-fA-F0-9]{8,}$/.test(address));
  const heroSessionLine = isGuest
    ? 'Guest preview is active. Claim your season when you are ready for progress that sticks.'
    : hasWallet && address
      ? `Signed in with ${address.slice(0, 6)}…${address.slice(-4)} on ${chain || 'your wallet network'}.`
      : hasEmbeddedWalletAddress && address
        ? `Signed in with embedded wallet ${address.slice(0, 6)}…${address.slice(-4)}. Add a chain wallet later for protected actions.`
      : hasAccount
        ? 'Signed in successfully. Add a wallet later when you need protected actions.'
        : null;

  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link href={hasAccount || isGuest ? '/dashboard' : '/'} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.22em] text-white/80">SportWarren</div>
                <div className="text-xs text-white/60">Stop playing ghost matches</div>
              </div>
            </Link>

            {hasAccount || isGuest ? (
              <AccountStatusControl variant="hero" />
            ) : (
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-black/35"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div
            ref={parallaxRef}
            className="absolute top-0 -left-4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
            aria-hidden="true"
          ></div>
          <div
            ref={parallaxRef2}
            className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform"
            aria-hidden="true"
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-20 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight">
            <span className="block text-white">Your Squad,</span>
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Tactically Elevated
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Design your DNA. Simulate tactics. Dominate the pitch. 
            <span className="hidden md:inline"> The ultimate tactical command center for your real-world squad.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
              {journeyContent.hero.primaryCtaLabel}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6">
            <a
              href="https://t.me/sportwarrenbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span>Or open in Telegram</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          {journeyContent.hero.stageLine && (
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.16em] text-green-300">
              {journeyContent.hero.stageLine}
            </p>
          )}

          {heroSessionLine && (
            <div className="mb-6 flex items-center justify-center">
              <div className="inline-flex max-w-2xl items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-100 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{heroSessionLine}</span>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {journeyContent.hero.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-200 backdrop-blur-sm"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <React.Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-2xl bg-white/5" />}>
              <InteractiveMatchPreview />
            </React.Suspense>
          </div>

          <div className="mb-6">
            <div className="text-center text-sm text-gray-400 mb-2">No wallet needed — join the early access list</div>
            <WaitlistForm variant="hero" source="hero" autoFocus={autoFocusWaitlist} />
          </div>

          {!hasAccount && journeyContent.hero.previewLinkLabel && (
            <p className="text-center mb-16">
              <button
                onClick={() => {
                  loginAsGuest();
                  onGuestStart?.();
                }}
                className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400 transition-colors"
              >
                {journeyContent.hero.previewLinkLabel}
              </button>
            </p>
          )}
          {hasAccount && <div className="mb-16" />}

          {stats.totalPlayers > 0 || (stats.waitlistTotal && stats.waitlistTotal > 0) ? (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 sm:p-6 border border-white/5 rounded-2xl bg-white/2">
              <div className="flex items-center space-x-2 group">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-bold text-white">{stats.totalPlayers.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Players</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 group">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-bold text-white">{stats.totalMatches.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs text-gray-400">Matches</div>
                </div>
              </div>
              {stats.totalAgents > 0 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.totalAgents.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">AI Agents</div>
                  </div>
                </div>
              )}
              {stats.waitlistTotal && stats.waitlistTotal > 0 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Timer className="w-4 sm:w-5 h-4 sm:h-5 text-amber-300" aria-hidden="true" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.waitlistTotal.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">On Waitlist</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-green-400" aria-hidden="true" />
                <span>Be among the first to track your rec football stats</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Early access — founding members get lifetime perks</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <InlineWaitlistSection />
      <LandingFooter />
    </div>
  );
};
