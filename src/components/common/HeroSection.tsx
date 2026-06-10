"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Users, Target, Sparkles, ArrowRight, CheckCircle2, Timer } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { getJourneyContent } from '@/lib/journey/content';
import { getJourneyStage } from '@/lib/journey/stage';
import { AccountStatusControl } from '@/components/common/AccountStatusControl';
import { FormationPlayground, type PlaygroundStateSnapshot } from '@/components/landing/FormationPlayground';
import { NaturalLanguageMatchSim } from '@/components/landing/NaturalLanguageMatchSim';
import { PlayerCardPreview } from '@/components/landing/PlayerCardPreview';
import { RivalPreviewCard } from '@/components/landing/RivalPreviewCard';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AppPreviewSection } from '@/components/landing/AppPreviewSection';
import { InlineWaitlistSection } from '@/components/landing/InlineWaitlistSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ShareLinks } from '@/components/common/ShareLinks';
import { usePlatform } from '@/hooks/usePlatform';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';
import type { PlayerPosition } from '@/types';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onGuestStart?: () => void;
  onSavePlayerCard?: () => void;
}

interface PlatformStats {
  totalPlayers: number;
  totalMatches: number;
  totalAgents: number;
  waitlistTotal?: number;
  recentCardsClaimed?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onGuestStart, onSavePlayerCard }) => {
  const [stats, setStats] = useState<PlatformStats>({ totalPlayers: 0, totalMatches: 0, totalAgents: 0, waitlistTotal: 0, recentCardsClaimed: 0 });
  const [cardName, setCardName] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stored = localStorage.getItem('sw_partial_persona');
      return stored ? JSON.parse(stored).displayName || '' : '';
    } catch {
      return '';
    }
  });
  const [cardPosition, setCardPosition] = useState<PlayerPosition>(() => {
    if (typeof window === 'undefined') return 'MF';
    try {
      const stored = localStorage.getItem('sw_partial_persona');
      return stored ? JSON.parse(stored).position || 'MF' : 'MF';
    } catch {
      return 'MF';
    }
  });
  // Tracked separately from the playground's internal state so the persona
  // context (and therefore onboarding prefill) can carry the formation
  // through Path D: playground → save card → personalize.
  const [cardFormation, setCardFormation] = useState<string | null>(null);
  // Full playground state snapshot — piped into NL Match Sim and Rival Preview
  // so the user's accumulated investment (formation, style, color, names, size)
  // carries forward into the simulator surfaces.
  const [playgroundState, setPlaygroundState] = useState<PlaygroundStateSnapshot | null>(null);
  const { loginAsGuest, hasAccount, hasWallet, isGuest, authStatus } = useWallet();
  const { platform, isTelegram } = usePlatform();
  const parallaxRef = useRef<HTMLDivElement>(null);
  const parallaxRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const partial = { displayName: cardName, position: cardPosition };
      if (cardName.trim() || cardPosition !== 'MF') {
        localStorage.setItem('sw_partial_persona', JSON.stringify(partial));
      } else {
        localStorage.removeItem('sw_partial_persona');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cardName, cardPosition]);

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
  const isPublicVisitor = journeyStage === 'public_visitor';
  // New visitors lead with the low-friction persona path (build a card as a guest)
  // rather than a wallet gate. Returning users sign in via the secondary link/header.
  const handlePrimaryCta = () => {
    if (isTelegram) {
      // Telegram Mini App users already have a session — go straight in
      // via the deep link, no web auth modal in front of it.
      if (typeof window !== 'undefined') {
        window.location.assign(buildTelegramDeepLink({ tab: 'squad' }));
      }
      return;
    }
    if (isPublicVisitor) {
      // Public visitors: the section CTA drives the same persona-save
      // conversion as the card. Falls back to onGetStarted when no
      // onSavePlayerCard handler is wired (defensive — should not happen
      // in practice since page.tsx always passes both).
      if (onSavePlayerCard) {
        onSavePlayerCard();
      } else {
        onGetStarted?.();
      }
    } else {
      onGetStarted?.();
    }
  };


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
            <span className="block text-white">Claim Your Spot.</span>
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Build Your Player Card.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Start with a 5s, 6s, or 7s setup. Put yourself in the team, share the card to the group, then turn matchdays into verified stats, XP, and squad history.
          </p>

          <PlayerCardPreview
            authed={hasAccount && !isGuest}
            onSave={onSavePlayerCard ?? onGetStarted}
            onNameChange={setCardName}
            onPositionChange={setCardPosition}
            currentFormation={cardFormation}
          />

          <div className="mx-auto mb-6 grid max-w-sm gap-2 text-left sm:grid-cols-2">
            {[
              { icon: Target, label: "Pick a role", detail: "Small-sided shapes first, 11v11 when the squad grows." },
              { icon: Users, label: "Bring the squad", detail: "Every teammate gets a native spot to claim and share." },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-white">{label}</div>
                <p className="mt-1 text-xs leading-5 text-gray-400">{detail}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            {isPublicVisitor && !isTelegram && (
              // Telegram/WhatsApp are the fastest auth paths for rec players
              // who already coordinate in group chats. Show them as equal
              // co-primary CTAs above the gradient button so the user sees
              // the no-friction path before the wallet gate.
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  {journeyContent.hero.altCtasLabel ?? 'Or open in'}
                </p>
                <ShareLinks
                  variant="primary"
                  layout="row"
                  channels={platform === 'mobile' ? ['whatsapp', 'telegram'] : ['telegram', 'whatsapp']}
                  payload={{
                    text: 'Join me on SportWarren — build a player card and log real matches with the squad.',
                    url: typeof window === 'undefined' ? undefined : `${window.location.origin}/?connect=1`,
                    telegramDeepLink: buildTelegramDeepLink({ tab: 'squad' }),
                  }}
                  trackEventName="hero_channel_cta_clicked"
                  trackProps={{ surface: 'hero_primary' }}
                />
              </div>
            )}
            <button
              onClick={handlePrimaryCta}
              className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
              {isTelegram ? 'Open in Telegram' : journeyContent.hero.primaryCtaLabel}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
            {isPublicVisitor && (
              // For public visitors, the playground is the natural secondary
              // destination after the card-save CTA. Low-emphasis text link
              // — visually subordinate to the gradient primary above.
              <button
                onClick={() => document.getElementById('formation-playground')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <span>Or scroll down to try the playground</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>
            )}
          </div>

          {journeyContent.hero.stageLine && (
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-green-300">
              {journeyContent.hero.stageLine}
            </p>
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
            {/* Inline "Or open in Telegram" link removed — superseded by
                the channel CTA row above the primary button, which offers
                both Telegram and WhatsApp as co-primary options. Keeping
                the section so the surrounding rhythm doesn't shift. */}
          </div>

          <div id="formation-playground" className="mb-6">
            <React.Suspense fallback={<div className="h-[400px] w-full animate-pulse rounded-2xl bg-white/5" />}>
              <FormationPlayground
                initialName={cardName}
                initialPosition={cardPosition}
                onFormationChange={setCardFormation}
                onStateChange={setPlaygroundState}
              />
            </React.Suspense>
          </div>

          {/* NL Match Simulator — pre-auth value hook (curiosity gap) */}
          <div className="mb-6">
            <NaturalLanguageMatchSim
              formation={playgroundState?.formation}
              style={playgroundState?.style}
              names={playgroundState?.names}
              color={playgroundState?.color}
            />
          </div>

          {/* Rival Preview — social proof + competition hook */}
          <div className="mb-6">
            <RivalPreviewCard
              formation={playgroundState?.formation ?? '4-4-2'}
              style={playgroundState?.style ?? 'balanced'}
              color={playgroundState?.color ?? '#10b981'}
              names={playgroundState?.names ?? []}
              size={playgroundState?.size ?? 5}
            />
          </div>

          {/* Start my season CTA — summarises accumulated investment */}
          {!hasAccount && isPublicVisitor && playgroundState && (
            <div className="mx-auto mb-8 max-w-md overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5 text-center shadow-2xl shadow-emerald-500/10">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                Your squad is ready
              </p>
              <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
                {cardName && (
                  <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-white">
                    {cardName}
                  </span>
                )}
                {playgroundState.formation && (
                  <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-emerald-300">
                    {playgroundState.formation}
                  </span>
                )}
                {playgroundState.style && (
                  <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-emerald-300">
                    {playgroundState.style}
                  </span>
                )}
                {playgroundState.color && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full border border-white/50" style={{ backgroundColor: playgroundState.color }} />
                    Kit
                  </span>
                )}
                {playgroundState.names && playgroundState.names.length > 0 && (
                  <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-gray-400">
                    {playgroundState.names.length} players named
                  </span>
                )}
              </div>
              <button
                onClick={handlePrimaryCta}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" />
                Start my season
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-[10px] text-gray-500">
                No password required. We'll create a guest account and sync your setup.
              </p>
            </div>
          )}

          {!hasAccount && isPublicVisitor && (
            <p className="text-center mb-16">
              <button
                onClick={onGetStarted}
                className="text-sm text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-600 hover:decoration-gray-400 transition-colors"
              >
                Already have an account? Sign in
              </button>
            </p>
          )}
          {!hasAccount && !isPublicVisitor && journeyContent.hero.previewLinkLabel && (
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
          {(hasAccount || (!isPublicVisitor && !journeyContent.hero.previewLinkLabel)) && <div className="mb-16" />}

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
              {stats.recentCardsClaimed && stats.recentCardsClaimed > 0 && (
                <div className="flex items-center space-x-2 group">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                    <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" aria-hidden="true" />
                    <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg sm:text-2xl font-bold text-white">{stats.recentCardsClaimed.toLocaleString()}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">Cards This Week</div>
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
      <AppPreviewSection />
      <InlineWaitlistSection />
      <LandingFooter />
    </div>
  );
};
